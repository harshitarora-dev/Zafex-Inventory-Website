import React from 'react';
import { Link } from 'wouter';
import { NAV_CATEGORIES } from '@/data/categories';
import { ChevronDown, Grid2X2, LayoutGrid, List, SlidersHorizontal } from 'lucide-react';

interface CategoryPageProps {
  categorySlug: string;
  subSlug?: string;
}

const filterNames = ['Availability', 'Price', 'Size', 'Color', 'Collection', 'Product Type'];

function CategoryFilterSidebar() {
  const [openFilter, setOpenFilter] = React.useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const filters = (
    <div className="bg-[#f1ede5] px-7 py-7">
      <div className="mb-7 flex items-center gap-4 border-b border-[#d2cbc0] pb-6">
        <button aria-label="Grid view" className="text-[#1a1a18]"><Grid2X2 size={21} strokeWidth={1.5} /></button>
        <button aria-label="Compact grid view" className="text-[#1a1a18]"><LayoutGrid size={21} strokeWidth={1.5} /></button>
        <button aria-label="List view" className="text-[#777168] transition-colors hover:text-[#1a1a18]"><List size={23} strokeWidth={1.5} /></button>
      </div>
      <div className="space-y-0">
        {filterNames.map((filter) => (
          <div key={filter} className="border-b border-[#d2cbc0]">
            <button
              onClick={() => setOpenFilter(openFilter === filter ? null : filter)}
              className="flex w-full items-center justify-between py-6 text-left font-sans text-[12px] uppercase tracking-[3px] text-[#29251f]"
              aria-expanded={openFilter === filter}
            >
              {filter}
              <ChevronDown size={16} strokeWidth={1.5} className={`transition-transform ${openFilter === filter ? 'rotate-180' : ''}`} />
            </button>
            {openFilter === filter && (
              <div className="pb-5 font-sans text-[12px] leading-7 text-[#6b645b]">
                <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" className="accent-[#8b6914]" /> All {filter.toLowerCase()}</label>
                <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" className="accent-[#8b6914]" /> Featured selection</label>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="mx-6 mb-4 flex items-center gap-2 border border-[#cfc7bb] bg-[#f1ede5] px-4 py-3 font-sans text-[11px] uppercase tracking-[2px] lg:hidden"
      >
        <SlidersHorizontal size={15} /> Filters
      </button>
      {mobileOpen && <div className="mx-6 mb-8 lg:hidden">{filters}</div>}
      <aside className="hidden w-[250px] shrink-0 lg:block">
        <div className="sticky top-4">{filters}</div>
      </aside>
    </>
  );
}

const CategoryPage = ({ categorySlug, subSlug }: CategoryPageProps) => {
  const category = NAV_CATEGORIES.find((c) => c.slug === categorySlug);
  const sub = subSlug ? category?.subs.find((s) => s.slug === subSlug) : null;
  const cardVisualsByCategory: Record<string, { image: string; description: string }[]> = {
    collections: [
      { image: '/images/full-body-armor.png', description: 'Iconic pieces chosen by our collectors.' },
      { image: '/images/sword.png', description: 'Freshly forged pieces from the latest drop.' },
      { image: '/images/leather-breastplates.png', description: 'Craftsman favourites with a distinctive edge.' },
      { image: '/images/gambeson.png', description: 'Made slowly, carefully, and entirely by hand.' },
      { image: '/images/horn-mug.png', description: 'Rare finds for discerning enthusiasts.' },
      { image: '/images/viking-shield.png', description: 'Festival-ready details and bold character.' },
      { image: '/images/gladitor-helmet.png', description: 'Inspired by cinema, grounded in history.' },
      { image: '/images/chainmail-shirt.png', description: 'Faithful recreations for modern collectors.' },
    ],
    wholesale: [
      { image: '/images/full-body-armor.png', description: 'A dedicated program for trusted retail partners.' },
      { image: '/images/leather-breastplates.png', description: 'Distinctive products made under your label.' },
      { image: '/images/breastplates.png', description: 'Reliable production for ambitious collections.' },
      { image: '/images/chainmail-shirt.png', description: 'Volume orders with artisan-level finishing.' },
      { image: '/images/viking-shield.png', description: 'Grow your range with dependable distribution.' },
    ],
    'custom-orders': [
      { image: '/images/full-body-armor.png', description: 'Bespoke armor built around your vision.' },
      { image: '/images/chainmail-shirt.png', description: 'Tailored chainmail for a precise fit.' },
      { image: '/images/gladitor-helmet.png', description: 'Signature helmets shaped for your story.' },
      { image: '/images/leather-breastplates.png', description: 'Custom leatherwork with character and purpose.' },
      { image: '/images/sword.png', description: 'Museum-worthy replicas made to commission.' },
    ],
    'about-us': [
      { image: '/images/full-body-armor.png', description: 'The people and place behind every piece.' },
      { image: '/images/gambeson.png', description: 'A closer look at our workshop practice.' },
      { image: '/images/breastplates.png', description: 'From raw material to finished craft.' },
      { image: '/images/chainmail-shirt.png', description: 'Meet the artisans who keep the tradition alive.' },
      { image: '/images/viking-shield.png', description: 'Our promise of quality, worldwide.' },
      { image: '/images/sword.png', description: 'Shipping history and heritage beyond borders.' },
    ],
    resources: [
      { image: '/images/sword.png', description: 'Stories, history, and inspiration from the forge.' },
      { image: '/images/full-body-armor.png', description: 'Helpful advice for choosing your next piece.' },
      { image: '/images/chainmail-shirt.png', description: 'Find the right fit with confidence.' },
      { image: '/images/gladitor-helmet.png', description: 'Measure for the right helmet and comfort.' },
      { image: '/images/leather-breastplates.png', description: 'Keep your leather looking its best.' },
      { image: '/images/horn-mug.png', description: 'Quick answers to common questions.' },
    ],
  };
  const cardVisuals = cardVisualsByCategory[categorySlug] ?? cardVisualsByCategory.collections;
  const introByCategory: Record<string, string> = {
    collections: 'Explore our considered edit of Zafex pieces — from new releases and staff favourites to historically faithful reproductions.',
    wholesale: 'Partner with Zafex for dependable handcrafted products, flexible production, and long-term support.',
    'custom-orders': 'Bring your idea to life with a considered custom commission shaped by our master artisans.',
    'about-us': 'Discover the people, workshop, and values behind every Zafex Collectibles piece.',
    resources: 'Explore guides, stories, and practical resources to help you choose and care for your collection.',
  };

  const pageTitle = sub ? sub.label : (category?.label ?? 'Category');
  const parentLabel = category?.label ?? '';

  return (
    <div className="flex flex-col w-full min-h-[100dvh] bg-[#f5f0e8]">
      {/* ── Hero Banner ─────────────────────────────────────────── */}
      <section className="w-full bg-[#cec3b5] flex min-h-[190px] flex-col items-center justify-center text-center px-4 py-14 sm:min-h-[220px]">
        {/* breadcrumb */}
        <div className="font-sans text-[10px] uppercase tracking-[2.5px] text-[#5a4a30]/70 mb-6 flex items-center gap-2 flex-wrap justify-center">
          <Link href="/" className="hover:text-[#2a2016] transition-colors">
            HOME
          </Link>
          <span className="text-[#5a4a30]/40">/</span>
          {sub ? (
            <>
              <Link
                href={`/cat/${categorySlug}`}
                className="hover:text-[#2a2016] transition-colors"
              >
                {parentLabel.toUpperCase()}
              </Link>
              <span className="text-[#5a4a30]/40">/</span>
              <span className="text-[#2a2016]">{sub.label.toUpperCase()}</span>
            </>
          ) : (
            <span className="text-[#2a2016]">{parentLabel.toUpperCase()}</span>
          )}
        </div>

        <h1 className="font-serif text-[48px] sm:text-[60px] font-light text-[#1a1208] uppercase leading-none tracking-[0.1em]">
          {pageTitle}
        </h1>
      </section>

      <div className="mx-auto w-full max-w-[1440px] px-0 py-10 lg:flex lg:items-start lg:gap-8 lg:px-6 lg:py-16">
        <CategoryFilterSidebar />
        <main className="min-w-0 flex-1">
          {/* ── Category-level: show subcategory tiles ──────────────── */}
          {!sub && category && (
            <section className="w-full px-6 py-6 sm:px-0 sm:py-4">
          <div className="mb-12 max-w-2xl">
            <p className="font-serif text-[11px] uppercase tracking-[3px] text-[#b58a16]">CURATED FOR YOU</p>
            <p className="mt-4 font-sans text-[15px] leading-relaxed text-[#625b51]">
              {introByCategory[categorySlug] ?? 'Explore the Zafex collection, carefully crafted for collectors and history enthusiasts.'}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {category.subs.map((s, index) => (
              <Link
                key={s.slug}
                href={`/cat/${category.slug}/${s.slug}`}
                className="group relative flex min-h-[265px] overflow-hidden border border-[#bdb2a2] bg-[#29231d] p-6 text-left shadow-[0_10px_30px_rgba(40,27,12,0.08)] transition-all duration-500 hover:-translate-y-1 hover:border-[#b58a16] hover:shadow-[0_18px_38px_rgba(40,27,12,0.18)]"
              >
                <>
                    <img src={cardVisuals[index % cardVisuals.length].image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-65 transition-transform duration-700 group-hover:scale-110 group-hover:opacity-80" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#140f0b] via-[#140f0b]/45 to-transparent" />
                    <span className="relative z-10 font-serif text-[12px] tracking-[2px] text-[#d8b75f]">{String(index + 1).padStart(2, '0')}</span>
                    <div className="relative z-10 mt-auto">
                      <span className="font-serif text-[19px] font-medium uppercase tracking-[1px] text-white">{s.label}</span>
                      <p className="mt-2 max-w-[210px] font-sans text-[11px] leading-relaxed text-white/70">{cardVisuals[index % cardVisuals.length].description}</p>
                      <span className="mt-4 inline-block border-b border-[#d8b75f] pb-1 font-sans text-[10px] font-bold uppercase tracking-[2px] text-[#d8b75f]">Explore →</span>
                    </div>
                </>
              </Link>
            ))}
          </div>
            </section>
          )}

          {/* ── Subcategory-level: product grid area ────────────────── */}
          {sub && (
            <section className="w-full px-6 py-6 sm:px-0 sm:py-4">
          {/* subcategory sibling links */}
          {category && (
            <div className="flex flex-wrap gap-2 mb-12">
              {category.subs.map((s) => (
                <Link
                  key={s.slug}
                  href={`/cat/${category.slug}/${s.slug}`}
                  className={`font-serif text-[11px] uppercase tracking-[1.5px] px-4 py-2 border transition-colors ${
                    s.slug === subSlug
                      ? 'bg-[#1a1a18] text-[#d4af37] border-[#1a1a18]'
                      : 'border-[#c8c4bc] text-[#4a4a4a] hover:border-[#1a1a18] hover:text-[#1a1a18]'
                  }`}
                >
                  {s.label}
                </Link>
              ))}
            </div>
          )}

          {/* empty-state product grid placeholder */}
          <div className="border border-dashed border-[#c8c4bc] rounded-none py-28 flex flex-col items-center justify-center text-center px-4">
            <div className="w-[48px] h-[3px] bg-[#d4af37] mb-8" />
            <h3 className="font-serif text-[22px] text-[#1a1a18] mb-3">
              {sub.label}
            </h3>
            <p className="font-sans text-[14px] text-[#6b6b6b] max-w-sm leading-relaxed mb-8">
              Our artisans are preparing this collection. New pieces are added regularly — check
              back soon or contact us for bespoke commissions.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/shop"
                className="bg-[#1a1a18] text-white font-serif text-[11px] uppercase font-bold tracking-[2px] px-8 py-3.5 hover:bg-[#d4af37] hover:text-[#1a1a18] transition-colors"
              >
                BROWSE ALL PRODUCTS
              </Link>
              <Link
                href="/contact"
                className="border border-[#1a1a18] text-[#1a1a18] font-serif text-[11px] uppercase font-bold tracking-[2px] px-8 py-3.5 hover:bg-[#1a1a18] hover:text-white transition-colors"
              >
                ENQUIRE NOW
              </Link>
            </div>
          </div>
            </section>
          )}
        </main>
      </div>

      {/* ── Other categories ────────────────────────────────────── */}
      <section className="w-full bg-[#e8e0d4] border-t border-[#d4cdc4] py-10 mt-auto">
        <div className="max-w-[1280px] mx-auto px-6">
          <p className="font-sans text-[10px] uppercase tracking-[3px] text-[#5a4a30]/60 mb-5 text-center">
            EXPLORE MORE CATEGORIES
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {NAV_CATEGORIES.filter((c) => c.slug !== categorySlug).map((c) => (
              <Link
                key={c.slug}
                href={`/cat/${c.slug}`}
                className="font-sans text-[10px] font-medium uppercase tracking-[1.5px] text-[#5a4a30] hover:text-[#2a2016] transition-colors px-3 py-1 border border-[#c8bfb0] hover:border-[#5a4a30]"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CategoryPage;
