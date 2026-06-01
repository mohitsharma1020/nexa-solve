'use client';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Loader2, Check, X, Eye } from 'lucide-react';
import styles from './page.module.css';

export default function AdminReviewsDashboard() {
  const [adminSecret, setAdminSecret] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [previewPhoto, setPreviewPhoto] = useState(null);

  const [actionLoading, setActionLoading] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');

  const [reviewStates, setReviewStates] = useState({});

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!adminSecret) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/reviews', {
        headers: { 'Authorization': `Bearer ${adminSecret}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        setIsAuthenticated(true);
        setReviews(data.reviews || []);
        
        // Initialize state for inputs
        const initialStates = {};
        data.reviews.forEach(r => {
          initialStates[r.id] = { approvedCount: Math.min(r.photoCount || 0, 5), reason: '' };
        });
        setReviewStates(initialStates);
      } else {
        setError(data.error || 'Invalid Admin Secret');
      }
    } catch (err) {
      setError('Connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId) => {
    setActionLoading(reviewId);
    setActionSuccess('');
    setError('');
    
    const { approvedCount } = reviewStates[reviewId];

    try {
      const res = await fetch('/api/admin/reviews/approve', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminSecret}`
        },
        body: JSON.stringify({ reviewId, approvedPhotoCount: parseInt(approvedCount, 10) })
      });
      const data = await res.json();
      
      if (res.ok) {
        setActionSuccess(data.message);
        setReviews(prev => prev.filter(r => r.id !== reviewId));
      } else {
        setError(data.error || 'Failed to approve');
      }
    } catch (err) {
      setError('Connection error.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (reviewId) => {
    setActionLoading(reviewId);
    setActionSuccess('');
    setError('');
    
    const { reason } = reviewStates[reviewId];

    try {
      const res = await fetch('/api/admin/reviews/reject', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminSecret}`
        },
        body: JSON.stringify({ reviewId, reason })
      });
      const data = await res.json();
      
      if (res.ok) {
        setActionSuccess(data.message);
        setReviews(prev => prev.filter(r => r.id !== reviewId));
      } else {
        setError(data.error || 'Failed to reject');
      }
    } catch (err) {
      setError('Connection error.');
    } finally {
      setActionLoading(null);
    }
  };

  const updateState = (id, key, value) => {
    setReviewStates(prev => ({
      ...prev,
      [id]: { ...prev[id], [key]: value }
    }));
  };

  if (!isAuthenticated) {
    return (
      <>
        <Head><meta name="robots" content="noindex, nofollow" /></Head>
        <div className={styles.container}>
          <div className={styles.gateway}>
            <h2>Admin Login</h2>
            <p>Access the Review & Earn Dashboard</p>
            <form onSubmit={handleLogin} className={styles.inputGroup}>
              <input 
                type="password" 
                placeholder="Enter ADMIN_SECRET"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                className={styles.input}
              />
              <button type="submit" className={styles.btnPrimary} disabled={loading}>
                {loading ? <Loader2 className={styles.spinner} /> : 'Login'}
              </button>
            </form>
            {error && <div className={styles.error}>{error}</div>}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head><meta name="robots" content="noindex, nofollow" /></Head>
      <div className={styles.container}>
        <h1 className={styles.title}>Pending Reviews ({reviews.length})</h1>
        
        {actionSuccess && <div style={{background: 'var(--success)', color: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '2rem'}}>{actionSuccess}</div>}
        {error && <div className={styles.error} style={{marginBottom: '2rem'}}>{error}</div>}

        {reviews.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>All caught up!</h3>
            <p>There are no pending reviews at this time.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {reviews.map(review => {
              const state = reviewStates[review.id] || { approvedCount: 0, reason: '' };
              const rewardPreview = Math.min(parseInt(state.approvedCount, 10) * 5, 25);
              const isLoading = actionLoading === review.id;

              return (
                <div key={review.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3>{review.productTitle}</h3>
                    <div className={styles.cardMeta}>
                      <span>Email: {review.userEmail}</span>
                      <span>Order: {review.orderId}</span>
                      <span>Date: {new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className={styles.photoGallery}>
                    {review.photos?.map((url, idx) => (
                      <img 
                        key={idx} 
                        src={url} 
                        alt="User upload" 
                        className={styles.photoThumb}
                        onClick={() => setPreviewPhoto(url)}
                      />
                    ))}
                  </div>

                  <div className={styles.controls}>
                    <div className={styles.controlRow}>
                      <label>Approve Photos (Max {Math.min(review.photoCount, 5)})</label>
                      <input 
                        type="number" 
                        min="0" 
                        max={Math.min(review.photoCount, 5)} 
                        value={state.approvedCount}
                        onChange={(e) => updateState(review.id, 'approvedCount', e.target.value)}
                        className={styles.input}
                        style={{width: '70px', padding: '0.4rem'}}
                      />
                    </div>
                    
                    <div className={styles.controlRow}>
                      <span className={styles.rewardPreview}>Reward: ₹{rewardPreview} Polar Credits</span>
                    </div>

                    <div className={styles.controlRow}>
                      <input 
                        type="text" 
                        placeholder="Rejection reason (optional)"
                        value={state.reason}
                        onChange={(e) => updateState(review.id, 'reason', e.target.value)}
                        className={styles.input}
                        style={{padding: '0.4rem', fontSize: '0.85rem'}}
                      />
                    </div>

                    <div className={styles.actionRow}>
                      <button 
                        className={`${styles.btn} ${styles.btnSuccess}`} 
                        onClick={() => handleApprove(review.id)}
                        disabled={isLoading}
                        style={{flex: 1, justifyContent: 'center'}}
                      >
                        {isLoading ? <Loader2 className={styles.spinner} /> : <><Check size={18}/> Approve</>}
                      </button>
                      
                      <button 
                        className={`${styles.btn} ${styles.btnDanger}`} 
                        onClick={() => handleReject(review.id)}
                        disabled={isLoading}
                        style={{flex: 1, justifyContent: 'center'}}
                      >
                        {isLoading ? <Loader2 className={styles.spinner} /> : <><X size={18}/> Reject</>}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {previewPhoto && (
          <div className={styles.modalOverlay} onClick={() => setPreviewPhoto(null)}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <button className={styles.modalClose} onClick={() => setPreviewPhoto(null)}>&times;</button>
              <img src={previewPhoto} alt="Full screen preview" />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
