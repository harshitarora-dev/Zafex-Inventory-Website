import React from 'react';
import { Link } from 'wouter';
import { MapPin, Phone, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Contact = () => {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description: "We'll get back to you via raven (or email) shortly.",
    });
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="bg-[#f5f0e8] min-h-screen">
      <section className="relative w-full h-[280px] bg-[#1a1a18] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[#000]/70 z-10"></div>
        <div className="relative z-20">
          <div className="font-serif text-[11px] uppercase tracking-[2px] text-[#d4af37] mb-4 flex items-center justify-center gap-2">
            <Link href="/" className="hover:text-white transition-colors">HOME</Link>
            <span className="text-white/50">/</span>
            <span className="text-white">CONTACT</span>
          </div>
          <h1 className="font-serif text-[64px] font-bold text-white uppercase leading-none">
            GET IN TOUCH
          </h1>
        </div>
      </section>

      <section className="py-[80px] container mx-auto px-8 max-w-[1000px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Left - Form */}
          <div>
            <h2 className="font-serif text-[28px] font-bold text-[#1a1a18] uppercase tracking-[1px] mb-2">Send a Message</h2>
            <div className="w-[40px] h-[3px] bg-[#9c1c1c] mb-8"></div>
            <p className="font-sans text-[14px] text-[#6b6b6b] mb-8">
              Have a question about an order, a custom forging request, or need help with sizing? Fill out the form below.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="font-serif text-[11px] uppercase tracking-[1px] text-[#1a1a18] font-bold block mb-2">Your Name</label>
                  <input required type="text" className="w-full h-[48px] bg-white border border-[#d4cfc7] px-4 font-sans focus:outline-none focus:border-[#d4af37]" />
                </div>
                <div>
                  <label className="font-serif text-[11px] uppercase tracking-[1px] text-[#1a1a18] font-bold block mb-2">Email Address</label>
                  <input required type="email" className="w-full h-[48px] bg-white border border-[#d4cfc7] px-4 font-sans focus:outline-none focus:border-[#d4af37]" />
                </div>
              </div>
              <div>
                <label className="font-serif text-[11px] uppercase tracking-[1px] text-[#1a1a18] font-bold block mb-2">Subject</label>
                <input required type="text" className="w-full h-[48px] bg-white border border-[#d4cfc7] px-4 font-sans focus:outline-none focus:border-[#d4af37]" />
              </div>
              <div>
                <label className="font-serif text-[11px] uppercase tracking-[1px] text-[#1a1a18] font-bold block mb-2">Message</label>
                <textarea required rows={5} className="w-full bg-white border border-[#d4cfc7] p-4 font-sans focus:outline-none focus:border-[#d4af37] resize-none"></textarea>
              </div>
              <button type="submit" className="h-[52px] bg-[#1a1a18] text-white font-serif text-[12px] uppercase font-bold tracking-[2px] hover:bg-[#d4af37] transition-colors w-full md:w-auto px-8 self-start">
                SEND MESSAGE
              </button>
            </form>
          </div>

          {/* Right - Info */}
          <div>
            <h2 className="font-serif text-[28px] font-bold text-[#1a1a18] uppercase tracking-[1px] mb-2">Workshop & HQ</h2>
            <div className="w-[40px] h-[3px] bg-[#9c1c1c] mb-8"></div>
            
            <div className="flex flex-col gap-8 bg-white border border-[#d4cfc7] p-8">
              <div className="flex gap-4">
                <MapPin className="text-[#d4af37] shrink-0" size={24} />
                <div>
                  <h4 className="font-serif text-[13px] font-bold text-[#1a1a18] uppercase tracking-[1px] mb-2">Address</h4>
                  <p className="font-sans text-[14px] text-[#6b6b6b] leading-relaxed">
                    Zafex Enterprises<br />
                    2710, F-Block, Gali No. 6<br />
                    Zakir Hussain Colony<br />
                    Meerut – 250002 (UP), India
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Phone className="text-[#d4af37] shrink-0" size={24} />
                <div>
                  <h4 className="font-serif text-[13px] font-bold text-[#1a1a18] uppercase tracking-[1px] mb-2">Phone</h4>
                  <p className="font-sans text-[14px] text-[#6b6b6b] leading-relaxed">
                    +91-8273506540
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Mail className="text-[#d4af37] shrink-0" size={24} />
                <div>
                  <h4 className="font-serif text-[13px] font-bold text-[#1a1a18] uppercase tracking-[1px] mb-2">Email</h4>
                  <a href="mailto:zafexenterprises@gmail.com" className="font-sans text-[14px] text-[#d4af37] hover:underline">
                    zafexenterprises@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
