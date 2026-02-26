// ========== IMPORT FIREBASE ==========
// Nhập Firebase Database và các hàm thao tác dữ liệu
import { db } from './firebase.js';
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

// ---------- loading helpers for admin page ----------
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
    // After importing JSON, Firebase sometimes wraps the real users
    // under a generated push-id. Detect and unwrap that layer so the
    // admin UI shows the correct entries instead of the random key.
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
                // unwrap possible wrapper
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
