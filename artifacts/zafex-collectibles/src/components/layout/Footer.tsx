import { Link } from 'wouter';
import { Facebook, Instagram, Phone, Mail, MapPin } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function Footer() {
  return (
    <footer className="bg-[hsl(var(--bg-deep))] text-white pt-16 pb-8 border-t-[4px] border-primary">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <div>
              <h3 className="font-serif font-bold text-2xl tracking-[2px] uppercase text-white mb-1">
                Zafex
              </h3>
              <p className="font-serif text-xs tracking-[3px] text-muted-foreground uppercase">
                Collectibles & Zafs
              </p>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Museum-grade medieval armor, weapons replicas, and leather goods. Handcrafted with the weight of real history by Zafex Enterprises.
            </p>
            <div className="flex gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a href="#" className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:bg-primary hover:border-primary transition-colors text-gray-400 hover:text-white">
                      <Facebook size={18} />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Coming Soon</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a href="#" className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:bg-primary hover:border-primary transition-colors text-gray-400 hover:text-white">
                      <Instagram size={18} />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Coming Soon</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Contact Column */}
          <div className="space-y-6">
            <h4 className="font-serif font-semibold tracking-widest text-lg uppercase text-secondary">Contact The Forge</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
                <span>2710, F-Block, Gali No. 6, Zakir Hussain Colony, Meerut – 250002 (UP), India</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-primary shrink-0" />
                <span>+91-8273506540</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-primary shrink-0" />
                <div className="flex flex-col">
                  <span>zafexenterprises@gmail.com</span>
                  <span>zafexcollectibles@gmail.com</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="font-serif font-semibold tracking-widest text-lg uppercase text-secondary">Exploration</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/shop" className="hover:text-primary transition-colors">Full Catalog</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">Our Philosophy</Link></li>
              <li><Link href="/custom-forging" className="hover:text-primary transition-colors">Custom Forging</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">The Armoury Blog</Link></li>
              <li><Link href="/faqs" className="hover:text-primary transition-colors">FAQs</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h4 className="font-serif font-semibold tracking-widest text-lg uppercase text-secondary">Support</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/size-guide" className="hover:text-primary transition-colors">Size Guide</Link></li>
              <li><Link href="/product-maintenance" className="hover:text-primary transition-colors">Care & Maintenance</Link></li>
              <li><Link href="/product-safety" className="hover:text-primary transition-colors">Product Safety</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-primary transition-colors">Shipping Policy</Link></li>
              <li><Link href="/refund-policy" className="hover:text-primary transition-colors">Refund Policy</Link></li>
              <li><Link href="/terms-and-conditions" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Zafex Enterprises. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="uppercase font-serif tracking-widest mr-2">We Accept:</span>
            <span>Payoneer</span>
            <span className="w-1 h-1 bg-gray-600 rounded-full mx-1"></span>
            <span>PayPal</span>
            <span className="w-1 h-1 bg-gray-600 rounded-full mx-1"></span>
            <span>Direct Bank Transfer</span>
          </div>
        </div>
      </div>
    </footer>
  );
}