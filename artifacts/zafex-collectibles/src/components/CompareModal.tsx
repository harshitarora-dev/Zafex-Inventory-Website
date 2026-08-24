import React from 'react';
import { useCompare } from '@/contexts/CompareContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAddToCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { X, ShoppingBag, Star, CheckCircle2, XCircle, Trash2, ArrowRight } from 'lucide-react';

export const CompareModal: React.FC = () => {
  const { compareItems, removeFromCompare, clearCompare, isCompareOpen, setIsCompareOpen } = useCompare();
  const { formatPrice } = useCurrency();
  const { isLoggedIn } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const addToCartMut = useAddToCart();

  if (!isCompareOpen) return null;

  const handleAddToCart = async (product: any) => {
    if (!isLoggedIn) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to add items to your cart.',
      });
      setIsCompareOpen(false);
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

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-[#f5f0e8] border border-[#d6cec1] rounded-lg shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#d8d2c6] bg-[#eae3d5]">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-[18px] font-bold tracking-[1.5px] uppercase text-[#1a1208]">
              Product Comparison ({compareItems.length}/4)
            </h2>
            {compareItems.length > 0 && (
              <button
                onClick={clearCompare}
                className="flex items-center gap-1 font-sans text-[11px] font-semibold text-[#a91f22] hover:underline uppercase tracking-[1px] ml-4"
              >
                <Trash2 size={12} /> Clear All
              </button>
            )}
          </div>
          <button
            onClick={() => setIsCompareOpen(false)}
            className="p-1 rounded-full text-[#5a4a30] hover:bg-[#d8d2c6] hover:text-[#1a1208] transition"
            aria-label="Close compare modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-6">
          {compareItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="font-serif text-[18px] text-[#2a2016]">No products added to compare yet</p>
              <p className="font-sans text-[12px] text-[#6b6255] mt-1 max-w-sm">
                Click the "Compare" button on any product card to add up to 4 items and view them side-by-side.
              </p>
              <button
                onClick={() => setIsCompareOpen(false)}
                className="mt-5 bg-[#1a1a18] text-[#d4af37] px-6 py-2 text-[11px] font-bold uppercase tracking-[1.5px] rounded hover:bg-[#333] transition"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="min-w-[640px]">
              <table className="w-full border-collapse">
                <tbody>
                  {/* Row 1: Product Images & Titles */}
                  <tr className="border-b border-[#d8d2c6]">
                    <td className="w-36 py-4 font-sans text-[11px] font-bold uppercase tracking-[1px] text-[#5a4a30] align-top">
                      Product
                    </td>
                    {compareItems.map((p) => (
                      <td key={p.id} className="p-4 align-top w-64 border-l border-[#ded7cb]">
                        <div className="relative group">
                          <button
                            onClick={() => removeFromCompare(p.id)}
                            className="absolute top-2 right-2 z-10 p-1 bg-black/60 hover:bg-[#a91f22] text-white rounded-full transition shadow"
                            title="Remove from compare"
                          >
                            <X size={13} />
                          </button>
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-full aspect-[4/5] object-cover rounded bg-[#2a2520] mb-3 shadow-sm"
                          />
                          <h4 className="font-serif text-[14px] font-bold text-[#1a1208] leading-tight mb-2">
                            {p.name}
                          </h4>
                          <button
                            onClick={() => handleAddToCart(p)}
                            className="w-full flex items-center justify-center gap-2 bg-[#1a1a18] hover:bg-[#c6a767] hover:text-[#1a1a18] text-white py-2 text-[10px] font-bold uppercase tracking-[1.5px] rounded transition"
                          >
                            <ShoppingBag size={13} /> Add to Cart
                          </button>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Row 2: Price */}
                  <tr className="border-b border-[#d8d2c6] bg-[#eee8dc]/50">
                    <td className="py-3 font-sans text-[11px] font-bold uppercase tracking-[1px] text-[#5a4a30]">
                      Price
                    </td>
                    {compareItems.map((p) => (
                      <td key={p.id} className="p-3 border-l border-[#ded7cb]">
                        <div className="flex items-baseline gap-2">
                          <span className="font-sans text-[15px] font-bold text-[#1a1a18]">
                            {formatPrice(p.price)}
                          </span>
                          {p.mrp && p.mrp > p.price && (
                            <span className="line-through text-[12px] text-[#8a8278]">
                              {formatPrice(p.mrp)}
                            </span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Row 3: Rating */}
                  <tr className="border-b border-[#d8d2c6]">
                    <td className="py-3 font-sans text-[11px] font-bold uppercase tracking-[1px] text-[#5a4a30]">
                      Rating
                    </td>
                    {compareItems.map((p) => (
                      <td key={p.id} className="p-3 border-l border-[#ded7cb]">
                        <div className="flex items-center gap-1.5 text-[12px]">
                          <span className="inline-flex text-[#d4af37]">
                            <Star size={13} fill="currentColor" />
                          </span>
                          <span className="font-bold text-[#2a2016]">{p.rating ?? 4.8}</span>
                          <span className="text-[#8a8070] text-[11px]">({p.reviewCount ?? 120})</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Row 4: Availability */}
                  <tr className="border-b border-[#d8d2c6] bg-[#eee8dc]/50">
                    <td className="py-3 font-sans text-[11px] font-bold uppercase tracking-[1px] text-[#5a4a30]">
                      Availability
                    </td>
                    {compareItems.map((p) => (
                      <td key={p.id} className="p-3 border-l border-[#ded7cb]">
                        {p.inStock !== false ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2e7d32]">
                            <CheckCircle2 size={13} /> In Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#c62828]">
                            <XCircle size={13} /> Out of Stock
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Row 5: Category & Subcategory */}
                  <tr className="border-b border-[#d8d2c6]">
                    <td className="py-3 font-sans text-[11px] font-bold uppercase tracking-[1px] text-[#5a4a30]">
                      Category
                    </td>
                    {compareItems.map((p) => (
                      <td key={p.id} className="p-3 border-l border-[#ded7cb] font-sans text-[11px] text-[#4a443b] uppercase">
                        {p.cat} / {p.sub}
                      </td>
                    ))}
                  </tr>

                  {/* Row 6: Material & Craftsmanship */}
                  <tr className="border-b border-[#d8d2c6] bg-[#eee8dc]/50">
                    <td className="py-3 font-sans text-[11px] font-bold uppercase tracking-[1px] text-[#5a4a30]">
                      Craftsmanship
                    </td>
                    {compareItems.map((p) => (
                      <td key={p.id} className="p-3 border-l border-[#ded7cb] font-sans text-[11px] text-[#4a443b]">
                        {p.material ?? '100% Handcrafted Artisan Build'}
                      </td>
                    ))}
                  </tr>

                  {/* Row 7: Description */}
                  <tr>
                    <td className="py-4 font-sans text-[11px] font-bold uppercase tracking-[1px] text-[#5a4a30] align-top">
                      Details
                    </td>
                    {compareItems.map((p) => (
                      <td key={p.id} className="p-4 border-l border-[#ded7cb] align-top font-sans text-[11px] text-[#5a544b] leading-relaxed">
                        <p className="line-clamp-3 mb-2">{p.desc || 'Premium historical reproduction forged with authentic materials and precision craft.'}</p>
                        <button
                          onClick={() => {
                            setIsCompareOpen(false);
                            setLocation(`/shop/${p.id}`);
                          }}
                          className="inline-flex items-center gap-1 font-bold text-[#8b6914] hover:underline text-[10px] uppercase tracking-[1px]"
                        >
                          View Full Details <ArrowRight size={11} />
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
