import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Settings, LogOut, ArrowLeft } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const isAdmin = user?.is_superuser;
  const isStaff = user?.is_staff;

  const links = [
    { name: 'Analytics', path: '/admin', icon: LayoutDashboard, show: isAdmin },
    { name: 'Products', path: '/admin/products', icon: Package, show: isStaff },
    { name: 'Settings', path: '/admin/settings', icon: Settings, show: isAdmin },
  ];

  return (
    <aside className="w-64 min-h-screen bg-black text-brand-bg flex flex-col fixed left-0 top-0">
      <div className="p-8 border-b border-brand-bg/10">
        <Link to="/" className="font-black text-2xl tracking-tighter uppercase flex items-center gap-2 hover:opacity-80 transition-opacity">
          SNEAKERS.
        </Link>
        <div className="mt-4 text-xs font-bold uppercase tracking-widest opacity-60">
          {isAdmin ? 'Superadmin Panel' : 'Staff Panel'}
        </div>
      </div>

      <div className="flex-1 py-8 flex flex-col gap-2 px-4">
        {links.map((link) => {
          if (!link.show) return null;
          const isActive = location.pathname === link.path;
          const Icon = link.icon;
          
          return (
            <Link 
              key={link.name} 
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 font-bold uppercase tracking-widest text-sm transition-all ${
                isActive ? 'bg-brand-bg text-black' : 'text-brand-bg hover:bg-brand-bg/10'
              }`}
            >
              <Icon size={18} /> {link.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-brand-bg/10 flex flex-col gap-2">
        <button onClick={logout} className="flex items-center gap-3 px-4 py-3 font-bold uppercase tracking-widest text-sm text-red-400 hover:bg-red-400/10 transition-all text-left w-full">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
}
