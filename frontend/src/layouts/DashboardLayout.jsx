import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import useAuthStore from '../store/useAuthStore';

export default function DashboardLayout() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="flex min-h-screen bg-brand-bg w-full">
      <Sidebar />
      <main className="ml-64 flex-1 p-6 h-screen flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
