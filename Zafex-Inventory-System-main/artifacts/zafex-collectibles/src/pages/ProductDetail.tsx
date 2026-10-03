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
  Play,
  Video,
  X,
  Image as ImageIcon,
  Plus,
  Trash2,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProduct, getProducts, getProductReviews, submitProductReview, deleteReview, type Review } from '@/lib/api';
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
  const { user, isLoggedIn } = useAuth();
  const { formatPrice } = useCurrency();
  const { data: wishlistData } = useWishlist();
  const addWishlistMut = useAddToWishlist();
  const removeWishlistMut = useRemoveFromWishlist();
  const addToCartMut = useAddToCart();

  const wishlistItem = wishlistData?.items.find((item) => item.productId === id);
  const isWishlisted = !!wishlistItem;

  const [adding, setAdding] = useState(false);
  
  // Normalized Size Variants (supporting custom price, MRP, stock, and multi-photos per size)
  const sizeVariants = React.useMemo(() => {
    if (!product) return [];
    const basePrice = product.price ?? 0;
    const baseMrp = product.mrp;
    const baseStock = product.inStock !== false ? (product.stockCount ?? 12) : 0;

    const rawSizes = product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0
      ? product.sizes
      : [];

    const parsedList = rawSizes.map((item: any) => {
      if (!item) return null;
      if (typeof item === 'string') {
        const trimmed = item.trim();
        if (!trimmed || trimmed === '[object Object]') return null;
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          try {
            const parsed = JSON.parse(trimmed);
            const sName = typeof parsed.size === 'string' ? parsed.size.trim() : '';
            if (!sName || sName === '[object Object]') return null;
            const vPrice = parsed.price != null && Number(parsed.price) > 0 ? Number(parsed.price) : basePrice;
            const vMrp = parsed.mrp != null && Number(parsed.mrp) > 0 ? Number(parsed.mrp) : baseMrp;
            const vDiscount = vMrp && vPrice && vMrp > vPrice ? Math.round(((vMrp - vPrice) / vMrp) * 100) : (product.discount ?? 0);
            const imgs = Array.isArray(parsed.images)
              ? parsed.images.filter(Boolean)
              : (parsed.image ? [parsed.image] : []);
            return {
              size: sName,
              price: vPrice,
              mrp: vMrp,
              stock: parsed.stock != null ? Number(parsed.stock) : baseStock,
              discount: vDiscount,
              image: imgs[0] || undefined,
              images: imgs,
            };
          } catch {}
        }
        const vPrice = basePrice;
        const vMrp = baseMrp;
        const vDiscount = vMrp && vMrp > vPrice ? Math.round(((vMrp - vPrice) / vMrp) * 100) : (product.discount ?? 0);
        return {
          size: trimmed,
          price: vPrice,
          mrp: vMrp,
          stock: baseStock,
          discount: vDiscount,
          image: undefined as string | undefined,
          images: [] as string[],
        };
      }
      if (typeof item === 'object') {
        const sName = typeof item.size === 'string' ? item.size.trim() : (typeof item.name === 'string' ? item.name.trim() : '');
        if (!sName || sName === '[object Object]') return null;
        const sPrice = item.price != null && Number(item.price) > 0 ? Number(item.price) : basePrice;
        const sMrp = item.mrp != null && Number(item.mrp) > 0 ? Number(item.mrp) : baseMrp;
        const sStock = item.stock != null && !isNaN(Number(item.stock)) ? Number(item.stock) : baseStock;
        const sDiscount = sMrp && sPrice && sMrp > sPrice ? Math.round(((sMrp - sPrice) / sMrp) * 100) : (product.discount ?? 0);
        const imgs = Array.isArray(item.images)
          ? item.images.filter(Boolean)
          : (item.image ? [item.image] : []);
        return {
          size: sName,
          price: sPrice,
          mrp: sMrp,
          stock: sStock,
          discount: sDiscount,
          image: imgs[0] || undefined,
          images: imgs,
        };
      }
      return null;
    }).filter((v): v is NonNullable<typeof v> => v !== null && v.size.trim().length > 0 && v.size !== '[object Object]');

    if (parsedList.length > 0) return parsedList;

    const fallbackPresets = product.tags?.includes('women') ? ['S/M', 'L/XL'] : ['S/M', 'L/XL', '2XL/3XL'];
    return fallbackPresets.map((s) => ({
      size: s,
      price: basePrice,
      mrp: baseMrp,
      stock: baseStock,
      discount: product.discount ?? 0,
      image: undefined,
      images: [],
    }));
  }, [product]);

  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Sync selectedSize whenever sizeVariants change
  useEffect(() => {
    if (sizeVariants.length > 0) {
      if (!selectedSize || !sizeVariants.some((v) => v.size === selectedSize)) {
        setSelectedSize(sizeVariants[0].size);
      }
    }
  }, [sizeVariants]);

  const activeVariant = sizeVariants.find((v) => v.size === selectedSize) || sizeVariants[0] || null;
  const currentPrice = activeVariant?.price ?? product?.price ?? 0;
  const currentMrp = activeVariant?.mrp ?? product?.mrp;
  const currentDiscount = activeVariant?.discount ?? product?.discount ?? 0;
  const currentStock = activeVariant?.stock !== undefined ? activeVariant.stock : (product?.inStock !== false ? (product?.stockCount ?? 12) : 0);

  const handleSizeSelect = (sizeName: string) => {
    setSelectedSize(sizeName);
    setActiveMediaIdx(0);
    setZoomed(false);
    // Smoothly scroll the window back to the top as requested
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const COLOR_OPTIONS = product?.colors && product.colors.length > 0 ? product.colors : ['#000000', '#ffffff'];
  const [selectedColor, setSelectedColor] = useState<string | null>(COLOR_OPTIONS[0]);

  // Gallery & Video: Unified Media Items Array with Variant Image Support
  const mediaList = React.useMemo(() => {
    const rawImages = (product?.gallery && product.gallery.length > 0)
      ? product.gallery
      : (product?.image ? [product.image] : ['/images/full-body-armor.png']);
    
    // If active size variant has custom photos, display all variant photos first, then default photos
    const variantImgs = (activeVariant?.images && activeVariant.images.length > 0)
      ? activeVariant.images
      : (activeVariant?.image ? [activeVariant.image] : []);

    const uniqueVariantImgs = Array.from(new Set(variantImgs.filter(Boolean)));
    const uniqueDefaultImgs = Array.from(new Set(rawImages.filter(Boolean)));

    const combinedImages = uniqueVariantImgs.length > 0
      ? [...uniqueVariantImgs, ...uniqueDefaultImgs.filter((img) => !uniqueVariantImgs.includes(img))]
      : uniqueDefaultImgs;

    const items: Array<{ type: 'image' | 'video'; url: string }> = combinedImages.map((img) => ({
      type: 'image',
      url: img,
    }));

    if (product?.video && product.video.trim()) {
      items.push({ type: 'video', url: product.video.trim() });
    }
    return items;
  }, [product?.image, product?.gallery, product?.video, activeVariant?.images, activeVariant?.image]);

  const [activeMediaIdx, setActiveMediaIdx] = useState(0);

  // Reset active media when product or active variant images change
  useEffect(() => {
    setActiveMediaIdx(0);
    setZoomed(false);
  }, [product?.id, product?.image, product?.gallery, product?.video, activeVariant?.size, activeVariant?.images, activeVariant?.image]);

  const currentMedia = mediaList[activeMediaIdx] || {
    type: 'image',
    url: product?.image || '/images/full-body-armor.png',
  };

  const { addToCompare, isInCompare, setIsCompareOpen } = useCompare();
  const isCompared = product ? isInCompare(product.id) : false;

  const queryClient = useQueryClient();
  const { data: reviewsData, isLoading: loadingReviews } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => getProductReviews(id!),
    enabled: !!id,
  });

  const reviewFormRef = useRef<HTMLDivElement>(null);
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewPhotos, setReviewPhotos] = useState<string[]>([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);
  const [zoomedReviewPhoto, setZoomedReviewPhoto] = useState<string | null>(null);
  const [country, setCountry] = useState('India');
  const [openItemDetails, setOpenItemDetails] = useState(true);
  const [openDeliveryPolicies, setOpenDeliveryPolicies] = useState(false);

  function compressImageToBase64(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (!dataUrl) return resolve('');
        const img = new Image();
        img.onload = () => {
          const MAX_DIM = 1000;
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
          if (!ctx) return resolve(dataUrl);
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  }

  const handleReviewPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newImgs: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const b64 = await compressImageToBase64(files[i]);
      if (b64) newImgs.push(b64);
    }
    setReviewPhotos((prev) => [...prev, ...newImgs].slice(0, 5));
    if (e.target) e.target.value = '';
  };

  const removeReviewPhoto = (photoIdx: number) => {
    setReviewPhotos((prev) => prev.filter((_, i) => i !== photoIdx));
  };

  const openReviewFormAndScroll = () => {
    if (!isLoggedIn) {
      toast({
        title: 'Sign In Required',
        description: 'Please sign in to write a verified collector review.',
      });
      setLocation(`/login?redirect=/shop/${id}#reviews`);
      return;
    }
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
    if (!isLoggedIn) {
      toast({
        title: 'Sign In Required',
        description: 'Please sign in to write a review.',
        variant: 'destructive',
      });
      setLocation(`/login?redirect=/shop/${id}#reviews`);
      return;
    }

    if (!reviewComment.trim()) {
      toast({
        title: 'Review description required',
        description: 'Please share a few details about your experience with this item.',
        variant: 'destructive',
      });
      return;
    }

    setSubmittingReview(true);
    try {
      await submitProductReview(id!, {
        rating: reviewRating,
        title: reviewTitle.trim() || undefined,
        comment: reviewComment.trim(),
        photos: reviewPhotos.length > 0 ? reviewPhotos : undefined,
      });

      toast({
        title: 'Review Published!',
        description: 'Thank you! Your verified review has been published.',
      });
      setReviewTitle('');
      setReviewComment('');
      setReviewPhotos([]);
      setIsWritingReview(false);
      queryClient.invalidateQueries({ queryKey: ['reviews', id] });
    } catch (err: unknown) {
      toast({
        title: 'Could not submit review',
        description: err instanceof Error ? err.message : 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    setDeletingReviewId(reviewId);
    try {
      await deleteReview(reviewId);
      toast({
        title: 'Review Deleted',
        description: 'Your review has been successfully removed.',
      });
      queryClient.invalidateQueries({ queryKey: ['reviews', id] });
    } catch (err: unknown) {
      toast({
        title: 'Could not delete review',
        description: err instanceof Error ? err.message : 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setDeletingReviewId(null);
    }
  };

  // Authentic Database Reviews Only (no stock/mock reviews)
  const displayedReviews: Review[] = reviewsData?.reviews || [];
  const totalReviewCount = reviewsData?.totalReviews ?? displayedReviews.length;
  const avgReviewScore = reviewsData?.averageRating ?? (totalReviewCount > 0 ? (displayedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviewCount) : 0);
  const starBreakdown = reviewsData?.starBreakdown || {
    5: { count: 0, percentage: 0 },
    4: { count: 0, percentage: 0 },
    3: { count: 0, percentage: 0 },
    2: { count: 0, percentage: 0 },
    1: { count: 0, percentage: 0 },
  };

  const tabs = ['Description', 'Specifications', 'Size Guide', 'Shipping', 'Returns', 'Care', 'FAQs', 'Reviews'];
  const [activeTab, setActiveTab] = useState('Description');
  const { data: allProductsData } = useQuery({
    queryKey: ['products'],
    queryFn: () => getProducts(),
  });

  const fullProductList = React.useMemo(() => {
    return allProductsData?.products && allProductsData.products.length > 0
      ? allProductsData.products
      : PRODUCTS;
  }, [allProductsData]);

  const related = React.useMemo(() => {
    if (!product) return [];
    return fullProductList.filter((p) => p.cat === product.cat && p.id !== id).slice(0, 4);
  }, [fullProductList, product?.cat, id]);

  const youMayAlsoLike = React.useMemo(() => {
    const excludedIds = new Set(related.map((p) => p.id));
    if (id) excludedIds.add(id);
    const candidates = fullProductList.filter((p) => !excludedIds.has(p.id));
    if (candidates.length <= 4) return candidates;
    const seed = (id || 'zafex').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const shuffled = [...candidates].sort((a, b) => {
      const hashA = (a.id.charCodeAt(0) * 31 + seed) % 100;
      const hashB = (b.id.charCodeAt(0) * 31 + seed) % 100;
      return hashA - hashB;
    });
    return shuffled.slice(0, 4);
  }, [fullProductList, related, id]);

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

  const highlightsList =
    product?.highlights && Array.isArray(product.highlights) && product.highlights.length > 0
      ? product.highlights
      : [
          'Handmade Craftsmanship',
          'Museum Grade Detailing',
          'Custom Sizing Available',
          'Worldwide Insured Shipping',
          '100% Authentic Quality',
          'Priority Customer Support',
        ];

  const stockRemaining = currentStock;
  const shippingEstimate = country === 'India' ? '3-5 business days' : '10-18 business days';
  const rating = product?.rating ?? 4.8;
  const reviewCount = product?.reviewCount ?? 24;

  return (
    <div className="min-h-screen bg-[#f5f0e8] pb-28 lg:pb-24">
      <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Breadcrumb */}
        <div className="font-serif text-[10px] sm:text-[11px] uppercase tracking-[1.5px] sm:tracking-[2px] text-[#d4af37] mb-6 sm:mb-10 flex flex-wrap items-center gap-1.5 sm:gap-2">
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
              <span className="text-[#1a1a18] capitalize truncate max-w-[140px] sm:max-w-none">{product.sub.replace(/-/g, ' ')}</span>
            </>
          )}
          <span className="text-[#d4cfc7]">/</span>
          <span className="text-[#1a1a18] truncate max-w-[180px] sm:max-w-none">{product.name}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] xl:gap-14">
          <div className="space-y-6">
            <div className="space-y-6">
              {/* Main Hero Media Display (Image Zoom or Video Player) */}
              <div
                className="relative overflow-hidden rounded-[32px] bg-[#1a1a18] aspect-square max-h-[640px] select-none border border-[#d4cfc7] flex items-center justify-center"
                onMouseEnter={() => {
                  if (currentMedia.type === 'image') setZoomed(true);
                }}
                onMouseLeave={() => setZoomed(false)}
                onMouseMove={handleMouseMove}
              >
                {currentMedia.type === 'video' ? (
                  <div className="relative w-full h-full bg-black flex items-center justify-center">
                    <video
                      key={currentMedia.url}
                      controls
                      autoPlay
                      playsInline
                      src={currentMedia.url}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-4 left-4 rounded-full bg-black/75 px-3 py-1.5 text-[11px] font-bold text-[#38bdf8] flex items-center gap-1.5 border border-[#38bdf8]/40 shadow-sm pointer-events-none">
                      <Play size={12} fill="#38bdf8" /> Video Demonstration
                    </div>
                  </div>
                ) : (
                  <>
                    <img
                      src={currentMedia.url}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 cursor-crosshair"
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
                      <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-4 py-2 text-[12px] font-medium text-[#1a1a18] flex items-center gap-2 shadow-sm pointer-events-none">
                        <ZoomIn size={14} /> Hover to zoom
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Multi-angle & Video Thumbnails Carousel */}
              {mediaList.length > 1 && (
                <div className="flex flex-wrap gap-3">
                  {mediaList.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setActiveMediaIdx(i);
                        setZoomed(false);
                      }}
                      className={`relative overflow-hidden rounded-[20px] border-2 transition w-20 h-20 sm:w-24 sm:h-24 ${
                        activeMediaIdx === i
                          ? 'border-[#1a1a18] shadow-md scale-105 ring-2 ring-[#d4af37]'
                          : 'border-transparent hover:border-[#d4cfc7]'
                      }`}
                      aria-label={`Media thumb ${i + 1}`}
                    >
                      {item.type === 'video' ? (
                        <div className="relative w-full h-full bg-[#1a1a18] flex flex-col items-center justify-center p-1 text-center group">
                          <video
                            src={item.url}
                            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition"
                            muted
                            playsInline
                          />
                          <div className="relative z-10 w-8 h-8 rounded-full bg-[#d4af37] text-[#1a1208] flex items-center justify-center shadow-lg">
                            <Play size={14} fill="#1a1208" className="ml-0.5" />
                          </div>
                          <span className="relative z-10 text-[9px] font-serif uppercase tracking-[1px] font-bold text-white mt-1 drop-shadow">
                            Video
                          </span>
                        </div>
                      ) : (
                        <img src={item.url} alt="Gallery thumbnail" className="h-full w-full object-cover" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Customer Photos (Max 2, fully responsive) */}
              {product.customerPhotos && product.customerPhotos.filter(Boolean).length > 0 && (
                <div className="rounded-[32px] border border-[#d4cfc7] bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-serif text-[11px] uppercase tracking-[3px] text-[#d4af37]">Customer Photos</div>
                    <span className="text-[12px] text-[#8a8278] font-serif uppercase tracking-[1px]">Verified In-Use</span>
                  </div>
                  <div className={`grid gap-4 ${product.customerPhotos.filter(Boolean).length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                    {product.customerPhotos.filter(Boolean).slice(0, 2).map((photo, index) => (
                      <div key={`cust-${index}`} className="relative rounded-[24px] overflow-hidden bg-[#ede9e3] border border-[#e6e1da] aspect-[4/3]">
                        <img
                          src={photo}
                          alt={`Customer Photo ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition duration-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl sm:rounded-[32px] border border-[#d4cfc7] bg-white p-5 sm:p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-5 sm:mb-6">
                <div>
                  <span className="font-serif text-[10px] sm:text-[11px] uppercase tracking-[3px] text-[#d4af37]">Highlights</span>
                  <h2 className="font-serif text-[20px] sm:text-[24px] font-bold text-[#1a1a18] mt-1 sm:mt-2">Why this product stands out</h2>
                </div>
                <div className="rounded-full bg-[#f5f0e8] px-3.5 py-1.5 text-[11px] sm:text-[12px] uppercase tracking-[1px] text-[#1a1a18] font-bold">
                  {product.badge ? product.badge.toUpperCase() : 'BEST SELLER'}
                </div>
              </div>
              <div className="grid gap-2.5 sm:gap-3 sm:grid-cols-2">
                {highlightsList.map((item) => (
                  <div key={item} className="rounded-2xl border border-[#e6e1da] bg-[#faf6f0] p-3 sm:p-4 text-[13px] sm:text-[14px] text-[#1a1a18] flex items-center gap-2">
                    <span className="text-[#d4af37] font-bold">✓</span> {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl sm:rounded-[32px] border border-[#d4cfc7] bg-white p-5 sm:p-6 shadow-sm lg:sticky lg:top-6">
              <div className="flex flex-col gap-4">
                <div>
                  <span className="font-sans text-[10px] sm:text-[11px] font-bold uppercase tracking-[2px] text-[#8b6914] block mb-1">
                    {product.cat} {product.sub ? `— ${product.sub.replace(/-/g, ' ')}` : ''}
                  </span>
                  <h1 className="font-serif text-[22px] sm:text-[28px] md:text-[30px] font-bold text-[#1a1208] leading-tight mb-2.5">
                    {product.name}
                  </h1>

                  {product.badge && (
                    <div className={`inline-flex rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-[1.5px] mb-2.5 ${
                      product.badge.toLowerCase() === 'new' ? 'bg-[#1a1a18] text-white' : 'bg-[#d4af37] text-[#1a1208]'
                    }`}>
                      {product.badge}
                    </div>
                  )}

                  <div className="flex flex-wrap items-baseline gap-2.5 sm:gap-3">
                    <span className="font-sans text-[26px] sm:text-[32px] text-[#1a1a18] font-bold">
                      {formatPrice(currentPrice)}
                    </span>
                    {currentMrp && currentMrp > currentPrice ? (
                      <>
                        <span className="font-sans text-[16px] sm:text-[18px] text-[#8a8278] line-through font-normal">
                          {formatPrice(currentMrp)}
                        </span>
                        <span className="bg-[#b72a2a] text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-[1px] px-2.5 py-0.5 rounded-full">
                          {currentDiscount}% OFF
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-[12px] sm:text-[13px] text-[#4a4a4a]">
                  <span className="rounded-full bg-[#f5f0e8] px-3 py-1.5 font-medium">
                    {totalReviewCount > 0 ? `${avgReviewScore.toFixed(1)} ★` : 'No reviews yet'}
                  </span>
                  <span className="rounded-full bg-[#f5f0e8] px-3 py-1.5">
                    {totalReviewCount > 0 ? `${totalReviewCount} reviews` : 'Be the first to review'}
                  </span>
                  <span className={`rounded-full px-3 py-1.5 font-medium ${currentStock > 0 ? 'bg-[#f5f0e8] text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                    {currentStock > 0 ? `${currentStock} in stock` : 'Out of stock'}
                  </span>
                </div>

                <div className="space-y-4 pt-1">
                  <div>
                    <label className="block text-[11px] uppercase tracking-[2px] text-[#6b6b6b] mb-2 font-semibold">Color Options</label>
                    <div className="flex flex-wrap items-center gap-2.5">
                      {(product.colors && product.colors.length > 0 ? product.colors : COLOR_OPTIONS).map((c) => (
                        <button
                          key={c}
                          onClick={() => setSelectedColor(c)}
                          aria-label={`Choose color ${c}`}
                          className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full border shadow-sm transition transform hover:scale-110 ${selectedColor === c ? 'ring-2 ring-offset-2 ring-[#d4af37]' : 'border-[#d4cfc7]'}`}
                          style={{ background: c.startsWith('#') ? c : undefined }}
                        >
                          {!c.startsWith('#') && <span className="sr-only">{c}</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-[11px] uppercase tracking-[2px] text-[#6b6b6b] font-semibold">
                        Size: <span className="text-[#1a1a18] font-bold">{selectedSize || 'Standard'}</span>
                      </label>
                      {activeVariant?.stock !== undefined && (
                        <span className={`text-[11px] font-medium ${currentStock > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                          {currentStock > 0 ? `${currentStock} available` : 'Out of stock'}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      {sizeVariants.map((v) => {
                        const isSelected = selectedSize === v.size;
                        return (
                          <button
                            key={v.size}
                            onClick={() => handleSizeSelect(v.size)}
                            className={`min-w-[56px] px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl border text-xs sm:text-[13px] font-serif font-bold uppercase tracking-[1px] transition text-center ${
                              isSelected
                                ? 'bg-[#1a1a18] text-[#d4af37] border-[#1a1a18] shadow-md ring-2 ring-[#d4af37]/40 scale-[1.03]'
                                : 'bg-[#faf6f0] text-[#1a1a18] border-[#d4cfc7] hover:border-[#1a1a18] hover:bg-[#ede8df]'
                            }`}
                          >
                            {v.size}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-[2px] text-[#6b6b6b] mb-2 font-semibold">Quantity</label>
                    <div className="inline-flex items-center rounded-lg border border-[#d4cfc7] bg-[#faf6f0] overflow-hidden">
                      <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-9 h-9 flex items-center justify-center text-[#1a1a18] font-bold hover:bg-[#ede9e3] transition">-</button>
                      <div className="px-4 font-semibold text-sm">{qty}</div>
                      <button onClick={() => setQty((q) => q + 1)} className="w-9 h-9 flex items-center justify-center text-[#1a1a18] font-bold hover:bg-[#ede9e3] transition">+</button>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2.5 pt-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={adding || currentStock <= 0}
                    className="w-full rounded-xl sm:rounded-full bg-[#1a1a18] py-3.5 sm:py-4 text-xs sm:text-[13px] uppercase tracking-[2px] text-white transition hover:bg-[#c6a767] hover:text-[#1a1208] disabled:opacity-50 font-bold shadow-lg"
                  >
                    {adding ? 'Adding to Cart...' : currentStock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>

                  <button
                    onClick={handleToggleWishlist}
                    className={`w-full rounded-xl sm:rounded-full border px-4 py-3 text-xs sm:text-[12px] uppercase tracking-[1.5px] flex items-center justify-center gap-2 transition font-semibold ${
                      isWishlisted
                        ? 'bg-[#9c1c1c] text-white border-[#9c1c1c]'
                        : 'bg-[#faf6f0] text-[#1a1a18] border-[#d4cfc7] hover:border-[#1a1a18]'
                    }`}
                  >
                    <Heart size={15} fill={isWishlisted ? 'currentColor' : 'none'} />
                    {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={handleCompareClick}
                    className={`rounded-xl sm:rounded-full border px-3 py-2.5 text-[11px] sm:text-[12px] uppercase tracking-[1px] flex items-center justify-center gap-1.5 transition cursor-pointer font-medium ${
                      isCompared
                        ? 'bg-[#1a1a18] text-[#d4af37] border-[#1a1a18]'
                        : 'border-[#d4cfc7] bg-[#faf6f0] text-[#1a1a18] hover:border-[#1a1a18]'
                    }`}
                  >
                    <Heart size={14} fill={isCompared ? 'currentColor' : 'none'} />
                    <span className="truncate">{isCompared ? 'Comparing' : 'Compare'}</span>
                  </button>
                  <button
                    onClick={handleShare}
                    className="rounded-xl sm:rounded-full border border-[#d4cfc7] bg-[#faf6f0] px-3 py-2.5 text-[11px] sm:text-[12px] uppercase tracking-[1px] text-[#1a1a18] hover:border-[#1a1a18] flex items-center justify-center gap-1.5 transition cursor-pointer font-medium"
                  >
                    <Share2 size={14} /> Share
                  </button>
                </div>

                {/* ── Accordion 1: Item details (Etsy / Amazon style) ── */}
                <div className="border-t border-[#e6e1da] pt-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setOpenItemDetails((o) => !o)}
                    className="w-full flex items-center justify-between py-2.5 text-left font-serif text-[14px] sm:text-[15px] font-bold text-[#1a1208] uppercase tracking-[1px] hover:text-[#8b6914] transition cursor-pointer group select-none"
                  >
                    <span>Item details</span>
                    <ChevronDown
                      size={18}
                      className={`text-[#6b6b6b] group-hover:text-[#1a1208] transition-transform duration-300 ${
                        openItemDetails ? 'rotate-180 text-[#8b6914]' : ''
                      }`}
                    />
                  </button>

                  {openItemDetails && (
                    <div className="pt-2 pb-3 space-y-4 text-[13px] text-[#3a3a38] leading-relaxed animate-in fade-in">
                      {/* Short Description */}
                      {product.desc && (
                        <div className="bg-[#faf6f0] border-l-2 border-[#d4af37] p-3.5 rounded-r-xl text-[#2a2a28] font-sans text-xs sm:text-[13px]">
                          {product.desc}
                        </div>
                      )}

                      {/* Detailed Item Details / About This Item */}
                      {product.itemDetails && (
                        <div className="space-y-2 pt-1">
                          <h4 className="font-serif text-[11px] font-bold uppercase tracking-[1.5px] text-[#8b6914]">
                            About this item
                          </h4>
                          <div className="space-y-1.5 font-sans text-xs sm:text-[13px]">
                            {product.itemDetails.split('\n').map((line, lIdx) => {
                              const trimmed = line.trim();
                              if (!trimmed) return null;
                              if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
                                const cleanBullet = trimmed.replace(/^[•\-*]\s*/, '');
                                return (
                                  <div key={lIdx} className="flex items-start gap-2">
                                    <span className="text-[#d4af37] font-bold mt-0.5">•</span>
                                    <span>{cleanBullet}</span>
                                  </div>
                                );
                              }
                              return (
                                <p key={lIdx} className="text-[#3a3a38]">
                                  {trimmed}
                                </p>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Specifications Attribute Table */}
                      <div className="grid gap-2 pt-1 text-[12px] text-[#4a4a4a]">
                        {[
                          { label: 'SKU', value: product.sku ?? 'ZAFS-000' },
                          { label: 'Brand', value: product.brand ?? 'ZAFS' },
                          { label: 'Material', value: product.material ?? 'Mild Steel' },
                          { label: 'Finish', value: product.finish ?? 'Black Oiled' },
                          product.gauge ? { label: 'Gauge', value: product.gauge } : null,
                          product.ringSize ? { label: 'Ring Size', value: product.ringSize } : null,
                          product.ringType ? { label: 'Ring Type', value: product.ringType } : null,
                          product.weight ? { label: 'Weight', value: product.weight } : null,
                          { label: 'Forging Time', value: product.manufacturingTime ?? '7-10 Days' },
                          { label: 'Country of Origin', value: product.country ?? 'India' },
                        ]
                          .filter(Boolean)
                          .map((item) => (
                            <div key={item!.label} className="flex items-center justify-between rounded-xl border border-[#e6e1da] bg-[#faf6f0] px-3 py-2">
                              <span className="font-serif text-[10px] sm:text-[11px] uppercase tracking-[1px] text-[#1a1a18]">{item!.label}</span>
                              <span className="font-sans text-[12px] text-[#1a1a18] font-medium truncate max-w-[180px] sm:max-w-[220px] text-right">{item!.value}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Accordion 2: Delivery and return policies (Etsy style) ── */}
                <div className="border-t border-[#e6e1da] pt-4">
                  <button
                    type="button"
                    onClick={() => setOpenDeliveryPolicies((o) => !o)}
                    className="w-full flex items-center justify-between py-2.5 text-left font-serif text-[14px] sm:text-[15px] font-bold text-[#1a1208] uppercase tracking-[1px] hover:text-[#8b6914] transition cursor-pointer group select-none"
                  >
                    <span>Delivery and return policies</span>
                    <ChevronDown
                      size={18}
                      className={`text-[#6b6b6b] group-hover:text-[#1a1208] transition-transform duration-300 ${
                        openDeliveryPolicies ? 'rotate-180 text-[#8b6914]' : ''
                      }`}
                    />
                  </button>

                  {openDeliveryPolicies && (
                    <div className="pt-2 pb-3 space-y-2.5 text-[12px] sm:text-[13px] text-[#3a3a38] leading-relaxed animate-in fade-in">
                      <div className="flex items-start gap-2.5 bg-[#faf6f0] p-3 rounded-xl border border-[#e6e1da]">
                        <MapPin size={16} className="text-[#d4af37] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-[#1a1a18]">Dispatched from {product.country ?? 'India'}</p>
                          <p className="text-[#6b6b6b] text-[11px]">Hand-finished and securely packed at our forge workshop.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 bg-[#faf6f0] p-3 rounded-xl border border-[#e6e1da]">
                        <Truck size={16} className="text-[#d4af37] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-[#1a1a18]">Estimated Delivery: {shippingEstimate}</p>
                          <p className="text-[#6b6b6b] text-[11px]">Courier: {country === 'India' ? 'BlueDart / Delhivery Express' : 'DHL / FedEx International'}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 bg-[#faf6f0] p-3 rounded-xl border border-[#e6e1da]">
                        <RefreshCcw size={16} className="text-[#d4af37] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-[#1a1a18]">Returns & Exchanges Accepted</p>
                          <p className="text-[#6b6b6b] text-[11px]">14-day hassle-free return window for standard catalog pieces in original condition.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Sticky mobile add to cart bar */}
        <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden border-t border-[#d4cfc7] bg-white/95 px-4 py-3 backdrop-blur-md shadow-2xl safe-bottom">
          <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
            <div className="truncate">
              <p className="font-sans text-[10px] uppercase tracking-[1.5px] text-[#6b6b6b]">
                {currentStock > 0 ? `${currentStock} in stock (${selectedSize || 'Standard'})` : 'Out of stock'}
              </p>
              <p className="font-sans text-[18px] font-bold text-[#1a1a18]">{formatPrice(currentPrice)}</p>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={adding || currentStock <= 0}
              className="rounded-xl bg-[#1a1a18] px-6 py-3 text-[11px] uppercase tracking-[1.5px] text-[#d4af37] font-bold shadow-md hover:bg-[#282824] transition shrink-0 disabled:opacity-50"
            >
              {currentStock <= 0 ? 'Out of Stock' : 'Add to Cart'}
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
                {totalReviewCount > 0 ? avgReviewScore.toFixed(1) : '0.0'}
              </span>
              <div className="flex text-[#d4af37] mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    fill={totalReviewCount > 0 && i < Math.round(avgReviewScore) ? 'currentColor' : 'none'}
                    className={totalReviewCount > 0 && i < Math.round(avgReviewScore) ? 'text-[#d4af37]' : 'text-[#d4cfc7]'}
                  />
                ))}
              </div>
              <span className="text-[12px] text-[#7a7062] font-medium">
                {totalReviewCount > 0 ? `Based on ${totalReviewCount} verified review${totalReviewCount === 1 ? '' : 's'}` : 'No verified reviews yet'}
              </span>
            </div>

            {/* Middle: Star Breakdown */}
            <div className="flex flex-col justify-center gap-2 p-2 md:col-span-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = starBreakdown[stars]?.count ?? 0;
                const pct = starBreakdown[stars]?.percentage ?? 0;
                return (
                  <div key={stars} className="flex items-center gap-3 text-[12px] text-[#5a5043]">
                    <span className="w-14 text-right font-medium">{stars} Stars</span>
                    <div className="flex-1 h-2 bg-[#eee8dc] rounded-full overflow-hidden">
                      <div className="h-full bg-[#c6a767] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-16 text-left font-bold text-[#8a8070] text-[11px]">{pct}% ({count})</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Write a Review Form Modal/Drawer */}
          {isWritingReview && (
            <form ref={reviewFormRef} onSubmit={handleReviewSubmit} className="bg-[#faf8f4] border border-[#d8d2c6] rounded-2xl p-6 sm:p-8 mb-8 shadow-sm animate-in fade-in">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h3 className="font-serif text-[18px] sm:text-[20px] font-bold text-[#1a1a18] uppercase tracking-[1px]">
                  Write a Verified Review
                </h3>
                <span className="text-xs bg-[#eadecc] text-[#1a1a18] px-3 py-1 rounded-full font-medium">
                  {user?.name || user?.email || 'Logged In Collector'}
                </span>
              </div>

              {/* Star Rating Picker */}
              <div className="mb-5">
                <label className="block font-sans text-[11px] font-bold uppercase tracking-[1px] text-[#4a4033] mb-1.5">
                  Rating *
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setReviewHoverRating(star)}
                      onMouseLeave={() => setReviewHoverRating(0)}
                      onClick={() => setReviewRating(star)}
                      className="p-1 text-[#d4af37] transition transform hover:scale-125 cursor-pointer"
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star
                        size={26}
                        fill={(reviewHoverRating || reviewRating) >= star ? 'currentColor' : 'none'}
                        className={(reviewHoverRating || reviewRating) >= star ? 'text-[#d4af37]' : 'text-[#d4cfc7]'}
                      />
                    </button>
                  ))}
                  <span className="font-bold text-[13px] text-[#2a2016] ml-3">
                    {reviewRating} of 5 Stars
                  </span>
                </div>
              </div>

              {/* Review Title */}
              <div className="mb-4">
                <label className="block font-sans text-[11px] font-bold uppercase tracking-[1px] text-[#4a4033] mb-1.5">
                  Review Headline (Optional)
                </label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="e.g. Masterpiece forging & incredible weight!"
                  className="w-full bg-white border border-[#d8d2c6] rounded-xl p-3 text-[13px] text-[#1a1a18] outline-none focus:border-[#8b6914] shadow-inner"
                />
              </div>

              {/* Review Comment */}
              <div className="mb-5">
                <label className="block font-sans text-[11px] font-bold uppercase tracking-[1px] text-[#4a4033] mb-1.5">
                  Review Details *
                </label>
                <textarea
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Describe the craftsmanship, metal finish, packaging, and your overall experience..."
                  className="w-full bg-white border border-[#d8d2c6] rounded-xl p-3 text-[13px] text-[#1a1a18] outline-none focus:border-[#8b6914] shadow-inner"
                  required
                />
              </div>

              {/* Photo Upload Section */}
              <div className="mb-6">
                <label className="block font-sans text-[11px] font-bold uppercase tracking-[1px] text-[#4a4033] mb-2">
                  Attach Photos (Up to 5)
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  {reviewPhotos.map((photo, pIdx) => (
                    <div key={pIdx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#d4cfc7] group shadow-sm bg-white">
                      <img src={photo} alt={`Review photo ${pIdx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeReviewPhoto(pIdx)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/75 text-white flex items-center justify-center hover:bg-red-600 transition"
                        title="Remove photo"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}

                  {reviewPhotos.length < 5 && (
                    <label className="w-20 h-20 rounded-xl border-2 border-dashed border-[#c6a767] bg-[#fdfcf9] hover:bg-[#f5eee1] flex flex-col items-center justify-center text-[#8b6914] cursor-pointer transition">
                      <Camera size={20} className="mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.5px]">Add Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleReviewPhotoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#e6e0d4]">
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
                  className="px-7 py-3 rounded-full bg-[#1a1a18] hover:bg-[#c6a767] hover:text-[#1a1208] text-white text-[11px] font-bold uppercase tracking-[1.5px] transition disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {submittingReview ? 'Submitting Review...' : 'Publish Review'}
                </button>
              </div>
            </form>
          )}

          {/* List of Verified Reviews OR Authentic Empty State */}
          {displayedReviews.length === 0 ? (
            <div className="bg-white border border-dashed border-[#d8d2c6] rounded-2xl p-10 sm:p-14 text-center mb-12 shadow-sm">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#f5f0e8] flex items-center justify-center text-[#d4af37] mb-4">
                <Star size={28} />
              </div>
              <h4 className="font-serif text-[20px] font-bold text-[#1a1208] mb-2 uppercase tracking-[0.5px]">
                No Reviews Yet
              </h4>
              <p className="font-sans text-[13px] text-[#7a7062] max-w-md mx-auto mb-6 leading-relaxed">
                Be the first verified collector to share your review and photos for {product.name}.
              </p>
              <button
                onClick={openReviewFormAndScroll}
                className="inline-flex items-center justify-center bg-[#1a1a18] hover:bg-[#c6a767] hover:text-[#1a1a18] text-white px-7 py-3 rounded-full font-sans text-[11px] font-bold uppercase tracking-[1.5px] transition shadow cursor-pointer"
              >
                Write the First Review
              </button>
            </div>
          ) : (
            <div className="space-y-4 mb-12">
              {displayedReviews.map((rev: any, idx: number) => {
                const nameToShow = rev.user?.name || rev.authorName || 'Verified Collector';
                const avatarUrl = rev.user?.avatar;
                const photos: string[] = Array.isArray(rev.photos) ? rev.photos : [];
                return (
                  <div key={rev.id || idx} className="bg-white border border-[#ded7cb] rounded-2xl p-6 sm:p-7 shadow-sm">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt={nameToShow} className="w-10 h-10 rounded-full object-cover border border-[#d4cfc7]" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#1a1208] text-[#d4af37] font-bold font-serif flex items-center justify-center text-[14px]">
                            {nameToShow.charAt(0).toUpperCase()}
                          </div>
                        )}
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
                        <div className="flex text-[#d4af37] mb-1 justify-end">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              fill={i < rev.rating ? 'currentColor' : 'none'}
                              className={i < rev.rating ? 'text-[#d4af37]' : 'text-[#d4cfc7]'}
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

                    {rev.title && (
                      <h5 className="font-sans text-[14px] font-bold text-[#1a1208] mb-1.5">
                        {rev.title}
                      </h5>
                    )}

                    <p className="font-sans text-[13px] text-[#4a4033] leading-relaxed mb-3">
                      {rev.comment}
                    </p>

                    {/* Customer Attached Photos */}
                    {photos.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2.5 pt-2">
                        {photos.map((photoUrl, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => setZoomedReviewPhoto(photoUrl)}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-[#d4cfc7] hover:border-[#1a1a18] transition transform hover:scale-105 shadow-sm group relative"
                            title="Click to zoom photo"
                          >
                            <img src={photoUrl} alt="Review attachment" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white">
                              <ZoomIn size={16} />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Action button if current logged in user owns this review */}
                    {isLoggedIn && user && (user.id === rev.userId || Number(user.id) === Number(rev.userId)) && (
                      <div className="flex items-center justify-end pt-3 mt-3 border-t border-[#eee8dc]">
                        <button
                          type="button"
                          onClick={() => handleDeleteReview(rev.id)}
                          disabled={deletingReviewId === rev.id}
                          className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800 font-semibold px-3 py-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer disabled:opacity-50"
                        >
                          {deletingReviewId === rev.id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Trash2 size={13} />
                          )}
                          {deletingReviewId === rev.id ? 'Deleting...' : 'Delete My Review'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Lightbox Modal for Customer Review Photos */}
        {zoomedReviewPhoto && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-in fade-in"
            onClick={() => setZoomedReviewPhoto(null)}
          >
            <div className="relative max-w-3xl max-h-[90vh] bg-transparent" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setZoomedReviewPhoto(null)}
                className="absolute -top-10 right-0 text-white hover:text-[#d4af37] transition flex items-center gap-1 text-sm font-semibold"
              >
                <X size={20} /> Close
              </button>
              <img
                src={zoomedReviewPhoto}
                alt="Enlarged review photo"
                className="max-h-[85vh] max-w-full rounded-2xl shadow-2xl object-contain border border-white/20"
              />
            </div>
          </div>
        )}

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

        {/* ── Related Products (Frequently Bought Together) ── */}
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

        {/* ── You May Also Like ── */}
        {youMayAlsoLike.length > 0 && (
          <div className="mt-16 pt-12 border-t border-[#d4cfc7]">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="font-serif text-[11px] text-[#d4af37] tracking-[3px] uppercase block mb-2">CURATED SELECTION</span>
                <h2 className="font-serif text-[28px] sm:text-[32px] font-bold text-[#1a1a18] uppercase">You May Also Like</h2>
                <div className="w-10 h-[3px] bg-[#9c1c1c] mt-4" />
              </div>
              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 font-serif text-[12px] sm:text-[13px] font-bold uppercase tracking-[1.5px] text-[#8b6914] hover:text-[#1a1a18] transition-colors pb-1 border-b border-transparent hover:border-[#1a1a18] shrink-0"
              >
                <span>See more</span>
                <span className="text-base leading-none">→</span>
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-[18px]">
              {youMayAlsoLike.map((p, i) => (
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
