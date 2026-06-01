'use client';
import { useState } from 'react';
import { Mail, ArrowRight } from 'lucide-react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  if (submitted) {
    return (
      <div style={{
        padding: '16px 24px',
        background: 'rgba(34, 197, 94, 0.1)',
        border: '1px solid rgba(34, 197, 94, 0.2)',
        borderRadius: '16px',
        color: '#16a34a',
        fontWeight: 600,
        fontSize: '1rem',
        textAlign: 'center',
      }}>
        🎉 Welcome to the NexaSolve community!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: '#ffffff',
        border: '2px solid var(--color-border)',
        borderRadius: '16px',
        padding: '6px',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
      }}>
        <Mail size={20} style={{ color: 'var(--color-text-light)', marginLeft: '16px', flexShrink: 0 }} />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          required
          style={{
            flex: 1,
            padding: '14px 16px',
            fontSize: '1rem',
            fontFamily: 'inherit',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            color: 'var(--color-primary)',
          }}
        />
        <button type="submit" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '14px 28px',
          background: 'linear-gradient(135deg, #0066FF, #7c3aed)',
          color: '#ffffff',
          fontSize: '0.95rem',
          fontWeight: 700,
          borderRadius: '12px',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          whiteSpace: 'nowrap',
        }}>
          Subscribe
          <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );
}
