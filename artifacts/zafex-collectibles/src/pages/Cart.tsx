import React from 'react';
import { Link, useLocation } from 'wouter';
import { Trash2, ShoppingBag, Minus, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart, useUpdateCartItem, useRemoveCartItem } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';

export default function CartPage() {
  const { isLoggedIn } = useAuth();
  const [, navigate] = useLocation();
  const { data, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const { toast } = useToast();

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex flex-col items-center justify-center gap-6 px-4">
        <ShoppingBag size={48} className="text-[#d4af37]" />
        <h1 className="font-serif text-[28px] text-[#1a1a18] uppercase">Sign In to View Cart</h1>
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
  const subtotal = data?.subtotal ?? 0;
  const shipping = subtotal >= 5000 ? 0 : 499;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex flex-col items-center justify-center gap-6 px-4">
        <ShoppingBag size={48} className="text-[#d4af37]" />
        <h1 className="font-serif text-[28px] text-[#1a1a18] uppercase">Your Cart is Empty</h1>
        <p className="font-sans text-[#6b6b6b]">Explore our collection and add something exceptional.</p>
        <Link href="/shop" className="bg-[#1a1a18] text-white font-serif text-[12px] uppercase font-bold tracking-[2px] px-8 py-4 hover:bg-[#d4af37] hover:text-[#1a1a18] transition-colors">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <section className="w-full bg-[#cec3b5] flex flex-col items-center justify-center text-center px-4 py-14">
        <h1 className="font-serif text-[48px] font-light text-[#1a1208] uppercase tracking-[0.1em]">Your Cart</h1>
      </section>

      <div className="max-w-[1200px] mx-auto px-5 py-12 flex flex-col lg:flex-row gap-10">
        {/* Items */}
        <div className="flex-1">
          {items.map((item) => (
            <div key={item.id} className="flex gap-5 bg-white border border-[#d4cfc7] p-5 mb-4">
              <Link href={`/shop/${item.productId}`}>
                <img
                  src={item.product?.image}
                  alt={item.product?.name}
                  className="w-[100px] h-[100px] object-cover bg-[#ede9e3] flex-shrink-0"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/shop/${item.productId}`} className="font-serif text-[16px] font-bold text-[#1a1a18] hover:text-[#d4af37] transition-colors line-clamp-1 block">
                  {item.product?.name}
                </Link>
                <p className="font-sans text-[14px] text-[#d4af37] font-semibold mt-1">
                  ₹{item.product?.price.toLocaleString('en-IN')}
                </p>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-[#d4cfc7]">
                    <button
                      onClick={() => {
                        if (item.quantity <= 1) {
                          removeItem.mutate(item.id);
                        } else {
                          updateItem.mutate({ id: item.id, quantity: item.quantity - 1 });
                        }
                      }}
                      className="w-8 h-8 flex items-center justify-center hover:bg-black/5 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center font-sans text-[14px]">{item.quantity}</span>
                    <button
                      onClick={() => updateItem.mutate({ id: item.id, quantity: item.quantity + 1 })}
                      className="w-8 h-8 flex items-center justify-center hover:bg-black/5 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-serif text-[15px] font-bold text-[#1a1a18]">
                      ₹{((item.product?.price ?? 0) * item.quantity).toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => {
                        removeItem.mutate(item.id);
                        toast({ title: 'Removed from cart', description: item.product?.name });
                      }}
                      className="text-[#9c1c1c] hover:text-red-700 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="w-full lg:w-[340px] flex-shrink-0">
          <div className="bg-white border border-[#d4cfc7] p-6">
            <h2 className="font-serif text-[20px] font-bold text-[#1a1a18] uppercase mb-6">Order Summary</h2>

            <div className="flex flex-col gap-3 mb-6">
              <div className="flex justify-between font-sans text-[14px]">
                <span className="text-[#4a4a4a]">Subtotal</span>
                <span className="text-[#1a1a18] font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-sans text-[14px]">
                <span className="text-[#4a4a4a]">Shipping</span>
                <span className={`font-medium ${shipping === 0 ? 'text-green-700' : 'text-[#1a1a18]'}`}>
                  {shipping === 0 ? 'Free' : `₹${shipping.toLocaleString('en-IN')}`}
                </span>
              </div>
              {subtotal < 5000 && (
                <p className="font-sans text-[12px] text-[#6b6b6b]">
                  Add ₹{(5000 - subtotal).toLocaleString('en-IN')} more for free shipping
                </p>
              )}
              <div className="border-t border-[#d4cfc7] pt-3 flex justify-between">
                <span className="font-serif text-[15px] font-bold text-[#1a1a18]">Total</span>
                <span className="font-serif text-[15px] font-bold text-[#d4af37]">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full h-[52px] bg-[#1a1a18] text-white font-serif text-[12px] uppercase font-bold tracking-[2px] hover:bg-[#d4af37] hover:text-[#1a1a18] transition-colors mb-3"
            >
              Proceed to Checkout
            </button>
            <Link href="/shop" className="block text-center font-sans text-[13px] text-[#6b6b6b] hover:text-[#1a1a18] transition-colors">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
