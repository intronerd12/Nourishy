import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const GuestRedirect = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // Show loading while checking authentication
    if (loading) {
        return <div>Loading...</div>;
    }

    // If user is not authenticated, redirect to login with current path as redirect
    if (!isAuthenticated) {
        const redirectPath = location.pathname !== '/' ? `?redirect=${location.pathname.slice(1)}` : '';
        return <Navigate to={`/loginregister${redirectPath}`} replace />;
    }

    return children;
};

export default GuestRedirect;