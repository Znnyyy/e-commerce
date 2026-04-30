import React from 'react';
import { formatRupiah } from '../../utils/format';
import { ShoppingBag } from 'lucide-react';

export default function CheckoutSummary({ cart }) {
  if (!cart || !cart.items) return null;

  return (
    <div className="bg-[#f4f4f4] p-8 rounded-3xl">
      <div className="flex items-center gap-3 mb-6 border-b border-black/10 pb-6">
        <ShoppingBag size={24} />
        <h2 className="text-xl font-black uppercase tracking-widest">Order Summary</h2>
      </div>

      <div className="space-y-4 mb-8">
        {cart.items.map((item) => (
          <div key={item.id} className="flex gap-4">
            <div className="w-20 h-20 bg-white shrink-0 rounded-xl overflow-hidden border border-black/5">
              {item.variant.primary_image ? (
                <img src={item.variant.primary_image} alt="Product" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-black/20 font-bold uppercase bg-gray-100">
                  No Img
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm line-clamp-1">{item.variant.product_name}</p>
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
  );
}
