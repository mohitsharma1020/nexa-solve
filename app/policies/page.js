'use client';
import { useState } from 'react';
import { Truck, RefreshCcw, ShieldCheck, Globe } from 'lucide-react';

const tabs = [
  { id: 'shipping', label: 'Shipping' },
  { id: 'returns', label: 'Returns' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'terms', label: 'Terms' },
];

const policies = {
  shipping: {
    title: 'Shipping Policy',
    icon: <Truck size={24} />,
    content: [
      {
        heading: 'Processing Time',
        text: 'All orders are processed within 1-2 business days (excluding weekends and holidays) after receiving your order confirmation email. You will receive another notification when your order has shipped.',
      },
      {
        heading: 'Domestic Shipping (India)',
        text: 'Standard Shipping: 3-5 business days — Free on orders over ₹999 (otherwise ₹99). Express Shipping: 1-2 business days — ₹199. Same-Day Delivery: Available in select metro cities — ₹299.',
      },
      {
        heading: 'International Shipping',
        text: 'We ship to over 50 countries worldwide. International Standard: 7-14 business days — Rates calculated at checkout. International Express: 3-5 business days — Rates calculated at checkout. Please note that customs duties, taxes, and import fees may apply and are the responsibility of the recipient.',
      },
      {
        heading: 'Order Tracking',
        text: 'Once your order ships, you will receive an email with a tracking number. You can track your package in real-time through our website or the carrier\'s tracking page.',
      },
    ],
  },
  returns: {
    title: 'Return & Refund Policy',
    icon: <RefreshCcw size={24} />,
    content: [
      {
        heading: '30-Day Return Window',
        text: 'We offer a 30-day hassle-free return policy. If you are not completely satisfied with your purchase, you can return it within 30 days of delivery for a full refund or exchange.',
      },
      {
        heading: 'Return Conditions',
        text: 'Items must be unused, in their original packaging, with all tags and accessories included. Items that show signs of wear, damage, or alteration will not be accepted for return. Digital products and gift cards are non-refundable.',
      },
      {
        heading: 'How to Initiate a Return',
        text: 'Contact our support team at support@nexasolve.com with your order number and reason for return. We will provide you with a prepaid return shipping label (domestic orders) or return instructions (international orders). Pack the item securely and drop it off at the nearest carrier location.',
      },
      {
        heading: 'Refund Processing',
        text: 'Refunds are processed within 5-7 business days after we receive and inspect the returned item. The refund will be credited to your original payment method. Please allow an additional 3-5 business days for the refund to appear in your account.',
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    icon: <ShieldCheck size={24} />,
    content: [
      {
        heading: 'Information We Collect',
        text: 'We collect information you provide directly to us, such as your name, email address, shipping address, and payment information when you make a purchase. We also collect usage data through cookies and analytics tools to improve our services.',
      },
      {
        heading: 'How We Use Your Information',
        text: 'We use your information to process orders, send order confirmations and shipping updates, provide customer support, send marketing communications (with your consent), improve our website and services, and comply with legal obligations.',
      },
      {
        heading: 'Data Security',
        text: 'We implement industry-standard security measures including SSL encryption, secure payment processing through PCI-compliant partners, and regular security audits. Your payment information is never stored on our servers.',
      },
      {
        heading: 'Your Rights',
        text: 'You have the right to access, correct, or delete your personal data at any time. You can opt out of marketing communications by clicking the "unsubscribe" link in any email. To exercise your rights, contact us at privacy@nexasolve.com.',
      },
    ],
  },
  terms: {
    title: 'Terms of Service',
    icon: <Globe size={24} />,
    content: [
      {
        heading: 'Agreement to Terms',
        text: 'By accessing and using the NexaSolve website and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.',
      },
      {
        heading: 'Products and Pricing',
        text: 'All product descriptions, images, and prices are presented as accurately as possible. However, we do not warrant that product descriptions or other content is error-free. Prices are subject to change without notice. We reserve the right to limit quantities and refuse or cancel any order.',
      },
      {
        heading: 'Intellectual Property',
        text: 'All content on the NexaSolve website, including text, images, logos, and design, is the property of NexaSolve and is protected by copyright and trademark laws. You may not reproduce, distribute, or create derivative works without our express written permission.',
      },
      {
        heading: 'Limitation of Liability',
        text: 'NexaSolve shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our website or products. Our total liability shall not exceed the amount paid for the product in question.',
      },
      {
        heading: 'Governing Law',
        text: 'These Terms of Service are governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.',
      },
    ],
  },
};

export default function PoliciesPage() {
  const [activeTab, setActiveTab] = useState('shipping');

  const currentPolicy = policies[activeTab];

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
        padding: '4rem 0 3rem', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
          background: 'radial-gradient(circle at 50% 60%, rgba(0, 85, 255, 0.08) 0%, transparent 50%)',
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{
            color: '#fff', fontSize: '3rem', fontWeight: 800,
            letterSpacing: '-0.03em', marginBottom: '0.75rem',
          }}>
            Store Policies
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem' }}>
            Transparency and trust are at the core of everything we do
          </p>
        </div>
      </section>

      {/* Tab Navigation */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 20px 5rem' }}>
        <div style={{
          display: 'flex', gap: '8px', marginBottom: '2.5rem', overflowX: 'auto',
          padding: '4px', background: 'var(--color-secondary)', borderRadius: 14,
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, padding: '12px 20px', border: 'none', cursor: 'pointer',
                borderRadius: 10, fontSize: '0.9rem', fontWeight: 600,
                fontFamily: 'inherit', whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                background: activeTab === tab.id ? 'var(--color-white)' : 'transparent',
                color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-light)',
                boxShadow: activeTab === tab.id ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Policy Content */}
        <div style={{
          background: 'var(--color-white)', borderRadius: 20, padding: '2.5rem',
          border: '1px solid var(--color-border)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem',
            paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border)',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'rgba(0, 85, 255, 0.08)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-accent)',
            }}>
              {currentPolicy.icon}
            </div>
            <h2 style={{
              fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)',
              letterSpacing: '-0.02em',
            }}>
              {currentPolicy.title}
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {currentPolicy.content.map((section, i) => (
              <div key={i}>
                <h3 style={{
                  fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-primary)',
                  marginBottom: '0.5rem',
                }}>
                  {section.heading}
                </h3>
                <p style={{
                  fontSize: '0.95rem', lineHeight: 1.75, color: 'var(--color-text-light)',
                  margin: 0,
                }}>
                  {section.text}
                </p>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '2.5rem', padding: '1.5rem', background: 'var(--color-secondary)',
            borderRadius: 14, textAlign: 'center',
          }}>
            <p style={{
              fontSize: '0.9rem', color: 'var(--color-text-light)', margin: 0,
            }}>
              Have questions about our policies?{' '}
              <a href="/contact" style={{
                color: 'var(--color-accent)', fontWeight: 600,
              }}>
                Contact our support team
              </a>
            </p>
          </div>
        </div>

        <p style={{
          textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-light)',
          marginTop: '2rem',
        }}>
          Last updated: May 2026 · NexaSolve reserves the right to update these policies at any time.
        </p>
      </section>
    </div>
  );
}
