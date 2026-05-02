import React from 'react';
import { PackageOpen, ChevronRight } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatRupiah } from '../../../utils/format';
import TableRowSkeleton from '../../ui/skeletons/TableRowSkeleton';

export default function OrderTable({ loading, orders, selectedOrder, onOrderClick }) {
  return (
    <div className="flex-1 overflow-auto rounded-2xl border border-black/5">
      <table className="w-full text-left border-collapse text-sm">
        <thead className="bg-brand-bg/50 sticky top-0 backdrop-blur-md z-10">
          <tr className="text-xs uppercase tracking-widest font-bold opacity-60">
            <th className="p-4 font-bold border-b border-black/5">Order</th>
            <th className="p-4 font-bold border-b border-black/5">Customer</th>
            <th className="p-4 font-bold border-b border-black/5">Items</th>
            <th className="p-4 font-bold border-b border-black/5">Status</th>
            <th className="p-4 font-bold border-b border-black/5">Total</th>
            <th className="p-4 font-bold border-b border-black/5">Date</th>
            <th className="p-4 font-bold border-b border-black/5 text-right">Detail</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            [1,2,3,4,5].map(i => (
              <TableRowSkeleton key={i} columns={7} />
            ))
          ) : orders.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-16 text-black/30 font-bold uppercase tracking-widest text-xs">
                <PackageOpen size={32} className="mx-auto mb-3 opacity-30" />
                No orders found
              </td>
            </tr>
          ) : (
            orders.map(order => {
              const isSelected = selectedOrder?.id === order.id;
              return (
                <tr
                  key={order.id}
                  onClick={() => onOrderClick(isSelected ? null : order)}
                  className={`cursor-pointer transition-colors group ${isSelected ? 'bg-brand-bg' : 'hover:bg-brand-bg/50'}`}
                >
                  <td className="p-4 border-b border-black/5 font-black"># {order.id}</td>
                  <td className="p-4 border-b border-black/5">
                    <p className="font-bold">{order.shipping_name}</p>
                    <p className="text-xs opacity-40">{order.shipping_city}</p>
                  </td>
                  <td className="p-4 border-b border-black/5 font-medium opacity-80">
                    {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                  </td>
                  <td className="p-4 border-b border-black/5">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="p-4 border-b border-black/5 font-bold">
                    {formatRupiah(order.total_amount)}
                  </td>
                  <td className="p-4 border-b border-black/5 opacity-60 text-xs">
                    {new Date(order.created_at).toLocaleDateString('id-ID')}
                  </td>
                  <td className="p-4 border-b border-black/5 text-right">
                    <ChevronRight
                      size={16}
                      className={`inline-block transition-transform opacity-0 group-hover:opacity-100 ${isSelected ? 'rotate-90 opacity-100' : ''}`}
                    />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
