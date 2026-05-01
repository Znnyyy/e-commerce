import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { formatRupiah } from "../../utils/format";
import useCartStore from "../../store/useCartStore";
import useAuthStore from "../../store/useAuthStore";
import ProductVariantSelector from "./ProductVariantSelector";

export default function ProductDetailInfo({ product, selectedVariantId, setSelectedVariantId }) {
  const variants = product.variants || [];
  const selectedVariant = variants.find(v => v.id === selectedVariantId) || variants[0];

  const colors = Array.from(new Set(variants.map(v => v.color).filter(Boolean)));
  const allSizes = Array.from(new Set(variants.map(v => v.size).filter(Boolean))).sort((a,b) => a.localeCompare(b, undefined, {numeric: true}));

  const [activeColor, setActiveColor] = useState(selectedVariant?.color || colors[0]);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const { addItem, isLoading: cartLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedVariant?.color) {
      setActiveColor(selectedVariant.color);
    }
  }, [selectedVariant]);

  const handleColorClick = (color) => {
    if (color === activeColor) return;
    
    let nextVariant = variants.find(v => v.color === color && v.size === selectedVariant?.size && v.stock > 0);
    if (!nextVariant) {
      nextVariant = variants.find(v => v.color === color && v.size === selectedVariant?.size);
    }
    if (!nextVariant) {
      nextVariant = variants.find(v => v.color === color && v.stock > 0);
    }
    if (!nextVariant) {
      nextVariant = variants.find(v => v.color === color);
    }

    if (nextVariant) {
      setSelectedVariantId(nextVariant.id);
    } else {
      setActiveColor(color);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!selectedVariant || selectedVariant.stock === 0) return;

    try {
      await addItem(selectedVariant.id, 1);
      setAddedFeedback(true);
      toast.success('Added to cart');
      setTimeout(() => setAddedFeedback(false), 2000);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <motion.div 
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
      className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center"
    >
      <div className="mb-8 border-b border-black/10 pb-8">
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-4"
        >
          {product.name}
        </motion.h1>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-3xl font-bold"
        >
          {selectedVariant ? formatRupiah(selectedVariant.price) : 'Price Unavailable'}
        </motion.p>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-10"
      >
        <div className="flex items-center gap-1 mb-4 text-black">
          <Star fill="currentColor" size={18} />
          <Star fill="currentColor" size={18} />
          <Star fill="currentColor" size={18} />
          <Star fill="currentColor" size={18} />
          <Star size={18} className="opacity-30" />
          <span className="opacity-60 text-sm ml-2 font-medium">(128 Reviews)</span>
        </div>

        <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-6 py-6 border-y border-black/10">
          {product.brand && (
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-50 mb-1">Brand</span>
              <span className="font-bold text-sm">{product.brand}</span>
            </div>
          )}
          {selectedVariant?.sku && (
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-50 mb-1">SKU</span>
              <span className="font-bold text-sm uppercase">{selectedVariant.sku}</span>
            </div>
          )}
          {selectedVariant?.color && (
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-50 mb-1">Colorway</span>
              <span className="font-bold text-sm capitalize">{selectedVariant.color}</span>
            </div>
          )}
        </div>

        <p className="text-base opacity-80 leading-relaxed mb-6">
          {product.description || "Designed for both performance and everyday wear. Features an incredibly comfortable sole and durable materials built to last. A true must-have classic."}
        </p>
        <div className="flex items-center gap-4 text-sm font-medium">
          <span className="opacity-60 uppercase tracking-widest">Available Stock:</span>
          <span className="font-bold text-lg">{selectedVariant ? selectedVariant.stock : 0}</span>
        </div>

        <ProductVariantSelector
          colors={colors}
          allSizes={allSizes}
          activeColor={activeColor}
          handleColorClick={handleColorClick}
          variants={variants}
          selectedVariant={selectedVariant}
          setSelectedVariantId={setSelectedVariantId}
        />
      </motion.div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col sm:flex-row gap-4 mt-8"
      >
        <button 
          onClick={handleAddToCart}
          disabled={cartLoading || !selectedVariant || selectedVariant.stock === 0}
          className="flex-1 bg-black text-brand-bg py-5 px-8 font-bold uppercase tracking-widest hover:bg-black/80 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={20} />
          {cartLoading
            ? 'Adding...'
            : addedFeedback
            ? '✓ Added!'
            : selectedVariant?.stock === 0
            ? 'Out of Stock'
            : 'Add to Cart'}
        </button>
      </motion.div>
    </motion.div>
  );
}
