"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateClubLeaderIds = exports.db = exports.auth = void 0;
const app_1 = require("firebase/app");
const firestore_1 = require("firebase/firestore");
const auth_1 = require("firebase/auth");
const firebaseConfig = {
    apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "vibecom-xxxxx.firebaseapp.com",
    projectId: "vibecom-xxxxx",
    storageBucket: "vibecom-xxxxx.appspot.com",
    messagingSenderId: "XXXXXXXXXXXX",
    appId: "1:XXXXXXXXXXXX:web:XXXXXXXXXXXXXXXX"
};
// Eğer daha önce bir app başlatılmışsa onu kullan, yoksa yeni başlat
const app = (0, app_1.getApps)().length ? (0, app_1.getApp)() : (0, app_1.initializeApp)(firebaseConfig);
exports.auth = (0, auth_1.getAuth)(app);
exports.db = (0, firestore_1.getFirestore)(app);
// Veritabanı işlemleri için yardımcı fonksiyonlar
const updateClubLeaderIds = async () => {
    try {
        const clubsCol = (0, firestore_1.collection)(exports.db, 'clubs');
        const clubsSnapshot = await (0, firestore_1.getDocs)(clubsCol);
        let updatedCount = 0;
        let skippedCount = 0;
        for (const clubDoc of clubsSnapshot.docs) {
            const data = clubDoc.data();
            if (!data.leaderId && data.adminIds && data.adminIds.length > 0) {
                await (0, firestore_1.updateDoc)((0, firestore_1.doc)(exports.db, 'clubs', clubDoc.id), {
                    leaderId: data.adminIds[0],
                });
                updatedCount++;
                console.log(`Kulüp güncellendi: ${clubDoc.id}, Lider ID: ${data.adminIds[0]}`);
            }
            else if (!data.leaderId) {
                skippedCount++;
                console.log(`Kulüp atlandı: ${clubDoc.id} (adminIds yok)`);
            }
            else {
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
    }
    catch (error) {
        console.error('Veritabanı güncelleme hatası:', error);
        return {
            success: false,
            error: error.message,
            message: 'Veritabanı güncellenirken bir hata oluştu.'
        };
    }
};
exports.updateClubLeaderIds = updateClubLeaderIds;
// Diğer veritabanı işlemleri buraya eklenebilir 
