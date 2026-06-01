'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Globe, Share2, ArrowRight, ChevronRight } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 4000);
    }
  };

  const shopLinks = [
    { href: '/shop', label: 'All Products' },
    { href: '/shop', label: 'New Arrivals' },
    { href: '/shop', label: 'Best Sellers' },
    { href: '/shop', label: 'Trending Now' },
    { href: '/shop', label: 'Sale' },
  ];

  const supportLinks = [
    { href: '/faq', label: 'FAQ' },
    { href: '/contact', label: 'Contact Us' },
    { href: '/policies/shipping', label: 'Shipping Info' },
    { href: '/policies/returns', label: 'Returns & Exchanges' },
    { href: '/policies/warranty', label: 'Warranty' },
  ];

  return (
    <footer className={styles.footer}>
      {/* ── Newsletter Section ─────────────────────── */}
      <div className={styles.newsletter}>
        <div className={styles.container}>
          <div className={styles.newsletterContent}>
            <div className={styles.newsletterText}>
              <h2 className={styles.newsletterTitle}>
                Stay in the Loop
              </h2>
              <p className={styles.newsletterSubtitle}>
                Get first access to new drops, exclusive deals, and curated product picks — straight to your inbox.
              </p>
            </div>
            <form className={styles.newsletterForm} onSubmit={handleSubscribe}>
              <div className={styles.inputWrapper}>
                <Mail size={18} className={styles.inputIcon} />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.emailInput}
                  required
                />
                <button type="submit" className={styles.submitBtn}>
                  {isSubscribed ? 'Subscribed ✓' : 'Subscribe'}
                  {!isSubscribed && <ArrowRight size={16} />}
                </button>
              </div>
              {isSubscribed && (
                <p className={styles.successMsg}>Welcome aboard! Check your inbox for a special treat 🎁</p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* ── Main Footer ────────────────────────────── */}
      <div className={styles.main}>
        <div className={styles.container}>
          <div className={styles.grid}>
            {/* Brand Column */}
            <div className={styles.brand}>
              <Link href="/" className={styles.logo}>
                NexaSolve<span className={styles.logoDot}>.</span>
              </Link>
              <p className={styles.brandText}>
                Smart products for easier everyday living. We curate the best finds so you do not have to search.
              </p>
              <div className={styles.socialLinks}>
                <a href="#" className={styles.socialLink} aria-label="Website">
                  <Globe size={18} />
                </a>
                <a href="#" className={styles.socialLink} aria-label="Email">
                  <Mail size={18} />
                </a>
                <a href="#" className={styles.socialLink} aria-label="Share">
                  <Share2 size={18} />
                </a>
              </div>
            </div>

            {/* Shop Column */}
            <div className={styles.column}>
              <h3 className={styles.columnTitle}>Shop</h3>
              <ul className={styles.columnList}>
                {shopLinks.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className={styles.footerLink}>
                      <ChevronRight size={14} className={styles.linkArrow} />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Column */}
            <div className={styles.column}>
              <h3 className={styles.columnTitle}>Support</h3>
              <ul className={styles.columnList}>
                {supportLinks.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className={styles.footerLink}>
                      <ChevronRight size={14} className={styles.linkArrow} />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Column */}
            <div className={styles.column}>
              <h3 className={styles.columnTitle}>Contact</h3>
              <div className={styles.contactInfo}>
                <p className={styles.contactItem}>
                  <Mail size={16} />
                  <span>hello@nexasolve.com</span>
                </p>
                <p className={styles.contactItem}>
                  <Globe size={16} />
                  <span>www.nexasolve.com</span>
                </p>
              </div>
              <div className={styles.trustBadges}>
                <span className={styles.badge}>🔒 Secure Checkout</span>
                <span className={styles.badge}>📦 Free Shipping 50+</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ─────────────────────────────── */}
      <div className={styles.bottom}>
        <div className={styles.container}>
          <div className={styles.bottomInner}>
            <p className={styles.copyright}>
              © {new Date().getFullYear()} NexaSolve. All rights reserved.
            </p>
            <div className={styles.paymentMethods}>
              <span className={styles.payBadge}>Visa</span>
              <span className={styles.payBadge}>Mastercard</span>
              <span className={styles.payBadge}>PayPal</span>
              <span className={styles.payBadge}>UPI</span>
            </div>
            <div className={styles.legalLinks}>
              <Link href="/policies/privacy">Privacy</Link>
              <Link href="/policies/terms">Terms</Link>
              <Link href="/policies/cookies">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
