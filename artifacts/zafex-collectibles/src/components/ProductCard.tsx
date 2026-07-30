import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Heart, Eye, ShoppingBag } from 'lucide-react';
import { Product } from '@/data/products';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const { toast } = useToast();
  const ref = useRef<HTMLDivElement>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Stagger the observation slightly so elements don't all fire at once
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
        {/* Image container */}
        <div className="relative overflow-hidden aspect-[3/4] bg-[#2a2520] transition-shadow duration-500">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />

          {/* Badge */}
          {product.badge && (
            <div
              className={`absolute top-0 left-0 px-3 py-1 font-serif text-[10px] uppercase tracking-[1px] z-10 ${
                product.badge === 'new'
                  ? 'bg-[#1a1a18] text-white'
                  : 'bg-[#d4af37] text-[#1a1a18]'
              }`}
            >
              {product.badge}
            </div>
          )}

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            className={`absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center backdrop-blur-[2px] transition-all duration-300 ${
              isWishlisted
                ? 'bg-[#9c1c1c] text-white opacity-100 scale-100'
                : 'bg-white/80 text-[#1a1a18] opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100'
            }`}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              size={15}
              strokeWidth={1.5}
              fill={isWishlisted ? 'currentColor' : 'none'}
            />
          </button>

          {/* Slide-up action bar */}
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-[3px] p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-350 ease-out z-20">
            <button
              onClick={handleAddToCart}
              className="w-full h-10 bg-[#1a1a18] text-white font-serif text-[10px] uppercase tracking-[1.5px] hover:bg-[#d4af37] hover:text-[#1a1a18] transition-colors duration-200 flex items-center justify-center gap-2"
              aria-label="Add to cart"
            >
              <ShoppingBag size={13} />
              Add to Cart
            </button>
            <div
              className="w-full h-9 bg-white/90 text-[#1a1a18] font-serif text-[10px] uppercase tracking-[1.5px] hover:bg-white transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
              role="button"
              aria-label="Quick view"
            >
              <Eye size={13} />
              Quick View
            </div>
          </div>
        </div>

        {/* Info bar — no background, sits on cream page */}
        <div className="px-0 pt-3 pb-1">
          <h3 className="font-sans text-[13px] font-normal text-[#1a1a18] group-hover:text-[#d4af37] transition-colors duration-300 leading-snug mb-1 line-clamp-2">
            {product.name}
          </h3>
          <p className="font-sans text-[13px] text-[#1a1a18]">
            ₹{product.price.toLocaleString('en-IN')}
          </p>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
