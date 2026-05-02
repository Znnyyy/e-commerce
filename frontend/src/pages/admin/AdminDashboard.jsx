import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import StatCards from './StatCards';
import RecentOrdersTable from './RecentOrdersTable';
import RevenueChart from '../../components/admin/dashboard/RevenueChart';
import StatusBreakdown from '../../components/admin/dashboard/StatusBreakdown';
import TopSellingList from '../../components/admin/dashboard/TopSellingList';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/orders/dashboard_stats/');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const hasData = stats?.total_orders > 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Analytics</h1>
          <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">Store performance metrics</p>
        </div>
      </div>

      <StatCards stats={stats} loading={loading} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <RevenueChart data={stats?.monthly_chart} hasData={hasData} />
        <StatusBreakdown data={stats?.status_chart} hasData={hasData} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <RecentOrdersTable loading={loading} recentOrders={stats?.recent_orders} />
        <TopSellingList 
          products={stats?.top_products} 
          loading={loading} 
          maxQty={stats?.top_products?.[0]?.qty || 1} 
        />
      </div>
    </motion.div>
  );
}
