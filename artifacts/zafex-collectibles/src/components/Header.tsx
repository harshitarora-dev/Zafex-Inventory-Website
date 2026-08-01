import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingCart,
  UserRound,
  X,
  LogOut,
} from 'lucide-react';
import { NAV_CATEGORIES, type NavCategory } from '@/data/categories';
import { useAuth } from '@/contexts/AuthContext';
import { useCartItemCount } from '@/hooks/useCart';
import { searchProducts } from '@/lib/api';
import type { Product } from '@/lib/api';

const shopGroups = [
  { title: 'CHAINMAIL ARMOR', slugs: ['chainmail-armor'] },
  { title: 'HELMETS', slugs: ['medieval-helmets'] },
  { title: 'ARMOR', slugs: ['plate-armor', 'leather-armor', 'gambesons'] },
  { title: 'CLOTHING', slugs: ['medieval-clothing'] },
  { title: 'ACCESSORIES', slugs: ['accessories', 'shields', 'weapons'] },
] as const;

const collectionsSubs = [
  { label: 'Best Sellers',             slug: 'best-sellers',             desc: 'Top picks from our customers.' },
  { label: 'New Arrivals',             slug: 'new-arrivals',             desc: 'Fresh from the forge.' },
  { label: 'Staff Picks',              slug: 'staff-picks',              desc: 'Favourites chosen by our team.' },
  { label: 'Handmade Collection',      slug: 'handmade-collection',      desc: 'Crafted entirely by hand.' },
  { label: 'Limited Edition',          slug: 'limited-edition',          desc: 'Rare finds for discerning collectors.' },
  { label: 'Festival Collection',      slug: 'festival-collection',      desc: 'Bold pieces for every occasion.' },
  { label: 'Movie Inspired',           slug: 'movie-inspired',           desc: 'Cinematic armory brought to life.' },
  { label: 'Historical Reproductions', slug: 'historical-reproductions', desc: 'Museum-faithful recreations.' },
];

const categoryBySlug = new Map(NAV_CATEGORIES.map((category) => [category.slug, category]));

function CategoryLinks({ category }: { category: NavCategory }) {
  return (
    <div className="min-w-0">
      <Link
        href={`/cat/${category.slug}`}
        className="mb-2 block font-serif text-[11px] font-semibold tracking-[1px] text-[#c6a767] transition-colors hover:text-[#f2d49a]"
      >
        {category.label}
      </Link>
      <div className="flex flex-col gap-1.5">
        {category.subs.slice(0, 7).map((sub) => (
          <Link
            key={sub.slug}
            href={`/cat/${category.slug}/${sub.slug}`}
            className="font-sans text-[11px] leading-tight text-[#ddd4c5] transition-colors hover:text-[#d4af37]"
          >
            {sub.label}
          </Link>
        ))}
      </div>
      <Link
        href={`/cat/${category.slug}`}
        className="mt-3 block font-sans text-[10px] font-medium uppercase tracking-[0.8px] text-[#c6a767] transition-colors hover:text-white"
      >
        View all <span aria-hidden>→</span>
      </Link>
    </div>
  );
}

function ShopMegaMenu({ open }: { open: boolean }) {
  if (!open) return null;
  return (
    <div className="absolute left-1/2 top-full z-[80] w-[min(1050px,calc(100vw-32px))] -translate-x-1/2 border border-[#5d4b32] bg-[#171713] p-5 shadow-2xl">
      <div className="grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-5">
        {shopGroups.map((group) => (
          <div key={group.title} className="contents">
            {group.slugs.map((slug) => {
              const category = categoryBySlug.get(slug);
              return category ? <CategoryLinks key={slug} category={category} /> : null;
            })}
          </div>
        ))}
        <Link href="/shop" className="group relative col-span-2 min-h-[150px] overflow-hidden border border-[#6a5638] md:col-span-5">
          <img src="/images/1781973407807_armor.jpeg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-45 transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#171713]/80 to-[#171713]/20" />
          <div className="relative flex h-full flex-col justify-center px-6 py-5">
            <span className="font-serif text-[18px] tracking-[2px] text-[#eee2ca]">HANDCRAFTED MEDIEVAL ARMOR</span>
            <span className="mt-1 max-w-[230px] font-sans text-[10px] uppercase tracking-[1px] text-[#d5c9b2]">Built for history. Made for you.</span>
            <span className="mt-4 w-fit bg-[#c6a767] px-4 py-2 font-sans text-[10px] font-semibold uppercase tracking-[1px] text-[#171713]">Shop now →</span>
          </div>
        </Link>
      </div>
    </div>
  );
}

function CollectionsMegaMenu({ open }: { open: boolean }) {
  if (!open) return null;
  const col1 = collectionsSubs.slice(0, 4);
  const col2 = collectionsSubs.slice(4);
  return (
    <div className="absolute left-1/2 top-full z-[80] w-[min(820px,calc(100vw-32px))] -translate-x-1/2 border border-[#5d4b32] bg-[#171713] p-5 shadow-2xl">
      <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-3">
        <div className="flex flex-col gap-3">
          <span className="mb-1 font-serif text-[11px] font-semibold tracking-[1px] text-[#c6a767]">
            <Link href="/cat/collections" className="hover:text-[#f2d49a] transition-colors">COLLECTIONS</Link>
          </span>
          {col1.map((item) => (
            <Link key={item.slug} href={`/cat/collections/${item.slug}`} className="group/item flex flex-col gap-0.5">
              <span className="font-sans text-[11px] leading-tight text-[#ddd4c5] transition-colors group-hover/item:text-[#d4af37]">{item.label}</span>
              <span className="font-sans text-[10px] text-[#776d60] transition-colors group-hover/item:text-[#a89272]">{item.desc}</span>
            </Link>
          ))}
          <Link href="/cat/collections" className="mt-1 font-sans text-[10px] font-medium uppercase tracking-[0.8px] text-[#c6a767] transition-colors hover:text-white">View all →</Link>
        </div>
        <div className="flex flex-col gap-3 pt-[26px]">
          {col2.map((item) => (
            <Link key={item.slug} href={`/cat/collections/${item.slug}`} className="group/item flex flex-col gap-0.5">
              <span className="font-sans text-[11px] leading-tight text-[#ddd4c5] transition-colors group-hover/item:text-[#d4af37]">{item.label}</span>
              <span className="font-sans text-[10px] text-[#776d60] transition-colors group-hover/item:text-[#a89272]">{item.desc}</span>
            </Link>
          ))}
        </div>
        <Link href="/cat/collections" className="group relative min-h-[220px] overflow-hidden border border-[#6a5638]">
          <img src="/images/full-body-armor.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-55 transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#171713]/90 via-[#171713]/40 to-transparent" />
          <div className="absolute bottom-0 left-0 flex flex-col px-4 py-5">
            <span className="font-serif text-[15px] tracking-[2px] text-[#eee2ca]">CURATED COLLECTIONS</span>
            <span className="mt-1 max-w-[200px] font-sans text-[10px] uppercase tracking-[1px] text-[#d5c9b2]">From best sellers to limited editions.</span>
            <span className="mt-4 w-fit bg-[#c6a767] px-4 py-2 font-sans text-[10px] font-semibold uppercase tracking-[1px] text-[#171713]">Explore all →</span>
          </div>
        </Link>
      </div>
    </div>
  );
}

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [shopExpanded, setShopExpanded] = useState(false);
  const [collectionsExpanded, setCollectionsExpanded] = useState(false);
  const { user, isLoggedIn, logout } = useAuth();
  const [, navigate] = useLocation();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex">
      <button aria-label="Close menu" className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative ml-auto h-full w-[310px] overflow-y-auto bg-[#f4f0e8] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#d4cdc4] px-5 py-5">
          <span className="font-serif text-[13px] tracking-[2px] text-[#211b14]">ZAFEX</span>
          <button onClick={onClose} aria-label="Close menu"><X size={20} /></button>
        </div>
        <nav className="flex flex-col">
          <Link href="/" onClick={onClose} className="border-b border-[#ded7cc] px-5 py-4 font-sans text-[11px] font-medium uppercase tracking-[1.5px]">Home</Link>

          <button onClick={() => setShopExpanded((v) => !v)} className="flex items-center justify-between border-b border-[#ded7cc] px-5 py-4 text-left font-sans text-[11px] font-medium uppercase tracking-[1.5px]">
            Shop <ChevronDown size={14} className={shopExpanded ? 'rotate-180 text-[#8b6914]' : 'text-[#8b6914]'} />
          </button>
          {shopExpanded && (
            <div className="bg-[#e9e1d5] px-5 py-2">
              <Link href="/shop" onClick={onClose} className="block border-b border-[#d4c8b8] py-3 font-sans text-[11px] font-semibold uppercase tracking-[1px] text-[#8b6914]">Shop all</Link>
              {shopGroups.flatMap((group) => group.slugs).map((slug) => {
                const category = categoryBySlug.get(slug);
                return category ? (
                  <Link key={slug} href={`/cat/${slug}`} onClick={onClose} className="block py-2 font-sans text-[11px] text-[#33291f]">{category.label}</Link>
                ) : null;
              })}
            </div>
          )}

          <button onClick={() => setCollectionsExpanded((v) => !v)} className="flex items-center justify-between border-b border-[#ded7cc] px-5 py-4 text-left font-sans text-[11px] font-medium uppercase tracking-[1.5px]">
            Collections <ChevronDown size={14} className={collectionsExpanded ? 'rotate-180 text-[#8b6914]' : 'text-[#8b6914]'} />
          </button>
          {collectionsExpanded && (
            <div className="bg-[#e9e1d5] px-5 py-2">
              <Link href="/cat/collections" onClick={onClose} className="block border-b border-[#d4c8b8] py-3 font-sans text-[11px] font-semibold uppercase tracking-[1px] text-[#8b6914]">All Collections</Link>
              {collectionsSubs.map((item) => (
                <Link key={item.slug} href={`/cat/collections/${item.slug}`} onClick={onClose} className="block py-2 font-sans text-[11px] text-[#33291f]">{item.label}</Link>
              ))}
            </div>
          )}

          {[
            ['/cat/custom-orders', 'Custom Orders'],
            ['/cat/wholesale', 'Wholesale'],
            ['/cat/about-us', 'About Us'],
            ['/resources', 'Resources'],
            ['/contact', 'Contact Us'],
          ].map(([href, label]) => (
            <Link key={href} href={href} onClick={onClose} className="border-b border-[#ded7cc] px-5 py-4 font-sans text-[11px] font-medium uppercase tracking-[1.5px]">
              {label}
            </Link>
          ))}

          {/* Auth section in mobile */}
          <div className="border-t border-[#d4cdc4] mt-2 pt-2">
            {isLoggedIn ? (
              <>
                <div className="px-5 py-3 font-sans text-[11px] text-[#8b6914] uppercase tracking-[1px]">
                  {user?.name}
                </div>
                <Link href="/account" onClick={onClose} className="block border-b border-[#ded7cc] px-5 py-4 font-sans text-[11px] font-medium uppercase tracking-[1.5px]">My Account</Link>
                <Link href="/cart" onClick={onClose} className="block border-b border-[#ded7cc] px-5 py-4 font-sans text-[11px] font-medium uppercase tracking-[1.5px]">Cart</Link>
                <Link href="/wishlist" onClick={onClose} className="block border-b border-[#ded7cc] px-5 py-4 font-sans text-[11px] font-medium uppercase tracking-[1.5px]">Wishlist</Link>
                <button
                  onClick={async () => { await logout(); onClose(); navigate('/'); }}
                  className="w-full text-left border-b border-[#ded7cc] px-5 py-4 font-sans text-[11px] font-medium uppercase tracking-[1.5px] text-[#9c1c1c]"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={onClose} className="block border-b border-[#ded7cc] px-5 py-4 font-sans text-[11px] font-medium uppercase tracking-[1.5px]">Sign In</Link>
                <Link href="/register" onClick={onClose} className="block border-b border-[#ded7cc] px-5 py-4 font-sans text-[11px] font-medium uppercase tracking-[1.5px]">Create Account</Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}

/* ── Live search dropdown ───────────────────────────────────────────── */
function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    timerRef.current = setTimeout(async () => {
      try {
        const res = await searchProducts(query.trim(), 5);
        setResults(res.products);
        setOpen(true);
      } catch { setResults([]); }
    }, 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className="relative hidden h-[34px] max-w-[310px] flex-1 items-center border border-[#d7d0c4] bg-[#faf8f3] px-3 lg:flex">
      <input
        aria-label="Search products"
        placeholder="Search for products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKey}
        className="min-w-0 flex-1 bg-transparent font-sans text-[11px] outline-none placeholder:text-[#a39b8e]"
      />
      <Search size={18} strokeWidth={1.5} className="text-[#4b453d] flex-shrink-0" />
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 bg-white border border-[#d4cfc7] shadow-lg mt-1">
          {results.map((product) => (
            <Link
              key={product.id}
              href={`/shop/${product.id}`}
              onClick={() => { setOpen(false); setQuery(''); }}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#f5f0e8] transition-colors border-b border-[#f0ece4] last:border-b-0"
            >
              <img src={product.image} alt="" className="w-8 h-8 object-cover bg-[#ede9e3] flex-shrink-0" />
              <div className="min-w-0">
                <div className="font-sans text-[12px] text-[#1a1a18] line-clamp-1">{product.name}</div>
                <div className="font-sans text-[11px] text-[#d4af37]">₹{product.price.toLocaleString('en-IN')}</div>
              </div>
            </Link>
          ))}
          <Link
            href={`/shop?q=${encodeURIComponent(query)}`}
            onClick={() => { setOpen(false); setQuery(''); }}
            className="block px-3 py-2.5 font-sans text-[11px] text-[#6b6b6b] hover:bg-[#f5f0e8] transition-colors text-center border-t border-[#f0ece4]"
          >
            See all results for "{query}" →
          </Link>
        </div>
      )}
    </div>
  );
}

/* ── Main Header ────────────────────────────────────────────────────── */
const Header = () => {
  const [location] = useLocation();
  const [, navigate] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const shopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const collectionsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  const { user, isLoggedIn, logout } = useAuth();
  const cartCount = useCartItemCount();

  useEffect(() => {
    setShopOpen(false);
    setCollectionsOpen(false);
    setMobileOpen(false);
    setAccountOpen(false);
  }, [location]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openShop = () => { if (shopTimerRef.current) clearTimeout(shopTimerRef.current); setShopOpen(true); };
  const closeShop = () => { shopTimerRef.current = setTimeout(() => setShopOpen(false), 140); };
  const openCollections = () => { if (collectionsTimerRef.current) clearTimeout(collectionsTimerRef.current); setCollectionsOpen(true); };
  const closeCollections = () => { collectionsTimerRef.current = setTimeout(() => setCollectionsOpen(false), 140); };

  return (
    <>
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <header className="sticky top-0 z-50 w-full">
        {/* Marquee */}
        <div className="flex h-[34px] items-center overflow-hidden bg-[#a91f22] text-white">
          <div className="flex min-w-max animate-[scroll-marquee_28s_linear_infinite] items-center font-sans text-[10px] font-semibold uppercase tracking-[2px]">
            <span className="mx-8">Authentic quality guaranteed &nbsp; · &nbsp; Handcrafted in Meerut, India</span>
            <span className="mx-8">Free shipping on orders above ₹5,000</span>
            <span className="mx-8">Authentic quality guaranteed &nbsp; · &nbsp; Handcrafted in Meerut, India</span>
            <span className="mx-8">Free shipping on orders above ₹5,000</span>
          </div>
        </div>

        {/* Main header bar */}
        <div className="flex min-h-[82px] items-center justify-between gap-5 border-b border-[#ded8cd] bg-[#f4f0e8] px-5 py-3 sm:px-10 lg:px-16">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <div className="flex h-[48px] w-[25px] items-center justify-center border-x-2 border-[#32291d] text-[29px] text-[#32291d]">†</div>
            <div>
              <div className="font-serif text-[24px] font-semibold leading-none tracking-[3px] text-[#211b14] sm:text-[30px]">ZAFEX</div>
              <div className="mt-1 font-serif text-[10px] font-semibold tracking-[3px] text-[#211b14]">COLLECTIBLES</div>
            </div>
          </Link>

          <SearchBar />

          <div className="flex items-center gap-5 text-[#2a241c]">
            {/* Wishlist */}
            <Link href="/wishlist" aria-label="Wishlist" className="hidden flex-col items-center gap-1 text-[8px] uppercase tracking-[1px] transition-colors hover:text-[#8b6914] sm:flex">
              <Heart size={20} strokeWidth={1.4} />
              <span>Wishlist</span>
            </Link>

            {/* Account */}
            {isLoggedIn ? (
              <div ref={accountRef} className="relative hidden sm:block">
                <button
                  onClick={() => setAccountOpen((v) => !v)}
                  aria-label="Account"
                  className="flex flex-col items-center gap-1 text-[8px] uppercase tracking-[1px] transition-colors hover:text-[#8b6914]"
                >
                  <UserRound size={20} strokeWidth={1.4} />
                  <span className="max-w-[60px] truncate">{user?.name?.split(' ')[0]}</span>
                </button>
                {accountOpen && (
                  <div className="absolute right-0 top-full mt-2 w-[180px] bg-white border border-[#d4cfc7] shadow-lg z-50">
                    <Link href="/account" className="block px-4 py-3 font-sans text-[13px] text-[#1a1a18] hover:bg-[#f5f0e8] transition-colors border-b border-[#f0ece4]">My Account</Link>
                    <Link href="/orders/0" className="block px-4 py-3 font-sans text-[13px] text-[#1a1a18] hover:bg-[#f5f0e8] transition-colors border-b border-[#f0ece4]">My Orders</Link>
                    <button
                      onClick={async () => { await logout(); navigate('/'); }}
                      className="w-full flex items-center gap-2 px-4 py-3 font-sans text-[13px] text-[#9c1c1c] hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" aria-label="Sign In" className="hidden flex-col items-center gap-1 text-[8px] uppercase tracking-[1px] transition-colors hover:text-[#8b6914] sm:flex">
                <UserRound size={20} strokeWidth={1.4} />
                <span>Account</span>
              </Link>
            )}

            {/* Cart */}
            <Link href="/cart" aria-label="Cart" className="relative flex flex-col items-center gap-1 text-[8px] uppercase tracking-[1px] transition-colors hover:text-[#8b6914]">
              <ShoppingCart size={21} strokeWidth={1.4} />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-[15px] w-[15px] items-center justify-center rounded-full bg-[#c6a767] text-[8px] font-bold text-[#211b14]">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            <button aria-label="Open menu" onClick={() => setMobileOpen(true)} className="lg:hidden">
              <Menu size={22} />
            </button>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden h-[35px] items-stretch justify-center gap-0 bg-[#080808] lg:flex">
          <Link href="/" className="flex items-center px-7 font-sans text-[10px] font-medium uppercase tracking-[1px] text-white transition-colors hover:bg-[#1d1d1a]">Home</Link>

          <div className="relative flex items-stretch" onMouseEnter={openShop} onMouseLeave={closeShop}>
            <Link href="/shop" className={`flex items-center gap-1 px-7 font-sans text-[10px] font-medium uppercase tracking-[1px] transition-colors ${location === '/shop' || shopOpen ? 'bg-[#1d1d1a] text-[#c6a767]' : 'text-white hover:bg-[#1d1d1a]'}`}>
              Shop <ChevronDown size={11} />
            </Link>
            <div onMouseEnter={openShop} onMouseLeave={closeShop}><ShopMegaMenu open={shopOpen} /></div>
          </div>

          <div className="relative flex items-stretch" onMouseEnter={openCollections} onMouseLeave={closeCollections}>
            <Link href="/cat/collections" className={`flex items-center gap-1 px-6 font-sans text-[10px] font-medium uppercase tracking-[1px] transition-colors ${location === '/cat/collections' || collectionsOpen ? 'bg-[#1d1d1a] text-[#c6a767]' : 'text-white hover:bg-[#1d1d1a]'}`}>
              Collections <ChevronDown size={11} />
            </Link>
            <div onMouseEnter={openCollections} onMouseLeave={closeCollections}><CollectionsMegaMenu open={collectionsOpen} /></div>
          </div>

          {[
            ['/cat/custom-orders', 'Custom Orders'],
            ['/cat/wholesale', 'Wholesale'],
            ['/cat/about-us', 'About Us'],
            ['/resources', 'Resources'],
            ['/contact', 'Contact Us'],
          ].map(([href, label]) => (
            <Link key={href} href={href} className="flex items-center px-6 font-sans text-[10px] font-medium uppercase tracking-[1px] text-white transition-colors hover:bg-[#1d1d1a] hover:text-[#c6a767]">
              {label}
            </Link>
          ))}
        </nav>
      </header>
    </>
  );
};

export default Header;
