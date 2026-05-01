import { formatRupiah } from '../../utils/format';
import { TrendingUp, ShoppingBag, Users, Package } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, dark = false }) => (
  <div className={`p-5 rounded-3xl border ${dark ? 'bg-black text-white border-black' : 'bg-white border-black/5 shadow-sm'}`}>
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${dark ? 'bg-white/10' : 'bg-black/5'}`}>
      <Icon size={18} className={dark ? 'text-white' : 'text-black'} />
    </div>
    <p className={`text-[10px] font-bold uppercase tracking-widest ${dark ? 'text-white/40' : 'opacity-40'}`}>{label}</p>
    <p className="text-xl font-black tracking-tight mt-0.5">{value}</p>
  </div>
);

export default function StatCards({ stats, loading }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard dark label="Total Revenue" value={loading ? '...' : formatRupiah(stats?.total_revenue || 0)} icon={TrendingUp} />
      <StatCard label="Orders" value={loading ? '...' : stats?.total_orders || 0} icon={ShoppingBag} />
      <StatCard label="Customers" value={loading ? '...' : stats?.total_users || 0} icon={Users} />
      <StatCard label="Products" value={loading ? '...' : stats?.total_products || 0} icon={Package} />
    </div>
  );
}
