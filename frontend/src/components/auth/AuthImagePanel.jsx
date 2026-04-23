import { motion } from 'framer-motion';

export default function AuthImagePanel({ imageUrl, title, subtitle }) {
  return (
    <div className="hidden lg:flex w-1/2 bg-black items-center justify-center relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: .7, scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="absolute inset-0 bg-cover bg-center opacity-60"
        style={{ backgroundImage: `url('${imageUrl}')` }}
      />
      <div className="relative z-10 text-brand-bg text-center p-12">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-6xl font-black uppercase tracking-tighter mb-4"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg opacity-80"
        >
          {subtitle}
        </motion.p>
      </div>
    </div>
  );
}
