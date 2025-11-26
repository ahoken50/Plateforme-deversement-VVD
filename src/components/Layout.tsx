import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Users, History, BookOpen, PlusCircle, LogOut, Shield, BarChart2 } from 'lucide-react';

const Layout: React.FC = () => {
    const location = useLocation();
    const { currentUser, logout, isAdmin } = useAuth();

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
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex-shrink-0 flex items-center">
                            <img className="h-14 w-auto object-contain" src="/logo.png" alt="Ville de Val-d'Or" />
                            <span className="ml-3 text-xl font-bold text-gray-800 hidden lg:block self-center">
                                Gestion des Déversements
                            </span>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link
                                to="/"
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${location.pathname === '/'
                                    ? 'border-blue-500 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                            >
                                <History className="h-4 w-4 mr-2" />
                                Historique
                            </Link>
                            <Link
                                to="/report/new"
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${location.pathname.startsWith('/report/new')
                                    ? 'border-blue-500 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                            >
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Nouveau
                            </Link>
                            <Link
                                to="/intervenants"
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${location.pathname === '/intervenants'
                                    ? 'border-blue-500 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                            >
                                <Users className="h-4 w-4 mr-2" />
                                Intervenants
                            </Link>
                            <Link
                                to="/procedure"
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${location.pathname === '/procedure'
                                    ? 'border-blue-500 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                            >
                                <BookOpen className="h-4 w-4 mr-2" />
                                Procédure
                            </Link>
                            <Link
                                to="/stats"
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${location.pathname === '/stats'
                                    ? 'border-blue-500 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                            >
                                <BarChart2 className="h-4 w-4 mr-2" />
                                Statistiques
                            </Link>
                            {isAdmin && (
                                <Link
                                    to="/admin/users"
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${location.pathname === '/admin/users'
                                        ? 'border-blue-500 text-gray-900'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        }`}
                                >
                                    <Shield className="h-4 w-4 mr-2" />
                                    Admin
                                </Link>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-4 hidden md:block">{currentUser?.email}</span>
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            title="Déconnexion"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
        </div>
            </header >

    {/* Main Content */ }
    < main className = "flex-grow container mx-auto px-4 py-8" >
        <Outlet />
            </main >

    {/* Footer */ }
    < footer className = "bg-white border-t border-gray-200 mt-auto" >
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-500">
                &copy; {new Date().getFullYear()} Ville de Val-d'Or - Environnement
            </p>
        </div>
            </footer >
        </div >
    );
};

export default Layout;
