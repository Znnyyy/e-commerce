import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Trash2, PackageOpen, ChevronDown, Loader2 } from 'lucide-react';
import { getImageUrl } from '../../api/axios';
import { deleteProduct } from '../../api/api';
import ProductFormal from './ProductFormal';

function groupVariantsByColor(variants) {
  if (!variants) return {};
  return variants.reduce((acc, v) => {
    const key = v.color || 'One Color';
    if (!acc[key]) acc[key] = [];
    acc[key].push(v);
    return acc;
  }, {});
}

function ColorGroup({ color, variants }) {
  const [open, setOpen] = useState(false);
  const totalStock = variants.reduce((acc, v) => acc + v.stock, 0);

  return (
    <div className="rounded-2xl border border-black/5 overflow-hidden">
      <button
        onClick={() => setOpen(prev => !prev)}
        className="w-full flex items-center justify-between bg-brand-bg px-4 py-3 transition-colors hover:bg-black/5"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-black uppercase tracking-widest">{color}</span>
          <span className="text-[10px] font-bold bg-black/10 px-2 py-0.5 rounded-full">{totalStock} pcs</span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} className="opacity-40" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="divide-y divide-black/5">
              {variants.map((v) => (
                <div key={v.id} className="flex items-center justify-between px-4 py-2.5 bg-white">
                  <div>
                    <p className="text-xs font-bold">Size {v.size}</p>
                    <p className="text-[10px] opacity-50 uppercase tracking-widest mt-0.5">SKU: {v.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black tracking-tighter">{v.stock}</p>
                    <p className="text-[10px] opacity-50 uppercase tracking-widest">Qty</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductDetailPanel({ product, onClose, getBasePrice }) {
  const queryClient = useQueryClient();
  const grouped = groupVariantsByColor(product.variants);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => deleteProduct(product.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin_products']);
      onClose();
    },
  });

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="w-80 bg-white rounded-[2rem] p-6 flex flex-col shadow-sm relative"
      >
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-2 bg-brand-bg hover:bg-black/10 rounded-full transition-colors"
        >
          <X size={16} />
        </button>

        <span className="bg-brand-bg px-3 py-1 font-bold text-[10px] uppercase tracking-widest rounded-full self-start mb-6">
          Details
        </span>

        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-24 h-24 bg-brand-bg rounded-full flex items-center justify-center overflow-hidden mb-4 shadow-sm border border-black/5">
            {product.images?.[0] ? (
              <img src={getImageUrl(product.images[0].image)} alt="" className="object-cover w-full h-full" />
            ) : <PackageOpen size={32} className="opacity-20" />}
          </div>
          <h2 className="text-xl font-black tracking-tighter mb-1">{product.name}</h2>
          <p className="text-sm font-medium opacity-60 uppercase tracking-widest">{product.brand}</p>
        </div>

        <div className="mb-6 flex-1 overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <h3 className="text-xs font-bold uppercase tracking-widest opacity-40 border-b border-black/5 pb-2 mb-4">Stock Variants</h3>
          <div className="space-y-2">
            {Object.keys(grouped).length > 0 ? (
              Object.entries(grouped).map(([color, variants]) => (
                <ColorGroup key={color} color={color} variants={variants} />
              ))
            ) : (
              <p className="text-xs opacity-60 text-center py-4">No variants registered.</p>
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-black/5">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold uppercase tracking-widest opacity-40">Base Price</span>
            <span className="text-xl font-black">{getBasePrice(product.variants)}</span>
          </div>

          {confirmDelete ? (
            <div className="space-y-2">
              <p className="text-xs text-center font-bold text-red-500 uppercase tracking-widest">
                Yakin hapus produk ini?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 bg-brand-bg py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-black/10 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                  className="flex-1 bg-red-500 text-white py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-red-600 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  {deleteMutation.isPending && <Loader2 size={13} className="animate-spin" />}
                  Hapus
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditOpen(true)}
                className="flex-1 bg-black text-white py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-black/80 transition-colors"
              >
                Edit Product
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="px-4 py-3 bg-brand-bg rounded-full font-bold hover:bg-black/10 transition-colors flex items-center justify-center"
              >
                <Trash2 size={16} className="text-red-500" />
              </button>
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {isEditOpen && (
          <ProductFormal
            product={product}
            onClose={() => setIsEditOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
