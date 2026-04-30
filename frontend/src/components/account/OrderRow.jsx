import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Package, Calendar, ChevronDown, ChevronUp, Box } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StatusBadge from "../admin/orders/StatusBadge";
import { formatRupiah } from "../../utils/format";

export const OrderRow = ({ order }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-black/5 rounded-2xl overflow-hidden bg-white hover:border-black/10 transition-colors">
      <div 
        className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-bg rounded-xl flex items-center justify-center shrink-0">
            <Package size={20} className="text-black/60" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-sm">Order #{order.id}</h4>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-xs text-black/50 font-medium flex items-center gap-1">
              <Calendar size={12} />
              {new Date(order.created_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end sm:gap-8 w-full sm:w-auto">
          <div className="text-left sm:text-right">
            <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mb-1">Total</p>
            <p className="text-sm font-black">{formatRupiah(order.total_amount)}</p>
          </div>
          <div className="text-left sm:text-right hidden sm:block">
            <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mb-1">Items</p>
            <p className="text-sm font-bold text-black/70">{order.items?.length || 0}</p>
          </div>
          <button className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-black/60 hover:bg-black/10 transition-colors">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-black/5 bg-brand-bg/30"
          >
            <div className="p-4 sm:p-6 space-y-4 max-h-[350px] overflow-y-auto overflow-x-hidden no-scrollbar">
              {order.items?.map((item, idx) => (
                <div key={item.id} className={`flex items-center gap-4 ${idx !== 0 ? 'pt-4 border-t border-black/5' : ''}`}>
                  <div className="w-16 h-16 bg-white rounded-xl border border-black/5 flex items-center justify-center p-1.5 shrink-0">
                    {item.variant_details?.primary_image ? (
                      <img 
                        src={item.variant_details.primary_image} 
                        alt={item.variant_details.product_name}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    ) : (
                      <Box size={20} className="text-black/20" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.variant_details?.product_id}`} className="hover:opacity-60 transition-opacity">
                      <h5 className="font-bold text-sm truncate">{item.variant_details?.product_name || "Unknown Product"}</h5>
                    </Link>
                    <div className="flex flex-wrap gap-2 text-[10px] font-bold text-black/50 uppercase tracking-widest mt-1.5">
                      <span className="bg-white px-2 py-0.5 rounded border border-black/5">Size: {item.variant_details?.size}</span>
                      <span className="bg-white px-2 py-0.5 rounded border border-black/5">Color: {item.variant_details?.color}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold">{formatRupiah(item.price)}</p>
                    <p className="text-xs text-black/40 font-medium mt-0.5">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderRow;
