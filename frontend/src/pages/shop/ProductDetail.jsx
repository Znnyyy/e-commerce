import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProductDetail } from '../../hooks/useProductDetail';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductDetailImage from '../../components/products/ProductDetailImage';
import ProductDetailInfo from '../../components/products/ProductDetailInfo';
import ProductReviews from '../../components/products/ProductReviews';
import ProductDetailSkeleton from '../../components/ui/skeletons/ProductDetailSkeleton';

export default function ProductDetail() {
  const { id } = useParams();
  const [selectedVariantId, setSelectedVariantId] = useState(null);

  const { product, loading: isLoading, error: isError } = useProductDetail(id);

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (isError || !product) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full min-h-[calc(100vh-89px)] bg-brand-bg flex flex-col justify-center items-center text-center px-8"
      >
        <h2 className="text-3xl font-black uppercase tracking-tight text-red-500 mb-4">Product Not Found</h2>
        <p className="opacity-60 mb-8 max-w-md">We couldn't locate the product you're looking for. It might have been removed or the link is broken.</p>
        <Link to="/home" className="bg-black text-brand-bg px-6 py-3 font-bold uppercase tracking-widest text-sm hover:opacity-80 transition-opacity flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Shop
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="bg-brand-bg w-full min-h-screen">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col md:flex-row"
      >
        <ProductDetailImage product={product} />
        <ProductDetailInfo
          product={product}
          selectedVariantId={selectedVariantId}
          setSelectedVariantId={setSelectedVariantId}
        />
      </motion.div>
      
      <div className="max-w-7xl mx-auto px-8 pb-20">
        <ProductReviews 
          productId={product.id} 
          productName={product.name}
          canReview={product.can_review}
        />
      </div>
    </div>
  );
}
