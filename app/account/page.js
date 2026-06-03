'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, Package, Gift, Copy, LogOut, CheckCircle2, 
  Star, Heart, Search, MapPin, Search as SearchIcon, Loader2
} from 'lucide-react';
import { dbService } from '../../services/dbService';
import { photoReviewService } from '../../services/photoReviewService';
import { authService } from '../../services/authService';
import { auth, storage } from '../../services/firebaseClient';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useWishlist } from '../context/WishlistContext';
import ReferralWidget from '../components/ReferralWidget';
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

  // Shopify Customer Account API State
  const [shopifyOrders, setShopifyOrders] = useState([]);
  const [isShopifyAuth, setIsShopifyAuth] = useState(false);
  const [shopifyOrdersLoading, setShopifyOrdersLoading] = useState(true);
  const [shopifyOrdersError, setShopifyOrdersError] = useState('');

  // Fetch Shopify Orders when tab is active (Orders or Reviews tab)
  useEffect(() => {
    if ((activeTab === 'orders' || activeTab === 'reviews') && process.env.NEXT_PUBLIC_USE_SHOPIFY_CHECKOUT === 'true' && !isShopifyAuth) {
      const fetchShopifyOrders = async () => {
        setShopifyOrdersLoading(true);
        setShopifyOrdersError('');
        try {
          const user = auth.currentUser;
          if (!user) {
            setShopifyOrdersError('Please sign in to view your orders.');
            setShopifyOrdersLoading(false);
            return;
          }
          
          const idToken = await user.getIdToken();
          
          const res = await fetch('/api/shopify/orders', {
            headers: {
              'Authorization': `Bearer ${idToken}`
            }
          });
          
          if (res.ok) {
            const data = await res.json();
            setShopifyOrders(data.orders || []);
            setIsShopifyAuth(true);
          } else {
            // Also parse the error message if it's JSON from our backend
            try {
              const errData = await res.json();
              setShopifyOrdersError(errData.error || 'Failed to load your Shopify orders.');
            } catch (e) {
              setShopifyOrdersError('Failed to load your Shopify orders. Please try again later.');
            }
          }
        } catch (error) {
          console.error("Fetch orders error:", error);
          setShopifyOrdersError(`Connection Error: ${error.message || 'An error occurred while communicating with Shopify.'}`);
        } finally {
          setShopifyOrdersLoading(false);
        }
      };
      fetchShopifyOrders();
    }
  }, [activeTab, isShopifyAuth, userProfile]);

  // Phase 5A: Review Eligibility State
  const [eligibleReviewProducts, setEligibleReviewProducts] = useState([]);
  const [reviewPhotos, setReviewPhotos] = useState([]);
  const [selectedProductForReview, setSelectedProductForReview] = useState(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);

  useEffect(() => {
    if (!shopifyOrders || !userReviews) return;
    const eligible = [];
    shopifyOrders.forEach(order => {
      // Only check paid/completed orders
      if (order.financialStatus === 'PAID' || order.fulfillmentStatus === 'FULFILLED') {
        const items = order.lineItems?.edges || [];
        items.forEach(({ node: item }) => {
          const productId = item.variant?.product?.id?.split('/').pop() || item.title;
          const isReviewed = userReviews.some(
            r => r.orderId === order.id.split('/').pop() && r.productId === productId
          );
          if (!isReviewed) {
            eligible.push({
              orderId: order.id.split('/').pop(),
              orderName: order.name,
              product: item.variant?.product || null,
              productId: productId,
              productTitle: item.title,
              image: item.variant?.image?.url || null
            });
          }
        });
      }
    });
    setEligibleReviewProducts(eligible);
  }, [shopifyOrders, userReviews]);

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
    { id: 'credits', label: 'Polar Credits', icon: <Gift size={18} /> },
    { id: 'referral', label: 'Refer & Earn', icon: <User size={18} /> },
    { id: 'reviews', label: 'Review Rewards', icon: <Star size={18} /> },
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

                <div className={`${styles.summaryCard} ${styles.statsCard}`} onClick={() => setActiveTab('orders')}>
                  <div className={styles.cardHeader}>
                    <Package size={20} className={styles.cardIcon} />
                    <span>Total Orders</span>
                  </div>
                  <div className={styles.cardValue}>{totalOrders}</div>
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
              
              {process.env.NEXT_PUBLIC_USE_SHOPIFY_CHECKOUT === 'true' ? (
                shopifyOrdersLoading ? (
                  <div className={styles.emptyState}>
                    <Loader2 size={32} className={styles.loadingSpinner} style={{ animation: 'spin 1s linear infinite' }} />
                    <p style={{ marginTop: '16px' }}>Loading your Shopify orders...</p>
                  </div>
                ) : shopifyOrdersError ? (
                  <div className={styles.emptyState}>
                    <h3 className={styles.emptyTitle}>Error</h3>
                    <p className={styles.emptyDesc} style={{ color: 'var(--color-error)' }}>{shopifyOrdersError}</p>
                    <button onClick={() => window.location.reload()} className={styles.outlineBtn} style={{ marginTop: '16px', display: 'inline-block' }}>
                      Try Again
                    </button>
                  </div>
                ) : shopifyOrders.length === 0 ? (
                  <div className={styles.emptyState}>
                    <Package size={48} className={styles.emptyIcon} />
                    <h3 className={styles.emptyTitle}>No Shopify orders found</h3>
                    <p className={styles.emptyDesc}>Looks like you haven't placed any orders yet through Shopify.</p>
                    <Link href="/shop" className={styles.primaryBtn}>Start Shopping</Link>
                  </div>
                ) : (
                  <div className={styles.orderCardsList}>
                    {shopifyOrders.map(order => (
                      <div key={order.id} className={styles.orderCard}>
                        <div className={styles.orderCardHeader}>
                          <div className={styles.orderMeta}>
                            <span className={styles.orderId}>Order {order.name}</span>
                            <span className={styles.orderDate}>Date: {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                          <div className={styles.orderStatusBadge}>
                            {order.fulfillmentStatus || order.financialStatus}
                          </div>
                        </div>
                        
                        <div className={styles.orderCardBody}>
                          <div className={styles.orderTotal}>
                            <span className={styles.totalLabel}>Total:</span>
                            <span className={styles.totalValue}>{order.totalPrice?.currencyCode === 'INR' ? '₹' : order.totalPrice?.currencyCode}{order.totalPrice?.amount}</span>
                          </div>
                          
                          <div className={styles.orderItemsSection}>
                            <span className={styles.itemsLabel}>Items:</span>
                            <div className={styles.orderItemsList}>
                              {order.lineItems?.edges?.map((edge, idx) => (
                                <div key={idx} className={styles.orderItemLine}>
                                  <span className={styles.orderItemTitle}>{edge.node.title}</span>
                                  <span className={styles.orderItemQty}> × {edge.node.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className={styles.orderCardFooter}>
                          <a href={order.statusPageUrl} target="_blank" rel="noopener noreferrer" className={`${styles.actionBtn} ${styles.solidBtn}`} style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center' }}>
                            View / Track Order
                          </a>
                        </div>
                      </div>
                    ))}
                    <div style={{ textAlign: 'center', marginTop: '24px' }}>
                       <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>Orders automatically synced via {userProfile?.email}</span>
                    </div>
                  </div>
                )
              ) : totalOrders === 0 ? (
                <div className={styles.emptyState}>
                  <Package size={48} className={styles.emptyIcon} />
                  <h3 className={styles.emptyTitle}>No Orders Yet</h3>
                  <p className={styles.emptyDesc}>Looks like you haven't placed an order yet.</p>
                  <Link href="/shop" className={styles.primaryBtn}>Start Shopping</Link>
                </div>
              ) : (
                <div className={styles.orderCardsList}>
                  {userProfile.orders.map(order => (
                    <div key={order.orderId} className={styles.orderCard}>
                      <div className={styles.orderCardHeader}>
                        <div className={styles.orderMeta}>
                          <span className={styles.orderId}>Order #{order.orderId}</span>
                          <span className={styles.orderDate}>Date: {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <div className={styles.orderStatusBadge}>
                          {order.orderStatus}
                        </div>
                      </div>
                      
                      <div className={styles.orderCardBody}>
                        <div className={styles.orderTotal}>
                          <span className={styles.totalLabel}>Total:</span>
                          <span className={styles.totalValue}>₹{order.finalAmount}</span>
                        </div>
                        
                        <div className={styles.orderItemsSection}>
                          <span className={styles.itemsLabel}>Items:</span>
                          {renderOrderItems(order.items)}
                        </div>
                      </div>
                      
                      <div className={styles.orderCardFooter}>
                        <button className={`${styles.actionBtn} ${styles.outlineBtn}`}>View Details</button>
                        <button className={`${styles.actionBtn} ${styles.solidBtn}`}>Track Order</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: CREDITS */}
          {activeTab === 'credits' && (
            <div className={`${styles.tabPane} ${styles.fadeIn}`}>
              <h2 className={styles.sectionTitle}>Polar Credits</h2>
              
              <div className={styles.creditsDisplayCard}>
                <div className={styles.creditBalance}>
                  <span className={styles.creditLabel}>Available Credits</span>
                  <span className={styles.creditAmount}>₹{userProfile.availableCredits || 0}</span>
                </div>
                <div className={styles.creditDivider}></div>
                <div className={styles.creditSecondary}>
                  <div className={styles.creditStat}>
                    <span>Pending:</span> <strong>₹{userProfile.pendingCredits || 0}</strong>
                  </div>
                  <div className={styles.creditStat}>
                    <span>Used:</span> <strong>₹{userProfile.usedCredits || 0}</strong>
                  </div>
                </div>
              </div>

              {(!userProfile.availableCredits && !userProfile.pendingCredits) && (
                <div className={styles.creditsEmptyState}>
                  <p>Earn credits by referring friends or submitting approved photo reviews.</p>
                </div>
              )}

              <p className={styles.creditsDisclaimer}>
                * Polar Credits are store credits only. They cannot be withdrawn, transferred, or converted into cash.
              </p>
            </div>
          )}

          {/* TAB: REFER & EARN */}
          {activeTab === 'referral' && (
            <div className={`${styles.tabPane} ${styles.fadeIn}`}>
              <div className={styles.referralHeroCard}>
                <h3 className={styles.referralTitle}>Give ₹200, Get ₹200</h3>
                <p className={styles.referralSubtitle}>
                  Your friend gets ₹200 OFF their first order. You earn ₹200 Polar Credits after their order is completed.
                </p>
                <p className={styles.referralExplainer}>
                  Share your referral link. When your friend places and completes their first paid order, your ₹200 Polar Credits become active.
                </p>
                
                <div className={styles.referralActionBox}>
                  <span className={styles.referralCodeLabel}>Referral Code:</span>
                  <code className={styles.referralCodeText}>{userProfile.referralCode}</code>
                  <button onClick={copyReferral} className={styles.copyBtn}>
                    {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />} 
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className={`${styles.tabPane} ${styles.fadeIn}`}>
              <h2 className={styles.sectionTitle}>Review Rewards ({reviewCount})</h2>
              
              {reviewCount === 0 && eligibleReviewProducts.length === 0 ? (
                <div className={styles.emptyState}>
                  <Star size={48} className={styles.emptyIcon} />
                  <h3 className={styles.emptyTitle}>No review rewards yet.</h3>
                  <p className={styles.emptyDesc}>Complete a Shopify purchase to unlock products for review.</p>
                </div>
              ) : (
                <div className={styles.reviewContainer}>
                  {eligibleReviewProducts.length > 0 && (
                    <div className={styles.eligibleSection}>
                      <h3 className={styles.subsectionTitle}>Eligible for Review</h3>
                      <p className={styles.subtitle}>Submit up to 5 photos to earn ₹5 Polar Credits per photo (Max ₹25 per product).</p>
                      <div className={styles.orderCardsList}>
                        {eligibleReviewProducts.map((ep, idx) => (
                          <div key={idx} className={styles.reviewCard}>
                            <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                              {ep.image && <img src={ep.image} alt={ep.productTitle} style={{width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover'}}/>}
                              <div>
                                <strong>{ep.productTitle}</strong>
                                <div style={{fontSize: '0.85rem', color: '#6e6e73'}}>Order {ep.orderName}</div>
                              </div>
                            </div>
                            <button 
                              className={`${styles.actionBtn} ${styles.solidBtn}`}
                              onClick={() => setSelectedProductForReview(ep)}
                            >
                              Write Review
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedProductForReview && (
                    <div className={styles.reviewModalOverlay}>
                      <div className={styles.reviewModal}>
                        <h3>Review: {selectedProductForReview.productTitle}</h3>
                        <p>Upload photos to earn Polar Credits.</p>
                        
                        <div style={{margin: '1rem 0'}}>
                          <label>Upload Photos (Max 5, 5MB each)</label>
                          <input 
                            type="file" 
                            multiple 
                            accept="image/jpeg, image/png, image/webp" 
                            onChange={(e) => {
                              const files = Array.from(e.target.files);
                              const validFiles = files.filter(f => 
                                ['image/jpeg', 'image/png', 'image/webp'].includes(f.type) && 
                                f.size <= 5 * 1024 * 1024
                              ).slice(0, 5);
                              setReviewPhotos(validFiles.map(f => ({ file: f, previewUrl: URL.createObjectURL(f) })));
                            }} 
                            style={{ display: 'block', margin: '0.5rem 0' }}
                          />
                          {reviewPhotos.length > 0 && (
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                              {reviewPhotos.map((photo, i) => (
                                <img key={i} src={photo.previewUrl} alt={`preview ${i}`} style={{width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #333'}} />
                              ))}
                            </div>
                          )}
                          {reviewPhotos.length > 0 && <div style={{fontSize: '0.8rem', marginTop: '0.5rem', color: '#00d084'}}>{reviewPhotos.length} photo(s) selected.</div>}
                        </div>

                        <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                          <button onClick={() => setSelectedProductForReview(null)} className={styles.outlineBtn}>Cancel</button>
                          <button onClick={handleReviewSubmit} disabled={reviewSubmitting} className={styles.solidBtn}>
                            {reviewSubmitting ? <Loader2 className={styles.spinner} /> : 'Submit Review'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <h3 className={styles.subsectionTitle} style={{marginTop: '2rem'}}>Your Reviews</h3>
                  <div className={styles.orderCardsList}>
                    {userReviews.map(review => (
                      <div key={review.reviewId} className={styles.reviewCard}>
                        <div>Product: {review.productId}</div>
                        <div>Status: {review.status}</div>
                        <div>Reward: ₹{review.creditAmount || 0}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
