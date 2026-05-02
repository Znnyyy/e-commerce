import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchHeader({ onClose }) {
  return (
    <div className="flex items-center justify-between px-8 py-6 border-b border-black/5">
      <div className="flex items-center gap-3">
        <Search size={20} className="text-black" />
        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Search Catalog</span>
      </div>
      <button
        onClick={onClose}
        className="p-2 hover:bg-black hover:text-white rounded-full transition-all"
      >
        <X size={24} />
      </button>
    </div>
  );
}
