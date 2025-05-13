"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.db = void 0;
const app_1 = require("firebase/app");
const firestore_1 = require("firebase/firestore");
const storage_1 = require("firebase/storage");
const firebaseConfig = {
    apiKey: "AIzaSyAG-cdxcK5as0pX4gKpKqmCa1FpEK-ea2w",
    authDomain: "vibewebmobile.firebaseapp.com",
    projectId: "vibewebmobile",
    storageBucket: "vibewebmobile.appspot.com",
    messagingSenderId: "1338146538",
    appId: "1:1338146538:web:401d4036c2037fcd1d8bcf",
    measurementId: "G-8K3YRZSRMS"
};
// Firebase'i başlat
const app = (0, app_1.initializeApp)(firebaseConfig);
// Firestore veritabanını başlat
const db = (0, firestore_1.getFirestore)(app);
exports.db = db;
// Storage servisini başlat
const storage = (0, storage_1.getStorage)(app);
exports.storage = storage;
exports.default = app;
