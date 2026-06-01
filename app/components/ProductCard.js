'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, Eye, ShoppingCart, Loader2, CheckCircle2 } from 'lucide-react';
import styles from './ProductCard.module.css';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const [buttonState, setButtonState] = useState('default'); // 'default', 'loading', 'success'
  const { addToCart } = useCart();
  const { toggleSavedItem, isSaved } = useWishlist();
  
  const saved = isSaved(product.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (buttonState !== 'default') return;
    
    setButtonState('loading');
    setTimeout(() => {
      addToCart(product, 1);
      setButtonState('success');
      setTimeout(() => setButtonState('default'), 2000);
    }, 400);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} size={13} fill="#f5a623" stroke="#f5a623" />
        );
      } else if (i === fullStars && hasHalf) {
        stars.push(
          <Star key={i} size={13} fill="#f5a623" stroke="#f5a623" style={{ clipPath: 'inset(0 50% 0 0)' }} />
        );
      } else {
        stars.push(
          <Star key={i} size={13} fill="none" stroke="#d2d2d7" />
        );
      }
    }
    return stars;
  };

  return (
    <div
      className={styles.card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <Link href={`/product/${product.slug}`} className={styles.imageContainer}>
        <div className={styles.imageWrapper}>
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className={`${styles.image} ${isHovered ? styles.imageHovered : ''}`}
          />
        </div>

        {/* Badge */}
        {product.badge && (
          <span className={styles.badge}>{product.badge}</span>
        )}

        {/* Quick Actions (appear on hover) */}
        <div className={`${styles.quickActions} ${isHovered ? styles.quickActionsVisible : ''}`}>
          <button
            className={styles.quickBtn}
            aria-label="Quick view"
            onClick={(e) => { e.preventDefault(); }}
          >
            <Eye size={16} />
          </button>
          <button
            className={`${styles.quickBtn} ${saved ? styles.quickBtnActive : ''}`}
            aria-label="Add to wishlist"
            onClick={(e) => {
              e.preventDefault();
              toggleSavedItem(product);
            }}
          >
            <Heart size={16} fill={saved ? '#0066FF' : 'none'} stroke={saved ? '#0066FF' : 'currentColor'} />
          </button>
        </div>
      </Link>

      {/* Content */}
      <div className={styles.content}>
        {/* Rating Row */}
        <div className={styles.ratingRow}>
          <div className={styles.stars}>
            {renderStars(product.rating)}
          </div>
          <span className={styles.reviewCount}>({(product.reviews || 0).toLocaleString()})</span>
        </div>

        {/* Category */}
        <span className={styles.category}>{product.categoryLabel}</span>

        {/* Title */}
        <Link href={`/product/${product.slug}`} className={styles.title}>
          {product.title}
        </Link>

        {/* Price Row */}
        <div className={styles.priceRow}>
          <span className={styles.price}>₹{(product.price || 0).toLocaleString('en-IN')}</span>
          {product.originalPrice && (
            <span className={styles.originalPrice}>
              ₹{product.originalPrice.toLocaleString('en-IN')}
            </span>
          )}
          {discount && (
            <span className={styles.discountBadge}>-{discount}%</span>
          )}
        </div>

        {/* Promo Code Box */}
        {product.category === 'polar-heritage' && (
          <div className={styles.promoBox}>
            <p className={styles.promoText}>Use <strong>ANTARCTICA</strong>: Save ₹250</p>
          </div>
        )}

        {/* Add to Cart */}
        <div className={`${styles.addToCartWrapper} ${isHovered ? styles.addToCartVisible : ''}`}>
          {product.amazonLink ? (
            <a 
              href={product.amazonLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`${styles.addToCart}`}
            >
              <ShoppingCart size={16} />
              Buy from Amazon
            </a>
          ) : process.env.NEXT_PUBLIC_USE_SHOPIFY_CHECKOUT === 'true' && !product.shopifyVariantId ? (
            <button 
              className={`${styles.addToCart}`}
              disabled={true}
              style={{ opacity: 0.6, cursor: 'not-allowed', backgroundColor: '#e8e8ed', color: '#1d1d1f' }}
            >
              Not available for checkout yet
            </button>
          ) : (
            <button 
              className={`${styles.addToCart} ${buttonState === 'success' ? styles.addToCartSuccess : ''}`}
              onClick={handleAddToCart}
              disabled={buttonState !== 'default'}
            >
              {buttonState === 'default' ? (
                <>
                  <ShoppingCart size={16} />
                  Add to Cart
                </>
              ) : buttonState === 'loading' ? (
                <>
                  <Loader2 size={16} className={styles.spinIcon} />
                  Adding...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Added
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
