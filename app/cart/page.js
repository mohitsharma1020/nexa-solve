'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Minus, Plus, Trash2, ShoppingCart, ArrowRight,
  Truck, ShieldCheck, RefreshCcw
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import CartBonusTimer from '../components/CartBonusTimer';
import styles from './cart.module.css';

export default function CartPage() {
  const {
    cartItems,
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
    applyPromo,
    promoMessage,
    actualDiscount,
    amountToFreeShipping,
    availableCredits,
    polarCreditsApplied,
    polarCreditsMessage,
    polarCreditsUsed,
    togglePolarCredits,
    progressPercent,
    FREE_SHIPPING_THRESHOLD,
    isInitialized,
    isCartBonusActive,
    CART_BONUS_AMOUNT,
    appliedPromoCode,
    removePromo,
    processCheckout,
  } = useCart();
  
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const promoIsApplied = appliedPromoCode === 'ANTARCTICA';

  if (!isInitialized) return null;

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className={styles.cartPage}>
        <div className={styles.cartHeader}>
          <div className={styles.headerContent}>
            <h1 className={styles.cartTitle}>Shopping Cart</h1>
            <p className={styles.cartSubtitle}>Your cart is empty</p>
          </div>
        </div>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 20px' }}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🛒</div>
            <h2 className={styles.emptyTitle}>Your cart is empty</h2>
            <p className={styles.emptyText}>
              Looks like you haven&apos;t added any products yet. Start exploring our collection!
            </p>
            <Link href="/shop">
              <button className={styles.emptyBtn}>
                <ShoppingCart size={18} />
                Start Shopping
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cartPage}>
      <div className={styles.cartHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.cartTitle}>Shopping Cart</h1>
          <p className={styles.cartSubtitle}>
            {cartItems?.length || 0} {cartItems?.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
      </div>

      <div className={styles.cartLayout}>
        {/* Cart Items Column */}
        <div className={styles.cartItems}>
          {cartItems.map(item => {
            if (!item || !item.id) return null;
            return (
            <div key={item.id} className={styles.cartItem}>
              <div className={styles.itemImage}>
                {item.image ? (
                  <Image src={item.image} alt={item?.title || 'Product Image'} fill sizes="100px" />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'var(--color-border)' }} />
                )}
              </div>
              <div className={styles.itemDetails}>
                <Link href={`/product/${item?.slug || '#'}`}>
                  <h3 className={styles.itemTitle}>{item?.title || 'Unknown Product'}</h3>
                </Link>
                <p className={styles.itemPrice}>₹{(Number(item?.price) || 0).toLocaleString('en-IN')} each</p>
                <div className={styles.itemQuantity}>
                  <button
                    className={styles.itemQtyBtn}
                    onClick={() => updateQuantity(item.id, -1)}
                  >
                    <Minus size={14} />
                  </button>
                <span className={styles.itemQtyValue}>{Number(item?.quantity) || 1}</span>
                  <button
                    className={styles.itemQtyBtn}
                    onClick={() => updateQuantity(item.id, 1)}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <div className={styles.itemRight}>
                <span className={styles.itemLineTotal}>
                  ₹{((Number(item?.price) || 0) * (Number(item?.quantity) || 1)).toLocaleString('en-IN')}
                </span>
                <button
                  className={styles.removeBtn}
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              </div>
            </div>
            );
          })}

          {/* Shipping Progress */}
          <div className={styles.shippingProgress}>
            <p className={styles.shippingText}>
              <Truck size={16} />
              {isFirstOrder ? (
                <>🎉 <span className={styles.shippingHighlight}>First Order Free Shipping Active!</span></>
              ) : (Number(subtotal) || 0) >= (Number(FREE_SHIPPING_THRESHOLD) || 599) ? (
                <>🎉 You qualify for <span className={styles.shippingHighlight}>free shipping!</span></>
              ) : (
                <>Add <span className={styles.shippingHighlight}>₹{(Number(amountToFreeShipping) || 0).toLocaleString('en-IN')}</span> more for free shipping!</>
              )}
            </p>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: isFirstOrder ? '100%' : `${progressPercent}%` }}
              />
            </div>
          </div>

          <Link href="/shop" className={styles.continueLink}>
            Continue Shopping
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Order Summary */}
        <div className={styles.orderSummary}>
          {/* ── Cart Bonus Timer ── */}
          <CartBonusTimer variant="cart" />

          <h2 className={styles.summaryTitle}>Order Summary</h2>

          {isFirstOrder && shippingDiscount > 0 && (
            <div style={{ background: 'rgba(0, 200, 83, 0.1)', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px' }}>
              <p style={{ color: 'var(--color-success)', fontSize: '0.9rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>🎉</span> First order benefit: Free shipping worth ₹99 unlocked.
              </p>
            </div>
          )}

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Subtotal ({cartItems?.reduce((s, i) => s + (Number(i?.quantity) || 0), 0) || 0} items)</span>
            <span className={styles.summaryValue}>₹{(Number(subtotal) || 0).toLocaleString('en-IN')}</span>
          </div>

          {actualDiscount > 0 && (
            <div className={styles.summaryRow} style={{ color: 'var(--color-success)', fontWeight: 600 }}>
              <span className={styles.summaryLabel}>Promo Discount</span>
              <span className={styles.summaryValue}>-₹{actualDiscount.toLocaleString('en-IN')}</span>
            </div>
          )}

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Shipping</span>
            <span className={`${styles.summaryValue} ${shippingCharge > 0 && shippingDiscount > 0 ? styles.freeShipping : ''}`}>
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

          {shippingCharge > 0 && !isFirstOrder && subtotal < 599 && (
            <div style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--color-accent)', marginTop: '-8px', marginBottom: '16px', fontWeight: 600 }}>
              Add ₹{599 - subtotal} more to unlock free shipping
            </div>
          )}

          {polarCreditsUsed > 0 && (
            <div className={styles.summaryRow} style={{ color: 'var(--color-success)' }}>
              <span>Polar Credits</span>
              <span className={styles.summaryValue}>-₹{polarCreditsUsed.toLocaleString('en-IN')}</span>
            </div>
          )}

          {/* Cart Bonus Line Item */}
          {(isCartBonusActive || hasCartBonusExpired) && (
            <div className={styles.summaryRow} style={{
              color: isCartBonusActive ? 'var(--color-success)' : '#9ca3af',
              fontWeight: 600,
              fontStyle: hasCartBonusExpired ? 'italic' : 'normal'
            }}>
              <span className={styles.summaryLabel}>10-Min Cart Bonus</span>
              <span className={styles.summaryValue}>
                {isCartBonusActive ? `-₹${CART_BONUS_AMOUNT}` : 'Expired'}
              </span>
            </div>
          )}

          <div className={styles.discountSection}>
            {availableCredits > 0 ? (
              <div style={{ marginBottom: '20px', padding: '16px', background: 'rgba(0, 102, 255, 0.05)', borderRadius: '12px', border: '1px solid rgba(0, 102, 255, 0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>💎</span>
                    <strong style={{ fontSize: '1rem', color: 'var(--color-primary)' }}>Polar Credits</strong>
                  </div>
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', fontWeight: 600 }}>Balance: ₹{availableCredits}</span>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button 
                    onClick={togglePolarCredits}
                    style={{ 
                      flex: 1, padding: '12px', borderRadius: '8px', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s',
                      background: polarCreditsApplied ? 'var(--color-success)' : 'var(--color-primary)',
                      color: '#fff', border: 'none'
                    }}
                  >
                    {polarCreditsApplied ? 'Credits Applied ✓' : 'Apply Credits (Up to ₹200)'}
                  </button>
                </div>
                {polarCreditsMessage && (
                  <div style={{ fontSize: '0.85rem', marginTop: '8px', color: polarCreditsApplied ? 'var(--color-success)' : 'var(--color-error)' }}>
                    {polarCreditsMessage}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ marginBottom: '20px', padding: '16px', background: 'rgba(0, 102, 255, 0.05)', borderRadius: '12px', border: '1px solid rgba(0, 102, 255, 0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>💎</span>
                    <strong style={{ fontSize: '1rem', color: 'var(--color-primary)' }}>Polar Credits</strong>
                  </div>
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', fontWeight: 600 }}>Available: ₹0</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', margin: 0, lineHeight: 1.5, marginBottom: '12px' }}>
                  Refer friends or complete your first referral order to earn ₹200 Polar Credits.
                </p>
                <Link href="/referral" style={{
                  display: 'block', textAlign: 'center', width: '100%', padding: '10px', borderRadius: '8px', 
                  fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s',
                  background: 'transparent', color: 'var(--color-accent)', border: '1px solid var(--color-accent)', textDecoration: 'none'
                }}>
                  Learn How to Earn
                </Link>
              </div>
            )}

            <div className={styles.discountRow}>
              <input
                type="text"
                className={styles.discountInput}
                placeholder="Try code: ANTARCTICA"
                value={discountCode}
                onChange={e => setDiscountCode(e.target.value)}
                disabled={promoIsApplied}
                onKeyDown={(e) => e.key === 'Enter' && !promoIsApplied && applyPromo()}
              />
              {promoIsApplied ? (
                <button
                  className={styles.discountBtn}
                  onClick={removePromo}
                  style={{ background: 'var(--color-success)', cursor: 'pointer' }}
                  title="Remove promo code"
                >
                  APPLIED ✓
                </button>
              ) : (
                <button
                  className={styles.discountBtn}
                  onClick={applyPromo}
                >
                  Apply
                </button>
              )}
            </div>
            {promoMessage.text && (
              <p className={styles.promoMessage} style={{ color: promoMessage.type === 'error' ? 'var(--color-error)' : 'var(--color-success)', fontSize: '12px', marginTop: '8px' }}>
                {promoMessage.text}
              </p>
            )}
          </div>

          <hr className={styles.divider} />

          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Total</span>
            <span className={styles.totalValue}>₹{(Number(total) || 0).toLocaleString('en-IN')}</span>
          </div>

          {totalSavings > 0 && (
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <p style={{ color: 'var(--color-success)', fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>
                {isFirstOrder && shippingDiscount > 0 && actualDiscount > 0 
                  ? `You saved ₹${totalSavings.toLocaleString('en-IN')} on your first order` 
                  : isFirstOrder && shippingDiscount > 0 
                    ? `You saved ₹${shippingDiscount.toLocaleString('en-IN')} with free shipping`
                    : `You saved ₹${actualDiscount.toLocaleString('en-IN')} on your order`}
              </p>
            </div>
          )}

          <button 
            className={styles.checkoutBtn}
            onClick={async (e) => {
              e.preventDefault();
              setIsCheckingOut(true);
              await processCheckout();
              setIsCheckingOut(false);
            }}
            disabled={isCheckingOut}
            style={{ opacity: isCheckingOut ? 0.7 : 1 }}
          >
            {isCheckingOut ? 'Preparing Checkout...' : (
              <>
                Proceed to Checkout
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <div className={styles.trustBadges}>
            <div className={styles.trustBadge}>
              <ShieldCheck size={20} className={styles.trustBadgeIcon} />
              <span className={styles.trustBadgeLabel}>Secure</span>
            </div>
            <div className={styles.trustBadge}>
              <Truck size={20} className={styles.trustBadgeIcon} />
              <span className={styles.trustBadgeLabel}>Free Ship</span>
            </div>
            <div className={styles.trustBadge}>
              <RefreshCcw size={20} className={styles.trustBadgeIcon} />
              <span className={styles.trustBadgeLabel}>Easy Return</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
