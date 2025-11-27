import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, LayoutDashboard, FilePlus, Users, BookOpen, BarChart3, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from './ui/Logo';

const Header: React.FC = () => {
    const { logout, userProfile, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Failed to log out', error);
        }
    };

    const isActive = (path: string) => {
        return location.pathname === path ? 'bg-blue-700 text-white' : 'text-white/90 hover:bg-blue-600 hover:text-white';
    };

    const navItems = [
        { path: '/', label: 'Tableau de bord', icon: LayoutDashboard },
        { path: '/nouveau-rapport', label: 'Nouveau Rapport', icon: FilePlus },
        { path: '/intervenants', label: 'Intervenants', icon: Users },
        { path: '/procedure', label: 'Procédure', icon: BookOpen },
        { path: '/stats', label: 'Statistiques', icon: BarChart3 },
    ];

    if (isAdmin) {
        navItems.push({ path: '/admin/users', label: 'Administration', icon: Shield });
    }

    return (
        <header className="bg-blue-800 shadow-lg relative z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
                            <div className="bg-white p-1.5 rounded-lg shadow-sm group-hover:shadow-md transition-all">
                                <Logo className="h-10 w-auto" />
                            </div>
                            <div className="hidden md:block">
                                <h1 className="text-lg font-bold text-white leading-tight">
                                    Plateforme Déversement
                                </h1>
                                <p className="text-xs text-blue-200 font-medium">
                                    Ville de Val-d'Or
                                </p>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${isActive(item.path)}`}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* User Menu & Mobile Toggle */}
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-3 pl-4 border-l border-blue-700">
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-medium text-white">
                                    {userProfile?.email?.split('@')[0]}
                                </span>
                                <span className="text-xs text-blue-200 capitalize">
                                    {userProfile?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                                </span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-blue-200 hover:text-white hover:bg-blue-700 rounded-full transition-colors"
                                title="Se déconnecter"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden flex items-center">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-blue-200 hover:text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                            >
                                {isMobileMenuOpen ? (
                                    <X className="block h-6 w-6" />
                                ) : (
                                    <Menu className="block h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-blue-900 border-t border-blue-700">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`block px-3 py-2 rounded-md text-base font-medium flex items-center gap-3 ${isActive(item.path)}`}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                        ))}
                        <div className="border-t border-blue-800 mt-4 pt-4 pb-2">
                            <div className="flex items-center px-3 mb-3">
                                <div className="flex-shrink-0">
                                    <div className="h-10 w-10 rounded-full bg-blue-700 flex items-center justify-center text-white">
                                        <User className="h-6 w-6" />
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <div className="text-base font-medium leading-none text-white">
                                        {userProfile?.email}
                                    </div>
                                    <div className="text-sm font-medium leading-none text-blue-300 mt-1 capitalize">
                                        {userProfile?.role}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setIsMobileMenuOpen(false);
                                }}
                                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-blue-200 hover:text-white hover:bg-blue-800 flex items-center gap-3"
                            >
                                <LogOut className="h-5 w-5" />
                                Se déconnecter
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
