'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, ArrowLeft, ShoppingCart, ExternalLink, Trash2 } from 'lucide-react';
import styles from './saved.module.css';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

export default function SavedItemsPage() {
  const { savedItems, toggleSavedItem, savedCount } = useWishlist();
  const { addToCart } = useCart();
  const [addingId, setAddingId] = useState(null);

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    setAddingId(product.id);
    addToCart(product, 1);
    setTimeout(() => {
      setAddingId(null);
    }, 1000);
  };

  return (
    <div className={styles.savedPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <Link href="/shop" className={styles.backLink}>
              <ArrowLeft size={16} />
              Back to Shop
            </Link>
            <h1 className={styles.title}>Saved Items</h1>
            <p className={styles.subtitle}>
              {savedCount === 1 ? '1 item saved' : `${savedCount} items saved`}
            </p>
          </div>
        </div>

        {savedCount === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconWrapper}>
              <Heart size={48} strokeWidth={1} className={styles.emptyIcon} />
            </div>
            <h2>0 Saved Items</h2>
            <p>Your saved products will appear here.</p>
            <Link href="/shop" className={styles.exploreBtn}>
              Start Exploring
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {savedItems.map((item) => (
              <div key={item.id} className={styles.savedCard}>
                <Link href={`/product/${item.slug}`} className={styles.imageContainer}>
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    className={styles.image}
                  />
                  {item.badge && <span className={styles.badge}>{item.badge}</span>}
                </Link>

                <div className={styles.cardContent}>
                  <div className={styles.cardHeader}>
                    <span className={styles.category}>{item.categoryLabel}</span>
                    <button
                      className={styles.removeBtn}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleSavedItem(item);
                      }}
                      title="Remove from Saved Items"
                    >
                      <Heart size={18} fill="currentColor" className={styles.heartActive} />
                    </button>
                  </div>

                  <Link href={`/product/${item.slug}`} className={styles.itemTitle}>
                    {item.title}
                  </Link>
                  <p className={styles.itemDesc}>{item.shortDescription}</p>

                  <div className={styles.priceRow}>
                    <span className={styles.price}>₹{item.price.toLocaleString('en-IN')}</span>
                    {item.originalPrice && (
                      <span className={styles.originalPrice}>₹{item.originalPrice.toLocaleString('en-IN')}</span>
                    )}
                  </div>

                  <div className={styles.actions}>
                    {item.isAffiliate ? (
                      <a href={item.affiliateLink} target="_blank" rel="nofollow sponsored noopener noreferrer" className={styles.amazonBtn}>
                        Buy from Amazon <ExternalLink size={16} />
                      </a>
                    ) : (
                      <button
                        className={`${styles.cartBtn} ${addingId === item.id ? styles.cartBtnAdding : ''}`}
                        onClick={(e) => handleAddToCart(e, item)}
                        disabled={addingId === item.id}
                      >
                        <ShoppingCart size={16} />
                        {addingId === item.id ? 'Added' : 'Add to Cart'}
                      </button>
                    )}
                    <Link href={`/product/${item.slug}`} className={styles.viewBtn}>
                      View Product
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
