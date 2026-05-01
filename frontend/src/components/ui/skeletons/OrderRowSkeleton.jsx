import React from 'react';

export default function OrderRowSkeleton() {
  return (
    <div className="bg-white p-6 border border-black/5 flex flex-col md:flex-row gap-6 animate-pulse">
      
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-5 w-24 bg-black/10 rounded-full" />
          <div className="h-4 w-32 bg-black/5 rounded-full" />
        </div>
        <div className="h-4 w-40 bg-black/5 rounded-full" />
      </div>
      
      
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-black/10 rounded-xl" />
        <div className="space-y-2">
          <div className="h-4 w-20 bg-black/10 rounded-full" />
          <div className="h-3 w-16 bg-black/5 rounded-full" />
        </div>
      </div>

      
      <div className="flex flex-col items-end gap-3 justify-center w-full md:w-auto mt-4 md:mt-0 border-t md:border-t-0 border-black/5 pt-4 md:pt-0">
         <div className="h-6 w-24 bg-black/10 rounded-full" />
         <div className="h-8 w-full md:w-32 bg-black/5 rounded-full" />
      </div>
    </div>
  );
}
