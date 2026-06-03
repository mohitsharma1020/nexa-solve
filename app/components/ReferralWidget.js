'use client';
import { useState, useEffect } from 'react';
import { Gift, Copy, CheckCircle2 } from 'lucide-react';
import { auth } from '../../services/firebaseClient';

export default function ReferralWidget() {
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        
        const idToken = await user.getIdToken();
        const res = await fetch('/api/referrals/status', {
          headers: { 'Authorization': `Bearer ${idToken}` }
        });
        
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to fetch referral data widget', err);
      } finally {
        setLoading(false);
      }
    };
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) fetchReferralData();
    });
    
    return () => unsubscribe();
  }, []);

  if (loading) return null;
  if (!data?.referralCode) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const referralLink = `${origin}/?ref=${data.referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ marginTop: '24px', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)', borderRadius: '16px', padding: '24px', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
        <div style={{ background: 'rgba(0,102,255,0.2)', padding: '10px', borderRadius: '50%', color: '#0066FF', flexShrink: 0 }}>
          <Gift size={24} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Give ₹200, Get ₹200</h3>
          <p style={{ margin: '6px 0 0 0', color: '#a1a1aa', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Your friend gets ₹200 OFF with ANTARCTICA. You earn ₹200 Polar Credits after they checkout.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ flex: 1, padding: '8px 12px', fontSize: '0.9rem', color: '#e5e7eb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
          {referralLink}
        </div>
        <button 
          onClick={copyToClipboard}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: copied ? '#10b981' : '#0066FF', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', whiteSpace: 'nowrap' }}
        >
          {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
