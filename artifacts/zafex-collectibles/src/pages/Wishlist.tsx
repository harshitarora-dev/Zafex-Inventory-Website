import React from 'react';
import { Link } from 'wouter';
import { Heart, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist, useRemoveFromWishlist } from '@/hooks/useWishlist';
import { useAddToCart } from '@/hooks/useCart';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useToast } from '@/hooks/use-toast';

export default function WishlistPage() {
  const { isLoggedIn } = useAuth();
  const { formatPrice } = useCurrency();
  const { data, isLoading } = useWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const addToCart = useAddToCart();
  const { toast } = useToast();

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex flex-col items-center justify-center gap-6 px-4">
        <Heart size={48} className="text-[#d4af37]" />
        <h1 className="font-serif text-[28px] text-[#1a1a18] uppercase">Sign In to View Wishlist</h1>
        <Link href="/login" className="bg-[#1a1a18] text-white font-serif text-[12px] uppercase font-bold tracking-[2px] px-8 py-4 hover:bg-[#d4af37] hover:text-[#1a1a18] transition-colors">
          Sign In
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const items = data?.items ?? [];

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <section className="w-full bg-[#cec3b5] flex flex-col items-center justify-center text-center px-4 py-12 sm:py-14">
        <h1 className="font-serif text-[28px] xs:text-[34px] sm:text-[48px] font-light text-[#1a1208] uppercase tracking-[2px] sm:tracking-[0.1em]">Wishlist</h1>
        <p className="font-sans text-[14px] text-[#5a4a30]/70 mt-2">{items.length} saved items</p>
      </section>

      <div className="max-w-[1200px] mx-auto px-5 py-12">
        {items.length === 0 ? (
          <div className="text-center py-24">
            <Heart size={48} className="text-[#d4af37] mx-auto mb-4" />
            <h2 className="font-serif text-[24px] text-[#1a1a18] mb-3">Your wishlist is empty</h2>
            <p className="font-sans text-[#6b6b6b] mb-8">Save items you love to keep track of them.</p>
            <Link href="/shop" className="bg-[#1a1a18] text-white font-serif text-[12px] uppercase font-bold tracking-[2px] px-8 py-4 hover:bg-[#d4af37] hover:text-[#1a1a18] transition-colors">
              Browse Shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[18px]">
            {items.map((item) => (
              <div key={item.id} className="bg-white border border-[#d4cfc7] group relative">
                <Link href={`/shop/${item.productId}`} className="block aspect-[3/4] overflow-hidden bg-[#ede9e3]">
                  <img
                    src={item.product?.image}
                    alt={item.product?.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
                <button
                  onClick={() => {
                    removeFromWishlist.mutate(item.id);
                    toast({ title: 'Removed from wishlist', description: item.product?.name });
                  }}
                  className="absolute top-3 right-3 bg-white/90 rounded-full p-2 text-[#9c1c1c] hover:bg-white transition-colors"
                  aria-label="Remove from wishlist"
                >
                  <Heart size={16} fill="currentColor" />
                </button>
                <div className="p-4">
                  <Link href={`/shop/${item.productId}`}>
                    <h3 className="font-serif text-[14px] font-bold text-[#1a1a18] hover:text-[#d4af37] transition-colors line-clamp-2 mb-2">
                      {item.product?.name}
                    </h3>
                  </Link>
                  <p className="font-sans text-[15px] text-[#d4af37] font-semibold mb-3">
                    {formatPrice(item.product?.price ?? 0)}
                  </p>
                  <button
                    onClick={async () => {
                      try {
                        await addToCart.mutateAsync({ productId: item.productId });
                        toast({ title: 'Added to cart', description: item.product?.name });
                      } catch {
                        toast({ title: 'Failed to add to cart', variant: 'destructive' });
                      }
                    }}
                    className="w-full h-[40px] bg-[#1a1a18] text-white font-serif text-[10px] uppercase font-bold tracking-[1.5px] hover:bg-[#d4af37] hover:text-[#1a1a18] transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={14} />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
