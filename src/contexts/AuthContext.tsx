import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, limit, getDocs } from 'firebase/firestore';
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
        const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
            setCurrentUser(user);

            if (user) {
                // Fetch user profile (role) from Firestore
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        setUserProfile(userDoc.data() as UserProfile);
                    } else {
                        // User exists in Auth but not Firestore.
                        // Auto-create profile. First user becomes Admin.
                        console.log('User profile missing. Creating...');

                        const usersRef = collection(db, 'users');
                        const q = query(usersRef, limit(1));
                        const snapshot = await getDocs(q);
                        const isFirstUser = snapshot.empty;

                        const newProfile: UserProfile = {
                            uid: user.uid,
                            email: user.email!,
                            role: isFirstUser ? 'admin' : 'user',
                            createdAt: new Date().toISOString()
                        };

                        await setDoc(doc(db, 'users', user.uid), newProfile);
                        setUserProfile(newProfile);
                        console.log(`Created new profile for ${user.email} as ${newProfile.role}`);
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
