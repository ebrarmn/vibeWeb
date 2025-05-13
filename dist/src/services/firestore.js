"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pendingClubServices = exports.eventServices = exports.userServices = exports.clubServices = void 0;
const firestore_1 = require("firebase/firestore");
const config_1 = require("../firebase/config");
// Koleksiyon referansları
const clubsRef = (0, firestore_1.collection)(config_1.db, 'clubs');
const usersRef = (0, firestore_1.collection)(config_1.db, 'users');
const eventsRef = (0, firestore_1.collection)(config_1.db, 'events');
const pendingClubsRef = (0, firestore_1.collection)(config_1.db, 'pendingClubs');
// Kulüp servisleri
exports.clubServices = {
    async getAll() {
        try {
            const snapshot = await (0, firestore_1.getDocs)(clubsRef);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate() || new Date()
            }));
        }
        catch (error) {
            console.error('Error fetching clubs:', error);
            return [];
        }
    },
    async getById(id) {
        try {
            const docRef = (0, firestore_1.doc)(clubsRef, id);
            const docSnap = await (0, firestore_1.getDoc)(docRef);
            if (!docSnap.exists())
                return null;
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date()
            };
        }
        catch (error) {
            console.error('Error fetching club by ID:', error);
            return null;
        }
    },
    async create(club) {
        const now = new Date();
        const docRef = await (0, firestore_1.addDoc)(clubsRef, {
            ...club,
            createdAt: now,
            updatedAt: now
        });
        return docRef.id;
    },
    async update(id, club) {
        const docRef = (0, firestore_1.doc)(clubsRef, id);
        await (0, firestore_1.updateDoc)(docRef, {
            ...club,
            updatedAt: new Date()
        });
    },
    async delete(id) {
        try {
            // 1. Kulübe ait etkinlikleri bul ve sil
            const clubEvents = await exports.eventServices.getByClubId(id);
            await Promise.all(clubEvents.map(event => exports.eventServices.delete(event.id)));
            // 2. Kulübe üye olan tüm kullanıcıları bul
            const club = await this.getById(id);
            if (!club)
                throw new Error('Club not found');
            // 3. Her kullanıcıdan kulüp ilişkisini kaldır
            await Promise.all(club.memberIds.map(userId => exports.userServices.leaveClub(userId, id)));
            // 4. Son olarak kulübü sil
            await (0, firestore_1.deleteDoc)((0, firestore_1.doc)(clubsRef, id));
        }
        catch (error) {
            console.error('Kulüp silinirken hata oluştu:', error);
            throw error;
        }
    },
    async addMember(clubId, userId, role) {
        const clubRef = (0, firestore_1.doc)(clubsRef, clubId);
        const club = await this.getById(clubId);
        if (!club)
            throw new Error('Club not found');
        await (0, firestore_1.updateDoc)(clubRef, {
            memberIds: [...club.memberIds, userId],
            [`memberRoles.${userId}`]: role,
            updatedAt: new Date()
        });
    },
    async removeMember(clubId, userId) {
        const clubRef = (0, firestore_1.doc)(clubsRef, clubId);
        const club = await this.getById(clubId);
        if (!club)
            throw new Error('Club not found');
        const { [userId]: removedRole, ...remainingRoles } = club.memberRoles;
        await (0, firestore_1.updateDoc)(clubRef, {
            memberIds: club.memberIds.filter(id => id !== userId),
            memberRoles: remainingRoles,
            updatedAt: new Date()
        });
    }
};
// Kullanıcı servisleri
exports.userServices = {
    async getAll() {
        try {
            const snapshot = await (0, firestore_1.getDocs)(usersRef);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate() || new Date()
            }));
        }
        catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    },
    async getById(id) {
        try {
            const docRef = (0, firestore_1.doc)(usersRef, id);
            const docSnap = await (0, firestore_1.getDoc)(docRef);
            if (!docSnap.exists())
                return null;
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date()
            };
        }
        catch (error) {
            console.error('Error fetching user by ID:', error);
            return null;
        }
    },
    async create(user) {
        const now = new Date();
        const photoURL = user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.displayName || 'User');
        const docRef = await (0, firestore_1.addDoc)(usersRef, {
            ...user,
            photoURL,
            createdAt: now,
            updatedAt: now
        });
        return docRef.id;
    },
    async update(id, user) {
        const docRef = (0, firestore_1.doc)(usersRef, id);
        await (0, firestore_1.updateDoc)(docRef, {
            ...user,
            updatedAt: new Date()
        });
    },
    async delete(id) {
        await (0, firestore_1.deleteDoc)((0, firestore_1.doc)(usersRef, id));
    },
    async joinClub(userId, clubId, role) {
        const userRef = (0, firestore_1.doc)(usersRef, userId);
        const user = await this.getById(userId);
        if (!user)
            throw new Error('User not found');
        await (0, firestore_1.updateDoc)(userRef, {
            clubIds: [...user.clubIds, clubId],
            [`clubRoles.${clubId}`]: role,
            updatedAt: new Date()
        });
    },
    async leaveClub(userId, clubId) {
        const userRef = (0, firestore_1.doc)(usersRef, userId);
        const user = await this.getById(userId);
        if (!user)
            throw new Error('User not found');
        const { [clubId]: removedRole, ...remainingRoles } = user.clubRoles;
        await (0, firestore_1.updateDoc)(userRef, {
            clubIds: user.clubIds.filter(id => id !== clubId),
            clubRoles: remainingRoles,
            updatedAt: new Date()
        });
    }
};
// Etkinlik servisleri
exports.eventServices = {
    async getAll() {
        try {
            const snapshot = await (0, firestore_1.getDocs)(eventsRef);
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    startDate: data.startDate instanceof firestore_1.Timestamp ? data.startDate.toDate().toISOString() : data.startDate,
                    endDate: data.endDate instanceof firestore_1.Timestamp ? data.endDate.toDate().toISOString() : data.endDate,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date()
                };
            });
        }
        catch (error) {
            console.error('Error fetching events:', error);
            return [];
        }
    },
    async getById(id) {
        try {
            const docRef = (0, firestore_1.doc)(eventsRef, id);
            const docSnap = await (0, firestore_1.getDoc)(docRef);
            if (!docSnap.exists())
                return null;
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                startDate: data.startDate instanceof firestore_1.Timestamp ? data.startDate.toDate().toISOString() : data.startDate,
                endDate: data.endDate instanceof firestore_1.Timestamp ? data.endDate.toDate().toISOString() : data.endDate,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date()
            };
        }
        catch (error) {
            console.error('Error fetching event by ID:', error);
            return null;
        }
    },
    async create(event) {
        const now = new Date();
        const docRef = await (0, firestore_1.addDoc)(eventsRef, {
            ...event,
            createdAt: now,
            updatedAt: now
        });
        return docRef.id;
    },
    async update(id, event) {
        const docRef = (0, firestore_1.doc)(eventsRef, id);
        await (0, firestore_1.updateDoc)(docRef, {
            ...event,
            updatedAt: new Date()
        });
    },
    async delete(id) {
        await (0, firestore_1.deleteDoc)((0, firestore_1.doc)(eventsRef, id));
    },
    async getByClubId(clubId) {
        const q = (0, firestore_1.query)(eventsRef, (0, firestore_1.where)("clubId", "==", clubId));
        const snapshot = await (0, firestore_1.getDocs)(q);
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                startDate: data.startDate instanceof firestore_1.Timestamp ? data.startDate.toDate().toISOString() : data.startDate,
                endDate: data.endDate instanceof firestore_1.Timestamp ? data.endDate.toDate().toISOString() : data.endDate,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date()
            };
        });
    },
    async registerAttendee(eventId, userId) {
        const eventRef = (0, firestore_1.doc)(eventsRef, eventId);
        const event = await this.getById(eventId);
        if (!event)
            throw new Error('Event not found');
        // Kullanıcının kulüp üyeliğini kontrol et
        const user = await exports.userServices.getById(userId);
        if (!user)
            throw new Error('User not found');
        // Kullanıcı kulübe üye değilse hata fırlat
        if (!user.clubIds.includes(event.clubId)) {
            throw new Error('Kullanıcı bu etkinliğin kulübüne üye değil. Önce kulübe katılmalısınız.');
        }
        await (0, firestore_1.updateDoc)(eventRef, {
            attendeeIds: [...event.attendeeIds, userId],
            [`attendeeStatus.${userId}`]: 'registered',
            updatedAt: new Date()
        });
    },
    async updateAttendeeStatus(eventId, userId, status) {
        const eventRef = (0, firestore_1.doc)(eventsRef, eventId);
        await (0, firestore_1.updateDoc)(eventRef, {
            [`attendeeStatus.${userId}`]: status,
            updatedAt: new Date()
        });
    },
    async removeAttendee(eventId, userId) {
        const eventRef = (0, firestore_1.doc)(eventsRef, eventId);
        const event = await this.getById(eventId);
        if (!event)
            throw new Error('Event not found');
        const { [userId]: removedStatus, ...remainingStatus } = event.attendeeStatus;
        await (0, firestore_1.updateDoc)(eventRef, {
            attendeeIds: event.attendeeIds.filter(id => id !== userId),
            attendeeStatus: remainingStatus,
            updatedAt: new Date()
        });
    }
};
exports.pendingClubServices = {
    async getAll() {
        const snapshot = await (0, firestore_1.getDocs)(pendingClubsRef);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    async approve(pendingClub) {
        // Yeni kulüp oluştur
        const clubData = {
            name: pendingClub.name,
            description: pendingClub.description,
            memberIds: [pendingClub.createdBy],
            memberRoles: { [pendingClub.createdBy]: 'admin' },
            eventIds: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const clubRef = await (0, firestore_1.addDoc)(clubsRef, clubData);
        // Kullanıcıya kulüp ekle (clubIds ve clubRoles)
        const userRef = (0, firestore_1.doc)(usersRef, pendingClub.createdBy);
        const userSnap = await (0, firestore_1.getDoc)(userRef);
        if (userSnap.exists()) {
            const userData = userSnap.data();
            const updatedClubIds = Array.isArray(userData.clubIds) ? [...userData.clubIds, clubRef.id] : [clubRef.id];
            const updatedClubRoles = { ...(userData.clubRoles || {}), [clubRef.id]: 'admin' };
            await (0, firestore_1.updateDoc)(userRef, {
                clubIds: updatedClubIds,
                clubRoles: updatedClubRoles,
                updatedAt: new Date()
            });
        }
        // Başvuruyu sil
        await (0, firestore_1.deleteDoc)((0, firestore_1.doc)(pendingClubsRef, pendingClub.id));
    },
    async reject(pendingClubId) {
        await (0, firestore_1.deleteDoc)((0, firestore_1.doc)(pendingClubsRef, pendingClubId));
    }
};
