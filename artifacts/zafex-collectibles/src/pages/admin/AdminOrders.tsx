import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminOrders, getAdminOrder, updateAdminOrderStatus } from '@/lib/api';
import AdminLayout from './AdminLayout';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  packed:    'bg-indigo-100 text-indigo-800',
  shipped:   'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const ALL_STATUSES = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', page],
    queryFn: () => getAdminOrders({ page, limit: 20 }),
    staleTime: 30 * 1000,
  });

  const { data: orderDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['admin', 'order', selectedId],
    queryFn: () => getAdminOrder(selectedId!),
    enabled: !!selectedId,
  });

  const handleUpdateStatus = async () => {
    if (!selectedId || !newStatus) return;
    setUpdatingStatus(true);
    try {
      await updateAdminOrderStatus(selectedId, newStatus, statusNote || undefined);
      qc.invalidateQueries({ queryKey: ['admin', 'order', selectedId] });
      qc.invalidateQueries({ queryKey: ['admin', 'orders', page] });
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      setStatusNote('');
    } catch {
      // silently fail
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="font-serif text-[28px] font-bold text-[#1a1a18] uppercase tracking-[1px] mb-8">
          Orders
        </h1>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="bg-white border border-[#e8e4dc]">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#f5f4f0]">
                    <tr>
                      {['Order', 'Customer', 'Date', 'Status', 'Payment', 'Total', ''].map((h) => (
                        <th key={h} className="px-5 py-3 text-left font-sans text-[11px] uppercase tracking-[1px] text-[#6b6b6b]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0ece4]">
                    {data?.orders.map((order) => (
                      <tr key={order.id} className="hover:bg-[#faf8f3] transition-colors">
                        <td className="px-5 py-3 font-serif text-[14px] font-bold text-[#1a1a18]">
                          #{order.id}
                        </td>
                        <td className="px-5 py-3">
                          <div className="font-sans text-[13px] text-[#1a1a18]">{order.customerName}</div>
                          <div className="font-sans text-[11px] text-[#6b6b6b]">{order.customerEmail}</div>
                        </td>
                        <td className="px-5 py-3 font-sans text-[12px] text-[#6b6b6b]">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`px-2.5 py-1 rounded-full font-sans text-[11px] font-medium capitalize ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`font-sans text-[12px] font-medium capitalize ${order.paymentStatus === 'paid' ? 'text-green-700' : order.paymentStatus === 'failed' ? 'text-red-600' : 'text-yellow-600'}`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-serif text-[14px] font-bold text-[#d4af37]">
                          ₹{order.totalAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-5 py-3">
                          <button
                            onClick={() => { setSelectedId(order.id); setNewStatus(order.status); }}
                            className="font-sans text-[12px] text-[#d4af37] hover:text-[#1a1a18] transition-colors"
                          >
                            Manage →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data && data.totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-[#e8e4dc]">
                  <span className="font-sans text-[13px] text-[#6b6b6b]">
                    Page {page} of {data.totalPages} · {data.total} orders
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="w-8 h-8 flex items-center justify-center border border-[#d4cfc7] disabled:opacity-40 hover:border-[#1a1a18] transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                      disabled={page >= data.totalPages}
                      className="w-8 h-8 flex items-center justify-center border border-[#d4cfc7] disabled:opacity-40 hover:border-[#1a1a18] transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Order Detail Drawer */}
      {selectedId && (
        <div className="fixed inset-0 z-50 flex">
          <button className="absolute inset-0 bg-black/40" onClick={() => setSelectedId(null)} />
          <div className="relative ml-auto h-full w-full max-w-[520px] bg-white overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#e8e4dc]">
              <h2 className="font-serif text-[18px] font-bold text-[#1a1a18] uppercase">
                Order #{selectedId}
              </h2>
              <button onClick={() => setSelectedId(null)} className="text-[#6b6b6b] hover:text-[#1a1a18]">
                <X size={20} />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex items-center justify-center py-24">
                <div className="w-8 h-8 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : orderDetail ? (
              <div className="p-6 flex flex-col gap-6">
                {/* Customer */}
                <div>
                  <h3 className="font-serif text-[12px] uppercase tracking-[1px] text-[#6b6b6b] mb-2">Customer</h3>
                  <p className="font-sans text-[14px] text-[#1a1a18] font-bold">{orderDetail.order.customerName}</p>
                  <p className="font-sans text-[13px] text-[#6b6b6b]">{orderDetail.order.customerEmail}</p>
                  {orderDetail.order.customerPhone && (
                    <p className="font-sans text-[13px] text-[#6b6b6b]">{orderDetail.order.customerPhone}</p>
                  )}
                </div>

                {/* Shipping */}
                <div>
                  <h3 className="font-serif text-[12px] uppercase tracking-[1px] text-[#6b6b6b] mb-2">Shipping</h3>
                  <p className="font-sans text-[13px] text-[#1a1a18] leading-relaxed">
                    {orderDetail.order.shippingAddress}<br />
                    {orderDetail.order.shippingCity}{orderDetail.order.shippingState ? `, ${orderDetail.order.shippingState}` : ''}
                    {orderDetail.order.shippingPincode ? ` – ${orderDetail.order.shippingPincode}` : ''}<br />
                    {orderDetail.order.shippingCountry}
                  </p>
                </div>

                {/* Items */}
                <div>
                  <h3 className="font-serif text-[12px] uppercase tracking-[1px] text-[#6b6b6b] mb-2">Items</h3>
                  <div className="border border-[#e8e4dc] divide-y divide-[#f0ece4]">
                    {orderDetail.items.map((item) => (
                      <div key={item.id} className="flex justify-between px-4 py-3">
                        <div>
                          <div className="font-sans text-[13px] text-[#1a1a18] font-medium">{item.productName}</div>
                          <div className="font-sans text-[12px] text-[#6b6b6b]">Qty: {item.quantity}</div>
                        </div>
                        <span className="font-serif text-[14px] font-bold text-[#d4af37]">
                          ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between px-4 py-3 bg-[#f5f4f0]">
                      <span className="font-serif text-[14px] font-bold">Total</span>
                      <span className="font-serif text-[14px] font-bold text-[#d4af37]">
                        ₹{orderDetail.order.totalAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status update */}
                <div>
                  <h3 className="font-serif text-[12px] uppercase tracking-[1px] text-[#6b6b6b] mb-3">Update Status</h3>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full h-[44px] border border-[#d4cfc7] px-3 font-sans text-[14px] focus:outline-none focus:border-[#d4af37] bg-white mb-3"
                  >
                    {ALL_STATUSES.map((s) => (
                      <option key={s} value={s} className="capitalize">{s}</option>
                    ))}
                  </select>
                  <input
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Note (optional)"
                    className="w-full h-[44px] border border-[#d4cfc7] px-3 font-sans text-[13px] focus:outline-none focus:border-[#d4af37] mb-3"
                  />
                  <button
                    onClick={handleUpdateStatus}
                    disabled={updatingStatus || newStatus === orderDetail.order.status}
                    className="w-full h-[44px] bg-[#1a1a18] text-white font-serif text-[12px] uppercase font-bold tracking-[1.5px] hover:bg-[#d4af37] hover:text-[#1a1a18] transition-colors disabled:opacity-50"
                  >
                    {updatingStatus ? 'Updating…' : 'Update Status'}
                  </button>
                </div>

                {/* Status history */}
                {orderDetail.statusHistory.length > 0 && (
                  <div>
                    <h3 className="font-serif text-[12px] uppercase tracking-[1px] text-[#6b6b6b] mb-3">History</h3>
                    <div className="relative pl-4 border-l-2 border-[#d4cfc7] flex flex-col gap-4">
                      {orderDetail.statusHistory.map((entry) => (
                        <div key={entry.id} className="relative">
                          <div className="absolute -left-[17px] w-3 h-3 rounded-full bg-[#d4af37] border-2 border-white" />
                          <div className="font-sans text-[13px] text-[#1a1a18] font-medium capitalize">{entry.status}</div>
                          {entry.note && <div className="font-sans text-[12px] text-[#6b6b6b]">{entry.note}</div>}
                          <div className="font-sans text-[11px] text-[#a39b8e]">
                            {new Date(entry.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
