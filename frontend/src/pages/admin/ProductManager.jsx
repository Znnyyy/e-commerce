import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, FileSpreadsheet } from 'lucide-react';
import { getProducts } from '../../api/api';
import ProductFilters from '../../components/admin/ProductFilters';
import ProductTable from '../../components/admin/ProductTable';
import ProductDetailPanel from '../../components/admin/ProductDetailPanel';
import ProductFormal from '../../components/admin/ProductFormal';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';
import QuickRestockModal from '../../components/admin/QuickRestockModal';
import { exportProductsXlsx } from '../../utils/exportXlsx';

const getStockStatus = (variants) => {
  if (!variants || variants.length === 0) return { label: 'No Stock', color: 'bg-black/10 text-black' };
  const total = variants.reduce((acc, v) => acc + v.stock, 0);
  if (total === 0) return { label: 'Out of Stock', color: 'bg-red-500/10 text-red-600' };
  if (total < 10) return { label: 'Low Stock', color: 'bg-orange-500/10 text-orange-600' };
  return { label: 'In Stock', color: 'bg-green-500/10 text-green-600' };
};

const getTotalStock = (variants) => {
  if (!variants) return 0;
  return variants.reduce((acc, v) => acc + v.stock, 0);
};

const getBasePrice = (variants) => {
  if (!variants || variants.length === 0) return 'N/A';
  return `Rp ${Number(variants[0].price).toLocaleString('id-ID')}`;
};

export default function ProductManager() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('any');
  const [brandFilter, setBrandFilter] = useState('all');

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin_products'],
    queryFn: () => getProducts().then(res => res.data),
  });

  const allProducts = productsData?.results || productsData || [];

  const filteredProducts = allProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const totalStock = getTotalStock(product.variants);
    const matchesStatus = statusFilter === 'any' || 
                         (statusFilter === 'in_stock' && totalStock > 0) ||
                         (statusFilter === 'out_of_stock' && totalStock === 0);
    
    const matchesBrand = brandFilter === 'all' || product.brand === brandFilter;

    return matchesSearch && matchesStatus && matchesBrand;
  });

  const brands = Array.from(new Set(allProducts.map(p => p.brand).filter(Boolean)));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [restockTarget, setRestockTarget] = useState(null);

  return (
    <div className="flex h-full gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 bg-white rounded-4xl p-8 shadow-sm flex flex-col min-h-0"
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black tracking-tighter">Products</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-brand-bg rounded-full py-2.5 pl-12 pr-4 text-sm font-medium outline-none border border-black/5 focus:border-black/20 w-64 transition-colors"
              />
            </div>
            <button
              onClick={() => exportProductsXlsx(filteredProducts)}
              className="flex items-center gap-2 bg-brand-bg px-4 py-2.5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-black/10 transition-colors border border-black/5"
            >
              <FileSpreadsheet size={14} /> Export
            </button>
            <button className="bg-black text-brand-bg px-6 py-2.5 rounded-full font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-black/80 transition-colors"
              onClick={() => setIsModalOpen(true)}>
              <Plus size={16} /> Add
            </button>
          </div>
        </div>

        <ProductFilters 
          status={statusFilter}
          setStatus={setStatusFilter}
          brand={brandFilter}
          setBrand={setBrandFilter}
          brands={brands}
        />

        <ProductTable
          products={filteredProducts}
          isLoading={isLoading}
          selectedProductId={selectedProduct?.id}
          onRowClick={setSelectedProduct}
          onEdit={(prod) => setEditProduct(prod)}
          onDelete={(prod) => setDeleteTarget(prod)}
          onRestock={(prod) => setRestockTarget(prod)}
          getStockStatus={getStockStatus}
          getTotalStock={getTotalStock}
          getBasePrice={getBasePrice}
        />
      </motion.div>

      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailPanel
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            getBasePrice={getBasePrice}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(isModalOpen || editProduct) && (
          <ProductFormal
            product={editProduct || null}
            onClose={() => {
              setIsModalOpen(false);
              setEditProduct(null);
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {deleteTarget && (
          <DeleteConfirmModal
            product={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onDeleted={() => {
              if (selectedProduct?.id === deleteTarget.id) setSelectedProduct(null);
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {restockTarget && (
          <QuickRestockModal
            product={restockTarget}
            onClose={() => setRestockTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
