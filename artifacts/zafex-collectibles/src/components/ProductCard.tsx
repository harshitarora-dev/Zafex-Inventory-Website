import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Heart, Eye, ShoppingBag, Star, Truck, RefreshCcw, CheckCircle2 } from 'lucide-react';
import { Product } from '@/data/products';
import { useToast } from '@/hooks/use-toast';

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
  const ref = useRef<HTMLDivElement>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast({
      title: 'Added to cart!',
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted((w) => !w);
    toast({
      title: isWishlisted ? 'Removed from wishlist' : 'Added to wishlist',
      description: product.name,
    });
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

  const badgeClasses = product.badge === 'new'
    ? 'bg-[#1a1a18] text-white'
    : product.badge === 'sale'
      ? 'bg-[#b72a2a] text-white'
      : 'bg-[#d4af37] text-[#1a1a18]';

  return (
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
        <div className="relative overflow-hidden aspect-[3/4] bg-[#2a2520] transition-shadow duration-500 group-hover:shadow-[0_18px_60px_rgba(0,0,0,0.16)]">
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

          <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
            {product.badge && (
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[1px] ${badgeClasses}`}>
                {product.badge}
              </span>
            )}
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[1px] ${stockClasses}`}>
              <CheckCircle2 size={12} />
              <span className="ml-1">{stockLabel}</span>
            </span>
          </div>

          {/* Small gallery indicators (show up to 2 extra images) */}
          {gallery && gallery.length > 1 && (
            <div className="absolute left-3 bottom-3 z-20 flex gap-2">
              {gallery.slice(1, 3).map((g, i) => (
                <img key={i} src={g} alt={`Extra ${i + 1}`} className="h-10 w-10 object-cover rounded-md border border-white/60 shadow-sm" />
              ))}
            </div>
          )}

          <button
            onClick={handleWishlist}
            className={`absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-sm transition-all duration-300 ${
              isWishlisted
                ? 'bg-[#9c1c1c] text-white opacity-100 scale-100'
                : 'bg-white/90 text-[#1a1a18] opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100'
            }`}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart size={16} strokeWidth={1.5} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>

          <div className="absolute inset-x-0 bottom-0 z-20 translate-y-full transform px-3 pb-3 pt-2 transition-transform duration-300 ease-out group-hover:translate-y-0">
            <div className="grid gap-2 sm:grid-cols-3">
              <button
                onClick={handleAddToCart}
                className="flex h-10 items-center justify-center gap-2 rounded-full bg-[#1a1a18] px-3 text-[10px] uppercase tracking-[1.5px] text-white transition-colors duration-200 hover:bg-[#d4af37] hover:text-[#1a1a18]"
                aria-label="Add to cart"
              >
                <ShoppingBag size={14} />
                Add to Cart
              </button>
              <div
                className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full bg-white/90 text-[10px] uppercase tracking-[1.5px] text-[#1a1a18] transition-colors duration-200 hover:bg-white"
                role="button"
                aria-label="Quick view"
              >
                <Eye size={14} />
                Quick View
              </div>
              <div
                className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full bg-white/90 text-[10px] uppercase tracking-[1.5px] text-[#1a1a18] transition-colors duration-200 hover:bg-white"
                role="button"
                aria-label="Compare product"
              >
                <Star size={14} />
                Compare
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 px-0 pb-1">
          <h3 className="font-sans text-[13px] font-semibold text-[#1a1a18] group-hover:text-[#d4af37] transition-colors duration-300 leading-snug mb-2 line-clamp-2">
            {product.name}
          </h3>

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#6b6b6b]">
            <span className="inline-flex items-center gap-1 text-[#d4af37]">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star key={idx} size={12} className={idx < Math.round(rating) ? 'text-[#d4af37]' : 'text-[#d4af37]/30'} />
              ))}
            </span>
            <span>({reviewCount})</span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[1px] text-[#1a1a18]">
            {materialLabel && (
              <span className="rounded-full bg-[#fff8ef] px-2 py-1">{materialLabel}</span>
            )}
            <span className="rounded-full bg-[#fff8ef] px-2 py-1 flex items-center gap-1">
              <RefreshCcw size={12} />
              {deliveryLabel}
            </span>
            <span className="rounded-full bg-[#fff8ef] px-2 py-1 flex items-center gap-1">
              <Truck size={12} />
              {shippingLabel}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {colorOptions.map((color, idx) => (
              <span
                key={`${product.id}-color-${idx}`}
                className="h-4 w-4 rounded-full border border-[#1a1a18]/10"
                style={{ backgroundColor: color }}
                aria-label={`Color option ${color}`}
              />
            ))}
          </div>

          <p className="mt-3 text-[14px] font-sans font-bold text-[#1a1a18]">
            ₹{product.price.toLocaleString('en-IN')}
            {product.priceRange ? (
              <span className="ml-2 text-[12px] font-normal text-[#6b6b6b]">
                ₹{product.priceRange[0].toLocaleString('en-IN')} – ₹{product.priceRange[1].toLocaleString('en-IN')}
              </span>
            ) : null}
          </p>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
