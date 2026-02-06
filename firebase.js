// ========== IMPORT VÀ KHỞI TẠO FIREBASE ==========
// Nhập Firebase SDK cần thiết cho ứng dụng Quản lý Công việc
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// ========== CẤU HÌNH FIREBASE ==========
// Cấu hình Firebase cho dự án "to-do-list"
// Bao gồm: API key, Database URL, Project ID, v.v.
const firebaseConfig = {
    apiKey: "AIzaSyCy7RreY3jmoDsWKzlmQGGt5cVsxvdf61w", // API key cho xác thực
    authDomain: "to-do-list-9fdd5.firebaseapp.com", // Domain xác thực
    databaseURL: "https://to-do-list-9fdd5-default-rtdb.firebaseio.com", // Realtime Database URL
    projectId: "to-do-list-9fdd5", // ID dự án
    storageBucket: "to-do-list-9fdd5.firebasestorage.app", // Bucket lưu trữ tệp
    messagingSenderId: "654937068105", // ID tin nhắn push
    appId: "1:654937068105:web:44436271ca564d782a6598", // ID ứng dụng
    measurementId: "G-TCX2T9W6ZC" // ID phân tích
};

// Khởi tạo Firebase App với cấu hình trên
const app = initializeApp(firebaseConfig);

// Export Realtime Database instance để sử dụng trong các file khác
// Sử dụng: import { db } from "./firebase.js"
export const db = getDatabase(app);
