'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '@/lib/types';

interface AuthContextType {
    user: UserProfile | null;
    loading: boolean;
    login: (email: string, role?: 'Admin' | 'DCA_Agent') => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: () => { },
    logout: () => { },
});

export const useUser = () => useContext(AuthContext);

export function LocalAuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage on mount
        const storedUser = localStorage.getItem('recovery_ai_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (email: string, role: 'Admin' | 'DCA_Agent' = 'Admin') => {
        const mockUser: UserProfile = {
            uid: 'mock-user-' + Math.random().toString(36).substring(7),
            email: email,
            displayName: email.split('@')[0],
            role: role,
            photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        };
        setUser(mockUser);
        localStorage.setItem('recovery_ai_user', JSON.stringify(mockUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('recovery_ai_user');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
