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
  Star,
  Copy,
  Gift,
  Camera,
  Film,
  MapPin,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ProductCard from '@/components/ProductCard';

/* ─── FAQ Accordion ─────────────────────────────────────────────────── */

const FAQS = [
  {
    q: 'Is this battle ready?',
    a: 'Many of our metal pieces are finished for display and light reenactment. Battle-ready custom builds are available on request with reinforced joints and rounded edges.',
  },
  {
    q: 'Is it handmade?',
    a: 'Yes. Every product is hand-finished by our craftspeople using traditional techniques and modern quality checks to ensure authenticity and durability.',
  },
  {
    q: 'Can I customize?',
    a: 'Absolutely. We offer custom sizes, finishes, and personalization options. Consult our product page or contact support for bespoke orders.',
  },
  {
    q: 'How long is shipping?',
    a: 'Domestic orders typically ship within 3–5 business days. International delivery ranges from 10–18 business days depending on customs and destination.',
  },
  {
    q: 'What is the return policy?',
    a: 'Standard catalog items can be returned within 14 days when unused and in original condition. Custom or personalized items are non-returnable once production begins.',
  },
  {
    q: 'What is the cleaning method?',
    a: 'Wipe steel pieces with a dry cloth and apply a thin coat of mineral oil or Renaissance wax after handling. Avoid harsh chemicals and prolonged moisture.',
  },
  {
    q: 'How do I prevent rust?',
    a: 'Keep products dry, store in a climate-controlled place, and reapply a protective oil layer after use or exposure to humidity.',
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
  // Size & color defaults (fall back when product doesn't declare them)
  const SIZE_OPTIONS = product?.tags?.includes('women') ? ['S/M','L/XL'] : ['S/M','L/XL','2XL/3XL'];
  const [selectedSize, setSelectedSize] = useState<string | null>(SIZE_OPTIONS[0]);
  const COLOR_OPTIONS = product?.colors && product.colors.length > 0 ? product.colors : ['#000000', '#ffffff'];
  const [selectedColor, setSelectedColor] = useState<string | null>(COLOR_OPTIONS[0]);

  // Pseudo gallery — repeat the single image 3 times (would be real images in production)
  const gallery = product?.gallery && product.gallery.length > 0 ? product.gallery : [product?.image ?? ''];
  const tabs = ['Description', 'Specifications', 'Size Guide', 'Shipping', 'Returns', 'Care', 'FAQs', 'Reviews'];
  const [activeTab, setActiveTab] = useState('Description');
  const [country, setCountry] = useState('India');
  const [copied, setCopied] = useState(false);

  // Related products — same category, excluding current
  const related = PRODUCTS.filter((p) => p.cat === product?.cat && p.id !== id).slice(0, 4);

  useEffect(() => {
    if (product) {
      setMainImg(product.image);
      setThumbIdx(0);
      setActiveTab('Description');
      setCountry('India');
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
        description: `${qty}× ${product.name}${selectedSize ? ' — ' + selectedSize : ''}${selectedColor ? ' (' + selectedColor + ')' : ''} has been added to your cart.`,
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

  const stockRemaining = product.inStock ? 12 : 0;
  const shippingEstimate = country === 'India' ? '3-5 business days' : '10-18 business days';
  const rating = product.rating ?? 4.8;
  const reviewCount = product.reviewCount ?? 24;

  return (
    <div className="min-h-screen bg-[#f5f0e8] pb-24">
      <div className="w-full max-w-[1680px] mx-auto px-5 py-10">
        {/* Breadcrumb */}
        <div className="font-serif text-[11px] uppercase tracking-[2px] text-[#d4af37] mb-10 flex flex-wrap items-center gap-2">
          <Link href="/" className="hover:text-[#1a1a18] transition-colors">HOME</Link>
          <span className="text-[#d4cfc7]">/</span>
          <Link href="/shop" className="hover:text-[#1a1a18] transition-colors">ARMOR</Link>
          <span className="text-[#d4cfc7]">/</span>
          <Link href={`/shop?cat=${product.cat}`} className="hover:text-[#1a1a18] transition-colors capitalize">
            {product.cat}
          </Link>
          <span className="text-[#d4cfc7]">/</span>
          <span className="text-[#1a1a18] capitalize">{product.sub.replace('-', ' ')}</span>
          <span className="text-[#d4cfc7]">/</span>
          <span className="text-[#1a1a18]">{product.name}</span>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] xl:gap-16">
          <div className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <div
                  className="relative overflow-hidden rounded-[32px] bg-[#ede9e3] aspect-square cursor-crosshair select-none"
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
                    <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-4 py-2 text-[12px] font-medium text-[#1a1a18] flex items-center gap-2 shadow-sm">
                      <ZoomIn size={14} /> Hover to zoom
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {gallery.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => handleThumb(img, i)}
                      className={`overflow-hidden rounded-[22px] border transition ${
                        thumbIdx === i ? 'border-[#1a1a18]' : 'border-transparent hover:border-[#d4cfc7]'
                      }`}
                      aria-label={`Gallery thumb ${i + 1}`}
                    >
                      <img src={img} alt="Gallery thumbnail" className="h-20 w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[32px] border border-[#d4cfc7] bg-white p-6 shadow-sm">
                  <div className="font-serif text-[11px] uppercase tracking-[3px] text-[#d4af37] mb-3">Media & Styling</div>
                  <div className="space-y-3 text-[14px] text-[#4a4a4a]">
                    <p className="font-semibold text-[#1a1a18]">360° View + Lifestyle Gallery</p>
                    <p>Swipe through curated customer photos, lifestyle shots, and our 360° display preview for every angle.</p>
                    {product.video ? (
                      <div className="overflow-hidden rounded-[24px] border border-[#e6e1da] bg-[#f8f5f0]">
                        <video controls src={product.video} className="w-full h-44 object-cover" />
                      </div>
                    ) : (
                      <div className="rounded-[24px] border border-[#e6e1da] bg-[#f8f5f0] p-6 text-center text-[13px] text-[#6b6b6b]">
                        360° product preview coming soon.
                      </div>
                    )}
                  </div>
                </div>

                {(product.customerPhotos?.length || product.lifestyleImages?.length) && (
                  <div className="rounded-[32px] border border-[#d4cfc7] bg-white p-6 shadow-sm">
                    <div className="font-serif text-[11px] uppercase tracking-[3px] text-[#d4af37] mb-3">Customer Photos</div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {(product.customerPhotos ?? []).slice(0, 2).map((photo, index) => (
                        <img key={`cust-${index}`} src={photo} alt={`Customer ${index + 1}`} className="h-36 w-full rounded-[24px] object-cover" />
                      ))}
                      {(product.lifestyleImages ?? []).slice(0, 2).map((photo, index) => (
                        <img key={`life-${index}`} src={photo} alt={`Lifestyle ${index + 1}`} className="h-36 w-full rounded-[24px] object-cover" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[32px] border border-[#d4cfc7] bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <span className="font-serif text-[11px] uppercase tracking-[3px] text-[#d4af37]">Highlights</span>
                  <h2 className="font-serif text-[24px] font-bold text-[#1a1a18] mt-2">Why this product stands out</h2>
                </div>
                <div className="rounded-full bg-[#f5f0e8] px-4 py-2 text-[12px] uppercase tracking-[1px] text-[#1a1a18]">Best seller</div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {['Handmade', 'Museum Grade', 'Custom Size', 'Worldwide Shipping', 'Secure Checkout', 'Priority Support'].map((item) => (
                  <div key={item} className="rounded-3xl border border-[#e6e1da] bg-[#faf6f0] p-4 text-[14px] text-[#1a1a18]">
                    ✓ {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[32px] border border-[#d4cfc7] bg-white p-6 shadow-sm lg:sticky lg:top-6">
              <div className="flex flex-col gap-4">
                <div>
                  {product.badge && (
                    <div className={`inline-flex rounded-full px-4 py-2 text-[11px] uppercase tracking-[2px] ${
                      product.badge === 'new' ? 'bg-[#1a1a18] text-white' : 'bg-[#d4af37] text-[#1a1a18]'
                    }`}>
                      {product.badge}
                    </div>
                  )}
                  <h1 className="font-serif text-[32px] sm:text-[36px] font-bold text-[#1a1a18] mt-4 leading-tight">{product.name}</h1>
                  <p className="font-sans text-[28px] text-[#d4af37] font-semibold mt-4">₹{product.price.toLocaleString('en-IN')}</p>
                </div>

                <div className="flex flex-wrap gap-3 text-[13px] text-[#4a4a4a]">
                  <span className="rounded-full bg-[#f5f0e8] px-3 py-2">{rating.toFixed(1)} ★</span>
                  <span className="rounded-full bg-[#f5f0e8] px-3 py-2">{reviewCount} reviews</span>
                  <span className="rounded-full bg-[#f5f0e8] px-3 py-2">{stockRemaining} left in stock</span>
                </div>

                <div className="grid gap-3 text-[13px] text-[#4a4a4a]">
                  {[
                    { label: 'SKU', value: product.sku ?? 'ZAFS-000' },
                    { label: 'Brand', value: product.brand ?? 'ZAFS' },
                    { label: 'Material', value: product.material ?? 'Mild Steel' },
                    { label: 'Finish', value: product.finish ?? 'Black Oiled' },
                    { label: 'Manufacturing Time', value: product.manufacturingTime ?? '7-10 Days' },
                    { label: 'Country', value: product.country ?? 'India' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between rounded-3xl border border-[#e6e1da] bg-[#faf6f0] px-4 py-3">
                      <span className="font-serif text-[11px] uppercase tracking-[1px] text-[#1a1a18]">{label}</span>
                      <span className="font-sans text-[13px] text-[#1a1a18]">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-[2px] text-[#6b6b6b] mb-2">Color</label>
                    <div className="flex items-center gap-3">
                      {COLOR_OPTIONS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setSelectedColor(c)}
                          aria-label={`Choose color ${c}`}
                          className={`h-8 w-8 rounded-md border ${selectedColor === c ? 'ring-2 ring-offset-1 ring-[#ff7a00]' : 'border-[#e6e1da]'}`}
                          style={{ background: c.startsWith('#') ? c : undefined }}
                        >
                          {!c.startsWith('#') && <span className="sr-only">{c}</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-[2px] text-[#6b6b6b] mb-2">Size</label>
                    <div className="flex items-center gap-3">
                      {SIZE_OPTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSelectedSize(s)}
                          className={`px-4 py-2 rounded-md border text-[13px] ${selectedSize === s ? 'bg-[#1a1a18] text-white' : 'bg-[#faf6f0] text-[#1a1a18] border-[#d4cfc7]'}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-[2px] text-[#6b6b6b] mb-2">Quantity</label>
                    <div className="inline-flex items-center gap-3">
                      <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-9 h-9 rounded-md border bg-[#faf6f0]">-</button>
                      <div className="px-4 font-semibold">{qty}</div>
                      <button onClick={() => setQty((q) => q + 1)} className="w-9 h-9 rounded-md border bg-[#faf6f0]">+</button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-[2px] text-[#6b6b6b] mb-2">Material</label>
                    <select className="w-full rounded-3xl border border-[#d4cfc7] bg-[#faf6f0] px-4 py-3 text-[14px] text-[#1a1a18]">
                      <option>{product.material ?? 'Mild Steel'}</option>
                      <option>Stainless Steel</option>
                      <option>Brass</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="rounded-full bg-[#1a1a18] px-5 py-4 text-[12px] uppercase tracking-[2px] text-white transition hover:bg-[#d4af37] hover:text-[#1a1a18]"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => {
                      setIsWishlisted((v) => !v);
                      toast({ title: isWishlisted ? 'Removed from wishlist' : 'Added to wishlist', description: product.name });
                    }}
                    className="rounded-full border border-[#d4cfc7] bg-[#faf6f0] px-5 py-4 text-[12px] uppercase tracking-[2px] text-[#1a1a18]"
                  >
                    {isWishlisted ? 'Remove Wishlist' : 'Add to Wishlist'}
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button className="rounded-full border border-[#d4cfc7] bg-[#faf6f0] px-4 py-3 text-[12px] uppercase tracking-[2px] text-[#1a1a18] flex items-center justify-center gap-2">
                    <Heart size={16} /> Compare
                  </button>
                  <button className="rounded-full border border-[#d4cfc7] bg-[#faf6f0] px-4 py-3 text-[12px] uppercase tracking-[2px] text-[#1a1a18] flex items-center justify-center gap-2">
                    <Share2 size={16} /> Share
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-[#d4cfc7] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-[14px] font-semibold text-[#1a1a18]">
                <MapPin size={18} className="text-[#d4af37]" /> Shipping Estimate
              </div>
              <div className="grid gap-3">
                <div className="rounded-3xl border border-[#e6e1da] bg-[#faf6f0] px-4 py-4">
                  <p className="text-[13px] text-[#6b6b6b]">Destination</p>
                  <p className="font-semibold text-[#1a1a18]">{country}</p>
                </div>
                <div className="rounded-3xl border border-[#e6e1da] bg-[#faf6f0] px-4 py-4">
                  <p className="text-[13px] text-[#6b6b6b]">Expected Delivery</p>
                  <p className="font-semibold text-[#1a1a18]">{shippingEstimate}</p>
                </div>
                <div className="rounded-3xl border border-[#e6e1da] bg-[#faf6f0] px-4 py-4">
                  <p className="text-[13px] text-[#6b6b6b]">Courier</p>
                  <p className="font-semibold text-[#1a1a18]">{country === 'India' ? 'BlueDart / Delhivery' : 'DHL / FedEx'}</p>
                </div>
                <p className="text-[12px] text-[#6b6b6b]">Import duties notice: duties may be collected by the courier on arrival and are not included in the product price.</p>
              </div>
            </div>
          </aside>
        </div>

        {/* Sticky mobile add to cart */}
        <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden border-t border-[#d4cfc7] bg-white/95 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-sans text-[12px] uppercase tracking-[2px] text-[#6b6b6b]">{stockRemaining} in stock</p>
              <p className="font-serif text-[18px] font-bold text-[#1a1a18]">₹{product.price.toLocaleString('en-IN')}</p>
            </div>
            <button
              onClick={handleAddToCart}
              className="rounded-full bg-[#1a1a18] px-5 py-3 text-[12px] uppercase tracking-[2px] text-white"
            >
              Add to Cart
            </button>
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
              <h2 className="font-serif text-[32px] font-bold text-[#1a1a18] uppercase">Frequently Bought Together</h2>
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
