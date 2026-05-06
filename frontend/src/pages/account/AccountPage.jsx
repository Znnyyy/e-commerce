import React, { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { LogOut, LayoutDashboard, ShoppingBag } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import useAuthStore from "../../store/useAuthStore";
import { getMyOrders } from "../../api/api";
import { formatRupiah } from "../../utils/format";
import AccountHeader from "../../components/account/AccountHeader";
import AccountTabs from "../../components/account/AccountTabs";
import EditProfileModal from "../../components/account/EditProfileModal";

export default function AccountPage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) fetchOrders();
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await getMyOrders();
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const totalSpent = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const totalItems = orders.reduce((sum, o) => sum + (o.items?.length || 0), 0);

  return (
    <div>
      <div className="h-48 md:h-64 bg-black w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-brand-bg/10 via-transparent to-brand-bg/20 opacity-50" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      </div>

      <div className="mx-auto px-4 sm:px-6 lg:px-8 -mt-16 md:-mt-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AccountHeader 
            user={user} 
            orders={orders} 
            totalSpent={formatRupiah(totalSpent)} 
            totalItems={totalItems} 
            onEditClick={() => setIsEditModalOpen(true)} 
          />

          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-black text-white rounded-lg p-6 md:p-8 shadow-sm flex flex-col justify-between relative overflow-hidden h-full">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-bg/10 rounded-full blur-2xl" />
              
              <div className="relative z-10">
                <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <ShoppingBag size={14} /> Account Actions
                </h3>
                
                <div className="space-y-3">
                  {user?.is_staff && (
                    <Link 
                      to="/admin"
                      className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/15 rounded-2xl transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-white text-black p-2 rounded-xl group-hover:scale-110 transition-transform">
                          <LayoutDashboard size={16} />
                        </div>
                        <span className="text-sm font-bold">Admin Panel</span>
                      </div>
                    </Link>
                  )}

                  <button
                    onClick={logout}
                    className="w-full flex items-center justify-between p-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl transition-colors group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-red-500/20 p-2 rounded-xl group-hover:scale-110 transition-transform">
                        <LogOut size={16} />
                      </div>
                      <span className="text-sm font-bold">Sign Out</span>
                    </div>
                  </button>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
                <p className="text-xs text-white/40 leading-relaxed font-medium">
                  Need help? Contact our support team for any inquiries regarding your account or orders.
                </p>
              </div>
            </div>
          </div>
        </div>

        <AccountTabs 
          orders={orders} 
          loadingOrders={loadingOrders} 
          onStatusChange={fetchOrders} 
        />
      </div>

      <AnimatePresence>
        {isEditModalOpen && (
          <EditProfileModal onClose={() => setIsEditModalOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
