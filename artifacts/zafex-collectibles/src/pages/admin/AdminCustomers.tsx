import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAdminCustomers } from '@/lib/api';
import AdminLayout from './AdminLayout';
import { Search, Users } from 'lucide-react';

export default function AdminCustomers() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'customers'],
    queryFn: getAdminCustomers,
    staleTime: 60 * 1000,
  });

  const users = (data?.users ?? []).filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone ?? '').includes(q)
    );
  });

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-[28px] font-bold text-[#1a1a18] uppercase tracking-[1px]">
            Customers
          </h1>
          <div className="flex items-center gap-2 text-[#6b6b6b]">
            <Users size={18} strokeWidth={1.8} />
            <span className="font-sans text-[13px]">{data?.users.length ?? 0} total</span>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 border border-[#d4cfc7] bg-white px-4 h-[44px] mb-6 max-w-[380px]">
          <Search size={16} className="text-[#a39b8e] flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone…"
            className="flex-1 bg-transparent font-sans text-[13px] focus:outline-none placeholder:text-[#a39b8e]"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white border border-[#e8e4dc]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f5f4f0]">
                  <tr>
                    {['#', 'Name', 'Email', 'Phone', 'Joined'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left font-sans text-[11px] uppercase tracking-[1px] text-[#6b6b6b]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0ece4]">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center font-sans text-[14px] text-[#6b6b6b]">
                        No customers found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-[#faf8f3] transition-colors">
                        <td className="px-5 py-3 font-sans text-[12px] text-[#a39b8e]">{user.id}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#d4af37]/20 flex items-center justify-center flex-shrink-0">
                              <span className="font-serif text-[14px] font-bold text-[#d4af37]">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-sans text-[14px] font-medium text-[#1a1a18]">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 font-sans text-[13px] text-[#4a4a4a]">{user.email}</td>
                        <td className="px-5 py-3 font-sans text-[13px] text-[#4a4a4a]">{user.phone ?? '—'}</td>
                        <td className="px-5 py-3 font-sans text-[12px] text-[#6b6b6b]">
                          {new Date(user.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
