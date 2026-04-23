import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { formatRupiah } from '../../utils/format';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total_orders: 0, total_revenue: 0, recent_orders: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/orders/dashboard_stats/');
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto"
    >
      <h1 className="text-4xl font-black uppercase tracking-tighter mb-8">Admin Dashboard</h1>
      
      {loading ? (
        <div className="animate-pulse flex space-x-4">
          <div className="h-32 bg-gray-200 w-full"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-black p-6">
              <h2 className="text-lg font-bold uppercase tracking-widest mb-2">Total Orders</h2>
              <p className="text-4xl font-black">{stats.total_orders}</p>
            </div>
            <div className="border border-black p-6 bg-black text-[#f4f4f4]">
              <h2 className="text-lg font-bold uppercase tracking-widest mb-2 text-[#f4f4f4]/60">Revenue</h2>
              <p className="text-4xl font-black">{formatRupiah(stats.total_revenue)}</p>
            </div>
          </div>

          <div className="mt-12 border border-black/10 p-8 bg-[#f4f4f4]">
            <h3 className="font-bold uppercase tracking-widest opacity-60 mb-6">Recent Orders</h3>
            
            {stats.recent_orders.length === 0 ? (
              <p className="opacity-60">No recent orders found.</p>
            ) : (
              <div className="space-y-4">
                {stats.recent_orders.map(order => (
                  <div key={order.id} className="flex justify-between items-center border-b border-black/10 pb-4 last:border-0">
                    <div>
                      <p className="font-bold">Order #{order.id}</p>
                      <p className="text-xs opacity-60">{order.shipping_name} - {new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatRupiah(order.total_amount)}</p>
                      <p className={`text-xs font-bold uppercase ${order.status === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                        {order.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}
