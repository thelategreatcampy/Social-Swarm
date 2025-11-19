import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cyber-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-t-4 border-neon-green rounded-full animate-spin"></div>
          <p className="text-neon-green font-mono text-xs animate-pulse">VERIFYING CREDENTIALS...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Strict Role Checking
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on their actual role to prevent infinite loops
    if (user.role === UserRole.ADMIN) return <Navigate to="/admin-dashboard" replace />;
    if (user.role === UserRole.BUSINESS) return <Navigate to="/business-dashboard" replace />;
    if (user.role === UserRole.CREATOR) return <Navigate to="/creators" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};