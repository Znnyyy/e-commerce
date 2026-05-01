import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { getNavInfo } from '../../api/api';

export default function BrandGrid() {
  const { data: navData, isLoading } = useQuery({
    queryKey: ['navInfo'],
    queryFn: () => getNavInfo().then(res => res.data),
    staleTime: 5 * 60 * 1000,
  });

  if (!isLoading && (!navData?.brands || navData.brands.length === 0)) return null;

  return (
    <section className="w-full mb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-black tracking-tighter uppercase">Popular Brands</h2>
        <p className="opacity-50 text-sm mt-1 font-medium">Shop by your favourite brand</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-black/5 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {navData.brands.map((brand, i) => (
            <motion.div
              key={brand}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Link
                to={`/products?brand=${brand}`}
                className="group flex items-center justify-center h-24 border border-black/10 hover:border-black hover:bg-black hover:text-white transition-all duration-300 font-black text-lg uppercase tracking-widest"
              >
                {brand}
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
