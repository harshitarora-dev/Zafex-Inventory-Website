import React, { useEffect, useRef, useState } from 'react';
import { Upload, CheckCircle2, AlertCircle, ImageIcon } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { getHomepageImageSlots, uploadHomepageImage, type HomepageImageSlot } from '@/lib/adminApi';

interface SlotState {
  uploading: boolean;
  success: boolean;
  error: string;
  previewUrl: string | null;
}

const SECTIONS = [
  {
    title: 'Hero Banner',
    desc: 'Rotating background images on the homepage top section',
    keys: ['hero-1', 'hero-2'],
    labels: { 'hero-1': 'Hero Image 1', 'hero-2': 'Hero Image 2' },
  },
  {
    title: 'Category Grid',
    desc: 'Four category banner images below the new arrivals strip',
    keys: ['cat-weaponry', 'cat-armour', 'cat-clothing', 'cat-accessories'],
    labels: {
      'cat-weaponry':    'Weaponry',
      'cat-armour':      'Armour',
      'cat-clothing':    'Clothing',
      'cat-accessories': 'Accessories',
    },
  },
  {
    title: 'Shop the Look',
    desc: 'Main banner image and the four product inset images',
    keys: ['stl-main', 'stl-1', 'stl-2', 'stl-3', 'stl-4'],
    labels: {
      'stl-main': 'Main Banner',
      'stl-1':    'Product 1 – Breastplate',
      'stl-2':    'Product 2 – Helmet',
      'stl-3':    'Product 3 – Pauldrons',
      'stl-4':    'Product 4 – Sword Belt',
    },
  },
  {
    title: 'Instagram / Gallery Grid',
    desc: '7 square images in the social grid at the bottom of the homepage',
    keys: ['gram-1', 'gram-2', 'gram-3', 'gram-4', 'gram-5', 'gram-6', 'gram-7'],
    labels: {
      'gram-1': 'Grid 1', 'gram-2': 'Grid 2', 'gram-3': 'Grid 3',
      'gram-4': 'Grid 4', 'gram-5': 'Grid 5', 'gram-6': 'Grid 6', 'gram-7': 'Grid 7',
    },
  },
];

function ImageSlotCard({
  slot,
  label,
}: {
  slot: HomepageImageSlot;
  label: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<SlotState>({
    uploading: false,
    success: false,
    error: '',
    previewUrl: null,
  });

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setState((s) => ({ ...s, error: 'Only image files allowed' }));
      return;
    }
    const preview = URL.createObjectURL(file);
    setState((s) => ({ ...s, uploading: true, error: '', success: false, previewUrl: preview }));
    try {
      await uploadHomepageImage(slot.key, file);
      setState((s) => ({ ...s, uploading: false, success: true }));
      setTimeout(() => setState((s) => ({ ...s, success: false })), 3000);
    } catch (e: unknown) {
      setState((s) => ({
        ...s,
        uploading: false,
        error: e instanceof Error ? e.message : 'Upload failed',
      }));
    }
  }

  const displaySrc = state.previewUrl ?? (slot.exists ? `${slot.path}?t=${Date.now()}` : null);

  return (
    <div className="bg-white border border-[#e2ddd8] rounded-xl overflow-hidden">
      {/* Image preview */}
      <div
        className="relative bg-[#f5f0e8] cursor-pointer group"
        style={{ height: 160 }}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
      >
        {displaySrc ? (
          <img
            src={displaySrc}
            alt={label}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <ImageIcon size={32} className="text-[#ccc]" />
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-[#1a1a18]/0 group-hover:bg-[#1a1a18]/50 transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-1 text-white text-[12px]">
            <Upload size={20} />
            <span>Replace image</span>
          </div>
        </div>
        {/* Upload spinner */}
        {state.uploading && (
          <div className="absolute inset-0 bg-[#1a1a18]/60 flex items-center justify-center">
            <div className="w-7 h-7 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {/* Success tick */}
        {state.success && (
          <div className="absolute inset-0 bg-emerald-900/60 flex items-center justify-center">
            <CheckCircle2 size={32} className="text-emerald-300" />
          </div>
        )}
      </div>

      {/* Label + status */}
      <div className="px-4 py-3">
        <div className="text-[13px] font-medium text-[#1a1a18] truncate">{label}</div>
        <div className="text-[11px] text-[#8a8278] font-mono mt-0.5 truncate">{slot.filename}</div>
        {state.error && (
          <div className="flex items-center gap-1 mt-1.5 text-red-500 text-[11px]">
            <AlertCircle size={12} />
            {state.error}
          </div>
        )}
        {state.success && (
          <div className="text-emerald-600 text-[11px] mt-1.5">✓ Uploaded successfully</div>
        )}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={state.uploading}
          className="mt-2.5 w-full text-[11px] font-semibold uppercase tracking-[1px] bg-[#f5f0e8] hover:bg-[#ede8df] disabled:opacity-50 text-[#1a1a18] py-1.5 rounded-md transition-colors"
        >
          {state.uploading ? 'Uploading…' : 'Upload New Image'}
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}

export default function AdminHomepageImages() {
  const [slots, setSlots] = useState<HomepageImageSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getHomepageImageSlots()
      .then(({ slots }) => setSlots(slots))
      .catch(() => setError('Failed to load image slots'))
      .finally(() => setLoading(false));
  }, []);

  const slotMap = Object.fromEntries(slots.map((s) => [s.key, s]));

  return (
    <AdminLayout>
      <div className="p-10 max-w-[1400px]">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-serif text-[34px] text-[#1a1a18] tracking-tight">Homepage Images</h1>
          <p className="text-[#6b6b6b] text-[15px] mt-1.5">
            Click any image or drag & drop to replace it. Changes appear on the storefront immediately.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-[14px] py-8 text-center">{error}</div>
        ) : (
          <div className="space-y-12">
            {SECTIONS.map((section) => (
              <div key={section.title}>
                <div className="mb-5">
                  <h2 className="font-serif text-[20px] text-[#1a1a18]">{section.title}</h2>
                  <p className="text-[#8a8278] text-[13px] mt-0.5">{section.desc}</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {section.keys.map((key) => {
                    const slot = slotMap[key];
                    if (!slot) return null;
                    return (
                      <ImageSlotCard
                        key={key}
                        slot={slot}
                        label={(section.labels as Record<string, string>)[key] ?? key}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
