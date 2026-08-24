import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useSearch, useLocation } from 'wouter';
import {
  ChevronDown,
  Grid2X2,
  LayoutGrid,
  List,
  X,
  SlidersHorizontal,
  RotateCcw,
  Check,
} from 'lucide-react';
import { PRODUCTS, type Product as StaticProduct } from '@/data/products';
import { useQuery } from '@tanstack/react-query';
import { getProducts, type Product } from '@/lib/api';
import { useCurrency } from '@/contexts/CurrencyContext';
import ProductCard from '@/components/ProductCard';

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

const CATEGORY_FILTERS = [
  { id: 'chainmail-armor',  label: 'Chainmail Armor' },
  { id: 'medieval-helmets', label: 'Medieval Helmets' },
  { id: 'plate-armor',      label: 'Plate Armor' },
  { id: 'leather-armor',    label: 'Leather Armor' },
  { id: 'gambesons',        label: 'Gambesons & Padding' },
  { id: 'medieval-clothing',label: 'Medieval Clothing' },
  { id: 'shields',          label: 'Shields' },
  { id: 'weapons',          label: 'Weapons & Swords' },
  { id: 'accessories',      label: 'Accessories' },
];

const PRODUCT_TYPES = [
  { id: 'gambesons',   label: 'Gambesons & Coats' },
  { id: 'helmets',     label: 'Helmets & Bascinets' },
  { id: 'swords',      label: 'Swords & Blades' },
  { id: 'armor',       label: 'Plate & Leather Armor' },
  { id: 'chainmail',   label: 'Chainmail & Coifs' },
  { id: 'bows',        label: 'Bows & Archery' },
  { id: 'shields',     label: 'Shields' },
  { id: 'accessories', label: 'Belts & Jewelry' },
];

const SIZE_OPTIONS = ['S/M', 'L/XL', '2XL/3XL', 'Custom'];
const COLOR_OPTIONS = ['Black', 'Brown', 'Natural', 'Steel', 'Red', 'Green'];

const SORT_LABELS: Record<SortOption, string> = {
  featured:    'Featured',
  'price-asc': 'Price: Low to High',
  'price-desc':'Price: High to Low',
  newest:      'Newest Arrivals',
};

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children?: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#ded7cc] py-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full justify-between items-center text-left cursor-pointer group"
        aria-expanded={open}
      >
        <span className="font-sans text-[11px] font-bold uppercase tracking-[1.5px] text-[#1a1208] group-hover:text-[#8b6914] transition-colors">
          {title}
        </span>
        <ChevronDown
          size={14}
          strokeWidth={2}
          className={`text-[#6b6255] transition-transform duration-200 ${open ? 'rotate-180 text-[#8b6914]' : ''}`}
        />
      </button>
      {open && children && (
        <div className="mt-3.5 space-y-2.5 animate-in fade-in duration-200">{children}</div>
      )}
    </div>
  );
}

export default function Shop() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const catParam = searchParams.get('cat');
  const subParam = searchParams.get('sub');
  const badgeParam = searchParams.get('badge');
  const qParam = searchParams.get('q') || searchParams.get('search') || '';

  // 1. Fetch live DB products and merge with catalog
  const { data: dbData } = useQuery({
    queryKey: ['shop-products'],
    queryFn: () => getProducts({ limit: 150 }),
    staleTime: 30 * 1000,
  });

  const allProducts: (Product | StaticProduct)[] = useMemo(() => {
    if (dbData?.products && dbData.products.length > 0) {
      const dbIds = new Set(dbData.products.map((p) => p.id));
      const missingStatic = PRODUCTS.filter((p) => !dbIds.has(p.id));
      return [...dbData.products, ...missingStatic];
    }
    return PRODUCTS;
  }, [dbData]);

  // 2. State
  const [view, setView] = useState<View>('grid-4');
  const [sort, setSort] = useState<SortOption>('featured');
  const [selectedCats, setSelectedCats] = useState<string[]>(catParam ? [catParam] : []);
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [search, setSearch] = useState(qParam);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    setSearch(qParam);
  }, [qParam]);

  useEffect(() => {
    if (catParam && !selectedCats.includes(catParam)) {
      setSelectedCats([catParam]);
    }
  }, [catParam]);

  // Filter toggles
  const toggleCat = (catId: string) => {
    setSelectedCats((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };

  const togglePrice = (id: string) => {
    setSelectedPrices((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleType = (typeId: string) => {
    setSelectedTypes((prev) =>
      prev.includes(typeId) ? prev.filter((t) => t !== typeId) : [...prev, typeId]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const clearAll = () => {
    setSelectedCats([]);
    setSelectedPrices([]);
    setSelectedTypes([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setInStockOnly(false);
    setSearch('');
  };

  const hasActiveFilters =
    inStockOnly ||
    selectedCats.length > 0 ||
    selectedPrices.length > 0 ||
    selectedTypes.length > 0 ||
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    !!search.trim();

  // 3. Multi-dimensional Filter & Sorting Engine
  const filteredProducts = useMemo(() => {
    let list = allProducts.filter((p) => {
      // Direct sub / badge params from URL
      if (subParam && p.sub !== subParam) return false;
      if (badgeParam && p.badge !== badgeParam) return false;

      // In-Stock Filter
      if (inStockOnly && p.inStock === false) return false;

      // Category filter
      if (selectedCats.length > 0) {
        const pCat = (p.cat || '').toLowerCase();
        const pSub = (p.sub || '').toLowerCase();
        const match = selectedCats.some((c) => {
          const target = c.toLowerCase();
          if (target === 'weapons' || target === 'weaponry') {
            return pCat === 'weapons' || pCat === 'weaponry' || pSub.includes('sword') || pSub.includes('axe') || pSub.includes('bow');
          }
          if (target === 'plate-armor' || target === 'armour') {
            return pCat === 'plate-armor' || pCat === 'armour' || pSub.includes('breastplate') || pSub.includes('gauntlet');
          }
          if (target === 'chainmail-armor') {
            return pCat.includes('chainmail') || pSub.includes('chainmail') || pSub.includes('coif') || pSub.includes('hauberk');
          }
          if (target === 'medieval-helmets') {
            return pCat.includes('helmet') || pSub.includes('helmet') || pSub.includes('bascinet');
          }
          if (target === 'gambesons') {
            return pCat.includes('gambeson') || pSub.includes('gambeson') || pSub.includes('jacket');
          }
          if (target === 'shields') {
            return pCat.includes('shield') || pSub.includes('shield');
          }
          if (target === 'accessories') {
            return pCat.includes('accessories') || pSub.includes('belt') || pSub.includes('jewelry') || pSub.includes('bag');
          }
          return pCat === target || pSub === target || pCat.includes(target);
        });
        if (!match) return false;
      }

      // Price Filter
      if (selectedPrices.length > 0) {
        const inRange = selectedPrices.some((id) => {
          const r = PRICE_RANGES.find((x) => x.id === id);
          return r ? p.price >= r.min && p.price <= r.max : false;
        });
        if (!inRange) return false;
      }

      // Product Type Filter
      if (selectedTypes.length > 0) {
        const text = `${p.name} ${p.cat} ${p.sub} ${p.desc || ''}`.toLowerCase();
        const matchesType = selectedTypes.some((t) => {
          if (t === 'gambesons') return text.includes('gambeson') || text.includes('aketon');
          if (t === 'helmets') return text.includes('helmet') || text.includes('bascinet') || text.includes('coif');
          if (t === 'swords') return text.includes('sword') || text.includes('blade') || text.includes('dagger');
          if (t === 'armor') return text.includes('armor') || text.includes('breastplate') || text.includes('cuirass');
          if (t === 'chainmail') return text.includes('chainmail') || text.includes('hauberk');
          if (t === 'bows') return text.includes('bow') || text.includes('arrow') || text.includes('archery');
          if (t === 'shields') return text.includes('shield');
          if (t === 'accessories') return text.includes('belt') || text.includes('jewelry') || text.includes('mug') || text.includes('glove');
          return text.includes(t);
        });
        if (!matchesType) return false;
      }

      // Size Filter
      if (selectedSizes.length > 0) {
        const tags = Array.isArray(p.tags) ? p.tags.map((t: string) => t.toLowerCase()) : [];
        const matchesSize = selectedSizes.some((s) => tags.includes(s.toLowerCase()) || tags.includes('all-sizes'));
        if (!matchesSize) return false;
      }

      // Color Filter
      if (selectedColors.length > 0) {
        const text = `${p.name} ${p.desc || ''} ${(Array.isArray(p.tags) ? p.tags.join(' ') : '')}`.toLowerCase();
        const matchesColor = selectedColors.some((c) => text.includes(c.toLowerCase()));
        if (!matchesColor) return false;
      }

      // Text Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const combined = `${p.name} ${p.cat} ${p.sub} ${p.desc || ''} ${(Array.isArray(p.tags) ? p.tags.join(' ') : '')}`.toLowerCase();
        if (!combined.includes(q)) return false;
      }

      return true;
    });

    // Sorting
    switch (sort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        list.sort((a, b) => (b.badge === 'new' || b.badge === 'NEW' ? 1 : 0) - (a.badge === 'new' || a.badge === 'NEW' ? 1 : 0));
        break;
      default:
        break;
    }

    return list;
  }, [allProducts, catParam, subParam, badgeParam, selectedCats, selectedPrices, selectedTypes, selectedSizes, selectedColors, search, sort, inStockOnly]);

  const sidebarContent = (
    <div className="flex flex-col">
      {/* Header & Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-[#ded7cc]">
        <span className="font-serif text-[14px] font-bold uppercase tracking-[2px] text-[#1a1208]">
          Filters
        </span>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[1px] text-[#8b6914] hover:text-[#1a1208] transition cursor-pointer"
          >
            <RotateCcw size={11} /> Clear All
          </button>
        )}
      </div>

      {/* AVAILABILITY */}
      <FilterSection title="Availability" defaultOpen={true}>
        <div className="space-y-2 font-sans text-[12px] text-[#4a443b]">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="radio"
              name="shop-avail"
              checked={!inStockOnly}
              onChange={() => setInStockOnly(false)}
              className="accent-[#8b6914] cursor-pointer"
            />
            <span>All Products ({allProducts.length})</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="radio"
              name="shop-avail"
              checked={inStockOnly}
              onChange={() => setInStockOnly(true)}
              className="accent-[#8b6914] cursor-pointer"
            />
            <span>In Stock Only ({allProducts.filter((p) => p.inStock !== false).length})</span>
          </label>
        </div>
      </FilterSection>

      {/* CATEGORIES */}
      <FilterSection title="Category" defaultOpen={true}>
        <div className="space-y-2 font-sans text-[12px] text-[#4a443b]">
          {CATEGORY_FILTERS.map((cat) => {
            const checked = selectedCats.includes(cat.id);
            return (
              <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer hover:text-[#1a1208]">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleCat(cat.id)}
                  className="accent-[#8b6914] rounded cursor-pointer"
                />
                <span>{cat.label}</span>
              </label>
            );
          })}
        </div>
      </FilterSection>

      {/* PRICE */}
      <FilterSection title="Price" defaultOpen={true}>
        <div className="space-y-2 font-sans text-[12px] text-[#4a443b]">
          {PRICE_RANGES.map((range) => {
            const checked = selectedPrices.includes(range.id);
            return (
              <label key={range.id} className="flex items-center gap-2.5 cursor-pointer hover:text-[#1a1208]">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => togglePrice(range.id)}
                  className="accent-[#8b6914] rounded cursor-pointer"
                />
                <span>{range.label}</span>
              </label>
            );
          })}
        </div>
      </FilterSection>

      {/* PRODUCT TYPE */}
      <FilterSection title="Product Type" defaultOpen={true}>
        <div className="space-y-2 font-sans text-[12px] text-[#4a443b]">
          {PRODUCT_TYPES.map((t) => {
            const checked = selectedTypes.includes(t.id);
            return (
              <label key={t.id} className="flex items-center gap-2.5 cursor-pointer hover:text-[#1a1208]">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleType(t.id)}
                  className="accent-[#8b6914] rounded cursor-pointer"
                />
                <span>{t.label}</span>
              </label>
            );
          })}
        </div>
      </FilterSection>

      {/* SIZE */}
      <FilterSection title="Size" defaultOpen={false}>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {SIZE_OPTIONS.map((s) => {
            const active = selectedSizes.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleSize(s)}
                className={`px-3 py-1 text-[11px] font-bold uppercase tracking-[1px] border rounded transition cursor-pointer ${
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
      </FilterSection>

      {/* COLOR */}
      <FilterSection title="Color" defaultOpen={false}>
        <div className="space-y-2 font-sans text-[12px] text-[#4a443b]">
          {COLOR_OPTIONS.map((c) => {
            const checked = selectedColors.includes(c);
            return (
              <label key={c} className="flex items-center gap-2.5 cursor-pointer hover:text-[#1a1208]">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleColor(c)}
                  className="accent-[#8b6914] rounded cursor-pointer"
                />
                <span>{c}</span>
              </label>
            );
          })}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#f5f0e8]">
      {/* ── Breadcrumb & Banner ─────────────────────────────────── */}
      <section className="w-full bg-[#cec3b5] flex min-h-[140px] flex-col items-center justify-center text-center px-4 py-8 sm:min-h-[180px]">
        <div className="font-sans text-[10px] uppercase tracking-[2.5px] text-[#5a4a30]/70 mb-3 flex items-center gap-2 flex-wrap justify-center">
          <Link href="/" className="hover:text-[#2a2016] transition-colors">
            HOME
          </Link>
          <span>/</span>
          <span className="text-[#2a2016] font-bold">ALL PRODUCTS</span>
        </div>
        <h1 className="font-serif text-[28px] sm:text-[38px] uppercase tracking-[3px] text-[#1c1813] font-bold">
          The Armory Collection
        </h1>
        <p className="font-serif italic text-[13px] sm:text-[14px] text-[#42392d] max-w-xl mt-1.5 px-4">
          Explore historical weapons, museum-grade suits of armor, gambesons, and authentic handcrafted collectibles.
        </p>
      </section>

      {/* ── Main Layout ─────────────────────────────────────────── */}
      <div className="max-w-[1580px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block w-[260px] shrink-0">
          <div className="bg-[#faf8f4] border border-[#ded7cb] rounded-2xl p-5 shadow-xs sticky top-24">
            {sidebarContent}
          </div>
        </aside>

        {/* Products Column */}
        <main className="flex-1 min-w-0">
          {/* Top Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[#faf8f4] border border-[#ded7cb] p-4 rounded-xl mb-6 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden inline-flex items-center gap-2 bg-[#1a1a18] text-[#d4af37] px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-[1px] shadow-sm"
              >
                <SlidersHorizontal size={14} /> Filters {hasActiveFilters ? '●' : ''}
              </button>

              <span className="font-serif text-[13px] text-[#6b6255]">
                Showing <strong className="text-[#1a1208]">{filteredProducts.length}</strong> Products
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Layout switcher */}
              <div className="hidden sm:flex items-center gap-1 border border-[#d8d2c6] bg-white p-0.5 rounded">
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
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                aria-label="Sort products"
                className="bg-white border border-[#d8d2c6] text-[#2a241c] text-[11px] font-bold uppercase tracking-[1px] px-3 py-2 rounded outline-none cursor-pointer shadow-xs"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5 mb-6 animate-in fade-in">
              <span className="text-[10px] font-bold uppercase tracking-[1px] text-[#8a8070] mr-1">Active:</span>
              {inStockOnly && (
                <span className="inline-flex items-center gap-1 rounded bg-[#1a1a18] text-[#d4af37] px-2.5 py-1 text-[10px] font-bold">
                  In Stock Only
                  <button type="button" onClick={() => setInStockOnly(false)} className="hover:text-white cursor-pointer"><X size={10} /></button>
                </span>
              )}
              {selectedCats.map((id) => (
                <span key={id} className="inline-flex items-center gap-1 rounded bg-[#e3dcce] text-[#29251f] px-2.5 py-1 text-[10px] font-bold border border-[#cec5b4]">
                  {CATEGORY_FILTERS.find((c) => c.id === id)?.label || id}
                  <button type="button" onClick={() => toggleCat(id)} className="hover:text-red-600 cursor-pointer"><X size={10} /></button>
                </span>
              ))}
              {selectedPrices.map((id) => (
                <span key={id} className="inline-flex items-center gap-1 rounded bg-[#e3dcce] text-[#29251f] px-2.5 py-1 text-[10px] font-bold border border-[#cec5b4]">
                  {PRICE_RANGES.find((r) => r.id === id)?.label || id}
                  <button type="button" onClick={() => togglePrice(id)} className="hover:text-red-600 cursor-pointer"><X size={10} /></button>
                </span>
              ))}
              {selectedTypes.map((id) => (
                <span key={id} className="inline-flex items-center gap-1 rounded bg-[#e3dcce] text-[#29251f] px-2.5 py-1 text-[10px] font-bold border border-[#cec5b4]">
                  {PRODUCT_TYPES.find((t) => t.id === id)?.label || id}
                  <button type="button" onClick={() => toggleType(id)} className="hover:text-red-600 cursor-pointer"><X size={10} /></button>
                </span>
              ))}
              {selectedSizes.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 rounded bg-[#e3dcce] text-[#29251f] px-2.5 py-1 text-[10px] font-bold border border-[#cec5b4]">
                  Size: {s}
                  <button type="button" onClick={() => toggleSize(s)} className="hover:text-red-600 cursor-pointer"><X size={10} /></button>
                </span>
              ))}
              {selectedColors.map((c) => (
                <span key={c} className="inline-flex items-center gap-1 rounded bg-[#e3dcce] text-[#29251f] px-2.5 py-1 text-[10px] font-bold border border-[#cec5b4]">
                  {c}
                  <button type="button" onClick={() => toggleColor(c)} className="hover:text-red-600 cursor-pointer"><X size={10} /></button>
                </span>
              ))}
              {search.trim() && (
                <span className="inline-flex items-center gap-1 rounded bg-[#e3dcce] text-[#29251f] px-2.5 py-1 text-[10px] font-bold border border-[#cec5b4]">
                  "{search}"
                  <button type="button" onClick={() => setSearch('')} className="hover:text-red-600 cursor-pointer"><X size={10} /></button>
                </span>
              )}
              <button
                type="button"
                onClick={clearAll}
                className="text-[10px] font-bold text-[#8b6914] hover:underline ml-2 cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Product Grid */}
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
            <div className="flex flex-col items-center justify-center py-20 text-center bg-[#faf8f4] border border-[#ded7cb] rounded-2xl p-8 shadow-xs">
              <p className="font-serif text-[20px] text-[#2a2016] font-bold">No products match your current filters</p>
              <p className="font-sans text-[13px] text-[#6b6255] mt-1.5 max-w-md">
                Try clearing active filters or searching with different keywords.
              </p>
              <button
                type="button"
                onClick={clearAll}
                className="mt-6 bg-[#1a1a18] hover:bg-[#c6a767] hover:text-[#1a1208] text-white px-6 py-2.5 text-[11px] font-bold uppercase tracking-[1.5px] rounded-full transition cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-[200] flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="relative ml-auto h-full w-[310px] overflow-y-auto bg-[#faf8f4] p-6 shadow-2xl z-10">
            <div className="flex items-center justify-between pb-4 border-b border-[#ded7cc] mb-4">
              <span className="font-serif text-[14px] font-bold uppercase tracking-[2px] text-[#1a1208]">
                Filters
              </span>
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="p-1 text-[#6b6255] hover:text-[#1a1208]"
              >
                <X size={20} />
              </button>
            </div>
            {sidebarContent}
            <button
              type="button"
              onClick={() => setShowMobileFilters(false)}
              className="mt-6 w-full bg-[#1a1a18] text-[#d4af37] py-3 rounded-full font-sans text-[11px] font-bold uppercase tracking-[1.5px]"
            >
              Apply & View {filteredProducts.length} Products
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
