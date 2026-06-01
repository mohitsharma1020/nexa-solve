'use client';

import { useState, useEffect } from 'react';
import { Settings, ShieldAlert, Check, X } from 'lucide-react';
import styles from './page.module.css';
import { referralService } from '../../../services/referralService';

export default function AdminReferrals() {
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rewardValue, setRewardValue] = useState(200);
  const [minOrder, setMinOrder] = useState(999);

  useEffect(() => {
    loadLedger();
  }, []);

  const loadLedger = async () => {
    try {
      const data = await referralService.getAllLedgerEntries();
      setLedger(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (txnId, newStatus) => {
    try {
      await referralService.updateLedgerStatus(txnId, newStatus);
      loadLedger(); // refresh list
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Loading Admin Panel...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Referral Program Admin</h1>
          <p className={styles.subtitle}>Manage Polar Credits and prevent fraud.</p>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Left: Global Settings */}
        <div className={styles.settingsBox}>
          <h2 className={styles.settingsTitle}><Settings size={20} /> Program Settings</h2>
          
          <div className={styles.formGroup}>
            <label>Reward Value (₹)</label>
            <input type="number" value={rewardValue} onChange={(e) => setRewardValue(e.target.value)} />
          </div>
          
          <div className={styles.formGroup}>
            <label>Minimum Order to Redeem (₹)</label>
            <input type="number" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} />
          </div>

          <button className={styles.saveBtn} onClick={() => alert("Settings saved (Mock)")}>
            Save Changes
          </button>

          <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(255, 59, 48, 0.1)', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '0.9rem', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 8px 0' }}>
              <ShieldAlert size={16} /> Anti-Fraud Active
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#7f1d1d', margin: 0 }}>
              System automatically prevents self-referrals and enforces first-order only rules.
            </p>
          </div>
        </div>

        {/* Right: Master Ledger */}
        <div className={styles.ledgerBox}>
          <div className={styles.ledgerHeader}>
            <h2 className={styles.ledgerTitle}>Master Credit Ledger</h2>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>User / Ref</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((txn) => (
                  <tr key={txn.transactionId}>
                    <td style={{ fontSize: '0.85rem' }}>{formatDate(txn.createdAt)}<br/><span style={{color: '#94a3b8'}}>{txn.transactionId}</span></td>
                    <td style={{ fontSize: '0.85rem' }}>
                      <strong>User:</strong> {txn.userId}<br/>
                      {txn.referredUserId && <span><strong>Ref:</strong> {txn.referredUserId}</span>}
                    </td>
                    <td style={{ fontWeight: 600, color: txn.type === 'referral_reward' ? 'var(--color-success)' : 'var(--color-primary)' }}>
                      {txn.type === 'referral_reward' ? '+' : '-'}₹{txn.amount}
                    </td>
                    <td>
                      <span className={`${styles.badge} ${styles[txn.status]}`}>
                        {txn.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {txn.status === 'pending' && (
                        <div style={{ display: 'flex' }}>
                          <button 
                            className={`${styles.actionBtn} ${styles.approveBtn}`}
                            onClick={() => handleStatusChange(txn.transactionId, 'active')}
                            title="Mark as Delivered/Active"
                          >
                            <Check size={14} />
                          </button>
                          <button 
                            className={`${styles.actionBtn} ${styles.reverseBtn}`}
                            onClick={() => handleStatusChange(txn.transactionId, 'reversed')}
                            title="Reverse (Refunded/Cancelled)"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {ledger.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>No transactions found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
