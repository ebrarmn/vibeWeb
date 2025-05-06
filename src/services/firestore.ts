import { 
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Club, User, Event } from '../types/models';

// Koleksiyon referansları
const clubsRef = collection(db, 'clubs');
const usersRef = collection(db, 'users');
const eventsRef = collection(db, 'events');
const pendingClubsRef = collection(db, 'pendingClubs');

// Kulüp servisleri
export const clubServices = {
    async getAll(): Promise<Club[]> {
        try {
            const snapshot = await getDocs(clubsRef);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate() || new Date()
            } as Club));
        } catch (error) {
            console.error('Error fetching clubs:', error);
            return [];
        }
    },

    async getById(id: string): Promise<Club | null> {
        try {
            const docRef = doc(clubsRef, id);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) return null;
            
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date()
            } as Club;
        } catch (error) {
            console.error('Error fetching club by ID:', error);
            return null;
        }
    },

    async create(club: Omit<Club, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        const now = new Date();
        const docRef = await addDoc(clubsRef, {
            ...club,
            createdAt: now,
            updatedAt: now
        });
        return docRef.id;
    },

    async update(id: string, club: Partial<Club>): Promise<void> {
        const docRef = doc(clubsRef, id);
        await updateDoc(docRef, {
            ...club,
            updatedAt: new Date()
        });
    },

    async delete(id: string): Promise<void> {
        await deleteDoc(doc(clubsRef, id));
    },

    async addMember(clubId: string, userId: string, role: 'admin' | 'member'): Promise<void> {
        const clubRef = doc(clubsRef, clubId);
        const club = await this.getById(clubId);
        if (!club) throw new Error('Club not found');

        await updateDoc(clubRef, {
            memberIds: [...club.memberIds, userId],
            [`memberRoles.${userId}`]: role,
            updatedAt: new Date()
        });
    },

    async removeMember(clubId: string, userId: string): Promise<void> {
        const clubRef = doc(clubsRef, clubId);
        const club = await this.getById(clubId);
        if (!club) throw new Error('Club not found');

        const { [userId]: removedRole, ...remainingRoles } = club.memberRoles;
        
        await updateDoc(clubRef, {
            memberIds: club.memberIds.filter(id => id !== userId),
            memberRoles: remainingRoles,
            updatedAt: new Date()
        });
    }
};

// Kullanıcı servisleri
export const userServices = {
    async getAll(): Promise<User[]> {
        try {
            const snapshot = await getDocs(usersRef);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate() || new Date()
            } as User));
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    },

    async getById(id: string): Promise<User | null> {
        try {
            const docRef = doc(usersRef, id);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) return null;
            
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date()
            } as User;
        } catch (error) {
            console.error('Error fetching user by ID:', error);
            return null;
        }
    },

    async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        const now = new Date();
        const docRef = await addDoc(usersRef, {
            ...user,
            createdAt: now,
            updatedAt: now
        });
        return docRef.id;
    },

    async update(id: string, user: Partial<User>): Promise<void> {
        const docRef = doc(usersRef, id);
        await updateDoc(docRef, {
            ...user,
            updatedAt: new Date()
        });
    },

    async delete(id: string): Promise<void> {
        await deleteDoc(doc(usersRef, id));
    },

    async joinClub(userId: string, clubId: string, role: 'admin' | 'member'): Promise<void> {
        const userRef = doc(usersRef, userId);
        const user = await this.getById(userId);
        if (!user) throw new Error('User not found');

        await updateDoc(userRef, {
            clubIds: [...user.clubIds, clubId],
            [`clubRoles.${clubId}`]: role,
            updatedAt: new Date()
        });
    },

    async leaveClub(userId: string, clubId: string): Promise<void> {
        const userRef = doc(usersRef, userId);
        const user = await this.getById(userId);
        if (!user) throw new Error('User not found');

        const { [clubId]: removedRole, ...remainingRoles } = user.clubRoles;

        await updateDoc(userRef, {
            clubIds: user.clubIds.filter(id => id !== clubId),
            clubRoles: remainingRoles,
            updatedAt: new Date()
        });
    }
};

// Etkinlik servisleri
export const eventServices = {
    async getAll(): Promise<Event[]> {
        try {
            const snapshot = await getDocs(eventsRef);
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    startDate: data.startDate instanceof Timestamp ? data.startDate.toDate().toISOString() : data.startDate,
                    endDate: data.endDate instanceof Timestamp ? data.endDate.toDate().toISOString() : data.endDate,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date()
                } as Event;
            });
        } catch (error) {
            console.error('Error fetching events:', error);
            return [];
        }
    },

    async getById(id: string): Promise<Event | null> {
        try {
            const docRef = doc(eventsRef, id);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) return null;
            
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                startDate: data.startDate instanceof Timestamp ? data.startDate.toDate().toISOString() : data.startDate,
                endDate: data.endDate instanceof Timestamp ? data.endDate.toDate().toISOString() : data.endDate,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date()
            } as Event;
        } catch (error) {
            console.error('Error fetching event by ID:', error);
            return null;
        }
    },

    async create(event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        const now = new Date();
        const docRef = await addDoc(eventsRef, {
            ...event,
            createdAt: now,
            updatedAt: now
        });
        return docRef.id;
    },

    async update(id: string, event: Partial<Event>): Promise<void> {
        const docRef = doc(eventsRef, id);
        await updateDoc(docRef, {
            ...event,
            updatedAt: new Date()
        });
    },

    async delete(id: string): Promise<void> {
        await deleteDoc(doc(eventsRef, id));
    },

    async getByClubId(clubId: string): Promise<Event[]> {
        const q = query(eventsRef, where("clubId", "==", clubId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                startDate: data.startDate instanceof Timestamp ? data.startDate.toDate().toISOString() : data.startDate,
                endDate: data.endDate instanceof Timestamp ? data.endDate.toDate().toISOString() : data.endDate,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date()
            } as Event;
        });
    },

    async registerAttendee(eventId: string, userId: string): Promise<void> {
        const eventRef = doc(eventsRef, eventId);
        const event = await this.getById(eventId);
        if (!event) throw new Error('Event not found');

        await updateDoc(eventRef, {
            attendeeIds: [...event.attendeeIds, userId],
            [`attendeeStatus.${userId}`]: 'registered',
            updatedAt: new Date()
        });
    },

    async updateAttendeeStatus(eventId: string, userId: string, status: 'registered' | 'attended' | 'cancelled'): Promise<void> {
        const eventRef = doc(eventsRef, eventId);
        await updateDoc(eventRef, {
            [`attendeeStatus.${userId}`]: status,
            updatedAt: new Date()
        });
    },

    async removeAttendee(eventId: string, userId: string): Promise<void> {
        const eventRef = doc(eventsRef, eventId);
        const event = await this.getById(eventId);
        if (!event) throw new Error('Event not found');

        const { [userId]: removedStatus, ...remainingStatus } = event.attendeeStatus;

        await updateDoc(eventRef, {
            attendeeIds: event.attendeeIds.filter(id => id !== userId),
            attendeeStatus: remainingStatus,
            updatedAt: new Date()
        });
    }
};

export const pendingClubServices = {
    async getAll(): Promise<any[]> {
        const snapshot = await getDocs(pendingClubsRef);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    async approve(pendingClub: any): Promise<void> {
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
        await addDoc(clubsRef, clubData);
        // Başvuruyu sil
        await deleteDoc(doc(pendingClubsRef, pendingClub.id));
    },
    async reject(pendingClubId: string): Promise<void> {
        await deleteDoc(doc(pendingClubsRef, pendingClubId));
    }
}; 