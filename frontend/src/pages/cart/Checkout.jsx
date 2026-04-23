import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../../store/useCartStore';
import { formatRupiah } from '../../utils/format';
import { ShoppingBag } from 'lucide-react';
import api from '../../api/axios';

export default function Checkout() {
  const { cart, clearAll, loadCart } = useCartStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
    setError(null);

    try {
      // Create order
      const response = await api.post('/orders/', formData);
      const orderData = response.data;
      
      // Clear the local cart state
      await clearAll();
      
      navigate('/checkout/success', { state: { order: orderData } });
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err.response?.data?.error || "Failed to process checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!cart?.items?.length) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-4">Your Cart is Empty</h1>
        <button onClick={() => navigate('/home')} className="border border-black px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-black uppercase tracking-tighter mb-12 border-b border-black/10 pb-6">Checkout</h1>
      
      {error && (
        <div className="bg-red-50 text-red-500 p-4 mb-8 font-bold border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7">
          <h2 className="text-xl font-black uppercase tracking-widest mb-6">Shipping Information</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest opacity-50 mb-2">Full Name</label>
              <input
                type="text"
                name="shipping_name"
                required
                value={formData.shipping_name}
                onChange={handleChange}
                className="w-full border border-black/20 px-4 py-3 focus:outline-none focus:border-black transition-colors"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest opacity-50 mb-2">Phone Number</label>
              <input
                type="text"
                name="shipping_phone"
                required
                value={formData.shipping_phone}
                onChange={handleChange}
                className="w-full border border-black/20 px-4 py-3 focus:outline-none focus:border-black transition-colors"
                placeholder="+62 812 3456 7890"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest opacity-50 mb-2">City</label>
              <input
                type="text"
                name="shipping_city"
                required
                value={formData.shipping_city}
                onChange={handleChange}
                className="w-full border border-black/20 px-4 py-3 focus:outline-none focus:border-black transition-colors"
                placeholder="Jakarta"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest opacity-50 mb-2">Full Address</label>
              <textarea
                name="shipping_address"
                required
                rows="4"
                value={formData.shipping_address}
                onChange={handleChange}
                className="w-full border border-black/20 px-4 py-3 focus:outline-none focus:border-black transition-colors resize-none"
                placeholder="Jl. Sudirman No. 123..."
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white font-bold uppercase tracking-widest py-4 hover:bg-black/80 transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-[#f4f4f4] p-8">
            <div className="flex items-center gap-3 mb-6 border-b border-black/10 pb-6">
              <ShoppingBag size={24} />
              <h2 className="text-xl font-black uppercase tracking-widest">Order Summary</h2>
            </div>
            
            <div className="space-y-4 mb-8">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-20 bg-white flex-shrink-0">
                    {item.variant.primary_image ? (
                      <img src={item.variant.primary_image} alt="Product" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-black/20 font-bold uppercase bg-gray-100">
                        No Img
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{item.variant.product_name}</p>
                    <p className="text-xs opacity-50 mt-1">{item.variant.color} · EU {item.variant.size}</p>
                    <div className="flex justify-between mt-2">
                      <p className="text-sm">Qty: {item.quantity}</p>
                      <p className="font-bold text-sm">{formatRupiah(item.subtotal)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-black/10 pt-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="opacity-60">Subtotal</span>
                <span className="font-bold">{formatRupiah(cart.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="opacity-60">Shipping</span>
                <span className="font-bold text-green-600">Free</span>
              </div>
              <div className="flex justify-between text-xl font-black pt-4 border-t border-black/10 mt-4">
                <span>Total</span>
                <span>{formatRupiah(cart.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
