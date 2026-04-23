import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { getImageUrl } from "../../api/axios";

export default function ProductDetailImage({ product }) {
  const images = product.images || [];
  const primaryImage = images.find(img => img.is_primary) || images[0];
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    if (primaryImage) {
      setActiveImage(primaryImage.image);
    }
  }, [primaryImage]);

  return (
    <motion.div 
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full md:w-1/2 min-h-[60vh] md:min-h-full relative overflow-hidden border-r border-black/10 bg-[#f9f9f9]"
    >
      <Link to="/home" className="absolute top-8 left-8 p-3 bg-white hover:bg-black hover:text-white rounded-full transition-colors z-20 shadow-sm border border-black/10">
        <ArrowLeft size={20} />
      </Link>
      
      {activeImage ? (
        <img 
          key={activeImage}
          src={getImageUrl(activeImage)} 
          alt={product.name} 
          className="w-full h-full object-cover absolute inset-0" 
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center font-bold text-black/30 uppercase tracking-widest text-sm">NO IMAGE</div>
      )}

      {images.length > 1 && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 z-10 px-4">
          {images.map(img => (
            <button 
              key={img.id}
              onClick={() => setActiveImage(img.image)}
              className={`w-20 h-20 bg-white rounded-lg overflow-hidden border-2 transition-all ${
                activeImage === img.image ? 'border-black shadow-md scale-105' : 'border-transparent hover:border-black/30 opacity-70 hover:opacity-100'
              }`}
            >
              <img src={getImageUrl(img.image)} alt="Thumbnail" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
