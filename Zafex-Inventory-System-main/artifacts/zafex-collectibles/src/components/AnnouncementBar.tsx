import React from 'react';

const ITEMS = [
  '✓ Authentic Handmade Products',
  '✓ Free Worldwide Shipping',
  '✓ Custom Orders Available',
  '✓ Trusted by Customers in 25+ Countries',
  '✓ Secure Payments',
];

const AnnouncementBar = () => {
  const text = ITEMS.join('   ');
  return (
    <div className="bg-[#9c1c1c] overflow-hidden h-[40px] flex items-center">
      <div
        className="group flex min-w-full whitespace-nowrap"
        role="status"
        aria-live="polite"
        aria-label="Site announcements"
      >
        <div className="flex animate-marquee-rtl items-center">
          <span className="inline-block pr-14 font-serif text-[12px] uppercase tracking-[1.5px] text-white">
            {text}
          </span>
          <span className="inline-block pr-14 font-serif text-[12px] uppercase tracking-[1.5px] text-white" aria-hidden>
            {text}
          </span>
        </div>
      </div>
      <style>{`
        @keyframes marquee-rtl {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-rtl {
          animation: marquee-rtl 24s linear infinite;
          will-change: transform;
        }
        .group:hover .animate-marquee-rtl {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default AnnouncementBar;
