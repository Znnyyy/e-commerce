import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import api from '../../api/axios';
import { formatRupiah } from '../../utils/format';
import { TrendingUp, ShoppingBag, Users, Package, ArrowRight, Trophy } from 'lucide-react';
import TableRowSkeleton from '../../components/ui/skeletons/TableRowSkeleton';
import StatusBadge from '../../components/admin/orders/StatusBadge';
import { Link } from 'react-router-dom';
import StatCards from './StatCards';
import RecentOrdersTable from './RecentOrdersTable';

const STATUS_COLORS = { pending: '#f59e0b', paid: '#10b981', shipped: '#3b82f6', failed: '#ef4444' };



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
        <div className="xl:col-span-2 bg-white border border-black/5 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-black uppercase tracking-widest text-[10px] opacity-40">Revenue Growth</h3>
            {!hasData && <span className="text-[9px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full uppercase">No data</span>}
          </div>
          <div className="h-48 w-full">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.monthly_chart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000008" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#00000040'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#00000040'}} tickFormatter={v => formatRupiah(v).split(',')[0]} width={80} />
                  <Tooltip 
                    formatter={(v) => [formatRupiah(v), 'Revenue']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '10px' }} 
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#000" strokeWidth={2.5} fill="rgba(0,0,0,0.02)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-black/[0.01] rounded-2xl flex flex-col items-center justify-center border border-dashed border-black/5">
                <p className="text-[10px] font-bold opacity-20 uppercase tracking-widest">Awaiting sales data</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-black text-white rounded-3xl p-6 flex flex-col shadow-lg">
          <h3 className="font-bold uppercase tracking-widest text-[10px] opacity-40 mb-4">Status Breakdown</h3>
          <div className="flex-1 flex flex-col sm:flex-row items-center gap-4">
            {hasData ? (
               <>
                 <div className="h-32 w-32 shrink-0">
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie data={stats?.status_chart} dataKey="count" nameKey="status" innerRadius={35} outerRadius={48} paddingAngle={6} stroke="none">
                          {stats?.status_chart?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#fff'} />
                          ))}
                       </Pie>
                       <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '9px' }} />
                     </PieChart>
                   </ResponsiveContainer>
                 </div>
                 <div className="flex-1 w-full space-y-2">
                    {stats?.status_chart?.map((entry, idx) => (
                      <div key={idx} className="flex items-center justify-between group">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[entry.status] }} />
                          <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">{entry.status}</span>
                        </div>
                        <span className="text-[10px] font-black">{entry.count}</span>
                      </div>
                    ))}
                 </div>
               </>
            ) : (
              <div className="flex-1 flex items-center justify-center w-full">
                <p className="text-[10px] font-bold opacity-30 uppercase">No orders yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <RecentOrdersTable loading={loading} recentOrders={stats?.recent_orders} />

        <div className="bg-white border border-black/5 rounded-3xl p-6 shadow-sm">
          <h3 className="font-black uppercase tracking-widest text-[10px] opacity-40 mb-5 flex items-center gap-2">
             <Trophy size={12} className="text-amber-500" /> Top Selling
          </h3>
          <div className="space-y-4">
            {loading ? (
              [1,2,3].map(i => <div key={i} className="h-10 bg-black/5 rounded-2xl animate-pulse" />)
            ) : stats?.top_products?.length > 0 ? (
              stats.top_products.slice(0, 3).map((product, idx) => (
                <div key={idx} className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-xl bg-brand-bg flex items-center justify-center shrink-0 font-black text-[10px]">
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate group-hover:text-blue-600 transition-colors">{product.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                       <div className="flex-1 h-1 bg-black/5 rounded-full overflow-hidden">
                          <div className="h-full bg-black rounded-full" style={{ width: `${(product.qty / stats.top_products[0].qty) * 100}%` }} />
                       </div>
                       <span className="text-[9px] font-black opacity-40">{product.qty} sold</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[10px] font-bold opacity-20 uppercase text-center py-4">No sales recorded</p>
            )}
          </div>
          <Link to="/admin/products" className="mt-6 flex items-center justify-center w-full py-3 border border-black/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">
             View Inventory
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
