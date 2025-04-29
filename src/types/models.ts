export interface Club {
    id: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    adminIds: string[];
    memberIds: string[];
    eventIds: string[];
}

export interface User {
    id: string;
    email: string;
    displayName: string;
    photoURL?: string;
    role: 'admin' | 'user';
    clubIds: string[];
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
    createdAt: Date;
    updatedAt: Date;
} 