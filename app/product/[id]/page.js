'use client';
import { useState, use, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft, Star, CheckCircle2, ShoppingCart, Truck,
  ShieldCheck, RefreshCcw, Award, Clock, ChevronDown,
  Minus, Plus, Zap, Package, CircleCheck, Loader2, Heart
} from 'lucide-react';
import { affiliateProducts } from '../../data/affiliateProducts';
import ProductCard from '../../components/ProductCard';
import styles from './product.module.css';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export default function ProductPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const slugTarget = (params.id || '').toLowerCase();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check if it's an affiliate product
    const affiliateTarget = affiliateProducts.find(p => p.id === slugTarget);
    if (affiliateTarget) {
      setProduct({
        id: affiliateTarget.id,
        title: affiliateTarget.productName || affiliateTarget.title,
        slug: affiliateTarget.id,
        price: null,
        priceDisplay: affiliateTarget.priceDisplay || 'Check on Amazon',
        originalPrice: null,
        rating: affiliateTarget.ratingDisplay || 4.5,
        reviews: 120,
        category: 'affiliate',
        categoryLabel: affiliateTarget.category || 'Recommended',
        image: affiliateTarget.image,
        images: [affiliateTarget.image],
        badge: affiliateTarget.badge || 'Amazon Pick',
        shortDescription: affiliateTarget.shortName || affiliateTarget.description,
        description: affiliateTarget.description,
        affiliateLink: affiliateTarget.affiliateLink || affiliateTarget.amazonLink,
        isAffiliate: true,
      });
      setLoading(false);
      return;
    }

    // 2. Fetch from Shopify
    import('../../../services/shopifyClient').then(({ getShopifyProductByHandle }) => {
      getShopifyProductByHandle(slugTarget).then((shopifyProduct) => {
        if (shopifyProduct) {
          setProduct(shopifyProduct);
        }
        setLoading(false);
      }).catch(err => {
        console.error('Failed to load shopify product', err);
        setLoading(false);
      });
    });
  }, [slugTarget]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [openFaq, setOpenFaq] = useState(null);
  const [copied, setCopied] = useState(false);
  const [buttonState, setButtonState] = useState('default'); // 'default', 'loading', 'success'
  const { addToCart, toggleDrawer, processCheckout } = useCart();
  const { toggleSavedItem, isSaved } = useWishlist();

  const handleAddToCart = () => {
    if (buttonState !== 'default') return;
    setButtonState('loading');
    
    setTimeout(() => {
      addToCart(product, quantity);
      setButtonState('success');
      toggleDrawer(true);
      
      setTimeout(() => setButtonState('default'), 2000);
    }, 600);
  };

  const handleBuyNow = async () => {
    if (buttonState !== 'default') return;
    setButtonState('loading');
    addToCart(product, quantity);
    await processCheckout();
    setButtonState('default');
  };

  const copyPromoCode = () => {
    navigator.clipboard.writeText('ANTARCTICA');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className={styles.productPage} style={{ textAlign: 'center', padding: '100px 20px' }}>
        <Loader2 size={48} className={styles.spin} style={{ margin: '0 auto', opacity: 0.5 }} />
        <h2 style={{ marginTop: '20px' }}>Loading Product Details...</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.productPage}>
        <div className={styles.breadcrumb}>
          <Link href="/shop" className={styles.backLink}>
            <ArrowLeft size={16} />
            Back to Shop
          </Link>
        </div>
        <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <h2>Product Not Found</h2>
          <p>The product you are looking for does not exist.</p>
          <Link href="/shop" style={{
            display: 'inline-block', marginTop: '1rem', padding: '12px 24px',
            background: 'var(--color-accent)', color: '#fff', borderRadius: '8px', fontWeight: 600
          }}>
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const thumbnailImages = product.images && product.images.length > 0 
    ? product.images 
    : [
        product.image,
        product.image + '&w=400&h=400',
        product.image + '&w=600&h=600',
        product.image + '&w=500&h=500',
      ];

  const savings = product.originalPrice
    ? (product.originalPrice - product.price).toFixed(2)
    : null;

  const mappedAffiliates = affiliateProducts.map(p => ({
    id: p.id,
    title: p.productName || p.title,
    slug: p.id,
    price: null,
    priceDisplay: p.priceDisplay || 'Check on Amazon',
    originalPrice: null,
    rating: p.ratingDisplay || 4.5,
    reviews: 120,
    category: 'affiliate',
    categoryLabel: p.category || 'Recommended',
    image: p.image,
    images: [p.image],
    badge: p.badge || 'Amazon Pick',
    shortDescription: p.shortName || p.description,
    description: p.description,
    affiliateLink: p.affiliateLink || p.amazonLink,
    isAffiliate: true,
  }));
  const relatedProducts = mappedAffiliates.filter(p => p.id !== product.id).slice(0, 4);

  const specs = product.specs || [
    { label: 'Category', value: product.categoryLabel || 'General' },
    { label: 'Rating', value: `${product.rating || 0}/5 (${product.reviews || 0} reviews)` },
    { label: 'Warranty', value: '1 Year Manufacturer Warranty' },
    { label: 'Shipping', value: 'Free shipping on orders over ₹999' },
  ];

  const included = product.whatsIncluded || [
    `1x ${product.title}`,
    'Quick Start Guide',
    'Premium Packaging',
    '30-Day Satisfaction Guarantee Card',
  ];

  const useCases = product.useCases
    ? product.useCases.map((text, i) => ({
        icon: [<Zap key="z" size={16} />, <Package key="p" size={16} />, <Award key="a" size={16} />, <Star key="s" size={16} />][i] || <Star key="s" size={16} />,
        text,
      }))
    : [
        { icon: <Zap size={16} />, text: 'Home Office' },
        { icon: <Package size={16} />, text: 'Travel & Commute' },
        { icon: <Award size={16} />, text: 'Gift Idea' },
        { icon: <Star size={16} />, text: 'Everyday Use' },
      ];

  const faqs = [
    { q: 'What is the return policy?', a: 'We offer a 30-day hassle-free return policy. If you are not completely satisfied, simply return the product in its original packaging for a full refund.' },
    { q: 'How long does shipping take?', a: 'Standard shipping takes 3-5 business days. Express shipping (1-2 days) is available at checkout for an additional fee.' },
    { q: 'Is this product covered by warranty?', a: 'Yes! All our products come with a 1-year manufacturer warranty covering defects in materials and workmanship.' },
    { q: 'Can I track my order?', a: 'Absolutely! Once your order ships, you will receive an email with a tracking number and a link to track your package in real-time.' },
  ];

  const handleDecrease = () => setQuantity(prev => Math.max(1, prev - 1));
  const handleIncrease = () => setQuantity(prev => Math.min(10, prev + 1));

  return (
    <div className={styles.productPage}>
      <div className={styles.breadcrumb}>
        <Link href="/shop" className={styles.backLink}>
          <ArrowLeft size={16} />
          Back to Shop
        </Link>
      </div>

      <div className={styles.productLayout}>
        {/* Gallery */}
        <div className={styles.gallery}>
          <div className={styles.mainImageContainer}>
            {product.badge && (
              <span className={styles.imageBadge}>{product.badge}</span>
            )}
            
            <div className={styles.swipeGallery}>
              {thumbnailImages.map((img, idx) => (
                <div key={idx} className={styles.swipeSlide}>
                  <Image
                    src={img}
                    alt={`${product.title} - View ${idx + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={idx === 0}
                    className={styles.galleryImg}
                  />
                </div>
              ))}
            </div>

            {thumbnailImages.length > 1 && (
              <div className={styles.galleryIndicators}>
                {thumbnailImages.map((_, idx) => (
                  <div key={idx} className={`${styles.galleryDot} ${selectedImage === idx ? styles.galleryDotActive : ''}`} />
                ))}
              </div>
            )}
          </div>
          
          {thumbnailImages.length > 1 && (
            <div className={styles.thumbnailStrip}>
              {thumbnailImages.map((img, idx) => (
                <button
                  key={idx}
                  className={`${styles.thumbnail} ${selectedImage === idx ? styles.thumbnailActive : ''}`}
                  onClick={() => {
                    setSelectedImage(idx);
                    // On desktop we might want to manually scroll the gallery if they click thumbnails
                    const gallery = document.querySelector(`.${styles.swipeGallery}`);
                    if (gallery) {
                      gallery.scrollTo({ left: idx * gallery.offsetWidth, behavior: 'smooth' });
                    }
                  }}
                >
                  <Image src={img} alt={`Thumbnail ${idx + 1}`} fill sizes="80px" className={styles.thumbnailImg} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className={styles.productInfo}>
          <div className={styles.stockBadge}>
            <span className={styles.stockDot} />
            In Stock — Ready to Ship
          </div>

          <h1 className={styles.productTitle}>{product.title}</h1>

          <div className={styles.ratingRow}>
            <div className={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill={i < Math.floor(product.rating || 0) ? 'currentColor' : 'none'}
                  strokeWidth={i < Math.floor(product.rating || 0) ? 0 : 1.5}
                />
              ))}
            </div>
            <span className={styles.ratingValue}>{product.rating || 'No rating'}</span>
            <span className={styles.reviewCount}>({(product.reviews || 0).toLocaleString()} reviews)</span>
          </div>

          <div className={styles.priceRow}>
            <span className={styles.currentPrice}>₹{(product.price || 0).toLocaleString('en-IN')}</span>
            {product.originalPrice && (
              <>
                <span className={styles.originalPrice}>₹{product.originalPrice.toLocaleString('en-IN')}</span>
                <span className={styles.saveBadge}>Save ₹{savings}</span>
              </>
            )}
          </div>

          {/* Promo Code Box */}
          <div className={styles.promoCouponBox}>
            <div className={styles.promoCouponLeft}>
              <span className={styles.promoCouponTitle}>First Order Benefit</span>
              <p className={styles.promoCouponDesc}>Use code <strong>ANTARCTICA</strong> to get ₹250 OFF</p>
            </div>
            <button 
              className={styles.copyCodeBtn} 
              onClick={copyPromoCode}
            >
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>

          <p className={styles.shortDescription}>{product.description}</p>

          {/* Key Benefits */}
          {product.benefits && product.benefits.length > 0 && (
            <div className={styles.benefitsBox}>
              <h3 className={styles.benefitsTitle}>Key Benefits</h3>
              <ul className={styles.benefitsList}>
                {product.benefits.map((benefit, idx) => (
                  <li key={idx} className={styles.benefitItem}>
                    <CheckCircle2 size={16} className={styles.benefitIcon} />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* How It Helps */}
          <div className={styles.howItHelps}>
            <h3 className={styles.sectionTitle}>How It Makes Life Easier</h3>
            <p className={styles.sectionText}>{product.howItHelps}</p>
          </div>

          {/* Specifications */}
          <div>
            <h3 className={styles.sectionTitle}>Product Specifications</h3>
            <table className={styles.specsTable}>
              <tbody>
                {specs.map((spec, idx) => (
                  <tr key={idx}>
                    <td>{spec.label}</td>
                    <td>{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* What's Included */}
          <div>
            <h3 className={styles.sectionTitle}>What&apos;s Included</h3>
            <ul className={styles.includedList}>
              {included.map((item, idx) => (
                <li key={idx} className={styles.includedItem}>
                  <CircleCheck size={16} className={styles.includedIcon} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Use Cases */}
          <div className={styles.useCases}>
            <h3 className={styles.sectionTitle}>Perfect For</h3>
            <div className={styles.useCaseGrid}>
              {useCases.map((uc, idx) => (
                <div key={idx} className={styles.useCaseItem}>
                  <span className={styles.useCaseIcon}>{uc.icon}</span>
                  {uc.text}
                </div>
              ))}
            </div>
          </div>

          {/* Urgency */}
          <div className={styles.urgencyBox}>
            <Clock size={18} className={styles.urgencyIcon} />
            <p className={styles.urgencyText}>High Demand — Limited stock available</p>
          </div>

          {/* Quantity */}
          <div className={styles.quantityRow}>
            <span className={styles.quantityLabel}>Quantity</span>
            <div className={styles.quantitySelector}>
              <button className={styles.qtyBtn} onClick={handleDecrease}>
                <Minus size={16} />
              </button>
              <span className={styles.qtyValue}>{quantity}</span>
              <button className={styles.qtyBtn} onClick={handleIncrease}>
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          {product.isAffiliate ? (
            <div style={{ display: 'flex', gap: '12px' }}>
              <a 
                href={product.affiliateLink || product.amazonLink} 
                target="_blank" 
                rel="nofollow sponsored noopener noreferrer"
                className={styles.buyNowBtn} 
                style={{ flex: 1, textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#232F3E', color: '#fff', border: 'none' }}
              >
                <ShoppingCart size={20} />
                Buy from Amazon
              </a>
            </div>
          ) : process.env.NEXT_PUBLIC_USE_SHOPIFY_CHECKOUT === 'true' && !product.shopifyVariantId ? (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className={styles.buyNowBtn} 
                disabled={true}
                style={{ flex: 1, opacity: 0.6, cursor: 'not-allowed', backgroundColor: '#e8e8ed', color: '#1d1d1f' }}
              >
                Not available for checkout yet
              </button>
            </div>
          ) : (
            <>
              <button 
                className={styles.addToCartBtn} 
                onClick={handleAddToCart}
                disabled={buttonState !== 'default'}
                style={{ 
                  background: buttonState === 'success' ? 'var(--color-success)' : '',
                  cursor: buttonState !== 'default' ? 'default' : 'pointer',
                  opacity: buttonState === 'loading' ? 0.8 : 1
                }}
              >
                {buttonState === 'default' ? (
                  <>
                    <ShoppingCart size={20} />
                    Add to Cart — ₹{(product.price * quantity).toLocaleString('en-IN')}
                  </>
                ) : buttonState === 'loading' ? (
                  <>
                    <Loader2 size={20} className={styles.spinIcon} style={{ animation: 'spin 1s linear infinite' }} />
                    Adding...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={20} />
                    Added
                  </>
                )}
              </button>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className={styles.buyNowBtn} 
                  style={{ flex: 1, opacity: buttonState === 'loading' ? 0.7 : 1 }}
                  onClick={handleBuyNow}
                  disabled={buttonState !== 'default'}
                >
                  Buy It Now
                </button>
                <button 
                  className={styles.buyNowBtn} 
                  style={{ 
                    flex: '0 0 auto', 
                    padding: '0 20px', 
                    background: 'var(--color-off-white)', 
                    color: isSaved(product.id) ? '#0066FF' : 'var(--color-text)',
                    border: '1px solid var(--color-light-grey)'
                  }}
                  onClick={() => toggleSavedItem(product)}
                  title={isSaved(product.id) ? "Remove from Saved Items" : "Save to Wishlist"}
                >
                  <Heart size={20} fill={isSaved(product.id) ? '#0066FF' : 'none'} stroke={isSaved(product.id) ? '#0066FF' : 'currentColor'} />
                </button>
              </div>
            </>
          )}
          {/* Trust Grid */}
          <div className={styles.trustGrid}>
            <div className={styles.trustItem}>
              <Truck size={18} className={styles.trustIcon} />
              <span className={styles.trustLabel}>Free Shipping</span>
            </div>
            <div className={styles.trustItem}>
              <ShieldCheck size={18} className={styles.trustIcon} />
              <span className={styles.trustLabel}>Secure Checkout</span>
            </div>
            <div className={styles.trustItem}>
              <RefreshCcw size={18} className={styles.trustIcon} />
              <span className={styles.trustLabel}>Easy Returns</span>
            </div>
            <div className={styles.trustItem}>
              <Award size={18} className={styles.trustIcon} />
              <span className={styles.trustLabel}>Quality Promise</span>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className={styles.faqSection}>
            <h3 className={styles.sectionTitle}>Frequently Asked Questions</h3>
            {faqs.map((faq, idx) => (
              <div key={idx} className={styles.faqItem}>
                <button
                  className={styles.faqQuestion}
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  {faq.q}
                  <ChevronDown
                    size={16}
                    className={`${styles.faqChevron} ${openFaq === idx ? styles.faqChevronOpen : ''}`}
                  />
                </button>
                {openFaq === idx && (
                  <div className={styles.faqAnswer}>{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Products */}
      <section className={styles.relatedSection}>
        <h2 className={styles.relatedTitle}>You May Also Like</h2>
        <div className={styles.relatedGrid}>
          {relatedProducts.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Sticky Mobile Bar */}
      <div className={styles.mobileBar}>
        <div className={styles.mobileBarPrice}>
          <span className={styles.mobileBarCurrent}>
            {product.price ? `₹${product.price.toLocaleString('en-IN')}` : product.priceDisplay || 'Check on Amazon'}
          </span>
          {product.originalPrice && (
            <span className={styles.mobileBarOriginal}>₹{product.originalPrice.toLocaleString('en-IN')}</span>
          )}
        </div>
        {product.isAffiliate ? (
          <a 
            href={product.affiliateLink || product.amazonLink}
            target="_blank" 
            rel="nofollow sponsored noopener noreferrer"
            className={styles.mobileBarBtn}
            style={{ backgroundColor: '#232F3E', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#fff' }}
          >
            <ShoppingCart size={18} />
            Buy from Amazon
          </a>
        ) : process.env.NEXT_PUBLIC_USE_SHOPIFY_CHECKOUT === 'true' && !product.shopifyVariantId ? (
          <button className={styles.mobileBarBtn} disabled style={{ opacity: 0.6, backgroundColor: '#e8e8ed', color: '#1d1d1f' }}>Not Available</button>
        ) : (
          <button 
            className={styles.mobileBarBtn}
            onClick={handleAddToCart}
            disabled={buttonState !== 'default'}
            style={{ background: buttonState === 'success' ? 'var(--color-success)' : '' }}
          >
            {buttonState === 'default' ? (
              <>
                <ShoppingCart size={18} />
                Add to Cart
              </>
            ) : buttonState === 'loading' ? (
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <CheckCircle2 size={18} />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
