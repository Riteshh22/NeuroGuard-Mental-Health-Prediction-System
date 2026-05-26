// Import the functions you need from the specific CDN URLs for browser modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp, doc, setDoc, where } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA2E-uWgANVmBvsA2GJXL4mDZBzP4_5ANE",
    authDomain: "neuroguard-53660.firebaseapp.com",
    projectId: "neuroguard-53660",
    storageBucket: "neuroguard-53660.firebasestorage.app",
    messagingSenderId: "321317916111",
    appId: "1:321317916111:web:bd25adc00d8a743fdf96ba"
};

// Initialize Firebase
let app, db;
try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Firebase Modular SDK initialized globally");
} catch (e) {
    console.error("Firebase module initialization failed:", e);
}

// Ensure the db and modular functions are globally accessible by non-module scripts (like app.js)
window.db = db;
window.firestoreFunctions = {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    limit,
    serverTimestamp,
    doc,
    setDoc,
    where
};