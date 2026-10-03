import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import {
  ArrowLeft,
  Upload,
  X,
  Loader2,
  Tag,
  Percent,
  Plus,
  Trash2,
  Film,
  Camera,
  Layers,
  Palette,
  Shield,
  Clock,
  Sparkles,
  Info,
  DollarSign,
  Package,
  Eye,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Zap,
  Star,
  Settings2,
  Sliders,
  Check,
  Play,
  Video,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import {
  createAdminProduct,
  updateAdminProduct,
  getAdminProduct,
  uploadAdminMedia,
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
    value: 'shields',
    label: 'Shields',
    subs: [
      { value: 'wooden-shields', label: 'Wooden Shields' },
      { value: 'templar-shields', label: 'Templar & Crusader Shields' },
      { value: 'viking-shields', label: 'Viking Shields' },
      { value: 'heater-shields', label: 'Heater Shields' },
      { value: 'bucklers', label: 'Bucklers' },
    ],
  },
  {
    value: 'weapons',
    label: 'Weapons & Replicas',
    subs: [
      { value: 'swords-daggers', label: 'Swords & Daggers' },
      { value: 'axes-maces', label: 'Axes & Maces' },
      { value: 'spears', label: 'Spears & Polearms' },
    ],
  },
  {
    value: 'accessories',
    label: 'Accessories',
    subs: [
      { value: 'belts', label: 'Belts' },
      { value: 'drinking-horns', label: 'Drinking Horns' },
      { value: 'tankards', label: 'Tankards & Horn Mugs' },
      { value: 'jewelry', label: 'Pendants & Jewelry' },
      { value: 'pouches', label: 'Leather Pouches' },
    ],
  },
  {
    value: 'collections',
    label: 'Curated Collections',
    subs: [
      { value: 'best-sellers', label: 'Best Sellers' },
      { value: 'new-arrivals', label: 'New Arrivals' },
      { value: 'limited-edition', label: 'Limited Edition' },
      { value: 'handmade-collection', label: 'Handmade Collection' },
      { value: 'movie-inspired', label: 'Movie Inspired' },
      { value: 'historical-reproductions', label: 'Historical Reproductions' },
    ],
  },
  {
    value: 'custom',
    label: 'Other / Custom Category',
    subs: [{ value: 'custom', label: 'Custom Sub-Category' }],
  },
];

const DEFAULT_HIGHLIGHTS = [
  'Handmade Craftsmanship',
  'Museum Grade Detailing',
  'Custom Sizing Available',
  'Worldwide Insured Shipping',
  '100% Authentic Quality',
  'Priority Customer Support',
];

const PRESET_HIGHLIGHTS = [
  'Handmade Craftsmanship',
  'Museum Grade Detailing',
  'Custom Sizing Available',
  'Worldwide Insured Shipping',
  '100% Authentic Quality',
  'Battle Ready / Functional',
  'Priority Customer Support',
  'Historically Accurate Reproduction',
  'Rust Resistant Coating',
  'Genuine Top-Grain Leather Straps',
];

const PRESET_SIZES_MAP: Record<string, string[]> = {
  'Armor / Helmets': ['S/M', 'L/XL', '2XL/3XL'],
  'Garments & Gambesons': ['S', 'M', 'L', 'XL', '2XL', '3XL'],
  'Universal': ['Standard (One Size Fits Most)', 'Custom Made Fit'],
};

const QUICK_MATERIALS = [
  '16 Gauge Mild Steel & Leather',
  '14 Gauge Mild Steel',
  '18 Gauge Steel & Brass',
  'Cotton Batting & Heavy Canvas',
  'Top Grain Vegetable Tanned Leather',
  'High Carbon Forged Steel',
];

const QUICK_FINISHES = [
  'Black Oiled (Rust Resistant)',
  'Mirror Polished Steel',
  'Antiqued Battle Worn',
  'Natural Vegetable Tan',
  'Burnished Dark Brown',
];

interface Props {
  mode?: 'create' | 'edit';
  id?: string;
}

export interface FormSizeVariant {
  size: string;
  price: string;
  mrp: string;
  stock: string;
  images: string[];
}

interface FormState {
  name: string;
  sku: string;
  brand: string;
  cat: string;
  sub: string;
  collection: string;
  mrp: string;
  price: string;
  badge: string;
  desc: string;
  itemDetails: string;
  tags: string;
  inStock: boolean;
  stockCount: string;
  availability: string;
  estimatedDelivery: string;
  manufacturingTime: string;
  material: string;
  ringSize: string;
  ringType: string;
  gauge: string;
  finish: string;
  weight: string;
  country: string;
  hsCode: string;
  ebayUrl: string;
  video: string;
  colors: string[];
  sizes: FormSizeVariant[];
  highlights: string[];
}

const DEFAULT_FORM_SIZES: FormSizeVariant[] = [
  { size: 'S/M', price: '', mrp: '', stock: '12', images: [] },
  { size: 'L/XL', price: '', mrp: '', stock: '12', images: [] },
  { size: '2XL/3XL', price: '', mrp: '', stock: '12', images: [] },
];

const EMPTY: FormState = {
  name: '',
  sku: '',
  brand: 'Zafex Collectibles',
  cat: 'chainmail-armor',
  sub: 'chainmail-shirts-hauberks',
  collection: '',
  mrp: '',
  price: '',
  badge: 'NEW',
  desc: '',
  itemDetails: '',
  tags: '',
  inStock: true,
  stockCount: '12',
  availability: 'In Stock',
  estimatedDelivery: '3-5 Business Days',
  manufacturingTime: '7-10 Days',
  material: '16 Gauge Mild Steel & Leather',
  ringSize: '',
  ringType: '',
  gauge: '16 Gauge',
  finish: 'Black Oiled (Rust Resistant)',
  weight: '2.8 KG',
  country: 'India',
  hsCode: '560900',
  ebayUrl: 'https://www.ebay.com/str/zafexcollectibles',
  video: '',
  colors: ['#000000', '#8B4513'],
  sizes: DEFAULT_FORM_SIZES,
  highlights: DEFAULT_HIGHLIGHTS,
};

export default function AdminProductForm({ mode = 'create', id }: Props = { mode: 'create' }) {
  const [, navigate] = useLocation();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [customerPhoto1, setCustomerPhoto1] = useState<string>('');
  const [customerPhoto2, setCustomerPhoto2] = useState<string>('');
  const [sizeChartPreview, setSizeChartPreview] = useState<string>('');
  const [newColorHex, setNewColorHex] = useState('#d4af37');
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [customSizePrice, setCustomSizePrice] = useState('');
  const [customSizeMrp, setCustomSizeMrp] = useState('');
  const [customSizeStock, setCustomSizeStock] = useState('12');
  const [customSizeImages, setCustomSizeImages] = useState<string[]>([]);
  const [customHighlightInput, setCustomHighlightInput] = useState('');

  const [loadingProduct, setLoadingProduct] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [error, setError] = useState('');
  const [successToast, setSuccessToast] = useState('');
  const [showLivePreview, setShowLivePreview] = useState(true);
  const [showAdvancedSpecs, setShowAdvancedSpecs] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const custPhoto1Ref = useRef<HTMLInputElement>(null);
  const custPhoto2Ref = useRef<HTMLInputElement>(null);
  const sizeChartRef = useRef<HTMLInputElement>(null);

  const availableSubs = CATEGORIES.find((c) => c.value === form.cat)?.subs ?? [];

  // Load existing product when editing
  useEffect(() => {
    if (mode !== 'edit' || !id) return;
    getAdminProduct(id)
      .then((p: AdminProduct) => {
        const loadedSizes: FormSizeVariant[] = Array.isArray(p.sizes) && p.sizes.length > 0
          ? (p.sizes.map((item: any) => {
              if (!item) return null;
              if (typeof item === 'string') {
                const trimmed = item.trim();
                if (!trimmed || trimmed === '[object Object]') return null;
                if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
                  try {
                    const parsed = JSON.parse(trimmed);
                    const sName = typeof parsed.size === 'string' ? parsed.size.trim() : '';
                    if (!sName || sName === '[object Object]') return null;
                    const imgs = Array.isArray(parsed.images)
                      ? parsed.images.filter(Boolean)
                      : (parsed.image ? [parsed.image] : []);
                    return {
                      size: sName,
                      price: parsed.price != null && Number(parsed.price) > 0 ? String(parsed.price) : '',
                      mrp: parsed.mrp != null && Number(parsed.mrp) > 0 ? String(parsed.mrp) : '',
                      stock: parsed.stock != null ? String(parsed.stock) : (p.stockCount !== undefined && p.stockCount !== null ? String(p.stockCount) : '12'),
                      images: imgs,
                    };
                  } catch {}
                }
                return {
                  size: trimmed,
                  price: '',
                  mrp: '',
                  stock: p.stockCount !== undefined && p.stockCount !== null ? String(p.stockCount) : '12',
                  images: [],
                };
              }
              if (typeof item === 'object') {
                const sName = typeof item.size === 'string' ? item.size.trim() : String(item.size || '').trim();
                if (!sName || sName === '[object Object]') return null;
                const imgs = Array.isArray(item.images)
                  ? item.images.filter(Boolean)
                  : (item.image ? [item.image] : []);
                return {
                  size: sName,
                  price: item.price != null && Number(item.price) > 0 ? String(item.price) : '',
                  mrp: item.mrp != null && Number(item.mrp) > 0 ? String(item.mrp) : '',
                  stock: item.stock != null ? String(item.stock) : (p.stockCount !== undefined && p.stockCount !== null ? String(p.stockCount) : '12'),
                  images: imgs,
                };
              }
              return null;
            }).filter((s): s is FormSizeVariant => s !== null && s.size.trim().length > 0))
          : DEFAULT_FORM_SIZES;

        const finalSizes = loadedSizes.length > 0 ? loadedSizes : DEFAULT_FORM_SIZES;

        setForm({
          name: p.name ?? '',
          sku: p.sku ?? '',
          brand: p.brand ?? 'ZAFS',
          cat: p.cat ?? 'medieval-helmets',
          sub: p.sub ?? 'templar-helmets',
          collection: p.collection ?? '',
          mrp: p.mrp ? String(p.mrp) : '',
          price: p.price ? String(p.price) : '',
          badge: p.badge ?? '',
          desc: p.desc ?? '',
          itemDetails: p.itemDetails ?? '',
          tags: (p.tags ?? []).join(', '),
          inStock: p.inStock ?? true,
          stockCount: p.stockCount !== undefined && p.stockCount !== null ? String(p.stockCount) : '12',
          availability: p.availability ?? 'In Stock',
          estimatedDelivery: p.estimatedDelivery ?? '3-5 Business Days',
          manufacturingTime: p.manufacturingTime ?? '7-10 Days',
          material: p.material ?? '',
          ringSize: p.ringSize ?? '',
          ringType: p.ringType ?? '',
          gauge: p.gauge ?? '',
          finish: p.finish ?? '',
          weight: p.weight ?? '',
          country: p.country ?? 'India',
          hsCode: p.hsCode ?? '',
          ebayUrl: p.ebayUrl ?? '',
          video: p.video ?? '',
          colors: Array.isArray(p.colors) && p.colors.length > 0 ? p.colors : ['#000000', '#8B4513'],
          sizes: finalSizes,
          highlights: Array.isArray(p.highlights) && p.highlights.length > 0 ? p.highlights : DEFAULT_HIGHLIGHTS,
        });

        setImagePreview(p.image ?? '');
        if (p.gallery && Array.isArray(p.gallery) && p.gallery.length > 0) {
          setGalleryPreviews(p.gallery);
        } else if (p.image) {
          setGalleryPreviews([p.image]);
        }

        if (p.customerPhotos && Array.isArray(p.customerPhotos)) {
          if (p.customerPhotos[0]) setCustomerPhoto1(p.customerPhotos[0]);
          if (p.customerPhotos[1]) setCustomerPhoto2(p.customerPhotos[1]);
        }
        if (p.sizeChartImage) setSizeChartPreview(p.sizeChartImage);

        // Always show advanced specs in edit mode for ease of access
        setShowAdvancedSpecs(true);
      })
      .catch(() => setError('Unable to load product details. Please refresh the page.'))
      .finally(() => setLoadingProduct(false));
  }, [mode, id]);

  function handleCatChange(cat: string) {
    const first = CATEGORIES.find((c) => c.value === cat)?.subs[0]?.value ?? '';
    setForm((f) => ({ ...f, cat, sub: first }));
  }

  function generateSku() {
    const prefix = form.brand.slice(0, 3).toUpperCase() || 'ZAF';
    const catCode = form.cat.slice(0, 2).toUpperCase();
    const randomNum = Math.floor(100 + Math.random() * 900);
    setForm((f) => ({ ...f, sku: `${prefix}-${catCode}-${randomNum}` }));
  }

  // Automatic discount calculation from MRP & Selling Price
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
        if (file.type.startsWith('video/')) {
          resolve(dataUrl);
          return;
        }
        const img = new Image();
        img.onload = () => {
          const MAX_DIM = 1200;
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

  async function handleMultiUpload(
    files: FileList | null,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) {
    if (!files || files.length === 0) return;
    const base64List: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const b64 = await fileToBase64(files[i]);
      if (b64) base64List.push(b64);
    }
    setter((prev) => [...prev, ...base64List]);
  }

  const addColor = (hex: string) => {
    if (!hex.trim()) return;
    const formatted = hex.startsWith('#') ? hex.trim() : `#${hex.trim()}`;
    if (!form.colors.includes(formatted)) {
      setForm((f) => ({ ...f, colors: [...f.colors, formatted] }));
    }
  };

  const removeColor = (idx: number) => {
    setForm((f) => ({
      ...f,
      colors: f.colors.filter((_, i) => i !== idx),
    }));
  };

  const addSize = (sizeName: string, customPrice = '', customMrp = '', customStock = '', customImgs: string[] = []) => {
    const trimmed = (typeof sizeName === 'string' ? sizeName : '').trim();
    if (!trimmed || trimmed === '[object Object]') return;
    if (!form.sizes.some((s) => s.size.toLowerCase() === trimmed.toLowerCase())) {
      setForm((f) => ({
        ...f,
        sizes: [
          ...f.sizes,
          {
            size: trimmed,
            price: customPrice,
            mrp: customMrp,
            stock: customStock || f.stockCount || '12',
            images: customImgs.length > 0 ? customImgs : (customSizeImages.length > 0 ? customSizeImages : []),
          },
        ],
      }));
    }
    setCustomSizeInput('');
    setCustomSizePrice('');
    setCustomSizeMrp('');
    setCustomSizeStock('12');
    setCustomSizeImages([]);
  };

  const addVariantImage = (idx: number, newImg: string) => {
    if (!newImg) return;
    setForm((f) => ({
      ...f,
      sizes: f.sizes.map((s, i) =>
        i === idx ? { ...s, images: [...(s.images || []), newImg] } : s
      ),
    }));
  };

  const removeVariantImage = (variantIdx: number, imgIdx: number) => {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.map((s, i) =>
        i === variantIdx
          ? { ...s, images: (s.images || []).filter((_, j) => j !== imgIdx) }
          : s
      ),
    }));
  };

  const updateSizeVariant = (idx: number, field: keyof FormSizeVariant, value: any) => {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.map((s, i) => (i === idx ? { ...s, [field]: value } : s)),
    }));
  };

  const removeSize = (idx: number) => {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.filter((_, i) => i !== idx),
    }));
  };

  const setPresetSizes = (presetKey: string) => {
    const preset = PRESET_SIZES_MAP[presetKey];
    if (preset) {
      setForm((f) => ({
        ...f,
        sizes: preset.map((s) => {
          const existing = f.sizes.find((curr) => curr.size.toLowerCase() === s.toLowerCase());
          return {
            size: s,
            price: existing?.price || '',
            mrp: existing?.mrp || '',
            stock: existing?.stock || f.stockCount || '12',
            images: existing?.images || [],
          };
        }),
      }));
    }
  };

  const syncBasePriceToAllSizes = () => {
    if (!form.price && !form.mrp) return;
    setForm((f) => ({
      ...f,
      sizes: f.sizes.map((s) => ({
        ...s,
        price: form.price || s.price,
        mrp: form.mrp || s.mrp,
        stock: form.stockCount || s.stock,
      })),
    }));
  };

  // Highlights helper functions
  const addHighlight = (hl: string) => {
    const trimmed = hl.trim();
    if (!trimmed) return;
    if (!form.highlights.includes(trimmed)) {
      setForm((f) => ({ ...f, highlights: [...f.highlights, trimmed] }));
    }
    setCustomHighlightInput('');
  };

  const removeHighlight = (idx: number) => {
    setForm((f) => ({
      ...f,
      highlights: f.highlights.filter((_, i) => i !== idx),
    }));
  };

  const setAsHero = (img: string) => {
    setImagePreview(img);
  };

  // Submit Handler
  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!form.name.trim()) {
      setError('Product Name is required.');
      return;
    }
    if (!form.price && !form.mrp) {
      setError('Selling Price or MRP is required.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const effectivePrice = form.price ? Number(form.price) : Number(form.mrp);
      const effectiveMrp = form.mrp ? Number(form.mrp) : undefined;
      const effectiveDiscount = calculatedDiscount > 0 ? calculatedDiscount : undefined;

      const heroImg = imagePreview || galleryPreviews[0] || '/images/full-body-armor.png';
      const allGallery = galleryPreviews.length > 0 ? galleryPreviews : [heroImg];

      // Max 2 customer photos
      const customerPhotosList = [customerPhoto1, customerPhoto2].filter(Boolean);

      // Serialize sizes with specific price, stock and images
      const serializedSizes = form.sizes
        .filter((s) => s.size && s.size.trim() && s.size.trim() !== '[object Object]')
        .map((s) => {
          const sPrice = s.price && !isNaN(Number(s.price)) && Number(s.price) > 0 ? Number(s.price) : effectivePrice;
          const sMrp = s.mrp && !isNaN(Number(s.mrp)) && Number(s.mrp) > 0 ? Number(s.mrp) : effectiveMrp;
          const sStock = s.stock !== '' && !isNaN(Number(s.stock)) ? Number(s.stock) : (Number(form.stockCount) || 12);
          const cleanImgs = (s.images || []).filter(Boolean);
          return {
            size: s.size.trim(),
            price: sPrice,
            mrp: sMrp || undefined,
            stock: sStock,
            images: cleanImgs.length > 0 ? cleanImgs : undefined,
            image: cleanImgs[0] || undefined,
          };
        });

      const payload: Record<string, any> = {
        name: form.name.trim(),
        sku: form.sku.trim() || undefined,
        brand: form.brand.trim() || 'ZAFS',
        cat: form.cat,
        sub: form.sub,
        collection: form.collection.trim() || undefined,
        price: effectivePrice,
        mrp: effectiveMrp,
        discount: effectiveDiscount,
        badge: form.badge || undefined,
        desc: form.desc.trim() || undefined,
        itemDetails: form.itemDetails.trim() || undefined,
        tags: form.tags
          ? form.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : undefined,
        inStock: form.inStock,
        stockCount: Number(form.stockCount) || 12,
        availability: form.availability.trim() || 'In Stock',
        estimatedDelivery: form.estimatedDelivery.trim() || undefined,
        manufacturingTime: form.manufacturingTime.trim() || undefined,
        material: form.material.trim() || undefined,
        ringSize: form.ringSize.trim() || undefined,
        ringType: form.ringType.trim() || undefined,
        gauge: form.gauge.trim() || undefined,
        finish: form.finish.trim() || undefined,
        weight: form.weight.trim() || undefined,
        country: form.country.trim() || 'India',
        hsCode: form.hsCode.trim() || undefined,
        ebayUrl: form.ebayUrl.trim() || undefined,
        video: form.video && form.video.trim() ? form.video.trim() : null,
        colors: form.colors.length > 0 ? form.colors : undefined,
        sizes: serializedSizes.length > 0 ? serializedSizes : undefined,
        highlights: form.highlights.length > 0 ? form.highlights : undefined,
        image: heroImg,
        gallery: allGallery,
        customerPhotos: customerPhotosList.length > 0 ? customerPhotosList : undefined,
        sizeChartImage: sizeChartPreview || undefined,
      };

      if (mode === 'create') {
        await createAdminProduct(payload);
      } else if (id) {
        await updateAdminProduct(id, payload);
      }
      setSuccessToast('Product successfully saved!');
      setTimeout(() => {
        navigate('/admin/products');
      }, 700);
    } catch (err: any) {
      setError(err?.message || 'Failed to save product. Please check required fields.');
    } finally {
      setSaving(false);
    }
  }

  if (loadingProduct) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64 text-[#8a8278] gap-3">
          <Loader2 className="animate-spin text-[#d4af37]" size={28} />
          <span className="font-serif uppercase tracking-[2px] text-sm">Loading product details...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-[1500px] mx-auto pb-16 px-1 sm:px-0">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6 bg-[#1a1a18]/90 backdrop-blur-md p-3 sm:p-4 rounded-xl border border-[#333330] sticky top-2 sm:top-4 z-20 shadow-xl">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="p-2 text-[#8a8278] hover:text-[#f5f0e8] transition-colors rounded-lg bg-[#242420] border border-[#333330] shrink-0"
              title="Back to products list"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[1.5px] px-1.5 py-0.5 rounded bg-[#d4af37]/20 text-[#d4af37]">
                  {mode === 'create' ? 'NEW' : 'EDIT'}
                </span>
                <span className="text-[10px] sm:text-xs text-[#8a8278] truncate">{form.sku || 'ZAFEX'}</span>
              </div>
              <h1 className="font-serif text-[14px] sm:text-[18px] md:text-[20px] uppercase tracking-[1px] text-[#f5f0e8] truncate max-w-[140px] sm:max-w-[300px] md:max-w-[480px]">
                {form.name || 'Untitled Product'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setShowLivePreview(!showLivePreview)}
              className={`hidden lg:flex px-3.5 py-2 text-xs rounded-lg font-serif uppercase tracking-[1px] items-center gap-2 transition border ${
                showLivePreview
                  ? 'bg-[#2a2a26] text-[#d4af37] border-[#d4af37]/40'
                  : 'bg-[#242420] text-[#8a8278] border-[#333330]'
              }`}
            >
              <Eye size={14} />
              <span>{showLivePreview ? 'Hide Card' : 'Show Card'}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="px-3 sm:px-4 py-2 bg-transparent border border-[#444440] text-[#c0b8ac] hover:bg-[#242420] text-[11px] sm:text-xs font-serif uppercase tracking-[1px] rounded-lg transition"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={saving}
              className="px-4 sm:px-6 py-2 bg-gradient-to-r from-[#d4af37] to-[#b89528] hover:from-[#e5c14d] hover:to-[#c49f27] text-[#1a1208] text-[11px] sm:text-xs font-serif font-bold uppercase tracking-[1.5px] rounded-lg transition flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-[#d4af37]/15 disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
              <span>{saving ? 'Saving...' : mode === 'create' ? 'Publish' : 'Save'}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-red-200 text-sm flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-100 p-1">
              <X size={16} />
            </button>
          </div>
        )}

        {successToast && (
          <div className="mb-6 p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-200 text-sm flex items-center gap-3 shadow-lg">
            <CheckCircle2 className="text-emerald-400" size={18} />
            <span>{successToast}</span>
          </div>
        )}

        {/* Form Container */}
        <div className={`grid gap-6 sm:gap-8 ${showLivePreview ? 'lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px]' : 'grid-cols-1'}`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ══════════════════════════════════════════════════════════════════
                SECTION 1: ESSENTIAL DETAILS (Always Visible)
               ══════════════════════════════════════════════════════════════════ */}
            <div className="space-y-6 bg-[#242420] border border-[#333330] rounded-2xl p-5 sm:p-8 shadow-md">
              <div className="border-b border-[#333330] pb-3">
                <h2 className="font-serif text-[16px] uppercase tracking-[1.5px] text-[#f5f0e8] font-bold flex items-center gap-2">
                  <Package className="text-[#d4af37]" size={18} /> Essential Product Info
                </h2>
                <p className="text-xs text-[#8a8278] mt-0.5">Primary information displayed on storefront</p>
              </div>

              {/* Title */}
              <div>
                <label className="block font-serif text-[11px] uppercase tracking-[1.5px] text-[#f5f0e8] font-bold mb-2">
                  Product Name / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Medieval Viking Bearded Broadaxe – Forged High Carbon Steel"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#1a1a18] border border-[#444440] text-[#f5f0e8] rounded-lg px-4 py-3 text-sm focus:border-[#d4af37] outline-none transition"
                />
              </div>

              {/* Categories */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-serif text-[11px] uppercase tracking-[1px] text-[#c0b8ac] font-semibold mb-2">
                    Category *
                  </label>
                  <select
                    value={form.cat}
                    onChange={(e) => handleCatChange(e.target.value)}
                    className="w-full bg-[#1a1a18] border border-[#444440] text-[#f5f0e8] rounded-lg px-4 py-2.5 text-sm focus:border-[#d4af37] outline-none cursor-pointer"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-serif text-[11px] uppercase tracking-[1px] text-[#c0b8ac] font-semibold mb-2">
                    Sub-Category *
                  </label>
                  <select
                    value={form.sub}
                    onChange={(e) => setForm({ ...form, sub: e.target.value })}
                    className="w-full bg-[#1a1a18] border border-[#444440] text-[#f5f0e8] rounded-lg px-4 py-2.5 text-sm focus:border-[#d4af37] outline-none cursor-pointer"
                  >
                    {availableSubs.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing & Automatic Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-serif text-[11px] uppercase tracking-[1px] text-[#c0b8ac] font-semibold mb-2">
                    MRP / Original Price ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 120"
                    value={form.mrp}
                    onChange={(e) => setForm({ ...form, mrp: e.target.value })}
                    className="w-full bg-[#1a1a18] border border-[#444440] text-[#f5f0e8] rounded-lg px-4 py-3 text-sm focus:border-[#d4af37] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-serif text-[11px] uppercase tracking-[1.5px] text-[#d4af37] font-bold mb-2">
                    Selling Price ($) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="e.g. 99"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full bg-[#1a1a18] border-2 border-[#d4af37] text-[#f5f0e8] rounded-lg px-4 py-3 text-sm font-bold focus:border-[#e5c14d] outline-none"
                  />
                </div>
              </div>

              {/* Auto Discount Banner */}
              {mrpNum > 0 && priceNum > 0 && mrpNum > priceNum && (
                <div className="p-3.5 bg-emerald-950/30 border border-emerald-800/50 rounded-xl text-emerald-300 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Percent size={15} className="text-emerald-400" />
                    <span>
                      Automatic Discount: <strong>{calculatedDiscount}% OFF</strong>
                    </span>
                  </div>
                  <span className="bg-emerald-900/60 px-3 py-1 rounded-full border border-emerald-700/50 text-[11px] font-bold">
                    Saves ${savings.toLocaleString('en-US')}
                  </span>
                </div>
              )}

              {/* Stock Quantity & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#333330]">
                <div>
                  <label className="block font-serif text-[11px] uppercase tracking-[1px] text-[#c0b8ac] font-semibold mb-2">
                    Stock Quantity (Units Available in Store)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 12"
                    value={form.stockCount}
                    onChange={(e) => setForm({ ...form, stockCount: e.target.value })}
                    className="w-full bg-[#1a1a18] border border-[#444440] text-[#f5f0e8] rounded-lg px-4 py-2.5 text-sm focus:border-[#d4af37] outline-none font-mono"
                  />
                </div>

                <div className="flex items-center">
                  <label className="w-full flex items-center gap-3 cursor-pointer select-none bg-[#1a1a18] p-3 rounded-xl border border-[#333330] mt-1 sm:mt-5">
                    <input
                      type="checkbox"
                      checked={form.inStock}
                      onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
                      className="w-5 h-5 accent-[#d4af37] rounded"
                    />
                    <div>
                      <span className="font-serif text-[12px] uppercase tracking-[1px] text-[#f5f0e8] block font-bold">
                        In Stock (Available for ordering)
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* ── SIZES & VARIANTS MANAGER ── */}
              <div className="pt-2 border-t border-[#333330] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <label className="block font-serif text-[12px] uppercase tracking-[1.5px] text-[#d4af37] font-bold">
                      Available Sizes & Variant Pricing / Stock
                    </label>
                    <span className="text-[11px] text-[#8a8278]">
                      Set custom selling price, MRP, and stock for each size (or inherit base product price)
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={syncBasePriceToAllSizes}
                      className="text-[10px] bg-[#2a2618] hover:bg-[#3a3520] text-[#d4af37] px-3 py-1.5 rounded-lg border border-[#d4af37]/40 transition font-serif uppercase tracking-[0.5px] font-bold"
                      title="Set all size prices & stock to match the main product inputs above"
                    >
                      ⚡ Sync Base Price & Stock
                    </button>
                    {Object.keys(PRESET_SIZES_MAP).map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setPresetSizes(preset)}
                        className="text-[10px] bg-[#1a1a18] hover:bg-[#2a2a26] text-[#c0b8ac] hover:text-[#d4af37] px-2.5 py-1.5 rounded-lg border border-[#333330] transition font-serif uppercase tracking-[0.5px]"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Variants Table */}
                <div className="bg-[#1a1a18] rounded-xl border border-[#333330] overflow-hidden">
                  {form.sizes.length === 0 ? (
                    <div className="text-center py-6 px-4 text-xs text-[#8a8278] italic">
                      No size variants added yet. Choose a preset above or add custom sizes below.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#141412] border-b border-[#333330] text-[#8a8278] font-serif uppercase tracking-[1px] text-[10px]">
                            <th className="py-2.5 px-3 font-semibold">Image</th>
                            <th className="py-2.5 px-3 font-semibold">Size</th>
                            <th className="py-2.5 px-3 font-semibold">Selling Price ($)</th>
                            <th className="py-2.5 px-3 font-semibold">MRP ($)</th>
                            <th className="py-2.5 px-3 font-semibold">Stock Qty</th>
                            <th className="py-2.5 px-3 font-semibold">Discount</th>
                            <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2a2a26]">
                          {form.sizes.map((v, idx) => {
                            const vPrice = Number(v.price) || Number(form.price) || 0;
                            const vMrp = Number(v.mrp) || Number(form.mrp) || 0;
                            const vDiscount = vMrp > vPrice && vPrice > 0 ? Math.round(((vMrp - vPrice) / vMrp) * 100) : 0;
                            return (
                              <tr key={idx} className="hover:bg-[#22221f] transition-colors">
                                <td className="py-2.5 px-3">
                                  <div className="flex items-center gap-1.5 flex-wrap max-w-[180px]">
                                    {(v.images || []).map((imgUrl, imgIdx) => (
                                      <div key={imgIdx} className="relative w-8 h-8 rounded-lg overflow-hidden border border-[#d4af37]/60 group shrink-0">
                                        <img src={imgUrl} alt={`${v.size} photo ${imgIdx + 1}`} className="w-full h-full object-cover" />
                                        <button
                                          type="button"
                                          onClick={() => removeVariantImage(idx, imgIdx)}
                                          className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 transition cursor-pointer"
                                          title="Remove photo"
                                        >
                                          <X size={12} />
                                        </button>
                                      </div>
                                    ))}
                                    <label
                                      className="w-8 h-8 rounded-lg border border-dashed border-[#444440] hover:border-[#d4af37] flex flex-col items-center justify-center cursor-pointer text-[#8a8278] hover:text-[#d4af37] transition shrink-0"
                                      title="Upload photo(s) for this size variant"
                                    >
                                      <Camera size={11} />
                                      <span className="text-[7px] font-sans uppercase font-bold">+Photo</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={async (e) => {
                                          const files = e.target.files;
                                          if (files && files.length > 0) {
                                            for (let fi = 0; fi < files.length; fi++) {
                                              const b64 = await fileToBase64(files[fi]);
                                              if (b64) addVariantImage(idx, b64);
                                            }
                                          }
                                        }}
                                      />
                                    </label>
                                  </div>
                                </td>
                                <td className="py-2.5 px-3">
                                  <input
                                    type="text"
                                    value={typeof v.size === 'string' && v.size !== '[object Object]' ? v.size : ''}
                                    onChange={(e) => updateSizeVariant(idx, 'size', e.target.value)}
                                    placeholder="Size (e.g. M)"
                                    className="w-24 bg-[#141412] border border-[#3a3a36] text-[#f5f0e8] font-bold rounded px-2.5 py-1 text-xs focus:border-[#d4af37] outline-none"
                                  />
                                </td>
                                <td className="py-2.5 px-3">
                                  <div className="relative flex items-center">
                                    <span className="absolute left-2 text-[#8a8278] text-xs">$</span>
                                    <input
                                      type="number"
                                      min="0"
                                      value={v.price}
                                      onChange={(e) => updateSizeVariant(idx, 'price', e.target.value)}
                                      placeholder={form.price || '0'}
                                      className="w-24 pl-5 pr-2 py-1 bg-[#141412] border border-[#3a3a36] text-[#d4af37] font-bold rounded text-xs focus:border-[#d4af37] outline-none"
                                    />
                                  </div>
                                </td>
                                <td className="py-2.5 px-3">
                                  <div className="relative flex items-center">
                                    <span className="absolute left-2 text-[#8a8278] text-xs">$</span>
                                    <input
                                      type="number"
                                      min="0"
                                      value={v.mrp}
                                      onChange={(e) => updateSizeVariant(idx, 'mrp', e.target.value)}
                                      placeholder={form.mrp || '0'}
                                      className="w-24 pl-5 pr-2 py-1 bg-[#141412] border border-[#3a3a36] text-[#c0b8ac] rounded text-xs focus:border-[#d4af37] outline-none"
                                    />
                                  </div>
                                </td>
                                <td className="py-2.5 px-3">
                                  <input
                                    type="number"
                                    min="0"
                                    value={v.stock}
                                    onChange={(e) => updateSizeVariant(idx, 'stock', e.target.value)}
                                    placeholder={form.stockCount || '12'}
                                    className="w-20 px-2 py-1 bg-[#141412] border border-[#3a3a36] text-[#f5f0e8] rounded text-xs font-mono focus:border-[#d4af37] outline-none"
                                  />
                                </td>
                                <td className="py-2.5 px-3">
                                  {vDiscount > 0 ? (
                                    <span className="bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">
                                      {vDiscount}% OFF
                                    </span>
                                  ) : (
                                    <span className="text-[#666] text-[11px]">—</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => removeSize(idx)}
                                    className="p-1 text-[#8a8278] hover:text-red-400 hover:bg-red-950/30 rounded transition"
                                    title="Remove this size"
                                  >
                                    <X size={14} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Add Custom Size Variant Row */}
                <div className="p-3 bg-[#171715] rounded-xl border border-[#333330] space-y-2">
                  <span className="text-[10px] font-serif uppercase tracking-[1px] text-[#c0b8ac] font-bold block">
                    + Add New Size Variant
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Optional Images Picker for new size */}
                    {customSizeImages.map((cImg, ciIdx) => (
                      <div key={ciIdx} className="relative w-8 h-8 rounded-lg border border-[#d4af37] overflow-hidden shrink-0 group">
                        <img src={cImg} alt="Size preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setCustomSizeImages((prev) => prev.filter((_, i) => i !== ciIdx))}
                          className="absolute inset-0 bg-black/80 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}

                    <label className="h-8 px-2.5 rounded-lg border border-dashed border-[#444440] hover:border-[#d4af37] flex items-center gap-1.5 cursor-pointer text-[#8a8278] hover:text-[#d4af37] text-[11px] shrink-0">
                      <Camera size={13} />
                      <span>+ Photos</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={async (e) => {
                          const files = e.target.files;
                          if (files && files.length > 0) {
                            const newB64s: string[] = [];
                            for (let fi = 0; fi < files.length; fi++) {
                              const b64 = await fileToBase64(files[fi]);
                              if (b64) newB64s.push(b64);
                            }
                            setCustomSizeImages((prev) => [...prev, ...newB64s]);
                          }
                        }}
                      />
                    </label>

                    <input
                      type="text"
                      placeholder="Size Name (e.g. 4XL)"
                      value={customSizeInput}
                      onChange={(e) => setCustomSizeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSize(customSizeInput, customSizePrice, customSizeMrp, customSizeStock, customSizeImages);
                        }
                      }}
                      className="flex-1 min-w-[120px] bg-[#1a1a18] border border-[#444440] text-[#f5f0e8] rounded-lg px-3 py-2 text-xs focus:border-[#d4af37] outline-none"
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder={`Price ($) [${form.price || '0'}]`}
                      value={customSizePrice}
                      onChange={(e) => setCustomSizePrice(e.target.value)}
                      className="w-28 bg-[#1a1a18] border border-[#444440] text-[#f5f0e8] rounded-lg px-3 py-2 text-xs focus:border-[#d4af37] outline-none"
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder={`MRP ($) [${form.mrp || '0'}]`}
                      value={customSizeMrp}
                      onChange={(e) => setCustomSizeMrp(e.target.value)}
                      className="w-28 bg-[#1a1a18] border border-[#444440] text-[#f5f0e8] rounded-lg px-3 py-2 text-xs focus:border-[#d4af37] outline-none"
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder={`Stock [${form.stockCount || '12'}]`}
                      value={customSizeStock}
                      onChange={(e) => setCustomSizeStock(e.target.value)}
                      className="w-24 bg-[#1a1a18] border border-[#444440] text-[#f5f0e8] rounded-lg px-3 py-2 text-xs font-mono focus:border-[#d4af37] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => addSize(customSizeInput, customSizePrice, customSizeMrp, customSizeStock, customSizeImages)}
                      className="px-4 py-2 bg-[#d4af37] text-[#1a1208] text-xs font-bold font-serif uppercase tracking-[1px] rounded-lg hover:bg-[#b89528] transition"
                    >
                      + Add Variant
                    </button>
                  </div>
                </div>
              </div>

              {/* ── HIGHLIGHTS MANAGER ("Why this product stands out") ── */}
              <div className="pt-2 border-t border-[#333330] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <label className="block font-serif text-[11px] uppercase tracking-[1.5px] text-[#d4af37] font-bold">
                      Highlights (Why this product stands out)
                    </label>
                    <span className="text-[11px] text-[#8a8278]">
                      Bullet points shown in the product highlights section
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, highlights: DEFAULT_HIGHLIGHTS }))}
                    className="text-[10px] text-[#d4af37] hover:underline font-serif uppercase tracking-[1px]"
                  >
                    Reset to Defaults
                  </button>
                </div>

                {/* Active Highlights List */}
                <div className="space-y-2">
                  {form.highlights.map((hl, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 bg-[#1a1a18] border border-[#333330] px-3.5 py-2.5 rounded-xl"
                    >
                      <div className="flex items-center gap-2.5 text-xs text-[#f5f0e8] font-medium">
                        <span className="text-[#d4af37] font-bold">✓</span>
                        <span>{hl}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeHighlight(idx)}
                        className="text-[#8a8278] hover:text-red-400 p-1 transition"
                        title="Remove highlight"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {PRESET_HIGHLIGHTS.filter((p) => !form.highlights.includes(p)).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => addHighlight(preset)}
                      className="text-[10px] bg-[#1a1a18] hover:bg-[#282824] text-[#8a8278] hover:text-[#d4af37] px-2.5 py-1 rounded-md border border-[#333330] transition"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>

                {/* Add Custom Highlight Input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Type custom highlight (e.g. Polished Brass Accents)..."
                    value={customHighlightInput}
                    onChange={(e) => setCustomHighlightInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addHighlight(customHighlightInput);
                      }
                    }}
                    className="flex-1 bg-[#1a1a18] border border-[#444440] text-[#f5f0e8] rounded-lg px-3.5 py-2 text-xs focus:border-[#d4af37] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => addHighlight(customHighlightInput)}
                    className="px-4 py-2 bg-[#333330] hover:bg-[#444440] text-white text-xs font-serif uppercase tracking-[1px] rounded-lg transition"
                  >
                    + Add Highlight
                  </button>
                </div>
              </div>

              {/* ── PRODUCT MEDIA (Main Hero, Video Demonstration & Additional Angles) ── */}
              <div className="space-y-4 pt-2 border-t border-[#333330]">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div>
                      <label className="block font-serif text-[11px] uppercase tracking-[1.5px] text-[#d4af37] font-bold">
                        Product Media (Hero Photo, Video Clip & Angles) *
                      </label>
                      <span className="text-[11px] text-[#8a8278]">
                        Upload photos and product video clip. Photos appear in listing/gallery and video plays directly in the main showcase.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => galleryRef.current?.click()}
                      className="text-[11px] text-[#d4af37] hover:underline font-serif uppercase tracking-[1px] flex items-center gap-1"
                    >
                      <Plus size={13} /> Add More Angles
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[160px_160px_1fr] gap-4 bg-[#1a1a18] p-4 rounded-xl border border-[#333330]">
                    {/* 1. Main Hero Photo Slot */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-serif uppercase tracking-[1px] text-[#d4af37] font-bold block">
                        ★ Main Hero Photo
                      </span>
                      {imagePreview ? (
                        <div className="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-[#d4af37] bg-black shadow-md">
                          <img src={imagePreview} alt="Hero" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setImagePreview('')}
                            className="absolute top-1.5 right-1.5 bg-black/80 hover:bg-red-600 text-white p-1 rounded-full transition shadow z-10"
                            title="Remove Hero Image"
                          >
                            <X size={12} />
                          </button>
                          <span className="absolute bottom-1 left-1 bg-[#1a1208]/90 text-[#d4af37] text-[8px] font-bold px-1.5 py-0.5 rounded">
                            HERO
                          </span>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileRef.current?.click()}
                          className="w-full aspect-square rounded-xl border-2 border-dashed border-[#d4af37]/60 hover:border-[#d4af37] bg-[#22221e] flex flex-col items-center justify-center text-center p-2 cursor-pointer transition hover:bg-[#282824]"
                        >
                          <Upload className="text-[#d4af37] mb-1" size={22} />
                          <span className="text-[10px] text-[#f5f0e8] font-serif uppercase tracking-[1px] font-bold">
                            Upload Hero
                          </span>
                        </div>
                      )}
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const b64 = await fileToBase64(file);
                            if (b64) setImagePreview(b64);
                          }
                        }}
                      />
                    </div>

                    {/* 2. Product Video Clip Slot */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-serif uppercase tracking-[1px] text-[#38bdf8] font-bold flex items-center gap-1">
                        <Film size={11} /> Video Clip
                      </span>
                      {uploadingVideo ? (
                        <div className="w-full aspect-square rounded-xl border-2 border-[#38bdf8] bg-[#1a2228] flex flex-col items-center justify-center text-center p-3 shadow-md">
                          <Loader2 className="animate-spin text-[#38bdf8] mb-2" size={26} />
                          <span className="text-[11px] text-[#38bdf8] font-serif uppercase tracking-[1px] font-bold">
                            Uploading Video...
                          </span>
                          <span className="text-[9px] text-[#94a3b8] mt-1">Direct Fast Stream</span>
                        </div>
                      ) : form.video ? (
                        <div className="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-[#38bdf8] bg-black shadow-md group">
                          <video
                            src={form.video}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                            onMouseOver={(e) => (e.currentTarget as HTMLVideoElement).play().catch(() => {})}
                            onMouseOut={(e) => (e.currentTarget as HTMLVideoElement).pause()}
                          />
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, video: '' })}
                            className="absolute top-1.5 right-1.5 bg-black/80 hover:bg-red-600 text-white p-1 rounded-full transition shadow z-10"
                            title="Remove Video"
                          >
                            <X size={12} />
                          </button>
                          <span className="absolute bottom-1 left-1 bg-[#0f172a]/90 text-[#38bdf8] text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <Play size={8} /> VIDEO
                          </span>
                        </div>
                      ) : (
                        <div
                          onClick={() => videoFileRef.current?.click()}
                          className="w-full aspect-square rounded-xl border-2 border-dashed border-[#38bdf8]/50 hover:border-[#38bdf8] bg-[#1a2228] flex flex-col items-center justify-center text-center p-2 cursor-pointer transition hover:bg-[#202c34]"
                        >
                          <Film className="text-[#38bdf8] mb-1" size={22} />
                          <span className="text-[10px] text-[#f5f0e8] font-serif uppercase tracking-[1px] font-bold">
                            Upload Video
                          </span>
                          <span className="text-[8px] text-[#94a3b8] mt-0.5">MP4, WebM, MOV (Fast)</span>
                        </div>
                      )}
                      <input
                        ref={videoFileRef}
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime,video/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              setUploadingVideo(true);
                              setError('');
                              // 1. Try fast stream upload
                              try {
                                const res = await uploadAdminMedia(file);
                                if (res?.url) {
                                  setForm((f) => ({ ...f, video: res.url }));
                                  setUploadingVideo(false);
                                  return;
                                }
                              } catch (streamErr) {
                                console.warn('Fast upload failed, trying base64 fallback:', streamErr);
                              }

                              // 2. Reliable Base64 fallback
                              const b64 = await fileToBase64(file);
                              if (b64) {
                                setForm((f) => ({ ...f, video: b64 }));
                              }
                            } catch (err: any) {
                              setError(err?.message || 'Video upload failed. Please check video format.');
                            } finally {
                              setUploadingVideo(false);
                              if (videoFileRef.current) videoFileRef.current.value = '';
                            }
                          }
                        }}
                      />
                    </div>

                    {/* 3. Additional Angles Gallery */}
                    <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-serif uppercase tracking-[1px] text-[#c0b8ac] font-bold block">
                          Additional Angle Photos ({galleryPreviews.length})
                        </span>
                        <span className="text-[10px] text-[#8a8278]">Hover to Set as Hero or Delete</span>
                      </div>

                      <div className="flex flex-wrap gap-2.5 min-h-[140px] p-2.5 bg-[#20201c] rounded-xl border border-[#333330] items-center">
                        {galleryPreviews.map((img, idx) => (
                          <div
                            key={idx}
                            className="group relative w-24 h-24 rounded-lg overflow-hidden border border-[#444440] bg-black shadow"
                          >
                            <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1.5 p-1">
                              <button
                                type="button"
                                onClick={() => setAsHero(img)}
                                className="text-[9px] font-bold bg-[#d4af37] text-[#1a1208] px-2 py-0.5 rounded uppercase hover:bg-[#e5c14d] transition"
                              >
                                Set Hero
                              </button>
                              <button
                                type="button"
                                onClick={() => setGalleryPreviews((p) => p.filter((_, i) => i !== idx))}
                                className="text-red-400 hover:text-red-300 transition p-1"
                                title="Delete Angle"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Add Angle Plus Box */}
                        <div
                          onClick={() => galleryRef.current?.click()}
                          className="w-24 h-24 rounded-lg border-2 border-dashed border-[#444440] hover:border-[#d4af37] bg-[#1a1a18] flex flex-col items-center justify-center text-center p-2 cursor-pointer transition hover:bg-[#242420]"
                        >
                          <Plus className="text-[#8a8278] group-hover:text-[#d4af37]" size={20} />
                          <span className="text-[9px] text-[#8a8278] uppercase mt-1 font-serif">Add Angle</span>
                        </div>

                        <input
                          ref={galleryRef}
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleMultiUpload(e.target.files, setGalleryPreviews)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="space-y-3 pt-2 border-t border-[#333330]">
                <div>
                  <label className="block font-serif text-[11px] uppercase tracking-[1px] text-[#c0b8ac] font-semibold mb-2">
                    Product Badge
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: '', label: 'None' },
                      { id: 'new', label: '✨ New' },
                      { id: 'bestseller', label: '🔥 Best Seller' },
                      { id: 'limited', label: '⏳ Limited' },
                      { id: 'handmade', label: '🔨 Handmade' },
                      { id: 'hot', label: '⚡ Hot Deal' },
                      { id: 'sale', label: '🏷️ On Sale' },
                    ].map((badge) => (
                      <button
                        key={badge.id}
                        type="button"
                        onClick={() => setForm({ ...form, badge: badge.id })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-serif uppercase tracking-[1px] transition ${
                          form.badge === badge.id
                            ? 'bg-[#d4af37] text-[#1a1208] font-bold shadow'
                            : 'bg-[#1a1a18] text-[#8a8278] hover:text-[#f5f0e8] border border-[#333330]'
                        }`}
                      >
                        {badge.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description, Item Details & Tags */}
              <div className="space-y-4 pt-2 border-t border-[#333330]">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-serif text-[11px] uppercase tracking-[1.5px] text-[#f5f0e8] font-bold">
                      Short Description (Overview)
                    </label>
                    <span className={`text-[11px] font-mono ${form.desc.length >= 480 ? 'text-amber-400 font-bold' : 'text-[#8a8278]'}`}>
                      {form.desc.length}/500 chars
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    maxLength={500}
                    placeholder="Brief 1-2 sentence overview of the piece (e.g. Authentic medieval chainmail coif crafted from 16 gauge blackened steel for battle reenactment and LARP events)..."
                    value={form.desc}
                    onChange={(e) => setForm({ ...form, desc: e.target.value })}
                    className="w-full bg-[#1a1a18] border border-[#444440] text-[#f5f0e8] rounded-lg p-3.5 text-sm leading-relaxed focus:border-[#d4af37] outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-serif text-[11px] uppercase tracking-[1.5px] text-[#d4af37] font-bold">
                      Item Details (Full Details & Specifications — No Limit)
                    </label>
                    <span className="text-[10px] text-[#8a8278]">
                      Supports paragraphs, bullet points (•), sizing notes & craft history
                    </span>
                  </div>
                  <textarea
                    rows={7}
                    placeholder={`• Handcrafted from premium 16-gauge mild steel rings with authentic oil-blackened finish.\n• Internal leather chin strap and padded collar for maximum comfort during reenactments.\n• Tested for light LARP, display, and film production standard.\n• Care instructions: Light oil application recommended after outdoor use to prevent oxidation.`}
                    value={form.itemDetails}
                    onChange={(e) => setForm({ ...form, itemDetails: e.target.value })}
                    className="w-full bg-[#1a1a18] border border-[#444440] text-[#f5f0e8] rounded-lg p-3.5 text-sm leading-relaxed focus:border-[#d4af37] outline-none font-sans"
                  />
                </div>

                <div>
                  <label className="block font-serif text-[11px] uppercase tracking-[1px] text-[#c0b8ac] font-semibold mb-2">
                    Search Tags (Comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. gambeson, aketon, larp, padded jacket, medieval"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    className="w-full bg-[#1a1a18] border border-[#444440] text-[#f5f0e8] rounded-lg px-4 py-2.5 text-sm focus:border-[#d4af37] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                SECTION 2: ADDITIONAL SPECIFICATIONS & MEDIA
               ══════════════════════════════════════════════════════════════════ */}
            <div className="bg-[#242420] border border-[#333330] rounded-2xl p-5 sm:p-8 space-y-6 shadow-md">
              <div className="border-b border-[#333330] pb-3">
                <h2 className="font-serif text-[16px] uppercase tracking-[1.5px] text-[#f5f0e8] font-bold flex items-center gap-2">
                  <Sliders className="text-[#d4af37]" size={18} /> Additional Specifications & Media
                </h2>
                <p className="text-xs text-[#8a8278] mt-0.5">
                  Material, finish, weight, manufacturing time, customer review photos, colors, and external links
                </p>
              </div>

              {/* SKU & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="font-serif text-[11px] uppercase tracking-[1px] text-[#c0b8ac] font-semibold">
                          SKU Code
                        </label>
                        <button
                          type="button"
                          onClick={generateSku}
                          className="text-[10px] text-[#d4af37] hover:underline font-serif uppercase tracking-[1px] flex items-center gap-1"
                        >
                          <Zap size={11} /> Auto-Generate
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. ZAFS-VA-102"
                        value={form.sku}
                        onChange={(e) => setForm({ ...form, sku: e.target.value })}
                        className="w-full bg-[#1a1a18] border border-[#444440] text-[#f5f0e8] rounded-lg px-4 py-2.5 text-sm focus:border-[#d4af37] outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-serif text-[11px] uppercase tracking-[1px] text-[#c0b8ac] font-semibold mb-2">
                        Brand Name
                      </label>
                      <input
                        type="text"
                        placeholder="ZAFS"
                        value={form.brand}
                        onChange={(e) => setForm({ ...form, brand: e.target.value })}
                        className="w-full bg-[#1a1a18] border border-[#444440] text-[#f5f0e8] rounded-lg px-4 py-2.5 text-sm focus:border-[#d4af37] outline-none"
                      />
                    </div>
                  </div>

                  {/* Material & Finish */}
                  <div>
                    <label className="block font-serif text-[11px] uppercase tracking-[1px] text-[#c0b8ac] font-semibold mb-2">
                      Primary Material
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 16 Gauge Mild Steel & Leather"
                      value={form.material}
                      onChange={(e) => setForm({ ...form, material: e.target.value })}
                      className="w-full bg-[#1a1a18] border border-[#444440] text-[#f5f0e8] rounded-lg px-4 py-2.5 text-sm focus:border-[#d4af37] outline-none mb-2"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_MATERIALS.map((mat) => (
                        <button
                          key={mat}
                          type="button"
                          onClick={() => setForm({ ...form, material: mat })}
                          className="text-[10px] bg-[#1a1a18] hover:bg-[#2e2e2a] text-[#8a8278] hover:text-[#d4af37] px-2.5 py-1 rounded-md border border-[#333330] transition"
                        >
                          + {mat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-serif text-[11px] uppercase tracking-[1px] text-[#c0b8ac] font-semibold mb-2">
                        Finish / Treatment
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Black Oiled (Rust Resistant)"
                        value={form.finish}
                        onChange={(e) => setForm({ ...form, finish: e.target.value })}
                        className="w-full bg-[#1a1a18] border border-[#444440] text-[#f5f0e8] rounded-lg px-4 py-2.5 text-sm focus:border-[#d4af37] outline-none mb-2"
                      />
                      <div className="flex flex-wrap gap-1.5">
                        {QUICK_FINISHES.map((fin) => (
                          <button
                            key={fin}
                            type="button"
                            onClick={() => setForm({ ...form, finish: fin })}
                            className="text-[10px] bg-[#1a1a18] hover:bg-[#2e2e2a] text-[#8a8278] hover:text-[#d4af37] px-2.5 py-1 rounded-md border border-[#333330] transition"
                          >
                            + {fin}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block font-serif text-[11px] uppercase tracking-[1px] text-[#c0b8ac] font-semibold mb-2">
                        Wire / Metal Gauge
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 14 Gauge / 16 Gauge / 4 mm"
                        value={form.gauge}
                        onChange={(e) => setForm({ ...form, gauge: e.target.value })}
                        className="w-full bg-[#1a1a18] border border-[#444440] text-[#f5f0e8] rounded-lg px-4 py-2.5 text-sm focus:border-[#d4af37] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-serif text-[11px] uppercase tracking-[1px] text-[#c0b8ac] font-semibold mb-2">
                        Weight
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 2.8 KG"
                        value={form.weight}
                        onChange={(e) => setForm({ ...form, weight: e.target.value })}
                        className="w-full bg-[#1a1a18] border border-[#444440] text-[#f5f0e8] rounded-lg px-4 py-2.5 text-sm focus:border-[#d4af37] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-serif text-[11px] uppercase tracking-[1px] text-[#c0b8ac] font-semibold mb-2">
                        Ring Size (Chainmail)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 9 mm / 10 mm"
                        value={form.ringSize}
                        onChange={(e) => setForm({ ...form, ringSize: e.target.value })}
                        className="w-full bg-[#1a1a18] border border-[#444440] text-[#f5f0e8] rounded-lg px-4 py-2.5 text-sm focus:border-[#d4af37] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-serif text-[11px] uppercase tracking-[1px] text-[#c0b8ac] font-semibold mb-2">
                        Ring Type (Chainmail)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Flat Riveted Solid"
                        value={form.ringType}
                        onChange={(e) => setForm({ ...form, ringType: e.target.value })}
                        className="w-full bg-[#1a1a18] border border-[#444440] text-[#f5f0e8] rounded-lg px-4 py-2.5 text-sm focus:border-[#d4af37] outline-none"
                      />
                    </div>
                  </div>

                  {/* Manufacturing, Country, HS Code */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div>
                      <label className="block font-serif text-[11px] uppercase tracking-[1px] text-[#c0b8ac] font-semibold mb-2">
                        Forging / Manufacturing Time
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 7-10 Days"
                        value={form.manufacturingTime}
                        onChange={(e) => setForm({ ...form, manufacturingTime: e.target.value })}
                        className="w-full bg-[#1a1a18] border border-[#444440] text-[#f5f0e8] rounded-lg px-4 py-2.5 text-sm focus:border-[#d4af37] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-serif text-[11px] uppercase tracking-[1px] text-[#c0b8ac] font-semibold mb-2">
                        Country of Origin
                      </label>
                      <input
                        type="text"
                        placeholder="India"
                        value={form.country}
                        onChange={(e) => setForm({ ...form, country: e.target.value })}
                        className="w-full bg-[#1a1a18] border border-[#444440] text-[#f5f0e8] rounded-lg px-4 py-2.5 text-sm focus:border-[#d4af37] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-serif text-[11px] uppercase tracking-[1px] text-[#c0b8ac] font-semibold mb-2">
                        HS Tariff Code
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 560900"
                        value={form.hsCode}
                        onChange={(e) => setForm({ ...form, hsCode: e.target.value })}
                        className="w-full bg-[#1a1a18] border border-[#444440] text-[#f5f0e8] rounded-lg px-4 py-2.5 text-sm focus:border-[#d4af37] outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Customer Photos (MAX 2 SLOTS) */}
                  <div className="pt-4 border-t border-[#333330]">
                    <div className="mb-3">
                      <label className="font-serif text-[12px] uppercase tracking-[1px] text-[#f5f0e8] font-bold block">
                        Customer Review Photos (Max 2 Photos)
                      </label>
                      <span className="text-xs text-[#8a8278]">
                        Show real customer in-use pictures on the product page
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Customer Photo 1 */}
                      <div className="bg-[#1a1a18] p-3 rounded-xl border border-[#333330]">
                        <span className="text-[10px] uppercase font-serif tracking-[1px] text-[#c0b8ac] block mb-2 font-bold">
                          Customer Photo 1
                        </span>
                        {customerPhoto1 ? (
                          <div className="relative w-full h-36 rounded-lg overflow-hidden border border-[#d4af37]/60">
                            <img src={customerPhoto1} alt="Cust 1" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setCustomerPhoto1('')}
                              className="absolute top-2 right-2 bg-black/80 hover:bg-red-600 text-white p-1 rounded-full"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => custPhoto1Ref.current?.click()}
                            className="w-full h-36 rounded-lg border border-dashed border-[#444440] hover:border-[#d4af37] flex flex-col items-center justify-center cursor-pointer transition"
                          >
                            <Camera className="text-[#8a8278] mb-1" size={20} />
                            <span className="text-xs text-[#c0b8ac]">Upload Photo 1</span>
                          </div>
                        )}
                        <input
                          ref={custPhoto1Ref}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              const b64 = await fileToBase64(f);
                              if (b64) setCustomerPhoto1(b64);
                            }
                          }}
                        />
                      </div>

                      {/* Customer Photo 2 */}
                      <div className="bg-[#1a1a18] p-3 rounded-xl border border-[#333330]">
                        <span className="text-[10px] uppercase font-serif tracking-[1px] text-[#c0b8ac] block mb-2 font-bold">
                          Customer Photo 2
                        </span>
                        {customerPhoto2 ? (
                          <div className="relative w-full h-36 rounded-lg overflow-hidden border border-[#d4af37]/60">
                            <img src={customerPhoto2} alt="Cust 2" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setCustomerPhoto2('')}
                              className="absolute top-2 right-2 bg-black/80 hover:bg-red-600 text-white p-1 rounded-full"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => custPhoto2Ref.current?.click()}
                            className="w-full h-36 rounded-lg border border-dashed border-[#444440] hover:border-[#d4af37] flex flex-col items-center justify-center cursor-pointer transition"
                          >
                            <Camera className="text-[#8a8278] mb-1" size={20} />
                            <span className="text-xs text-[#c0b8ac]">Upload Photo 2</span>
                          </div>
                        )}
                        <input
                          ref={custPhoto2Ref}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              const b64 = await fileToBase64(f);
                              if (b64) setCustomerPhoto2(b64);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* eBay Link */}
                  <div className="pt-4 border-t border-[#333330]">
                    <div>
                      <label className="block font-serif text-[11px] uppercase tracking-[1px] text-[#c0b8ac] font-semibold mb-2">
                        eBay Store Link
                      </label>
                      <input
                        type="url"
                        placeholder="https://www.ebay.com/str/zafexcollectibles"
                        value={form.ebayUrl}
                        onChange={(e) => setForm({ ...form, ebayUrl: e.target.value })}
                        className="w-full bg-[#1a1a18] border border-[#444440] text-[#f5f0e8] rounded-lg px-4 py-2.5 text-sm focus:border-[#d4af37] outline-none"
                      />
                    </div>
                  </div>

                  {/* Color Swatches */}
                  <div className="pt-4 border-t border-[#333330]">
                    <label className="block font-serif text-[11px] uppercase tracking-[1px] text-[#c0b8ac] font-semibold mb-3">
                      Color Swatches
                    </label>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {form.colors.map((color, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-[#1a1a18] border border-[#444440] px-3 py-1.5 rounded-full"
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/20"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-xs text-[#c0b8ac] font-mono uppercase">{color}</span>
                          <button
                            type="button"
                            onClick={() => removeColor(idx)}
                            className="text-[#8a8278] hover:text-red-400 ml-1"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2.5">
                      <input
                        type="color"
                        value={newColorHex}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={newColorHex}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        className="w-24 bg-[#1a1a18] border border-[#444440] text-[#f5f0e8] rounded px-2.5 py-1.5 text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => addColor(newColorHex)}
                        className="px-3 py-1.5 bg-[#333330] hover:bg-[#444440] text-white text-xs rounded font-serif uppercase tracking-[1px]"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => navigate('/admin/products')}
                className="px-6 py-3 bg-[#242420] border border-[#333330] text-[#c0b8ac] hover:text-[#f5f0e8] rounded-xl text-xs font-serif uppercase tracking-[1px] transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-gradient-to-r from-[#d4af37] to-[#b89528] text-[#1a1208] rounded-xl text-xs font-serif font-bold uppercase tracking-[1.5px] flex items-center gap-2 shadow-lg transition"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                {mode === 'create' ? 'Publish Listing' : 'Save Changes'}
              </button>
            </div>
          </form>

          {/* Right Live Storefront Preview Card (Desktop Only) */}
          {showLivePreview && (
            <aside className="hidden lg:block space-y-4">
              <div className="bg-[#242420] border border-[#333330] rounded-2xl p-5 sticky top-24 shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#333330] pb-3 mb-4">
                  <span className="font-serif text-[11px] uppercase tracking-[1.5px] text-[#d4af37] font-bold flex items-center gap-1.5">
                    <Eye size={13} /> Live Storefront Card
                  </span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40 font-bold">
                    Instant Live
                  </span>
                </div>

                {/* Card Container */}
                <div className="bg-[#f5f0e8] rounded-xl overflow-hidden shadow border border-[#d4cfc7] text-[#1a1a18]">
                  <div className="relative aspect-square bg-[#e8e2d8] overflow-hidden">
                    <img
                      src={imagePreview || galleryPreviews[0] || '/images/full-body-armor.png'}
                      alt="Preview"
                      className="w-full h-full object-cover transition duration-300"
                    />
                    {form.badge && (
                      <span className="absolute top-3 left-3 bg-[#1a1208] text-[#d4af37] text-[9px] font-bold uppercase tracking-[1.5px] px-2.5 py-1 rounded-full shadow">
                        {form.badge}
                      </span>
                    )}
                    {calculatedDiscount > 0 && (
                      <span className="absolute top-3 right-3 bg-[#b72a2a] text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-full shadow">
                        {calculatedDiscount}% OFF
                      </span>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#8b6914]">
                      {form.cat.replace(/-/g, ' ')}
                    </div>
                    <h3 className="font-serif text-[15px] font-bold text-[#1a1208] leading-snug line-clamp-2">
                      {form.name || 'Sample Product Title'}
                    </h3>

                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="font-sans text-[18px] font-bold text-[#1a1a18]">
                        ${Number(form.price || form.mrp || 0).toLocaleString('en-US')}
                      </span>
                      {mrpNum > 0 && priceNum > 0 && mrpNum > priceNum && (
                        <span className="font-sans text-xs text-[#8a8278] line-through">
                          ${mrpNum.toLocaleString('en-US')}
                        </span>
                      )}
                    </div>

                    {form.sizes.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        <span className="text-[10px] text-[#8a8278] uppercase font-serif">Sizes:</span>
                        {form.sizes.slice(0, 4).map((s, i) => (
                          <span key={i} className="text-[9px] bg-[#e6e1da] px-1.5 py-0.5 rounded text-[#1a1a18] font-bold">
                            {typeof s === 'object' ? s.size : s}
                          </span>
                        ))}
                      </div>
                    )}

                    {form.material && (
                      <div className="text-[11px] text-[#6b6b6b] truncate pt-1 border-t border-[#d4cfc7]/60">
                        🔨 {form.material}
                      </div>
                    )}

                    {form.colors.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-1">
                        {form.colors.slice(0, 5).map((c, i) => (
                          <span
                            key={i}
                            className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-xs"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 p-3 bg-[#1a1a18] rounded-xl border border-[#333330] text-[11px] text-[#8a8278] space-y-1">
                  <div className="flex justify-between">
                    <span>Stock:</span>
                    <span className={form.inStock ? 'text-emerald-400 font-bold font-mono' : 'text-red-400 font-bold'}>
                      {form.inStock ? `${form.stockCount || 12} in stock` : 'Out of Stock'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Highlights:</span>
                    <span className="text-[#f5f0e8] font-mono">
                      {form.highlights.length} bullet points
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer Photos:</span>
                    <span className="text-[#f5f0e8] font-mono">
                      {[customerPhoto1, customerPhoto2].filter(Boolean).length} / 2 uploaded
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
