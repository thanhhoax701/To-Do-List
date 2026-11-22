import { db } from './firebase.js';
import { push, ref, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

function getLoginDeviceInfo() {
    if (typeof navigator === 'undefined') return 'Không xác định thiết bị';
    const userAgent = navigator.userAgent || '';
    const platform = navigator.platform || '';
    const isIPad = /\biPad\b/i.test(userAgent) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isTablet = isIPad || /tablet/i.test(userAgent) || (/android/i.test(userAgent) && !/mobile/i.test(userAgent));
    const isMobile = !isTablet && Boolean(navigator.userAgentData?.mobile || /iphone|ipod|android.*mobile|windows phone|mobile/i.test(userAgent));

    let browser = 'Trình duyệt';
    if (/edg(e|a|ios)?\//i.test(userAgent)) browser = 'Microsoft Edge';
    else if (/opr\//i.test(userAgent)) browser = 'Opera';
    else if (/samsungbrowser\//i.test(userAgent)) browser = 'Samsung Internet';
    else if (/firefox|fxios/i.test(userAgent)) browser = 'Firefox';
    else if (/crios|chrome\//i.test(userAgent)) browser = 'Chrome';
    else if (/safari\//i.test(userAgent)) browser = 'Safari';

    let operatingSystem = 'Không rõ hệ điều hành';
    if (isIPad) operatingSystem = 'iPadOS';
    else if (/iphone|ipod/i.test(userAgent)) operatingSystem = 'iOS';
    else if (/android/i.test(userAgent)) operatingSystem = 'Android';
    else if (/windows/i.test(userAgent)) operatingSystem = 'Windows';
    else if (/cros/i.test(userAgent)) operatingSystem = 'ChromeOS';
    else if (/macintosh|mac os x/i.test(userAgent)) operatingSystem = 'macOS';
    else if (/linux/i.test(userAgent)) operatingSystem = 'Linux';

    const deviceType = isTablet ? 'Máy tính bảng' : isMobile ? 'Điện thoại' : 'Laptop/PC';
    return `${browser} · ${operatingSystem} · ${deviceType}`;
}

export function recordSuccessfulLogin(user, accessType) {
    return push(ref(db, 'loginLogs'), {
        userId: String(user.key || ''),
        userName: String(user.name || 'Tài khoản không tên'),
        role: String(user.role || 'member'),
        accessType,
        deviceInfo: getLoginDeviceInfo(),
        timestamp: serverTimestamp()
    });
}
