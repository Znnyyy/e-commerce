import { ShieldCheck, UserCheck, UserX, Users } from 'lucide-react';
import TableRowSkeleton from '../../components/ui/skeletons/TableRowSkeleton';

export default function UserTable({ loading, users, togglingId, onToggleActive, onRoleChange }) {
  return (
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
          ) : users.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center py-16 text-black/30 font-bold uppercase tracking-widest text-xs">
                <Users size={28} className="mx-auto mb-3 opacity-20" />
                No users found
              </td>
            </tr>
          ) : users.map(u => (
            <tr key={u.id} className="border-b border-black/5 hover:bg-black/[0.02] transition-colors group">
              <td className="px-6 py-4 font-black text-black/25 text-xs">{u.id}</td>
              <td className="px-6 py-4 font-bold">{u.username}</td>
              <td className="px-6 py-4 text-black/60 font-medium text-sm">{u.email || <span className="opacity-30">—</span>}</td>
              <td className="px-6 py-4">
                <select
                  value={u.is_superuser ? 'superadmin' : u.is_staff ? 'staff' : 'customer'}
                  onChange={(e) => onRoleChange(u, e.target.value)}
                  disabled={togglingId === `role-${u.id}` || u.is_superuser && u.id === users.find(usr => usr.is_superuser)?.id}
                  className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full outline-none transition-colors border ${
                    u.is_superuser 
                      ? 'bg-purple-50 text-purple-600 border-purple-200 focus:border-purple-400' 
                      : u.is_staff 
                        ? 'bg-blue-50 text-blue-600 border-blue-200 focus:border-blue-400'
                        : 'bg-black/5 text-black/50 border-transparent focus:border-black/20'
                  }`}
                >
                  <option value="customer">Customer</option>
                  <option value="staff">Admin/Staff</option>
                  <option value="superadmin">Superadmin</option>
                </select>
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
                    onClick={() => onToggleActive(u)}
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
  );
}
