import React from 'react';
import Dropdown from '../ui/Dropdown';

export default function ProductFilters({ status, setStatus, brand, setBrand, brands }) {
  const statusOptions = [
    { value: 'any', label: 'Any Status' },
    { value: 'in_stock', label: 'In Stock' },
    { value: 'out_of_stock', label: 'Out of Stock' },
  ];

  const brandOptions = [
    { value: 'all', label: 'All Brands' },
    ...brands.map(b => ({ value: b, label: b }))
  ];

  return (
    <div className="flex gap-4 mb-6">
      <Dropdown
        value={status}
        options={statusOptions}
        onChange={setStatus}
        buttonClassName="!bg-brand-bg !border-none !rounded-xl !py-2.5 !text-[10px] !font-bold !uppercase !tracking-widest"
      />
      <Dropdown
        value={brand}
        options={brandOptions}
        onChange={setBrand}
        buttonClassName="!bg-brand-bg !border-none !rounded-xl !py-2.5 !text-[10px] !font-bold !uppercase !tracking-widest"
      />
    </div>
  );
}
