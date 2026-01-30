// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCy7RreY3jmoDsWKzlmQGGt5cVsxvdf61w",
    authDomain: "to-do-list-9fdd5.firebaseapp.com",
    databaseURL: "https://to-do-list-9fdd5-default-rtdb.firebaseio.com",
    projectId: "to-do-list-9fdd5",
    storageBucket: "to-do-list-9fdd5.firebasestorage.app",
    messagingSenderId: "654937068105",
    appId: "1:654937068105:web:44436271ca564d782a6598",
    measurementId: "G-TCX2T9W6ZC"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
