import React from 'react';
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area } from 'recharts';
import { formatRupiah } from '../../../utils/format';

export default function RevenueChart({ data, hasData }) {
  return (
    <div className="xl:col-span-2 bg-white border border-black/5 rounded-3xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-black uppercase tracking-widest text-[10px] opacity-40">Revenue Growth</h3>
        {!hasData && <span className="text-[9px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full uppercase">No data</span>}
      </div>
      <div className="h-48 w-full">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000008" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#00000040'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#00000040'}} tickFormatter={v => formatRupiah(v).split(',')[0]} width={80} />
              <Tooltip 
                formatter={(v) => [formatRupiah(v), 'Revenue']}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '10px' }} 
              />
              <Area type="monotone" dataKey="revenue" stroke="#000" strokeWidth={2.5} fill="rgba(0,0,0,0.02)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full bg-black/[0.01] rounded-2xl flex flex-col items-center justify-center border border-dashed border-black/5">
            <p className="text-[10px] font-bold opacity-20 uppercase tracking-widest">Awaiting sales data</p>
          </div>
        )}
      </div>
    </div>
  );
}
