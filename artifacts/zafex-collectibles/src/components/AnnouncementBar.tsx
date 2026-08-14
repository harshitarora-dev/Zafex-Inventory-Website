import React, { useEffect, useState } from 'react';

const ITEMS = [
  '✓ Authentic Handmade Products',
  '✓ Free Worldwide Shipping',
  '✓ Custom Orders Available',
  '✓ Trusted by Customers in 25+ Countries',
  '✓ Secure Payments',
];

const AnnouncementBar = () => {
  const [index, setIndex] = useState(0);
n  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % ITEMS.length), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="bg-[#9c1c1c] h-[40px] flex items-center">
      <div className="w-full text-center" role="status" aria-live="polite" aria-label="Site announcements">
        <span className="inline-block font-serif text-[12px] uppercase tracking-[1.5px] text-white transition-opacity duration-300">
          {ITEMS[index]}
        </span>
      </div>
    </div>
  );
};

export default AnnouncementBar;
