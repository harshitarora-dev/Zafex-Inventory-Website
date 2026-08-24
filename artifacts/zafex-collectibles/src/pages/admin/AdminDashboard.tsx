import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAdminDashboard } from '@/lib/api';
import AdminLayout from './AdminLayout';
import { Package, ShoppingCart, Users, IndianRupee, AlertTriangle } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  packed:    'bg-indigo-100 text-indigo-800',
  shipped:   'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: getAdminDashboard,
    refetchInterval: 60_000,
  });

  const stats = [
    {
      label: 'Total Revenue',
      value: data ? `₹${data.revenue.toLocaleString('en-IN')}` : '—',
      icon: IndianRupee,
      color: 'text-[#d4af37]',
      bg: 'bg-[#d4af37]/10',
    },
    {
      label: 'Total Orders',
      value: data?.totalOrders ?? '—',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Pending Orders',
      value: data?.pendingOrders ?? '—',
      icon: Package,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      label: 'Customers',
      value: data?.totalUsers ?? '—',
      icon: Users,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ];

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-10 max-w-[1400px] w-full">
        <h1 className="font-serif text-[26px] sm:text-[34px] font-bold text-[#1a1a18] uppercase tracking-[1px] mb-6 sm:mb-10">
          Dashboard
        </h1>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 mb-8 sm:mb-10">
              {stats.map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="bg-white border border-[#e8e4dc] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 shadow-xs">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${bg} flex items-center justify-center shrink-0`}>
                    <Icon size={20} className={color} strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-sans text-[10px] sm:text-[11px] font-bold uppercase tracking-[1px] text-[#6b6b6b] mb-0.5 truncate">{label}</div>
                    <div className="font-serif text-[18px] sm:text-[24px] font-bold text-[#1a1a18] truncate">{String(value)}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Low stock warning */}
            {data && data.lowStockProducts.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5 mb-8 flex items-start gap-3 shadow-xs">
                <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-serif text-[14px] font-bold text-amber-800 mb-1">
                    {data.lowStockProducts.length} product(s) out of stock
                  </div>
                  <div className="font-sans text-[12px] text-amber-700">
                    {data.lowStockProducts.slice(0, 3).map((p) => p.name).join(', ')}
                    {data.lowStockProducts.length > 3 && ` +${data.lowStockProducts.length - 3} more`}
                  </div>
                </div>
              </div>
            )}

            {/* Recent orders */}
            <div className="bg-white border border-[#e8e4dc] rounded-xl overflow-hidden shadow-xs">
              <div className="px-5 sm:px-6 py-4 border-b border-[#e8e4dc] flex items-center justify-between">
                <h2 className="font-serif text-[16px] font-bold text-[#1a1a18] uppercase">
                  Recent Orders
                </h2>
                <span className="text-[12px] text-[#8a8278]">{data?.recentOrders.length ?? 0} orders</span>
              </div>

              {/* Mobile Card List (< md) */}
              <div className="divide-y divide-[#f0ece4] md:hidden">
                {(!data?.recentOrders || data.recentOrders.length === 0) ? (
                  <div className="p-8 text-center text-[13px] text-[#8a8278]">No recent orders</div>
                ) : (
                  data.recentOrders.map((order) => (
                    <div key={order.id} className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-bold text-[15px] text-[#1a1a18]">#{order.id}</span>
                        <span className={`px-2.5 py-0.5 rounded-full font-sans text-[10px] font-bold capitalize ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="text-[#4a4a4a] font-medium">{order.customerName}</span>
                        <span className="font-serif font-bold text-[#d4af37] text-[14px]">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="text-[11px] text-[#8a8278]">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Table View (>= md) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#f5f4f0]">
                    <tr>
                      {['Order', 'Customer', 'Date', 'Status', 'Amount'].map((h) => (
                        <th
                          key={h}
                          className="px-5 py-3.5 text-left font-sans text-[11px] uppercase tracking-[1px] text-[#6b6b6b]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0ece4]">
                    {(!data?.recentOrders || data.recentOrders.length === 0) ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-[13px] text-[#8a8278]">No recent orders</td>
                      </tr>
                    ) : (
                      data.recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-[#faf8f3] transition-colors">
                          <td className="px-5 py-3.5 font-serif text-[14px] font-bold text-[#1a1a18]">
                            #{order.id}
                          </td>
                          <td className="px-5 py-3.5 font-sans text-[13px] text-[#4a4a4a]">
                            {order.customerName}
                          </td>
                          <td className="px-5 py-3.5 font-sans text-[12px] text-[#6b6b6b]">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-full font-sans text-[11px] font-medium capitalize ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'}`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-serif text-[14px] font-bold text-[#d4af37]">
                            ₹{order.totalAmount.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
