import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { checkAdminAuth, adminLogout } from '@/lib/adminApi';
import { Package, LogOut, LayoutDashboard, Image, ShoppingBag, Users, MessageSquare } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: Props) {
  const [, navigate] = useLocation();
  const [location] = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAdminAuth()
      .then(() => setChecking(false))
      .catch(() => navigate('/admin/login'));
  }, [navigate]);

  async function handleLogout() {
    await adminLogout().catch(() => {});
    navigate('/admin/login');
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#1a1a18] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const nav = [
    { href: '/admin/dashboard',       label: 'Dashboard',        icon: LayoutDashboard },
    { href: '/admin/products',        label: 'Products',         icon: Package },
    { href: '/admin/orders',          label: 'Orders',           icon: ShoppingBag },
    { href: '/admin/customers',       label: 'Customers',        icon: Users },
    { href: '/admin/contacts',        label: 'Inquiries',        icon: MessageSquare },
    { href: '/admin/homepage-images', label: 'Homepage Images',  icon: Image },
  ];

  return (
    <div className="flex h-screen bg-[#f5f4f0] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-[#1a1a18] flex flex-col shrink-0">
        {/* Brand */}
        <div className="px-7 py-7 border-b border-[#2a2a26]">
          <Link href="/admin/products" className="block">
            <div className="flex items-center gap-3">
              <span className="text-[#d4af37] text-xl font-serif">✦</span>
              <div>
                <div className="font-serif text-[17px] tracking-[3px] uppercase text-[#f5f0e8]">
                  ZAFEX
                </div>
                <div className="text-[10px] tracking-[2px] uppercase text-[#6a6a60] mt-[2px]">
                  Admin Panel
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-5 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = location.startsWith(href);
            return (
              <Link key={href} href={href}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-md text-[14px] font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#d4af37]/15 text-[#d4af37]'
                      : 'text-[#8a8278] hover:bg-[#ffffff08] hover:text-[#f5f0e8]'
                  }`}
                >
                  <Icon size={18} strokeWidth={1.8} />
                  {label}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Storefront link + logout */}
        <div className="px-4 py-5 border-t border-[#2a2a26] space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-md text-[14px] text-[#8a8278] hover:text-[#f5f0e8] hover:bg-[#ffffff08] transition-colors"
          >
            <LayoutDashboard size={18} strokeWidth={1.8} />
            View Storefront
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-[14px] text-[#8a8278] hover:text-red-400 hover:bg-[#ffffff08] transition-colors"
          >
            <LogOut size={18} strokeWidth={1.8} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
