import React from 'react';

export default function TableRowSkeleton({ columns = 5 }) {
  return (
    <tr className="border-b border-black/5 animate-pulse">
      {Array.from({ length: columns }).map((_, idx) => (
        <td key={idx} className="p-4">
           <div className={`h-4 bg-black/5 rounded-full ${idx === 0 ? 'w-10' : 'w-3/4'}`} />
        </td>
      ))}
    </tr>
  );
}
