import React, { useState, useEffect } from 'react';
import { Product } from '@/data/products';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAddToCart } from '@/hooks/useCart';
import { useWishlist, useAddToWishlist, useRemoveFromWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import {
  X,
  Star,
  ShoppingBag,
  Heart,
  CheckCircle2,
  XCircle,
  Truck,
  ShieldCheck,
  ArrowRight,
  Plus,
  Minus,
} from 'lucide-react';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { formatPrice } = useCurrency();
  const { isLoggedIn } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const addToCartMut = useAddToCart();
  const { data: wishlistData } = useWishlist();
  const addWishlistMut = useAddToWishlist();
  const removeWishlistMut = useRemoveFromWishlist();

  const [activeImage, setActiveImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('L/XL');
  const [quantity, setQuantity] = useState<number>(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImage(product.image);
      setQuantity(1);
    }
  }, [product]);

  if (!product) return null;

  const gallery = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];
  const wishlistItem = wishlistData?.items.find((item) => item.productId === product.id);
  const isWishlisted = !!wishlistItem;

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to add items to your cart.',
      });
      onClose();
      setLocation('/login');
      return;
    }
    try {
      setAddingToCart(true);
      await addToCartMut.mutateAsync({ productId: product.id, quantity });
      toast({
        title: 'Added to cart!',
        description: `${quantity}x ${product.name} has been added to your cart.`,
      });
      onClose();
    } catch (err: unknown) {
      toast({
        title: 'Could not add to cart',
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = async () => {
    if (!isLoggedIn) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to save items to your wishlist.',
      });
      onClose();
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

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#f5f0e8] border border-[#d6cec1] rounded-lg shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-1.5 rounded-full bg-black/60 hover:bg-[#a91f22] text-white transition shadow"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Left Side: Product Images */}
        <div className="w-full md:w-1/2 p-6 flex flex-col items-center justify-between bg-[#ece4d8]/40 border-b md:border-b-0 md:border-r border-[#d8d2c6]">
          <div className="relative w-full aspect-[4/5] bg-[#2a2520] rounded-md overflow-hidden shadow-inner flex items-center justify-center">
            <img
              src={activeImage || product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
            {product.badge && (
              <span className="absolute top-3 left-3 bg-[#1a1208] text-[#d4af37] text-[10px] font-bold uppercase tracking-[1px] px-3 py-1 rounded-full shadow">
                {product.badge}
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {gallery.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto w-full pb-1">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  className={`h-14 w-14 rounded overflow-hidden border-2 transition shrink-0 ${
                    activeImage === img ? 'border-[#8b6914] shadow' : 'border-black/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Details & Purchase Actions */}
        <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto flex flex-col justify-between">
          <div>
            <span className="font-sans text-[10px] font-bold uppercase tracking-[2px] text-[#8b6914] block mb-1">
              {product.cat} / {product.sub}
            </span>
            <h2 className="font-serif text-[22px] sm:text-[26px] font-bold text-[#1a1208] leading-tight mb-2">
              {product.name}
            </h2>

            {/* Stars & Reviews */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-[#d4af37]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
              <span className="text-[12px] font-bold text-[#2a2016]">{product.rating ?? 4.9}</span>
              <span className="text-[11px] text-[#7a7062]">({product.reviewCount ?? 142} customer reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4 pb-4 border-b border-[#d8d2c6]">
              <span className="font-sans text-[22px] font-bold text-[#1a1208]">
                {formatPrice(product.price)}
              </span>
              {product.mrp && product.mrp > product.price && (
                <>
                  <span className="line-through text-[14px] text-[#8a8278]">
                    {formatPrice(product.mrp)}
                  </span>
                  <span className="bg-[#a91f22] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {product.discount ?? Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-4">
              {product.inStock !== false ? (
                <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#2e7d32]">
                  <CheckCircle2 size={15} /> In Stock & Ready to Ship
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#c62828]">
                  <XCircle size={15} /> Currently Out of Stock
                </span>
              )}
            </div>

            {/* Description snippet */}
            <p className="font-sans text-[12px] text-[#5c5448] leading-relaxed mb-5 line-clamp-3">
              {product.desc || 'Forged with traditional artisan craftsmanship and authentic historical detail. Crafted for collectors, reenactors, and period display.'}
            </p>

            {/* Size Selector */}
            <div className="mb-5">
              <label className="block font-sans text-[11px] font-bold uppercase tracking-[1px] text-[#332a1f] mb-2">
                Select Size
              </label>
              <div className="flex gap-2">
                {['S/M', 'L/XL', '2XL/3XL'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`px-3 py-1.5 text-[11px] font-bold uppercase rounded border transition ${
                      selectedSize === s
                        ? 'bg-[#1a1208] text-[#d4af37] border-[#1a1208]'
                        : 'bg-white/80 text-[#3a342b] border-[#d8d2c6] hover:border-[#8b6914]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector & Add to Cart */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center border border-[#d8d2c6] bg-white rounded">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-[#5a4a30] hover:bg-[#eee8dc] transition"
                  aria-label="Decrease quantity"
                >
                  <Minus size={13} />
                </button>
                <span className="px-3 font-sans text-[13px] font-bold text-[#1a1208] min-w-[28px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-2 text-[#5a4a30] hover:bg-[#eee8dc] transition"
                  aria-label="Increase quantity"
                >
                  <Plus size={13} />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={addingToCart || product.inStock === false}
                className="flex-1 flex items-center justify-center gap-2 bg-[#1a1208] hover:bg-[#c6a767] hover:text-[#1a1208] text-white py-3 px-4 rounded font-sans text-[11px] font-bold uppercase tracking-[1.5px] transition disabled:opacity-50"
              >
                <ShoppingBag size={15} />
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>

              <button
                type="button"
                onClick={handleWishlist}
                className={`p-3 rounded border transition ${
                  isWishlisted
                    ? 'bg-[#a91f22] text-white border-[#a91f22]'
                    : 'bg-white text-[#2a2016] border-[#d8d2c6] hover:text-[#a91f22]'
                }`}
                title="Wishlist"
                aria-label="Add to wishlist"
              >
                <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>

          {/* Bottom Footer Info */}
          <div className="pt-4 border-t border-[#d8d2c6] flex items-center justify-between text-[11px] text-[#6b6255]">
            <span className="flex items-center gap-1">
              <Truck size={13} /> Worldwide Shipping
            </span>
            <button
              onClick={() => {
                onClose();
                setLocation(`/shop/${product.id}`);
              }}
              className="inline-flex items-center gap-1 font-bold text-[#8b6914] hover:underline uppercase tracking-[1px]"
            >
              View Full Product Page <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
