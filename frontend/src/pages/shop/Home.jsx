import { motion } from 'framer-motion';
import { useProducts } from '../../hooks/useProducts';
import ProductCard from '../../components/products/ProductCard';
import ProductCardSkeleton from '../../components/ui/skeletons/ProductCardSkeleton';
import PageHero from '../../components/shop/PageHero';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

export default function Home() {
  const { products, loading: isLoading, error: isError } = useProducts();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full min-h-[calc(100vh-89px)] bg-brand-bg px-8 py-10 flex flex-col"
    >
      <PageHero
        title="All Products"
        subtitle="Fresh kicks just dropped. Grab them before they're gone."
      />

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-10">
          {Array.from({ length: 10 }).map((_, idx) => (
            <ProductCardSkeleton key={idx} />
          ))}
        </div>
      ) : isError ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full flex-1 flex flex-col justify-center items-center py-20 text-center"
        >
          <p className="text-2xl font-bold uppercase tracking-tight text-red-500">Failed to Load</p>
          <p className="opacity-60 mt-2 max-w-sm">We couldn't fetch the latest drops right now. Please ensure your backend server is running.</p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-10"
        >
          {products?.map((product) => (
            <ProductCard key={product.id} product={product} itemVariants={itemVariants} />
          ))}
          {(!products || products.length === 0) && (
            <div className="col-span-full py-20 flex justify-center items-center opacity-50 font-medium">
              No products available at the moment.
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
