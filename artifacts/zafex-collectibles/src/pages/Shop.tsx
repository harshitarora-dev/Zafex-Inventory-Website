import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useSearch } from 'wouter';
import {
  ChevronDown,
  Grid2X2,
  LayoutGrid,
  List,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { PRODUCTS } from '@/data/products';
import ProductCard from '@/components/ProductCard';

/* ─── Types ───────────────────────────────────────────────────────────── */

type View = 'grid-4' | 'grid-2' | 'list';
type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest';

interface PriceRange {
  id: string;
  label: string;
  min: number;
  max: number;
}

const PRICE_RANGES: PriceRange[] = [
  { id: 'under-2000',   label: 'Under ₹2,000',        min: 0,     max: 2000     },
  { id: '2000-5000',    label: '₹2,000 – ₹5,000',     min: 2000,  max: 5000     },
  { id: '5000-15000',   label: '₹5,000 – ₹15,000',    min: 5000,  max: 15000    },
  { id: 'above-15000',  label: 'Above ₹15,000',        min: 15000, max: Infinity },
];

const CATEGORIES = [
  { label: 'Weaponry',    cat: 'weaponry',    count: 0 },
  { label: 'Armour',      cat: 'armour',      count: 0 },
  { label: 'Clothing',    cat: 'clothing',    count: 0 },
  { label: 'Accessories', cat: 'accessories', count: 0 },
];

// Compute real category counts
CATEGORIES.forEach((c) => {
  c.count = PRODUCTS.filter((p) => p.cat === c.cat).length;
});

const SORT_LABELS: Record<SortOption, string> = {
  featured:  'FEATURED',
  'price-asc': 'PRICE: LOW TO HIGH',
  'price-desc': 'PRICE: HIGH TO LOW',
  newest:    'NEWEST',
};

/* ─── Epic Armoury–style Collapsible Filter Row ───────────────────────── */

function FilterSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children?: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#c8c4bc]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full justify-between items-center py-4 cursor-pointer group"
        aria-expanded={open}
      >
        <span className="font-sans text-[11px] font-medium uppercase tracking-[2px] text-[#1a1a18] group-hover:text-[#d4af37] transition-colors">
          {title}
        </span>
        <ChevronDown
          size={14}
          strokeWidth={1.5}
          className={`text-[#6b6b6b] transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && children && (
        <div className="pb-4">{children}</div>
      )}
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────────────── */

const Shop = () => {
  const queryString = useSearch();
  const searchParams = new URLSearchParams(queryString);
  const catParam  = searchParams.get('cat');
  const subParam  = searchParams.get('sub');
  const badgeParam = searchParams.get('badge');

  const [view, setView]                         = useState<View>('grid-4');
  const [sort, setSort]                         = useState<SortOption>('featured');
  const [selectedCats, setSelectedCats]         = useState<string[]>(catParam ? [catParam] : []);
  const [selectedPrices, setSelectedPrices]     = useState<string[]>([]);
  const [inStockOnly, setInStockOnly]           = useState(false);
  const [search, setSearch]                     = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortOpen, setSortOpen]                 = useState(false);
  const sortRef                                 = useRef<HTMLDivElement>(null);

  // Close sort dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── Toggle helpers ── */
  const toggleCat = (cat: string) =>
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );

  const togglePrice = (id: string) =>
    setSelectedPrices((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );

  /* ── Active filter chips ── */
  const activeChips: { label: string; onRemove: () => void }[] = [
    ...selectedCats.map((c) => ({
      label: CATEGORIES.find((x) => x.cat === c)?.label ?? c,
      onRemove: () => toggleCat(c),
    })),
    ...selectedPrices.map((id) => ({
      label: PRICE_RANGES.find((r) => r.id === id)?.label ?? id,
      onRemove: () => togglePrice(id),
    })),
    ...(inStockOnly ? [{ label: 'In Stock', onRemove: () => setInStockOnly(false) }] : []),
    ...(search ? [{ label: `"${search}"`, onRemove: () => setSearch('') }] : []),
  ];

  const clearAll = () => {
    setSelectedCats([]);
    setSelectedPrices([]);
    setInStockOnly(false);
    setSearch('');
  };

  /* ── Filter + Sort ── */
  const filteredProducts = useMemo(() => {
    let list = PRODUCTS.filter((p) => {
      // URL sub/badge params still respected
      if (subParam && p.sub !== subParam) return false;
      if (badgeParam && p.badge !== badgeParam) return false;

      // Category checkboxes
      if (selectedCats.length > 0 && !selectedCats.includes(p.cat)) return false;

      // Price ranges
      if (selectedPrices.length > 0) {
        const inRange = selectedPrices.some((id) => {
          const r = PRICE_RANGES.find((x) => x.id === id);
          return r ? p.price >= r.min && p.price < r.max : false;
        });
        if (!inRange) return false;
      }

      // In-stock filter
      if (inStockOnly && p.inStock === false) return false;

      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !p.name.toLowerCase().includes(q) &&
          !p.cat.toLowerCase().includes(q) &&
          !(p.desc ?? '').toLowerCase().includes(q) &&
          !(p.tags ?? []).some((t) => t.toLowerCase().includes(q))
        ) {
          return false;
        }
      }

      return true;
    });

    // Sort
    switch (sort) {
      case 'price-asc':  list = [...list].sort((a, b) => a.price - b.price); break;
      case 'price-desc': list = [...list].sort((a, b) => b.price - a.price); break;
      case 'newest':     list = [...list].filter((p) => p.badge === 'new').concat(list.filter((p) => p.badge !== 'new')); break;
      default: break;
    }

    return list;
  }, [catParam, subParam, badgeParam, selectedCats, selectedPrices, search, sort, inStockOnly]);

  /* ── Grid class ── */
  const gridClass =
    view === 'grid-4' ? 'grid-cols-2 lg:grid-cols-4 gap-[18px]' :
    view === 'grid-2' ? 'grid-cols-1 sm:grid-cols-2 gap-[18px]' :
    'grid-cols-1 gap-y-8';

  /* ── Sidebar JSX (reused for mobile sheet) ── */
  const sidebarContent = (
    <div className="flex flex-col border-t border-[#c8c4bc]">

      {/* AVAILABILITY */}
      <FilterSection title="Availability" defaultOpen={inStockOnly}>
        <div className="flex flex-col gap-2.5">
          {[
            { label: 'In Stock', value: true },
            { label: 'Out of Stock', value: false },
          ].map((opt) => (
            <label key={String(opt.value)} className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => setInStockOnly(inStockOnly === opt.value ? false : opt.value)}
                className={`w-[14px] h-[14px] border flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer ${
                  inStockOnly === opt.value
                    ? 'bg-[#1a1a18] border-[#1a1a18]'
                    : 'border-[#c8c4bc] group-hover:border-[#1a1a18]'
                }`}
              >
                {inStockOnly === opt.value && <div className="w-[7px] h-[7px] bg-white" />}
              </div>
              <span
                onClick={() => setInStockOnly(inStockOnly === opt.value ? false : opt.value)}
                className={`font-sans text-[12px] tracking-[0.5px] cursor-pointer transition-colors ${
                  inStockOnly === opt.value ? 'text-[#1a1a18] font-medium' : 'text-[#5a5650] group-hover:text-[#1a1a18]'
                }`}
              >
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* PRICE */}
      <FilterSection title="Price" defaultOpen={selectedPrices.length > 0}>
        <div className="flex flex-col gap-2.5">
          {PRICE_RANGES.map((range) => (
            <label key={range.id} className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => togglePrice(range.id)}
                className={`w-[14px] h-[14px] border flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer ${
                  selectedPrices.includes(range.id)
                    ? 'bg-[#1a1a18] border-[#1a1a18]'
                    : 'border-[#c8c4bc] group-hover:border-[#1a1a18]'
                }`}
              >
                {selectedPrices.includes(range.id) && <div className="w-[7px] h-[7px] bg-white" />}
              </div>
              <span
                onClick={() => togglePrice(range.id)}
                className={`font-sans text-[12px] tracking-[0.5px] cursor-pointer transition-colors ${
                  selectedPrices.includes(range.id) ? 'text-[#1a1a18] font-medium' : 'text-[#5a5650] group-hover:text-[#1a1a18]'
                }`}
              >
                {range.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* SIZE */}
      <FilterSection title="Size" />

      {/* COLOR */}
      <FilterSection title="Color" />

      {/* COLLECTION */}
      <FilterSection title="Collection" defaultOpen={selectedCats.length > 0}>
        <div className="flex flex-col gap-2.5">
          {CATEGORIES.map((item) => (
            <label key={item.cat} className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => toggleCat(item.cat)}
                className={`w-[14px] h-[14px] border flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer ${
                  selectedCats.includes(item.cat)
                    ? 'bg-[#1a1a18] border-[#1a1a18]'
                    : 'border-[#c8c4bc] group-hover:border-[#1a1a18]'
                }`}
              >
                {selectedCats.includes(item.cat) && <div className="w-[7px] h-[7px] bg-white" />}
              </div>
              <span
                onClick={() => toggleCat(item.cat)}
                className={`font-sans text-[12px] tracking-[0.5px] cursor-pointer transition-colors ${
                  selectedCats.includes(item.cat) ? 'text-[#1a1a18] font-medium' : 'text-[#5a5650] group-hover:text-[#1a1a18]'
                }`}
              >
                {item.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* PRODUCT TYPE */}
      <FilterSection title="Product Type" />

      {/* PRODUCT MATERIAL */}
      <FilterSection title="Product Material" />

      {/* Clear all */}
      {activeChips.length > 0 && (
        <button
          onClick={clearAll}
          className="mt-4 font-sans text-[11px] uppercase tracking-[2px] text-[#9c1c1c] hover:text-[#1a1a18] transition-colors text-left"
        >
          Clear All
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col w-full min-h-[100dvh] bg-[#f5f0e8]">
      {/* Hero Banner */}
      <section className="w-full bg-[#cec3b5] flex flex-col items-center justify-center text-center px-4 py-14">
        <div className="font-sans text-[10px] uppercase tracking-[2.5px] text-[#5a4a30]/70 mb-6 flex items-center justify-center gap-2">
          <Link href="/" className="hover:text-[#2a2016] transition-colors">HOME</Link>
          <span className="text-[#5a4a30]/40">/</span>
          <span className="text-[#2a2016]">
            {selectedCats.length === 1
              ? CATEGORIES.find((c) => c.cat === selectedCats[0])?.label?.toUpperCase()
              : 'SHOP'}
          </span>
        </div>
        <h1 className="font-serif text-[48px] sm:text-[60px] font-light text-[#1a1208] uppercase leading-none tracking-[0.1em]">
          {selectedCats.length === 1
            ? CATEGORIES.find((c) => c.cat === selectedCats[0])?.label?.toUpperCase()
            : 'ALL PRODUCTS'}
        </h1>
      </section>

      {/* Mobile filter toggle */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-[#d4cfc7]">
        <button
          onClick={() => setShowMobileFilters((v) => !v)}
          className="flex items-center gap-2 font-serif text-[11px] uppercase tracking-[1.5px] text-[#1a1a18]"
        >
          <SlidersHorizontal size={16} />
          Filters {activeChips.length > 0 && `(${activeChips.length})`}
        </button>
        <span className="font-sans text-[13px] text-[#6b6b6b]">
          <span className="text-[#1a1a18] font-semibold">{filteredProducts.length}</span> products
        </span>
      </div>

      {/* Mobile Filter Drawer */}
      {showMobileFilters && (
        <div className="lg:hidden bg-[#f5f0e8] border-b border-[#d4cfc7] px-4 py-6">
          {sidebarContent}
        </div>
      )}

      {/* Main Shop Area */}
      <section className="w-full max-w-[1680px] mx-auto px-5 py-12 flex flex-col lg:flex-row gap-10 border-t border-[#d4cfc7]">

        {/* LEFT Sidebar — sticky */}
        <aside className="hidden lg:block w-[220px] flex-shrink-0 self-start sticky top-4">
          {sidebarContent}
        </aside>

        {/* RIGHT Product Area */}
        <div className="flex-1 min-w-0 flex flex-col">

          {/* Top Bar */}
          <div className="flex flex-wrap items-center justify-between pb-5 mb-6 border-b border-[#d4cfc7] gap-4">
            <div className="font-sans text-[13px] text-[#6b6b6b]">
              <span className="text-[#1a1a18] font-semibold">{filteredProducts.length}</span> PRODUCTS
            </div>

            <div className="flex items-center gap-5">
              {/* View toggles */}
              <div className="hidden sm:flex items-center gap-1">
                <button
                  onClick={() => setView('grid-4')}
                  className={`p-1.5 ${view === 'grid-4' ? 'text-[#1a1a18]' : 'text-[#a39f97] hover:text-[#1a1a18]'}`}
                  aria-label="4-column grid"
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  onClick={() => setView('grid-2')}
                  className={`p-1.5 ${view === 'grid-2' ? 'text-[#1a1a18]' : 'text-[#a39f97] hover:text-[#1a1a18]'}`}
                  aria-label="2-column grid"
                >
                  <Grid2X2 size={18} />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-1.5 ${view === 'list' ? 'text-[#1a1a18]' : 'text-[#a39f97] hover:text-[#1a1a18]'}`}
                  aria-label="List view"
                >
                  <List size={18} />
                </button>
              </div>

              {/* Sort dropdown */}
              <div ref={sortRef} className="relative">
                <button
                  onClick={() => setSortOpen((v) => !v)}
                  className="flex items-center gap-2 font-sans text-[13px] text-[#1a1a18] border-b border-transparent hover:border-[#1a1a18] pb-0.5 transition-colors"
                >
                  <span className="font-serif text-[10px] uppercase tracking-[1px] text-[#6b6b6b] mr-1">SORT:</span>
                  {SORT_LABELS[sort]}
                  <ChevronDown size={14} className={`text-[#6b6b6b] transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                </button>
                {sortOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-[#d4cfc7] shadow-lg z-30 min-w-[200px]">
                    {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => { setSort(key); setSortOpen(false); }}
                        className={`block w-full text-left px-4 py-2.5 font-sans text-[13px] hover:bg-[#f5f0e8] transition-colors ${sort === key ? 'text-[#1a1a18] font-semibold' : 'text-[#4a4a4a]'}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Active filter chips */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {activeChips.map((chip, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1a1a18] text-white font-sans text-[12px]"
                >
                  {chip.label}
                  <button
                    onClick={chip.onRemove}
                    className="hover:text-[#d4af37] transition-colors"
                    aria-label={`Remove filter: ${chip.label}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              {activeChips.length > 1 && (
                <button
                  onClick={clearAll}
                  className="px-3 py-1 border border-[#d4cfc7] font-sans text-[12px] text-[#6b6b6b] hover:border-[#1a1a18] hover:text-[#1a1a18] transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
          )}

          {/* Product Grid */}
          {filteredProducts.length > 0 ? (
            <div className={`grid ${gridClass}`}>
              {filteredProducts.map((product, i) =>
                view === 'list' ? (
                  <Link
                    key={product.id}
                    href={`/shop/${product.id}`}
                    className="flex flex-col sm:flex-row gap-6 group hover:bg-white p-4 transition-colors border-b border-[#d4cfc7]"
                  >
                    <div className="w-full sm:w-[180px] shrink-0 bg-[#ede9e3] relative overflow-hidden aspect-[4/5]">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      {product.badge && (
                        <div className={`absolute top-0 left-0 px-3 py-1 font-serif text-[10px] uppercase tracking-[1px] z-10 ${
                          product.badge === 'new' ? 'bg-[#1a1a18] text-white' : 'bg-[#d4af37] text-[#1a1a18]'
                        }`}>
                          {product.badge}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 py-2">
                      <span className="font-serif text-[10px] text-[#6b6b6b] uppercase tracking-[1px] mb-2 block">{product.cat}</span>
                      <h3 className="font-serif text-[18px] font-bold text-[#1a1a18] group-hover:text-[#d4af37] transition-colors leading-tight mb-2">
                        {product.name}
                      </h3>
                      <p className="font-sans text-[16px] text-[#d4af37] font-semibold mb-4">
                        ₹{product.price.toLocaleString('en-IN')}
                      </p>
                      <p className="font-sans text-[13px] text-[#4a4a4a] leading-relaxed mb-5 line-clamp-2">
                        {product.desc || 'An exquisite piece crafted with historical accuracy and premium materials.'}
                      </p>
                      <button className="bg-[#1a1a18] text-white font-serif text-[11px] uppercase font-bold tracking-[2px] px-7 py-2.5 hover:bg-[#d4af37] hover:text-[#1a1a18] transition-colors">
                        + ADD TO CART
                      </button>
                    </div>
                  </Link>
                ) : (
                  <ProductCard key={product.id} product={product} index={i} />
                ),
              )}
            </div>
          ) : (
            <div className="text-center py-24">
              <h3 className="font-serif text-[22px] text-[#1a1a18] mb-3">No products found</h3>
              <p className="font-sans text-[#6b6b6b] mb-8">Try adjusting your filters or browse all categories.</p>
              <button
                onClick={clearAll}
                className="bg-[#1a1a18] text-white font-serif text-[12px] uppercase font-bold tracking-[2px] px-8 py-3.5 hover:bg-[#d4af37] hover:text-[#1a1a18] transition-colors"
              >
                CLEAR FILTERS
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Shop;
