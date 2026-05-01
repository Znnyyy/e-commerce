import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { formatRupiah } from '../../utils/format';
import TableRowSkeleton from '../../components/ui/skeletons/TableRowSkeleton';
import StatusBadge from '../../components/admin/orders/StatusBadge';

export default function RecentOrdersTable({ loading, recentOrders }) {
  return (
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
              [1, 2, 3].map(i => <TableRowSkeleton key={i} columns={4} />)
            ) : recentOrders?.length > 0 ? (
              recentOrders.slice(0, 4).map(order => (
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
  );
}
