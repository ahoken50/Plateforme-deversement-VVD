import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requireAdmin = false }) => {
    const { currentUser, userProfile, loading, isAdmin } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requireAdmin && !isAdmin) {
        // Redirect non-admins to home if they try to access admin routes
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default PrivateRoute;
