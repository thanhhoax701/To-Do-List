// ========== NHẬP FIREBASE ==========
// Nhập Firebase Realtime Database và các hàm cần thiết để thao tác với database
import { db, storage } from "./firebase.js";
import { ref, push, onValue, remove, update, get, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { ref as firebaseStorageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { recordSuccessfulLogin } from "./login-log.js";

/* ========== DOM ELEMENTS ========== */
// Phần tử lịch và tiêu đề tháng
const calendarDiv = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");
const taskTable = document.getElementById("taskTable");
const taskTableContainer = document.querySelector(".task-table-scroll");
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
const descriptionInput = document.getElementById("description"); // Mô tả
const requesterInput = document.getElementById("requester"); // Người yêu cầu
const unitInput = document.getElementById("unit"); // Đơn vị thực hiện
const assigneeInput = document.getElementById("assignee"); // Phụ trách
const startDateInput = document.getElementById("taskStartDate"); // Ngày bắt đầu
const endDateInput = document.getElementById("taskEndDate"); // Ngày kết thúc
const resultInput = document.getElementById("result"); // Kết quả
const directionInput = document.getElementById("direction"); // Hướng xử lý
const completionInput = document.getElementById("completion"); // % hoàn thành
const statusInput = document.getElementById("status"); // Trạng thái công việc
const noteInput = document.getElementById("note"); // Ghi chú
const saveTaskBtn = document.getElementById("saveTaskBtn"); // Nút lưu

// Chỉ báo loading (vòng xoay chờ đợi khi xử lý async)
const loadingIndicator = document.getElementById("loadingIndicator");
const loadingMessage = document.getElementById("loadingMessage");

// Menu sidebar
const menuToggleBtn = document.getElementById("menuToggleBtn");
const menuCloseBtn = document.getElementById("menuCloseBtn");
const sideMenuPanel = document.getElementById("sideMenuPanel");
const scheduleForm = document.getElementById('scheduleForm');
const scheduleEditorModal = document.getElementById('scheduleEditorModal');
const nbItCalendar = document.getElementById('nbItCalendar');
const nbItScheduleCount = document.getElementById('nbItScheduleCount');
const nbItYearInput = document.getElementById('nbItYear');
const nbItEntryForm = document.getElementById('nbItEntryForm');
const nbItEntryIdInput = document.getElementById('nbItEntryId');
const nbItEmployeeInput = document.getElementById('nbItEmployee');
const nbItKindInput = document.getElementById('nbItKind');
const nbItLabelInput = document.getElementById('nbItLabel');
const nbItStartDateInput = document.getElementById('nbItStartDate');
const nbItEndDateInput = document.getElementById('nbItEndDate');
const nbItSaveBtn = document.getElementById('nbItSaveBtn');
const nbItAddBtn = document.getElementById('nbItAddBtn');
const nbItCancelBtn = document.getElementById('nbItCancelBtn');
const nbItDeleteBtn = document.getElementById('nbItDeleteBtn');
const nbItRefreshBtn = document.getElementById('nbItRefreshBtn');
const nbItPreviousYearBtn = document.getElementById('nbItPreviousYear');
const nbItNextYearBtn = document.getElementById('nbItNextYear');
const scheduleEditorTitle = document.getElementById('scheduleEditorTitle');
const scheduleDateInput = document.getElementById('scheduleDate');
const scheduleTimeInput = document.getElementById('scheduleTime');
const scheduleTypeInput = document.getElementById('scheduleType');
const scheduleTypeField = document.getElementById('scheduleTypeField');
const scheduleManagementTitle = document.getElementById('scheduleManagementTitle');
const scheduleListTitle = document.getElementById('scheduleListTitle');
const scheduleLocationInput = document.getElementById('scheduleLocation');
const maintenanceContentInput = document.getElementById('maintenanceContent');
const maintenanceEquipmentInput = document.getElementById('maintenanceEquipment');
const maintenanceStartDateInput = document.getElementById('maintenanceStartDate');
const maintenanceEndDateInput = document.getElementById('maintenanceEndDate');
const maintenanceDueDateInput = document.getElementById('maintenanceDueDate');
const maintenanceCycleInput = document.getElementById('maintenanceCycle');
const maintenanceResultInput = document.getElementById('maintenanceResult');
const maintenanceNoteInput = document.getElementById('maintenanceNote');
const maintenanceEvidenceInput = document.getElementById('maintenanceEvidence');
const maintenanceEvidenceCurrent = document.getElementById('maintenanceEvidenceCurrent');
const maintenanceLinkInput = document.getElementById('maintenanceLink');
const scheduleUnitInput = document.getElementById('scheduleUnit');
const scheduleAssigneeInput = document.getElementById('scheduleAssignee');
const scheduleAssigneeLabel = document.getElementById('scheduleAssigneeLabel');
const scheduleStatusInput = document.getElementById('scheduleStatus');
const scheduleNoteInput = document.getElementById('scheduleNote');
const scheduleList = document.getElementById('scheduleList');
const saveScheduleBtn = document.getElementById('saveScheduleBtn');
const cancelScheduleEditBtn = document.getElementById('cancelScheduleEditBtn');
const refreshScheduleBtn = document.getElementById('refreshScheduleBtn');
const openScheduleFormBtn = document.getElementById('openScheduleFormBtn');
const importScheduleBtn = document.getElementById('importScheduleBtn');
const exportScheduleBtn = document.getElementById('exportScheduleBtn');
const scheduleImportFile = document.getElementById('scheduleImportFile');
const uploadTaskTemplateBtn = document.getElementById('uploadTaskTemplateBtn');
const taskTemplateFile = document.getElementById('taskTemplateFile');
const taskTemplateStatus = document.getElementById('taskTemplateStatus');
const reloadTaskTemplateBtn = document.getElementById('reloadTaskTemplateBtn');
const deleteTaskTemplateBtn = document.getElementById('deleteTaskTemplateBtn');
const taskTemplatePreview = document.getElementById('taskTemplatePreview');
const taskTemplatePreviewTitle = document.getElementById('taskTemplatePreviewTitle');
const taskTemplateSheetTabs = document.getElementById('taskTemplateSheetTabs');
const taskTemplateSheetContent = document.getElementById('taskTemplateSheetContent');
const taskExportTemplateCache = new Map();
const scheduleCount = document.getElementById('scheduleCount');
const maintenanceDashboard = document.getElementById('maintenanceDashboard');
const storeVisitDashboard = document.getElementById('storeVisitDashboard');
const maintenanceDueCount = document.getElementById('maintenanceDueCount');
const maintenanceCompletedCount = document.getElementById('maintenanceCompletedCount');
const maintenanceAttentionCount = document.getElementById('maintenanceAttentionCount');
const storeVisitPendingCount = document.getElementById('storeVisitPendingCount');
const storeVisitCompletedCount = document.getElementById('storeVisitCompletedCount');
const storeVisitDelayedCount = document.getElementById('storeVisitDelayedCount');
const storeScheduleHead = document.getElementById('storeScheduleHead');
const maintenanceScheduleHead = document.getElementById('maintenanceScheduleHead');
const employeeTableContainer = document.getElementById('employeeTableContainer');
const employeesCount = document.getElementById('employeesCount');
const employeeSearch = document.getElementById('employeeSearch');
const employeeDepartmentFilter = document.getElementById('employeeDepartmentFilter');
const employeePageSizeSelect = document.getElementById('employeePageSize');
const deleteAllEmployeesBtn = document.getElementById('deleteAllEmployeesBtn');
const uploadEmployeesBtn = document.getElementById('uploadEmployeesBtn');
const employeesFileInput = document.getElementById('employeesFile');
const employeePageSummary = document.getElementById('employeePageSummary');
const employeePagination = document.getElementById('employeePagination');
const employeeEditForm = document.getElementById('employeeEditForm');
const employeeEditModal = document.getElementById('employeeEditModal');
const employeesBackBtn = document.getElementById('employeesBackBtn');

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

// ========== SEARCH & FILTER VARIABLES ==========
const searchInput = document.getElementById("searchInput");
const searchPeriod = document.getElementById("searchPeriod");
const searchDate = document.getElementById("searchDate");
const searchMonth = document.getElementById("searchMonth");
const searchYear = document.getElementById("searchYear");
const searchBtn = document.getElementById("searchBtn");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const searchFilterSection = document.getElementById("searchFilterSection");
const deleteSelectedMobileBtn = document.getElementById("deleteSelectedMobileBtn");

function syncMobileDeleteActionVisibility() {
    if (!deleteSelectedMobileBtn) return;
    deleteSelectedMobileBtn.hidden = !isAdmin() || !deleteSelect || deleteSelect.style.display === 'none';
}

// Current search state
let currentSearch = {
    search: '',
    period: 'all',
    date: null,
    month: null,
    year: null
};
let taskSearchRequestId = 0;

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
function scheduleRef(...parts) {
    const uid = getCurrentUserId();
    return ref(db, `storeMaintenanceSchedules/${uid}${parts.length ? '/' + parts.join('/') : ''}`);
}
function nbItScheduleRef(...parts) {
    const uid = getCurrentUserId();
    return ref(db, `nbItSchedules/${uid}${parts.length ? '/' + parts.join('/') : ''}`);
}
function employeesRef(...parts) {
    return ref(db, `employees${parts.length ? '/' + parts.join('/') : ''}`);
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
function jdFromDate(day, month, year) {
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    let jd = day + Math.floor((153 * m + 2) / 5) + 365 * y
        + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    if (jd < 2299161) {
        jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
    }
    return jd;
}

function getNewMoonDay(k, timeZone) {
    const t = k / 1236.85;
    const t2 = t * t;
    const t3 = t2 * t;
    const dr = Math.PI / 180;
    let jd = 2415020.75933 + 29.53058868 * k + 0.0001178 * t2 - 0.000000155 * t3;
    jd += 0.00033 * Math.sin((166.56 + 132.87 * t - 0.009173 * t2) * dr);
    const meanAnomaly = 359.2242 + 29.10535608 * k - 0.0000333 * t2 - 0.00000347 * t3;
    const moonAnomaly = 306.0253 + 385.81691806 * k + 0.0107306 * t2 + 0.00001236 * t3;
    const moonArgument = 21.2964 + 390.67050646 * k - 0.0016528 * t2 - 0.00000239 * t3;
    let correction = (0.1734 - 0.000393 * t) * Math.sin(meanAnomaly * dr)
        + 0.0021 * Math.sin(2 * meanAnomaly * dr)
        - 0.4068 * Math.sin(moonAnomaly * dr)
        + 0.0161 * Math.sin(2 * moonAnomaly * dr)
        - 0.0004 * Math.sin(3 * moonAnomaly * dr)
        + 0.0104 * Math.sin(2 * moonArgument * dr)
        - 0.0051 * Math.sin((meanAnomaly + moonAnomaly) * dr)
        - 0.0074 * Math.sin((meanAnomaly - moonAnomaly) * dr)
        + 0.0004 * Math.sin((2 * moonArgument + meanAnomaly) * dr)
        - 0.0004 * Math.sin((2 * moonArgument - meanAnomaly) * dr)
        - 0.0006 * Math.sin((2 * moonArgument + moonAnomaly) * dr)
        + 0.0010 * Math.sin((2 * moonArgument - moonAnomaly) * dr)
        + 0.0005 * Math.sin((2 * moonAnomaly + meanAnomaly) * dr);
    const deltaT = t < -11
        ? 0.001 + 0.000839 * t + 0.0002261 * t2 - 0.00000845 * t3 - 0.000000081 * t * t3
        : -0.000278 + 0.000265 * t + 0.000262 * t2;
    return Math.floor(jd + correction - deltaT + 0.5 + timeZone / 24);
}

function getSunLongitude(dayNumber, timeZone) {
    const t = (dayNumber - 2451545.5 - timeZone / 24) / 36525;
    const t2 = t * t;
    const dr = Math.PI / 180;
    const meanAnomaly = 357.52910 + 35999.05030 * t - 0.0001559 * t2 - 0.00000048 * t * t2;
    const meanLongitude = 280.46645 + 36000.76983 * t + 0.0003032 * t2;
    const longitude = meanLongitude + (1.914600 - 0.004817 * t - 0.000014 * t2) * Math.sin(dr * meanAnomaly)
        + (0.019993 - 0.000101 * t) * Math.sin(2 * dr * meanAnomaly)
        + 0.000290 * Math.sin(3 * dr * meanAnomaly);
    return Math.floor(((longitude % 360) + 360) % 360 / 30);
}

function getLunarMonth11(year, timeZone) {
    const off = jdFromDate(31, 12, year) - 2415021;
    const k = Math.floor(off / 29.530588853);
    let monthStart = getNewMoonDay(k, timeZone);
    if (getSunLongitude(monthStart, timeZone) >= 9) {
        monthStart = getNewMoonDay(k - 1, timeZone);
    }
    return monthStart;
}

function getLeapMonthOffset(monthStart, timeZone) {
    const k = Math.floor(0.5 + (monthStart - 2415021.076998695) / 29.530588853);
    let last = 0;
    let arc = getSunLongitude(getNewMoonDay(k + 1, timeZone), timeZone);
    let i = 1;
    while (arc !== last && i < 14) {
        last = arc;
        i++;
        arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
    }
    return i - 1;
}

function convertSolarToLunar(day, month, year, timeZone = 7) {
    const dayNumber = jdFromDate(day, month, year);
    let k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853);
    let monthStart = getNewMoonDay(k, timeZone);
    while (monthStart > dayNumber) {
        k--;
        monthStart = getNewMoonDay(k, timeZone);
    }
    let nextMonthStart = getNewMoonDay(k + 1, timeZone);
    while (nextMonthStart <= dayNumber) {
        k++;
        monthStart = nextMonthStart;
        nextMonthStart = getNewMoonDay(k + 1, timeZone);
    }

    let month11 = getLunarMonth11(year, timeZone);
    let nextMonth11 = month11;
    let lunarYear;
    if (month11 >= monthStart) {
        lunarYear = year;
        month11 = getLunarMonth11(year - 1, timeZone);
    } else {
        lunarYear = year + 1;
        nextMonth11 = getLunarMonth11(year + 1, timeZone);
    }

    const lunarDay = dayNumber - monthStart + 1;
    const monthDiff = Math.floor((monthStart - month11) / 29);
    let lunarMonth = monthDiff + 11;
    let isLeapMonth = false;
    if (nextMonth11 - month11 > 365) {
        const leapMonthOffset = getLeapMonthOffset(month11, timeZone);
        if (monthDiff >= leapMonthOffset) {
            lunarMonth = monthDiff + 10;
            isLeapMonth = monthDiff === leapMonthOffset;
        }
    }
    if (lunarMonth > 12) lunarMonth -= 12;
    if (lunarMonth >= 11 && monthDiff < 4) lunarYear--;

    return { day: lunarDay, month: lunarMonth, year: lunarYear, isLeapMonth };
}

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
        const lunarDate = convertSolarToLunar(d, m + 1, y);
        const lunarLabel = lunarDate.day === 1
            ? `${lunarDate.day}/${lunarDate.month}${lunarDate.isLeapMonth ? '*' : ''}`
            : String(lunarDate.day);
        div.dataset.date = ds;
        div.setAttribute("aria-label", `${d}/${m + 1}/${y}, ngày ${lunarDate.day} tháng ${lunarDate.month}${lunarDate.isLeapMonth ? ' nhuận' : ''} âm lịch`);
        div.title = `Âm lịch: ${lunarDate.day}/${lunarDate.month}/${lunarDate.year}${lunarDate.isLeapMonth ? ' (tháng nhuận)' : ''}`;
        div.innerHTML = `<span class="solar-day-number">${d}</span><span class="lunar-day-number">${lunarLabel}</span>`;
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
            if (dayEl.dataset.date === chosenDateStr) {
                selectDate(chosenDateStr, dayEl);
            }
        });
    } catch (e) { console.error(e); }
}

// Chuyển số sang chuỗi có 2 chữ số (01, 02, ...)
function pad(n) { return String(n).padStart(2, "0"); }

// ========== HỖ TRỢ NGÀY THÁNG ==========

// trả về chỉ phần ngày (2 chữ số) từ chuỗi YYYY-MM-DD hoặc DD-MM-YYYY
function formatDayOnly(ds) {
    if (!ds && ds !== 0) return ds;
    const s = String(ds).trim();
    // nếu là kiểu đầy đủ Y-M-D
    const parts = s.split("-");
    if (parts.length === 3) {
        // phần thứ 3 là ngày
        return pad(Number(parts[2]));
    }
    // nếu chỉ là số hoặc DD/MM/YYYY dạng được trước đó
    if (/^\d{1,2}$/.test(s)) {
        return pad(Number(s));
    }
    // mặc định trả về nguyên văn
    return s;
}

// ========== XUẤT XLSX ==========
// Các cột có thể xuất (theo thứ tự trình bày trong bảng)
const ALL_EXPORT_COLUMNS = ["STT", "Công việc", "Mô tả", "Người yêu cầu", "Đơn vị", "Phụ trách", "Ngày bắt đầu", "Ngày kết thúc", "Kết quả", "Hướng xử lý", "Trạng thái", "% Hoàn thành", "Ghi chú"];

function formatExportHeader(header) {
    return String(header).toUpperCase();
}

/**
 * Viết một mảng dữ liệu (array of arrays) thành file xlsx và tải xuống.
 * `header` là mảng tiêu đề cột, `rows` là mảng hàng tương ứng.
 */
// Tính toán chiều rộng cột dựa trên nội dung (số ký tự lớn nhất)
function computeColWidths(header, rows) {
    const widths = [];
    const MAX_CONTENT = 50;
    for (let c = 0; c < header.length; c++) {
        let max = header[c] ? String(header[c]).length : 0;
        for (let r = 0; r < rows.length; r++) {
            const cell = rows[r][c];
            if (cell != null) {
                const len = String(cell).length;
                if (len > max) max = len;
            }
        }
        max = Math.min(max, MAX_CONTENT);
        // thêm một chút padding
        widths[c] = max + 2;
    }
    return widths;
}

function addExportWorksheet(workbook, name, header, rows) {
    const worksheet = workbook.addWorksheet(name);
    worksheet.addRow(header.map(formatExportHeader));
    rows.forEach(row => worksheet.addRow(row));
    worksheet.columns = computeColWidths(header, rows);
    worksheet.views = [{ state: 'frozen', ySplit: 1, topLeftCell: 'A2' }];
    worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: rows.length + 1, column: header.length }
    };
    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        row.eachCell({ includeEmpty: true }, cell => {
            cell.alignment = { ...cell.alignment, wrapText: true, vertical: 'top' };
            if (rowNumber === 1) cell.font = { ...cell.font, bold: true };
        });
    });
    return worksheet;
}

const taskTemplateHeaderAliases = {
    number: ['stt', 'sothutu', 'number', 'no'],
    date: ['ngay', 'date', 'workdate', 'ngaycongviec'],
    content: ['congviec', 'task', 'taskname', 'noidungcongviec'],
    description: ['mota', 'description'],
    requester: ['nguoiyeucau', 'requester', 'requestedby'],
    unit: ['donvi', 'unit', 'department'],
    assignee: ['phutrach', 'nguoiphutrach', 'assignee', 'personincharge'],
    startDate: ['ngaybatdau', 'startdate', 'fromdate'],
    endDate: ['ngayketthuc', 'enddate', 'todate'],
    result: ['ketqua', 'result'],
    direction: ['huongxuly', 'direction', 'action'],
    status: ['trangthai', 'status'],
    completion: ['hoanthanh', 'completion', 'percentcomplete'],
    note: ['ghichu', 'note']
};

function resolveTaskTemplateField(value) {
    const header = normalizeEmployeeText(String(value ?? '')).replace(/[^a-z0-9]/g, '');
    return Object.keys(taskTemplateHeaderAliases).find(field =>
        taskTemplateHeaderAliases[field].some(alias =>
            alias.replace(/[^a-z0-9]/g, '') === header
        )
    ) || null;
}

function getTaskTemplateColumns(worksheet) {
    const headerRow = worksheet.getRow(1);
    const columns = [];
    for (let column = 1; column <= headerRow.cellCount; column++) {
        const field = resolveTaskTemplateField(headerRow.getCell(column).text);
        if (field) columns.push({ column, field });
    }
    if (!columns.length) {
        throw new Error('Mẫu Excel cần có tiêu đề cột công việc ở dòng đầu tiên.');
    }
    return columns;
}

async function loadTaskExportTemplateBytes() {
    if (taskExportTemplateCache.has('task')) return taskExportTemplateCache.get('task');
    const templatePromise = (async () => {
        const snapshot = await withTaskTemplateTimeout(
            get(ref(db, 'taskExportTemplates/task')),
            'Hết thời gian chờ đọc file mẫu từ cơ sở dữ liệu.'
        );
        if (!snapshot.exists()) return null;
        const savedTemplate = snapshot.val();
        if (!savedTemplate || typeof savedTemplate.data !== 'string') {
            throw new Error('Dữ liệu file mẫu đã lưu không hợp lệ.');
        }
        return base64ToArrayBuffer(savedTemplate.data);
    })();
    taskExportTemplateCache.set('task', templatePromise);
    try {
        return await templatePromise;
    } catch (error) {
        taskExportTemplateCache.delete('task');
        throw error;
    }
}

function withTaskTemplateTimeout(operation, message) {
    let timeoutId;
    return Promise.race([
        operation,
        new Promise((_, reject) => {
            timeoutId = setTimeout(() => reject(new Error(message)), 20000);
        })
    ]).finally(() => clearTimeout(timeoutId));
}

function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    let binary = '';
    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
    }
    return btoa(binary);
}

function base64ToArrayBuffer(value) {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index++) {
        bytes[index] = binary.charCodeAt(index);
    }
    return bytes.buffer;
}

async function refreshTaskTemplateStatus(forceReload = false) {
    if (!taskTemplateStatus) return;
    if (forceReload) taskExportTemplateCache.delete('task');
    taskTemplateStatus.textContent = 'Đang kiểm tra file mẫu đã lưu...';
    try {
        const bytes = await loadTaskExportTemplateBytes();
        if (!bytes) {
            taskTemplateStatus.textContent = 'Chưa có file mẫu. Hãy tải mẫu Excel lên trước khi xuất Công việc.';
            clearTaskTemplatePreview();
            return;
        }
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(bytes.slice(0));
        if (!workbook.worksheets.length) throw new Error('File mẫu không có sheet.');
        taskTemplateStatus.textContent = `Đã có file mẫu trên hệ thống (${workbook.worksheets.length} sheet); có thể xuất Công việc.`;
        renderTaskTemplatePreview(workbook);
    } catch (error) {
        console.error('Lỗi kiểm tra file mẫu Công việc:', error);
        taskTemplateStatus.textContent = `Không kiểm tra được file mẫu: ${error?.message || String(error)}`;
        clearTaskTemplatePreview();
    }
}

async function deleteTaskExportTemplate() {
    if (!isAdmin()) throw new Error('Bạn không có quyền xóa file mẫu.');
    await withTaskTemplateTimeout(
        remove(ref(db, 'taskExportTemplates/task')),
        'Hết thời gian chờ xóa file mẫu. Vui lòng kiểm tra kết nối hoặc quyền ghi cơ sở dữ liệu.'
    );
    taskExportTemplateCache.delete('task');
    clearTaskTemplatePreview();
}

function clearTaskTemplatePreview() {
    if (taskTemplatePreview) taskTemplatePreview.hidden = true;
    if (taskTemplatePreviewTitle) taskTemplatePreviewTitle.textContent = '';
    if (taskTemplateSheetTabs) taskTemplateSheetTabs.replaceChildren();
    if (taskTemplateSheetContent) taskTemplateSheetContent.replaceChildren();
}

function formatTemplateDate(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

function getTemplateCellText(cell, worksheet, workbook) {
    const value = cell.value;
    if (value && typeof value === 'object' && 'formula' in value) {
        const formula = String(value.formula).replace(/^=/, '');
        const countIfMatch = formula.match(/^COUNTIF\(\s*(?:'((?:[^']|'')+)'|([^!]+))!\$?([A-Z]+)\$?(\d+):\$?([A-Z]+)\$?(\d+)\s*,\s*\$?([A-Z]+)\$?(\d+)\s*\)$/i);
        if (countIfMatch && workbook) {
            const sourceSheetName = (countIfMatch[1] || countIfMatch[2]).replace(/''/g, "'");
            const sourceWorksheet = workbook.getWorksheet(sourceSheetName);
            const columnNumber = letters => [...letters.toUpperCase()].reduce((number, letter) =>
                number * 26 + letter.charCodeAt(0) - 64, 0);
            if (sourceWorksheet) {
                const startColumn = columnNumber(countIfMatch[3]);
                const startRow = Number(countIfMatch[4]);
                const endColumn = columnNumber(countIfMatch[5]);
                const endRow = Number(countIfMatch[6]);
                const criteria = worksheet.getCell(`${countIfMatch[7]}${countIfMatch[8]}`).value;
                const criteriaValue = criteria && typeof criteria === 'object' && 'result' in criteria
                    ? criteria.result
                    : criteria;
                const normalizedCriteria = String(criteriaValue ?? '').toLocaleLowerCase();
                let count = 0;
                for (let row = startRow; row <= endRow; row++) {
                    for (let column = startColumn; column <= endColumn; column++) {
                        const sourceValue = sourceWorksheet.getCell(row, column).value;
                        const comparableValue = sourceValue && typeof sourceValue === 'object' && 'result' in sourceValue
                            ? sourceValue.result
                            : sourceValue;
                        if (String(comparableValue ?? '').toLocaleLowerCase() === normalizedCriteria) count++;
                    }
                }
                return String(count);
            }
        }
        const formattedResultDate = formatTemplateDate(value.result);
        if (formattedResultDate) return formattedResultDate;
        if (value.result !== undefined && value.result !== null) return String(value.result);
        return `=${value.formula}`;
    }
    const formattedDate = formatTemplateDate(value);
    if (formattedDate) return formattedDate;
    if (typeof cell.text === 'string' && cell.text !== '') return cell.text;
    if (value && typeof value === 'object' && 'text' in value) return String(value.text ?? '');
    return value === null || value === undefined ? '' : String(value);
}

function renderTaskTemplatePreview(workbook) {
    if (!taskTemplatePreview || !taskTemplateSheetTabs || !taskTemplateSheetContent) return;
    taskTemplatePreview.hidden = false;
    taskTemplatePreviewTitle.textContent = `NỘI DUNG FILE MẪU (${workbook.worksheets.length} SHEET)`;
    taskTemplateSheetTabs.replaceChildren();
    taskTemplateSheetContent.replaceChildren();

    workbook.worksheets.forEach((worksheet, sheetIndex) => {
        const tab = document.createElement('button');
        tab.type = 'button';
        tab.className = 'task-template-sheet-tab';
        tab.id = `taskTemplateSheetTab${sheetIndex}`;
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-controls', 'taskTemplateSheetContent');
        tab.textContent = worksheet.name;
        tab.addEventListener('click', () => {
            taskTemplateSheetTabs.querySelectorAll('[role="tab"]').forEach(existingTab => {
                existingTab.setAttribute('aria-selected', String(existingTab === tab));
            });
            renderTaskTemplateSheet(worksheet, workbook);
        });
        taskTemplateSheetTabs.appendChild(tab);
    });

    taskTemplateSheetTabs.firstElementChild?.setAttribute('aria-selected', 'true');
    renderTaskTemplateSheet(workbook.worksheets[0], workbook);
}

function renderTaskTemplateSheet(worksheet, workbook) {
    if (!taskTemplateSheetContent) return;
    taskTemplateSheetContent.replaceChildren();

    let lastRow = 0;
    let lastColumn = 0;
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        row.eachCell({ includeEmpty: false }, (cell, columnNumber) => {
            if (getTemplateCellText(cell, worksheet, workbook).trim()) {
                lastRow = Math.max(lastRow, rowNumber);
                lastColumn = Math.max(lastColumn, columnNumber);
            }
        });
    });

    if (!lastRow || !lastColumn) {
        const emptyMessage = document.createElement('p');
        emptyMessage.className = 'task-template-empty';
        emptyMessage.textContent = 'Sheet này chưa có nội dung.';
        taskTemplateSheetContent.appendChild(emptyMessage);
        return;
    }

    const tableWrap = document.createElement('div');
    tableWrap.className = 'task-template-table-wrap';
    const table = document.createElement('table');
    table.className = 'task-template-table';
    const tbody = document.createElement('tbody');
    const headers = Array.from({ length: lastColumn }, (_, index) => {
        const text = getTemplateCellText(worksheet.getRow(1).getCell(index + 1), worksheet, workbook).trim();
        return {
            label: text || `Cột ${index + 1}`,
            field: resolveTaskTemplateField(text)
        };
    });
    for (let rowNumber = 1; rowNumber <= lastRow; rowNumber++) {
        const rowElement = document.createElement('tr');
        const sourceRow = worksheet.getRow(rowNumber);
        for (let columnNumber = 1; columnNumber <= lastColumn; columnNumber++) {
            const cell = document.createElement(rowNumber === 1 ? 'th' : 'td');
            if (rowNumber === 1) cell.scope = 'col';
            cell.textContent = getTemplateCellText(sourceRow.getCell(columnNumber), worksheet, workbook);
            rowElement.appendChild(cell);
        }
        tbody.appendChild(rowElement);
    }
    table.appendChild(tbody);
    tableWrap.appendChild(table);
    taskTemplateSheetContent.appendChild(tableWrap);

    const cards = document.createElement('div');
    cards.className = 'task-template-mobile-cards';
    cards.setAttribute('aria-label', `Nội dung sheet ${worksheet.name}`);
    for (let rowNumber = 2; rowNumber <= lastRow; rowNumber++) {
        const values = headers.map((_, index) =>
            getTemplateCellText(worksheet.getRow(rowNumber).getCell(index + 1), worksheet, workbook).trim()
        );
        if (!values.some(Boolean)) continue;

        let titleIndex = headers.findIndex((header, index) => header.field === 'content' && values[index]);
        if (titleIndex === -1) {
            titleIndex = headers.findIndex((header, index) =>
                values[index] && header.field !== 'number' && header.field !== 'date' && header.field !== 'startDate'
            );
        }
        if (titleIndex === -1) titleIndex = values.findIndex(Boolean);

        const card = document.createElement('article');
        card.className = 'task-template-mobile-card';
        const heading = document.createElement('div');
        heading.className = 'task-template-mobile-card-heading';

        const numberIndex = headers.findIndex((header, index) => header.field === 'number' && values[index]);
        if (numberIndex !== -1) {
            const number = document.createElement('span');
            number.className = 'task-template-mobile-card-number';
            number.textContent = `${headers[numberIndex].label}: ${values[numberIndex]}`;
            heading.appendChild(number);
        }
        const dateIndex = headers.findIndex((header, index) =>
            (header.field === 'date' || header.field === 'startDate') && values[index]
        );
        if (dateIndex !== -1) {
            const date = document.createElement('span');
            date.className = 'task-template-mobile-card-date';
            date.textContent = values[dateIndex];
            heading.appendChild(date);
        }

        const title = document.createElement('h5');
        title.className = 'task-template-mobile-card-title';
        title.textContent = values[titleIndex];
        card.append(heading, title);

        const details = document.createElement('details');
        details.className = 'task-template-mobile-card-more';
        const summary = document.createElement('summary');
        const detailList = document.createElement('dl');
        detailList.className = 'task-template-mobile-card-details';
        values.forEach((value, index) => {
            if (!value || index === titleIndex || index === numberIndex || index === dateIndex) return;
            const item = document.createElement('div');
            const label = document.createElement('dt');
            label.textContent = headers[index].label;
            const detailValue = document.createElement('dd');
            detailValue.textContent = value;
            item.append(label, detailValue);
            detailList.appendChild(item);
        });
        if (detailList.childElementCount) {
            summary.textContent = `Xem chi tiết (${detailList.childElementCount})`;
            details.append(summary, detailList);
            card.appendChild(details);
        }
        cards.appendChild(card);
    }
    tableWrap.after(cards);
}

async function loadTaskExportTemplate() {
    const bytes = await loadTaskExportTemplateBytes();
    if (!bytes) return null;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(bytes.slice(0));
    const worksheet = workbook.worksheets[0];
    if (!worksheet) throw new Error('Mẫu Excel không có trang tính.');
    return { workbook, worksheet, columns: getTaskTemplateColumns(worksheet) };
}

async function uploadTaskExportTemplate(file) {
    if (!isAdmin()) throw new Error('Bạn không có quyền tải mẫu xuất lên.');
    if (!file || !/\.xlsx$/i.test(file.name)) throw new Error('Mẫu xuất phải là tệp Excel định dạng .xlsx.');
    if (file.size > 5 * 1024 * 1024) throw new Error('Mẫu Excel không được vượt quá 5 MB.');
    showLoading('Đang kiểm tra file mẫu Excel...');
    await new Promise(resolve => requestAnimationFrame(resolve));
    const bytes = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(bytes.slice(0));
    const worksheet = workbook.worksheets[0];
    if (!worksheet) throw new Error('Mẫu Excel không có trang tính.');
    getTaskTemplateColumns(worksheet);
    showLoading('Đang lưu file mẫu lên hệ thống...');
    await withTaskTemplateTimeout(
        set(ref(db, 'taskExportTemplates/task'), {
            fileName: file.name,
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            data: arrayBufferToBase64(bytes),
            updatedAt: Date.now()
        }),
        'Hết thời gian chờ lưu file mẫu. Vui lòng kiểm tra kết nối hoặc quyền ghi cơ sở dữ liệu.'
    );
    taskExportTemplateCache.set('task', Promise.resolve(bytes));
}

function applyTaskRowsToTemplate(template, headers, rows) {
    const { worksheet, columns } = template;
    const headerRow = worksheet.getRow(1);
    const outputIndexes = new Map();
    headers.forEach((header, index) => {
        const field = resolveTaskTemplateField(header);
        if (field) outputIndexes.set(field, index);
    });
    const missingHeaders = headers.filter(header => {
        const field = resolveTaskTemplateField(header);
        return field && !columns.some(column => column.field === field);
    });
    if (missingHeaders.length) {
        throw new Error(`Mẫu Excel thiếu cột: ${missingHeaders.join(', ')}.`);
    }

    for (let column = 1; column <= headerRow.cellCount; column++) {
        const cell = headerRow.getCell(column);
        if (cell.value !== null && cell.value !== undefined && String(cell.text).trim()) {
            cell.value = String(cell.text).toLocaleUpperCase('vi');
            cell.font = { ...cell.font, bold: true };
            cell.alignment = { ...cell.alignment, wrapText: true, vertical: 'top' };
        }
    }
    const templateDataRow = worksheet.getRow(2);
    const templateRowHeight = templateDataRow.height;
    const templateStyles = [];
    for (let column = 1; column <= headerRow.cellCount; column++) {
        templateStyles[column] = JSON.parse(JSON.stringify(templateDataRow.getCell(column).style || {}));
    }
    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        worksheet.getRow(rowNumber).eachCell({ includeEmpty: true }, cell => { cell.value = null; });
    }

    rows.forEach((values, index) => {
        const row = worksheet.getRow(index + 2);
        if (templateRowHeight) row.height = templateRowHeight;
        for (let column = 1; column <= headerRow.cellCount; column++) {
            row.getCell(column).style = JSON.parse(JSON.stringify(templateStyles[column] || {}));
        }
        columns.forEach(({ column, field }) => {
            const outputIndex = outputIndexes.get(field);
            row.getCell(column).value = outputIndex === undefined ? '' : (values[outputIndex] ?? '');
        });
        row.eachCell({ includeEmpty: true }, cell => {
            cell.alignment = { ...cell.alignment, wrapText: true, vertical: 'top' };
            cell.font = { ...cell.font, bold: false };
        });
    });

    worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: rows.length + 1, column: headerRow.cellCount }
    };
    worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1, topLeftCell: 'A2' }];
}

async function createTaskExportWorkbook(header, rows, options = {}) {
    const template = await loadTaskExportTemplate();
    if (!template) {
        throw new Error('Chưa có file mẫu xuất Công việc. Vui lòng vào mục “Mẫu” và tải file mẫu lên trước.');
    }

    const worksheet = template.worksheet;
    applyTaskRowsToTemplate(template, header, rows);
    configureTaskExportSheets(template.workbook, worksheet, options);
    return { workbook: template.workbook, worksheet };
}

function configureTaskExportSheets(workbook, mainWorksheet, options) {
    const reportType = options.reportType || 'day';
    let mainSheetName;
    let planSheetName = '';
    let summarySheet = null;
    let planSheet = null;

    if (reportType === 'week' || reportType === 'month') {
        summarySheet = workbook.worksheets.find(worksheet =>
            normalizeEmployeeText(worksheet.name).replace(/[^a-z0-9]/g, '') === 'tonghop'
        );
        planSheet = workbook.worksheets.find(worksheet =>
            normalizeEmployeeText(worksheet.name).replace(/[^a-z0-9]/g, '').includes('kehoach')
        );
        if (!summarySheet || !planSheet || summarySheet === mainWorksheet || planSheet === mainWorksheet || planSheet === summarySheet) {
            throw new Error('Mẫu tuần/tháng cần có 3 sheet riêng: Báo cáo, Kế hoạch và Tổng hợp.');
        }
        mainSheetName = reportType === 'week' ? 'Báo cáo tuần' : 'Báo cáo tháng';
        planSheetName = reportType === 'week' ? 'Kế hoạch tuần tới' : 'Kế hoạch tháng tới';
    } else if (reportType === 'range') {
        mainSheetName = `BC từ ${formatDisplayDate(options.startDate)} đến ${formatDisplayDate(options.endDate)}`;
    } else {
        mainSheetName = `Báo cáo ngày ${formatDisplayDate(options.startDate || selectedDate)}`;
    }
    mainSheetName = mainSheetName.replace(/[\\/*?:[\]]/g, '-').slice(0, 31);

    const retainedSheets = reportType === 'week' || reportType === 'month'
        ? [mainWorksheet, planSheet, summarySheet]
        : [mainWorksheet];
    workbook.worksheets.slice().forEach(worksheet => {
        if (!retainedSheets.includes(worksheet)) workbook.removeWorksheet(worksheet.id);
    });

    retainedSheets.forEach((worksheet, index) => {
        worksheet.name = `__export_${index + 1}__`;
    });
    mainWorksheet.name = mainSheetName;
    if (planSheet) planSheet.name = planSheetName;
    if (summarySheet) summarySheet.name = 'Tổng hợp';
}

async function downloadTaskWorkbook(workbook, filename) {
    const buffer = await workbook.xlsx.writeBuffer();
    const file = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function writeDataToXLSX(header, rows, options = {}) {
    const { workbook } = await createTaskExportWorkbook(header, rows, options);
    const now = new Date();
    const filename = `tasks_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}.xlsx`;
    await downloadTaskWorkbook(workbook, filename);
}

// ==== IMPORT XLSX FUNCTIONS ====
// Nhận 1 chuỗi ngày từ sheet name hoặc cell, cố parse thành YYYY-MM-DD hoặc chỉ ngày (DD)
function normalizeDateString(s) {
    if (!s && s !== 0) return null;
    s = String(s).trim();
    // ngày chỉ gồm 1-2 chữ số
    const dayOnlyMatch = s.match(/^(\d{1,2})$/);
    if (dayOnlyMatch) {
        return pad(Number(dayOnlyMatch[1]));
    }
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

function isValidYmd(dateStr) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr || '')) return false;
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day;
}

function inferUniqueDayInRange(day, startDate, endDate) {
    if (!isValidYmd(startDate) || !isValidYmd(endDate) || startDate > endDate) return null;
    const candidates = [];
    const cursor = parseYMD(`${startDate.slice(0, 7)}-01`);
    const rangeLast = parseYMD(endDate);
    while (cursor <= rangeLast) {
        const candidate = `${toYMDLocal(cursor).slice(0, 7)}-${day}`;
        if (isValidYmd(candidate) && candidate >= startDate && candidate <= endDate) {
            candidates.push(candidate);
        }
        cursor.setMonth(cursor.getMonth() + 1);
    }
    return candidates.length === 1 ? candidates[0] : null;
}

// Parse date from sheet name like '24-02-2026' or '2026-02-24'
function parseDateFromSheetName(name) {
    if (!name) return null;
    const n = name.trim();
    // normalize will now also handle day-only strings
    const d = normalizeDateString(n);
    return d;
}

// Import workbook (ArrayBuffer) and push tasks to Firebase
async function importWorkbookArrayBuffer(ab, filename, importType, importValue) {
    if (!isAdmin()) { await showCustomAlert('Chỉ admin mới có quyền nhập công việc'); return; }
    showLoading();
    try {
        const wb = XLSX.read(ab, { type: 'array' });
        let total = 0;
        let skipped = 0;
        const range = importType === 'range' && importValue
            ? importValue.split('|')
            : null;
        const rangeStart = range && range.length === 2 ? range[0] : null;
        const rangeEnd = range && range.length === 2 ? range[1] : null;
        if (importType === 'range' &&
            (!isValidYmd(rangeStart) || !isValidYmd(rangeEnd) || rangeStart > rangeEnd)) {
            throw new Error('Khoảng ngày nhập không hợp lệ.');
        }
        // iterate sheets
        for (const sheetName of wb.SheetNames) {
            const ws = wb.Sheets[sheetName];
            // get rows as arrays
            const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
            if (!aoa || aoa.length < 2) continue; // no data
            const header = aoa[0].map(h => String(h).trim().toLowerCase());
            const idxMap = {};
            header.forEach((h, i) => { idxMap[h] = i; });

            // determine date for this sheet if possible (could be full or just day)
            let sheetDate = parseDateFromSheetName(sheetName);
            // if not parseable and only one sheet, try infer from filename (tasks_YYYYMMDD)
            if (!sheetDate && wb.SheetNames.length === 1 && filename) {
                const m = filename.match(/(\d{4})(\d{2})(\d{2})/);
                if (m) sheetDate = `${m[1]}-${m[2]}-${m[3]}`;
            }

            // If importType defines a default date (week/month) and no per-row date,
            // use importValue to compute a default date for rows without 'Ngày'
            let importDefaultDate = null;
            if ((!sheetDate || /^\d{1,2}$/.test(sheetDate)) && importType) {
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
                }
            }

            for (let r = 1; r < aoa.length; r++) {
                const row = aoa[r];
                // skip empty rows
                if (!row || row.every(c => (c === null || c === undefined || String(c).trim() === ''))) continue;
                // determine date for this row: prefer 'Ngày' column
                let dateVal = null;
                if (idxMap['ngày'] !== undefined) {
                    const normalizedDate = normalizeDateString(row[idxMap['ngày']]);
                    if (normalizedDate && !/^\d{2}$/.test(normalizedDate)) dateVal = normalizedDate;
                }
                // nếu vẫn chưa có ngày và giá trị cột/ngày sheet chỉ có ngày, cố ghép với tháng/năm từ context
                if (!dateVal) {
                    const rawCell = row[idxMap['ngày']];
                    const cellTrim = String(rawCell || '').trim();
                    const sheetTrim = String(sheetDate || '').trim();
                    // ngày chỉ gồm 1-2 chữ số trong cell hoặc sheet name
                    let dayOnly = null;
                    if (/^\d{1,2}$/.test(cellTrim)) dayOnly = pad(Number(cellTrim));
                    else if (/^\d{1,2}$/.test(sheetTrim)) dayOnly = pad(Number(sheetTrim));
                    if (dayOnly) {
                        const hasFullSheetDate = /^\d{4}-\d{2}-\d{2}$/.test(sheetDate || '');
                        if (rangeStart && !hasFullSheetDate && !importDefaultDate) {
                            dateVal = inferUniqueDayInRange(dayOnly, rangeStart, rangeEnd);
                        } else {
                            // xác định tháng/năm từ giá trị khả thi
                            let base = null;
                            if (hasFullSheetDate) base = sheetDate;
                            else if (importDefaultDate && /^\d{4}-\d{2}-\d{2}$/.test(importDefaultDate)) base = importDefaultDate;
                            else {
                                // try infer month/year from filename if possible (e.g. tasks_20260205.xlsx)
                                if (filename) {
                                    const m2 = filename.match(/(\d{4})(\d{2})/);
                                    if (m2) {
                                        base = `${m2[1]}-${m2[2]}-01`;
                                    }
                                }
                                if (!base) {
                                    const now = new Date();
                                    base = toYMDLocal(now);
                                }
                            }
                            const [yy, mm] = base.split('-');
                            dateVal = `${yy}-${mm}-${dayOnly}`;
                        }
                    }
                }
                if (!dateVal && importDefaultDate) dateVal = importDefaultDate;
                if (!dateVal && sheetDate) dateVal = sheetDate;
                if (!dateVal && importDefaultDate) dateVal = importDefaultDate;
                if (!dateVal) {
                    skipped++;
                    continue;
                }
                if (!isValidYmd(dateVal) ||
                    (rangeStart && (dateVal < rangeStart || dateVal > rangeEnd))) {
                    skipped++;
                    continue;
                }

                const task = {
                        content: '', description: '', requester: '', unit: '', assignee: '', startDate: '', endDate: '', result: '', direction: '', completion: '', status: '', note: '', taskDate: dateVal
                };
                if (idxMap['công việc'] !== undefined) task.content = String(row[idxMap['công việc']] || '').trim();
                if (idxMap['mô tả'] !== undefined) task.description = String(row[idxMap['mô tả']] || '').trim();
                if (idxMap['người yêu cầu'] !== undefined) task.requester = String(row[idxMap['người yêu cầu']] || '').trim();
                if (idxMap['đơn vị'] !== undefined) task.unit = String(row[idxMap['đơn vị']] || '').trim();
                if (idxMap['phụ trách'] !== undefined) task.assignee = String(row[idxMap['phụ trách']] || '').trim();
                if (idxMap['ngày bắt đầu'] !== undefined) task.startDate = normalizeDateString(row[idxMap['ngày bắt đầu']]);
                if (idxMap['ngày kết thúc'] !== undefined) task.endDate = normalizeDateString(row[idxMap['ngày kết thúc']]);
                if (idxMap['kết quả'] !== undefined) task.result = String(row[idxMap['kết quả']] || '').trim();
                if (idxMap['hướng xử lý'] !== undefined) task.direction = String(row[idxMap['hướng xử lý']] || '').trim();
                if (idxMap['trạng thái'] !== undefined) task.status = String(row[idxMap['trạng thái']] || '').trim();
                if (idxMap['% hoàn thành'] !== undefined) task.completion = String(row[idxMap['% hoàn thành']] || '').trim();
                if (idxMap['ghi chú'] !== undefined) task.note = String(row[idxMap['ghi chú']] || '').trim();

                // push to firebase
                const [y, m] = dateVal.split('-');
                const w = getWeekNumber(dateVal);
                await push(tasksRef(y, m, w, dateVal), task);
                total++;
            }
        }
        hideLoading();
        const skippedMessage = skipped ? `, bỏ qua ${skipped} dòng không có ngày hợp lệ/trong phạm vi` : '';
        await showCustomAlert(`✅ Đã nhập ${total} công việc từ file${skippedMessage}`);
    } catch (e) {
        hideLoading();
        console.error(e);
        await showCustomAlert(`❌ Lỗi khi nhập file: ${e && e.message ? e.message : String(e)}`);
    }
}

// Handler cho nút import
if (document.getElementById('importConfirmBtn')) {
    document.getElementById('importConfirmBtn').onclick = async () => {
        if (!isAdmin()) { await showCustomAlert('Chỉ admin mới có quyền nhập công việc'); return; }
        const fi = document.getElementById('importFile');
        if (!fi || !fi.files || fi.files.length === 0) { await showCustomAlert('Vui lòng chọn file .xlsx'); return; }
        const importTypeEl = document.getElementById('importType');
        const importType = importTypeEl ? importTypeEl.value : 'auto';

        // build importValue according to type
        let importValue = '';
        if (importType === 'week') {
            const sel = document.getElementById('importWeekSelect');
            if (!sel || !sel.value) { await showCustomAlert('Vui lòng chọn tuần để import!'); return; }
            importValue = sel.value; // format: YYYY|MM|weekN
        } else if (importType === 'month') {
            const mp = document.getElementById('importMonthPicker');
            if (!mp || !mp.value) { await showCustomAlert('Vui lòng chọn tháng để import!'); return; }
            importValue = mp.value; // format: YYYY-MM
        } else if (importType === 'range') {
            const s = document.getElementById('importRangeStart').value;
            const e = document.getElementById('importRangeEnd').value;
            if (!s || !e) { await showCustomAlert('Vui lòng chọn cả ngày bắt đầu và kết thúc cho import range!'); return; }
            if (s > e) { await showCustomAlert('Ngày bắt đầu phải trước hoặc bằng ngày kết thúc!'); return; }
            importValue = `${s}|${e}`; // START|END
        }

        const f = fi.files[0];
        const reader = new FileReader();
        reader.onload = async (ev) => {
            const ab = ev.target.result;
            await importWorkbookArrayBuffer(ab, f.name, importType, importValue);
        };
        reader.onerror = async () => {
            console.error('Không đọc được file import:', reader.error);
            await showCustomAlert('Không thể đọc file đã chọn. Vui lòng thử lại.');
        };
        reader.readAsArrayBuffer(f);
    };
}

// (Optional) Preview button - just shows a quick summary of sheets and rows
if (document.getElementById('importPreviewBtn')) {
    document.getElementById('importPreviewBtn').onclick = async () => {
        const fi = document.getElementById('importFile');
        if (!fi || !fi.files || fi.files.length === 0) { await showCustomAlert('Vui lòng chọn file .xlsx'); return; }
        const f = fi.files[0];
        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                const ab = ev.target.result;
                const wb = XLSX.read(ab, { type: 'array' });
                let msg = '';
                wb.SheetNames.forEach(sn => {
                    const ws = wb.Sheets[sn];
                    const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
                    msg += `${sn}: ${Math.max(0, aoa.length - 1)} dòng` + '\n';
                });
                await showCustomAlert(msg.replace(/\n/g, '<br>'));
            } catch (e) {
                console.error('Không thể xem trước file import:', e);
                await showCustomAlert(`Không thể xem trước file này: ${e && e.message ? e.message : String(e)}`);
            }
        };
        reader.onerror = async () => {
            console.error('Không đọc được file xem trước:', reader.error);
            await showCustomAlert('Không thể đọc file đã chọn. Vui lòng thử lại.');
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
async function exportTasksForDay() {
    const selectedCols = getSelectedColumns();
    if (selectedCols.length === 0) {
        await showCustomAlert('Vui lòng chọn ít nhất một cột để xuất.');
        return;
    }
    const rows = [];
    document.querySelectorAll('#taskTable tr').forEach(tr => {
        const cells = tr.querySelectorAll('td');
        if (!cells || cells.length < 4) return;
        const cellValue = cell => {
            if (!cell) return '';
            const select = cell.querySelector('select');
            return select ? select.value : cell.innerText.replace(/\r?\n/g, ' ').trim();
        };
        const rowValues = {
            'STT': cellValue(cells[1]),
            'Công việc': cellValue(cells[2]),
            'Mô tả': cellValue(cells[3]),
            'Người yêu cầu': cellValue(cells[4]),
            'Đơn vị': cellValue(cells[5]),
            'Phụ trách': cellValue(cells[6]),
            'Ngày bắt đầu': cellValue(cells[7]),
            'Ngày kết thúc': cellValue(cells[8]),
            'Kết quả': cellValue(cells[9]),
            'Hướng xử lý': cellValue(cells[10]),
            'Trạng thái': cellValue(cells[11]),
            '% Hoàn thành': cellValue(cells[12]),
            'Ghi chú': cellValue(cells[13])
        };
        rows.push(selectedCols.map(column => rowValues[column] || ''));
    });
    if (rows.length === 0) {
        await showCustomAlert('Không có công việc để xuất.');
        return;
    }
    // Thêm cột "Ngày" để có thể import lại
    const header = ['Ngày', ...selectedCols];
    const formattedDate = formatDisplayDate(selectedDate).replace(/-/g, '/');
    const newRows = rows.map(row => [formattedDate, ...row]);
    await writeDataToXLSX(header, newRows, { reportType: 'day', startDate: selectedDate });
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

async function exportTasksForCollection(taskList, includeDate, options) {
    const selectedCols = getSelectedColumns();
    if (selectedCols.length === 0) {
        await showCustomAlert('Vui lòng chọn ít nhất một cột để xuất.');
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
        if (includeDate) row.push(formatDisplayDate(date).replace(/-/g, '/'));
        for (const c of selectedCols) {
            if (c === 'STT') continue;
            const map = {
                'Công việc': task.content || '',
                'Mô tả': task.description || '',
                'Người yêu cầu': task.requester || '',
                'Đơn vị': task.unit || '',
                'Phụ trách': task.assignee || '',
                'Ngày bắt đầu': task.startDate || '',
                'Ngày kết thúc': task.endDate || '',
                'Kết quả': task.result || '',
                'Hướng xử lý': task.direction || '',
                'Trạng thái': task.status || '',
                '% Hoàn thành': task.completion || '',
                'Ghi chú': task.note || ''
            };
            row.push(map[c] || '');
        }
        rows.push(row);
    }
    if (rows.length === 0) {
        await showCustomAlert('Không có công việc để xuất.');
        return;
    }
    const taskWorkbook = await createTaskExportWorkbook(header, rows, options);
    const exportWorkbook = taskWorkbook.workbook;
    const actualMainSheetName = taskWorkbook.worksheet.name;
    if (options.reportType === 'week' || options.reportType === 'month') {
        const summarySheet = exportWorkbook.worksheets.find(worksheet =>
            normalizeEmployeeText(worksheet.name).replace(/[^a-z0-9]/g, '') === 'tonghop'
        );
        if (!summarySheet) {
            throw new Error('File mẫu xuất báo cáo cần có sheet Tổng hợp.');
        }

        const summaryRows = new Map();
        summarySheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            const label = normalizeEmployeeText(String(row.getCell(1).text || '')).replace(/[^a-z0-9]/g, '');
            if (label) summaryRows.set(label, rowNumber);
        });
        const summaryDefinitions = [
            { label: 'Tổng số công việc', key: 'tongsocongviec', formula: 'total' },
            { label: 'Hoàn thành', key: 'hoanthanh', formula: 'status' },
            { label: 'Đang thực hiện', key: 'dangthuchien', formula: 'status' },
            { label: 'Chưa bắt đầu', key: 'chuabatdau', formula: 'status' },
            { label: 'Chậm tiến độ', key: 'chamtiendo', formula: 'status' }
        ];
        const quotedMainSheetName = `'${actualMainSheetName.replace(/'/g, "''")}'`;
        const contentColumn = getTaskExportColumnLetter(taskWorkbook.worksheet, 'content');
        const statusColumn = getTaskExportColumnLetter(taskWorkbook.worksheet, 'status');
        const lastDataRow = rows.length + 1;
        for (const definition of summaryDefinitions) {
            const summaryRowNumber = summaryRows.get(definition.key);
            if (summaryRowNumber === undefined) {
                throw new Error(`Sheet Tổng hợp trong file mẫu thiếu dòng "${definition.label}".`);
            }
            const formula = definition.formula === 'total'
                ? contentColumn ? `COUNTA(${quotedMainSheetName}!${contentColumn}2:${contentColumn}${lastDataRow})` : '0'
                : statusColumn ? `COUNTIF(${quotedMainSheetName}!${statusColumn}2:${statusColumn}${lastDataRow},A${summaryRowNumber})` : '0';
            const cell = summarySheet.getCell(summaryRowNumber, 2);
            cell.value = { formula };
            cell.alignment = { ...cell.alignment, wrapText: true, vertical: 'top' };
        }
    }

    const now = new Date();
    const filename = `tasks_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}.xlsx`;
    await downloadTaskWorkbook(exportWorkbook, filename);
}

function getTaskExportColumnLetter(worksheet, field) {
    const headerRow = worksheet.getRow(1);
    for (let column = 1; column <= headerRow.cellCount; column++) {
        if (resolveTaskTemplateField(headerRow.getCell(column).text) !== field) continue;
        let remainder = column;
        let letter = '';
        while (remainder > 0) {
            const digit = (remainder - 1) % 26;
            letter = String.fromCharCode(65 + digit) + letter;
            remainder = Math.floor((remainder - 1) / 26);
        }
        return letter;
    }
    return null;
}

// Hàm chính gọi theo loại
async function performExport(type) {
    showLoading();
    try {
        if (type === 'day') {
            await exportTasksForDay();
        } else if (type === 'week') {
            const sel = document.getElementById('exportWeekSelect');
            if (!sel || !sel.value) { await showCustomAlert('Vui lòng chọn tuần!'); return; }
            const [y, m, w] = sel.value.split('|');
            const tasks = await fetchTasksForWeek(y, m, w);
            await exportTasksForCollection(tasks, true, { reportType: 'week' });
        } else if (type === 'month') {
            const mp = document.getElementById('exportMonthPicker');
            if (!mp || !mp.value) { await showCustomAlert('Vui lòng chọn tháng!'); return; }
            const [y, m] = mp.value.split('-');
            const tasks = await fetchTasksForMonth(y, m);
            await exportTasksForCollection(tasks, true, { reportType: 'month' });
        } else if (type === 'range') {
            const s = document.getElementById('exportRangeStart').value;
            const e = document.getElementById('exportRangeEnd').value;
            if (!s || !e) { await showCustomAlert('Vui lòng chọn cả ngày bắt đầu và kết thúc!'); return; }
            if (s > e) { await showCustomAlert('Ngày bắt đầu phải <= ngày kết thúc'); return; }
            const tasks = await fetchTasksForRange(s, e);
            await exportTasksForCollection(tasks, true, { reportType: 'range', startDate: s, endDate: e });
        }
    } catch (e) {
        console.error('Lỗi khi xuất công việc:', e);
        await showCustomAlert(`❌ Không thể xuất công việc: ${e && e.message ? e.message : String(e)}`);
    } finally {
        hideLoading();
    }
}

// Chuyển chuỗi YYYY-MM-DD sang Date object (sử dụng giờ địa phương)
function parseYMD(ds) {
    const [yy, mm, dd] = ds.split("-").map(s => parseInt(s, 10));
    return new Date(yy, mm - 1, dd);
}

// Chuyển Date object về chuỗi YYYY-MM-DD theo timezone local
function toYMDLocal(date) {
    if (!(date instanceof Date)) return null;
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
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
    // mỗi lần hiển thị thông báo, đảm bảo overlay loading đã được ẩn
    hideLoading();
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
    // thông báo và xác nhận nên luôn hủy chỉ báo loading nếu đang tồn tại
    hideLoading();
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
function showLoading(message = '') {
    if (loadingMessage) loadingMessage.textContent = message;
    if (loadingIndicator) loadingIndicator.classList.add('active');
}

// Ẩn vòng xoay loading
function hideLoading() {
    if (loadingIndicator) loadingIndicator.classList.remove('active');
    if (loadingMessage) loadingMessage.textContent = '';
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
 * @param {string} v - Trạng thái công việc ("Chưa bắt đầu", "Đang thực hiện", "Hoàn thành", "Chậm tiến độ")
 * @returns {string} Class CSS ("status-pending", "status-doing", "status-done", "status-delayed")
 */
const statusClass = v =>
    v === "Chưa bắt đầu" || v === "Chưa xử lý" ? "status-pending" : // Màu xám / xanh dương (chưa bắt đầu)
        v === "Đang thực hiện" || v === "Đang xử lý" ? "status-doing" : // Màu cam (đang thực hiện)
            v === "Chậm tiến độ" ? "status-delayed" : // Màu đỏ (chậm tiến độ)
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
    taskSearchRequestId += 1;
    // Kiểm tra nếu ngày đặc biệt: NL trước, NB tiếp theo
    const addBtn = document.getElementById('openAddModal');
    const expBtn = document.getElementById('exportBtn');
    const deleteDropdown = document.getElementById('deleteSelect');
    if (isNlDay(ds)) {
        taskTableContainer.style.display = 'none';
        taskTable.innerHTML = `<tr><td colspan="100" style="text-align: center; padding: 20px; background: #dceeff; border: 2px solid #6f42c1;"><strong style="font-size: 18px; color: #2e59d9;">🎉 Hôm nay là ngày Nghỉ Lễ (NL)</strong></td></tr>`;
        if (addBtn) addBtn.style.display = 'none';
        if (expBtn) expBtn.style.display = 'none';
        if (deleteDropdown) deleteDropdown.style.display = 'none';
        syncMobileDeleteActionVisibility();
        if (searchFilterSection) searchFilterSection.style.display = 'none';
        return;
    } else if (isNbDay(ds)) {
        taskTableContainer.style.display = 'none';
        taskTable.innerHTML = `<tr><td colspan="100" style="text-align: center; padding: 20px; background: #fff3cd; border: 2px solid #ffc107;"><strong style="font-size: 18px; color: #856404;">🏷️ Hôm nay là ngày Nghỉ Bù (NB)</strong></td></tr>`;
        if (addBtn) addBtn.style.display = 'none';
        if (expBtn) expBtn.style.display = 'none';
        if (deleteDropdown) deleteDropdown.style.display = 'none';
        syncMobileDeleteActionVisibility();
        if (searchFilterSection) searchFilterSection.style.display = 'none';
        return;
    } else {
        taskTableContainer.style.display = '';
        const isReadOnlyRole = !isAdmin();
        syncMenuToggleVisibility();
        if (searchFilterSection) searchFilterSection.style.display = '';
        if (addBtn) addBtn.style.display = isReadOnlyRole ? 'none' : 'inline-block';
        if (expBtn) expBtn.style.display = 'inline-block';
        if (deleteDropdown) deleteDropdown.style.display = isReadOnlyRole ? 'none' : 'inline-block';
        syncMobileDeleteActionVisibility();
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
                <td>${t.description || ''}</td>
                <td>${t.requester || ''}</td>
                <td>${t.unit || ''}</td>
                <td>${t.assignee || ''}</td>
                <td>${t.startDate ? formatDisplayDate(t.startDate) : ''}</td>
                <td>${t.endDate ? formatDisplayDate(t.endDate) : ''}</td>
                <td>${t.result || ''}</td>
                <td>${t.direction || ''}</td>
                <td></td>
                <td>${t.completion || ''}</td>
                <td>${t.note ? t.note.replace(/\./g, '.<br>') : ''}</td>
                <td>
                    <div class="task-actions">
                        <button class="btn-duplicate icon-action" aria-label="Nhân bản"></button>
                        <button class="btn-edit icon-action" aria-label="Sửa"></button>
                        <button class="btn-delete icon-action" aria-label="Xóa"></button>
                    </div>
                </td>
            `;

            // Tạo dropdown chọn trạng thái công việc với màu sắc
            const stSelect = createColorSelect(
                ["Chưa bắt đầu", "Đang thực hiện", "Hoàn thành", "Chậm tiến độ"],
                t.status,
                statusClass,
                v => update(tasksRef(y, m, w, ds, k), { status: v })
            );

            // Vô hiệu hóa select cho member (họ không được phép sửa)
            if (!isAdmin()) {
                stSelect.disabled = true;
            }

            // Thêm dropdown vào cột trạng thái
            row.children[11].appendChild(stSelect);

            // Nút nhân bản công việc
            row.querySelector(".btn-duplicate").onclick = async () => {
                if (!isAdmin()) {
                    await showCustomAlert('Bạn không có quyền nhân bản công việc');
                    return;
                }

                const confirmDup = await showCustomConfirm("Bạn có muốn nhân bản công việc này không?");
                if (!confirmDup) return;

                // Sao chép thông tin công việc cần thiết
                const newTask = {
                    content: t.content,
                    description: t.description || '',
                    requester: t.requester || '',
                    unit: t.unit || '',
                    assignee: t.assignee || '',
                    startDate: t.startDate || '',
                    endDate: t.endDate || '',
                    result: t.result || '',
                    direction: t.direction || '',
                    completion: t.completion || '',
                    status: t.status || '',
                    note: t.note || '',
                    taskDate: t.taskDate || ds
                };
                showLoading();
                try {
                    await push(tasksRef(y, m, w, ds), newTask);
                    await showCustomAlert("🔁 Đã nhân bản công việc!");
                } catch (e) {
                    console.error(e);
                    await showCustomAlert("❌ Lỗi khi nhân bản");
                } finally {
                    hideLoading();
                }
            };

            // Nút xóa công việc
            row.querySelector(".btn-delete").onclick = async () => {
                if (!isAdmin()) {
                    await showCustomAlert('Bạn không có quyền xóa công việc');
                    return;
                }

                const confirmDelete = await showCustomConfirm("Bạn có chắc muốn xóa công việc này không?");

                if (!confirmDelete) return;
                showLoading();

                try {
                    await remove(tasksRef(y, m, w, ds, k));
                    hideLoading();
                    // đợi trình duyệt vẽ lại để spinner biến mất trước khi thông báo
                    await new Promise(r => requestAnimationFrame(r));
                    await showCustomAlert("✅ Xóa công việc thành công!");
                } catch (error) {
                    hideLoading();
                    await new Promise(r => requestAnimationFrame(r));
                    await showCustomAlert("❌ Có lỗi xảy ra khi xóa!");
                    console.error(error);
                }
            };

            // Nút sửa công việc
            row.querySelector(".btn-edit").onclick = async () => {
                if (!isAdmin()) {
                    await showCustomAlert('Bạn không có quyền chỉnh sửa công việc');
                    return;
                }
                openModal("Chỉnh sửa công việc", k, t);
            };

            appendTaskMobileCard(row);
            taskTable.appendChild(row);
        });
    });
}

// ========== MODAL THÊM/SỎA CÔNG VIệC ========== 
// Mở modal để thêm công việc mới hoặc sửa công việc có sẵn
function openModal(title, id = "", t = {}) {
    modalTitle.innerText = title; // Đậu Để modal: "Thêm công việc" hoặc "Chỉnh sửa công việc"
    taskIdField.value = id; // Nếu có ID, tức là sửa; nếu trống là thêm mới

    // Đặt giá trị đặn các input field nếu đang sửa
    contentInput.value = t.content || "";
    descriptionInput.value = t.description || "";
    requesterInput.value = t.requester || "";
    unitInput.value = t.unit || "";
    assigneeInput.value = t.assignee || "";
    const today = new Date().toISOString().slice(0, 10);
    const defaultDate = selectedDate || today;
    startDateInput.value = t.startDate || defaultDate;
    endDateInput.value = t.endDate || t.startDate || defaultDate;
    resultInput.value = t.result || "";
    directionInput.value = t.direction || "";
    statusInput.value = t.status || "Chưa bắt đầu";
    completionInput.value = t.completion ? String(t.completion).replace('%', '') : "";
    noteInput.value = t.note || "";

    modal.style.display = "flex"; // Hiển thị modal
}

// Đảm bảo nút X (close) của modal thêm/sửa công việc luôn hoạt động
document.addEventListener('DOMContentLoaded', function () {
    const taskModal = document.getElementById('taskModal');
    if (taskModal) {
        const closeBtn = taskModal.querySelector('.close');
        if (closeBtn) {
            closeBtn.onclick = function (e) {
                e.preventDefault();
                closeEmployeeAutocomplete();
                taskModal.style.display = 'none';
            };
        }
    }

    // Nếu người dùng chọn Ngày bắt đầu, auto đồng bộ Ngày kết thúc cùng giá trị
    if (startDateInput && endDateInput) {
        startDateInput.addEventListener('change', () => {
            if (startDateInput.value) {
                endDateInput.value = startDateInput.value;
            }
        });
    }

    if (requesterInput) {
        setupEmployeeAutocomplete(requesterInput, 'requester');
    }
    if (unitInput) {
        setupEmployeeAutocomplete(unitInput, 'unit');
    }
    if (assigneeInput) {
        setupEmployeeAutocomplete(assigneeInput, 'assignee');
    }
    if (scheduleUnitInput) {
        setupEmployeeAutocomplete(scheduleUnitInput, 'scheduleUnit');
    }
    if (scheduleAssigneeInput) {
        setupEmployeeAutocomplete(scheduleAssigneeInput, 'scheduleAssignee');
    }

    // ========== SEARCH EVENT LISTENERS ==========
    if (searchPeriod) {
        searchPeriod.addEventListener('change', function () {
            const period = this.value;
            searchDate.style.display = period === 'day' ? 'inline-block' : 'none';
            searchMonth.style.display = period === 'month' ? 'inline-block' : 'none';
            searchYear.style.display = period === 'year' ? 'inline-block' : 'none';
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', searchTasks);
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', clearSearch);
    }

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            currentSearch.search = this.value.toLowerCase();
            updateClearSearchButton();
            searchTasks();
        });
        updateClearSearchButton();
    }
});

// Xóa modal khi click bên ngoài (backdrop)
modal.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });

// Xóa modal khi bấm phím Escape
document.addEventListener("keydown", e => { if (e.key === "Escape") modal.style.display = "none"; });

// Nút mở modal thêm công việc mới
if (document.getElementById("openAddModal")) {
    document.getElementById("openAddModal").onclick = async () => {
        if (!selectedDate) { await showCustomAlert("Vui lòng chọn ngày trước!"); return; }
        openModal("Thêm công việc");
    };
}



// Nút lưu trong modal thêm/sửa
if (saveTaskBtn) {
    saveTaskBtn.onclick = async () => {
        if (!isAdmin()) {
            await showCustomAlert('Bạn không có quyền thêm hoặc chỉnh sửa công việc.');
            return;
        }
        if (!selectedDate) {
            await showCustomAlert("Vui lòng chọn ngày trước!");
            return;
        }
        const [y, m] = selectedDate.split("-");
        const w = getWeekNumber(selectedDate);
        const completionValue = completionInput.value.trim();
        const normalizedCompletion = completionValue ? (completionValue.toString().endsWith('%') ? completionValue.toString() : `${completionValue}%`) : '';
        const data = {
            content: contentInput.value.trim(),
            description: descriptionInput.value.trim(),
            requester: requesterInput.value.trim(),
            unit: unitInput.value.trim(),
            assignee: assigneeInput.value.trim(),
            startDate: startDateInput.value || '',
            endDate: endDateInput.value || '',
            result: resultInput.value.trim(),
            direction: directionInput.value.trim(),
            completion: normalizedCompletion,
            status: statusInput.value,
            note: noteInput.value.trim(),
            taskDate: selectedDate
        };
        showLoading();
        try {
            if (taskIdField.value) {
                await update(tasksRef(y, m, w, selectedDate, taskIdField.value), data);
            } else {
                await push(tasksRef(y, m, w, selectedDate), data);
            }
            // ẩn spinner trước khi hiển thị xác nhận
            hideLoading();
            if (taskIdField.value) {
                await showCustomAlert("✅ Cập nhật công việc thành công!");
            } else {
                await showCustomAlert("✅ Thêm công việc mới thành công!");
            }
            modal.style.display = "none";
        } catch (error) {
            console.error(error);
            hideLoading();
            await showCustomAlert("\u274c Có lỗi xảy ra khi lưu công việc!");
        } finally {
            // đảm bảo spinner đã bị ẩn nếu chưa
            hideLoading();
        }
    };
}

// Nút xuất nhanh cho ngày hiện tại (vẫn nằm cạnh thêm công việc)
if (document.getElementById("exportBtn")) {
    document.getElementById("exportBtn").onclick = async () => {
        if (!selectedDate) { await showCustomAlert("Vui lòng chọn ngày trước!"); return; }
        await performExport('day');
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

if (uploadTaskTemplateBtn && taskTemplateFile) {
    uploadTaskTemplateBtn.onclick = () => taskTemplateFile.click();
    taskTemplateFile.addEventListener('change', async () => {
        const file = taskTemplateFile.files?.[0];
        if (!file) return;
        uploadTaskTemplateBtn.disabled = true;
        showLoading();
        try {
            await uploadTaskExportTemplate(file);
            await refreshTaskTemplateStatus();
            await showCustomAlert('Đã tải mẫu xuất công việc lên thành công.');
        } catch (error) {
            console.error('Lỗi tải mẫu xuất công việc lên:', error);
            if (taskTemplateStatus) {
                taskTemplateStatus.textContent = `Tải file mẫu thất bại: ${error?.message || String(error)}`;
            }
            await showCustomAlert(`Không thể tải mẫu xuất: ${error?.message || String(error)}`);
        } finally {
            taskTemplateFile.value = '';
            uploadTaskTemplateBtn.disabled = false;
            hideLoading();
        }
    });
}

if (reloadTaskTemplateBtn) {
    reloadTaskTemplateBtn.onclick = async () => {
        reloadTaskTemplateBtn.disabled = true;
        showLoading('Đang tải lại dữ liệu file mẫu...');
        try {
            await refreshTaskTemplateStatus(true);
        } finally {
            reloadTaskTemplateBtn.disabled = false;
            hideLoading();
        }
    };
}

if (deleteTaskTemplateBtn) {
    deleteTaskTemplateBtn.onclick = async () => {
        if (!await showCustomConfirm('Bạn có chắc muốn xóa file mẫu xuất Công việc đã lưu không?')) return;
        deleteTaskTemplateBtn.disabled = true;
        showLoading('Đang xóa file mẫu...');
        try {
            await deleteTaskExportTemplate();
            taskTemplateStatus.textContent = 'Đã xóa file mẫu. Hãy tải mẫu Excel lên trước khi xuất Công việc.';
            await showCustomAlert('Đã xóa file mẫu thành công.');
        } catch (error) {
            console.error('Lỗi xóa file mẫu Công việc:', error);
            if (taskTemplateStatus) {
                taskTemplateStatus.textContent = `Không thể xóa file mẫu: ${error?.message || String(error)}`;
            }
            await showCustomAlert(`Không thể xóa file mẫu: ${error?.message || String(error)}`);
        } finally {
            deleteTaskTemplateBtn.disabled = false;
            hideLoading();
        }
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
    applyRolePermissions();
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

async function removeManagedDay(type, dateStr) {
    const [year, month, day] = dateStr.split('-');
    const dayCache = type === 'NB' ? nbDays : nlDays;
    const dayRef = type === 'NB' ? nbRef(year, month, day) : nlRef(year, month, day);
    try {
        await remove(dayRef);
        delete dayCache[dateStr];
        return true;
    } catch (e) {
        console.error(`Lỗi xóa ngày ${type}:`, e);
        await showCustomAlert(`❌ Không thể xóa ngày ${type}: ${e && e.message ? e.message : String(e)}`);
        return false;
    }
}

async function moveManagedDay(type, oldDate, newDate) {
    if (!isValidYmd(newDate)) {
        await showCustomAlert('Ngày mới không hợp lệ. Vui lòng nhập ngày theo định dạng YYYY-MM-DD.');
        return false;
    }
    if (newDate === oldDate) {
        await showCustomAlert('Ngày mới phải khác ngày hiện tại.');
        return false;
    }

    const targetAlreadyMarked = type === 'NB' ? isNbDay(newDate) : isNlDay(newDate);
    const targetConflicts = type === 'NB' ? isNlDay(newDate) : isNbDay(newDate);
    if (targetAlreadyMarked || targetConflicts) {
        await showCustomAlert('Ngày mới đã được đánh dấu NB/NL, vui lòng chọn ngày khác.');
        return false;
    }

    const [oldYear, oldMonth, oldDay] = oldDate.split('-');
    const [newYear, newMonth, newDay] = newDate.split('-');
    const collection = type === 'NB' ? 'nbDays' : 'nlDays';
    const uid = getCurrentUserId();
    const updates = {
        [`${collection}/${uid}/${oldYear}/${oldMonth}/${oldDay}`]: null,
        [`${collection}/${uid}/${newYear}/${newMonth}/${newDay}`]: true
    };
    try {
        await update(ref(db), updates);
        const dayCache = type === 'NB' ? nbDays : nlDays;
        delete dayCache[oldDate];
        dayCache[newDate] = true;
        return true;
    } catch (e) {
        console.error(`Lỗi đổi ngày ${type}:`, e);
        await showCustomAlert(`❌ Không thể đổi ngày ${type}: ${e && e.message ? e.message : String(e)}`);
        return false;
    }
}

if (deleteNbBtn) {
    deleteNbBtn.onclick = async () => {
        if (!isAdmin()) { await showCustomAlert('Bạn không có quyền quản lý ngày NB.'); return; }
        if (!manageNbDateInput.value) { await showCustomAlert('Vui lòng chọn ngày NB!'); return; }
        const ds = manageNbDateInput.value;
        if (!isNbDay(ds)) { await showCustomAlert('Ngày này không phải NB'); return; }
        if (!await removeManagedDay('NB', ds)) return;
        await showCustomAlert('✅ Đã xóa NB ' + formatDisplayDate(ds));
        renderCalendar();
        if (selectedDate === ds) loadTasks(ds);
    };
}

if (changeNbBtn) {
    changeNbBtn.onclick = async () => {
        if (!isAdmin()) { await showCustomAlert('Bạn không có quyền quản lý ngày NB.'); return; }
        if (!manageNbDateInput.value) { await showCustomAlert('Vui lòng chọn ngày NB cần đổi!'); return; }
        const oldDate = manageNbDateInput.value;
        if (!isNbDay(oldDate)) { await showCustomAlert('Ngày này không phải NB'); return; }
        const newDate = prompt('Nhập ngày mới (YYYY-MM-DD):')?.trim();
        if (!newDate) return;
        if (!await moveManagedDay('NB', oldDate, newDate)) return;
        await showCustomAlert('🔄 Đã đổi NB từ ' + formatDisplayDate(oldDate) + ' sang ' + formatDisplayDate(newDate));
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
        if (!isAdmin()) { await showCustomAlert('Bạn không có quyền quản lý ngày NL.'); return; }
        if (!manageNlDateInput.value) { await showCustomAlert('Vui lòng chọn ngày NL!'); return; }
        const ds = manageNlDateInput.value;
        if (!isNlDay(ds)) { await showCustomAlert('Ngày này không phải NL'); return; }
        if (!await removeManagedDay('NL', ds)) return;
        await showCustomAlert('✅ Đã xóa NL ' + formatDisplayDate(ds));
        renderCalendar();
        if (selectedDate === ds) loadTasks(ds);
    };
}

if (changeNlBtn) {
    changeNlBtn.onclick = async () => {
        if (!isAdmin()) { await showCustomAlert('Bạn không có quyền quản lý ngày NL.'); return; }
        if (!manageNlDateInput.value) { await showCustomAlert('Vui lòng chọn ngày NL cần đổi!'); return; }
        const oldDate = manageNlDateInput.value;
        if (!isNlDay(oldDate)) { await showCustomAlert('Ngày này không phải NL'); return; }
        const newDate = prompt('Nhập ngày mới (YYYY-MM-DD):')?.trim();
        if (!newDate) return;
        if (!await moveManagedDay('NL', oldDate, newDate)) return;
        await showCustomAlert('🔄 Đã đổi NL từ ' + formatDisplayDate(oldDate) + ' sang ' + formatDisplayDate(newDate));
        renderCalendar();
        if (selectedDate === oldDate || selectedDate === newDate) loadTasks(selectedDate);
    };
}

let editingScheduleId = null;
let editingScheduleDate = null;
let editingScheduleCreatedAt = null;
let editingScheduleData = null;
let scheduleLoadToken = 0;
let activeScheduleType = 'storeVisit';
let nbItEmployees = [];
let nbItEntries = [];
let nbItLoadToken = 0;

function isItEmployee(employee) {
    const details = normalizeEmployeeText([
        employee.department,
        employee.position,
        employee.positionDetail
    ].join(' '));
    return /(^|[^a-z0-9])(it|cntt)(?=$|[^a-z0-9])|cong nghe thong tin/.test(details);
}

function resetNbItEntryForm() {
    nbItEntryForm.reset();
    nbItEntryIdInput.value = '';
    const month = new Date().getMonth() + 1;
    const lastDay = new Date(Number(nbItYearInput.value), month, 0).getDate();
    const day = Math.min(new Date().getDate(), lastDay);
    nbItStartDateInput.value = `${nbItYearInput.value}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    nbItEndDateInput.value = nbItStartDateInput.value;
    nbItKindInput.value = 'NB';
    nbItLabelInput.value = '';
    nbItSaveBtn.textContent = 'Lưu lịch';
    nbItDeleteBtn.hidden = true;
}

function renderNbItCalendar() {
    const year = Number(nbItYearInput.value);
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
        nbItCalendar.replaceChildren();
        nbItScheduleCount.textContent = 'Vui lòng chọn năm từ 2000 đến 2100.';
        return;
    }
    nbItCalendar.replaceChildren();
    if (!nbItEmployees.length) {
        const empty = document.createElement('p');
        empty.className = 'nb-it-empty';
        empty.textContent = 'Chưa có nhân viên thuộc bộ phận IT trong danh sách nhân viên.';
        nbItCalendar.appendChild(empty);
    }

    const yearStart = `${year}-01-01`;
    const yearEnd = `${year}-12-31`;
    const yearEntries = nbItEntries.filter(entry =>
        entry.startDate <= yearEnd && (entry.endDate || entry.startDate) >= yearStart
    );
    nbItScheduleCount.textContent = `${nbItEmployees.length} nhân viên IT · ${yearEntries.length} lịch trong năm ${year}`;
    const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const hdColors = ['#c6d9f0', '#d9c7df', '#f4e2c7', '#d5e6d1', '#ffe49a', '#d4e6eb'];
    const getHdColor = entry => {
        let hash = 0;
        for (const character of String(entry.id || entry.label || 'HD')) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
        return hdColors[hash % hdColors.length];
    };

    for (let monthIndex = 0; monthIndex < 12; monthIndex += 1) {
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
        const month = document.createElement('section');
        month.className = 'nb-it-month';
        const title = document.createElement('h3');
        title.className = 'nb-it-month-title';
        title.textContent = `THÁNG ${monthIndex + 1}`;
        month.appendChild(title);

        const table = document.createElement('table');
        table.className = 'nb-it-month-table';
        table.setAttribute('aria-label', `Lịch NB - IT tháng ${monthIndex + 1} năm ${year}`);
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const addStaffHeader = (text, className) => {
            const cell = document.createElement('th');
            cell.scope = 'col';
            cell.className = className;
            cell.textContent = text;
            headerRow.appendChild(cell);
        };
        addStaffHeader('MÃ NV', 'nb-it-code-column');
        addStaffHeader('HỌ VÀ TÊN', 'nb-it-name-column');
        for (let day = 1; day <= 31; day += 1) {
            const dayHeader = document.createElement('th');
            dayHeader.scope = 'col';
            if (day <= daysInMonth) {
                const weekday = new Date(year, monthIndex, day).getDay();
                const solarLabel = document.createElement('span');
                solarLabel.className = 'nb-it-solar-date';
                solarLabel.textContent = String(day);
                const weekdayLabel = document.createElement('span');
                weekdayLabel.className = 'nb-it-weekday';
                weekdayLabel.textContent = weekDays[weekday];
                const lunarDate = convertSolarToLunar(day, monthIndex + 1, year);
                const lunarLabel = document.createElement('span');
                lunarLabel.className = 'nb-it-lunar-date';
                lunarLabel.textContent = lunarDate.day === 1
                    ? `${lunarDate.day}/${lunarDate.month}${lunarDate.isLeapMonth ? '*' : ''}`
                    : String(lunarDate.day);
                dayHeader.append(solarLabel, weekdayLabel, lunarLabel);
                dayHeader.title = `Dương lịch: ${day}/${monthIndex + 1}/${year} · Thứ: ${weekDays[weekday]} · Âm lịch: ${lunarDate.day}/${lunarDate.month}/${lunarDate.year}${lunarDate.isLeapMonth ? ' (tháng nhuận)' : ''}`;
                if (weekday === 0 || weekday === 6) dayHeader.classList.add('nb-it-weekend');
            } else {
                dayHeader.setAttribute('aria-hidden', 'true');
            }
            headerRow.appendChild(dayHeader);
        }
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        nbItEmployees.forEach(employee => {
            const row = document.createElement('tr');
            const codeCell = document.createElement('td');
            codeCell.className = 'nb-it-code-column';
            codeCell.textContent = employee.code || '—';
            const nameCell = document.createElement('td');
            nameCell.className = 'nb-it-name-column';
            nameCell.textContent = employee.name || '—';
            row.append(codeCell, nameCell);
            for (let day = 1; day <= 31; day += 1) {
                const cell = document.createElement('td');
                if (day > daysInMonth) {
                    cell.setAttribute('aria-hidden', 'true');
                    row.appendChild(cell);
                    continue;
                }
                const date = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const weekday = new Date(year, monthIndex, day).getDay();
                if (weekday === 0 || weekday === 6) cell.classList.add('nb-it-weekend');
                cell.dataset.employeeKey = employee.key;
                cell.dataset.date = date;
                cell.tabIndex = 0;
                const entries = yearEntries.filter(entry =>
                    entry.employeeKey === employee.key &&
                    entry.startDate <= date &&
                    (entry.endDate || entry.startDate) >= date
                );
                cell.setAttribute('aria-label', `${employee.name || employee.code}, ${date}${entries.length ? `, ${entries.map(entry => entry.label || entry.kind).join(', ')}` : ', trống. Gõ NB để thêm nghỉ bù'}`);
                if (entries.length) {
                    cell.classList.add('nb-it-event-cell');
                    entries.forEach(entry => {
                        const chip = document.createElement('button');
                        const kind = ['NB', 'TC', 'HD'].includes(entry.kind) ? entry.kind : 'HD';
                        const label = String(entry.label || kind).trim() || kind;
                        chip.type = 'button';
                        chip.className = 'nb-it-entry-chip';
                        chip.dataset.entryId = entry.id;
                        chip.dataset.kind = kind;
                        chip.title = `${label} · ${employee.name} · ${entry.startDate}${entry.endDate !== entry.startDate ? ` đến ${entry.endDate}` : ''}`;
                        chip.setAttribute('aria-label', `Sửa ${chip.title}`);
                        if (kind === 'HD') chip.style.setProperty('--nb-it-hd-color', getHdColor(entry));
                        chip.textContent = entry.startDate === date || date.endsWith('-01') ? label : '';
                        cell.appendChild(chip);
                    });
                } else {
                    const addButton = document.createElement('button');
                    addButton.type = 'button';
                    addButton.className = 'nb-it-cell-add';
                    addButton.dataset.employeeKey = employee.key;
                    addButton.dataset.date = date;
                    addButton.setAttribute('aria-label', `Thêm lịch cho ${employee.name} ngày ${date}`);
                    addButton.textContent = '＋';
                    cell.appendChild(addButton);
                }
                row.appendChild(cell);
            }
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        month.appendChild(table);
        nbItCalendar.appendChild(month);
    }
}

async function loadNbItSchedule() {
    if (!nbItCalendar || !isAdmin()) return;
    const userId = getCurrentUserId();
    const requestToken = ++nbItLoadToken;
    nbItCalendar.replaceChildren();
    nbItScheduleCount.textContent = 'Đang tải lịch...';
    try {
        const [employeesSnapshot, entriesSnapshot] = await Promise.all([
            get(employeesRef()),
            get(nbItScheduleRef())
        ]);
        if (requestToken !== nbItLoadToken || userId !== getCurrentUserId() || !isAdmin()) return;
        nbItEmployees = [];
        if (employeesSnapshot.exists()) {
            employeesSnapshot.forEach(child => {
                const employee = child.val();
                if (employee && typeof employee === 'object' && isItEmployee(employee)) {
                    nbItEmployees.push({ ...employee, key: child.key });
                }
            });
        }
        nbItEmployees.sort(employeeComparator);
        nbItEmployeeInput.replaceChildren(new Option('Chọn nhân viên IT', ''));
        nbItEmployees.forEach(employee => {
            nbItEmployeeInput.add(new Option(
                `${employee.code || '—'} · ${employee.name || 'Chưa có tên'}`,
                employee.key
            ));
        });
        nbItEntries = [];
        if (entriesSnapshot.exists()) {
            entriesSnapshot.forEach(child => {
                const entry = child.val();
                if (!entry || typeof entry !== 'object' || !isValidYmd(entry.startDate) ||
                    !isValidYmd(entry.endDate || entry.startDate) ||
                    (entry.endDate || entry.startDate) < entry.startDate ||
                    !['NB', 'TC', 'HD'].includes(entry.kind)) return;
                nbItEntries.push({ ...entry, id: child.key, endDate: entry.endDate || entry.startDate });
            });
        }
        renderNbItCalendar();
    } catch (error) {
        if (requestToken !== nbItLoadToken || userId !== getCurrentUserId() || !isAdmin()) return;
        console.error('Lỗi tải LỊCH NB - IT:', error);
        nbItScheduleCount.textContent = 'Không thể tải lịch NB - IT.';
        const message = document.createElement('p');
        message.className = 'nb-it-error';
        message.textContent = `Không thể tải dữ liệu. Vui lòng thử tải lại. ${error?.message || String(error)}`;
        nbItCalendar.replaceChildren(message);
    }
}

function openNbItEntryForm(entry = null, employeeKey = '', date = '') {
    resetNbItEntryForm();
    nbItEntryForm.hidden = false;
    nbItEmployeeInput.value = employeeKey;
    if (date) {
        nbItStartDateInput.value = date;
        nbItEndDateInput.value = date;
    }
    if (entry) {
        nbItEntryIdInput.value = entry.id;
        nbItEmployeeInput.value = entry.employeeKey;
        nbItKindInput.value = entry.kind;
        nbItLabelInput.value = entry.label || entry.kind;
        nbItStartDateInput.value = entry.startDate;
        nbItEndDateInput.value = entry.endDate || entry.startDate;
        nbItSaveBtn.textContent = 'Cập nhật';
        nbItDeleteBtn.hidden = false;
    }
    nbItEntryForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    nbItEmployeeInput.focus();
}

function startNbItCellEdit(cell, initialValue = '') {
    if (!(cell instanceof HTMLTableCellElement) || cell.querySelector('.nb-it-cell-editor')) return false;
    const entries = nbItEntries.filter(entry =>
        entry.employeeKey === cell.dataset.employeeKey &&
        entry.startDate <= cell.dataset.date &&
        (entry.endDate || entry.startDate) >= cell.dataset.date
    );
    const editableEntry = entries.length === 1 &&
        entries[0].kind === 'NB' &&
        entries[0].startDate === cell.dataset.date &&
        (entries[0].endDate || entries[0].startDate) === cell.dataset.date
        ? entries[0]
        : null;
    if (entries.length && !editableEntry) return false;

    const editor = document.createElement('input');
    editor.type = 'text';
    editor.className = 'nb-it-cell-editor';
    editor.maxLength = 2;
    editor.autocomplete = 'off';
    editor.spellcheck = false;
    editor.value = initialValue || (editableEntry ? 'NB' : '');
    editor.setAttribute('aria-label', `Nhập NB cho ngày ${cell.dataset.date}`);
    cell.replaceChildren(editor);
    editor.focus();
    if (!initialValue) editor.select();

    let finished = false;
    const finish = async save => {
        if (finished) return;
        finished = true;
        const value = editor.value.trim().toUpperCase();
        if (!save) {
            renderNbItCalendar();
            return;
        }
        if (!value) {
            if (!editableEntry) {
                renderNbItCalendar();
                return;
            }
            const userId = getCurrentUserId();
            try {
                if (!isAdmin() || !userId || userId !== getCurrentUserId()) {
                    throw new Error('Không có quyền hoặc tài khoản đã thay đổi.');
                }
                await remove(nbItScheduleRef(editableEntry.id));
                await loadNbItSchedule();
            } catch (error) {
                console.error('Lỗi xóa nhanh NB:', error);
                renderNbItCalendar();
                await showCustomAlert(`Không thể xóa ngày NB: ${error?.message || String(error)}`);
            }
            return;
        }
        if (value !== 'NB') {
            renderNbItCalendar();
            await showCustomAlert('Ô nhập nhanh chỉ nhận giá trị NB. Nhấn Escape để hủy.');
            return;
        }
        if (editableEntry) {
            renderNbItCalendar();
            return;
        }
        const userId = getCurrentUserId();
        const employee = nbItEmployees.find(item => item.key === cell.dataset.employeeKey);
        if (!isAdmin() || !userId || !employee || !isValidYmd(cell.dataset.date)) {
            renderNbItCalendar();
            await showCustomAlert('Không thể lưu NB: vui lòng kiểm tra quyền, nhân viên và ngày.');
            return;
        }
        editor.disabled = true;
        try {
            if (userId !== getCurrentUserId()) throw new Error('Tài khoản đã thay đổi. Vui lòng thử lại.');
            const entryRef = push(nbItScheduleRef());
            if (!entryRef.key) throw new Error('Không thể tạo mã lịch.');
            const now = Date.now();
            await set(entryRef, {
                employeeKey: employee.key,
                employeeCode: String(employee.code || ''),
                employeeName: String(employee.name || ''),
                kind: 'NB',
                label: 'NB',
                startDate: cell.dataset.date,
                endDate: cell.dataset.date,
                createdAt: now,
                updatedAt: now
            });
            await loadNbItSchedule();
        } catch (error) {
            console.error('Lỗi nhập nhanh NB:', error);
            renderNbItCalendar();
            await showCustomAlert(`Không thể lưu ngày NB: ${error?.message || String(error)}`);
        }
    };

    editor.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            event.preventDefault();
            void finish(true);
        } else if (event.key === 'Escape') {
            event.preventDefault();
            void finish(false);
        }
    });
    editor.addEventListener('blur', () => { void finish(true); }, { once: true });
    return true;
}

function scheduleAllowsMissingDate(status) {
    return ['Chờ', 'Chưa bắt đầu', 'Chưa xử lý'].includes(status);
}

function syncScheduleDateRequirements() {
    const required = !scheduleAllowsMissingDate(scheduleStatusInput.value);
    const dateInputs = activeScheduleType === 'maintenance'
        ? [maintenanceStartDateInput, maintenanceEndDateInput]
        : [scheduleDateInput, scheduleTimeInput];
    dateInputs.forEach(input => { input.required = required; });
}

function setScheduleTypeMode(type) {
    activeScheduleType = type === 'maintenance' ? 'maintenance' : 'storeVisit';
    scheduleTypeInput.value = activeScheduleType;
    const isMaintenance = activeScheduleType === 'maintenance';
    scheduleTypeField.hidden = true;
    scheduleTypeInput.disabled = true;
    scheduleForm.dataset.scheduleType = activeScheduleType;
    scheduleForm.querySelectorAll('[data-schedule-store-field]').forEach(field => {
        field.hidden = isMaintenance;
        field.querySelectorAll('input, textarea, select').forEach(control => {
            control.disabled = isMaintenance;
        });
    });
    scheduleForm.querySelectorAll('[data-schedule-maintenance-field]').forEach(field => {
        field.hidden = !isMaintenance;
        field.querySelectorAll('input, textarea, select').forEach(control => {
            control.disabled = !isMaintenance;
        });
    });
    maintenanceDashboard.hidden = !isMaintenance;
    storeVisitDashboard.hidden = isMaintenance;
    storeScheduleHead.hidden = isMaintenance;
    maintenanceScheduleHead.hidden = !isMaintenance;
    scheduleManagementTitle.textContent = isMaintenance ? 'Lịch bảo trì' : 'Lịch đi cửa hàng';
    scheduleListTitle.textContent = activeScheduleType === 'maintenance'
        ? 'Danh sách bảo trì'
        : 'Danh sách lịch đi cửa hàng';
    scheduleAssigneeLabel.textContent = isMaintenance ? 'Người phụ trách' : 'Người thực hiện';
    scheduleAssigneeInput.placeholder = isMaintenance ? 'Chọn người phụ trách' : 'Chọn người thực hiện';
    openScheduleFormBtn.textContent = isMaintenance ? '＋ Tạo lịch bảo trì' : '＋ Thêm lịch';

    const currentStatus = scheduleStatusInput.value;
    const statuses = isMaintenance
        ? [
            ['Đã lên lịch', 'ĐÃ LÊN LỊCH'],
            ['Đang bảo trì', 'ĐANG BẢO TRÌ'],
            ['Hoàn thành', 'ĐÃ HOÀN TẤT'],
            ['Cần chú ý', 'CẦN CHÚ Ý'],
            ['Chờ', 'CHỜ'],
            ['Đã hủy', 'ĐÃ HỦY']
        ]
        : [
            ['Chưa bắt đầu', 'CHƯA XỬ LÝ'],
            ['Đang thực hiện', 'ĐANG XỬ LÝ'],
            ['Chậm tiến độ', 'CHẬM TIẾN ĐỘ'],
            ['Đã lên lịch', 'ĐÃ LÊN LỊCH'],
            ['Hoàn thành', 'ĐÃ XỬ LÝ'],
            ['Chờ', 'CHỜ'],
            ['Đã hủy', 'ĐÃ HỦY']
        ];
    scheduleStatusInput.replaceChildren(...statuses.map(([value, label]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = label;
        return option;
    }));
    scheduleStatusInput.value = statuses.some(([value]) => value === currentStatus)
        ? currentStatus
        : statuses[0][0];
    syncScheduleDateRequirements();
}

function getSafeScheduleUrl(value) {
    if (typeof value !== 'string' || !value.trim()) return '';
    try {
        const url = new URL(value);
        return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch {
        return '';
    }
}

function setScheduleFormMode(schedule = null) {
    const selectedDateValue = activeScheduleType === 'maintenance'
        ? getTodayString()
        : scheduleDateInput.value || getTodayString();
    if (!schedule) {
        editingScheduleId = null;
        editingScheduleDate = null;
        editingScheduleCreatedAt = null;
        editingScheduleData = null;
        scheduleForm.reset();
        scheduleDateInput.value = selectedDateValue;
        scheduleTimeInput.value = '07:00';
        scheduleTypeInput.value = activeScheduleType;
        maintenanceStartDateInput.value = selectedDateValue;
        maintenanceEndDateInput.value = selectedDateValue;
        maintenanceDueDateInput.value = '';
        maintenanceContentInput.value = '';
        maintenanceEquipmentInput.value = '';
        maintenanceCycleInput.value = '';
        maintenanceResultInput.value = '';
        maintenanceNoteInput.value = '';
        maintenanceEvidenceInput.value = '';
        maintenanceEvidenceCurrent.textContent = '';
        maintenanceLinkInput.value = '';
        scheduleStatusInput.value = activeScheduleType === 'maintenance' ? 'Đã lên lịch' : 'Chưa bắt đầu';
        syncScheduleDateRequirements();
        saveScheduleBtn.textContent = 'Lưu lịch';
        scheduleEditorTitle.textContent = activeScheduleType === 'maintenance' ? 'Tạo lịch bảo trì' : 'Thêm lịch';
        return;
    }

    editingScheduleId = schedule.id;
    editingScheduleDate = schedule.storageDate || schedule.date;
    editingScheduleCreatedAt = schedule.createdAt || null;
    editingScheduleData = schedule;
    scheduleDateInput.value = schedule.date;
    scheduleTimeInput.value = schedule.time || (schedule.date ? '07:00' : '');
    scheduleTypeInput.value = schedule.type === 'maintenance' ? 'maintenance' : 'storeVisit';
    scheduleLocationInput.value = schedule.content || schedule.location || '';
    scheduleUnitInput.value = schedule.unit || schedule.location || '';
    scheduleAssigneeInput.value = schedule.assignee || '';
    if (activeScheduleType === 'maintenance') {
        maintenanceStartDateInput.value = schedule.startDate || schedule.date;
        maintenanceEndDateInput.value = schedule.endDate || schedule.date;
        maintenanceDueDateInput.value = schedule.dueDate || '';
        maintenanceContentInput.value = schedule.maintenanceContent || schedule.content || '';
        maintenanceEquipmentInput.value = schedule.equipment || '';
        maintenanceCycleInput.value = schedule.cycle || '';
        maintenanceResultInput.value = schedule.result || '';
        maintenanceNoteInput.value = schedule.note || '';
        maintenanceEvidenceInput.value = '';
        maintenanceEvidenceCurrent.textContent = schedule.evidenceName
            ? `Tệp hiện tại: ${schedule.evidenceName}`
            : (schedule.evidenceUrl ? 'Đã có bằng chứng đính kèm.' : '');
        maintenanceLinkInput.value = schedule.link || '';
    } else {
        scheduleNoteInput.value = schedule.note || '';
    }
    const maintenanceStatusMap = {
        'Chưa bắt đầu': 'Đã lên lịch',
        'Đang thực hiện': 'Đang bảo trì'
    };
    scheduleStatusInput.value = activeScheduleType === 'maintenance'
        ? maintenanceStatusMap[schedule.status] || schedule.status || 'Đã lên lịch'
        : schedule.status || 'Chưa bắt đầu';
    syncScheduleDateRequirements();
    saveScheduleBtn.textContent = 'Lưu lịch';
    scheduleEditorTitle.textContent = activeScheduleType === 'maintenance' ? 'Sửa lịch bảo trì' : 'Sửa lịch';
}

function openScheduleEditorModal() {
    scheduleEditorModal.classList.add('show');
    scheduleEditorModal.setAttribute('aria-hidden', 'false');
    (activeScheduleType === 'maintenance' ? maintenanceContentInput : scheduleDateInput).focus();
}

async function loadScheduleList() {
    if (!scheduleDateInput || !scheduleList || !isAdmin()) return;
    const requestUserId = getCurrentUserId();
    const requestType = activeScheduleType;
    const requestToken = ++scheduleLoadToken;
    scheduleList.replaceChildren();
    if (scheduleCount) scheduleCount.textContent = 'Đang tải lịch...';
    try {
        const snapshot = await get(scheduleRef());
        if (requestToken !== scheduleLoadToken || requestType !== activeScheduleType ||
            !isAdmin() || requestUserId !== getCurrentUserId()) return;
        const records = [];
        if (snapshot.exists()) {
            snapshot.forEach(yearSnapshot => {
                yearSnapshot.forEach(monthSnapshot => {
                    monthSnapshot.forEach(daySnapshot => {
                        const date = `${yearSnapshot.key}-${String(monthSnapshot.key).padStart(2, '0')}-${String(daySnapshot.key).padStart(2, '0')}`;
                        if (!isValidYmd(date)) return;
                        daySnapshot.forEach(scheduleSnapshot => {
                            const schedule = scheduleSnapshot.val();
                            if (schedule && typeof schedule === 'object' && schedule.type === requestType) {
                                records.push({
                                    ...schedule,
                                    id: scheduleSnapshot.key,
                                    date: typeof schedule.date === 'string' ? schedule.date : date,
                                    storageDate: date
                                });
                            }
                        });
                    });
                });
            });
        }
        records.sort((a, b) =>
            (a.date || '9999-99-99').localeCompare(b.date || '9999-99-99') ||
            String(a.time || '07:00').localeCompare(String(b.time || '07:00')) ||
            Number(a.createdAt || 0) - Number(b.createdAt || 0)
        );
        if (scheduleCount) {
            scheduleCount.textContent = requestType === 'maintenance'
                ? `Theo dõi lịch bảo trì thiết bị và hệ thống · ${records.length} hạng mục`
                : `${records.length} lịch đang theo dõi`;
        }
        if (requestType === 'maintenance') {
            const today = getTodayString();
            const activeRecords = records.filter(schedule =>
                !['Hoàn thành', 'Đã hủy'].includes(schedule.status)
            );
            maintenanceDueCount.textContent = String(activeRecords.filter(schedule =>
                schedule.dueDate && schedule.dueDate <= today
            ).length);
            maintenanceCompletedCount.textContent = String(records.filter(schedule =>
                schedule.status === 'Hoàn thành'
            ).length);
            maintenanceAttentionCount.textContent = String(activeRecords.filter(schedule =>
                schedule.status === 'Cần chú ý' || (schedule.dueDate && schedule.dueDate < today)
            ).length);
        } else {
            storeVisitPendingCount.textContent = String(records.filter(schedule =>
                !['Hoàn thành', 'Đã hủy'].includes(schedule.status)
            ).length);
            storeVisitCompletedCount.textContent = String(records.filter(schedule =>
                schedule.status === 'Hoàn thành'
            ).length);
            storeVisitDelayedCount.textContent = String(records.filter(schedule =>
                schedule.status === 'Chậm tiến độ'
            ).length);
        }

        if (records.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = requestType === 'maintenance' ? 13 : 8;
            cell.className = 'schedule-empty';
            cell.textContent = requestType === 'maintenance'
                ? 'Chưa có lịch bảo trì.'
                : 'Chưa có lịch đi cửa hàng.';
            row.appendChild(cell);
            scheduleList.appendChild(row);
            return;
        }

        for (const [recordIndex, schedule] of records.entries()) {
            const row = document.createElement('tr');
            if (requestType === 'maintenance') {
                const numberCell = document.createElement('td');
                numberCell.textContent = String(recordIndex + 1);
                const unitCell = document.createElement('td');
                unitCell.textContent = schedule.unit || schedule.location || '—';
                const startCell = document.createElement('td');
                startCell.textContent = formatDisplayDate(schedule.startDate || schedule.date) || '—';
                const endCell = document.createElement('td');
                endCell.textContent = formatDisplayDate(schedule.endDate || schedule.date) || '—';
                const assigneeCell = document.createElement('td');
                assigneeCell.className = 'schedule-assignees';
                String(schedule.assignee || '—').split(',').map(name => name.trim()).filter(Boolean).forEach(name => {
                    const chip = document.createElement('span');
                    chip.textContent = name;
                    assigneeCell.appendChild(chip);
                });
                row.append(numberCell, unitCell, startCell, endCell, assigneeCell);
            } else {
                const dateCell = document.createElement('td');
                dateCell.className = 'schedule-date-cell';
                dateCell.textContent = schedule.date ? formatDisplayDate(schedule.date).replace(/-/g, '/') : '—';
                const timeCell = document.createElement('td');
                timeCell.textContent = schedule.time || (schedule.date ? '07:00' : '—');
                const contentCell = document.createElement('td');
                contentCell.className = 'schedule-content-cell';
                contentCell.textContent = schedule.content || '—';
                const unitCell = document.createElement('td');
                unitCell.textContent = schedule.unit || schedule.location || '—';
                const assigneeCell = document.createElement('td');
                assigneeCell.className = 'schedule-assignees';
                String(schedule.assignee || 'Chưa có người phụ trách')
                    .split(',')
                    .map(name => name.trim())
                    .filter(Boolean)
                    .forEach(name => {
                        const chip = document.createElement('span');
                        chip.textContent = name;
                        assigneeCell.appendChild(chip);
                    });
                row.append(dateCell, timeCell, contentCell, unitCell, assigneeCell);
            }
            const statusCell = document.createElement('td');
            const status = document.createElement('span');
            const storeStatusLabels = {
                'Chưa bắt đầu': 'CHƯA XỬ LÝ',
                'Đã lên lịch': 'ĐÃ LÊN LỊCH',
                'Đang thực hiện': 'ĐANG XỬ LÝ',
                'Chậm tiến độ': 'CHẬM TIẾN ĐỘ',
                'Đang bảo trì': 'ĐANG BẢO TRÌ',
                'Hoàn thành': 'ĐÃ XỬ LÝ',
                'Cần chú ý': 'CẦN CHÚ Ý',
                'Chờ': 'CHỜ',
                'Đã hủy': 'ĐÃ HỦY'
            };
            const statusKey = requestType === 'maintenance' &&
                ['Chưa bắt đầu', 'Đã lên lịch'].includes(schedule.status) ? 'scheduled'
                : schedule.status === 'Hoàn thành' ? 'done'
                : ['Đang thực hiện', 'Đang bảo trì'].includes(schedule.status) ? 'active'
                    : schedule.status === 'Chậm tiến độ' ? 'delayed'
                        : schedule.status === 'Đã lên lịch' ? 'scheduled'
                            : ['Chưa bắt đầu', 'Chưa xử lý'].includes(schedule.status) ? 'not-started'
                                : schedule.status === 'Chờ' ? 'waiting'
                                    : ['Cần chú ý', 'Đã hủy'].includes(schedule.status) ? 'cancelled' : 'pending';
            const maintenanceStatusLabels = {
                'Đã lên lịch': 'ĐÃ LÊN LỊCH',
                'Đang bảo trì': 'ĐANG BẢO TRÌ',
                'Hoàn thành': 'ĐÃ HOÀN TẤT',
                'Cần chú ý': 'CẦN CHÚ Ý',
                'Chờ': 'CHỜ',
                'Đã hủy': 'ĐÃ HỦY',
                'Chưa bắt đầu': 'ĐÃ LÊN LỊCH',
                'Đang thực hiện': 'ĐANG BẢO TRÌ'
            };
            status.className = `schedule-status schedule-status-${statusKey}`;
            status.textContent = (requestType === 'maintenance' ? maintenanceStatusLabels : storeStatusLabels)[schedule.status] ||
                (requestType === 'maintenance' ? 'ĐÃ LÊN LỊCH' : storeStatusLabels['Chưa bắt đầu']);
            statusCell.appendChild(status);
            row.appendChild(statusCell);
            if (requestType === 'maintenance') {
                const contentCell = document.createElement('td');
                contentCell.className = 'schedule-content-cell';
                contentCell.textContent = schedule.maintenanceContent || schedule.content || '—';
                const equipmentCell = document.createElement('td');
                equipmentCell.textContent = schedule.equipment || '—';
                const cycleCell = document.createElement('td');
                cycleCell.textContent = schedule.cycle || '—';
                const resultCell = document.createElement('td');
                resultCell.textContent = schedule.result || '—';
                const noteCell = document.createElement('td');
                noteCell.textContent = schedule.note || '—';
                const evidenceCell = document.createElement('td');
                const evidenceUrl = getSafeScheduleUrl(schedule.evidenceUrl);
                if (evidenceUrl) {
                    const evidenceLink = document.createElement('a');
                    evidenceLink.href = evidenceUrl;
                    evidenceLink.target = '_blank';
                    evidenceLink.rel = 'noopener noreferrer';
                    evidenceLink.textContent = schedule.evidenceName || 'Mở bằng chứng';
                    evidenceLink.className = 'schedule-evidence-link';
                    evidenceCell.appendChild(evidenceLink);
                }
                const externalLink = getSafeScheduleUrl(schedule.link);
                if (externalLink) {
                    const link = document.createElement('a');
                    link.href = externalLink;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    link.textContent = evidenceUrl ? 'Mở liên kết' : schedule.link;
                    link.className = 'schedule-evidence-link';
                    evidenceCell.appendChild(link);
                }
                if (!evidenceCell.childNodes.length) evidenceCell.textContent = '—';
                row.append(contentCell, equipmentCell, cycleCell, resultCell, noteCell, evidenceCell);
            } else {
                const noteCell = document.createElement('td');
                noteCell.textContent = schedule.note || '—';
                row.appendChild(noteCell);
            }
            const actions = document.createElement('td');
            actions.className = 'schedule-table-actions';
            const duplicateButton = document.createElement('button');
            duplicateButton.type = 'button';
            duplicateButton.className = 'schedule-action-btn schedule-duplicate-btn';
            duplicateButton.textContent = '🔁';
            duplicateButton.title = 'Nhân bản lịch';
            duplicateButton.setAttribute('aria-label', 'Nhân bản lịch');
            duplicateButton.onclick = async () => {
                if (!isAdmin()) { await showCustomAlert('Bạn không có quyền nhân bản lịch.'); return; }
                if (!await showCustomConfirm('Bạn có muốn nhân bản lịch này không?')) return;

                duplicateButton.disabled = true;
                showLoading();
                try {
                    const storageDate = schedule.storageDate || schedule.date;
                    if (!isValidYmd(storageDate)) throw new Error('Không xác định được ngày lưu lịch.');
                    const [year, month, day] = storageDate.split('-');
                    const scheduleCopy = { ...schedule };
                    delete scheduleCopy.id;
                    delete scheduleCopy.storageDate;
                    const now = Date.now();
                    await push(scheduleRef(year, month, day), {
                        ...scheduleCopy,
                        createdAt: now,
                        updatedAt: now
                    });
                    await loadScheduleList();
                    await showCustomAlert('🔁 Đã nhân bản lịch thành công.');
                } catch (error) {
                    console.error('Lỗi nhân bản lịch cửa hàng/bảo trì:', error);
                    await showCustomAlert(`Không thể nhân bản lịch: ${error && error.message ? error.message : String(error)}`);
                } finally {
                    duplicateButton.disabled = false;
                    hideLoading();
                }
            };
            const updateButton = document.createElement('button');
            updateButton.type = 'button';
            updateButton.className = 'schedule-action-btn schedule-edit-btn';
            updateButton.textContent = '✎';
            updateButton.title = 'Sửa lịch';
            updateButton.setAttribute('aria-label', 'Sửa lịch');
            updateButton.onclick = async () => {
                if (!isAdmin()) { await showCustomAlert('Bạn không có quyền chỉnh sửa lịch.'); return; }
                setScheduleFormMode(schedule);
                openScheduleEditorModal();
            };

            const deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.className = 'schedule-action-btn schedule-delete-btn';
            deleteButton.textContent = '×';
            deleteButton.title = 'Xóa lịch';
            deleteButton.setAttribute('aria-label', 'Xóa lịch');
            deleteButton.onclick = async () => {
                if (!isAdmin()) { await showCustomAlert('Bạn không có quyền xóa lịch.'); return; }
                if (!await showCustomConfirm('Bạn có chắc muốn xóa lịch này không?')) return;
                deleteButton.disabled = true;
                showLoading();
                try {
                    const [year, month, day] = (schedule.storageDate || schedule.date).split('-');
                    await remove(scheduleRef(year, month, day, schedule.id));
                    if (editingScheduleId === schedule.id && editingScheduleDate === (schedule.storageDate || schedule.date)) {
                        setScheduleFormMode();
                    }
                    await loadScheduleList();
                    await showCustomAlert('Đã xóa lịch thành công.');
                } catch (e) {
                    console.error('Lỗi xóa lịch cửa hàng/bảo trì:', e);
                    await showCustomAlert(`Không thể xóa lịch: ${e && e.message ? e.message : String(e)}`);
                } finally {
                    deleteButton.disabled = false;
                    hideLoading();
                }
            };
            actions.append(duplicateButton, updateButton, deleteButton);
            row.appendChild(actions);
            const scheduleHeaders = (requestType === 'maintenance' ? maintenanceScheduleHead : storeScheduleHead)
                .querySelectorAll('th');
            row.querySelectorAll('td').forEach((cell, index) => {
                cell.dataset.label = scheduleHeaders[index].getAttribute('aria-label') ||
                    scheduleHeaders[index].textContent.trim() || 'Thao tác';
            });
            const cells = Array.from(row.cells);
            const mobileCell = document.createElement('td');
            mobileCell.className = 'schedule-mobile-cell';
            mobileCell.colSpan = cells.length;

            const card = document.createElement('article');
            card.className = 'schedule-mobile-card';
            const heading = document.createElement('div');
            heading.className = 'schedule-mobile-card-heading';
            const startDate = document.createElement('span');
            startDate.className = 'schedule-mobile-card-date';
            const startDateText = cells[requestType === 'maintenance' ? 2 : 0].textContent.trim();
            if (requestType === 'maintenance') {
                const endDateText = cells[3].textContent.trim();
                startDate.textContent = `${startDateText} → ${endDateText}`;
                startDate.setAttribute('aria-label', `Từ ngày ${startDateText} đến ngày ${endDateText}`);
            } else {
                startDate.textContent = startDateText;
            }
            heading.append(startDate, cells[5].firstElementChild.cloneNode(true));

            const title = document.createElement('h3');
            title.className = 'schedule-mobile-card-title';
            title.textContent = cells[requestType === 'maintenance' ? 6 : 2].textContent.trim();

            const unit = document.createElement('p');
            unit.className = 'schedule-mobile-card-unit';
            unit.textContent = cells[requestType === 'maintenance' ? 1 : 3].textContent.trim();

            const details = document.createElement('details');
            details.className = 'schedule-mobile-card-details';
            const summary = document.createElement('summary');
            summary.textContent = 'Xem chi tiết';
            const detailList = document.createElement('dl');
            detailList.className = 'schedule-mobile-card-detail-list';
            const primaryIndexes = new Set([
                requestType === 'maintenance' ? 2 : 0,
                ...(requestType === 'maintenance' ? [3] : []),
                5,
                requestType === 'maintenance' ? 6 : 2,
                requestType === 'maintenance' ? 1 : 3,
                ...(requestType === 'maintenance' ? [0] : [])
            ]);
            cells.forEach((cell, index) => {
                if (primaryIndexes.has(index) || index === cells.length - 1) return;
                const item = document.createElement('div');
                item.className = 'schedule-mobile-card-detail';
                const label = document.createElement('dt');
                label.textContent = cell.dataset.label;
                const value = document.createElement('dd');
                if (cell.classList.contains('schedule-assignees')) {
                    value.classList.add('schedule-assignees');
                }
                cell.childNodes.forEach(node => value.appendChild(node.cloneNode(true)));
                item.append(label, value);
                detailList.appendChild(item);
            });
            details.append(summary, detailList);

            const mobileActions = document.createElement('div');
            mobileActions.className = 'schedule-mobile-card-actions';
            Array.from(actions.querySelectorAll('button')).forEach(button => {
                const mobileButton = button.cloneNode(true);
                mobileButton.addEventListener('click', () => {
                    if (!button.disabled) button.click();
                });
                mobileActions.appendChild(mobileButton);
            });

            card.append(heading, title, unit, details, mobileActions);
            mobileCell.appendChild(card);
            row.appendChild(mobileCell);
            scheduleList.appendChild(row);
        }
    } catch (e) {
        if (requestToken !== scheduleLoadToken || requestType !== activeScheduleType ||
            !isAdmin() || requestUserId !== getCurrentUserId()) return;
        console.error('Lỗi tải lịch cửa hàng/bảo trì:', e);
        const row = document.createElement('tr');
        const message = document.createElement('td');
        message.colSpan = requestType === 'maintenance' ? 13 : 8;
        message.className = 'schedule-empty schedule-error';
        message.textContent = 'Không thể tải lịch. Vui lòng thử tải lại.';
        row.appendChild(message);
        scheduleList.appendChild(row);
        if (scheduleCount) scheduleCount.textContent = 'Không thể tải danh sách lịch';
        await showCustomAlert(`Không thể tải lịch: ${e && e.message ? e.message : String(e)}`);
    }
}

let employeeRecords = [];
let employeeTaskOptionsLoaded = false;
let employeeRequesterOptions = [];
let employeeAssigneeOptions = [];
let employeeUnitOptions = [];
const scheduleUnitExcludedOptions = new Set([
    'ban hang',
    'ban kiem soat',
    'dich vu',
    'ke toan',
    'khac',
    'kho tong',
    'phu tung',
    'quan ly head'
]);
let activeEmployeeAutocomplete = null;
let employeeAutocompleteDismissalBound = false;
let employeePage = 1;
let employeesPerPage = 50;
const expandedEmployeeDepartments = new Set();
let initializedEmployeeDepartments = false;
let employeeEditReturnFocus = null;

function normalizeEmployeeText(value) {
    return String(value ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, character => character === 'Đ' ? 'D' : 'd')
        .toLowerCase()
        .trim();
}

function appendEmployeeSearchHighlights(element, value, query) {
    const text = String(value ?? '');
    const terms = normalizeEmployeeText(query).split(/\s+/).filter(Boolean);
    if (!terms.length || !text) {
        element.textContent = text;
        return;
    }

    let normalizedText = '';
    const sourcePositions = [];
    for (let offset = 0; offset < text.length;) {
        const character = String.fromCodePoint(text.codePointAt(offset));
        const end = offset + character.length;
        const normalizedCharacter = normalizeEmployeeText(character);
        normalizedText += normalizedCharacter;
        for (let index = 0; index < normalizedCharacter.length; index += 1) {
            sourcePositions.push({ start: offset, end });
        }
        offset = end;
    }

    const matches = [];
    terms.forEach(term => {
        let matchIndex = normalizedText.indexOf(term);
        while (matchIndex !== -1) {
            const firstPosition = sourcePositions[matchIndex];
            const lastPosition = sourcePositions[matchIndex + term.length - 1];
            if (firstPosition && lastPosition) matches.push({ start: firstPosition.start, end: lastPosition.end });
            matchIndex = normalizedText.indexOf(term, matchIndex + term.length);
        }
    });
    matches.sort((first, second) => first.start - second.start || first.end - second.end);

    let offset = 0;
    matches.forEach(match => {
        if (match.start < offset) {
            offset = Math.max(offset, match.end);
            return;
        }
        element.append(document.createTextNode(text.slice(offset, match.start)));
        const highlighted = document.createElement('mark');
        highlighted.className = 'employee-search-highlight';
        highlighted.textContent = text.slice(match.start, match.end);
        element.appendChild(highlighted);
        offset = match.end;
    });
    element.append(document.createTextNode(text.slice(offset)));
}

function normalizeEmployeeDate(value) {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
    }
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
        const parsed = XLSX.SSF.parse_date_code(value);
        if (parsed) return `${parsed.y}-${String(parsed.m).padStart(2, '0')}-${String(parsed.d).padStart(2, '0')}`;
    }
    const valueString = String(value ?? '').trim();
    if (!valueString) return '';
    const normalized = normalizeDateString(valueString);
    return normalized && isValidYmd(normalized) ? normalized : '';
}

function employeeDepartment(employee) {
    return String(employee.department || 'Chưa phân loại').trim() || 'Chưa phân loại';
}

const employeeDepartmentOrder = [
    'ban giam doc',
    'phong cskh',
    'phong it',
    'phong kinh doanh',
    'phong nhan su dao tao',
    'phong tai chinh ke toan'
];

function compareEmployeeDepartments(first, second) {
    const firstName = normalizeEmployeeText(first).replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const secondName = normalizeEmployeeText(second).replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const firstOrder = employeeDepartmentOrder.indexOf(firstName);
    const secondOrder = employeeDepartmentOrder.indexOf(secondName);
    const firstRank = firstOrder < 0 ? employeeDepartmentOrder.length : firstOrder;
    const secondRank = secondOrder < 0 ? employeeDepartmentOrder.length : secondOrder;

    return firstRank - secondRank || first.localeCompare(second, 'vi', { numeric: true });
}

async function loadEmployeeTaskOptions() {
    if (employeeTaskOptionsLoaded) return;

    try {
        const snapshot = await get(employeesRef());
        const requesterOptions = [];
        const assigneeOptions = [];
        const departments = new Map();
        const locations = new Map();
        if (snapshot.exists()) {
            snapshot.forEach(child => {
                const employee = child.val();
                if (!employee || typeof employee !== 'object') return;
                const code = String(employee.code || '').trim();
                const name = String(employee.name || '').trim();
                if (code && name) {
                    const detailPosition = String(employee.positionDetail || '').trim();
                    requesterOptions.push({
                        value: `${code} _ ${name} _ ${detailPosition}`,
                        code,
                        name,
                        detailPosition
                    });
                    const searchablePosition = normalizeEmployeeText([
                        detailPosition,
                        employee.position,
                        employee.department
                    ].join(' '));
                    if (/(^|[^a-z0-9])(it|cntt)(?=$|[^a-z0-9])/.test(searchablePosition)) {
                        assigneeOptions.push({
                            value: `${code} _ ${name} _ ${detailPosition}`,
                            code,
                            name,
                            detailPosition
                        });
                    }
                }

                const department = String(employee.department || '').trim();
                const location = String(employee.location || '').trim();
                if (department) departments.set(normalizeEmployeeText(department), department);
                if (location) locations.set(normalizeEmployeeText(location), location);
            });
        }

        requesterOptions.sort((first, second) => first.value.localeCompare(second.value, 'vi', { numeric: true }));
        employeeRequesterOptions = requesterOptions;
        assigneeOptions.sort((first, second) => first.value.localeCompare(second.value, 'vi', { numeric: true }));
        employeeAssigneeOptions = assigneeOptions;
        const orderedLocations = [...locations.values()].sort(compareEmployeeLocations);
        departments.set('phong it', 'Phòng IT');
        const orderedDepartments = [...departments.values()].sort(compareEmployeeDepartments);
        const management = orderedDepartments.filter(value => normalizeEmployeeText(value) === 'ban giam doc');
        const otherDepartments = orderedDepartments.filter(value => normalizeEmployeeText(value) !== 'ban giam doc');
        employeeUnitOptions = [
            ...management.map(value => ({ value, group: 'Ban Giám Đốc' })),
            ...otherDepartments.map(value => ({ value, group: 'Phòng ban' })),
            ...orderedLocations.map(value => ({ value, group: 'Đơn vị cửa hàng' }))
        ];
        employeeTaskOptionsLoaded = true;
    } catch (error) {
        console.error('Lỗi tải gợi ý đơn vị và nhân viên từ danh sách nhân viên:', error);
        await showCustomAlert(`Không thể tải gợi ý đơn vị và nhân viên: ${error?.message || String(error)}`);
    }
}

function closeEmployeeAutocomplete() {
    if (!activeEmployeeAutocomplete) return;
    activeEmployeeAutocomplete.input.setAttribute('aria-expanded', 'false');
    activeEmployeeAutocomplete.input.removeAttribute('aria-activedescendant');
    activeEmployeeAutocomplete.popup.remove();
    activeEmployeeAutocomplete = null;
}

function getScheduleStoreUnitIdentity(value) {
    return normalizeEmployeeText(value)
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/^[a-z]{1,3}\s*\d+\s+/, '')
        .replace(/^head\s+/, '')
        .replace(/^hong duc\s+/, '');
}

function isExcludedEmployeeUnit(value) {
    return scheduleUnitExcludedOptions.has(getScheduleStoreUnitIdentity(value));
}

function positionEmployeeAutocomplete() {
    if (!activeEmployeeAutocomplete) return;
    const { input, popup } = activeEmployeeAutocomplete;
    const rect = input.getBoundingClientRect();
    const margin = 8;
    const below = window.innerHeight - rect.bottom - margin;
    const above = rect.top - margin;
    const openAbove = below < 170 && above > below;
    const availableHeight = Math.max(80, Math.min(300, openAbove ? above : below));
    const width = Math.min(rect.width, window.innerWidth - margin * 2);

    popup.style.width = `${width}px`;
    popup.style.maxHeight = `${availableHeight}px`;
    popup.style.left = `${Math.max(margin, Math.min(rect.left, window.innerWidth - width - margin))}px`;
    popup.style.top = `${openAbove ? Math.max(margin, rect.top - availableHeight - 6) : rect.bottom + 6}px`;
}

function parseScheduleAssignees(value) {
    return String(value ?? '').split(',').map(name => name.trim()).filter(Boolean);
}

function renderEmployeeAutocomplete() {
    if (!activeEmployeeAutocomplete) return;
    const { input, popup, type } = activeEmployeeAutocomplete;
    const isUnitField = type === 'unit' || type === 'scheduleUnit';
    const isScheduleAssignee = type === 'scheduleAssignee';
    const isMultiPersonField = type === 'requester' || type === 'assignee' || isScheduleAssignee;
    const queryValue = isMultiPersonField ? input.value.split(',').pop().trim() : input.value;
    const query = normalizeEmployeeText(queryValue);
    const hasReachedAssigneeLimit = isScheduleAssignee &&
        parseScheduleAssignees(input.value.split(',').slice(0, -1).join(',')).length >= 5;
    const source = isUnitField
        ? employeeUnitOptions.filter(item => !isExcludedEmployeeUnit(item.value))
        : type === 'assignee' || isScheduleAssignee
            ? employeeAssigneeOptions
            : employeeRequesterOptions;
    const matches = source.filter(item => normalizeEmployeeText(item.value).includes(query)).slice(0, 40);
    const visibleItems = [];
    popup.replaceChildren();

    if (!matches.length || hasReachedAssigneeLimit) {
        const empty = document.createElement('div');
        empty.className = 'employee-autocomplete-empty';
        empty.textContent = hasReachedAssigneeLimit
            ? 'Đã chọn tối đa 5 người'
            : query ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có dữ liệu gợi ý';
        popup.appendChild(empty);
        positionEmployeeAutocomplete();
        return;
    }

    let currentGroup = '';
    matches.forEach(item => {
        if (isUnitField && item.group !== currentGroup) {
            currentGroup = item.group;
            const heading = document.createElement('div');
            heading.className = 'employee-autocomplete-group';
            heading.textContent = currentGroup;
            popup.appendChild(heading);
        }

        const option = document.createElement('button');
        option.type = 'button';
        const isPersonOption = !isUnitField;
        option.className = `employee-autocomplete-option ${isPersonOption ? 'employee-autocomplete-requester' : 'employee-autocomplete-unit'}`;
        option.setAttribute('role', 'option');
        option.setAttribute('aria-selected', 'false');
        option.id = `employee-autocomplete-option-${visibleItems.length}`;
        if (isPersonOption) {
            const code = document.createElement('span');
            code.className = 'employee-autocomplete-code';
            code.textContent = item.code;
            const name = document.createElement('span');
            name.className = 'employee-autocomplete-name';
            name.textContent = item.name;
            const detail = document.createElement('span');
            detail.className = 'employee-autocomplete-detail';
            detail.textContent = item.detailPosition || 'Chưa có chức danh chi tiết';
            option.append(code, name, detail);
            popup.appendChild(option);
        } else {
            option.textContent = item.value;
            popup.appendChild(option);
        }
        visibleItems.push({ item, option });
        option.addEventListener('mousedown', event => event.preventDefault());
        option.addEventListener('click', () => {
            if (isScheduleAssignee) {
                const assignees = parseScheduleAssignees(input.value.split(',').slice(0, -1).join(','));
                const alreadySelected = assignees.some(name => normalizeEmployeeText(name) === normalizeEmployeeText(item.value));
                if (!alreadySelected && assignees.length >= 5) {
                    showCustomAlert('Chỉ được chọn tối đa 5 người thực hiện.');
                    return;
                }
                if (!alreadySelected) assignees.push(item.value);
                input.value = assignees.join(', ');
            } else if (isMultiPersonField) {
                const values = parseScheduleAssignees(input.value.split(',').slice(0, -1).join(','));
                const alreadySelected = values.some(value =>
                    normalizeEmployeeText(value) === normalizeEmployeeText(item.value)
                );
                if (!alreadySelected) values.push(item.value);
                input.value = values.join(', ');
            } else {
                input.value = item.value;
            }
            closeEmployeeAutocomplete();
            input.focus();
        });
    });

    activeEmployeeAutocomplete.items = visibleItems;
    activeEmployeeAutocomplete.activeIndex = -1;
    input.removeAttribute('aria-activedescendant');
    positionEmployeeAutocomplete();
}

async function openEmployeeAutocomplete(input, type) {
    await loadEmployeeTaskOptions();
    if (document.activeElement !== input) return;
    closeEmployeeAutocomplete();

    const popup = document.createElement('div');
    popup.className = 'employee-autocomplete-list';
    const popupIds = {
        requester: 'employeeRequesterList',
        assignee: 'employeeAssigneeList',
        unit: 'employeeUnitList',
        scheduleUnit: 'scheduleUnitEmployeeList',
        scheduleAssignee: 'scheduleAssigneeEmployeeList'
    };
    popup.id = popupIds[type];
    popup.setAttribute('role', 'listbox');
    document.body.appendChild(popup);
    input.setAttribute('aria-expanded', 'true');
    activeEmployeeAutocomplete = { input, type, popup, items: [], activeIndex: -1 };
    renderEmployeeAutocomplete();

    if (!employeeAutocompleteDismissalBound) {
        document.addEventListener('pointerdown', event => {
            if (!activeEmployeeAutocomplete) return;
            if (!activeEmployeeAutocomplete.popup.contains(event.target) && activeEmployeeAutocomplete.input !== event.target) {
                closeEmployeeAutocomplete();
            }
        });
        document.addEventListener('scroll', positionEmployeeAutocomplete, true);
        window.addEventListener('resize', positionEmployeeAutocomplete);
        employeeAutocompleteDismissalBound = true;
    }
}

function setupEmployeeAutocomplete(input, type) {
    input.addEventListener('focus', () => openEmployeeAutocomplete(input, type));
    input.addEventListener('blur', () => {
        if (activeEmployeeAutocomplete?.input === input) closeEmployeeAutocomplete();
    });
    input.addEventListener('input', () => {
        if (activeEmployeeAutocomplete?.input === input) {
            renderEmployeeAutocomplete();
        } else {
            openEmployeeAutocomplete(input, type);
        }
    });
    input.addEventListener('keydown', event => {
        if (!activeEmployeeAutocomplete || activeEmployeeAutocomplete.input !== input) return;
        const { items } = activeEmployeeAutocomplete;
        if (event.key === 'Escape') {
            closeEmployeeAutocomplete();
        } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            if (!items.length) return;
            event.preventDefault();
            const direction = event.key === 'ArrowDown' ? 1 : -1;
            activeEmployeeAutocomplete.activeIndex = activeEmployeeAutocomplete.activeIndex < 0
                ? (direction > 0 ? 0 : items.length - 1)
                : (activeEmployeeAutocomplete.activeIndex + direction + items.length) % items.length;
            items.forEach(({ option }, index) => {
                const selected = index === activeEmployeeAutocomplete.activeIndex;
                option.classList.toggle('is-active', selected);
                option.setAttribute('aria-selected', String(selected));
            });
            input.setAttribute('aria-activedescendant', items[activeEmployeeAutocomplete.activeIndex].option.id);
            items[activeEmployeeAutocomplete.activeIndex].option.scrollIntoView({ block: 'nearest' });
        } else if (event.key === 'Enter' && activeEmployeeAutocomplete.activeIndex >= 0) {
            event.preventDefault();
            items[activeEmployeeAutocomplete.activeIndex].option.click();
        }
    });
}

function employeeLocation(employee) {
    return String(employee.location || 'Chưa phân loại').trim() || 'Chưa phân loại';
}

const employeeLocationOrder = [
    'mau than',
    'nam can tho',
    'vinh thanh',
    'vi thuy',
    'chau thanh',
    'lo te',
    'soc trang',
    'haus'
];

function compareEmployeeLocations(first, second) {
    const normalizeLocation = location => normalizeEmployeeText(location)
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/^[a-z]{1,3}\s*\d+\s+/, '');
    const getLocationOrder = location => {
        let normalized = normalizeLocation(location).replace(/^head\s+/, '');
        if (normalized === 'vp cong ty') return { rank: 0, branch: 0 };

        normalized = normalized.replace(/^hong duc\s+/, '');
        const branchMatch = normalized.match(/^([0-9]+)$/);
        if (branchMatch) return { rank: 1, branch: Number(branchMatch[1]) };

        const locationIndex = employeeLocationOrder.indexOf(normalized);
        return {
            rank: locationIndex < 0 ? employeeLocationOrder.length + 2 : locationIndex + 2,
            branch: 0
        };
    };
    const firstOrder = getLocationOrder(first);
    const secondOrder = getLocationOrder(second);

    if (firstOrder.rank !== secondOrder.rank) return firstOrder.rank - secondOrder.rank;
    if (firstOrder.rank === 1) return firstOrder.branch - secondOrder.branch;
    return first.localeCompare(second, 'vi', { numeric: true });
}

function employeeComparator(a, b) {
    return compareEmployeeLocations(employeeLocation(a), employeeLocation(b)) ||
        employeeDepartment(a).localeCompare(employeeDepartment(b), 'vi') ||
        String(a.code || '').localeCompare(String(b.code || ''), 'vi', { numeric: true }) ||
        String(a.name || '').localeCompare(String(b.name || ''), 'vi');
}

function renderEmployeePagination(total, pageCount) {
    employeePagination.replaceChildren();
    const addPageButton = (label, page, disabled = false, current = false, ariaLabel = '') => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `employee-page-btn${current ? ' is-current' : ''}`;
        button.textContent = label;
        button.disabled = disabled;
        if (ariaLabel) button.setAttribute('aria-label', ariaLabel);
        if (current) button.setAttribute('aria-current', 'page');
        button.addEventListener('click', () => {
            employeePage = page;
            renderEmployees();
        });
        employeePagination.appendChild(button);
    };

    const firstPage = Math.max(1, employeePage - 2);
    const lastPage = Math.min(pageCount, firstPage + 4);
    addPageButton('≪', 1, employeePage === 1, false, 'Trang đầu');
    addPageButton('‹', Math.max(1, employeePage - 1), employeePage === 1, false, 'Trang trước');
    for (let page = firstPage; page <= lastPage; page += 1) {
        addPageButton(String(page), page, false, page === employeePage, `Trang ${page}`);
    }
    addPageButton('›', Math.min(pageCount, employeePage + 1), employeePage >= pageCount, false, 'Trang sau');
    addPageButton('≫', pageCount, employeePage >= pageCount, false, 'Trang cuối');

    const start = total ? (employeePage - 1) * employeesPerPage + 1 : 0;
    const end = Math.min(employeePage * employeesPerPage, total);
    employeePageSummary.replaceChildren();
    const range = document.createElement('strong');
    range.textContent = `${start}–${end}`;
    employeePageSummary.append(range, document.createTextNode(` trên ${total} nhân viên`));
}

function renderEmployees() {
    const query = normalizeEmployeeText(employeeSearch.value);
    const selectedDepartment = employeeDepartmentFilter.value;
    const filtered = employeeRecords
        .filter(employee => !selectedDepartment || employeeDepartment(employee) === selectedDepartment)
        .filter(employee => {
            if (!query) return true;
            return [
                employee.code,
                employee.name,
                employee.location,
                employee.attendanceId,
                employee.position,
                employee.positionDetail,
                employee.phone,
                employee.birthDate,
                employee.gender,
                employee.email,
                employee.department,
                employee.status
            ].some(value => normalizeEmployeeText(value).includes(query));
        })
        .sort(employeeComparator);

    const pageCount = Math.max(1, Math.ceil(filtered.length / employeesPerPage));
    employeePage = Math.min(employeePage, pageCount);
    const startIndex = (employeePage - 1) * employeesPerPage;
    const pageRecords = filtered.slice(startIndex, startIndex + employeesPerPage);
    const locations = new Map();
    filtered.forEach(employee => {
        const location = employeeLocation(employee);
        const department = employeeDepartment(employee);
        if (!locations.has(location)) locations.set(location, new Map());
        const departments = locations.get(location);
        if (!departments.has(department)) departments.set(department, []);
        departments.get(department).push(employee);
    });
    const pageEmployeesByDepartment = new Map();
    pageRecords.forEach(employee => {
        const location = employeeLocation(employee);
        const department = employeeDepartment(employee);
        const departmentKey = `${location}\u0000${department}`;
        if (!pageEmployeesByDepartment.has(departmentKey)) pageEmployeesByDepartment.set(departmentKey, []);
        pageEmployeesByDepartment.get(departmentKey).push(employee);
    });
    if (query) {
        locations.forEach((departments, location) => {
            expandedEmployeeDepartments.add(`location:${location}`);
            departments.forEach((_, department) => {
                expandedEmployeeDepartments.add(`department:${location}\u0000${department}`);
            });
        });
    }
    if (!initializedEmployeeDepartments && locations.size) {
        const [location, departments] = locations.entries().next().value;
        expandedEmployeeDepartments.add(`location:${location}`);
        if (departments.size) {
            expandedEmployeeDepartments.add(`department:${location}\u0000${departments.keys().next().value}`);
        }
        initializedEmployeeDepartments = true;
    }

    employeeTableContainer.replaceChildren();
    if (!pageRecords.length) {
        const empty = document.createElement('p');
        empty.className = 'employee-empty';
        empty.textContent = employeeRecords.length
            ? 'Không tìm thấy nhân viên phù hợp.'
            : 'Chưa có dữ liệu nhân viên. Tải lên file Excel để bắt đầu.';
        employeeTableContainer.appendChild(empty);
    }

    const createEmployeeTable = employees => {
        const scroll = document.createElement('div');
        scroll.className = 'employee-table-scroll';
        const table = document.createElement('table');
        table.className = 'employee-table';
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        ['Trạng thái', 'Mã', 'Họ và tên', 'ID chấm công', 'Chức danh', 'Điện thoại', 'Ngày sinh', 'Giới tính', 'Email', 'Thao tác'].forEach(label => {
            const cell = document.createElement('th');
            cell.textContent = label;
            headerRow.appendChild(cell);
        });
        thead.appendChild(headerRow);
        const tbody = document.createElement('tbody');

        employees.forEach(employee => {
            const row = document.createElement('tr');
            const statusCell = document.createElement('td');
            const status = document.createElement('span');
            const isActive = !employee.status || normalizeEmployeeText(employee.status).includes('dang lam');
            status.className = `employee-status${isActive ? ' employee-status-active' : ' employee-status-inactive'}`;
            status.textContent = employee.status || 'Đang làm việc';
            statusCell.appendChild(status);

            const code = document.createElement('td');
            code.className = 'employee-code';
            code.textContent = employee.code || '—';
            const name = document.createElement('td');
            name.className = 'employee-name';
            const nameStrong = document.createElement('strong');
            appendEmployeeSearchHighlights(nameStrong, employee.name || '—', query);
            name.appendChild(nameStrong);
            const attendance = document.createElement('td');
            attendance.textContent = employee.attendanceId || '—';
            const position = document.createElement('td');
            if (employee.position || employee.positionDetail) {
                if (employee.position) {
                    const positionName = document.createElement('strong');
                    positionName.textContent = employee.position;
                    position.appendChild(positionName);
                }
                if (employee.positionDetail) {
                    const positionDetail = document.createElement('small');
                    positionDetail.textContent = employee.positionDetail;
                    position.appendChild(positionDetail);
                }
            } else {
                position.textContent = '—';
            }
            const phone = document.createElement('td');
            phone.textContent = employee.phone || '—';
            const birthDate = document.createElement('td');
            birthDate.textContent = employee.birthDate ? formatDisplayDate(employee.birthDate).replace(/-/g, '/') : '—';
            const gender = document.createElement('td');
            gender.textContent = employee.gender || '—';
            const email = document.createElement('td');
            email.textContent = employee.email || '—';
            const actions = document.createElement('td');
            actions.className = 'employee-actions';
            const editButton = document.createElement('button');
            editButton.type = 'button';
            editButton.className = 'employee-action-btn';
            editButton.textContent = '✎';
            editButton.setAttribute('aria-label', `Sửa ${employee.name || employee.code}`);
            editButton.addEventListener('click', () => openEmployeeEdit(employee, editButton));
            const deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.className = 'employee-action-btn employee-delete-btn';
            deleteButton.textContent = '×';
            deleteButton.setAttribute('aria-label', `Xóa ${employee.name || employee.code}`);
            deleteButton.addEventListener('click', () => deleteEmployee(employee));
            actions.append(editButton, deleteButton);
            row.append(statusCell, code, name, attendance, position, phone, birthDate, gender, email, actions);
            tbody.appendChild(row);
        });
        table.append(thead, tbody);
        scroll.appendChild(table);
        return scroll;
    };

    locations.forEach((departments, location) => {
        const locationKey = `location:${location}`;
        const locationGroup = document.createElement('section');
        locationGroup.className = 'employee-location-group';
        const locationHeader = document.createElement('button');
        locationHeader.type = 'button';
        locationHeader.className = 'employee-department-heading employee-location-heading';
        locationHeader.setAttribute('aria-expanded', String(expandedEmployeeDepartments.has(locationKey)));
        const locationName = document.createElement('span');
        locationName.className = 'employee-department-name';
        locationName.textContent = `${expandedEmployeeDepartments.has(locationKey) ? '▾' : '▸'} ${location}`;
        const locationCount = document.createElement('span');
        locationCount.className = 'employee-department-count';
        const totalInLocation = [...departments.values()].reduce((total, employees) => total + employees.length, 0);
        locationCount.textContent = `${totalInLocation} nhân viên`;
        locationHeader.append(locationName, locationCount);
        locationHeader.addEventListener('click', () => {
            if (expandedEmployeeDepartments.has(locationKey)) expandedEmployeeDepartments.delete(locationKey);
            else {
                expandedEmployeeDepartments.add(locationKey);
                const firstMatchingEmployee = filtered.findIndex(employee => employeeLocation(employee) === location);
                if (firstMatchingEmployee >= 0 &&
                    (firstMatchingEmployee < startIndex || firstMatchingEmployee >= startIndex + employeesPerPage)) {
                    employeePage = Math.floor(firstMatchingEmployee / employeesPerPage) + 1;
                }
            }
            renderEmployees();
        });
        locationGroup.appendChild(locationHeader);

        if (expandedEmployeeDepartments.has(locationKey)) {
            departments.forEach((employees, department) => {
                const departmentKey = `department:${location}\u0000${department}`;
                const currentPageEmployees = pageEmployeesByDepartment.get(`${location}\u0000${department}`) || [];
                const departmentGroup = document.createElement('section');
                departmentGroup.className = 'employee-department-group';
                const departmentHeader = document.createElement('button');
                departmentHeader.type = 'button';
                departmentHeader.className = 'employee-department-heading employee-subdepartment-heading';
                departmentHeader.setAttribute('aria-expanded', String(expandedEmployeeDepartments.has(departmentKey)));
                const departmentName = document.createElement('span');
                departmentName.className = 'employee-department-name';
                departmentName.textContent = `${expandedEmployeeDepartments.has(departmentKey) ? '▾' : '▸'} ${department}`;
                const departmentCount = document.createElement('span');
                departmentCount.className = 'employee-department-count';
                departmentCount.textContent = `${employees.length} nhân viên`;
                departmentHeader.append(departmentName, departmentCount);
                departmentHeader.addEventListener('click', () => {
                    if (expandedEmployeeDepartments.has(departmentKey)) expandedEmployeeDepartments.delete(departmentKey);
                    else {
                        expandedEmployeeDepartments.add(departmentKey);
                        const firstMatchingEmployee = filtered.findIndex(employee =>
                            employeeLocation(employee) === location && employeeDepartment(employee) === department
                        );
                        if (firstMatchingEmployee >= 0 &&
                            (firstMatchingEmployee < startIndex || firstMatchingEmployee >= startIndex + employeesPerPage)) {
                            employeePage = Math.floor(firstMatchingEmployee / employeesPerPage) + 1;
                        }
                    }
                    renderEmployees();
                });
                departmentGroup.appendChild(departmentHeader);
                if (expandedEmployeeDepartments.has(departmentKey)) {
                    if (currentPageEmployees.length) {
                        departmentGroup.appendChild(createEmployeeTable(currentPageEmployees));
                    } else {
                        const pageMessage = document.createElement('p');
                        pageMessage.className = 'employee-empty employee-page-hint';
                        pageMessage.textContent = 'Danh sách của đơn vị này nằm ở trang khác.';
                        departmentGroup.appendChild(pageMessage);
                    }
                }
                locationGroup.appendChild(departmentGroup);
            });
        }
        employeeTableContainer.appendChild(locationGroup);
    });

    employeesCount.textContent = `${filtered.length} nhân viên`;
    renderEmployeePagination(filtered.length, pageCount);
}

async function loadEmployees() {
    if (!isAdmin()) return;
    try {
        const snapshot = await get(employeesRef());
        employeeRecords = [];
        if (snapshot.exists()) {
            snapshot.forEach(child => {
                const employee = child.val();
                if (employee && typeof employee === 'object') {
                    employeeRecords.push({ ...employee, key: child.key });
                }
            });
        }
        employeeRecords.sort(employeeComparator);
        const departments = [...new Set(employeeRecords.map(employeeDepartment))]
            .sort((a, b) => a.localeCompare(b, 'vi'));
        const currentDepartment = employeeDepartmentFilter.value;
        employeeDepartmentFilter.replaceChildren(new Option('Tên bộ phận hiện tại', ''));
        departments.forEach(department => employeeDepartmentFilter.add(new Option(department, department)));
        if (departments.includes(currentDepartment)) employeeDepartmentFilter.value = currentDepartment;
        else employeeDepartmentFilter.value = '';
        renderEmployees();
    } catch (error) {
        console.error('Lỗi tải danh sách nhân viên:', error);
        employeesCount.textContent = 'Không thể tải danh sách nhân viên';
        employeeTableContainer.replaceChildren();
        const message = document.createElement('p');
        message.className = 'employee-empty employee-error';
        message.textContent = 'Không thể tải dữ liệu. Vui lòng thử tải lại.';
        employeeTableContainer.appendChild(message);
        await showCustomAlert(`Không thể tải danh sách nhân viên: ${error?.message || String(error)}`);
    }
}

function openEmployeeEdit(employee, trigger) {
    employeeEditReturnFocus = trigger;
    document.getElementById('employeeEditKey').value = employee.key;
    document.getElementById('employeeEditCode').value = employee.code || '';
    document.getElementById('employeeEditName').value = employee.name || '';
    document.getElementById('employeeEditLocation').value = employeeLocation(employee);
    document.getElementById('employeeEditDepartment').value = employeeDepartment(employee);
    document.getElementById('employeeEditAttendanceId').value = employee.attendanceId || '';
    document.getElementById('employeeEditPosition').value = employee.position || '';
    document.getElementById('employeeEditPositionDetail').value = employee.positionDetail || '';
    document.getElementById('employeeEditPhone').value = employee.phone || '';
    document.getElementById('employeeEditBirthDate').value = employee.birthDate || '';
    document.getElementById('employeeEditGender').value = employee.gender || '';
    document.getElementById('employeeEditEmail').value = employee.email || '';
    document.getElementById('employeeEditStatus').value = employee.status || 'Đang làm việc';
    employeeEditModal.classList.add('show');
    employeeEditModal.setAttribute('aria-hidden', 'false');
    document.getElementById('employeeEditCode').focus();
}

async function deleteEmployee(employee) {
    if (!isAdmin()) {
        await showCustomAlert('Bạn không có quyền xóa nhân viên.');
        return;
    }
    if (!await showCustomConfirm('Bạn có chắc muốn xóa nhân viên này không?')) return;
    showLoading();
    try {
        await remove(employeesRef(employee.key));
        employeeRecords = employeeRecords.filter(record => record.key !== employee.key);
        employeeTaskOptionsLoaded = false;
        renderEmployees();
    } catch (error) {
        console.error('Lỗi xóa nhân viên:', error);
        await showCustomAlert(`Không thể xóa nhân viên: ${error?.message || String(error)}`);
    } finally {
        hideLoading();
    }
}

async function importEmployeesWorkbook(file) {
    if (!isAdmin()) {
        await showCustomAlert('Bạn không có quyền tải lên danh sách nhân viên.');
        return;
    }
    showLoading();
    uploadEmployeesBtn.disabled = true;
    try {
        const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        if (!worksheet) throw new Error('File Excel không có trang tính.');
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '', raw: true });
        if (rows.length < 2) throw new Error('File không có dòng dữ liệu nhân viên.');

        const aliases = {
            code: ['ma', 'manv', 'manhanvien', 'employeeid', 'employeecode', 'code', 'maso'],
            name: ['hovaten', 'tennhanvien', 'hoten', 'name', 'fullname', 'employeename'],
            location: ['noilamviec', 'workplace', 'location'],
            attendanceId: ['idchamcong', 'machamcong', 'attendanceid', 'attendancecode'],
            position: ['chucdanh', 'chucvu', 'position', 'title'],
            positionDetail: ['chucdanhchitiet', 'chucvuchitiet', 'positiondetail', 'detailedposition'],
            phone: ['dienthoai', 'sodienthoai', 'phone', 'phonenumber', 'mobile'],
            birthDate: ['ngaysinh', 'birthday', 'birthdate', 'dateofbirth'],
            gender: ['gioitinh', 'gender', 'sex'],
            email: ['email', 'emailcongty'],
            department: ['donvi', 'phongban', 'donviphongban', 'tenbophanhientai', 'department', 'unit'],
            status: ['trangthai', 'status', 'tinhtrang']
        };
        const headers = rows[0].map(normalizeEmployeeText).map(header => header.replace(/[^a-z0-9]/g, ''));
        const columnIndexes = Object.fromEntries(Object.entries(aliases).map(([field, names]) => [
            field,
            headers.findIndex(header => names.includes(header))
        ]));
        if (columnIndexes.code < 0 || columnIndexes.name < 0) {
            throw new Error('Không nhận diện được cột Mã nhân viên và Họ và tên trong dòng tiêu đề.');
        }

        const importedByCode = new Map();
        let skipped = 0;
        rows.slice(1).forEach(row => {
            const getCell = field => {
                const index = columnIndexes[field];
                return index >= 0 ? row[index] : '';
            };
            const code = String(getCell('code') ?? '').trim();
            const name = String(getCell('name') ?? '').trim();
            if (!code || !name) {
                if (row.some(value => String(value ?? '').trim())) skipped += 1;
                return;
            }
            const birthDateValue = normalizeEmployeeDate(getCell('birthDate'));
            const employee = {
                code,
                name,
                location: String(getCell('location') ?? '').trim() || 'Chưa phân loại',
                attendanceId: String(getCell('attendanceId') ?? '').trim(),
                position: String(getCell('position') ?? '').trim(),
                positionDetail: String(getCell('positionDetail') ?? '').trim(),
                phone: String(getCell('phone') ?? '').trim(),
                birthDate: birthDateValue,
                gender: String(getCell('gender') ?? '').trim(),
                email: String(getCell('email') ?? '').trim(),
                department: String(getCell('department') ?? '').trim() || 'Chưa phân loại',
                status: String(getCell('status') ?? '').trim() || 'Đang làm việc'
            };
            importedByCode.set(normalizeEmployeeText(code), employee);
        });
        if (!importedByCode.size) throw new Error('Không tìm thấy nhân viên hợp lệ để tải lên.');
        if (importedByCode.size > 20000) throw new Error('Mỗi lần chỉ được tải lên tối đa 20.000 nhân viên.');

        const snapshot = await get(employeesRef());
        const existingKeysByCode = new Map();
        if (snapshot.exists()) {
            snapshot.forEach(child => {
                const employee = child.val();
                if (employee?.code) existingKeysByCode.set(normalizeEmployeeText(employee.code), child.key);
            });
        }
        const updates = {};
        let added = 0;
        let updated = 0;
        const now = Date.now();
        importedByCode.forEach((employee, normalizedCode) => {
            const existingKey = existingKeysByCode.get(normalizedCode);
            const key = existingKey || push(employeesRef()).key;
            if (!key) throw new Error(`Không thể tạo mã dữ liệu cho nhân viên ${employee.code}.`);
            if (existingKey) {
                updated += 1;
                const existing = snapshot.child(existingKey).val() || {};
                employee.createdAt = existing.createdAt || now;
            } else {
                added += 1;
                employee.createdAt = now;
            }
            employee.updatedAt = now;
            updates[`employees/${key}`] = employee;
        });

        await update(ref(db), updates);
        employeeTaskOptionsLoaded = false;
        employeePage = 1;
        expandedEmployeeDepartments.clear();
        initializedEmployeeDepartments = false;
        await loadEmployees();
        await showCustomAlert(`Đã tải lên ${added} nhân viên mới và cập nhật ${updated} nhân viên.${skipped ? ` Bỏ qua ${skipped} dòng thiếu mã hoặc họ tên.` : ''}`);
    } catch (error) {
        console.error('Lỗi tải file Excel nhân viên:', error);
        await showCustomAlert(`Không thể tải file Excel: ${error?.message || String(error)}`);
    } finally {
        uploadEmployeesBtn.disabled = false;
        hideLoading();
        employeesFileInput.value = '';
    }
}

function initializeEmployeeDirectory() {
    employeeSearch.addEventListener('input', () => {
        employeePage = 1;
        renderEmployees();
    });
    employeeDepartmentFilter.addEventListener('change', () => {
        employeePage = 1;
        const selectedDepartment = employeeDepartmentFilter.value;
        if (selectedDepartment) {
            employeeRecords
                .filter(employee => employeeDepartment(employee) === selectedDepartment)
                .forEach(employee => {
                    const location = employeeLocation(employee);
                    expandedEmployeeDepartments.add(`location:${location}`);
                    expandedEmployeeDepartments.add(`department:${location}\u0000${selectedDepartment}`);
                });
        }
        renderEmployees();
    });
    employeePageSizeSelect.addEventListener('change', () => {
        employeesPerPage = Number(employeePageSizeSelect.value);
        employeePage = 1;
        renderEmployees();
    });
    uploadEmployeesBtn.addEventListener('click', () => employeesFileInput.click());
    employeesFileInput.addEventListener('change', () => {
        const file = employeesFileInput.files[0];
        if (file) importEmployeesWorkbook(file);
    });
    deleteAllEmployeesBtn.addEventListener('click', async () => {
        if (!isAdmin()) {
            await showCustomAlert('Bạn không có quyền xóa danh sách nhân viên.');
            return;
        }
        if (!employeeRecords.length) {
            await showCustomAlert('Danh sách nhân viên hiện đang trống.');
            return;
        }
        const confirmed = await showCustomConfirm(`Xóa toàn bộ ${employeeRecords.length} nhân viên? Thao tác này không thể hoàn tác.`);
        if (!confirmed) return;
        showLoading();
        deleteAllEmployeesBtn.disabled = true;
        try {
            await remove(employeesRef());
            employeeRecords = [];
            employeeTaskOptionsLoaded = false;
            employeePage = 1;
            expandedEmployeeDepartments.clear();
            initializedEmployeeDepartments = false;
            employeeSearch.value = '';
            employeeDepartmentFilter.value = '';
            employeeDepartmentFilter.replaceChildren(new Option('Tên bộ phận hiện tại', ''));
            renderEmployees();
        } catch (error) {
            console.error('Lỗi xóa toàn bộ nhân viên:', error);
            await showCustomAlert(`Không thể xóa danh sách nhân viên: ${error?.message || String(error)}`);
        } finally {
            deleteAllEmployeesBtn.disabled = false;
            hideLoading();
        }
    });
    employeesBackBtn.addEventListener('click', () => {
        closeMenuDetailModal(document.getElementById('employeesModal'), false);
        sideMenuPanel.classList.add('show');
        syncMenuToggleVisibility();
        const menuButton = sideMenuPanel.querySelector('[data-menu-modal="employeesModal"]');
        if (menuButton) menuButton.focus();
    });
    employeeEditForm.addEventListener('submit', async event => {
        event.preventDefault();
        if (!isAdmin()) {
            await showCustomAlert('Bạn không có quyền chỉnh sửa nhân viên.');
            return;
        }
        const key = document.getElementById('employeeEditKey').value;
        const employee = {
            code: document.getElementById('employeeEditCode').value.trim(),
            name: document.getElementById('employeeEditName').value.trim(),
            location: document.getElementById('employeeEditLocation').value.trim(),
            department: document.getElementById('employeeEditDepartment').value.trim(),
            attendanceId: document.getElementById('employeeEditAttendanceId').value.trim(),
            position: document.getElementById('employeeEditPosition').value.trim(),
            positionDetail: document.getElementById('employeeEditPositionDetail').value.trim(),
            phone: document.getElementById('employeeEditPhone').value.trim(),
            birthDate: document.getElementById('employeeEditBirthDate').value,
            gender: document.getElementById('employeeEditGender').value,
            email: document.getElementById('employeeEditEmail').value.trim(),
            status: document.getElementById('employeeEditStatus').value
        };
        if (!employee.code || !employee.name || !employee.location || !employee.department) {
            await showCustomAlert('Mã nhân viên, họ tên, nơi làm việc và bộ phận là bắt buộc.');
            return;
        }
        const duplicate = employeeRecords.find(record =>
            record.key !== key && normalizeEmployeeText(record.code) === normalizeEmployeeText(employee.code)
        );
        if (duplicate) {
            await showCustomAlert(`Mã nhân viên ${employee.code} đã tồn tại.`);
            return;
        }

        showLoading();
        try {
            const existing = employeeRecords.find(record => record.key === key);
            employee.createdAt = existing?.createdAt || Date.now();
            employee.updatedAt = Date.now();
            await update(employeesRef(key), employee);
            employeeTaskOptionsLoaded = false;
            await loadEmployees();
            closeMenuDetailModal(employeeEditModal, false);
            await showCustomAlert('Đã cập nhật thông tin nhân viên.');
        } catch (error) {
            console.error('Lỗi cập nhật nhân viên:', error);
            await showCustomAlert(`Không thể cập nhật nhân viên: ${error?.message || String(error)}`);
        } finally {
            hideLoading();
        }
    });
    document.getElementById('cancelEmployeeEditBtn').addEventListener('click', () => {
        closeMenuDetailModal(employeeEditModal, false);
        if (employeeEditReturnFocus?.isConnected) employeeEditReturnFocus.focus();
    });
}

initializeEmployeeDirectory();

const scheduleImportFields = {
    storeVisit: {
        date: ['ngay', 'ngaylich', 'date', 'scheduledate'],
        time: ['gio', 'thoigian', 'time'],
        content: ['noidungxuly', 'noidung', 'content', 'location'],
        unit: ['donvi', 'cuahang', 'donvicuahang', 'department', 'unit', 'store'],
        assignee: ['nguoithuchien', 'nguoiphutrach', 'assignee', 'personincharge'],
        status: ['trangthai', 'status'],
        note: ['ghichu', 'note']
    },
    maintenance: {
        startDate: ['tungay', 'ngaybatdau', 'startdate', 'fromdate', 'ngay'],
        endDate: ['denngay', 'ngayketthuc', 'enddate', 'todate'],
        dueDate: ['ngaydenhan', 'denhan', 'duedate'],
        content: ['noidungbaotri', 'noidung', 'maintenancecontent', 'content'],
        equipment: ['doituong', 'doituongthietbi', 'thietbi', 'hethong', 'equipment', 'object'],
        unit: ['donviphongban', 'donvi', 'phongban', 'department', 'unit'],
        assignee: ['nguoithuchien', 'nguoiphutrach', 'assignee', 'personincharge'],
        cycle: ['chuky', 'cycle', 'period'],
        status: ['trangthai', 'status'],
        result: ['ketqua', 'result'],
        note: ['ghichu', 'note'],
        link: ['lienket', 'link', 'evidence', 'evidenceurl']
    }
};

function normalizeScheduleImportDate(value) {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        const date = `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
        return isValidYmd(date) ? date : '';
    }
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
        const parsed = XLSX.SSF.parse_date_code(value);
        if (parsed) {
            const date = `${parsed.y}-${String(parsed.m).padStart(2, '0')}-${String(parsed.d).padStart(2, '0')}`;
            return isValidYmd(date) ? date : '';
        }
    }
    const normalized = normalizeDateString(value);
    return normalized && isValidYmd(normalized) ? normalized : '';
}

function normalizeScheduleImportTime(value) {
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0 && value < 1) {
        const minutes = Math.round(value * 24 * 60) % (24 * 60);
        return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
    }
    const time = String(value ?? '').trim();
    const hourSuffixMatch = time.match(/^(\d{1,2})\s*h(?:\s*([0-5]\d))?$/i);
    if (hourSuffixMatch && Number(hourSuffixMatch[1]) <= 23) {
        return `${String(Number(hourSuffixMatch[1])).padStart(2, '0')}:${hourSuffixMatch[2] || '00'}`;
    }
    const match = time.match(/^(\d{1,2}):([0-5]\d)(?::[0-5]\d)?$/);
    if (!match || Number(match[1]) > 23) return '';
    return `${String(Number(match[1])).padStart(2, '0')}:${match[2]}`;
}

function getScheduleImportStatus(value, type) {
    const normalized = normalizeEmployeeText(value).replace(/\s+/g, ' ').trim();
    if (!normalized) return type === 'maintenance' ? 'Đã lên lịch' : 'Chưa bắt đầu';
    const statuses = type === 'maintenance'
        ? [
            [['chua bat dau', 'chua xu ly', 'da len lich', 'len lich', 'scheduled', 'pending'], 'Đã lên lịch'],
            [['dang bao tri', 'dang thuc hien', 'dang xu ly', 'in progress'], 'Đang bảo trì'],
            [['hoan thanh', 'da xu ly', 'da hoan tat', 'completed', 'done'], 'Hoàn thành'],
            [['cham tien do', 'can chu y', 'delayed', 'overdue', 'attention'], 'Cần chú ý'],
            [['cho', 'waiting', 'wait'], 'Chờ'],
            [['da huy', 'cancelled', 'canceled'], 'Đã hủy']
        ]
        : [
            [['chua bat dau', 'chua xu ly', 'pending'], 'Chưa bắt đầu'],
            [['dang thuc hien', 'dang xu ly', 'in progress'], 'Đang thực hiện'],
            [['cham tien do', 'delayed', 'overdue'], 'Chậm tiến độ'],
            [['da len lich', 'scheduled'], 'Đã lên lịch'],
            [['hoan thanh', 'da xu ly', 'completed', 'done'], 'Hoàn thành'],
            [['cho', 'waiting', 'wait'], 'Chờ'],
            [['da huy', 'cancelled', 'canceled'], 'Đã hủy']
        ];
    const match = statuses.find(([aliases]) => aliases.includes(normalized));
    return match ? match[1] : null;
}

function parseScheduleImportRows(rows, type) {
    if (!Array.isArray(rows) || rows.length < 2) {
        throw new Error('File Excel cần có dòng tiêu đề và ít nhất một dòng dữ liệu.');
    }
    const aliases = scheduleImportFields[type];
    const headerIndexes = new Map();
    rows[0].forEach((header, index) => {
        const normalized = normalizeEmployeeText(header).replace(/[^a-z0-9]/g, '');
        if (normalized) headerIndexes.set(normalized, index);
    });
    const columnIndexes = Object.fromEntries(Object.entries(aliases).map(([field, names]) => [
        field,
        names.map(name => headerIndexes.get(name)).find(index => index !== undefined) ?? -1
    ]));
    const requiredFields = type === 'maintenance'
        ? ['startDate', 'endDate', 'content', 'equipment', 'unit', 'assignee', 'cycle']
        : ['date', 'time', 'content', 'unit', 'assignee'];
    const missingHeaders = requiredFields.filter(field => columnIndexes[field] < 0);
    if (missingHeaders.length) {
        const labels = {
            date: 'Ngày',
            time: 'Giờ',
            startDate: 'Từ ngày',
            endDate: 'Đến ngày',
            content: type === 'maintenance' ? 'Nội dung bảo trì' : 'Nội dung xử lý',
            equipment: 'Đối tượng / thiết bị',
            unit: 'Đơn vị / cửa hàng',
            assignee: 'Người thực hiện',
            cycle: 'Chu kỳ'
        };
        throw new Error(`Thiếu cột bắt buộc: ${missingHeaders.map(field => labels[field]).join(', ')}.`);
    }

    const imported = [];
    const rowErrors = [];
    let previousStoreVisitDate = '';
    for (const [index, row] of rows.slice(1).entries()) {
        if (!row.some(value => String(value ?? '').trim())) continue;
        const getCell = field => columnIndexes[field] >= 0 ? row[columnIndexes[field]] : '';
        const excelRow = index + 2;
        const unit = String(getCell('unit') ?? '').trim();
        const assignee = String(getCell('assignee') ?? '').trim();
        const content = String(getCell('content') ?? '').trim();
        const status = getScheduleImportStatus(getCell('status'), type);
        const link = String(getCell('link') ?? '').trim();
        const record = {
            type,
            content,
            unit,
            assignee,
            status,
            note: String(getCell('note') ?? '').trim(),
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        if (type === 'maintenance') {
            const rawDueDate = getCell('dueDate');
            const hasDueDate = String(rawDueDate ?? '').trim() !== '';
            const hasStartDate = String(getCell('startDate') ?? '').trim() !== '';
            const hasEndDate = String(getCell('endDate') ?? '').trim() !== '';
            const cycleOptions = ['Hàng tuần', 'Hàng tháng', 'Hàng quý', '6 tháng', 'Hàng năm', 'Không định kỳ'];
            const rawCycle = String(getCell('cycle') ?? '').trim();
            record.startDate = normalizeScheduleImportDate(getCell('startDate'));
            record.endDate = normalizeScheduleImportDate(getCell('endDate'));
            record.date = record.startDate;
            record.dueDate = hasDueDate ? normalizeScheduleImportDate(rawDueDate) : '';
            record.maintenanceContent = content;
            record.equipment = String(getCell('equipment') ?? '').trim();
            record.cycle = cycleOptions.find(option => normalizeEmployeeText(option) === normalizeEmployeeText(rawCycle)) || rawCycle;
            record.result = String(getCell('result') ?? '').trim();
            record.location = unit;
            record.link = link;
            if (link) {
                try {
                    const parsedLink = new URL(link);
                    if (!['http:', 'https:'].includes(parsedLink.protocol)) throw new Error('invalid protocol');
                } catch {
                    rowErrors.push(`Dòng ${excelRow}: liên kết phải bắt đầu bằng http:// hoặc https://.`);
                }
            }
            const datesOptional = scheduleAllowsMissingDate(status);
            if ((hasStartDate && !record.startDate) || (hasEndDate && !record.endDate) ||
                (!record.startDate && !record.endDate && !datesOptional) ||
                Boolean(record.startDate) !== Boolean(record.endDate) ||
                (record.startDate && (!isValidYmd(record.startDate) || !isValidYmd(record.endDate) || record.endDate < record.startDate)) ||
                (hasDueDate && (!record.dueDate || !isValidYmd(record.dueDate) ||
                    (record.startDate && record.dueDate < record.startDate)))) {
                rowErrors.push(`Dòng ${excelRow}: ngày bắt đầu, ngày kết thúc hoặc ngày đến hạn không hợp lệ.`);
            }
            if (!record.equipment) rowErrors.push(`Dòng ${excelRow}: cần nhập đối tượng / thiết bị.`);
            if (!cycleOptions.includes(record.cycle)) rowErrors.push(`Dòng ${excelRow}: chu kỳ bảo trì không hợp lệ.`);
        } else {
            const rawDate = getCell('date');
            const hasDate = String(rawDate ?? '').trim() !== '';
            const datesOptional = scheduleAllowsMissingDate(status);
            const parsedDate = hasDate
                ? normalizeScheduleImportDate(rawDate)
                : datesOptional ? '' : previousStoreVisitDate;
            record.date = parsedDate;
            if (parsedDate) previousStoreVisitDate = parsedDate;
            const rawTime = getCell('time');
            const hasTime = rawTime !== null && rawTime !== undefined && String(rawTime).trim() !== '';
            record.time = normalizeScheduleImportTime(rawTime);
            record.location = content;
            if ((hasDate && !record.date) || (hasTime && !record.time) ||
                (!record.date && !datesOptional) ||
                (record.date && !isValidYmd(record.date)) ||
                (!record.time && !datesOptional) ||
                (record.time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(record.time))) {
                rowErrors.push(`Dòng ${excelRow}: ngày hoặc giờ không hợp lệ.`);
            }
        }

        if (!unit || !assignee || !content) {
            rowErrors.push(`Dòng ${excelRow}: cần nhập nội dung, đơn vị và người thực hiện.`);
        }
        if (parseScheduleAssignees(assignee).length > 5) {
            rowErrors.push(`Dòng ${excelRow}: chỉ được nhập tối đa 5 người thực hiện.`);
        }
        if (!status) {
            rowErrors.push(`Dòng ${excelRow}: trạng thái không hợp lệ.`);
        }
        imported.push(record);
    }
    if (!imported.length) throw new Error('Không tìm thấy dòng dữ liệu hợp lệ trong file.');
    if (imported.length > 1000) throw new Error('Mỗi lần chỉ được nhập tối đa 1.000 lịch.');
    if (rowErrors.length) {
        const displayedErrors = rowErrors.slice(0, 8).join('\n');
        const remaining = rowErrors.length - 8;
        throw new Error(`Không thể nhập do có lỗi:\n${displayedErrors}${remaining > 0 ? `\n... và ${remaining} lỗi khác.` : ''}`);
    }
    return imported;
}

async function exportScheduleWorkbook(type) {
    if (!isAdmin()) throw new Error('Bạn không có quyền xuất lịch.');
    const requestUserId = getCurrentUserId();
    if (!requestUserId) throw new Error('Không xác định được tài khoản đang đăng nhập.');

    const snapshot = await get(scheduleRef());
    if (requestUserId !== getCurrentUserId()) throw new Error('Tài khoản đã thay đổi. Vui lòng thử xuất lại.');
    const records = [];
    if (snapshot.exists()) {
        snapshot.forEach(yearSnapshot => {
            yearSnapshot.forEach(monthSnapshot => {
                monthSnapshot.forEach(daySnapshot => {
                    const date = `${yearSnapshot.key}-${String(monthSnapshot.key).padStart(2, '0')}-${String(daySnapshot.key).padStart(2, '0')}`;
                    if (!isValidYmd(date)) return;
                    daySnapshot.forEach(scheduleSnapshot => {
                        const schedule = scheduleSnapshot.val();
                        if (schedule && typeof schedule === 'object' && schedule.type === type) {
                            records.push({
                                ...schedule,
                                id: scheduleSnapshot.key,
                                date: typeof schedule.date === 'string' ? schedule.date : date
                            });
                        }
                    });
                });
            });
        });
    }
    records.sort((first, second) =>
        first.date.localeCompare(second.date) ||
        String(first.time || '07:00').localeCompare(String(second.time || '07:00')) ||
        Number(first.createdAt || 0) - Number(second.createdAt || 0)
    );
    if (!records.length) {
        await showCustomAlert(type === 'maintenance' ? 'Chưa có lịch bảo trì để xuất.' : 'Chưa có lịch đi cửa hàng để xuất.');
        return;
    }

    const statusLabels = type === 'maintenance'
        ? {
            'Đã lên lịch': 'ĐÃ LÊN LỊCH',
            'Đang bảo trì': 'ĐANG BẢO TRÌ',
            'Hoàn thành': 'ĐÃ HOÀN TẤT',
            'Cần chú ý': 'CẦN CHÚ Ý',
            'Chờ': 'CHỜ',
            'Đã hủy': 'ĐÃ HỦY',
            'Chưa bắt đầu': 'ĐÃ LÊN LỊCH',
            'Đang thực hiện': 'ĐANG BẢO TRÌ'
        }
        : {
            'Chưa bắt đầu': 'CHƯA XỬ LÝ',
            'Đã lên lịch': 'ĐÃ LÊN LỊCH',
            'Đang thực hiện': 'ĐANG XỬ LÝ',
            'Chậm tiến độ': 'CHẬM TIẾN ĐỘ',
            'Hoàn thành': 'ĐÃ XỬ LÝ',
            'Chờ': 'CHỜ',
            'Đã hủy': 'ĐÃ HỦY'
        };
    const formatExcelDate = value => {
        if (!isValidYmd(value)) return '';
        const [year, month, day] = value.split('-').map(Number);
        return new Date(year, month - 1, day);
    };
    const headers = type === 'maintenance'
        ? ['STT', 'Đơn vị', 'Từ ngày', 'Đến ngày', 'Người thực hiện', 'Trạng thái', 'Nội dung bảo trì', 'Đối tượng / thiết bị', 'Chu kỳ', 'Ngày đến hạn', 'Kết quả', 'Ghi chú', 'Bằng chứng', 'Liên kết']
        : ['Ngày', 'Giờ', 'Nội dung xử lý', 'Đơn vị', 'Người thực hiện', 'Trạng thái', 'Ghi chú'];
    const rows = records.map((schedule, index) => type === 'maintenance'
        ? [
            index + 1,
            schedule.unit || schedule.location || '',
            formatExcelDate(schedule.startDate || schedule.date),
            formatExcelDate(schedule.endDate || schedule.date),
            schedule.assignee || '',
            statusLabels[schedule.status] || statusLabels['Đã lên lịch'],
            schedule.maintenanceContent || schedule.content || '',
            schedule.equipment || '',
            schedule.cycle || '',
            formatExcelDate(schedule.dueDate),
            schedule.result || '',
            schedule.note || '',
            schedule.evidenceName || schedule.evidenceUrl || '',
            schedule.link || ''
        ]
        : [
            formatExcelDate(schedule.date),
            schedule.time || '',
            schedule.content || '',
            schedule.unit || schedule.location || '',
            schedule.assignee || '',
            statusLabels[schedule.status] || statusLabels['Chưa bắt đầu'],
            schedule.note || ''
        ]);
    const workbook = new ExcelJS.Workbook();
    const worksheet = addExportWorksheet(
        workbook,
        type === 'maintenance' ? 'Lịch bảo trì' : 'Lịch cửa hàng',
        headers,
        rows
    );
    (type === 'maintenance' ? [3, 4, 10] : [1]).forEach(column => {
        worksheet.getColumn(column).numFmt = 'dd-mm-yyyy';
    });
    const now = new Date();
    const dateSuffix = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const fileName = type === 'maintenance'
        ? `lich-bao-tri_${dateSuffix}.xlsx`
        : `lich-cua-hang_${dateSuffix}.xlsx`;
    await downloadTaskWorkbook(workbook, fileName);
}

async function importScheduleWorkbook(file, type) {
    if (!isAdmin()) throw new Error('Bạn không có quyền tải lịch lên.');
    if (!file) throw new Error('Vui lòng chọn file Excel.');
    if (!/\.(xlsx|xls|csv)$/i.test(file.name)) throw new Error('Chỉ hỗ trợ file .xlsx, .xls hoặc .csv.');
    if (file.size > 10 * 1024 * 1024) throw new Error('File không được vượt quá 10 MB.');
    const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!worksheet) throw new Error('File Excel không có trang tính.');
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '', raw: true });
    const records = parseScheduleImportRows(rows, type);
    const typeLabel = type === 'maintenance' ? 'lịch bảo trì' : 'lịch đi cửa hàng';
    if (!await showCustomConfirm(`Sẽ thêm ${records.length} ${typeLabel}. Dữ liệu hiện có sẽ được giữ nguyên. Bạn muốn tiếp tục?`)) return;

    const userId = getCurrentUserId();
    if (!userId) throw new Error('Không xác định được tài khoản đang đăng nhập.');
    const updates = {};
    records.forEach(record => {
        const storageDate = record.date || getTodayString();
        const [year, month, day] = storageDate.split('-');
        const id = push(scheduleRef(year, month, day)).key;
        if (!id) throw new Error('Không thể tạo mã cho một trong các lịch cần nhập.');
        updates[`storeMaintenanceSchedules/${userId}/${year}/${month}/${day}/${id}`] = record;
    });
    await update(ref(db), updates);
    await loadScheduleList();
    await showCustomAlert(`Đã nhập thành công ${records.length} ${typeLabel}.`);
}

if (scheduleForm) {
    scheduleDateInput.value = getTodayString();
    maintenanceStartDateInput.value = getTodayString();
    maintenanceEndDateInput.value = getTodayString();
    scheduleStatusInput.addEventListener('change', syncScheduleDateRequirements);
    syncScheduleDateRequirements();
    scheduleForm.addEventListener('submit', async event => {
        event.preventDefault();
        if (!isAdmin()) { await showCustomAlert('Bạn không có quyền quản lý lịch.'); return; }

        const isMaintenance = activeScheduleType === 'maintenance';
        const date = isMaintenance ? maintenanceStartDateInput.value : scheduleDateInput.value;
        const endDate = isMaintenance ? maintenanceEndDateInput.value : date;
        const dueDate = isMaintenance ? maintenanceDueDateInput.value : '';
        const time = isMaintenance ? '' : scheduleTimeInput.value;
        const content = isMaintenance ? maintenanceContentInput.value.trim() : scheduleLocationInput.value.trim();
        const equipment = isMaintenance ? maintenanceEquipmentInput.value.trim() : '';
        const unit = scheduleUnitInput.value.trim();
        const assignee = scheduleAssigneeInput.value.trim();
        const type = scheduleTypeInput.value;
        const status = scheduleStatusInput.value;
        const datesOptional = scheduleAllowsMissingDate(status);
        const storageDate = date || editingScheduleDate || getTodayString();
        const selectedEvidence = isMaintenance ? maintenanceEvidenceInput.files[0] : null;
        if (parseScheduleAssignees(assignee).length > 5) {
            await showCustomAlert('Chỉ được chọn tối đa 5 người thực hiện.');
            return;
        }
        if ((!date && !datesOptional) || (!endDate && !datesOptional) ||
            (isMaintenance && Boolean(date) !== Boolean(endDate)) ||
            (date && !isValidYmd(date)) || (endDate && !isValidYmd(endDate)) ||
            (date && endDate && endDate < date) ||
            (dueDate && !isValidYmd(dueDate)) ||
            (!isMaintenance && ((!time && !datesOptional) ||
                (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)))) ||
            !content || !unit || !assignee ||
            (isMaintenance && !equipment)) {
            await showCustomAlert(isMaintenance
                ? 'Vui lòng nhập nội dung, thiết bị, đơn vị, người phụ trách và khoảng ngày hợp lệ.'
                : 'Vui lòng nhập ngày, giờ hợp lệ, nội dung xử lý, đơn vị và người phụ trách.');
            return;
        }
        if (isMaintenance && (!maintenanceCycleInput.value ||
            (dueDate && date && dueDate < date))) {
            await showCustomAlert('Vui lòng chọn chu kỳ và ngày đến hạn hợp lệ.');
            return;
        }
        const validStatuses = isMaintenance
            ? ['Đã lên lịch', 'Đang bảo trì', 'Hoàn thành', 'Cần chú ý', 'Chờ', 'Đã hủy']
            : ['Chưa bắt đầu', 'Đang thực hiện', 'Chậm tiến độ', 'Đã lên lịch', 'Hoàn thành', 'Chờ', 'Đã hủy'];
        if (type !== activeScheduleType || !validStatuses.includes(status)) {
            await showCustomAlert('Loại lịch không khớp hoặc trạng thái không hợp lệ.');
            return;
        }
        if (selectedEvidence && selectedEvidence.size > 10 * 1024 * 1024) {
            await showCustomAlert('Tệp bằng chứng không được vượt quá 10 MB.');
            return;
        }

        const link = isMaintenance ? maintenanceLinkInput.value.trim() : '';
        if (link) {
            try {
                const parsedLink = new URL(link);
                if (!['http:', 'https:'].includes(parsedLink.protocol)) throw new Error('invalid protocol');
            } catch (error) {
                await showCustomAlert('Vui lòng nhập liên kết bắt đầu bằng http:// hoặc https://.');
                return;
            }
        }

        const [year, month, day] = storageDate.split('-');
        const now = Date.now();
        const isEditing = Boolean(editingScheduleId);
        const schedule = {
            date,
            time,
            type,
            content,
            unit,
            location: isMaintenance ? unit : content,
            assignee,
            status,
            note: isMaintenance ? maintenanceNoteInput.value.trim() : scheduleNoteInput.value.trim(),
            createdAt: editingScheduleCreatedAt || now,
            updatedAt: now
        };
        if (isMaintenance) {
            schedule.startDate = date;
            schedule.endDate = endDate;
            schedule.dueDate = dueDate;
            schedule.maintenanceContent = content;
            schedule.equipment = equipment;
            schedule.cycle = maintenanceCycleInput.value;
            schedule.result = maintenanceResultInput.value.trim();
            schedule.link = link;
            schedule.evidenceUrl = editingScheduleData?.evidenceUrl || '';
            schedule.evidenceName = editingScheduleData?.evidenceName || '';
            schedule.evidencePath = editingScheduleData?.evidencePath || '';
        }

        const scheduleControls = [
            ...Array.from(scheduleForm.elements),
            ...scheduleList.querySelectorAll('button')
        ];
        const previousDisabledStates = scheduleControls.map(control => control.disabled);
        scheduleControls.forEach(control => { control.disabled = true; });
        showLoading();
        try {
            const scheduleId = editingScheduleId || push(scheduleRef(year, month, day)).key;
            if (!scheduleId) throw new Error('Không thể tạo mã lịch.');
            if (selectedEvidence) {
                const evidencePath = `storeMaintenanceEvidence/${getCurrentUserId()}/${scheduleId}/${encodeURIComponent(selectedEvidence.name)}`;
                const uploadedEvidence = await uploadBytes(firebaseStorageRef(storage, evidencePath), selectedEvidence, {
                    contentType: selectedEvidence.type || 'application/octet-stream'
                });
                schedule.evidenceUrl = await getDownloadURL(uploadedEvidence.ref);
                schedule.evidenceName = selectedEvidence.name;
                schedule.evidencePath = evidencePath;
            }
            if (editingScheduleId) {
                const [oldYear, oldMonth, oldDay] = editingScheduleDate.split('-');
                if (editingScheduleDate === storageDate) {
                    await update(scheduleRef(oldYear, oldMonth, oldDay, scheduleId), schedule);
                } else {
                    await update(ref(db), {
                        [`storeMaintenanceSchedules/${getCurrentUserId()}/${oldYear}/${oldMonth}/${oldDay}/${scheduleId}`]: null,
                        [`storeMaintenanceSchedules/${getCurrentUserId()}/${year}/${month}/${day}/${scheduleId}`]: schedule
                    });
                }
            } else {
                await set(scheduleRef(year, month, day, scheduleId), schedule);
            }
            setScheduleFormMode();
            closeMenuDetailModal(scheduleEditorModal, false);
            await loadScheduleList();
            await showCustomAlert(isEditing ? 'Đã cập nhật lịch thành công.' : 'Đã thêm lịch thành công.');
        } catch (e) {
            console.error('Lỗi lưu lịch cửa hàng/bảo trì:', e);
            await showCustomAlert(`Không thể lưu lịch: ${e && e.message ? e.message : String(e)}`);
        } finally {
            scheduleControls.forEach((control, index) => {
                control.disabled = previousDisabledStates[index];
            });
            hideLoading();
        }
    });

    openScheduleFormBtn.onclick = () => {
        setScheduleFormMode();
        openScheduleEditorModal();
    };
    importScheduleBtn.onclick = () => scheduleImportFile.click();
    exportScheduleBtn.onclick = async () => {
        exportScheduleBtn.disabled = true;
        showLoading();
        try {
            await exportScheduleWorkbook(activeScheduleType);
        } catch (error) {
            console.error('Lỗi xuất lịch ra Excel:', error);
            await showCustomAlert(`Không thể xuất lịch: ${error?.message || String(error)}`);
        } finally {
            exportScheduleBtn.disabled = false;
            hideLoading();
        }
    };
    scheduleImportFile.addEventListener('change', async () => {
        const file = scheduleImportFile.files?.[0];
        if (!file) return;
        importScheduleBtn.disabled = true;
        showLoading();
        try {
            await importScheduleWorkbook(file, activeScheduleType);
        } catch (error) {
            console.error('Lỗi nhập lịch từ Excel:', error);
            await showCustomAlert(`Không thể nhập lịch: ${error?.message || String(error)}`);
        } finally {
            scheduleImportFile.value = '';
            importScheduleBtn.disabled = false;
            hideLoading();
        }
    });
    refreshScheduleBtn.onclick = loadScheduleList;
    cancelScheduleEditBtn.onclick = () => closeMenuDetailModal(scheduleEditorModal);
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
        await showCustomAlert('❌ Không thể đánh dấu NB trùng với ngày NL');
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
        await showCustomAlert('❌ Không thể đánh dấu NL trùng với ngày NB');
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
        if (!isAdmin()) { await showCustomAlert('Bạn không có quyền quản lý ngày NB.'); return; }
        if (nbTempSelectedDates.length === 0) {
            await showCustomAlert('Vui lòng chọn ít nhất một ngày!');
            return;
        }

        try {
            const updates = {};
            for (const dateStr of nbTempSelectedDates) {
                if (isNlDay(dateStr)) throw new Error('Ngày ' + dateStr + ' đã là NL');
                const [year, month, day] = dateStr.split('-');
                updates[`nbDays/${getCurrentUserId()}/${year}/${month}/${day}`] = true;
            }
            await update(ref(db), updates);
            for (const dateStr of nbTempSelectedDates) {
                nbDays[dateStr] = true;
            }

            // Thông báo thành công
            await showCustomAlert('✔️ Đã lựa chọn ' + nbTempSelectedDates.length + ' ngày NB thành công!');

            // Đóng modal
            nbSelectModal.style.display = 'none';

            // Tải lại lịch để cập nhật
            if (selectedDate) {
                loadTasks(selectedDate);
            }
            renderCalendar();
        } catch (e) {
            console.error('Lỗi lưu ngày NB:', e);
            await showCustomAlert('❌ Lỗi khi lưu ngày NB: ' + e.message);
        }
    };
}

// Xác nhận lựa chọn ngày NL
if (nlConfirmButton) {
    nlConfirmButton.onclick = async () => {
        if (!isAdmin()) { await showCustomAlert('Bạn không có quyền quản lý ngày NL.'); return; }
        if (nlTempSelectedDates.length === 0) {
            await showCustomAlert('Vui lòng chọn ít nhất một ngày!');
            return;
        }

        try {
            // kiểm tra xung đột với NB trước khi ghi
            for (const dateStr of nlTempSelectedDates) {
                if (isNbDay(dateStr)) throw new Error('Ngày ' + formatDisplayDate(dateStr) + ' đã được đánh dấu NB');
            }
            const updates = {};
            for (const dateStr of nlTempSelectedDates) {
                const [year, month, day] = dateStr.split('-');
                updates[`nlDays/${getCurrentUserId()}/${year}/${month}/${day}`] = true;
            }
            await update(ref(db), updates);
            for (const dateStr of nlTempSelectedDates) {
                nlDays[dateStr] = true;
            }
            await showCustomAlert('✔️ Đã lựa chọn ' + nlTempSelectedDates.length + ' ngày NL thành công!');
            nlSelectModal.style.display = 'none';
            if (selectedDate) {
                loadTasks(selectedDate);
            }
            renderCalendar();
        } catch (e) {
            console.error('Lỗi lưu ngày NL:', e);
            await showCustomAlert('❌ Lỗi khi lưu ngày NL: ' + e.message);
        }
    };
}

/* Mở modal nhân bản nâng cao */
const duplicateDayBtn = document.getElementById("duplicateDayBtn");
if (duplicateDayBtn) {
    duplicateDayBtn.onclick = async () => {
        if (!isAdmin()) { await showCustomAlert('Bạn không có quyền sử dụng tính năng này'); return; }
        if (!selectedDate) { await showCustomAlert("Vui lòng chọn ngày trước!"); return; }
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
    if (!d) { showCustomAlert("Vui lòng chọn ngày hợp lệ!"); return; }
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
    if (!selectedDate) { await showCustomAlert("Vui lòng chọn ngày nguồn!"); return; }
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

        if (sourceTaskCount === 0) { await showCustomAlert("Không có công việc để nhân bản!"); return; }

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
                        const sourceTaskStart = task.startDate || sourceDateKey;
                        const sourceStartDate = parseYMD(sourceTaskStart);
                        const targetStartDate = parseYMD(newTargetDateStr);

                        let newEndDate = newTargetDateStr;
                        if (task.endDate) {
                            const originalEndDate = parseYMD(task.endDate);
                            const durationDays = Math.round((originalEndDate - sourceStartDate) / (1000 * 60 * 60 * 24));
                            if (durationDays > 0) {
                                const shiftedEnd = new Date(targetStartDate);
                                shiftedEnd.setDate(shiftedEnd.getDate() + durationDays);
                                newEndDate = toYMDLocal(shiftedEnd);
                            }
                        }

                        await push(tasksRef(nty, ntm, ntw, newTargetDateStr), {
                            ...task,
                            startDate: newTargetDateStr,
                            endDate: newEndDate
                        });
                    }
                }
            } else {
                // Nhân bản ngày: dùng công việc từ selectedDate
                const tasksArr = allSourceTasks[selectedDate] || [];
                for (const task of tasksArr) {
                    const sourceTaskStart = task.startDate || selectedDate;
                    const sourceStartDate = parseYMD(sourceTaskStart);
                    const targetStartDate = parseYMD(targetDate);

                    let newEndDate = targetDate;
                    if (task.endDate) {
                        const originalEndDate = parseYMD(task.endDate);
                        const durationDays = Math.round((originalEndDate - sourceStartDate) / (1000 * 60 * 60 * 24));
                        if (durationDays > 0) {
                            const shiftedEnd = new Date(targetStartDate);
                            shiftedEnd.setDate(shiftedEnd.getDate() + durationDays);
                            newEndDate = toYMDLocal(shiftedEnd);
                        }
                    }

                    await push(tasksRef(ty, tm, tw, targetDate), {
                        ...task,
                        startDate: targetDate,
                        endDate: newEndDate
                    });
                }
            }
        };

        if (duplicateType.value === "multi") {
            showLoading();
            try {
                if (advancedDates.length === 0) {
                    const targetDate = prompt("Nhập ngày muốn nhân bản tới (YYYY-MM-DD):");
                    if (!targetDate || targetDate === selectedDate) { await showCustomAlert("Ngày đích không hợp lệ hoặc trùng ngày nguồn!"); return; }
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
                if (!targetWeekSelect.value) { await showCustomAlert("Vui lòng chọn tuần đích!"); return; }
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
                if (!targetMonthPicker.value) { await showCustomAlert("Vui lòng chọn tháng đích!"); return; }
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
        await showCustomAlert("❌ Có lỗi khi nhân bản!");
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
                        <td>${t.description || ''}</td>
                        <td>${t.requester || ''}</td>
                        <td>${t.unit || ''}</td>
                        <td>${t.assignee || ''}</td>
                        <td>${t.startDate ? formatDisplayDate(t.startDate) : ''}</td>
                        <td>${t.endDate ? formatDisplayDate(t.endDate) : ''}</td>
                        <td>${t.result || ''}</td>
                        <td>${t.direction || ''}</td>
                        <td><span class="${statusClass(t.status || 'Chưa bắt đầu')}">${t.status || 'Chưa bắt đầu'}</span></td>
                        <td>${t.completion || ''}</td>
                        <td>${t.note || ''}</td>
                        <td>
                            <div class="task-actions">
                                <button class="btn-duplicate icon-action" aria-label="Nhân bản"></button>
                                <button class="btn-edit icon-action" aria-label="Sửa"></button>
                                <button class="btn-delete icon-action" aria-label="Xóa"></button>
                            </div>
                        </td>
                    `;
                    appendTaskMobileCard(row);
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
        if (!isAdmin()) {
            await showCustomAlert('Bạn không có quyền xóa công việc');
            return;
        }

        if (!selectedDate) { await showCustomAlert("Vui lòng chọn ngày trước!"); return; }
        const [y, m] = selectedDate.split("-");
        const w = getWeekNumber(selectedDate);

        // Đếm số công việc cần xóa
        const cnt = await countTasksForDay(selectedDate);
        if (cnt === 0) { await showCustomAlert("Không có công việc để xóa ở ngày này!"); return; }

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
        if (!isAdmin()) {
            await showCustomAlert('Bạn không có quyền xóa công việc');
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
                await new Promise(r => requestAnimationFrame(r));
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
        if (!isAdmin()) {
            await showCustomAlert('Bạn không có quyền xóa công việc');
            return;
        }

        try {
            // Xác định tháng: ưu tiên monthPicker, fallback selectedDate
            let y, m;
            if (monthPicker && monthPicker.value) {
                [y, m] = monthPicker.value.split("-");
            } else {
                if (!selectedDate) { await showCustomAlert("Vui lòng chọn ngày hoặc chọn tháng trước!"); return; }
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
                await new Promise(r => requestAnimationFrame(r));
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
    document.querySelectorAll(".task-card-checkbox").forEach(cb => {
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
            if (!isAdmin()) {
                await showCustomAlert('Bạn không có quyền xóa công việc');
                return;
            }

            // Lấy tất cả checkbox đã được chọn
            const selected = document.querySelectorAll(".task-checkbox:checked");
            if (selected.length === 0) { await showCustomAlert("Vui lòng chọn ít nhất 1 công việc!"); return; }

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
                hideLoading();
                await new Promise(r => requestAnimationFrame(r));
                await showCustomAlert(`✅ Đã xóa ${selected.length} công việc`);
            } catch (error) {
                hideLoading();
                await new Promise(r => requestAnimationFrame(r));
                await showCustomAlert(`❌ Có lỗi khi xóa: ${error && error.message ? error.message : String(error)}`);
            }
            selectAllCheckbox.checked = false; // Bỏ chọn checkbox "chọn tất cả"
        }
    };
}

if (deleteSelectedMobileBtn && deleteSelect) {
    deleteSelectedMobileBtn.addEventListener('click', () => {
        deleteSelect.value = 'selected';
        deleteSelect.dispatchEvent(new Event('change', { bubbles: true }));
    });
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
            try {
                await recordSuccessfulLogin(matched, 'Ứng dụng');
            } catch (logError) {
                console.error('Không thể lưu nhật ký đăng nhập ứng dụng:', logError);
            }
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
function isAdmin() {
    const role = getLoggedInUserRole();
    return role === 'admin' || role === 'superadmin' || role === 'department';
}

/** Ẩn nút ☰ Menu khi sidebar đang mở (không đè chữ tiêu đề); member không thấy nút. */
function syncMenuToggleVisibility() {
    if (!menuToggleBtn) return;
    if (!isAdmin()) {
        menuToggleBtn.style.display = 'none';
        if (sideMenuPanel) sideMenuPanel.classList.remove('show');
        menuDetailModals.forEach(closeMenuDetailModal);
        scheduleLoadToken++;
        nbItLoadToken++;
        return;
    }
    const panelOpen = sideMenuPanel && sideMenuPanel.classList.contains('show');
    menuToggleBtn.style.display = panelOpen ? 'none' : 'inline-block';
}

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
        showCustomAlert('👤 Thành viên chỉ được xem công việc của ngày hôm nay');
        return false;
    }
    return true;
}

// Ẩn/Hiện UI dựa trên role khi app khởi động
function applyRolePermissions() {
    const isReadOnlyRole = !isAdmin();
    const isDepartment = getLoggedInUserRole() === 'department';

    // Ẩn nút toggle menu cho member; khi sidebar mở cũng ẩn để không đè tiêu đề
    syncMenuToggleVisibility();
    const workScheduleMenu = document.querySelector('.side-menu-content > [data-menu-modal="workScheduleModal"]');
    if (workScheduleMenu) workScheduleMenu.style.display = isDepartment ? 'none' : '';

    // Ẩn nút lựa chọn NB cho member
    if (selectNbDayBtn) selectNbDayBtn.style.display = isReadOnlyRole ? 'none' : 'inline-block';
    // Ẩn nút lựa chọn NL cho member
    if (selectNlDayBtn) selectNlDayBtn.style.display = isReadOnlyRole ? 'none' : 'inline-block';

    // Ẩn nút nhân bản công việc cho member
    const duplicateDayBtn = document.getElementById('duplicateDayBtn');
    if (duplicateDayBtn) duplicateDayBtn.style.display = isReadOnlyRole ? 'none' : 'inline-block';

    // Ẩn dropdown xóa cho member
    const deleteSelectMain = document.getElementById('deleteSelectMain');
    if (deleteSelectMain) deleteSelectMain.style.display = isReadOnlyRole ? 'none' : 'inline-block';
    if (deleteSelect) deleteSelect.style.display = isReadOnlyRole ? 'none' : 'inline-block';
    syncMobileDeleteActionVisibility();

    // Ẩn label + dropdown chọn tuần cho member
    const weekLabel = Array.from(document.querySelectorAll('label')).find(l => l.textContent.includes('Chọn tuần'));
    const weekSelect = document.getElementById('weekSelect');
    if (weekLabel) weekLabel.style.display = isReadOnlyRole ? 'none' : '';
    if (weekSelect) weekSelect.style.display = isReadOnlyRole ? 'none' : '';

    // Ẩn label + select chọn tháng cho member
    const monthPickerLabel = Array.from(document.querySelectorAll('label')).find(l => l.textContent.includes('Chọn tháng'));
    const monthPicker = document.getElementById('monthPicker');
    if (monthPickerLabel) monthPickerLabel.style.display = isReadOnlyRole ? 'none' : '';
    if (monthPicker) monthPicker.style.display = isReadOnlyRole ? 'none' : '';

    // Ẩn nút chuyển tháng cho member
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');
    if (prevBtn) prevBtn.style.display = isReadOnlyRole ? 'none' : '';
    if (nextBtn) nextBtn.style.display = isReadOnlyRole ? 'none' : '';

    // Ẩn nút action trong bảng công việc cho member
    if (isReadOnlyRole) {
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
    if (sideMenuPanel) sideMenuPanel.classList.remove('show');
    menuDetailModals.forEach(menuModal => closeMenuDetailModal(menuModal, false));
    scheduleLoadToken++;
    nbItLoadToken++;
    if (scheduleList) scheduleList.replaceChildren();
    if (scheduleForm) setScheduleFormMode();
    if (scheduleDateInput) scheduleDateInput.value = getTodayString();
    document.getElementById('mainContent').style.display = 'none';
    loginOverlay.classList.remove('hidden');
}

// Bind nút logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) logoutBtn.onclick = logout;

// ========== SEARCH & FILTER FUNCTIONS ==========
async function searchTasks() {
    const requestId = ++taskSearchRequestId;
    // Always use the latest search input value on button click
    currentSearch.search = searchInput.value.trim().toLowerCase();
    currentSearch.period = searchPeriod.value;
    currentSearch.date = searchDate.value;
    currentSearch.month = searchMonth.value;
    currentSearch.year = searchYear.value;

    if (currentSearch.period === 'all' && !currentSearch.search) {
        // If no search, load normal selected date
        if (selectedDate) {
            const selectedDay = document.querySelector('#calendar .day.selected-day');
            if (selectedDay) {
                selectDate(selectedDate, selectedDay);
            } else {
                selectedDateTitle.innerText = `Công việc ngày ${formatDisplayDate(selectedDate)}`;
                loadTasks(selectedDate);
            }
        } else {
            const today = getTodayString();
            const todayCell = document.querySelector('#calendar .day.today');
            if (todayCell) {
                selectDate(today, todayCell);
            } else {
                selectedDate = today;
                selectedDateTitle.innerText = `Công việc ngày ${formatDisplayDate(today)}`;
                loadTasks(today);
            }
        }
        return;
    }

    // Load searched tasks
    await loadSearchedTasks(requestId);
}

async function clearSearch() {
    if (!searchInput) return;
    searchInput.value = '';
    currentSearch.search = '';
    updateClearSearchButton();
    await searchTasks();
}

function updateClearSearchButton() {
    if (clearSearchBtn) clearSearchBtn.hidden = !searchInput?.value;
}

async function loadSearchedTasks(requestId = ++taskSearchRequestId) {
    // Show loading
    loadingIndicator.style.display = 'block';

    try {
        const uid = getCurrentUserId();
        if (!uid) return;

        let tasks = [];

        if (currentSearch.period === 'all') {
            // Load all tasks
            const r = ref(db, `tasks/${uid}`);
            const snap = await get(r);
            if (snap.exists()) {
                snap.forEach(yearSnap => {
                    const year = yearSnap.key;
                    yearSnap.forEach(monthSnap => {
                        const month = monthSnap.key;
                        monthSnap.forEach(weekSnap => {
                            const week = weekSnap.key;
                            weekSnap.forEach(dateSnap => {
                                const date = dateSnap.key;
                                dateSnap.forEach(taskSnap => {
                                    const task = taskSnap.val();
                                    tasks.push({
                                        id: taskSnap.key,
                                        ...task,
                                        date: date,
                                        week: week,
                                        month: month,
                                        year: year
                                    });
                                });
                            });
                        });
                    });
                });
            }
        } else {
            // Load tasks for specific period
            let paths = [];
            if (currentSearch.period === 'day' && currentSearch.date) {
                const [y, m, d] = currentSearch.date.split('-');
                const w = getWeekNumber(currentSearch.date);
                const directPath = `${y}/${m}/${w}/${currentSearch.date}`;
                paths = [directPath];

                // Nếu không có dữ liệu tại đường dẫn theo tuần chuẩn, quét toàn bộ tháng để tìm ngày đó.
                const directSnap = await get(ref(db, `tasks/${uid}/${directPath}`));
                if (!directSnap.exists()) {
                    const monthSnap = await get(ref(db, `tasks/${uid}/${y}/${m}`));
                    if (monthSnap.exists()) {
                        monthSnap.forEach(weekSnap => {
                            weekSnap.forEach(dateSnap => {
                                if (dateSnap.key === currentSearch.date) {
                                    paths.push(`${y}/${m}/${weekSnap.key}/${dateSnap.key}`);
                                }
                            });
                        });
                    }
                }
            } else if (currentSearch.period === 'week' && currentSearch.date) {
                // For week, use the week containing the selected date
                const [y, m, d] = currentSearch.date.split('-');
                const w = getWeekNumber(currentSearch.date);
                paths = [`${y}/${m}/${w}`];
            } else if (currentSearch.period === 'month' && currentSearch.month) {
                const [y, m] = currentSearch.month.split('-');
                // Load all weeks in month
                const r = ref(db, `tasks/${uid}/${y}/${m}`);
                const snap = await get(r);
                if (snap.exists()) {
                    snap.forEach(weekSnap => {
                        paths.push(`${y}/${m}/${weekSnap.key}`);
                    });
                }
            } else if (currentSearch.period === 'year' && currentSearch.year) {
                const y = currentSearch.year;
                // Load all months in year
                const r = ref(db, `tasks/${uid}/${y}`);
                const snap = await get(r);
                if (snap.exists()) {
                    snap.forEach(monthSnap => {
                        const m = monthSnap.key;
                        monthSnap.forEach(weekSnap => {
                            paths.push(`${y}/${m}/${weekSnap.key}`);
                        });
                    });
                }
            }

            // Load tasks from paths
            for (const path of paths) {
                const r = ref(db, `tasks/${uid}/${path}`);
                const snap = await get(r);
                if (!snap.exists()) continue;

                const levels = path.split('/');
                if (levels.length === 4) {
                    // path: year/month/week/date -> snapshot contains task entries
                    const [y, m, w, date] = levels;
                    snap.forEach(taskSnap => {
                        const task = taskSnap.val();
                        tasks.push({
                            id: taskSnap.key,
                            ...task,
                            date: date,
                            week: w,
                            month: m,
                            year: y
                        });
                    });
                } else if (levels.length === 3) {
                    // path: year/month/week -> snapshot contains dates
                    const [y, m, w] = levels;
                    snap.forEach(dateSnap => {
                        const date = dateSnap.key;
                        dateSnap.forEach(taskSnap => {
                            const task = taskSnap.val();
                            tasks.push({
                                id: taskSnap.key,
                                ...task,
                                date: date,
                                week: w,
                                month: m,
                                year: y
                            });
                        });
                    });
                }
            }
        }

        // Apply text search filter
        if (currentSearch.search) {
            tasks = tasks.filter(task =>
                (task.content && task.content.toLowerCase().includes(currentSearch.search)) ||
                (task.description && task.description.toLowerCase().includes(currentSearch.search)) ||
                (task.requester && task.requester.toLowerCase().includes(currentSearch.search)) ||
                (task.unit && task.unit.toLowerCase().includes(currentSearch.search)) ||
                (task.assignee && task.assignee.toLowerCase().includes(currentSearch.search)) ||
                (task.result && task.result.toLowerCase().includes(currentSearch.search)) ||
                (task.direction && task.direction.toLowerCase().includes(currentSearch.search)) ||
                (task.note && task.note.toLowerCase().includes(currentSearch.search))
            );
        }

        if (requestId !== taskSearchRequestId) return;

        // Render searched tasks
        renderSearchedTasks(tasks);

    } catch (error) {
        if (requestId !== taskSearchRequestId) return;
        console.error('Error loading searched tasks:', error);
        await showCustomAlert('Lỗi khi tải công việc đã tìm kiếm');
    } finally {
        if (requestId === taskSearchRequestId) loadingIndicator.style.display = 'none';
    }
}

function appendTaskMobileCard(row) {
    const cells = Array.from(row.cells);
    if (cells.length < 15) return;

    const fieldLabels = [
        'Chọn',
        'STT',
        'Công việc',
        'Mô tả',
        'Người yêu cầu',
        'Đơn vị',
        'Phụ trách',
        'Ngày bắt đầu',
        'Ngày kết thúc',
        'Kết quả',
        'Hướng xử lý',
        'Trạng thái',
        '% Hoàn thành',
        'Ghi chú',
        'Hành động'
    ];
    const sourceCheckbox = cells[0].querySelector('.task-checkbox');
    const sourceStatus = cells[11].querySelector('select');
    const mobileCell = document.createElement('td');
    mobileCell.className = 'task-mobile-cell';
    mobileCell.colSpan = cells.length;

    const card = document.createElement('article');
    card.className = 'task-mobile-card';

    const heading = document.createElement('div');
    heading.className = 'task-mobile-card-heading';
    const selection = document.createElement('div');
    selection.className = 'task-mobile-card-selection';
    if (sourceCheckbox) {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-card-checkbox';
        checkbox.setAttribute('aria-label', `Chọn công việc ${cells[2].textContent.trim()}`);
        checkbox.checked = sourceCheckbox.checked;
        checkbox.disabled = sourceCheckbox.disabled;
        checkbox.addEventListener('change', () => {
            sourceCheckbox.checked = checkbox.checked;
            sourceCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
        });
        sourceCheckbox.addEventListener('change', () => {
            checkbox.checked = sourceCheckbox.checked;
        });
        selection.appendChild(checkbox);
    }

    const date = document.createElement('span');
    date.className = 'task-mobile-card-date';
    const taskDate = sourceCheckbox?.dataset.date || selectedDate;
    date.textContent = taskDate ? formatDisplayDate(taskDate) : '';
    selection.appendChild(date);

    const sourceStatusText = sourceStatus ? sourceStatus.value : cells[11].textContent.trim();
    let status;
    if (sourceStatus) {
        status = sourceStatus.cloneNode(true);
        status.value = sourceStatus.value;
        status.classList.add('task-mobile-card-status');
        status.setAttribute('aria-label', 'Trạng thái');
        status.disabled = sourceStatus.disabled;
        status.addEventListener('change', () => {
            sourceStatus.value = status.value;
            sourceStatus.dispatchEvent(new Event('change', { bubbles: true }));
        });
        sourceStatus.addEventListener('change', () => {
            status.value = sourceStatus.value;
            status.className = `task-mobile-card-status ${statusClass(sourceStatus.value)}`;
        });
    } else {
        status = document.createElement('span');
        status.className = `task-mobile-card-status ${statusClass(sourceStatusText || 'Chưa bắt đầu')}`;
        status.textContent = sourceStatusText;
    }
    heading.append(selection, status);

    const createSummaryField = (labelText, valueText, className) => {
        const field = document.createElement('div');
        field.className = `task-mobile-card-field ${className}`;
        const label = document.createElement('span');
        label.className = 'task-mobile-card-field-label';
        label.textContent = labelText;
        const value = document.createElement('span');
        value.className = 'task-mobile-card-field-value';
        appendEmployeeSearchHighlights(value, valueText, currentSearch.search);
        field.append(label, value);
        return field;
    };

    const title = createSummaryField('Công việc', cells[2].textContent.trim() || 'Chưa có tên công việc', 'task-mobile-card-title');
    const description = createSummaryField('Mô tả', cells[3].textContent.trim() || 'Chưa có mô tả', 'task-mobile-card-description');
    const requester = createSummaryField('Người yêu cầu', cells[4].textContent.trim() || 'Chưa có thông tin', 'task-mobile-card-requester');
    const unit = createSummaryField('Đơn vị', cells[5].textContent.trim() || 'Chưa có thông tin', 'task-mobile-card-unit');
    const assignee = createSummaryField('Phụ trách', cells[6].textContent.trim() || 'Chưa có thông tin', 'task-mobile-card-assignee');
    const assigneeValue = assignee.querySelector('.task-mobile-card-field-value');
    const assignees = parseScheduleAssignees(cells[6].textContent);
    if (assignees.length) {
        assigneeValue.replaceChildren();
        assignees.forEach(person => {
            const personElement = document.createElement('span');
            personElement.className = 'task-mobile-card-assignee-person';
            appendEmployeeSearchHighlights(personElement, person, currentSearch.search);
            assigneeValue.appendChild(personElement);
        });
    }
    const result = createSummaryField('Kết quả', cells[9].textContent.trim() || 'Chưa có thông tin', 'task-mobile-card-result');
    const completion = createSummaryField('% Hoàn thành', cells[12].textContent.trim() || 'Chưa cập nhật', 'task-mobile-card-completion');

    const details = document.createElement('details');
    details.className = 'task-mobile-card-details';
    details.addEventListener('toggle', () => {
        row.classList.toggle('task-details-open', details.open);
    });
    const summary = document.createElement('summary');
    summary.textContent = 'Xem chi tiết';
    const detailList = document.createElement('dl');
    detailList.className = 'task-mobile-card-detail-list';
    const primaryIndexes = new Set([0, 1, 2, 3, 4, 5, 6, 9, 11, 12, 14]);
    cells.forEach((cell, index) => {
        if (primaryIndexes.has(index)) return;
        const item = document.createElement('div');
        item.className = 'task-mobile-card-detail';
        const label = document.createElement('dt');
        label.textContent = fieldLabels[index];
        const value = document.createElement('dd');
        cell.childNodes.forEach(node => value.appendChild(node.cloneNode(true)));
        item.append(label, value);
        detailList.appendChild(item);
    });
    details.append(summary, detailList);

    const actions = document.createElement('div');
    actions.className = 'task-mobile-card-actions';
    cells[14].querySelectorAll('button').forEach(button => {
        const mobileButton = button.cloneNode(true);
        mobileButton.addEventListener('click', () => {
            if (!button.disabled) button.click();
        });
        actions.appendChild(mobileButton);
    });

    card.append(heading, title, description, requester, unit, assignee, result, completion, details, actions);
    mobileCell.appendChild(card);
    row.appendChild(mobileCell);
}

function renderSearchedTasks(tasks) {
    if (searchFilterSection) searchFilterSection.style.display = '';

    taskTable.innerHTML = '';

    if (tasks.length === 0) {
        taskTable.innerHTML = '<tr><td colspan="100" style="text-align: center; padding: 20px;">Không có công việc nào phù hợp với tìm kiếm</td></tr>';
        return;
    }

    let i = 1;
    tasks.forEach(task => {
        const row = document.createElement('tr');

        // Checkbox
        const checkboxCell = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.setAttribute('data-key', task.id);
        checkbox.setAttribute('data-year', task.year);
        checkbox.setAttribute('data-month', task.month);
        checkbox.setAttribute('data-week', task.week);
        checkbox.setAttribute('data-date', task.date);
        checkboxCell.appendChild(checkbox);
        row.appendChild(checkboxCell);

        // STT
        const sttCell = document.createElement('td');
        sttCell.textContent = i++;
        row.appendChild(sttCell);

        // Content
        const contentCell = document.createElement('td');
        contentCell.textContent = task.content || '';
        row.appendChild(contentCell);

        // Description
        const descCell = document.createElement('td');
        descCell.textContent = task.description || '';
        row.appendChild(descCell);

        // Requester
        const reqCell = document.createElement('td');
        reqCell.textContent = task.requester || '';
        row.appendChild(reqCell);

        // Unit
        const unitCell = document.createElement('td');
        unitCell.textContent = task.unit || '';
        row.appendChild(unitCell);

        // Assignee
        const assignCell = document.createElement('td');
        assignCell.textContent = task.assignee || '';
        row.appendChild(assignCell);

        // Start Date
        const startCell = document.createElement('td');
        startCell.textContent = task.startDate || '';
        row.appendChild(startCell);

        // End Date
        const endCell = document.createElement('td');
        endCell.textContent = task.endDate || '';
        row.appendChild(endCell);

        // Result
        const resultCell = document.createElement('td');
        resultCell.textContent = task.result || '';
        row.appendChild(resultCell);

        // Hướng xử lý
        const directionCell = document.createElement('td');
        directionCell.textContent = task.direction || '';
        row.appendChild(directionCell);

        // Status
        const statusCell = document.createElement('td');
        statusCell.textContent = task.status || '';
        row.appendChild(statusCell);

        // Completion
        const compCell = document.createElement('td');
        compCell.textContent = task.completion || '';
        row.appendChild(compCell);

        // Note
        const noteCell = document.createElement('td');
        noteCell.textContent = task.note || '';
        row.appendChild(noteCell);

        // Actions
        const actionsCell = document.createElement('td');
        const actionButtons = document.createElement('div');
        actionButtons.className = 'task-actions';
        if (isAdmin()) {
            const editBtn = document.createElement('button');
            editBtn.className = 'btn-edit icon-action';
            editBtn.setAttribute('aria-label', 'Sửa');
            editBtn.onclick = async () => {
                if (!isAdmin()) {
                    await showCustomAlert('Bạn không có quyền chỉnh sửa công việc');
                    return;
                }
                openModal("Chỉnh sửa công việc", task.id, task);
            };
            actionButtons.appendChild(editBtn);

            const duplicateBtn = document.createElement('button');
            duplicateBtn.className = 'btn-duplicate icon-action';
            duplicateBtn.setAttribute('aria-label', 'Nhân bản');
            duplicateBtn.onclick = async () => {
                if (!isAdmin()) {
                    await showCustomAlert('Bạn không có quyền nhân bản công việc');
                    return;
                }

                const confirmDup = await showCustomConfirm("Bạn có muốn nhân bản công việc này không?");
                if (!confirmDup) return;

                // Sao chép thông tin công việc cần thiết
                const newTask = {
                    content: task.content,
                    description: task.description || '',
                    requester: task.requester || '',
                    unit: task.unit || '',
                    assignee: task.assignee || '',
                    startDate: task.startDate || '',
                    endDate: task.endDate || '',
                    result: task.result || '',
                    direction: task.direction || '',
                    completion: task.completion || '',
                    status: task.status || '',
                    note: task.note || '',
                    taskDate: task.taskDate || task.date
                };
                showLoading();
                try {
                    const [y, m] = task.date.split("-");
                    const w = getWeekNumber(task.date);
                    await push(tasksRef(y, m, w, task.date), newTask);
                    await showCustomAlert("🔁 Đã nhân bản công việc!");
                } catch (e) {
                    console.error(e);
                    await showCustomAlert("❌ Lỗi khi nhân bản");
                } finally {
                    hideLoading();
                }
            };
            actionButtons.appendChild(duplicateBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn-delete icon-action';
            deleteBtn.setAttribute('aria-label', 'Xóa');
            deleteBtn.onclick = async () => {
                if (!isAdmin()) {
                    await showCustomAlert('Bạn không có quyền xóa công việc');
                    return;
                }

                const confirmDelete = await showCustomConfirm("Bạn có chắc muốn xóa công việc này không?");

                if (!confirmDelete) return;
                showLoading();

                try {
                    await remove(tasksRef(task.year, task.month, task.week, task.date, task.id));
                    hideLoading();
                    // Reload searched tasks
                    await loadSearchedTasks();
                    await showCustomAlert("✅ Xóa công việc thành công!");
                } catch (error) {
                    hideLoading();
                    await showCustomAlert("❌ Có lỗi xảy ra khi xóa!");
                    console.error(error);
                }
            };
            actionButtons.appendChild(deleteBtn);
        }
        actionsCell.appendChild(actionButtons);
        row.appendChild(actionsCell);

        if (currentSearch.search) {
            [2, 3, 4, 5, 6, 9, 10, 13].forEach(index => {
                appendEmployeeSearchHighlights(row.cells[index], row.cells[index].textContent, currentSearch.search);
            });
        }
        appendTaskMobileCard(row);
        taskTable.appendChild(row);
    });

    // Update title
    let title = 'Kết quả tìm kiếm';
    if (currentSearch.period !== 'all') {
        if (currentSearch.period === 'day' && currentSearch.date) {
            title = `Công việc ngày ${formatDisplayDate(currentSearch.date)}`;
        } else if (currentSearch.period === 'week') {
            title = 'Công việc trong tuần';
        } else if (currentSearch.period === 'month' && currentSearch.month) {
            const [y, m] = currentSearch.month.split('-');
            title = `Công việc tháng ${m}/${y}`;
        } else if (currentSearch.period === 'year' && currentSearch.year) {
            title = `Công việc năm ${currentSearch.year}`;
        }

    }
    if (currentSearch.search) {
        title += ` (tìm: "${currentSearch.search}")`;
    }
    selectedDateTitle.innerText = title;

    // Hide add and delete controls when filtered
    const addBtn = document.getElementById('openAddModal');
    const expBtn = document.getElementById('exportBtn');
    const deleteDropdown = document.getElementById('deleteSelect');
    if (addBtn) addBtn.style.display = 'none';
    if (expBtn) expBtn.style.display = 'none';
    if (deleteDropdown) deleteDropdown.style.display = 'none';
    syncMobileDeleteActionVisibility();
}

// Mở / đóng sidebar menu (☰ Menu)
if (menuToggleBtn && sideMenuPanel) {
    menuToggleBtn.addEventListener('click', (e) => {
        if (!isAdmin()) return;
        e.stopPropagation();
        sideMenuPanel.classList.toggle('show');
        syncMenuToggleVisibility();
    });
}
if (menuCloseBtn && sideMenuPanel) {
    menuCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sideMenuPanel.classList.remove('show');
        syncMenuToggleVisibility();
    });
}

const menuDetailModals = Array.from(document.querySelectorAll('.menu-detail-modal'));

function closeMenuDetailModal(menuModal, restoreFocus = true) {
    if (!menuModal) return;
    menuModal.classList.remove('show');
    menuModal.setAttribute('aria-hidden', 'true');
    if (menuModal.id === 'scheduleEditorModal') {
        setScheduleFormMode();
        if (restoreFocus && scheduleManagementModalIsOpen() && openScheduleFormBtn) {
            openScheduleFormBtn.focus();
            return;
        }
    }
    if (menuModal.id === 'employeeEditModal' && restoreFocus && employeeEditReturnFocus?.isConnected) {
        employeeEditReturnFocus.focus();
        return;
    }
    if (restoreFocus && menuToggleBtn && menuToggleBtn.style.display !== 'none') menuToggleBtn.focus();
}

function scheduleManagementModalIsOpen() {
    const modal = document.getElementById('scheduleManagementModal');
    return Boolean(modal && modal.classList.contains('show'));
}

document.querySelectorAll('.menu-category-toggle[aria-controls]').forEach(button => {
    button.addEventListener('click', () => {
        const submenu = document.getElementById(button.getAttribute('aria-controls'));
        if (!submenu) {
            console.error(`Không tìm thấy menu con: ${button.getAttribute('aria-controls')}`);
            return;
        }
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', String(!isExpanded));
        submenu.hidden = isExpanded;
    });
});

document.querySelectorAll('.menu-category-btn[data-menu-modal]').forEach(button => {
    button.addEventListener('click', () => {
        if (!isAdmin()) return;
        const menuModal = document.getElementById(button.dataset.menuModal);
        if (!menuModal) {
            console.error(`Không tìm thấy modal menu: ${button.dataset.menuModal}`);
            return;
        }
        if (menuModal.id === 'scheduleManagementModal') {
            setScheduleTypeMode(button.dataset.scheduleType);
            setScheduleFormMode();
            menuModal.dataset.scheduleType = button.dataset.scheduleType;
        } else {
            delete menuModal.dataset.scheduleType;
        }
        const openMenuModal = menuDetailModals.find(modal => modal.classList.contains('show'));
        if (openMenuModal) closeMenuDetailModal(openMenuModal, false);
        if (sideMenuPanel) sideMenuPanel.classList.remove('show');
        syncMenuToggleVisibility();
        menuModal.classList.add('show');
        menuModal.setAttribute('aria-hidden', 'false');
        const closeButton = menuModal.querySelector('.menu-detail-close');
        if (closeButton) closeButton.focus();
        if (menuModal.id === 'scheduleManagementModal') loadScheduleList();
        if (menuModal.id === 'nbItScheduleModal') loadNbItSchedule();
        if (menuModal.id === 'employeesModal') loadEmployees();
        if (menuModal.id === 'taskTemplateModal') refreshTaskTemplateStatus();
    });
});

nbItYearInput.value = String(new Date().getFullYear());
nbItAddBtn.addEventListener('click', () => openNbItEntryForm());
nbItCancelBtn.addEventListener('click', () => {
    nbItEntryForm.hidden = true;
    resetNbItEntryForm();
});
nbItRefreshBtn.addEventListener('click', loadNbItSchedule);
nbItYearInput.addEventListener('change', renderNbItCalendar);
nbItPreviousYearBtn.addEventListener('click', () => {
    nbItYearInput.value = String(Math.max(2000, Number(nbItYearInput.value) - 1));
    renderNbItCalendar();
});
nbItNextYearBtn.addEventListener('click', () => {
    nbItYearInput.value = String(Math.min(2100, Number(nbItYearInput.value) + 1));
    renderNbItCalendar();
});
nbItKindInput.addEventListener('change', () => {
    if (!nbItEntryIdInput.value) nbItLabelInput.value = '';
    nbItLabelInput.placeholder = nbItKindInput.value === 'HD' ? 'Ví dụ: HD1' : `Mặc định: ${nbItKindInput.value}`;
});
nbItCalendar.addEventListener('keydown', event => {
    const cell = event.target.closest('td[data-employee-key]');
    if (!cell || (event.target !== cell && !event.target.matches('.nb-it-cell-add, .nb-it-entry-chip')) ||
        event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;
    if (startNbItCellEdit(cell, event.key)) event.preventDefault();
});
nbItCalendar.addEventListener('dblclick', event => {
    const cell = event.target.closest('td[data-employee-key]');
    if (cell && !event.target.closest('button, input')) startNbItCellEdit(cell);
});
nbItCalendar.addEventListener('click', event => {
    const entryButton = event.target.closest('.nb-it-entry-chip');
    if (entryButton) {
        const entry = nbItEntries.find(item => item.id === entryButton.dataset.entryId);
        if (entry) openNbItEntryForm(entry);
        return;
    }
    const addButton = event.target.closest('.nb-it-cell-add');
    if (addButton) openNbItEntryForm(null, addButton.dataset.employeeKey, addButton.dataset.date);
});
nbItEntryForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (!isAdmin()) {
        await showCustomAlert('Bạn không có quyền quản lý LỊCH NB - IT.');
        return;
    }
    const userId = getCurrentUserId();
    const employee = nbItEmployees.find(item => item.key === nbItEmployeeInput.value);
    const startDate = nbItStartDateInput.value;
    const endDate = nbItEndDateInput.value;
    const kind = nbItKindInput.value;
    if (!userId || !employee || !['NB', 'TC', 'HD'].includes(kind) ||
        !isValidYmd(startDate) || !isValidYmd(endDate) || endDate < startDate) {
        await showCustomAlert('Vui lòng chọn nhân viên, loại lịch và khoảng ngày hợp lệ.');
        return;
    }
    const label = nbItLabelInput.value.trim() || (kind === 'HD' ? 'HD1' : kind);
    const entryId = nbItEntryIdInput.value;
    const existingEntry = nbItEntries.find(item => item.id === entryId);
    const entry = {
        employeeKey: employee.key,
        employeeCode: String(employee.code || ''),
        employeeName: String(employee.name || ''),
        kind,
        label,
        startDate,
        endDate,
        createdAt: existingEntry?.createdAt || Date.now(),
        updatedAt: Date.now()
    };
    nbItSaveBtn.disabled = true;
    try {
        if (userId !== getCurrentUserId()) throw new Error('Tài khoản đã thay đổi. Vui lòng thử lại.');
        if (entryId) await set(nbItScheduleRef(entryId), entry);
        else {
            const newEntry = push(nbItScheduleRef());
            if (!newEntry.key) throw new Error('Không thể tạo mã lịch.');
            await set(newEntry, entry);
        }
        nbItEntryForm.hidden = true;
        resetNbItEntryForm();
        await loadNbItSchedule();
    } catch (error) {
        console.error('Lỗi lưu LỊCH NB - IT:', error);
        await showCustomAlert(`Không thể lưu lịch: ${error?.message || String(error)}`);
    } finally {
        nbItSaveBtn.disabled = false;
    }
});
nbItDeleteBtn.addEventListener('click', async () => {
    if (!isAdmin() || !nbItEntryIdInput.value) return;
    const userId = getCurrentUserId();
    const entryId = nbItEntryIdInput.value;
    if (!await showCustomConfirm('Bạn có chắc chắn muốn xóa lịch này?')) return;
    try {
        if (!userId || userId !== getCurrentUserId()) throw new Error('Tài khoản đã thay đổi. Vui lòng thử lại.');
        await remove(nbItScheduleRef(entryId));
        nbItEntryForm.hidden = true;
        resetNbItEntryForm();
        await loadNbItSchedule();
    } catch (error) {
        console.error('Lỗi xóa LỊCH NB - IT:', error);
        await showCustomAlert(`Không thể xóa lịch: ${error?.message || String(error)}`);
    }
});

document.querySelectorAll('.menu-detail-back[data-menu-parent]').forEach(button => {
    button.addEventListener('click', () => {
        const parentModal = document.getElementById(button.dataset.menuParent);
        const childModal = button.closest('.menu-detail-modal');
        if (!parentModal || !childModal) {
            console.error('Không tìm thấy modal cha hoặc modal con để quay lại.');
            return;
        }
        closeMenuDetailModal(childModal, false);
        parentModal.classList.add('show');
        parentModal.setAttribute('aria-hidden', 'false');
        const parentOptions = Array.from(parentModal.querySelectorAll(`[data-menu-modal="${childModal.id}"]`));
        const parentOption = parentOptions.find(option =>
            !option.dataset.scheduleType || option.dataset.scheduleType === childModal.dataset.scheduleType
        ) || parentOptions[0];
        if (parentOption) parentOption.focus();
    });
});

menuDetailModals.forEach(menuModal => {
    const closeButton = menuModal.querySelector('.menu-detail-close');
    if (closeButton) closeButton.addEventListener('click', () => closeMenuDetailModal(menuModal));
    menuModal.addEventListener('click', event => {
        if (event.target === menuModal) closeMenuDetailModal(menuModal);
    });
});

// Đóng menu khi click ngoài (click vào lược đồ bên ngoài)
document.addEventListener('click', (e) => {
    if (sideMenuPanel && sideMenuPanel.classList.contains('show')) {
        if (!sideMenuPanel.contains(e.target) && e.target !== menuToggleBtn) {
            sideMenuPanel.classList.remove('show');
            syncMenuToggleVisibility();
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
        const openMenuModal = scheduleEditorModal.classList.contains('show')
            ? scheduleEditorModal
            : menuDetailModals.find(menuModal => menuModal.classList.contains('show'));
        if (openMenuModal) closeMenuDetailModal(openMenuModal);
        if (nbSelectModal && nbSelectModal.style.display === 'flex') {
            nbSelectModal.style.display = 'none';
        }
        if (sideMenuPanel && sideMenuPanel.classList.contains('show')) {
            sideMenuPanel.classList.remove('show');
            syncMenuToggleVisibility();
        }
    }
});
