import { db } from "./firebase.js";
import { ref, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/* ===== DOM ===== */
const calendarDiv = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");
const taskTable = document.getElementById("taskTable");
const selectedDateTitle = document.getElementById("selectedDateTitle");

const prevBtn = document.getElementById("prevMonth");
const nextBtn = document.getElementById("nextMonth");

const modal = document.getElementById("taskModal");
const modalTitle = document.getElementById("modalTitle");
const taskIdField = document.getElementById("taskId");

const contentInput = document.getElementById("content");
const unitInput = document.getElementById("unit");
const durationInput = document.getElementById("duration");
const priorityInput = document.getElementById("priority");
const statusInput = document.getElementById("status");
const noteInput = document.getElementById("note");
const saveTaskBtn = document.getElementById("saveTaskBtn");

let currentDate = new Date();
let selectedDate = null;

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
}

function getWeekNumber(ds) {
    const dt = new Date(ds);
    const first = new Date(dt.getFullYear(), dt.getMonth(), 1);
    return "week" + Math.ceil((dt.getDate() + first.getDay()) / 7);
}

function selectDate(ds, el) {
    document.querySelectorAll(".day").forEach(d => d.classList.remove("selected-day"));
    el.classList.add("selected-day");

    selectedDate = ds;
    selectedDateTitle.innerText = "Công việc ngày " + ds;

    loadTasks(ds);
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

            row.innerHTML = `
                <td>${i++}</td>
                <td>${t.content}</td>
                <td>${t.unit}</td>
                <td>${t.duration}</td>
                <td></td>
                <td></td>
                <td>${t.note}</td>
                <td>
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

            row.children[4].appendChild(prSelect);
            row.children[5].appendChild(stSelect);

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
    }, 100);
});
