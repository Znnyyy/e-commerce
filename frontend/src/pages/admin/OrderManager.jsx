import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, PackageOpen, ChevronRight, X, Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import api from '../../api/axios';
import { formatRupiah } from '../../utils/format';

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  Icon: Clock,        color: 'bg-amber-500/10 text-amber-600' },
  paid:     { label: 'Paid',     Icon: CheckCircle,  color: 'bg-green-500/10 text-green-600' },
  shipped:  { label: 'Shipped',  Icon: Truck,        color: 'bg-blue-500/10 text-blue-600' },
  failed:   { label: 'Failed',   Icon: XCircle,      color: 'bg-red-500/10 text-red-600' },
};

const STATUS_OPTIONS = ['all', 'pending', 'paid', 'shipped', 'failed'];

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function OrderDetailPanel({ order, onClose, onStatusChange, updatingId }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      className="w-96 bg-white rounded-[2rem] p-6 shadow-sm flex flex-col gap-4 overflow-y-auto shrink-0"
    >
      <AnimatePresence mode="popLayout">
      <motion.div
        key={order.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="flex flex-col gap-4"
      >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest opacity-40 mb-1">Order Detail</p>
          <h2 className="text-2xl font-black tracking-tighter">#{order.id}</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Status + change */}
      <div className="bg-brand-bg rounded-2xl p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-2">Status</p>
        <div className="flex items-center justify-between gap-3">
          <StatusBadge status={order.status} />
          <select
            value={order.status}
            disabled={updatingId === order.id}
            onChange={e => onStatusChange(order.id, e.target.value)}
            className="text-xs font-bold uppercase tracking-widest bg-white border border-black/10 rounded-full px-3 py-1.5 focus:outline-none focus:border-black/30 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {Object.keys(STATUS_CONFIG).map(s => (
              <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Shipping info */}
      <div className="bg-brand-bg rounded-2xl p-4 space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-2">Shipping To</p>
        <p className="font-black text-sm">{order.shipping_name}</p>
        <p className="text-xs opacity-60">{order.shipping_phone}</p>
        <p className="text-xs opacity-60">{order.shipping_address}</p>
        <p className="text-xs opacity-60">{order.shipping_city}</p>
      </div>

      {/* Order items */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-3">Items ({order.items?.length || 0})</p>
        <div className="space-y-3">
          {order.items?.map(item => (
            <div key={item.id} className="flex gap-3 bg-brand-bg rounded-xl p-3">
              <div className="w-14 h-14 rounded-xl bg-black/5 overflow-hidden shrink-0">
                {item.variant_details?.primary_image ? (
                  <img src={item.variant_details.primary_image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={16} className="opacity-20" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{item.variant_details?.product_name || '—'}</p>
                <p className="text-xs opacity-50">{item.variant_details?.color} · EU {item.variant_details?.size}</p>
                <div className="flex justify-between mt-1">
                  <p className="text-xs opacity-50">Qty: {item.quantity}</p>
                  <p className="text-xs font-bold">{formatRupiah(item.price * item.quantity)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="border-t border-black/5 pt-4 flex justify-between items-center">
        <p className="text-sm font-bold uppercase tracking-widest opacity-50">Total</p>
        <p className="text-2xl font-black">{formatRupiah(order.total_amount)}</p>
      </div>

      <p className="text-[10px] opacity-30 uppercase tracking-widest text-right">
        {new Date(order.created_at).toLocaleString('id-ID')}
      </p>
      </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

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
      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 bg-white rounded-[2rem] p-8 shadow-sm flex flex-col min-h-0"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black tracking-tighter">Orders</h1>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 bg-brand-bg px-4 py-2.5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-black/10 transition-colors"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Filter pills */}
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

        {/* Table */}
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
                      {/* Order ID */}
                      <td className="p-4 border-b border-black/5 font-black"># {order.id}</td>

                      {/* Customer */}
                      <td className="p-4 border-b border-black/5">
                        <p className="font-bold">{order.shipping_name}</p>
                        <p className="text-xs opacity-40">{order.shipping_city}</p>
                      </td>

                      {/* Items count */}
                      <td className="p-4 border-b border-black/5 font-medium opacity-80">
                        {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                      </td>

                      {/* Status */}
                      <td className="p-4 border-b border-black/5">
                        <StatusBadge status={order.status} />
                      </td>

                      {/* Total */}
                      <td className="p-4 border-b border-black/5 font-bold">
                        {formatRupiah(order.total_amount)}
                      </td>

                      {/* Date */}
                      <td className="p-4 border-b border-black/5 opacity-60 text-xs">
                        {new Date(order.created_at).toLocaleDateString('id-ID')}
                      </td>

                      {/* Arrow */}
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

      {/* Detail panel */}
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
