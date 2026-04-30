import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { formatRupiah } from '../../utils/format';

export default function Success() {
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.order;
  const paymentStatus = location.state?.paymentStatus || order?.status || 'pending';

  useEffect(() => {
    if (!order) {
      navigate('/home');
    }
  }, [order, navigate]);

  if (!order) return null;

  const isPaid = paymentStatus === 'paid';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto px-6 py-20"
    >
      {/* Icon & Status */}
      <div className="text-center mb-12">
        {isPaid ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}>
            <CheckCircle size={80} className="mx-auto text-green-500 mb-6" />
          </motion.div>
        ) : (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}>
            <Clock size={80} className="mx-auto text-amber-500 mb-6" />
          </motion.div>
        )}

        <h1 className="text-4xl font-black uppercase tracking-tighter mb-3">
          {isPaid ? 'Payment Successful!' : 'Order Received!'}
        </h1>
        <p className="text-base opacity-50 font-medium max-w-md mx-auto">
          {isPaid
            ? 'Your payment has been confirmed. We will process your order shortly.'
            : 'Your order is saved. Complete your payment to confirm the order.'}
        </p>
      </div>

      {/* Status Banner */}
      <div className={`flex items-center gap-3 p-4 rounded-2xl mb-8 ${isPaid ? 'bg-green-50 border border-green-100' : 'bg-amber-50 border border-amber-100'}`}>
        <div className={`w-2 h-2 rounded-full ${isPaid ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`} />
        <p className={`text-xs font-black uppercase tracking-widest ${isPaid ? 'text-green-700' : 'text-amber-700'}`}>
          {isPaid ? 'Payment Confirmed' : 'Awaiting Payment'}
        </p>
        <span className={`ml-auto text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${isPaid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
          {paymentStatus}
        </span>
      </div>

      {/* Order Details */}
      <div className="bg-[#f4f4f4] p-8 mb-8 border border-black/5 rounded-2xl">
        <h2 className="text-sm font-black uppercase tracking-widest border-b border-black/10 pb-4 mb-6 opacity-60">Order Details</h2>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Order ID</p>
            <p className="font-black">#{order.id}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Status</p>
            <p className={`font-bold capitalize ${isPaid ? 'text-green-600' : 'text-amber-600'}`}>{paymentStatus}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Date</p>
            <p className="font-bold">{new Date(order.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Total Amount</p>
            <p className="font-black">{formatRupiah(order.total_amount)}</p>
          </div>
        </div>

        <div className="border-t border-black/10 pt-6">
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-3">Shipping To</p>
          <div className="text-sm font-medium space-y-0.5">
            <p className="font-bold">{order.shipping_name}</p>
            <p className="opacity-60">{order.shipping_phone}</p>
            <p className="opacity-60">{order.shipping_address}</p>
            <p className="opacity-60">{order.shipping_city}</p>
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => navigate('/home')}
          className="flex-1 bg-black text-white px-8 py-4 font-bold uppercase tracking-widest hover:bg-black/80 transition-colors flex items-center justify-center gap-2 rounded-full"
        >
          Continue Shopping <ArrowRight size={16} />
        </button>
        <Link
          to="/account"
          className="flex-1 border border-black/10 px-8 py-4 font-bold uppercase tracking-widest hover:bg-black/5 transition-colors flex items-center justify-center gap-2 rounded-full text-center"
        >
          My Orders
        </Link>
      </div>
    </motion.div>
  );
}
