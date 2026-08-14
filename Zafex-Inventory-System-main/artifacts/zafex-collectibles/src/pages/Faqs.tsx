import Layout from '@/components/layout/Layout';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    question: "Do you ship internationally?",
    answer: "Yes, Zafex Enterprises ships worldwide from our workshop in Meerut, India. Shipping costs and delivery times vary by destination and the weight of the items. All international shipments are tracked and insured."
  },
  {
    question: "Are your armors battle-ready or just for display?",
    answer: "We forge both. Our standard catalog items specify whether they are decorative or functional. If you require battle-ready armor for HEMA, Buhurt, or heavy combat, please request a custom commission so we can use appropriate steel gauges and hardening techniques."
  },
  {
    question: "How do I take my measurements for custom armor?",
    answer: "Once you place a custom order, we will provide a detailed measurement chart. You will need to take measurements over the padding (gambeson/arming doublet) you intend to wear beneath the armor."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept PayPal, Payoneer, and Direct Bank Transfers. For large custom commissions, we typically require a 50% deposit upfront and the remaining 50% upon completion before shipping."
  },
  {
    question: "How long does a custom order take?",
    answer: "Standard catalog items usually ship within 2-3 weeks. Custom, tailored armor sets can take anywhere from 8 to 16 weeks depending on the complexity of the design and our current forge queue."
  },
  {
    question: "What type of steel do you use?",
    answer: "We primarily use mild steel (18g to 14g) for standard historical replicas and LARP gear. For battle-ready custom pieces, we use high-carbon steel, spring steel, or stainless steel upon request, which can be tempered to your requirements."
  },
  {
    question: "Do you accept returns?",
    answer: "We accept returns on standard catalog items within 14 days of delivery, provided they are unused and in original condition. Custom tailored items are non-refundable unless there is a structural defect or a significant deviation from agreed specifications."
  },
  {
    question: "Will the armor rust?",
    answer: "Carbon steel will rust if not maintained properly. You must keep it oiled or waxed when not in use, and store it in a dry environment. We provide detailed maintenance instructions with every steel purchase."
  }
];

export default function Faqs() {
  return (
    <Layout>
      <div className="bg-[hsl(var(--bg-deep))] py-16 border-b border-border">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white uppercase tracking-widest mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-400 font-sans max-w-2xl mx-auto">
            Answers regarding shipping, custom orders, and the nature of our craft.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20 max-w-3xl">
        <Accordion type="single" collapsible className="w-full space-y-4">
          {FAQS.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="bg-card border border-border px-6 data-[state=open]:border-primary transition-colors">
              <AccordionTrigger className="font-serif font-bold text-lg text-left hover:no-underline hover:text-primary py-6">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-16 text-center p-8 bg-muted border border-border">
          <h3 className="font-serif font-bold uppercase tracking-widest mb-4">Still have questions?</h3>
          <p className="text-muted-foreground mb-6">If you couldn't find the answer to your question, our forge master is ready to assist you.</p>
          <a href="/contact" className="inline-block bg-primary text-white font-serif font-bold tracking-widest uppercase px-8 py-3 hover:bg-primary/90 transition-colors">
            Contact Support
          </a>
        </div>
      </div>
    </Layout>
  );
}