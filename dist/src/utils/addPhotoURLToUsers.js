"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("firebase/app");
const firestore_1 = require("firebase/firestore");
// Buraya kendi Firebase config bilgilerinizi girin
const firebaseConfig = {
    apiKey: "AIzaSyAG-cdxcK5as0pX4gKpKqmCalFpEK-ea2w",
    authDomain: "vibewebmobile.firebaseapp.com",
    projectId: "vibewebmobile",
    storageBucket: "vibewebmobile.firebasestorage.app",
    messagingSenderId: "13381465438",
    appId: "1:13381465438:web:401d4036c2037fcd1d8bcf",
    measurementId: "G-8K3YRZSRMS"
};
const app = (0, app_1.initializeApp)(firebaseConfig);
const db = (0, firestore_1.getFirestore)(app);
async function addPhotoURLToAllUsers() {
    const usersRef = (0, firestore_1.collection)(db, 'users');
    const snapshot = await (0, firestore_1.getDocs)(usersRef);
    for (const userDoc of snapshot.docs) {
        const data = userDoc.data();
        if (!data.photoURL) {
            const displayName = data.displayName || 'User';
            const photoURL = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(displayName);
            await (0, firestore_1.updateDoc)((0, firestore_1.doc)(usersRef, userDoc.id), { photoURL });
            console.log(`photoURL eklendi: ${userDoc.id}`);
        }
    }
    console.log('Tüm eksik kullanıcılar için photoURL alanı eklendi.');
}
addPhotoURLToAllUsers().catch(console.error);
