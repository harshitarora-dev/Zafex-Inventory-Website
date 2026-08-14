import React from 'react';
import { Link } from 'wouter';
import { CheckCircle2, Wrench, Globe, Users, ShieldCheck, Star } from 'lucide-react';

/* ── Small reusable section heading ─────────────────────────────────── */
function SectionHeading({ label, title }: { label?: string; title: string }) {
  return (
    <div className="mb-10">
      {label && (
        <span className="font-sans text-[10px] uppercase tracking-[3px] text-[#8b6914] block mb-3">
          {label}
        </span>
      )}
      <h2 className="font-serif text-[34px] sm:text-[40px] font-light text-[#1a1208] uppercase leading-none tracking-[0.06em]">
        {title}
      </h2>
      <div className="w-[40px] h-[2px] bg-[#8b6914] mt-5" />
    </div>
  );
}

/* ── Check list item ─────────────────────────────────────────────── */
function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 font-sans text-[14px] text-[#4a4a4a] leading-relaxed">
      <CheckCircle2 size={16} className="text-[#8b6914] flex-shrink-0 mt-[3px]" />
      <span>{children}</span>
    </li>
  );
}

/* ── Bullet list item ────────────────────────────────────────────── */
function BulletItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 font-sans text-[14px] text-[#4a4a4a] leading-relaxed">
      <span className="text-[#8b6914] font-bold mt-[2px]">·</span>
      <span>{children}</span>
    </li>
  );
}

const About = () => {
  return (
    <div className="bg-[#f5f0e8] min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="w-full bg-[#cec3b5] flex flex-col items-center justify-center text-center px-4 py-16">
        <div className="font-sans text-[10px] uppercase tracking-[2.5px] text-[#5a4a30]/70 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-[#2a2016] transition-colors">HOME</Link>
          <span className="text-[#5a4a30]/40">/</span>
          <span className="text-[#2a2016]">ABOUT US</span>
        </div>
        <h1 className="font-serif text-[48px] sm:text-[62px] font-light text-[#1a1208] uppercase leading-none tracking-[0.1em] mb-6">
          About Zafex Collectibles
        </h1>
        <p className="font-serif text-[18px] sm:text-[22px] font-light text-[#5a4a30] italic max-w-xl">
          Crafting History. Inspiring Adventure.
        </p>
      </section>

      {/* ── Intro ─────────────────────────────────────────────────── */}
      <section className="max-w-[860px] mx-auto px-6 py-20 text-center">
        <p className="font-sans text-[15px] sm:text-[16px] text-[#4a4a4a] leading-[1.9] mb-6">
          At Zafex Collectibles, we believe medieval craftsmanship is more than a tradition — it is a living art. Every helmet, every chainmail ring, every leather strap, and every stitch tells a story of courage, honour, and history.
        </p>
        <p className="font-sans text-[15px] sm:text-[16px] text-[#4a4a4a] leading-[1.9] mb-6">
          From our workshop in <strong className="text-[#2a2016]">Meerut, India</strong>, we proudly design and manufacture handcrafted medieval armor, historical clothing, Viking gear, Roman equipment, leather armor, chainmail, gambesons, shields, and fantasy-inspired creations for customers across the globe.
        </p>
        <p className="font-sans text-[15px] sm:text-[16px] text-[#4a4a4a] leading-[1.9]">
          Whether you're a collector, historical reenactor, LARP enthusiast, Renaissance Faire participant, filmmaker, museum curator, theatre production, or cosplay artist, our mission is simple:
        </p>
        <blockquote className="font-serif text-[18px] sm:text-[22px] font-light italic text-[#5a3e00] border-l-2 border-[#8b6914] pl-6 mt-8 text-left max-w-2xl mx-auto">
          "To create handcrafted medieval products that combine authentic historical craftsmanship with modern quality and reliability."
        </blockquote>
      </section>

      {/* ── Our Story ─────────────────────────────────────────────── */}
      <section className="bg-[#e8e0d4] py-20">
        <div className="max-w-[1100px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <SectionHeading label="The Beginning" title="Our Story" />
            <p className="font-sans text-[14px] sm:text-[15px] text-[#4a4a4a] leading-[1.9] mb-5">
              Every great journey begins with passion. Zafex Collectibles started with a deep appreciation for medieval history and traditional craftsmanship. What began as a small workshop dedicated to handcrafted armor has grown into a trusted manufacturer serving customers in North America, Europe, Australia, and many other parts of the world.
            </p>
            <p className="font-sans text-[14px] sm:text-[15px] text-[#4a4a4a] leading-[1.9] mb-5">
              Our founders believed that true craftsmanship should never disappear in an age of mass production. Instead of producing ordinary products, we chose to preserve traditional manufacturing techniques while continuously improving our quality, designs, and customer experience.
            </p>
            <p className="font-sans text-[14px] sm:text-[15px] text-[#4a4a4a] leading-[1.9]">
              Today, every product that carries the Zafex Collectibles name reflects the same passion that inspired our journey from day one.
            </p>
          </div>
          <div className="relative">
            <img
              src="/images/breastplates.png"
              alt="Zafex workshop"
              className="w-full h-[380px] object-cover"
            />
            <div className="absolute bottom-0 left-0 bg-[#1a1208] text-[#d4af37] px-6 py-4">
              <p className="font-serif text-[11px] uppercase tracking-[2px]">Est. Meerut, India</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Handmade in India ─────────────────────────────────────── */}
      <section className="max-w-[860px] mx-auto px-6 py-20 text-center">
        <SectionHeading label="Our Home" title="Handmade in India, Trusted Worldwide" />
        <p className="font-sans text-[14px] sm:text-[15px] text-[#4a4a4a] leading-[1.9] mb-5">
          Located in <strong className="text-[#2a2016]">Meerut, Uttar Pradesh</strong>, one of India's most respected manufacturing hubs, our workshop combines generations of craftsmanship with modern production standards.
        </p>
        <p className="font-sans text-[14px] sm:text-[15px] text-[#4a4a4a] leading-[1.9] mb-5">
          Every product is handcrafted by experienced artisans who understand the importance of precision, durability, and historical authenticity.
        </p>
        <p className="font-sans text-[14px] sm:text-[15px] text-[#4a4a4a] leading-[1.9]">
          We proudly ship our handcrafted medieval products to customers around the world, earning the trust of collectors, retailers, reenactors, museums, and costume professionals alike.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-14">
          {[
            { icon: Globe, label: 'Worldwide Shipping' },
            { icon: Users, label: 'Trusted by Thousands' },
            { icon: ShieldCheck, label: 'Quality Inspected' },
            { icon: Star, label: 'Handmade by Artisans' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-3 bg-[#e8e0d4] p-6 border border-[#d4cdc4]">
              <Icon size={24} className="text-[#8b6914]" strokeWidth={1.5} />
              <span className="font-sans text-[11px] uppercase tracking-[1.5px] text-[#2a2016] text-center">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── What We Create ────────────────────────────────────────── */}
      <section className="bg-[#cec3b5] py-20">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <SectionHeading label="Our Collection" title="What We Create" />
              <p className="font-sans text-[14px] text-[#4a4a4a] leading-[1.9] mb-6">
                Our handcrafted collection includes:
              </p>
              <ul className="space-y-2.5 columns-2">
                {[
                  'Chainmail Shirts & Hauberks', 'Chainmail Coifs & Hoods',
                  'Chainmail Tops & Accessories', 'Medieval Helmets',
                  'Viking Armor', 'Roman Armor',
                  'Gladiator Equipment', 'Leather Armor',
                  'Gambesons & Padded Armor', 'Medieval Clothing',
                  'Viking Costumes', 'Belts & Leather Goods',
                  'Shields', 'LARP Equipment',
                  'Cosplay Costumes', 'Fantasy Armor',
                  'Historical Reproductions', 'Custom-Made Medieval Products',
                ].map((item) => (
                  <BulletItem key={item}>{item}</BulletItem>
                ))}
              </ul>
              <p className="font-sans text-[13px] text-[#5a4a30] italic mt-6">
                Every item is carefully manufactured to deliver authenticity, comfort, durability, and visual excellence.
              </p>
            </div>

            {/* Inside Our Workshop */}
            <div>
              <SectionHeading label="The Process" title="Inside Our Workshop" />
              <p className="font-sans text-[14px] text-[#4a4a4a] leading-[1.9] mb-6">
                Every product begins as raw materials carefully selected for quality and performance. Our craftsmen transform steel, aluminum, leather, brass, cotton fabrics, and other premium materials through a detailed production process:
              </p>
              <ul className="space-y-2.5">
                {[
                  'Design & Planning', 'Material Selection', 'Metal Fabrication',
                  'Chainmail Weaving', 'Leather Crafting', 'Hand Stitching',
                  'Riveting & Assembly', 'Surface Finishing', 'Quality Inspection',
                  'Protective Packaging',
                ].map((step) => (
                  <CheckItem key={step}>{step}</CheckItem>
                ))}
              </ul>
              <p className="font-sans text-[13px] text-[#5a4a30] italic mt-6">
                Unlike factory mass production, each piece is individually crafted with care, giving every product its own unique character while maintaining exceptional consistency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Meet Our Craftsmen ────────────────────────────────────── */}
      <section className="max-w-[1100px] mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <img
              src="/images/chainmail-shirt.png"
              alt="Craftsmen at work"
              className="w-full h-[360px] object-cover"
            />
          </div>
          <div>
            <SectionHeading label="The People" title="Meet Our Craftsmen" />
            <p className="font-sans text-[14px] text-[#4a4a4a] leading-[1.9] mb-6">
              Behind every Zafex Collectibles product is a team of experienced artisans whose passion keeps centuries-old traditions alive. Their expertise includes:
            </p>
            <ul className="space-y-2.5 mb-8">
              {[
                'Traditional Chainmail Weaving', 'Leather Craftsmanship',
                'Helmet Fabrication', 'Metal Shaping', 'Hand Stitching',
                'Riveting', 'Polishing & Finishing', 'Quality Inspection',
              ].map((skill) => (
                <BulletItem key={skill}>{skill}</BulletItem>
              ))}
            </ul>
            <p className="font-sans text-[14px] text-[#4a4a4a] leading-[1.9]">
              Every artisan shares one goal — to produce handcrafted medieval equipment worthy of collectors and enthusiasts around the world.
            </p>
          </div>
        </div>
      </section>

      {/* ── Quality Promise ───────────────────────────────────────── */}
      <section className="bg-[#1a1208] py-20">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="font-sans text-[10px] uppercase tracking-[3px] text-[#8b6914] block mb-3">Our Commitment</span>
            <h2 className="font-serif text-[36px] sm:text-[44px] font-light text-white uppercase leading-none tracking-[0.08em]">
              Our Quality Promise
            </h2>
            <p className="font-serif text-[16px] italic text-[#c8b89a] mt-4">Quality is never accidental.</p>
          </div>
          <p className="font-sans text-[14px] text-[#c8bdb0] leading-[1.9] text-center max-w-xl mx-auto mb-12">
            Every product is individually inspected before shipment across all key criteria:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              'Material Quality', 'Structural Strength', 'Accurate Measurements',
              'Stitching', 'Riveting', 'Surface Finish', 'Hardware', 'Final Appearance',
            ].map((item) => (
              <div key={item} className="bg-[#2a1a08] border border-[#3a2a18] p-5 text-center">
                <CheckCircle2 size={18} className="text-[#8b6914] mx-auto mb-3" strokeWidth={1.5} />
                <span className="font-sans text-[11px] uppercase tracking-[1.5px] text-[#c8b89a]">{item}</span>
              </div>
            ))}
          </div>
          <p className="font-sans text-[13px] text-[#8b7a60] text-center mt-10 italic">
            Only products that meet our quality standards are approved for delivery.
          </p>
        </div>
      </section>

      {/* ── Custom Manufacturing + Wholesale ─────────────────────── */}
      <section className="max-w-[1100px] mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <SectionHeading label="Bespoke" title="Custom Manufacturing" />
            <p className="font-sans text-[14px] text-[#4a4a4a] leading-[1.9] mb-2 font-medium text-[#2a2016]">
              Looking for something unique?
            </p>
            <p className="font-sans text-[14px] text-[#4a4a4a] leading-[1.9] mb-6">
              We specialize in custom manufacturing for:
            </p>
            <ul className="space-y-2.5 mb-6">
              {[
                'Historical Reproductions', 'Museum Replicas',
                'Film & Television Productions', 'Theatre Costumes',
                'Personalized Armor', 'Custom Chainmail',
                'Leather Armor', 'Private Label Manufacturing',
                'OEM Production', 'Wholesale Orders',
              ].map((item) => (
                <BulletItem key={item}>{item}</BulletItem>
              ))}
            </ul>
            <p className="font-sans text-[13px] text-[#5a4a30] italic">
              Simply send us your drawings, measurements, sketches, or reference images, and our team will help transform your idea into reality.
            </p>
            <Link
              href="/contact"
              className="inline-block mt-8 bg-[#1a1208] text-white font-sans text-[11px] uppercase tracking-[2px] px-8 py-3.5 hover:bg-[#8b6914] transition-colors"
            >
              GET A QUOTE
            </Link>
          </div>

          <div>
            <SectionHeading label="B2B" title="Wholesale Partnerships" />
            <p className="font-sans text-[14px] text-[#4a4a4a] leading-[1.9] mb-6">
              We proudly work with businesses worldwide, including:
            </p>
            <ul className="space-y-2.5 mb-6">
              {[
                'Online Stores', 'Retail Shops', 'Costume Suppliers',
                'Museums', 'Historical Organizations', 'Film Studios',
                'Event Companies', 'Theatre Productions', 'Wholesale Importers',
              ].map((item) => (
                <BulletItem key={item}>{item}</BulletItem>
              ))}
            </ul>
            <p className="font-sans text-[14px] text-[#4a4a4a] leading-[1.9]">
              Whether you need one handcrafted item or large production volumes, we are committed to delivering consistent quality and reliable service.
            </p>
            <Link
              href="/contact"
              className="inline-block mt-8 border border-[#1a1208] text-[#1a1208] font-sans text-[11px] uppercase tracking-[2px] px-8 py-3.5 hover:bg-[#1a1208] hover:text-white transition-colors"
            >
              WHOLESALE ENQUIRY
            </Link>
          </div>
        </div>
      </section>

      {/* ── Built for Every Adventure ─────────────────────────────── */}
      <section className="bg-[#e8e0d4] py-20">
        <div className="max-w-[1100px] mx-auto px-6 text-center">
          <SectionHeading label="Use Cases" title="Built for Every Adventure" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            {[
              { icon: '⚔', label: 'Historical Reenactments' },
              { icon: '🛡', label: 'Renaissance Faires' },
              { icon: '🪓', label: 'Viking Festivals' },
              { icon: '🎭', label: 'Cosplay' },
              { icon: '🏰', label: 'LARP Events' },
              { icon: '⚜', label: 'SCA Combat' },
              { icon: '🎬', label: 'Film Productions' },
              { icon: '🎪', label: 'Theatre Performances' },
              { icon: '🏛', label: 'Museum Displays' },
              { icon: '📸', label: 'Fantasy Photography' },
              { icon: '🎁', label: 'Collectors' },
              { icon: '✨', label: 'And More' },
            ].map(({ icon, label }) => (
              <div key={label} className="bg-[#f5f0e8] border border-[#d4cdc4] p-5 flex flex-col items-center gap-3">
                <span className="text-[26px]">{icon}</span>
                <span className="font-sans text-[11px] uppercase tracking-[1.5px] text-[#2a2016] text-center">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ─────────────────────────────────────────── */}
      <section className="max-w-[860px] mx-auto px-6 py-20">
        <div className="text-center">
          <SectionHeading label="" title="Why Choose Zafex Collectibles" />
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          {[
            'Handmade by Skilled Artisans',
            'Authentic Medieval Designs',
            'Premium Materials',
            'Worldwide Shipping',
            'Secure International Packaging',
            'Custom Manufacturing',
            'Wholesale Support',
            'Responsive Customer Service',
            'Reliable Production',
            'Trusted by Customers Worldwide',
          ].map((item) => (
            <CheckItem key={item}>{item}</CheckItem>
          ))}
        </ul>
      </section>

      {/* ── Vision + CTA ──────────────────────────────────────────── */}
      <section className="bg-[#1a1208] py-24 text-center px-6">
        <span className="font-sans text-[10px] uppercase tracking-[3px] text-[#8b6914] block mb-5">Looking Ahead</span>
        <h2 className="font-serif text-[38px] sm:text-[50px] font-light text-white uppercase tracking-[0.08em] leading-none mb-8">
          Our Vision
        </h2>
        <div className="w-[50px] h-[1px] bg-[#8b6914] mx-auto mb-8" />
        <p className="font-sans text-[14px] sm:text-[15px] text-[#c8bdb0] leading-[1.9] max-w-2xl mx-auto mb-6">
          We aspire to become one of the world's most respected names in handcrafted medieval armor and historical equipment. By continuously improving our craftsmanship, investing in skilled artisans, and embracing modern manufacturing practices, we remain dedicated to preserving medieval heritage for future generations.
        </p>
        <p className="font-serif text-[18px] sm:text-[22px] italic text-[#d4af37] mb-14">
          Our goal is not simply to manufacture products. Our goal is to craft pieces of history.
        </p>

        <div className="border-t border-[#2a1a08] pt-14 max-w-xl mx-auto">
          <h3 className="font-serif text-[24px] font-light text-white uppercase tracking-[0.08em] mb-5">
            Join the Zafex Collectibles Family
          </h3>
          <p className="font-sans text-[14px] text-[#c8bdb0] leading-[1.9] mb-10">
            Every product we create represents craftsmanship, history, dedication, and passion. Whether you're preparing for your next Renaissance Faire, expanding a museum collection, creating an unforgettable cosplay, or simply collecting beautiful handcrafted armor — we're honoured to be part of your journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="bg-[#d4af37] text-[#1a1208] font-sans text-[11px] uppercase tracking-[2px] px-10 py-4 hover:bg-white transition-colors font-semibold"
            >
              EXPLORE THE COLLECTION
            </Link>
            <Link
              href="/contact"
              className="border border-[#d4af37] text-[#d4af37] font-sans text-[11px] uppercase tracking-[2px] px-10 py-4 hover:bg-[#d4af37] hover:text-[#1a1208] transition-colors"
            >
              CONTACT US
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
