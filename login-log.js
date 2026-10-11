import { db } from './firebase.js';
import { push, ref, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

export function recordSuccessfulLogin(user, accessType) {
    return push(ref(db, 'loginLogs'), {
        userId: String(user.key || ''),
        userName: String(user.name || 'Tài khoản không tên'),
        role: String(user.role || 'member'),
        accessType,
        timestamp: serverTimestamp()
    });
}
