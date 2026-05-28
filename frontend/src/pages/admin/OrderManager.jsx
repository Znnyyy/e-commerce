import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import StatusBadge, { STATUS_CONFIG } from '../../components/admin/orders/StatusBadge';
import OrderDetailPanel from '../../components/admin/orders/OrderDetailPanel';
import OrderTable from '../../components/admin/orders/OrderTable';
import { exportOrdersXlsx } from '../../utils/exportXlsx';
import useAuthStore from '../../store/useAuthStore';

const STATUS_OPTIONS = ['all', 'pending', 'paid', 'shipped', 'failed'];

export default function OrderManager() {
  const { user } = useAuthStore();
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

  const handleSyncMidtrans = async (orderId) => {
    setUpdatingId(orderId);
    try {
      const res = await api.post(`/orders/${orderId}/sync_midtrans/`);
      setOrders(prev => prev.map(o => o.id === orderId ? res.data : o));
      if (selectedOrder?.id === orderId) setSelectedOrder(res.data);
      toast.success('Status synced with Midtrans');
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to sync with Midtrans';
      toast.error(errMsg);
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
          <div className="flex items-center gap-2">
            {user?.is_superuser && (
              <button
                onClick={() => exportOrdersXlsx(filtered)}
                className="flex items-center gap-2 bg-brand-bg px-4 py-2.5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-black/10 transition-colors border border-black/5"
              >
                <FileSpreadsheet size={14} /> Export
              </button>
            )}
            <button
              onClick={fetchOrders}
              className="flex items-center gap-2 bg-brand-bg px-4 py-2.5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-black/10 transition-colors"
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
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

        <OrderTable 
          loading={loading}
          orders={filtered}
          selectedOrder={selectedOrder}
          onOrderClick={setSelectedOrder}
        />
      </motion.div>

      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailPanel
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onStatusChange={handleStatusChange}
            onSyncMidtrans={handleSyncMidtrans}
            updatingId={updatingId}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
