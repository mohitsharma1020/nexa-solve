import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  CheckCircle2,
  Star,
  ShieldCheck,
  Truck,
  RefreshCcw,
  HeadphonesIcon,
  Award,
  Zap,
  Package,
  BadgeCheck,
  Sparkles,
  Gift,
} from 'lucide-react';
import ProductCard from './components/ProductCard';
import CountdownTimer from './components/CountdownTimer';
import NewsletterForm from './components/NewsletterForm';
import PolarCollection from './components/PolarCollection';
import TravelGearSection from './components/TravelGearSection';
import { products, categories, reviews } from './data/products';
import styles from './page.module.css';

export default function Home() {
  const trendingProducts = products.slice(0, 4);
  const featuredProduct = products[0];

  return (
    <main>
      {/* ===== 1. CINEMATIC HERO SECTION ===== */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <span className={styles.heroBadge}>
              <Sparkles size={14} />
              New Collection 2026
            </span>
            <h1 className={styles.heroTitle}>
              Discover Products That <span>Actually Make Life Easier.</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Curated smart products designed to simplify your daily routine.
              Premium quality, thoughtful design, and real solutions for modern
              living.
            </p>
            <div className={styles.heroActions}>
              <Link href="/shop" className={styles.btnPrimary}>
                Shop Now
                <ArrowRight size={18} />
              </Link>
              <Link href="/shop" className={styles.btnOutline}>
                Explore Categories
              </Link>
            </div>
            <div className={styles.heroTrust}>
              <div className={styles.heroTrustItem}>
                <span className={styles.heroTrustValue}>10,000+</span>
                <span className={styles.heroTrustLabel}>Happy Customers</span>
              </div>
              <div className={styles.heroTrustItem}>
                <span className={styles.heroTrustValue}>4.9★</span>
                <span className={styles.heroTrustLabel}>Average Rating</span>
              </div>
              <div className={styles.heroTrustItem}>
                <span className={styles.heroTrustValue}>Free</span>
                <span className={styles.heroTrustLabel}>Returns</span>
              </div>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.heroCard}>
              <div className={styles.heroCardImage}>
                <Image
                  src={featuredProduct.image}
                  alt={featuredProduct.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 280px, 380px"
                />
              </div>
              <div className={styles.heroCardContent}>
                <p className={styles.heroCardLabel}>Featured Product</p>
                <h3 className={styles.heroCardTitle}>{featuredProduct.title}</h3>
                <div className={styles.heroCardPrice}>
                  <span className={styles.heroCardCurrentPrice}>
                    ₹{featuredProduct.price}
                  </span>
                  {featuredProduct.originalPrice && (
                    <span className={styles.heroCardOriginalPrice}>
                      ₹{featuredProduct.originalPrice}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 2. TRUST BAR ===== */}
      <section className={styles.trustBar}>
        <div className={styles.trustGrid}>
          <div className={styles.trustItem}>
            <Truck size={22} className={styles.trustIcon} />
            <span className={styles.trustText}>Free Shipping Over ₹999</span>
          </div>
          <div className={styles.trustItem}>
            <RefreshCcw size={22} className={styles.trustIcon} />
            <span className={styles.trustText}>Easy 30-Day Returns</span>
          </div>
          <div className={styles.trustItem}>
            <ShieldCheck size={22} className={styles.trustIcon} />
            <span className={styles.trustText}>Quality Guaranteed</span>
          </div>
          <div className={styles.trustItem}>
            <HeadphonesIcon size={22} className={styles.trustIcon} />
            <span className={styles.trustText}>24/7 Support</span>
          </div>
        </div>
      </section>

      {/* ===== 3. TRENDING NOW SECTION ===== */}
      <section className={`${styles.trendingSection} ${styles.sectionFadeIn}`}>
        <div className={styles.sectionContainer}>
          <div className={styles.trendingHeader}>
            <div>
              <span className={styles.sectionBadge}>
                <Zap size={14} />
                {"What's Hot"}
              </span>
              <h2 className={styles.sectionTitle}>Trending This Week</h2>
              <p className={styles.sectionSubtitle}>
                Our most loved products, hand-picked for you
              </p>
            </div>
            <Link href="/shop" className={styles.viewAllLink}>
              View All Products
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className={styles.productGrid}>
            {trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== 4. SHOP BY CATEGORY ===== */}
      <section className={`${styles.categorySection} ${styles.sectionFadeIn}`}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.sectionBadge}>
              <Package size={14} />
              Browse Collections
            </span>
            <h2 className={styles.sectionTitle}>Shop by Category</h2>
            <p className={styles.sectionSubtitle}>
              Explore our carefully curated collections designed for every part
              of your life
            </p>
          </div>
          <div className={styles.categoryGrid}>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/shop?category=${category.slug}`}
                className={styles.categoryCard}
              >
                <div className={styles.categoryImageWrapper}>
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 576px) 100vw, (max-width: 992px) 50vw, 33vw"
                  />
                </div>
                <div className={styles.categoryOverlay} />
                <div className={styles.categoryInfo}>
                  <h3 className={styles.categoryName}>{category.name}</h3>
                  <span className={styles.categoryCount}>
                    {category.productCount} Products
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 4.5 TRAVEL GEAR AFFILIATE SECTION ===== */}
      <TravelGearSection />

      {/* ===== 5. FEATURED PRODUCT SPOTLIGHT ===== */}
      <section className={`${styles.spotlightSection} ${styles.sectionFadeIn}`}>
        <div className={styles.sectionContainer}>
          <div className={styles.spotlightGrid}>
            <div className={styles.spotlightImageWrapper}>
              <Image
                src={featuredProduct.image}
                alt={featuredProduct.title}
                fill
                sizes="(max-width: 992px) 100vw, 50vw"
              />
            </div>
            <div className={styles.spotlightContent}>
              <span className={styles.spotlightBadge}>
                <Award size={14} />
                Staff Pick
              </span>
              <h2 className={styles.spotlightTitle}>{featuredProduct.title}</h2>
              <div className={styles.spotlightRating}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    fill={i < Math.floor(featuredProduct.rating) ? '#f59e0b' : 'none'}
                    className={
                      i < Math.floor(featuredProduct.rating)
                        ? styles.spotlightStarFilled
                        : ''
                    }
                  />
                ))}
                <span className={styles.spotlightRatingText}>
                  {featuredProduct.rating} ({featuredProduct.reviews} reviews)
                </span>
              </div>
              <p className={styles.spotlightDescription}>
                {featuredProduct.description}
              </p>
              <ul className={styles.spotlightBenefits}>
                {featuredProduct.benefits.slice(0, 3).map((benefit, i) => (
                  <li key={i} className={styles.spotlightBenefitItem}>
                    <CheckCircle2
                      size={20}
                      className={styles.spotlightCheckIcon}
                    />
                    {benefit}
                  </li>
                ))}
              </ul>
              <div className={styles.spotlightPricing}>
                <span className={styles.spotlightCurrentPrice}>
                  ${featuredProduct.price}
                </span>
                {featuredProduct.originalPrice && (
                  <>
                    <span className={styles.spotlightOriginalPrice}>
                      ${featuredProduct.originalPrice}
                    </span>
                    <span className={styles.spotlightDiscount}>
                      Save{' '}
                      {Math.round(
                        ((featuredProduct.originalPrice - featuredProduct.price) /
                          featuredProduct.originalPrice) *
                          100
                      )}
                      %
                    </span>
                  </>
                )}
              </div>
              <Link
                href={`/product/${featuredProduct.slug}`}
                className={styles.btnPrimary}
              >
                Shop Now
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 5.5 POLAR HERITAGE COLLECTION ===== */}
      <PolarCollection />

      {/* ===== 6. WHY CUSTOMERS TRUST US ===== */}
      <section className={`${styles.trustSection} ${styles.sectionFadeIn}`}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.sectionBadge}>
              <ShieldCheck size={14} />
              Our Promise
            </span>
            <h2 className={styles.sectionTitle}>Why Customers Trust Us</h2>
            <p className={styles.sectionSubtitle}>
              We go above and beyond to ensure every purchase is a delightful
              experience
            </p>
          </div>
          <div className={styles.trustCardGrid}>
            <div className={styles.trustCard}>
              <div
                className={`${styles.trustCardIconWrapper} ${styles.trustCardIconBlue}`}
              >
                <Award size={28} />
              </div>
              <h3 className={styles.trustCardTitle}>Premium Quality</h3>
              <p className={styles.trustCardDescription}>
                Every product is rigorously tested to meet our high standards
                before reaching your doorstep.
              </p>
            </div>
            <div className={styles.trustCard}>
              <div
                className={`${styles.trustCardIconWrapper} ${styles.trustCardIconOrange}`}
              >
                <Truck size={28} />
              </div>
              <h3 className={styles.trustCardTitle}>Fast Delivery</h3>
              <p className={styles.trustCardDescription}>
                Lightning-fast shipping with real-time tracking so you always
                know when your order arrives.
              </p>
            </div>
            <div className={styles.trustCard}>
              <div
                className={`${styles.trustCardIconWrapper} ${styles.trustCardIconGreen}`}
              >
                <RefreshCcw size={28} />
              </div>
              <h3 className={styles.trustCardTitle}>Easy Returns</h3>
              <p className={styles.trustCardDescription}>
                Not satisfied? Return any product within 30 days for a full
                refund, no questions asked.
              </p>
            </div>
            <div className={styles.trustCard}>
              <div
                className={`${styles.trustCardIconWrapper} ${styles.trustCardIconViolet}`}
              >
                <ShieldCheck size={28} />
              </div>
              <h3 className={styles.trustCardTitle}>Secure Payments</h3>
              <p className={styles.trustCardDescription}>
                Bank-grade encryption protects every transaction. Your data is
                always safe with us.
              </p>
            </div>
            <div className={styles.trustCard}>
              <div
                className={`${styles.trustCardIconWrapper} ${styles.trustCardIconBlue}`}
              >
                <HeadphonesIcon size={28} />
              </div>
              <h3 className={styles.trustCardTitle}>24/7 Support</h3>
              <p className={styles.trustCardDescription}>
                Our dedicated support team is always available to help with any
                questions or concerns.
              </p>
            </div>
            <div className={styles.trustCard}>
              <div
                className={`${styles.trustCardIconWrapper} ${styles.trustCardIconGreen}`}
              >
                <BadgeCheck size={28} />
              </div>
              <h3 className={styles.trustCardTitle}>Satisfaction Guaranteed</h3>
              <p className={styles.trustCardDescription}>
                Join 10,000+ happy customers who trust NexaSolve for quality
                products that deliver.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 7. CUSTOMER REVIEWS ===== */}
      <section className={`${styles.reviewsSection} ${styles.sectionFadeIn}`}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.sectionBadge}>
              <Star size={14} />
              Social Proof
            </span>
            <h2 className={styles.sectionTitle}>What Our Customers Say</h2>
            <p className={styles.sectionSubtitle}>
              Real stories from real people who love NexaSolve products
            </p>
          </div>
          <div className={styles.reviewGrid}>
            {reviews.map((review) => (
              <div key={review.id} className={styles.reviewCard}>
                <div className={styles.reviewStars}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < review.rating ? '#f59e0b' : 'none'}
                      strokeWidth={i < review.rating ? 0 : 1.5}
                    />
                  ))}
                </div>
                <p className={styles.reviewText}>&ldquo;{review.comment}&rdquo;</p>
                <div className={styles.reviewAuthor}>
                  <span className={styles.reviewName}>{review.name}</span>
                  {review.verified && (
                    <span className={styles.verifiedBadge}>
                      <CheckCircle2 size={12} />
                      Verified Purchase
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 8. LIMITED-TIME OFFER BANNER ===== */}
      <section className={`${styles.offerSection} ${styles.sectionFadeIn}`}>
        <div className={styles.sectionContainer}>
          <div className={styles.offerContent}>
            <span className={styles.sectionBadge} style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)' }}>
              <Gift size={14} />
              Limited Time Only
            </span>
            <h2 className={styles.offerTitle}>Summer Essentials Bundle</h2>
            <p className={styles.offerSubtitle}>
              Get our top 3 lifestyle products together and save 30%. Premium
              quality, unbeatable value — but only while stocks last.
            </p>
            <div className={styles.offerCountdownWrapper}>
              <CountdownTimer />
            </div>
            <Link href="/shop" className={styles.offerBtn}>
              Claim Your Bundle
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== 9. NEWSLETTER SECTION ===== */}
      <section className={`${styles.newsletterSection} ${styles.sectionFadeIn}`}>
        <div className={styles.sectionContainer}>
          <div className={styles.newsletterContent}>
            <h2 className={styles.newsletterTitle}>
              Join the NexaSolve Community
            </h2>
            <p className={styles.newsletterSubtitle}>
              Be the first to know about exclusive deals, new product drops, and
              insider tips delivered straight to your inbox.
            </p>
            <NewsletterForm />
            <p className={styles.privacyText}>
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
