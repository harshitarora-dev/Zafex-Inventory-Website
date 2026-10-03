import React, { useRef, useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Award, Camera, CheckCircle2, Globe, Lock, PlayCircle, RefreshCcw, ShieldCheck, Sparkles, Star, Truck, Video, Check, Loader2 } from 'lucide-react';
import { PRODUCTS } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import { useAddToCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
const heroImage = '/images/hp-hero-1.png';
const heroImageTwo = '/images/hp-hero-2.png';

gsap.registerPlugin(ScrollTrigger);

/* ─── Scroll-reveal wrapper ───────────────────────────────────────────── */
function Reveal({
  children,
  className = '',
  delay = 0,
  y = 30,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.fromTo(
      el,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      },
    );
  }, [delay, y]);

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}

/* ─── Parallax section bg ─────────────────────────────────────────────── */
function ParallaxBg({ src, className = '' }: { src: string; className?: string }) {
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.fromTo(
      el,
      { y: '-8%' },
      {
        y: '8%',
        ease: 'none',
        scrollTrigger: {
          trigger: el.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      },
    );
  }, []);

  return (
    <img
      ref={ref}
      src={src}
      alt=""
      className={`absolute inset-0 w-full h-full object-cover will-change-transform ${className}`}
      aria-hidden
      loading="lazy"
    />
  );
}

/* ─── Home ────────────────────────────────────────────────────────────── */

const DEFAULT_COLLECTIONS = [
  {
    name: 'Roman Collection',
    href: '/shop?collection=roman',
    description: 'Handcrafted Roman-inspired armor, helmets, shields, and accessories inspired by the legendary Roman era.',
    image: '/images/round-shields.png',
  },
  {
    name: 'Viking Collection',
    href: '/shop?collection=viking',
    description: 'Viking-inspired armor, helmets, chainmail, and accessories crafted for collectors, reenactors, and enthusiasts.',
    image: '/images/viking-helmet.png',
  },
  {
    name: 'Templar Collection',
    href: '/shop?collection=templar',
    description: 'Medieval Templar-inspired armor, helmets, chainmail, and accessories inspired by the legendary Knights Templar.',
    image: '/images/tamplar-crusader-shields.png',
  },
  {
    name: 'Fantasy Collection',
    href: '/shop?collection=fantasy',
    description: 'Enter a world of legendary warriors with handcrafted fantasy armor, costumes, helmets, and accessories.',
    image: '/images/arm-armor.png',
  },
  {
    name: "Women's Armor Collection",
    href: '/shop?collection=womens-armor',
    description: 'Handcrafted armor, chainmail, and medieval accessories designed for women, cosplay, LARP, and historical-inspired looks.',
    image: '/images/leather-breastplates.png',
  },
  {
    name: 'LARP & Cosplay Collection',
    href: '/shop?collection=larp',
    description: 'Handcrafted armor, costumes, helmets, and accessories for LARP, cosplay, festivals, and fantasy events.',
    image: '/images/axes.png',
  },
  {
    name: 'Cinematic & Character-Inspired Collection',
    href: '/shop?collection=movie-replicas',
    description: 'Explore cinematic and character-inspired armor, helmets, and costume pieces crafted for collectors and enthusiasts.',
    image: '/images/full-body-armor.png',
  },
];

const DEFAULT_MATERIALS = [
  { name: 'Iron & Steel', image: '/images/arm-armor.png', description: 'Strong and durable metals used to create authentic armor, weapons, and historical-inspired pieces.' },
  { name: 'Stainless Steel', image: '/images/full-body-armor.png', description: 'Corrosion-resistant and durable stainless steel, ideal for long-lasting armor and collectible pieces.' },
  { name: 'Lightweight Aluminium', image: '/images/viking-helmet.png', description: 'Lightweight aluminium designed for comfortable wear while maintaining the look and character of traditional armor.' },
  { name: 'Genuine Leather', image: '/images/leather-breastplates.png', description: 'Premium genuine leather used for armor straps, belts, accessories, and handcrafted details.' },
  { name: 'Natural Cotton', image: '/images/gambeson.png', description: 'Natural cotton fabrics used for comfortable garments, costume elements, padding, and historical-inspired designs.' },
  { name: 'Antique Brass', image: '/images/round-shields.png', description: 'Antique brass accents and fittings that add an authentic vintage and historical character to each creation.' },
];

const DEFAULT_REALMS = [
  { name: 'HISTORICAL', description: 'Authentic-inspired pieces from legendary eras and civilizations.', href: '/shop?realm=historical', badge: 'Legacy', stripe: 'bg-[#b98d46]', image: '/images/hp-hero-1.png' },
  { name: 'ROMAN', description: 'Armor, helmets, shields, and accessories inspired by ancient Rome.', href: '/shop?realm=roman', badge: 'Imperium', stripe: 'bg-[#7b6d59]', image: '/images/full-body-armor.png' },
  { name: 'VIKING', description: 'Norse-inspired armor, chainmail, helmets, and accessories.', href: '/shop?realm=viking', badge: 'Valhalla', stripe: 'bg-[#5f6c75]', image: '/images/viking-helmet.png' },
  { name: 'TEMPLAR', description: 'Medieval knightly armor and accessories inspired by the Knights Templar.', href: '/shop?realm=templar', badge: 'Crusade', stripe: 'bg-[#9e765b]', image: '/images/arm-armor.png' },
  { name: 'FANTASY', description: 'Legendary armor and creations inspired by mythical worlds and warriors.', href: '/shop?realm=fantasy', badge: 'Mythic', stripe: 'bg-[#7c678a]', image: '/images/hp-stl-1.png' },
  { name: "WOMEN'S ARMOR", description: 'Handcrafted armor and medieval pieces designed for women.', href: '/shop?realm=womens-armor', badge: 'Crafted', stripe: 'bg-[#9d7278]', image: '/images/hp-stl-2.png' },
  { name: 'LARP & COSPLAY', description: 'Armor, costumes, helmets, and accessories for immersive characters and events.', href: '/shop?realm=larp-cosplay', badge: 'Stage', stripe: 'bg-[#5f7b7d]', image: '/images/hp-stl-3.png' },
  { name: 'CINEMATIC & CHARACTER', description: 'Character-inspired pieces created for collectors, performers, and enthusiasts.', href: '/shop?realm=cinematic-character', badge: 'Screen', stripe: 'bg-[#a55d3f]', image: '/images/hp-stl-4.png' },
];

const DEFAULT_REVIEWS = [
  { name: 'Riya Kapoor', text: 'Beautiful armour, excellent fit, and the team answered every question before shipping.', image: '/images/hp-gram-1.jpg', flag: 'India', verified: true },
  { name: 'Marcus Lee', text: 'Arrived quickly and looks amazing on stage. The chainmail is solid and comfortable.', image: '/images/hp-gram-2.jpg', flag: 'USA', verified: true },
  { name: 'Elena Schmidt', text: 'A gorgeous replica for my medieval wedding photos. Gorgeous finish and excellent quality.', image: '/images/hp-gram-3.jpg', flag: 'Germany', verified: true },
];

const DEFAULT_PILLARS = [
  { icon: Award, label: '10+ Years' },
  { icon: Star, label: '1000+ Products' },
  { icon: Globe, label: '25+ Countries' },
  { icon: Sparkles, label: 'Handmade' },
  { icon: ShieldCheck, label: 'Premium Steel' },
  { icon: Lock, label: 'Secure Checkout' },
];

const Home = () => {
  const [cms, setCms] = useState<any>(null);
  const [allProducts, setAllProducts] = useState(PRODUCTS);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    fetch('/api/homepage')
      .then((r) => r.json())
      .then((data) => setCms(data))
      .catch(() => { });

    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.products || []);
        if (Array.isArray(list) && list.length > 0) {
          setAllProducts(list);
        }
      })
      .catch(() => { });
  }, []);

  // 1. Dynamic Hero Slides
  const heroSlides = cms?.hero?.slides || [
    {
      image: heroImage,
      headline: 'Crafted for history.',
      subtitle: 'Discover museum-worthy armor, chainmail, leather goods, and historical costumes made by master artisans.',
      ctaText: 'Explore the collection →',
      ctaLink: '/shop',
    },
    {
      image: heroImageTwo,
      headline: 'Authentic Medieval Craft.',
      subtitle: 'Handcrafted functional armor, helmets, shields, and historical equipment for reenactors and collectors worldwide.',
      ctaText: 'Shop New Arrivals →',
      ctaLink: '/shop?badge=new',
    },
  ];

  // 2. Dynamic New Arrivals
  const newArrivals = (() => {
    if (cms?.newArrivals?.mode === 'manual' && Array.isArray(cms?.newArrivals?.productIds) && cms.newArrivals.productIds.length > 0) {
      const selected = cms.newArrivals.productIds
        .map((id: string) => allProducts.find((p) => String(p.id) === String(id)))
        .filter(Boolean) as typeof allProducts;
      if (selected.length > 0) return selected;
    }
    const autoNew = allProducts.filter((p) => (p.badge || '').toLowerCase() === 'new');
    return autoNew.length > 0 ? autoNew : allProducts.slice(0, 8);
  })();
  const displayArrivals = newArrivals;
  const scrollingArrivals = displayArrivals.length > 0 ? [...displayArrivals, ...displayArrivals] : [];

  // 3. Dynamic Top Selling
  const bestSellers = (() => {
    if (cms?.topSelling?.mode === 'manual' && Array.isArray(cms?.topSelling?.productIds) && cms.topSelling.productIds.length > 0) {
      const selected = cms.topSelling.productIds
        .map((id: string) => allProducts.find((p) => String(p.id) === String(id)))
        .filter(Boolean) as typeof allProducts;
      if (selected.length > 0) return selected;
    }
    const topItems = allProducts.filter((p) => (p.badge || '').toLowerCase().includes('top') || (p.badge || '').toLowerCase().includes('best'));
    return topItems.length > 0 ? topItems.slice(0, 6) : allProducts.slice(0, 6);
  })();

  // 4. Featured Collections & Categories
  const featuredCollections = cms?.featuredCollections?.collections || DEFAULT_COLLECTIONS;
  const materialCards = cms?.shopByMaterial?.materials || DEFAULT_MATERIALS;
  const realmCards = cms?.shopByRealm?.realms || DEFAULT_REALMS;
  const whyChoose = DEFAULT_PILLARS;
  const customerReviews = cms?.customerReviews?.reviews || DEFAULT_REVIEWS;

  const zafexCollection = cms?.zafexCollection?.items || [
    { name: 'MEDIEVAL CLOTHING', img: '/images/hp-stl-main.png', href: '/shop?category=medieval-clothing' },
    { name: 'GAMBESONS', img: '/images/gambeson.png', href: '/shop?category=gambesons' },
    { name: 'MEDIEVAL HELMETS', img: '/images/viking-helmet.png', href: '/shop?category=medieval-helmets' },
    { name: 'PLATE ARMOR', img: '/images/full-body-armor.png', href: '/shop?category=plate-armor' },
    { name: 'LEATHER ARMOR', img: '/images/leather-breastplates.png', href: '/shop?category=leather-armor' },
    { name: 'SHIELDS', img: '/images/round-shields.png', href: '/shop?category=shields' },
    { name: 'WEAPONS', img: '/images/axes.png', href: '/shop?category=weapons' },
    { name: 'ACCESSORIES', img: '/images/hp-stl-4.png', href: '/shop?category=accessories' },
  ];

  // 5. Lookbook Items
  const lookbookProductIds: string[] = cms?.shopTheLook?.productIds || ['pa-1', 'hm-6', 'hm-3', 'ac-1'];
  const lookbookProducts = lookbookProductIds.map((id) => {
    const found = allProducts.find((p) => p.id === id);
    if (found) {
      return { id: found.id, name: found.name, price: found.price, img: found.image, link: `/shop/${found.id}` };
    }
    return { id, name: 'Artisan Armor Item', price: 12000, img: '/images/breastplates.png', link: `/shop/${id}` };
  });

  const [heroIndex, setHeroIndex] = useState(0);
  const [instaImages, setInstaImages] = useState(
    cms?.instagramGrid?.images || [
      '/images/hp-gram-1.jpg',
      '/images/hp-gram-2.jpg',
      '/images/hp-gram-3.jpg',
      '/images/hp-gram-4.jpg',
      '/images/hp-gram-5.jpg',
      '/images/hp-gram-6.jpg',
      '/images/hp-gram-7.jpg',
    ]
  );

  const { isLoggedIn } = useAuth();
  const [, setLocation] = useLocation();
  const addToCartMut = useAddToCart();
  const { toast } = useToast();
  const [addingId, setAddingId] = useState<string | null>(null);

  const handleAddLookbookItem = async (item: { id: string; name: string }) => {
    if (!isLoggedIn) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to add items to your cart.',
      });
      setLocation('/login');
      return;
    }
    setAddingId(item.id);
    try {
      await addToCartMut.mutateAsync({ productId: item.id, quantity: 1 });
      toast({
        title: 'Added to Cart!',
        description: `${item.name} has been added to your cart.`,
      });
    } catch (err: unknown) {
      toast({
        title: 'Could not add to cart',
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setTimeout(() => setAddingId(null), 1200);
    }
  };

  useEffect(() => {
    const interval = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroSlides.length);
    }, 6500);
    return () => window.clearInterval(interval);
  }, [heroSlides.length]);

  const activeSlide = heroSlides[heroIndex] || heroSlides[0];

  return (
    <div className="flex flex-col w-full min-h-[100dvh] bg-[#f5f0e8]">


      {/* ── HERO IMAGE ── */}
      <section className="relative flex min-h-[430px] w-full items-center overflow-hidden bg-[#111] sm:min-h-[540px] lg:min-h-[620px]">
        {heroSlides.map((slide: any, index: number) => (
          <img
            key={index}
            src={slide.image}
            alt="Zafex medieval collectibles museum"
            className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-[1400ms] ${heroIndex === index ? 'opacity-100' : 'opacity-0'
              }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-[#080b0d]/90 via-[#080b0d]/45 to-transparent" />
        <div className="relative z-10 max-w-[560px] px-8 py-20 sm:px-16 lg:px-24">
          <h1 className="mt-5 font-serif text-[clamp(38px,5vw,72px)] font-semibold uppercase leading-[0.95] tracking-[2px] text-[#f5f0e8]">
            {activeSlide.headline}
          </h1>
          <p className="mt-6 max-w-[390px] font-sans text-[15px] leading-relaxed text-[#f5f0e8]/80">
            {activeSlide.subtitle}
          </p>
          <Link
            href={activeSlide.ctaLink || '/shop'}
            className="mt-8 inline-block bg-[#c6a767] px-8 py-4 font-serif text-[11px] font-bold uppercase tracking-[2px] text-[#171713] transition-colors hover:bg-[#f2d49a]"
          >
            {activeSlide.ctaText || 'Explore the collection →'}
          </Link>
        </div>
        <div className="absolute bottom-7 right-8 z-10 flex items-center gap-2 sm:right-16 lg:right-24">
          {heroSlides.map((_: any, index: number) => (
            <button
              key={index}
              type="button"
              aria-label={`Show hero image ${index + 1}`}
              onClick={() => setHeroIndex(index)}
              className={`h-1 transition-all duration-300 ${heroIndex === index ? 'w-10 bg-[#d4af37]' : 'w-5 bg-white/50 hover:bg-white'}`}
            />
          ))}
        </div>
      </section>

      {/* ── NEW ARRIVALS ── */}
      <section className="py-[80px] bg-[#f5f0e8]">
        <div className="w-full max-w-[1680px] mx-auto px-5">
          <Reveal className="mb-12">
            <h2 className="font-serif text-[48px] font-bold text-[#1a1a18] uppercase leading-none">
              {cms?.newArrivals?.title || 'NEW ARRIVALS'}
            </h2>
          </Reveal>

          <div className="group/new-arrivals relative -mx-5 overflow-hidden">
            <div className="new-arrivals-track flex w-max gap-[18px] px-5 group-hover/new-arrivals:[animation-play-state:paused]">
              {scrollingArrivals.map((product, i) => (
                <div key={`${product.id}-${i}`} className="w-[220px] shrink-0 sm:w-[270px] lg:w-[300px]">
                  <ProductCard product={product} index={i % displayArrivals.length} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TOP SELLING ── */}
      <section className="py-[80px] bg-white">
        <div className="w-full max-w-[1680px] mx-auto px-5">
          <div className="mb-10">
            <h2 className="font-serif text-[48px] font-bold text-[#1a1a18] uppercase leading-none">
              {cms?.topSelling?.title || 'Top Selling'}
            </h2>
          </div>
          <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
            {bestSellers.map((product) => (
              <div key={product.id} className="rounded-none border border-[#ddd] bg-[#f8f1e6] p-5 transition-shadow hover:shadow-none">
                <Link href={`/shop/${product.id}`} className="block overflow-hidden rounded-none bg-[#1a1a18] mb-5">
                  <img src={product.image} alt={product.name} className="h-[260px] w-full object-cover transition-transform duration-500 hover:scale-105" loading="lazy" />
                </Link>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[12px] uppercase tracking-[1.5px] text-[#9c1c1c]">{product.badge ? product.badge.toUpperCase() : 'Popular'}</span>
                    <span className="text-[13px] font-semibold text-[#1a1a18]">{formatPrice(product.price)}</span>
                  </div>
                  <h3 className="font-serif text-[18px] font-semibold text-[#1a1a18] leading-snug line-clamp-2">{product.name}</h3>
                  <p className="text-[13px] leading-relaxed text-[#4f4f4f] line-clamp-3">{product.desc ?? 'Premium armour crafted for collectors and live performance.'}</p>
                  <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[1px] text-[#1a1a18]">
                    <span className="rounded-full bg-[#fff4de] px-3 py-1">Handmade</span>
                    <span className="rounded-full bg-[#fff4de] px-3 py-1">Free Shipping</span>
                    <span className="rounded-full bg-[#fff4de] px-3 py-1">Ships in 3 Days</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED COLLECTIONS ── */}
      <section className="py-[100px] bg-[#F5F1E8]">
        <div className="w-full max-w-[1680px] mx-auto px-5">
          <Reveal className="mb-16 text-center">
            <h2 className="font-serif text-[44px] font-semibold uppercase tracking-[0.28em] text-[#171717] leading-tight">
              {cms?.featuredCollections?.title || 'EXPLORE ZAFEX COLLECTIONS'}
            </h2>
            <div className="mx-auto mt-5 h-[1px] w-[72px] bg-[#b79d6b] opacity-80"></div>
            <p className="mx-auto mt-8 max-w-[760px] font-sans text-[16px] leading-[1.85] text-[#3f3f3f]">
              {cms?.featuredCollections?.subtitle ||
                'Discover handcrafted armor, medieval gear, historical pieces, and fantasy creations inspired by legendary eras and worlds.'}
            </p>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featuredCollections.map((collection: any) => (
              <Link
                key={collection.name}
                href={collection.href}
                className="group mx-auto flex h-full w-full max-w-[400px] flex-col overflow-hidden rounded-none border border-[#d8d0c2] bg-[#f9f5f0] shadow-none transition duration-300 hover:-translate-y-0 hover:shadow-none hover:border-[#b79d6b]"
              >
                <div className="overflow-hidden bg-[#f9f3e7]">
                  <img
                    src={collection.image}
                    alt={collection.name}
                    className="h-[240px] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between px-6 py-7">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-serif text-[22px] font-semibold uppercase tracking-[0.18em] text-[#171717] leading-tight">
                        {collection.name}
                      </h3>
                      <div className="mt-4 h-[1px] w-[56px] bg-[#b79d6b] opacity-80"></div>
                    </div>
                    <p className="font-sans text-[15px] leading-[1.8] text-[#3b3b3b]">
                      {collection.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SHOP BY MATERIAL ── */}
      <section className="py-[80px] bg-white">
        <div className="w-full max-w-[1680px] mx-auto px-5">
          <Reveal className="mb-12 text-center">
            <span className="font-serif text-[11px] text-[#d4af37] tracking-[3px] uppercase block">
              {cms?.shopByMaterial?.badge || 'MATERIAL SELECTION'}
            </span>
            <h2 className="font-serif text-[42px] font-bold text-[#1a1a18] mt-2 uppercase leading-none">
              {cms?.shopByMaterial?.title || 'THE ART OF MATERIALS'}
            </h2>
            <p className="mx-auto mt-5 max-w-[760px] font-sans text-[15px] leading-[1.8] text-[#3f3f3f]">
              {cms?.shopByMaterial?.subtitle ||
                'Every ZafEx creation begins with carefully selected materials, shaped by skilled hands and inspired by history.'}
            </p>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {materialCards.map((material: any) => (
              <Link
                key={material.name}
                href={`/shop?material=${material.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`}
                className="group overflow-hidden rounded-[24px] border border-[#d4cfc7] bg-white shadow-[0_14px_30px_rgba(22,22,22,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(22,22,22,0.1)]"
              >
                <div className="h-[200px] overflow-hidden bg-[#f7f1e8]">
                  <img
                    src={material.image}
                    alt={material.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                </div>
                <div className="px-6 py-6">
                  <h3 className="font-serif text-[20px] font-semibold uppercase tracking-[0.15em] text-[#171717] leading-tight">
                    {material.name}
                  </h3>
                  <p className="mt-4 text-[14px] leading-[1.8] text-[#4f4f4f]">
                    {material.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SHOP BY REALM ── */}
      <section className="py-[80px] bg-[#f5f0e8]">
        <div className="w-full max-w-[1680px] mx-auto px-5">
          <Reveal className="mb-12 text-center">
            <span className="font-serif text-[11px] text-[#d4af37] tracking-[3px] uppercase block">
              {cms?.shopByRealm?.badge || 'REALMS OF ZAFEX'}
            </span>
            <h2 className="font-serif text-[42px] font-bold text-[#1a1a18] mt-2 uppercase leading-none">
              {cms?.shopByRealm?.title || 'SHOP BY REALM'}
            </h2>
            <p className="mx-auto mt-4 max-w-[760px] font-sans text-[14px] leading-[1.8] text-[#6b6b6b]">
              {cms?.shopByRealm?.subtitle ||
                'Explore handcrafted creations inspired by history, legendary warriors, fantasy worlds, and unforgettable characters.'}
            </p>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {realmCards.map((realm: any) => (
              <Link
                key={realm.name}
                href={realm.href}
                className="group overflow-hidden rounded-none border border-[#b58b62] bg-[#f5ecdf] text-left transition-all duration-300 hover:-translate-y-0 hover:shadow-none"
              >
                <div className={`h-[4px] w-full ${realm.stripe || 'bg-[#b98d46]'}`} />
                <div className="flex flex-col">
                  <div className="relative h-[250px] overflow-hidden bg-[#efe5d3]">
                    <img
                      src={realm.image}
                      alt={realm.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex min-h-[150px] flex-col gap-2 px-3 pb-3 pt-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full border border-[#b58b62]/60 bg-white/80 px-1.5 py-0.5 text-[6px] font-semibold uppercase tracking-[2px] text-[#1a1a18]">
                        {realm.badge}
                      </span>
                      <span className="text-[6.5px] font-semibold uppercase tracking-[2px] text-[#5d4f41]">
                        View →
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <span className="block font-serif text-[17px] font-semibold uppercase tracking-[0.12em] text-[#171717] leading-[1.2]">
                        {realm.name}
                      </span>
                      <p className="text-[11px] leading-[1.5] text-[#4a433d]">
                        {realm.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE ZAFEX ── */}
      <section className="py-[100px] bg-[#1a1a18] text-white">
        <div className="w-full max-w-[1680px] mx-auto px-5">
          <Reveal className="mb-12 text-center">
            <span className="font-serif text-[11px] text-[#d4af37] tracking-[3px] uppercase block">
              {cms?.whyChoose?.badge || 'WHY ZAFEX'}
            </span>
            <h2 className="font-serif text-[42px] font-bold mt-2 uppercase leading-none">
              {cms?.whyChoose?.title || 'Why Choose ZAFEX'}
            </h2>
            <p className="font-sans text-[14px] text-[#d4af37]/80 max-w-[760px] mx-auto mt-4">
              {cms?.whyChoose?.subtitle ||
                'Trusted by reenactors, performers, and collectors for premium materials, authentic detail, and reliable delivery.'}
            </p>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {(cms?.whyChoose?.pillars || whyChoose).map((item: any, idx: number) => {
              const Icon = whyChoose[idx % whyChoose.length]?.icon || Award;
              return (
                <Reveal key={idx} className="rounded-[24px] border border-white/10 bg-[#0f0f0f]/80 px-6 py-8 text-center" delay={0.02}>
                  <Icon size={32} className="mx-auto text-[#d4af37] mb-4" />
                  <div className="font-serif text-[20px] font-semibold text-white">{item.label}</div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CUSTOMER REVIEWS ── */}
      <section className="py-[100px] bg-[#f5f0e8]">
        <div className="w-full max-w-[1680px] mx-auto px-5">
          <Reveal className="mb-12 text-center">
            <h2 className="font-serif text-[42px] font-bold text-[#1a1a18] mt-2 uppercase leading-none">
              {cms?.customerReviews?.title || 'The ZafEx Experience'}
            </h2>
          </Reveal>

          <div className="grid gap-6 lg:grid-cols-3">
            {customerReviews.map((review: any, i: number) => (
              <Reveal key={i} delay={i * 0.05} className="rounded-[28px] border border-[#d4cfc7] bg-white p-6 shadow-sm">
                <div className="relative overflow-hidden rounded-[24px] mb-5 h-[240px] bg-[#111]">
                  <img src={review.image} alt={review.name} className="h-full w-full object-cover" loading="lazy" />
                  {review.video && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <PlayCircle size={48} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <div className="font-serif text-[15px] font-semibold text-[#1a1a18]">{review.name}</div>
                    <div className="font-sans text-[12px] uppercase tracking-[1px] text-[#6b6b6b]">{review.flag}</div>
                  </div>
                  {review.verified && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#eff6ec] px-3 py-1 text-[11px] font-semibold uppercase tracking-[1px] text-[#1a1a18]">
                      <CheckCircle2 size={14} className="text-[#1a1a18]" /> Verified Purchase
                    </span>
                  )}
                </div>
                <p className="font-sans text-[14px] leading-relaxed text-[#4f4f4f]">“{review.text}”</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE ZAFEX COLLECTION ── */}
      <section className="py-[60px] bg-[#f5f0e8]">
        <div className="w-full max-w-[1680px] mx-auto px-5">
          <Reveal className="mb-6 text-center">
            <h2 className="font-serif text-[38px] font-bold uppercase leading-none">
              {cms?.zafexCollection?.title || 'THE ZAFEX COLLECTION'}
            </h2>
          </Reveal>
        </div>
      </section>

      <div className="w-full overflow-x-auto -mx-5">
        <div className="flex w-max gap-[18px] px-5">
          {zafexCollection.map((c: any, i: number) => (
            <Link key={i} href={c.href} className="group block min-w-[300px] sm:min-w-[360px] lg:min-w-[420px] h-[240px] sm:h-[300px] lg:h-[360px] overflow-hidden">
              <div className="relative h-full w-full">
                <img src={c.img} alt={c.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" loading="lazy" />
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute left-6 bottom-6 z-10">
                  <h3 className="font-serif text-[18px] sm:text-[20px] lg:text-[22px] font-bold uppercase text-white tracking-[0.12em]">{c.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── SHOP THE LOOK ── */}
      <section className="py-[80px] bg-[#f5f0e8]">
        <div className="w-full max-w-[1680px] mx-auto px-5">
          <Reveal className="mb-12 text-center">
            <span className="font-serif text-[11px] text-[#d4af37] tracking-[3px] uppercase block">
              {cms?.shopTheLook?.badge || 'COMPLETE THE SET'}
            </span>
            <h2 className="font-serif text-[42px] font-bold text-[#1a1a18] mt-2 uppercase leading-none">
              {cms?.shopTheLook?.title || 'SHOP THE LOOK'}
            </h2>
            <div className="w-[40px] h-[3px] bg-[#9c1c1c] mx-auto mt-4 mb-3" />
            <p className="font-sans text-[14px] text-[#6b6b6b]">
              {cms?.shopTheLook?.subtitle ||
                "Get the complete warrior's kit assembled by our LARP and reenactment specialists"}
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="flex flex-col lg:flex-row shadow-xl">
              {/* Left Image */}
              <div className="lg:w-[55%] relative bg-[#222] overflow-hidden">
                <img
                  src={cms?.shopTheLook?.mainImage || '/images/hp-stl-main.png'}
                  alt="Lookbook"
                  className="w-full h-[600px] lg:h-full object-cover object-center"
                  loading="lazy"
                />
                {[
                  { top: '20%', left: '45%', delay: '0s' },
                  { top: '40%', left: '30%', delay: '0.5s' },
                  { top: '60%', left: '40%', delay: '1s' },
                ].map(({ top, left, delay }, i) => (
                  <div
                    key={i}
                    className="absolute w-6 h-6 rounded-full border-2 border-[#9c1c1c] bg-[#9c1c1c]/30 cursor-pointer hover:bg-[#9c1c1c]/60 transition-colors animate-pulse"
                    style={{ top, left, animationDelay: delay }}
                  />
                ))}
              </div>

              {/* Right Panel */}
              <div className="lg:w-[45%] bg-[#f5f0e8] p-8 flex flex-col justify-center border-l-0 lg:border-l border-[#d4cfc7]">
                <span className="font-serif text-[11px] text-[#d4af37] tracking-[2px] uppercase block mb-2">
                  {cms?.shopTheLook?.featuredAttireBadge || 'FEATURED ATTIRE'}
                </span>
                <h3 className="font-serif text-[28px] font-bold text-[#1a1a18] uppercase leading-tight mb-4">
                  {cms?.shopTheLook?.featuredAttireTitle || 'The Gothic Knight Commander'}
                </h3>
                <p className="font-sans text-[14px] text-[#4a4a4a] mb-8 leading-relaxed">
                  {cms?.shopTheLook?.featuredAttireDesc ||
                    'A formidable compilation of hand-crafted steel, chainmail, and supple leather, built to project authority and withstand the demands of reenactment and display.'}
                </p>

                <div className="flex flex-col gap-3">
                  {lookbookProducts.map((item, i) => {
                    const isAdding = addingId === item.id;
                    return (
                      <div key={i} className="flex items-center gap-4 bg-white p-2 group hover:shadow-md transition-shadow">
                        <img src={item.img} alt={item.name} className="w-16 h-16 object-cover bg-[#ede9e3] flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <Link href={item.link} className="font-serif text-[13px] text-[#1a1a18] font-bold block mb-1 group-hover:text-[#d4af37] transition-colors truncate">
                            {item.name}
                          </Link>
                          <span className="font-sans text-[12px] text-[#d4af37] font-semibold">
                            ₹{item.price.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddLookbookItem(item)}
                          disabled={isAdding}
                          className={`flex-shrink-0 font-serif text-[10px] uppercase tracking-[1px] px-3.5 py-2 transition-all cursor-pointer flex items-center gap-1 ${isAdding
                              ? 'bg-emerald-700 text-white'
                              : 'bg-[#1a1a18] text-white hover:bg-[#d4af37] hover:text-[#1a1208]'
                            }`}
                        >
                          {isAdding ? (
                            <>
                              <Check size={11} strokeWidth={2.5} /> Added
                            </>
                          ) : (
                            '+ ADD'
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── ABOUT ZAFEX ── */}
      <section className="bg-[#f5f0e8] px-5 py-[90px] sm:px-10 lg:py-[120px]">
        <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <Reveal>
            <span className="font-serif text-[11px] font-semibold uppercase tracking-[3px] text-[#b58a16]">
              {cms?.aboutZafex?.badge || 'THE ZAFEX LEGACY'}
            </span>
            <h2 className="mt-5 max-w-[620px] font-serif text-[40px] font-medium leading-[1.05] text-[#1a1208] sm:text-[52px]">
              {cms?.aboutZafex?.title || 'About Zafex Collectibles'}
            </h2>
            <p className="mt-8 max-w-[620px] font-sans text-[15px] leading-[1.75] text-[#5b554d]">
              {cms?.aboutZafex?.paragraph1 ||
                'We are dedicated artisans specializing in the creation of authentic, heirloom-quality medieval armor, functional historical equipment, and unique collectibles. Every piece that leaves our workshop is meticulously handcrafted with respect for historical accuracy and an uncompromising commitment to quality.'}
            </p>
            <p className="mt-6 max-w-[620px] font-sans text-[15px] leading-[1.75] text-[#5b554d]">
              {cms?.aboutZafex?.paragraph2 ||
                'From the resonant ring of our chainmail to the sturdy protection of our leather armor, we equip reenactors, theater productions, and history enthusiasts worldwide.'}
            </p>
            <Link
              href={cms?.aboutZafex?.buttonLink || '/about'}
              className="mt-8 inline-flex items-center border-b-2 border-[#1a1a18] pb-2 font-serif text-[12px] font-bold uppercase tracking-[2px] text-[#1a1a18] transition-colors hover:border-[#b58a16] hover:text-[#b58a16]"
            >
              {cms?.aboutZafex?.buttonText || 'Learn More'} <span className="ml-2 text-[16px] leading-none">→</span>
            </Link>
          </Reveal>

          <Reveal delay={0.12} className="relative overflow-hidden rounded-[32px] bg-[#1a1a18] shadow-xl">
            <img
              src={cms?.aboutZafex?.image || '/images/hp-stl-main.png'}
              alt="Zafex artisan armor"
              className="w-full h-full object-cover min-h-[360px]"
              loading="lazy"
            />
          </Reveal>
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <section className="py-[48px] bg-white border-y border-[#d4cfc7]">
        <div className="w-full max-w-[1680px] mx-auto px-5">
          <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#d4cfc7]">
            {(cms?.trustStrip?.items || [
              { title: 'NO ORDER BACKLOG', desc: 'We dispatch active stock immediately. No long waiting queues.' },
              { title: 'WORLDWIDE SHIPPING', desc: 'Expedited courier services right to your doorstep, globally.' },
              { title: '100% SATISFIED', desc: "Easy size returns and refunds if your order doesn't fit or impress." },
              { title: 'SECURE PAYMENTS', desc: 'Pay via Razorpay, Cards, NetBanking or UPI – safe and encrypted.' },
            ]).map((trust: any, i: number) => {
              const icons = [RefreshCcw, Globe, CheckCircle2, ShieldCheck];
              const Icon = icons[i % icons.length];
              return (
                <Reveal key={i} delay={i * 0.08} className="flex flex-col items-center text-center px-6 py-6 md:py-0">
                  <Icon size={28} className="text-[#d4af37] mb-4" strokeWidth={1.5} />
                  <h4 className="font-serif text-[13px] font-bold text-[#1a1a18] uppercase tracking-[2px] mb-2">{trust.title}</h4>
                  <p className="font-sans text-[13px] text-[#6b6b6b] leading-relaxed">{trust.desc}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── INSTAGRAM ── */}
      <section className="py-[80px] bg-[#f5f0e8] overflow-hidden">
        <div className="w-full max-w-[1680px] mx-auto px-5 mb-8">
          <Reveal>
            <a
              href="https://www.instagram.com/zafex_collectibles?igsh=ZjA2aXQzanY1d205&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block group"
            >
              <span className="font-serif text-[11px] text-[#d4af37] tracking-[3px] uppercase block">
                {cms?.instagramGrid?.badge || 'SOCIAL'}
              </span>
              <h2 className="font-serif text-[42px] font-bold text-[#1a1a18] mt-2 uppercase leading-none group-hover:text-[#d4af37] transition-colors">
                {cms?.instagramGrid?.title || 'FOLLOW US ON INSTAGRAM'}
              </h2>
              <div className="w-[40px] h-[3px] bg-[#9c1c1c] mt-4" />
            </a>
          </Reveal>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 w-full">
          {(cms?.instagramGrid?.images || instaImages).map((img: string, i: number) => (
            <a
              href="https://www.instagram.com/zafex_collectibles?igsh=ZjA2aXQzanY1d205&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              key={i}
              className="block relative group aspect-square bg-[#ddd] overflow-hidden cursor-pointer"
            >
              <img
                src={img}
                alt="Instagram Post"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-[#1a0d00]/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="text-white w-7 h-7" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="py-[80px] bg-[#f5f0e8] border-t border-[#d4cfc7]">
        <div className="w-full max-w-[600px] mx-auto px-4 text-center">
          <Reveal>
            <span className="font-serif text-[11px] text-[#d4af37] tracking-[3px] uppercase block">
              {cms?.newsletter?.badge || 'STAY UPDATED'}
            </span>
            <h2 className="font-serif text-[42px] font-bold text-[#1a1a18] mt-2 uppercase leading-none mb-6">
              {cms?.newsletter?.title || 'JOIN THE ZAFEX CIRCLE'}
            </h2>
            <p className="font-sans text-[14px] text-[#6b6b6b] mb-8">
              {cms?.newsletter?.subtitle ||
                "Subscribe for early access to new arrivals, exclusive collector's discounts, and stories from the world of historical armour and LARP."}
            </p>
            <form className="flex w-full shadow-sm" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 h-[48px] bg-white border border-[#d4cfc7] border-r-0 px-4 font-sans text-[14px] text-[#1a1a18] placeholder:text-[#a39f97] focus:outline-none focus:border-[#d4af37]"
                required
              />
              <button
                type="submit"
                className="h-[48px] bg-[#1a1a18] text-white font-serif text-[12px] uppercase font-bold tracking-[2px] px-8 hover:bg-[#d4af37] hover:text-[#1a1a18] transition-colors whitespace-nowrap"
              >
                {cms?.newsletter?.buttonText || 'SUBSCRIBE'}
              </button>
            </form>
          </Reveal>
        </div>
      </section>
    </div>
  );
};

export default Home;
