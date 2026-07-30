import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'wouter';
import { ChevronLeft, ChevronRight, CheckCircle2, Globe, RefreshCcw, ShieldCheck, Camera } from 'lucide-react';
import { PRODUCTS } from '@/data/products';
import ProductCard from '@/components/ProductCard';
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

const Home = () => {
  const newArrivals = PRODUCTS.filter((p) => p.badge === 'new');
  const scrollingArrivals = [...newArrivals, ...newArrivals];
  const [heroIndex, setHeroIndex] = useState(0);
  const heroImages = [heroImage, heroImageTwo];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroImages.length);
    }, 6500);
    return () => window.clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="flex flex-col w-full min-h-[100dvh] bg-[#f5f0e8]">

      {/* ── HERO IMAGE ── */}
      <section className="relative flex min-h-[430px] w-full items-center overflow-hidden bg-[#111] sm:min-h-[540px] lg:min-h-[620px]">
        {heroImages.map((image, index) => (
          <img
            key={image}
            src={image}
            alt="Zafex medieval collectibles museum"
            className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-[1400ms] ${
              heroIndex === index ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-[#080b0d]/90 via-[#080b0d]/45 to-transparent" />
        <div className="relative z-10 max-w-[560px] px-8 py-20 sm:px-16 lg:px-24">
          <span className="font-serif text-[11px] uppercase tracking-[4px] text-[#d4af37]">THE ZAFEX COLLECTION</span>
          <h1 className="mt-5 font-serif text-[clamp(38px,5vw,72px)] font-semibold uppercase leading-[0.95] tracking-[2px] text-[#f5f0e8]">
            Crafted for history.
          </h1>
          <p className="mt-6 max-w-[390px] font-sans text-[15px] leading-relaxed text-[#f5f0e8]/80">
            Discover museum-worthy armor, chainmail, leather goods, and historical costumes made by master artisans.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-block bg-[#c6a767] px-8 py-4 font-serif text-[11px] font-bold uppercase tracking-[2px] text-[#171713] transition-colors hover:bg-[#f2d49a]"
          >
            Explore the collection →
          </Link>
        </div>
        <div className="absolute bottom-7 right-8 z-10 flex items-center gap-2 sm:right-16 lg:right-24">
          {heroImages.map((image, index) => (
            <button
              key={image}
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
          <Reveal className="flex items-end justify-between mb-12 flex-wrap gap-6">
            <div>
              <span className="font-serif text-[11px] text-[#d4af37] tracking-[3px] uppercase block">JUST LANDED</span>
              <h2 className="font-serif text-[48px] font-bold text-[#1a1a18] mt-2 uppercase leading-none">NEW ARRIVALS</h2>
              <div className="w-[40px] h-[3px] bg-[#9c1c1c] mt-4 mb-3" />
              <p className="font-sans text-[14px] text-[#6b6b6b]">The latest additions to the Zafex vaults</p>
            </div>
            <Link
              href="/shop?badge=new"
              className="inline-flex shrink-0 items-center border-2 border-[#1a1a18] px-6 py-3 font-serif text-[11px] font-bold uppercase tracking-[2px] text-[#1a1a18] transition-colors hover:border-[#d4af37] hover:bg-[#d4af37] hover:text-[#1a1a18]"
            >
              VIEW ALL NEW →
            </Link>
          </Reveal>

          <div className="group/new-arrivals relative -mx-5 overflow-hidden">
            <div className="new-arrivals-track flex w-max gap-[18px] px-5 group-hover/new-arrivals:[animation-play-state:paused]">
              {scrollingArrivals.map((product, i) => (
                <div key={`${product.id}-${i}`} className="w-[220px] shrink-0 sm:w-[270px] lg:w-[300px]">
                  <ProductCard product={product} index={i % newArrivals.length} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORY BANNERS ── */}
      <section className="grid grid-cols-1 md:grid-cols-4 w-full bg-[#1a1a18]">
        {[
          { name: 'WEAPONRY',    sub: 'Swords, Axes, Bows & Daggers',         img: '/images/hp-cat-weaponry.png',    link: '/shop?cat=weaponry'    },
          { name: 'ARMOUR',      sub: 'Breastplates, Helms & Chainmail',       img: '/images/hp-cat-armour.png',      link: '/shop?cat=armour'      },
          { name: 'CLOTHING',    sub: 'Tabards, Tunics & Cloaks',              img: '/images/hp-cat-clothing.png',    link: '/shop?cat=clothing'    },
          { name: 'ACCESSORIES', sub: 'Belts, Pouches & Jewellery',            img: '/images/hp-cat-accessories.png', link: '/shop?cat=accessories' },
        ].map((cat, i) => (
          <Link key={i} href={cat.link} className="relative h-[400px] group block overflow-hidden">
            <img
              src={cat.img}
              alt={cat.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 will-change-transform"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/35 transition-colors" />
            <div className="absolute bottom-0 left-0 p-6 z-10 w-full translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <h3 className="font-serif font-bold text-[20px] text-white uppercase tracking-[1.5px]">{cat.name}</h3>
              <p className="font-sans text-[12px] text-white/80 mt-1">{cat.sub}</p>
              <div className="w-0 group-hover:w-8 h-[2px] bg-[#d4af37] mt-3 transition-all duration-500" />
            </div>
          </Link>
        ))}
      </section>

      {/* ── SHOP THE LOOK ── */}
      <section className="py-[80px] bg-[#f5f0e8]">
        <div className="w-full max-w-[1680px] mx-auto px-5">
          <Reveal className="mb-12 text-center">
            <span className="font-serif text-[11px] text-[#d4af37] tracking-[3px] uppercase block">COMPLETE THE SET</span>
            <h2 className="font-serif text-[42px] font-bold text-[#1a1a18] mt-2 uppercase leading-none">SHOP THE LOOK</h2>
            <div className="w-[40px] h-[3px] bg-[#9c1c1c] mx-auto mt-4 mb-3" />
            <p className="font-sans text-[14px] text-[#6b6b6b]">
              Get the complete warrior's kit assembled by our LARP and reenactment specialists
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="flex flex-col lg:flex-row shadow-xl">
              {/* Left Image */}
              <div className="lg:w-[55%] relative bg-[#222] overflow-hidden">
                <img
                  src="/images/hp-stl-main.png"
                  alt="Gothic Knight Look"
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
                <span className="font-serif text-[11px] text-[#d4af37] tracking-[2px] uppercase block mb-2">FEATURED ATTIRE</span>
                <h3 className="font-serif text-[28px] font-bold text-[#1a1a18] uppercase leading-tight mb-4">
                  The Gothic Knight Commander
                </h3>
                <p className="font-sans text-[14px] text-[#4a4a4a] mb-8 leading-relaxed">
                  A formidable compilation of hand-crafted steel, chainmail, and supple leather, built to project authority and withstand the demands of reenactment and display.
                </p>

                <div className="flex flex-col gap-3">
                  {[
                    { name: 'Gothic Steel Breastplate',    price: 18500, img: '/images/hp-stl-1.png', link: '/shop/bp-1' },
                    { name: "Knight's Great Helm",         price: 9800,  img: '/images/hp-stl-2.png', link: '/shop/hm-2' },
                    { name: 'Steel Pauldrons – Crusader',  price: 8500,  img: '/images/hp-stl-3.png', link: '/shop/bp-1' },
                    { name: 'Leather Sword Belt',          price: 1800,  img: '/images/hp-stl-4.png', link: '/shop/ac-4' },
                  ].map((item, i) => (
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
                      <button className="flex-shrink-0 bg-[#1a1a18] text-white font-serif text-[10px] uppercase tracking-[1px] px-3 py-2 hover:bg-[#d4af37] hover:text-[#1a1a18] transition-colors">
                        + ADD
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FEATURED COLLECTION (4-col) ── */}
      <section className="py-[80px] bg-white">
        <div className="w-full max-w-[1680px] mx-auto px-5">
          <Reveal className="mb-12">
            <span className="font-serif text-[11px] text-[#d4af37] tracking-[3px] uppercase block">OUR ARSENAL</span>
            <h2 className="font-serif text-[42px] font-bold text-[#1a1a18] mt-2 uppercase leading-none">Featured Collection</h2>
            <div className="w-[40px] h-[3px] bg-[#9c1c1c] mt-4" />
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[18px]">
            {PRODUCTS.slice(0, 8).map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
          <Reveal className="mt-12 text-center" delay={0.1}>
            <Link
              href="/shop"
              className="inline-block bg-[#1a1a18] text-white font-serif text-[12px] uppercase font-bold tracking-[3px] py-4 px-12 hover:bg-[#d4af37] hover:text-[#1a1a18] transition-colors duration-300"
            >
              VIEW ALL PRODUCTS
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── ABOUT ZAFEX ── */}
      <section className="bg-[#f5f0e8] px-5 py-[90px] sm:px-10 lg:py-[120px]">
        <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <Reveal>
            <span className="font-serif text-[11px] font-semibold uppercase tracking-[3px] text-[#b58a16]">
              THE ZAFEX LEGACY
            </span>
            <h2 className="mt-5 max-w-[620px] font-serif text-[40px] font-medium leading-[1.05] text-[#1a1208] sm:text-[52px]">
              About Zafex Collectibles
            </h2>
            <p className="mt-8 max-w-[620px] font-sans text-[15px] leading-[1.75] text-[#5b554d]">
              We are dedicated artisans specializing in the creation of authentic, heirloom-quality medieval armor, functional historical equipment, and unique collectibles. Every piece that leaves our workshop is meticulously handcrafted with respect for historical accuracy and an uncompromising commitment to quality.
            </p>
            <p className="mt-6 max-w-[620px] font-sans text-[15px] leading-[1.75] text-[#5b554d]">
              From the resonant ring of our chainmail to the sturdy protection of our leather armor, we equip reenactors, theater productions, and history enthusiasts worldwide.
            </p>
            <Link
              href="/about"
              className="mt-8 inline-flex items-center border-b-2 border-[#1a1a18] pb-2 font-serif text-[12px] font-bold uppercase tracking-[2px] text-[#1a1a18] transition-colors hover:border-[#b58a16] hover:text-[#b58a16]"
            >
              Learn More <span className="ml-2 text-[16px] leading-none">→</span>
            </Link>
          </Reveal>

          <Reveal delay={0.12} className="grid grid-cols-2 content-center gap-x-8 gap-y-12 sm:gap-x-12">
            {[
              ['1000+', 'Products Handcrafted'],
              ['30+', 'Product Categories'],
              ['25+', 'Countries Served'],
              ['100%', 'Handmade Products'],
              ['10+', 'Years of Experience'],
            ].map(([value, label], index) => (
              <div key={label} className={index === 4 ? 'col-span-2 justify-self-center text-center' : ''}>
                <div className="font-serif text-[42px] font-semibold leading-none text-[#b58a16] sm:text-[50px]">{value}</div>
                <div className="mt-3 font-sans text-[11px] font-bold uppercase tracking-[1.2px] text-[#29251f]">{label}</div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <section className="py-[48px] bg-white border-y border-[#d4cfc7]">
        <div className="w-full max-w-[1680px] mx-auto px-5">
          <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#d4cfc7]">
            {[
              { icon: RefreshCcw,   title: 'NO ORDER BACKLOG',  desc: 'We dispatch active stock immediately. No long waiting queues.'                        },
              { icon: Globe,        title: 'WORLDWIDE SHIPPING', desc: 'Expedited courier services right to your doorstep, globally.'                        },
              { icon: CheckCircle2, title: '100% SATISFIED',     desc: "Easy size returns and refunds if your order doesn't fit or impress."                 },
              { icon: ShieldCheck,  title: 'SECURE PAYMENTS',    desc: 'Pay via Payoneer, PayPal or direct bank transfer – safe and encrypted.'              },
            ].map((trust, i) => (
              <Reveal key={i} delay={i * 0.08} className="flex flex-col items-center text-center px-6 py-6 md:py-0">
                <trust.icon size={28} className="text-[#d4af37] mb-4" strokeWidth={1.5} />
                <h4 className="font-serif text-[13px] font-bold text-[#1a1a18] uppercase tracking-[2px] mb-2">{trust.title}</h4>
                <p className="font-sans text-[13px] text-[#6b6b6b] leading-relaxed">{trust.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── INSTAGRAM ── */}
      <section className="py-[80px] bg-[#f5f0e8] overflow-hidden">
        <div className="w-full max-w-[1680px] mx-auto px-5 mb-8">
          <Reveal className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <span className="font-serif text-[11px] text-[#d4af37] tracking-[3px] uppercase block">SOCIAL</span>
              <h2 className="font-serif text-[42px] font-bold text-[#1a1a18] mt-2 uppercase leading-none">FOLLOW US ON INSTAGRAM</h2>
              <div className="w-[40px] h-[3px] bg-[#9c1c1c] mt-4" />
            </div>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full bg-[#1a1a18] text-white flex items-center justify-center hover:bg-[#d4af37] transition-colors">
                <ChevronLeft size={20} />
              </button>
              <button className="w-10 h-10 rounded-full bg-[#1a1a18] text-white flex items-center justify-center hover:bg-[#d4af37] transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
          </Reveal>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 w-full">
          {[
            '/images/hp-gram-1.jpg',
            '/images/hp-gram-2.jpg',
            '/images/hp-gram-3.jpg',
            '/images/hp-gram-4.jpg',
            '/images/hp-gram-5.jpg',
            '/images/hp-gram-6.jpg',
            '/images/hp-gram-7.jpg',
          ].map((img, i) => (
            <a href="#" key={i} className="block relative group aspect-square bg-[#ddd] overflow-hidden">
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
            <span className="font-serif text-[11px] text-[#d4af37] tracking-[3px] uppercase block">STAY UPDATED</span>
            <h2 className="font-serif text-[42px] font-bold text-[#1a1a18] mt-2 uppercase leading-none mb-6">
              JOIN THE ZAFEX CIRCLE
            </h2>
            <p className="font-sans text-[14px] text-[#6b6b6b] mb-8">
              Subscribe for early access to new arrivals, exclusive collector's discounts, and stories from the world of historical armour and LARP.
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
                SUBSCRIBE
              </button>
            </form>
          </Reveal>
        </div>
      </section>
    </div>
  );
};

export default Home;
