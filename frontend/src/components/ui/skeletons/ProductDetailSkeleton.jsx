import React from 'react';

export default function ProductDetailSkeleton() {
  return (
    <div className="w-full min-h-[calc(100vh-89px)] bg-brand-bg flex flex-col md:flex-row animate-pulse">
      {/* Left side: Image */}
      <div className="w-full md:w-1/2 h-[50vh] md:h-auto bg-black/5" />

      {/* Right side: Info */}
      <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center">
        {/* Title & Price */}
        <div className="mb-8 border-b border-black/10 pb-8 space-y-4">
          <div className="h-12 bg-black/10 w-3/4 rounded-2xl" />
          <div className="h-12 bg-black/10 w-1/2 rounded-2xl" />
          <div className="h-8 bg-black/5 w-1/3 rounded-xl mt-4" />
        </div>

        {/* Details & Specs */}
        <div className="mb-10 space-y-6">
          <div className="h-6 bg-black/5 w-1/4 rounded-xl" />
          <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-6 py-6 border-y border-black/10">
            <div className="space-y-2"><div className="h-3 w-1/2 bg-black/5 rounded-full" /><div className="h-4 w-3/4 bg-black/10 rounded-full" /></div>
            <div className="space-y-2"><div className="h-3 w-1/2 bg-black/5 rounded-full" /><div className="h-4 w-3/4 bg-black/10 rounded-full" /></div>
            <div className="space-y-2"><div className="h-3 w-1/2 bg-black/5 rounded-full" /><div className="h-4 w-3/4 bg-black/10 rounded-full" /></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-black/5 w-full rounded-full" />
            <div className="h-4 bg-black/5 w-5/6 rounded-full" />
            <div className="h-4 bg-black/5 w-4/6 rounded-full" />
          </div>

          <div className="flex gap-2 mt-8">
            <div className="h-10 w-16 bg-black/10 rounded-xl" />
            <div className="h-10 w-16 bg-black/10 rounded-xl" />
            <div className="h-10 w-16 bg-black/5 rounded-xl" />
          </div>
        </div>

        {/* Button */}
        <div className="h-16 w-full bg-black/10 rounded-none mt-4" />
      </div>
    </div>
  );
}
