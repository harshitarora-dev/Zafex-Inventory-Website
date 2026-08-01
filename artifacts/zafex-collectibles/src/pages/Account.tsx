import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { authUpdateProfile, authUpdatePassword, getOrders } from '@/lib/api';
import { Package, User as UserIcon, Lock, ChevronRight } from 'lucide-react';

type Tab = 'profile' | 'orders' | 'security';

const inputCls =
  'w-full h-[48px] border border-[#d4cfc7] px-4 font-sans text-[14px] focus:outline-none focus:border-[#d4af37] bg-[#faf8f3]';
const labelCls =
  'font-serif text-[11px] uppercase tracking-[1px] text-[#1a1a18] font-bold block mb-2';

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  packed:    'bg-indigo-100 text-indigo-800',
  shipped:   'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function Account() {
  const { user, isLoggedIn, isLoading, refresh, logout } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('profile');

  // Profile form
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  // Security form
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [savingPw, setSavingPw] = useState(false);

  const { data: ordersData } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
    enabled: isLoggedIn && tab === 'orders',
    staleTime: 30 * 1000,
  });

  // Populate profile form when user loads
  useEffect(() => {
    if (user) {
      setProfile({ name: user.name, email: user.email, phone: user.phone ?? '' });
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex flex-col items-center justify-center gap-6 px-4">
        <h1 className="font-serif text-[28px] text-[#1a1a18] uppercase">
          Please sign in to view your account
        </h1>
        <Link
          href="/login"
          className="bg-[#1a1a18] text-white font-serif text-[12px] uppercase font-bold tracking-[2px] px-8 py-4 hover:bg-[#d4af37] hover:text-[#1a1a18] transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await authUpdateProfile({
        name: profile.name,
        email: profile.email,
        phone: profile.phone || undefined,
      });
      refresh();
      toast({ title: 'Profile updated', description: 'Your details have been saved.' });
    } catch (err: unknown) {
      toast({
        title: 'Failed to update profile',
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.next !== pw.confirm) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (pw.next.length < 8) {
      toast({ title: 'Password must be at least 8 characters', variant: 'destructive' });
      return;
    }
    setSavingPw(true);
    try {
      await authUpdatePassword({ currentPassword: pw.current, newPassword: pw.next });
      setPw({ current: '', next: '', confirm: '' });
      toast({ title: 'Password changed', description: 'Your password has been updated.' });
    } catch (err: unknown) {
      toast({
        title: 'Failed to change password',
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setSavingPw(false);
    }
  };

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'profile', label: 'Profile', icon: UserIcon },
    { key: 'orders',  label: 'My Orders', icon: Package },
    { key: 'security', label: 'Security', icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <section className="w-full bg-[#cec3b5] flex flex-col items-center justify-center text-center px-4 py-14">
        <h1 className="font-serif text-[48px] font-light text-[#1a1208] uppercase tracking-[0.1em]">
          My Account
        </h1>
        <p className="font-sans text-[13px] text-[#5a4a30]/70 mt-2">
          Welcome back, {user?.name}
        </p>
      </section>

      <div className="max-w-[1000px] mx-auto px-5 py-12 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-[220px] flex-shrink-0">
          <nav className="bg-white border border-[#d4cfc7]">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`w-full flex items-center justify-between px-5 py-4 font-sans text-[13px] border-b border-[#d4cfc7] last:border-b-0 transition-colors ${
                  tab === key
                    ? 'bg-[#1a1a18] text-white'
                    : 'text-[#4a4a4a] hover:bg-[#f5f0e8] hover:text-[#1a1a18]'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon size={16} strokeWidth={1.8} />
                  {label}
                </span>
                <ChevronRight size={14} className="opacity-60" />
              </button>
            ))}
            <button
              onClick={async () => {
                await logout();
                navigate('/');
              }}
              className="w-full flex items-center px-5 py-4 font-sans text-[13px] text-[#9c1c1c] hover:bg-red-50 transition-colors"
            >
              Sign Out
            </button>
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Profile */}
          {tab === 'profile' && (
            <div className="bg-white border border-[#d4cfc7] p-6">
              <h2 className="font-serif text-[20px] font-bold text-[#1a1a18] uppercase mb-6">
                Profile Details
              </h2>
              <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
                <div>
                  <label className={labelCls}>Full Name</label>
                  <input
                    value={profile.name}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                    required
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Email Address</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                    required
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Phone (optional)</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                    className={inputCls}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="h-[48px] bg-[#1a1a18] text-white font-serif text-[12px] uppercase font-bold tracking-[2px] hover:bg-[#d4af37] hover:text-[#1a1a18] transition-colors disabled:opacity-60 self-start px-8"
                >
                  {savingProfile ? 'Saving…' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* Orders */}
          {tab === 'orders' && (
            <div className="bg-white border border-[#d4cfc7]">
              <div className="p-6 border-b border-[#d4cfc7]">
                <h2 className="font-serif text-[20px] font-bold text-[#1a1a18] uppercase">
                  My Orders
                </h2>
              </div>
              {!ordersData ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-6 h-6 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : ordersData.orders.length === 0 ? (
                <div className="text-center py-16">
                  <Package size={40} className="text-[#d4af37] mx-auto mb-4" />
                  <p className="font-sans text-[14px] text-[#6b6b6b]">No orders yet.</p>
                  <Link
                    href="/shop"
                    className="inline-block mt-4 font-serif text-[12px] uppercase tracking-[1.5px] text-[#d4af37] hover:underline"
                  >
                    Start Shopping →
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[#d4cfc7]">
                  {ordersData.orders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/orders/${order.id}`}
                      className="flex items-center justify-between px-6 py-5 hover:bg-[#faf8f3] transition-colors group"
                    >
                      <div>
                        <div className="font-serif text-[14px] font-bold text-[#1a1a18] mb-1">
                          Order #{order.id}
                        </div>
                        <div className="font-sans text-[12px] text-[#6b6b6b]">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`px-2.5 py-1 rounded-full font-sans text-[11px] font-medium capitalize ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'}`}
                        >
                          {order.status}
                        </span>
                        <span className="font-serif text-[14px] font-bold text-[#d4af37]">
                          ₹{order.totalAmount.toLocaleString('en-IN')}
                        </span>
                        <ChevronRight
                          size={16}
                          className="text-[#6b6b6b] group-hover:text-[#1a1a18] transition-colors"
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Security */}
          {tab === 'security' && (
            <div className="bg-white border border-[#d4cfc7] p-6">
              <h2 className="font-serif text-[20px] font-bold text-[#1a1a18] uppercase mb-6">
                Change Password
              </h2>
              <form onSubmit={handleChangePassword} className="flex flex-col gap-5 max-w-[400px]">
                <div>
                  <label className={labelCls}>Current Password</label>
                  <input
                    type="password"
                    value={pw.current}
                    onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
                    required
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>New Password</label>
                  <input
                    type="password"
                    value={pw.next}
                    onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
                    required
                    minLength={8}
                    className={inputCls}
                    placeholder="Min. 8 characters"
                  />
                </div>
                <div>
                  <label className={labelCls}>Confirm New Password</label>
                  <input
                    type="password"
                    value={pw.confirm}
                    onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
                    required
                    className={inputCls}
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingPw}
                  className="h-[48px] bg-[#1a1a18] text-white font-serif text-[12px] uppercase font-bold tracking-[2px] hover:bg-[#d4af37] hover:text-[#1a1a18] transition-colors disabled:opacity-60 self-start px-8"
                >
                  {savingPw ? 'Updating…' : 'Update Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
