import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Save,
  Loader2,
  CheckCircle2,
  Upload,
  Plus,
  Trash2,
  Image as ImageIcon,
  Layers,
  ShoppingBag,
  Sliders,
  Award,
  Globe,
  Camera,
  Mail,
  Eye,
  Check,
  X,
  Search,
  ArrowRight,
  ShieldCheck,
  Star,
  Lock,
  Compass,
} from 'lucide-react';
import AdminLayout from './AdminLayout';

interface ProductItem {
  id: string;
  name: string;
  image: string;
  price: number;
  badge?: string | null;
  cat?: string;
  sku?: string;
}

export default function AdminHomepage() {
  const [activeTab, setActiveTab] = useState<'hero' | 'products' | 'categories' | 'story' | 'social'>('hero');
  const [config, setConfig] = useState<any>(null);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  const [productSearch, setProductSearch] = useState('');

  // Fetch live homepage config and products
  useEffect(() => {
    fetch('/api/admin/homepage')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load homepage configuration');
        return res.json();
      })
      .then((data) => {
        setConfig(data.config);
        setProducts(data.products || []);
      })
      .catch((err) => setError(err.message || 'Failed to load configuration'))
      .finally(() => setLoading(false));
  }, []);

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (!dataUrl) {
          resolve('');
          return;
        }
        const img = new Image();
        img.onload = () => {
          const MAX_DIM = 1600;
          let { width, height } = img;
          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(dataUrl);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.88));
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error('Failed to save homepage changes');
      const data = await res.json();
      if (data.config) setConfig(data.config);
      setToast('Homepage updated successfully! Live changes are now active.');
      setTimeout(() => setToast(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Error saving changes');
    } finally {
      setSaving(false);
    }
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.cat || '').toLowerCase().includes(productSearch.toLowerCase())
  );

  if (loading || !config) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh] text-[#8a8278] gap-3">
          <Loader2 className="animate-spin text-[#d4af37]" size={32} />
          <span className="font-serif uppercase tracking-[2px] text-sm text-[#f5f0e8]">
            Loading Homepage CMS...
          </span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-[1400px] mx-auto pb-20 px-2 sm:px-4 md:px-6">
        {/* ── STICKY TOP CONTROL BAR ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-[#1f1f1c]/95 backdrop-blur-md p-3.5 sm:p-5 rounded-2xl border border-[#383834] sticky top-2 z-30 shadow-2xl">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[1.5px] px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30">
                LIVE CMS
              </span>
              <span className="text-[10px] sm:text-xs text-[#8a8278] uppercase tracking-[1px]">
                ZAFEX STOREFRONT BUILDER
              </span>
            </div>
            <h1 className="font-serif text-[16px] sm:text-[22px] uppercase tracking-[1px] text-[#f5f0e8] font-bold truncate">
              Homepage Configuration
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="px-3 sm:px-4 py-2 bg-[#2a2a26] hover:bg-[#333330] border border-[#444440] text-[#c0b8ac] hover:text-[#f5f0e8] text-[11px] sm:text-xs font-serif uppercase tracking-[1px] rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <Eye size={14} />
              <span className="hidden sm:inline">Preview Store</span>
            </a>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 sm:px-6 py-2 bg-gradient-to-r from-[#d4af37] to-[#b89528] hover:from-[#e5c14d] hover:to-[#c49f27] text-[#1a1208] text-[11px] sm:text-xs font-serif font-bold uppercase tracking-[1.5px] rounded-xl transition flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-[#d4af37]/20 disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />}
              <span>{saving ? 'Publishing...' : 'Save & Publish'}</span>
            </button>
          </div>
        </div>

        {/* ── NOTIFICATIONS ── */}
        {error && (
          <div className="mb-6 p-4 bg-red-950/60 border border-red-800 rounded-xl text-red-200 text-xs sm:text-sm flex items-center justify-between shadow-lg animate-in fade-in">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-400 p-1 hover:text-white">
              <X size={16} />
            </button>
          </div>
        )}

        {toast && (
          <div className="mb-6 p-4 bg-emerald-950/70 border border-emerald-700/80 rounded-xl text-emerald-200 text-xs sm:text-sm flex items-center gap-3 shadow-lg animate-in fade-in">
            <CheckCircle2 className="text-emerald-400 shrink-0" size={18} />
            <span className="font-medium">{toast}</span>
          </div>
        )}

        {/* ── NAVIGATION TABS (Pills with Responsive Horizontal Scroll) ── */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-3 mb-6 border-b border-[#333330]">
          {[
            { id: 'hero', label: '1. Hero Banners', icon: ImageIcon },
            { id: 'products', label: '2. Curated Products', icon: ShoppingBag },
            { id: 'categories', label: '3. Categories & Realms', icon: Layers },
            { id: 'story', label: '4. Heritage & Trust', icon: Award },
            { id: 'social', label: '5. Reviews & Social', icon: Camera },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 sm:px-5 py-2.5 rounded-xl text-[11px] sm:text-xs font-serif uppercase tracking-[1px] flex items-center gap-2 transition whitespace-nowrap border ${
                  active
                    ? 'bg-[#d4af37] text-[#1a1208] border-[#d4af37] font-bold shadow-md shadow-[#d4af37]/15'
                    : 'bg-[#242420] text-[#c0b8ac] hover:text-[#f5f0e8] hover:bg-[#2a2a26] border-[#383834]'
                }`}
              >
                <Icon size={14} className={active ? 'text-[#1a1208]' : 'text-[#d4af37]'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 1: HERO CAROUSEL & BANNERS
           ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'hero' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-[#242420] border border-[#383834] rounded-2xl p-4 sm:p-7 space-y-6 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#333330] pb-4">
                <div>
                  <h2 className="font-serif text-[15px] sm:text-[18px] uppercase tracking-[1.5px] text-[#f5f0e8] font-bold flex items-center gap-2">
                    <ImageIcon className="text-[#d4af37]" size={18} /> Hero Banner Carousel
                  </h2>
                  <p className="text-[11px] sm:text-xs text-[#8a8278] mt-0.5">
                    Configure rotating slides, headlines, and call-to-action buttons
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newSlide = {
                      image: '/images/hp-hero-1.png',
                      headline: 'Forged for Warriors.',
                      subtitle: 'Museum grade medieval armor and gear handcrafted by master artisans.',
                      ctaText: 'Explore the collection →',
                      ctaLink: '/shop',
                    };
                    setConfig({
                      ...config,
                      hero: { ...config.hero, slides: [...(config.hero?.slides || []), newSlide] },
                    });
                  }}
                  className="px-3.5 py-2 bg-[#1a1a18] hover:bg-[#2e2e2a] text-[#d4af37] border border-[#d4af37]/40 text-xs font-serif uppercase tracking-[1px] rounded-xl transition flex items-center gap-1.5 shadow"
                >
                  <Plus size={14} /> Add Slide
                </button>
              </div>

              <div className="space-y-6">
                {(config.hero?.slides || []).map((slide: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-[#1a1a18] border border-[#383834] hover:border-[#4d4d46] rounded-2xl p-4 sm:p-6 space-y-5 transition shadow-lg"
                  >
                    <div className="flex items-center justify-between border-b border-[#2d2d2a] pb-3">
                      <span className="font-serif text-xs uppercase tracking-[1.5px] text-[#d4af37] font-bold flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#d4af37]/20 text-[#d4af37] text-[10px] flex items-center justify-center font-mono">
                          {idx + 1}
                        </span>
                        Slide {idx + 1} Settings
                      </span>
                      {config.hero?.slides?.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = config.hero.slides.filter((_: any, i: number) => i !== idx);
                            setConfig({ ...config, hero: { ...config.hero, slides: updated } });
                          }}
                          className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-950/30 border border-red-800/30 transition"
                        >
                          <Trash2 size={13} /> Remove Slide
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">
                      {/* Image Preview & Upload */}
                      <div>
                        <label className="block font-serif text-[10px] uppercase tracking-[1px] text-[#c0b8ac] mb-2 font-bold">
                          Background Photo (16:9)
                        </label>
                        <div className="relative aspect-[16/9] rounded-xl overflow-hidden border-2 border-[#444440] hover:border-[#d4af37] bg-black group shadow-md transition">
                          <img src={slide.image} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                          <label className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1 cursor-pointer text-white text-xs">
                            <Upload size={20} className="text-[#d4af37]" />
                            <span className="font-serif uppercase tracking-[1px] text-[11px] font-bold">
                              Replace Image
                            </span>
                            <span className="text-[9px] text-[#8a8278]">JPG, PNG or WEBP</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const b64 = await fileToBase64(file);
                                  if (b64) {
                                    const updated = [...config.hero.slides];
                                    updated[idx].image = b64;
                                    setConfig({ ...config, hero: { ...config.hero, slides: updated } });
                                  }
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Text & Button Inputs */}
                      <div className="space-y-3.5">
                        <div>
                          <label className="block font-serif text-[10px] uppercase tracking-[1px] text-[#c0b8ac] mb-1 font-semibold">
                            Main Headline
                          </label>
                          <input
                            type="text"
                            value={slide.headline}
                            onChange={(e) => {
                              const updated = [...config.hero.slides];
                              updated[idx].headline = e.target.value;
                              setConfig({ ...config, hero: { ...config.hero, slides: updated } });
                            }}
                            className="w-full bg-[#242420] border border-[#444440] focus:border-[#d4af37] text-[#f5f0e8] rounded-xl px-3.5 py-2 text-sm outline-none transition"
                            placeholder="e.g. Crafted for history."
                          />
                        </div>

                        <div>
                          <label className="block font-serif text-[10px] uppercase tracking-[1px] text-[#c0b8ac] mb-1 font-semibold">
                            Subtitle / Description
                          </label>
                          <textarea
                            rows={2}
                            value={slide.subtitle}
                            onChange={(e) => {
                              const updated = [...config.hero.slides];
                              updated[idx].subtitle = e.target.value;
                              setConfig({ ...config, hero: { ...config.hero, slides: updated } });
                            }}
                            className="w-full bg-[#242420] border border-[#444440] focus:border-[#d4af37] text-[#f5f0e8] rounded-xl p-3 text-xs leading-relaxed outline-none transition"
                            placeholder="e.g. Discover museum-worthy armor, chainmail, leather goods..."
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-serif text-[10px] uppercase tracking-[1px] text-[#c0b8ac] mb-1 font-semibold">
                              Button CTA Text
                            </label>
                            <input
                              type="text"
                              value={slide.ctaText}
                              onChange={(e) => {
                                const updated = [...config.hero.slides];
                                updated[idx].ctaText = e.target.value;
                                setConfig({ ...config, hero: { ...config.hero, slides: updated } });
                              }}
                              className="w-full bg-[#242420] border border-[#444440] focus:border-[#d4af37] text-[#f5f0e8] rounded-xl px-3.5 py-2 text-xs outline-none transition"
                              placeholder="Explore the collection →"
                            />
                          </div>

                          <div>
                            <label className="block font-serif text-[10px] uppercase tracking-[1px] text-[#c0b8ac] mb-1 font-semibold">
                              Button Link URL
                            </label>
                            <input
                              type="text"
                              value={slide.ctaLink}
                              onChange={(e) => {
                                const updated = [...config.hero.slides];
                                updated[idx].ctaLink = e.target.value;
                                setConfig({ ...config, hero: { ...config.hero, slides: updated } });
                              }}
                              className="w-full bg-[#242420] border border-[#444440] focus:border-[#d4af37] text-[#f5f0e8] rounded-xl px-3.5 py-2 text-xs font-mono outline-none transition"
                              placeholder="/shop"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 2: CURATED PRODUCTS
           ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Search Filter for Product Pickers */}
            <div className="bg-[#1f1f1c] border border-[#383834] p-3 rounded-xl flex items-center gap-3">
              <Search className="text-[#8a8278] shrink-0" size={16} />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search catalog products by name or category for custom selection lists..."
                className="w-full bg-transparent text-[#f5f0e8] text-xs outline-none placeholder:text-[#666]"
              />
              {productSearch && (
                <button onClick={() => setProductSearch('')} className="text-[#8a8278] hover:text-white">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* 1. New Arrivals */}
            <div className="bg-[#242420] border border-[#383834] rounded-2xl p-4 sm:p-7 space-y-4 shadow-xl">
              <div className="border-b border-[#333330] pb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-serif text-[15px] sm:text-[18px] uppercase tracking-[1.5px] text-[#f5f0e8] font-bold flex items-center gap-2">
                    <ShoppingBag className="text-[#d4af37]" size={18} /> New Arrivals Strip
                  </h2>
                  <p className="text-[11px] sm:text-xs text-[#8a8278]">Horizontal sliding showcase on homepage</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-serif text-[10px] uppercase tracking-[1px] text-[#c0b8ac] mb-1 font-semibold">
                    Section Heading
                  </label>
                  <input
                    type="text"
                    value={config.newArrivals?.title || 'NEW ARRIVALS'}
                    onChange={(e) =>
                      setConfig({ ...config, newArrivals: { ...config.newArrivals, title: e.target.value } })
                    }
                    className="w-full bg-[#1a1a18] border border-[#444440] focus:border-[#d4af37] text-[#f5f0e8] rounded-xl px-3.5 py-2.5 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block font-serif text-[10px] uppercase tracking-[1px] text-[#c0b8ac] mb-1 font-semibold">
                    Selection Mode
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setConfig({ ...config, newArrivals: { ...config.newArrivals, mode: 'auto' } })
                      }
                      className={`flex-1 py-2 rounded-xl text-[11px] font-serif uppercase tracking-[1px] transition border ${
                        config.newArrivals?.mode !== 'manual'
                          ? 'bg-[#d4af37] text-[#1a1208] border-[#d4af37] font-bold shadow'
                          : 'bg-[#1a1a18] text-[#8a8278] border-[#383834]'
                      }`}
                    >
                      ⚡ Auto (Latest 'New')
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setConfig({ ...config, newArrivals: { ...config.newArrivals, mode: 'manual' } })
                      }
                      className={`flex-1 py-2 rounded-xl text-[11px] font-serif uppercase tracking-[1px] transition border ${
                        config.newArrivals?.mode === 'manual'
                          ? 'bg-[#d4af37] text-[#1a1208] border-[#d4af37] font-bold shadow'
                          : 'bg-[#1a1a18] text-[#8a8278] border-[#383834]'
                      }`}
                    >
                      🎯 Custom ({config.newArrivals?.productIds?.length || 0})
                    </button>
                  </div>
                </div>
              </div>

              {config.newArrivals?.mode === 'manual' && (
                <div className="pt-2 border-t border-[#333330] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#c0b8ac] font-serif uppercase tracking-[1px] font-bold">
                      Click products to select or unselect:
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setConfig({ ...config, newArrivals: { ...config.newArrivals, productIds: [] } })
                      }
                      className="text-[10px] text-red-400 hover:underline"
                    >
                      Clear Selection
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-64 overflow-y-auto p-2.5 bg-[#1a1a18] rounded-xl border border-[#383834]">
                    {filteredProducts.map((p) => {
                      const selected = (config.newArrivals?.productIds || []).includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            const curr = config.newArrivals?.productIds || [];
                            const next = selected ? curr.filter((id: string) => id !== p.id) : [...curr, p.id];
                            setConfig({ ...config, newArrivals: { ...config.newArrivals, productIds: next } });
                          }}
                          className={`p-2 rounded-xl border cursor-pointer transition select-none flex flex-col items-center text-center gap-1 relative ${
                            selected
                              ? 'border-[#d4af37] bg-[#2a2a22] shadow-sm'
                              : 'border-[#333330] bg-[#20201c] opacity-65 hover:opacity-100'
                          }`}
                        >
                          {selected && (
                            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#d4af37] text-[#1a1208] text-[9px] flex items-center justify-center font-bold">
                              ✓
                            </span>
                          )}
                          <img src={p.image} alt={p.name} className="w-14 h-14 object-cover rounded-lg" />
                          <span className="text-[10px] text-[#f5f0e8] line-clamp-1 font-medium">{p.name}</span>
                          <span className="text-[9px] text-[#d4af37] font-bold">₹{p.price.toLocaleString('en-IN')}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Top Selling */}
            <div className="bg-[#242420] border border-[#383834] rounded-2xl p-4 sm:p-7 space-y-4 shadow-xl">
              <div className="border-b border-[#333330] pb-3">
                <h2 className="font-serif text-[15px] sm:text-[18px] uppercase tracking-[1.5px] text-[#f5f0e8] font-bold flex items-center gap-2">
                  <Sparkles className="text-[#d4af37]" size={18} /> Top Selling Showcase
                </h2>
                <p className="text-[11px] sm:text-xs text-[#8a8278]">Grid of top-rated & most ordered items</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-serif text-[10px] uppercase tracking-[1px] text-[#c0b8ac] mb-1 font-semibold">
                    Section Heading
                  </label>
                  <input
                    type="text"
                    value={config.topSelling?.title || 'Top Selling'}
                    onChange={(e) =>
                      setConfig({ ...config, topSelling: { ...config.topSelling, title: e.target.value } })
                    }
                    className="w-full bg-[#1a1a18] border border-[#444440] focus:border-[#d4af37] text-[#f5f0e8] rounded-xl px-3.5 py-2.5 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block font-serif text-[10px] uppercase tracking-[1px] text-[#c0b8ac] mb-1 font-semibold">
                    Selection Mode
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, topSelling: { ...config.topSelling, mode: 'auto' } })}
                      className={`flex-1 py-2 rounded-xl text-[11px] font-serif uppercase tracking-[1px] transition border ${
                        config.topSelling?.mode !== 'manual'
                          ? 'bg-[#d4af37] text-[#1a1208] border-[#d4af37] font-bold shadow'
                          : 'bg-[#1a1a18] text-[#8a8278] border-[#383834]'
                      }`}
                    >
                      ⚡ Auto (Bestsellers)
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, topSelling: { ...config.topSelling, mode: 'manual' } })}
                      className={`flex-1 py-2 rounded-xl text-[11px] font-serif uppercase tracking-[1px] transition border ${
                        config.topSelling?.mode === 'manual'
                          ? 'bg-[#d4af37] text-[#1a1208] border-[#d4af37] font-bold shadow'
                          : 'bg-[#1a1a18] text-[#8a8278] border-[#383834]'
                      }`}
                    >
                      🎯 Custom ({config.topSelling?.productIds?.length || 0})
                    </button>
                  </div>
                </div>
              </div>

              {config.topSelling?.mode === 'manual' && (
                <div className="pt-2 border-t border-[#333330] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#c0b8ac] font-serif uppercase tracking-[1px] font-bold">
                      Select 6 Products for Top Selling Grid:
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setConfig({ ...config, topSelling: { ...config.topSelling, productIds: [] } })
                      }
                      className="text-[10px] text-red-400 hover:underline"
                    >
                      Clear Selection
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-64 overflow-y-auto p-2.5 bg-[#1a1a18] rounded-xl border border-[#383834]">
                    {filteredProducts.map((p) => {
                      const selected = (config.topSelling?.productIds || []).includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            const curr = config.topSelling?.productIds || [];
                            const next = selected ? curr.filter((id: string) => id !== p.id) : [...curr, p.id];
                            setConfig({ ...config, topSelling: { ...config.topSelling, productIds: next } });
                          }}
                          className={`p-2 rounded-xl border cursor-pointer transition select-none flex flex-col items-center text-center gap-1 relative ${
                            selected
                              ? 'border-[#d4af37] bg-[#2a2a22] shadow-sm'
                              : 'border-[#333330] bg-[#20201c] opacity-65 hover:opacity-100'
                          }`}
                        >
                          {selected && (
                            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#d4af37] text-[#1a1208] text-[9px] flex items-center justify-center font-bold">
                              ✓
                            </span>
                          )}
                          <img src={p.image} alt={p.name} className="w-14 h-14 object-cover rounded-lg" />
                          <span className="text-[10px] text-[#f5f0e8] line-clamp-1 font-medium">{p.name}</span>
                          <span className="text-[9px] text-[#d4af37] font-bold">₹{p.price.toLocaleString('en-IN')}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Shop the Look */}
            <div className="bg-[#242420] border border-[#383834] rounded-2xl p-4 sm:p-7 space-y-5 shadow-xl">
              <div className="border-b border-[#333330] pb-3">
                <h2 className="font-serif text-[15px] sm:text-[18px] uppercase tracking-[1.5px] text-[#f5f0e8] font-bold flex items-center gap-2">
                  <Layers className="text-[#d4af37]" size={18} /> Shop the Look (Curated Set)
                </h2>
                <p className="text-[11px] sm:text-xs text-[#8a8278]">
                  Full outfit showcase with instant add-to-cart slots
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5">
                {/* Lookbook Picture */}
                <div>
                  <label className="block font-serif text-[10px] uppercase tracking-[1px] text-[#c0b8ac] mb-2 font-bold">
                    Main Lifestyle Photo
                  </label>
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-[#444440] hover:border-[#d4af37] bg-black group shadow-md transition">
                    <img
                      src={config.shopTheLook?.mainImage || '/images/hp-stl-main.png'}
                      alt="Lookbook"
                      className="w-full h-full object-cover"
                    />
                    <label className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1 cursor-pointer text-white text-xs">
                      <Upload size={20} className="text-[#d4af37]" />
                      <span className="font-serif uppercase tracking-[1px] text-[11px] font-bold">Replace Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const b64 = await fileToBase64(file);
                            if (b64) {
                              setConfig({
                                ...config,
                                shopTheLook: { ...config.shopTheLook, mainImage: b64 },
                              });
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Attire Details & 4 Curated Products */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-serif text-[10px] uppercase tracking-[1px] text-[#c0b8ac] mb-1 font-semibold">
                        Attire Heading
                      </label>
                      <input
                        type="text"
                        value={config.shopTheLook?.featuredAttireTitle || 'The Gothic Knight Commander'}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            shopTheLook: { ...config.shopTheLook, featuredAttireTitle: e.target.value },
                          })
                        }
                        className="w-full bg-[#1a1a18] border border-[#444440] focus:border-[#d4af37] text-[#f5f0e8] rounded-xl px-3.5 py-2 text-sm outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-serif text-[10px] uppercase tracking-[1px] text-[#c0b8ac] mb-1 font-semibold">
                        Attire Badge
                      </label>
                      <input
                        type="text"
                        value={config.shopTheLook?.featuredAttireBadge || 'FEATURED ATTIRE'}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            shopTheLook: { ...config.shopTheLook, featuredAttireBadge: e.target.value },
                          })
                        }
                        className="w-full bg-[#1a1a18] border border-[#444440] focus:border-[#d4af37] text-[#f5f0e8] rounded-xl px-3.5 py-2 text-sm outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-serif text-[10px] uppercase tracking-[1px] text-[#c0b8ac] mb-1 font-semibold">
                      Attire Description
                    </label>
                    <textarea
                      rows={2}
                      value={config.shopTheLook?.featuredAttireDesc || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          shopTheLook: { ...config.shopTheLook, featuredAttireDesc: e.target.value },
                        })
                      }
                      className="w-full bg-[#1a1a18] border border-[#444440] focus:border-[#d4af37] text-[#f5f0e8] rounded-xl p-3 text-xs leading-relaxed outline-none"
                    />
                  </div>

                  {/* 4 Selected Products */}
                  <div>
                    <label className="block font-serif text-[10px] uppercase tracking-[1px] text-[#c0b8ac] mb-2 font-semibold">
                      Select 4 Items in Outfit Set:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      {[0, 1, 2, 3].map((slotIdx) => {
                        const currentId = (config.shopTheLook?.productIds || [])[slotIdx] || '';
                        const currentProduct = products.find((p) => p.id === currentId);
                        return (
                          <div key={slotIdx} className="bg-[#1a1a18] p-3 rounded-xl border border-[#383834] space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase font-serif text-[#d4af37] font-bold">
                                Slot {slotIdx + 1}
                              </span>
                              {currentProduct && (
                                <span className="text-[10px] text-emerald-400 font-bold">
                                  ₹{currentProduct.price.toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>
                            <select
                              value={currentId}
                              onChange={(e) => {
                                const nextIds = [...(config.shopTheLook?.productIds || [])];
                                nextIds[slotIdx] = e.target.value;
                                setConfig({
                                  ...config,
                                  shopTheLook: { ...config.shopTheLook, productIds: nextIds },
                                });
                              }}
                              className="w-full bg-[#242420] border border-[#444440] focus:border-[#d4af37] text-[#f5f0e8] rounded-lg px-2 py-2 text-xs truncate outline-none"
                            >
                              <option value="">-- Choose Product --</option>
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} (₹{p.price})
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 3: CATEGORIES, REALMS & MATERIALS
           ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'categories' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* 1. The Zafex Collection Category Cards */}
            <div className="bg-[#242420] border border-[#383834] rounded-2xl p-4 sm:p-7 space-y-4 shadow-xl">
              <div className="border-b border-[#333330] pb-3">
                <h2 className="font-serif text-[15px] sm:text-[18px] uppercase tracking-[1.5px] text-[#f5f0e8] font-bold flex items-center gap-2">
                  <Layers className="text-[#d4af37]" size={18} /> The Zafex Collection (8 Horizontal Cards)
                </h2>
                <p className="text-[11px] sm:text-xs text-[#8a8278]">
                  Horizontal scrollable categories on the storefront
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(config.zafexCollection?.items || []).map((item: any, idx: number) => (
                  <div key={idx} className="bg-[#1a1a18] border border-[#383834] rounded-xl p-3.5 space-y-2.5 shadow">
                    <div className="relative aspect-[16/10] rounded-lg overflow-hidden border border-[#444440] group bg-black">
                      <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                      <label className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1 cursor-pointer text-white text-xs">
                        <Upload size={16} className="text-[#d4af37]" />
                        <span className="font-serif uppercase tracking-[1px] text-[10px] font-bold">Change Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const b64 = await fileToBase64(file);
                              if (b64) {
                                const updated = [...config.zafexCollection.items];
                                updated[idx].img = b64;
                                setConfig({
                                  ...config,
                                  zafexCollection: { ...config.zafexCollection, items: updated },
                                });
                              }
                            }
                          }}
                        />
                      </label>
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase font-serif text-[#8a8278] mb-0.5">Category Name</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => {
                          const updated = [...config.zafexCollection.items];
                          updated[idx].name = e.target.value;
                          setConfig({
                            ...config,
                            zafexCollection: { ...config.zafexCollection, items: updated },
                          });
                        }}
                        className="w-full bg-[#242420] border border-[#444440] focus:border-[#d4af37] text-[#f5f0e8] rounded-lg px-2.5 py-1.5 text-xs font-serif uppercase tracking-[1px] font-bold outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase font-serif text-[#8a8278] mb-0.5">Redirect URL</label>
                      <input
                        type="text"
                        value={item.href}
                        onChange={(e) => {
                          const updated = [...config.zafexCollection.items];
                          updated[idx].href = e.target.value;
                          setConfig({
                            ...config,
                            zafexCollection: { ...config.zafexCollection, items: updated },
                          });
                        }}
                        className="w-full bg-[#242420] border border-[#444440] text-[#8a8278] rounded-lg px-2.5 py-1 text-[11px] font-mono outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Shop by Material Selection */}
            <div className="bg-[#242420] border border-[#383834] rounded-2xl p-4 sm:p-7 space-y-4 shadow-xl">
              <div className="border-b border-[#333330] pb-3">
                <h2 className="font-serif text-[15px] sm:text-[18px] uppercase tracking-[1.5px] text-[#f5f0e8] font-bold flex items-center gap-2">
                  <Sliders className="text-[#d4af37]" size={18} /> Shop by Material Cards (6 Materials)
                </h2>
                <p className="text-[11px] sm:text-xs text-[#8a8278]">
                  Iron, Stainless Steel, Brass, Genuine Leather, Cotton, Aluminum
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(config.shopByMaterial?.materials || []).map((mat: any, idx: number) => (
                  <div key={idx} className="bg-[#1a1a18] border border-[#383834] rounded-xl p-4 space-y-3 shadow">
                    <div className="relative aspect-[16/9] rounded-lg overflow-hidden border border-[#444440] group bg-black">
                      <img src={mat.image} alt={mat.name} className="w-full h-full object-cover" />
                      <label className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1 cursor-pointer text-white text-xs">
                        <Upload size={18} className="text-[#d4af37]" />
                        <span className="font-serif uppercase tracking-[1px] text-[11px] font-bold">Replace Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const b64 = await fileToBase64(file);
                              if (b64) {
                                const updated = [...config.shopByMaterial.materials];
                                updated[idx].image = b64;
                                setConfig({
                                  ...config,
                                  shopByMaterial: { ...config.shopByMaterial, materials: updated },
                                });
                              }
                            }
                          }}
                        />
                      </label>
                    </div>

                    <input
                      type="text"
                      value={mat.name}
                      onChange={(e) => {
                        const updated = [...config.shopByMaterial.materials];
                        updated[idx].name = e.target.value;
                        setConfig({
                          ...config,
                          shopByMaterial: { ...config.shopByMaterial, materials: updated },
                        });
                      }}
                      className="w-full bg-[#242420] border border-[#444440] focus:border-[#d4af37] text-[#f5f0e8] rounded-lg px-3 py-1.5 text-xs font-serif uppercase tracking-[1px] font-bold outline-none"
                    />

                    <textarea
                      rows={2}
                      value={mat.description}
                      onChange={(e) => {
                        const updated = [...config.shopByMaterial.materials];
                        updated[idx].description = e.target.value;
                        setConfig({
                          ...config,
                          shopByMaterial: { ...config.shopByMaterial, materials: updated },
                        });
                      }}
                      className="w-full bg-[#242420] border border-[#444440] focus:border-[#d4af37] text-[#c0b8ac] rounded-lg p-2.5 text-xs leading-relaxed outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 4: HERITAGE, STORY & TRUST
           ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'story' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* About Zafex / Heritage */}
            <div className="bg-[#242420] border border-[#383834] rounded-2xl p-4 sm:p-7 space-y-5 shadow-xl">
              <div className="border-b border-[#333330] pb-3">
                <h2 className="font-serif text-[15px] sm:text-[18px] uppercase tracking-[1.5px] text-[#f5f0e8] font-bold flex items-center gap-2">
                  <Award className="text-[#d4af37]" size={18} /> The Zafex Legacy / About Us Section
                </h2>
                <p className="text-[11px] sm:text-xs text-[#8a8278]">
                  Workshop spotlight story and artisan craftsmanship values
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
                <div>
                  <label className="block font-serif text-[10px] uppercase tracking-[1px] text-[#c0b8ac] mb-2 font-bold">
                    Workshop Feature Photo
                  </label>
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-[#444440] hover:border-[#d4af37] bg-black group shadow-md transition">
                    <img
                      src={config.aboutZafex?.image || '/images/hp-stl-main.png'}
                      alt="About"
                      className="w-full h-full object-cover"
                    />
                    <label className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1 cursor-pointer text-white text-xs">
                      <Upload size={20} className="text-[#d4af37]" />
                      <span className="font-serif uppercase tracking-[1px] text-[11px] font-bold">Replace Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const b64 = await fileToBase64(file);
                            if (b64) {
                              setConfig({
                                ...config,
                                aboutZafex: { ...config.aboutZafex, image: b64 },
                              });
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-serif text-[10px] uppercase tracking-[1px] text-[#c0b8ac] mb-1 font-semibold">
                        Badge Text
                      </label>
                      <input
                        type="text"
                        value={config.aboutZafex?.badge || 'THE ZAFEX LEGACY'}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            aboutZafex: { ...config.aboutZafex, badge: e.target.value },
                          })
                        }
                        className="w-full bg-[#1a1a18] border border-[#444440] focus:border-[#d4af37] text-[#f5f0e8] rounded-xl px-3.5 py-2 text-xs outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-serif text-[10px] uppercase tracking-[1px] text-[#c0b8ac] mb-1 font-semibold">
                        Main Heading
                      </label>
                      <input
                        type="text"
                        value={config.aboutZafex?.title || 'About Zafex Collectibles'}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            aboutZafex: { ...config.aboutZafex, title: e.target.value },
                          })
                        }
                        className="w-full bg-[#1a1a18] border border-[#444440] focus:border-[#d4af37] text-[#f5f0e8] rounded-xl px-3.5 py-2 text-xs font-bold outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-serif text-[10px] uppercase tracking-[1px] text-[#c0b8ac] mb-1 font-semibold">
                      Story Paragraph 1
                    </label>
                    <textarea
                      rows={3}
                      value={config.aboutZafex?.paragraph1 || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          aboutZafex: { ...config.aboutZafex, paragraph1: e.target.value },
                        })
                      }
                      className="w-full bg-[#1a1a18] border border-[#444440] focus:border-[#d4af37] text-[#f5f0e8] rounded-xl p-3 text-xs leading-relaxed outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-serif text-[10px] uppercase tracking-[1px] text-[#c0b8ac] mb-1 font-semibold">
                      Story Paragraph 2
                    </label>
                    <textarea
                      rows={2}
                      value={config.aboutZafex?.paragraph2 || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          aboutZafex: { ...config.aboutZafex, paragraph2: e.target.value },
                        })
                      }
                      className="w-full bg-[#1a1a18] border border-[#444440] focus:border-[#d4af37] text-[#f5f0e8] rounded-xl p-3 text-xs leading-relaxed outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Strip (4 Pillars) */}
            <div className="bg-[#242420] border border-[#383834] rounded-2xl p-4 sm:p-7 space-y-4 shadow-xl">
              <div className="border-b border-[#333330] pb-3">
                <h2 className="font-serif text-[15px] sm:text-[18px] uppercase tracking-[1.5px] text-[#f5f0e8] font-bold flex items-center gap-2">
                  <Globe className="text-[#d4af37]" size={18} /> Trust & Guarantee Strip (4 Pillars)
                </h2>
                <p className="text-[11px] sm:text-xs text-[#8a8278]">
                  Value propositions displayed across the footer area
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(config.trustStrip?.items || []).map((item: any, idx: number) => (
                  <div key={idx} className="bg-[#1a1a18] border border-[#383834] rounded-xl p-4 space-y-2 shadow">
                    <span className="text-[10px] font-serif text-[#d4af37] font-bold uppercase block">
                      Benefit {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => {
                        const updated = [...config.trustStrip.items];
                        updated[idx].title = e.target.value;
                        setConfig({ ...config, trustStrip: { ...config.trustStrip, items: updated } });
                      }}
                      className="w-full bg-[#242420] border border-[#444440] focus:border-[#d4af37] text-[#f5f0e8] rounded-lg px-3 py-1.5 text-xs font-serif uppercase tracking-[1px] font-bold outline-none"
                    />
                    <textarea
                      rows={2}
                      value={item.desc}
                      onChange={(e) => {
                        const updated = [...config.trustStrip.items];
                        updated[idx].desc = e.target.value;
                        setConfig({ ...config, trustStrip: { ...config.trustStrip, items: updated } });
                      }}
                      className="w-full bg-[#242420] border border-[#444440] focus:border-[#d4af37] text-[#8a8278] rounded-lg p-2 text-xs leading-relaxed outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 5: REVIEWS, INSTAGRAM & NEWSLETTER
           ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'social' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Customer Reviews Spotlight */}
            <div className="bg-[#242420] border border-[#383834] rounded-2xl p-4 sm:p-7 space-y-4 shadow-xl">
              <div className="border-b border-[#333330] pb-3">
                <h2 className="font-serif text-[15px] sm:text-[18px] uppercase tracking-[1.5px] text-[#f5f0e8] font-bold flex items-center gap-2">
                  <Camera className="text-[#d4af37]" size={18} /> Featured Customer Experiences
                </h2>
                <p className="text-[11px] sm:text-xs text-[#8a8278]">Authentic buyer reviews and buyer photos</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(config.customerReviews?.reviews || []).map((rev: any, idx: number) => (
                  <div key={idx} className="bg-[#1a1a18] border border-[#383834] rounded-xl p-4 space-y-3 shadow">
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-[#444440] group bg-black">
                      <img src={rev.image} alt={rev.name} className="w-full h-full object-cover" />
                      <label className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1 cursor-pointer text-white text-xs">
                        <Upload size={16} className="text-[#d4af37]" />
                        <span className="font-serif uppercase tracking-[1px] text-[10px] font-bold">Replace Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const b64 = await fileToBase64(file);
                              if (b64) {
                                const updated = [...config.customerReviews.reviews];
                                updated[idx].image = b64;
                                setConfig({
                                  ...config,
                                  customerReviews: { ...config.customerReviews, reviews: updated },
                                });
                              }
                            }
                          }}
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={rev.name}
                        placeholder="Name"
                        onChange={(e) => {
                          const updated = [...config.customerReviews.reviews];
                          updated[idx].name = e.target.value;
                          setConfig({
                            ...config,
                            customerReviews: { ...config.customerReviews, reviews: updated },
                          });
                        }}
                        className="w-full bg-[#242420] border border-[#444440] focus:border-[#d4af37] text-[#f5f0e8] rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none"
                      />
                      <input
                        type="text"
                        value={rev.flag}
                        placeholder="Country"
                        onChange={(e) => {
                          const updated = [...config.customerReviews.reviews];
                          updated[idx].flag = e.target.value;
                          setConfig({
                            ...config,
                            customerReviews: { ...config.customerReviews, reviews: updated },
                          });
                        }}
                        className="w-full bg-[#242420] border border-[#444440] focus:border-[#d4af37] text-[#c0b8ac] rounded-lg px-2.5 py-1.5 text-xs outline-none"
                      />
                    </div>

                    <textarea
                      rows={3}
                      value={rev.text}
                      placeholder="Quote"
                      onChange={(e) => {
                        const updated = [...config.customerReviews.reviews];
                        updated[idx].text = e.target.value;
                        setConfig({
                          ...config,
                          customerReviews: { ...config.customerReviews, reviews: updated },
                        });
                      }}
                      className="w-full bg-[#242420] border border-[#444440] focus:border-[#d4af37] text-[#f5f0e8] rounded-lg p-2.5 text-xs leading-relaxed outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Instagram 7-Photo Grid */}
            <div className="bg-[#242420] border border-[#383834] rounded-2xl p-4 sm:p-7 space-y-4 shadow-xl">
              <div className="border-b border-[#333330] pb-3">
                <h2 className="font-serif text-[15px] sm:text-[18px] uppercase tracking-[1.5px] text-[#f5f0e8] font-bold flex items-center gap-2">
                  <Camera className="text-[#d4af37]" size={18} /> Instagram 7-Photo Social Grid
                </h2>
                <p className="text-[11px] sm:text-xs text-[#8a8278]">Square photo gallery before footer</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {(config.instagramGrid?.images || []).map((imgUrl: string, idx: number) => (
                  <div key={idx} className="space-y-1.5">
                    <span className="text-[9px] font-serif uppercase tracking-[1px] text-[#c0b8ac] font-bold block text-center">
                      Slot {idx + 1}
                    </span>
                    <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-[#444440] hover:border-[#d4af37] bg-black group shadow transition">
                      <img src={imgUrl} alt={`Insta ${idx + 1}`} className="w-full h-full object-cover" />
                      <label className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1 cursor-pointer text-white text-[10px]">
                        <Upload size={16} className="text-[#d4af37]" />
                        <span className="font-serif uppercase tracking-[1px] font-bold">Replace</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const b64 = await fileToBase64(file);
                              if (b64) {
                                const updated = [...config.instagramGrid.images];
                                updated[idx] = b64;
                                setConfig({
                                  ...config,
                                  instagramGrid: { ...config.instagramGrid, images: updated },
                                });
                              }
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="bg-[#242420] border border-[#383834] rounded-2xl p-4 sm:p-7 space-y-4 shadow-xl">
              <div className="border-b border-[#333330] pb-3">
                <h2 className="font-serif text-[15px] sm:text-[18px] uppercase tracking-[1.5px] text-[#f5f0e8] font-bold flex items-center gap-2">
                  <Mail className="text-[#d4af37]" size={18} /> Newsletter Subscription Banner
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-serif text-[10px] uppercase tracking-[1px] text-[#c0b8ac] mb-1 font-semibold">
                    Newsletter Heading
                  </label>
                  <input
                    type="text"
                    value={config.newsletter?.title || 'JOIN THE ZAFEX CIRCLE'}
                    onChange={(e) =>
                      setConfig({ ...config, newsletter: { ...config.newsletter, title: e.target.value } })
                    }
                    className="w-full bg-[#1a1a18] border border-[#444440] focus:border-[#d4af37] text-[#f5f0e8] rounded-xl px-3.5 py-2.5 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block font-serif text-[10px] uppercase tracking-[1px] text-[#c0b8ac] mb-1 font-semibold">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={config.newsletter?.buttonText || 'SUBSCRIBE'}
                    onChange={(e) =>
                      setConfig({ ...config, newsletter: { ...config.newsletter, buttonText: e.target.value } })
                    }
                    className="w-full bg-[#1a1a18] border border-[#444440] focus:border-[#d4af37] text-[#f5f0e8] rounded-xl px-3.5 py-2.5 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-serif text-[10px] uppercase tracking-[1px] text-[#c0b8ac] mb-1 font-semibold">
                  Newsletter Subtitle
                </label>
                <textarea
                  rows={2}
                  value={config.newsletter?.subtitle || ''}
                  onChange={(e) =>
                    setConfig({ ...config, newsletter: { ...config.newsletter, subtitle: e.target.value } })
                  }
                  className="w-full bg-[#1a1a18] border border-[#444440] focus:border-[#d4af37] text-[#f5f0e8] rounded-xl p-3 text-xs leading-relaxed outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
