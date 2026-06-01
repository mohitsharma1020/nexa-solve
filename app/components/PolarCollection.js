'use client';

import Link from 'next/link';
import { products } from '../data/products';
import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { Snowflake, ArrowRight, Compass, ShieldCheck, RefreshCcw, Truck } from 'lucide-react';
import styles from './PolarCollection.module.css';

export default function PolarCollection() {
  const [polarProducts, setPolarProducts] = useState(
    products.filter(p => p.category === 'polar-heritage')
  );

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_USE_SHOPIFY_CHECKOUT === 'true') {
      import('../../services/shopifyClient').then(({ getShopifyProducts }) => {
        getShopifyProducts().then((shopifyProducts) => {
          if (shopifyProducts.length > 0) {
            setPolarProducts(shopifyProducts.filter(p => p.categoryLabel === 'Shopify Collection' || p.category === 'polar-heritage'));
          }
        }).catch(err => console.error(err));
      });
    }
  }, []);

  if (polarProducts.length === 0) return null;

  return (
    <section className={`${styles.polarSection} ${styles.sectionFadeIn}`}>
      <div className={styles.sectionContainer}>
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>
            <Snowflake size={14} />
            Polar Heritage Collection
          </span>
          <h2 className={styles.sectionTitle}>Polar Heritage Collection</h2>
          <p className={styles.sectionSubtitle}>
            Inspired by real expeditions. Designed for everyday explorers.
          </p>
          <p className={styles.brandStory}>
            Every piece in the Polar Heritage Collection carries a story that began at the bottom of the world. 
            Inspired by real Antarctic expeditions — the vast white silence, the midnight sun, the camaraderie 
            of research stations, and the raw beauty of Earth&apos;s last frontier — this collection transforms polar 
            memories into premium lifestyle products. These aren&apos;t souvenirs. They&apos;re artifacts of an experience 
            most people only dream about, designed for those who carry the spirit of exploration in everything they do.
          </p>
        </div>

        {/* Promo Banner */}
        <div className={styles.promoBanner}>
          <p>
            New here? Use code <strong>ANTARCTICA</strong> and get <strong>₹250 OFF</strong> on your first order.
          </p>
        </div>

        {/* Product Grid */}
        <div className={styles.productGrid}>
          {polarProducts.map((product) => (
            <div key={product.id}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Limited Edition Banner */}
        <div className={styles.limitedBanner}>
          <h3 className={styles.bannerText}>
            Polar Heritage Collection — Limited Drop. Ships Worldwide.
          </h3>
          <Link href="/shop?category=polar-heritage" className={styles.bannerLink}>
            Explore Full Collection <ArrowRight size={18} />
          </Link>
        </div>

        {/* Trust Elements */}
        <div className={styles.trustGrid}>
          <div className={styles.trustItem}>
            <div className={styles.trustIcon}>
              <Compass size={24} />
            </div>
            <div>
              <h4 className={styles.trustTitle}>Authentic Expedition Inspired</h4>
              <p className={styles.trustText}>Designed from real Antarctic experience</p>
            </div>
          </div>
          
          <div className={styles.trustItem}>
            <div className={styles.trustIcon}>
              <Truck size={24} />
            </div>
            <div>
              <h4 className={styles.trustTitle}>Free Shipping Over ₹4999</h4>
              <p className={styles.trustText}>Worldwide secure delivery</p>
            </div>
          </div>
          
          <div className={styles.trustItem}>
            <div className={styles.trustIcon}>
              <RefreshCcw size={24} />
            </div>
            <div>
              <h4 className={styles.trustTitle}>30-Day Easy Returns</h4>
              <p className={styles.trustText}>No questions asked policy</p>
            </div>
          </div>
          
          <div className={styles.trustItem}>
            <div className={styles.trustIcon}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className={styles.trustTitle}>Premium Quality Promise</h4>
              <p className={styles.trustText}>Curated, not mass-produced</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
