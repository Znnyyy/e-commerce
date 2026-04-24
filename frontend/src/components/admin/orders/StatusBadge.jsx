import React from 'react';
import { Clock, CheckCircle, Truck, XCircle } from 'lucide-react';

export const STATUS_CONFIG = {
  pending:  { label: 'Pending',  Icon: Clock,        color: 'bg-amber-500/10 text-amber-600' },
  paid:     { label: 'Paid',     Icon: CheckCircle,  color: 'bg-green-500/10 text-green-600' },
  shipped:  { label: 'Shipped',  Icon: Truck,        color: 'bg-blue-500/10 text-blue-600' },
  failed:   { label: 'Failed',   Icon: XCircle,      color: 'bg-red-500/10 text-red-600' },
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}
