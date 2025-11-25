import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, doc, setDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';
import { UserPlus, Shield, Mail, Lock, AlertTriangle } from 'lucide-react';

// We need a secondary app to create users without logging out the current admin
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const secondaryApp = initializeApp(firebaseConfig, "Secondary");
const secondaryAuth = getAuth(secondaryApp);

const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserRole, setNewUserRole] = useState<'admin' | 'user'>('user');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const usersData = querySnapshot.docs.map((doc: any) => doc.data() as UserProfile);
            setUsers(usersData);
        } catch (err) {
            console.error("Error fetching users:", err);
            setError("Impossible de charger la liste des utilisateurs.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setCreating(true);

        try {
            // 1. Create user in Firebase Auth (using secondary app)
            const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newUserEmail, newUserPassword);
            const user = userCredential.user;

            // 2. Create user profile in Firestore
            const userProfile: UserProfile = {
                uid: user.uid,
                email: user.email!,
                role: newUserRole,
                createdAt: new Date().toISOString()
            };

            await setDoc(doc(db, 'users', user.uid), userProfile);

            // 3. Sign out from secondary app to avoid any state confusion
            await signOut(secondaryAuth);

            setSuccess(`Utilisateur ${newUserEmail} créé avec succès !`);
            setNewUserEmail('');
            setNewUserPassword('');
            fetchUsers(); // Refresh list
        } catch (err: any) {
            console.error("Error creating user:", err);
            if (err.code === 'auth/email-already-in-use') {
                setError("Cette adresse courriel est déjà utilisée.");
            } else {
                setError("Erreur lors de la création de l'utilisateur: " + err.message);
            }
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Shield className="h-6 w-6 mr-2 text-blue-600" />
                Gestion des Utilisateurs
            </h2>

            {/* Create User Form */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <UserPlus className="h-5 w-5 mr-2" />
                    Ajouter un utilisateur
                </h3>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                        {success}
                    </div>
                )}

                <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Courriel</label>
                        <div className="relative">
                            <input
                                type="email"
                                required
                                value={newUserEmail}
                                onChange={(e) => setNewUserEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="email@example.com"
                            />
                            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                        <div className="relative">
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={newUserPassword}
                                onChange={(e) => setNewUserPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Minimum 6 caractères"
                            />
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                        <select
                            value={newUserRole}
                            onChange={(e) => setNewUserRole(e.target.value as 'admin' | 'user')}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="user">Utilisateur (Normal)</option>
                            <option value="admin">Administrateur</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            type="submit"
                            disabled={creating}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                        >
                            {creating ? 'Création...' : 'Créer l\'utilisateur'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Users List */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Utilisateurs existants</h3>
                </div>
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Chargement...</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Courriel</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de création</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user: UserProfile) => (
                                <tr key={user.uid}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminUsers;
