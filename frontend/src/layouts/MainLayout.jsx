import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import CartDrawer from "../components/cart/CartDrawer";
import useAuthStore from "../store/useAuthStore";

export default function MainLayout() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="flex flex-col min-h-screen max-w-[100vw] overflow-x-hidden">
      <Navbar />
      <CartDrawer />
      <Outlet />
    </div>
  );
}
