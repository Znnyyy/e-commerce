import React from 'react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto"
    >
      <h1 className="text-4xl font-black uppercase tracking-tighter mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-black p-6">
          <h2 className="text-lg font-bold uppercase tracking-widest mb-2">Total Orders</h2>
          <p className="text-4xl font-black">128</p>
        </div>
        <div className="border border-black p-6">
          <h2 className="text-lg font-bold uppercase tracking-widest mb-2">Products</h2>
          <p className="text-4xl font-black">45</p>
        </div>
        <div className="border border-black p-6 bg-black text-brand-bg">
          <h2 className="text-lg font-bold uppercase tracking-widest mb-2 text-brand-bg/60">Revenue</h2>
          <p className="text-4xl font-black">Rp 24.5M</p>
        </div>
      </div>
      <div className="mt-12 border border-black/10 p-8">
        <h3 className="font-bold uppercase tracking-widest opacity-60 mb-4">Recent Activity</h3>
        <p>You have full access to manage products, users, and orders here.</p>
      </div>
    </motion.div>
  );
}
