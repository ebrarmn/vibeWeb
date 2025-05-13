"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const admin = __importStar(require("firebase-admin"));
const fs = __importStar(require("fs"));
// Servis hesabı anahtarını buradan yükle (serviceAccountKey.json dosyanı proje köküne koymalısın)
const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();
async function updateAllUsers() {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();
    const promises = [];
    snapshot.forEach((doc) => {
        const data = doc.data();
        promises.push(doc.ref.update({
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
        }));
    });
    await Promise.all(promises);
    console.log('Tüm kullanıcılar güncellendi!');
}
updateAllUsers().catch(console.error);
