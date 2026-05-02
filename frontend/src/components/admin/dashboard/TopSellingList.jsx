import React from 'react';
import { Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TopSellingList({ products, loading, maxQty }) {
  return (
    <div className="bg-white border border-black/5 rounded-3xl p-6 shadow-sm">
      <h3 className="font-black uppercase tracking-widest text-[10px] opacity-40 mb-5 flex items-center gap-2">
         <Trophy size={12} className="text-amber-500" /> Top Selling
      </h3>
      <div className="space-y-4">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-10 bg-black/5 rounded-2xl animate-pulse" />)
        ) : products?.length > 0 ? (
          products.slice(0, 3).map((product, idx) => (
            <div key={idx} className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-xl bg-brand-bg flex items-center justify-center shrink-0 font-black text-[10px]">
                {idx + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold truncate group-hover:text-blue-600 transition-colors">{product.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                   <div className="flex-1 h-1 bg-black/5 rounded-full overflow-hidden">
                      <div className="h-full bg-black rounded-full" style={{ width: `${(product.qty / maxQty) * 100}%` }} />
                   </div>
                   <span className="text-[9px] font-black opacity-40">{product.qty} sold</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-[10px] font-bold opacity-20 uppercase text-center py-4">No sales recorded</p>
        )}
      </div>
      <Link to="/admin/products" className="mt-6 flex items-center justify-center w-full py-3 border border-black/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">
         View Inventory
      </Link>
    </div>
  );
}
