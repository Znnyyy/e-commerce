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
      
      <div className="flex items-center">
        <Link to="/" className="font-black text-2xl tracking-tighter uppercase z-50">
          SNEAKERS.
        </Link>
      </div>

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