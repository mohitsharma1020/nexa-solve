'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'How long does shipping take?',
    answer: 'Standard shipping takes 3-5 business days within the US. International shipping takes 7-14 business days depending on the destination. Express shipping (1-2 business days) is available at checkout for an additional fee.',
  },
  {
    question: 'What is your return policy?',
    answer: 'We offer a 30-day hassle-free return policy. If you are not completely satisfied with your purchase, simply contact our support team to initiate a return. Products must be in their original packaging and unused condition. Refunds are processed within 5-7 business days after we receive the returned item.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit and debit cards (Visa, Mastercard, American Express), UPI payments, PayPal, Apple Pay, Google Pay, and Cash on Delivery (COD) for eligible orders. All transactions are encrypted and secured with industry-standard SSL encryption.',
  },
  {
    question: 'How do you ensure product quality?',
    answer: 'Every product in our store goes through a rigorous multi-step quality check. We work directly with trusted manufacturers, inspect sample batches, and continuously monitor customer feedback. If a product does not meet our standards, we remove it from our catalog immediately.',
  },
  {
    question: 'How can I track my order?',
    answer: 'Once your order ships, you will receive an email with a tracking number and a link to track your package in real-time. You can also log into your account and visit the "My Orders" section to see the latest status. If you have any issues with tracking, our support team is happy to help.',
  },
  {
    question: 'Do you ship internationally?',
    answer: 'Yes! We ship to over 50 countries worldwide. International shipping rates and delivery times vary by destination. Customs duties and taxes may apply depending on your country — these are the responsibility of the buyer. You can see the shipping cost at checkout before placing your order.',
  },
  {
    question: 'Is Cash on Delivery (COD) available?',
    answer: 'Yes, Cash on Delivery is available for orders within India. COD orders have a maximum limit of ₹5,000. A small COD handling fee may apply. Please note that COD is not available for international orders.',
  },
  {
    question: 'Do your products come with a warranty?',
    answer: 'All our products come with a minimum 1-year manufacturer warranty covering defects in materials and workmanship. Some products offer extended warranty options which you can add at checkout. Warranty does not cover damage from misuse or normal wear and tear.',
  },
  {
    question: 'Can I cancel or modify my order after placing it?',
    answer: 'You can cancel or modify your order within 2 hours of placing it by contacting our support team. After that window, orders enter the fulfillment process and cannot be modified. If your order has already shipped, you can initiate a return once you receive it.',
  },
  {
    question: 'How do I contact customer support?',
    answer: 'You can reach us via email at support@nexasolve.com (response within 24 hours), by phone at +1 (800) 555-NEXA during business hours (Mon-Fri, 9am-6pm EST), or through WhatsApp for quick queries. Visit our Contact page for more details.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
        padding: '4rem 0 3rem', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
          background: 'radial-gradient(circle at 50% 50%, rgba(0, 85, 255, 0.08) 0%, transparent 50%)',
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{
            color: '#fff', fontSize: '3rem', fontWeight: 800,
            letterSpacing: '-0.03em', marginBottom: '0.75rem',
          }}>
            Frequently Asked Questions
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem' }}>
            Everything you need to know about NexaSolve. Can&apos;t find your answer? Contact us.
          </p>
        </div>
      </section>

      {/* FAQ List */}
      <section style={{
        maxWidth: 800, margin: '0 auto', padding: '3rem 20px 5rem',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {faqs.map((faq, index) => (
            <div key={index} style={{
              background: 'var(--color-white)', borderRadius: 14,
              border: `1px solid ${openIndex === index ? 'var(--color-accent)' : 'var(--color-border)'}`,
              overflow: 'hidden', transition: 'all 0.2s ease',
            }}>
              <button
                onClick={() => toggle(index)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', padding: '18px 20px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '1rem', fontWeight: 600, color: 'var(--color-primary)',
                  textAlign: 'left', fontFamily: 'inherit',
                  transition: 'color 0.2s ease',
                }}
              >
                <span style={{ paddingRight: 16 }}>{faq.question}</span>
                <ChevronDown
                  size={18}
                  style={{
                    color: 'var(--color-text-light)', flexShrink: 0,
                    transition: 'transform 0.3s ease',
                    transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>
              {openIndex === index && (
                <div style={{
                  padding: '0 20px 18px', fontSize: '0.95rem', lineHeight: 1.7,
                  color: 'var(--color-text-light)',
                  animation: 'fadeDown 0.3s ease',
                }}>
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          textAlign: 'center', marginTop: '3rem', padding: '2.5rem',
          background: 'var(--color-secondary)', borderRadius: 20,
        }}>
          <h3 style={{
            fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem',
            color: 'var(--color-primary)',
          }}>
            Still have questions?
          </h3>
          <p style={{
            fontSize: '0.95rem', color: 'var(--color-text-light)', marginBottom: '1.25rem',
          }}>
            Our support team is happy to help.
          </p>
          <a href="/contact" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px',
            background: 'var(--color-accent)', color: '#fff', borderRadius: 12,
            fontWeight: 700, fontSize: '0.95rem', transition: 'all 0.2s ease',
          }}>
            Contact Support
          </a>
        </div>
      </section>

      <style jsx>{`
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
