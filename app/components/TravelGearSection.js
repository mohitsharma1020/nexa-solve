'use client';

import { useState } from 'react';
import { X, ExternalLink, Info } from 'lucide-react';
import AffiliateCard from './AffiliateCard';
import styles from './TravelGearSection.module.css';
import { affiliateProducts } from '../data/affiliateProducts';

const filters = [
  "All",
  "Camera & Vlogging Gear",
  "Travel Organizer",
  "Storage & Tech",
  "Luggage",
  "Cabin Luggage",
  "Winter Travel Gear",
  "Winter Accessories",
  "Winter Jackets"
];

export default function TravelGearSection() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const filteredProducts = activeFilter === 'All' 
    ? affiliateProducts 
    : affiliateProducts.filter(p => p.category === activeFilter);

  return (
    <section className={styles.section} id="travel-gear">
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.badge}>Adventure Ready</div>
          <h2 className={styles.title}>Explorer Travel Kit</h2>
          <p className={styles.subtitle}>
            Premium, modern, and practical gear for travel, vlogging, and adventure. 
            Hand-picked essentials available on Amazon.
          </p>
          <div className={styles.disclosure}>
            <Info size={16} style={{ verticalAlign: 'sub', marginRight: '6px' }} />
            As an Amazon Associate, we may earn from qualifying purchases. Product prices and availability may change on Amazon.
          </div>
        </div>

        <div className={styles.filtersWrapper}>
          {filters.map(filter => (
            <button
              key={filter}
              className={`${styles.filterBtn} ${activeFilter === filter ? styles.active : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className={styles.grid}>
          {filteredProducts.map(product => (
            <AffiliateCard 
              key={product.id} 
              product={product} 
              onQuickView={setQuickViewProduct} 
            />
          ))}
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className={styles.modalOverlay} onClick={() => setQuickViewProduct(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setQuickViewProduct(null)}>
              <X size={24} />
            </button>

            <div className={styles.modalImageWrapper}>
              <img 
                src={quickViewProduct.image} 
                alt={quickViewProduct.productName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div className={styles.modalInfo}>
              <div className={styles.modalCategory}>{quickViewProduct.category}</div>
              <h2 className={styles.modalTitle}>{quickViewProduct.productName}</h2>
              <p className={styles.modalDesc}>{quickViewProduct.description}</p>
              
              <a 
                href={quickViewProduct.affiliateLink} 
                target="_blank" 
                rel="nofollow sponsored noopener noreferrer"
                className={styles.amazonBtn}
                style={{ marginTop: '24px' }}
                aria-label={`Buy ${quickViewProduct.shortName} from Amazon`}
              >
                Buy from Amazon <ExternalLink size={18} />
              </a>

              <div className={styles.modalDisclosure}>
                * Prices and availability subject to change on Amazon. This item is not processed through our store checkout.
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
