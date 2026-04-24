import React, { useState } from 'react';
import Dropdown from '../ui/Dropdown';

export default function ProductFilters() {
  const [status, setStatus] = useState('any');
  const [brand, setBrand] = useState('all');

  const statusOptions = [
    { value: 'any', label: 'Any Status' },
    { value: 'in_stock', label: 'In Stock' },
    { value: 'out_of_stock', label: 'Out of Stock' },
  ];

  const brandOptions = [
    { value: 'all', label: 'All Brands' },
  ];

  return (
    <div className="flex gap-4 mb-6">
      <Dropdown
        value={status}
        options={statusOptions}
        onChange={setStatus}
        buttonClassName="!bg-brand-bg !border-none !rounded-xl !py-2.5"
      />
      <Dropdown
        value={brand}
        options={brandOptions}
        onChange={setBrand}
        buttonClassName="!bg-brand-bg !border-none !rounded-xl !py-2.5"
      />
    </div>
  );
}
