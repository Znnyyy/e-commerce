import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getImageUrl } from "../../api/axios";
import { formatRupiah } from "../../utils/format";

export default function ProductCard({ product, itemVariants }) {
  const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
  const lowestPrice = product.variants?.length > 0 
    ? Math.min(...product.variants.map(v => parseFloat(v.price)))
    : 0;

  const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
  const isSoldOut = totalStock === 0;

  return (
    <motion.div variants={itemVariants}>
      <Link to={`/product/${product.id}`} className="group flex flex-col w-full">
        <div className="w-full aspect-square flex items-center justify-center overflow-hidden bg-[#f4f4f4] relative rounded-xl border border-black/5">
          {primaryImage ? (
            <img 
              src={getImageUrl(primaryImage.image)} 
              alt={product.name} 
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out ${isSoldOut ? 'grayscale brightness-50' : ''}`} 
            />
          ) : (
            <div className="font-bold text-[10px] text-black/30 uppercase tracking-widest">No Image</div>
          )}

          {isSoldOut ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
              <span className="bg-white text-black px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-2xl">
                Sold Out
              </span>
            </div>
          ) : (
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] font-bold px-4 py-2 rounded-full uppercase tracking-widest">
              View Details
            </div>
          )}
        </div>
        
        <div className={`mt-5 flex flex-col gap-1 z-10 text-left px-1 ${isSoldOut ? 'opacity-50' : ''}`}>
          <div className="flex items-center gap-2 mb-1">
            {product.brand && <span className="text-[10px] uppercase tracking-widest font-bold opacity-50">{product.brand}</span>}
          </div>
          <h3 className="font-bold text-lg tracking-tight leading-tight">{product.name}</h3>
          <p className="font-bold text-base mt-2">{lowestPrice > 0 ? formatRupiah(lowestPrice) : 'Price Unavailable'}</p>
        </div>
      </Link>
    </motion.div>
  );
}
