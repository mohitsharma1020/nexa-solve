'use client';

import { useEffect, useRef, useState } from 'react';
import { useCart } from '../context/CartContext';
import styles from './CartBonusTimer.module.css';
import { Zap, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// Format seconds as MM:SS
function formatTime(seconds) {
  const s = Math.max(0, seconds);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

// Determine urgency tier
function getUrgencyTier(seconds) {
  if (seconds > 300) return 'calm';      // 5:00+
  if (seconds > 60) return 'moderate';   // 1:01–5:00
  if (seconds > 0) return 'critical';    // 0:01–1:00
  return 'expired';
}

/**
 * CartBonusTimer
 * @param {Object} props
 * @param {'drawer'|'cart'|'checkout'} [props.variant='cart'] — layout variant
 */
export default function CartBonusTimer({ variant = 'cart' }) {
  const {
    isCartBonusActive,
    hasCartBonusExpired,
    cartBonusSecondsLeft,
    cartBonusExpiresAt,
    CART_BONUS_AMOUNT,
    cartItems,
    processCheckout,
  } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const toastShownRef = useRef({ start: false, twoMin: false, expired: false });

  // Show toasts via a lightweight approach (we use DOM toast injection)
  const showToast = (message, type = 'info') => {
    if (typeof window === 'undefined') return;
    const id = `cb-toast-${Date.now()}`;
    const toast = document.createElement('div');
    toast.id = id;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.style.cssText = `
      position:fixed;bottom:80px;left:50%;transform:translateX(-50%) translateY(0);
      background:${type === 'expired' ? '#1a1a2e' : '#0d2060'};
      color:#fff;padding:12px 22px;border-radius:12px;font-size:0.9rem;font-weight:600;
      z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,0.25);
      border-left:3px solid ${type === 'expired' ? '#6b7280' : '#3b82f6'};
      max-width:320px;text-align:center;animation:cbToastIn 0.3s ease;
      white-space:normal;line-height:1.4;
    `;
    toast.textContent = message;

    // Inject keyframes once
    if (!document.getElementById('cb-toast-keyframes')) {
      const style = document.createElement('style');
      style.id = 'cb-toast-keyframes';
      style.textContent = `
        @keyframes cbToastIn{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @keyframes cbToastOut{from{opacity:1}to{opacity:0;transform:translateX(-50%) translateY(8px)}}
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'cbToastOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 350);
    }, 3500);
  };

  // Toast triggers
  useEffect(() => {
    if (isCartBonusActive && !toastShownRef.current.start) {
      toastShownRef.current.start = true;
      showToast(`⚡ ₹${CART_BONUS_AMOUNT} Cart Bonus Unlocked! Checkout in 10:00 to claim.`, 'info');
    }
  }, [isCartBonusActive, CART_BONUS_AMOUNT]);

  useEffect(() => {
    if (isCartBonusActive && cartBonusSecondsLeft <= 120 && cartBonusSecondsLeft > 115 && !toastShownRef.current.twoMin) {
      toastShownRef.current.twoMin = true;
      showToast(`⏰ Almost gone! Checkout soon to keep your ₹${CART_BONUS_AMOUNT} bonus.`, 'warn');
    }
  }, [cartBonusSecondsLeft, isCartBonusActive, CART_BONUS_AMOUNT]);

  useEffect(() => {
    if (hasCartBonusExpired && !toastShownRef.current.expired) {
      toastShownRef.current.expired = true;
      showToast(`Cart bonus expired. You can still order at regular price.`, 'expired');
    }
  }, [hasCartBonusExpired]);

  // Don't render if no bonus state at all
  if (!isCartBonusActive && !hasCartBonusExpired) return null;
  if (cartItems.length === 0) return null;

  const tier = isCartBonusActive ? getUrgencyTier(cartBonusSecondsLeft) : 'expired';
  const totalSeconds = 600; // 10 min
  const progressPct = isCartBonusActive
    ? Math.max(0, Math.min(100, (cartBonusSecondsLeft / totalSeconds) * 100))
    : 0;

  const tierMessages = {
    calm:     `Your ₹${CART_BONUS_AMOUNT} cart bonus is active.`,
    moderate: `Complete checkout soon to keep your ₹${CART_BONUS_AMOUNT} bonus.`,
    critical: `Last few seconds to claim your ₹${CART_BONUS_AMOUNT} cart bonus.`,
    expired:  'Cart bonus expired.',
  };

  const drawerTexts = {
    calm: {
      title: `₹${CART_BONUS_AMOUNT} Cart Bonus Unlocked`,
      sub: `Checkout within 10:00 to claim it.`
    },
    moderate: {
      title: `Almost gone`,
      sub: `Checkout soon to keep your ₹${CART_BONUS_AMOUNT} bonus.`
    },
    critical: {
      title: `Almost gone`,
      sub: `Checkout soon to keep your ₹${CART_BONUS_AMOUNT} bonus.`
    },
    expired: {
      title: `Cart bonus expired`,
      sub: `Checkout anytime at the regular price.`
    }
  };

  // ── COMPACT VARIANT (Shopify Drawer) ──────────────────────────
  if (variant === 'compact') {
    if (tier === 'expired') {
      return (
        <div style={{ textAlign: 'center' }}>
          <AlertCircle size={24} style={{ color: '#6b7280', marginBottom: '8px' }} />
          <strong style={{ fontSize: '0.9rem', display: 'block', color: 'var(--color-text)' }}>Cart Bonus Expired</strong>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
            You missed the 10-minute cart bonus, but you can still checkout.
          </p>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Zap size={14} style={{ color: '#f5a623' }} /> 
              ₹{CART_BONUS_AMOUNT} Cart Bonus
            </strong>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
              Use code <strong style={{ color: 'var(--color-text)' }}>SAVE40</strong> at checkout before timer ends.
            </p>
          </div>
          <div style={{ 
            background: tier === 'critical' ? 'rgba(255,59,48,0.1)' : 'rgba(0,102,255,0.1)', 
            color: tier === 'critical' ? '#ff3b30' : '#0066FF',
            padding: '4px 8px', 
            borderRadius: '4px', 
            fontSize: '0.85rem', 
            fontWeight: 700,
            animation: tier === 'critical' ? 'pulse 1s infinite' : 'none'
          }}>
            {formatTime(cartBonusSecondsLeft)}
          </div>
        </div>
        <button 
          onClick={() => {
            navigator.clipboard.writeText('SAVE40');
            alert('Code SAVE40 copied! Paste it at checkout.');
          }}
          style={{ width: '100%', padding: '8px', background: 'var(--color-accent)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', marginTop: '4px' }}
        >
          Copy SAVE40
        </button>
      </div>
    );
  }

  // ── DRAWER VARIANT (legacy) ──────────────────────────────────
  if (variant === 'drawer') {
    return (
      <div
        className={`${styles.drawerBanner} ${styles[`tier_${tier}`]}`}
        role="region"
        aria-label="10-minute cart bonus timer"
      >
        <div className={styles.drawerRow}>
          <div className={styles.drawerLeft}>
            {tier === 'expired' ? (
              <AlertCircle size={16} className={styles.drawerIcon} />
            ) : (
              <Zap size={16} className={styles.drawerIcon} />
            )}
            <div>
              <div className={styles.drawerTitle}>
                <span className={styles.desktopText}>{drawerTexts[tier].title}</span>
                <span className={styles.mobileText}>{tier === 'expired' ? 'Expired' : `Save ₹${CART_BONUS_AMOUNT} Now`}</span>
              </div>
              <div className={styles.drawerSub}>
                <span className={styles.desktopText}>{drawerTexts[tier].sub}</span>
                <span className={styles.mobileText}>{tier === 'expired' ? 'Order at regular price' : 'Checkout before time runs out'}</span>
              </div>
            </div>
          </div>
          {isCartBonusActive && (
            <div
              className={`${styles.drawerClock} ${tier === 'critical' ? styles.clockPulse : ''}`}
              aria-label={`${formatTime(cartBonusSecondsLeft)} remaining`}
            >
              {formatTime(cartBonusSecondsLeft)}
            </div>
          )}
        </div>
        {isCartBonusActive && (
          <div className={styles.progressTrack} aria-hidden="true">
            <div
              className={`${styles.progressBar} ${styles[`progress_${tier}`]}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}
      </div>
    );
  }

  // ── CHECKOUT VARIANT (inline, slim) ──────────────────────────
  if (variant === 'checkout') {
    return (
      <div
        className={`${styles.checkoutBanner} ${styles[`tier_${tier}`]}`}
        role="region"
        aria-label="Cart bonus timer"
      >
        <div className={styles.checkoutRow}>
          <div className={styles.checkoutLeft}>
            {tier === 'expired' ? <AlertCircle size={15} /> : <Zap size={15} />}
            <span className={styles.checkoutLabel}>
              {tier === 'expired'
                ? 'Cart bonus expired'
                : `₹${CART_BONUS_AMOUNT} Cart Bonus Active`}
            </span>
          </div>
          {isCartBonusActive && (
            <span
              className={`${styles.checkoutTimer} ${tier === 'critical' ? styles.clockPulse : ''}`}
              aria-label={`Expires in ${formatTime(cartBonusSecondsLeft)}`}
            >
              expires in {formatTime(cartBonusSecondsLeft)}
            </span>
          )}
        </div>
        {isCartBonusActive && (
          <div className={styles.progressTrack} aria-hidden="true">
            <div
              className={`${styles.progressBar} ${styles[`progress_${tier}`]}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}
      </div>
    );
  }

  // ── CART PAGE VARIANT (full, prominent) ──────────────────────
  return (
    <div
      className={`${styles.cartBanner} ${styles[`tier_${tier}`]}`}
      role="region"
      aria-label="10-minute cart bonus"
    >
      {/* Top Row */}
      <div className={styles.cartBannerTop}>
        <div className={styles.cartBannerLeft}>
          <div className={`${styles.bannerIconWrap} ${tier === 'critical' ? styles.iconPulse : ''}`}>
            {tier === 'expired' ? <AlertCircle size={22} /> : <Zap size={22} />}
          </div>
          <div>
            <div className={styles.bannerHeading}>
              {tier === 'expired' ? 'Cart Bonus Expired' : '⚡ Cart Bonus Unlocked'}
            </div>
            <div className={styles.bannerSub}>
              {tier === 'expired'
                ? 'You can still place your order at the regular price.'
                : `${tierMessages[tier]} Checkout within ${formatTime(cartBonusSecondsLeft)} to save ₹${CART_BONUS_AMOUNT}.`
              }
            </div>
          </div>
        </div>

        {isCartBonusActive && (
          <div className={styles.timerBlock} aria-label={`${formatTime(cartBonusSecondsLeft)} remaining`}>
            <div className={`${styles.timerDisplay} ${tier === 'critical' ? styles.clockPulse : ''}`}>
              {formatTime(cartBonusSecondsLeft)}
            </div>
            <div className={styles.timerLabel}>remaining</div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {isCartBonusActive && (
        <div className={styles.progressTrack} aria-hidden="true">
          <div
            className={`${styles.progressBar} ${styles[`progress_${tier}`]}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}

      {/* CTA row */}
      {isCartBonusActive && (
        <div className={styles.bannerCta}>
          <button 
            className={styles.bannerCtaBtn}
            onClick={async (e) => {
              e.preventDefault();
              setIsCheckingOut(true);
              await processCheckout();
              setIsCheckingOut(false);
            }}
            disabled={isCheckingOut}
            style={{ opacity: isCheckingOut ? 0.7 : 1, border: 'none', cursor: 'pointer' }}
          >
            {isCheckingOut ? (
              'Preparing...'
            ) : (
              <>
                <Zap size={15} />
                Checkout &amp; Save ₹{CART_BONUS_AMOUNT}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
