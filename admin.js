import { db } from './firebase.js';
import { ref, push, get, remove, onValue, update } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

const adminLoginDiv = document.getElementById('adminLogin');
const adminPanel = document.getElementById('adminPanel');
const adminPinInput = document.getElementById('adminPin');
const adminLoginBtn = document.getElementById('adminLoginBtn');
const adminLoginMsg = document.getElementById('adminLoginMsg');

const userListDiv = document.getElementById('userList');
const addUserBtn = document.getElementById('addUserBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const editingUserIdField = document.getElementById('editingUserId');
const newName = document.getElementById('newName');
const newPin = document.getElementById('newPin');
const newRole = document.getElementById('newRole');

let editingUserId = null;

const roleDisplay = {
    superadmin: { icon: '👑', label: 'Quản trị viên cấp cao' },
    admin: { icon: '👨‍💼', label: 'Quản trị viên' },
    member: { icon: '👤', label: 'Thành viên đăng ký' }
};

async function checkAdminPin(pin) {
    const snap = await get(ref(db, 'users'));
    if (!snap.exists()) return false;
    let ok = false;
    snap.forEach(ch => {
        const u = ch.val();
        if (u && u.pin && String(u.pin) === String(pin) && u.role === 'superadmin') ok = true;
    });
    return ok;
}

async function performAdminLogin() {
    const pin = adminPinInput.value.trim();
    if (pin.length !== 4) { adminLoginMsg.innerText = 'PIN phải đủ 4 chữ số'; return; }
    adminLoginMsg.innerText = '';
    try {
        const ok = await checkAdminPin(pin);
        if (!ok) { adminLoginMsg.innerText = 'PIN không hợp lệ hoặc không phải quản trị viên cấp cao'; return; }
        adminLoginDiv.style.display = 'none';
        adminPanel.style.display = 'block';
        bindUsers();
    } catch (e) {
        adminLoginMsg.innerText = 'Lỗi khi kiểm tra PIN';
        console.error(e);
    }
}

adminLoginBtn.onclick = performAdminLogin;

// Support Enter key to login
adminPinInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        performAdminLogin();
    }
});

function clearForm() {
    newName.value = '';
    newPin.value = '';
    newRole.value = 'member';
    editingUserId = null;
    editingUserIdField.value = '';
}

function resetFormUI() {
    addUserBtn.innerText = '➕ Thêm';
    addUserBtn.style.background = '#28a745';
    cancelEditBtn.style.display = 'none';
    clearForm();
}

function editUser(userId, userData) {
    editingUserId = userId;
    editingUserIdField.value = userId;
    newName.value = userData.name || '';
    newPin.value = userData.pin || '';
    newRole.value = userData.role || 'member';

    addUserBtn.innerText = '✏️ Cập nhật';
    addUserBtn.style.background = '#ffc107';
    cancelEditBtn.style.display = 'inline-block';

    newName.focus();
}

function renderUsers(usersObj) {
    userListDiv.innerHTML = '';
    if (!usersObj) return;

    // Group users by role
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
                    if (!confirm('Xóa người dùng "' + (u.name || 'User') + '" này?')) return;
                    try {
                        await remove(ref(db, `users/${e.target.dataset.key}`));
                    } catch (error) {
                        alert('Lỗi khi xóa người dùng: ' + error.message);
                    }
                };
            });
        }
    });
}

function bindUsers() {
    const r = ref(db, 'users');
    onValue(r, snap => {
        if (snap.exists()) renderUsers(snap.val());
        else userListDiv.innerHTML = '<em>Chưa có người dùng nào</em>';
    });
}

addUserBtn.onclick = async () => {
    const name = newName.value.trim();
    const pin = newPin.value.trim();
    const role = newRole.value;

    if (!name) return alert('Vui lòng nhập tên người dùng');
    if (!pin || pin.length !== 4) return alert('PIN phải đủ 4 chữ số');

    try {
        const userData = { name, pin, role };

        if (editingUserId) {
            // Update existing user
            await update(ref(db, `users/${editingUserId}`), userData);
            alert('✅ Cập nhật người dùng thành công');
        } else {
            // Add new user
            await push(ref(db, 'users'), userData);
            alert('✅ Thêm người dùng mới thành công');
        }
        resetFormUI();
    } catch (e) {
        console.error(e);
        alert('❌ Có lỗi: ' + (e.message || 'Không xác định'));
    }
};

cancelEditBtn.onclick = resetFormUI;
