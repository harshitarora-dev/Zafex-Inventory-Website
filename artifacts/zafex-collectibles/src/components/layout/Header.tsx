import { Link } from 'wouter';
import { ShoppingCart, Search, Menu, X, Anvil } from 'lucide-react';
import { useState } from 'react';
import { CATEGORIES } from '@/data/products';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="bg-nav-bg text-[hsl(var(--bg-deep))] px-4 py-2 text-xs font-serif font-bold tracking-widest text-center uppercase">
        Worldwide Shipping • Museum Grade Craftsmanship • Custom Forging Available
      </div>
      
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 -ml-2 text-foreground hover:text-primary transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <Anvil className="text-primary w-8 h-8" />
          <div className="flex flex-col">
            <span className="font-serif font-bold text-xl md:text-2xl tracking-[2px] uppercase leading-none text-foreground">
              Zafex
            </span>
            <span className="font-serif text-[10px] md:text-xs tracking-[3px] text-muted-foreground uppercase leading-tight">
              Collectibles & Zafs
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          <Link href="/shop" className="font-serif text-sm font-semibold tracking-widest uppercase text-foreground hover:text-primary transition-colors">Shop All</Link>
          <div className="relative group">
            <button className="font-serif text-sm font-semibold tracking-widest uppercase text-foreground hover:text-primary transition-colors py-8">
              Categories
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-[600px] bg-card border border-border shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 grid grid-cols-2 p-6 gap-x-8 gap-y-4">
              {CATEGORIES.map(category => (
                <Link key={category} href={`/shop?category=${encodeURIComponent(category)}`} className="font-serif text-sm uppercase tracking-wide hover:text-primary transition-colors">
                  {category}
                </Link>
              ))}
            </div>
          </div>
          <Link href="/custom-forging" className="font-serif text-sm font-semibold tracking-widest uppercase text-foreground hover:text-primary transition-colors">Custom Forging</Link>
          <Link href="/about" className="font-serif text-sm font-semibold tracking-widest uppercase text-foreground hover:text-primary transition-colors">Our Forge</Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="p-2 text-foreground hover:text-primary transition-colors">
            <Search size={20} />
          </button>
          <button className="p-2 text-foreground hover:text-primary transition-colors relative">
            <ShoppingCart size={20} />
            <span className="absolute top-0 right-0 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center rounded-full">
              0
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-card border-b border-border shadow-xl flex flex-col p-4 max-h-[calc(100vh-120px)] overflow-y-auto">
          <Link href="/shop" className="py-3 font-serif font-bold tracking-widest uppercase border-b border-border/50">Shop All</Link>
          <div className="py-3 font-serif font-bold tracking-widest uppercase text-muted-foreground">Categories</div>
          <div className="flex flex-col pl-4 gap-3 pb-3 border-b border-border/50">
            {CATEGORIES.map(category => (
              <Link key={category} href={`/shop?category=${encodeURIComponent(category)}`} className="font-serif text-sm uppercase tracking-wide hover:text-primary">
                {category}
              </Link>
            ))}
          </div>
          <Link href="/custom-forging" className="py-3 font-serif font-bold tracking-widest uppercase border-b border-border/50">Custom Forging</Link>
          <Link href="/about" className="py-3 font-serif font-bold tracking-widest uppercase border-b border-border/50">Our Forge</Link>
          <Link href="/contact" className="py-3 font-serif font-bold tracking-widest uppercase border-b border-border/50">Contact Us</Link>
          <Link href="/blog" className="py-3 font-serif font-bold tracking-widest uppercase">The Armoury Blog</Link>
        </div>
      )}
    </header>
  );
}