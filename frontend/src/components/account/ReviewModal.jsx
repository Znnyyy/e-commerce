import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, Send } from 'lucide-react';
import { submitReview } from '../../api/api';
import RatingStars from '../ui/RatingStars';
import toast from 'react-hot-toast';

export default function ReviewModal({ product, onClose, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      toast.error('Please select a rating');
      return;
    }

    setLoading(true);
    try {
      await submitReview({
        product: product.id,
        order: product.orderId,
        rating,
        comment
      });
      toast.success('Review submitted successfully!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      const errorMsg = err.response?.data?.non_field_errors?.[0] || 'Failed to submit review';
      toast.error(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-black/5">
          <div>
            <h2 className="text-xl font-black uppercase tracking-widest">Rate Product</h2>
            <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest mt-1">{product.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex flex-col items-center justify-center py-4 bg-black/5 rounded-2xl">
            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-4">Your Rating</label>
            <RatingStars 
              rating={rating} 
              onChange={setRating} 
              size={32} 
            />
            <p className="mt-4 text-xs font-black uppercase tracking-widest">
              {rating === 5 ? 'Excellent!' : rating === 4 ? 'Great' : rating === 3 ? 'Good' : rating === 2 ? 'Poor' : 'Awful'}
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2">Comment (Optional)</label>
            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this product..."
              rows="4"
              className="w-full bg-black/5 border border-black/5 px-4 py-3 rounded-2xl font-medium text-sm focus:outline-none focus:border-black/20 transition-colors resize-none"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-black/80 transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <><Send size={16} /> Submit Review</>}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
