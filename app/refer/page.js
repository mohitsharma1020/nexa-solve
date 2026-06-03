'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Gift, Copy, Share2, CheckCircle2, TrendingUp, Clock, FileText } from 'lucide-react';
import { auth } from '../../services/firebaseClient';

export default function ReferPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      setUser(currentUser);
      
      try {
        const idToken = await currentUser.getIdToken();
        const res = await fetch('/api/referrals/status', {
          headers: { 'Authorization': `Bearer ${idToken}` }
        });
        
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          setError('Failed to load referral data.');
        }
      } catch (err) {
        setError('Connection error.');
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid #0066FF', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <Gift size={64} style={{ color: '#0066FF', margin: '0 auto 24px' }} />
        <h1 style={{ fontSize: '2rem', marginBottom: '16px' }}>Give ₹200, Get ₹200</h1>
        <p style={{ color: '#6e6e73', marginBottom: '32px' }}>Please sign in to view your referral code and dashboard.</p>
        <button 
          onClick={() => router.push('/account')}
          style={{ background: '#0a0a0a', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' }}
        >
          Sign In
        </button>
      </div>
    );
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const referralLink = data?.referralCode ? `${origin}/?ref=${data.referralCode}` : '';

  const copyToClipboard = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    if (!referralLink) return;
    const text = `Hey! I thought you'd love NexaSolve. Use my link to get ₹200 OFF your first order! ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '60px auto', padding: '0 24px' }}>
      
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,102,255,0.1)', color: '#0066FF', padding: '6px 16px', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 600, marginBottom: '16px' }}>
          <Gift size={16} /> Refer & Earn
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.02em' }}>
          Give ₹200, Get ₹200
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#6e6e73', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
          Your friend gets ₹200 OFF with ANTARCTICA when they use your referral link. You earn ₹200 Polar Credits after their order is completed.
        </p>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '16px', borderRadius: '8px', marginBottom: '32px' }}>
          {error}
        </div>
      )}

      {/* Share Section */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '32px', marginBottom: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '24px', fontWeight: 600 }}>Share Your Link</h3>
        
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', minWidth: '250px' }}>
            <span style={{ fontSize: '0.95rem', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {referralLink || 'Generating link...'}
            </span>
          </div>
          <button 
            onClick={copyToClipboard}
            disabled={!referralLink}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: copied ? '#10b981' : '#0a0a0a', color: '#fff', border: 'none', padding: '0 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s', height: '48px' }}
          >
            {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>

        <button 
          onClick={shareOnWhatsApp}
          disabled={!referralLink}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#25D366', color: '#fff', border: 'none', padding: '14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', transition: 'all 0.2s' }}
        >
          <Share2 size={18} /> Share via WhatsApp
        </button>
      </div>

      {/* Stats Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '48px' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6e6e73', marginBottom: '12px' }}>
            <TrendingUp size={18} /> <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Total Referrals</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#111827' }}>{data?.totalReferrals || 0}</div>
        </div>
        
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6e6e73', marginBottom: '12px' }}>
            <Clock size={18} style={{ color: '#f59e0b' }} /> <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Pending Rewards</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#111827' }}>₹{data?.pendingCredits || 0}</div>
          <p style={{ fontSize: '0.75rem', color: '#a1a1aa', margin: '4px 0 0' }}>Awaiting order completion</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6e6e73', marginBottom: '12px' }}>
            <CheckCircle2 size={18} style={{ color: '#10b981' }} /> <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Active Polar Credits</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0066FF' }}>₹{data?.activeCredits || 0}</div>
          <p style={{ fontSize: '0.75rem', color: '#a1a1aa', margin: '4px 0 0' }}>Ready to use at checkout</p>
        </div>
      </div>

      {/* How it works */}
      <h3 style={{ fontSize: '1.25rem', marginBottom: '24px', fontWeight: 600 }}>How it works</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '48px' }}>
        {[
          { step: 1, title: 'Share Your Link', desc: 'Send your unique referral link to friends, family, or followers.' },
          { step: 2, title: 'Your Friend Uses ANTARCTICA', desc: 'They open your link and use ANTARCTICA at Shopify checkout for ₹200 OFF.' },
          { step: 3, title: 'They Complete Their Purchase', desc: 'They place a successful paid Shopify order.' },
          { step: 4, title: 'You Earn Polar Credits', desc: 'After their order is completed, ₹200 Polar Credits become active in your account.' },
        ].map((item) => (
          <div key={item.step} style={{ background: '#f9fafb', borderRadius: '12px', padding: '24px' }}>
            <div style={{ width: '32px', height: '32px', background: '#0a0a0a', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, marginBottom: '16px' }}>
              {item.step}
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>{item.title}</h4>
            <p style={{ fontSize: '0.9rem', color: '#6e6e73', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
