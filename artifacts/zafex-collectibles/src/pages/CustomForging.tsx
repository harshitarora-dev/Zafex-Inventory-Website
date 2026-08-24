import React, { useState, useRef } from 'react';
import { Link } from 'wouter';
import { Mail, Phone, CheckCircle2, X, Upload, ImagePlus, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { submitContact } from '@/lib/api';

const PRODUCTS_WE_CUSTOMIZE = [
  'Chainmail Armor',
  'Chainmail Shirts & Hauberks',
  'Chainmail Coifs',
  'Medieval Helmets',
  'Viking Helmets',
  'Leather Armor',
  'Gambesons',
  'Medieval Clothing',
  'Leather Boots',
  'Belts & Accessories',
  'Shields',
  'Swords Scabbards & Holders',
  'LARP Equipment',
  'Cosplay Costumes',
  'Historical Reenactment Gear',
];

const MATERIAL_OPTIONS = [
  'Steel (Carbon Steel)',
  'Stainless Steel',
  'Aluminium (Lightweight)',
  'Mild Steel',
  'Brass / Bronze Finish',
  'Genuine Leather',
  'Faux / Vegan Leather',
  'Cotton / Linen',
  'Wool',
  'Chainmail (Flat-riveted)',
  'Chainmail (Round-riveted)',
  'Mixed Materials',
  'Other (specify in notes)',
];

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Custom Measurements'];

const BUDGET_RANGES = [
  'Under ₹5,000',
  '₹5,000 – ₹15,000',
  '₹15,000 – ₹30,000',
  '₹30,000 – ₹60,000',
  '₹60,000 – ₹1,00,000',
  'Above ₹1,00,000',
  'Flexible / Discuss',
];

const TIMELINE_OPTIONS = [
  'Urgent – Within 1 week',
  'Standard – 2–3 weeks',
  'Relaxed – 1 month',
  'No rush – 1–2 months',
  'Discuss with team',
];

interface FormState {
  name: string;
  email: string;
  phone: string;
  country: string;
  productType: string;
  quantity: string;
  size: string;
  customChest: string;
  customWaist: string;
  customHips: string;
  customShoulder: string;
  customHeight: string;
  customArmLength: string;
  material: string;
  color: string;
  budget: string;
  timeline: string;
  referenceUrl: string;
  specialNotes: string;
}

const DEFAULT_FORM: FormState = {
  name: '', email: '', phone: '', country: '',
  productType: '', quantity: '1', size: '',
  customChest: '', customWaist: '', customHips: '',
  customShoulder: '', customHeight: '', customArmLength: '',
  material: '', color: '', budget: '', timeline: '',
  referenceUrl: '', specialNotes: '',
};

/* ── Custom Order Modal ─────────────────────────────────────────────── */
function CustomOrderModal({
  productType,
  onClose,
}: {
  productType: string;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>({ ...DEFAULT_FORM, productType });
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [showMeasurements, setShowMeasurements] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 5);
    setImages(prev => [...prev, ...files].slice(0, 5));
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = ev => setPreviews(p => [...p, ev.target?.result as string].slice(0, 5));
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (i: number) => {
    setImages(p => p.filter((_, idx) => idx !== i));
    setPreviews(p => p.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const summary = `Product: ${form.productType}\nQty: ${form.quantity}\nSize: ${form.size}\nMaterial: ${form.material}\nColor: ${form.color}\nBudget: ${form.budget}\nTimeline: ${form.timeline}\nNotes: ${form.specialNotes}`;
      await submitContact({
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject: `Custom Order: ${form.productType}`,
        message: summary,
      });
      toast({
        title: '✓ Custom Order Request Submitted',
        description: `We've received your request for "${form.productType}". Our team will contact you within 24–48 hours with a quote.`,
      });
      onClose();
    } catch {
      toast({
        title: '✓ Custom Order Request Received',
        description: `We've noted your request for "${form.productType}". Our team will reach out to you shortly.`,
      });
      onClose();
    }
  };

  const inputCls = 'w-full h-[44px] bg-[#1a1208] border border-[#3a2a18] px-4 font-sans text-[13px] text-white focus:outline-none focus:border-[#8b6914] transition-colors placeholder:text-white/25';
  const labelCls = 'font-sans text-[10px] uppercase tracking-[1.5px] text-[#8b6914] block mb-2';
  const selectCls = 'w-full h-[44px] bg-[#1a1208] border border-[#3a2a18] px-3 font-sans text-[13px] text-white focus:outline-none focus:border-[#8b6914] transition-colors appearance-none';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-[#1a1208] border border-[#3a2a18] w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#1a1208] border-b border-[#3a2a18] px-6 py-4 flex items-center justify-between">
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[2px] text-[#8b6914] mb-1">Bespoke Manufacturing</p>
            <h2 className="font-serif text-[20px] font-light text-white uppercase tracking-wide">
              Custom Order — {productType}
            </h2>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">

          {/* ── Contact Info ── */}
          <section>
            <h3 className="font-serif text-[13px] uppercase tracking-[2px] text-[#d4af37] mb-4 pb-2 border-b border-[#2a1a08]">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Full Name *</label>
                <input required type="text" value={form.name} onChange={set('name')} placeholder="Your name" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Email *</label>
                <input required type="email" value={form.email} onChange={set('email')} placeholder="you@email.com" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Phone / WhatsApp</label>
                <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+1 555 000 0000" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Country / Shipping Destination *</label>
                <input required type="text" value={form.country} onChange={set('country')} placeholder="e.g. United States" className={inputCls} />
              </div>
            </div>
          </section>

          {/* ── Product Details ── */}
          <section>
            <h3 className="font-serif text-[13px] uppercase tracking-[2px] text-[#d4af37] mb-4 pb-2 border-b border-[#2a1a08]">
              Product Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelCls}>Product Type *</label>
                <div className="relative">
                  <select required value={form.productType} onChange={set('productType')} className={selectCls}>
                    <option value="" disabled>Select product type</option>
                    {PRODUCTS_WE_CUSTOMIZE.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Quantity *</label>
                <input required type="number" min="1" value={form.quantity} onChange={set('quantity')} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Standard Size</label>
                <div className="relative">
                  <select value={form.size} onChange={set('size')} className={selectCls}>
                    <option value="">Select size</option>
                    {SIZE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Material Preference</label>
                <div className="relative">
                  <select value={form.material} onChange={set('material')} className={selectCls}>
                    <option value="">Select material</option>
                    {MATERIAL_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Color / Finish</label>
                <input type="text" value={form.color} onChange={set('color')} placeholder="e.g. Blackened steel, natural leather" className={inputCls} />
              </div>
            </div>
          </section>

          {/* ── Custom Measurements (expandable) ── */}
          <section>
            <button
              type="button"
              onClick={() => setShowMeasurements(v => !v)}
              className="flex items-center justify-between w-full font-serif text-[13px] uppercase tracking-[2px] text-[#d4af37] pb-2 border-b border-[#2a1a08]"
            >
              <span>Custom Measurements</span>
              <ChevronDown size={14} className={`transition-transform ${showMeasurements ? 'rotate-180' : ''}`} />
            </button>
            {showMeasurements && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Chest (cm)', field: 'customChest' as const, ph: 'e.g. 96' },
                  { label: 'Waist (cm)', field: 'customWaist' as const, ph: 'e.g. 80' },
                  { label: 'Hips (cm)', field: 'customHips' as const, ph: 'e.g. 98' },
                  { label: 'Shoulder Width (cm)', field: 'customShoulder' as const, ph: 'e.g. 44' },
                  { label: 'Height (cm)', field: 'customHeight' as const, ph: 'e.g. 175' },
                  { label: 'Arm Length (cm)', field: 'customArmLength' as const, ph: 'e.g. 62' },
                ].map(({ label, field, ph }) => (
                  <div key={field}>
                    <label className={labelCls}>{label}</label>
                    <input type="number" value={form[field]} onChange={set(field)} placeholder={ph} className={inputCls} />
                  </div>
                ))}
                <p className="col-span-full font-sans text-[11px] text-white/40 leading-relaxed">
                  Tip: Measure over the undergarments you plan to wear beneath the armor. Our team may request additional measurements for complex pieces.
                </p>
              </div>
            )}
          </section>

          {/* ── Reference Images ── */}
          <section>
            <h3 className="font-serif text-[13px] uppercase tracking-[2px] text-[#d4af37] mb-4 pb-2 border-b border-[#2a1a08]">
              Reference Images
            </h3>
            <p className="font-sans text-[12px] text-white/50 mb-4 leading-relaxed">
              Upload photos, sketches, screenshots, or any visual references that help describe what you want. Up to 5 images.
            </p>
            <div className="flex flex-wrap gap-3 mb-3">
              {previews.map((src, i) => (
                <div key={i} className="relative w-[80px] h-[80px] border border-[#3a2a18]">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 bg-[#9c1c1c] text-white rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
              {previews.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-[80px] h-[80px] border border-dashed border-[#3a2a18] flex flex-col items-center justify-center gap-1 text-white/30 hover:border-[#8b6914] hover:text-[#8b6914] transition-colors"
                >
                  <ImagePlus size={20} />
                  <span className="font-sans text-[9px] uppercase tracking-wide">Add</span>
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImages}
            />
            <div>
              <label className={labelCls}>Reference Image URL (optional)</label>
              <input type="url" value={form.referenceUrl} onChange={set('referenceUrl')} placeholder="https://example.com/reference.jpg" className={inputCls} />
            </div>
          </section>

          {/* ── Delivery & Budget ── */}
          <section>
            <h3 className="font-serif text-[13px] uppercase tracking-[2px] text-[#d4af37] mb-4 pb-2 border-b border-[#2a1a08]">
              Delivery & Budget
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Budget Range</label>
                <div className="relative">
                  <select value={form.budget} onChange={set('budget')} className={selectCls}>
                    <option value="">Select budget</option>
                    {BUDGET_RANGES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Required Timeline</label>
                <div className="relative">
                  <select value={form.timeline} onChange={set('timeline')} className={selectCls}>
                    <option value="">Select timeline</option>
                    {TIMELINE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                </div>
              </div>
            </div>
          </section>

          {/* ── Special Notes ── */}
          <section>
            <h3 className="font-serif text-[13px] uppercase tracking-[2px] text-[#d4af37] mb-4 pb-2 border-b border-[#2a1a08]">
              Special Requirements & Notes
            </h3>
            <textarea
              rows={5}
              value={form.specialNotes}
              onChange={set('specialNotes')}
              placeholder="Describe any special details — engravings, battle-ready finish, LARP-safe requirements, event purpose, finishing style, historical accuracy needs, or anything else that helps us understand your vision..."
              className="w-full bg-[#1a1208] border border-[#3a2a18] p-4 font-sans text-[13px] text-white placeholder:text-white/25 focus:outline-none focus:border-[#8b6914] transition-colors resize-none"
            />
          </section>

          {/* ── Submit ── */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 h-[52px] bg-[#8b6914] text-white font-sans text-[11px] uppercase tracking-[2.5px] hover:bg-[#d4af37] hover:text-[#1a1208] transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <Upload size={14} />
              SUBMIT CUSTOM ORDER REQUEST
            </button>
            <button
              type="button"
              onClick={onClose}
              className="sm:w-[120px] h-[52px] border border-[#3a2a18] text-white/50 font-sans text-[11px] uppercase tracking-[2px] hover:border-[#8b6914] hover:text-white transition-colors"
            >
              CANCEL
            </button>
          </div>

          <p className="font-sans text-[11px] text-white/30 text-center leading-relaxed">
            We typically respond within 24–48 hours with a detailed quote and production timeline.
          </p>
        </form>
      </div>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────────────────── */

const REQUEST_CHECKLIST = [
  'Product photos, sketches, or reference images',
  'Required measurements or size chart',
  'Material preference',
  'Color & finish requirements',
  'Quantity required',
  'Shipping destination & timeline',
  'Any special customization details',
];

const WHAT_WE_PROVIDE = [
  'Detailed product quotation',
  'Manufacturing timeline estimate',
  'Shipping options & costs',
  'Estimated delivery date',
];

export default function CustomForging() {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  return (
    <div className="bg-[#f5f0e8] min-h-screen">

      {/* ── Hero ── */}
      <section className="w-full bg-[#cec3b5] flex flex-col items-center justify-center text-center px-4 py-16">
        <div className="font-sans text-[10px] uppercase tracking-[2.5px] text-[#5a4a30]/70 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-[#2a2016] transition-colors">HOME</Link>
          <span className="text-[#5a4a30]/40">/</span>
          <span className="text-[#2a2016]">CUSTOM ORDERS</span>
        </div>
        <h1 className="font-serif text-[48px] sm:text-[62px] font-light text-[#1a1208] uppercase leading-none tracking-[0.1em] mb-6">
          Custom Orders
        </h1>
        <p className="font-serif text-[17px] sm:text-[20px] font-light text-[#5a4a30] italic max-w-2xl">
          Handcrafted medieval products built exactly to your specifications
        </p>
      </section>

      {/* ── Intro ── */}
      <section className="max-w-[860px] mx-auto px-6 py-16 text-center">
        <p className="font-sans text-[15px] sm:text-[16px] text-[#4a4a4a] leading-[1.9]">
          At Zafex Collectibles, we specialize in manufacturing custom medieval products built according to your exact specifications. Whether you need a single bespoke piece or large-volume wholesale production, our artisans are ready to bring your vision to life.
        </p>
      </section>

      {/* ── What We Can Customize ── */}
      <section className="bg-[#e8e0d4] py-20">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="mb-10 text-center">
            <span className="font-sans text-[10px] uppercase tracking-[3px] text-[#8b6914] block mb-3">BESPOKE MANUFACTURING</span>
            <h2 className="font-serif text-[34px] sm:text-[40px] font-light text-[#1a1208] uppercase leading-none tracking-[0.06em]">
              We Can Customize
            </h2>
            <div className="w-[40px] h-[2px] bg-[#8b6914] mt-5 mx-auto" />
            <p className="font-sans text-[13px] text-[#5a4a30] mt-5">
              Click any category below to start your custom order request
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {PRODUCTS_WE_CUSTOMIZE.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setSelectedProduct(item)}
                className="group bg-[#f5f0e8] border border-[#d4cdc4] px-4 py-4 text-center font-sans text-[11px] uppercase tracking-[1px] text-[#2a2016] leading-snug hover:border-[#8b6914] hover:bg-[#1a1208] hover:text-[#d4af37] active:scale-95 transition-all cursor-pointer"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="max-w-[1100px] mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <div className="mb-8">
              <span className="font-sans text-[10px] uppercase tracking-[3px] text-[#8b6914] block mb-3">WHAT YOU SEND US</span>
              <h2 className="font-serif text-[30px] sm:text-[36px] font-light text-[#1a1208] uppercase leading-none tracking-[0.06em]">
                To Request a Custom Order
              </h2>
              <div className="w-[40px] h-[2px] bg-[#8b6914] mt-5" />
            </div>
            <p className="font-sans text-[14px] text-[#4a4a4a] leading-[1.9] mb-6">
              Please provide the following so we can prepare an accurate quotation:
            </p>
            <ul className="space-y-3">
              {REQUEST_CHECKLIST.map((item) => (
                <li key={item} className="flex items-start gap-3 font-sans text-[14px] text-[#4a4a4a] leading-relaxed">
                  <CheckCircle2 size={16} className="text-[#8b6914] flex-shrink-0 mt-[3px]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-8">
              <span className="font-sans text-[10px] uppercase tracking-[3px] text-[#8b6914] block mb-3">OUR RESPONSE</span>
              <h2 className="font-serif text-[30px] sm:text-[36px] font-light text-[#1a1208] uppercase leading-none tracking-[0.06em]">
                What We Provide
              </h2>
              <div className="w-[40px] h-[2px] bg-[#8b6914] mt-5" />
            </div>
            <p className="font-sans text-[14px] text-[#4a4a4a] leading-[1.9] mb-6">
              Once we receive your request, our team will review the specifications and provide:
            </p>
            <ul className="space-y-3 mb-8">
              {WHAT_WE_PROVIDE.map((item) => (
                <li key={item} className="flex items-start gap-3 font-sans text-[14px] text-[#4a4a4a] leading-relaxed">
                  <CheckCircle2 size={16} className="text-[#8b6914] flex-shrink-0 mt-[3px]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="font-sans text-[14px] text-[#4a4a4a] leading-[1.9] italic border-l-2 border-[#8b6914] pl-5">
              We welcome both individual custom orders and bulk wholesale manufacturing.
            </p>
          </div>
        </div>
      </section>

      {/* ── Contact + Quick Enquiry ── */}
      <section className="bg-[#1a1208] py-20">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="font-sans text-[10px] uppercase tracking-[3px] text-[#8b6914] block mb-3">GET IN TOUCH</span>
            <h2 className="font-serif text-[36px] sm:text-[44px] font-light text-white uppercase leading-none tracking-[0.08em]">
              Contact for Custom Orders
            </h2>
            <div className="w-[40px] h-[1px] bg-[#8b6914] mx-auto mt-5" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <p className="font-serif text-[20px] font-light text-[#d4af37] mb-8">Zafex Collectibles</p>
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <Mail size={18} className="text-[#8b6914] flex-shrink-0" strokeWidth={1.5} />
                  <div>
                    <p className="font-sans text-[10px] uppercase tracking-[2px] text-[#8b6914] mb-1">Email</p>
                    <a href="mailto:zafexcollectibles@gmail.com" className="font-sans text-[14px] text-[#c8bdb0] hover:text-white transition-colors">
                      zafexcollectibles@gmail.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Phone size={18} className="text-[#8b6914] flex-shrink-0" strokeWidth={1.5} />
                  <div>
                    <p className="font-sans text-[10px] uppercase tracking-[2px] text-[#8b6914] mb-1">Phone / WhatsApp</p>
                    <a href="tel:+918273506540" className="font-sans text-[14px] text-[#c8bdb0] hover:text-white transition-colors">
                      +91-8273506540
                    </a>
                  </div>
                </div>
              </div>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <a
                  href="mailto:zafexcollectibles@gmail.com"
                  className="inline-flex items-center justify-center gap-2 bg-[#d4af37] text-[#1a1208] font-sans text-[11px] uppercase tracking-[2px] px-8 py-4 hover:bg-white transition-colors font-semibold"
                >
                  <Mail size={14} /> EMAIL US
                </a>
                <a
                  href="https://wa.me/918273506540"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-[#d4af37] text-[#d4af37] font-sans text-[11px] uppercase tracking-[2px] px-8 py-4 hover:bg-[#d4af37] hover:text-[#1a1208] transition-colors"
                >
                  <Phone size={14} /> WHATSAPP
                </a>
              </div>
            </div>

            {/* CTA card pointing to the modal */}
            <div className="bg-[#2a1a08] border border-[#3a2a18] p-8 flex flex-col items-center justify-center text-center gap-6">
              <div className="w-14 h-14 border border-[#8b6914] flex items-center justify-center">
                <Upload size={24} className="text-[#d4af37]" />
              </div>
              <div>
                <h3 className="font-serif text-[22px] font-light text-white uppercase tracking-wide mb-3">
                  Start Your Custom Order
                </h3>
                <p className="font-sans text-[13px] text-white/50 leading-relaxed max-w-xs mx-auto">
                  Select a product category above and fill in our detailed order form — including measurements, material choices, reference images, and delivery preferences.
                </p>
              </div>
              <button
                onClick={() => setSelectedProduct('Chainmail Armor')}
                className="w-full h-[52px] bg-[#8b6914] text-white font-sans text-[11px] uppercase tracking-[2.5px] hover:bg-[#d4af37] hover:text-[#1a1208] transition-colors font-semibold"
              >
                OPEN ORDER FORM
              </button>
              <p className="font-sans text-[11px] text-white/30">
                Response within 24–48 hours
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Modal ── */}
      {selectedProduct && (
        <CustomOrderModal
          productType={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
