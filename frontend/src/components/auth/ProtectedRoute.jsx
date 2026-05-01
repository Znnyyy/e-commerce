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

  
  if (requireUnauth && isAuthenticated) {
    if (user?.is_staff) return <Navigate to="/admin/products" replace />;
    return <Navigate to="/" replace />;
  }

  
  if (blockStaff && isAuthenticated && user?.is_staff) {
    return <Navigate to="/admin/products" replace />;
  }

  
  if ((requireStaff || requireSuperadmin) && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  
  if (requireStaff && isAuthenticated && !user?.is_staff) {
    
    return <Navigate to="/" replace />;
  }

  
  if (requireSuperadmin && isAuthenticated && !user?.is_superuser) {
    
    return <Navigate to="/admin/products" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
