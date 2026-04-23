import { motion } from 'framer-motion';

export default function LoadingSpinner({ fullPage = true }) {
  return (
    <div className={`w-full flex justify-center items-center ${fullPage ? 'min-h-[calc(100vh-89px)]' : 'flex-1 py-20'}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className="w-12 h-12 border-4 border-black/20 border-t-black rounded-full"
      />
    </div>
  );
}
