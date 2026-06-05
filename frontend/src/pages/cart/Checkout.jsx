import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../../store/useCartStore';
import useAuthStore from '../../store/useAuthStore';
import { CreditCard, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import CheckoutSummary from '../../components/cart/CheckoutSummary';

const FIELD_STYLES = 'w-full border border-black/20 px-4 py-3 focus:outline-none focus:border-black transition-colors';
const LABEL_STYLES = 'block text-xs font-bold uppercase tracking-widest opacity-50 mb-2';

export default function Checkout() {
  const { cart, clearAll } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [usePoints, setUsePoints] = useState(0);
  const [formData, setFormData] = useState({
    shipping_name: '',
    shipping_address: '',
    shipping_city: '',
    shipping_phone: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { ...formData, use_points: usePoints };
      const response = await api.post('/orders/', payload);
      const orderData = response.data;

      if (!orderData.snap_token) {
        throw new Error('Payment token not received. Please try again.');
      }

      window.snap.pay(orderData.snap_token, {
        onSuccess: async (result) => {
          await clearAll();
          navigate('/checkout/success', {
            state: { order: orderData, paymentResult: result, paymentStatus: 'paid' }
          });
        },
        onPending: async (result) => {
          await clearAll();
          navigate('/checkout/success', {
            state: { order: orderData, paymentResult: result, paymentStatus: 'pending' }
          });
        },
        onError: () => {
          toast.error('Payment failed. Please try again.');
          setLoading(false);
        },
        onClose: () => {
          toast('Payment cancelled. Your order is saved — you can pay later.', { icon: 'ℹ️' });
          setLoading(false);
        },
      });

    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Failed to process checkout.';
      toast.error(errMsg);
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-black uppercase tracking-tighter mb-12 border-b border-black/10 pb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7">
          <h2 className="text-xl font-black uppercase tracking-widest mb-6">Shipping Information</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={LABEL_STYLES}>Full Name</label>
              <input type="text" name="shipping_name" required value={formData.shipping_name} onChange={handleChange} className={FIELD_STYLES} placeholder="Your full name" />
            </div>
            <div>
              <label className={LABEL_STYLES}>Phone Number</label>
              <input type="text" name="shipping_phone" required value={formData.shipping_phone} onChange={handleChange} className={FIELD_STYLES} placeholder="08xxxxxxxxxx" />
            </div>
            <div>
              <label className={LABEL_STYLES}>City</label>
              <input type="text" name="shipping_city" required value={formData.shipping_city} onChange={handleChange} className={FIELD_STYLES} placeholder="Jakarta" />
            </div>
            <div>
              <label className={LABEL_STYLES}>Full Address</label>
              <textarea name="shipping_address" required rows="4" value={formData.shipping_address} onChange={handleChange} className={`${FIELD_STYLES} resize-none`} placeholder="Jl. Sudirman No.1..." />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-black text-white font-bold uppercase tracking-widest py-4 hover:bg-black/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-3">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : <><CreditCard size={18} /> Proceed to Payment</>}
            </button>

            <p className="text-center text-xs opacity-40 font-medium">
              Secured by Midtrans · Supports GoPay, QRIS, Transfer, Credit Card
            </p>
          </form>
        </div>

        <div className="lg:col-span-5">
          <CheckoutSummary cart={cart} user={user} usePoints={usePoints} setUsePoints={setUsePoints} />
        </div>
      </div>
    </motion.div>
  );
}
