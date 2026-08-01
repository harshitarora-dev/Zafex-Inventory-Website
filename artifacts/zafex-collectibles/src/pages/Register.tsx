import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const [, navigate] = useLocation();
  const { register } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (form.password.length < 8) {
      toast({ title: 'Password must be at least 8 characters', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.phone, form.password);
      toast({ title: 'Account created!', description: 'Welcome to Zafex Collectibles.' });
      navigate('/account');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      toast({ title: 'Registration failed', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const field = (label: string, name: string, type = 'text', placeholder = '') => (
    <div>
      <label className="font-serif text-[11px] uppercase tracking-[1px] text-[#1a1a18] font-bold block mb-2">
        {label}
      </label>
      <input
        type={type}
        value={form[name as keyof typeof form]}
        onChange={(e) => update(name, e.target.value)}
        required={name !== 'phone'}
        className="w-full h-[48px] border border-[#d4cfc7] px-4 font-sans text-[14px] focus:outline-none focus:border-[#d4af37] bg-[#faf8f3]"
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-[480px]">
        <div className="text-center mb-10">
          <span className="font-serif text-[11px] uppercase tracking-[3px] text-[#d4af37]">Join Us</span>
          <h1 className="font-serif text-[38px] font-bold text-[#1a1a18] mt-2 uppercase">Create Account</h1>
          <div className="w-10 h-[3px] bg-[#9c1c1c] mx-auto mt-4" />
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-[#d4cfc7] p-8 flex flex-col gap-5">
          {field('Full Name', 'name', 'text', 'John Doe')}
          {field('Email Address', 'email', 'email', 'you@email.com')}
          {field('Phone (optional)', 'phone', 'tel', '+91 98765 43210')}

          <div>
            <label className="font-serif text-[11px] uppercase tracking-[1px] text-[#1a1a18] font-bold block mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                required
                minLength={8}
                className="w-full h-[48px] border border-[#d4cfc7] px-4 pr-12 font-sans text-[14px] focus:outline-none focus:border-[#d4af37] bg-[#faf8f3]"
                placeholder="Min. 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b6b]"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="font-serif text-[11px] uppercase tracking-[1px] text-[#1a1a18] font-bold block mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={form.confirm}
              onChange={(e) => update('confirm', e.target.value)}
              required
              className="w-full h-[48px] border border-[#d4cfc7] px-4 font-sans text-[14px] focus:outline-none focus:border-[#d4af37] bg-[#faf8f3]"
              placeholder="Repeat password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-[52px] bg-[#1a1a18] text-white font-serif text-[12px] uppercase font-bold tracking-[2px] hover:bg-[#d4af37] hover:text-[#1a1a18] transition-colors disabled:opacity-60"
          >
            {loading ? 'Creating Account…' : 'Create Account'}
          </button>

          <p className="text-center font-sans text-[13px] text-[#6b6b6b]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#d4af37] hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
