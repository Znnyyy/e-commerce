import { create } from 'zustand';
import api from '../api/axios';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: true,
  error: null,

  login: async (username, password) => {
    try {
      set({ isLoading: true, error: null });
      const res = await api.post('/users/token/', { username, password });
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);

      const userRes = await api.get('/users/me/', {
        headers: { Authorization: `Bearer ${res.data.access}` }
      });

      set({ user: userRes.data, isAuthenticated: true, isLoading: false });
      return true;
    } catch (err) {
      set({
        error: err.response?.data?.detail || 'Login failed. Please check your credentials.',
        isLoading: false
      });
      return false;
    }
  },

  register: async (username, email, password) => {
    try {
      set({ isLoading: true, error: null });
      await api.post('/users/register/', { username, email, password });
      return await useAuthStore.getState().login(username, password);
    } catch (err) {
      const errorMsg = Object.values(err.response?.data || {}).flat().join(', ') || 'Registration failed.';
      set({ error: errorMsg, isLoading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }
    try {
      const res = await api.get('/users/me/');
      set({ user: res.data, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateUser: (userData) => set({ user: userData }),
}));

export default useAuthStore;
