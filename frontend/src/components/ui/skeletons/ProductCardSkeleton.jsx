import React from 'react';

export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col w-full animate-pulse">
      <div className="w-full aspect-square bg-black/5 rounded-xl border border-black/5" />
      <div className="mt-5 flex flex-col gap-2 z-10 text-left px-1">
        <div className="h-3 w-1/3 bg-black/5 rounded-full" />
        <div className="h-5 w-3/4 bg-black/10 rounded-full mt-1" />
        <div className="h-4 w-1/2 bg-black/10 rounded-full mt-2" />
      </div>
    </div>
  );
}
