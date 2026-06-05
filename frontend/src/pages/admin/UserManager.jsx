import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ShieldCheck, UserCheck, RefreshCw, Users, FileSpreadsheet, UserPlus, X, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import TableRowSkeleton from '../../components/ui/skeletons/TableRowSkeleton';
import toast from 'react-hot-toast';
import UserTable from './UserTable';
import { exportUsersXlsx } from '../../utils/exportXlsx';

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [togglingId, setTogglingId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'customer' });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/list/');
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggleActive = async (user) => {
    setTogglingId(user.id);
    try {
      await api.patch(`/users/list/${user.id}/`, { is_active: !user.is_active });
      setUsers(prev => prev.map(u =>
        u.id === user.id ? { ...u, is_active: !u.is_active } : u
      ));
      toast.success(`User ${user.username} ${!user.is_active ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to update user status');
    } finally {
      setTogglingId(null);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/users/list/', newUser);
      toast.success('User created successfully');
      setShowCreateModal(false);
      setNewUser({ username: '', email: '', password: '', role: 'customer' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const filtered = users.filter(u => {
    const matchSearch =
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase());
    const matchRole =
      filterRole === 'all' ||
      (filterRole === 'staff' && u.is_staff) ||
      (filterRole === 'user' && !u.is_staff);
    return matchSearch && matchRole;
  });

  const totalActive = users.filter(u => u.is_active).length;
  const totalStaff = users.filter(u => u.is_staff).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 h-full"
    >
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Users</h1>
          <p className="text-sm opacity-50 font-medium mt-1">
            {loading ? '—' : `${users.length} total · ${totalActive} active · ${totalStaff} staff`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-black/80 transition-colors"
          >
            <UserPlus size={14} /> Create User
          </button>
          <button
            onClick={() => exportUsersXlsx(filtered)}
            className="flex items-center gap-2 bg-white border border-black/10 px-4 py-2.5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-black/5 transition-colors"
          >
            <FileSpreadsheet size={14} /> Export
          </button>
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 bg-white border border-black/10 px-4 py-2.5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-black/5 transition-colors"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      
      <div className="flex gap-3 flex-wrap">
        {[
          { label: 'All Users', value: users.length, key: 'all', icon: Users },
          { label: 'Staff', value: totalStaff, key: 'staff', icon: ShieldCheck },
          { label: 'Regular', value: users.length - totalStaff, key: 'user', icon: UserCheck },
        ].map(({ label, value, key, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setFilterRole(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all border ${
              filterRole === key
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-black/10 hover:border-black/30'
            }`}
          >
            <Icon size={12} /> {label}
            <span className={`ml-1 ${filterRole === key ? 'opacity-60' : 'opacity-40'}`}>({value})</span>
          </button>
        ))}
      </div>

      
      <div className="flex-1 bg-white rounded-4xl shadow-sm flex flex-col overflow-hidden min-h-0">
        
        <div className="px-6 py-4 border-b border-black/5 flex items-center gap-3">
          <Search size={16} className="opacity-30 shrink-0" />
          <input
            type="text"
            placeholder="Search by username or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm font-medium focus:outline-none bg-transparent placeholder:opacity-30"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-xs font-bold opacity-40 hover:opacity-70">
              Clear
            </button>
          )}
        </div>

        <UserTable
          loading={loading}
          users={filtered}
          togglingId={togglingId}
          onToggleActive={handleToggleActive}
        />
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
          >
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-6 right-6 opacity-40 hover:opacity-100 transition-opacity"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-6">Create User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest opacity-50 mb-2">Username</label>
                <input
                  type="text"
                  required
                  value={newUser.username}
                  onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full border border-black/20 px-4 py-3 focus:outline-none focus:border-black transition-colors"
                  placeholder="Username"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest opacity-50 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full border border-black/20 px-4 py-3 focus:outline-none focus:border-black transition-colors"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest opacity-50 mb-2">Password</label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full border border-black/20 px-4 py-3 focus:outline-none focus:border-black transition-colors"
                  placeholder="Password"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest opacity-50 mb-2">Role</label>
                <select
                  value={newUser.role}
                  onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full border border-black/20 px-4 py-3 focus:outline-none focus:border-black transition-colors"
                >
                  <option value="customer">Customer</option>
                  <option value="staff">Admin / Staff</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={creating}
                className="w-full mt-4 bg-black text-white font-bold uppercase tracking-widest py-4 hover:bg-black/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {creating ? <><Loader2 size={18} className="animate-spin" /> Creating...</> : 'Create User'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
