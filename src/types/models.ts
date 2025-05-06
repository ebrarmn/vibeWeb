export interface Club {
    id: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    memberIds: string[];
    memberRoles: { [userId: string]: 'admin' | 'member' };
    eventIds: string[];
}

export interface User {
    id: string;
    email: string;
    displayName: string;
    photoURL?: string;
    role: 'admin' | 'user';
    clubIds: string[];
    clubRoles: { [clubId: string]: 'admin' | 'member' };
    createdAt: Date;
    updatedAt: Date;
}

export interface Event {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    clubId: string;
    startDate: string;
    endDate: string;
    location: string;
    capacity: number;
    attendeeIds: string[];
    attendeeStatus: { [userId: string]: 'registered' | 'attended' | 'cancelled' };
    createdAt: Date;
    updatedAt: Date;
} 