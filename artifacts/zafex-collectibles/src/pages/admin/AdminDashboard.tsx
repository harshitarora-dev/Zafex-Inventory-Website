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
      <div className="p-8">
        <h1 className="font-serif text-[28px] font-bold text-[#1a1a18] uppercase tracking-[1px] mb-8">
          Dashboard
        </h1>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
              {stats.map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="bg-white border border-[#e8e4dc] rounded-sm p-5 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={22} className={color} strokeWidth={1.8} />
                  </div>
                  <div>
                    <div className="font-sans text-[11px] uppercase tracking-[1px] text-[#6b6b6b] mb-1">{label}</div>
                    <div className="font-serif text-[24px] font-bold text-[#1a1a18]">{String(value)}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Low stock warning */}
            {data && data.lowStockProducts.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-sm p-5 mb-8 flex items-start gap-3">
                <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
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
            <div className="bg-white border border-[#e8e4dc]">
              <div className="px-6 py-4 border-b border-[#e8e4dc]">
                <h2 className="font-serif text-[16px] font-bold text-[#1a1a18] uppercase">
                  Recent Orders
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#f5f4f0]">
                    <tr>
                      {['Order', 'Customer', 'Date', 'Status', 'Amount'].map((h) => (
                        <th
                          key={h}
                          className="px-5 py-3 text-left font-sans text-[11px] uppercase tracking-[1px] text-[#6b6b6b]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0ece4]">
                    {data?.recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-[#faf8f3] transition-colors">
                        <td className="px-5 py-3 font-serif text-[14px] font-bold text-[#1a1a18]">
                          #{order.id}
                        </td>
                        <td className="px-5 py-3 font-sans text-[13px] text-[#4a4a4a]">
                          {order.customerName}
                        </td>
                        <td className="px-5 py-3 font-sans text-[12px] text-[#6b6b6b]">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`px-2.5 py-1 rounded-full font-sans text-[11px] font-medium capitalize ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-serif text-[14px] font-bold text-[#d4af37]">
                          ₹{order.totalAmount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
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
