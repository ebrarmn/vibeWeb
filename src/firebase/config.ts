import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
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