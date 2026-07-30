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
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminProductForm from '@/pages/admin/AdminProductForm';
import AdminHomepageImages from '@/pages/admin/AdminHomepageImages';

import Home from '@/pages/Home';
import Shop from '@/pages/Shop';
import ProductDetail from '@/pages/ProductDetail';
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
const BuyingGuides = () => <ContentPage title="Buying Guides"><p>Explore our buying guides for choosing the right armor, chainmail, clothing, and accessories for your collection, reenactment, or costume.</p></ContentPage>;
const ChainmailGuide = () => <ContentPage title="Chainmail Size Guide"><p>For the best fit, measure around your chest, waist, shoulders, and arms while wearing the clothing you plan to wear underneath. Contact our team for help with custom measurements.</p></ContentPage>;
const HelmetGuide = () => <ContentPage title="Helmet Size Guide"><p>Measure around your head at eyebrow level and choose the closest size. A small amount of room is recommended for comfort and a padded liner.</p></ContentPage>;
const LeatherGuide = () => <ContentPage title="Leather Care Guide"><p>Keep leather goods dry, away from direct heat, and conditioned periodically with a suitable leather conditioner. Store them in a cool, ventilated place.</p></ContentPage>;

const NotFound = () => (
  <div className="min-h-screen bg-[#f5f0e8] flex flex-col items-center justify-center text-center px-4">
    <h1 className="font-serif text-6xl font-bold text-[#1a1a18] mb-4">404</h1>
    <p className="font-sans text-[#6b6b6b] mb-8">This path has been lost to history.</p>
    <a href="/" className="bg-[#1a1a18] text-white font-serif text-[12px] uppercase font-bold tracking-[2px] px-8 py-4 hover:bg-[#d4af37] transition-colors">
      RETURN TO THE KEEP
    </a>
  </div>
);

const queryClient = new QueryClient();

function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
    });

    lenis.on('scroll', () => ScrollTrigger.update());

    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(tickerFn);
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

  // Admin portal — rendered without the storefront Header/Footer
  if (location.startsWith('/admin')) {
    return (
      <Switch>
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/products/new">
          <AdminProductForm mode="create" />
        </Route>
        <Route path="/admin/products/:id/edit">
          {(params) => <AdminProductForm mode="edit" id={params.id} />}
        </Route>
        <Route path="/admin/products" component={AdminProducts} />
        <Route path="/admin/homepage-images" component={AdminHomepageImages} />
        <Route path="/admin">
          <Redirect to="/admin/products" />
        </Route>
      </Switch>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Switch>
          {/* ── Core pages ── */}
          <Route path="/" component={Home} />
          <Route path="/shop" component={Shop} />
          <Route path="/shop/:id" component={ProductDetail} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
          <Route path="/resources" component={Resources} />

          {/* ── Named /cat/* overrides — MUST come before the generic :category catch-all ── */}
          <Route path="/cat/about-us" component={About} />
          <Route path="/cat/about-us/:sub" component={About} />
          <Route path="/cat/custom-orders" component={CustomForging} />
          <Route path="/cat/custom-orders/:sub" component={CustomForging} />
          <Route path="/cat/resources/medieval-blog" component={Blog} />

          {/* ── Dynamic category + subcategory routes ── */}
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
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, '') || ''}>
        <SmoothScrollProvider>
          <ScrollProgress />
          <Router />
        </SmoothScrollProvider>
      </WouterRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
