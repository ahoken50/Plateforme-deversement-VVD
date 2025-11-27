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
        return location.pathname === path
            ? 'bg-eco-darkPurple text-white shadow-md'
            : 'text-gray-500 hover:text-eco-darkPurple hover:bg-white/80';
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
        <header className="relative z-50">
            <div className="px-6 py-4 md:px-10 flex items-center justify-between bg-white/60 backdrop-blur-md border-b border-white/50">

                {/* Logo Section */}
                <div className="flex items-center gap-4">
                    <Link to="/" className="flex items-center gap-4 group">
                        <div className="w-24 h-24 bg-gradient-to-br from-eco-lime to-eco-forest rounded-2xl shadow-lg flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                            <Logo className="h-16 w-16 text-white" />
                        </div>
                        <div>
                            <h1 className="font-display font-bold text-2xl text-eco-forest leading-tight tracking-tight">
                                Plateforme Déversement
                            </h1>
                            <p className="text-xs font-bold text-eco-purple uppercase tracking-widest">
                                Ville de Val-d'Or
                            </p>
                        </div>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-1 bg-white/50 p-1 rounded-full border border-white/60 shadow-inner">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${isActive(item.path)}`}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* User Profile */}
                <div className="hidden md:flex items-center gap-4">
                    <div className="text-right hidden xl:block">
                        <div className="text-sm font-bold text-gray-800">{userProfile?.email?.split('@')[0]}</div>
                        <div className="text-xs text-eco-purple capitalize">{userProfile?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}</div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-eco-peach border-2 border-white shadow-md overflow-hidden flex items-center justify-center">
                        {userProfile?.avatarUrl ? (
                            <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-6 h-6 text-eco-darkPurple" />
                        )}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-gray-400 hover:text-eco-darkPurple transition-colors"
                        title="Se déconnecter"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="lg:hidden p-2 text-gray-600"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-gray-100 p-4 lg:hidden shadow-xl flex flex-col gap-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`w-full text-left px-4 py-3 rounded-xl font-semibold flex items-center gap-3 ${isActive(item.path)}`}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    ))}
                    <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                            onClick={() => {
                                handleLogout();
                                setIsMobileMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 rounded-xl font-semibold text-gray-600 hover:bg-eco-peach/30 hover:text-eco-darkPurple flex items-center gap-3"
                        >
                            <LogOut className="h-5 w-5" />
                            Se déconnecter
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
