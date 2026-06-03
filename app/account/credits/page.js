'use client';

import { useState, useEffect } from 'react';
import { Wallet, Clock, CheckCircle2, AlertCircle, Share2 } from 'lucide-react';
import styles from './page.module.css';
import { referralService } from '../../../services/referralService';

export default function CreditsDashboard() {
  const [profile, setProfile] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const user = await referralService.getUserProfile('usr_me');
        const history = await referralService.getUserLedger('usr_me');
        setProfile(user);
        setLedger(history);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const referralLink = profile ? `https://nexasolve.com/?ref=${profile.referralCode}` : '';

  const copyToClipboard = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    if (!referralLink) return;
    const text = `Hey! I thought you'd love NexaSolve. Use my link and the code ANTARCTICA to get ₹200 OFF your first order! ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  if (loading) {
    return <div style={{ padding: '100px', textAlign: 'center' }}>Loading dashboard...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Polar Credits Dashboard</h1>
        <p className={styles.subtitle}>Welcome back, {profile?.name}. Manage your store credits and referrals here.</p>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>
            <Wallet size={18} /> Available to Spend
          </div>
          <p className={`${styles.statValue} ${styles.active}`}>
            ₹{profile?.availableCredits.toLocaleString('en-IN')}
          </p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>
            <Clock size={18} /> Pending Rewards
          </div>
          <p className={`${styles.statValue} ${styles.pending}`}>
            ₹{profile?.pendingCredits.toLocaleString('en-IN')}
          </p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>
            <CheckCircle2 size={18} /> Lifetime Earned
          </div>
          <p className={styles.statValue}>
            ₹{profile?.totalEarned.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Main Content: Ledger */}
        <div className={styles.historySection}>
          <div className={styles.historyHeader}>
            <h2 className={styles.historyTitle}>Credit History</h2>
          </div>
          
          {ledger.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No credit history yet. Start referring friends to earn credits!</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((txn) => (
                  <tr key={txn.transactionId}>
                    <td>
                      <div className={styles.txnDate}>{formatDate(txn.createdAt)}</div>
                    </td>
                    <td>
                      <p className={styles.txnDesc}>{txn.notes}</p>
                      <p className={styles.txnId}>ID: {txn.transactionId}</p>
                    </td>
                    <td>
                      <span className={txn.type === 'referral_reward' ? styles.amountPlus : styles.amountMinus}>
                        {txn.type === 'referral_reward' ? '+' : '-'}₹{txn.amount}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${styles[txn.status]}`}>
                        {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.shareCard}>
            <h3 className={styles.shareTitle}>Refer & Earn</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '16px' }}>Earn ₹200 for every friend who places their first order.</p>
            
            <div className={styles.linkBox}>
              <input 
                type="text" 
                className={styles.linkInput} 
                value={referralLink} 
                readOnly 
              />
              <button 
                className={`${styles.copyBtn} ${copied ? styles.copyBtnSuccess : ''}`}
                onClick={copyToClipboard}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
              
            <button 
              onClick={shareOnWhatsApp}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#25D366', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s', marginTop: '12px' }}
            >
              <Share2 size={16} /> Share via WhatsApp
            </button>
          </div>

          <div className={styles.helpCard}>
            <h3><AlertCircle size={18} style={{ verticalAlign: 'sub', marginRight: '6px' }} /> Important Rules</h3>
            <p>• Credits are valid for 90 days.</p>
            <p>• Minimum order value ₹999 to redeem.</p>
            <p>• Max ₹200 redemption per order.</p>
            <p>• Cannot be withdrawn as cash.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
