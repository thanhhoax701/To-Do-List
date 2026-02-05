import { db } from "./firebase.js";
import { ref, push, onValue, remove, update, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/* ========== DOM ELEMENTS ========== */
// Phần tử lịch và tiêu đề tháng
const calendarDiv = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");
const taskTable = document.getElementById("taskTable");
const selectedDateTitle = document.getElementById("selectedDateTitle");

// Nút chuyển tháng
const prevBtn = document.getElementById("prevMonth");
const nextBtn = document.getElementById("nextMonth");

// Nút xóa (ngày, tuần, tháng, công việc được chọn)
const deleteSelectMain = document.getElementById("deleteSelectMain");
const deleteSelect = document.getElementById("deleteSelect");
const deleteDayBtn = document.getElementById("deleteDayBtn");
const deleteWeekBtn = document.getElementById("deleteWeekBtn");
const deleteMonthBtn = document.getElementById("deleteMonthBtn");
const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");
const selectAllCheckbox = document.getElementById("selectAllCheckbox");

// Dropdown chọn tuần và tháng
const weekSelect = document.getElementById("weekSelect");
const monthPicker = document.getElementById("monthPicker");

// Modal thêm/sửa công việc
const modal = document.getElementById("taskModal");
const modalTitle = document.getElementById("modalTitle");
const taskIdField = document.getElementById("taskId");

// Modal xác nhận tùy chỉnh (đẹp hơn alert/confirm mặc định)
const customAlertModal = document.getElementById('customAlertModal');
const customAlertBody = document.getElementById('customAlertBody');
const customAlertOk = document.getElementById('customAlertOk');
const customAlertCancel = document.getElementById('customAlertCancel');

// Input fields cho công việc
const contentInput = document.getElementById("content");
const unitInput = document.getElementById("unit");
const durationInput = document.getElementById("duration");
const priorityInput = document.getElementById("priority");
const statusInput = document.getElementById("status");
const noteInput = document.getElementById("note");
const saveTaskBtn = document.getElementById("saveTaskBtn");

// Loading indicator
const loadingIndicator = document.getElementById("loadingIndicator");

/* ========== BIẾN TOÀN CỤC ========== */
// Ngày hiện tại đang hiển thị trên lịch
let currentDate = new Date();
// Ngày được chọn hiện tại (YYYY-MM-DD)
let selectedDate = null;
// Danh sách nhiều ngày được chọn (cho tính năng nhân bản liên tiếp)
let multiDates = [];

/* ========== LỊCH ========== */
// Vẽ lịch tháng và populate tuần dropdown
function renderCalendar() {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();

    monthYear.innerText = `Tháng ${m + 1} - ${y}`;

    const first = (new Date(y, m, 1).getDay() + 6) % 7;
    const last = new Date(y, m + 1, 0).getDate();

    calendarDiv.innerHTML = "";

    // Thêm ô trống cho ngày của tháng trước
    for (let i = 0; i < first; i++) calendarDiv.innerHTML += "<div></div>";

    // Thêm các ngày của tháng
    for (let d = 1; d <= last; d++) {
        const ds = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const div = document.createElement("div");
        div.className = "day";
        div.innerHTML = `<div>${d}</div>`;
        div.onclick = () => selectDate(ds, div);

        // Đánh dấu hôm nay
        const today = new Date();
        if (d === today.getDate() && m === today.getMonth() && y === today.getFullYear()) {
            div.classList.add("today");
        }

        calendarDiv.appendChild(div);
    }

    // Cập nhật dropdown tuần để hiển thị các tuần của tháng hiện tại
    try {
        populateWeekSelect(`${y}-${pad(m + 1)}-01`);
    } catch (e) { console.error(e); }

    // Tự động chọn một ngày sau khi vẽ:
    // - Nếu tháng được vẽ là tháng hiện tại, chọn hôm nay
    // - Ngược lại, chọn ngày 1 của tháng đó
    try {
        const now = new Date();
        const chooseDay = (y === now.getFullYear() && m === now.getMonth()) ? now.getDate() : 1;
        const chosenDateStr = `${y}-${pad(m + 1)}-${pad(chooseDay)}`;
        const dayEls = calendarDiv.querySelectorAll('.day');
        dayEls.forEach(dayEl => {
            if (dayEl.innerText.trim() == String(chooseDay)) {
                selectDate(chosenDateStr, dayEl);
            }
        });
    } catch (e) { console.error(e); }
}

// Chuyển số sang chuỗi có 2 chữ số (01, 02, ...)
function pad(n) { return String(n).padStart(2, "0"); }

// ========== HỖ TRỢ NGÀY THÁNG ==========
// Chuyển Date object sang chuỗi YYYY-MM-DD (sử dụng giờ địa phương để tránh lệch múi giờ)
function toYMDLocal(d) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Chuyển chuỗi YYYY-MM-DD sang Date object (sử dụng giờ địa phương)
function parseYMD(ds) {
    const [yy, mm, dd] = ds.split("-").map(s => parseInt(s, 10));
    return new Date(yy, mm - 1, dd);
}

// Lấy số tuần (week1, week2, week3, ...) của một ngày
// - week1 = các ngày trước thứ 2 đầu tiên của tháng
// - week2+ = bắt đầu từ thứ 2, chia theo lô 7 ngày
function getWeekNumber(ds) {
    const dt = (typeof ds === 'string') ? parseYMD(ds) : new Date(ds);
    const year = dt.getFullYear();
    const month = dt.getMonth() + 1; // 1-based
    const firstDay = new Date(year, month - 1, 1);
    const firstDayWeekday = firstDay.getDay(); // 0=Chủ nhật..6=Thứ 7
    const firstMondayDate = ((8 - firstDayWeekday) % 7) + 1; // Thứ 2 đầu tiên

    // Nếu ngày trước thứ 2 đầu tiên, là week1 (tuần lẻ)

    if (dt.getDate() < firstMondayDate) return "week1";
    // Từ thứ 2 trở đi, chia thành week2, week3, ...
    const weekNum = Math.floor((dt.getDate() - firstMondayDate) / 7) + 2;
    return "week" + weekNum;
}

// Lấy ngày bắt đầu (thứ 2) và ngày kết thúc (Chủ nhật) của một tuần
function getWeekStartEnd(year, month, weekNum) {
    const firstDay = new Date(year, month - 1, 1);
    const firstDayWeekday = firstDay.getDay(); // 0=Chủ nhật..6=Thứ 7
    const firstMondayDate = ((8 - firstDayWeekday) % 7) + 1; // Thứ 2 đầu tiên

    // Week1 = từ ngày 1 đến trước thứ 2 đầu tiên
    if (weekNum === 1) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month - 1, Math.max(firstMondayDate - 1, 1));
        const sd = toYMDLocal(startDate);
        const ed = toYMDLocal(endDate);
        return {
            startDate: sd,
            endDate: ed,
            startStr: formatDisplayDate(sd),
            endStr: formatDisplayDate(ed)
        };
    }

    // Week2+ = bắt đầu từ thứ 2, kéo dài 7 ngày
    const startDay = firstMondayDate + (weekNum - 2) * 7;
    const startDate = new Date(year, month - 1, startDay);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    const sd2 = toYMDLocal(startDate);
    const ed2 = toYMDLocal(endDate);
    return {
        startDate: sd2,
        endDate: ed2,
        startStr: formatDisplayDate(sd2),
        endStr: formatDisplayDate(ed2)
    };
}

// Populate dropdown chọn tuần với các tuần của tháng
function populateWeekSelect(dateStr) {
    const d = dateStr || selectedDate || (() => {
        const t = new Date();
        return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
    })();

    if (!weekSelect) return;

    const [y, m] = d.split("-");
    const year = parseInt(y, 10);
    const monthIndex = parseInt(m, 10) - 1;

    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const weeks = {};

    for (let i = 1; i <= daysInMonth; i++) {
        const ds = `${year}-${pad(monthIndex + 1)}-${pad(i)}`;
        const w = getWeekNumber(ds);
        if (!weeks[w]) {
            weeks[w] = { first: ds, last: ds };
        } else {
            weeks[w].last = ds;
        }
    }

    weekSelect.innerHTML = "";
    Object.keys(weeks).forEach(wk => {
        const opt = document.createElement('option');
        opt.value = `${year}|${pad(monthIndex + 1)}|${wk}`;
        // Chuyển "week1", "week2" thành "Tuần 1", "Tuần 2"
        const weekNum = parseInt(wk.replace("week", ""));
        opt.textContent = `Tuần ${weekNum} - ${pad(monthIndex + 1)}/${year} (${formatDisplayDate(weeks[wk].first)} - ${formatDisplayDate(weeks[wk].last)})`;
        weekSelect.appendChild(opt);
    });

    // Tự động chọn tuần của ngày được truyền vào
    try {
        const currentWeek = getWeekNumber(d);
        const want = `${year}|${pad(monthIndex + 1)}|${currentWeek}`;
        const found = Array.from(weekSelect.options).find(o => o.value === want);
        if (found) found.selected = true;
    } catch (e) { }
}

// ========== MODAL TÙYCHỈNH ==========
// Ẩn modal xác nhận
function hideCustomAlert() {
    if (!customAlertModal) return;
    customAlertModal.style.display = 'none';
    customAlertOk.onclick = null;
    customAlertCancel.onclick = null;
}

// Hiển thị modal thông báo (chỉ có nút OK)
function showCustomAlert(html) {
    return new Promise(resolve => {
        if (!customAlertModal) { alert(html); resolve(); return; }
        customAlertBody.innerHTML = html;
        customAlertCancel.style.display = 'none';
        customAlertOk.innerText = 'OK';
        customAlertOk.onclick = () => { hideCustomAlert(); resolve(); };
        customAlertModal.style.display = 'flex';
    });
}

// Hiển thị modal xác nhận (có nút OK và Hủy)
function showCustomConfirm(html) {
    return new Promise(resolve => {
        if (!customAlertModal) { resolve(confirm(html)); return; }
        customAlertBody.innerHTML = html.replace(/\n/g, '<br>');
        customAlertCancel.style.display = 'inline-block';
        customAlertOk.innerText = 'OK';
        customAlertOk.onclick = () => { hideCustomAlert(); resolve(true); };
        customAlertCancel.onclick = () => { hideCustomAlert(); resolve(false); };
        customAlertModal.style.display = 'flex';
    });
}

// Hiển thị loading indicator
function showLoading() {
    if (loadingIndicator) loadingIndicator.classList.add('active');
}

// Ẩn loading indicator
function hideLoading() {
    if (loadingIndicator) loadingIndicator.classList.remove('active');
}

// Chuyển chuỗi YYYY-MM-DD sang định dạng DD-MM-YYYY
function formatDisplayDate(ds) {
    if (!ds) return ds;
    const parts = ds.split("-");
    if (parts.length !== 3) return ds;
    const [y, m, d] = parts;
    return `${d}-${m}-${y}`;
}

// Xử lý khi người dùng chọn một ngày trên lịch
function selectDate(ds, el) {
    // Member chỉ được xem ngày hôm nay
    if (!checkMemberAccess(ds)) return;

    document.querySelectorAll(".day").forEach(d => d.classList.remove("selected-day"));
    el.classList.add("selected-day");

    selectedDate = ds;
    selectedDateTitle.innerText = "Công việc ngày " + formatDisplayDate(ds);

    loadTasks(ds);
    // Cập nhật dropdown tuần để đồng bộ với tháng của ngày được chọn
    try { populateWeekSelect(ds); } catch (e) { }
}

// Xử lý khi người dùng chọn một tuần từ dropdown
if (weekSelect) {
    weekSelect.onchange = async () => {
        if (weekSelect.value) {
            const [y, m, w] = weekSelect.value.split("|");
            loadTasksForWeek(y, m, w);
        }
    };
}

/* ========== PHÂN LOẠI MÀU ========== */
// Trả về class CSS cho mức độ ưu tiên
const priorityClass = v =>
    v === "Thấp" ? "priority-low" :
        v === "Trung bình" ? "priority-medium" : "priority-high";

// Trả về class CSS cho trạng thái công việc
const statusClass = v =>
    v === "Chưa xử lý" ? "status-pending" :
        v === "Đang xử lý" ? "status-doing" : "status-done";

/* ========== HELPER DROPDOWN MÀU ========== */
// Tạo dropdown select với các tùy chọn và lớp CSS
function createColorSelect(options, value, getClass, callback) {
    const select = document.createElement("select");

    options.forEach(opt => {
        const o = document.createElement("option");
        o.value = o.textContent = opt;
        if (opt === value) o.selected = true;
        select.appendChild(o);
    });

    select.className = getClass(value);
    select.onchange = () => {
        select.className = getClass(select.value);
        callback(select.value);
    };

    return select;
}

/* ========== LOAD VÀ HIỂN THỊ CÔNG VIỆC ========== */
// Load công việc của một ngày cụ thể
function loadTasks(ds) {
    const [y, m] = ds.split("-");
    const w = getWeekNumber(ds);
    const r = ref(db, `tasks/${y}/${m}/${w}/${ds}`);

    onValue(r, snap => {
        taskTable.innerHTML = "";
        let i = 1;

        snap.forEach(ch => {
            const t = ch.val();
            const k = ch.key;
            const row = document.createElement("tr");

            // (debug logs removed)

            row.innerHTML = `
                <td><input type="checkbox" class="task-checkbox" data-key="${k}" data-year="${y}" data-month="${m}" data-week="${w}" data-date="${ds}"></td>
                <td>${i++}</td>
                <td>${t.content}</td>
                <td>${t.unit}</td>
                <td>${t.duration}</td>
                <td></td>
                <td></td>
                <td>${t.note}</td>
                <td>
                    <button class="btn-duplicate">🔁 Nhân bản</button>
                    <button class="btn-edit">✏️ Sửa</button>
                    <button class="btn-delete">🗑️ Xóa</button>
                </td>
            `;

            const prSelect = createColorSelect(
                ["Thấp", "Trung bình", "Cao"],
                t.priority,
                priorityClass,
                v => update(ref(db, `tasks/${y}/${m}/${w}/${ds}/${k}`), { priority: v })
            );

            const stSelect = createColorSelect(
                ["Chưa xử lý", "Đang xử lý", "Đã xử lý"],
                t.status,
                statusClass,
                v => update(ref(db, `tasks/${y}/${m}/${w}/${ds}/${k}`), { status: v })
            );

            row.children[5].appendChild(prSelect);
            row.children[6].appendChild(stSelect);

            row.querySelector(".btn-duplicate").onclick = async () => {
                const confirmDup = confirm("Bạn có muốn nhân bản công việc này không?");
                if (!confirmDup) return;

                // Sao chép thông tin công việc
                const newTask = {
                    content: t.content,
                    unit: t.unit,
                    duration: t.duration,
                    priority: t.priority,
                    status: t.status,
                    note: t.note,
                    startDate: t.startDate
                };

                await push(ref(db, `tasks/${y}/${m}/${w}/${ds}`), newTask);
                alert("🔁 Đã nhân bản công việc!");
            };

            // Nút xóa công việc
            row.querySelector(".btn-delete").onclick = async () => {
                const confirmDelete = confirm("Bạn có chắc muốn xóa công việc này không?");

                if (!confirmDelete) return;

                try {
                    await remove(ref(db, `tasks/${y}/${m}/${w}/${ds}/${k}`));
                    alert("✅ Xóa công việc thành công!");
                } catch (error) {
                    alert("❌ Có lỗi xảy ra khi xóa!");
                    console.error(error);
                }
            };

            // Nút sửa công việc
            row.querySelector(".btn-edit").onclick = () =>
                openModal("Chỉnh sửa công việc", k, t);

            taskTable.appendChild(row);
        });
    });
}

/* ========== MODAL THÊM/SỬA CÔNG VIỆC ========== */
// Mở modal để thêm hoặc sửa công việc
function openModal(title, id = "", t = {}) {
    modalTitle.innerText = title;
    taskIdField.value = id;
    contentInput.value = t.content || "";
    unitInput.value = t.unit || "";
    durationInput.value = t.duration || "";
    priorityInput.value = t.priority || "Thấp";
    statusInput.value = t.status || "Chưa xử lý";
    noteInput.value = t.note || "";

    modal.style.display = "flex";
}

// Đóng modal bằng nút X
document.querySelector(".close").onclick = () => modal.style.display = "none";
// Đóng modal khi click bên ngoài
modal.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });
// Đóng modal khi bấm phím Escape
document.addEventListener("keydown", e => { if (e.key === "Escape") modal.style.display = "none"; });

// Nút mở modal thêm công việc mới
document.getElementById("openAddModal").onclick = () => {
    if (!selectedDate) return alert("Vui lòng chọn ngày trước!");
    openModal("Thêm công việc");
};

/* ========== LƯU CÔNG VIỆC ========== */
// Xử lý khi nhấn nút lưu trong modal
saveTaskBtn.onclick = async () => {
    if (!selectedDate) {
        alert("Vui lòng chọn ngày trước!");
        return;
    }

    const [y, m] = selectedDate.split("-");
    const w = getWeekNumber(selectedDate);

    // Chuẩn bị dữ liệu công việc
    const data = {
        content: contentInput.value,
        unit: unitInput.value,
        duration: durationInput.value,
        priority: priorityInput.value,
        status: statusInput.value,
        note: noteInput.value,
        startDate: selectedDate
    };

    try {
        if (taskIdField.value) {
            // Nếu có ID, là chỉnh sửa
            await update(ref(db, `tasks/${y}/${m}/${w}/${selectedDate}/${taskIdField.value}`), data);
            alert("✅ Cập nhật công việc thành công!");
        } else {
            // Nếu không có ID, là thêm mới
            await push(ref(db, `tasks/${y}/${m}/${w}/${selectedDate}`), data);
            alert("✅ Thêm công việc mới thành công!");
        }

        modal.style.display = "none";
    } catch (error) {
        console.error(error);
        alert("❌ Có lỗi xảy ra khi lưu công việc!");
    }
};
// Nút chuyển tháng tiếp theo
nextBtn.addEventListener("click", () => {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    renderCalendar();
});

// Nút chuyển tháng trước
prevBtn.addEventListener("click", () => {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    renderCalendar();
});

/* ========== TỰ ĐỘNG CHỌN HÔM NAY ========== */
// Khi trang vừa load xong, vẽ lịch và chọn hôm nay
// Start the app (render calendar and auto-select a date). Call this after successful login.
function startApp() {
    renderCalendar();
    applyRolePermissions(); // Áp dụng quyền dựa trên role

    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    const d = today.getDate();

    const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

    setTimeout(() => {
        const days = document.querySelectorAll(".day");
        days.forEach(dayEl => {
            if (dayEl.innerText.trim() == d) {
                selectDate(dateStr, dayEl);
            }
        });
        populateWeekSelect(dateStr);
    }, 100);
}

/* ========== NHÂN BẢN NÂNG CAO ========== */
// Nhân bản công việc sang nhiều ngày / tuần / tháng khác nhau
const advModal = document.getElementById("advancedDuplicateModal");
const closeAdvModal = document.getElementById("closeAdvancedDuplicate");
const duplicateType = document.getElementById("duplicateType");
const multiDatePicker = document.getElementById("multiDatePicker");
const addDateBtn = document.getElementById("addDateBtn");
const dateList = document.getElementById("dateList");
const confirmAdvBtn = document.getElementById("confirmAdvancedDuplicate");

const multiDateBox = document.getElementById("multiDateBox");
const weekBox = document.getElementById("weekBox");
const monthBox = document.getElementById("monthBox");
const targetWeekSelect = document.getElementById("targetWeekSelect");
const targetMonthPicker = document.getElementById("targetMonthPicker");

let advancedDates = [];

/* Toggle sections khi đổi loại nhân bản */
duplicateType.onchange = async () => {
    multiDateBox.style.display = "none";
    weekBox.style.display = "none";
    monthBox.style.display = "none";

    // Hiển thị box tương ứng với loại nhân bản được chọn
    if (duplicateType.value === "multi") {
        multiDateBox.style.display = "block";
    } else if (duplicateType.value === "week") {
        weekBox.style.display = "block";
        // Populate các tuần tiếp theo có thể chọn
        await populateTargetWeeks();
    } else if (duplicateType.value === "month") {
        monthBox.style.display = "block";
        // Đặt tháng tiếp theo là mặc định
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const ym = `${nextMonth.getFullYear()}-${pad(nextMonth.getMonth() + 1)}`;
        targetMonthPicker.value = ym;
    }
};

/* Populate các tuần tiếp theo để có thể chọn nhân bản vào */
async function populateTargetWeeks() {
    if (!selectedDate) return;

    const [y, m] = selectedDate.split("-");
    const currentWeek = parseInt(getWeekNumber(selectedDate).replace("week", ""));

    targetWeekSelect.innerHTML = '<option value="">-- Chọn tuần --</option>';

    // Lấy tháng hiện tại và tháng tiếp theo
    let year = parseInt(y);
    let month = parseInt(m);
    let weeks = [];

    // Thêm tất cả các tuần của tháng hiện tại
    const currentMonthDays = new Date(year, month, 0).getDate();
    // Tính thứ 2 đầu tiên của tháng
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const firstMondayDate = ((8 - firstDayOfMonth.getDay()) % 7) + 1;
    const maxWeek = 1 + Math.ceil((currentMonthDays - firstMondayDate + 1) / 7);
    for (let w = 1; w <= maxWeek; w++) {
        const range = getWeekStartEnd(year, month, w);
        const label = `Tuần ${w} - ${pad(month)}/${year} (${range.startStr} - ${range.endStr})`;
        weeks.push({ week: w, year, month, label });
    }

    // Thêm các tuần của tháng tiếp theo
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const nextMonthDays = new Date(nextYear, nextMonth, 0).getDate();
    const firstDayNext = new Date(nextYear, nextMonth - 1, 1);
    const firstMondayNext = ((8 - firstDayNext.getDay()) % 7) + 1;
    const nextMaxWeek = 1 + Math.ceil((nextMonthDays - firstMondayNext + 1) / 7);
    for (let w = 1; w <= Math.min(nextMaxWeek, 6); w++) {
        const range = getWeekStartEnd(nextYear, nextMonth, w);
        const label = `Tuần ${w} - ${pad(nextMonth)}/${nextYear}  (${range.startStr} - ${range.endStr})`;
        weeks.push({ week: w, year: nextYear, month: nextMonth, label });
    }

    // Add to select
    weeks.forEach(w => {
        // (debug logs removed)
        const opt = document.createElement("option");
        opt.value = `${w.year}|${pad(w.month)}|week${w.week}`;
        opt.textContent = w.label;
        targetWeekSelect.appendChild(opt);
    });
}

/* Mở modal nhân bản nâng cao */
document.getElementById("duplicateDayBtn").onclick = () => {
    if (isMember()) return alert('👤 Thành viên không có quyền sử dụng tính năng này');
    if (!selectedDate) return alert("Vui lòng chọn ngày trước!");
    advancedDates = [];
    dateList.innerHTML = "";
    multiDatePicker.value = "";
    advModal.style.display = "flex";
};

/* Đóng modal */
closeAdvModal.onclick = () => advModal.style.display = "none";
advModal.onclick = e => { if (e.target === advModal) advModal.style.display = "none"; };

/* Thêm ngày vào danh sách */
addDateBtn.onclick = () => {
    const d = multiDatePicker.value;
    if (!d) return alert("Vui lòng chọn ngày hợp lệ!");
    if (advancedDates.includes(d)) return;
    advancedDates.push(d);

    const li = document.createElement("li");
    li.textContent = formatDisplayDate(d) + " ❌";
    li.style.cursor = "pointer";
    li.onclick = () => {
        advancedDates = advancedDates.filter(x => x !== d);
        li.remove();
    };
    dateList.appendChild(li);
    multiDatePicker.value = "";
};

/* Hàm nhân bản */
confirmAdvBtn.onclick = async () => {
    if (!selectedDate) return alert("Vui lòng chọn ngày nguồn!");
    const [sy, sm] = selectedDate.split("-");
    const sw = getWeekNumber(selectedDate);

    try {
        async function getAllWeekTasks(year, month, weekId) {
            const r = ref(db, `tasks/${year}/${month}/${weekId}`);
            const snap = await get(r);
            const allTasks = {};
            if (snap.exists()) {
                snap.forEach(dateSnap => {
                    const dateKey = dateSnap.key;
                    allTasks[dateKey] = [];
                    dateSnap.forEach(ch => {
                        allTasks[dateKey].push(ch.val());
                    });
                });
            }
            return allTasks;
        }

        let allSourceTasks = {};
        let sourceTaskCount = 0;

        // Lấy công việc từ nguồn (tuần hoặc ngày)
        if (duplicateType.value === "week" || duplicateType.value === "month") {
            // Nhân bản tuần/tháng: lấy toàn bộ công việc của tuần/tháng
            if (duplicateType.value === "week") {
                allSourceTasks = await getAllWeekTasks(sy, sm, sw);
                sourceTaskCount = Object.values(allSourceTasks).reduce((sum, arr) => sum + arr.length, 0);
                await showCustomAlert(`🔎 Tìm thấy ${sourceTaskCount} công việc ở tuần ${sw}`);
            } else {
                // Month: lấy tất cả công việc của tháng
                const r = ref(db, `tasks/${sy}/${sm}`);
                const snap = await get(r);
                sourceTaskCount = 0;
                if (snap.exists()) {
                    snap.forEach(weekSnap => {
                        weekSnap.forEach(dateSnap => {
                            const dateKey = dateSnap.key;
                            allSourceTasks[dateKey] = [];
                            dateSnap.forEach(ch => {
                                allSourceTasks[dateKey].push(ch.val());
                                sourceTaskCount++;
                            });
                        });
                    });
                }
                await showCustomAlert(`🔎 Tìm thấy ${sourceTaskCount} công việc ở tháng ${sm}/${sy}`);
            }
        } else {
            // Nhân bản ngày hoặc nhiều ngày: lấy công việc của ngày được chọn
            const snap = await get(ref(db, `tasks/${sy}/${sm}/${sw}/${selectedDate}`));
            if (snap.exists()) {
                allSourceTasks[selectedDate] = [];
                snap.forEach(ch => {
                    allSourceTasks[selectedDate].push(ch.val());
                });
                sourceTaskCount = allSourceTasks[selectedDate].length;
            }
            await showCustomAlert(`🔎 Tìm thấy ${sourceTaskCount} công việc ở ${formatDisplayDate(selectedDate)}`);
        }

        if (sourceTaskCount === 0) return alert("Không có công việc để nhân bản!");

        const duplicateTo = async (targetDate, sourceStartDate) => {
            const [ty, tm] = targetDate.split("-");
            const tw = getWeekNumber(targetDate);

            // Nếu đang nhân bản tuần/tháng, lấy công việc tương ứng ngày nguồn và nhân bản sang ngày đích
            if (duplicateType.value === "week" || duplicateType.value === "month") {
                // Tìm ngày tương ứng trong allSourceTasks
                // sourceStartDate là ngày bắt đầu của tuần/tháng nguồn
                const sourceStart = parseYMD(sourceStartDate);
                const targetStart = parseYMD(targetDate);

                for (const [sourceDateKey, tasksArr] of Object.entries(allSourceTasks)) {
                    // Tính offset ngày từ ngày bắt đầu tuần/tháng (use local dates)
                    const sourceDate = parseYMD(sourceDateKey);
                    const dayOffset = Math.round((sourceDate - sourceStart) / (1000 * 60 * 60 * 24));
                    const newTargetDate = new Date(targetStart);
                    newTargetDate.setDate(targetStart.getDate() + dayOffset);
                    const newTargetDateStr = toYMDLocal(newTargetDate);
                    const [nty, ntm] = newTargetDateStr.split("-");
                    const ntw = getWeekNumber(newTargetDateStr);

                    for (const task of tasksArr) {
                        await push(ref(db, `tasks/${nty}/${ntm}/${ntw}/${newTargetDateStr}`), {
                            ...task,
                            startDate: newTargetDateStr
                        });
                    }
                }
            } else {
                // Nhân bản ngày: dùng công việc từ selectedDate
                const tasksArr = allSourceTasks[selectedDate] || [];
                for (const task of tasksArr) {
                    await push(ref(db, `tasks/${ty}/${tm}/${tw}/${targetDate}`), {
                        ...task,
                        startDate: targetDate
                    });
                }
            }
        };

        if (duplicateType.value === "multi") {
            showLoading();
            try {
                if (advancedDates.length === 0) {
                    const targetDate = prompt("Nhập ngày muốn nhân bản tới (YYYY-MM-DD):");
                    if (!targetDate || targetDate === selectedDate) return alert("Ngày đích không hợp lệ hoặc trùng ngày nguồn!");
                    await duplicateTo(targetDate);
                    hideLoading();
                    await showCustomAlert(`✅ Đã nhân bản ${sourceTaskCount} công việc sang ${formatDisplayDate(targetDate)}`);
                } else {
                    for (const d of advancedDates) await duplicateTo(d);
                    hideLoading();
                    await showCustomAlert(`✅ Đã nhân bản ${sourceTaskCount * advancedDates.length} công việc`);
                }
            } catch (error) {
                hideLoading();
                throw error;
            }
        }

        if (duplicateType.value === "week") {
            // Nhân bản tuần: người dùng chọn tuần đích để nhân bản vào - cần loading
            showLoading();
            try {
                if (!targetWeekSelect.value) return alert("Vui lòng chọn tuần đích!");
                const [ty, tm, tw] = targetWeekSelect.value.split("|");
                const weekNum = parseInt(tw.replace("week", ""));

                // Lấy ngày đầu tuần nguồn
                const sourceWeekNum = parseInt(getWeekNumber(selectedDate).replace("week", ""));
                const [sy, sm] = selectedDate.split("-");
                const sourceRange = getWeekStartEnd(parseInt(sy), parseInt(sm), sourceWeekNum);

                // Lấy ngày đầu tuần đích
                const targetRange = getWeekStartEnd(parseInt(ty), parseInt(tm), weekNum);

                await duplicateTo(targetRange.startDate, sourceRange.startDate);

                // Hiển thị chi tiết số công việc của mỗi ngày trong tuần
                let detailMsg = `✅ Nhân bản tuần ${weekNum} - ${pad(tm)}/${ty}<br>`;
                detailMsg += `   (${targetRange.startStr} - ${targetRange.endStr})<br>`;
                detailMsg += `   Tổng: ${sourceTaskCount} công việc trên ${Object.keys(allSourceTasks).length} ngày`;
                hideLoading();
                await showCustomAlert(detailMsg);
            } catch (error) {
                hideLoading();
                throw error;
            }
        }

        if (duplicateType.value === "month") {
            // Nhân bản tháng: người dùng chọn tháng đích để nhân bản vào - cần loading
            showLoading();
            try {
                if (!targetMonthPicker.value) return alert("Vui lòng chọn tháng đích!");
                const [ty, tm] = targetMonthPicker.value.split("-");
                const [sy, sm] = selectedDate.split("-");
                const sourceFirstDate = `${sy}-${sm}-01`;
                const targetFirstDate = `${ty}-${tm}-01`;
                await duplicateTo(targetFirstDate, sourceFirstDate);
                hideLoading();
                await showCustomAlert(`✅ Đã nhân bản ${sourceTaskCount} công việc sang tháng ${tm}/${ty}`);
            } catch (error) {
                hideLoading();
                throw error;
            }
        }
    } catch (error) {
        console.error(error);
        alert("❌ Có lỗi khi nhân bản!");
    }
};

/* ========== LOAD CÔNG VIỆC CỦA TUẦN ========== */
// Load và hiển thị tất cả công việc của một tuần
function loadTasksForWeek(y, m, weekId) {
    const r = ref(db, `tasks/${y}/${m}/${weekId}`);
    onValue(r, snap => {
        taskTable.innerHTML = "";
        let i = 1;
        if (snap.exists()) {
            // Sắp xếp các ngày theo thứ tự tăng dần
            const dates = [];
            snap.forEach(dateSnap => dates.push(dateSnap.key));
            dates.sort();

            for (const dateKey of dates) {
                const dateSnap = snap.child(dateKey);
                let dateTaskCount = 0;
                dateSnap.forEach(ch => {
                    dateTaskCount++;
                    const t = ch.val();
                    const k = ch.key;
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td><input type="checkbox" class="task-checkbox" data-key="${k}" data-year="${y}" data-month="${m}" data-week="${weekId}" data-date="${dateKey}"></td>
                        <td>${i++}</td>
                        <td>${t.content}</td>
                        <td>${t.unit}</td>
                        <td>${t.duration}</td>
                        <td>${formatDisplayDate(dateKey)}</td>
                        <td></td>
                        <td>${t.note}</td>
                        <td>
                            <button class="btn-duplicate">🔁 Nhân bản</button>
                            <button class="btn-edit">✏️ Sửa</button>
                            <button class="btn-delete">🗑️ Xóa</button>
                        </td>
                    `;
                    taskTable.appendChild(row);
                });
            }
            // finished rendering week table
        } else {
            console.log('loadTasksForWeek snap.exists() = false');
        }
    });
}
/* ========== ĐẾM CÔNG VIỆC - XÓA NGÀY/TUẦN/THÁNG ========== */
// Đếm số công việc của một ngày cụ thể
async function countTasksForDay(date) {
    const [y, m] = date.split("-");
    const w = getWeekNumber(date);
    const r = ref(db, `tasks/${y}/${m}/${w}/${date}`);
    const snap = await get(r);
    let c = 0;
    if (snap.exists()) {
        snap.forEach(ch => {
            c++;
        });
    }
    return c;
}

// Đếm số công việc của một tuần (từ ngày bất kỳ trong tuần)
async function countTasksForWeek(date) {
    const [y, m] = date.split("-");
    const w = getWeekNumber(date);
    const r = ref(db, `tasks/${y}/${m}/${w}`);
    const snap = await get(r);
    let c = 0;
    if (snap.exists()) {
        snap.forEach(dateSnap => {
            dateSnap.forEach(() => c++);
        });
    }
    return c;
}

// Đếm số công việc của một tuần cụ thể (theo year, month, weekId)
async function countTasksForWeekById(y, m, weekId) {
    const r = ref(db, `tasks/${y}/${m}/${weekId}`);
    const snap = await get(r);
    let c = 0;
    if (snap.exists()) {
        snap.forEach(dateSnap => dateSnap.forEach(() => c++));
    }
    return c;
}

// Đếm số công việc của toàn bộ một tháng
async function countTasksForMonth(date) {
    const [y, m] = date.split("-");
    const r = ref(db, `tasks/${y}/${m}`);
    const snap = await get(r);
    let c = 0;
    if (snap.exists()) {
        snap.forEach(weekSnap => {
            weekSnap.forEach(dateSnap => {
                dateSnap.forEach(() => c++);
            });
        });
    }
    return c;
}

// Đếm số ngày và số công việc của một tháng, cùng chi tiết per-date
async function countDaysAndTasksForMonth(date) {
    const [y, m] = date.split("-");
    const r = ref(db, `tasks/${y}/${m}`);
    const snap = await get(r);
    let tasksCount = 0;
    const details = {};
    // countDaysAndTasksForMonth: compute counts for month

    if (snap.exists()) {
        const monthData = snap.val();

        // Lặp qua từng tuần trong tháng
        for (const weekKey in monthData) {
            if (monthData.hasOwnProperty(weekKey)) {
                const weekData = monthData[weekKey];
                if (weekData && typeof weekData === 'object') {
                    // Lặp qua từng ngày trong tuần
                    for (const dateKey in weekData) {
                        if (weekData.hasOwnProperty(dateKey)) {
                            const dayTasks = weekData[dateKey];
                            if (dayTasks && typeof dayTasks === 'object') {
                                let taskCount = 0;
                                for (const taskKey in dayTasks) {
                                    if (dayTasks.hasOwnProperty(taskKey)) {
                                        taskCount++;
                                    }
                                }
                                if (taskCount > 0) {
                                    // Tích lũy count nếu cùng một ngày xuất hiện trong nhiều tuần
                                    details[dateKey] = (details[dateKey] || 0) + taskCount;
                                    tasksCount += taskCount;
                                }
                            }
                        }
                    }
                }
            }
        }
    } else {
        console.log('countDaysAndTasksForMonth snap.exists() = false');
    }

    const daysCount = Object.keys(details).length;
    return { daysCount, tasksCount, details };
}

// Đếm số ngày và số công việc của một tuần cụ thể, cùng chi tiết per-date
async function countDaysAndTasksForWeekById(y, m, weekId) {
    const r = ref(db, `tasks/${y}/${m}/${weekId}`);
    const snap = await get(r);
    let tasksCount = 0;
    const details = {};
    // countDaysAndTasksForWeekById: compute counts for week

    if (snap.exists()) {
        const weekData = snap.val();

        // Lặp qua từng ngày trong tuần
        for (const dateKey in weekData) {
            if (weekData.hasOwnProperty(dateKey)) {
                const dayTasks = weekData[dateKey];
                if (dayTasks && typeof dayTasks === 'object') {
                    let taskCount = 0;
                    for (const taskKey in dayTasks) {
                        if (dayTasks.hasOwnProperty(taskKey)) {
                            taskCount++;
                        }
                    }
                    if (taskCount > 0) {
                        details[dateKey] = taskCount;
                        tasksCount += taskCount;
                    }
                }
            }
        }
    } else {
        console.log('countDaysAndTasksForWeekById snap.exists() = false');
    }

    const daysCount = Object.keys(details).length;
    return { daysCount, tasksCount, details };

}

/* ========== XÓA NGÀY / TUẦN / THÁNG ========== */
// Xử lý dropdown xóa chính
deleteSelectMain.onchange = async () => {
    const type = deleteSelectMain.value;
    deleteSelectMain.value = ""; // Reset dropdown

    if (!type) return;

    if (isMember()) {
        alert('👤 Thành viên không có quyền xóa công việc');
        return;
    }

    try {
        if (type === "day") {
            // XÓA NGÀY - không cần loading vì nhanh
            if (!selectedDate) return alert("Vui lòng chọn ngày trước!");
            const [y, m] = selectedDate.split("-");
            const w = getWeekNumber(selectedDate);

            const cnt = await countTasksForDay(selectedDate);
            if (cnt === 0) return alert("Không có công việc để xóa ở ngày này!");

            const ok = await showCustomConfirm(`Xác nhận xóa ${cnt} công việc của ngày ${formatDisplayDate(selectedDate)}?`);
            if (!ok) return;

            showLoading();
            try {
                await remove(ref(db, `tasks/${y}/${m}/${w}/${selectedDate}`));
                hideLoading();
                await showCustomAlert(`✅ Đã xóa ${cnt} công việc`);
                taskTable.innerHTML = "";
            } catch (error) {
                hideLoading();
                throw error;
            }
        }
        else if (type === "week") {
            // XÓA TUẦN - không cần loading
            try {
                // Xác định tuần: ưu tiên weekSelect, fallback selectedDate
                let y, m, w;
                if (weekSelect && weekSelect.value) {
                    [y, m, w] = weekSelect.value.split("|");
                } else if (selectedDate) {
                    [y, m] = selectedDate.split("-");
                    w = getWeekNumber(selectedDate);
                } else {
                    await showCustomAlert("Vui lòng chọn ngày hoặc tuần trước!");
                    return;
                }

                // Luôn đọc từ database để đảm bảo đếm đúng tất cả 7 ngày
                const stats = await countDaysAndTasksForWeekById(y, m, w);

                if (!stats || stats.tasksCount === 0) {
                    await showCustomAlert("Không có công việc để xóa ở tuần này!");
                    return;
                }

                // Xây dựng tin nhắn xác nhận
                let msg = `Xác nhận xóa ${stats.daysCount} ngày (${stats.tasksCount} công việc)?<br><br>Chi tiết:`;
                const keys = Object.keys(stats.details).sort();
                for (const k of keys) msg += `<br>- ${formatDisplayDate(k)}: ${stats.details[k]} công việc`;

                const ok = await showCustomConfirm(msg);
                if (!ok) return;

                // Thực hiện xóa
                showLoading();
                try {
                    await remove(ref(db, `tasks/${y}/${m}/${w}`));
                    hideLoading();
                    await showCustomAlert(`✅ Đã xóa ${stats.daysCount} ngày (${stats.tasksCount} công việc)`);
                    loadTasksForWeek(y, m, w);
                } catch (error) {
                    hideLoading();
                    throw error;
                }
            } catch (error) {
                console.error(error);
                await showCustomAlert(`❌ Có lỗi khi xóa tuần: ${error && error.message ? error.message : String(error)}`);
            }
        }
        else if (type === "month") {
            // XÓA THÁNG
            try {
                let y, m;
                if (monthPicker && monthPicker.value) {
                    [y, m] = monthPicker.value.split("-");
                } else {
                    if (!selectedDate) return alert("Vui lòng chọn ngày hoặc chọn tháng trước!");
                    [y, m] = selectedDate.split("-");
                }

                const sampleDate = `${y}-${pad(m)}-01`;
                const stats = await countDaysAndTasksForMonth(sampleDate);
                if (stats.tasksCount === 0) return showCustomAlert("Không có công việc để xóa ở tháng này!");

                // Xây dựng tin nhắn xác nhận: số ngày + số công việc + chi tiết per-date
                let msg = `Xác nhận xóa ${stats.daysCount} ngày (${stats.tasksCount} công việc) của tháng ${m}/${y}?<br><br>Chi tiết:`;
                const keys = Object.keys(stats.details).sort();
                for (const k of keys) {
                    msg += `<br>- ${formatDisplayDate(k)}: ${stats.details[k]} công việc`;
                }

                const ok = await showCustomConfirm(msg);
                if (!ok) return;

                showLoading();
                try {
                    await remove(ref(db, `tasks/${y}/${m}`));
                    hideLoading();
                    await showCustomAlert(`✅ Đã xóa ${stats.daysCount} ngày (${stats.tasksCount} công việc) của tháng ${m}/${y}`);
                    taskTable.innerHTML = "";
                } catch (error) {
                    hideLoading();
                    throw error;
                }
            } catch (error) {
                console.error(error);
                await showCustomAlert("❌ Có lỗi khi xóa tháng!");
            }
        }
    } catch (error) {
        console.error(error);
        await showCustomAlert(`❌ Có lỗi: ${error && error.message ? error.message : String(error)}`);
    }
};

/* ========== XÓA CÔNG VIỆC ĐÃ CHỌN ========== */
// Nút chọn tất cả / bỏ chọn tất cả
selectAllCheckbox.onchange = () => {
    document.querySelectorAll(".task-checkbox").forEach(cb => {
        cb.checked = selectAllCheckbox.checked;
    });
};

// Dropdown xóa đã chọn (trong header bảng)
if (deleteSelect) {
    deleteSelect.onchange = async () => {
        const type = deleteSelect.value;
        deleteSelect.value = ""; // Reset dropdown

        if (!type) return;

        if (type === "selected") {
            // XÓA ĐÃ CHỌN
            if (isMember()) {
                alert('👤 Thành viên không có quyền xóa công việc');
                return;
            }

            const selected = document.querySelectorAll(".task-checkbox:checked");
            if (selected.length === 0) return alert("Vui lòng chọn ít nhất 1 công việc!");

            if (!await showCustomConfirm(`Xác nhận xóa ${selected.length} công việc?`)) return;

            try {
                showLoading();
                for (const cb of selected) {
                    const y = cb.dataset.year;
                    const m = cb.dataset.month;
                    const w = cb.dataset.week;
                    const d = cb.dataset.date;
                    const k = cb.dataset.key;
                    await remove(ref(db, `tasks/${y}/${m}/${w}/${d}/${k}`));
                }
                await showCustomAlert(`✅ Đã xóa ${selected.length} công việc`);
                selectAllCheckbox.checked = false;
            } catch (error) {
                console.error(error);
                await showCustomAlert("❌ Có lỗi khi xóa!");
            } finally {
                hideLoading();
            }
        }
    };
}

/* ========== LOGIN / PIN (4 chữ số) ========== */
const loginOverlay = document.getElementById('loginOverlay');
const pinDotsEl = document.getElementById('pinDots');
const kpButtons = document.querySelectorAll('.kp');
const kpClear = document.getElementById('kp-clear');
const kpBack = document.getElementById('kp-back');

let enteredPin = '';

function updatePinDots() {
    const dots = pinDotsEl.querySelectorAll('.dot');
    dots.forEach((d, i) => d.classList.toggle('filled', i < enteredPin.length));
}

async function attemptLogin(pin) {
    try {
        showLoading();
        const usersSnap = await get(ref(db, 'users'));
        hideLoading();
        if (!usersSnap.exists()) return onLoginFail();

        let matched = null;
        usersSnap.forEach(ch => {
            const u = ch.val();
            if (u && String(u.pin) === String(pin)) matched = { key: ch.key, ...u };
        });

        if (matched) {
            sessionStorage.setItem('user', JSON.stringify(matched));
            updateUserDisplay();
            document.getElementById('mainContent').style.display = 'block';
            loginOverlay.classList.add('hidden');
            startApp();
        } else {
            onLoginFail();
        }
    } catch (err) {
        hideLoading();
        console.error(err);
        onLoginFail();
    }
}

function onLoginFail() {
    // flash and clear
    pinDotsEl.animate([{ transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(0)' }], { duration: 200 });
    enteredPin = '';
    updatePinDots();
}

kpButtons.forEach(b => {
    b.addEventListener('click', () => {
        const k = b.dataset.key;
        if (!k) return;
        if (enteredPin.length >= 4) return;
        enteredPin += String(k);
        updatePinDots();
        if (enteredPin.length === 4) setTimeout(() => attemptLogin(enteredPin), 120);
    });
});

// Keyboard input support
document.addEventListener('keydown', (e) => {
    const key = e.key;
    if (!loginOverlay.classList.contains('hidden')) {
        // Only when login overlay is visible
        if (key >= '0' && key <= '9') {
            if (enteredPin.length >= 4) return;
            enteredPin += key;
            updatePinDots();
            if (enteredPin.length === 4) setTimeout(() => attemptLogin(enteredPin), 120);
        } else if (key.toLowerCase() === 'c') {
            enteredPin = '';
            updatePinDots();
        } else if (key === 'Backspace') {
            e.preventDefault();
            enteredPin = enteredPin.slice(0, -1);
            updatePinDots();
        } else if (key === 'Enter') {
            e.preventDefault();
            if (enteredPin.length === 4) attemptLogin(enteredPin);
        }
    }
});

if (kpClear) kpClear.onclick = () => { enteredPin = ''; updatePinDots(); };
if (kpBack) kpBack.onclick = () => { enteredPin = enteredPin.slice(0, -1); updatePinDots(); };

// Cập nhật hiển thị tên user
function updateUserDisplay() {
    const savedUser = sessionStorage.getItem('user');
    if (savedUser) {
        try {
            const u = JSON.parse(savedUser);
            const userName = document.getElementById('userName');
            if (userName) userName.innerText = u.name || 'User';
        } catch (e) { }
    }
}

// Lấy role của user đang đăng nhập
function getLoggedInUserRole() {
    const savedUser = sessionStorage.getItem('user');
    if (savedUser) {
        try {
            const u = JSON.parse(savedUser);
            return u.role || 'member';
        } catch (e) { }
    }
    return null;
}

// Check role
function isMember() { return getLoggedInUserRole() === 'member'; }
function isAdmin() { const r = getLoggedInUserRole(); return r === 'admin' || r === 'superadmin'; }

// Hôm nay
function getTodayString() {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    const d = today.getDate();
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

// Kiểm tra member chỉ được xem hôm nay
function checkMemberAccess(dateStr) {
    if (isMember() && dateStr !== getTodayString()) {
        alert('👤 Thành viên chỉ được xem công việc của ngày hôm nay');
        return false;
    }
    return true;
}

// Ẩn/Hiện UI dựa trên role khi app khởi động
function applyRolePermissions() {
    const isMemberRole = isMember();

    // Ẩn nút nhân bản công việc cho member
    const duplicateDayBtn = document.getElementById('duplicateDayBtn');
    if (duplicateDayBtn) duplicateDayBtn.style.display = isMemberRole ? 'none' : 'inline-block';

    // Ẩn dropdown xóa cho member
    const deleteSelectMain = document.getElementById('deleteSelectMain');
    if (deleteSelectMain) deleteSelectMain.style.display = isMemberRole ? 'none' : 'inline-block';

    // Ẩn dropdown chọn tuần cho member
    const weekSelect = document.getElementById('weekSelect');
    if (weekSelect) weekSelect.style.display = isMemberRole ? 'none' : '';

    // Ẩn label + select chọn tháng cho member
    const monthPickerLabel = Array.from(document.querySelectorAll('label')).find(l => l.textContent.includes('Chọn tháng'));
    const monthPicker = document.getElementById('monthPicker');
    if (monthPickerLabel) monthPickerLabel.style.display = isMemberRole ? 'none' : '';
    if (monthPicker) monthPicker.style.display = isMemberRole ? 'none' : '';

    // Ẩn nút chuyển tháng cho member
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');
    if (prevBtn) prevBtn.style.display = isMemberRole ? 'none' : '';
    if (nextBtn) nextBtn.style.display = isMemberRole ? 'none' : '';
}

// Đăng xuất
function logout() {
    sessionStorage.removeItem('user');
    enteredPin = '';
    updatePinDots();
    document.getElementById('mainContent').style.display = 'none';
    loginOverlay.classList.remove('hidden');
}

// Bind nút logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) logoutBtn.onclick = logout;

// If there's a session, auto-login
const savedUser = sessionStorage.getItem('user');
if (savedUser) {
    try {
        const u = JSON.parse(savedUser);
        if (u && u.pin) {
            updateUserDisplay();
            document.getElementById('mainContent').style.display = 'block';
            loginOverlay.classList.add('hidden');
            startApp();
        }
    } catch (e) { }
}
