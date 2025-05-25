export interface Club {
    id: string;
    name: string;
    description: string;
    type?: string;
    tags?: string[];
    activities?: string[];
    requiredSkills?: string[];
    meetingTime?: string;
    createdAt: Date;
    updatedAt: Date;
    memberIds: string[];
    memberRoles: { [userId: string]: 'admin' | 'member' };
    eventIds: string[];
}

export interface User {
    id: string;
    email: string;
    phone: string;
    birthDate: string;
    gender: string;
    university: string;
    faculty: string;
    department: string;
    grade: string;
    displayName: string;
    photoURL?: string;
    role: 'admin' | 'user';
    clubIds: string[];
    clubRoles: { [clubId: string]: 'admin' | 'member' };
    studentNumber: string;
    createdAt: Date;
    updatedAt: Date;
    preferences?: UserPreferences;
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

export interface ClubInvitation {
    clubId: string;
    clubName: string;
    createdAt: Date;
    receiverId: string;
    senderId: string;
    senderName: string;
    status: 'pending' | 'approved' | 'rejected' | 'accepted';
}

export interface UserPreferences {
    interests: string[];
    hobbies: string[];
    skills: string[];
    preferredClubTypes: string[];
    timeAvailability: string;
    preferredActivities: string[];
} 