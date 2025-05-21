import React, { createContext, useContext, useState } from 'react';
import { User } from '../types/models';

interface AuthContextType {
    userData: User | null;
    loading: boolean;
    logout: () => void;
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
    const [userData, setUserData] = useState<User | null>({
        id: 'admin',
        displayName: 'Admin',
        email: 'admin@vibecom.com',
        phone: '',
        birthDate: '',
        gender: '',
        university: '',
        faculty: '',
        department: '',
        grade: '',
        role: 'admin',
        clubIds: [],
        clubRoles: {},
        studentNumber: '100000000',
        createdAt: new Date(),
        updatedAt: new Date()
    });
    const [loading] = useState(false);

    const logout = () => {
        setUserData(null);
    };

    const value = {
        userData,
        loading,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
} 