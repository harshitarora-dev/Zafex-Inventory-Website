import React from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrder, cancelOrder } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, Package, CheckCircle2, Truck, XCircle, Clock } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  packed:    'bg-indigo-100 text-indigo-800 border-indigo-200',
  shipped:   'bg-purple-100 text-purple-800 border-purple-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  pending:   Clock,
  confirmed: CheckCircle2,
  packed:    Package,
  shipped:   Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
};

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { isLoggedIn } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const orderId = Number(id);

  const { data, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId),
    enabled: isLoggedIn && !!orderId,
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelOrder(orderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['order', orderId] });
      qc.invalidateQueries({ queryKey: ['orders'] });
      toast({ title: 'Order cancelled', description: `Order #${orderId} has been cancelled.` });
    },
    onError: (err: unknown) => {
      toast({
        title: 'Cannot cancel order',
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'destructive',
      });
    },
  });

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex flex-col items-center justify-center gap-6 px-4">
        <Link href="/login" className="bg-[#1a1a18] text-white font-serif text-[12px] uppercase font-bold tracking-[2px] px-8 py-4">
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

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex flex-col items-center justify-center gap-6">
        <h1 className="font-serif text-[28px] text-[#1a1a18]">Order not found</h1>
        <Link href="/account" className="text-[#d4af37] hover:underline font-sans text-[14px]">
          ← Back to Account
        </Link>
      </div>
    );
  }

  const { order, items, statusHistory } = data;
  const canCancel = ['pending', 'confirmed'].includes(order.status);
  const StatusIcon = STATUS_ICONS[order.status] ?? Clock;

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <section className="w-full bg-[#cec3b5] flex flex-col items-center justify-center text-center px-4 py-14">
        <h1 className="font-serif text-[48px] font-light text-[#1a1208] uppercase tracking-[0.1em]">
          Order #{order.id}
        </h1>
        <p className="font-sans text-[13px] text-[#5a4a30]/70 mt-2">
          {new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </section>

      <div className="max-w-[1000px] mx-auto px-5 py-12">
        <Link
          href="/account"
          className="inline-flex items-center gap-2 font-sans text-[13px] text-[#6b6b6b] hover:text-[#1a1a18] transition-colors mb-8"
        >
          <ChevronLeft size={16} />
          Back to My Account
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Status badge */}
            <div className="bg-white border border-[#d4cfc7] p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StatusIcon size={22} className="text-[#d4af37]" />
                <div>
                  <div className="font-serif text-[13px] uppercase tracking-[1px] text-[#6b6b6b]">
                    Order Status
                  </div>
                  <span
                    className={`inline-block mt-1 px-3 py-1 rounded-full border font-sans text-[12px] font-medium capitalize ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
              {canCancel && (
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to cancel this order?')) {
                      cancelMutation.mutate();
                    }
                  }}
                  disabled={cancelMutation.isPending}
                  className="font-sans text-[13px] text-[#9c1c1c] hover:text-red-700 border border-[#9c1c1c] px-4 py-2 hover:bg-red-50 transition-colors disabled:opacity-60"
                >
                  {cancelMutation.isPending ? 'Cancelling…' : 'Cancel Order'}
                </button>
              )}
            </div>

            {/* Order items */}
            <div className="bg-white border border-[#d4cfc7]">
              <div className="px-6 py-4 border-b border-[#d4cfc7]">
                <h2 className="font-serif text-[16px] font-bold text-[#1a1a18] uppercase">
                  Items Ordered
                </h2>
              </div>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-6 py-4 border-b border-[#d4cfc7] last:border-b-0"
                >
                  <div>
                    <div className="font-serif text-[14px] font-bold text-[#1a1a18]">
                      {item.productName}
                    </div>
                    <div className="font-sans text-[12px] text-[#6b6b6b] mt-0.5">
                      Qty: {item.quantity} × ₹{item.unitPrice.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <span className="font-serif text-[14px] font-bold text-[#d4af37]">
                    ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Status History */}
            {statusHistory.length > 0 && (
              <div className="bg-white border border-[#d4cfc7] p-6">
                <h2 className="font-serif text-[16px] font-bold text-[#1a1a18] uppercase mb-5">
                  Status History
                </h2>
                <div className="relative pl-5 border-l-2 border-[#d4cfc7] flex flex-col gap-5">
                  {statusHistory.map((entry) => (
                    <div key={entry.id} className="relative">
                      <div className="absolute -left-[21px] w-3 h-3 rounded-full bg-[#d4af37] border-2 border-white" />
                      <div className="font-serif text-[13px] font-bold text-[#1a1a18] capitalize">
                        {entry.status}
                      </div>
                      {entry.note && (
                        <div className="font-sans text-[12px] text-[#6b6b6b] mt-0.5">
                          {entry.note}
                        </div>
                      )}
                      <div className="font-sans text-[11px] text-[#a39b8e] mt-1">
                        {new Date(entry.createdAt).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            {/* Payment summary */}
            <div className="bg-white border border-[#d4cfc7] p-6">
              <h2 className="font-serif text-[16px] font-bold text-[#1a1a18] uppercase mb-4">
                Payment
              </h2>
              <div className="flex flex-col gap-2 text-[14px] font-sans">
                <div className="flex justify-between">
                  <span className="text-[#4a4a4a]">Total</span>
                  <span className="font-bold text-[#1a1a18]">
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4a4a4a]">Payment</span>
                  <span
                    className={`font-medium capitalize ${
                      order.paymentStatus === 'paid'
                        ? 'text-green-700'
                        : order.paymentStatus === 'failed'
                        ? 'text-red-600'
                        : 'text-yellow-600'
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping address */}
            <div className="bg-white border border-[#d4cfc7] p-6">
              <h2 className="font-serif text-[16px] font-bold text-[#1a1a18] uppercase mb-4">
                Shipping To
              </h2>
              <div className="font-sans text-[13px] text-[#4a4a4a] leading-relaxed">
                <p className="font-bold text-[#1a1a18]">{order.customerName}</p>
                <p>{order.shippingAddress}</p>
                {order.shippingCity && (
                  <p>
                    {order.shippingCity}
                    {order.shippingState ? `, ${order.shippingState}` : ''}
                    {order.shippingPincode ? ` – ${order.shippingPincode}` : ''}
                  </p>
                )}
                <p>{order.shippingCountry ?? 'India'}</p>
                {order.customerPhone && <p className="mt-1">📞 {order.customerPhone}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
