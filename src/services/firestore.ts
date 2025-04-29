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
    }
};

// Etkinlik servisleri
export const eventServices = {
    async getAll(): Promise<Event[]> {
        const snapshot = await getDocs(eventsRef);
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                startDate: data.startDate instanceof Timestamp ? data.startDate.toDate().toISOString() : data.startDate,
                endDate: data.endDate instanceof Timestamp ? data.endDate.toDate().toISOString() : data.endDate,
                createdAt: (data.createdAt as Timestamp).toDate(),
                updatedAt: (data.updatedAt as Timestamp).toDate()
            } as Event;
        });
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
                createdAt: (data.createdAt as Timestamp).toDate(),
                updatedAt: (data.updatedAt as Timestamp).toDate()
            } as Event;
        });
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
    }
}; 