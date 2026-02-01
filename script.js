import { db } from "./firebase.js";
import { ref, push, onValue, remove, update, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/* ===== DOM ===== */
const calendarDiv = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");
const taskTable = document.getElementById("taskTable");
const selectedDateTitle = document.getElementById("selectedDateTitle");

const prevBtn = document.getElementById("prevMonth");
const nextBtn = document.getElementById("nextMonth");

const deleteDayBtn = document.getElementById("deleteDayBtn");
const deleteWeekBtn = document.getElementById("deleteWeekBtn");
const deleteMonthBtn = document.getElementById("deleteMonthBtn");
const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");
const selectAllCheckbox = document.getElementById("selectAllCheckbox");
// const weekPicker = document.getElementById("weekPicker");
const weekSelect = document.getElementById("weekSelect");
const monthPicker = document.getElementById("monthPicker");

const modal = document.getElementById("taskModal");
const modalTitle = document.getElementById("modalTitle");
const taskIdField = document.getElementById("taskId");

// Custom alert/confirm elements
const customAlertModal = document.getElementById('customAlertModal');
const customAlertBody = document.getElementById('customAlertBody');
const customAlertOk = document.getElementById('customAlertOk');
const customAlertCancel = document.getElementById('customAlertCancel');

const contentInput = document.getElementById("content");
const unitInput = document.getElementById("unit");
const durationInput = document.getElementById("duration");
const priorityInput = document.getElementById("priority");
const statusInput = document.getElementById("status");
const noteInput = document.getElementById("note");
const saveTaskBtn = document.getElementById("saveTaskBtn");

/* ===== BIẾN TOÀN CỤC ===== */
let currentDate = new Date();
let selectedDate = null;
let multiDates = [];

/* ===== CALENDAR ===== */
function renderCalendar() {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();

    monthYear.innerText = `Tháng ${m + 1} - ${y}`;

    const first = (new Date(y, m, 1).getDay() + 6) % 7;
    const last = new Date(y, m + 1, 0).getDate();

    calendarDiv.innerHTML = "";

    for (let i = 0; i < first; i++) calendarDiv.innerHTML += "<div></div>";

    for (let d = 1; d <= last; d++) {
        const ds = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const div = document.createElement("div");
        div.className = "day";
        div.innerHTML = `<div>${d}</div>`;
        div.onclick = () => selectDate(ds, div);

        // ⭐ Đánh dấu hôm nay
        const today = new Date();
        if (d === today.getDate() && m === today.getMonth() && y === today.getFullYear()) {
            div.classList.add("today");
        }

        calendarDiv.appendChild(div);
    }

    // Update week dropdown to show weeks for the currently rendered month
    try {
        populateWeekSelect(`${y}-${pad(m + 1)}-01`);
    } catch (e) { console.error(e); }

    // Auto-select a date after rendering:
    // - If the rendered month is the current month, select today.
    // - Otherwise select the first day of the rendered month.
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

function pad(n) { return String(n).padStart(2, "0"); }

// Local YYYY-MM-DD helpers to avoid timezone shifts
function toYMDLocal(d) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseYMD(ds) {
    const [yy, mm, dd] = ds.split("-").map(s => parseInt(s, 10));
    return new Date(yy, mm - 1, dd);
}

function getWeekNumber(ds) {
    const dt = (typeof ds === 'string') ? parseYMD(ds) : new Date(ds);
    const year = dt.getFullYear();
    const month = dt.getMonth() + 1; // 1-based
    const firstDay = new Date(year, month - 1, 1);
    const firstDayWeekday = firstDay.getDay(); // 0=Sun..6=Sat
    const firstMondayDate = ((8 - firstDayWeekday) % 7) + 1; // first Monday on/after day 1

    // If date is before the first Monday, it's week1 (partial)
    if (dt.getDate() < firstMondayDate) return "week1";
    // Dates from firstMondayDate belong to week2, week3, ...
    const weekNum = Math.floor((dt.getDate() - firstMondayDate) / 7) + 2;
    return "week" + weekNum;
}

/* Tính ngày đầu tuần (thứ 2) và ngày cuối tuần (chủ nhật) */
function getWeekStartEnd(year, month, weekNum) {
    const firstDay = new Date(year, month - 1, 1);
    const firstDayWeekday = firstDay.getDay(); // 0=Sun..6=Sat
    const firstMondayDate = ((8 - firstDayWeekday) % 7) + 1; // first Monday on/after day 1

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
        opt.textContent = `${wk} (${formatDisplayDate(weeks[wk].first)} → ${formatDisplayDate(weeks[wk].last)})`;
        console.log('populateWeekSelect ->', wk, weeks[wk].first, weeks[wk].last);
        weekSelect.appendChild(opt);
    });

    try {
        const currentWeek = getWeekNumber(d);
        const want = `${year}|${pad(monthIndex + 1)}|${currentWeek}`;
        const found = Array.from(weekSelect.options).find(o => o.value === want);
        if (found) found.selected = true;
    } catch (e) { }
}
// Custom dialog helpers (return Promises)
function hideCustomAlert() {
    if (!customAlertModal) return;
    customAlertModal.style.display = 'none';
    customAlertOk.onclick = null;
    customAlertCancel.onclick = null;
}

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
function formatDisplayDate(ds) {
    if (!ds) return ds;
    const parts = ds.split("-");
    if (parts.length !== 3) return ds;
    const [y, m, d] = parts;
    return `${d}-${m}-${y}`;
}

function selectDate(ds, el) {
    document.querySelectorAll(".day").forEach(d => d.classList.remove("selected-day"));
    el.classList.add("selected-day");

    selectedDate = ds;
    selectedDateTitle.innerText = "Công việc ngày " + formatDisplayDate(ds);

    loadTasks(ds);
    // ensure week dropdown stays in sync with the selected date's month
    try { populateWeekSelect(ds); } catch (e) { }
}

// Load công việc khi người dùng chọn tuần từ dropdown
if (weekSelect) {
    weekSelect.onchange = async () => {
        if (weekSelect.value) {
            const [y, m, w] = weekSelect.value.split("|");
            selectedDateTitle.innerText = `Công việc của tuần ${w} (${m}/${y})`;
            loadTasksForWeek(y, m, w);
        }
    };
}

/* ===== CLASS MÀU ===== */
const priorityClass = v =>
    v === "Thấp" ? "priority-low" :
        v === "Trung bình" ? "priority-medium" : "priority-high";

const statusClass = v =>
    v === "Chưa xử lý" ? "status-pending" :
        v === "Đang xử lý" ? "status-doing" : "status-done";

/* ===== TẠO DROPDOWN MÀU ===== */
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

/* ===== LOAD TASKS ===== */
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

            // Debug: log each task key/content when rendering
            console.log("Rendering task:", { date: ds, key: k, content: t.content });

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


            row.querySelector(".btn-edit").onclick = () =>
                openModal("Chỉnh sửa công việc", k, t);

            taskTable.appendChild(row);
        });
    });
}

/* ===== MODAL ===== */
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

document.querySelector(".close").onclick = () => modal.style.display = "none";
modal.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });
document.addEventListener("keydown", e => { if (e.key === "Escape") modal.style.display = "none"; });

document.getElementById("openAddModal").onclick = () => {
    if (!selectedDate) return alert("Vui lòng chọn ngày trước!");
    openModal("Thêm công việc");
};

/* ===== MODAL SAVE ===== */
saveTaskBtn.onclick = async () => {
    if (!selectedDate) {
        alert("Vui lòng chọn ngày trước!");
        return;
    }

    const [y, m] = selectedDate.split("-");
    const w = getWeekNumber(selectedDate);

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
            await update(ref(db, `tasks/${y}/${m}/${w}/${selectedDate}/${taskIdField.value}`), data);
            alert("✅ Cập nhật công việc thành công!");
        } else {
            await push(ref(db, `tasks/${y}/${m}/${w}/${selectedDate}`), data);
            alert("✅ Thêm công việc mới thành công!");
        }

        modal.style.display = "none";
    } catch (error) {
        console.error(error);
        alert("❌ Có lỗi xảy ra khi lưu công việc!");
    }
};


/* ===== FIX LỖI NHẢY 2 THÁNG ===== */
prevBtn.addEventListener("click", () => {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    renderCalendar();
});

nextBtn.addEventListener("click", () => {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    renderCalendar();
});

/* ===== AUTO SELECT TODAY ===== */
window.addEventListener("load", () => {
    renderCalendar();

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
        // Populate week select for initial month
        populateWeekSelect(dateStr);
    }, 100);
});

// When weekPicker is changed, update weekSelect options
// weekSelect is populated on load; if you need to refresh, call populateWeekSelect(dateStr)

/* ===== NÂNG CAO: NHÂN BẢN NHIỀU NGÀY / TUẦN / THÁNG ===== */
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

    if (duplicateType.value === "multi") {
        multiDateBox.style.display = "block";
    } else if (duplicateType.value === "week") {
        weekBox.style.display = "block";
        // Populate tuần kế tiếp và các tuần trong tháng
        await populateTargetWeeks();
    } else if (duplicateType.value === "month") {
        monthBox.style.display = "block";
        // Set tháng kế tiếp
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const ym = `${nextMonth.getFullYear()}-${pad(nextMonth.getMonth() + 1)}`;
        targetMonthPicker.value = ym;
    }
};

/* Populate các tuần tiếp theo để chọn */
async function populateTargetWeeks() {
    if (!selectedDate) return;

    const [y, m] = selectedDate.split("-");
    const currentWeek = parseInt(getWeekNumber(selectedDate).replace("week", ""));

    targetWeekSelect.innerHTML = '<option value="">-- Chọn tuần --</option>';

    // Lấy tháng hiện tại và tháng tiếp theo
    let year = parseInt(y);
    let month = parseInt(m);
    let weeks = [];

    // Thêm tất cả các tuần của tháng hiện tại (bao gồm Tuần 2 nếu có)
    const currentMonthDays = new Date(year, month, 0).getDate();
    // tính firstMonday cho tháng hiện tại
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const firstMondayDate = ((8 - firstDayOfMonth.getDay()) % 7) + 1;
    const maxWeek = 1 + Math.ceil((currentMonthDays - firstMondayDate + 1) / 7);
    for (let w = 1; w <= maxWeek; w++) {
        const range = getWeekStartEnd(year, month, w);
        const label = `Tuần ${w} - ${pad(month)}/${year}  (${range.startStr} - ${range.endStr})`;
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
        // debug: show computed week ranges
        console.log("populateTargetWeeks -> week", w.week, w.label, w);
        const opt = document.createElement("option");
        opt.value = `${w.year}|${pad(w.month)}|week${w.week}`;
        opt.textContent = w.label;
        targetWeekSelect.appendChild(opt);
    });
}

/* Mở modal nhân bản nâng cao */
document.getElementById("duplicateDayBtn").onclick = () => {
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

    // Helper: lấy tất cả công việc của một tuần
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

    try {
        if (duplicateType.value === "multi") {
            if (advancedDates.length === 0) {
                const targetDate = prompt("Nhập ngày muốn nhân bản tới (YYYY-MM-DD):");
                if (!targetDate || targetDate === selectedDate) return alert("Ngày đích không hợp lệ hoặc trùng ngày nguồn!");
                await duplicateTo(targetDate);
                await showCustomAlert(`✅ Đã nhân bản ${sourceTaskCount} công việc sang ${formatDisplayDate(targetDate)}`);
            } else {
                for (const d of advancedDates) await duplicateTo(d);
                await showCustomAlert(`✅ Đã nhân bản ${sourceTaskCount * advancedDates.length} công việc`);
            }
        }

        if (duplicateType.value === "week") {
            // Nhân bản tuần: người dùng chọn tuần đích
            if (!targetWeekSelect.value) return alert("Vui lòng chọn tuần đích!");
            const [ty, tm, tw] = targetWeekSelect.value.split("|");
            const weekNum = parseInt(tw.replace("week", ""));

            // Tính ngày đầu tuần nguồn
            const sourceWeekNum = parseInt(getWeekNumber(selectedDate).replace("week", ""));
            const [sy, sm] = selectedDate.split("-");
            const sourceRange = getWeekStartEnd(parseInt(sy), parseInt(sm), sourceWeekNum);

            // Tính ngày đầu tuần đích
            const targetRange = getWeekStartEnd(parseInt(ty), parseInt(tm), weekNum);

            await duplicateTo(targetRange.startDate, sourceRange.startDate);

            // Hiển thị chi tiết số công việc của mỗi ngày trong tuần
            let detailMsg = `✅ Nhân bản tuần ${weekNum} - ${pad(tm)}/${ty}\n`;
            detailMsg += `   (${targetRange.startStr} - ${targetRange.endStr})\n`;
            detailMsg += `   Tổng: ${sourceTaskCount} công việc trên ${Object.keys(allSourceTasks).length} ngày`;
            await showCustomAlert(detailMsg.replace(/\n/g, '<br>'));
        }

        if (duplicateType.value === "month") {
            // Nhân bản tháng: người dùng chọn tháng đích
            if (!targetMonthPicker.value) return alert("Vui lòng chọn tháng đích!");
            const [ty, tm] = targetMonthPicker.value.split("-");
            const [sy, sm] = selectedDate.split("-");
            const sourceFirstDate = `${sy}-${sm}-01`;
            const targetFirstDate = `${ty}-${tm}-01`;
            await duplicateTo(targetFirstDate, sourceFirstDate);
            await showCustomAlert(`✅ Đã nhân bản ${sourceTaskCount} công việc sang tháng ${tm}/${ty}`);
        }
    } catch (error) {
        console.error(error);
        alert("❌ Có lỗi khi nhân bản!");
    }
};

/* ===== LOAD CÔNG VIỆC CỦA TUẦN ===== */
function loadTasksForWeek(y, m, weekId) {
    const r = ref(db, `tasks/${y}/${m}/${weekId}`);
    onValue(r, snap => {
        taskTable.innerHTML = "";
        let i = 1;
        if (snap.exists()) {
            // Sắp xếp các ngày theo thứ tự
            const dates = [];
            snap.forEach(dateSnap => dates.push(dateSnap.key));
            dates.sort();

            for (const dateKey of dates) {
                const dateSnap = snap.child(dateKey);
                dateSnap.forEach(ch => {
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
        }
    });
}

/* ===== XÓA TOÀN BỘ NGÀY / TUẦN / THÁNG ===== */
async function countTasksForDay(date) {
    const [y, m] = date.split("-");
    const w = getWeekNumber(date);
    const r = ref(db, `tasks/${y}/${m}/${w}/${date}`);
    const snap = await get(r);
    let c = 0;
    if (snap.exists()) {
        snap.forEach(ch => {
            console.log("CountTasksForDay found:", ch.key, ch.val());
            c++;
        });
    }
    return c;
}

async function countTasksForWeek(date) {
    // date can be 'YYYY-MM-DD' or a date string; getWeekNumber handles a full date
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

async function countTasksForWeekById(y, m, weekId) {
    const r = ref(db, `tasks/${y}/${m}/${weekId}`);
    const snap = await get(r);
    let c = 0;
    if (snap.exists()) {
        snap.forEach(dateSnap => dateSnap.forEach(() => c++));
    }
    return c;
}

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

async function countDaysAndTasksForMonth(date) {
    const [y, m] = date.split("-");
    const r = ref(db, `tasks/${y}/${m}`);
    const snap = await get(r);
    let tasksCount = 0;
    const details = {};
    if (snap.exists()) {
        snap.forEach(weekSnap => {
            const wk = weekSnap.key;
            let wkTotal = 0;
            weekSnap.forEach(dateSnap => {
                const dateKey = dateSnap.key;
                let c = 0;
                dateSnap.forEach(() => c++);
                if (c > 0) {
                    // Accumulate counts in case same date appears in multiple week nodes
                    details[dateKey] = (details[dateKey] || 0) + c;
                    tasksCount += c;
                    wkTotal += c;
                    console.log('countDaysAndTasksForMonth - week', wk, 'date', dateKey, 'countInThisWeek:', c, 'accumulated:', details[dateKey]);
                }
            });
            console.log('countDaysAndTasksForMonth - week', wk, 'totalTasksInWeek:', wkTotal);
        });
    }
    const daysCount = Object.keys(details).length;
    console.log('countDaysAndTasksForMonth ->', { date, daysCount, tasksCount, details });
    return { daysCount, tasksCount, details };
}

deleteDayBtn.onclick = async () => {
    if (!selectedDate) return alert("Vui lòng chọn ngày trước!");
    const [y, m] = selectedDate.split("-");
    const w = getWeekNumber(selectedDate);

    const cnt = await countTasksForDay(selectedDate);
    if (cnt === 0) return alert("Không có công việc để xóa ở ngày này!");

    if (!confirm(`Xác nhận xóa ${cnt} công việc của ngày ${formatDisplayDate(selectedDate)}?`)) return;

    try {
        await remove(ref(db, `tasks/${y}/${m}/${w}/${selectedDate}`));
        alert(`✅ Đã xóa ${cnt} công việc của ${formatDisplayDate(selectedDate)}`);
        taskTable.innerHTML = "";
    } catch (error) {
        console.error(error);
        alert("❌ Có lỗi khi xóa ngày!");
    }
};

deleteWeekBtn.onclick = async () => {
    // Prefer explicit week selection from weekSelect; fallback to weekPicker or selectedDate
    let y, m, w;
    if (weekSelect && weekSelect.value) {
        [y, m, w] = weekSelect.value.split("|");
    } else {
        const pick = weekPicker && weekPicker.value ? weekPicker.value : selectedDate;
        if (!pick) return alert("Vui lòng chọn ngày (hoặc chọn ngày trong tuần) trước!");
        [y, m] = pick.split("-");
        w = getWeekNumber(pick);
    }

    const cnt = await countTasksForWeekById(y, m, w);
    if (cnt === 0) return alert("Không có công việc để xóa ở tuần này!");

    if (!confirm(`Xác nhận xóa ${cnt} công việc của tuần ${w} (${m}/${y})?`)) return;

    try {
        await remove(ref(db, `tasks/${y}/${m}/${w}`));
        alert(`✅ Đã xóa ${cnt} công việc của tuần ${w}`);
        // Load toàn bộ công việc của tuần (sẽ rỗng sau khi xóa)
        loadTasksForWeek(y, m, w);
    } catch (error) {
        console.error(error);
        alert("❌ Có lỗi khi xóa tuần!");
    }
};

deleteMonthBtn.onclick = async () => {
    // Allow user to pick a month via monthPicker (format YYYY-MM). Fallback to selectedDate's month.
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

    // Build confirmation message: days + task totals + per-day details
    let msg = `Xác nhận xóa ${stats.daysCount} ngày (${stats.tasksCount} công việc) của tháng ${m}/${y}?\n\nChi tiết:`;
    const keys = Object.keys(stats.details).sort();
    for (const k of keys) {
        msg += `\n- ${formatDisplayDate(k)}: ${stats.details[k]} công việc`;
    }

    const ok = await showCustomConfirm(msg);
    if (!ok) return;

    try {
        await remove(ref(db, `tasks/${y}/${m}`));
        await showCustomAlert(`✅ Đã xóa ${stats.daysCount} ngày (${stats.tasksCount} công việc) của tháng ${m}/${y}`);
        taskTable.innerHTML = "";
    } catch (error) {
        console.error(error);
        await showCustomAlert("❌ Có lỗi khi xóa tháng!");
    }
};
/* ===== XÓA CÔNG VIỆC ĐÃ CHỌN ===== */
selectAllCheckbox.onchange = () => {
    document.querySelectorAll(".task-checkbox").forEach(cb => {
        cb.checked = selectAllCheckbox.checked;
    });
};

deleteSelectedBtn.onclick = async () => {
    const selected = document.querySelectorAll(".task-checkbox:checked");
    if (selected.length === 0) return alert("Vui lòng chọn ít nhất 1 công việc!");

    if (!confirm(`Xác nhận xóa ${selected.length} công việc?`)) return;

    try {
        for (const cb of selected) {
            const y = cb.dataset.year;
            const m = cb.dataset.month;
            const w = cb.dataset.week;
            const d = cb.dataset.date;
            const k = cb.dataset.key;
            await remove(ref(db, `tasks/${y}/${m}/${w}/${d}/${k}`));
        }
        alert(`✅ Đã xóa ${selected.length} công việc`);
        selectAllCheckbox.checked = false;
    } catch (error) {
        console.error(error);
        alert("❌ Có lỗi khi xóa!");
    }
};