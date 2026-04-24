import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, User, ShoppingCart } from "lucide-react";
import useAuthStore from "../../store/useAuthStore";
import useCartStore from "../../store/useCartStore";

export default function Navbar() {
  const { user, isAuthenticated } = useAuthStore();
  const { cart, toggleCart, loadCart } = useCartStore();

  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    }
  }, [isAuthenticated]);

  const itemCount = cart?.item_count || 0;


  return (
    <nav className="flex items-center justify-between px-8 py-6 w-full border-b border-black/10">
      <div className="flex items-center">
        <Link to="/" className="font-black text-2xl tracking-tighter uppercase hover:opacity-80 transition-opacity">
          SNEAKERS.
        </Link>
      </div>

      <ul className="hidden md:flex items-center space-x-12 text-sm font-medium tracking-wide">
        <li>
          <Link to="/home" className="hover:opacity-60 transition-opacity">Home</Link>
        </li>
        <li>
          <Link to="/" className="hover:opacity-60 transition-opacity">Men</Link>
        </li>
        <li>
          <Link to="/" className="hover:opacity-60 transition-opacity">Women</Link>
        </li>
        <li>
          <Link to="/" className="hover:opacity-60 transition-opacity">Brands</Link>
        </li>
      </ul>

      <div className="flex items-center space-x-6">
        <button className="p-1 hover:opacity-60 transition-opacity cursor-pointer">
          <Search size={22} className="text-black" />
        </button>

        {isAuthenticated ? (
          <Link to="/account" className="p-1 hover:opacity-60 transition-opacity cursor-pointer">
            <User size={22} className="text-black" />
          </Link>
        ) : (
          <Link to="/login" className="p-1 hover:opacity-60 transition-opacity cursor-pointer">
            <User size={22} className="text-black" />
          </Link>
        )}

        <button
          onClick={toggleCart}
          className="p-1 hover:opacity-60 transition-opacity cursor-pointer relative"
        >
          <ShoppingCart size={22} className="text-black" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {itemCount > 9 ? '9+' : itemCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}