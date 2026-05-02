import React from 'react';
import { motion } from 'framer-motion';
import { Package, ArrowRight } from 'lucide-react';
import { getImageUrl } from '../../api/axios';
import { formatRupiah } from '../../utils/format';

export default function SearchResultItem({ product, onClick }) {
  const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
  const lowestPrice = product.variants?.length > 0 
    ? Math.min(...product.variants.map(v => parseFloat(v.price)))
    : 0;

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={() => onClick(product.id)}
      className="flex items-center gap-4 w-full p-3 rounded-2xl hover:bg-black group transition-all text-left"
    >
      <div className="w-16 h-16 bg-white rounded-xl overflow-hidden border border-black/5 flex items-center justify-center p-2 shrink-0 group-hover:scale-95 transition-transform">
        {primaryImage ? (
          <img
            src={getImageUrl(primaryImage.image)}
            alt={product.name}
            className="w-full h-full object-contain"
          />
        ) : (
          <Package size={20} className="text-black/20" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-black text-sm uppercase tracking-tight group-hover:text-white truncate">
          {product.name}
        </p>
        <p className="text-xs font-bold opacity-40 group-hover:text-white/60">
          {lowestPrice > 0 ? formatRupiah(lowestPrice) : 'Price N/A'}
        </p>
      </div>
      <ArrowRight size={16} className="text-black opacity-0 group-hover:opacity-100 group-hover:text-white -translate-x-4 group-hover:translate-x-0 transition-all" />
    </motion.button>
  );
}
