import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Loader2 } from 'lucide-react';
import { 
  createProduct, updateProduct, createVariant, updateVariant, 
  deleteVariant, uploadProductImage, deleteProductImage, setProductImagePrimary 
} from '../../api/api';
import toast from 'react-hot-toast';
import ColorGroup from './ProductFormal/ColorGroup';
import ProductInfoSection from './ProductFormal/ProductInfoSection';
import PhotoSection from './ProductFormal/PhotoSection';
import { useCloudinaryUpload } from '../../hooks/useCloudinaryUpload';

const emptySize = () => ({ size: '', price: '', stock: '', _existing: false });
const emptyGroup = () => ({ color: '', sizes: [emptySize()] });

const flatToGroups = (variants = []) => {
  const map = {};
  variants.forEach((v) => {
    const key = v.color || 'No Color';
    if (!map[key]) map[key] = { color: v.color || '', sizes: [] };
    map[key].sizes.push({ id: v.id, size: v.size, price: String(v.price), stock: String(v.stock), _existing: true });
  });
  return Object.values(map).length ? Object.values(map) : [{ color: '', sizes: [emptySize()] }];
};

export default function ProductFormal({ product = null, onClose }) {
  const queryClient = useQueryClient();
  const isEdit = !!product;
  const { upload: uploadToCloudinary } = useCloudinaryUpload();

  const [form, setForm] = useState({
    name: product?.name || '',
    brand: product?.brand || '',
    gender: product?.gender || 'Unisex',
    description: product?.description || '',
  });

  const [groups, setGroups] = useState(() => flatToGroups(product?.variants));
  const [existingImages, setExistingImages] = useState(product?.images || []);
  const [newFiles, setNewFiles] = useState([]);
  const [primaryExistingId, setPrimaryExistingId] = useState(
    product?.images?.find(i => i.is_primary)?.id || product?.images?.[0]?.id || null
  );
  const fileInputRef = useRef(null);
  const [error, setError] = useState(null);

  const productMutation = useMutation({
    mutationFn: (data) => (isEdit ? updateProduct(product.id, data) : createProduct(data)),
  });

  const handleGroupColorChange = (gIdx, _, value) => {
    setGroups(prev => prev.map((g, i) => (i === gIdx ? { ...g, color: value } : g)));
  };

  const handleSizeField = (gIdx, sIdx, field, value) => {
    setGroups(prev => prev.map((g, i) => {
      if (i !== gIdx) return g;
      if (sIdx === null) return { ...g, sizes: [...g.sizes, emptySize()] };
      return { ...g, sizes: g.sizes.map((s, j) => (j === sIdx ? { ...s, [field]: value } : s)) };
    }));
  };

  const handleRemoveSize = (gIdx, sIdx) => {
    setGroups(prev => prev.map((g, i) => {
      if (i !== gIdx) return g;
      const next = g.sizes.filter((_, j) => j !== sIdx);
      return { ...g, sizes: next.length ? next : [emptySize()] };
    }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file, idx) => ({
      file,
      preview: URL.createObjectURL(file),
      isPrimary: existingImages.length === 0 && newFiles.length === 0 && idx === 0,
    }));
    setNewFiles(prev => [...prev, ...previews]);
    e.target.value = '';
  };

  const handleRemoveExistingImage = async (imgId) => {
    await deleteProductImage(imgId);
    setExistingImages(prev => prev.filter(i => i.id !== imgId));
    if (primaryExistingId === imgId) setPrimaryExistingId(null);
  };

  const handleSetExistingPrimary = (imgId) => {
    setPrimaryExistingId(imgId);
    setNewFiles(prev => prev.map(f => ({ ...f, isPrimary: false })));
  };

  const handleSetNewPrimary = (idx) => {
    setPrimaryExistingId(null);
    setNewFiles(prev => prev.map((f, i) => ({ ...f, isPrimary: i === idx })));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);
    try {
      const productRes = await productMutation.mutateAsync(form);
      const productId = isEdit ? product.id : productRes.data.id;

      for (const f of newFiles) {
        const url = await uploadToCloudinary(f.file);
        await uploadProductImage(productId, url, f.isPrimary);
      }

      if (isEdit && primaryExistingId) await setProductImagePrimary(primaryExistingId);

      const flatVariants = groups.flatMap(g => g.sizes.map(s => ({ ...s, color: g.color, product: productId })));
      for (const v of flatVariants) {
        const payload = { product: v.product, size: v.size, color: v.color, price: v.price, stock: v.stock };
        if (v._existing && v.id) await updateVariant(v.id, payload);
        else await createVariant(payload);
      }

      if (isEdit) {
        const existingIds = new Set(product.variants?.map(v => v.id));
        const keptIds = new Set(flatVariants.filter(v => v._existing && v.id).map(v => v.id));
        for (const id of existingIds) if (!keptIds.has(id)) await deleteVariant(id);
      }

      queryClient.invalidateQueries(['admin_products']);
      toast.success(isEdit ? 'Product updated' : 'Product created');
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Something went wrong.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isSubmitting;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }} transition={{ duration: 0.22, ease: 'easeOut' }}
          className="bg-white rounded-4xl w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-8 pt-8 pb-4 shrink-0">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-1">{isEdit ? 'Editing' : 'New'}</p>
              <h2 className="text-2xl font-black tracking-tighter">{isEdit ? product.name : 'Add Product'}</h2>
            </div>
            <button onClick={onClose} className="p-2.5 bg-black/5 hover:bg-black/10 rounded-full transition-colors">
              <X size={15} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 pb-10 space-y-7 no-scrollbar">
            <ProductInfoSection form={form} setForm={setForm} />

            <PhotoSection 
              existingImages={existingImages} newFiles={newFiles} primaryExistingId={primaryExistingId} 
              fileInputRef={fileInputRef} onFileSelect={handleFileSelect} onRemoveExisting={handleRemoveExistingImage} 
              onRemoveNew={idx => setNewFiles(prev => prev.filter((_, i) => i !== idx))}
              onSetExistingPrimary={handleSetExistingPrimary} onSetNewPrimary={handleSetNewPrimary}
            />

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Variants by Color</p>
                <button type="button" onClick={() => setGroups(prev => [...prev, emptyGroup()])} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-black text-white px-3 py-1.5 rounded-full hover:bg-black/80 transition-colors">
                  <Plus size={11} /> Add Color
                </button>
              </div>
              <div className="space-y-3">
                {groups.map((group, gIdx) => (
                  <ColorGroup
                    key={gIdx} group={group} groupIndex={gIdx} totalGroups={groups.length}
                    onChange={handleGroupColorChange} onRemoveGroup={() => setGroups(prev => prev.filter((_, i) => i !== gIdx))}
                    onAddSize={handleSizeField} onRemoveSize={handleRemoveSize}
                  />
                ))}
              </div>
            </section>

            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 bg-black/5 py-3.5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-black/10 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isLoading} className="flex-1 bg-black text-white py-3.5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-black/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                {isLoading && <Loader2 size={14} className="animate-spin" />}
                {isEdit ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
