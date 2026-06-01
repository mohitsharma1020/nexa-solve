'use client';

import Image from 'next/image';
import { ExternalLink, Star, Eye, Heart } from 'lucide-react';
import styles from './TravelGearSection.module.css';
import { useWishlist } from '../context/WishlistContext';

export default function AffiliateCard({ product, onQuickView }) {
  const { toggleSavedItem, isSaved } = useWishlist();
  const saved = isSaved(product.id);
  return (
    <div className={styles.card}>
      {product.badge && (
        <div className={styles.cardBadge}>{product.badge}</div>
      )}
      
      <div className={styles.cardActions}>
        <button 
          className={styles.quickViewBtn} 
          onClick={() => onQuickView(product)}
          aria-label={`Quick view ${product.shortName}`}
        >
          <Eye size={18} />
        </button>
        <button 
          className={`${styles.quickViewBtn} ${saved ? styles.quickBtnActive : ''}`} 
          onClick={() => toggleSavedItem({
            id: product.id,
            title: product.productName,
            image: product.image,
            price: 0,
            categoryLabel: product.category,
            shortDescription: product.description,
            slug: '',
            badge: product.badge,
            originalPrice: null,
            isAffiliate: true,
            affiliateLink: product.affiliateLink
          })}
          aria-label={`Save ${product.shortName}`}
        >
          <Heart size={18} fill={saved ? '#0066FF' : 'none'} stroke={saved ? '#0066FF' : 'currentColor'} />
        </button>
      </div>

      <div className={styles.imageWrapper}>
        <img 
          src={product.image} 
          alt={product.shortName} 
          className={styles.image} 
        />
      </div>

      <div className={styles.content}>
        <div className={styles.rating}>
          <Star className={styles.star} size={14} fill="currentColor" />
          <Star className={styles.star} size={14} fill="currentColor" />
          <Star className={styles.star} size={14} fill="currentColor" />
          <Star className={styles.star} size={14} fill="currentColor" />
          <Star className={styles.star} size={14} fill={product.ratingDisplay >= 4.8 ? "currentColor" : "none"} />
          <span className={styles.ratingText}>{product.ratingDisplay}</span>
        </div>

        <div className={styles.category}>{product.category}</div>
        <h3 className={styles.productName}>{product.shortName}</h3>
        <p className={styles.desc}>{product.description}</p>
        
        <div className={styles.priceDisplay}>
          {product.priceDisplay}
        </div>

        <a 
          href={product.affiliateLink} 
          target="_blank" 
          rel="nofollow sponsored noopener noreferrer"
          className={styles.amazonBtn}
          aria-label={`Buy ${product.shortName} from Amazon`}
        >
          Buy from Amazon <ExternalLink size={16} />
        </a>
      </div>
    </div>
  );
}
