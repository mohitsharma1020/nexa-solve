'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCcw, Home, ShoppingBag } from 'lucide-react';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('NexaSolve Error Boundary caught an error:', error);
  }, [error]);

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center',
      background: 'var(--color-secondary)'
    }}>
      <div style={{
        background: '#fff',
        padding: '40px',
        borderRadius: '24px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 40px rgba(0,0,0,0.08)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'rgba(239, 68, 68, 0.1)',
          color: 'var(--color-error)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <AlertTriangle size={40} />
        </div>
        
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '12px' }}>
          Something went wrong.
        </h2>
        
        <p style={{ color: 'var(--color-text-light)', fontSize: '1rem', lineHeight: 1.5, marginBottom: '32px' }}>
          Please try again. If the issue persists, our support team has been notified and is working on a fix.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={() => reset()}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              width: '100%', padding: '14px', background: 'var(--color-primary)', color: '#fff',
              border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '1rem',
              cursor: 'pointer', transition: 'transform 0.2s'
            }}
          >
            <RefreshCcw size={18} />
            Reload Page
          </button>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link href="/" style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '12px', background: 'var(--color-light-grey)', color: 'var(--color-primary)',
              borderRadius: '12px', fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none'
            }}>
              <Home size={16} />
              Go Home
            </Link>
            
            <Link href="/shop" style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '12px', background: 'var(--color-light-grey)', color: 'var(--color-primary)',
              borderRadius: '12px', fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none'
            }}>
              <ShoppingBag size={16} />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
