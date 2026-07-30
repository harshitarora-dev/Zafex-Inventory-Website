import React from 'react';

const ITEMS = [
  '✦ FREE SHIPPING ON ORDERS ABOVE ₹5,000',
  '✦ HANDCRAFTED IN MEERUT, INDIA',
  '✦ AUTHENTIC QUALITY GUARANTEED',
  '✦ CUSTOM ORDERS WELCOME',
  '✦ WORLDWIDE SHIPPING AVAILABLE',
  '✦ 100% POSITIVE FEEDBACK ON EBAY',
];

const AnnouncementBar = () => {
  const text = ITEMS.join('   ');
  return (
    <div className="bg-[#9c1c1c] overflow-hidden h-[36px] flex items-center">
      <div className="flex whitespace-nowrap animate-marquee-rtl">
        {/* Two identical copies so the loop is seamless */}
        <span className="inline-block pr-12 font-serif text-[11px] uppercase tracking-[2px] text-white">
          {text}
        </span>
        <span className="inline-block pr-12 font-serif text-[11px] uppercase tracking-[2px] text-white" aria-hidden>
          {text}
        </span>
      </div>
      <style>{`
        @keyframes marquee-rtl {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-rtl {
          animation: marquee-rtl 28s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default AnnouncementBar;
