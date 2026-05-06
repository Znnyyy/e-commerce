import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RatingStars from '../ui/RatingStars';

export default function ProductDetailSpecs({ brand, sku, color, description, stock, averageRating, reviewCount }) {
  const [isDescOpen, setIsDescOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <RatingStars rating={averageRating} size={18} />
        <span className="opacity-60 text-sm font-medium tracking-tight">({reviewCount} Reviews)</span>
      </div>

      <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-6 py-6 border-y border-black/10">
        {brand && (
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-50 mb-1">Brand</span>
            <span className="font-bold text-sm">{brand}</span>
          </div>
        )}
        {sku && (
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-50 mb-1">SKU</span>
            <span className="font-bold text-sm uppercase">{sku}</span>
          </div>
        )}
        {color && (
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-50 mb-1">Colorway</span>
            <span className="font-bold text-sm capitalize">{color}</span>
          </div>
        )}
      </div>

      <div className="mb-6 border-b border-black/10 pb-4">
        <button 
          onClick={() => setIsDescOpen(!isDescOpen)}
          className="w-full flex justify-between items-center py-2 text-left hover:opacity-80 transition-opacity"
        >
          <span className="font-bold uppercase tracking-widest text-sm">Product Description</span>
          {isDescOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        <AnimatePresence>
          {isDescOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <p className="text-base opacity-80 leading-relaxed pt-4">
                {description || "Designed for both performance and everyday wear. Features an incredibly comfortable sole and durable materials built to last. A true must-have classic."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-4 text-sm font-medium">
        <span className="opacity-60 uppercase tracking-widest">Available Stock:</span>
        <span className="font-bold text-lg">{stock}</span>
      </div>
    </>
  );
}
