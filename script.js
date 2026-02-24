// ========== IMPORT FIREBASE ==========
// Nhập Firebase Realtime Database và các hàm cần thiết để thao tác với database
import { db } from "./firebase.js";
import { ref, push, onValue, remove, update, get, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

// Modal xác nhận tùy chỉnh (hiển thị thông báo, xác nhận với giao diện đẹp hơn alert/confirm mặc định)
const customAlertModal = document.getElementById('customAlertModal');
const customAlertBody = document.getElementById('customAlertBody'); // Nơi hiển thị nội dung thông báo
const customAlertOk = document.getElementById('customAlertOk'); // Nút OK
const customAlertCancel = document.getElementById('customAlertCancel'); // Nút Hủy

// Input fields cho công việc trong modal thêm/sửa
const contentInput = document.getElementById("content"); // Nội dung công việc
const unitInput = document.getElementById("unit"); // Đơn vị thực hiện
const durationInput = document.getElementById("duration"); // Thời gian hoàn thành
const priorityInput = document.getElementById("priority"); // Mức độ ưu tiên
const statusInput = document.getElementById("status"); // Trạng thái công việc
const noteInput = document.getElementById("note"); // Ghi chú
const saveTaskBtn = document.getElementById("saveTaskBtn"); // Nút lưu

// Chỉ báo loading (vòng xoay chờ đợi khi xử lý async)
const loadingIndicator = document.getElementById("loadingIndicator");

// Menu sidebar
const menuToggleBtn = document.getElementById("menuToggleBtn");
const menuCloseBtn = document.getElementById("menuCloseBtn");
const sideMenuPanel = document.getElementById("sideMenuPanel");

// Modal lựa chọn ngày NB
const nbSelectModal = document.getElementById("nbSelectModal");
const closeNbSelectModal = document.getElementById("closeNbSelectModal");
const nbYearSelect = document.getElementById("nbYearSelect");
const nbMonthList = document.getElementById("nbMonthList");
const monthSelectSection = document.getElementById("monthSelectSection");
const calendarSelectSection = document.getElementById("calendarSelectSection");
const nbCalendarDays = document.getElementById("nbCalendarDays");
const nbCalendarTitle = document.getElementById("nbCalendarTitle");
const nbCalendarBack = document.getElementById("nbCalendarBack");
const nbConfirmButton = document.getElementById("nbConfirmButton");
const nbSelectedDatesList = document.getElementById("nbSelectedDatesList");
const nbNoDatesMsg = document.getElementById("nbNoDatesMsg");
const selectNbDayBtn = document.getElementById("selectNbDayBtn");

// Modal lựa chọn ngày NL (new)
const nlSelectModal = document.getElementById("nlSelectModal");
const closeNlSelectModal = document.getElementById("closeNlSelectModal");
const nlYearSelect = document.getElementById("nlYearSelect");
const nlMonthList = document.getElementById("nlMonthList");
const nlMonthSelectSection = document.getElementById("nlMonthSelectSection");
const nlCalendarSelectSection = document.getElementById("nlCalendarSelectSection");
const nlCalendarDays = document.getElementById("nlCalendarDays");
const nlCalendarTitle = document.getElementById("nlCalendarTitle");
const nlCalendarBack = document.getElementById("nlCalendarBack");
const nlConfirmButton = document.getElementById("nlConfirmButton");
const nlSelectedDatesList = document.getElementById("nlSelectedDatesList");
const nlNoDatesMsg = document.getElementById("nlNoDatesMsg");
const selectNlDayBtn = document.getElementById("selectNlDayBtn");

// Biến để track selected dates trong modal
let nbTempSelectedDates = []; // Danh sách ngày tạm thời được chọn
let nbSelectedYear = null;
let nbSelectedMonth = null;

let nlTempSelectedDates = []; // Danh sách ngày NL tạm thời
let nlSelectedYear = null;
let nlSelectedMonth = null;

/* ========== BIẾN TOÀN CỤC ========== */
// Ngày hiện tại đang hiển thị trên lịch
let currentDate = new Date();
// Ngày được chọn hiện tại (YYYY-MM-DD)
let selectedDate = null;
// Danh sách nhiều ngày được chọn (cho tính năng nhân bản liên tiếp)
let multiDates = [];
// Lưu danh sách các ngày NB (Nghỉ Bù)
let nbDays = {}; // Format: {"YYYY-MM-DD": true}
let nlDays = {}; // Format: {"YYYY-MM-DD": true}  -- ngày Nghỉ lễ

// ---------- user helpers ----------
function getCurrentUser() {
    return JSON.parse(sessionStorage.getItem('user') || 'null');
}
function getCurrentUserId() {
    const u = getCurrentUser();
    return u ? u.key : null;
}

function tasksRef(...parts) {
    const uid = getCurrentUserId();
    return ref(db, `tasks/${uid}${parts.length ? '/' + parts.join('/') : ''}`);
}
function nbRef(...parts) {
    const uid = getCurrentUserId();
    return ref(db, `nbDays/${uid}${parts.length ? '/' + parts.join('/') : ''}`);
}
function nlRef(...parts) {
    const uid = getCurrentUserId();
    return ref(db, `nlDays/${uid}${parts.length ? '/' + parts.join('/') : ''}`);
}

/* ========== LỊCH ========== */
// Tải danh sách các ngày NB từ Firebase (cấu trúc: nbDays/YYYY/MM/DD)
async function loadNbDays() {
    try {
        const r = nbRef();
        const snap = await get(r);
        nbDays = {};
        if (snap.exists()) {
            snap.forEach(yearSnap => {
                const year = yearSnap.key;
                yearSnap.forEach(monthSnap => {
                    const month = monthSnap.key;
                    monthSnap.forEach(daySnap => {
                        if (daySnap.val() === true) {
                            const dateStr = `${year}-${month}-${daySnap.key}`;
                            nbDays[dateStr] = true;
                        }
                    });
                });
            });
        }
    } catch (e) {
        console.error('Lỗi tải ngày NB:', e);
    }
}

// Tải danh sách các ngày NL từ Firebase (cấu trúc: nlDays/YYYY/MM/DD)
async function loadNlDays() {
    try {
        const r = nlRef();
        const snap = await get(r);
        nlDays = {};
        if (snap.exists()) {
            snap.forEach(yearSnap => {
                const year = yearSnap.key;
                yearSnap.forEach(monthSnap => {
                    const month = monthSnap.key;
                    monthSnap.forEach(daySnap => {
                        if (daySnap.val() === true) {
                            const dateStr = `${year}-${month}-${daySnap.key}`;
                            nlDays[dateStr] = true;
                        }
                    });
                });
            });
        }
    } catch (e) {
        console.error('Lỗi tải ngày NL:', e);
    }
}

// Đánh dấu/Bỏ đánh dấu một ngày là NB (cấu trúc: nbDays/YYYY/MM/DD)
async function toggleNbDay(dateStr) {
    try {
        const [year, month, day] = dateStr.split('-');
        const r = nbRef(year, month, day);
        const snap = await get(r);
        if (snap.exists() && snap.val() === true) {
            // Bỏ đánh dấu NB
            await remove(r);
            delete nbDays[dateStr];
            return false;
        } else {
            // Đánh dấu NB
            await set(r, true);
            nbDays[dateStr] = true;
            return true;
        }
    } catch (e) {
        console.error('Lỗi cập nhật ngày NB:', e);
        return false;
    }
}

// Kiểm tra một ngày có phải là NB không
function isNbDay(dateStr) {
    return nbDays[dateStr] === true;
}

// Đánh dấu/Bỏ đánh dấu một ngày là NL (cấu trúc: nlDays/YYYY/MM/DD)
async function toggleNlDay(dateStr) {
    try {
        const [year, month, day] = dateStr.split('-');
        const r = nlRef(year, month, day);
        const snap = await get(r);
        if (snap.exists() && snap.val() === true) {
            // Bỏ đánh dấu NL
            await remove(r);
            delete nlDays[dateStr];
            return false;
        } else {
            // Đánh dấu NL
            await set(r, true);
            nlDays[dateStr] = true;
            return true;
        }
    } catch (e) {
        console.error('Lỗi cập nhật ngày NL:', e);
        return false;
    }
}

// Kiểm tra một ngày có phải là NL không
function isNlDay(dateStr) {
    return nlDays[dateStr] === true;
}

// ========== LỊCH ========== 
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

        // đánh dấu NB / NL bằng màu sắc nền và viền (không hiển thị chữ)
        if (isNbDay(ds)) {
            div.classList.add('nb-day');
        }
        if (isNlDay(ds)) {
            div.classList.add('nl-day');
        }

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

// ========== XUẤT XLSX ==========
// Các cột có thể xuất (theo thứ tự trình bày trong bảng)
const ALL_EXPORT_COLUMNS = ["STT", "Nội dung", "Đơn vị", "Thời gian", "Mức độ", "Trạng thái", "Ghi chú"];

/**
 * Viết một mảng dữ liệu (array of arrays) thành file xlsx và tải xuống.
 * `header` là mảng tiêu đề cột, `rows` là mảng hàng tương ứng.
 */
function writeDataToXLSX(header, rows) {
    const data = [header, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tasks');
    const now = new Date();
    const filename = `tasks_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}.xlsx`;
    XLSX.writeFile(wb, filename);
}

// ==== IMPORT XLSX FUNCTIONS ====
// Nhận 1 chuỗi ngày từ sheet name hoặc cell, cố parse thành YYYY-MM-DD
function normalizeDateString(s) {
    if (!s && s !== 0) return null;
    s = String(s).trim();
    // nếu đã ở dạng YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    // dạng DD-MM-YYYY
    const dmy = s.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (dmy) {
        const dd = pad(Number(dmy[1]));
        const mm = pad(Number(dmy[2]));
        const yy = dmy[3];
        return `${yy}-${mm}-${dd}`;
    }
    // dạng DD/MM/YYYY
    const dmy2 = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (dmy2) {
        const dd = pad(Number(dmy2[1]));
        const mm = pad(Number(dmy2[2]));
        const yy = dmy2[3];
        return `${yy}-${mm}-${dd}`;
    }
    // dạng Excel serial (number) — best-effort
    if (!isNaN(Number(s))) {
        try {
            const v = Number(s);
            const date = new Date((v - 25569) * 86400 * 1000);
            return toYMDLocal(date);
        } catch (e) { }
    }
    return null;
}

// Parse date from sheet name like '24-02-2026' or '2026-02-24'
function parseDateFromSheetName(name) {
    if (!name) return null;
    const n = name.trim();
    // try dd-mm-yyyy
    const d = normalizeDateString(n);
    return d;
}

// Import workbook (ArrayBuffer) and push tasks to Firebase
async function importWorkbookArrayBuffer(ab, filename, importType, importValue) {
    if (!isAdmin()) { alert('Chỉ admin mới có quyền nhập công việc'); return; }
    showLoading();
    try {
        const wb = XLSX.read(ab, { type: 'array' });
        let total = 0;
        // iterate sheets
        for (const sheetName of wb.SheetNames) {
            const ws = wb.Sheets[sheetName];
            // get rows as arrays
            const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
            if (!aoa || aoa.length < 2) continue; // no data
            const header = aoa[0].map(h => String(h).trim());
            const idxMap = {};
            header.forEach((h, i) => { idxMap[h] = i; });

            // determine date for this sheet if possible
            let sheetDate = parseDateFromSheetName(sheetName);
            // if not parseable and only one sheet, try infer from filename (tasks_YYYYMMDD)
            if (!sheetDate && wb.SheetNames.length === 1 && filename) {
                const m = filename.match(/(\d{4})(\d{2})(\d{2})/);
                if (m) sheetDate = `${m[1]}-${m[2]}-${m[3]}`;
            }

            // If importType defines a default date (week/month/range) and no per-row date,
            // use importValue to compute a default date for rows without 'Ngày'
            let importDefaultDate = null;
            if (!sheetDate && importType) {
                if (importType === 'week' && importValue) {
                    // importValue expected as 'YYYY|MM|weekN'
                    const parts = importValue.split('|');
                    if (parts.length === 3) {
                        const yy = Number(parts[0]);
                        const mm = Number(parts[1]);
                        const wkPart = parts[2];
                        // wkPart may be 'week1' or a number like '1'
                        let wkNum = 1;
                        const m = wkPart.match(/\d+/);
                        if (m) wkNum = Number(m[0]);
                        const we = getWeekStartEnd(yy, mm, wkNum);
                        importDefaultDate = we.startDate;
                    }
                } else if (importType === 'month' && importValue) {
                    // importValue expected as 'YYYY-MM'
                    const [yy, mm] = importValue.split('-');
                    if (yy && mm) importDefaultDate = `${yy}-${mm}-01`;
                } else if (importType === 'range' && importValue) {
                    // importValue expected as 'START|END'
                    const parts2 = importValue.split('|');
                    if (parts2.length === 2) importDefaultDate = parts2[0];
                }
            }

            for (let r = 1; r < aoa.length; r++) {
                const row = aoa[r];
                // skip empty rows
                if (!row || row.every(c => (c === null || c === undefined || String(c).trim() === ''))) continue;
                // determine date for this row: prefer 'Ngày' column
                let dateVal = null;
                if (idxMap['Ngày'] !== undefined) dateVal = normalizeDateString(row[idxMap['Ngày']]);
                if (!dateVal && sheetDate) dateVal = sheetDate;
                if (!dateVal && importDefaultDate) dateVal = importDefaultDate;
                if (!dateVal) {
                    // skip rows without date
                    continue;
                }

                const task = {
                    content: '', unit: '', duration: '', priority: '', status: '', note: '', startDate: dateVal
                };
                if (idxMap['Nội dung'] !== undefined) task.content = String(row[idxMap['Nội dung']] || '').trim();
                if (idxMap['Đơn vị'] !== undefined) task.unit = String(row[idxMap['Đơn vị']] || '').trim();
                if (idxMap['Thời gian'] !== undefined) task.duration = String(row[idxMap['Thời gian']] || '').trim();
                if (idxMap['Mức độ'] !== undefined) task.priority = String(row[idxMap['Mức độ']] || '').trim();
                if (idxMap['Trạng thái'] !== undefined) task.status = String(row[idxMap['Trạng thái']] || '').trim();
                if (idxMap['Ghi chú'] !== undefined) task.note = String(row[idxMap['Ghi chú']] || '').trim();

                // push to firebase
                const [y, m] = dateVal.split('-');
                const w = getWeekNumber(dateVal);
                await push(tasksRef(y, m, w, dateVal), task);
                total++;
            }
        }
        hideLoading();
        await showCustomAlert(`✅ Đã nhập ${total} công việc từ file`);
    } catch (e) {
        hideLoading();
        console.error(e);
        await showCustomAlert(`❌ Lỗi khi nhập file: ${e && e.message ? e.message : String(e)}`);
    }
}

// Handler cho nút import
if (document.getElementById('importConfirmBtn')) {
    document.getElementById('importConfirmBtn').onclick = () => {
        if (!isAdmin()) { alert('Chỉ admin mới có quyền nhập công việc'); return; }
        const fi = document.getElementById('importFile');
        if (!fi || !fi.files || fi.files.length === 0) return alert('Vui lòng chọn file .xlsx');
        const importTypeEl = document.getElementById('importType');
        const importType = importTypeEl ? importTypeEl.value : 'auto';

        // build importValue according to type
        let importValue = '';
        if (importType === 'week') {
            const sel = document.getElementById('importWeekSelect');
            if (!sel || !sel.value) return alert('Vui lòng chọn tuần để import!');
            importValue = sel.value; // format: YYYY|MM|weekN
        } else if (importType === 'month') {
            const mp = document.getElementById('importMonthPicker');
            if (!mp || !mp.value) return alert('Vui lòng chọn tháng để import!');
            importValue = mp.value; // format: YYYY-MM
        } else if (importType === 'range') {
            const s = document.getElementById('importRangeStart').value;
            const e = document.getElementById('importRangeEnd').value;
            if (!s || !e) return alert('Vui lòng chọn cả ngày bắt đầu và kết thúc cho import range!');
            importValue = `${s}|${e}`; // START|END
        }

        const f = fi.files[0];
        const reader = new FileReader();
        reader.onload = async (ev) => {
            const ab = ev.target.result;
            await importWorkbookArrayBuffer(ab, f.name, importType, importValue);
        };
        reader.readAsArrayBuffer(f);
    };
}

// (Optional) Preview button - just shows a quick summary of sheets and rows
if (document.getElementById('importPreviewBtn')) {
    document.getElementById('importPreviewBtn').onclick = () => {
        const fi = document.getElementById('importFile');
        if (!fi || !fi.files || fi.files.length === 0) return alert('Vui lòng chọn file .xlsx');
        const f = fi.files[0];
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const ab = ev.target.result;
                const wb = XLSX.read(ab, { type: 'array' });
                let msg = '';
                wb.SheetNames.forEach(sn => {
                    const ws = wb.Sheets[sn];
                    const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
                    msg += `${sn}: ${Math.max(0, aoa.length - 1)} dòng` + '\n';
                });
                showCustomAlert(msg.replace(/\n/g, '<br>'));
            } catch (e) {
                showCustomAlert('Không đọc được file này');
            }
        };
        reader.readAsArrayBuffer(f);
    };
}

// Lấy danh sách cột được chọn bởi người dùng
function getSelectedColumns() {
    const nodes = document.querySelectorAll('#columnDropdown input[type=checkbox]');
    if (!nodes || nodes.length === 0) {
        // no UI present (moved to sidebar) -> default to all columns
        return ALL_EXPORT_COLUMNS.slice();
    }
    return Array.from(nodes).filter(n => n.checked).map(inp => inp.value);
}

// Xuất công việc của 1 ngày dựa trên DOM
function exportTasksForDay() {
    const selectedCols = getSelectedColumns();
    if (selectedCols.length === 0) {
        alert('Vui lòng chọn ít nhất một cột để xuất.');
        return;
    }
    const colIndices = ALL_EXPORT_COLUMNS.map((c, i) => selectedCols.includes(c) ? i : -1).filter(i => i >= 0);
    const rows = [];
    document.querySelectorAll('#taskTable tr').forEach(tr => {
        const cells = tr.querySelectorAll('td');
        if (!cells || cells.length === 0) return;
        const rowCells = [];
        for (let i = 1; i < cells.length - 1; i++) {
            const cell = cells[i];
            const sel = cell.querySelector('select');
            if (sel) rowCells.push(sel.value);
            else rowCells.push(cell.innerText.replace(/\r?\n/g, ' ').trim());
        }
        rows.push(rowCells.filter((_, idx) => colIndices.includes(idx)));
    });
    if (rows.length === 0) {
        alert('Không có công việc để xuất.');
        return;
    }
    writeDataToXLSX(selectedCols, rows);
}

// ===========================
// Các hàm lấy dữ liệu từ Firebase cho tuần/tháng/khoảng
async function fetchTasksForWeek(y, m, w) {
    const result = [];
    const snap = await get(tasksRef(y, m, w));
    if (snap.exists()) {
        snap.forEach(dateSnap => {
            const date = dateSnap.key;
            dateSnap.forEach(taskSnap => {
                const t = taskSnap.val();
                result.push({ date, task: t });
            });
        });
    }
    return result;
}

async function fetchTasksForMonth(y, m) {
    const result = [];
    const snap = await get(tasksRef(y, m));
    if (snap.exists()) {
        snap.forEach(weekSnap => {
            weekSnap.forEach(dateSnap => {
                const date = dateSnap.key;
                dateSnap.forEach(taskSnap => {
                    result.push({ date, task: taskSnap.val() });
                });
            });
        });
    }
    return result;
}

async function fetchTasksForRange(startDate, endDate) {
    const result = [];
    let cur = parseYMD(startDate);
    const end = parseYMD(endDate);
    while (cur <= end) {
        const ds = toYMDLocal(cur);
        const [yy, mm] = ds.split('-');
        const w = getWeekNumber(ds);
        const snap = await get(tasksRef(yy, mm, w, ds));
        if (snap.exists()) {
            snap.forEach(taskSnap => {
                result.push({ date: ds, task: taskSnap.val() });
            });
        }
        cur.setDate(cur.getDate() + 1);
    }
    return result;
}

async function exportTasksForCollection(taskList, includeDate) {
    const selectedCols = getSelectedColumns();
    if (selectedCols.length === 0) {
        alert('Vui lòng chọn ít nhất một cột để xuất.');
        return;
    }
    let header = [];
    if (selectedCols.includes('STT')) header.push('STT');
    if (includeDate) header.push('Ngày');
    header.push(...selectedCols.filter(c => c !== 'STT'));

    const rows = [];
    let idx = 1;
    for (const { date, task } of taskList) {
        const row = [];
        if (selectedCols.includes('STT')) row.push(idx++);
        if (includeDate) row.push(date);
        for (const c of selectedCols) {
            if (c === 'STT') continue;
            const map = {
                'Nội dung': task.content || '',
                'Đơn vị': task.unit || '',
                'Thời gian': task.duration || '',
                'Mức độ': task.priority || '',
                'Trạng thái': task.status || '',
                'Ghi chú': task.note || ''
            };
            row.push(map[c] || '');
        }
        rows.push(row);
    }
    if (rows.length === 0) {
        alert('Không có công việc để xuất.');
        return;
    }
    // Nếu có nhiều ngày (ví dụ xuất tuần/tháng/khoảng), tách từng ngày ra 1 sheet
    const grouped = {};
    for (const { date, task } of taskList) {
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(task);
    }
    const dates = Object.keys(grouped).sort();

    if (dates.length <= 1) {
        // chỉ 1 ngày - giữ hành vi cũ (có cột Ngày nếu includeDate true)
        writeDataToXLSX(header, rows);
        return;
    }

    // nhiều ngày: tạo workbook với mỗi sheet là 1 ngày
    const wb = XLSX.utils.book_new();
    for (const d of dates) {
        const tasksOfDay = grouped[d];
        const sheetHeader = [];
        if (selectedCols.includes('STT')) sheetHeader.push('STT');
        // Khi tách theo sheet, không cần cột 'Ngày' vì tên sheet đã là ngày
        sheetHeader.push(...selectedCols.filter(c => c !== 'STT' && c !== 'Ngày'));

        const sheetRows = [];
        let i = 1;
        for (const task of tasksOfDay) {
            const row = [];
            if (selectedCols.includes('STT')) row.push(i++);
            for (const c of selectedCols) {
                if (c === 'STT' || c === 'Ngày') continue;
                const map = {
                    'Nội dung': task.content || '',
                    'Đơn vị': task.unit || '',
                    'Thời gian': task.duration || '',
                    'Mức độ': task.priority || '',
                    'Trạng thái': task.status || '',
                    'Ghi chú': task.note || ''
                };
                row.push(map[c] || '');
            }
            sheetRows.push(row);
        }

        const ws = XLSX.utils.aoa_to_sheet([sheetHeader, ...sheetRows]);
        // Sheet name: format DD-MM-YYYY (safe and short)
        let sheetName = formatDisplayDate(d);
        // ensure sheet name <=31 chars and remove illegal characters
        sheetName = sheetName.replace(/[\\/*?:\[\]]/g, '_').slice(0, 31);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }

    const now = new Date();
    const filename = `tasks_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}.xlsx`;
    XLSX.writeFile(wb, filename);
}

// Hàm chính gọi theo loại
async function performExport(type) {
    if (type === 'day') {
        exportTasksForDay();
    } else if (type === 'week') {
        const sel = document.getElementById('exportWeekSelect');
        if (!sel || !sel.value) return alert('Vui lòng chọn tuần!');
        const [y, m, w] = sel.value.split('|');
        const tasks = await fetchTasksForWeek(y, m, w);
        await exportTasksForCollection(tasks, true);
    } else if (type === 'month') {
        const mp = document.getElementById('exportMonthPicker');
        if (!mp || !mp.value) return alert('Vui lòng chọn tháng!');
        const [y, m] = mp.value.split('-');
        const tasks = await fetchTasksForMonth(y, m);
        await exportTasksForCollection(tasks, true);
    } else if (type === 'range') {
        const s = document.getElementById('exportRangeStart').value;
        const e = document.getElementById('exportRangeEnd').value;
        if (!s || !e) return alert('Vui lòng chọn cả ngày bắt đầu và kết thúc!');
        if (s > e) return alert('Ngày bắt đầu phải <= ngày kết thúc');
        const tasks = await fetchTasksForRange(s, e);
        await exportTasksForCollection(tasks, true);
    }
}

// Chuyển chuỗi YYYY-MM-DD sang Date object (sử dụng giờ địa phương)
function parseYMD(ds) {
    const [yy, mm, dd] = ds.split("-").map(s => parseInt(s, 10));
    return new Date(yy, mm - 1, dd);
}

// ===== HÀM TÍNH TUẦN =====
// Lấy số tuần (week1, week2, week3, ...) của một ngày
// Ví dụ: ngày 3-8-2024 (là thứ 6) nằm ở week2 của tháng
// - week1 = các ngày từ 1 đến trước thứ 2 đầu tiên của tháng (tuần lẻ)
// - week2+ = bắt đầu từ thứ 2, mỗi lô 7 ngày (thứ 2-chủ nhật)
function getWeekNumber(ds) {
    const dt = (typeof ds === 'string') ? parseYMD(ds) : new Date(ds);
    const year = dt.getFullYear();
    const month = dt.getMonth() + 1; // 1-based
    const firstDay = new Date(year, month - 1, 1);
    const firstDayWeekday = firstDay.getDay(); // 0=Chủ nhật..6=Thứ 7
    const firstMondayDate = ((8 - firstDayWeekday) % 7) + 1; // Thứ 2 đầu tiên

    // Nếu ngày nằm trước thứ 2 đầu tiên của tháng, là week1 (tuần lẻ của tháng)
    if (dt.getDate() < firstMondayDate) return "week1";

    // Từ thứ 2 đầu tiên trở đi, chia thành week2, week3, ...
    // Công thức: (số ngày từ thứ 2 đầu) / 7 + 2 = số tuần
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

// ========== MODAL TÙY CHỈNH ==========
// Ẩn modal xác nhận/thông báo và khôi phục trạng thái ban đầu
function hideCustomAlert() {
    if (!customAlertModal) return;
    customAlertModal.style.display = 'none';
    customAlertOk.onclick = null;
    customAlertCancel.onclick = null;
}

// Hiển thị modal thông báo (chỉ có nút OK, người dùng chỉ xem thôi)
function showCustomAlert(html) {
    return new Promise(resolve => {
        if (!customAlertModal) { alert(html); resolve(); return; } // Fallback nếu không có modal
        customAlertBody.innerHTML = html;
        customAlertCancel.style.display = 'none'; // Ẩn nút Hủy
        customAlertOk.innerText = 'OK';
        customAlertOk.onclick = () => { hideCustomAlert(); resolve(); };
        customAlertModal.style.display = 'flex';
    });
}

// Hiển thị modal xác nhận (có nút OK và Hủy, người dùng phải xác nhận)
function showCustomConfirm(html) {
    return new Promise(resolve => {
        if (!customAlertModal) { resolve(confirm(html)); return; } // Fallback
        customAlertBody.innerHTML = html.replace(/\n/g, '<br>'); // Chuyển dòng thành HTML break
        customAlertCancel.style.display = 'inline-block'; // Hiển thị nút Hủy
        customAlertOk.innerText = 'OK';
        customAlertOk.onclick = () => { hideCustomAlert(); resolve(true); }; // Nút OK = true
        customAlertCancel.onclick = () => { hideCustomAlert(); resolve(false); }; // Nút Hủy = false
        customAlertModal.style.display = 'flex';
    });
}

// Hiển thị vòng xoay loading khi xử lý dữ liệu từ database
function showLoading() {
    if (loadingIndicator) loadingIndicator.classList.add('active');
}

// Ẩn vòng xoay loading
function hideLoading() {
    if (loadingIndicator) loadingIndicator.classList.remove('active');
}

// Chuyển chuỗi YYYY-MM-DD sang định dạng DD-MM-YYYY để hiển thị cho người dùng dễ đọc
function formatDisplayDate(ds) {
    if (!ds) return ds;
    const parts = ds.split("-");
    if (parts.length !== 3) return ds;
    const [y, m, d] = parts;
    return `${d}-${m}-${y}`;
}

// Xử lý khi người dùng chọn một ngày trên lịch
function selectDate(ds, el) {
    // Kiểm tra quyền: Thành viên chỉ được xem công việc hôm nay
    if (!checkMemberAccess(ds)) return;

    // Bỏ class "selected-day" từ tất cả các ngày
    document.querySelectorAll(".day").forEach(d => d.classList.remove("selected-day"));
    // Thêm class "selected-day" vào ngày được chọn (để highlight)
    el.classList.add("selected-day");

    selectedDate = ds; // Lưu ngày được chọn

    // Cập nhật tiêu đề và hiển thị thông báo nếu ngày đặc biệt
    if (isNlDay(ds)) {
        // NL có độ ưu tiên hiển thị cao hơn NB nếu trùng
        selectedDateTitle.innerHTML = `<span style="color: #4e73df; font-weight: bold;">🎉 ${formatDisplayDate(ds)} - NGÀY NGHỈ LỄ (NL)</span>`;
    } else if (isNbDay(ds)) {
        selectedDateTitle.innerHTML = `<span style="color: #ff6b6b; font-weight: bold;">🏷️ ${formatDisplayDate(ds)} - NGÀY NGHỈ BÙ (NB)</span>`;
    } else {
        selectedDateTitle.innerText = "Công việc ngày " + formatDisplayDate(ds);
    }

    loadTasks(ds); // Tải công việc của ngày này
    // Cập nhật dropdown tuần để đồng bộ với tháng của ngày được chọn
    try { populateWeekSelect(ds); } catch (e) { }
}

// Xử lý khi người dùng chọn một tuần từ dropdown
if (weekSelect) {
    weekSelect.onchange = async () => {
        if (weekSelect.value) {
            const [y, m, w] = weekSelect.value.split("|");
            loadTasksForWeek(y, m, w); // Tải công việc của tuần đó
            updateExportWeekOptions(weekSelect); // đồng bộ với phần export
        }
    };
}

// ========== PHÂN LOẠI MÀU CHO MỨC ĐỘ VÀ TRẠNG THÁI ==========
/**
 * Trả về class CSS tương ứng với mức độ ưu tiên để quy định màu sắc
 * @param {string} v - Mức độ ưu tiên ("Thấp", "Trung bình", "Cao")
 * @returns {string} Class CSS ("priority-low", "priority-medium", "priority-high")
 */
const priorityClass = v =>
    v === "Thấp" ? "priority-low" : // Màu xanh lá cho ưu tiên thấp
        v === "Trung bình" ? "priority-medium" : // Màu vàng cho ưu tiên trung bình
            "priority-high"; // Màu đỏ cho ưu tiên cao

/**
 * Trả về class CSS tương ứng với trạng thái công việc để quy định màu sắc
 * @param {string} v - Trạng thái công việc ("Chưa xử lý", "Đang xử lý", "Đã xử lý")
 * @returns {string} Class CSS ("status-pending", "status-doing", "status-done")
 */
const statusClass = v =>
    v === "Chưa xử lý" ? "status-pending" : // Màu xám (chưa bắt đầu)
        v === "Đang xử lý" ? "status-doing" : // Màu cam (đang làm)
            "status-done"; // Màu xanh (hoàn thành)

/**
 * Tạo dropdown select với các tùy chọn và áp dụng class CSS năng động
 * Khi người dùng thay đổi giá trị, màu sắc tự động cập nhật theo giá trị mới
 * @param {array} options - Danh sách các tùy chọn để hiển thị
 * @param {string} value - Giá trị được chọn ban đầu
 * @param {function} getClass - Hàm để lấy class CSS dựa trên giá trị
 * @param {function} callback - Hàm gọi khi người dùng thay đổi giá trị
 * @returns {HTMLElement} Phần tử select đã được cấu hình
 */
function createColorSelect(options, value, getClass, callback) {
    const select = document.createElement("select");

    // Thêm các option vào dropdown
    options.forEach(opt => {
        const o = document.createElement("option");
        o.value = o.textContent = opt;
        if (opt === value) o.selected = true; // Chọn giá trị hiện tại
        select.appendChild(o);
    });

    // Áp dụng class CSS ban đầu dựa trên giá trị hiện tại
    select.className = getClass(value);

    // Lắng nghe sự kiện thay đổi giá trị
    select.onchange = () => {
        select.className = getClass(select.value); // Cập nhật màu sắc CSS (priority/status color)
        callback(select.value); // Gọi callback để lưu giá trị vào database
    };

    return select;
}

/* ========== TẢI VÀ HIỂN THỊ CÔNG VIỆC ========== */
/**
 * Tải và hiển thị tất cả công việc của một ngày cụ thể
 * Nếu ngày là NB, hiển thị thông báo thay vì bảng công việc
 * @param {string} ds - Ngày dưới dạng string (YYYY-MM-DD)
 */
function loadTasks(ds) {
    // Kiểm tra nếu ngày đặc biệt: NL trước, NB tiếp theo
    const addBtn = document.getElementById('openAddModal');
    const expBtn = document.getElementById('exportBtn');
    if (isNlDay(ds)) {
        document.querySelector('table').style.display = 'none';
        taskTable.innerHTML = `<tr><td colspan="100" style="text-align: center; padding: 20px; background: #dceeff; border: 2px solid #6f42c1;"><strong style="font-size: 18px; color: #2e59d9;">🎉 Hôm nay là ngày Nghỉ Lễ (NL)</strong></td></tr>`;
        if (addBtn) addBtn.style.display = 'none';
        if (expBtn) expBtn.style.display = 'none';
        return;
    } else if (isNbDay(ds)) {
        document.querySelector('table').style.display = 'none';
        taskTable.innerHTML = `<tr><td colspan="100" style="text-align: center; padding: 20px; background: #fff3cd; border: 2px solid #ffc107;"><strong style="font-size: 18px; color: #856404;">🏷️ Hôm nay là ngày Nghỉ Bù (NB)</strong></td></tr>`;
        if (addBtn) addBtn.style.display = 'none';
        if (expBtn) expBtn.style.display = 'none';
        return;
    } else {
        document.querySelector('table').style.display = 'table';
        const isMemberRole = isMember();
        if (menuToggleBtn) menuToggleBtn.style.display = isMemberRole ? 'none' : 'inline-block';
        if (addBtn) addBtn.style.display = isMemberRole ? 'none' : 'inline-block';
        if (expBtn) expBtn.style.display = 'inline-block';
    }

    const [y, m] = ds.split("-");
    const w = getWeekNumber(ds);
    const r = tasksRef(y, m, w, ds);

    // Lắng nghe thay đổi dữ liệu từ Firebase Realtime Database
    onValue(r, snap => {
        taskTable.innerHTML = ""; // Xóa bảng cũ
        let i = 1;

        // Lặp qua từng công việc trong ngày
        snap.forEach(ch => {
            const t = ch.val(); // Dữ liệu công việc
            const k = ch.key; // ID của công việc
            const row = document.createElement("tr");

            // (bỏ qua logs debug)

            // Tạo hàng bảng với thông tin công việc
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

            // Tạo dropdown chọn mức độ ưu tiên với màu sắc
            const prSelect = createColorSelect(
                ["Thấp", "Trung bình", "Cao"],
                t.priority,
                priorityClass,
                v => update(tasksRef(y, m, w, ds, k), { priority: v })
            );

            // Tạo dropdown chọn trạng thái công việc với màu sắc
            const stSelect = createColorSelect(
                ["Chưa xử lý", "Đang xử lý", "Đã xử lý"],
                t.status,
                statusClass,
                v => update(tasksRef(y, m, w, ds, k), { status: v })
            );

            // Vô hiệu hóa select cho member (họ không được phép sửa)
            if (isMember()) {
                prSelect.disabled = true;
                stSelect.disabled = true;
            }

            // Thêm dropdown vào cột mức độ ưu tiên và trạng thái
            row.children[5].appendChild(prSelect);
            row.children[6].appendChild(stSelect);

            // Nút nhân bản công việc
            row.querySelector(".btn-duplicate").onclick = async () => {
                if (isMember()) {
                    alert('👤 Thành viên không có quyền nhân bản công việc');
                    return;
                }

                const confirmDup = confirm("Bạn có muốn nhân bản công việc này không?");
                if (!confirmDup) return;

                // Sao chép thông tin công việc cần thiết
                const newTask = {
                    content: t.content,
                    unit: t.unit,
                    duration: t.duration,
                    priority: t.priority,
                    status: t.status,
                    note: t.note,
                    startDate: t.startDate
                };

                await push(tasksRef(y, m, w, ds), newTask);
                alert("🔁 Đã nhân bản công việc!");
            };

            // Nút xóa công việc
            row.querySelector(".btn-delete").onclick = async () => {
                if (isMember()) {
                    alert('👤 Thành viên không có quyền xóa công việc');
                    return;
                }

                const confirmDelete = confirm("Bạn có chắc muốn xóa công việc này không?");

                if (!confirmDelete) return;

                try {
                    await remove(tasksRef(y, m, w, ds, k));
                    alert("✅ Xóa công việc thành công!");
                } catch (error) {
                    alert("❌ Có lỗi xảy ra khi xóa!");
                    console.error(error);
                }
            };

            // Nút sửa công việc
            row.querySelector(".btn-edit").onclick = () => {
                if (isMember()) {
                    alert('👤 Thành viên không có quyền chỉnh sửa công việc');
                    return;
                }
                openModal("Chỉnh sửa công việc", k, t);
            };

            taskTable.appendChild(row);
        });
    });
}

// ========== MODAL THÊM/SỎA CÔNG VIệC ========== 
// Mở modal để thêm công việc mới hoặc sửa công việc có sẵn
function openModal(title, id = "", t = {}) {
    modalTitle.innerText = title; // Đậu Để modal: "Thêm công việc" hoặc "Chỉnh sửa công việc"
    taskIdField.value = id; // Nếu có ID, tức là sửa; nếu trống là thêm mới

    // Đập đặt giá trị đặn các input field nếu đang sửa
    contentInput.value = t.content || "";
    unitInput.value = t.unit || "";
    durationInput.value = t.duration || "";
    priorityInput.value = t.priority || "Thấp";
    statusInput.value = t.status || "Chưa xử lý";
    noteInput.value = t.note || "";

    modal.style.display = "flex"; // Hiển thị modal
}

// Xóa modal bằng nút X
if (document.querySelector(".close")) {
    document.querySelector(".close").onclick = () => modal.style.display = "none";
}

// Xóa modal khi click bên ngoài (backdrop)
modal.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });

// Xóa modal khi bấm phím Escape
document.addEventListener("keydown", e => { if (e.key === "Escape") modal.style.display = "none"; });

// Nút mở modal thêm công việc mới
if (document.getElementById("openAddModal")) {
    document.getElementById("openAddModal").onclick = () => {
        if (!selectedDate) return alert("Vui lòng chọn ngày trước!");
        openModal("Thêm công việc");
    };
}

// Nút lưu trong modal thêm/sửa
if (saveTaskBtn) {
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
                await update(tasksRef(y, m, w, selectedDate, taskIdField.value), data);
                alert("✅ Cập nhật công việc thành công!");
            } else {
                await push(tasksRef(y, m, w, selectedDate), data);
                alert("✅ Thêm công việc mới thành công!");
            }
            modal.style.display = "none";
        } catch (error) {
            console.error(error);
            alert("\u274c Có lỗi xảy ra khi lưu công việc!");
        }
    };
}

// Nút xuất nhanh cho ngày hiện tại (vẫn nằm cạnh thêm công việc)
if (document.getElementById("exportBtn")) {
    document.getElementById("exportBtn").onclick = () => {
        if (!selectedDate) return alert("Vui lòng chọn ngày trước!");
        performExport('day');
    };
}

// dropdown chọn cột
const columnBtn = document.getElementById('columnSelectBtn');
const columnDropdown = document.getElementById('columnDropdown');
if (columnBtn && columnDropdown) {
    columnBtn.onclick = () => {
        columnDropdown.style.display = columnDropdown.style.display === 'block' ? 'none' : 'block';
    };
    // khi click ngoài sẽ ẩn dropdown
    document.addEventListener('click', e => {
        if (!columnDropdown.contains(e.target) && e.target !== columnBtn) {
            columnDropdown.style.display = 'none';
        }
    });
}

// quản lý phần xuất trong menu
const exportTypeSelect = document.getElementById('exportType');
const exportWeekDiv = document.getElementById('exportWeek');
const exportMonthDiv = document.getElementById('exportMonth');
const exportRangeDiv = document.getElementById('exportRange');
if (exportTypeSelect) {
    exportTypeSelect.onchange = () => {
        const t = exportTypeSelect.value;
        exportWeekDiv.style.display = (t === 'week') ? 'block' : 'none';
        exportMonthDiv.style.display = (t === 'month') ? 'block' : 'none';
        exportRangeDiv.style.display = (t === 'range') ? 'block' : 'none';
    };
}

// nút xác nhận xuất trong menu
if (document.getElementById('exportConfirmBtn')) {
    document.getElementById('exportConfirmBtn').onclick = async () => {
        const t = exportTypeSelect ? exportTypeSelect.value : 'day';
        await performExport(t);
    };
}

// duplicate weekSelect values for export week
function updateExportWeekOptions(baseSelect) {
    const dest = document.getElementById('exportWeekSelect');
    if (!dest || !baseSelect) return;
    dest.innerHTML = baseSelect.innerHTML;
    dest.value = baseSelect.value;
}

function updateImportWeekOptions(baseSelect) {
    const dest = document.getElementById('importWeekSelect');
    if (!dest || !baseSelect) return;
    dest.innerHTML = baseSelect.innerHTML;
    dest.value = baseSelect.value;
}

// whenever populateWeekSelect is called, mirror it
const originalPopulateWeekSelect = populateWeekSelect;
populateWeekSelect = function (dateStr) {
    originalPopulateWeekSelect(dateStr);
    const base = document.getElementById('weekSelect');
    updateExportWeekOptions(base);
    updateImportWeekOptions(base);
};

// quản lý phần import trong menu (hiển thị các control theo loại import)
const importTypeSelect = document.getElementById('importType');
const importWeekDiv = document.getElementById('importWeek');
const importMonthDiv = document.getElementById('importMonth');
const importRangeDiv = document.getElementById('importRange');
if (importTypeSelect) {
    importTypeSelect.onchange = () => {
        const t = importTypeSelect.value;
        importWeekDiv.style.display = (t === 'week') ? 'block' : 'none';
        importMonthDiv.style.display = (t === 'month') ? 'block' : 'none';
        importRangeDiv.style.display = (t === 'range') ? 'block' : 'none';
    };
}

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
/**
 * Khởi động ứng dụng: Vẽ lịch, cấu hình quyền theo role, và tự động chọn hôm nay
 * Hàm này được gọi sau khi người dùng đăng nhập thành công
 */
function startApp() {
    // Tải danh sách các ngày NB và NL từ Firebase trước
    Promise.all([loadNbDays(), loadNlDays()]).then(() => {
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
    });
}

/* ========== NHÂN BẢN NÂNG CAO ========== */
/**
 * Khởi tạo các biến và phần tử DOM cho tính năng nhân bản nâng cao
 * Nhân bản công việc sang nhiều ngày / tuần / tháng khác nhau
 */
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

// Danh sách các ngày được chọn để nhân bản vào
let advancedDates = [];

/**
 * Xử lý thay đổi loại nhân bản (ngày, tuần, tháng)
 * Hiển thị/ẩn các box tương ứng với loại nhân bản được chọn
 */
duplicateType.onchange = async () => {
    multiDateBox.style.display = "none";
    weekBox.style.display = "none";
    monthBox.style.display = "none";

    // Hiển thị box tương ứng với loại nhân bản được chọn
    if (duplicateType.value === "multi") {
        multiDateBox.style.display = "block";
    } else if (duplicateType.value === "week") {
        weekBox.style.display = "block";
        // Tải danh sách các tuần tiếp theo có thể chọn để nhân bản vào
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

/**
 * Tải danh sách các tuần tiếp theo để có thể chọn nhân bản vào
 * Hiển thị tất cả các tuần của tháng hiện tại và tháng tiếp theo
 */
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

    // Thêm các tuần vào dropdown
    weeks.forEach(w => {
        // (bỏ qua logs debug)
        const opt = document.createElement("option");
        opt.value = `${w.year}|${pad(w.month)}|week${w.week}`;
        opt.textContent = w.label;
        targetWeekSelect.appendChild(opt);
    });
}

/* ========== NB SELECT MODAL ========== */
// Render lịch trong modal NB
/* ========== NB SELECT MODAL FUNCTIONS ========== */

// Populate năm vào select
function populateYearSelect() {
    const currentYear = new Date().getFullYear();

    if (nbYearSelect) {
        nbYearSelect.innerHTML = "";
        for (let y = currentYear - 1; y <= currentYear + 5; y++) {
            const opt = document.createElement("option");
            opt.value = y;
            opt.textContent = y;
            if (y === currentYear) opt.selected = true;
            nbYearSelect.appendChild(opt);
        }
    }

    if (nlYearSelect) {
        nlYearSelect.innerHTML = "";
        for (let y = currentYear - 1; y <= currentYear + 5; y++) {
            const opt = document.createElement("option");
            opt.value = y;
            opt.textContent = y;
            if (y === currentYear) opt.selected = true;
            nlYearSelect.appendChild(opt);
        }
    }
}

// Populate tháng vào list
function populateMonthList() {
    const year = parseInt(nbYearSelect.value);
    nbMonthList.innerHTML = "";

    for (let m = 1; m <= 12; m++) {
        const monthDiv = document.createElement("div");
        monthDiv.style.padding = "12px";
        monthDiv.style.background = "#e7f3ff";
        monthDiv.style.border = "1px solid #b3d9ff";
        monthDiv.style.borderRadius = "6px";
        monthDiv.style.cursor = "pointer";
        monthDiv.style.textAlign = "center";
        monthDiv.style.fontWeight = "600";
        monthDiv.style.color = "#0056b3";
        monthDiv.style.transition = "all 0.2s";
        monthDiv.innerHTML = `Tháng ${m}`;

        monthDiv.onmouseover = () => {
            monthDiv.style.background = "#0056b3";
            monthDiv.style.color = "#fff";
            monthDiv.style.transform = "scale(1.05)";
        };
        monthDiv.onmouseout = () => {
            monthDiv.style.background = "#e7f3ff";
            monthDiv.style.color = "#0056b3";
            monthDiv.style.transform = "scale(1)";
        };

        monthDiv.onclick = () => {
            nbSelectedYear = year;
            nbSelectedMonth = m;
            renderCalendarForMonth(year, m);
        };

        nbMonthList.appendChild(monthDiv);
    }
}

// tương tự cho NL
function populateNlMonthList() {
    const year = parseInt(nlYearSelect.value);
    nlMonthList.innerHTML = "";

    for (let m = 1; m <= 12; m++) {
        const monthDiv = document.createElement("div");
        monthDiv.style.padding = "12px";
        monthDiv.style.background = "#ffe7e7";
        monthDiv.style.border = "1px solid #ffb3b3";
        monthDiv.style.borderRadius = "6px";
        monthDiv.style.cursor = "pointer";
        monthDiv.style.textAlign = "center";
        monthDiv.style.fontWeight = "600";
        monthDiv.style.color = "#a30000";
        monthDiv.style.transition = "all 0.2s";
        monthDiv.innerHTML = `Tháng ${m}`;

        monthDiv.onmouseover = () => {
            monthDiv.style.background = "#a30000";
            monthDiv.style.color = "#fff";
            monthDiv.style.transform = "scale(1.05)";
        };
        monthDiv.onmouseout = () => {
            monthDiv.style.background = "#ffe7e7";
            monthDiv.style.color = "#a30000";
            monthDiv.style.transform = "scale(1)";
        };

        monthDiv.onclick = () => {
            nlSelectedYear = year;
            nlSelectedMonth = m;
            renderNlCalendarForMonth(year, m);
        };

        nlMonthList.appendChild(monthDiv);
    }
}


// Render lịch cho tháng được chọn
function renderCalendarForMonth(year, month) {
    monthSelectSection.style.display = "none";
    calendarSelectSection.style.display = "block";

    nbCalendarTitle.innerText = `Tháng ${month} - ${year}`;

    const first = (new Date(year, month - 1, 1).getDay() + 6) % 7;
    const last = new Date(year, month, 0).getDate();

    nbCalendarDays.innerHTML = "";

    // Thêm ô trống
    for (let i = 0; i < first; i++) {
        const emptyDiv = document.createElement("div");
        emptyDiv.style.background = "#f9f9f9";
        emptyDiv.style.height = "60px";
        emptyDiv.style.borderRadius = "6px";
        nbCalendarDays.appendChild(emptyDiv);
    }

    // Thêm các ngày
    for (let d = 1; d <= last; d++) {
        const ds = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const dayDiv = document.createElement("div");
        dayDiv.style.background = "#fff";
        dayDiv.style.border = "1px solid #ddd";
        dayDiv.style.padding = "8px";
        dayDiv.style.borderRadius = "6px";
        dayDiv.style.cursor = "pointer";
        dayDiv.style.height = "60px";
        dayDiv.style.display = "flex";
        dayDiv.style.alignItems = "center";
        dayDiv.style.justifyContent = "center";
        dayDiv.style.fontWeight = "600";
        dayDiv.style.fontSize = "16px";
        dayDiv.style.transition = "all 0.2s";
        dayDiv.innerHTML = `${d}`;

        // Check nếu ngày đã được chọn trong temp list
        const isSelected = nbTempSelectedDates.includes(ds);
        if (isSelected) {
            dayDiv.style.background = "#28a745";
            dayDiv.style.borderColor = "#28a745";
            dayDiv.style.color = "#fff";
        }

        // Hover effect
        dayDiv.onmouseover = () => {
            if (!isSelected) {
                dayDiv.style.background = "#e8f4f8";
            }
            dayDiv.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
            dayDiv.style.transform = "scale(1.05)";
        };
        dayDiv.onmouseout = () => {
            dayDiv.style.background = isSelected ? "#28a745" : "#fff";
            dayDiv.style.boxShadow = "none";
            dayDiv.style.transform = "scale(1)";
        };

        // Click để toggle selection
        dayDiv.onclick = () => {
            if (nbTempSelectedDates.includes(ds)) {
                nbTempSelectedDates = nbTempSelectedDates.filter(d => d !== ds);
            } else {
                nbTempSelectedDates.push(ds);
            }
            updateSelectedDatesList();
            renderCalendarForMonth(year, month);
        };

        nbCalendarDays.appendChild(dayDiv);
    }
}

// NL version of calendar rendering
function renderNlCalendarForMonth(year, month) {
    nlMonthSelectSection.style.display = "none";
    nlCalendarSelectSection.style.display = "block";

    nlCalendarTitle.innerText = `Tháng ${month} - ${year}`;

    const first = (new Date(year, month - 1, 1).getDay() + 6) % 7;
    const last = new Date(year, month, 0).getDate();

    nlCalendarDays.innerHTML = "";

    // Thêm ô trống
    for (let i = 0; i < first; i++) {
        const emptyDiv = document.createElement("div");
        emptyDiv.style.background = "#f9f9f9";
        emptyDiv.style.height = "60px";
        emptyDiv.style.borderRadius = "6px";
        nlCalendarDays.appendChild(emptyDiv);
    }

    // Thêm các ngày
    for (let d = 1; d <= last; d++) {
        const ds = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const dayDiv = document.createElement("div");
        dayDiv.style.background = "#fff";
        dayDiv.style.border = "1px solid #ddd";
        dayDiv.style.padding = "8px";
        dayDiv.style.borderRadius = "6px";
        dayDiv.style.cursor = "pointer";
        dayDiv.style.height = "60px";
        dayDiv.style.display = "flex";
        dayDiv.style.alignItems = "center";
        dayDiv.style.justifyContent = "center";
        dayDiv.style.fontWeight = "600";
        dayDiv.style.fontSize = "16px";
        dayDiv.style.transition = "all 0.2s";
        dayDiv.innerHTML = `${d}`;

        const isSelected = nlTempSelectedDates.includes(ds);
        if (isSelected) {
            dayDiv.style.background = "#007bff";
            dayDiv.style.borderColor = "#007bff";
            dayDiv.style.color = "#fff";
        }

        dayDiv.onmouseover = () => {
            if (!isSelected) dayDiv.style.background = "#e8f0fe";
            dayDiv.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
            dayDiv.style.transform = "scale(1.05)";
        };
        dayDiv.onmouseout = () => {
            dayDiv.style.background = isSelected ? "#007bff" : "#fff";
            dayDiv.style.boxShadow = "none";
            dayDiv.style.transform = "scale(1)";
        };

        dayDiv.onclick = () => {
            if (nlTempSelectedDates.includes(ds)) {
                nlTempSelectedDates = nlTempSelectedDates.filter(d => d !== ds);
            } else {
                nlTempSelectedDates.push(ds);
            }
            updateNlSelectedDatesList();
            renderNlCalendarForMonth(year, month);
        };

        nlCalendarDays.appendChild(dayDiv);
    }
}


// Update danh sách ngày được chọn
function updateSelectedDatesList() {
    nbSelectedDatesList.innerHTML = "";
    if (nbTempSelectedDates.length === 0) {
        nbNoDatesMsg.style.display = "block";
    } else {
        nbNoDatesMsg.style.display = "none";
        nbTempSelectedDates.sort().forEach(ds => {
            const badge = document.createElement("span");
            badge.style.background = "#28a745";
            badge.style.color = "#fff";
            badge.style.padding = "6px 10px";
            badge.style.borderRadius = "12px";
            badge.style.fontSize = "13px";
            badge.style.fontWeight = "600";
            badge.innerHTML = formatDisplayDate(ds);
            nbSelectedDatesList.appendChild(badge);
        });
    }
}

// Cập nhật danh sách ngày được chọn cho NL
function updateNlSelectedDatesList() {
    nlSelectedDatesList.innerHTML = "";
    if (nlTempSelectedDates.length === 0) {
        nlNoDatesMsg.style.display = "block";
    } else {
        nlNoDatesMsg.style.display = "none";
        nlTempSelectedDates.sort().forEach(ds => {
            const badge = document.createElement("span");
            badge.style.background = "#007bff";
            badge.style.color = "#fff";
            badge.style.padding = "6px 10px";
            badge.style.borderRadius = "12px";
            badge.style.fontSize = "13px";
            badge.style.fontWeight = "600";
            badge.innerHTML = formatDisplayDate(ds);
            nlSelectedDatesList.appendChild(badge);
        });
    }
}

// quản lý NB qua sidebar
const manageNbDateInput = document.getElementById('manageNbDate');
const deleteNbBtn = document.getElementById('deleteNbBtn');
const changeNbBtn = document.getElementById('changeNbBtn');

if (deleteNbBtn) {
    deleteNbBtn.onclick = async () => {
        if (!manageNbDateInput.value) return alert('Vui lòng chọn ngày NB!');
        const ds = manageNbDateInput.value;
        if (!isNbDay(ds)) return alert('Ngày này không phải NB');
        await toggleNbDay(ds);
        alert('✅ Đã xóa NB ' + formatDisplayDate(ds));
        renderCalendar();
        if (selectedDate === ds) loadTasks(ds);
    };
}

if (changeNbBtn) {
    changeNbBtn.onclick = async () => {
        if (!manageNbDateInput.value) return alert('Vui lòng chọn ngày NB cần đổi!');
        const oldDate = manageNbDateInput.value;
        if (!isNbDay(oldDate)) return alert('Ngày này không phải NB');
        const newDate = prompt('Nhập ngày mới (YYYY-MM-DD):');
        if (!newDate) return;
        if (isNlDay(newDate)) return alert('Ngày mới trùng với NL, chọn ngày khác');
        // xóa cũ và thêm mới
        await toggleNbDay(oldDate);
        await toggleNbDay(newDate);
        alert('🔄 Đã đổi NB từ ' + formatDisplayDate(oldDate) + ' sang ' + formatDisplayDate(newDate));
        renderCalendar();
        if (selectedDate === oldDate || selectedDate === newDate) loadTasks(selectedDate);
    };
}

// NL management handlers
const manageNlDateInput = document.getElementById('manageNlDate');
const deleteNlBtn = document.getElementById('deleteNlBtn');
const changeNlBtn = document.getElementById('changeNlBtn');

if (deleteNlBtn) {
    deleteNlBtn.onclick = async () => {
        if (!manageNlDateInput.value) return alert('Vui lòng chọn ngày NL!');
        const ds = manageNlDateInput.value;
        if (!isNlDay(ds)) return alert('Ngày này không phải NL');
        await toggleNlDay(ds);
        alert('✅ Đã xóa NL ' + formatDisplayDate(ds));
        renderCalendar();
        if (selectedDate === ds) loadTasks(ds);
    };
}

if (changeNlBtn) {
    changeNlBtn.onclick = async () => {
        if (!manageNlDateInput.value) return alert('Vui lòng chọn ngày NL cần đổi!');
        const oldDate = manageNlDateInput.value;
        if (!isNlDay(oldDate)) return alert('Ngày này không phải NL');
        const newDate = prompt('Nhập ngày mới (YYYY-MM-DD):');
        if (!newDate) return;
        if (isNbDay(newDate)) return alert('Ngày mới trùng với NB, chọn ngày khác');
        await toggleNlDay(oldDate);
        await toggleNlDay(newDate);
        alert('🔄 Đã đổi NL từ ' + formatDisplayDate(oldDate) + ' sang ' + formatDisplayDate(newDate));
        renderCalendar();
        if (selectedDate === oldDate || selectedDate === newDate) loadTasks(selectedDate);
    };
}

// conflict prevention wrappers
const originalToggleNbDay = toggleNbDay;
toggleNbDay = async function (dateStr) {
    // allow removal regardless
    if (nbDays[dateStr]) {
        return await originalToggleNbDay(dateStr);
    }
    // adding NB, reject if NL exists
    if (isNlDay(dateStr)) {
        alert('❌ Không thể đánh dấu NB trùng với ngày NL');
        return false;
    }
    return await originalToggleNbDay(dateStr);
};

const originalToggleNlDay = toggleNlDay;
toggleNlDay = async function (dateStr) {
    // allow removal regardless
    if (nlDays[dateStr]) {
        return await originalToggleNlDay(dateStr);
    }
    // adding NL, reject if NB exists
    if (isNbDay(dateStr)) {
        alert('❌ Không thể đánh dấu NL trùng với ngày NB');
        return false;
    }
    return await originalToggleNlDay(dateStr);
};

// Mở modal lựa chọn ngày NB
if (selectNbDayBtn) {
    selectNbDayBtn.onclick = () => {
        // Reset state
        nbTempSelectedDates = [];
        nbSelectedYear = new Date().getFullYear();
        nbSelectedMonth = null;

        // Reset to month selection view
        monthSelectSection.style.display = 'block';
        calendarSelectSection.style.display = 'none';

        // Populate year dropdown
        populateYearSelect();

        // Populate month list immediately
        populateMonthList();

        // Show modal
        nbSelectModal.style.display = 'flex';
    };
}

// Mở modal lựa chọn ngày NL
if (selectNlDayBtn) {
    selectNlDayBtn.onclick = () => {
        nlTempSelectedDates = [];
        nlSelectedYear = new Date().getFullYear();
        nlSelectedMonth = null;

        nlMonthSelectSection.style.display = 'block';
        nlCalendarSelectSection.style.display = 'none';

        // populate year dropdown for NL
        populateYearSelect();
        populateNlMonthList();

        nlSelectModal.style.display = 'flex';
    };
}

// Đóng modal NB
if (closeNbSelectModal) {
    closeNbSelectModal.onclick = () => nbSelectModal.style.display = 'none';
}
// Đóng modal NL
if (closeNlSelectModal) {
    closeNlSelectModal.onclick = () => nlSelectModal.style.display = 'none';
}

// Click ngoài modal để đóng NB/NL
if (nbSelectModal) {
    nbSelectModal.onclick = (e) => {
        if (e.target === nbSelectModal) nbSelectModal.style.display = 'none';
    };
}
if (nlSelectModal) {
    nlSelectModal.onclick = (e) => {
        if (e.target === nlSelectModal) nlSelectModal.style.display = 'none';
    };
}

// Khi chọn năm mới NB
if (nbYearSelect) {
    nbYearSelect.onchange = () => {
        nbSelectedYear = parseInt(nbYearSelect.value);
        populateMonthList();
    };
}
// Khi chọn năm mới NL
if (nlYearSelect) {
    nlYearSelect.onchange = () => {
        nlSelectedYear = parseInt(nlYearSelect.value);
        populateNlMonthList();
    };
}

// Quay lại từ lịch về chọn tháng NB
if (nbCalendarBack) {
    nbCalendarBack.onclick = () => {
        monthSelectSection.style.display = 'block';
        calendarSelectSection.style.display = 'none';
    };
}
// Quay lại NL
if (nlCalendarBack) {
    nlCalendarBack.onclick = () => {
        nlMonthSelectSection.style.display = 'block';
        nlCalendarSelectSection.style.display = 'none';
    };
}

// Xác nhận lựa chọn ngày NB
if (nbConfirmButton) {
    nbConfirmButton.onclick = async () => {
        if (nbTempSelectedDates.length === 0) {
            alert('Vui lòng chọn ít nhất một ngày!');
            return;
        }

        try {
            // Lưu tất cả ngày được chọn vào Firebase (cấu trúc: nbDays/YYYY/MM/DD)
            for (const dateStr of nbTempSelectedDates) {
                if (isNlDay(dateStr)) throw new Error('Ngày ' + dateStr + ' đã là NL');
                const [year, month, day] = dateStr.split('-');
                const r = nbRef(year, month, day);
                await set(r, true);
                nbDays[dateStr] = true;
            }

            // Thông báo thành công
            alert('✔️ Đã lựa chọn ' + nbTempSelectedDates.length + ' ngày NB thành công!');

            // Đóng modal
            nbSelectModal.style.display = 'none';

            // Tải lại lịch để cập nhật
            if (selectedDate) {
                loadTasks(selectedDate);
            }
            renderCalendar();
        } catch (e) {
            console.error('Lỗi lưu ngày NB:', e);
            alert('❌ Lỗi khi lưu ngày NB: ' + e.message);
        }
    };
}

// Xác nhận lựa chọn ngày NL
if (nlConfirmButton) {
    nlConfirmButton.onclick = async () => {
        if (nlTempSelectedDates.length === 0) {
            alert('Vui lòng chọn ít nhất một ngày!');
            return;
        }

        try {
            // kiểm tra xung đột với NB trước khi ghi
            for (const dateStr of nlTempSelectedDates) {
                if (isNbDay(dateStr)) throw new Error('Ngày ' + formatDisplayDate(dateStr) + ' đã được đánh dấu NB');
            }
            for (const dateStr of nlTempSelectedDates) {
                const [year, month, day] = dateStr.split('-');
                const r = nlRef(year, month, day);
                await set(r, true);
                nlDays[dateStr] = true;
            }
            alert('✔️ Đã lựa chọn ' + nlTempSelectedDates.length + ' ngày NL thành công!');
            nlSelectModal.style.display = 'none';
            if (selectedDate) {
                loadTasks(selectedDate);
            }
            renderCalendar();
        } catch (e) {
            console.error('Lỗi lưu ngày NL:', e);
            alert('❌ Lỗi khi lưu ngày NL: ' + e.message);
        }
    };
}

/* Mở modal nhân bản nâng cao */
const duplicateDayBtn = document.getElementById("duplicateDayBtn");
if (duplicateDayBtn) {
    duplicateDayBtn.onclick = () => {
        if (isMember()) return alert('👤 Thành viên không có quyền sử dụng tính năng này');
        if (!selectedDate) return alert("Vui lòng chọn ngày trước!");
        advancedDates = [];
        dateList.innerHTML = "";
        multiDatePicker.value = "";
        advModal.style.display = "flex";
    };
}

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
            const r = tasksRef(year, month, weekId);
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
                const r = tasksRef(sy, sm);
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
            const snap = await get(tasksRef(sy, sm, sw, selectedDate));
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
                        await push(tasksRef(nty, ntm, ntw, newTargetDateStr), {
                            ...task,
                            startDate: newTargetDateStr
                        });
                    }
                }
            } else {
                // Nhân bản ngày: dùng công việc từ selectedDate
                const tasksArr = allSourceTasks[selectedDate] || [];
                for (const task of tasksArr) {
                    await push(tasksRef(ty, tm, tw, targetDate), {
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

/* ========== TẢI CÔNG VIỆC CỦA TUẦN ========== */
/**
 * Tải và hiển thị tất cả công việc của một tuần cụ thể
 * Công việc được sắp xếp theo ngày tăng dần, mỗi ngày hiển thị các công việc của nó
 * @param {string} y - Năm (YYYY)
 * @param {string} m - Tháng (MM, 01-12)
 * @param {string} weekId - ID của tuần (week1, week2, ...)
 */
function loadTasksForWeek(y, m, weekId) {
    const r = tasksRef(y, m, weekId);
    // Lắng nghe thay đổi dữ liệu từ Firebase Realtime Database
    onValue(r, snap => {
        taskTable.innerHTML = ""; // Xóa bảng công việc cũ
        let i = 1; // Số thứ tự công việc
        if (snap.exists()) {
            // Lấy danh sách các ngày và sắp xếp theo thứ tự tăng dần
            const dates = [];
            snap.forEach(dateSnap => dates.push(dateSnap.key));
            dates.sort();

            // Lặp qua từng ngày trong tuần
            for (const dateKey of dates) {
                const dateSnap = snap.child(dateKey);
                let dateTaskCount = 0;
                // Lặp qua từng công việc trong ngày
                dateSnap.forEach(ch => {
                    dateTaskCount++;
                    const t = ch.val(); // Dữ liệu công việc
                    const k = ch.key; // ID công việc
                    const row = document.createElement("tr");
                    // Tạo hàng bảng với thông tin công việc (thêm cột ngày)
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
            // Hoàn tất việc render bảng công việc của tuần
        } else {
            console.log('loadTasksForWeek: Không có dữ liệu cho tuần này');
        }
    });
}
/* ========== ĐẾM CÔNG VIỆC - XÓA NGÀY/TUẦN/THÁNG ========== */
/**
 * Đếm số lượng công việc của một ngày cụ thể
 * @param {string} date - Ngày dưới dạng string (YYYY-MM-DD)
 * @returns {number} Số lượng công việc của ngày đó
 */
async function countTasksForDay(date) {
    const [y, m] = date.split("-");
    const w = getWeekNumber(date);
    const r = tasksRef(y, m, w, date);
    const snap = await get(r);
    let c = 0;
    if (snap.exists()) {
        // Lặp qua từng công việc để đếm
        snap.forEach(ch => {
            c++;
        });
    }
    return c;
}

/**
 * Đếm số lượng công việc của một tuần (từ ngày bất kỳ trong tuần)
 * @param {string} date - Một ngày bất kỳ trong tuần dưới dạng string (YYYY-MM-DD)
 * @returns {number} Số lượng công việc của tuần đó
 */
async function countTasksForWeek(date) {
    const [y, m] = date.split("-");
    const w = getWeekNumber(date);
    const r = tasksRef(y, m, w);
    const snap = await get(r);
    let c = 0;
    if (snap.exists()) {
        // Lặp qua từng ngày trong tuần, rồi lặp qua từng công việc
        snap.forEach(dateSnap => {
            dateSnap.forEach(() => c++);
        });
    }
    return c;
}

/**
 * Đếm số lượng công việc của một tuần cụ thể (được xác định bởi year, month, weekId)
 * @param {string} y - Năm (YYYY)
 * @param {string} m - Tháng (MM, 01-12)
 * @param {string} weekId - ID của tuần (week1, week2, ...)
 * @returns {number} Số lượng công việc của tuần đó
 */
async function countTasksForWeekById(y, m, weekId) {
    const r = tasksRef(y, m, weekId);
    const snap = await get(r);
    let c = 0;
    if (snap.exists()) {
        // Lặp qua từng ngày trong tuần, rồi lặp qua từng công việc
        snap.forEach(dateSnap => dateSnap.forEach(() => c++));
    }
    return c;
}

/**
 * Đếm số lượng công việc của toàn bộ một tháng
 * @param {string} date - Một ngày bất kỳ trong tháng dưới dạng string (YYYY-MM-DD)
 * @returns {number} Số lượng công việc của tháng đó
 */
async function countTasksForMonth(date) {
    const [y, m] = date.split("-");
    const r = tasksRef(y, m);
    const snap = await get(r);
    let c = 0;
    if (snap.exists()) {
        // Lặp qua từng tuần, rồi lặp qua từng ngày, rồi lặp qua từng công việc
        snap.forEach(weekSnap => {
            weekSnap.forEach(dateSnap => {
                dateSnap.forEach(() => c++);
            });
        });
    }
    return c;
}

/**
 * Đếm số ngày có công việc và số lượng công việc của một tháng (kèm chi tiết từng ngày)
 * @param {string} date - Một ngày bất kỳ trong tháng dưới dạng string (YYYY-MM-DD)
 * @returns {object} Đối tượng chứa {daysCount, tasksCount, details} 
 *          - daysCount: số ngày có công việc
 *          - tasksCount: tổng số công việc
 *          - details: object chứa số công việc từng ngày {YYYY-MM-DD: count, ...}
 */
async function countDaysAndTasksForMonth(date) {
    const [y, m] = date.split("-");
    const r = tasksRef(y, m);
    const snap = await get(r);
    let tasksCount = 0;
    const details = {}; // Lưu chi tiết công việc từng ngày {ngày: số công việc}

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
                                // Đếm công việc của ngày này
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
        console.log('countDaysAndTasksForMonth: Không có dữ liệu cho tháng này');
    }

    const daysCount = Object.keys(details).length;
    return { daysCount, tasksCount, details };
}

/**
 * Đếm số ngày có công việc và số lượng công việc của một tuần cụ thể (kèm chi tiết từng ngày)
 * @param {string} y - Năm (YYYY)
 * @param {string} m - Tháng (MM, 01-12)
 * @param {string} weekId - ID của tuần (week1, week2, ...)
 * @returns {object} Đối tượng chứa {daysCount, tasksCount, details}
 *          - daysCount: số ngày có công việc
 *          - tasksCount: tổng số công việc
 *          - details: object chứa số công việc từng ngày {YYYY-MM-DD: count, ...}
 */
async function countDaysAndTasksForWeekById(y, m, weekId) {
    const r = tasksRef(y, m, weekId);
    const snap = await get(r);
    let tasksCount = 0;
    const details = {}; // Lưu chi tiết công việc từng ngày {ngày: số công việc}

    if (snap.exists()) {
        const weekData = snap.val();

        // Lặp qua từng ngày trong tuần
        for (const dateKey in weekData) {
            if (weekData.hasOwnProperty(dateKey)) {
                const dayTasks = weekData[dateKey];
                if (dayTasks && typeof dayTasks === 'object') {
                    let taskCount = 0;
                    // Đếm công việc của ngày này
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
        console.log('countDaysAndTasksForWeekById: Không có dữ liệu cho tuần này');
    }

    const daysCount = Object.keys(details).length;
    return { daysCount, tasksCount, details };
}

/* ========== XÓA NGÀY / TUẦN / THÁNG ========== */
/**
 * Xử lý sự kiện thay đổi dropdown xóa chính - hiển thị/ẩn các section tương ứng
 */
deleteSelectMain.onchange = () => {
    const type = deleteSelectMain.value;

    // Ẩn tất cả các section xóa
    document.getElementById('deleteDay').style.display = 'none';
    document.getElementById('deleteWeek').style.display = 'none';
    document.getElementById('deleteMonth').style.display = 'none';

    // Hiển thị section tương ứng với loại xóa được chọn
    if (type === 'day') {
        document.getElementById('deleteDay').style.display = 'block';
    } else if (type === 'week') {
        document.getElementById('deleteWeek').style.display = 'block';
    } else if (type === 'month') {
        document.getElementById('deleteMonth').style.display = 'block';
    }
};

/**
 * Xóa tất cả công việc của một ngày cụ thể
 */
if (document.getElementById('deleteDayBtn')) {
    document.getElementById('deleteDayBtn').onclick = async () => {
        // Kiểm tra quyền: Chỉ admin mới có quyền xóa
        if (isMember()) {
            alert('👤 Thành viên không có quyền xóa công việc');
            return;
        }

        if (!selectedDate) return alert("Vui lòng chọn ngày trước!");
        const [y, m] = selectedDate.split("-");
        const w = getWeekNumber(selectedDate);

        // Đếm số công việc cần xóa
        const cnt = await countTasksForDay(selectedDate);
        if (cnt === 0) return alert("Không có công việc để xóa ở ngày này!");

        // Xác nhận trước khi xóa
        const ok = await showCustomConfirm(`Xác nhận xóa ${cnt} công việc của ngày ${formatDisplayDate(selectedDate)}?`);
        if (!ok) return;

        showLoading();
        try {
            await remove(tasksRef(y, m, w, selectedDate));
            hideLoading();
            await showCustomAlert(`✅ Đã xóa ${cnt} công việc`);
            taskTable.innerHTML = ""; // Xóa bảng hiển thị
        } catch (error) {
            hideLoading();
            console.error(error);
            await showCustomAlert(`❌ Có lỗi khi xóa ngày: ${error && error.message ? error.message : String(error)}`);
        }
    };
}

/**
 * Xóa tất cả công việc của một tuần cụ thể
 */
if (document.getElementById('deleteWeekBtn')) {
    document.getElementById('deleteWeekBtn').onclick = async () => {
        // Kiểm tra quyền: Chỉ admin mới có quyền xóa
        if (isMember()) {
            alert('👤 Thành viên không có quyền xóa công việc');
            return;
        }

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

            // Xây dựng tin nhắn xác nhận với chi tiết từng ngày
            let msg = `Xác nhận xóa ${stats.daysCount} ngày (${stats.tasksCount} công việc)?<br><br>Chi tiết:`;
            const keys = Object.keys(stats.details).sort();
            for (const k of keys) msg += `<br>- ${formatDisplayDate(k)}: ${stats.details[k]} công việc`;

            // Xác nhận trước khi xóa
            const ok = await showCustomConfirm(msg);
            if (!ok) return;

            // Thực hiện xóa
            showLoading();
            try {
                await remove(tasksRef(y, m, w));
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
    };
}

/**
 * Xóa tất cả công việc của một tháng cụ thể
 */
if (document.getElementById('deleteMonthBtn')) {
    document.getElementById('deleteMonthBtn').onclick = async () => {
        // Kiểm tra quyền: Chỉ admin mới có quyền xóa
        if (isMember()) {
            alert('👤 Thành viên không có quyền xóa công việc');
            return;
        }

        try {
            // Xác định tháng: ưu tiên monthPicker, fallback selectedDate
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

            // Xác nhận trước khi xóa
            const ok = await showCustomConfirm(msg);
            if (!ok) return;

            showLoading();
            try {
                await remove(tasksRef(y, m));
                hideLoading();
                await showCustomAlert(`✅ Đã xóa ${stats.daysCount} ngày (${stats.tasksCount} công việc) của tháng ${m}/${y}`);
                taskTable.innerHTML = ""; // Xóa bảng hiển thị
            } catch (error) {
                hideLoading();
                throw error;
            }
        } catch (error) {
            console.error(error);
            await showCustomAlert("❌ Có lỗi khi xóa tháng!");
        }
    };
}

/* ========== XÓA CÔNG VIỆC ĐÃ CHỌN ========== */
/**
 * Xử lý checkbox "chọn tất cả" - chọn/bỏ chọn toàn bộ công việc trong bảng
 */
selectAllCheckbox.onchange = () => {
    // Lặp qua tất cả checkbox trong bảng công việc
    document.querySelectorAll(".task-checkbox").forEach(cb => {
        cb.checked = selectAllCheckbox.checked;
    });
};

/**
 * Xử lý dropdown xóa công việc đã chọn
 * Cho phép người dùng xóa nhiều công việc cùng lúc
 */
if (deleteSelect) {
    deleteSelect.onchange = async () => {
        const type = deleteSelect.value;
        deleteSelect.value = ""; // Reset dropdown

        if (!type) return;

        if (type === "selected") {
            // ========== XÓA CÔNG VIỆC ĐÃ CHỌN ==========
            // Kiểm tra quyền: Chỉ admin mới có quyền xóa
            if (isMember()) {
                alert('👤 Thành viên không có quyền xóa công việc');
                return;
            }

            // Lấy tất cả checkbox đã được chọn
            const selected = document.querySelectorAll(".task-checkbox:checked");
            if (selected.length === 0) return alert("Vui lòng chọn ít nhất 1 công việc!");

            // Xác nhận trước khi xóa
            if (!await showCustomConfirm(`Xác nhận xóa ${selected.length} công việc?`)) return;

            showLoading();
            try {
                // Lặp qua từng công việc được chọn và xóa
                for (const cb of selected) {
                    const y = cb.dataset.year;
                    const m = cb.dataset.month;
                    const w = cb.dataset.week;
                    const d = cb.dataset.date;
                    const k = cb.dataset.key;
                    await remove(tasksRef(y, m, w, d, k));
                }
            } finally {
                hideLoading();
            }
            await showCustomAlert(`✅ Đã xóa ${selected.length} công việc`);
            selectAllCheckbox.checked = false; // Bỏ chọn checkbox "chọn tất cả"
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

        // normalize structure in case data was imported under a push-id
        let usersObj = usersSnap.val();
        if (usersObj && typeof usersObj === 'object') {
            const keys = Object.keys(usersObj);
            if (keys.length === 1) {
                const inner = usersObj[keys[0]];
                if (inner && typeof inner === 'object') {
                    const allHavePin = Object.values(inner).every(u => u && u.pin !== undefined);
                    if (allHavePin) usersObj = inner;
                }
            }
        }

        let matched = null;
        for (const k in usersObj) {
            if (!usersObj.hasOwnProperty(k)) continue;
            const u = usersObj[k];
            if (u && String(u.pin) === String(pin)) {
                matched = { key: k, ...u };
                break;
            }
        }

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

// Xử lý đăng nhập thất bại: Hiển hiệu ứng râm lắc và xoá PIN
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

// Cập nhập hiển thị tên user đăng nhập
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

// Lấy role của user đang đăng nhập (admin, superadmin, hoặc member)
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

// Kiểm trá và trả về true/false dựa trên role
function isMember() { return getLoggedInUserRole() === 'member'; }
function isAdmin() { const r = getLoggedInUserRole(); return r === 'admin' || r === 'superadmin'; }

// Lấy chuỗi ngày hôm nay (YYYY-MM-DD)
function getTodayString() {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    const d = today.getDate();
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

// Kiểm trá quyền: Thành viên chỉ được xem công việc hôm nay
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

    // Ẩn nút toggle menu cho member
    if (menuToggleBtn) menuToggleBtn.style.display = isMemberRole ? 'none' : 'inline-block';

    // Ẩn nút lựa chọn NB cho member
    if (selectNbDayBtn) selectNbDayBtn.style.display = isMemberRole ? 'none' : 'inline-block';
    // Ẩn nút lựa chọn NL cho member
    if (selectNlDayBtn) selectNlDayBtn.style.display = isMemberRole ? 'none' : 'inline-block';

    // Ẩn nút nhân bản công việc cho member
    const duplicateDayBtn = document.getElementById('duplicateDayBtn');
    if (duplicateDayBtn) duplicateDayBtn.style.display = isMemberRole ? 'none' : 'inline-block';

    // Ẩn dropdown xóa cho member
    const deleteSelectMain = document.getElementById('deleteSelectMain');
    if (deleteSelectMain) deleteSelectMain.style.display = isMemberRole ? 'none' : 'inline-block';

    // Ẩn label + dropdown chọn tuần cho member
    const weekLabel = Array.from(document.querySelectorAll('label')).find(l => l.textContent.includes('Chọn tuần'));
    const weekSelect = document.getElementById('weekSelect');
    if (weekLabel) weekLabel.style.display = isMemberRole ? 'none' : '';
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

    // Ẩn nút action trong bảng công việc cho member
    if (isMemberRole) {
        document.querySelectorAll('.btn-edit, .btn-duplicate, .btn-delete').forEach(btn => {
            btn.style.display = 'none';
        });
    }
}

// Đăng xuất: Xóa session và quảy lại trang đăng nhập
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

// ========== MENU SIDEBAR ==========
// Toggle menu
if (menuToggleBtn) {
    menuToggleBtn.onclick = () => {
        sideMenuPanel.classList.add('show');
    };
}

// Đóng menu
if (menuCloseBtn) {
    menuCloseBtn.onclick = () => {
        sideMenuPanel.classList.remove('show');
    };
}

// Đóng menu khi click vào nút trong menu
if (sideMenuPanel) {
    Array.from(sideMenuPanel.querySelectorAll('.menu-btn')).forEach(btn => {
        btn.addEventListener('click', () => {
            sideMenuPanel.classList.remove('show');
        });
    });
}

// Đóng menu khi click ngoài (click vào lược đồ bên ngoài)
document.addEventListener('click', (e) => {
    if (sideMenuPanel && sideMenuPanel.classList.contains('show')) {
        if (!sideMenuPanel.contains(e.target) && e.target !== menuToggleBtn) {
            sideMenuPanel.classList.remove('show');
        }
    }
});

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

// Keyboard shortcut to close modals
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (nbSelectModal && nbSelectModal.style.display === 'flex') {
            nbSelectModal.style.display = 'none';
        }
    }
});
