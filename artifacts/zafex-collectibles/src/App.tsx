import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Route, Switch, Router as WouterRouter, useLocation, Redirect } from 'wouter';
import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ScrollProgress } from '@/components/ScrollProgress';
import { AuthProvider } from '@/contexts/AuthContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { CompareProvider } from '@/contexts/CompareContext';
import { CompareModal } from '@/components/CompareModal';
import { CompareDock } from '@/components/CompareDock';
import ErrorBoundary from '@/components/ErrorBoundary';
import NotFound from '@/pages/not-found';

import AdminLogin from '@/pages/admin/AdminLogin';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminCustomers from '@/pages/admin/AdminCustomers';
import AdminContacts from '@/pages/admin/AdminContacts';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminProductForm from '@/pages/admin/AdminProductForm';
import AdminHomepage from '@/pages/admin/AdminHomepage';

import Home from '@/pages/Home';
import Shop from '@/pages/Shop';
import ProductDetail from '@/pages/ProductDetail';
import Cart from '@/pages/Cart';
import Wishlist from '@/pages/Wishlist';
import Checkout from '@/pages/Checkout';
import Account from '@/pages/Account';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import OrderDetail from '@/pages/OrderDetail';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import CategoryPage from '@/pages/CategoryPage';
import CustomForging from '@/pages/CustomForging';
import Blog from '@/pages/Blog';
import Resources from '@/pages/Resources';

gsap.registerPlugin(ScrollTrigger);

/* ── Simple content wrapper ─────────────────────────────────────────── */
function ContentPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      <section className="w-full bg-[#cec3b5] flex flex-col items-center justify-center text-center px-4 py-14">
        <h1 className="font-serif text-[48px] sm:text-[60px] font-light text-[#1a1208] uppercase leading-none tracking-[0.1em]">
          {title}
        </h1>
      </section>
      <div className="container mx-auto px-8 py-16 max-w-3xl">
        <div className="prose prose-stone font-sans text-[#4a4a4a] leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

/* ── Static policy / info pages ─────────────────────────────────────── */
const Faqs = () => (
  <ContentPage title="FAQs">
    {[
      ['Do you ship internationally?', 'Yes. We ship worldwide using trusted international courier partners.'],
      ['Can I request a custom product?', 'Yes. We specialize in custom-made medieval armor, chainmail, leather goods, and historical costumes.'],
      ['How long does production take?', 'Ready-made items generally ship within 2–5 business days. Custom orders usually require 7–21 business days.'],
      ['Which payment methods do you accept?', 'We accept major credit and debit cards and other secure payment methods available during checkout.'],
      ['Will I receive tracking information?', 'Yes. Tracking details are emailed once your order has been shipped.'],
      ['Are import duties included?', 'No. Buyers are responsible for any customs duties, VAT, GST, or import taxes required by their country.'],
      ['Do you offer wholesale pricing?', 'Yes. We welcome wholesale and bulk manufacturing inquiries.'],
    ].map(([question, answer]) => (
      <section key={question} className="border-b border-[#d4cfc7] py-5">
        <h3 className="mb-2 font-serif text-xl text-[#1a1a18]">{question}</h3>
        <p>{answer}</p>
      </section>
    ))}
  </ContentPage>
);
const SizeGuide = () => (
  <ContentPage title="Size Guide">
    <p>Detailed sizing charts for standard apparel coming soon. For custom armour commissions, our artisan team will provide a specific measurement template requiring over 15 points of measure to ensure a perfect fit.</p>
  </ContentPage>
);
const Maintenance = () => (
  <ContentPage title="Care & Maintenance">
    <h3 className="font-serif text-xl text-[#1a1a18] mt-8 mb-4">Steel Armour & Weapons</h3>
    <p>Always oil your carbon steel pieces after use or handling to prevent rust. Renaissance wax or mineral oil works best. Store in a dry, climate-controlled environment.</p>
    <h3 className="font-serif text-xl text-[#1a1a18] mt-8 mb-4">Leather Goods</h3>
    <p>Do not leave leather in direct sunlight or extreme heat. Treat periodically with a high-quality leather conditioner or mink oil.</p>
  </ContentPage>
);
const Safety   = () => <ContentPage title="Product Safety"><p>Our historical replicas are accurate and can be inherently dangerous. They are sold strictly for display, theatrical, or supervised sporting use only. LARP weapons should be checked for core damage or foam tears before every event.</p></ContentPage>;
const Privacy  = () => (
  <ContentPage title="Privacy Policy">
    <p>At Zafex Collectibles, we respect your privacy and are committed to protecting your personal information.</p>
    <h3 className="mt-8 mb-4 font-serif text-xl text-[#1a1a18]">Information We Collect</h3>
    <p>We may collect:</p>
    <ul>
      <li>Name</li>
      <li>Email address</li>
      <li>Phone number</li>
      <li>Billing and shipping address</li>
      <li>Order details</li>
      <li>Payment information (processed securely by third-party payment providers)</li>
      <li>Website usage information through cookies</li>
    </ul>
    <h3 className="mt-8 mb-4 font-serif text-xl text-[#1a1a18]">How We Use Your Information</h3>
    <p>We use your information to:</p>
    <ul>
      <li>Process and fulfill orders</li>
      <li>Provide customer support</li>
      <li>Send shipping updates</li>
      <li>Improve our website and services</li>
      <li>Prevent fraud and unauthorized transactions</li>
    </ul>
    <h3 className="mt-8 mb-4 font-serif text-xl text-[#1a1a18]">Data Protection</h3>
    <p>We implement appropriate security measures to protect your personal information from unauthorized access, misuse, or disclosure.</p>
    <h3 className="mt-8 mb-4 font-serif text-xl text-[#1a1a18]">Third-Party Services</h3>
    <p>We may use trusted third-party providers such as payment gateways, shipping companies, and analytics services to operate our business efficiently.</p>
    <h3 className="mt-8 mb-4 font-serif text-xl text-[#1a1a18]">Cookies</h3>
    <p>Our website uses cookies to improve user experience, remember preferences, and analyze website traffic.</p>
    <h3 className="mt-8 mb-4 font-serif text-xl text-[#1a1a18]">Your Rights</h3>
    <p>You may request access to, correction of, or deletion of your personal information by contacting us.</p>
    <h3 className="mt-8 mb-4 font-serif text-xl text-[#1a1a18]">Contact</h3>
    <p>If you have any questions regarding this Privacy Policy, please contact us using the information provided on our Contact page.</p>
  </ContentPage>
);
const Shipping = () => (
  <ContentPage title="Shipping Policy">
    <h3 className="mt-8 mb-4 font-serif text-xl text-[#1a1a18]">Processing Time</h3>
    <ul>
      <li><strong>Ready-to-Ship Products:</strong> 2–5 business days</li>
      <li><strong>Handmade Products:</strong> 3–7 business days</li>
      <li><strong>Custom Orders:</strong> 7–21 business days (depending on complexity)</li>
    </ul>

    <h3 className="mt-8 mb-4 font-serif text-xl text-[#1a1a18]">Shipping Partners</h3>
    <ul>
      <li>FedEx</li>
      <li>DHL Express</li>
      <li>UPS</li>
      <li>USPS</li>
      <li>India Post (where available)</li>
    </ul>

    <h3 className="mt-8 mb-4 font-serif text-xl text-[#1a1a18]">Estimated Delivery Time</h3>
    <h4 className="mt-6 mb-3 font-serif text-lg text-[#1a1a18]">Express Shipping</h4>
    <ul>
      <li><strong>USA &amp; Canada:</strong> 4–8 business days</li>
      <li><strong>Europe:</strong> 4–10 business days</li>
      <li><strong>Australia &amp; New Zealand:</strong> 5–12 business days</li>
      <li><strong>Rest of the World:</strong> 5–15 business days</li>
    </ul>
    <h4 className="mt-6 mb-3 font-serif text-lg text-[#1a1a18]">Standard Shipping</h4>
    <ul>
      <li><strong>USA &amp; Canada:</strong> 10–15 business days</li>
      <li><strong>Europe:</strong> 8–14 business days</li>
      <li><strong>Australia &amp; New Zealand:</strong> 10–18 business days</li>
      <li><strong>Rest of the World:</strong> 10–20 business days</li>
    </ul>

    <h3 className="mt-8 mb-4 font-serif text-xl text-[#1a1a18]">Customs &amp; Import Taxes</h3>
    <p>International buyers are responsible for any customs duties, VAT, GST, import taxes, brokerage fees, or other charges imposed by their country's customs authorities.</p>

    <h3 className="mt-8 mb-4 font-serif text-xl text-[#1a1a18]">Order Tracking</h3>
    <p>A tracking number will be provided via email once your order has been dispatched.</p>

    <h3 className="mt-8 mb-4 font-serif text-xl text-[#1a1a18]">Shipping Support</h3>
    <p>For any shipping-related questions, please contact us.</p>
    <p className="mt-4">
      Email: <a className="text-[#8b6914] hover:underline" href="mailto:zafexcollectibles@gmail.com">zafexcollectibles@gmail.com</a><br />
      Phone / WhatsApp: <a className="text-[#8b6914] hover:underline" href="tel:+918273506540">+91-8273506540</a>
    </p>
  </ContentPage>
);
const Refund = () => (
  <ContentPage title="Return & Refund Policy">
    <h3 className="mt-8 mb-4 font-serif text-xl text-[#1a1a18]">Returns</h3>
    <p>At Zafex Collectibles, customer satisfaction is our priority. If you are not completely satisfied with your purchase, you may request a return under the following conditions.</p>
    <p className="mt-4">Eligible returns must be requested within 30 days of receiving your order.</p>
    <p className="mt-4">Items must be:</p>
    <ul>
      <li>Unused and in their original condition.</li>
      <li>Returned with original packaging whenever possible.</li>
      <li>Free from damage caused by misuse, alteration, or improper handling.</li>
    </ul>
    <h3 className="mt-8 mb-4 font-serif text-xl text-[#1a1a18]">Non-Returnable Items</h3>
    <p>The following items cannot be returned unless they arrive damaged or defective:</p>
    <ul>
      <li>Custom-made products</li>
      <li>Personalized items</li>
      <li>Made-to-order products</li>
      <li>Clearance or final sale items</li>
    </ul>
    <h3 className="mt-8 mb-4 font-serif text-xl text-[#1a1a18]">Damaged or Incorrect Orders</h3>
    <p>If your order arrives damaged, defective, or you receive the wrong item, please contact us within 7 days of delivery. Include your order number and clear photographs of the item and packaging so we can resolve the issue promptly.</p>
    <h3 className="mt-8 mb-4 font-serif text-xl text-[#1a1a18]">Refunds</h3>
    <p>Once your returned item has been received and inspected, we will notify you regarding the approval of your refund.</p>
    <p className="mt-4">Approved refunds will be issued to the original payment method within 5–10 business days, depending on your payment provider.</p>
    <h3 className="mt-8 mb-4 font-serif text-xl text-[#1a1a18]">Return Shipping</h3>
    <p>If the return is due to our error, we will cover the return shipping costs.</p>
    <p className="mt-4">For all other returns, customers are responsible for return shipping charges.</p>
    <h3 className="mt-8 mb-4 font-serif text-xl text-[#1a1a18]">Contact</h3>
    <p>For return assistance, please contact our customer support team.</p>
    <p className="mt-4">Email: <a className="text-[#8b6914] hover:underline" href="mailto:zafexcollectibles@gmail.com">zafexcollectibles@gmail.com</a><br />Phone / WhatsApp: <a className="text-[#8b6914] hover:underline" href="tel:+918273506540">+91-8273506540</a></p>
  </ContentPage>
);
const Terms = () => (
  <ContentPage title="Terms & Conditions">
    <p>By using the Zafex Collectibles website, you agree to the following terms.</p>

    <h3 className="mt-8 mb-4 font-serif text-xl text-[#1a1a18]">Products</h3>
    <p>All products are handcrafted. Minor differences in color, finish, texture, or dimensions are part of the handmade manufacturing process and should not be considered defects.</p>

    <h3 className="mt-8 mb-4 font-serif text-xl text-[#1a1a18]">Pricing</h3>
    <p>Prices may change without prior notice.</p>

    <h3 className="mt-8 mb-4 font-serif text-xl text-[#1a1a18]">Orders</h3>
    <p>We reserve the right to cancel or refuse any order if necessary, including cases involving pricing errors, suspected fraud, or product availability.</p>

    <h3 className="mt-8 mb-4 font-serif text-xl text-[#1a1a18]">Custom Orders</h3>
    <p>Custom-made products cannot be canceled once production has started.</p>

    <h3 className="mt-8 mb-4 font-serif text-xl text-[#1a1a18]">Intellectual Property</h3>
    <p>All website content, including text, photographs, logos, graphics, and product descriptions, is the property of Zafex Collectibles and may not be copied without written permission.</p>

    <h3 className="mt-8 mb-4 font-serif text-xl text-[#1a1a18]">Limitation of Liability</h3>
    <p>Zafex Collectibles shall not be liable for indirect or consequential damages arising from the use of our products or website.</p>

    <h3 className="mt-8 mb-4 font-serif text-xl text-[#1a1a18]">Governing Law</h3>
    <p>These Terms shall be governed by the laws of India.</p>

    <h3 className="mt-8 mb-4 font-serif text-xl text-[#1a1a18]">Contact</h3>
    <p>For questions regarding these Terms, please contact our customer support team.</p>
  </ContentPage>
);
const BuyingGuides = () => {
  const guideCards = [
    {
      title: "1. KNOW WHAT YOU'RE LOOKING FOR",
      text: "Start by deciding what type of collectible you want. Consider your favourite characters, themes, styles, materials, and the purpose of the piece.",
    },
    {
      title: '2. CHOOSE THE RIGHT SIZE',
      text: 'Think about where you plan to display your collectible. Measure your shelf, cabinet, desk, or display area before purchasing. Always check the product dimensions for the exact size.',
    },
    {
      title: '3. CONSIDER THE MATERIAL',
      text: 'Different materials offer different looks, textures, durability, and care requirements. Check the product description to understand what your collectible is made from.',
    },
    {
      title: '4. PICK A STYLE OR THEME',
      text: "Build your collection around the themes you love. You can choose by character, fantasy, movies, gaming, historical designs, kids' themes, or other interests.",
    },
    {
      title: '5. THINK ABOUT THE PURPOSE',
      text: 'Are you buying for yourself, gifting someone, decorating a space, or building a collection? Knowing the purpose makes it easier to choose the right product.',
    },
    {
      title: '6. BUYING AS A GIFT',
      text: "When choosing a gift, consider the person's age, interests, favourite characters, hobbies, and available display space. A thoughtful collectible can become a memorable part of someone's collection.",
    },
    {
      title: '7. CHECK PRODUCT DETAILS',
      text: 'Before placing your order, review the product description, dimensions, materials, recommended age, care instructions, and any other specifications provided on the product page.',
    },
    {
      title: '8. DISPLAY & CARE',
      text: 'Once you receive your collectible, choose a suitable display location. Keep it away from excessive moisture, direct sunlight, dust, and extreme temperatures where applicable. Follow the product-specific care instructions.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <section className="bg-[#cec3b5] px-4 py-14 text-center">
        <h1 className="font-serif text-[58px] font-light uppercase leading-none tracking-[0.05em] text-[#1a1208] sm:text-[80px]">
          BUYING GUIDE
        </h1>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="space-y-12">
          <div className="space-y-6">
            <h2 className="font-serif text-[42px] font-medium uppercase leading-[0.95] tracking-[-0.02em] text-[#1a1208]">
              CHOOSE THE RIGHT COLLECTIBLE
            </h2>
            <p className="max-w-[1100px] font-sans text-[18px] leading-[1.7] text-[#3f3a35]">
              Finding the perfect collectible is all about choosing something that matches your interests, space, and purpose. Whether you're starting your first collection, looking for a unique gift, or adding a new statement piece, this guide will help you make the right choice.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {guideCards.map((card) => (
              <div
                key={card.title}
                className="min-h-[210px] rounded-[22px] border border-[#d7cfc0] bg-[#efe7dc] p-6 shadow-[0_6px_18px_rgba(33,25,17,0.04)]"
              >
                <h3 className="font-serif text-[24px] font-medium uppercase leading-tight tracking-[0.02em] text-[#1a1208]">
                  {card.title}
                </h3>
                <p className="mt-4 font-sans text-[14px] leading-[1.9] text-[#4d4742]">
                  {card.text}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-8">
            <h3 className="font-serif text-[32px] font-medium uppercase leading-none tracking-[-0.02em] text-[#1a1208]">
              FIND SOMETHING YOU LOVE
            </h3>
            <p className="mt-5 max-w-[1000px] font-sans text-[16px] leading-[1.8] text-[#3f3a35]">
              Your collection should reflect what you enjoy. Take your time, explore different designs, and choose pieces that you'll be proud to display.
            </p>
            <div className="mt-10 border-t border-[#d7cfc0] pt-6">
              <p className="font-serif text-[16px] uppercase tracking-[0.18em] text-[#8b6914]">ZAFEX COLLECTIBLES</p>
              <p className="mt-2 font-sans text-[16px] italic text-[#5a4a30]">Collect. Display. Enjoy.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
const ChainmailGuide = () => {
  const sizeTips = [
    'Wear the clothing you plan to wear underneath while measuring.',
    'Keep the measuring tape level and comfortably snug.',
    'Do not pull the tape too tightly.',
    'Compare your measurements with the specific product\'s size chart.',
    'If you are between sizes, consider the amount of layering and movement you need.',
  ];

  const measurementCards = [
    {
      title: 'CHEST MEASUREMENT',
      text: 'Measure around the fullest part of your chest, keeping the measuring tape level and comfortably snug.',
    },
    {
      title: 'WAIST MEASUREMENT',
      text: 'Measure around your natural waist without pulling the tape too tightly. This helps ensure comfortable movement when wearing the chainmail.',
    },
    {
      title: 'SHOULDER WIDTH',
      text: 'Measure from one shoulder point to the other across your upper back. This is especially important for chainmail shirts, hauberks, and similar garments.',
    },
    {
      title: 'ARM & SLEEVE LENGTH',
      text: 'Measure from the shoulder down along your arm to the point where you want the chainmail sleeve to end.',
    },
    {
      title: 'LENGTH',
      text: 'Measure from the shoulder down to your desired bottom length. Consider whether you will wear the chainmail over other clothing or armour.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <section className="bg-[#cec3b5] px-4 py-14 text-center">
        <h1 className="font-serif text-[58px] font-light uppercase leading-none tracking-[0.05em] text-[#1a1208] sm:text-[80px]">
          CHAINMAIL SIZE GUIDE
        </h1>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="space-y-12">
          <div className="space-y-6">
            <p className="max-w-[1100px] font-sans text-[18px] leading-[1.8] text-[#3f3a35]">
              For the best fit, take your measurements while wearing the clothing you plan to wear underneath your chainmail. A comfortable fit should allow enough room for movement without making the garment excessively loose.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {measurementCards.map((card) => (
              <div
                key={card.title}
                className="min-h-[220px] rounded-[22px] border border-[#d7cfc0] bg-[#efe7dc] p-6 shadow-[0_6px_18px_rgba(33,25,17,0.04)]"
              >
                <h3 className="font-serif text-[24px] font-medium uppercase leading-tight tracking-[0.02em] text-[#1a1208]">
                  {card.title}
                </h3>
                <p className="mt-4 font-sans text-[14px] leading-[1.9] text-[#4d4742]">
                  {card.text}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-[22px] border border-[#d7cfc0] bg-[#efe7dc] p-8 shadow-[0_6px_18px_rgba(33,25,17,0.04)]">
            <h3 className="font-serif text-[32px] font-medium uppercase leading-none tracking-[-0.02em] text-[#1a1208]">
              FOR THE BEST FIT
            </h3>
            <ul className="mt-5 space-y-3 font-sans text-[16px] leading-[1.8] text-[#3f3a35]">
              {sizeTips.map((tip) => (
                <li key={tip} className="flex gap-3">
                  <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[#8b6914]" aria-hidden="true" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6 rounded-[22px] border border-[#d7cfc0] bg-[#f0e9e0] p-8">
            <h3 className="font-serif text-[30px] font-medium uppercase leading-none tracking-[-0.02em] text-[#1a1208]">
              IMPORTANT
            </h3>
            <p className="font-sans text-[16px] leading-[1.8] text-[#3f3a35]">
              Chainmail designs can vary in weight, construction, drape, and sizing. Always check the individual product listing for exact measurements and available sizes before ordering.
            </p>
            <div className="border-t border-[#d7cfc0] pt-6">
              <p className="font-sans text-[18px] leading-[1.8] text-[#3f3a35]">
                <strong>Need help choosing a size?</strong>
              </p>
              <p className="mt-3 font-sans text-[16px] leading-[1.8] text-[#3f3a35]">
                Contact the Zafex team with your measurements and the product you're interested in, and we'll help you find the most suitable option.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
const HelmetGuide = () => {
  const helmetCards = [
    {
      title: 'HOW TO MEASURE YOUR HEAD',
      text: 'Use a flexible measuring tape and wrap it around the widest part of your head, approximately 2–3 cm above your eyebrows and across the widest point at the back. Keep the tape level and comfortably snug. Record your measurement in centimetres (cm).',
    },
    {
      title: 'CHECK YOUR MEASUREMENT',
      text: 'Compare your head circumference with the size chart provided on the individual product page. Helmet sizes and internal dimensions can vary depending on the design and construction.',
    },
    {
      title: 'CONSIDER HEADWEAR',
      text: 'If you plan to wear the helmet with a hood, cap, wig, liner, or other headwear, take your measurement with the intended layer in place.',
    },
    {
      title: 'CHECK THE FIT',
      text: 'A correctly fitted helmet should sit securely on your head, feel comfortable without excessive pressure, stay in position when you gently move your head, allow comfortable movement, and not feel excessively loose or unstable.',
    },
    {
      title: 'BEFORE YOU ORDER',
      text: 'Always check the individual product listing for head circumference, internal dimensions, available sizes, padding or lining, materials, and product-specific fit information.',
    },
    {
      title: 'IMPORTANT SAFETY NOTE',
      text: 'Decorative, costume, cosplay, historical, or collectible helmets are not automatically protective safety equipment. Do not use a decorative helmet for safety or impact protection unless the specific product is explicitly certified and designed for that purpose.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <section className="bg-[#cec3b5] px-4 py-14 text-center">
        <h1 className="font-serif text-[58px] font-light uppercase leading-none tracking-[0.05em] text-[#1a1208] sm:text-[80px]">
          HELMET SIZE GUIDE
        </h1>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="space-y-10">
          <div className="space-y-6">
            <p className="max-w-[1100px] font-sans text-[18px] leading-[1.8] text-[#3f3a35]">
              Choosing the right helmet size starts with getting an accurate head measurement. A properly sized helmet should feel secure and comfortable without creating excessive pressure.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {helmetCards.map((card) => (
              <div
                key={card.title}
                className="min-h-[220px] rounded-[22px] border border-[#d7cfc0] bg-[#efe7dc] p-6 shadow-[0_6px_18px_rgba(33,25,17,0.04)]"
              >
                <h3 className="font-serif text-[24px] font-medium uppercase leading-tight tracking-[0.02em] text-[#1a1208]">
                  {card.title}
                </h3>
                <p className="mt-4 font-sans text-[14px] leading-[1.9] text-[#4d4742]">
                  {card.text}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-[22px] border border-[#d7cfc0] bg-[#efe7dc] p-8 shadow-[0_6px_18px_rgba(33,25,17,0.04)]">
            <h3 className="font-serif text-[32px] font-medium uppercase leading-none tracking-[-0.02em] text-[#1a1208]">
              NEED HELP CHOOSING A SIZE?
            </h3>
            <p className="mt-5 font-sans text-[16px] leading-[1.8] text-[#3f3a35]">
              If you're unsure, compare your head measurement with the product's size chart before ordering. For the most accurate fit, use the measurements provided for the specific helmet you're interested in.
            </p>
            <div className="mt-6 border-t border-[#d7cfc0] pt-6">
              <p className="font-serif text-[18px] uppercase tracking-[0.18em] text-[#8b6914]">ZAFEX COLLECTIBLES &amp; ZAFS</p>
              <p className="mt-2 font-sans text-[16px] italic text-[#5a4a30]">Measure carefully. Choose confidently. Collect what you love.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
const LeatherGuide = () => {
  const careCards = [
    {
      title: '1. KEEP LEATHER CLEAN',
      text: 'Regularly remove dust and surface dirt using a soft, dry cloth. For light marks, gently wipe the area with a slightly damp cloth. Avoid soaking the leather or using excessive water.',
    },
    {
      title: '2. CONDITION REGULARLY',
      text: 'Leather can naturally become dry over time. Use a suitable leather conditioner when required to help maintain its flexibility and appearance. Always follow the instructions of the conditioner you are using.',
    },
    {
      title: '3. AVOID EXCESS MOISTURE',
      text: 'Keep leather away from prolonged exposure to water and high humidity. If your leather product becomes wet, gently remove excess moisture with a soft cloth and allow it to air-dry naturally.',
    },
    {
      title: '4. KEEP AWAY FROM DIRECT HEAT',
      text: 'Do not place leather products near heaters, radiators, hair dryers, fireplaces, or other strong heat sources. Rapid drying can cause leather to become stiff, dry, or cracked.',
    },
    {
      title: '5. PROTECT FROM DIRECT SUNLIGHT',
      text: 'Long-term exposure to direct sunlight can gradually affect the colour and finish of leather. Whenever possible, store and display your leather products in a cool, dry place away from strong direct sunlight.',
    },
    {
      title: '6. STORE PROPERLY',
      text: 'Store leather items in a clean, dry, and well-ventilated area. Avoid tightly folding, compressing, or stacking leather products for long periods. Keep the item in its natural shape whenever possible.',
    },
    {
      title: '7. TEST CLEANING PRODUCTS FIRST',
      text: 'Before applying any cleaner, conditioner, polish, or other treatment, test it on a small, hidden area first. Different leather types and finishes can react differently to cleaning products.',
    },
    {
      title: '8. HANDLE WITH CARE',
      text: 'Handle leather products with clean hands and avoid unnecessary rubbing, scratching, or rough handling. For collectible or decorative leather pieces, gentle handling will help preserve their original appearance.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <section className="bg-[#cec3b5] px-4 py-14 text-center">
        <h1 className="font-serif text-[58px] font-light uppercase leading-none tracking-[0.05em] text-[#1a1208] sm:text-[80px]">
          LEATHER CARE GUIDE
        </h1>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="space-y-12">
          <div className="space-y-6">
            <p className="max-w-[1100px] font-sans text-[18px] leading-[1.8] text-[#3f3a35]">
              Proper care helps maintain the appearance, texture, and longevity of your leather products. Follow these simple steps to keep your Zafex leather items looking their best.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {careCards.map((card) => (
              <div
                key={card.title}
                className="min-h-[220px] rounded-[22px] border border-[#d7cfc0] bg-[#efe7dc] p-6 shadow-[0_6px_18px_rgba(33,25,17,0.04)]"
              >
                <h3 className="font-serif text-[24px] font-medium uppercase leading-tight tracking-[0.02em] text-[#1a1208]">
                  {card.title}
                </h3>
                <p className="mt-4 font-sans text-[14px] leading-[1.9] text-[#4d4742]">
                  {card.text}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-[22px] border border-[#d7cfc0] bg-[#efe7dc] p-8 shadow-[0_6px_18px_rgba(33,25,17,0.04)]">
            <h3 className="font-serif text-[32px] font-medium uppercase leading-none tracking-[-0.02em] text-[#1a1208]">
              QUICK CARE CHECKLIST
            </h3>

            <div className="mt-6 grid gap-8 md:grid-cols-2">
              <div>
                <p className="mb-4 font-serif text-[20px] uppercase tracking-[0.08em] text-[#1a1208]">DO</p>
                <ul className="space-y-2 font-sans text-[16px] leading-[1.8] text-[#3f3a35]">
                  <li>• Use a soft cloth</li>
                  <li>• Keep leather dry</li>
                  <li>• Condition when appropriate</li>
                  <li>• Store in a cool, dry place</li>
                  <li>• Test products before applying</li>
                </ul>
              </div>

              <div>
                <p className="mb-4 font-serif text-[20px] uppercase tracking-[0.08em] text-[#1a1208]">AVOID</p>
                <ul className="space-y-2 font-sans text-[16px] leading-[1.8] text-[#3f3a35]">
                  <li>• Soaking leather</li>
                  <li>• Direct heat</li>
                  <li>• Harsh household cleaners</li>
                  <li>• Excessive sunlight</li>
                  <li>• Rough handling</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-6 rounded-[22px] border border-[#d7cfc0] bg-[#f0e9e0] p-8">
            <h3 className="font-serif text-[30px] font-medium uppercase leading-none tracking-[-0.02em] text-[#1a1208]">
              IMPORTANT
            </h3>
            <p className="font-sans text-[16px] leading-[1.8] text-[#3f3a35]">
              Leather types, finishes, and construction can vary from product to product. Always follow the care instructions supplied with the individual product for the best results.
            </p>
            <div className="border-t border-[#d7cfc0] pt-6">
              <p className="font-serif text-[18px] uppercase tracking-[0.18em] text-[#8b6914]">ZAFEX COLLECTIBLES</p>
              <p className="mt-2 font-sans text-[16px] italic text-[#5a4a30]">Care for your pieces. Preserve their character. Enjoy your collection for years to come.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
    });

    lenis.on('scroll', () => ScrollTrigger.update());
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return <>{children}</>;
}

function Router() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location]);

  const isAdmin = location.startsWith('/admin');

  if (isAdmin) {
    return (
      <Switch>
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path="/admin/orders" component={AdminOrders} />
        <Route path="/admin/customers" component={AdminCustomers} />
        <Route path="/admin/contacts" component={AdminContacts} />
        <Route path="/admin/products/new">
          <AdminProductForm mode="create" />
        </Route>
        <Route path="/admin/products/:id/edit">
          {(params) => <AdminProductForm mode="edit" id={params.id} />}
        </Route>
        <Route path="/admin/products/:id">
          {(params) => <AdminProductForm mode="edit" id={params.id} />}
        </Route>
        <Route path="/admin/products" component={AdminProducts} />
        <Route path="/admin/homepage-images" component={AdminHomepage} />
        <Route path="/admin/homepage" component={AdminHomepage} />
        <Route path="/admin">
          <Redirect to="/admin/dashboard" />
        </Route>
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f0e8] text-[#1a1208]">
      <Header />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/shop" component={Shop} />
          <Route path="/shop/:id" component={ProductDetail} />
          <Route path="/cart" component={Cart} />
          <Route path="/wishlist" component={Wishlist} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/account" component={Account} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/orders/:id" component={OrderDetail} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
          <Route path="/resources" component={Resources} />

          {/* ── Named /cat/* overrides — MUST come before generic :category catch-all ── */}
          <Route path="/cat/about-us" component={About} />
          <Route path="/cat/custom-orders" component={CustomForging} />
          <Route path="/cat/wholesale" component={Contact} />
          <Route path="/cat/resources/medieval-blog" component={Blog} />

          {/* ── Category / Subcategory routes ── */}
          <Route path="/cat/:category">
            {(params) => <CategoryPage categorySlug={params.category} />}
          </Route>
          <Route path="/cat/:category/:sub">
            {(params) => (
              <CategoryPage categorySlug={params.category} subSlug={params.sub} />
            )}
          </Route>

          {/* ── Static info pages ── */}
          <Route path="/faqs" component={Faqs} />
          <Route path="/size-guide" component={SizeGuide} />
          <Route path="/blog" component={Blog} />
          <Route path="/custom-forging" component={CustomForging} />
          <Route path="/product-maintenance" component={Maintenance} />
          <Route path="/product-safety" component={Safety} />
          <Route path="/privacy-policy" component={Privacy} />
          <Route path="/shipping-policy" component={Shipping} />
          <Route path="/refund-policy" component={Refund} />
          <Route path="/terms-and-conditions" component={Terms} />
          <Route path="/resources/buying-guides" component={BuyingGuides} />
          <Route path="/resources/chainmail-size-guide" component={ChainmailGuide} />
          <Route path="/resources/helmet-size-guide" component={HelmetGuide} />
          <Route path="/resources/leather-care-guide" component={LeatherGuide} />
          <Route path="/resources/faq" component={Faqs} />

          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CurrencyProvider>
            <CompareProvider>
              <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, '') || ''}>
                <SmoothScrollProvider>
                  <ScrollProgress />
                  <Router />
                  <CompareModal />
                  <CompareDock />
                </SmoothScrollProvider>
              </WouterRouter>
              <Toaster />
            </CompareProvider>
          </CurrencyProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
