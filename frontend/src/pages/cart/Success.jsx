import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { formatRupiah } from '../../utils/format';

export default function Success() {
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.order;

  useEffect(() => {
    if (!order) {
      navigate('/home');
    }
  }, [order, navigate]);

  if (!order) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto px-6 py-20 text-center">
      <CheckCircle size={80} className="mx-auto text-green-500 mb-8" />
      <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">Order Successful!</h1>
      <p className="text-lg opacity-60 mb-12">Thank you for your purchase. Your order has been placed successfully.</p>
      
      <div className="bg-[#f4f4f4] p-8 text-left mb-12 border border-black/10">
        <h2 className="text-xl font-black uppercase tracking-widest border-b border-black/10 pb-4 mb-4">Order Details</h2>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-50 mb-1">Order ID</p>
            <p className="font-bold">#{order.id}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-50 mb-1">Status</p>
            <p className="font-bold capitalize text-amber-600">{order.status}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-50 mb-1">Date</p>
            <p className="font-bold">{new Date(order.created_at).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-50 mb-1">Total Amount</p>
            <p className="font-bold">{formatRupiah(order.total_amount)}</p>
          </div>
        </div>

        <h3 className="text-sm font-black uppercase tracking-widest mb-4">Shipping To:</h3>
        <div className="text-sm">
          <p className="font-bold">{order.shipping_name}</p>
          <p>{order.shipping_phone}</p>
          <p>{order.shipping_address}</p>
          <p>{order.shipping_city}</p>
        </div>
      </div>

      <button onClick={() => navigate('/home')} className="bg-black text-white px-12 py-4 font-bold uppercase tracking-widest hover:bg-black/80 transition-colors">
        Continue Shopping
      </button>
    </motion.div>
  );
}
