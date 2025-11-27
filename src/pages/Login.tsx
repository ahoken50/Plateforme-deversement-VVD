import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon } from '../components/ui/Icons';
import { Logo } from '../components/ui/Logo';
import Background from '../components/Background';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setError('');
            setLoading(true);
            await signInWithEmailAndPassword(auth, email, password);
            navigate(from, { replace: true });
        } catch (err) {
            console.error(err);
            setError('Échec de la connexion. Vérifiez vos identifiants.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
            <Background />

            {/* Main Card */}
            <div className="relative z-30 w-full max-w-[480px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden">

                <div className="px-8 py-10 md:px-12 md:py-12 flex flex-col items-center">

                    <div className="mb-8 scale-110">
                        <Logo />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
                        Connexion
                    </h1>
                    <p className="text-gray-600 text-sm font-medium mb-8 text-center">
                        Plateforme Déversement VVD
                    </p>

                    {error && (
                        <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="w-full space-y-5">

                        {/* Email Field */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-gray-800 ml-1">
                                Adresse courriel
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                    <MailIcon className="h-5 w-5" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-400 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent sm:text-sm font-medium transition-all bg-white"
                                    placeholder="exemple@ville.valdor.qc.ca"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-gray-800 ml-1">
                                Mot de passe
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                    <LockIcon className="h-5 w-5" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-10 py-3 border border-gray-400 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent sm:text-sm font-medium transition-all bg-white"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-emerald-700 cursor-pointer focus:outline-none"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOffIcon className="h-5 w-5" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[#D32F2F] hover:bg-[#B71C1C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Connexion en cours...
                                </span>
                            ) : (
                                "Se connecter"
                            )}
                        </button>

                        {/* Footer Links in Card */}
                        <div className="flex justify-between items-center text-sm mt-4 font-semibold px-1">
                            <a href="#" className="text-red-700 hover:text-red-900 underline decoration-red-700/30 underline-offset-2">
                                Mot de passe oublié?
                            </a>
                            <a href="#" className="text-red-700 hover:text-red-900 underline decoration-red-700/30 underline-offset-2">
                                Besoin d'aide?
                            </a>
                        </div>

                    </form>
                </div>
            </div>

            {/* Footer */}
            <footer className="w-full max-w-5xl mx-auto mt-auto pt-10 pb-6 px-4 relative z-30">
                <div className="flex flex-col md:flex-row justify-between items-center text-xs md:text-sm text-white/90 pt-6">
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

export default Login;
