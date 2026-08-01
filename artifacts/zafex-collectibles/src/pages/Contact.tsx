import React, { useRef } from 'react';
import { Link } from 'wouter';
import { MapPin, Phone, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { submitContact } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';

const Contact = () => {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const mutation = useMutation({
    mutationFn: (body: {
      name: string;
      email: string;
      phone?: string;
      subject?: string;
      message: string;
    }) => submitContact(body),
    onSuccess: () => {
      toast({
        title: 'Message Sent!',
        description: "We'll get back to you via email shortly.",
      });
      formRef.current?.reset();
    },
    onError: (err: unknown) => {
      toast({
        title: 'Failed to send message',
        description: err instanceof Error ? err.message : 'Please try again later.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    mutation.mutate({
      name:    fd.get('name')    as string,
      email:   fd.get('email')   as string,
      phone:   (fd.get('phone')  as string) || undefined,
      subject: (fd.get('subject') as string) || undefined,
      message: fd.get('message') as string,
    });
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

            <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="font-serif text-[11px] uppercase tracking-[1px] text-[#1a1a18] font-bold block mb-2">Your Name *</label>
                  <input
                    name="name"
                    required
                    type="text"
                    className="w-full h-[48px] bg-white border border-[#d4cfc7] px-4 font-sans focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="font-serif text-[11px] uppercase tracking-[1px] text-[#1a1a18] font-bold block mb-2">Email Address *</label>
                  <input
                    name="email"
                    required
                    type="email"
                    className="w-full h-[48px] bg-white border border-[#d4cfc7] px-4 font-sans focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>
              <div>
                <label className="font-serif text-[11px] uppercase tracking-[1px] text-[#1a1a18] font-bold block mb-2">Phone (optional)</label>
                <input
                  name="phone"
                  type="tel"
                  className="w-full h-[48px] bg-white border border-[#d4cfc7] px-4 font-sans focus:outline-none focus:border-[#d4af37]"
                />
              </div>
              <div>
                <label className="font-serif text-[11px] uppercase tracking-[1px] text-[#1a1a18] font-bold block mb-2">Subject</label>
                <input
                  name="subject"
                  type="text"
                  className="w-full h-[48px] bg-white border border-[#d4cfc7] px-4 font-sans focus:outline-none focus:border-[#d4af37]"
                />
              </div>
              <div>
                <label className="font-serif text-[11px] uppercase tracking-[1px] text-[#1a1a18] font-bold block mb-2">Message *</label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  className="w-full bg-white border border-[#d4cfc7] p-4 font-sans focus:outline-none focus:border-[#d4af37] resize-none"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="h-[52px] bg-[#1a1a18] text-white font-serif text-[12px] uppercase font-bold tracking-[2px] hover:bg-[#d4af37] hover:text-[#1a1a18] transition-colors w-full md:w-auto px-8 self-start disabled:opacity-60"
              >
                {mutation.isPending ? 'SENDING…' : 'SEND MESSAGE'}
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
                    <a href="tel:+918273506540" className="hover:text-[#d4af37] transition-colors">+91-8273506540</a>
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Mail className="text-[#d4af37] shrink-0" size={24} />
                <div>
                  <h4 className="font-serif text-[13px] font-bold text-[#1a1a18] uppercase tracking-[1px] mb-2">Email</h4>
                  <p className="font-sans text-[14px] text-[#6b6b6b] leading-relaxed">
                    <a href="mailto:zafexcollectibles@gmail.com" className="hover:text-[#d4af37] transition-colors">
                      zafexcollectibles@gmail.com
                    </a>
                  </p>
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
