import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export default function Dropdown({ 
  value, 
  onChange, 
  options, 
  placeholder = "Select option",
  className = "",
  buttonClassName = "",
  itemClassName = "",
  align = "left" // "left" or "right"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => 
    typeof opt === 'string' ? opt === value : opt.value === value
  );

  const getLabel = (opt) => typeof opt === 'string' ? opt : opt.label;
  const getValue = (opt) => typeof opt === 'string' ? opt : opt.value;
  const getIcon = (opt) => typeof opt === 'string' ? null : opt.Icon;

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 bg-white border border-black/10 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest hover:border-black/30 transition-all focus:outline-none shadow-sm ${buttonClassName}`}
      >
        <span className="truncate">
          {selectedOption ? getLabel(selectedOption) : placeholder}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={14} className="opacity-40" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} mt-2 w-48 origin-top-${align} bg-white/95 backdrop-blur-xl border border-black/5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-100 overflow-hidden p-1.5`}
          >
            <div className="flex flex-col gap-1">
              {options.map((option) => {
                const optValue = getValue(option);
                const isSelected = value === optValue;
                const Icon = getIcon(option);

                return (
                  <button
                    key={optValue}
                    type="button"
                    onClick={() => {
                      onChange(optValue);
                      setIsOpen(false);
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all text-left group ${
                      isSelected 
                        ? 'bg-black text-white' 
                        : 'text-black hover:bg-black/5'
                    } ${itemClassName}`}
                  >
                    <div className="w-4 flex items-center justify-center shrink-0">
                      {isSelected ? (
                        <Check size={14} className="text-white" />
                      ) : Icon ? (
                        <Icon size={14} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                      ) : null}
                    </div>
                    {getLabel(option)}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
