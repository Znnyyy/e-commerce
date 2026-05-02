import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const STATUS_COLORS = { pending: '#f59e0b', paid: '#10b981', shipped: '#3b82f6', failed: '#ef4444' };

export default function StatusBreakdown({ data, hasData }) {
  return (
    <div className="bg-black text-white rounded-3xl p-6 flex flex-col shadow-lg">
      <h3 className="font-bold uppercase tracking-widest text-[10px] opacity-40 mb-4">Status Breakdown</h3>
      <div className="flex-1 flex flex-col sm:flex-row items-center gap-4">
        {hasData ? (
           <>
             <div className="h-32 w-32 shrink-0">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={data} dataKey="count" nameKey="status" innerRadius={35} outerRadius={48} paddingAngle={6} stroke="none">
                      {data?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#fff'} />
                      ))}
                   </Pie>
                   <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '9px' }} />
                 </PieChart>
               </ResponsiveContainer>
             </div>
             <div className="flex-1 w-full space-y-2">
                {data?.map((entry, idx) => (
                  <div key={idx} className="flex items-center justify-between group">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[entry.status] }} />
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">{entry.status}</span>
                    </div>
                    <span className="text-[10px] font-black">{entry.count}</span>
                  </div>
                ))}
             </div>
           </>
        ) : (
          <div className="flex-1 flex items-center justify-center w-full">
            <p className="text-[10px] font-bold opacity-30 uppercase">No orders yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
