import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { deleteProduct } from '../../api/api';

export default function DeleteConfirmModal({ product, onClose, onDeleted }) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteProduct(product.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin_products']);
      onDeleted?.();
      onClose();
    },
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="bg-white rounded-4xl p-8 w-full max-w-sm shadow-2xl text-center"
          onClick={(e) => e.stopPropagation()}
        >
          
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={24} className="text-red-500" />
          </div>

          
          <h2 className="text-xl font-black tracking-tighter mb-2">Hapus Produk?</h2>
          <p className="text-sm font-medium opacity-50 mb-1">
            Kamu akan menghapus
          </p>
          <p className="text-sm font-black mb-6">
            "{product.name}"
          </p>
          <p className="text-xs font-medium opacity-40 mb-8">
            Tindakan ini tidak bisa dibatalkan. Semua variant akan ikut terhapus.
          </p>

          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={deleteMutation.isPending}
              className="flex-1 bg-black/5 py-3.5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-black/10 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="flex-1 bg-red-500 text-white py-3.5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {deleteMutation.isPending
                ? <Loader2 size={14} className="animate-spin" />
                : <Trash2 size={14} />
              }
              {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
