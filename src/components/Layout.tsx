import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { FileText, Users, History, BookOpen, PlusCircle } from 'lucide-react';

const Layout: React.FC = () => {
    const location = useLocation();

    const isActive = (path: string) => {
        return location.pathname === path ? 'bg-blue-700' : '';
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-blue-600 text-white shadow-md">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <FileText className="h-8 w-8" />
                        <h1 className="text-xl font-bold">Plateforme Déversement VVD</h1>
                    </div>
                    <nav className="flex space-x-4">
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
                            <span>Nouveau Rapport</span>
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
