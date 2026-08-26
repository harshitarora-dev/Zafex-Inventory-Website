import React from 'react';
import { Compass, Home, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-lg w-full bg-[#faf8f4] border border-[#d8d0c2] rounded-3xl p-8 sm:p-12 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#1a1208] text-[#d4af37] flex items-center justify-center mx-auto shadow-md border border-[#d4af37]/40 animate-pulse">
          <Compass size={36} />
        </div>

        <div className="space-y-3">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[3px] text-[#8b6914] block">
            LOST IN THE REALMS
          </span>
          <h1 className="font-serif text-[42px] sm:text-[56px] font-bold text-[#1a1208] uppercase leading-none tracking-[2px]">
            404
          </h1>
          <h2 className="font-serif text-[18px] sm:text-[22px] font-semibold text-[#1a1208] uppercase tracking-[1px]">
            This Path Has Been Lost To History
          </h2>
          <p className="font-sans text-[13px] sm:text-[14px] text-[#6b6255] leading-relaxed max-w-sm mx-auto">
            The page you seek may have been moved, renamed, or vanished into the mists of time.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1a1a18] hover:bg-[#d4af37] text-white hover:text-[#1a1208] font-serif text-[11px] uppercase font-bold tracking-[1.5px] rounded-xl transition duration-200 shadow"
          >
            <Home size={14} /> Return to Home
          </Link>

          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-[#ede7dd] text-[#1a1208] border border-[#d4cdc4] font-serif text-[11px] uppercase font-bold tracking-[1.5px] rounded-xl transition duration-200"
          >
            <ShoppingBag size={14} /> Browse Collection
          </Link>
        </div>
      </div>
    </div>
  );
}
