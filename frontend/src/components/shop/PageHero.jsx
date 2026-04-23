import { motion } from 'framer-motion';

export default function PageHero({ title, subtitle }) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col mt-4 mb-12"
    >
      <h1 className="text-5xl font-black tracking-tighter uppercase mb-2">{title}</h1>
      <p className="opacity-60 text-lg">{subtitle}</p>
    </motion.div>
  );
}
