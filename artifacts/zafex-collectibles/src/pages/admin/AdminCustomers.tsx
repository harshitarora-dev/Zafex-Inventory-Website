import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAdminCustomers } from '@/lib/api';
import AdminLayout from './AdminLayout';
import { Search, Users, Mail, Phone, Calendar } from 'lucide-react';

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
      <div className="p-4 sm:p-6 lg:p-10 max-w-[1400px] w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 sm:mb-8">
          <h1 className="font-serif text-[26px] sm:text-[34px] font-bold text-[#1a1a18] uppercase tracking-[1px]">
            Customers
          </h1>
          <div className="flex items-center gap-2 text-[#6b6b6b]">
            <Users size={18} strokeWidth={1.8} />
            <span className="font-sans text-[13px] font-medium">{data?.users.length ?? 0} total registered</span>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 border border-[#d4cfc7] bg-white px-4 h-[44px] mb-6 max-w-md rounded-lg shadow-xs">
          <Search size={16} className="text-[#a39b8e] shrink-0" />
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
          <div className="bg-white border border-[#e8e4dc] rounded-xl overflow-hidden shadow-xs">
            {/* Mobile Card List (< md) */}
            <div className="divide-y divide-[#f0ece4] md:hidden">
              {users.length === 0 ? (
                <div className="p-8 text-center text-[13px] text-[#6b6b6b]">No customers found</div>
              ) : (
                users.map((user) => (
                  <div key={user.id} className="p-4 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#d4af37]/20 flex items-center justify-center shrink-0">
                        <span className="font-serif text-[15px] font-bold text-[#d4af37]">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-[#1a1a18] text-[14px] truncate">{user.name}</h3>
                        <span className="text-[11px] font-mono text-[#8a8278]">ID: #{user.id}</span>
                      </div>
                    </div>

                    <div className="space-y-1 text-[12px] text-[#4a4a4a] pt-1">
                      <div className="flex items-center gap-2 truncate">
                        <Mail size={13} className="text-[#8a8278] shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2">
                          <Phone size={13} className="text-[#8a8278] shrink-0" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-[11px] text-[#8a8278]">
                        <Calendar size={13} className="text-[#8a8278] shrink-0" />
                        <span>Joined: {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
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
                    {['#', 'Name', 'Email', 'Phone', 'Joined'].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left font-sans text-[11px] uppercase tracking-[1px] text-[#6b6b6b]">
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
                        <td className="px-5 py-3.5 font-sans text-[12px] text-[#a39b8e]">{user.id}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#d4af37]/20 flex items-center justify-center shrink-0">
                              <span className="font-serif text-[14px] font-bold text-[#d4af37]">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-sans text-[14px] font-medium text-[#1a1a18]">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-sans text-[13px] text-[#4a4a4a]">{user.email}</td>
                        <td className="px-5 py-3.5 font-sans text-[13px] text-[#4a4a4a]">{user.phone ?? '—'}</td>
                        <td className="px-5 py-3.5 font-sans text-[12px] text-[#6b6b6b]">
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
