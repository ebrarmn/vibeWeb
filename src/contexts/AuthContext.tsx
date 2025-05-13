import React, { createContext, useContext, useState } from 'react';
import { User } from '../types/models';

interface AuthContextType {
    userData: User | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [userData] = useState<User | null>({
        id: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@vibecom.com',
        phone: '',
        birthDate: '',
        gender: '',
        university: '',
        faculty: '',
        department: '',
        grade: '',
        displayName: 'Admin',
        role: 'admin',
        clubIds: [],
        clubRoles: {},
        createdAt: new Date(),
        updatedAt: new Date()
    });
    const [loading] = useState(false);

    const value = {
        userData,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
} 