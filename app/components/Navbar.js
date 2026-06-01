'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Heart, ShoppingCart, Menu, X, User } from 'lucide-react';
import styles from './Navbar.module.css';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { cartCount, toggleDrawer, isInitialized } = useCart();
  const { savedCount } = useWishlist();
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const navLinks = [
    { href: '/shop', label: 'Shop All' },
    { href: '/shop', label: 'Categories' },
    { href: '/referral', label: 'Refer & Earn' },
    { href: '/account/credits', label: 'My Credits' },
  ];

  const announcementItems = [
    <><strong>Free Shipping</strong> on First Orders</>,
    <>⚡ Flash Sale: Up to 40% Off</>,
    <>Use Code <strong>ANTARCTICA</strong> for <strong>₹250 OFF</strong></>,
    <>🎁 New Arrivals Just Dropped</>,
    <>Earn ₹200 <strong>Polar Credits</strong> by Referring Friends</>,
    <>🧊 Explore the Polar Heritage Collection</>,
    <>🚀 Smart Finds for Everyday Life</>,
    <>Travel Gear Picks Now Live</>,
    <>First Order Benefit: <strong>₹250 OFF</strong> + <strong>Free Shipping</strong></>,
    <>Premium Lifestyle Products Inspired by Antarctica</>
  ];

  const announcementContent = (
    <>
      {announcementItems.map((item, index) => (
        <span key={index} className={styles.announceItem}>
          {item}
          <span className={styles.announceSeparator}>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        </span>
      ))}
    </>
  );

  return (
    <header className={styles.header}>
      {/* Announcement Bar */}
      <div className={styles.announcement}>
        <div className={styles.announcementTrack}>
          <div className={styles.announcementContent}>
            {announcementContent}
          </div>
          <div className={styles.announcementContent} aria-hidden="true">
            {announcementContent}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
        <div className={styles.navInner}>
          {/* Logo */}
          <Link href="/" className={styles.logo}>
            NexaSolve<span className={styles.logoDot}>.</span>
          </Link>

          {/* Desktop Links */}
          <ul className={styles.navLinks}>
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className={styles.navLink}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right Actions */}
          <div className={styles.navActions}>
            {/* Search */}
            <div className={`${styles.searchWrapper} ${isSearchOpen ? styles.searchOpen : ''}`}>
              <button
                className={styles.iconBtn}
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label="Toggle search"
              >
                {isSearchOpen ? <X size={20} /> : <Search size={20} />}
              </button>
              <div className={styles.searchBar}>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search products..."
                  className={styles.searchInput}
                />
              </div>
            </div>

            {/* Wishlist */}
            <Link href="/saved" className={styles.iconBtn} aria-label="Wishlist" style={{ position: 'relative' }}>
              <Heart size={20} />
              {savedCount > 0 && (
                <span className={styles.cartBadge}>{savedCount}</span>
              )}
            </Link>

            {/* Account */}
            <Link href="/account" className={styles.iconBtn} aria-label="My Account" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <User size={21} />
            </Link>

            {/* Cart */}
            <button 
              className={styles.cartBtn} 
              aria-label="Cart"
              onClick={() => toggleDrawer(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <ShoppingCart size={20} />
              {isInitialized && cartCount > 0 && (
                <span className={styles.cartBadge}>{cartCount}</span>
              )}
            </button>

            {/* Mobile Toggle */}
            <button
              className={styles.hamburger}
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Overlay */}
      <div
        className={`${styles.mobileOverlay} ${isMobileOpen ? styles.mobileOverlayVisible : ''}`}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Mobile Drawer */}
      <div className={`${styles.mobileDrawer} ${isMobileOpen ? styles.mobileDrawerOpen : ''}`}>
        <div className={styles.mobileDrawerHeader}>
          <Link href="/" className={styles.logo} onClick={() => setIsMobileOpen(false)}>
            NexaSolve<span className={styles.logoDot}>.</span>
          </Link>
          <button
            className={styles.iconBtn}
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>
        <ul className={styles.mobileLinks}>
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className={styles.mobileLink}
                onClick={() => setIsMobileOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/account"
              className={styles.mobileLink}
              onClick={() => setIsMobileOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <User size={18} /> My Account
            </Link>
          </li>
          <li>
            <Link
              href="/account"
              className={styles.mobileLink}
              onClick={() => setIsMobileOpen(false)}
            >
              Track Order
            </Link>
          </li>
          <li>
            <Link
              href="/saved"
              className={styles.mobileLink}
              onClick={() => setIsMobileOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <Heart size={18} /> Saved Items ({savedCount})
            </Link>
          </li>
        </ul>
        <div className={styles.mobileActions}>
          <button 
            className="btn btn-primary btn-lg" 
            onClick={() => {
              setIsMobileOpen(false);
              toggleDrawer(true);
            }}
            style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}
          >
            <ShoppingCart size={18} />
            View Cart {isInitialized && `(${cartCount})`}
          </button>
        </div>
      </div>
    </header>
  );
}
