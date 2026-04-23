import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { ArrowLeft, Loader2 } from 'lucide-react';
import AuthImagePanel from '../../components/auth/AuthImagePanel';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      const loggedUser = useAuthStore.getState().user;
      if (loggedUser?.is_superuser || loggedUser?.is_staff) {
        navigate('/admin/products', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex">
      <AuthImagePanel
        imageUrl="https://images.unsplash.com/photo-1552346154-21d32810baa3?q=80&w=2000&auto=format&fit=crop"
        title="Welcome Back"
        subtitle="Enter your details to access your account."
      />

      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-24 relative">
        <Link to="/" className="absolute top-8 left-8 md:left-24 flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:opacity-60 transition-opacity">
          <ArrowLeft size={16} /> Back
        </Link>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-md w-full mx-auto"
        >
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Login</h2>
          <p className="opacity-60 mb-8">Sign in to your account.</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 mb-6 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-transparent border-b-2 border-black/20 focus:border-black py-3 outline-none transition-colors"
                placeholder="Enter your username"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-b-2 border-black/20 focus:border-black py-3 outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-brand-bg py-4 font-bold uppercase tracking-widest mt-8 hover:bg-black/80 transition-colors flex items-center justify-center h-14"
            >
              {isLoading ? <Loader2 className="animate-spin" size={24} /> : 'Sign In'}
            </button>
          </form>

          <p className="mt-8 text-sm opacity-60 text-center">
            Don't have an account? <Link to="/register" className="font-bold underline text-black hover:opacity-100">Register</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
