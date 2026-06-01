'use client';
import { useState } from 'react';
import { Mail, HeadphonesIcon, Globe, ArrowRight, CheckCircle2 } from 'lucide-react';

const contactCards = [
  {
    icon: <Mail size={24} />,
    title: 'Email Us',
    detail: 'support@nexasolve.com',
    subtitle: 'We reply within 24 hours',
  },
  {
    icon: <HeadphonesIcon size={24} />,
    title: 'Phone Support',
    detail: '+1 (800) 555-NEXA',
    subtitle: 'Mon-Fri, 9am - 6pm EST',
  },
  {
    icon: <Globe size={24} />,
    title: 'Our Office',
    detail: '123 Innovation Drive',
    subtitle: 'San Francisco, CA 94102',
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '', email: '', subject: '', message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const inputStyle = {
    width: '100%', padding: '14px 18px', border: '1px solid var(--color-border)',
    borderRadius: 12, fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none',
    transition: 'all 0.2s ease', background: 'var(--color-white)',
    color: 'var(--color-primary)',
  };

  const labelStyle = {
    display: 'block', fontSize: '0.85rem', fontWeight: 600,
    color: 'var(--color-primary)', marginBottom: 6,
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
          background: 'radial-gradient(circle at 60% 50%, rgba(0, 85, 255, 0.08) 0%, transparent 50%)',
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{
            color: '#fff', fontSize: '3rem', fontWeight: 800,
            letterSpacing: '-0.03em', marginBottom: '0.75rem',
          }}>
            Get in Touch
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem' }}>
            Have a question, feedback, or just want to say hi? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <section style={{
        maxWidth: 1100, margin: '0 auto', padding: '3rem 20px 5rem',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem',
      }}>
        {/* Form */}
        <div style={{
          background: 'var(--color-white)', borderRadius: 20, padding: '2.5rem',
          border: '1px solid var(--color-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
        }}>
          <h2 style={{
            fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem',
            color: 'var(--color-primary)',
          }}>
            Send Us a Message
          </h2>
          <p style={{
            fontSize: '0.9rem', color: 'var(--color-text-light)', marginBottom: '2rem',
          }}>
            Fill out the form below and we&apos;ll get back to you as soon as possible.
          </p>

          {submitted && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px',
              background: 'rgba(34, 197, 94, 0.1)', borderRadius: 12, marginBottom: '1.5rem',
              border: '1px solid rgba(34, 197, 94, 0.2)',
            }}>
              <CheckCircle2 size={18} style={{ color: '#16a34a' }} />
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#16a34a' }}>
                Message sent successfully! We&apos;ll respond shortly.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  style={inputStyle}
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Email Address</label>
                <input
                  style={inputStyle}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Subject</label>
              <input
                style={inputStyle}
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="How can we help?"
                required
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Message</label>
              <textarea
                style={{ ...inputStyle, minHeight: 140, resize: 'vertical' }}
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us more..."
                required
              />
            </div>
            <button type="submit" style={{
              width: '100%', padding: '16px', background: 'linear-gradient(135deg, var(--color-accent), #0044cc)',
              color: '#fff', border: 'none', borderRadius: 12, fontSize: '1rem',
              fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 10, transition: 'all 0.2s ease',
              fontFamily: 'inherit',
            }}>
              Send Message
              <ArrowRight size={18} />
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
            {contactCards.map((card, i) => (
              <div key={i} style={{
                background: 'var(--color-white)', borderRadius: 16, padding: '1.5rem',
                border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center',
                gap: '1.25rem', transition: 'all 0.2s ease',
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: 'rgba(0, 85, 255, 0.08)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-accent)', flexShrink: 0,
                }}>
                  {card.icon}
                </div>
                <div>
                  <h3 style={{
                    fontSize: '1rem', fontWeight: 700, marginBottom: 2,
                    color: 'var(--color-primary)',
                  }}>
                    {card.title}
                  </h3>
                  <p style={{
                    fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-primary)',
                    margin: 0, marginBottom: 2,
                  }}>
                    {card.detail}
                  </p>
                  <p style={{
                    fontSize: '0.8rem', color: 'var(--color-text-light)', margin: 0,
                  }}>
                    {card.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* WhatsApp */}
          <div style={{
            background: 'rgba(37, 211, 102, 0.08)', borderRadius: 16, padding: '1.5rem',
            border: '1px solid rgba(37, 211, 102, 0.2)', textAlign: 'center',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💬</div>
            <h3 style={{
              fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem',
              color: 'var(--color-primary)',
            }}>
              WhatsApp Support
            </h3>
            <p style={{
              fontSize: '0.9rem', color: 'var(--color-text-light)', margin: 0,
              marginBottom: '0.75rem',
            }}>
              Quick replies on WhatsApp for urgent queries
            </p>
            <span style={{
              display: 'inline-block', padding: '10px 20px', background: '#25D366',
              color: '#fff', borderRadius: 10, fontWeight: 600, fontSize: '0.9rem',
            }}>
              Chat on WhatsApp
            </span>
          </div>

          {/* Response Times */}
          <div style={{
            marginTop: '1.25rem', background: 'var(--color-secondary)', borderRadius: 16,
            padding: '1.5rem',
          }}>
            <h3 style={{
              fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem',
              color: 'var(--color-primary)',
            }}>
              Average Response Times
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Email', time: 'Within 24 hours' },
                { label: 'WhatsApp', time: 'Within 2 hours' },
                { label: 'Phone', time: 'Instant (business hours)' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem',
                }}>
                  <span style={{ color: 'var(--color-text-light)' }}>{item.label}</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @media (max-width: 768px) {
          section {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
