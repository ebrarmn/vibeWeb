import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

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
const app = initializeApp(firebaseConfig);

// Firestore veritabanını başlat
const db = getFirestore(app);

// Storage servisini başlat
const storage = getStorage(app);

export { db, storage };
export default app; 