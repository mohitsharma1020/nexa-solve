'use client';

import { useCart } from '../context/CartContext';
import styles from './CartDrawer.module.css';
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
    isInitialized,
    processCheckout,
  } = useCart();



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
                      <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: '4px' }}>ANTARCTICA</strong>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-light)' }}>Use code at checkout for ₹1250 OFF.</p>
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
