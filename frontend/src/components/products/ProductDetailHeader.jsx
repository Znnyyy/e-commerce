import React from 'react';
import { motion } from 'framer-motion';
import { formatRupiah } from '../../utils/format';

export default function ProductDetailHeader({ name, price }) {
  return (
    <div className="mb-8 border-b border-black/10 pb-8">
      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-4"
      >
        {name}
      </motion.h1>
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-3xl font-bold"
      >
        {price ? formatRupiah(price) : 'Price Unavailable'}
      </motion.p>
    </div>
  );
}
