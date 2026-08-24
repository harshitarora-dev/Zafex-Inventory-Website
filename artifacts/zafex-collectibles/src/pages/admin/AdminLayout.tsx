import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { checkAdminAuth, adminLogout } from '@/lib/adminApi';
import {
  Package,
  LogOut,
  LayoutDashboard,
  Image,
  ShoppingBag,
  Users,
  MessageSquare,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: Props) {
  const [, navigate] = useLocation();
  const [location] = useLocation();
  const [checking, setChecking] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkAdminAuth()
      .then(() => setChecking(false))
      .catch(() => navigate('/admin/login'));
  }, [navigate]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  async function handleLogout() {
    await adminLogout().catch(() => {});
    setShowLogoutConfirm(false);
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

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#1a1a18] text-[#f5f0e8]">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-[#2a2a26] flex items-center justify-between">
        <Link href="/admin/products" className="block">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Zafex"
              className="w-[34px] h-[34px] object-contain rounded bg-white p-0.5"
            />
            <div>
              <div className="font-serif text-[16px] tracking-[2.5px] uppercase text-[#f5f0e8]">
                <span className="text-[#ff7a00]">ZAF</span><span>EX</span>
              </div>
              <div className="text-[9px] tracking-[1.5px] uppercase text-[#8a8278] mt-[1px]">
                Admin Portal
              </div>
            </div>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden text-[#8a8278] hover:text-white p-1 rounded-md"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = location === href || (href !== '/admin' && location.startsWith(href));
          return (
            <Link key={href} href={href}>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#d4af37]/20 text-[#d4af37] font-semibold'
                    : 'text-[#9e968c] hover:bg-[#ffffff0c] hover:text-[#f5f0e8]'
                }`}
              >
                <Icon size={17} strokeWidth={1.8} className={active ? 'text-[#d4af37]' : ''} />
                {label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Storefront link + logout */}
      <div className="p-3 border-t border-[#2a2a26] space-y-1">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] text-[#9e968c] hover:text-[#f5f0e8] hover:bg-[#ffffff0c] transition-colors"
        >
          <ExternalLink size={16} strokeWidth={1.8} />
          View Storefront
        </a>
        <button
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] text-[#9e968c] hover:text-red-400 hover:bg-[#ffffff0c] transition-colors cursor-pointer text-left"
        >
          <LogOut size={16} strokeWidth={1.8} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f5f4f0] overflow-hidden flex-col lg:flex-row">
      {/* Mobile Topbar */}
      <header className="lg:hidden flex items-center justify-between bg-[#1a1a18] text-[#f5f0e8] px-4 py-3 border-b border-[#2a2a26] z-30 shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-md text-[#f5f0e8] hover:bg-white/10 transition cursor-pointer"
            aria-label="Open admin menu"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Zafex"
              className="w-[26px] h-[26px] object-contain rounded bg-white p-0.5"
            />
            <span className="font-serif text-[15px] tracking-[2px] font-bold">
              <span className="text-[#ff7a00]">ZAF</span>EX
            </span>
          </div>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-bold uppercase tracking-[1px] text-[#d4af37] flex items-center gap-1 hover:underline"
        >
          Store <ExternalLink size={12} />
        </a>
      </header>

      {/* Mobile Off-canvas Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <button
            type="button"
            aria-label="Close mobile menu"
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-[280px] max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#1a1a18] flex-col shrink-0">
        {sidebarContent}
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto w-full min-w-0">
        {children}
      </main>

      {/* Sign Out Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="relative bg-[#1a1a18] border border-[#333330] text-[#f5f0e8] rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl z-10 text-center animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4">
              <LogOut size={24} />
            </div>
            <h3 className="font-serif text-[20px] text-white font-bold">Sign Out</h3>
            <p className="text-[#9e968c] text-[13px] mt-2">
              Are you sure you want to sign out from the Zafex Admin Portal?
            </p>
            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-[#444] text-[#ccc] hover:text-white hover:bg-white/5 text-[12px] font-bold uppercase tracking-[1px] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[12px] font-bold uppercase tracking-[1px] transition cursor-pointer shadow"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
