import React from 'react';
import { Link } from 'wouter';
import { Mail, Phone, MapPin } from 'lucide-react';

const TOPICS = [
  'Chainmail Making',
  'Medieval Armor History',
  'Viking Culture',
  'Renaissance Fashion',
  'Leatherworking',
  'LARP & Cosplay Inspiration',
  'Product Care Guides',
  'Historical Reenactment Tips',
  'Workshop Stories',
  'Industry Updates',
];

const ARTICLES = [
  {
    id: 1,
    title: 'Preserving Steel: The Complete Armor Maintenance Guide',
    excerpt:
      'Carbon steel is magnificent, but it demands respect. Learn our workshop\'s proven methods for oiling, polishing, and preventing rust on your historical replicas.',
    category: 'Care & Maintenance',
    date: 'October 12, 2023',
    image: '/images/breastplates.png',
  },
  {
    id: 2,
    title: 'The Anatomy of a Gothic Plate Harness',
    excerpt:
      'Fluting isn\'t just for aesthetics. We break down the engineering genius behind 15th-century Gothic armor and why it remains the pinnacle of plate design.',
    category: 'Historical Analysis',
    date: 'September 28, 2023',
    image: '/images/full-body-armor.png',
  },
  {
    id: 3,
    title: 'Riveted vs. Butted Chainmail: What You Need to Know',
    excerpt:
      'A deep dive into the construction methods of maille, and how to choose the right type based on whether you\'re fighting, acting, or displaying.',
    category: 'Craftsmanship',
    date: 'August 15, 2023',
    image: '/images/chainmail-shirt.png',
  },
  {
    id: 4,
    title: 'Preparing Your Kit for a Weekend LARP Event',
    excerpt:
      'Comfort is survival. From breaking in your leather gambeson to balancing the weight of your pauldrons — here is how to survive a 48-hour immersive event.',
    category: 'Event Prep',
    date: 'July 04, 2023',
    image: '/images/gambeson.png',
  },
];

export default function Blog() {
  return (
    <div className="bg-[#f5f0e8] min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="w-full bg-[#cec3b5] flex flex-col items-center justify-center text-center px-4 py-16">
        <div className="font-sans text-[10px] uppercase tracking-[2.5px] text-[#5a4a30]/70 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-[#2a2016] transition-colors">HOME</Link>
          <span className="text-[#5a4a30]/40">/</span>
          <span className="text-[#2a2016]">BLOG</span>
        </div>
        <h1 className="font-serif text-[48px] sm:text-[62px] font-light text-[#1a1208] uppercase leading-none tracking-[0.1em] mb-6">
          Blog
        </h1>
        <p className="font-serif text-[17px] sm:text-[20px] font-light text-[#5a4a30] italic max-w-xl">
          Welcome to the Zafex Collectibles Blog
        </p>
      </section>

      {/* ── Intro ─────────────────────────────────────────────────────── */}
      <section className="max-w-[860px] mx-auto px-6 py-14 text-center">
        <p className="font-sans text-[15px] sm:text-[16px] text-[#4a4a4a] leading-[1.9]">
          Discover the fascinating world of medieval craftsmanship through our articles. Our goal is to educate, inspire, and connect with medieval enthusiasts around the globe.
        </p>
      </section>

      {/* ── Topics We Cover ───────────────────────────────────────────── */}
      <section className="bg-[#e8e0d4] py-14">
        <div className="max-w-[1100px] mx-auto px-6 text-center">
          <span className="font-sans text-[10px] uppercase tracking-[3px] text-[#8b6914] block mb-4">WHAT WE WRITE ABOUT</span>
          <div className="flex flex-wrap gap-2 justify-center">
            {TOPICS.map((topic) => (
              <span
                key={topic}
                className="font-sans text-[11px] uppercase tracking-[1.5px] text-[#2a2016] border border-[#c8bfb0] px-4 py-2 bg-[#f5f0e8]"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Articles ──────────────────────────────────────────────────── */}
      <section className="max-w-[1200px] mx-auto px-6 py-20">
        <div className="mb-12">
          <span className="font-sans text-[10px] uppercase tracking-[3px] text-[#8b6914] block mb-3">FROM THE WORKSHOP</span>
          <h2 className="font-serif text-[34px] font-light text-[#1a1208] uppercase leading-none tracking-[0.06em]">
            Latest Articles
          </h2>
          <div className="w-[40px] h-[2px] bg-[#8b6914] mt-5" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {ARTICLES.map((article) => (
            <article
              key={article.id}
              className="group bg-white border border-[#d4cdc4] overflow-hidden hover:border-[#8b6914] transition-colors"
            >
              <div className="h-[220px] overflow-hidden bg-[#ede9e3]">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-7">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-sans text-[10px] uppercase tracking-[2px] text-[#8b6914] font-medium">
                    {article.category}
                  </span>
                  <span className="text-[#c8bfb0]">·</span>
                  <span className="font-sans text-[10px] uppercase tracking-[1.5px] text-[#6b6b6b]">
                    {article.date}
                  </span>
                </div>
                <h2 className="font-serif text-[20px] font-light text-[#1a1208] leading-snug mb-3 group-hover:text-[#8b6914] transition-colors">
                  {article.title}
                </h2>
                <p className="font-sans text-[13px] text-[#6b6b6b] leading-relaxed mb-5">
                  {article.excerpt}
                </p>
                <span className="font-sans text-[10px] uppercase tracking-[2px] text-[#8b6914] border-b border-[#8b6914] pb-0.5">
                  READ MORE →
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Contact ───────────────────────────────────────────────────── */}
      <section className="bg-[#1a1208] py-20">
        <div className="max-w-[700px] mx-auto px-6 text-center">
          <span className="font-sans text-[10px] uppercase tracking-[3px] text-[#8b6914] block mb-5">REACH OUT</span>
          <h2 className="font-serif text-[36px] sm:text-[42px] font-light text-white uppercase tracking-[0.08em] leading-none mb-3">
            Contact Us
          </h2>
          <div className="w-[40px] h-[1px] bg-[#8b6914] mx-auto mb-12" />

          <p className="font-serif text-[20px] font-light text-[#d4af37] mb-10">Zafex Collectibles</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex flex-col items-center gap-3">
              <Mail size={20} className="text-[#8b6914]" strokeWidth={1.5} />
              <p className="font-sans text-[10px] uppercase tracking-[2px] text-[#8b6914]">Email</p>
              <a href="mailto:zafexcollectibles@gmail.com" className="font-sans text-[13px] text-[#c8bdb0] hover:text-white transition-colors text-center">
                zafexcollectibles@gmail.com
              </a>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Phone size={20} className="text-[#8b6914]" strokeWidth={1.5} />
              <p className="font-sans text-[10px] uppercase tracking-[2px] text-[#8b6914]">Phone / WhatsApp</p>
              <a href="tel:+918273506540" className="font-sans text-[13px] text-[#c8bdb0] hover:text-white transition-colors">
                +91-8273506540
              </a>
            </div>
            <div className="flex flex-col items-center gap-3">
              <MapPin size={20} className="text-[#8b6914]" strokeWidth={1.5} />
              <p className="font-sans text-[10px] uppercase tracking-[2px] text-[#8b6914]">Address</p>
              <address className="font-sans text-[13px] text-[#c8bdb0] not-italic text-center leading-relaxed">
                2710, F-Block, Gali No. 6<br />
                Zakir Hussain Colony<br />
                Meerut, UP – 250002, India
              </address>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
