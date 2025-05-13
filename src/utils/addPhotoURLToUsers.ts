import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addPhotoURLToAllUsers() {
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);

  for (const userDoc of snapshot.docs) {
    const data = userDoc.data();
    if (!data.photoURL) {
      const displayName = data.displayName || 'User';
      const photoURL = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(displayName);
      await updateDoc(doc(usersRef, userDoc.id), { photoURL });
      console.log(`photoURL eklendi: ${userDoc.id}`);
    }
  }
  console.log('Tüm eksik kullanıcılar için photoURL alanı eklendi.');
}

addPhotoURLToAllUsers().catch(console.error); 