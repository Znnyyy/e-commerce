import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, PackagePlus, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateVariant } from '../../api/api';
import toast from 'react-hot-toast';

export default function QuickRestockModal({ product, onClose }) {
  const queryClient = useQueryClient();
  const [quantities, setQuantities] = useState({});

  const mutation = useMutation({
    mutationFn: (updates) =>
      Promise.all(
        updates.map(({ variant, addQty }) =>
          updateVariant(variant.id, { ...variant, stock: Number(variant.stock) + Number(addQty) })
        )
      ),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin_products']);
      toast.success('Restock successful!');
      onClose();
    },
    onError: () => toast.error('Failed to restock items.'),
  });

  const handleRestock = () => {
    const updates = Object.entries(quantities)
      .filter(([, qty]) => Number(qty) > 0)
      .map(([id, qty]) => ({
        variant: product.variants.find(v => v.id === Number(id)),
        addQty: qty,
      }));

    if (updates.length > 0) {
      mutation.mutate(updates);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative z-10 flex flex-col max-h-[80vh]"
      >
        <div className="flex items-center justify-between p-6 border-b border-black/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-bg rounded-xl flex items-center justify-center">
              <PackagePlus size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tighter">Quick Restock</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">{product.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <p className="text-xs font-bold uppercase tracking-widest opacity-50 mb-4">Select Variants to Restock</p>
          <div className="space-y-3">
            {product.variants?.map(v => (
              <div key={v.id} className="flex items-center justify-between bg-brand-bg/50 p-4 rounded-2xl border border-black/5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">Size {v.size}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">{v.color}</span>
                    {v.stock === 0 && <span className="bg-red-500/10 text-red-600 text-[8px] px-1.5 py-0.5 rounded-full uppercase tracking-widest font-bold">Sold Out</span>}
                    {v.stock > 0 && v.stock < 10 && <span className="bg-orange-500/10 text-orange-600 text-[8px] px-1.5 py-0.5 rounded-full uppercase tracking-widest font-bold">Low Stock</span>}
                  </div>
                  <p className="text-[10px] opacity-40 uppercase tracking-widest mt-1">Current: {v.stock}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">+ Add</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={quantities[v.id] || ''}
                    onChange={(e) => setQuantities(prev => ({ ...prev, [v.id]: e.target.value }))}
                    className="w-16 px-3 py-2 text-sm font-black border border-black/10 rounded-xl outline-none focus:border-black/30 text-center bg-white"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-black/5 flex gap-3 bg-brand-bg/30 rounded-b-3xl">
          <button onClick={onClose} className="flex-1 py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-black/5 transition-colors border border-black/10 bg-white">
            Cancel
          </button>
          <button
            onClick={handleRestock}
            disabled={mutation.isPending || !Object.values(quantities).some(v => Number(v) > 0)}
            className="flex-1 bg-black text-white py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-black/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
            Confirm Restock
          </button>
        </div>
      </motion.div>
    </div>
  );
}
