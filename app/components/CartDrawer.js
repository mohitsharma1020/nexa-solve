'use client';

import { useCart } from '../context/CartContext';
import styles from './CartDrawer.module.css';
import CartBonusTimer from './CartBonusTimer';
import { X, Minus, Plus, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CartDrawer() {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const {
    isDrawerOpen,
    toggleDrawer,
    cartItems,
    cartCount,
    updateQuantity,
    removeItem,
    subtotal,
    shipping,
    shippingCharge,
    shippingDiscount,
    total,
    totalSavings,
    isFirstOrder,
    discountCode,
    setDiscountCode,
    appliedPromoCode,
    applyPromo,
    removePromo,
    promoMessage,
    actualDiscount,
    availableCredits,
    polarCreditsApplied,
    polarCreditsMessage,
    polarCreditsUsed,
    togglePolarCredits,
    isInitialized,
    actualCartBonus,
    isCartBonusActive,
    hasCartBonusExpired,
    CART_BONUS_AMOUNT,
    processCheckout,
  } = useCart();

  const [hasReferral, setHasReferral] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const refCode = localStorage.getItem('nexa_referral_code');
      if (refCode) {
        setHasReferral(true);
      }
    }
  }, [isDrawerOpen]);

  const promoIsApplied = appliedPromoCode === 'ANTARCTICA';

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      const handleEsc = (e) => {
        if (e.key === 'Escape') toggleDrawer(false);
      };
      window.addEventListener('keydown', handleEsc);
      return () => {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        window.removeEventListener('keydown', handleEsc);
      };
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
  }, [isDrawerOpen, toggleDrawer]);

  const handleCheckoutClick = async (e) => {
    e.preventDefault();
    setIsCheckingOut(true);
    await processCheckout();
    setIsCheckingOut(false);
  };

  if (!isInitialized) return null;

  return (
    <>
      <div 
        className={`${styles.overlay} ${isDrawerOpen ? styles.overlayOpen : ''}`} 
        onClick={() => toggleDrawer(false)}
      />
      <div className={`${styles.drawer} ${isDrawerOpen ? styles.drawerOpen : ''}`}>
        
        <div className={styles.header}>
          <h2 className={styles.title}>
            <ShoppingCart size={22} />
            Your Cart <span className={styles.cartCount}>{cartCount}</span>
          </h2>
          <button className={styles.closeBtn} onClick={() => toggleDrawer(false)}>
            <X size={24} />
          </button>
        </div>

        {/* ── Cart Bonus Timer Banner ── */}
        {cartItems.length > 0 && <CartBonusTimer variant="drawer" />}

        {cartItems.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🛒</div>
            <h3 className={styles.emptyTitle}>Your cart is empty</h3>
            <button className={styles.emptyBtn} onClick={() => toggleDrawer(false)}>
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            <div className={styles.itemsContainer}>
              {cartItems.map((item) => (
                <div key={item.id} className={styles.item}>
                  <div className={styles.itemImage}>
                    <Image src={item.image} alt={item.title} fill sizes="80px" style={{ objectFit: 'cover' }} />
                  </div>
                  <div className={styles.itemDetails}>
                    <h4 className={styles.itemTitle}>{item.title}</h4>
                    <div className={styles.itemPriceRow}>
                      <span className={styles.itemPrice}>₹{item.price.toLocaleString('en-IN')}</span>
                      {item.originalPrice && (
                        <span className={styles.itemOriginalPrice}>₹{item.originalPrice.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                    <div className={styles.itemControls}>
                      <div className={styles.quantityCtrl}>
                        <button className={styles.qtyBtn} onClick={() => updateQuantity(item.id, -1)}>
                          <Minus size={14} />
                        </button>
                        <span className={styles.qtyValue}>{item.quantity}</span>
                        <button className={styles.qtyBtn} onClick={() => updateQuantity(item.id, 1)}>
                          <Plus size={14} />
                        </button>
                      </div>
                      <button className={styles.removeBtn} onClick={() => removeItem(item.id)}>
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            
              {/* --- PROMO & OFFERS --- */}
              {process.env.NEXT_PUBLIC_USE_SHOPIFY_CHECKOUT === 'true' ? (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '0.95rem', color: 'var(--color-text)' }}>Available Offers</h4>
                  
                  {/* Offer Card 1 */}
                  <div className={styles.offerCard} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f5f5f7', padding: '12px', borderRadius: '8px', marginBottom: '10px', border: '1px solid var(--color-border)' }}>
                    <div>
                      {hasReferral ? (
                        <>
                          <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: '4px', color: '#0066FF' }}>Referral Benefit Unlocked</strong>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-light)' }}>You received ₹200 OFF through a referral.</p>
                        </>
                      ) : (
                        <>
                          <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: '4px' }}>ANTARCTICA</strong>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-light)' }}>Use code at checkout for ₹1250 OFF.</p>
                        </>
                      )}
                    </div>
                    <button 
                      className={styles.offerCardBtn}
                      onClick={() => {
                        navigator.clipboard.writeText('ANTARCTICA');
                        alert('Code ANTARCTICA copied! Paste it at checkout.');
                      }}
                      style={{ padding: '6px 12px', background: 'var(--color-text)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Copy Code
                    </button>
                  </div>

                  {hasReferral && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', textAlign: 'center', marginBottom: '12px' }}>
                      Discount is applied securely at Shopify checkout.
                    </div>
                  )}

                  {/* Offer Card 2: 10-Minute Timer (Imported Component) */}
                  <div style={{ background: '#f5f5f7', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                    <CartBonusTimer variant="compact" />
                  </div>
                </div>
              ) : (
                <div className={styles.promoContainer}>
                  <div className={styles.promoInputGroup}>
                    <input
                      type="text"
                      className={styles.promoInput}
                      placeholder="Promo code (Try ANTARCTICA)"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      disabled={promoIsApplied}
                      onKeyDown={(e) => e.key === 'Enter' && !promoIsApplied && applyPromo()}
                    />
                    {promoIsApplied ? (
                      <button
                        className={styles.promoBtn}
                        onClick={removePromo}
                        style={{ background: 'var(--color-success)' }}
                        title="Remove promo code"
                      >
                        APPLIED ✓
                      </button>
                    ) : (
                      <button
                        className={styles.promoBtn}
                        onClick={() => applyPromo()}
                      >
                        APPLY
                      </button>
                    )}
                  </div>
                  {promoMessage.text && (
                    <div className={styles.promoMessage} style={{ color: promoMessage.type === 'error' ? 'var(--color-error)' : 'var(--color-success)' }}>
                      {promoMessage.text}
                    </div>
                  )}
                </div>
              )}

              {/* Polar Credits Section */}
              <div style={{ marginBottom: '20px', padding: '16px', background: 'linear-gradient(145deg, #f8f9fa, #ffffff)', borderRadius: '12px', border: '1px solid var(--color-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>💎</span>
                    <strong style={{ fontSize: '1rem', color: 'var(--color-primary)' }}>Polar Credits</strong>
                  </div>
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: 800 }}>Balance: ₹{availableCredits}</span>
                </div>
                
                {availableCredits <= 0 ? (
                  <div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginBottom: '12px', lineHeight: 1.4 }}>
                      Refer friends or complete your first referral order to earn <strong>₹200 Polar Credits</strong>.
                    </p>
                    <Link href="/referral" onClick={() => toggleDrawer(false)} style={{
                      display: 'block', textAlign: 'center', width: '100%', padding: '10px', borderRadius: '8px', 
                      fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s',
                      background: 'transparent', color: 'var(--color-accent)', border: '1px solid var(--color-accent)', textDecoration: 'none'
                    }}>
                      Learn How to Earn
                    </Link>
                  </div>
                ) : (
                  <div>
                    {process.env.NEXT_PUBLIC_USE_SHOPIFY_CHECKOUT === 'true' ? (
                      <div className={styles.polarCreditsBox} style={{ background: 'rgba(0, 102, 255, 0.05)', border: '1px dashed #0066FF' }}>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: '#0066FF' }}>❄️</span> Polar Credits
                        </h4>
                        <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                          You have <strong style={{ color: 'var(--color-text)' }}>₹{availableCredits}</strong> available.<br/>
                          <em>Polar Credits will be available to redeem as a Shopify discount code soon!</em>
                        </p>
                      </div>
                    ) : (
                      <div className={styles.polarCreditsBox}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div>
                            <h4 style={{ margin: 0, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ color: '#0066FF' }}>❄️</span> Polar Credits
                            </h4>
                            <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                              Available: <strong style={{ color: 'var(--color-text)' }}>₹{availableCredits}</strong>
                            </p>
                          </div>
                          <button 
                            className={polarCreditsApplied ? styles.removeCreditsBtn : styles.applyCreditsBtn}
                            onClick={togglePolarCredits}
                            disabled={availableCredits <= 0}
                            style={{ 
                              opacity: availableCredits <= 0 ? 0.5 : 1, 
                              cursor: availableCredits <= 0 ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {polarCreditsApplied ? 'Credits Applied ✓' : 'Apply Credits (Up to ₹200)'}
                          </button>
                        </div>
                        {polarCreditsMessage && (
                          <div style={{ fontSize: '0.85rem', marginTop: '10px', fontWeight: 500, color: polarCreditsApplied ? 'var(--color-success)' : 'var(--color-error)' }}>
                            {polarCreditsMessage}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className={styles.summary}>
                {isFirstOrder && shippingDiscount > 0 && (
                  <div style={{ background: 'rgba(0, 200, 83, 0.1)', padding: '10px 12px', borderRadius: '8px', marginBottom: '8px' }}>
                    <p style={{ color: 'var(--color-success)', fontSize: '0.85rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '1rem' }}>🎉</span> First order benefit: Free shipping worth ₹99 unlocked.
                    </p>
                  </div>
                )}
                
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                
                {actualDiscount > 0 && (
                  <div className={`${styles.summaryRow} ${styles.discount}`}>
                    <span>Promo Discount</span>
                    <span>-₹{actualDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className={styles.summaryRow}>
                  <span>Shipping</span>
                  <span>
                    {shippingCharge > 0 ? (
                      shippingDiscount > 0 ? (
                        <>
                          <span style={{ textDecoration: 'line-through', color: 'var(--color-text-light)', marginRight: '8px' }}>₹{shippingCharge}</span>
                          <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>FREE</span>
                        </>
                      ) : (
                        `₹${shippingCharge}`
                      )
                    ) : (
                      <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>FREE</span>
                    )}
                  </span>
                </div>
                
                {shippingCharge > 0 && !isFirstOrder && subtotal < FREE_SHIPPING_THRESHOLD && (
                  <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--color-accent)', marginTop: '-8px', marginBottom: '8px', fontWeight: 600 }}>
                    Add ₹{amountToFreeShipping.toLocaleString('en-IN')} more to unlock free shipping
                  </div>
                )}

                {polarCreditsUsed > 0 && (
                  <div className={styles.summaryRow} style={{ color: 'var(--color-success)' }}>
                    <span>Polar Credits</span>
                    <span>-₹{polarCreditsUsed.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {/* Cart Bonus Line Item */}
                {(isCartBonusActive || hasCartBonusExpired) && (
                  <div className={`${styles.summaryRow} ${isCartBonusActive ? styles.discount : ''}`} style={{
                    color: isCartBonusActive ? '#22c55e' : '#9ca3af',
                    fontStyle: hasCartBonusExpired ? 'italic' : 'normal'
                  }}>
                    <span>10-Min Cart Bonus</span>
                    {process.env.NEXT_PUBLIC_USE_SHOPIFY_CHECKOUT === 'true' ? (
                      <span>{isCartBonusActive ? `Use code CART40 at checkout` : 'Expired'}</span>
                    ) : (
                      <span>{isCartBonusActive ? `-₹${CART_BONUS_AMOUNT}` : 'Expired'}</span>
                    )}
                  </div>
                )}

                {/* Total row omitted here since it is now strictly in the sticky footer */}
              </div>
            </div>

            <div className={styles.footer}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-text-light)' }}>Total</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)' }}>₹{total.toLocaleString('en-IN')}</span>
              </div>

              <button 
                className={styles.checkoutBtn} 
                style={{ width: '100%', opacity: isCheckingOut ? 0.7 : 1 }} 
                onClick={(e) => {
                  toggleDrawer(false);
                  handleCheckoutClick(e);
                }}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? 'Preparing Checkout...' : 'Checkout securely'}
              </button>
              
              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '14px', display: 'flex', justifyContent: 'center', gap: '6px', fontWeight: 500 }}>
                <span>🔒 Secure checkout</span>
                <span>•</span>
                <span>Fast delivery</span>
                <span>•</span>
                <span>Easy returns</span>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
