// ========== IMPORT FIREBASE ==========
// Nhập Firebase Database và các hàm thao tác dữ liệu
import { db } from '../firebase.js';
import { ref, push, get, remove, onValue, update, set, query, orderByChild, limitToLast } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { recordSuccessfulLogin } from '../login-log.js';

// ========== DOM ELEMENTS - PHẦN ĐĂNG NHẬP ==========
// Các element cho giao diện đăng nhập quản trị viên
const adminLoginDiv = document.getElementById('adminLogin'); // Container đăng nhập
const adminPanel = document.getElementById('adminPanel'); // Panel quản trị (hiện sau khi đăng nhập)
const adminPinInput = document.getElementById('adminPin'); // Input nhập PIN
const adminLoginBtn = document.getElementById('adminLoginBtn'); // Nút đăng nhập
const adminLoginMsg = document.getElementById('adminLoginMsg'); // Hiển thị lỗi/thông báo
const adminProfileTrigger = document.getElementById('adminProfileTrigger');
const adminProfileDialog = document.getElementById('adminProfileDialog');
const adminProfileClose = document.getElementById('adminProfileClose');

// ========== DOM ELEMENTS - DANH SÁCH VÀ FORM NGƯỜI DÙNG ==========
// Các element cho quản lý danh sách người dùng
const userListDiv = document.getElementById('userList'); // Container danh sách users
const addUserBtn = document.getElementById('addUserBtn'); // Nút thêm hoặc cập nhật user
const cancelEditBtn = document.getElementById('cancelEditBtn'); // Nút hủy chỉnh sửa
const editingUserIdField = document.getElementById('editingUserId'); // Lưu ID user đang chỉnh sửa
const newName = document.getElementById('newName'); // Input tên user
const newEmail = document.getElementById('newEmail');
const newPin = document.getElementById('newPin'); // Input PIN user
const newRole = document.getElementById('newRole'); // Dropdown role user

// ========== BIẾN TOÀN CỤC ==========
let editingUserId = null; // Lưu ID user đang chỉnh sửa (null = thêm mới)
let activeAdminUser = null;

// DOM elements new panels/navigation
const navItems = document.querySelectorAll('#adminNav li');
const panels = document.querySelectorAll('.panel-content');
const taskUserListDiv = document.getElementById('taskUserList');
const taskUserPicker = document.getElementById('taskUserPicker');
const taskDetailsDiv = document.getElementById('taskDetails');
const tasksContentDiv = document.getElementById('tasksContent');
const taskBackBtn = document.getElementById('taskBackBtn');
const taskSelectedUserName = document.getElementById('taskSelectedUserName');
const adminCurrentSection = document.getElementById('adminCurrentSection');
const userSearchInput = document.getElementById('userSearchInput');
const loginLogSearch = document.getElementById('loginLogSearch');
const loginLogStatus = document.getElementById('loginLogStatus');
const loginLogTableBody = document.getElementById('loginLogTableBody');
const refreshLoginLogsBtn = document.getElementById('refreshLoginLogs');
const accessRequestList = document.getElementById('accessRequestList');
const accessRequestStatus = document.getElementById('accessRequestStatus');
const refreshAccessRequestsBtn = document.getElementById('refreshAccessRequests');
const accessRequestCount = document.getElementById('accessRequestCount');
let currentUsersObj = null;
let currentLoginLogs = [];
let currentAccessRequests = {};
let accessRequestsBound = false;

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
    if (adminCurrentSection && activeItem) {
        adminCurrentSection.textContent = activeItem.querySelector('.admin-nav-title')?.textContent || activeItem.textContent.trim();
    }

    // load data for some panels
    if (panelId === 'panel-tasks') {
        loadUsersForTasks();
    }
    if (panelId === 'panel-loginLog') {
        loadLoginLogs();
    }
    if (panelId === 'panel-accessRequests') {
        loadAccessRequests();
    }
    if (panelId === 'panel-dashboard') {
        loadAccessRequests();
    }
}

// attach nav event listeners
navItems.forEach(li => {
    li.addEventListener('click', () => {
        switchPanel(li.dataset.panel);
    });
    li.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            switchPanel(li.dataset.panel);
        }
    });
});

document.querySelectorAll('[data-admin-action]').forEach(button => {
    button.addEventListener('click', () => {
        const action = button.dataset.adminAction;
        const panelId = action === 'users' ? 'panel-users'
            : action === 'tasks' ? 'panel-tasks'
                : action === 'loginLog' ? 'panel-loginLog'
                    : action === 'accessRequests' ? 'panel-accessRequests' : 'panel-dashboard';
        switchPanel(panelId);
        if (action === 'users') newName.focus();
    });
});

if (userSearchInput) {
    userSearchInput.addEventListener('input', () => renderUsers(currentUsersObj));
}

if (loginLogSearch) {
    loginLogSearch.addEventListener('input', renderLoginLogs);
}

if (refreshLoginLogsBtn) {
    refreshLoginLogsBtn.addEventListener('click', loadLoginLogs);
}

if (refreshAccessRequestsBtn) {
    refreshAccessRequestsBtn.addEventListener('click', loadAccessRequests);
}

async function loadAccessRequests() {
    if (!accessRequestList || !accessRequestStatus) return;
    refreshAccessRequestsBtn.disabled = true;
    accessRequestStatus.textContent = 'Đang tải yêu cầu...';

    try {
        const snapshot = await get(ref(db, 'accessRequests'));
        currentAccessRequests = snapshot.exists() ? snapshot.val() : {};
        renderAccessRequests();
    } catch (error) {
        console.error('Không thể tải yêu cầu truy cập:', error);
        currentAccessRequests = {};
        accessRequestList.replaceChildren();
        accessRequestStatus.textContent = 'Không thể tải yêu cầu. Vui lòng kiểm tra quyền Firebase hoặc thử tải lại.';
    } finally {
        refreshAccessRequestsBtn.disabled = false;
    }
}

function renderAccessRequests() {
    accessRequestList.replaceChildren();
    const pendingRequests = Object.entries(currentAccessRequests || {})
        .filter(([, request]) => request && request.status === 'pending')
        .sort(([, a], [, b]) => Number(a.requestedAt || 0) - Number(b.requestedAt || 0));
    if (accessRequestCount) {
        accessRequestCount.textContent = String(pendingRequests.length);
        accessRequestCount.hidden = pendingRequests.length === 0;
    }

    if (!pendingRequests.length) {
        accessRequestStatus.textContent = 'Không có yêu cầu truy cập đang chờ duyệt.';
        const empty = document.createElement('div');
        empty.className = 'admin-empty-state';
        empty.textContent = 'Các yêu cầu mới của tài khoản Phòng Ban sẽ xuất hiện tại đây.';
        accessRequestList.appendChild(empty);
        return;
    }

    accessRequestStatus.textContent = `${pendingRequests.length} yêu cầu đang chờ duyệt.`;
    pendingRequests.forEach(([userId, request]) => {
        const item = document.createElement('article');
        item.className = 'access-request-item';

        const details = document.createElement('div');
        const name = document.createElement('strong');
        name.textContent = request.userName || 'Tài khoản Phòng Ban';
        const email = document.createElement('span');
        email.textContent = request.email || 'Không có email';
        const requestedAt = document.createElement('span');
        const timestamp = Number(request.requestedAt);
        requestedAt.textContent = Number.isFinite(timestamp) && timestamp > 0
            ? `Gửi lúc ${new Date(timestamp).toLocaleString('vi-VN')}`
            : 'Thời gian gửi không xác định';
        details.append(name, email, requestedAt);

        const actions = document.createElement('div');
        actions.className = 'access-request-actions';
        const approveButton = document.createElement('button');
        approveButton.type = 'button';
        approveButton.className = 'access-request-approve';
        approveButton.textContent = 'Duyệt';
        approveButton.addEventListener('click', () => reviewAccessRequest(userId));
        actions.appendChild(approveButton);
        item.append(details, actions);
        accessRequestList.appendChild(item);
    });
}

function bindAccessRequests() {
    if (accessRequestsBound) return;
    accessRequestsBound = true;
    onValue(ref(db, 'accessRequests'), snapshot => {
        currentAccessRequests = snapshot.exists() ? snapshot.val() : {};
        renderAccessRequests();
    }, error => {
        console.error('Không thể theo dõi yêu cầu truy cập:', error);
        currentAccessRequests = {};
        accessRequestList.replaceChildren();
        accessRequestStatus.textContent = 'Không thể tải yêu cầu. Vui lòng kiểm tra quyền Firebase.';
        if (accessRequestCount) accessRequestCount.hidden = true;
    });
}

async function reviewAccessRequest(userId) {
    if (!['admin', 'superadmin'].includes(activeAdminUser?.role)) {
        await showCustomAlert('Bạn không có quyền duyệt yêu cầu truy cập.');
        return;
    }

    const user = currentUsersObj?.[userId];
    const request = currentAccessRequests?.[userId];
    if (!user || user.role !== 'department' ||
        String(user.email || '').trim().toLowerCase() !== String(request?.email || '').trim().toLowerCase()) {
        await showCustomAlert('Tài khoản hoặc email đã thay đổi. Vui lòng tải lại danh sách trước khi duyệt.');
        return;
    }

    try {
        await update(ref(db, `accessRequests/${userId}`), {
            status: 'approved',
            reviewedAt: Date.now(),
            reviewedBy: activeAdminUser.name || activeAdminUser.key || 'Admin'
        });
        await loadAccessRequests();
    } catch (error) {
        console.error('Không thể cập nhật yêu cầu truy cập:', error);
        await showCustomAlert(`Không thể cập nhật yêu cầu: ${error.message || 'Lỗi không xác định'}`);
    }
}

async function loadLoginLogs() {
    if (!loginLogStatus || !loginLogTableBody) return;
    refreshLoginLogsBtn.disabled = true;
    loginLogStatus.textContent = 'Đang tải nhật ký...';

    try {
        const logsQuery = query(ref(db, 'loginLogs'), orderByChild('timestamp'), limitToLast(200));
        const snapshot = await get(logsQuery);
        currentLoginLogs = [];
        if (snapshot.exists()) {
            snapshot.forEach(child => {
                const log = child.val();
                if (log && typeof log === 'object') currentLoginLogs.push(log);
            });
        }
        currentLoginLogs.sort((a, b) => Number(b.timestamp || 0) - Number(a.timestamp || 0));
        renderLoginLogs();
    } catch (error) {
        console.error('Không thể tải nhật ký đăng nhập:', error);
        currentLoginLogs = [];
        loginLogTableBody.replaceChildren();
        loginLogStatus.textContent = 'Không thể tải nhật ký đăng nhập. Vui lòng thử tải lại.';
    } finally {
        refreshLoginLogsBtn.disabled = false;
    }
}

function renderLoginLogs() {
    if (!loginLogStatus || !loginLogTableBody) return;
    const searchTerm = (loginLogSearch?.value || '').trim().toLocaleLowerCase('vi');
    const filteredLogs = currentLoginLogs.filter(log => {
        const roleName = roleDisplay[log.role]?.label || String(log.role || 'Không xác định');
        return [log.userName, roleName, log.accessType]
            .some(value => String(value || '').toLocaleLowerCase('vi').includes(searchTerm));
    });

    loginLogTableBody.replaceChildren();
    if (!filteredLogs.length) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 5;
        cell.className = 'login-log-empty';
        cell.textContent = currentLoginLogs.length
            ? 'Không tìm thấy nhật ký phù hợp.'
            : 'Chưa có lần đăng nhập nào được ghi nhận.';
        row.appendChild(cell);
        loginLogTableBody.appendChild(row);
        loginLogStatus.textContent = currentLoginLogs.length
            ? 'Không tìm thấy kết quả phù hợp.'
            : 'Nhật ký sẽ xuất hiện sau khi có lần đăng nhập thành công.';
        return;
    }

    filteredLogs.forEach(log => {
        const row = document.createElement('tr');
        const timestamp = Number(log.timestamp);
        const date = Number.isFinite(timestamp) && timestamp > 0
            ? new Date(timestamp).toLocaleString('vi-VN')
            : '—';
        const roleName = roleDisplay[log.role]?.label || String(log.role || 'Không xác định');
        [date, log.userName || 'Tài khoản không tên', roleName, log.accessType || 'Ứng dụng', 'Thành công']
            .forEach((value, index) => {
                const cell = document.createElement('td');
                cell.textContent = String(value);
                if (index === 4) cell.className = 'login-log-success';
                row.appendChild(cell);
            });
        loginLogTableBody.appendChild(row);
    });
    loginLogStatus.textContent = `Hiển thị ${filteredLogs.length} / ${currentLoginLogs.length} sự kiện gần nhất (tối đa 200).`;
}

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
    department: { icon: '🏢', label: 'Phòng Ban' },
    member: { icon: '👤', label: 'Thành viên đăng ký' } // Quyền thường
};

function closeAdminProfile() {
    adminProfileDialog.hidden = true;
    adminProfileTrigger.focus();
}

function openAdminProfile() {
    if (!activeAdminUser) return;
    document.getElementById('adminProfileName').textContent = activeAdminUser.name || 'Chưa cập nhật';
    document.getElementById('adminProfileRole').textContent =
        roleDisplay[activeAdminUser.role]?.label || 'Không xác định';
    document.getElementById('adminProfileEmail').textContent = activeAdminUser.email || 'Chưa cập nhật';
    document.getElementById('adminProfileId').textContent = activeAdminUser.key || 'Không xác định';
    adminProfileDialog.hidden = false;
    adminProfileClose.focus();
}

adminProfileTrigger.addEventListener('click', openAdminProfile);
adminProfileClose.addEventListener('click', closeAdminProfile);
adminProfileDialog.addEventListener('click', event => {
    if (event.target === adminProfileDialog) closeAdminProfile();
});
document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !adminProfileDialog.hidden) closeAdminProfile();
});

// ========== HÀM ĐĂNG NHẬP ==========
// Kiểm tra PIN của Admin hoặc Super Admin trước khi mở giao diện quản trị

async function checkAdminPin(pin) {
    // Lấy danh sách tất cả users từ database
    const snap = await get(ref(db, 'users'));
    if (!snap.exists()) return null; // Nếu không có users, trả về null

    const users = normalizeUsers(snap.val());
    return Object.entries(users || {}).reduce((matchedAdmin, [key, user]) => {
        if (matchedAdmin || !user || String(user.pin) !== String(pin) ||
            !['admin', 'superadmin'].includes(user.role)) return matchedAdmin;
        return { key, ...user };
    }, null);
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
        const adminUser = await checkAdminPin(pin);
        if (!adminUser) {
            adminLoginMsg.innerText = 'PIN không hợp lệ hoặc tài khoản không có quyền quản trị';
            return;
        }
        activeAdminUser = adminUser;
        updateRoleOptions();

        try {
            await recordSuccessfulLogin(adminUser, 'Quản trị');
        } catch (logError) {
            console.error('Không thể lưu nhật ký đăng nhập quản trị:', logError);
        }

        // Đăng nhập thành công: Ẩn form đăng nhập, hiển thị panel quản trị
        adminLoginDiv.style.display = 'none';
        adminPanel.style.display = 'block';
        bindUsers(); // Tải danh sách users
        bindAccessRequests();
        switchPanel('panel-dashboard'); // hiển thị dashboard sau khi đăng nhập
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
    newEmail.value = '';
    newEmail.required = false;
    newPin.value = '';
    newRole.value = 'member';
    editingUserId = null;
    editingUserIdField.value = '';
}

function isSuperAdmin() {
    return activeAdminUser?.role === 'superadmin';
}

function canManageUser(user) {
    return isSuperAdmin() || ['member', 'department'].includes(user?.role || 'member');
}

function updateRoleOptions(selectedRole = 'member') {
    const allowedRoles = isSuperAdmin()
        ? ['member', 'department', 'admin', 'superadmin']
        : ['member', 'department'];
    Array.from(newRole.options).forEach(option => {
        option.hidden = !allowedRoles.includes(option.value);
        option.disabled = option.hidden;
    });
    newRole.value = allowedRoles.includes(selectedRole) ? selectedRole : 'member';
    newEmail.required = newRole.value === 'department';
}

newRole.addEventListener('change', () => {
    newEmail.required = newRole.value === 'department';
});

// Đặt lại UI form về trạng thái "Thêm mới" (không phải chỉnh sửa)
function resetFormUI() {
    addUserBtn.innerText = '➕ Thêm';
    addUserBtn.classList.remove('is-editing');
    cancelEditBtn.style.display = 'none';
    clearForm();
}

// Chuyển form sang chế độ chỉnh sửa
function editUser(userId, userData) {
    if (!canManageUser(userData)) {
        showCustomAlert('Bạn không có quyền chỉnh sửa tài khoản này.');
        return;
    }
    editingUserId = userId; // Lưu ID user đang chỉnh sửa
    editingUserIdField.value = userId;
    newName.value = userData.name || '';
    newEmail.value = userData.email || '';
    newPin.value = userData.pin || '';
    updateRoleOptions(userData.role || 'member');

    // Đổi text nút thành "Cập nhật" và đổi màu
    addUserBtn.innerText = '✏️ Cập nhật';
    addUserBtn.classList.add('is-editing');
    cancelEditBtn.style.display = 'inline-block'; // Hiển thị nút hủy

    newName.focus(); // Auto focus tên
}

// Hiển thị danh sách users trên giao diện
function updateDashboard(usersObj) {
    const users = Object.values(usersObj || {});
    const counts = users.reduce((result, user) => {
        const role = user?.role || 'member';
        result[role] = (result[role] || 0) + 1;
        return result;
    }, { member: 0, department: 0, admin: 0, superadmin: 0 });
    const total = users.length;
    const percent = role => total ? Math.round((counts[role] / total) * 100) : 0;

    document.getElementById('dashboardUserTotal').textContent = total;
    document.getElementById('dashboardAdminTotal').textContent = counts.admin;
    document.getElementById('dashboardMemberTotal').textContent = counts.member;
    document.getElementById('dashboardDepartmentTotal').textContent = counts.department;
    document.getElementById('dashboardSuperTotal').textContent = counts.superadmin;
    document.getElementById('dashboardDonutTotal').textContent = total;
    document.getElementById('dashboardMemberPercent').textContent = `${percent('member')}%`;
    document.getElementById('dashboardDepartmentPercent').textContent = `${percent('department')}%`;
    document.getElementById('dashboardAdminPercent').textContent = `${percent('admin')}%`;
    document.getElementById('dashboardSuperPercent').textContent = `${percent('superadmin')}%`;

    const memberEnd = percent('member');
    const departmentEnd = memberEnd + percent('department');
    const adminEnd = departmentEnd + percent('admin');
    const superEnd = adminEnd + percent('superadmin');
    const donut = document.getElementById('dashboardRoleDonut');
    donut.style.background = total
        ? `conic-gradient(#df171f 0% ${memberEnd}%, #5578e8 ${memberEnd}% ${departmentEnd}%, #a9131a ${departmentEnd}% ${adminEnd}%, #f1ae4e ${adminEnd}% ${superEnd}%)`
        : 'conic-gradient(#e8edf4 0% 100%)';
    donut.setAttribute('aria-label', `Cơ cấu tài khoản: ${counts.member} thành viên, ${counts.department} Phòng Ban, ${counts.admin} quản trị viên, ${counts.superadmin} quản trị viên cấp cao`);
}

function renderUsers(usersObj) {
    userListDiv.innerHTML = ''; // Xóa danh sách cũ
    currentUsersObj = usersObj || {};
    updateDashboard(currentUsersObj);

    // Sắp xếp users theo role (superadmin → admin → member)
    const grouped = { superadmin: [], admin: [], department: [], member: [] };
    const query = userSearchInput?.value.trim().toLocaleLowerCase('vi') || '';
    Object.entries(currentUsersObj).forEach(([k, u]) => {
        if (query && !`${u.name || ''} ${u.pin || ''} ${u.email || ''}`.toLocaleLowerCase('vi').includes(query)) return;
        const role = u.role || 'member';
        if (!grouped[role]) grouped[role] = [];


        grouped[role].push({ id: k, ...u });
    });

    // Render each group
    ['superadmin', 'admin', 'department', 'member'].forEach(role => {
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
                const canManage = canManageUser(u);
                el.innerHTML = `
                    <div class="meta">
                        <strong>${u.name || '(no name)'}</strong>
                        <div style="color:#666">PIN: ${canManage ? u.pin : '••••'}</div>
                        <div style="color:#666">${roleDisplay[role].label}</div>
                    </div>
                    <div style="display:${canManage ? 'flex' : 'none'};gap:8px">
                        <button data-key="${u.id}" class="btn-edit" style="display:inline-block;padding:6px 12px">✏️ Sửa</button>
                        <button data-key="${u.id}" class="btn-delete" style="display:inline-block;padding:6px 12px">🗑️ Xóa</button>
                    </div>
                `;
                userListDiv.appendChild(el);
                if (u.email) {
                    const email = document.createElement('div');
                    email.style.color = '#666';
                    email.textContent = u.email;
                    el.querySelector('.meta').appendChild(email);
                }

                el.querySelector('.btn-edit').onclick = (e) => {
                    e.preventDefault();
                    const userId = e.target.dataset.key;
                    editUser(userId, u);
                };

                el.querySelector('.btn-delete').onclick = async (e) => {
                    e.preventDefault();
                    if (!canManageUser(u)) {
                        await showCustomAlert('Bạn không có quyền xóa tài khoản này.');
                        return;
                    }
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
    if (!userListDiv.childElementCount) {
        userListDiv.innerHTML = `<div class="admin-empty-state">${query ? 'Không tìm thấy tài khoản phù hợp.' : 'Chưa có người dùng nào.'}</div>`;
    }
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
    taskUserPicker.hidden = false;
    taskDetailsDiv.style.display = 'none';
    taskSelectedUserName.textContent = '';
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
    taskUserPicker.hidden = true;
    const selectedUser = Array.from(taskUserListDiv.querySelectorAll('button'))
        .find(button => button.dataset.id === userId);
    taskSelectedUserName.textContent = selectedUser?.textContent || userId;
    navPath = [];
    currentTasksObj = null;
    renderBackButton(0);
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
    taskBackBtn.textContent = level === 0 ? '← Danh sách tài khoản' : '← Quay lại';
    taskBackBtn.onclick = () => {
        if (level === 0) {
            taskDetailsDiv.style.display = 'none';
            taskUserListDiv.hidden = false;
            tasksContentDiv.innerHTML = '';
            taskSelectedUserName.textContent = '';
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
    const columns = [
        { label: 'STT', width: '4%', value: (_, index) => index + 1 },
        { label: 'Công việc', width: '10%', value: task => task.content },
        { label: 'Mô tả', width: '10%', value: task => task.description },
        { label: 'Người yêu cầu', width: '7%', value: task => task.requester },
        { label: 'Đơn vị', width: '5%', value: task => task.unit },
        { label: 'Phụ trách', width: '7%', value: task => task.assignee },
        { label: 'Ngày bắt đầu', width: '7%', value: task => task.startDate },
        { label: 'Ngày kết thúc', width: '7%', value: task => task.endDate },
        { label: 'Kết quả', width: '7%', value: task => task.result },
        { label: 'Hướng xử lý', width: '9%', value: task => task.direction },
        { label: 'Trạng thái', width: '7%', value: task => task.status },
        { label: '% Hoàn thành', width: '5%', value: task => task.completion },
        { label: 'Ghi chú', width: '5%', value: task => task.note }
    ];
    const table = document.createElement('table');
    table.className = 'admin-task-table';
    const colgroup = document.createElement('colgroup');
    columns.forEach(column => {
        const col = document.createElement('col');
        col.style.width = column.width;
        colgroup.appendChild(col);
    });
    table.appendChild(colgroup);
    const thead = document.createElement('thead');
    const headingRow = document.createElement('tr');
    columns.forEach(column => {
        const th = document.createElement('th');
        th.scope = 'col';
        th.textContent = column.label;
        headingRow.appendChild(th);
    });
    thead.appendChild(headingRow);
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    Object.values(list).forEach((task, index) => {
        const tr = document.createElement('tr');
        columns.forEach((column, columnIndex) => {
            const td = document.createElement('td');
            const value = column.value(task || {}, index);
            td.textContent = value === null || value === undefined || value === '' ? '—' : String(value);
            if (columnIndex === 0) td.className = 'admin-task-index';
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    const tableWrap = document.createElement('div');
    tableWrap.className = 'admin-task-table-wrap';
    tableWrap.appendChild(table);
    tasksContentDiv.appendChild(tableWrap);
}

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
                            direction: task.direction || '',
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
    const headers = ['Năm', 'Tháng', 'Tuần', 'Ngày', 'Nội dung', 'Thời gian', 'Trạng thái', 'Ưu tiên', 'Hướng xử lý', 'Đơn vị', 'Ghi chú'];
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
            <td>${row.direction}</td>
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
    const email = newEmail.value.trim().toLowerCase();
    const pin = newPin.value.trim();
    const role = newRole.value;

    if (!name) { await showCustomAlert('Vui lòng nhập tên người dùng'); return; }
    if (role === 'department' && !email) {
        await showCustomAlert('Vui lòng nhập email cho tài khoản Phòng Ban');
        return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        await showCustomAlert('Email không đúng định dạng');
        return;
    }
    if (!pin || pin.length !== 4) { await showCustomAlert('PIN phải đủ 4 chữ số'); return; }
    if (!isSuperAdmin() && !['member', 'department'].includes(role)) {
        await showCustomAlert('Admin chỉ được tạo hoặc phân quyền Thành viên và Phòng Ban.');
        return;
    }
    if (editingUserId && !canManageUser(currentUsersObj?.[editingUserId])) {
        await showCustomAlert('Bạn không có quyền chỉnh sửa tài khoản này.');
        return;
    }

    showLoadingAdmin();
    try {
        const userData = { name, email: email || null, pin, role };

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
