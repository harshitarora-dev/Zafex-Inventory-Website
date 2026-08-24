import React from 'react';
import { useCompare } from '@/contexts/CompareContext';
import { Scale, X, ArrowRight } from 'lucide-react';

export const CompareDock: React.FC = () => {
  const { compareItems, setIsCompareOpen, clearCompare } = useCompare();

  if (compareItems.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[250] flex items-center gap-3 bg-[#1a1208] text-white px-5 py-3 rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.35)] border border-[#c6a767] animate-in slide-in-from-bottom-5">
      <button
        type="button"
        onClick={() => setIsCompareOpen(true)}
        className="flex items-center gap-2.5 font-sans text-[11px] font-bold uppercase tracking-[1.5px] text-[#c6a767] hover:text-white transition cursor-pointer"
      >
        <div className="relative">
          <Scale size={18} className="text-[#c6a767]" />
          <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#c6a767] text-[9px] font-bold text-[#14100c]">
            {compareItems.length}
          </span>
        </div>
        <span>View Comparison ({compareItems.length}/4)</span>
        <ArrowRight size={13} />
      </button>
      <div className="h-4 w-[1px] bg-white/20 ml-1" />
      <button
        type="button"
        onClick={clearCompare}
        className="text-white/60 hover:text-[#a91f22] p-1 rounded-full hover:bg-white/10 transition cursor-pointer"
        title="Clear comparison list"
        aria-label="Clear compare list"
      >
        <X size={15} />
      </button>
    </div>
  );
};
