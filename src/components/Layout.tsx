import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Users, History, BookOpen, PlusCircle, LogOut, Shield } from 'lucide-react';

const Layout: React.FC = () => {
    const location = useLocation();
    const { currentUser, logout, isAdmin } = useAuth();

    const isActive = (path: string) => {
        return location.pathname === path ? 'bg-blue-700' : '';
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-blue-600 text-white shadow-md">
                <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center space-x-2">
                        <FileText className="h-8 w-8" />
                        <h1 className="text-xl font-bold">Plateforme Déversement VVD</h1>
                    </div>
                    <nav className="flex flex-wrap justify-center gap-2">
                        <Link
                            to="/"
                            className={`px-3 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-1 ${isActive('/')}`}
                        >
                            <History className="h-4 w-4" />
                            <span>Historique</span>
                        </Link>
                        <Link
                            to="/report/new"
                            className={`px-3 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-1 ${isActive('/report/new')}`}
                        >
                            <PlusCircle className="h-4 w-4" />
                            <span>Nouveau</span>
                        </Link>
                        <Link
                            to="/intervenants"
                            className={`px-3 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-1 ${isActive('/intervenants')}`}
                        >
                            <Users className="h-4 w-4" />
                            <span>Intervenants</span>
                        </Link>
                        <Link
                            to="/procedure"
                            className={`px-3 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-1 ${isActive('/procedure')}`}
                        >
                            <BookOpen className="h-4 w-4" />
                            <span>Procédure</span>
                        </Link>

                        {isAdmin && (
                            <Link
                                to="/admin/users"
                                className={`px-3 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-1 ${isActive('/admin/users')}`}
                            >
                                <Shield className="h-4 w-4" />
                                <span>Admin</span>
                            </Link>
                        )}

                        <div className="border-l border-blue-500 mx-2 pl-2 flex items-center">
                            <span className="text-sm mr-3 hidden lg:inline">{currentUser?.email}</span>
                            <button
                                onClick={handleLogout}
                                className="p-2 rounded-md hover:bg-blue-700 transition-colors"
                                title="Déconnexion"
                            >
                                <LogOut className="h-4 w-4" />
                            </button>
                        </div>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow container mx-auto px-4 py-8">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 text-gray-400 py-6">
                <div className="container mx-auto px-4 text-center">
                    <p>&copy; {new Date().getFullYear()} Ville de Val-d'Or - Environnement</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
