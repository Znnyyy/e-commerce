import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Trash2, ChevronDown, Plus } from 'lucide-react';
import { inputCls } from './Field';

export default function ColorGroup({ group, groupIndex, totalGroups, onChange, onRemoveGroup, onAddSize, onRemoveSize }) {
  const [open, setOpen] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-black/8 overflow-hidden"
    >
      <div className="flex items-center gap-3 px-4 py-3 bg-black/[0.03]">
        <div className="w-5 h-5 rounded-full border-2 border-black/10 flex items-center justify-center shrink-0">
          <Palette size={10} className="opacity-40" />
        </div>
        <input
          value={group.color}
          onChange={(e) => onChange(groupIndex, 'color', e.target.value)}
          placeholder="Color name (e.g. Black)"
          className="flex-1 bg-transparent text-xs font-black uppercase tracking-widest outline-none placeholder:opacity-30 placeholder:normal-case placeholder:tracking-normal"
        />
        <div className="flex items-center gap-1 ml-auto">
          {totalGroups > 1 && (
            <button
              type="button"
              onClick={() => onRemoveGroup(groupIndex)}
              className="p-1.5 hover:bg-red-50 rounded-full transition-colors"
            >
              <Trash2 size={12} className="text-red-400" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen((p) => !p)}
            className="p-1.5 hover:bg-black/5 rounded-full transition-colors"
          >
            <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={13} className="opacity-40" />
            </motion.div>
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pt-3 pb-4 space-y-2 bg-white">
              <div className="grid grid-cols-[1fr_1.5fr_1fr_auto] gap-2 px-1">
                {['Size', 'Price (Rp)', 'Stock', ''].map((h, i) => (
                  <span key={i} className="text-[9px] font-black uppercase tracking-widest opacity-30">{h}</span>
                ))}
              </div>

              {group.sizes.map((s, sIndex) => (
                <div key={sIndex} className="grid grid-cols-[1fr_1.5fr_1fr_auto] gap-2 items-center">
                  <input
                    value={s.size}
                    onChange={(e) => onAddSize(groupIndex, sIndex, 'size', e.target.value)}
                    required
                    placeholder="42"
                    className={inputCls}
                  />
                  <input
                    type="number"
                    value={s.price}
                    onChange={(e) => onAddSize(groupIndex, sIndex, 'price', e.target.value)}
                    required
                    placeholder="1500000"
                    className={inputCls}
                  />
                  <input
                    type="number"
                    value={s.stock}
                    onChange={(e) => onAddSize(groupIndex, sIndex, 'stock', e.target.value)}
                    required
                    placeholder="0"
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveSize(groupIndex, sIndex)}
                    disabled={group.sizes.length === 1}
                    className="p-1.5 hover:bg-red-50 rounded-full transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={12} className="text-red-400" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => onAddSize(groupIndex, null)}
                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-80 transition-opacity mt-1 pl-1"
              >
                <Plus size={11} /> Add size
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
