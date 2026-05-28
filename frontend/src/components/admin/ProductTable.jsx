import { Edit3, Trash2, PackageOpen, PackagePlus } from 'lucide-react';
import { getImageUrl } from '../../api/axios';
import TableRowSkeleton from '../ui/skeletons/TableRowSkeleton';

export default function ProductTable({ products, isLoading, selectedProductId, onRowClick, onEdit, onDelete, onRestock, getStockStatus, getTotalStock, getBasePrice, isSuperAdmin }) {
  return (
    <div className="flex-1 overflow-auto rounded-2xl border border-black/5">
      <table className="w-full text-left border-collapse text-sm">
        <thead className="bg-brand-bg/50 sticky top-0 backdrop-blur-md z-10">
          <tr className="text-xs uppercase tracking-widest font-bold opacity-60">
            <th className="p-4 font-bold border-b border-black/5">Product Name</th>
            <th className="p-4 font-bold border-b border-black/5">Brand</th>
            <th className="p-4 font-bold border-b border-black/5">Status</th>
            <th className="p-4 font-bold border-b border-black/5">Total Stock</th>
            <th className="p-4 font-bold border-b border-black/5">Base Price</th>
            <th className="p-4 font-bold border-b border-black/5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            [1, 2, 3, 4, 5].map(i => (
              <TableRowSkeleton key={i} columns={6} />
            ))
          ) : products.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-12 text-black/40 font-bold uppercase tracking-widest text-xs">
                No products found
              </td>
            </tr>
          ) : (
            products.map((prod) => {
              const status = getStockStatus(prod.variants);
              const isSelected = selectedProductId === prod.id;
              return (
                <tr
                  key={prod.id}
                  onClick={() => onRowClick(prod)}
                  className={`cursor-pointer transition-colors group ${isSelected ? 'bg-brand-bg' : 'hover:bg-brand-bg/50'}`}
                >
                  <td className="p-4 border-b border-black/5 font-bold flex items-center gap-3">
                    <div className="w-10 h-10 bg-black/5 rounded flex items-center justify-center overflow-hidden shrink-0">
                      {prod.images?.[0] ? (
                        <img src={getImageUrl(prod.images[0].image)} alt="" className="object-cover w-full h-full" />
                      ) : <PackageOpen size={16} className="opacity-20" />}
                    </div>
                    {prod.name}
                  </td>
                  <td className="p-4 border-b border-black/5 font-medium opacity-80">{prod.brand}</td>
                  <td className="p-4 border-b border-black/5">
                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="p-4 border-b border-black/5 font-medium">{getTotalStock(prod.variants)}</td>
                  <td className="p-4 border-b border-black/5 font-medium">{getBasePrice(prod.variants)}</td>
                  <td className="p-4 border-b border-black/5 text-right space-x-1">
                    <button
                      className="p-2 text-blue-500 hover:text-white hover:bg-blue-500 rounded-full transition-colors inline-flex"
                      onClick={(e) => { e.stopPropagation(); onRestock(prod); }}
                      title="Quick Restock"
                    >
                      <PackagePlus size={16} />
                    </button>
                    <button
                      className="p-2 text-black/40 hover:text-black hover:bg-black/5 rounded-full transition-colors inline-flex"
                      onClick={(e) => { e.stopPropagation(); onEdit(prod); }}
                      title="Edit Product"
                    >
                      <Edit3 size={16} />
                    </button>
                    {isSuperAdmin && (
                      <button
                        className="p-2 text-red-400 hover:text-white hover:bg-red-500 rounded-full transition-colors inline-flex"
                        onClick={(e) => { e.stopPropagation(); onDelete(prod); }}
                        title="Delete Product"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
