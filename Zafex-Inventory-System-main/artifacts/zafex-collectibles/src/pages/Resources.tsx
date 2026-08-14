import { Link } from 'wouter';

const resourceCards = [
  { label: 'Medieval Blog', href: '/cat/resources/medieval-blog' },
  { label: 'Buying Guides', href: '/resources/buying-guides' },
  { label: 'Chainmail Size Guide', href: '/resources/chainmail-size-guide' },
  { label: 'Helmet Size Guide', href: '/resources/helmet-size-guide' },
  { label: 'Leather Care Guide', href: '/resources/leather-care-guide' },
  { label: 'FAQ', href: '/resources/faq' },
];

const Resources = () => (
  <div className="min-h-screen bg-[#f5f0e8]">
    <section className="bg-[#cec3b5] px-4 py-14 text-center">
      <h1 className="font-serif text-[48px] font-light uppercase leading-none tracking-[0.1em] text-[#1a1208] sm:text-[60px]">
        Resources
      </h1>
    </section>
    <section className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-4 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
      {resourceCards.map((resource) => (
        <Link
          key={resource.label}
          href={resource.href}
          className="group flex min-h-[150px] flex-col items-center justify-center border border-[#d4cdc4] bg-[#e8e0d4] px-4 text-center transition-colors duration-300 hover:border-[#8b6914] hover:bg-[#e2d8ca]"
        >
          <span className="font-sans text-[11px] font-medium uppercase tracking-[1.5px] text-[#2a2016] transition-colors group-hover:text-[#5a3e00]">
            {resource.label}
          </span>
          <span className="mt-3 font-sans text-[10px] uppercase tracking-[2px] text-[#8b6914]/60 transition-colors group-hover:text-[#8b6914]">
            Shop →
          </span>
        </Link>
      ))}
    </section>
  </div>
);

export default Resources;