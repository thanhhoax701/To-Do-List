// ========== IMPORT FIREBASE ==========
// Nhập Firebase Database và các hàm thao tác dữ liệu
import { db } from '../firebase.js';
import { ref, push, get, remove, onValue, update, set } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// ========== DOM ELEMENTS - PHẦN ĐĂNG NHẬP ==========
// Các element cho giao diện đăng nhập quản trị viên
const adminLoginDiv = document.getElementById('adminLogin'); // Container đăng nhập
const adminPanel = document.getElementById('adminPanel'); // Panel quản trị (hiện sau khi đăng nhập)
const adminPinInput = document.getElementById('adminPin'); // Input nhập PIN
const adminLoginBtn = document.getElementById('adminLoginBtn'); // Nút đăng nhập
const adminLoginMsg = document.getElementById('adminLoginMsg'); // Hiển thị lỗi/thông báo

// ========== DOM ELEMENTS - DANH SÁCH VÀ FORM NGƯỜI DÙNG ==========
// Các element cho quản lý danh sách người dùng
const userListDiv = document.getElementById('userList'); // Container danh sách users
const addUserBtn = document.getElementById('addUserBtn'); // Nút thêm hoặc cập nhật user
const cancelEditBtn = document.getElementById('cancelEditBtn'); // Nút hủy chỉnh sửa
const editingUserIdField = document.getElementById('editingUserId'); // Lưu ID user đang chỉnh sửa
const newName = document.getElementById('newName'); // Input tên user
const newPin = document.getElementById('newPin'); // Input PIN user
const newRole = document.getElementById('newRole'); // Dropdown role user

// ========== BIẾN TOÀN CỤC ==========
let editingUserId = null; // Lưu ID user đang chỉnh sửa (null = thêm mới)

// DOM elements new panels/navigation
const navItems = document.querySelectorAll('#adminNav li');
const panels = document.querySelectorAll('.panel-content');
const taskUserListDiv = document.getElementById('taskUserList');
const taskDetailsDiv = document.getElementById('taskDetails');
const tasksContentDiv = document.getElementById('tasksContent');
const taskBackBtn = document.getElementById('taskBackBtn');

// ---------- hàm tiện ích hiển thị/loading cho trang quản trị ----------

// ---------- panel navigation ----------
function switchPanel(panelId) {
    // hide all panels
    panels.forEach(p => p.style.display = 'none');
    // remove active class
    navItems.forEach(i => i.classList.remove('active'));
    // show requested
    const target = document.getElementById(panelId);
    if (target) target.style.display = 'block';
    // highlight nav
    const activeItem = document.querySelector(`#adminNav li[data-panel="${panelId}"]`);
    if (activeItem) activeItem.classList.add('active');

    // load data for some panels
    if (panelId === 'panel-tasks') {
        loadUsersForTasks();
    }
}

// attach nav event listeners
navItems.forEach(li => {
    li.addEventListener('click', () => {
        switchPanel(li.dataset.panel);
    });
});

function showLoadingAdmin() {
    if (addUserBtn) addUserBtn.disabled = true;
    if (cancelEditBtn) cancelEditBtn.disabled = true;
}
function hideLoadingAdmin() {
    if (addUserBtn) addUserBtn.disabled = false;
    if (cancelEditBtn) cancelEditBtn.disabled = false;
}


// ========== PHÂN LOẠI ROLE VÀ HIỂN THỊ ==========
// Định nghĩa các role và icon/label tương ứng
const roleDisplay = {
    superadmin: { icon: '👑', label: 'Quản trị viên cấp cao' }, // Quyền cao nhất
    admin: { icon: '👨‍💼', label: 'Quản trị viên' }, // Quyền quản lý thứ cấp
    member: { icon: '👤', label: 'Thành viên đăng ký' } // Quyền thường
};

// ========== HÀM ĐĂNG NHẬP ==========
// Kiểm tra PIN quản trị viên cấp cao (superadmin)
// Chỉ superadmin mới có quyền truy cập giao diện quản trị

async function checkAdminPin(pin) {
    // Lấy danh sách tất cả users từ database
    const snap = await get(ref(db, 'users'));
    if (!snap.exists()) return false; // Nếu không có users, trả về false

    let ok = false;
    snap.forEach(ch => {
        const u = ch.val();
        // Kiểm tra: PIN trùng AND role = superadmin?
        if (u && u.pin && String(u.pin) === String(pin) && u.role === 'superadmin') ok = true;
    });
    return ok;
}

// Thực hiện đăng nhập quản trị viên
async function performAdminLogin() {
    const pin = adminPinInput.value.trim(); // Lấy PIN từ input

    // Kiểm tra PIN có đủ 4 chữ số không
    if (pin.length !== 4) {
        adminLoginMsg.innerText = 'PIN phải đủ 4 chữ số';
        return;
    }

    adminLoginMsg.innerText = ''; // Xóa thông báo lỗi cũ

    try {
        // Kiểm tra PIN có hợp lệ không
        const ok = await checkAdminPin(pin);
        if (!ok) {
            adminLoginMsg.innerText = 'PIN không hợp lệ hoặc không phải quản trị viên cấp cao';
            return;
        }

        // Đăng nhập thành công: Ẩn form đăng nhập, hiển thị panel quản trị
        adminLoginDiv.style.display = 'none';
        adminPanel.style.display = 'block';
        bindUsers(); // Tải danh sách users
        switchPanel('panel-users'); // hiển thị panel mặc định
    } catch (e) {
        adminLoginMsg.innerText = 'Lỗi khi kiểm tra PIN';
        console.error(e);
    }
}

// Gán sự kiện click nút đăng nhập
adminLoginBtn.onclick = performAdminLogin;

// Hỗ trợ phím Enter để đăng nhập (UX tốt hơn)
adminPinInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        performAdminLogin();
    }
})

// ========== HÀM QUẢN LÝ FORM ==========
// Xóa sạch dữ liệu form (dùng khi cancele hoặc sau khi thêm/cập nhật)
function clearForm() {
    newName.value = '';
    newPin.value = '';
    newRole.value = 'member';
    editingUserId = null;
    editingUserIdField.value = '';
}

// Đặt lại UI form về trạng thái "Thêm mới" (không phải chỉnh sửa)
function resetFormUI() {
    addUserBtn.innerText = '➕ Thêm';
    addUserBtn.style.background = '#28a745'; // Màu xanh
    cancelEditBtn.style.display = 'none';
    clearForm();
}

// Chuyển form sang chế độ chỉnh sửa
function editUser(userId, userData) {
    editingUserId = userId; // Lưu ID user đang chỉnh sửa
    editingUserIdField.value = userId;
    newName.value = userData.name || '';
    newPin.value = userData.pin || '';
    newRole.value = userData.role || 'member';

    // Đổi text nút thành "Cập nhật" và đổi màu
    addUserBtn.innerText = '✏️ Cập nhật';
    addUserBtn.style.background = '#ffc107'; // Màu vàng
    cancelEditBtn.style.display = 'inline-block'; // Hiển thị nút hủy

    newName.focus(); // Auto focus tên
}

// Hiển thị danh sách users trên giao diện
function renderUsers(usersObj) {
    userListDiv.innerHTML = ''; // Xóa danh sách cũ
    if (!usersObj) return;

    // Sắp xếp users theo role (superadmin → admin → member)
    const grouped = { superadmin: [], admin: [], member: [] };
    Object.entries(usersObj).forEach(([k, u]) => {
        const role = u.role || 'member';
        if (!grouped[role]) grouped[role] = [];


        grouped[role].push({ id: k, ...u });
    });

    // Render each group
    ['superadmin', 'admin', 'member'].forEach(role => {
        if (grouped[role] && grouped[role].length > 0) {
            // Group heading
            const groupEl = document.createElement('div');
            groupEl.style.marginTop = '16px';
            groupEl.innerHTML = `<h3 style="margin:0 0 8px;color:#333;border-bottom:2px solid #ddd;padding-bottom:6px">${roleDisplay[role].icon} ${roleDisplay[role].label}</h3>`;
            userListDiv.appendChild(groupEl);

            // Users in this group
            grouped[role].forEach(u => {
                const el = document.createElement('div');
                el.className = 'user-item';
                el.innerHTML = `
                    <div class="meta">
                        <strong>${u.name || '(no name)'}</strong>
                        <div style="color:#666">PIN: ${u.pin}</div>
                        <div style="color:#666">${roleDisplay[role].label}</div>
                    </div>
                    <div style="display:flex;gap:8px">
                        <button data-key="${u.id}" class="btn-edit" style="display:inline-block;padding:6px 12px">✏️ Sửa</button>
                        <button data-key="${u.id}" class="btn-delete" style="display:inline-block;padding:6px 12px">🗑️ Xóa</button>
                    </div>
                `;
                userListDiv.appendChild(el);

                el.querySelector('.btn-edit').onclick = (e) => {
                    e.preventDefault();
                    const userId = e.target.dataset.key;
                    editUser(userId, u);
                };

                el.querySelector('.btn-delete').onclick = async (e) => {
                    e.preventDefault();
                    const ok = await showCustomConfirm('Xóa người dùng "' + (u.name || 'User') + '" này?');
                    if (!ok) return;
                    showLoadingAdmin();
                    try {
                        await remove(ref(db, `users/${e.target.dataset.key}`));
                    } catch (error) {
                        await showCustomAlert('Lỗi khi xóa người dùng: ' + error.message);
                    } finally {
                        hideLoadingAdmin();
                    }
                };
            });
        }
    });
}

function normalizeUsers(obj) {
    // Sau khi nhập file JSON, Firebase đôi khi bọc dữ liệu người dùng thực
    // dưới một push-id tự sinh. Phát hiện và mở lớp bọc đó để giao diện
    // quản trị hiển thị đúng người dùng thay vì khóa ngẫu nhiên.
    if (obj && typeof obj === 'object') {
        const keys = Object.keys(obj);
        if (keys.length === 1) {
            const inner = obj[keys[0]];
            if (inner && typeof inner === 'object') {
                const allHavePin = Object.values(inner).every(u => u && u.pin !== undefined);
                if (allHavePin) return inner;
            }
        }
    }
    return obj;
}

function bindUsers() {
    const r = ref(db, 'users');
    onValue(r, snap => {
        if (snap.exists()) {
            const data = normalizeUsers(snap.val());
            renderUsers(data);
        } else userListDiv.innerHTML = '<em>Chưa có người dùng nào</em>';
    });
}

// --------- task panel helpers ----------
async function loadUsersForTasks() {
    try {
        const snap = await get(ref(db, 'users'));
        if (snap.exists()) {
            const data = normalizeUsers(snap.val());
            renderUsersForTasks(data);
        } else {
            taskUserListDiv.innerHTML = '<em>Không có người dùng</em>';
        }
    } catch (e) {
        taskUserListDiv.innerHTML = '<em>Lỗi khi tải danh sách người dùng</em>';
        console.error(e);
    }
}

function renderUsersForTasks(usersObj) {
    taskUserListDiv.innerHTML = '';
    if (!usersObj) return;
    Object.entries(usersObj).forEach(([id, u]) => {
        const btn = document.createElement('button');
        btn.textContent = u.name || id;
        btn.style.margin = '4px';
        btn.dataset.id = id;
        btn.addEventListener('click', () => loadTasks(id));
        taskUserListDiv.appendChild(btn);
    });
}

let currentTasksObj = null; // full tasks data for selected user
let navPath = []; // e.g. ['2026','01','week5','2026-01-26']

async function loadTasks(userId) {
    taskDetailsDiv.style.display = 'block';
    tasksContentDiv.innerHTML = 'Đang tải...';
    try {
        const snap = await get(ref(db, `tasks/${userId}`));
        if (!snap.exists()) {
            tasksContentDiv.innerHTML = '<em>Không có công việc cho người dùng này</em>';
        } else {
            currentTasksObj = snap.val();
            renderYearView();
        }
    } catch (e) {
        tasksContentDiv.innerHTML = '<em>Lỗi khi tải công việc</em>';
        console.error(e);
    }
}

// navigation rendering functions
function clearTasksArea() {
    tasksContentDiv.innerHTML = '';
}

function renderBackButton(level) {
    // level: 0 => back to user list; >0 back up one level
    const btn = document.createElement('button');
    btn.textContent = '← Trở lại';
    btn.style.margin = '8px 0';
    btn.onclick = () => {
        if (level === 0) {
            taskBackBtn.click();
        } else {
            navPath.pop();
            switch (level) {
                case 1: renderYearView(); break;
                case 2: renderMonthView(navPath[0]); break;
                case 3: renderWeekView(navPath[0], navPath[1]); break;
                case 4: renderDayView(navPath[0], navPath[1], navPath[2]); break;
            }
        }
    };
    tasksContentDiv.appendChild(btn);
}

function renderYearView() {
    clearTasksArea();
    renderBackButton(0);
    const years = Object.keys(currentTasksObj || {}).sort();
    years.forEach(year => {
        const btn = document.createElement('button');
        btn.textContent = year;
        btn.style.margin = '4px';
        btn.onclick = () => renderMonthView(year);
        tasksContentDiv.appendChild(btn);
    });
}

function renderMonthView(year) {
    navPath = [year];
    clearTasksArea();
    renderBackButton(1);
    const months = Object.keys(currentTasksObj[year] || {}).sort();
    months.forEach(month => {
        const btn = document.createElement('button');
        btn.textContent = `Tháng ${month}`;
        btn.style.margin = '4px';
        btn.onclick = () => renderWeekView(year, month);
        tasksContentDiv.appendChild(btn);
    });
}

function renderWeekView(year, month) {
    navPath = [year, month];
    clearTasksArea();
    renderBackButton(2);
    const weeks = Object.keys((currentTasksObj[year] || {})[month] || {}).sort();
    weeks.forEach(week => {
        const weekData = (currentTasksObj[year] || {})[month] || {};
        const daysObj = weekData[week] || {};
        const dates = Object.keys(daysObj).sort();
        let label = week;
        if (dates.length > 0) {
            const start = dates[0];
            const end = dates[dates.length - 1];
            // extract number from week string
            const numMatch = week.match(/week(\d+)/i);
            const num = numMatch ? numMatch[1] : week;
            label = `Tuần ${num} - ${month}/${year} (${start} - ${end})`;
        }
        const btn = document.createElement('button');
        btn.textContent = label;
        btn.style.margin = '4px';
        btn.onclick = () => renderDayView(year, month, week);
        tasksContentDiv.appendChild(btn);
    });
}

function renderDayView(year, month, week) {
    navPath = [year, month, week];
    clearTasksArea();
    renderBackButton(3);
    const days = Object.keys(((currentTasksObj[year] || {})[month] || {})[week] || {}).sort();
    days.forEach(date => {
        const btn = document.createElement('button');
        btn.textContent = date;
        btn.style.margin = '4px';
        btn.onclick = () => renderTasksForDate(year, month, week, date);
        tasksContentDiv.appendChild(btn);
    });
}

function renderTasksForDate(year, month, week, date) {
    navPath = [year, month, week, date];
    clearTasksArea();
    renderBackButton(4);
    const list = currentTasksObj[year][month][week][date];
    if (!list) {
        tasksContentDiv.innerHTML += '<em>Không có công việc</em>';
        return;
    }
    // create styled table similar to main interface
    const table = document.createElement('table');
    table.style.width = '100%';
    // don't collapse borders for admin task table
    // table.style.borderCollapse = 'collapse';
    table.style.marginTop = '8px';
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr style="background:#007bff;color:#fff;">
            <th style="padding:8px;border:1px solid #ddd;">STT</th>
            <th style="padding:8px;border:1px solid #ddd;">Nội dung</th>
            <th style="padding:8px;border:1px solid #ddd;">Đơn vị</th>
            <th style="padding:8px;border:1px solid #ddd;">Thời gian</th>
            <th style="padding:8px;border:1px solid #ddd;">Mức độ</th>
            <th style="padding:8px;border:1px solid #ddd;">Trạng thái</th>
            <th style="padding:8px;border:1px solid #ddd;">Ghi chú</th>
        </tr>`;
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    let idx = 1;
    Object.entries(list).forEach(([taskId, task]) => {
        const tr = document.createElement('tr');
        // no border on tr; we'll style cells instead
        tr.innerHTML = `
            <td style="padding:6px;vertical-align:top;">${idx++}</td>
            <td style="padding:6px;vertical-align:top;">${task.content || ''}</td>
            <td style="padding:6px;vertical-align:top;">${task.unit || ''}</td>
            <td style="padding:6px;vertical-align:top;">${task.duration || ''}</td>
            <td style="padding:6px;vertical-align:top;">${task.priority || ''}</td>
            <td style="padding:6px;vertical-align:top;">${task.status || ''}</td>
            <td style="padding:6px;vertical-align:top;">${task.note || ''}</td>
        `;
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    tasksContentDiv.appendChild(table);
}

taskBackBtn && taskBackBtn.addEventListener('click', () => {
    taskDetailsDiv.style.display = 'none';
    tasksContentDiv.innerHTML = '';
});

function buildTasksTable(obj) {
    const rows = [];

    // Traverse nested structure: year > month > week > date > taskId > task
    Object.entries(obj).forEach(([year, yearData]) => {
        if (!yearData || typeof yearData !== 'object') return;

        Object.entries(yearData).forEach(([month, monthData]) => {
            if (!monthData || typeof monthData !== 'object') return;

            Object.entries(monthData).forEach(([week, weekData]) => {
                if (!weekData || typeof weekData !== 'object') return;

                Object.entries(weekData).forEach(([date, dateData]) => {
                    if (!dateData || typeof dateData !== 'object') return;

                    Object.entries(dateData).forEach(([taskId, task]) => {
                        if (!task || typeof task !== 'object') return;

                        rows.push({
                            year,
                            month,
                            week,
                            date,
                            taskId,
                            content: task.content || '',
                            duration: task.duration || '',
                            status: task.status || '',
                            priority: task.priority || '',
                            unit: task.unit || '',
                            startDate: task.startDate || '',
                            note: task.note || ''
                        });
                    });
                });
            });
        });
    });

    // Create table
    const table = document.createElement('table');
    table.className = 'tasks-table';

    // Header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = ['Năm', 'Tháng', 'Tuần', 'Ngày', 'Nội dung', 'Thời gian', 'Trạng thái', 'Ưu tiên', 'Đơn vị', 'Ghi chú'];
    headers.forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body
    const tbody = document.createElement('tbody');
    rows.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.year}</td>
            <td>${row.month}</td>
            <td>${row.week}</td>
            <td>${row.date}</td>
            <td class="task-content">${row.content}</td>
            <td>${row.duration}</td>
            <td><span class="status-badge status-${row.status.toLowerCase().replace(/\s+/g, '-')}">${row.status}</span></td>
            <td><span class="priority-badge priority-${row.priority.toLowerCase().replace(/\s+/g, '-')}">${row.priority}</span></td>
            <td>${row.unit}</td>
            <td>${row.note}</td>
        `;
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    return table;
}

addUserBtn.onclick = async () => {
    const name = newName.value.trim();
    const pin = newPin.value.trim();
    const role = newRole.value;

    if (!name) { await showCustomAlert('Vui lòng nhập tên người dùng'); return; }
    if (!pin || pin.length !== 4) { await showCustomAlert('PIN phải đủ 4 chữ số'); return; }

    showLoadingAdmin();
    try {
        const userData = { name, pin, role };

        if (editingUserId) {
            // Update existing user
            await update(ref(db, `users/${editingUserId}`), userData);
            await showCustomAlert('✅ Cập nhật người dùng thành công');
        } else {
            // Add new user: create sequential id like "userNNN" instead of random push key
            const usersSnap = await get(ref(db, 'users'));
            let nextId = 'user001';
            if (usersSnap.exists()) {
                let usersObj = usersSnap.val();
                // mở lớp bọc nếu có
                if (usersObj && typeof usersObj === 'object') {
                    const keys = Object.keys(usersObj);
                    if (keys.length === 1 && usersObj[keys[0]] && typeof usersObj[keys[0]] === 'object' &&
                        Object.values(usersObj[keys[0]]).every(u => u && u.pin !== undefined)) {
                        usersObj = usersObj[keys[0]];
                    }
                }
                // find numeric suffixes
                const nums = Object.keys(usersObj)
                    .map(k => {
                        const m = k.match(/^user(\d+)$/);
                        return m ? parseInt(m[1], 10) : null;
                    })
                    .filter(n => n !== null);
                if (nums.length > 0) {
                    const max = Math.max(...nums);
                    const next = max + 1;
                    nextId = 'user' + String(next).padStart(3, '0');
                }
            }
            await set(ref(db, `users/${nextId}`), userData);
            await showCustomAlert(`✅ Thêm người dùng mới thành công (${nextId})`);
        }
        resetFormUI();
    } catch (e) {
        console.error(e);
        await showCustomAlert('❌ Có lỗi: ' + (e.message || 'Không xác định'));
    } finally {
        hideLoadingAdmin();
    }
};

cancelEditBtn.onclick = resetFormUI;
