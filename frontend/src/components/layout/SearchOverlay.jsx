import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../../api/api';
import SearchHeader from './SearchHeader';
import SearchResultItem from './SearchResultItem';

export default function SearchOverlay({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await getProducts({ search: query, limit: 5 });
        const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
        setResults(data);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleResultClick = (id) => {
    onClose();
    navigate(`/product/${id}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onClose();
    navigate(`/products?search=${encodeURIComponent(query)}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col bg-brand-bg/95 backdrop-blur-xl"
        >
          
          <SearchHeader onClose={onClose} />

          
          <div className="flex-1 overflow-y-auto px-8 py-12">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSearchSubmit}>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="WHAT ARE YOU LOOKING FOR?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent border-none text-4xl sm:text-6xl font-black uppercase tracking-tighter outline-none placeholder:text-black/10 text-black mb-12"
                />
              </form>

              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 mb-8 flex items-center gap-2">
                    <span className="w-4 h-[1px] bg-black/20"></span>
                    Live Results
                  </h3>

                  {loading ? (
                    <div className="flex items-center gap-3 animate-pulse opacity-40">
                      <div className="w-10 h-10 bg-black rounded-lg"></div>
                      <div className="space-y-2">
                        <div className="w-32 h-3 bg-black rounded"></div>
                        <div className="w-16 h-2 bg-black rounded"></div>
                      </div>
                    </div>
                  ) : results.length > 0 ? (
                    <div className="space-y-4">
                      {results.map((product) => (
                        <SearchResultItem 
                          key={product.id} 
                          product={product} 
                          onClick={handleResultClick} 
                        />
                      ))}
                      <button
                        onClick={handleSearchSubmit}
                        className="w-full text-center py-4 text-[10px] font-black uppercase tracking-widest text-black/40 hover:text-black transition-colors"
                      >
                        See all results for "{query}"
                      </button>
                    </div>
                  ) : query.trim() ? (
                    <p className="text-sm font-bold opacity-30 italic">No products found matching your search.</p>
                  ) : (
                    <p className="text-sm font-bold opacity-30 italic">Start typing to see results...</p>
                  )}
                </div>

                
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 mb-8 flex items-center gap-2">
                    <span className="w-4 h-[1px] bg-black/20"></span>
                    Popular Brands
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {['Nike', 'Adidas', 'Jordan', 'New Balance', 'Yeezy', 'Converse'].map(brand => (
                      <button
                        key={brand}
                        onClick={() => {
                          setQuery(brand);
                          setTimeout(() => inputRef.current?.focus(), 50);
                        }}
                        className="px-6 py-2 border border-black/10 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white hover:border-black transition-all"
                      >
                        {brand}
                      </button>
                    ))}
                  </div>

                  <div className="mt-12 p-8 bg-black rounded-[2.5rem] text-white">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-4">Pro Tip</p>
                    <p className="text-xl font-bold leading-tight">PRESS ENTER TO SEE THE FULL CATALOG FILTERED BY YOUR QUERY.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
