import React, { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { User, LogOut, LayoutDashboard, Mail, ShieldCheck, Package, ShoppingBag, Edit2, Calendar, CreditCard, Box } from "lucide-react";
import { motion } from "framer-motion";
import useAuthStore from "../../store/useAuthStore";
import { getMyOrders } from "../../api/api";
import { formatRupiah } from "../../utils/format";
import StatBox from "../../components/account/StatBox";
import OrderRow from "../../components/account/OrderRow";

export default function AccountPage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

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
          <div className="lg:col-span-2 bg-white rounded-lg p-6 md:p-8 shadow-sm border border-black/5 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 relative z-10">
              <div className="w-28 h-28 sm:w-32 sm:h-32 bg-white rounded-full p-2 shrink-0 shadow-sm border border-black/5 -mt-12 sm:-mt-16">
                <div className="w-full h-full bg-brand-bg rounded-full flex items-center justify-center border border-black/5 overflow-hidden relative group">
                  <User size={48} className="text-black/30" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                    <Edit2 size={20} className="text-white" />
                  </div>
                </div>
              </div>
              <div className="flex-1 pb-1">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight">{user?.username}</h1>
                  {user?.is_staff && (
                    <span className="flex items-center text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-1 rounded-full uppercase tracking-widest">
                      <ShieldCheck size={12} className="mr-1" /> Verified Staff
                    </span>
                  )}
                </div>
                <p className="text-black/50 text-sm font-medium flex items-center gap-2">
                  <Mail size={14} /> {user?.email || "No email provided"}
                </p>
              </div>
              <div className="pb-2 w-full sm:w-auto mt-4 sm:mt-0">
                <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 border border-black/10 font-bold text-xs uppercase tracking-widest transition-colors hover:bg-black/10">
                  <Edit2 size={14} /> Edit Profile
                </button>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-black/5 pt-8 relative z-10">
              <StatBox label="Total Orders" value={orders.length} icon={Package} />
              <StatBox label="Total Spent" value={formatRupiah(totalSpent)} icon={CreditCard} />
              <StatBox label="Items Bought" value={totalItems} icon={Box} />
              <StatBox label="Member Since" value={new Date().getFullYear()} icon={Calendar} />
            </div>
          </div>

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

        <div className="mt-6 bg-white rounded-lg p-6 md:p-8 shadow-sm border border-black/5">
          <div className="flex items-center gap-8 border-b border-black/5 mb-6 overflow-x-auto no-scrollbar">
            {['orders', 'watchlist', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-bold uppercase tracking-widest transition-colors relative whitespace-nowrap ${
                  activeTab === tab ? 'text-black' : 'text-black/30 hover:text-black/60'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTab" 
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" 
                  />
                )}
              </button>
            ))}
          </div>

          <div className="min-h-[300px]">
            {activeTab === 'orders' && (
              loadingOrders ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse h-24 bg-black/5 rounded-2xl" />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="h-[300px] flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-brand-bg rounded-full flex items-center justify-center mb-4">
                    <Package size={24} className="text-black/30" />
                  </div>
                  <h3 className="text-lg font-black mb-2">No Recent Orders</h3>
                  <p className="text-sm text-black/50 mb-6 max-w-xs font-medium">You haven't made any purchases yet. Explore our collection to find your next pair!</p>
                  <Link to="/" className="bg-black text-white px-6 py-2.5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-black/80 transition-colors">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map(order => (
                    <OrderRow key={order.id} order={order} />
                  ))}
                </div>
              )
            )}

            {activeTab === 'watchlist' && (
              <div className="h-[300px] flex flex-col items-center justify-center text-center">
                <p className="text-sm text-black/50 font-bold uppercase tracking-widest">Watchlist is coming soon</p>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="h-[300px] flex flex-col items-center justify-center text-center">
                <p className="text-sm text-black/50 font-bold uppercase tracking-widest">Settings are coming soon</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
