import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'wouter';
import { NAV_CATEGORIES } from '@/data/categories';
import { PRODUCTS, type Product as StaticProduct } from '@/data/products';
import { useQuery } from '@tanstack/react-query';
import { getProducts, type Product } from '@/lib/api';
import { useCurrency } from '@/contexts/CurrencyContext';
import ProductCard from '@/components/ProductCard';
import {
  ChevronDown,
  Grid2X2,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  RotateCcw,
} from 'lucide-react';

interface CategoryPageProps {
  categorySlug: string;
  subSlug?: string;
}

type ViewMode = 'grid-4' | 'grid-2' | 'list';

const PRICE_RANGES = [
  { id: 'under-2000',   label: 'Under ₹2,000',     min: 0,     max: 2000     },
  { id: '2000-5000',    label: '₹2,000 – ₹5,000',  min: 2000,  max: 5000     },
  { id: '5000-15000',   label: '₹5,000 – ₹15,000', min: 5000,  max: 15000    },
  { id: 'above-15000',  label: 'Above ₹15,000',     min: 15000, max: Infinity },
];

const PRODUCT_TYPES = [
  { label: 'Gambesons & Coats', value: 'gambesons' },
  { label: 'Helmets & Bascinets', value: 'helmets' },
  { label: 'Swords & Blades', value: 'swords' },
  { label: 'Plate & Leather Armor', value: 'armor' },
  { label: 'Chainmail & Coifs', value: 'chainmail' },
  { label: 'Bows & Archery', value: 'bows' },
  { label: 'Shields & Accessories', value: 'accessories' },
];

// Helper to check if a product belongs to a collection
function matchCollection(p: any, subSlug: string): boolean {
  const s = subSlug.toLowerCase();
  const name = (p.name || '').toLowerCase();
  const desc = (p.desc || '').toLowerCase();
  const cat = (p.cat || '').toLowerCase();
  const sub = (p.sub || '').toLowerCase();
  const badge = (p.badge || '').toLowerCase();
  const tags = (Array.isArray(p.tags) ? p.tags.join(' ') : (p.tags || '')).toLowerCase();

  const allText = `${name} ${desc} ${cat} ${sub} ${badge} ${tags}`;

  if (s === 'movie-inspired') {
    return allText.includes('movie') || allText.includes('cinema') || allText.includes('gladiator') || 
           allText.includes('elven') || allText.includes('bow') || allText.includes('knight') || 
           allText.includes('viking') || allText.includes('axe') || allText.includes('cloak') ||
           cat.includes('weaponry') || sub.includes('helmets');
  }
  if (s === 'limited-edition') {
    return allText.includes('limited') || allText.includes('masterwork') || allText.includes('rare') || 
           allText.includes('damascus') || allText.includes('royal') || badge.includes('limited') || p.price > 7000;
  }
  if (s === 'best-sellers') {
    return allText.includes('bestseller') || allText.includes('popular') || badge.includes('best') || 
           allText.includes('shield') || allText.includes('gambeson') || (p.rating && p.rating >= 4.7);
  }
  if (s === 'new-arrivals') {
    return allText.includes('new') || badge.includes('new') || allText.includes('bow') || 
           allText.includes('armor') || allText.includes('latest');
  }
  if (s === 'staff-picks') {
    return allText.includes('staff') || allText.includes('favourite') || allText.includes('sword') || 
           allText.includes('helmet') || allText.includes('leather');
  }
  if (s === 'handmade-collection') {
    return allText.includes('handmade') || allText.includes('handcrafted') || allText.includes('riveted') || 
           allText.includes('forged') || allText.includes('chainmail') || allText.includes('gambeson');
  }
  if (s === 'festival-collection') {
    return allText.includes('festival') || allText.includes('costume') || allText.includes('larp') || 
           allText.includes('tunic') || allText.includes('mug') || allText.includes('belt') || allText.includes('bracer');
  }
  if (s === 'historical-reproductions') {
    return allText.includes('historical') || allText.includes('reproduction') || allText.includes('bascinet') || 
           allText.includes('crusader') || allText.includes('century') || allText.includes('norman');
  }
  return false;
}

const CategoryPage = ({ categorySlug, subSlug }: CategoryPageProps) => {
  const category = NAV_CATEGORIES.find((c) => c.slug === categorySlug);
  const sub = subSlug ? category?.subs.find((s) => s.slug === subSlug) : null;
  const { formatPrice } = useCurrency();

  // 1. Fetch live DB products
  const { data: dbData } = useQuery({
    queryKey: ['category-products', categorySlug, subSlug],
    queryFn: () => getProducts({ limit: 100 }),
    staleTime: 30 * 1000,
  });

  const allProducts: (Product | StaticProduct)[] = useMemo(() => {
    if (dbData?.products && dbData.products.length > 0) {
      // Merge with static catalogue to ensure rich set
      const dbIds = new Set(dbData.products.map((p) => p.id));
      const missingStatic = PRODUCTS.filter((p) => !dbIds.has(p.id));
      return [...dbData.products, ...missingStatic];
    }
    return PRODUCTS;
  }, [dbData]);

  // 2. Interactive Filter States
  const [view, setView] = useState<ViewMode>('grid-4');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('featured');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    availability: true,
    price: true,
    size: false,
    color: false,
    type: true,
  });
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [, setLocation] = useLocation();
  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const clearAllFilters = () => {
    setInStockOnly(false);
    setSelectedPriceRanges([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedTypes([]);
    if (subSlug) {
      setLocation(`/cat/${categorySlug}`);
    }
  };

  const hasActiveFilters =
    inStockOnly ||
    selectedPriceRanges.length > 0 ||
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    selectedTypes.length > 0;

  // 3. Base Filtering by Category / Subcategory / Collection
  const baseCategoryProducts = useMemo(() => {
    if (!subSlug) {
      // Top-level category
      if (categorySlug === 'collections') return allProducts;
      return allProducts.filter((p) => p.cat === categorySlug || (p as any).parentCat === categorySlug);
    }

    if (categorySlug === 'collections') {
      const matched = allProducts.filter((p) => matchCollection(p, subSlug));
      if (matched.length > 0) return matched;
      // Fallback: distribute products cleanly across collection tabs
      const subIdx = category?.subs.findIndex((s) => s.slug === subSlug) ?? 0;
      const step = Math.max(1, Math.floor(allProducts.length / 8));
      const start = (subIdx * step) % allProducts.length;
      return allProducts.slice(start, start + 12).concat(allProducts.slice(0, Math.max(0, 12 - (allProducts.length - start))));
    }

    // Standard Subcategory (e.g. /cat/armor/gambesons or /cat/weapons/swords)
    const directMatches = allProducts.filter((p) => {
      const pSub = (p.sub || '').toLowerCase();
      const pCat = (p.cat || '').toLowerCase();
      const targetSub = subSlug.toLowerCase();
      const targetCat = categorySlug.toLowerCase();

      return (
        pSub === targetSub ||
        pCat === targetSub ||
        pSub.includes(targetSub) ||
        (pCat === targetCat && (p.tags?.some((t: string) => t.toLowerCase().includes(targetSub)) || false))
      );
    });

    if (directMatches.length > 0) return directMatches;
    return allProducts.filter((p) => p.cat === categorySlug);
  }, [allProducts, categorySlug, subSlug, category]);

  // 4. Apply Interactive User Filters
  const filteredProducts = useMemo(() => {
    let result = [...baseCategoryProducts];

    // In-Stock Filter
    if (inStockOnly) {
      result = result.filter((p) => p.inStock !== false);
    }

    // Price Filter
    if (selectedPriceRanges.length > 0) {
      result = result.filter((p) => {
        return selectedPriceRanges.some((rangeId) => {
          const r = PRICE_RANGES.find((item) => item.id === rangeId);
          if (!r) return false;
          return p.price >= r.min && p.price <= r.max;
        });
      });
    }

    // Size Filter
    if (selectedSizes.length > 0) {
      result = result.filter((p) => {
        const pTags = Array.isArray(p.tags) ? p.tags.map((t: string) => t.toLowerCase()) : [];
        return selectedSizes.some((s) => pTags.includes(s.toLowerCase()) || pTags.includes('all-sizes'));
      });
    }

    // Color Filter
    if (selectedColors.length > 0) {
      result = result.filter((p) => {
        const text = `${p.name} ${p.desc || ''} ${(Array.isArray(p.tags) ? p.tags.join(' ') : '')}`.toLowerCase();
        return selectedColors.some((c) => text.includes(c.toLowerCase()));
      });
    }

    // Product Type Filter
    if (selectedTypes.length > 0) {
      result = result.filter((p) => {
        const text = `${p.name} ${p.cat} ${p.sub} ${p.desc || ''}`.toLowerCase();
        return selectedTypes.some((t) => {
          if (t === 'gambesons') return text.includes('gambeson') || text.includes('aketon');
          if (t === 'helmets') return text.includes('helmet') || text.includes('bascinet') || text.includes('coif');
          if (t === 'swords') return text.includes('sword') || text.includes('blade') || text.includes('dagger');
          if (t === 'armor') return text.includes('armor') || text.includes('breastplate') || text.includes('cuirass');
          if (t === 'chainmail') return text.includes('chainmail') || text.includes('hauberk');
          if (t === 'bows') return text.includes('bow') || text.includes('arrow') || text.includes('archery');
          if (t === 'accessories') return text.includes('shield') || text.includes('belt') || text.includes('mug') || text.includes('glove');
          return text.includes(t);
        });
      });
    }

    // Sort
    if (sortOption === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'newest') {
      result.sort((a, b) => ((b.badge === 'NEW') ? 1 : 0) - ((a.badge === 'NEW') ? 1 : 0));
    }

    return result;
  }, [baseCategoryProducts, inStockOnly, selectedPriceRanges, selectedSizes, selectedColors, selectedTypes, sortOption]);

  const pageTitle = sub ? sub.label : (category?.label ?? 'Category');
  const parentLabel = category?.label ?? '';

  return (
    <div className="flex flex-col w-full min-h-[100dvh] bg-[#f5f0e8]">
      {/* ── Hero Banner ─────────────────────────────────────────── */}
      <section className="w-full bg-[#cec3b5] flex min-h-[160px] flex-col items-center justify-center text-center px-4 py-10 sm:min-h-[200px]">
        <div className="font-sans text-[10px] uppercase tracking-[2.5px] text-[#5a4a30]/70 mb-4 flex items-center gap-2 flex-wrap justify-center">
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
              <span className="text-[#2a2016] font-bold">{sub.label.toUpperCase()}</span>
            </>
          ) : (
            <span className="text-[#2a2016] font-bold">{parentLabel.toUpperCase()}</span>
          )}
        </div>

        <h1 className="font-serif text-[38px] sm:text-[54px] font-light text-[#1a1208] uppercase leading-none tracking-[0.08em]">
          {pageTitle}
        </h1>
      </section>

      <div className="mx-auto w-full max-w-[1440px] px-4 py-8 lg:flex lg:items-start lg:gap-8 lg:px-8 lg:py-12">
        {/* ── Desktop & Mobile Filter Sidebar ─────────────────── */}
        <aside className={`w-full lg:w-[260px] shrink-0 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-[#ede7dd] border border-[#d6cec1] p-5 rounded shadow-sm sticky top-20">
            {/* Header / Clear */}
            <div className="flex items-center justify-between border-b border-[#d6cec1] pb-4 mb-4">
              <span className="font-serif text-[12px] font-bold uppercase tracking-[2px] text-[#211b14]">
                Filters {hasActiveFilters && `(${filteredProducts.length})`}
              </span>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-1 font-sans text-[10px] font-semibold text-[#a91f22] hover:underline uppercase tracking-[1px]"
                >
                  <RotateCcw size={11} /> Reset
                </button>
              )}
            </div>

            {/* 1. Availability */}
            <div className="border-b border-[#d6cec1] py-3">
              <button
                onClick={() => toggleSection('availability')}
                className="flex w-full items-center justify-between text-left font-sans text-[11px] font-bold uppercase tracking-[1.5px] text-[#29251f]"
              >
                Availability
                <ChevronDown size={14} className={`transition-transform duration-200 ${openSections.availability ? 'rotate-180' : ''}`} />
              </button>
              {openSections.availability && (
                <div className="mt-3 space-y-2 font-sans text-[11px] text-[#4a443b]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="avail"
                      checked={!inStockOnly}
                      onChange={() => setInStockOnly(false)}
                      className="accent-[#8b6914]"
                    />
                    <span>All Products ({baseCategoryProducts.length})</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="avail"
                      checked={inStockOnly}
                      onChange={() => setInStockOnly(true)}
                      className="accent-[#8b6914]"
                    />
                    <span>In Stock Only ({baseCategoryProducts.filter((p) => p.inStock !== false).length})</span>
                  </label>
                </div>
              )}
            </div>

            {/* 2. Price Range */}
            <div className="border-b border-[#d6cec1] py-3">
              <button
                onClick={() => toggleSection('price')}
                className="flex w-full items-center justify-between text-left font-sans text-[11px] font-bold uppercase tracking-[1.5px] text-[#29251f]"
              >
                Price
                <ChevronDown size={14} className={`transition-transform duration-200 ${openSections.price ? 'rotate-180' : ''}`} />
              </button>
              {openSections.price && (
                <div className="mt-3 space-y-2 font-sans text-[11px] text-[#4a443b]">
                  {PRICE_RANGES.map((r) => {
                    const checked = selectedPriceRanges.includes(r.id);
                    return (
                      <label key={r.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            setSelectedPriceRanges((prev) =>
                              e.target.checked ? [...prev, r.id] : prev.filter((id) => id !== r.id)
                            );
                          }}
                          className="accent-[#8b6914] rounded"
                        />
                        <span>{r.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Product Type */}
            <div className="border-b border-[#d6cec1] py-3">
              <button
                onClick={() => toggleSection('type')}
                className="flex w-full items-center justify-between text-left font-sans text-[11px] font-bold uppercase tracking-[1.5px] text-[#29251f]"
              >
                Product Type
                <ChevronDown size={14} className={`transition-transform duration-200 ${openSections.type ? 'rotate-180' : ''}`} />
              </button>
              {openSections.type && (
                <div className="mt-3 space-y-2 font-sans text-[11px] text-[#4a443b]">
                  {PRODUCT_TYPES.map((t) => {
                    const checked = selectedTypes.includes(t.value);
                    return (
                      <label key={t.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            setSelectedTypes((prev) =>
                              e.target.checked ? [...prev, t.value] : prev.filter((id) => id !== t.value)
                            );
                          }}
                          className="accent-[#8b6914] rounded"
                        />
                        <span>{t.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 4. Size */}
            <div className="border-b border-[#d6cec1] py-3">
              <button
                onClick={() => toggleSection('size')}
                className="flex w-full items-center justify-between text-left font-sans text-[11px] font-bold uppercase tracking-[1.5px] text-[#29251f]"
              >
                Size
                <ChevronDown size={14} className={`transition-transform duration-200 ${openSections.size ? 'rotate-180' : ''}`} />
              </button>
              {openSections.size && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {SIZE_OPTIONS.map((s) => {
                    const active = selectedSizes.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setSelectedSizes((prev) =>
                            active ? prev.filter((item) => item !== s) : [...prev, s]
                          );
                        }}
                        className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-[1px] border transition cursor-pointer rounded ${
                          active
                            ? 'bg-[#1a1a18] text-[#d4af37] border-[#1a1a18]'
                            : 'bg-white/80 text-[#3a342b] border-[#d6cec1] hover:border-[#8b6914]'
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 5. Color */}
            <div className="py-3">
              <button
                onClick={() => toggleSection('color')}
                className="flex w-full items-center justify-between text-left font-sans text-[11px] font-bold uppercase tracking-[1.5px] text-[#29251f]"
              >
                Color
                <ChevronDown size={14} className={`transition-transform duration-200 ${openSections.color ? 'rotate-180' : ''}`} />
              </button>
              {openSections.color && (
                <div className="mt-3 space-y-2 font-sans text-[11px] text-[#4a443b]">
                  {COLOR_OPTIONS.map((c) => {
                    const checked = selectedColors.includes(c.label);
                    return (
                      <label key={c.label} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            setSelectedColors((prev) =>
                              e.target.checked ? [...prev, c.label] : prev.filter((id) => id !== c.label)
                            );
                          }}
                          className="accent-[#8b6914] rounded"
                        />
                        <span className="h-3 w-3 rounded-full border border-black/20" style={{ backgroundColor: c.code }} />
                        <span>{c.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ── Main Product Display Area ───────────────────────── */}
        <main className="min-w-0 flex-1">
          {/* Subcategory / Collection Pills Bar */}
          {category && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {category.subs.map((s) => {
                const isActive = s.slug === subSlug;
                return (
                  <Link
                    key={s.slug}
                    href={`/cat/${category.slug}/${s.slug}`}
                    className={`font-serif text-[11px] font-medium uppercase tracking-[1.5px] px-3.5 py-1.5 border rounded-sm transition-colors ${
                      isActive
                        ? 'bg-[#1a1a18] text-[#d4af37] border-[#1a1a18] shadow-sm'
                        : 'bg-[#faf8f4] border-[#d8d2c6] text-[#4a443b] hover:border-[#1a1a18] hover:text-[#1a1a18]'
                    }`}
                  >
                    {s.label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Top Bar: Total items, Active filter pills, View switchers, Sorting */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#ded7cb] pb-4 mb-6">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFilterOpen((v) => !v)}
              className="flex items-center gap-1.5 font-sans text-[11px] font-bold uppercase tracking-[1px] bg-[#ede7dd] border border-[#d6cec1] px-3 py-1.5 rounded lg:hidden"
            >
              <SlidersHorizontal size={13} /> Filters {hasActiveFilters && `(${filteredProducts.length})`}
            </button>

            <span className="font-serif text-[13px] text-[#6b6255]">
              Showing <strong className="text-[#1a1208]">{filteredProducts.length}</strong> products
            </span>

            <div className="flex items-center gap-4">
              {/* Layout switcher */}
              <div className="hidden sm:flex items-center gap-1 border border-[#d8d2c6] bg-[#faf8f4] p-0.5 rounded">
                <button
                  type="button"
                  onClick={() => setView('grid-4')}
                  title="4 Column Grid"
                  className={`p-1.5 rounded transition ${view === 'grid-4' ? 'bg-[#1a1a18] text-[#d4af37]' : 'text-[#6b6255] hover:text-[#1a1208]'}`}
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setView('grid-2')}
                  title="2 Column Grid"
                  className={`p-1.5 rounded transition ${view === 'grid-2' ? 'bg-[#1a1a18] text-[#d4af37]' : 'text-[#6b6255] hover:text-[#1a1208]'}`}
                >
                  <Grid2X2 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setView('list')}
                  title="List View"
                  className={`p-1.5 rounded transition ${view === 'list' ? 'bg-[#1a1a18] text-[#d4af37]' : 'text-[#6b6255] hover:text-[#1a1208]'}`}
                >
                  <List size={15} />
                </button>
              </div>

              {/* Sort Selector */}
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                aria-label="Sort products"
                className="bg-[#faf8f4] border border-[#d8d2c6] text-[#2a241c] text-[11px] font-bold uppercase tracking-[1px] px-3 py-1.5 rounded outline-none cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Active Filter Tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5 mb-6">
              <span className="text-[10px] font-bold uppercase tracking-[1px] text-[#8a8070] mr-1">Active:</span>
              {inStockOnly && (
                <span className="inline-flex items-center gap-1 rounded bg-[#1a1a18] text-[#d4af37] px-2 py-0.5 text-[10px] font-bold">
                  In Stock Only
                  <button onClick={() => setInStockOnly(false)}><X size={10} /></button>
                </span>
              )}
              {selectedPriceRanges.map((id) => {
                const r = PRICE_RANGES.find((item) => item.id === id);
                return r ? (
                  <span key={id} className="inline-flex items-center gap-1 rounded bg-[#e3dcce] text-[#29251f] px-2 py-0.5 text-[10px] font-bold border border-[#cec5b4]">
                    {r.label}
                    <button onClick={() => setSelectedPriceRanges((prev) => prev.filter((item) => item !== id))}><X size={10} /></button>
                  </span>
                ) : null;
              })}
              {selectedTypes.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 rounded bg-[#e3dcce] text-[#29251f] px-2 py-0.5 text-[10px] font-bold border border-[#cec5b4]">
                  {t.toUpperCase()}
                  <button onClick={() => setSelectedTypes((prev) => prev.filter((item) => item !== t))}><X size={10} /></button>
                </span>
              ))}
              {selectedSizes.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 rounded bg-[#e3dcce] text-[#29251f] px-2 py-0.5 text-[10px] font-bold border border-[#cec5b4]">
                  Size: {s}
                  <button onClick={() => setSelectedSizes((prev) => prev.filter((item) => item !== s))}><X size={10} /></button>
                </span>
              ))}
              {selectedColors.map((c) => (
                <span key={c} className="inline-flex items-center gap-1 rounded bg-[#e3dcce] text-[#29251f] px-2 py-0.5 text-[10px] font-bold border border-[#cec5b4]">
                  {c}
                  <button onClick={() => setSelectedColors((prev) => prev.filter((item) => item !== c))}><X size={10} /></button>
                </span>
              ))}
            </div>
          )}

          {/* ── Product Grid ─────────────────────────────────── */}
          {filteredProducts.length > 0 ? (
            <div
              className={`grid gap-4 sm:gap-6 ${
                view === 'grid-4'
                  ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                  : view === 'grid-2'
                  ? 'grid-cols-1 sm:grid-cols-2'
                  : 'grid-cols-1'
              }`}
            >
              {filteredProducts.map((p, idx) => (
                <ProductCard key={p.id} product={p as any} index={idx} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-[#faf8f4] border border-[#ded7cb] rounded-2xl p-8 shadow-xs">
              <p className="font-serif text-[20px] text-[#2a2016] font-bold">No products match your current filters</p>
              <p className="font-sans text-[13px] text-[#6b6255] mt-1.5 max-w-md">
                Try resetting your filters or exploring all handcrafted collectibles in our store.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="bg-[#1a1a18] hover:bg-[#c6a767] hover:text-[#1a1208] text-white px-6 py-2.5 text-[11px] font-bold uppercase tracking-[1.5px] rounded-full transition cursor-pointer"
                >
                  Clear All Filters
                </button>
                <Link
                  href="/shop"
                  className="border border-[#1a1a18] text-[#1a1a18] hover:bg-[#1a1a18] hover:text-white px-6 py-2.5 text-[11px] font-bold uppercase tracking-[1.5px] rounded-full transition cursor-pointer"
                >
                  Browse All Products
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── Other categories footer section ────────────────── */}
      <section className="w-full bg-[#e8e0d4] border-t border-[#d4cdc4] py-8 mt-auto">
        <div className="max-w-[1280px] mx-auto px-6 text-center">
          <p className="font-sans text-[10px] uppercase tracking-[3px] text-[#5a4a30]/60 mb-4">
            EXPLORE MORE CATEGORIES
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {NAV_CATEGORIES.filter((c) => c.slug !== categorySlug).map((c) => (
              <Link
                key={c.slug}
                href={`/cat/${c.slug}`}
                className="font-sans text-[10px] font-medium uppercase tracking-[1.5px] text-[#5a4a30] hover:text-[#2a2016] transition-colors px-3 py-1 border border-[#c8bfb0] hover:border-[#5a4a30] bg-[#faf8f4] rounded"
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
