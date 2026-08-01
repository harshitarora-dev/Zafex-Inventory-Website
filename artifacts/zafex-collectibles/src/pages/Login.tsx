import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password, rememberMe);
      toast({ title: 'Welcome back!', description: 'You are now logged in.' });
      navigate('/account');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      toast({ title: 'Login failed', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-[440px]">
        <div className="text-center mb-10">
          <span className="font-serif text-[11px] uppercase tracking-[3px] text-[#d4af37]">Your Account</span>
          <h1 className="font-serif text-[38px] font-bold text-[#1a1a18] mt-2 uppercase">Sign In</h1>
          <div className="w-10 h-[3px] bg-[#9c1c1c] mx-auto mt-4" />
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-[#d4cfc7] p-8 flex flex-col gap-5">
          <div>
            <label className="font-serif text-[11px] uppercase tracking-[1px] text-[#1a1a18] font-bold block mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-[48px] border border-[#d4cfc7] px-4 font-sans text-[14px] focus:outline-none focus:border-[#d4af37] bg-[#faf8f3]"
              placeholder="you@email.com"
            />
          </div>

          <div>
            <label className="font-serif text-[11px] uppercase tracking-[1px] text-[#1a1a18] font-bold block mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-[48px] border border-[#d4cfc7] px-4 pr-12 font-sans text-[14px] focus:outline-none focus:border-[#d4af37] bg-[#faf8f3]"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b6b] hover:text-[#1a1a18]"
                aria-label="Toggle password visibility"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 accent-[#1a1a18]"
            />
            <span className="font-sans text-[13px] text-[#4a4a4a]">Remember me for 30 days</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="h-[52px] bg-[#1a1a18] text-white font-serif text-[12px] uppercase font-bold tracking-[2px] hover:bg-[#d4af37] hover:text-[#1a1a18] transition-colors disabled:opacity-60"
          >
            {loading ? 'Signing In…' : 'Sign In'}
          </button>

          <p className="text-center font-sans text-[13px] text-[#6b6b6b]">
            Don't have an account?{' '}
            <Link href="/register" className="text-[#d4af37] hover:underline font-medium">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
