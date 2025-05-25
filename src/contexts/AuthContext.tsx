import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/models';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { userServices } from '../services/firestore';

interface AuthContextType {
    userData: User | null;
    loading: boolean;
    logout: () => void;
    setUserData: (user: User | null) => void;
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
    const [userData, setUserData] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = await userServices.getById(user.uid);
                setUserData(userDoc);
            } else {
                setUserData(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const logout = () => {
        setUserData(null);
    };

    const value = {
        userData,
        loading,
        logout,
        setUserData
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
} 