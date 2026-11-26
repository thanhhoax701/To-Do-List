import { createHash } from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

initializeApp();

const database = getDatabase();
const allowedActions = new Set([
    'created',
    'updated',
    'status_changed',
    'deleted',
    'bulk_deleted',
    'duplicated',
    'imported',
    'reordered'
]);
const pinAttemptWindowMs = 15 * 60 * 1000;
const maxFailedPinAttempts = 8;

function isValidDatabaseKey(value) {
    return typeof value === 'string' &&
        value.length > 0 &&
        value.length <= 128 &&
        !/[.#$/[\]]/.test(value);
}

function normalizeLogText(value, maxLength) {
    return String(value || '').trim().slice(0, maxLength);
}

function getClientIpHash(request) {
    const ip = request.rawRequest.ip || 'unknown';
    return createHash('sha256').update(ip).digest('hex');
}

async function assertPinAttemptAllowed(request) {
    const attemptRef = database.ref(`_security/taskEditLogAttempts/${getClientIpHash(request)}`);
    const snapshot = await attemptRef.get();
    const attempt = snapshot.val();
    if (attempt?.blockedUntil > Date.now()) {
        throw new HttpsError('resource-exhausted', 'Quá nhiều lần xác thực PIN không thành công. Vui lòng thử lại sau.');
    }
    return attemptRef;
}

async function recordFailedPinAttempt(attemptRef) {
    const now = Date.now();
    await attemptRef.transaction(current => {
        if (!current || now - Number(current.windowStartedAt || 0) >= pinAttemptWindowMs) {
            return { windowStartedAt: now, count: 1, blockedUntil: 0 };
        }
        const count = Number(current.count || 0) + 1;
        return {
            windowStartedAt: current.windowStartedAt,
            count,
            blockedUntil: count >= maxFailedPinAttempts ? now + pinAttemptWindowMs : 0
        };
    });
}

async function getActor(request, actorKey, pin) {
    if (request.auth) {
        const uid = request.auth.uid;
        const accessSnapshot = await database.ref(`adminAccess/${uid}`).get();
        const access = accessSnapshot.val();
        if (access?.enabled !== true || access.role !== 'superadmin' || !access.userId) {
            throw new HttpsError('permission-denied', 'Chỉ Super Admin được phép ghi nhật ký bằng phiên Firebase Auth.');
        }

        const profileSnapshot = await database.ref(`users/${access.userId}`).get();
        const profile = profileSnapshot.val();
        if (!profile || profile.role !== 'superadmin') {
            throw new HttpsError('permission-denied', 'Không tìm thấy hồ sơ Super Admin hợp lệ.');
        }
        return { key: String(access.userId), profile };
    }

    if (!isValidDatabaseKey(actorKey) || !/^\d{4}$/.test(String(pin || ''))) {
        throw new HttpsError('unauthenticated', 'Tài khoản hoặc PIN không hợp lệ.');
    }

    const attemptRef = await assertPinAttemptAllowed(request);
    const profileSnapshot = await database.ref(`users/${actorKey}`).get();
    const profile = profileSnapshot.val();
    if (!profile || profile.role === 'superadmin' || String(profile.pin) !== String(pin)) {
        await recordFailedPinAttempt(attemptRef);
        throw new HttpsError('unauthenticated', 'Không thể xác thực tài khoản để ghi nhật ký.');
    }

    await attemptRef.remove();
    return { key: String(actorKey), profile };
}

export const recordTaskEdit = onCall({ region: 'us-central1', maxInstances: 10 }, async request => {
    const {
        actorKey,
        pin,
        action,
        taskId,
        taskContent,
        taskDate,
        details
    } = request.data || {};

    if (!allowedActions.has(action)) {
        throw new HttpsError('invalid-argument', 'Loại thay đổi công việc không hợp lệ.');
    }

    const actor = await getActor(request, actorKey, pin);
    const date = normalizeLogText(taskDate, 10);
    if (date && !/^\d{4}-\d{2}(-\d{2})?$/.test(date)) {
        throw new HttpsError('invalid-argument', 'Ngày công việc không hợp lệ.');
    }

    const logRef = database.ref('taskEditLogs').push();
    await logRef.set({
        actorId: actor.key,
        actorName: normalizeLogText(actor.profile.name || actor.key, 120),
        actorRole: normalizeLogText(actor.profile.role || 'member', 40),
        action,
        taskId: normalizeLogText(taskId, 128),
        taskContent: normalizeLogText(taskContent, 200),
        taskDate: date,
        details: normalizeLogText(details, 300),
        timestamp: Date.now()
    });

    return { recorded: true };
});
