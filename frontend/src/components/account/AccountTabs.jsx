import React, { useState } from "react";
import { motion } from "framer-motion";
import { Package, Filter, Clock, CheckCircle, Truck, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import OrderRow from "./OrderRow";
import OrderRowSkeleton from "../ui/skeletons/OrderRowSkeleton";
import Dropdown from "../ui/Dropdown";

export default function AccountTabs({ orders, loadingOrders, onStatusChange }) {
  const [filter, setFilter] = useState('all');

  const filterOptions = [
    { label: 'All Orders', value: 'all', Icon: Filter },
    { label: 'Pending', value: 'pending', Icon: Clock },
    { label: 'Paid', value: 'paid', Icon: CheckCircle },
    { label: 'Shipped', value: 'shipped', Icon: Truck },
    { label: 'Failed', value: 'failed', Icon: XCircle },
  ];

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.status === filter);

  return (
    <div className="mt-6 bg-white rounded-lg p-6 md:p-8 shadow-sm border border-black/5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-black/5 mb-6 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold uppercase tracking-widest text-black">
            Order History
          </h2>
          <span className="text-[10px] font-bold bg-black/5 px-2 py-1 rounded text-black/40 uppercase tracking-widest">
            {filteredOrders.length} {filter !== 'all' ? filter : ''} Orders
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-30 hidden md:block">Filter by status:</span>
          <Dropdown
            value={filter}
            onChange={setFilter}
            options={filterOptions}
            align="right"
            className="w-full sm:w-40"
          />
        </div>
      </div>

      <div className="h-[300px] overflow-y-auto pr-2 no-scrollbar">
        {loadingOrders ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <OrderRowSkeleton key={i} />)}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="h-[300px] flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-brand-bg rounded-full flex items-center justify-center mb-4">
              <Package size={24} className="text-black/30" />
            </div>
            <h3 className="text-lg font-black mb-2">No {filter !== 'all' ? filter : ''} Orders</h3>
            <p className="text-sm text-black/50 mb-6 max-w-xs font-medium">
              {filter === 'all' 
                ? "You haven't made any purchases yet." 
                : `You don't have any orders with status "${filter}" yet.`}
            </p>
            {filter === 'all' ? (
              <Link to="/" className="bg-black text-white px-6 py-2.5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-black/80 transition-colors">
                Start Shopping
              </Link>
            ) : (
              <button 
                onClick={() => setFilter('all')}
                className="text-xs font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors"
              >
                Clear Filter
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map(order => (
              <OrderRow key={order.id} order={order} onStatusChange={onStatusChange} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
