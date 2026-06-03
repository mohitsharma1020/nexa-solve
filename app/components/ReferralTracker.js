'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function TrackerLogic() {
  const searchParams = useSearchParams();
  const [showToast, setShowToast] = useState(false);
  const [discountAmount] = useState('₹200');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const refCode = searchParams.get('ref');
    
    if (refCode) {
      // Validate code via API
      fetch('/api/referrals/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: refCode })
      })
      .then(res => res.json())
      .then(data => {
        if (data.valid) {
          localStorage.setItem('nexa_referral_code', refCode);
          localStorage.setItem('nexa_referral_timestamp', Date.now().toString());
          
          setShowToast(true);
          setTimeout(() => setShowToast(false), 8000);
        }
      })
      .catch(err => {
        console.error('Failed to validate referral code', err);
      });
    }
  }, [searchParams]);

  if (!showToast) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
      padding: '16px 24px',
      borderRadius: '12px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      zIndex: 9999,
      border: '1px solid rgba(255,255,255,0.1)',
      animation: 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      maxWidth: '360px'
    }}>
      <div style={{ 
        width: '40px', 
        height: '40px', 
        borderRadius: '50%', 
        background: 'linear-gradient(135deg, #0066FF, #00d084)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <div>
        <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '600' }}>Referral Benefit Unlocked</h4>
        <p style={{ margin: 0, fontSize: '13px', color: '#a1a1aa', lineHeight: 1.4 }}>
          Use ANTARCTICA at checkout for {discountAmount} OFF.
        </p>
      </div>
      <button 
        onClick={() => setShowToast(false)}
        style={{
          background: 'none',
          border: 'none',
          color: '#a1a1aa',
          cursor: 'pointer',
          padding: '4px',
          marginLeft: 'auto'
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
}

export default function ReferralTracker() {
  return (
    <Suspense fallback={null}>
      <TrackerLogic />
    </Suspense>
  );
}
