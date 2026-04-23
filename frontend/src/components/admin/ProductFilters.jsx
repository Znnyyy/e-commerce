export default function ProductFilters() {
  return (
    <div className="flex gap-4 mb-6">
      <select className="bg-brand-bg text-sm px-4 py-2 font-medium rounded-xl border border-black/5 outline-none">
        <option>Any Status</option>
        <option>In Stock</option>
        <option>Out of Stock</option>
      </select>
      <select className="bg-brand-bg text-sm px-4 py-2 font-medium rounded-xl border border-black/5 outline-none">
        <option>All Brands</option>
      </select>
    </div>
  );
}
