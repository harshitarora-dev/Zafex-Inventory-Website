import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAdminContacts } from '@/lib/api';
import AdminLayout from './AdminLayout';
import { MessageSquare, Search } from 'lucide-react';

export default function AdminContacts() {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'contacts'],
    queryFn: getAdminContacts,
    staleTime: 60 * 1000,
  });

  const contacts = (data?.contacts ?? []).filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.subject ?? '').toLowerCase().includes(q) ||
      c.message.toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-[28px] font-bold text-[#1a1a18] uppercase tracking-[1px]">
            Contact Messages
          </h1>
          <div className="flex items-center gap-2 text-[#6b6b6b]">
            <MessageSquare size={18} strokeWidth={1.8} />
            <span className="font-sans text-[13px]">{data?.contacts.length ?? 0} messages</span>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 border border-[#d4cfc7] bg-white px-4 h-[44px] mb-6 max-w-[380px]">
          <Search size={16} className="text-[#a39b8e] flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search messages…"
            className="flex-1 bg-transparent font-sans text-[13px] focus:outline-none placeholder:text-[#a39b8e]"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {contacts.length === 0 ? (
              <div className="text-center py-16 bg-white border border-[#e8e4dc]">
                <MessageSquare size={40} className="text-[#d4af37] mx-auto mb-3" />
                <p className="font-sans text-[14px] text-[#6b6b6b]">No contact messages yet</p>
              </div>
            ) : (
              contacts.map((contact) => (
                <div key={contact.id} className="bg-white border border-[#e8e4dc]">
                  <button
                    onClick={() => setExpanded(expanded === contact.id ? null : contact.id)}
                    className="w-full flex items-start justify-between px-5 py-4 text-left hover:bg-[#faf8f3] transition-colors"
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-sans text-[14px] font-bold text-[#1a1a18]">{contact.name}</span>
                        <span className="font-sans text-[12px] text-[#6b6b6b]">·</span>
                        <span className="font-sans text-[12px] text-[#6b6b6b]">{contact.email}</span>
                        {contact.phone && (
                          <>
                            <span className="font-sans text-[12px] text-[#6b6b6b]">·</span>
                            <span className="font-sans text-[12px] text-[#6b6b6b]">{contact.phone}</span>
                          </>
                        )}
                      </div>
                      {contact.subject && (
                        <div className="font-serif text-[13px] font-bold text-[#1a1a18] mb-1">
                          {contact.subject}
                        </div>
                      )}
                      <div className="font-sans text-[12px] text-[#6b6b6b] line-clamp-1">
                        {contact.message}
                      </div>
                    </div>
                    <span className="font-sans text-[11px] text-[#a39b8e] flex-shrink-0">
                      {new Date(contact.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </button>

                  {expanded === contact.id && (
                    <div className="px-5 pb-5 border-t border-[#f0ece4]">
                      <p className="font-sans text-[14px] text-[#4a4a4a] leading-relaxed mt-4">
                        {contact.message}
                      </p>
                      <a
                        href={`mailto:${contact.email}?subject=Re: ${encodeURIComponent(contact.subject ?? 'Your enquiry')}`}
                        className="inline-flex mt-4 h-[38px] items-center px-5 bg-[#1a1a18] text-white font-serif text-[11px] uppercase tracking-[1.5px] hover:bg-[#d4af37] hover:text-[#1a1a18] transition-colors"
                      >
                        Reply via Email
                      </a>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
