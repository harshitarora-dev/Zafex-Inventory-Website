import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
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
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ProductCard from '@/components/ProductCard';

/* ─── FAQ Accordion ─────────────────────────────────────────────────── */

const FAQS = [
  {
    q: 'Is this suitable for LARP / battle use?',
    a: 'Our steel pieces are crafted from high-carbon steel and are suitable for display and light reenactment. Items marked "battle-ready" have reinforced construction with rounded edges. LARP-specific foam weapons are safe for full-contact fighting.',
  },
  {
    q: 'What is your return / exchange policy?',
    a: 'We accept returns within 14 days of delivery for standard catalog items, provided the item is unused and in original condition. Custom commissions are non-refundable once production begins.',
  },
  {
    q: 'How long does shipping take?',
    a: 'Domestic orders dispatch within 2–3 business days. International shipping via express courier typically takes 7–14 days depending on the destination and customs clearance.',
  },
  {
    q: 'How do I care for my piece?',
    a: 'Steel items should be lightly oiled after handling to prevent rust — Renaissance wax or mineral oil works best. Store in a dry, climate-controlled space. Leather goods should be conditioned periodically with mink oil or a quality leather conditioner.',
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
  const product = PRODUCTS.find((p) => p.id === id);
  const { toast } = useToast();
  const [qty, setQty] = useState(1);
  const [mainImg, setMainImg] = useState(product?.image ?? '');
  const [thumbIdx, setThumbIdx] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);

  // Pseudo gallery — repeat the single image 3 times (would be real images in production)
  const gallery = product ? [product.image, product.image, product.image] : [];

  // Related products — same category, excluding current
  const related = PRODUCTS.filter((p) => p.cat === product?.cat && p.id !== id).slice(0, 4);

  useEffect(() => {
    if (product) {
      setMainImg(product.image);
      setThumbIdx(0);
    }
  }, [id, product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex flex-col items-center justify-center">
        <h1 className="font-serif text-4xl mb-4 text-[#1a1a18]">Product Not Found</h1>
        <Link href="/shop" className="text-[#d4af37] font-serif uppercase tracking-[2px] hover:underline">
          Return to Shop
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    setAdding(true);
    setTimeout(() => {
      setAdding(false);
      toast({
        title: 'Added to cart!',
        description: `${qty}× ${product.name} has been added to your cart.`,
      });
    }, 600);
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

  const prevThumb = () => {
    const idx = (thumbIdx - 1 + gallery.length) % gallery.length;
    handleThumb(gallery[idx], idx);
  };

  const nextThumb = () => {
    const idx = (thumbIdx + 1) % gallery.length;
    handleThumb(gallery[idx], idx);
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <div className="w-full max-w-[1680px] mx-auto px-5 py-10">
        {/* Breadcrumb */}
        <div className="font-serif text-[11px] uppercase tracking-[2px] text-[#d4af37] mb-10 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-[#1a1a18] transition-colors">HOME</Link>
          <span className="text-[#d4cfc7]">/</span>
          <Link href="/shop" className="hover:text-[#1a1a18] transition-colors">SHOP</Link>
          <span className="text-[#d4cfc7]">/</span>
          <Link href={`/shop?cat=${product.cat}`} className="hover:text-[#1a1a18] transition-colors capitalize">
            {product.cat}
          </Link>
          <span className="text-[#d4cfc7]">/</span>
          <span className="text-[#1a1a18]">{product.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 xl:gap-16">

          {/* ── Left: Image Gallery ── */}
          <div className="w-full lg:w-[55%] flex flex-col gap-4">
            {/* Main image with zoom */}
            <div
              className="relative overflow-hidden bg-[#ede9e3] aspect-square cursor-crosshair select-none"
              onMouseEnter={() => setZoomed(true)}
              onMouseLeave={() => setZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              <img
                src={mainImg}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500"
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
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/80 px-2.5 py-1.5 text-[#1a1a18] pointer-events-none">
                  <ZoomIn size={13} />
                  <span className="font-sans text-[11px]">Hover to zoom</span>
                </div>
              )}

              {/* Nav arrows */}
              <button
                onClick={prevThumb}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white flex items-center justify-center transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={nextThumb}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white flex items-center justify-center transition-colors"
                aria-label="Next image"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => handleThumb(img, i)}
                  className={`w-[80px] h-[80px] bg-[#ede9e3] border-2 transition-all overflow-hidden ${
                    thumbIdx === i ? 'border-[#1a1a18]' : 'border-transparent hover:border-[#d4cfc7]'
                  }`}
                  aria-label={`Image ${i + 1}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* ── Right: Purchase Panel ── */}
          <div className="w-full lg:w-[45%] lg:sticky lg:top-6 lg:self-start flex flex-col">
            {/* Badge */}
            {product.badge && (
              <div
                className={`inline-flex self-start px-3 py-1 mb-4 font-serif text-[10px] uppercase tracking-[1px] ${
                  product.badge === 'new' ? 'bg-[#1a1a18] text-white' : 'bg-[#d4af37] text-[#1a1a18]'
                }`}
              >
                {product.badge}
              </div>
            )}

            <h1 className="font-serif text-[32px] sm:text-[38px] font-bold text-[#1a1a18] leading-tight mb-3">
              {product.name}
            </h1>

            <p className="font-sans text-[28px] text-[#d4af37] font-semibold mb-6">
              ₹{product.price.toLocaleString('en-IN')}
            </p>

            <p className="font-sans text-[14px] text-[#4a4a4a] leading-[1.8] mb-6">
              {product.desc ||
                'An exquisite piece crafted with historical accuracy and premium materials. Meticulously detailed by our master artisans to withstand the rigors of display and light reenactment. Every piece carries the heritage of the past.'}
            </p>

            {/* Meta */}
            <div className="flex flex-col gap-2.5 mb-8 py-5 border-y border-[#d4cfc7]">
              {[
                { label: 'Category', value: `${product.cat} / ${product.sub.replace('-', ' ')}` },
                ...(product.tags ? [{ label: 'Tags', value: product.tags.join(', ') }] : []),
                { label: 'Availability', value: '✓ In Stock', green: true },
                { label: 'Shipping', value: 'Free above ₹5,000 · Worldwide' },
              ].map(({ label, value, green }) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="font-serif text-[11px] uppercase tracking-[1px] text-[#1a1a18] font-bold w-[100px] flex-shrink-0 pt-px">
                    {label}:
                  </span>
                  <span className={`font-sans text-[13px] capitalize ${green ? 'text-green-700 font-medium' : 'text-[#4a4a4a]'}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Qty + Add to Cart */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-[52px] border border-[#d4cfc7]">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-10 flex items-center justify-center font-serif text-[#1a1a18] hover:bg-black/5 transition-colors text-lg"
                >
                  −
                </button>
                <div className="w-10 flex items-center justify-center font-sans text-[14px] text-[#1a1a18] border-x border-[#d4cfc7]">
                  {qty}
                </div>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="w-10 flex items-center justify-center font-serif text-[#1a1a18] hover:bg-black/5 transition-colors text-lg"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={adding}
                className={`flex-1 h-[52px] font-serif text-[12px] uppercase font-bold tracking-[2px] transition-all duration-300 flex items-center justify-center gap-2 ${
                  adding
                    ? 'bg-[#d4af37] text-[#1a1a18] scale-[0.98]'
                    : 'bg-[#1a1a18] text-white hover:bg-[#d4af37] hover:text-[#1a1a18]'
                }`}
              >
                <ShoppingBag size={16} className={adding ? 'animate-bounce' : ''} />
                {adding ? 'Adding…' : '+ Add to Cart'}
              </button>
            </div>

            <div className="flex gap-2 mb-8">
              <button
                onClick={() => {
                  setIsWishlisted((v) => !v);
                  toast({ title: isWishlisted ? 'Removed from wishlist' : 'Added to wishlist', description: product.name });
                }}
                className={`h-[52px] px-4 border flex items-center gap-2 font-serif text-[11px] uppercase tracking-[1px] transition-all ${
                  isWishlisted
                    ? 'bg-[#9c1c1c] border-[#9c1c1c] text-white'
                    : 'border-[#d4cfc7] text-[#1a1a18] hover:bg-[#d4af37] hover:border-[#d4af37]'
                }`}
              >
                <Heart size={16} strokeWidth={1.5} fill={isWishlisted ? 'currentColor' : 'none'} />
                Wishlist
              </button>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  toast({ title: 'Link copied!', description: 'Product link copied to clipboard.' });
                }}
                className="h-[52px] px-4 border border-[#d4cfc7] text-[#1a1a18] hover:border-[#1a1a18] transition-colors flex items-center"
                aria-label="Share"
              >
                <Share2 size={16} strokeWidth={1.5} />
              </button>
            </div>

            {/* Trust strip */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: ShieldCheck, label: 'Secure Payment' },
                { icon: Truck,       label: 'Fast Shipping' },
                { icon: CheckCircle2, label: 'Authentic Quality' },
                { icon: RefreshCcw,  label: 'Easy Returns' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon size={15} className="text-[#d4af37] flex-shrink-0" />
                  <span className="font-sans text-[12px] text-[#6b6b6b]">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FAQ Section ── */}
        <div className="mt-16 pt-12 border-t border-[#d4cfc7] max-w-[800px]">
          <span className="font-serif text-[11px] text-[#d4af37] tracking-[3px] uppercase block mb-2">NEED TO KNOW</span>
          <h2 className="font-serif text-[28px] font-bold text-[#1a1a18] uppercase mb-8">
            Frequently Asked Questions
          </h2>
          {FAQS.map((faq, i) => (
            <FaqItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>

        {/* ── Related Products ── */}
        {related.length > 0 && (
          <div className="mt-16 pt-12 border-t border-[#d4cfc7]">
            <div className="mb-10">
              <span className="font-serif text-[11px] text-[#d4af37] tracking-[3px] uppercase block mb-2">FROM THE SAME COLLECTION</span>
              <h2 className="font-serif text-[32px] font-bold text-[#1a1a18] uppercase">You May Also Like</h2>
              <div className="w-10 h-[3px] bg-[#9c1c1c] mt-4" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-[18px]">
              {related.map((p, i) => (
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
