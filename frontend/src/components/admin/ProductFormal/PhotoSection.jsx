import React from 'react';
import { X, ImagePlus, Star } from 'lucide-react';
import { getImageUrl } from '../../../api/axios';

export default function PhotoSection({ 
  existingImages, 
  newFiles, 
  primaryExistingId, 
  fileInputRef, 
  onFileSelect, 
  onRemoveExisting, 
  onRemoveNew, 
  onSetExistingPrimary, 
  onSetNewPrimary,
  isSuperAdmin 
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Photos</p>
        {isSuperAdmin && (
          <>
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()} 
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-black text-white px-3 py-1.5 rounded-full hover:bg-black/80 transition-colors"
            >
              <ImagePlus size={11} /> Add Photo
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={onFileSelect} />
          </>
        )}
      </div>

      {existingImages.length > 0 || newFiles.length > 0 ? (
        <>
          <div className="grid grid-cols-4 gap-2">
            {existingImages.map((img) => (
              <div key={img.id} className="relative group aspect-square rounded-2xl overflow-hidden border border-black/8">
                <img src={getImageUrl(img.image)} alt="" className="w-full h-full object-cover" />
                {isSuperAdmin && (
                  <>
                    <button 
                      type="button" 
                      onClick={() => onSetExistingPrimary(img.id)} 
                      className={`absolute top-1.5 left-1.5 p-1 rounded-full transition-all ${primaryExistingId === img.id ? 'bg-yellow-400 text-white' : 'bg-black/30 text-white opacity-0 group-hover:opacity-100'}`}
                    >
                      <Star size={10} fill={primaryExistingId === img.id ? 'white' : 'none'} />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => onRemoveExisting(img.id)} 
                      className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  </>
                )}
              </div>
            ))}
            {newFiles.map((f, i) => (
              <div key={i} className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-black/10">
                <img src={f.preview} alt="" className="w-full h-full object-cover" />
                {isSuperAdmin && (
                  <>
                    <button 
                      type="button" 
                      onClick={() => onSetNewPrimary(i)} 
                      className={`absolute top-1.5 left-1.5 p-1 rounded-full transition-all ${f.isPrimary ? 'bg-yellow-400 text-white' : 'bg-black/30 text-white opacity-0 group-hover:opacity-100'}`}
                    >
                      <Star size={10} fill={f.isPrimary ? 'white' : 'none'} />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => onRemoveNew(i)} 
                      className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  </>
                )}
                <span className="absolute bottom-1.5 left-1.5 text-[8px] font-black uppercase bg-black/50 text-white px-1.5 py-0.5 rounded-full">New</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] opacity-30 font-medium">⭐ Click star to set primary photo</p>
        </>
      ) : (
        <button 
          type="button" 
          onClick={() => fileInputRef.current?.click()} 
          className="w-full border-2 border-dashed border-black/10 rounded-2xl py-8 flex flex-col items-center gap-2 hover:border-black/20 transition-colors"
        >
          <ImagePlus size={24} className="opacity-20" />
          <p className="text-xs font-bold opacity-30 uppercase tracking-widest">Click to upload photos</p>
        </button>
      )}
    </section>
  );
}
