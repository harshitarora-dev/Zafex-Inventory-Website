import React, { useRef, useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Heart, Eye, ShoppingBag, Star, Truck, RefreshCcw, CheckCircle2, Scale } from 'lucide-react';
import { Product } from '@/data/products';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist, useAddToWishlist, useRemoveFromWishlist } from '@/hooks/useWishlist';
import { useAddToCart } from '@/hooks/useCart';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useCompare } from '@/contexts/CompareContext';
import { QuickViewModal } from './QuickViewModal';

interface ProductCardProps {
  product: Product;
  index?: number;
}

const clampRating = (value: number) => Math.min(5, Math.max(0, value));

const getReviewCount = (product: { id: string; reviewCount?: number }) => {
  if (typeof product.reviewCount === 'number') {
    return product.reviewCount;
  }
  const hash = Array.from(product.id).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const count = 35 + (hash % 180);
  return Math.max(12, Math.min(250, count));
};

export const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { isLoggedIn } = useAuth();
  const { formatPrice } = useCurrency();
  const { data: wishlistData } = useWishlist();
  const addWishlistMut = useAddToWishlist();
  const removeWishlistMut = useRemoveFromWishlist();
  const addToCartMut = useAddToCart();
  const { addToCompare, isInCompare } = useCompare();

  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const isCompared = isInCompare(product.id);

  const wishlistItem = wishlistData?.items.find((item) => item.productId === product.id);
  const isWishlisted = !!wishlistItem;

  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.unobserve(el);
          }
        },
        { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
      );
      observer.observe(el);
      return () => observer.disconnect();
    }, Math.min(index * 60, 300));

    return () => clearTimeout(timer);
  }, [index]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to add items to your cart.',
      });
      setLocation('/login');
      return;
    }
    try {
      await addToCartMut.mutateAsync({ productId: product.id, quantity: 1 });
      toast({
        title: 'Added to cart!',
        description: `${product.name} has been added to your cart.`,
      });
    } catch (err: unknown) {
      toast({
        title: 'Could not add to cart',
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = addToCompare(product);
    if (added) {
      toast({
        title: 'Added to comparison',
        description: `${product.name} has been added to compare list.`,
      });
    } else if (isCompared) {
      toast({
        title: 'Removed from comparison',
        description: product.name,
      });
    } else {
      toast({
        title: 'Compare limit reached',
        description: 'You can compare up to 4 products at once.',
        variant: 'destructive',
      });
    }
  };

  const image = product.image;
  const gallery = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];
  const hoverImage = (gallery && gallery[1]) || product.hoverImage || product.image;
  const rating = clampRating(product.rating ?? 4.9);
  const reviewCount = getReviewCount(product);
  const materialLabel = product.material ?? (product.tags?.includes('handmade') ? 'Handmade' : 'Handcrafted');
  const deliveryLabel = product.estimatedDelivery ?? 'Ships in 3 Days';
  const shippingLabel = product.shipping ?? 'Free Shipping';
  const colorOptions = product.colors ?? [];
  const stockLabel = product.inStock === false ? 'Out of stock' : 'In stock';
  const stockClasses = product.inStock === false
    ? 'bg-[#7c1c1c] text-white'
    : 'bg-[#eff6ec] text-[#1a1a18]';

  const badgeClasses = product.badge?.toLowerCase() === 'new'
    ? 'bg-[#1a1a18] text-white'
    : product.badge?.toLowerCase() === 'sale'
      ? 'bg-[#b72a2a] text-white'
      : 'bg-[#d4af37] text-[#1a1a18]';

  return (
    <>
      <div
        ref={ref}
        className="w-full will-change-transform"
        style={{
          opacity: revealed ? 1 : 0,
          transform: revealed ? 'translateY(0)' : 'translateY(28px)',
          transition: `opacity 0.55s ease ${Math.min(index * 0.07, 0.35)}s, transform 0.55s ease ${Math.min(index * 0.07, 0.35)}s`,
        }}
      >
        <Link
          href={`/shop/${product.id}`}
          className="block group w-full"
          data-testid={`card-product-${product.id}`}
        >
          <div className="relative overflow-hidden aspect-[3/4] bg-[#2a2520] rounded shadow-sm transition-shadow duration-500 group-hover:shadow-[0_18px_60px_rgba(0,0,0,0.16)]">
            <img
              src={image}
              alt={product.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
            <img
              src={hoverImage}
              alt="Hover preview"
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            {/* Badges */}
            <div className="absolute left-2.5 top-2.5 z-10 flex flex-col gap-1.5">
              {product.badge ? (
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[1px] ${badgeClasses}`}>
                  {product.badge}
                </span>
              ) : product.discount && product.discount > 0 ? (
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[1px] bg-[#b72a2a] text-white">
                  {product.discount}% OFF
                </span>
              ) : null}
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[1px] ${stockClasses}`}>
                <CheckCircle2 size={11} />
                <span className="ml-1">{stockLabel}</span>
              </span>
            </div>

            {/* Wishlist Button (Top Right) */}
            <button
              onClick={handleWishlist}
              className={`absolute top-2.5 right-2.5 z-20 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 shadow ${
                isWishlisted
                  ? 'bg-[#9c1c1c] text-white opacity-100 scale-100'
                  : 'bg-white/80 text-[#1a1a18] opacity-0 group-hover:opacity-100 hover:bg-white'
              }`}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={14} strokeWidth={1.5} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>

            {/* Modern Luxury Action Bar (Bottom Hover Tray) */}
            <div className="absolute inset-x-2 bottom-2 z-20 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
              <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#14100c]/90 backdrop-blur-md border border-[#c6a767]/30 shadow-2xl">
                {/* 1. Add to Cart Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-[#c6a767] hover:bg-[#dfc488] text-[#14100c] py-2 px-2 rounded font-sans text-[10px] font-bold uppercase tracking-[1px] transition shadow"
                  title="Add to Cart"
                >
                  <ShoppingBag size={13} />
                  <span className="hidden sm:inline">Add to Cart</span>
                </button>

                {/* 2. Quick View Button */}
                <button
                  type="button"
                  onClick={handleQuickView}
                  className="flex items-center justify-center p-2 rounded bg-white/10 hover:bg-white/25 text-white transition"
                  title="Quick View"
                  aria-label="Quick View"
                >
                  <Eye size={14} />
                </button>

                {/* 3. Compare Button */}
                <button
                  type="button"
                  onClick={handleCompare}
                  className={`flex items-center justify-center p-2 rounded transition ${
                    isCompared
                      ? 'bg-[#c6a767] text-[#14100c]'
                      : 'bg-white/10 hover:bg-white/25 text-white'
                  }`}
                  title={isCompared ? 'Remove from Compare' : 'Compare Product'}
                  aria-label="Compare"
                >
                  <Scale size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-2.5 px-0 pb-1">
            <h3 className="font-sans text-[13px] font-semibold text-[#1a1a18] group-hover:text-[#8b6914] transition-colors duration-300 leading-snug mb-1 line-clamp-2">
              {product.name}
            </h3>

            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#6b6b6b]">
              <span className="inline-flex items-center text-[#d4af37]">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} size={11} fill={idx < Math.round(rating) ? 'currentColor' : 'none'} className={idx < Math.round(rating) ? 'text-[#d4af37]' : 'text-[#d4af37]/30'} />
                ))}
              </span>
              <span className="text-[10px]">({reviewCount})</span>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] uppercase tracking-[0.5px] text-[#1a1a18]">
              {materialLabel && (
                <span className="rounded bg-[#eae3d5] px-2 py-0.5 font-medium">{materialLabel}</span>
              )}
              <span className="rounded bg-[#eae3d5] px-2 py-0.5 flex items-center gap-1">
                <Truck size={10} />
                {shippingLabel}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-baseline gap-2">
              <span className="text-[14px] font-sans font-bold text-[#1a1208]">
                {formatPrice(product.price)}
              </span>
              {product.mrp && product.mrp > product.price ? (
                <>
                  <span className="line-through text-[12px] font-normal text-[#8a8278]">
                    {formatPrice(product.mrp)}
                  </span>
                  <span className="text-[10px] font-bold text-[#b72a2a] bg-[#fae8e8] px-1.5 py-0.2 rounded">
                    {product.discount ?? Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </Link>
      </div>

      {/* Quick View Modal */}
      {isQuickViewOpen && (
        <QuickViewModal product={product} onClose={() => setIsQuickViewOpen(false)} />
      )}
    </>
  );
};

export default ProductCard;
