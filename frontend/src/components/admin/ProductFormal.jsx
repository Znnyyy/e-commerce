import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Loader2, ImagePlus, Star } from 'lucide-react';
import { createProduct, updateProduct, createVariant, updateVariant, deleteVariant, uploadProductImage, deleteProductImage, setProductImagePrimary } from '../../api/api';
import { getImageUrl } from '../../api/axios';
import Field, { inputCls } from './ProductFormal/Field';
import ColorGroup from './ProductFormal/ColorGroup';

function flatToGroups(variants = []) {
  const map = {};
  variants.forEach((v) => {
    const key = v.color || 'No Color';
    if (!map[key]) map[key] = { color: v.color || '', sizes: [] };
    map[key].sizes.push({ id: v.id, size: v.size, price: String(v.price), stock: String(v.stock), _existing: true });
  });
  return Object.values(map).length ? Object.values(map) : [{ color: '', sizes: [emptySize()] }];
}

function emptySize() {
  return { size: '', price: '', stock: '', _existing: false };
}

function emptyGroup() {
  return { color: '', sizes: [emptySize()] };
}

export default function ProductFormal({ product = null, onClose }) {
  const queryClient = useQueryClient();
  const isEdit = !!product;

  const [form, setForm] = useState({
    name: product?.name || '',
    brand: product?.brand || '',
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

  const handleFieldChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleGroupColorChange = (gIdx, _, value) => {
    setGroups((prev) => prev.map((g, i) => (i === gIdx ? { ...g, color: value } : g)));
  };

  const handleSizeField = (gIdx, sIdx, field, value) => {
    setGroups((prev) =>
      prev.map((g, i) => {
        if (i !== gIdx) return g;
        if (sIdx === null) {
          return { ...g, sizes: [...g.sizes, emptySize()] };
        }
        return { ...g, sizes: g.sizes.map((s, j) => (j === sIdx ? { ...s, [field]: value } : s)) };
      })
    );
  };

  const handleRemoveSize = (gIdx, sIdx) => {
    setGroups((prev) =>
      prev.map((g, i) => {
        if (i !== gIdx) return g;
        const next = g.sizes.filter((_, j) => j !== sIdx);
        return { ...g, sizes: next.length ? next : [emptySize()] };
      })
    );
  };

  const handleAddGroup = () => setGroups((prev) => [...prev, emptyGroup()]);
  const handleRemoveGroup = (gIdx) => setGroups((prev) => prev.filter((_, i) => i !== gIdx));

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file, idx) => ({
      file,
      preview: URL.createObjectURL(file),
      isPrimary: existingImages.length === 0 && newFiles.length === 0 && idx === 0,
    }));
    setNewFiles((prev) => [...prev, ...previews]);
    e.target.value = '';
  };

  const handleRemoveNewFile = (idx) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleRemoveExistingImage = async (imgId) => {
    await deleteProductImage(imgId);
    setExistingImages((prev) => prev.filter((i) => i.id !== imgId));
    if (primaryExistingId === imgId) setPrimaryExistingId(null);
  };

  const handleSetNewPrimary = (idx) => {
    setPrimaryExistingId(null);
    setNewFiles((prev) => prev.map((f, i) => ({ ...f, isPrimary: i === idx })));
  };

  const handleSetExistingPrimary = (imgId) => {
    setPrimaryExistingId(imgId);
    setNewFiles((prev) => prev.map((f) => ({ ...f, isPrimary: false })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const productRes = await productMutation.mutateAsync(form);
      const productId = isEdit ? product.id : productRes.data.id;

      for (const f of newFiles) {
        // 1. Upload ke Cloudinary terlebih dahulu
        const formData = new FormData();
        formData.append('file', f.file);
        // Ambil dari .env (gunakan nama cloud dan preset Anda)
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'docs_upload_example_us_preset';
        formData.append('upload_preset', uploadPreset);
        
        try {
          const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData,
          });
          const cloudinaryData = await cloudinaryRes.json();
          
          if (cloudinaryData.secure_url) {
            // 2. Jika berhasil, simpan link URL-nya ke backend Django kita
            await uploadProductImage(productId, cloudinaryData.secure_url, f.isPrimary);
          } else {
            throw new Error('Gagal upload ke Cloudinary');
          }
        } catch (uploadErr) {
          console.error("Cloudinary upload failed:", uploadErr);
          throw new Error('Gagal mengunggah beberapa gambar ke Cloudinary.');
        }
      }

      if (isEdit && primaryExistingId) {
        await setProductImagePrimary(primaryExistingId);
      }

      const flatVariants = groups.flatMap((g) =>
        g.sizes.map((s) => ({ ...s, color: g.color, product: productId }))
      );

      for (const v of flatVariants) {
        const payload = { product: v.product, size: v.size, color: v.color, price: v.price, stock: v.stock };
        if (v._existing && v.id) {
          await updateVariant(v.id, payload);
        } else {
          await createVariant(payload);
        }
      }

      if (isEdit) {
        const existingIds = new Set(product.variants?.map((v) => v.id));
        const keptIds = new Set(flatVariants.filter((v) => v._existing && v.id).map((v) => v.id));
        for (const id of existingIds) {
          if (!keptIds.has(id)) await deleteVariant(id);
        }
      }

      queryClient.invalidateQueries(['admin_products']);
      import('react-hot-toast').then(({ default: toast }) => toast.success(isEdit ? 'Product updated successfully' : 'Product created successfully'));
      onClose();
    } catch (err) {
      const errMsg = err?.response?.data?.detail || 'Terjadi kesalahan. Coba lagi.';
      setError(errMsg);
      import('react-hot-toast').then(({ default: toast }) => toast.error(errMsg));
    }
  };

  const isLoading = productMutation.isPending;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="bg-white rounded-4xl w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-8 pt-8 pb-4 shrink-0">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-1">
                {isEdit ? 'Editing' : 'New'}
              </p>
              <h2 className="text-2xl font-black tracking-tighter">
                {isEdit ? product.name : 'Add Product'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 bg-black/5 hover:bg-black/10 rounded-full transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto px-8 pb-10 space-y-7 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            <section className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Product Info</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Name">
                  <input name="name" value={form.name} onChange={handleFieldChange} required placeholder="Nike Air Max 90" className={inputCls} />
                </Field>
                <Field label="Brand">
                  <input name="brand" value={form.brand} onChange={handleFieldChange} placeholder="Nike" className={inputCls} />
                </Field>
              </div>
              <Field label="Description">
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFieldChange}
                  rows={2}
                  placeholder="Short product description..."
                  className={`${inputCls} resize-none`}
                />
              </Field>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Photos</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-black text-white px-3 py-1.5 rounded-full hover:bg-black/80 transition-colors"
                >
                  <ImagePlus size={11} /> Add Photo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              {(existingImages.length > 0 || newFiles.length > 0) ? (
                <div className="grid grid-cols-4 gap-2">
                  {existingImages.map((img) => (
                    <div key={img.id} className="relative group aspect-square rounded-2xl overflow-hidden border border-black/8">
                      <img src={getImageUrl(img.image)} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleSetExistingPrimary(img.id)}
                        className={`absolute top-1.5 left-1.5 p-1 rounded-full transition-all ${
                          primaryExistingId === img.id
                            ? 'bg-yellow-400 text-white'
                            : 'bg-black/30 text-white opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        <Star size={10} fill={primaryExistingId === img.id ? 'white' : 'none'} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(img.id)}
                        className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}

                  {newFiles.map((f, i) => (
                    <div key={i} className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-black/10">
                      <img src={f.preview} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleSetNewPrimary(i)}
                        className={`absolute top-1.5 left-1.5 p-1 rounded-full transition-all ${
                          f.isPrimary
                            ? 'bg-yellow-400 text-white'
                            : 'bg-black/30 text-white opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        <Star size={10} fill={f.isPrimary ? 'white' : 'none'} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveNewFile(i)}
                        className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={10} />
                      </button>
                      <span className="absolute bottom-1.5 left-1.5 text-[8px] font-black uppercase bg-black/50 text-white px-1.5 py-0.5 rounded-full">New</span>
                    </div>
                  ))}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-black/10 rounded-2xl py-8 flex flex-col items-center gap-2 hover:border-black/20 hover:bg-black/2 transition-colors"
                >
                  <ImagePlus size={24} className="opacity-20" />
                  <p className="text-xs font-bold opacity-30 uppercase tracking-widest">Click to upload photos</p>
                </button>
              )}

              {(existingImages.length > 0 || newFiles.length > 0) && (
                <p className="text-[10px] opacity-30 font-medium">
                  ⭐ Klik bintang untuk set foto utama
                </p>
              )}
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Variants by Color</p>
                <button
                  type="button"
                  onClick={handleAddGroup}
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-black text-white px-3 py-1.5 rounded-full hover:bg-black/80 transition-colors"
                >
                  <Plus size={11} /> Add Color
                </button>
              </div>

              <div className="space-y-3">
                {groups.map((group, gIdx) => (
                  <ColorGroup
                    key={gIdx}
                    group={group}
                    groupIndex={gIdx}
                    totalGroups={groups.length}
                    onChange={handleGroupColorChange}
                    onRemoveGroup={handleRemoveGroup}
                    onAddSize={handleSizeField}
                    onRemoveSize={handleRemoveSize}
                  />
                ))}
              </div>
            </section>



            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-black/5 py-3.5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-black/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-black text-white py-3.5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-black/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
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
