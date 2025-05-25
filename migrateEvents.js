const admin = require('firebase-admin');

// Servis hesabı json dosyanı buraya koymalısın
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateEvents() {
  const eventsSnap = await db.collection('events').get();
  for (const doc of eventsSnap.docs) {
    const data = doc.data();

    // Eğer startDate yoksa, eski date alanını kullan
    if (!data.startDate && data.date) {
      await doc.ref.update({
        startDate: data.date,
        endDate: data.date // Eğer bitiş tarihi farklıysa, burayı değiştir
      });
      console.log(`Güncellendi: ${doc.id}`);
    } else if (!data.startDate && !data.date) {
      console.log(`Uyarı: ${doc.id} dokümanında tarih alanı yok!`);
    } else {
      console.log(`Zaten güncel: ${doc.id}`);
    }
  }
  console.log('Tüm eventler güncellendi!');
}

migrateEvents();