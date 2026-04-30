import React from "react";
import { motion } from "framer-motion";
import { Package } from "lucide-react";
import { Link } from "react-router-dom";
import OrderRow from "./OrderRow";
import OrderRowSkeleton from "../ui/skeletons/OrderRowSkeleton";

export default function AccountTabs({ activeTab, setActiveTab, orders, loadingOrders, onStatusChange }) {
  const tabs = ['orders', 'watchlist', 'settings'];

  return (
    <div className="mt-6 bg-white rounded-lg p-6 md:p-8 shadow-sm border border-black/5">
      <div className="flex items-center gap-8 border-b border-black/5 mb-6 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-sm font-bold uppercase tracking-widest transition-colors relative whitespace-nowrap ${
              activeTab === tab ? 'text-black' : 'text-black/30 hover:text-black/60'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div 
                layoutId="activeTab" 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" 
              />
            )}
          </button>
        ))}
      </div>

      <div className="h-[300px] overflow-y-auto pr-2 no-scrollbar">
        {activeTab === 'orders' && (
          loadingOrders ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <OrderRowSkeleton key={i} />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="h-[300px] flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-brand-bg rounded-full flex items-center justify-center mb-4">
                <Package size={24} className="text-black/30" />
              </div>
              <h3 className="text-lg font-black mb-2">No Recent Orders</h3>
              <p className="text-sm text-black/50 mb-6 max-w-xs font-medium">You haven't made any purchases yet.</p>
              <Link to="/" className="bg-black text-white px-6 py-2.5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-black/80 transition-colors">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => (
                <OrderRow key={order.id} order={order} onStatusChange={onStatusChange} />
              ))}
            </div>
          )
        )}

        {activeTab === 'watchlist' && (
          <div className="h-[300px] flex flex-col items-center justify-center text-center">
            <p className="text-sm text-black/50 font-bold uppercase tracking-widest">Watchlist is coming soon</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="h-[300px] flex flex-col items-center justify-center text-center">
            <p className="text-sm text-black/50 font-bold uppercase tracking-widest">Settings are coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}
