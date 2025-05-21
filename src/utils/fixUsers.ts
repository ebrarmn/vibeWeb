import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc, deleteField } from 'firebase/firestore';

// Buraya kendi Firebase config bilgilerini gir
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

async function fixUsers() {
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);

  for (const userDoc of snapshot.docs) {
    const data = userDoc.data();
    const updateData: any = {};

    // firstName ve lastName'i sil
    if ('firstName' in data) updateData.firstName = deleteField();
    if ('lastName' in data) updateData.lastName = deleteField();

    // studentNumber yoksa ekle
    if (!data.studentNumber) updateData.studentNumber = '100000000';

    if (Object.keys(updateData).length > 0) {
      await updateDoc(doc(usersRef, userDoc.id), updateData);
      console.log(`Güncellendi: ${userDoc.id}`);
    }
  }
  console.log('Tüm kullanıcılar düzeltildi!');
}

fixUsers();