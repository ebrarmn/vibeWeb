import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "vibecom-xxxxx.firebaseapp.com",
    projectId: "vibecom-xxxxx",
    storageBucket: "vibecom-xxxxx.appspot.com",
    messagingSenderId: "XXXXXXXXXXXX",
    appId: "1:XXXXXXXXXXXX:web:XXXXXXXXXXXXXXXX"
};

// Eğer daha önce bir app başlatılmışsa onu kullan, yoksa yeni başlat
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Veritabanı işlemleri için yardımcı fonksiyonlar
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
                console.log(`Kulüp güncellendi: ${clubDoc.id}, Lider ID: ${data.adminIds[0]}`);
            } else if (!data.leaderId) {
                skippedCount++;
                console.log(`Kulüp atlandı: ${clubDoc.id} (adminIds yok)`);
            } else {
                skippedCount++;
                console.log(`Kulüp atlandı: ${clubDoc.id} (zaten leaderId var)`);
            }
        }

        return {
            success: true,
            updatedCount,
            skippedCount,
            message: `İşlem tamamlandı! ${updatedCount} kulüp güncellendi, ${skippedCount} kulüp atlandı.`
        };
    } catch (error: any) {
        console.error('Veritabanı güncelleme hatası:', error);
        return {
            success: false,
            error: error.message,
            message: 'Veritabanı güncellenirken bir hata oluştu.'
        };
    }
};

// Diğer veritabanı işlemleri buraya eklenebilir 