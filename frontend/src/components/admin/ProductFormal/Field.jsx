import React from 'react';

export default function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest opacity-40">{label}</label>
      {children}
    </div>
  );
}

export const inputCls = 'w-full bg-white rounded-xl px-3 py-2.5 text-sm font-medium outline-none border border-black/5 focus:border-black/30 transition-colors placeholder:opacity-30';
