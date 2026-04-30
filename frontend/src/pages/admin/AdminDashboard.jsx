import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import api from '../../api/axios';
import { formatRupiah } from '../../utils/format';
import { TrendingUp, ShoppingBag, Users, Package, ArrowRight, MousePointerClick, Trophy } from 'lucide-react';
import TableRowSkeleton from '../../components/ui/skeletons/TableRowSkeleton';
import StatusBadge from '../../components/admin/orders/StatusBadge';
import { Link } from 'react-router-dom';

const STATUS_COLORS = { pending: '#f59e0b', paid: '#10b981', shipped: '#3b82f6', failed: '#ef4444' };

const StatCard = ({ label, value, icon: Icon, dark = false }) => (
  <div className={`p-5 rounded-3xl border ${dark ? 'bg-black text-white border-black' : 'bg-white border-black/5 shadow-sm'}`}>
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${dark ? 'bg-white/10' : 'bg-black/5'}`}>
      <Icon size={18} className={dark ? 'text-white' : 'text-black'} />
    </div>
    <p className={`text-[10px] font-bold uppercase tracking-widest ${dark ? 'text-white/40' : 'opacity-40'}`}>{label}</p>
    <p className="text-xl font-black tracking-tight mt-0.5">{value}</p>
  </div>
);

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

      {/* Baris 1: Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard dark label="Total Revenue" value={loading ? '...' : formatRupiah(stats?.total_revenue || 0)} icon={TrendingUp} />
        <StatCard label="Orders" value={loading ? '...' : stats?.total_orders || 0} icon={ShoppingBag} />
        <StatCard label="Customers" value={loading ? '...' : stats?.total_users || 0} icon={Users} />
        <StatCard label="Products" value={loading ? '...' : stats?.total_products || 0} icon={Package} />
      </div>

      {/* Baris 2: Revenue Chart & Status Breakdown */}
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

      {/* Baris 3: Recent Activity & Top Selling */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white border border-black/5 rounded-3xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-black/5 flex justify-between items-center">
            <h3 className="font-black uppercase tracking-widest text-[10px] opacity-40">Recent Activity</h3>
            <Link to="/admin/orders" className="text-[9px] font-black uppercase tracking-widest hover:opacity-50 transition-opacity flex items-center gap-1">
              All Orders <ArrowRight size={10} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-brand-bg/20">
                <tr className="text-[9px] uppercase tracking-widest font-black opacity-30">
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1,2,3].map(i => <TableRowSkeleton key={i} columns={4} />)
                ) : stats?.recent_orders?.length > 0 ? (
                  stats.recent_orders.slice(0, 4).map(order => (
                    <tr key={order.id} className="border-b border-black/5 last:border-none hover:bg-brand-bg/30 transition-colors">
                      <td className="px-6 py-3.5 font-black text-xs">#{order.id}</td>
                      <td className="px-6 py-3.5 font-bold text-xs">{order.shipping_name}</td>
                      <td className="px-6 py-3.5"><StatusBadge status={order.status} /></td>
                      <td className="px-6 py-3.5 text-right font-black text-xs">{formatRupiah(order.total_amount)}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="py-10 text-center opacity-20 text-[10px] font-bold uppercase">No activity</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

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
