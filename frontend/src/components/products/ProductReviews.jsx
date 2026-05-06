import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, User as UserIcon } from 'lucide-react';
import { getProductReviews } from '../../api/api';
import RatingStars from '../ui/RatingStars';
import ReviewModal from '../account/ReviewModal';
import { getImageUrl } from '../../api/axios';

export default function ProductReviews({ productId, productName, canReview, onReviewSuccess }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await getProductReviews(productId);
      setReviews(res.data);
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  if (loading) return null;

  return (
    <div className="mt-20 pt-16 border-t border-black/5">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-3">
          <MessageSquare size={20} className="opacity-20" />
          <h3 className="text-xl font-black uppercase tracking-tighter">Customer Reviews</h3>
          <span className="text-[10px] font-bold bg-black/5 px-2 py-1 rounded text-black/40 uppercase tracking-widest">
            {reviews.length} Total
          </span>
        </div>

        {canReview && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-black text-white px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-black/80 transition-colors shadow-lg"
          >
            Write a Review
          </button>
        )}
      </div>

      {canReview && reviews.length === 0 && (
        <div className="mb-12 p-8 bg-black/[0.02] rounded-3xl border border-dashed border-black/10 flex flex-col items-center text-center">
          <p className="text-sm font-bold uppercase tracking-widest mb-4">You've purchased this item!</p>
          <p className="text-xs opacity-50 mb-6 max-w-xs">Share your thoughts with other customers and help them make a better choice.</p>
          <button 
            onClick={() => setShowModal(true)}
            className="text-xs font-black uppercase tracking-widest border-b-2 border-black pb-1 hover:opacity-50 transition-opacity"
          >
            Leave a Review Now
          </button>
        </div>
      )}

      {reviews.length === 0 ? (
        !canReview && (
          <div className="py-20 text-center bg-black/[0.02] rounded-3xl border border-black/5">
            <p className="text-sm font-bold uppercase tracking-widest opacity-20">No reviews yet. Be the first to share your experience!</p>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {reviews.map((review, idx) => (
            <motion.div 
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm hover:border-black/10 transition-colors"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-bg flex items-center justify-center overflow-hidden border border-black/5">
                    {review.avatar ? (
                      <img src={getImageUrl(review.avatar)} alt={review.username} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon size={20} className="opacity-20" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest">{review.username}</p>
                    <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">
                      {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <RatingStars rating={review.rating} size={12} />
              </div>
              <p className="text-sm text-black/70 leading-relaxed font-medium">
                {review.comment || "No comment provided."}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <ReviewModal 
            product={{ id: productId, name: productName, orderId: canReview }} 
            onClose={() => setShowModal(false)}
            onSuccess={() => {
              fetchReviews();
              if (onReviewSuccess) onReviewSuccess();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
