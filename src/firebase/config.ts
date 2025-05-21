import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAG-cdxcK5as0pX4gKpKqmCalFpEK-ea2w",
  authDomain: "vibewebmobile.firebaseapp.com",
  projectId: "vibewebmobile",
  storageBucket: "vibewebmobile.firebasestorage.app",
  messagingSenderId: "13381465438",
  appId: "1:13381465438:web:401d4036c2037fcd1d8bcf",
  measurementId: "G-8K3YRZSRMS"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Firestore veritabanını başlat
const db = getFirestore(app);

// Storage servisini başlat
const storage = getStorage(app);

const auth = getAuth(app);

// Kulüp liderlerini güncelleyen fonksiyon
export const updateClubLeaderIds = async () => {
    try {
        const clubsCol = collection(db, 'clubs');
        const clubsSnapshot = await getDocs(clubsCol);
        let updatedCount = 0;
        let skippedCount = 0;

        for (const clubDoc of clubsSnapshot.docs) {
            const data = clubDoc.data();
            if (!data.leaderId && data.adminIds && data.adminIds.length > 0) {
                await updateDoc(doc(db, 'clubs', clubDoc.id), {
                    leaderId: data.adminIds[0],
                });
                updatedCount++;
            } else if (!data.leaderId) {
                skippedCount++;
            } else {
                skippedCount++;
            }
        }

        return {
            success: true,
            updatedCount,
            skippedCount,
            message: `İşlem tamamlandı! ${updatedCount} kulüp güncellendi, ${skippedCount} kulüp atlandı.`
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message,
            message: 'Veritabanı güncellenirken bir hata oluştu.'
        };
    }
};

export { db, storage, auth };
export default app; 