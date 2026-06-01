'use client';
import { useState, useMemo, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, X } from 'lucide-react';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';
import TravelGearSection from '../components/TravelGearSection';
import styles from './shop.module.css';

const categories = [
  { slug: 'all', name: 'All Products' },
  { slug: 'smart-gadgets', name: 'Smart Gadgets' },
  { slug: 'home', name: 'Home Essentials' },
  { slug: 'travel', name: 'Travel Gear' },
  { slug: 'lifestyle', name: 'Lifestyle' },
  { slug: 'productivity', name: 'Productivity' },
  { slug: 'polar-heritage', name: 'Polar Heritage' },
];

const priceRanges = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Under ₹1,500', min: 0, max: 1500 },
  { label: '₹1,500 - ₹3,000', min: 1500, max: 3000 },
  { label: '₹3,000 - ₹5,000', min: 3000, max: 5000 },
  { label: '₹5,000+', min: 5000, max: Infinity }
];

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activePriceRange, setActivePriceRange] = useState(0);
  const [sortBy, setSortBy] = useState('recommended');
  const [filterOpen, setFilterOpen] = useState(false);
  
  const [productsList, setProductsList] = useState(products);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_USE_SHOPIFY_CHECKOUT === 'true') {
      setLoading(true);
      import('../../services/shopifyClient').then(({ getShopifyProducts }) => {
        getShopifyProducts().then((shopifyProducts) => {
          if (shopifyProducts.length > 0) {
            const mergedProducts = products.map(localProduct => {
              const matchingShopifyProduct = shopifyProducts.find(sp => sp.slug === localProduct.slug);
              if (matchingShopifyProduct) {
                return { ...localProduct, ...matchingShopifyProduct };
              }
              return localProduct;
            });
            setProductsList(mergedProducts);
          }
          setLoading(false);
        }).catch(err => {
          console.error('Failed to load shopify products', err);
          setLoading(false);
        });
      });
    }
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = [...productsList];

    if (activeCategory !== 'all') {
      filtered = filtered.filter(p => p.category === activeCategory);
    }

    const range = priceRanges[activePriceRange];
    filtered = filtered.filter(p => p.price >= range.min && p.price < range.max);

    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    return filtered;
  }, [activeCategory, activePriceRange, sortBy]);

  const getCategoryCount = (slug) => {
    if (slug === 'all') return productsList.length;
    return productsList.filter(p => p.category === slug || (slug === 'polar-heritage' && p.categoryLabel === 'Shopify Collection')).length;
  };

  const handleClearFilters = () => {
    setActiveCategory('all');
    setActivePriceRange(0);
    setSortBy('recommended');
  };

  const isPolarHeritage = activeCategory === 'polar-heritage';

  return (
    <div className={styles.shopPage}>
      {isPolarHeritage ? (
        /* ── Premium Polar Heritage Hero ─────────────────────────── */
        <div className={styles.polarHeroHeader}>
          {/* Animated ice-particle bg layers */}
          <div className={styles.polarHeroGlow} aria-hidden="true" />
          <div className={styles.polarHeroIce} aria-hidden="true" />

          <div className={styles.polarHeroContent}>
            {/* Badge */}
            <span className={styles.polarBadge}>
              🧊 Antarctica Inspired
            </span>

            {/* Main Heading */}
            <h1 className={styles.polarTitle}>Polar Heritage Collection</h1>

            {/* Sub-heading */}
            <p className={styles.polarSubtitle}>
              Inspired by Antarctica — built for explorers, storytellers, and
              those who carry the spirit of the ice.
            </p>

            <span className={styles.polarCount}>
              {filteredProducts.length} premium products
            </span>

            {/* CTA */}
            <button
              className={styles.polarCta}
              onClick={() => { /* already on collection */ }}
            >
              Explore the Collection
            </button>
          </div>
        </div>
      ) : (
        /* ── Standard Header ──────────────────────────────────────── */
        <div className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <h1 className={styles.pageTitle}>
              {categories.find(c => c.slug === activeCategory)?.name || 'All Products'}
            </h1>
            <p className={styles.pageSubtitle}>
              Discover smart solutions that simplify your everyday life
            </p>
            <span className={styles.productCount}>
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} available
            </span>
          </div>
        </div>
      )}

      <div className={styles.shopLayout}>
        {/* Mobile Filter Toggle */}
        <button
          className={styles.mobileFilterToggle}
          onClick={() => setFilterOpen(true)}
        >
          <Filter size={18} />
          Filters
        </button>

        {/* Filter Overlay */}
        <div
          className={`${styles.filterOverlay} ${filterOpen ? styles.filterOverlayVisible : ''}`}
          onClick={() => setFilterOpen(false)}
        />

        {/* Sidebar */}
        <aside className={`${styles.sidebar} ${filterOpen ? styles.sidebarOpen : ''}`}>
          <div className={styles.mobileClose}>
            <span className={styles.mobileCloseTitle}>Filters</span>
            <button
              className={styles.mobileCloseBtn}
              onClick={() => setFilterOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          <div className={styles.filterSection}>
            <h3 className={styles.filterTitle}>Categories</h3>
            <ul className={styles.categoryList}>
              {categories.map(cat => (
                <li key={cat.slug}>
                  <button
                    className={`${styles.categoryItem} ${activeCategory === cat.slug ? styles.categoryItemActive : ''}`}
                    onClick={() => {
                      setActiveCategory(cat.slug);
                      setFilterOpen(false);
                    }}
                  >
                    {cat.name}
                    <span className={styles.categoryCount}>{getCategoryCount(cat.slug)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.filterSection}>
            <h3 className={styles.filterTitle}>Price Range</h3>
            <div className={styles.priceFilters}>
              {priceRanges.map((range, idx) => (
                <button
                  key={idx}
                  className={`${styles.priceBtn} ${activePriceRange === idx ? styles.priceBtnActive : ''}`}
                  onClick={() => {
                    setActivePriceRange(idx);
                    setFilterOpen(false);
                  }}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {(activeCategory !== 'all' || activePriceRange !== 0) && (
            <button className={styles.clearFilters} onClick={handleClearFilters}>
              Clear All Filters
            </button>
          )}
        </aside>

        {/* Main Content */}
        <div className={styles.mainContent}>
          {activeCategory !== 'travel' && (
            <>
              <div className={styles.toolbar}>
                <span className={styles.resultInfo}>
                  Showing <span className={styles.resultHighlight}>{filteredProducts.length}</span>{' '}
                  {filteredProducts.length === 1 ? 'product' : 'products'}
                </span>
                <select
                  className={styles.sortSelect}
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>

              <div className={styles.productGrid}>
                {loading ? (
                  <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center' }}>
                    Loading Shopify products...
                  </div>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))
                ) : (
                  <div className={styles.noResults}>
                    <div className={styles.noResultsIcon}>🔍</div>
                    <h3 className={styles.noResultsTitle}>No products found</h3>
                    <p className={styles.noResultsText}>
                      Try adjusting your filters to see more results
                    </p>
                    <button className={styles.resetBtn} onClick={handleClearFilters}>
                      Reset Filters
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          
          {(activeCategory === 'travel' || activeCategory === 'all') && (
            <div style={{ marginTop: activeCategory === 'all' ? '60px' : '0', marginLeft: '-24px', marginRight: '-24px' }}>
              <TravelGearSection />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center' }}>Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}
