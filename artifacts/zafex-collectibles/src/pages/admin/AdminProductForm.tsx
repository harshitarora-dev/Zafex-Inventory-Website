import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Upload, X, Loader2, Tag, Percent } from 'lucide-react';
import AdminLayout from './AdminLayout';
import {
  createAdminProduct,
  updateAdminProduct,
  getAdminProduct,
  type AdminProduct,
} from '@/lib/adminApi';

const CATEGORIES = [
  {
    value: 'chainmail-armor',
    label: 'Chainmail Armor',
    subs: [
      { value: 'chainmail-shirts-hauberks', label: 'Chainmail Shirts & Hauberks' },
      { value: 'chainmail-coifs-hood', label: 'Chainmail Coifs & Hood' },
      { value: 'chainmail-aventails', label: 'Chainmail Aventails' },
      { value: 'chainmail-tops-bras', label: 'Chainmail Tops & Bras' },
      { value: 'chainmail-leggings-skirts', label: 'Chainmail Leggings & Skirts' },
      { value: 'chainmail-belts', label: 'Chainmail Belts' },
      { value: 'chainmail-gloves-sleeves', label: 'Chainmail Gloves & Sleeves' },
      { value: 'chainmail-accessories', label: 'Chainmail Accessories' },
    ],
  },
  {
    value: 'medieval-helmets',
    label: 'Medieval Helmets',
    subs: [
      { value: 'templar-helmets', label: 'Templar Helmets' },
      { value: 'great-helmets', label: 'Great Helmets' },
      { value: 'bascinet-helmets', label: 'Bascinet Helmets' },
      { value: 'barbute-helmets', label: 'Barbute Helmets' },
      { value: 'sugarloaf-helmets', label: 'Sugarloaf Helmets' },
      { value: 'viking-helmets', label: 'Viking Helmets' },
      { value: 'norman-helmets', label: 'Norman Helmets' },
      { value: 'spangenhelm', label: 'Spangenhelm' },
      { value: 'roman-helmets', label: 'Roman Helmets' },
      { value: 'gladiator-helmets', label: 'Gladiator Helmets' },
      { value: 'crusader-helmets', label: 'Crusader Helmets' },
      { value: 'fantasy-helmets', label: 'Fantasy Helmets' },
    ],
  },
  {
    value: 'plate-armor',
    label: 'Plate Armor',
    subs: [
      { value: 'breastplates', label: 'Breastplates' },
      { value: 'cuirasses', label: 'Cuirasses' },
      { value: 'pauldrons', label: 'Pauldrons' },
      { value: 'gorgets', label: 'Gorgets' },
      { value: 'vambraces', label: 'Vambraces' },
      { value: 'gauntlets', label: 'Gauntlets' },
      { value: 'greaves', label: 'Greaves' },
      { value: 'sabatons', label: 'Sabatons' },
      { value: 'full-armor-sets', label: 'Full Armor Sets' },
    ],
  },
  {
    value: 'leather-armor',
    label: 'Leather Armor',
    subs: [
      { value: 'leather-chest-armor', label: 'Leather Chest Armor' },
      { value: 'leather-bracers', label: 'Leather Bracers' },
      { value: 'leather-gorgets', label: 'Leather Gorgets' },
      { value: 'leather-pauldrons', label: 'Leather Pauldrons' },
      { value: 'leather-belts', label: 'Leather Belts' },
      { value: 'leather-bags-pouches', label: 'Leather Bags & Pouches' },
      { value: 'leather-accessories', label: 'Leather Accessories' },
    ],
  },
  {
    value: 'gambesons',
    label: 'Gambesons & Padding',
    subs: [
      { value: 'gambesons', label: 'Gambesons' },
      { value: 'padded-jackets', label: 'Padded Jackets' },
      { value: 'arming-doublets', label: 'Arming Doublets' },
    ],
  },
  {
    value: 'medieval-clothing',
    label: 'Medieval Clothing',
    subs: [
      { value: 'tunics', label: 'Tunics' },
      { value: 'surcoats', label: 'Surcoats' },
      { value: 'cloaks', label: 'Cloaks' },
      { value: 'capes', label: 'Capes' },
      { value: 'pants-shirts', label: 'Pants & Shirts' },
      { value: 'dresses', label: 'Dresses' },
      { value: 'viking-clothing', label: 'Viking Clothing' },
      { value: 'roman-clothing', label: 'Roman Clothing' },
    ],
  },
  {
    value: 'roman-collection',
    label: 'Roman Collection',
    subs: [
      { value: 'roman-armor', label: 'Roman Armor' },
      { value: 'lorica-segmentata', label: 'Lorica Segmentata' },
      { value: 'roman-helmets', label: 'Roman Helmets' },
      { value: 'roman-shields', label: 'Roman Shields' },
      { value: 'roman-belts', label: 'Roman Belts' },
      { value: 'roman-accessories', label: 'Roman Accessories' },
    ],
  },
  {
    value: 'viking-collection',
    label: 'Viking Collection',
    subs: [
      { value: 'viking-armor', label: 'Viking Armor' },
      { value: 'viking-helmets', label: 'Viking Helmets' },
      { value: 'viking-shields', label: 'Viking Shields' },
      { value: 'viking-clothing', label: 'Viking Clothing' },
      { value: 'viking-belts', label: 'Viking Belts' },
      { value: 'viking-accessories', label: 'Viking Accessories' },
    ],
  },
  {
    value: 'shields',
    label: 'Shields',
    subs: [
      { value: 'wooden-shields', label: 'Wooden Shields' },
      { value: 'viking-shields', label: 'Viking Shields' },
      { value: 'roman-shields', label: 'Roman Shields' },
      { value: 'heater-shields', label: 'Heater Shields' },
      { value: 'round-shields', label: 'Round Shields' },
      { value: 'templar-shields', label: 'Templar Shields' },
    ],
  },
  {
    value: 'weapons',
    label: 'Weapons & Swords',
    subs: [
      { value: 'swords-daggers', label: 'Swords & Daggers' },
      { value: 'axes-maces', label: 'Axes & Maces' },
      { value: 'spears', label: 'Spears' },
    ],
  },
  {
    value: 'larp-cosplay',
    label: 'LARP & Cosplay',
    subs: [
      { value: 'larp-armor', label: 'LARP Armor' },
      { value: 'cosplay-costumes', label: 'Cosplay Costumes' },
      { value: 'fantasy-armor', label: 'Fantasy Armor' },
      { value: 'fantasy-helmets', label: 'Fantasy Helmets' },
      { value: 'accessories', label: 'Accessories' },
    ],
  },
  {
    value: 'accessories',
    label: 'Accessories',
    subs: [
      { value: 'belts', label: 'Belts' },
      { value: 'bags', label: 'Bags' },
      { value: 'pouches', label: 'Pouches' },
      { value: 'drinking-horns', label: 'Drinking Horns' },
      { value: 'tankards', label: 'Tankards' },
      { value: 'jewelry', label: 'Jewelry' },
      { value: 'medieval-gifts', label: 'Medieval Gifts' },
    ],
  },
  {
    value: 'custom-orders',
    label: 'Custom Orders',
    subs: [
      { value: 'custom-armor', label: 'Custom Armor' },
      { value: 'custom-chainmail', label: 'Custom Chainmail' },
      { value: 'custom-helmets', label: 'Custom Helmets' },
      { value: 'custom-leather-armor', label: 'Custom Leather Armor' },
      { value: 'museum-replicas', label: 'Museum Replicas' },
    ],
  },
  {
    value: 'collections',
    label: 'Curated Collections',
    subs: [
      { value: 'best-sellers', label: 'Best Sellers' },
      { value: 'movie-inspired', label: 'Movie Inspired' },
      { value: 'limited-edition', label: 'Limited Edition' },
      { value: 'historical-accurate', label: 'Historical Accurate' },
    ],
  },
  {
    value: 'custom',
    label: 'Other / Custom Category',
    subs: [
      { value: 'custom', label: 'Custom Sub-Category' },
    ],
  },
];

interface Props {
  mode: 'create' | 'edit';
  id?: string;
}

interface FormState {
  name: string;
  cat: string;
  sub: string;
  mrp: string;
  discount: string;
  price: string;
  badge: string;
  desc: string;
  tags: string;
  inStock: boolean;
}

const EMPTY: FormState = {
  name: '',
  cat: 'medieval-helmets',
  sub: 'templar-helmets',
  mrp: '',
  discount: '',
  price: '',
  badge: '',
  desc: '',
  tags: '',
  inStock: true,
};

export default function AdminProductForm({ mode, id }: Props) {
  const [, navigate] = useLocation();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [loadingProduct, setLoadingProduct] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const availableSubs =
    CATEGORIES.find((c) => c.value === form.cat)?.subs ?? [];

  // Load existing product when editing
  useEffect(() => {
    if (mode !== 'edit' || !id) return;
    getAdminProduct(id)
      .then((product: AdminProduct) => {
        setForm({
          name: product.name,
          cat: product.cat,
          sub: product.sub,
          mrp: product.mrp ? String(product.mrp) : '',
          discount: product.discount ? String(product.discount) : '',
          price: String(product.price),
          badge: product.badge ?? '',
          desc: product.desc ?? '',
          tags: (product.tags ?? []).join(', '),
          inStock: product.inStock,
        });
        setImagePreview(product.image);
        if (product.gallery && Array.isArray(product.gallery)) {
          setGalleryPreviews(product.gallery);
        } else if (product.image) {
          setGalleryPreviews([product.image]);
        }
      })
      .catch(() => setError('Unable to load product details. Please refresh the page.'))
      .finally(() => setLoadingProduct(false));
  }, [mode, id]);

  // Reset sub when category changes
  function handleCatChange(cat: string) {
    const first = CATEGORIES.find((c) => c.value === cat)?.subs[0]?.value ?? '';
    setForm((f) => ({ ...f, cat, sub: first }));
  }

  // Real-time discount calculation helper
  const mrpNum = Number(form.mrp) || 0;
  const priceNum = Number(form.price) || 0;
  const calculatedDiscount =
    mrpNum > 0 && priceNum > 0 && mrpNum > priceNum
      ? Math.round(((mrpNum - priceNum) / mrpNum) * 100)
      : 0;
  const savings = mrpNum > priceNum ? mrpNum - priceNum : 0;

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
          const MAX_DIM = 1400;
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
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.88));
          } else {
            resolve(dataUrl);
          }
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  }

  async function handleFileChange(file: File | null) {
    if (!file) return;
    const b64 = await fileToBase64(file);
    if (!b64) return;
    setImageFile(null); // use optimized Base64
    setImagePreview(b64);
    setGalleryPreviews((prev) => {
      if (prev.includes(b64)) return prev;
      return [b64, ...prev.filter((p) => p !== imagePreview)];
    });
  }

  async function handleGalleryAdd(files: FileList | null) {
    if (!files || files.length === 0) return;
    const newB64s: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const b64 = await fileToBase64(file);
        if (b64) newB64s.push(b64);
      }
    }
    setGalleryPreviews((prev) => [...prev, ...newB64s]);
    if (!imagePreview && newB64s.length > 0) {
      setImagePreview(newB64s[0]);
    }
  }

  function removeGalleryImage(idxToRemove: number) {
    setGalleryPreviews((prev) => {
      const removedItem = prev[idxToRemove];
      const updated = prev.filter((_, i) => i !== idxToRemove);
      if (imagePreview === removedItem) {
        setImagePreview(updated[0] || '');
      }
      return updated;
    });
  }

  function setAsMainImage(b64: string) {
    setImagePreview(b64);
  }

  // Drag-and-drop
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) handleFileChange(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Please provide a product title/name.');
      return;
    }
    if (!form.cat || !form.sub) {
      setError('Please select a valid category and subcategory.');
      return;
    }
    if (!form.price && !form.mrp) {
      setError('Please enter the selling price or MRP.');
      return;
    }
    if (!imagePreview && galleryPreviews.length === 0) {
      setError('Please upload at least one product photo.');
      return;
    }

    setSaving(true);
    setError('');

    const allGalleryImages = galleryPreviews.length > 0 ? galleryPreviews : (imagePreview ? [imagePreview] : []);
    const mainImg = imagePreview || (allGalleryImages.length > 0 ? allGalleryImages[0] : '');

    const payload = {
      name: form.name.trim(),
      cat: form.cat,
      sub: form.sub,
      price: Number(form.price || form.mrp),
      mrp: form.mrp ? Number(form.mrp) : null,
      discount: calculatedDiscount,
      badge: form.badge || null,
      desc: form.desc || null,
      tags: form.tags,
      inStock: form.inStock,
      image: mainImg,
      gallery: allGalleryImages,
    };

    try {
      if (mode === 'create') {
        await createAdminProduct(payload);
      } else {
        await updateAdminProduct(id!, payload);
      }
      navigate('/admin/products');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to save product. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    'w-full bg-white border border-[#e2ddd8] text-[#1a1a18] text-[14px] px-4 py-3 rounded-md outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/20 transition-colors';
  const labelClass = 'block text-[12px] font-semibold uppercase tracking-[1px] text-[#6b6b6b] mb-2';

  if (loadingProduct) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 size={28} className="animate-spin text-[#d4af37]" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8 max-w-[840px]">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/admin/products')}
            className="p-2 rounded-md text-[#8a8278] hover:bg-[#e8e4de] hover:text-[#1a1a18] transition-colors"
          >
            <ArrowLeft size={18} strokeWidth={2} />
          </button>
          <div>
            <h1 className="font-serif text-[26px] text-[#1a1a18] tracking-tight">
              {mode === 'create' ? 'New Product' : 'Edit Product'}
            </h1>
            {mode === 'edit' && id && (
              <p className="text-[#8a8278] text-[12px] font-mono mt-0.5">{id}</p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LEFT column */}
            <div className="space-y-5">
              {/* Product Photos / Gallery */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className={labelClass}>Product Photos & Gallery *</label>
                  <span className="text-[11px] text-[#8a8278] font-sans">
                    {galleryPreviews.length} {galleryPreviews.length === 1 ? 'photo' : 'photos'} uploaded
                  </span>
                </div>

                {/* Main Featured Photo Box */}
                <div
                  ref={dropRef}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileRef.current?.click()}
                  className="relative aspect-square w-full rounded-lg border-2 border-dashed border-[#d4cfc8] hover:border-[#d4af37] bg-white transition-colors cursor-pointer overflow-hidden flex flex-col items-center justify-center p-4"
                >
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="Featured Photo"
                        className="w-full h-full object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageFile(null);
                          setImagePreview('');
                        }}
                        className="absolute top-2 right-2 bg-[#1a1a18]/70 hover:bg-[#1a1a18] text-white rounded-full p-1.5 transition-colors shadow"
                        title="Remove main photo"
                      >
                        <X size={14} />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-[#1a1a18]/70 text-[#d4af37] text-[10px] uppercase font-bold tracking-[1px] px-2.5 py-1 rounded">
                        ★ Main Cover Photo
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-[#aaa]">
                      <Upload size={30} strokeWidth={1.5} />
                      <div className="text-[12px] text-center leading-relaxed">
                        <span className="text-[#d4af37] font-semibold">Click to upload Main Photo</span>
                        <br />
                        <span className="text-[11px] text-[#8a8278]">PNG, JPG, WEBP up to 15 MB</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Multiple Gallery Thumbnails Strip */}
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#8a8278]">
                      Additional Angle Photos
                    </span>
                    <button
                      type="button"
                      onClick={() => galleryRef.current?.click()}
                      className="text-[11px] text-[#d4af37] hover:text-[#1a1a18] font-semibold uppercase tracking-[0.5px] transition-colors"
                    >
                      + Add More Photos
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {galleryPreviews.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        onClick={() => setAsMainImage(imgUrl)}
                        className={`relative aspect-square rounded border cursor-pointer overflow-hidden group ${
                          imagePreview === imgUrl ? 'border-2 border-[#d4af37] ring-1 ring-[#d4af37]' : 'border-[#e2ddd8] hover:border-[#1a1a18]'
                        }`}
                        title="Click to set as Main Cover Photo"
                      >
                        <img src={imgUrl} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeGalleryImage(idx);
                          }}
                          className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={10} />
                        </button>
                        {imagePreview === imgUrl && (
                          <div className="absolute bottom-0 inset-x-0 bg-[#d4af37] text-[#1a1a18] text-[8px] font-bold uppercase text-center py-0.5">
                            Main
                          </div>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => galleryRef.current?.click()}
                      className="aspect-square rounded border-2 border-dashed border-[#d4cfc8] hover:border-[#d4af37] bg-[#faf8f3] flex flex-col items-center justify-center text-[#8a8278] hover:text-[#1a1a18] transition-colors"
                    >
                      <Upload size={16} />
                      <span className="text-[10px] mt-1 font-medium">+ Add</span>
                    </button>
                  </div>
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                />
                <input
                  ref={galleryRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleGalleryAdd(e.target.files)}
                />
              </div>

              {/* In Stock toggle */}
              <div className="flex items-center justify-between bg-white border border-[#e2ddd8] rounded-md px-4 py-3">
                <div>
                  <div className="text-[13px] font-medium text-[#1a1a18]">In Stock</div>
                  <div className="text-[11px] text-[#8a8278] mt-0.5">
                    Shows as available in the shop
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, inStock: !f.inStock }))}
                  className={`relative w-10 h-6 rounded-full transition-colors ${
                    form.inStock ? 'bg-[#d4af37]' : 'bg-[#d4cfc8]'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      form.inStock ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* RIGHT column */}
            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className={labelClass}>Product Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  placeholder="e.g. Gothic Steel Breastplate"
                  className={inputClass}
                />
              </div>

              {/* Category */}
              <div>
                <label className={labelClass}>Category *</label>
                <select
                  value={form.cat}
                  onChange={(e) => handleCatChange(e.target.value)}
                  className={inputClass}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub-category */}
              <div>
                <label className={labelClass}>Sub-Category *</label>
                <select
                  value={form.sub}
                  onChange={(e) => setForm((f) => ({ ...f, sub: e.target.value }))}
                  className={inputClass}
                >
                  {availableSubs.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pricing Section: MRP & Selling Price with Auto-calculated Discount */}
              <div className="bg-[#faf8f5] border border-[#e2ddd8] rounded-md p-4 space-y-4">
                <div className="flex items-center justify-between text-[12px] font-bold uppercase tracking-[1px] text-[#1a1a18]">
                  <div className="flex items-center gap-2">
                    <Tag size={15} className="text-[#d4af37]" />
                    <span>Pricing & Discount</span>
                  </div>
                  {calculatedDiscount > 0 && (
                    <span className="bg-green-100 text-green-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full lowercase tracking-normal">
                      {calculatedDiscount}% off
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* MRP */}
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-[#6b6b6b] mb-1">
                      MRP (Original Price ₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8278] text-[13px]">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={form.mrp}
                        onChange={(e) => setForm((f) => ({ ...f, mrp: e.target.value }))}
                        placeholder="e.g. 6000"
                        className={`${inputClass} pl-7`}
                      />
                    </div>
                  </div>

                  {/* Selling Price */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#1a1a18] mb-1">
                      Selling Price (₹) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#d4af37] font-bold text-[14px]">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={form.price}
                        onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                        required
                        placeholder="e.g. 4800"
                        className={`${inputClass} pl-7 font-bold text-[#1a1a18] border-[#d4af37]/60`}
                      />
                    </div>
                  </div>
                </div>

                {/* Auto-Calculated Discount Status */}
                {mrpNum > 0 && priceNum > 0 ? (
                  mrpNum > priceNum ? (
                    <div className="bg-white border border-green-200 rounded p-3 flex items-center justify-between text-[12px]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1a1a18]">
                          Final: ₹{priceNum.toLocaleString('en-IN')}
                        </span>
                        <span className="line-through text-[#8a8278] text-[11px]">
                          ₹{mrpNum.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 font-bold px-2.5 py-1 rounded text-[11px]">
                        <Percent size={11} /> {calculatedDiscount}% OFF (Save ₹{savings.toLocaleString('en-IN')})
                      </span>
                    </div>
                  ) : priceNum > mrpNum ? (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[12px] p-2.5 rounded">
                      ⚠️ Note: Selling Price (₹{priceNum.toLocaleString('en-IN')}) is higher than MRP (₹{mrpNum.toLocaleString('en-IN')}).
                    </div>
                  ) : (
                    <div className="bg-white border border-[#e8e4de] text-[#6b6b6b] text-[12px] p-2.5 rounded">
                      Selling at full MRP · 0% Discount
                    </div>
                  )
                ) : (
                  <p className="text-[11px] text-[#8a8278]">
                    💡 Enter both MRP and Selling Price to automatically calculate and display the discount percentage.
                  </p>
                )}
              </div>

              {/* Badge */}
              <div>
                <label className={labelClass}>Badge</label>
                <select
                  value={form.badge}
                  onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
                  className={inputClass}
                >
                  <option value="">None</option>
                  <option value="new">New</option>
                  <option value="limited">Limited</option>
                  <option value="sale">Sale / Discounted</option>
                  <option value="popular">Popular</option>
                </select>
              </div>
            </div>
          </div>

          {/* Description (full width) */}
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={form.desc}
              onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
              rows={3}
              placeholder="Describe the product, materials, history…"
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Tags (full width) */}
          <div>
            <label className={labelClass}>Tags</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              placeholder="Comma-separated: larp, sword, forged, medieval"
              className={inputClass}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#d4af37] hover:bg-[#c49f27] text-[#1a1a18] font-semibold text-[13px] px-6 py-3 rounded-md transition-colors disabled:opacity-60 flex items-center gap-2 cursor-pointer"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {mode === 'create' ? 'Create Product' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="bg-white border border-[#e2ddd8] text-[#6b6b6b] hover:text-[#1a1a18] text-[13px] px-5 py-3 rounded-md transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
