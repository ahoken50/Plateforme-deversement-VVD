import React from 'react';
import { Outlet } from 'react-router-dom';
import Background from './Background';
import Header from './Header';

const Layout: React.FC = () => {
    return (
        <div className="relative min-h-screen flex flex-col font-sans text-gray-900">
            <Background />
            <Header />

            <main className="relative z-10 flex-grow p-4 md:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto w-full">
                    <Outlet />
                </div>
            </main>

            <footer className="relative z-10 w-full max-w-7xl mx-auto py-6 px-4">
                <div className="flex flex-col md:flex-row justify-between items-center text-xs md:text-sm text-white/90">
                    <p className="mb-2 md:mb-0 drop-shadow-md">
                        © 2024 Ville de Val-d'Or. Tous droits réservés.
                    </p>
                    <div className="flex gap-4 md:gap-6 drop-shadow-md">
                        <a href="#" className="hover:text-white hover:underline">Contact information</a>
                        <a href="#" className="hover:text-white hover:underline">Termes et conditions</a>
                        <a href="#" className="hover:text-white hover:underline">Politique de confidentialité</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
