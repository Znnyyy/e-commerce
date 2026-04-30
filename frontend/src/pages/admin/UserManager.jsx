import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ShieldCheck, UserCheck, UserX, RefreshCw, Users } from 'lucide-react';
import api from '../../api/axios';
import TableRowSkeleton from '../../components/ui/skeletons/TableRowSkeleton';
import toast from 'react-hot-toast';

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [togglingId, setTogglingId] = useState(null);

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Users</h1>
          <p className="text-sm opacity-50 font-medium mt-1">
            {loading ? '—' : `${users.length} total · ${totalActive} active · ${totalStaff} staff`}
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 bg-white border border-black/10 px-4 py-2.5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-black/5 transition-colors"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stat chips */}
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

      {/* Table Card */}
      <div className="flex-1 bg-white rounded-4xl shadow-sm flex flex-col overflow-hidden min-h-0">
        {/* Search bar */}
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

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-brand-bg/50 sticky top-0 backdrop-blur-md z-10">
              <tr className="text-xs uppercase tracking-widest font-bold opacity-50 border-b border-black/5">
                <th className="px-6 py-3 font-bold">#</th>
                <th className="px-6 py-3 font-bold">Username</th>
                <th className="px-6 py-3 font-bold">Email</th>
                <th className="px-6 py-3 font-bold">Role</th>
                <th className="px-6 py-3 font-bold">Status</th>
                <th className="px-6 py-3 font-bold">Last Login</th>
                <th className="px-6 py-3 font-bold">Joined</th>
                <th className="px-6 py-3 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4, 5].map(i => <TableRowSkeleton key={i} columns={8} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-black/30 font-bold uppercase tracking-widest text-xs">
                    <Users size={28} className="mx-auto mb-3 opacity-20" />
                    No users found
                  </td>
                </tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="border-b border-black/5 hover:bg-black/[0.02] transition-colors group">
                  <td className="px-6 py-4 font-black text-black/25 text-xs">{u.id}</td>
                  <td className="px-6 py-4 font-bold">{u.username}</td>
                  <td className="px-6 py-4 text-black/60 font-medium text-sm">{u.email || <span className="opacity-30">—</span>}</td>
                  <td className="px-6 py-4">
                    {u.is_superuser ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-purple-50 text-purple-600 border border-purple-200 px-2.5 py-1 rounded-full uppercase tracking-widest">
                        <ShieldCheck size={10} /> Superadmin
                      </span>
                    ) : u.is_staff ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-1 rounded-full uppercase tracking-widest">
                        <ShieldCheck size={10} /> Staff
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-black/5 text-black/50 px-2.5 py-1 rounded-full uppercase tracking-widest">
                        <UserCheck size={10} /> User
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {u.is_active ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded-full">
                        <UserX size={10} /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-black/40 font-medium">
                    {u.last_login
                      ? new Date(u.last_login).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                      : <span className="opacity-30">Never</span>}
                  </td>
                  <td className="px-6 py-4 text-xs text-black/40 font-medium">
                    {new Date(u.date_joined).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {!u.is_superuser && (
                      <button
                        onClick={() => handleToggleActive(u)}
                        disabled={togglingId === u.id}
                        className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100 disabled:cursor-not-allowed ${
                          u.is_active
                            ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white'
                            : 'bg-green-50 text-green-600 hover:bg-green-500 hover:text-white'
                        }`}
                      >
                        {togglingId === u.id ? '...' : u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
