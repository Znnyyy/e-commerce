const StatBox = ({ label, value, icon: Icon }) => (
  <div className="flex flex-col">
    <div className="flex items-center gap-1.5 text-black/50 mb-1.5">
      {Icon && <Icon size={14} />}
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </div>
    <span className="text-lg sm:text-xl font-black">{value}</span>
  </div>
);

export default StatBox;
