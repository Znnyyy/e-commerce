import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../../api/api';
import ProductCard from '../products/ProductCard';
import ProductCardSkeleton from '../ui/skeletons/ProductCardSkeleton';

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

export default function ProductSection({ title, subtitle, params = {}, viewAllLink, limit = 4 }) {
  const { data: products, isLoading } = useQuery({
    queryKey: ['products-section', params],
    queryFn: () => getProducts(params).then(res => {
      const data = Array.isArray(res.data) ? res.data : (res.data.data ?? []);
      return data.slice(0, limit);
    }),
  });

  if (!isLoading && (!products || products.length === 0)) return null;

  return (
    <section className="w-full mb-20">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase">{title}</h2>
          {subtitle && <p className="opacity-50 text-sm mt-1 font-medium">{subtitle}</p>}
        </div>
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest border-b-2 border-black pb-0.5 hover:opacity-60 transition-opacity"
          >
            View All
            <ArrowUpRight size={14} className="group-hover:rotate-45 transition-transform" />
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {Array.from({ length: limit }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6"
        >
          {products.map(product => (
            <ProductCard key={product.id} product={product} itemVariants={itemVariants} />
          ))}
        </motion.div>
      )}
    </section>
  );
}
