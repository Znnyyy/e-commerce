import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export default function HeroSection() {
  return (
    <main className="flex-1 flex flex-col relative w-full overflow-hidden bg-brand-bg">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.8 }}
        className="relative z-10 flex flex-col items-center justify-center flex-1 w-full px-8"
      >
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="mb-6 inline-flex items-center gap-3 px-4 py-2 border border-black/20 rounded-full"
        >
          <span className="w-2 h-2 rounded-full bg-black"></span>
          <span className="text-xs font-bold uppercase tracking-widest opacity-70">Sleek & Minimal</span>
        </motion.div>

        <motion.h1 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          className="text-[17vw] leading-none font-black tracking-tighter text-[#1b1c1c] uppercase relative z-10"
        >
          SNEAKERS
        </motion.h1>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-8 flex flex-col items-center text-center gap-6 max-w-lg"
        >
          <p className="text-lg opacity-70 font-medium leading-relaxed">
            Essential footwear designed to elevate your everyday rotation.
          </p>
          <Link 
            to="/home" 
            className="group relative inline-flex items-center gap-3 bg-black text-brand-bg px-6 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-black/80 transition-all shadow-md hover:-translate-y-0.5"
          >
            <span>Explore Collection</span>
            <ArrowUpRight size={18} className="group-hover:rotate-45 transition-transform" />
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}
