import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, User, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import useAuthStore from "../../store/useAuthStore";
import useCartStore from "../../store/useCartStore";
import { getNavInfo } from "../../api/api";

export default function Navbar() {
  const { isAuthenticated } = useAuthStore();
  const { cart, toggleCart, loadCart } = useCartStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    if (isAuthenticated) loadCart();
  }, [isAuthenticated, loadCart]);

  const { data: navData } = useQuery({
    queryKey: ['navInfo'],
    queryFn: () => getNavInfo().then(res => res.data),
    staleTime: 5 * 60 * 1000,
  });

  const itemCount = cart?.item_count || 0;
  
  useEffect(() => {
    setActiveMenu(null);
  }, [location.pathname, location.search]);

  return (
    <nav className="relative flex items-center justify-between px-8 py-4 w-full z-50 font-sans">
      {/* Brand Logo */}
      <div className="flex items-center">
        <Link to="/" className="font-black text-2xl tracking-tighter uppercase z-50">
          SNEAKERS.
        </Link>
      </div>

      {/* Main Navigation */}
      <ul className="hidden md:flex items-center space-x-12 text-sm font-bold tracking-widest uppercase h-full">
        <li className="relative group flex items-center h-full">
          <Link 
            to="/home" 
            className={`py-2 transition-all ${location.pathname === '/home' && !location.search ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
          >
            HOME
            {location.pathname === '/home' && !location.search && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-black"></span>
            )}
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-black transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100"></span>
          </Link>
        </li>
        
        {/* Gender Dropdown */}
        <li className="relative group flex items-center h-full" onMouseEnter={() => setActiveMenu('gender')} onMouseLeave={() => setActiveMenu(null)}>
          <button className={`py-2 transition-all uppercase tracking-widest font-bold ${location.search.includes('gender') || activeMenu === 'gender' ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}>
            SHOP
            {(location.search.includes('gender') || activeMenu === 'gender') && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-black"></span>
            )}
          </button>
          <AnimatePresence>
            {activeMenu === 'gender' && navData?.genders?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 mt-4 bg-[#e8ede6] border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-w-[180px] z-50"
              >
                <div className="py-2 flex flex-col">
                  {navData.genders.map(gender => (
                    <Link 
                      key={gender} 
                      to={`/products?gender=${gender}`}
                      className="px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                    >
                      {gender}
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </li>

        {/* Brands Dropdown */}
        <li className="relative group flex items-center h-full" onMouseEnter={() => setActiveMenu('brand')} onMouseLeave={() => setActiveMenu(null)}>
          <button className={`py-2 transition-all uppercase tracking-widest font-bold ${location.search.includes('brand') || activeMenu === 'brand' ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}>
            BRANDS
            {(location.search.includes('brand') || activeMenu === 'brand') && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-black"></span>
            )}
          </button>
          <AnimatePresence>
            {activeMenu === 'brand' && navData?.brands?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 mt-4 bg-[#e8ede6] border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-w-[200px] z-50"
              >
                <div className="py-2 flex flex-col">
                  {navData.brands.map(brand => (
                    <Link 
                      key={brand} 
                      to={`/products?brand=${brand}`}
                      className="px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                    >
                      {brand}
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </li>
      </ul>

      <div className="flex items-center space-x-2 z-50">
        <button className="p-2 hover:bg-black hover:text-[#e8ede6] transition-colors cursor-pointer border border-transparent">
          <Search size={20} />
        </button>

        <Link to={isAuthenticated ? "/account" : "/login"} className="p-2 hover:bg-black hover:text-[#e8ede6] transition-colors cursor-pointer border border-transparent">
          <User size={20} />
        </Link>

        <button
          onClick={toggleCart}
          className="p-2 hover:bg-black hover:text-[#e8ede6] transition-colors cursor-pointer relative border border-transparent"
        >
          <ShoppingCart size={20} />
          {itemCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold translate-x-1/3 -translate-y-1/3">
              {itemCount > 9 ? '9+' : itemCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}