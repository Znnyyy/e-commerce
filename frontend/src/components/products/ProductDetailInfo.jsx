import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useCartStore from "../../store/useCartStore";
import useAuthStore from "../../store/useAuthStore";
import ProductVariantSelector from "./ProductVariantSelector";
import ProductDetailHeader from "./ProductDetailHeader";
import ProductDetailSpecs from "./ProductDetailSpecs";

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
      <ProductDetailHeader 
        name={product.name} 
        price={selectedVariant?.price} 
      />

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-10"
      >
        <ProductDetailSpecs
          brand={product.brand}
          sku={selectedVariant?.sku}
          color={selectedVariant?.color}
          description={product.description}
          stock={selectedVariant ? selectedVariant.stock : 0}
        />

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
