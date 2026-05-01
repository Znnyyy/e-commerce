import { motion } from 'framer-motion';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import ProductCard from '../../components/products/ProductCard';
import ProductCardSkeleton from '../../components/ui/skeletons/ProductCardSkeleton';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

function getPageTitle(params) {
  if (params.gender) return `${params.gender}'s Collection`;
  if (params.brand) return params.brand;
  return 'All Products';
}

function getPageSubtitle(params) {
  if (params.gender === 'Men') return 'Built for the streets.';
  if (params.gender === 'Women') return 'Step into something fresh.';
  if (params.gender === 'Unisex') return 'Classics that never go out of style.';
  if (params.brand) return `Explore the full ${params.brand} lineup.`;
  return 'Browse the complete collection.';
}

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const params = Object.fromEntries(searchParams.entries());
  const { products, loading: isLoading, error: isError } = useProducts(params);

  const title = getPageTitle(params);
  const subtitle = getPageSubtitle(params);
  const hasFilter = Object.keys(params).length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full min-h-screen bg-brand-bg px-8 py-12"
    >
      {/* Header */}
      <div className="mb-12">
        {hasFilter && (
          <Link
            to="/home"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity mb-6"
          >
            <ArrowLeft size={14} />
            Back to Store
          </Link>
        )}
        <motion.h1
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-5xl font-black tracking-tighter uppercase"
        >
          {title}
        </motion.h1>
        <p className="opacity-50 text-sm mt-2 font-medium">{subtitle}</p>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-40 text-center">
          <p className="text-2xl font-black uppercase tracking-tight text-red-500">Failed to Load</p>
          <p className="opacity-50 mt-2 max-w-sm text-sm">Please check your backend server.</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
        >
          {products?.map(product => (
            <ProductCard key={product.id} product={product} itemVariants={itemVariants} />
          ))}
          {(!products || products.length === 0) && (
            <div className="col-span-full py-40 flex flex-col items-center justify-center opacity-40">
              <p className="font-black text-xl uppercase tracking-tight">No products found</p>
              <p className="text-sm mt-1">Try a different filter or browse all products.</p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
