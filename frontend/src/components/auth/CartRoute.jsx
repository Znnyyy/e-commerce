import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import useCartStore from '../../store/useCartStore';
import toast from 'react-hot-toast';

export default function CartRoute() {
  const { cart } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (cart !== null && cart.items?.length === 0) {
      toast.error('Your cart is empty', { id: 'cart-empty' });
      navigate('/home', { replace: true });
    }
  }, [cart, navigate]);

  
  if (cart === null) return null;

  
  if (cart.items?.length === 0) return null;

  return <Outlet />;
}
