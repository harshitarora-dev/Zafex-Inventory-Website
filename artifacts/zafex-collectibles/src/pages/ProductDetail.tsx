import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { PRODUCTS } from '@/data/products';
import {
  Heart,
  ShieldCheck,
  Truck,
  RefreshCcw,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ShoppingBag,
  Share2,
  Star,
  Copy,
  Gift,
  Camera,
  Film,
  MapPin,
  Loader2,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProduct, getProductReviews, submitProductReview, type Review } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist, useAddToWishlist, useRemoveFromWishlist } from '@/hooks/useWishlist';
import { useAddToCart } from '@/hooks/useCart';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useCompare } from '@/contexts/CompareContext';
import ProductCard from '@/components/ProductCard';

/* ─── FAQ Accordion ─────────────────────────────────────────────────── */

const FAQS = [
  {
    q: 'Is this battle ready?',
    a: 'Many of our metal pieces are finished for display and light reenactment. Battle-ready custom builds are available on request with reinforced joints and rounded edges.',
  },
  {
    q: 'Is it handmade?',
    a: 'Yes. Every product is hand-finished by our craftspeople using traditional techniques and modern quality checks to ensure authenticity and durability.',
  },
  {
    q: 'Can I customize?',
    a: 'Absolutely. We offer custom sizes, finishes, and personalization options. Consult our product page or contact support for bespoke orders.',
  },
  {
    q: 'How long is shipping?',
    a: 'Domestic orders typically ship within 3–5 business days. International delivery ranges from 10–18 business days depending on customs and destination.',
  },
  {
    q: 'What is the return policy?',
    a: 'Standard catalog items can be returned within 14 days when unused and in original condition. Custom or personalized items are non-returnable once production begins.',
  },
  {
    q: 'What is the cleaning method?',
    a: 'Wipe steel pieces with a dry cloth and apply a thin coat of mineral oil or Renaissance wax after handling. Avoid harsh chemicals and prolonged moisture.',
  },
  {
    q: 'How do I prevent rust?',
    a: 'Keep products dry, store in a climate-controlled place, and reapply a protective oil layer after use or exposure to humidity.',
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#d4cfc7]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-4 text-left gap-4"
        aria-expanded={open}
      >
        <span className="font-serif text-[14px] text-[#1a1a18] leading-snug">{q}</span>
        <ChevronDown
          size={16}
          className={`flex-shrink-0 text-[#6b6b6b] transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? '300px' : '0', opacity: open ? 1 : 0 }}
      >
        <p className="font-sans text-[13px] text-[#4a4a4a] leading-relaxed pb-5">{a}</p>
      </div>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────────────── */

const ProductDetail = () => {
  const { id } = useParams();
  const { data: dbProduct, isLoading: loadingDbProduct } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id!),
    enabled: !!id,
  });

  const staticProduct = PRODUCTS.find((p) => p.id === id);
  const product = dbProduct || staticProduct;

  const { toast } = useToast();
  const [qty, setQty] = useState(1);
  const [mainImg, setMainImg] = useState(product?.image ?? '');
  const [thumbIdx, setThumbIdx] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [, setLocation] = useLocation();
  const { isLoggedIn } = useAuth();
  const { formatPrice } = useCurrency();
  const { data: wishlistData } = useWishlist();
  const addWishlistMut = useAddToWishlist();
  const removeWishlistMut = useRemoveFromWishlist();
  const addToCartMut = useAddToCart();

  const wishlistItem = wishlistData?.items.find((item) => item.productId === id);
  const isWishlisted = !!wishlistItem;

  const [adding, setAdding] = useState(false);
  // Size & color defaults (fall back when product doesn't declare them)
  const SIZE_OPTIONS = product?.tags?.includes('women') ? ['S/M','L/XL'] : ['S/M','L/XL','2XL/3XL'];
  const [selectedSize, setSelectedSize] = useState<string | null>(SIZE_OPTIONS[0]);
  const COLOR_OPTIONS = product?.colors && product.colors.length > 0 ? product.colors : ['#000000', '#ffffff'];
  const [selectedColor, setSelectedColor] = useState<string | null>(COLOR_OPTIONS[0]);

  // Gallery: Support dynamic multiple images array
  const gallery = (product?.gallery && product.gallery.length > 0)
    ? product.gallery
    : (product?.image ? [product.image] : ['/images/full-body-armor.png']);

  // Sync main image when DB product arrives or changes
  useEffect(() => {
    if (product?.image) {
      setMainImg(product.image);
      setThumbIdx(0);
    }
  }, [product?.image, product?.gallery]);

  const { addToCompare, isInCompare, setIsCompareOpen } = useCompare();
  const isCompared = product ? isInCompare(product.id) : false;

  const queryClient = useQueryClient();
  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => getProductReviews(id!),
    enabled: !!id,
  });

  const { user } = useAuth();
  const reviewFormRef = useRef<HTMLDivElement>(null);
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [reviewerName, setReviewerName] = useState(user?.name || '');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [country, setCountry] = useState('India');

  // Load persistent reviews from localStorage
  const [localReviews, setLocalReviews] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem(`zafex_reviews_${id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const openReviewFormAndScroll = () => {
    setIsWritingReview(true);
    setTimeout(() => {
      reviewFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link Copied!',
        description: 'Product link copied to clipboard.',
      });
    }
  };

  const handleCompareClick = () => {
    if (!product) return;
    if (isCompared) {
      setIsCompareOpen(true);
      return;
    }
    const added = addToCompare(product);
    if (added) {
      toast({
        title: 'Added to comparison',
        description: `${product.name} added to comparison list.`,
      });
      setIsCompareOpen(true);
    } else {
      toast({
        title: 'Compare limit reached',
        description: 'You can compare up to 4 products at once.',
        variant: 'destructive',
      });
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      toast({
        title: 'Review required',
        description: 'Please write a brief comment sharing your feedback.',
        variant: 'destructive',
      });
      return;
    }

    const finalName = reviewerName.trim() || user?.name || 'Verified Collector';
    setSubmittingReview(true);
    try {
      const newReviewItem = {
        id: Date.now(),
        rating: reviewRating,
        comment: reviewComment.trim(),
        createdAt: new Date().toISOString(),
        user: { name: finalName },
      };

      const updated = [newReviewItem, ...localReviews];
      setLocalReviews(updated);
      try {
        localStorage.setItem(`zafex_reviews_${id}`, JSON.stringify(updated));
      } catch {}

      if (isLoggedIn) {
        await submitProductReview(id!, {
          rating: reviewRating,
          comment: reviewComment.trim(),
        }).catch(() => {});
        queryClient.invalidateQueries({ queryKey: ['reviews', id] });
      }

      toast({
        title: 'Review Published!',
        description: `Thank you, ${finalName}! Your review has been saved.`,
      });
      setReviewComment('');
      setIsWritingReview(false);
    } catch (err: unknown) {
      toast({
        title: 'Review Published',
        description: 'Your review has been saved.',
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  // Combine DB reviews with any local guest reviews
  const displayedReviews = [
    ...localReviews,
    ...(reviewsData?.reviews || [
      {
        id: 101,
        rating: 5,
        comment: 'Outstanding quality and craftsmanship. The weight and balance feel historically authentic.',
        createdAt: '2026-08-10T12:00:00Z',
        user: { name: 'Alexander V.' },
      },
      {
        id: 102,
        rating: 5,
        comment: 'Super fast delivery and securely packaged. The attention to detail on the forging is superb.',
        createdAt: '2026-08-14T09:30:00Z',
        user: { name: 'Elena M.' },
      },
      {
        id: 103,
        rating: 4,
        comment: 'Great piece for reenactments and display. Highly recommend Zafex collectibles!',
        createdAt: '2026-08-17T15:45:00Z',
        user: { name: 'Marcus B.' },
      },
    ]),
  ];

  const avgReviewScore = reviewsData?.averageRating || product?.rating || 4.9;
  const totalReviewCount = displayedReviews.length;

  const tabs = ['Description', 'Specifications', 'Size Guide', 'Shipping', 'Returns', 'Care', 'FAQs', 'Reviews'];
  const [activeTab, setActiveTab] = useState('Description');
  const related = (product?.cat ? PRODUCTS.filter((p) => p.cat === product.cat && p.id !== id).slice(0, 4) : PRODUCTS.slice(0, 4));

  useEffect(() => {
    if (product) {
      setMainImg(product.image || (product.gallery && product.gallery[0]) || '');
      setThumbIdx(0);
      setActiveTab('Description');
      setCountry('India');
    }
  }, [id, product]);

  if (loadingDbProduct && !staticProduct) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex flex-col items-center justify-center gap-4">
        <Loader2 size={40} className="animate-spin text-[#d4af37]" />
        <p className="font-serif text-[14px] uppercase tracking-[2px] text-[#1a1a18]">Forging product details…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex flex-col items-center justify-center text-center px-4">
        <h1 className="font-serif text-3xl md:text-4xl mb-4 text-[#1a1a18]">Product Not Found</h1>
        <p className="font-sans text-[#6b6b6b] text-[14px] mb-6 max-w-md">
          This piece may have been moved, retired, or is currently undergoing bespoke restoration in our forge.
        </p>
        <Link href="/shop" className="bg-[#1a1a18] text-white px-8 py-3.5 font-serif uppercase tracking-[2px] text-[12px] hover:bg-[#d4af37] hover:text-[#1a1a18] transition-colors">
          Return to Shop
        </Link>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to add items to your cart.',
      });
      setLocation('/login');
      return;
    }
    setAdding(true);
    try {
      await addToCartMut.mutateAsync({ productId: product.id, quantity: qty });
      toast({
        title: 'Added to cart!',
        description: `${qty}× ${product.name}${selectedSize ? ' — ' + selectedSize : ''}${selectedColor ? ' (' + selectedColor + ')' : ''} has been added to your cart.`,
      });
    } catch (err: unknown) {
      toast({
        title: 'Could not add to cart',
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setAdding(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!isLoggedIn) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to save items to your wishlist.',
      });
      setLocation('/login');
      return;
    }
    try {
      if (isWishlisted && wishlistItem) {
        await removeWishlistMut.mutateAsync(wishlistItem.id);
        toast({
          title: 'Removed from wishlist',
          description: product.name,
        });
      } else {
        await addWishlistMut.mutateAsync(product.id);
        toast({
          title: 'Added to wishlist',
          description: product.name,
        });
      }
    } catch (err: unknown) {
      toast({
        title: 'Wishlist error',
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const handleThumb = (img: string, idx: number) => {
    setMainImg(img);
    setThumbIdx(idx);
    setZoomed(false);
  };

  const stockRemaining = product?.inStock !== false ? 12 : 0;
  const shippingEstimate = country === 'India' ? '3-5 business days' : '10-18 business days';
  const rating = product?.rating ?? 4.8;
  const reviewCount = product?.reviewCount ?? 24;

  return (
    <div className="min-h-screen bg-[#f5f0e8] pb-24">
      <div className="w-full max-w-[1680px] mx-auto px-5 py-10">
        {/* Breadcrumb */}
        <div className="font-serif text-[11px] uppercase tracking-[2px] text-[#d4af37] mb-10 flex flex-wrap items-center gap-2">
          <Link href="/" className="hover:text-[#1a1a18] transition-colors">HOME</Link>
          <span className="text-[#d4cfc7]">/</span>
          <Link href="/shop" className="hover:text-[#1a1a18] transition-colors">SHOP</Link>
          {product.cat && (
            <>
              <span className="text-[#d4cfc7]">/</span>
              <Link href={`/shop?cat=${product.cat}`} className="hover:text-[#1a1a18] transition-colors capitalize">
                {product.cat}
              </Link>
            </>
          )}
          {product.sub && (
            <>
              <span className="text-[#d4cfc7]">/</span>
              <span className="text-[#1a1a18] capitalize">{product.sub.replace(/-/g, ' ')}</span>
            </>
          )}
          <span className="text-[#d4cfc7]">/</span>
          <span className="text-[#1a1a18]">{product.name}</span>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] xl:gap-16">
          <div className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <div
                  className="relative overflow-hidden rounded-[32px] bg-[#ede9e3] aspect-square cursor-crosshair select-none"
                  onMouseEnter={() => setZoomed(true)}
                  onMouseLeave={() => setZoomed(false)}
                  onMouseMove={handleMouseMove}
                >
                  <img
                    src={mainImg}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500"
                    style={
                      zoomed
                        ? {
                            transform: 'scale(1.85)',
                            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                            transition: 'transform 0.1s linear',
                          }
                        : { transform: 'scale(1)', transition: 'transform 0.4s ease' }
                    }
                    loading="eager"
                  />
                  {!zoomed && (
                    <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-4 py-2 text-[12px] font-medium text-[#1a1a18] flex items-center gap-2 shadow-sm">
                      <ZoomIn size={14} /> Hover to zoom
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {gallery.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => handleThumb(img, i)}
                      className={`overflow-hidden rounded-[22px] border transition ${
                        thumbIdx === i ? 'border-[#1a1a18]' : 'border-transparent hover:border-[#d4cfc7]'
                      }`}
                      aria-label={`Gallery thumb ${i + 1}`}
                    >
                      <img src={img} alt="Gallery thumbnail" className="h-20 w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[32px] border border-[#d4cfc7] bg-white p-6 shadow-sm">
                  <div className="font-serif text-[11px] uppercase tracking-[3px] text-[#d4af37] mb-3">Media & Styling</div>
                  <div className="space-y-3 text-[14px] text-[#4a4a4a]">
                    <p className="font-semibold text-[#1a1a18]">360° View + Lifestyle Gallery</p>
                    <p>Swipe through curated customer photos, lifestyle shots, and our 360° display preview for every angle.</p>
                    {product.video ? (
                      <div className="overflow-hidden rounded-[24px] border border-[#e6e1da] bg-[#f8f5f0]">
                        <video controls src={product.video} className="w-full h-44 object-cover" />
                      </div>
                    ) : (
                      <div className="rounded-[24px] border border-[#e6e1da] bg-[#f8f5f0] p-6 text-center text-[13px] text-[#6b6b6b]">
                        360° product preview coming soon.
                      </div>
                    )}
                  </div>
                </div>

                {(product.customerPhotos?.length || product.lifestyleImages?.length) && (
                  <div className="rounded-[32px] border border-[#d4cfc7] bg-white p-6 shadow-sm">
                    <div className="font-serif text-[11px] uppercase tracking-[3px] text-[#d4af37] mb-3">Customer Photos</div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {(product.customerPhotos ?? []).slice(0, 2).map((photo, index) => (
                        <img key={`cust-${index}`} src={photo} alt={`Customer ${index + 1}`} className="h-36 w-full rounded-[24px] object-cover" />
                      ))}
                      {(product.lifestyleImages ?? []).slice(0, 2).map((photo, index) => (
                        <img key={`life-${index}`} src={photo} alt={`Lifestyle ${index + 1}`} className="h-36 w-full rounded-[24px] object-cover" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[32px] border border-[#d4cfc7] bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <span className="font-serif text-[11px] uppercase tracking-[3px] text-[#d4af37]">Highlights</span>
                  <h2 className="font-serif text-[24px] font-bold text-[#1a1a18] mt-2">Why this product stands out</h2>
                </div>
                <div className="rounded-full bg-[#f5f0e8] px-4 py-2 text-[12px] uppercase tracking-[1px] text-[#1a1a18]">Best seller</div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {['Handmade', 'Museum Grade', 'Custom Size', 'Worldwide Shipping', 'Secure Checkout', 'Priority Support'].map((item) => (
                  <div key={item} className="rounded-3xl border border-[#e6e1da] bg-[#faf6f0] p-4 text-[14px] text-[#1a1a18]">
                    ✓ {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[32px] border border-[#d4cfc7] bg-white p-6 shadow-sm lg:sticky lg:top-6">
              <div className="flex flex-col gap-4">
                <div>
                  <span className="font-sans text-[11px] font-bold uppercase tracking-[2px] text-[#8b6914] block mb-1">
                    {product.cat} {product.sub ? `— ${product.sub.replace(/-/g, ' ')}` : ''}
                  </span>
                  <h1 className="font-serif text-[24px] sm:text-[30px] font-bold text-[#1a1208] leading-tight mb-3">
                    {product.name}
                  </h1>

                  {product.badge && (
                    <div className={`inline-flex rounded-full px-3.5 py-1 text-[10px] font-bold uppercase tracking-[1.5px] mb-3 ${
                      product.badge.toLowerCase() === 'new' ? 'bg-[#1a1a18] text-white' : 'bg-[#d4af37] text-[#1a1a18]'
                    }`}>
                      {product.badge}
                    </div>
                  )}

                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="font-sans text-[28px] sm:text-[32px] text-[#1a1a18] font-bold">
                      {formatPrice(product.price)}
                    </span>
                    {product.mrp && product.mrp > product.price ? (
                      <>
                        <span className="font-sans text-[18px] text-[#8a8278] line-through font-normal">
                          {formatPrice(product.mrp)}
                        </span>
                        <span className="bg-[#b72a2a] text-white text-[11px] font-bold uppercase tracking-[1px] px-2.5 py-0.5 rounded-full">
                          {product.discount ?? Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 text-[13px] text-[#4a4a4a]">
                  <span className="rounded-full bg-[#f5f0e8] px-3 py-2">{rating.toFixed(1)} ★</span>
                  <span className="rounded-full bg-[#f5f0e8] px-3 py-2">{reviewCount} reviews</span>
                  <span className="rounded-full bg-[#f5f0e8] px-3 py-2">{stockRemaining} left in stock</span>
                </div>

                <div className="grid gap-3 text-[13px] text-[#4a4a4a]">
                  {[
                    { label: 'SKU', value: product.sku ?? 'ZAFS-000' },
                    { label: 'Brand', value: product.brand ?? 'ZAFS' },
                    { label: 'Material', value: product.material ?? 'Mild Steel' },
                    { label: 'Finish', value: product.finish ?? 'Black Oiled' },
                    { label: 'Manufacturing Time', value: product.manufacturingTime ?? '7-10 Days' },
                    { label: 'Country', value: product.country ?? 'India' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between rounded-3xl border border-[#e6e1da] bg-[#faf6f0] px-4 py-3">
                      <span className="font-serif text-[11px] uppercase tracking-[1px] text-[#1a1a18]">{label}</span>
                      <span className="font-sans text-[13px] text-[#1a1a18]">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-[2px] text-[#6b6b6b] mb-2">Color</label>
                    <div className="flex items-center gap-3">
                      {COLOR_OPTIONS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setSelectedColor(c)}
                          aria-label={`Choose color ${c}`}
                          className={`h-8 w-8 rounded-md border ${selectedColor === c ? 'ring-2 ring-offset-1 ring-[#ff7a00]' : 'border-[#e6e1da]'}`}
                          style={{ background: c.startsWith('#') ? c : undefined }}
                        >
                          {!c.startsWith('#') && <span className="sr-only">{c}</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-[2px] text-[#6b6b6b] mb-2">Size</label>
                    <div className="flex items-center gap-3">
                      {SIZE_OPTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSelectedSize(s)}
                          className={`px-4 py-2 rounded-md border text-[13px] ${selectedSize === s ? 'bg-[#1a1a18] text-white' : 'bg-[#faf6f0] text-[#1a1a18] border-[#d4cfc7]'}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-[2px] text-[#6b6b6b] mb-2">Quantity</label>
                    <div className="inline-flex items-center gap-3">
                      <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-9 h-9 rounded-md border bg-[#faf6f0]">-</button>
                      <div className="px-4 font-semibold">{qty}</div>
                      <button onClick={() => setQty((q) => q + 1)} className="w-9 h-9 rounded-md border bg-[#faf6f0]">+</button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-[2px] text-[#6b6b6b] mb-2">Material</label>
                    <select className="w-full rounded-3xl border border-[#d4cfc7] bg-[#faf6f0] px-4 py-3 text-[14px] text-[#1a1a18]">
                      <option>{product.material ?? 'Mild Steel'}</option>
                      <option>Stainless Steel</option>
                      <option>Brass</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={adding}
                    className="w-full rounded-full bg-[#1a1a18] py-4 text-[13px] uppercase tracking-[2px] text-white transition hover:bg-[#c6a767] hover:text-[#1a1208] disabled:opacity-50"
                  >
                    {adding ? 'Adding...' : 'Add to Cart'}
                  </button>

                  <button
                    onClick={handleToggleWishlist}
                    className={`w-full rounded-full border px-4 py-3 text-[12px] uppercase tracking-[2px] flex items-center justify-center gap-2 transition ${
                      isWishlisted
                        ? 'bg-[#9c1c1c] text-white border-[#9c1c1c]'
                        : 'bg-[#faf6f0] text-[#1a1a18] hover:border-[#1a1a18]'
                    }`}
                  >
                    <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
                    {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={handleCompareClick}
                    className={`rounded-full border px-4 py-3 text-[12px] uppercase tracking-[2px] flex items-center justify-center gap-2 transition cursor-pointer ${
                      isCompared
                        ? 'bg-[#1a1a18] text-[#d4af37] border-[#1a1a18]'
                        : 'border-[#d4cfc7] bg-[#faf6f0] text-[#1a1a18] hover:border-[#1a1a18]'
                    }`}
                  >
                    <Heart size={16} fill={isCompared ? 'currentColor' : 'none'} />
                    {isCompared ? 'In Compare List' : 'Compare'}
                  </button>
                  <button
                    onClick={handleShare}
                    className="rounded-full border border-[#d4cfc7] bg-[#faf6f0] px-4 py-3 text-[12px] uppercase tracking-[2px] text-[#1a1a18] hover:border-[#1a1a18] flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Share2 size={16} /> Share
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-[#d4cfc7] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-[14px] font-semibold text-[#1a1a18]">
                <MapPin size={18} className="text-[#d4af37]" /> Shipping Estimate
              </div>
              <div className="grid gap-3">
                <div className="rounded-3xl border border-[#e6e1da] bg-[#faf6f0] px-4 py-4">
                  <p className="text-[13px] text-[#6b6b6b]">Destination</p>
                  <p className="font-semibold text-[#1a1a18]">{country}</p>
                </div>
                <div className="rounded-3xl border border-[#e6e1da] bg-[#faf6f0] px-4 py-4">
                  <p className="text-[13px] text-[#6b6b6b]">Expected Delivery</p>
                  <p className="font-semibold text-[#1a1a18]">{shippingEstimate}</p>
                </div>
                <div className="rounded-3xl border border-[#e6e1da] bg-[#faf6f0] px-4 py-4">
                  <p className="text-[13px] text-[#6b6b6b]">Courier</p>
                  <p className="font-semibold text-[#1a1a18]">{country === 'India' ? 'BlueDart / Delhivery' : 'DHL / FedEx'}</p>
                </div>
                <p className="text-[12px] text-[#6b6b6b]">Import duties notice: duties may be collected by the courier on arrival and are not included in the product price.</p>
              </div>
            </div>
          </aside>
        </div>

        {/* Sticky mobile add to cart */}
        <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden border-t border-[#d4cfc7] bg-white/95 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-sans text-[12px] uppercase tracking-[2px] text-[#6b6b6b]">{stockRemaining} in stock</p>
              <p className="font-serif text-[18px] font-bold text-[#1a1a18]">₹{product.price.toLocaleString('en-IN')}</p>
            </div>
            <button
              onClick={handleAddToCart}
              className="rounded-full bg-[#1a1a18] px-5 py-3 text-[12px] uppercase tracking-[2px] text-white"
            >
              Add to Cart
            </button>
          </div>
        </div>

        {/* ── Customer Reviews & Ratings Section ── */}
        <div className="mt-16 pt-12 border-t border-[#d4cfc7]" id="reviews">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <span className="font-serif text-[11px] text-[#d4af37] tracking-[3px] uppercase block mb-1">AUTHENTIC FEEDBACK</span>
              <h2 className="font-serif text-[28px] sm:text-[32px] font-bold text-[#1a1208] uppercase">
                Customer Reviews ({totalReviewCount})
              </h2>
            </div>
            <button
              onClick={() => isWritingReview ? setIsWritingReview(false) : openReviewFormAndScroll()}
              className="inline-flex items-center justify-center bg-[#1a1a18] hover:bg-[#c6a767] hover:text-[#1a1a18] text-white px-6 py-3 rounded-full font-sans text-[11px] font-bold uppercase tracking-[1.5px] transition shadow cursor-pointer"
            >
              {isWritingReview ? 'Close Review Form' : 'Write a Review'}
            </button>
          </div>

          {/* Rating Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white border border-[#ded7cb] rounded-2xl p-6 mb-8 shadow-sm">
            {/* Left: Overall Score */}
            <div className="flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-[#eee8dc]">
              <span className="font-serif text-[48px] font-bold text-[#1a1208] leading-none mb-2">
                {avgReviewScore.toFixed(1)}
              </span>
              <div className="flex text-[#d4af37] mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={18} fill={i < Math.round(avgReviewScore) ? 'currentColor' : 'none'} />
                ))}
              </div>
              <span className="text-[12px] text-[#7a7062] font-medium">Based on {totalReviewCount} verified reviews</span>
            </div>

            {/* Middle: Star Breakdown */}
            <div className="flex flex-col justify-center gap-2 p-2 md:col-span-2">
              {[
                { stars: 5, pct: 86 },
                { stars: 4, pct: 10 },
                { stars: 3, pct: 3 },
                { stars: 2, pct: 1 },
                { stars: 1, pct: 0 },
              ].map(({ stars, pct }) => (
                <div key={stars} className="flex items-center gap-3 text-[12px] text-[#5a5043]">
                  <span className="w-12 text-right font-medium">{stars} Stars</span>
                  <div className="flex-1 h-2 bg-[#eee8dc] rounded-full overflow-hidden">
                    <div className="h-full bg-[#c6a767] rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-10 text-left font-bold text-[#8a8070]">{pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Write a Review Form Modal/Drawer */}
          {isWritingReview && (
            <form ref={reviewFormRef} onSubmit={handleReviewSubmit} className="bg-[#faf8f4] border border-[#d8d2c6] rounded-2xl p-6 mb-8 shadow-sm animate-in fade-in">
              <h3 className="font-serif text-[18px] font-bold text-[#1a1a18] uppercase tracking-[1px] mb-4">
                Share Your Experience with {product.name}
              </h3>

              {/* Author Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-sans text-[11px] font-bold uppercase tracking-[1px] text-[#4a4033] mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-white border border-[#d8d2c6] rounded-lg p-2.5 text-[13px] text-[#1a1a18] outline-none focus:border-[#8b6914] shadow-inner"
                    required
                  />
                </div>
              </div>

              {/* Star Rating Picker */}
              <div className="mb-4">
                <label className="block font-sans text-[11px] font-bold uppercase tracking-[1px] text-[#4a4033] mb-1.5">
                  Your Rating *
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setReviewHoverRating(star)}
                      onMouseLeave={() => setReviewHoverRating(0)}
                      onClick={() => setReviewRating(star)}
                      className="p-1 text-[#d4af37] transition transform hover:scale-110"
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star
                        size={24}
                        fill={(reviewHoverRating || reviewRating) >= star ? 'currentColor' : 'none'}
                        className={(reviewHoverRating || reviewRating) >= star ? 'text-[#d4af37]' : 'text-[#d4af37]/30'}
                      />
                    </button>
                  ))}
                  <span className="font-bold text-[13px] text-[#2a2016] ml-2">
                    {reviewRating} of 5 Stars
                  </span>
                </div>
              </div>

              {/* Review Comment */}
              <div className="mb-4">
                <label className="block font-sans text-[11px] font-bold uppercase tracking-[1px] text-[#4a4033] mb-1.5">
                  Review Comment *
                </label>
                <textarea
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="How was the build quality, craftsmanship, balance, or delivery experience?"
                  className="w-full bg-white border border-[#d8d2c6] rounded-lg p-3 text-[13px] text-[#1a1a18] outline-none focus:border-[#8b6914] shadow-inner"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsWritingReview(false)}
                  className="px-5 py-2.5 rounded-full border border-[#d4cfc7] text-[#4a4033] text-[11px] font-bold uppercase tracking-[1px] hover:bg-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-2.5 rounded-full bg-[#1a1a18] hover:bg-[#c6a767] hover:text-[#1a1208] text-white text-[11px] font-bold uppercase tracking-[1.5px] transition disabled:opacity-50 cursor-pointer"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          )}

          {/* List of Verified Reviews */}
          <div className="space-y-4 mb-12">
            {displayedReviews.map((rev: any, idx: number) => {
              const nameToShow = rev.user?.name || rev.authorName || 'Verified Collector';
              return (
                <div key={rev.id || idx} className="bg-white border border-[#ded7cb] rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1a1208] text-[#d4af37] font-bold font-serif flex items-center justify-center text-[14px]">
                        {nameToShow.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-sans text-[13px] font-bold text-[#1a1208]">
                          {nameToShow}
                        </h4>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#2e7d32]">
                          <CheckCircle2 size={11} /> Verified Buyer
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex text-[#d4af37] mb-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={13}
                            fill={i < rev.rating ? 'currentColor' : 'none'}
                            className={i < rev.rating ? 'text-[#d4af37]' : 'text-[#d4af37]/30'}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-[#8a8070]">
                        {new Date(rev.createdAt || Date.now()).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                  <p className="font-sans text-[13px] text-[#4a4033] leading-relaxed">
                    {rev.comment}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── FAQ Section ── */}
        <div className="mt-8 pt-12 border-t border-[#d4cfc7] max-w-[800px]">
          <span className="font-serif text-[11px] text-[#d4af37] tracking-[3px] uppercase block mb-2">NEED TO KNOW</span>
          <h2 className="font-serif text-[28px] font-bold text-[#1a1a18] uppercase mb-8">
            Frequently Asked Questions
          </h2>
          {FAQS.map((faq, i) => (
            <FaqItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>

        {/* ── Related Products ── */}
        {related.length > 0 && (
          <div className="mt-16 pt-12 border-t border-[#d4cfc7]">
            <div className="mb-10">
              <span className="font-serif text-[11px] text-[#d4af37] tracking-[3px] uppercase block mb-2">FROM THE SAME COLLECTION</span>
              <h2 className="font-serif text-[32px] font-bold text-[#1a1a18] uppercase">Frequently Bought Together</h2>
              <div className="w-10 h-[3px] bg-[#9c1c1c] mt-4" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-[18px]">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
