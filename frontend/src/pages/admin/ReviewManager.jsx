import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Trash2, Search } from 'lucide-react';
import api, { getImageUrl } from '../../api/axios';
import RatingStars from '../../components/ui/RatingStars';
import toast from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

export default function ReviewManager() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all');

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reviews/');
      setReviews(res.data);
    } catch (err) {
      console.error('Failed to load reviews', err);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.delete(`/reviews/${id}/`);
      setReviews(reviews.filter(r => r.id !== id));
      toast.success('Review deleted');
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  const filtered = reviews.filter(review => {
    const matchesSearch = 
      review.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
      review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.product_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = filterRating === 'all' || review.rating.toString() === filterRating;
    return matchesSearch && matchesRating;
  });

  const [selectedReview, setSelectedReview] = useState(null);

  return (
    <div className="flex h-full gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 bg-white rounded-4xl p-8 shadow-sm flex flex-col min-h-0"
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black tracking-tighter">Reviews</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-20" size={14} />
              <input 
                type="text" 
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-brand-bg border-none rounded-full pl-10 pr-4 py-2 text-xs font-bold uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-black/10 w-48 transition-all"
              />
            </div>
            <button
              onClick={fetchReviews}
              className="flex items-center gap-2 bg-brand-bg px-4 py-2.5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-black/10 transition-colors"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', '5', '4', '3', '2', '1'].map(r => {
            const isActive = filterRating === r;
            return (
              <button
                key={r}
                onClick={() => setFilterRating(r)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                  isActive ? 'bg-black text-white' : 'bg-brand-bg text-black hover:bg-black/10'
                }`}
              >
                {r === 'all' ? 'All' : `${r} Stars`}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-auto no-scrollbar">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-widest text-black/30">
                <th className="px-4 py-2">Product</th>
                <th className="px-4 py-2">Reviewer</th>
                <th className="px-4 py-2">Rating</th>
                <th className="px-4 py-2">Comment</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center text-xs font-bold uppercase tracking-widest opacity-20">Loading...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center text-xs font-bold uppercase tracking-widest opacity-20">No reviews found</td>
                </tr>
              ) : filtered.map((review) => (
                <tr 
                  key={review.id} 
                  className={`group cursor-pointer transition-all ${selectedReview?.id === review.id ? 'scale-[0.98]' : ''}`}
                  onClick={() => setSelectedReview(review)}
                >
                  <td className={`px-4 py-3 rounded-l-2xl transition-colors ${selectedReview?.id === review.id ? 'bg-black text-white' : 'bg-brand-bg/30'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg border border-black/5 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                        {review.product_image ? (
                          <img 
                            src={getImageUrl(review.product_image)} 
                            alt="" 
                            className="w-full h-full object-contain mix-blend-multiply" 
                          />
                        ) : (
                          <div className="text-[8px] opacity-10">IMG</div>
                        )}
                      </div>
                      <span className="text-xs font-bold truncate max-w-[120px]">{review.product_name}</span>
                    </div>
                  </td>
                  <td className={`px-4 py-3 transition-colors ${selectedReview?.id === review.id ? 'bg-black text-white' : 'bg-brand-bg/30'}`}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center overflow-hidden border border-black/5">
                        {review.avatar ? (
                          <img src={getImageUrl(review.avatar)} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[8px] font-black opacity-20">{review.username ? review.username[0] : '?'}</span>
                        )}
                      </div>
                      <span className="text-xs font-medium">{review.username}</span>
                    </div>
                  </td>
                  <td className={`px-4 py-3 transition-colors ${selectedReview?.id === review.id ? 'bg-black text-white' : 'bg-brand-bg/30'}`}>
                    <RatingStars rating={review.rating} size={10} color={selectedReview?.id === review.id ? 'white' : 'black'} />
                  </td>
                  <td className={`px-4 py-3 transition-colors ${selectedReview?.id === review.id ? 'bg-black text-white' : 'bg-brand-bg/30'}`}>
                    <p className={`text-xs truncate max-w-[200px] italic ${selectedReview?.id === review.id ? 'opacity-60' : 'text-black/60'}`}>
                      "{review.comment || 'No comment'}"
                    </p>
                  </td>
                  <td className={`px-4 py-3 rounded-r-2xl text-right transition-colors ${selectedReview?.id === review.id ? 'bg-black text-white' : 'bg-brand-bg/30'}`}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(review.id); }}
                      className={`p-2 rounded-lg transition-all ${selectedReview?.id === review.id ? 'text-red-400 hover:bg-white/10' : 'text-red-400 hover:bg-red-50'}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedReview && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="w-96 bg-white rounded-4xl p-8 shadow-2xl border border-black/5 flex flex-col gap-8 relative"
          >
            <button 
              onClick={() => setSelectedReview(null)}
              className="absolute top-8 right-8 w-8 h-8 rounded-full bg-black/5 flex items-center justify-center hover:bg-black hover:text-white transition-all"
            >
              ✕
            </button>

            <div>
              <h2 className="text-2xl font-black tracking-tighter mb-1">Review Detail</h2>
              <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">Customer Feedback</p>
            </div>

            <div className="space-y-6 overflow-y-auto no-scrollbar pr-2">
              <div className="bg-brand-bg/30 p-6 rounded-3xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-white rounded-2xl border border-black/5 p-2 flex items-center justify-center overflow-hidden">
                    {selectedReview.product_image && (
                      <img 
                        src={getImageUrl(selectedReview.product_image)} 
                        alt="" 
                        className="w-full h-full object-contain mix-blend-multiply" 
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest mb-1">Product</p>
                    <p className="text-sm font-black leading-tight">{selectedReview.product_name}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-black/5">
                  <RatingStars rating={selectedReview.rating} size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-2 py-1 rounded">
                    {selectedReview.rating} / 5
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest mb-3">Comment</p>
                <div className="bg-brand-bg/20 p-6 rounded-3xl border border-black/5">
                  <p className="text-sm font-medium leading-relaxed italic text-black/80">
                    "{selectedReview.comment || "No comment provided."}"
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-brand-bg/20 p-4 rounded-2xl">
                  <p className="text-[8px] font-bold opacity-30 uppercase tracking-widest mb-1">User</p>
                  <p className="text-xs font-black">{selectedReview.username}</p>
                </div>
                <div className="bg-brand-bg/20 p-4 rounded-2xl">
                  <p className="text-[8px] font-bold opacity-30 uppercase tracking-widest mb-1">Date</p>
                  <p className="text-xs font-black">
                    {new Date(selectedReview.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDelete(selectedReview.id)}
              className="mt-auto w-full py-4 bg-red-50 text-red-500 rounded-full text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <Trash2 size={16} /> Delete Review
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
