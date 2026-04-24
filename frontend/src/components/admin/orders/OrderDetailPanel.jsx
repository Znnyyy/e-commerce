import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package } from 'lucide-react';
import { formatRupiah } from '../../../utils/format';
import StatusBadge, { STATUS_CONFIG } from './StatusBadge';
import Dropdown from '../../ui/Dropdown';

export default function OrderDetailPanel({ order, onClose, onStatusChange, updatingId }) {
  const statusOptions = Object.keys(STATUS_CONFIG).map(key => ({
    value: key,
    label: STATUS_CONFIG[key].label,
    Icon: STATUS_CONFIG[key].Icon
  }));

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
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-40 mb-1">Order Detail</p>
              <h2 className="text-2xl font-black tracking-tighter">#{order.id}</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="bg-brand-bg rounded-2xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-2">Status</p>
            <div className="flex items-center justify-between gap-3">
              <StatusBadge status={order.status} />
              <Dropdown
                value={order.status}
                options={statusOptions}
                onChange={(newStatus) => onStatusChange(order.id, newStatus)}
                className="w-auto"
                align="right"
                buttonClassName="!py-1.5 !px-3 !text-[10px]"
              />
            </div>
          </div>

          <div className="bg-brand-bg rounded-2xl p-4 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-2">Shipping To</p>
            <p className="font-black text-sm">{order.shipping_name}</p>
            <p className="text-xs opacity-60">{order.shipping_phone}</p>
            <p className="text-xs opacity-60">{order.shipping_address}</p>
            <p className="text-xs opacity-60">{order.shipping_city}</p>
          </div>

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
