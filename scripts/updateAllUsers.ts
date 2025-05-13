import * as admin from 'firebase-admin';
import * as fs from 'fs';

// Servis hesabı anahtarını buradan yükle (serviceAccountKey.json dosyanı proje köküne koymalısın)
const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function updateAllUsers() {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();
  const promises: Promise<any>[] = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    promises.push(
      doc.ref.update({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phone: data.phone || '',
        birthDate: data.birthDate || '',
        gender: data.gender || '',
        university: data.university || '',
        faculty: data.faculty || '',
        department: data.department || '',
        grade: data.grade || '',
        displayName: data.displayName || (data.firstName && data.lastName ? data.firstName + ' ' + data.lastName : ''),
      })
    );
  });
  await Promise.all(promises);
  console.log('Tüm kullanıcılar güncellendi!');
}

updateAllUsers().catch(console.error); 