import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile } from '../types';

interface AuthContextType {
    currentUser: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    logout: () => Promise<void>;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            if (user) {
                // Fetch user profile (role) from Firestore
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        setUserProfile(userDoc.data() as UserProfile);
                    } else {
                        // Handle case where user exists in Auth but not Firestore (shouldn't happen with proper flow)
                        console.warn('User profile not found in Firestore');
                        setUserProfile(null);
                    }
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                }
            } else {
                setUserProfile(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const logout = () => {
        return signOut(auth);
    };

    const value = {
        currentUser,
        userProfile,
        loading,
        logout,
        isAdmin: userProfile?.role === 'admin'
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
