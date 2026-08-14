import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react';
import AdminLayout from './AdminLayout';
import {
  createAdminProduct,
  updateAdminProduct,
  getAdminProduct,
  type AdminProduct,
} from '@/lib/adminApi';

const CATEGORIES = [
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
    label: 'Gambesons',
    subs: [
      { value: 'gambesons', label: 'Gambesons' },
      { value: 'padded-jackets', label: 'Padded Jackets' },
      { value: 'arming-doublets', label: 'Arming Doublets' },
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
    label: 'Weapons',
    subs: [
      { value: 'swords-daggers', label: 'Swords & Daggers' },
      { value: 'axes-maces', label: 'Axes & Maces' },
      { value: 'spears', label: 'Spears' },
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
  const [loadingProduct, setLoadingProduct] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
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
          price: String(product.price),
          badge: product.badge ?? '',
          desc: product.desc ?? '',
          tags: (product.tags ?? []).join(', '),
          inStock: product.inStock,
        });
        setImagePreview(product.image);
      })
      .catch(() => setError('Failed to load product'))
      .finally(() => setLoadingProduct(false));
  }, [mode, id]);

  // Reset sub when category changes
  function handleCatChange(cat: string) {
    const first = CATEGORIES.find((c) => c.value === cat)?.subs[0]?.value ?? '';
    setForm((f) => ({ ...f, cat, sub: first }));
  }

  function handleFileChange(file: File | null) {
    if (!file) return;
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  }

  // Drag-and-drop
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) handleFileChange(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.cat || !form.sub || !form.price) {
      setError('Name, category, subcategory and price are required.');
      return;
    }
    setSaving(true);
    setError('');

    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('cat', form.cat);
    fd.append('sub', form.sub);
    fd.append('price', form.price);
    fd.append('badge', form.badge);
    fd.append('desc', form.desc);
    fd.append('tags', form.tags);
    fd.append('inStock', String(form.inStock));
    if (imageFile) fd.append('image', imageFile);

    try {
      if (mode === 'create') {
        await createAdminProduct(fd);
      } else {
        await updateAdminProduct(id!, fd);
      }
      navigate('/admin/products');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
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
      <div className="p-8 max-w-[780px]">
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
              {/* Product Image */}
              <div>
                <label className={labelClass}>Product Image</label>
                <div
                  ref={dropRef}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  className="relative cursor-pointer border-2 border-dashed border-[#d4cfc8] rounded-xl overflow-hidden bg-[#faf9f7] hover:border-[#d4af37] hover:bg-[#fdf9ef] transition-colors"
                  style={{ height: 220 }}
                >
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageFile(null);
                          setImagePreview(mode === 'edit' ? '' : '');
                        }}
                        className="absolute top-2 right-2 bg-[#1a1a18]/70 hover:bg-[#1a1a18] text-white rounded-full p-1 transition-colors"
                      >
                        <X size={14} />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-[#1a1a18]/60 text-white text-[10px] px-2 py-0.5 rounded">
                        Click to replace
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-[#aaa]">
                      <Upload size={28} strokeWidth={1.5} />
                      <div className="text-[12px] text-center leading-relaxed">
                        <span className="text-[#d4af37] font-medium">Click to upload</span>
                        {' '}or drag & drop
                        <br />
                        <span className="text-[11px]">PNG, JPG, WEBP up to 8 MB</span>
                      </div>
                    </div>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
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

              {/* Price */}
              <div>
                <label className={labelClass}>Price (₹) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a8278] text-[13px]">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    required
                    placeholder="0"
                    className={`${inputClass} pl-7`}
                  />
                </div>
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
              placeholder="sword, viking, larp  (comma-separated)"
              className={inputClass}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-[#1a1a18] hover:bg-[#2e2e2a] disabled:opacity-60 text-[#f5f0e8] text-[12px] font-semibold uppercase tracking-[1.5px] px-6 py-3 rounded-md transition-colors"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? 'Saving…' : mode === 'create' ? 'Create Product' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="text-[#6b6b6b] hover:text-[#1a1a18] text-[13px] px-4 py-3 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
