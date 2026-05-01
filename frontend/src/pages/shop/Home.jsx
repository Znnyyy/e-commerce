import { motion } from 'framer-motion';
import ProductSection from '../../components/shop/ProductSection';
import BrandGrid from '../../components/shop/BrandGrid';

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full min-h-screen bg-brand-bg px-8 py-12 flex flex-col"
    >
      {/* New Arrivals */}
      <ProductSection
        title="New Arrivals"
        subtitle="Fresh drops, just landed."
        params={{ ordering: '-created_at' }}
        viewAllLink="/products"
        limit={4}
      />

      {/* Popular Brands */}
      <BrandGrid />

      {/* Men's Collection */}
      <ProductSection
        title="Men's Collection"
        subtitle="Built for the streets."
        params={{ gender: 'Men', ordering: '-created_at' }}
        viewAllLink="/products?gender=Men"
        limit={4}
      />

      {/* Women's Collection */}
      <ProductSection
        title="Women's Collection"
        subtitle="Step into something fresh."
        params={{ gender: 'Women', ordering: '-created_at' }}
        viewAllLink="/products?gender=Women"
        limit={4}
      />

      {/* Unisex */}
      <ProductSection
        title="For Everyone"
        subtitle="Classics that never go out of style."
        params={{ gender: 'Unisex', ordering: '-created_at' }}
        viewAllLink="/products?gender=Unisex"
        limit={4}
      />
    </motion.div>
  );
}
