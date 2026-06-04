'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, Package, LogOut, Heart, Search, MapPin, Search as SearchIcon, Loader2
} from 'lucide-react';
import { dbService } from '../../services/dbService';
import { authService } from '../../services/authService';
import { auth } from '../../services/firebaseClient';
import { useWishlist } from '../context/WishlistContext';
import styles from './Account.module.css';

export default function AccountPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [requireEmailForLink, setRequireEmailForLink] = useState(false);
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [userReviews, setUserReviews] = useState([]);
  const [copied, setCopied] = useState(false);
  
  const [activeTab, setActiveTab] = useState('overview');
  const { savedItems } = useWishlist();

  // Phase 5A: Review Eligibility State
  const [eligibleReviewProducts, setEligibleReviewProducts] = useState([]);
  const [reviewPhotos, setReviewPhotos] = useState([]);
  const [selectedProductForReview, setSelectedProductForReview] = useState(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);

  useEffect(() => {
    // Orders are now managed strictly off-site on Shopify.
    // For now, eligible reviews are disabled or manually assigned.
    setEligibleReviewProducts([]);
  }, [userReviews]);

  const handleReviewSubmit = async () => {
    if (!selectedProductForReview) return;
    if (reviewPhotos.length === 0) {
      setError('Please attach at least 1 photo.');
      return;
    }
    setReviewSubmitting(true);
    setError('');
    setSuccessMsg('');
    try {
      // 1. Upload photos to Firebase Storage
      const uploadedUrls = [];
      for (const { file } of reviewPhotos) {
        const storageRef = ref(storage, `reviews/${Date.now()}_${file.name}`);
        const uploadTask = await uploadBytesResumable(storageRef, file);
        const downloadUrl = await getDownloadURL(uploadTask.ref);
        uploadedUrls.push(downloadUrl);
      }

      // 2. Submit to backend
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedProductForReview.orderId,
          productId: selectedProductForReview.productId,
          productTitle: selectedProductForReview.productTitle,
          photos: uploadedUrls,
          rating: reviewRating,
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message || 'Review submitted successfully! Pending admin approval.');
        setSelectedProductForReview(null);
        setReviewPhotos([]);
        // Optimistic update
        setUserReviews([{ reviewId: 'temp', productId: selectedProductForReview.productId, status: 'under_review', creditAmount: 0 }, ...userReviews]);
      } else {
        setError(data.error || 'Failed to submit review.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during upload or submission.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // 1. Listen for standard Auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        // User is securely logged in
        try {
          const profile = await dbService.getOrCreateUser(
            firebaseUser.email, 
            null, // phone
            firebaseUser.displayName || 'Customer',
            firebaseUser.photoURL || null
          );
          setUserProfile(profile);
          const reviews = await photoReviewService.getUserReviews(profile.id);
          setUserReviews(reviews || []);
        } catch (err) {
          console.error(err);
          setError('Failed to load profile data.');
        }
      } else {
        // User is logged out
        setUserProfile(null);
        setUserReviews([]);
      }
      setIsInitializing(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Check if the user is landing on this page via an Email Magic Link
  useEffect(() => {
    const handleEmailLink = async () => {
      // Check if URL has the sign-in parameters
      if (typeof window !== 'undefined' && window.location.href.includes('mode=signIn')) {
        setIsInitializing(true);
        const result = await authService.completeSignIn(window.location.href);
        if (result.success) {
          setSuccessMsg('Successfully logged in!');
          // Remove the auth params from the URL for a clean look
          router.replace('/account'); 
        } else if (result.requireEmail) {
          setRequireEmailForLink(true);
          setError('Please confirm your email address to complete sign in.');
          setIsInitializing(false);
        } else {
          setError(result.error || 'The login link is invalid or has expired.');
          setIsInitializing(false);
        }
      }
    };
    handleEmailLink();
  }, [router]);

  // 3. Check for Google Sign-In Redirect results (Mobile Fallback)
  useEffect(() => {
    const checkRedirect = async () => {
      const result = await authService.checkRedirectResult();
      if (result.success && result.user) {
        setSuccessMsg('Signed in successfully.');
      } else if (result.error) {
        setError(result.error);
        setIsInitializing(false);
      }
    };
    checkRedirect();
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    setSuccessMsg('');
    const result = await authService.signInWithGoogle();
    
    if (result.success && result.user) {
      setSuccessMsg('Signed in successfully.');
    } else if (result.pendingRedirect) {
      // Browser is redirecting to Google, UI state doesn't matter much here
      setLoading(true); 
    } else {
      setError(result.error || 'Google sign-in failed.');
      setLoading(false);
    }
  };

  const handleSendLink = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    setSuccessMsg('');

    // If this was triggered because they clicked a link on a new device and needed to confirm
    if (requireEmailForLink) {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('emailForSignIn', email);
      }
      const result = await authService.completeSignIn(window.location.href);
      if (result.success) {
        setRequireEmailForLink(false);
        setSuccessMsg('Successfully logged in!');
        router.replace('/account');
      } else {
        setError(result.error || 'Failed to verify email link.');
      }
      setLoading(false);
      return;
    }

    // Normal flow: Send the magic link
    const result = await authService.sendMagicLink(email);
    if (result.success) {
      setSuccessMsg(`Secure login link sent. Please check your inbox or spam folder.`);
      setEmail('');
    } else {
      if (result.error && result.error.includes('auth/api-key-not-valid')) {
        setError('Firebase API Key missing! Please add your Firebase API Key to .env.local (NEXT_PUBLIC_FIREBASE_API_KEY) and restart the dev server to use real Magic Links.');
      } else {
        setError(result.error || 'Failed to send login link.');
      }
    }
    setLoading(false);
  };

  const copyReferral = () => {
    navigator.clipboard.writeText(`https://nexa-solve-store-9901.web.app/shop?ref=${userProfile?.referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    const result = await authService.logout();
    if (!result.success) {
      setError(result.error);
    }
  };

  const renderOrderItems = (items) => {
    if (!items || items.length === 0) return null;
    const grouped = items.reduce((acc, item) => {
      const key = item.id || item.slug || item.title;
      if (!acc[key]) {
        acc[key] = { ...item, aggregatedQuantity: item.quantity || 1 };
      } else {
        acc[key].aggregatedQuantity += (item.quantity || 1);
      }
      return acc;
    }, {});

    const uniqueItems = Object.values(grouped);

    return (
      <div className={styles.orderItemsList}>
        {uniqueItems.map((item, idx) => (
          <div key={idx} className={styles.orderItemLine}>
            <span className={styles.orderItemTitle}>{item.title}</span>
            <span className={styles.orderItemQty}> × {item.aggregatedQuantity}</span>
          </div>
        ))}
      </div>
    );
  };

  if (isInitializing) {
    return (
      <div className={styles.authContainer} style={{ flexDirection: 'column', gap: 16 }}>
        <Loader2 size={32} className={styles.loadingSpinner} style={{ animation: 'spin 1s linear infinite' }} />
        <p>Securing session...</p>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authBox}>
          <div className={styles.authIconWrapper}>
            <User size={36} />
          </div>
          <h1 className={styles.authTitle}>Access Your Account</h1>
          
          <p className={styles.authDesc}>
            {requireEmailForLink 
              ? 'To protect your security, please confirm the email address you used to request this link.'
              : 'Sign in to view your orders, Polar Credits, referrals, saved items, and rewards.'}
          </p>

          {!requireEmailForLink && (
            <>
              <button 
                onClick={handleGoogleLogin} 
                disabled={loading} 
                className={styles.googleBtn}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  <path d="M1 1h22v22H1z" fill="none"/>
                </svg>
                Continue with Google
              </button>

              <div className={styles.divider}>
                <span>or</span>
              </div>
            </>
          )}

          <form onSubmit={handleSendLink}>
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.authInput}
              required 
            />
            
            {error && <p className={styles.authError}>{error}</p>}
            {successMsg && (
              <div className={styles.authSuccessBox}>
                <p className={styles.authSuccess}>{successMsg}</p>
                <p className={styles.authHelperText}>If the email is not in your inbox, please check Spam or Promotions.</p>
              </div>
            )}
            
            <button type="submit" disabled={loading} className={styles.authSubmitBtn}>
              {loading ? 'Processing...' : (requireEmailForLink ? 'Verify & Continue' : 'Send Secure Login Link')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <User size={18} /> },
    { id: 'orders', label: 'Orders', icon: <Package size={18} /> },
    { id: 'saved', label: 'Saved Items', icon: <Heart size={18} /> },
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
  ];

  const totalOrders = userProfile.orders?.length || 0;
  const reviewCount = userReviews?.length || 0;
  const savedCount = savedItems?.length || 0;

  return (
    <div className={styles.accountPageWrapper}>
      {/* 1. Header Card */}
      <div className={styles.headerCard}>
        <div className={styles.headerInner}>
          <div className={styles.headerAvatar}>
            <User size={32} />
          </div>
          <div className={styles.headerInfo}>
            <h1 className={styles.headerWelcome}>Welcome, {userProfile.name}</h1>
            <p className={styles.headerSubtitle}>Manage your orders, rewards, referrals, and saved products.</p>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <div className={styles.accountLayout}>
        {/* Navigation Tabs */}
        <div className={styles.accountSidebar}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${styles.accountTab} ${activeTab === tab.id ? styles.active : ''}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className={styles.accountContent}>
          
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className={`${styles.tabPane} ${styles.fadeIn}`}>
              <h2 className={styles.sectionTitle}>Account Overview</h2>
              
              {/* 2. Summary Cards */}
              <div className={styles.summaryGrid}>
                {/* Polar Credits */}
                <div className={`${styles.summaryCard} ${styles.creditsCard}`}>
                  <div className={styles.cardHeader}>
                    <Gift size={20} className={styles.cardIcon} />
                    <span>Polar Credits</span>
                  </div>
                  <div className={styles.cardValue}>₹{userProfile.availableCredits || 0}</div>
                  <div className={styles.cardSubtext}>Available to spend</div>
                </div>

                {/* Pending Credits */}
                <div className={`${styles.summaryCard} ${styles.pendingCard}`}>
                  <div className={styles.cardHeader}>
                    <Gift size={20} className={styles.cardIcon} />
                    <span>Pending Credits</span>
                  </div>
                  <div className={styles.cardValue}>₹{userProfile.pendingCredits || 0}</div>
                  <div className={styles.cardSubtext}>Awaiting approval</div>
                </div>

                  <div className={`${styles.summaryCard} ${styles.statsCard}`} onClick={() => setActiveTab('reviews')}>
                  <div className={styles.cardHeader}>
                    <Star size={20} className={styles.cardIcon} />
                    <span>Review Rewards</span>
                  </div>
                  <div className={styles.cardValue}>{reviewCount}</div>
                </div>

                <div className={`${styles.summaryCard} ${styles.statsCard}`} onClick={() => setActiveTab('saved')}>
                    <div className={styles.cardHeader}>
                      <Heart size={20} className={styles.cardIcon} />
                      <span>Saved Items</span>
                    </div>
                    <div className={styles.cardValue}>{savedCount}</div>
                  </div>
                </div>



                {/* Refer & Earn Banner */}
                <ReferralWidget />
              </div>
            )}

          {/* TAB: ORDERS */}
          {activeTab === 'orders' && (
            <div className={`${styles.tabPane} ${styles.fadeIn}`}>
              <h2 className={styles.sectionTitle}>Order History</h2>
              
              <div className={styles.emptyState} style={{ padding: '40px 20px', maxWidth: '600px', margin: '0 auto', background: 'var(--color-off-white)', borderRadius: '16px', textAlign: 'center' }}>
                <Package size={48} className={styles.emptyIcon} style={{ margin: '0 auto 16px', color: 'var(--color-text-light)' }} />
                <h3 className={styles.emptyTitle} style={{ fontSize: '1.2rem', marginBottom: '12px' }}>View Your Orders</h3>
                <p className={styles.emptyDesc} style={{ fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--color-text-light)', marginBottom: '24px' }}>
                  Orders placed through website checkout are managed securely. Use the same email you used at checkout to sign in and view your order history, payment status, and delivery updates.
                </p>
                <a href="https://bcz5qp-zj.myshopify.com/account" target="_blank" rel="noopener noreferrer" className={styles.primaryBtn} style={{ display: 'inline-flex', padding: '12px 24px', background: 'var(--color-accent)', color: '#fff', borderRadius: '8px', fontWeight: '500', textDecoration: 'none' }}>
                  Sign in to View Orders
                </a>
              </div>
            </div>
          )}

          {/* TAB: SAVED ITEMS */}
          {activeTab === 'saved' && (
            <div className={`${styles.tabPane} ${styles.fadeIn}`}>
              <h2 className={styles.sectionTitle}>Saved Items ({savedCount})</h2>
              
              {savedCount === 0 ? (
                <div className={styles.emptyState}>
                  <Heart size={48} className={styles.emptyIcon} />
                  <h3 className={styles.emptyTitle}>0 Saved Items</h3>
                  <p className={styles.emptyDesc}>Products you save will appear here.</p>
                  <Link href="/shop" className={styles.primaryBtn}>Browse Products</Link>
                </div>
              ) : (
                <div className={styles.savedGrid}>
                  {savedItems.map(item => (
                    <div key={item.id} className={styles.savedCard}>
                      <div className={styles.savedImgWrapper}>
                        <img src={item.image} alt={item.title} />
                      </div>
                      <div className={styles.savedInfo}>
                        <h4>{item.title}</h4>
                        <p>₹{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: PROFILE */}
          {activeTab === 'profile' && (
            <div className={`${styles.tabPane} ${styles.fadeIn}`}>
              <h2 className={styles.sectionTitle}>My Profile</h2>
              
              <div className={styles.profileCard}>
                <div className={styles.profileRow}>
                  <span className={styles.profileLabel}>Name</span>
                  <span className={styles.profileValue}>{userProfile.name}</span>
                </div>
                <div className={styles.profileRow}>
                  <span className={styles.profileLabel}>Email</span>
                  <span className={styles.profileValue}>{userProfile.email}</span>
                </div>
                <div className={styles.profileRow}>
                  <span className={styles.profileLabel}>Mobile Number</span>
                  <span className={styles.profileValue}>{userProfile.phone || 'Not provided'}</span>
                </div>
                <div className={styles.profileRow}>
                  <span className={styles.profileLabel}>Address</span>
                  <span className={styles.profileValue}>Not provided</span>
                </div>
                
                <button className={styles.editProfileBtn}>Edit Profile</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
