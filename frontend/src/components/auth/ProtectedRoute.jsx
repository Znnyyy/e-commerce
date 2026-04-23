import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const ProtectedRoute = ({ 
  requireStaff = false, 
  requireSuperadmin = false, 
  blockStaff = false,
  requireUnauth = false 
}) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-brand-bg flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-black/20 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  // If page requires user to be logged out (e.g., Login/Register pages)
  if (requireUnauth && isAuthenticated) {
    if (user?.is_staff) return <Navigate to="/admin/products" replace />;
    return <Navigate to="/" replace />;
  }

  // If page is strictly for normal users, block Staff/Admins
  if (blockStaff && isAuthenticated && user?.is_staff) {
    return <Navigate to="/admin/products" replace />;
  }

  // If page requires authentication (Staff or Superadmin)
  if ((requireStaff || requireSuperadmin) && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If page requires Staff role
  if (requireStaff && isAuthenticated && !user?.is_staff) {
    // Normal user trying to access admin
    return <Navigate to="/" replace />;
  }

  // If page requires Superadmin role
  if (requireSuperadmin && isAuthenticated && !user?.is_superuser) {
    // Regular staff trying to access superadmin
    return <Navigate to="/admin/products" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
