import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ShoppingBag, CreditCard, Banknote, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/hooks/useCart';
import { useCurrency } from '@/contexts/CurrencyContext';
import { checkout, createPaymentOrder, verifyPayment } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const inputCls =
  'w-full h-[48px] border border-[#d4cfc7] px-4 font-sans text-[14px] focus:outline-none focus:border-[#d4af37] bg-[#faf8f3]';
const labelCls =
  'font-serif text-[11px] uppercase tracking-[1px] text-[#1a1a18] font-bold block mb-2';

export default function Checkout() {
  const { isLoggedIn, user } = useAuth();
  const { formatPrice, currentCurrency } = useCurrency();
  const [, navigate] = useLocation();
  const { data: cartData } = useCart();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    shippingAddress: '',
    shippingCity: '',
    shippingState: '',
    shippingPincode: '',
    shippingCountry: 'India',
    phone: user?.phone ?? '',
    notes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const subtotal = cartData?.subtotal ?? 0;
  const shippingCost = subtotal >= 5000 ? 0 : 499;
  const total = subtotal + shippingCost;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex flex-col items-center justify-center gap-6 px-4">
        <h1 className="font-serif text-[28px] text-[#1a1a18] uppercase">
          Please Sign In to Checkout
        </h1>
        <Link
          href="/login"
          className="bg-[#1a1a18] text-white font-serif text-[12px] uppercase font-bold tracking-[2px] px-8 py-4 hover:bg-[#d4af37] hover:text-[#1a1a18] transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (!cartData || cartData.items.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex flex-col items-center justify-center gap-6 px-4">
        <ShoppingBag size={48} className="text-[#d4af37]" />
        <h1 className="font-serif text-[28px] text-[#1a1a18] uppercase">
          Your Cart is Empty
        </h1>
        <Link
          href="/shop"
          className="bg-[#1a1a18] text-white font-serif text-[12px] uppercase font-bold tracking-[2px] px-8 py-4 hover:bg-[#d4af37] hover:text-[#1a1a18] transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await checkout({
        shippingAddress: form.shippingAddress,
        shippingCity: form.shippingCity,
        shippingState: form.shippingState,
        shippingPincode: form.shippingPincode,
        shippingCountry: form.shippingCountry,
        phone: form.phone || user?.phone || '',
        notes: form.notes,
        paymentMethod,
      });
      const orderId = result.orderId;

      // Invalidate cart immediately (it's cleared server-side after checkout)
      queryClient.invalidateQueries({ queryKey: ['cart'] });

      // If Cash on Delivery was selected
      if (paymentMethod === 'cod') {
        toast({
          title: 'Order placed successfully!',
          description: `Order #${orderId} has been confirmed with Cash on Delivery.`,
        });
        navigate(`/orders/${orderId}`);
        return;
      }

      // Online Razorpay payment flow
      try {
        const paymentOrder = await createPaymentOrder({ orderId });
        if (paymentOrder.razorpayOrderId && typeof window.Razorpay !== 'undefined') {
          await new Promise<void>((resolve, reject) => {
            const rzp = new window.Razorpay({
              key: paymentOrder.key,
              amount: paymentOrder.amount,
              currency: paymentOrder.currency,
              name: 'Zafex Collectibles',
              description: `Order #${orderId}`,
              order_id: paymentOrder.razorpayOrderId,
              prefill: {
                name: user?.name,
                email: user?.email,
                contact: form.phone,
              },
              theme: { color: '#d4af37' },
              handler: async (response: Record<string, string>) => {
                try {
                  await verifyPayment({
                    razorpayOrderId: response['razorpay_order_id'] as string,
                    razorpayPaymentId: response['razorpay_payment_id'] as string,
                    razorpaySignature: response['razorpay_signature'] as string,
                    orderId,
                  });
                  toast({
                    title: 'Payment successful!',
                    description: `Order #${orderId} confirmed.`,
                  });
                  resolve();
                } catch {
                  reject(new Error('Payment verification failed'));
                }
              },
              modal: { ondismiss: () => reject(new Error('dismissed')) },
            });
            rzp.open();
          });
        } else {
          toast({
            title: 'Order placed!',
            description: `Order #${orderId} placed. Complete payment anytime from your orders.`,
          });
        }
      } catch (payErr) {
        const msg = (payErr as Error).message;
        if (msg !== 'dismissed') {
          toast({
            title: 'Order placed!',
            description: `Order #${orderId} placed. Complete payment from your orders page.`,
          });
        } else {
          toast({
            title: 'Order saved',
            description: `Order #${orderId} placed. You can complete payment later.`,
          });
        }
      }

      navigate(`/orders/${orderId}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Checkout failed';
      toast({ title: 'Checkout failed', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <section className="w-full bg-[#cec3b5] flex flex-col items-center justify-center text-center px-4 py-14">
        <h1 className="font-serif text-[48px] font-light text-[#1a1208] uppercase tracking-[0.1em]">
          Checkout
        </h1>
      </section>

      <form
        onSubmit={placeOrder}
        className="max-w-[1100px] mx-auto px-5 py-12 flex flex-col lg:flex-row gap-10"
      >
        {/* Left Column: Shipping & Payment Method */}
        <div className="flex-1 flex flex-col gap-8">
          {/* Shipping Form */}
          <div className="bg-white border border-[#d4cfc7] p-6 shadow-sm">
            <h2 className="font-serif text-[20px] font-bold text-[#1a1a18] uppercase mb-6 flex items-center gap-2">
              <span>1.</span> Shipping Information
            </h2>
            <div className="flex flex-col gap-5">
              <div>
                <label className={labelCls}>Street Address</label>
                <input
                  value={form.shippingAddress}
                  onChange={(e) => update('shippingAddress', e.target.value)}
                  required
                  className={inputCls}
                  placeholder="House No., Building, Street, Area"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>City</label>
                  <input
                    value={form.shippingCity}
                    onChange={(e) => update('shippingCity', e.target.value)}
                    required
                    className={inputCls}
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className={labelCls}>State</label>
                  <input
                    value={form.shippingState}
                    onChange={(e) => update('shippingState', e.target.value)}
                    required
                    className={inputCls}
                    placeholder="State"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>PIN Code</label>
                  <input
                    value={form.shippingPincode}
                    onChange={(e) => update('shippingPincode', e.target.value)}
                    required
                    className={inputCls}
                    placeholder="e.g. 110001"
                  />
                </div>
                <div>
                  <label className={labelCls}>Country</label>
                  <input
                    value={form.shippingCountry}
                    onChange={(e) => update('shippingCountry', e.target.value)}
                    required
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Phone Number</label>
                <input
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  required
                  className={inputCls}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label className={labelCls}>Order Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => update('notes', e.target.value)}
                  rows={3}
                  className="w-full border border-[#d4cfc7] px-4 py-3 font-sans text-[14px] focus:outline-none focus:border-[#d4af37] bg-[#faf8f3] resize-none"
                  placeholder="Any delivery instructions, landmark, etc."
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white border border-[#d4cfc7] p-6 shadow-sm">
            <h2 className="font-serif text-[20px] font-bold text-[#1a1a18] uppercase mb-6 flex items-center gap-2">
              <span>2.</span> Payment Method
            </h2>

            <div className="flex flex-col gap-4">
              {/* Online Payment (Razorpay) */}
              <label
                onClick={() => setPaymentMethod('razorpay')}
                className={`flex items-start gap-4 p-4 border cursor-pointer transition-all ${
                  paymentMethod === 'razorpay'
                    ? 'border-[#d4af37] bg-[#faf8f3] ring-1 ring-[#d4af37]'
                    : 'border-[#d4cfc7] hover:border-[#1a1a18]'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'razorpay'}
                  onChange={() => setPaymentMethod('razorpay')}
                  className="mt-1 accent-[#d4af37]"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CreditCard size={18} className="text-[#d4af37]" />
                    <span className="font-serif text-[14px] font-bold text-[#1a1a18] uppercase tracking-[0.5px]">
                      Online Payment (Razorpay)
                    </span>
                  </div>
                  <p className="font-sans text-[13px] text-[#6a6a60] mt-1">
                    Pay securely via UPI (Google Pay, PhonePe, Paytm), Debit/Credit Cards, or NetBanking.
                  </p>
                </div>
              </label>

              {/* Cash On Delivery */}
              <label
                onClick={() => setPaymentMethod('cod')}
                className={`flex items-start gap-4 p-4 border cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-[#d4af37] bg-[#faf8f3] ring-1 ring-[#d4af37]'
                    : 'border-[#d4cfc7] hover:border-[#1a1a18]'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-1 accent-[#d4af37]"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Banknote size={18} className="text-[#1a1a18]" />
                    <span className="font-serif text-[14px] font-bold text-[#1a1a18] uppercase tracking-[0.5px]">
                      Cash on Delivery (COD)
                    </span>
                  </div>
                  <p className="font-sans text-[13px] text-[#6a6a60] mt-1">
                    Pay with cash or UPI directly when your collectible package is delivered to your doorstep.
                  </p>
                </div>
              </label>
            </div>

            <div className="mt-4 flex items-center gap-2 text-[12px] text-[#8a8278]">
              <ShieldCheck size={16} className="text-green-700" />
              <span>100% Secure Checkout & Buyer Protection Guarantee</span>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="w-full lg:w-[360px] flex-shrink-0">
          <div className="bg-white border border-[#d4cfc7] p-6 sticky top-6 shadow-sm">
            <h2 className="font-serif text-[20px] font-bold text-[#1a1a18] uppercase mb-6">
              Order Summary
            </h2>

            <div className="flex flex-col gap-3 mb-4 max-h-[300px] overflow-y-auto pr-1">
              {cartData.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center font-sans text-[13px] border-b border-[#f0ede6] pb-2">
                  <div className="flex items-center gap-3 mr-2 overflow-hidden">
                    <img
                      src={item.product?.image}
                      alt={item.product?.name}
                      className="w-10 h-10 object-cover border border-[#e5dfd5] shrink-0"
                    />
                    <span className="text-[#4a4a4a] line-clamp-1">
                      {item.product?.name} <span className="font-bold">× {item.quantity}</span>
                    </span>
                  </div>
                  <span className="text-[#1a1a18] font-medium flex-shrink-0">
                    {formatPrice((item.product?.price ?? 0) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#d4cfc7] pt-4 flex flex-col gap-2 mb-6">
              <div className="flex justify-between font-sans text-[14px]">
                <span className="text-[#6a6a60]">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between font-sans text-[14px]">
                <span className="text-[#6a6a60]">Shipping</span>
                <span className={shippingCost === 0 ? 'text-green-700 font-medium' : ''}>
                  {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between font-sans text-[13px] text-[#8a8278]">
                <span>Payment Mode</span>
                <span className="font-semibold uppercase text-[#1a1a18]">
                  {paymentMethod === 'cod' ? 'Cash On Delivery' : 'Online (Razorpay / Cards / UPI)'}
                </span>
              </div>
              <div className="flex justify-between font-serif text-[18px] font-bold pt-3 border-t border-[#d4cfc7]">
                <span>Total Amount</span>
                <span className="text-[#d4af37]">{formatPrice(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[52px] bg-[#1a1a18] text-white font-serif text-[12px] uppercase font-bold tracking-[2px] hover:bg-[#d4af37] hover:text-[#1a1a18] transition-colors disabled:opacity-60 cursor-pointer"
            >
              {loading
                ? 'Processing Order…'
                : paymentMethod === 'cod'
                ? 'Confirm COD Order'
                : `Pay ${formatPrice(total)}`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
