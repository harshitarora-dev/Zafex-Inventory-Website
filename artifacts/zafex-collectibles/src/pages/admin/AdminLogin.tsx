import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { adminLogin } from '@/lib/adminApi';

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminLogin(password);
      navigate('/admin/products');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#1a1a18] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-[#d4af37] text-2xl font-serif font-bold tracking-widest">✦</span>
          </div>
          <h1 className="font-serif text-[28px] tracking-[4px] uppercase text-[#f5f0e8]">
            ZAFEX
          </h1>
          <p className="text-[#8a8278] text-[11px] tracking-[3px] uppercase mt-1">
            Admin Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#242420] border border-[#333330] rounded-lg p-8">
          <h2 className="text-[#f5f0e8] text-[13px] font-semibold uppercase tracking-[2px] mb-6">
            Sign In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[#8a8278] text-[11px] uppercase tracking-[1px] mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                className="w-full bg-[#1a1a18] border border-[#3a3a36] text-[#f5f0e8] text-[14px] px-4 py-3 rounded outline-none focus:border-[#d4af37] transition-colors placeholder:text-[#4a4a46]"
                placeholder="Enter password"
              />
            </div>

            {error && (
              <p className="text-red-400 text-[12px]">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#d4af37] hover:bg-[#c09a2c] disabled:opacity-60 text-[#1a1a18] font-serif font-bold text-[11px] uppercase tracking-[2px] py-3 rounded transition-colors"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-[#4a4a46] text-[11px] mt-6">
          Default password: <span className="text-[#6a6a66]">admin</span>
          {' · '}
          Set <code className="text-[#6a6a66]">ADMIN_PASSWORD</code> env var to change
        </p>
      </div>
    </div>
  );
}
