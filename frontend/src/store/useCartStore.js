import { create } from 'zustand';
import {
  fetchCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../api/api';

const useCartStore = create((set, get) => ({
  cart: null,          
  isOpen: false,       
  isLoading: false,
  error: null,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  loadCart: async () => {
    set({ isLoading: true });
    try {
      const res = await fetchCart();
      set({ cart: res.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addItem: async (variantId, quantity = 1) => {
    set({ isLoading: true });
    try {
      const res = await addToCart(variantId, quantity);
      set({ cart: res.data, isLoading: false, isOpen: true });
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to add item';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  updateItem: async (itemId, quantity) => {
    try {
      const res = await updateCartItem(itemId, quantity);
      set({ cart: res.data });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to update' });
    }
  },

  removeItem: async (itemId) => {
    try {
      const res = await removeCartItem(itemId);
      set({ cart: res.data });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to remove' });
    }
  },

  clearAll: async () => {
    try {
      const res = await clearCart();
      set({ cart: res.data });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to clear' });
    }
  },
}));

export default useCartStore;
