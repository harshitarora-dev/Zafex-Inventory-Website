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
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="Zafex"
            className="w-[64px] h-[64px] object-contain rounded-lg bg-white p-1 mx-auto mb-3 shadow"
          />
          <h1 className="font-serif text-[28px] tracking-[4px] uppercase text-[#f5f0e8]">
            <span className="text-[#ff7a00]">ZAF</span><span>EX</span>
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
              <div className="bg-[#3a1a1a] border border-[#6b2a2a] text-red-300 text-[12px] px-3.5 py-2.5 rounded text-center font-medium">
                {error.toLowerCase().includes('default is') ? 'Wrong password' : error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#d4af37] hover:bg-[#c09a2c] disabled:opacity-60 text-[#1a1a18] font-serif font-bold text-[11px] uppercase tracking-[2px] py-3 rounded transition-colors cursor-pointer"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
