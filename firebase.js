// ========== IMPORT VÀ KHỞI TẠO FIREBASE ==========
// Nhập Firebase SDK cần thiết cho ứng dụng Quản lý Công việc
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// Base64 chỉ làm mờ cấu hình client; không dùng như biện pháp bảo mật.
const encodedFirebaseConfig = "eyJhcGlLZXkiOiJBSXphU3lDeTdScmVZM2ptb0RzV0t6bG1RR0d0NWNWc3h2ZGY2MXciLCJhdXRoRG9tYWluIjoidG8tZG8tbGlzdC05ZmRkNS5maXJlYmFzZWFwcC5jb20iLCJkYXRhYmFzZVVSTCI6Imh0dHBzOi8vdG8tZG8tbGlzdC05ZmRkNS1kZWZhdWx0LXJ0ZGIuZmlyZWJhc2Vpby5jb20iLCJwcm9qZWN0SWQiOiJ0by1kby1saXN0LTlmZGQ1Iiwic3RvcmFnZUJ1Y2tldCI6InRvLWRvLWxpc3QtOWZkZDUuZmlyZWJhc2VzdG9yYWdlLmFwcCIsIm1lc3NhZ2luZ1NlbmRlcklkIjoiNjU0OTM3MDY4MTA1IiwiYXBwSWQiOiIxOjY1NDkzNzA2ODEwNTp3ZWI6NDQ0MzYyNzFjYTU2NGQ3ODJhNjU5OCIsIm1lYXN1cmVtZW50SWQiOiJHLVRDWDJUOVc2WkMifQ==";
const firebaseConfig = JSON.parse(atob(encodedFirebaseConfig));

// Khởi tạo Firebase App với cấu hình trên
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Export Realtime Database instance để sử dụng trong các file khác
// Sử dụng: import { db } from "./firebase.js"
export const db = getDatabase(app);
export const storage = getStorage(app);
