import React from "react";
import { User, ShieldCheck, Mail, Edit2, Package, CreditCard, Box, Calendar, Coins } from "lucide-react";
import { getImageUrl } from "../../api/axios";
import { formatRupiah } from "../../utils/format";
import StatBox from "./StatBox";

export default function AccountHeader({ user, orders, totalSpent, totalItems, onEditClick }) {
  return (
    <div className="lg:col-span-2 bg-white rounded-lg p-6 md:p-8 shadow-sm border border-black/5 relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 relative z-10">
        <div className="w-28 h-28 sm:w-32 sm:h-32 bg-white rounded-full p-2 shrink-0 shadow-sm border border-black/5 -mt-12 sm:-mt-16">
          <div 
            className="w-full h-full bg-brand-bg rounded-full flex items-center justify-center border border-black/5 overflow-hidden relative group cursor-pointer"
            onClick={onEditClick}
          >
            {user?.profile?.avatar ? (
              <img src={getImageUrl(user.profile.avatar)} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={48} className="text-black/30" />
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Edit2 size={20} className="text-white" />
            </div>
          </div>
        </div>
        <div className="flex-1 pb-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              {user?.username}
            </h1>
            {user?.is_staff && (
              <span className="flex items-center text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-1 rounded-full uppercase tracking-widest">
                <ShieldCheck size={12} className="mr-1" /> Verified Staff
              </span>
            )}
          </div>
          <p className="text-black/50 text-sm font-medium flex items-center gap-2 mb-1">
            <Mail size={14} /> {user?.email || "No email provided"}
          </p>
          <p className="text-black/30 text-xs font-bold uppercase tracking-widest">
            @{user?.username}
          </p>
        </div>
        <div className="pb-2 w-full sm:w-auto mt-4 sm:mt-0">
          <button 
            onClick={onEditClick}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 border border-black/10 font-bold text-xs uppercase tracking-widest transition-colors hover:bg-black/10 rounded-full"
          >
            <Edit2 size={14} /> Edit Profile
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 border-t border-black/5 pt-8 relative z-10">
        <StatBox label="Points Balance" value={user?.profile?.points ? formatRupiah(user.profile.points) : 'Rp 0'} icon={Coins} />
        <StatBox label="Total Orders" value={orders.length} icon={Package} />
        <StatBox label="Total Spent" value={totalSpent} icon={CreditCard} />
        <StatBox label="Items Bought" value={totalItems} icon={Box} />
        <StatBox label="Member Since" value={new Date().getFullYear()} icon={Calendar} />
      </div>
    </div>
  );
}
