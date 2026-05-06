import React from 'react';

export default function NoProductsFound({ 
  title = "NO PRODUCTS FOUND", 
  subtitle = "Try a different filter or browse all products." 
}) {
  return (
    <div className="w-full py-32 flex flex-col items-center justify-center text-center">
      <h3 className="font-black text-4xl sm:text-6xl uppercase tracking-tighter text-black/10 select-none">
        {title}
      </h3>
      <p className="text-black/25 text-sm sm:text-lg font-bold uppercase tracking-widest mt-4">
        {subtitle}
      </p>
    </div>
  );
}
