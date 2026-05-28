import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Loader2, User } from 'lucide-react';
import { updateProfile } from '../../api/api';
import useAuthStore from '../../store/useAuthStore';
import toast from 'react-hot-toast';
import { useCloudinaryUpload } from '../../hooks/useCloudinaryUpload';
import { getImageUrl } from '../../api/axios';

export default function EditProfileModal({ onClose }) {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [email, setEmail] = useState(user?.email || '');
  const fileInputRef = useRef(null);
  const { upload: uploadToCloudinary } = useCloudinaryUpload();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let avatarUrl = user?.profile?.avatar;
      
      if (avatar) {
        avatarUrl = await uploadToCloudinary(avatar);
      }

      const updateData = { email };
      if (avatarUrl) {
        updateData.avatar = avatarUrl;
      }

      const res = await updateProfile(updateData);
      updateUser(res.data);
      toast.success('Profile updated successfully');
      onClose();
    } catch (err) {
      toast.error('Failed to update profile');
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
          <h2 className="text-xl font-black uppercase tracking-widest">Edit Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex flex-col items-center">
            <div 
              className="w-32 h-32 rounded-full bg-brand-bg flex items-center justify-center overflow-hidden border-2 border-black/5 relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : user?.profile?.avatar ? (
                <img src={getImageUrl(user.profile.avatar)} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-black/20" />
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Upload size={24} className="text-white" />
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
            <p className="mt-4 text-[10px] font-bold uppercase tracking-widest opacity-40">Tap to change avatar</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2">Username</label>
              <input 
                type="text" 
                disabled 
                value={user?.username || ''} 
                className="w-full bg-brand-bg/50 border border-black/5 px-4 py-3 rounded-xl font-bold text-sm opacity-50 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2">Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-brand-bg/50 border border-black/5 px-4 py-3 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-black/80 transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
