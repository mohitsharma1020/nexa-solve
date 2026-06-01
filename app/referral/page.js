'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Gift, Users, Award, Copy, CheckCircle2, MessageCircle, Send, Info,
  ShoppingCart, UserPlus, Camera, ArrowRight, ShoppingBag, Clock
} from 'lucide-react';
import styles from './page.module.css';
import { referralService } from '../../services/referralService';

const REWARD_ROWS = [
  { photos: 1, label: '1 approved photo', amount: '₹5 Polar Credits' },
  { photos: 2, label: '2 approved photos', amount: '₹10 Polar Credits' },
  { photos: 3, label: '3 approved photos', amount: '₹15 Polar Credits' },
  { photos: 4, label: '4 approved photos', amount: '₹20 Polar Credits' },
  { photos: 5, label: '5 approved photos', amount: '₹25 Polar Credits' },
];

export default function ReferralPage() {
  const [profile, setProfile] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const linkBoxRef = useRef(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await referralService.getUserProfile('usr_me');
        setProfile(data);
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const referralLink = profile ? `https://nexasolve.com/?ref=${profile.referralCode}` : '';

  const copyToClipboard = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = `Hey! I found this amazing premium store. Use my link to get ₹200 Polar Credits! ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareTelegram = () => {
    const text = `Hey! Check out NexaSolve. Use my link to get ₹200 Polar Credits: ${referralLink}`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('Check out this premium store!')}`, '_blank');
  };
  
  const scrollToLink = () => {
    linkBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Loading your referral details...</div>;

  return (
    <div className={styles.container}>

      {/* ── 1. Hero Section ─────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <Gift size={16} />
            NexaSolve Referral Program
          </div>
          <h1 className={styles.title}>Give ₹200, Get ₹200</h1>
          <p className={styles.subtitle}>
            Share your referral link with friends. They get ₹200 OFF their first order, and you earn ₹200 Polar Credits after their order is successfully completed.
          </p>
          
          <div className={styles.heroActions}>
            <button className={styles.primaryBtn} onClick={scrollToLink}>Start Referring</button>
            <button className={styles.secondaryBtn} onClick={copyToClipboard}>
              {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
              {copied ? 'Copied!' : 'Copy Referral Link'}
            </button>
          </div>
        </div>
      </section>

      {/* ── Share Card ──────────────────────────────────────────── */}
      <div className={styles.shareCard} ref={linkBoxRef}>
        <h2 className={styles.shareTitle}>Share Your Unique Link</h2>
        
        <div className={styles.linkBox}>
          <input 
            type="text" 
            className={styles.linkInput} 
            value={referralLink} 
            readOnly 
          />
          <button 
            className={`${styles.copyBtn} ${copied ? styles.copyBtnSuccess : ''}`}
            onClick={copyToClipboard}
          >
            {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>

        <div className={styles.socialGrid}>
          <button className={`${styles.socialBtn} ${styles.whatsappBtn}`} onClick={shareWhatsApp}>
            <MessageCircle size={20} /> Share via WhatsApp
          </button>
          <button className={`${styles.socialBtn} ${styles.telegramBtn}`} onClick={shareTelegram}>
            <Send size={20} /> Share via Telegram
          </button>
        </div>

        <div className={styles.disclaimer}>
          <Info size={20} color="var(--color-accent)" style={{ flexShrink: 0 }} />
          <p>
            <strong>Store Credit Only:</strong> Polar Credits are store credits only. They cannot be withdrawn, transferred, or converted into cash. <a href="#terms" style={{ color: 'var(--color-accent)' }}>Read full terms below.</a>
          </p>
        </div>
      </div>

      {/* ── 2. How It Works ─────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <p style={{ color: 'var(--color-text-light)' }}>Refer your friends and both of you earn Polar Credits.</p>
        </div>

        <div className={styles.timelineWrapper}>
          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepIcon}><Send size={28} /></div>
              <h3 className={styles.stepTitle}>1. Share Your Link</h3>
              <p className={styles.stepDesc}>Send your unique referral link to friends, family, or followers.</p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepIcon}><UserPlus size={28} /></div>
              <h3 className={styles.stepTitle}>2. Your Friend Gets ₹200 OFF</h3>
              <p className={styles.stepDesc}>Your friend signs up through your referral link and gets ₹200 OFF their first order.</p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepIcon}><Gift size={28} /></div>
              <h3 className={styles.stepTitle}>3. They Complete Their Purchase</h3>
              <p className={styles.stepDesc}>Your friend places their first successful paid order.</p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepIcon}><Award size={28} /></div>
              <h3 className={styles.stepTitle}>4. You Earn ₹200 Polar Credits</h3>
              <p className={styles.stepDesc}>Once their order is delivered and confirmed, ₹200 Polar Credits become active in your account.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Review & Earn Polar Credits ──────────────────────── */}
      <section className={styles.reviewEarnSection} id="review-and-earn">
        {/* Subtle divider */}
        <div className={styles.sectionDividerLine} />

        <div className={styles.reviewEarnInner}>

          {/* Left — copy + CTAs */}
          <div className={styles.reviewEarnLeft}>
            <div className={styles.reviewEarnBadge}>
              <Camera size={13} />
              Another Way to Earn
            </div>

            <h2 className={styles.reviewEarnTitle}>
              Review &amp; Earn<br />Polar Credits
            </h2>

            <p className={styles.reviewEarnSub}>
              Bought something from us? Share clear photos of your product in use and submit a short review.
              Once approved by our team, your Polar Credits will be added to your account — up to{' '}
              <strong style={{ color: '#93c5fd' }}>₹25 per review</strong>.
            </p>

            <div className={styles.reviewEarnActions}>
              <Link href="/shop" className={styles.reviewPrimaryBtn}>
                <Camera size={16} />
                Submit Photo Review
              </Link>
              <Link href="/shop" className={styles.reviewSecondaryBtn}>
                <ShoppingBag size={16} />
                View Eligible Products
              </Link>
            </div>

            <div className={styles.reviewNote}>
              <Clock size={15} style={{ flexShrink: 0, color: '#fbbf24', marginTop: 1 }} />
              <span>
                <strong>Manual Review Required.</strong>{' '}
                Photo review rewards are approved manually. Pending credits cannot be used until approved.
                Polar Credits are store credits only — they cannot be withdrawn, transferred, or converted into cash.
              </span>
            </div>
          </div>

          {/* Right — reward breakdown card */}
          <div className={styles.reviewEarnRight}>
            <div className={styles.rewardCard}>
              <div className={styles.rewardCardHeader}>
                <span className={styles.rewardCardTitle}>Reward Breakdown</span>
                <span className={styles.rewardMaxBadge}>Earn up to ₹25</span>
              </div>

              <div className={styles.rewardRows}>
                {REWARD_ROWS.map((row) => (
                  <div key={row.photos} className={styles.rewardRow}>
                    <div className={styles.rewardRowLeft}>
                      <span className={styles.rewardDot} />
                      {row.label}
                    </div>
                    <span className={styles.rewardRowAmt}>{row.amount}</span>
                  </div>
                ))}
              </div>

              <div className={styles.rewardCardFooter}>
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>💎</span>
                <span>
                  ₹5 per approved photo · Max 5 photos per review · Max ₹25 per product review.
                  Credits activate only after admin approval.
                </span>
              </div>
            </div>

            {/* Camera illustration block */}
            <div className={styles.cameraBlock}>
              <div className={styles.cameraIcon}>
                <Camera size={22} />
              </div>
              <div className={styles.cameraText}>
                <strong>How it works</strong>
                Purchase a product → Submit a photo review → Earn ₹5 per approved photo after manual review.
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── 4. FAQ & Terms ──────────────────────────────────────── */}
      <section className={styles.faqSection} id="terms">
        <div className={styles.faqContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
          </div>
          
          <div className={styles.faqGrid}>
            {/* Original Referral FAQs */}
            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>When do I get my Polar Credits?</div>
              <div className={styles.faqAnswer}>Your reward is added as "Pending" as soon as your friend places their first order. It becomes "Active" and ready to use once their order is successfully delivered and the return window closes.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>When does my friend get their Polar Credits?</div>
              <div className={styles.faqAnswer}>Your friend receives their ₹200 Polar Credits right after completing their first successful paid order. The reward activates when the order is marked delivered!</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>Can I withdraw Polar Credits to my bank?</div>
              <div className={styles.faqAnswer}>No. Polar Credits are strictly closed-loop store credits meant to reward our loyal customers. They cannot be withdrawn, transferred to another user, or converted to cash.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>Is there a limit to how many friends I can refer?</div>
              <div className={styles.faqAnswer}>There is no limit! You can refer as many friends as you like and earn ₹200 Polar Credits for each successful new customer.</div>
            </div>

            {/* New Photo Review FAQs */}
            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>Can I earn Polar Credits without referring anyone?</div>
              <div className={styles.faqAnswer}>Yes. You can earn Polar Credits by submitting approved photo reviews for products you purchased. Each approved photo earns ₹5 Polar Credits, up to ₹25 per product review.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>How much can I earn from photo reviews?</div>
              <div className={styles.faqAnswer}>You can earn ₹5 Polar Credits per approved photo, up to ₹25 for 5 approved photos per product review. For example, if you upload 3 photos and all are approved, you earn ₹15 Polar Credits.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>Are photo review credits added instantly?</div>
              <div className={styles.faqAnswer}>No. Photo reviews are manually reviewed by our team first. Credits are added to your account only after approval — typically within 2–3 business days. Pending credits cannot be used until approved.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>Can I upload any product photo?</div>
              <div className={styles.faqAnswer}>No. The photo must be original, clear, and directly related to a product you purchased from this website. Screenshots, copied images, irrelevant or offensive content, or photos of products not purchased from us will not be approved.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>Can I submit a photo review for any product I bought?</div>
              <div className={styles.faqAnswer}>Yes, as long as the product was purchased from our website and your order was not cancelled or refunded. You can submit one rewarded photo review per product per order.</div>
            </div>
          </div>

          {/* ── 5. Terms ──────────────────────────────────────────── */}
          <div className={styles.termsBox}>
            <h3>Terms and Conditions</h3>
            <ul className={styles.termsList}>
              <li>Polar Credits are store credits only and hold no cash value.</li>
              <li>Polar Credits cannot be withdrawn, transferred, or exchanged for cash.</li>
              <li>Polar Credits can only be used for purchases directly on this website.</li>
              <li>Credits are valid for 90 days from the date of activation.</li>
              <li>A minimum order value of ₹999 applies to use credits.</li>
              <li>A maximum redemption of ₹200 Polar Credits is allowed per order.</li>
              <li>Referral rewards are issued only after successful referred order completion and delivery.</li>
              <li>Photo review rewards are issued only after manual approval by our team.</li>
              <li>One rewarded photo review is allowed per product per order. Duplicate reviews will not earn credits.</li>
              <li>Approved photo credits earn ₹5 per approved photo, up to ₹25 per product review.</li>
              <li>Cancelled, refunded, returned, or fraudulent orders are not eligible for rewards and will reverse both referral and review rewards.</li>
              <li>Self-referrals or creating duplicate accounts to abuse the program will result in an immediate ban and forfeiture of all credits.</li>
              <li>The company reserves the right to modify, pause, or cancel the rewards program at any time.</li>
            </ul>
          </div>
        </div>
      </section>

    </div>
  );
}


