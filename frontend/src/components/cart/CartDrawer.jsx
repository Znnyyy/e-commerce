import { X, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import useCartStore from '../../store/useCartStore';
import { formatRupiah } from '../../utils/format';

export default function CartDrawer() {
  const { cart, isOpen, closeCart, updateItem, removeItem, clearAll } = useCartStore();
  const items = cart?.items || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          />

          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-black/10">
              <div className="flex items-center gap-3">
                <ShoppingCart size={20} />
                <span className="font-black uppercase tracking-widest text-sm">
                  Your Cart
                </span>
                {cart?.item_count > 0 && (
                  <span className="bg-black text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {cart.item_count}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-2 hover:opacity-60 transition-opacity"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <ShoppingCart size={48} className="opacity-20" />
                  <p className="font-bold uppercase tracking-widest text-sm opacity-40">
                    Your cart is empty
                  </p>
                  <button
                    onClick={closeCart}
                    className="mt-4 border border-black px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 py-4 border-b border-black/10"
                    >
                      <div className="w-24 h-24 bg-[#f4f4f4] flex-shrink-0 rounded-lg overflow-hidden">
                        {item.variant.primary_image ? (
                          <img
                            src={item.variant.primary_image}
                            alt={item.variant.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-black/20 font-bold uppercase">
                            No Img
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-0.5">
                          {item.variant.product_brand}
                        </p>
                        <p className="font-bold text-sm truncate">
                          {item.variant.product_name}
                        </p>
                        <p className="text-xs opacity-50 mt-0.5">
                          {item.variant.color} · EU {item.variant.size}
                        </p>
                        <p className="font-bold text-sm mt-2">
                          {formatRupiah(item.subtotal)}
                        </p>

                        <div className="flex items-center gap-3 mt-3">
                          <button
                            onClick={() => updateItem(item.id, item.quantity - 1)}
                            className="w-7 h-7 border border-black/20 flex items-center justify-center hover:border-black transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="font-bold text-sm w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateItem(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.variant.stock}
                            className="w-7 h-7 border border-black/20 flex items-center justify-center hover:border-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="ml-auto p-1 hover:opacity-60 transition-opacity text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-black/10">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs uppercase tracking-widest font-bold opacity-50">
                    Total
                  </span>
                  <span className="font-black text-xl">
                    {formatRupiah(cart?.total || 0)}
                  </span>
                </div>
                <p className="text-[10px] opacity-40 mb-5">
                  Shipping & taxes calculated at checkout
                </p>
                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="block w-full bg-black text-white text-center py-4 font-bold uppercase tracking-widest text-sm hover:bg-black/80 transition-colors"
                >
                  Proceed to Checkout
                </Link>
                <button
                  onClick={clearAll}
                  className="mt-3 w-full text-center text-xs uppercase tracking-widest font-bold opacity-40 hover:opacity-70 transition-opacity"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
