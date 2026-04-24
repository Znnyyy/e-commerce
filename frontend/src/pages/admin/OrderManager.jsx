import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, PackageOpen, ChevronRight } from 'lucide-react';
import api from '../../api/axios';
import { formatRupiah } from '../../utils/format';
import StatusBadge, { STATUS_CONFIG } from '../../components/admin/orders/StatusBadge';
import OrderDetailPanel from '../../components/admin/orders/OrderDetailPanel';

const STATUS_OPTIONS = ['all', 'pending', 'paid', 'shipped', 'failed'];

export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/');
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await api.patch(`/orders/${orderId}/update_status/`, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? res.data : o));
      if (selectedOrder?.id === orderId) setSelectedOrder(res.data);
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const counts = STATUS_OPTIONS.slice(1).reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length;
    return acc;
  }, {});

  const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus);

  return (
    <div className="flex h-full gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 bg-white rounded-4xl p-8 shadow-sm flex flex-col min-h-0"
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black tracking-tighter">Orders</h1>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 bg-brand-bg px-4 py-2.5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-black/10 transition-colors"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {STATUS_OPTIONS.map(s => {
            const isActive = filterStatus === s;
            const count = s === 'all' ? orders.length : counts[s];
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                  isActive ? 'bg-black text-white' : 'bg-brand-bg text-black hover:bg-black/10'
                }`}
              >
                {s === 'all' ? 'All' : STATUS_CONFIG[s].label}
                <span className={`ml-1.5 ${isActive ? 'opacity-60' : 'opacity-40'}`}>({count})</span>
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-auto rounded-2xl border border-black/5">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-brand-bg/50 sticky top-0 backdrop-blur-md z-10">
              <tr className="text-xs uppercase tracking-widest font-bold opacity-60">
                <th className="p-4 font-bold border-b border-black/5">Order</th>
                <th className="p-4 font-bold border-b border-black/5">Customer</th>
                <th className="p-4 font-bold border-b border-black/5">Items</th>
                <th className="p-4 font-bold border-b border-black/5">Status</th>
                <th className="p-4 font-bold border-b border-black/5">Total</th>
                <th className="p-4 font-bold border-b border-black/5">Date</th>
                <th className="p-4 font-bold border-b border-black/5 text-right">Detail</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse">
                    {[1,2,3,4,5,6,7].map(j => (
                      <td key={j} className="p-4 border-b border-black/5">
                        <div className="h-4 bg-black/10 rounded w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-black/30 font-bold uppercase tracking-widest text-xs">
                    <PackageOpen size={32} className="mx-auto mb-3 opacity-30" />
                    No orders found
                  </td>
                </tr>
              ) : (
                filtered.map(order => {
                  const isSelected = selectedOrder?.id === order.id;
                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder(isSelected ? null : order)}
                      className={`cursor-pointer transition-colors group ${isSelected ? 'bg-brand-bg' : 'hover:bg-brand-bg/50'}`}
                    >
                      <td className="p-4 border-b border-black/5 font-black"># {order.id}</td>
                      <td className="p-4 border-b border-black/5">
                        <p className="font-bold">{order.shipping_name}</p>
                        <p className="text-xs opacity-40">{order.shipping_city}</p>
                      </td>
                      <td className="p-4 border-b border-black/5 font-medium opacity-80">
                        {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                      </td>
                      <td className="p-4 border-b border-black/5">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="p-4 border-b border-black/5 font-bold">
                        {formatRupiah(order.total_amount)}
                      </td>
                      <td className="p-4 border-b border-black/5 opacity-60 text-xs">
                        {new Date(order.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="p-4 border-b border-black/5 text-right">
                        <ChevronRight
                          size={16}
                          className={`inline-block transition-transform opacity-0 group-hover:opacity-100 ${isSelected ? 'rotate-90 opacity-100' : ''}`}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailPanel
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onStatusChange={handleStatusChange}
            updatingId={updatingId}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
