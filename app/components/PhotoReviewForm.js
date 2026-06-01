'use client';

import { useState, useRef } from 'react';
import {
  Camera, Upload, X, Star, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon
} from 'lucide-react';
import { photoReviewService } from '../../services/photoReviewService';
import styles from './PhotoReviewForm.module.css';

const MAX_PHOTOS = 5;
const REWARD_PER_PHOTO = 5;

export default function PhotoReviewForm({ product }) {
  const [step, setStep] = useState('cta'); // cta | form | submitted
  const [email, setEmail] = useState('');
  const [orderId, setOrderId] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [photos, setPhotos] = useState([]); // [{dataUrl, name}]
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // {success, message, estimatedReward}
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const estimatedReward = Math.min(photos.length * REWARD_PER_PHOTO, 25);

  const handleFiles = (files) => {
    const newFiles = Array.from(files).slice(0, MAX_PHOTOS - photos.length);
    newFiles.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotos(prev => {
          if (prev.length >= MAX_PHOTOS) return prev;
          return [...prev, { dataUrl: e.target.result, name: file.name }];
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (idx) => setPhotos(prev => prev.filter((_, i) => i !== idx));

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!consent) {
      setResult({ success: false, message: 'Please confirm your consent before submitting.' });
      return;
    }
    if (photos.length === 0) {
      setResult({ success: false, message: 'Please upload at least 1 product photo.' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Look up user by email to get userId
      const { dbService } = await import('../../services/dbService');
      const userProfile = await dbService.getOrCreateUser(email, null, null);

      if (!userProfile) {
        setResult({ success: false, message: 'Could not find your account. Please check your email.' });
        setLoading(false);
        return;
      }

      const res = await photoReviewService.submitReview({
        userId: userProfile.id,
        productId: product.slug || String(product.id),
        orderId: orderId.trim().toUpperCase(),
        customerName: userProfile.name,
        customerEmail: email,
        rating,
        reviewText,
        photos: photos.map(p => p.dataUrl),
        consentGiven: consent,
      });

      setResult(res);
      if (res.success) {
        setStep('submitted');
      }
    } catch (err) {
      setResult({ success: false, message: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // ── CTA Banner ──────────────────────────────────────────────────────────────
  if (step === 'cta') {
    return (
      <div className={styles.ctaBanner}>
        <div className={styles.ctaLeft}>
          <div className={styles.ctaIcon}><Camera size={28} /></div>
          <div>
            <h3 className={styles.ctaTitle}>Review &amp; Earn Polar Credits</h3>
            <p className={styles.ctaDesc}>
              Share real photos of your product and earn <strong>₹5 Polar Credits</strong> per approved photo.
              Upload up to 5 photos and earn up to <strong>₹25 Polar Credits</strong> after approval.
            </p>
          </div>
        </div>
        <button className={styles.ctaBtn} onClick={() => setStep('form')}>
          Submit Photo Review
        </button>
      </div>
    );
  }

  // ── Success State ────────────────────────────────────────────────────────────
  if (step === 'submitted') {
    return (
      <div className={styles.successCard}>
        <div className={styles.successIcon}><CheckCircle2 size={52} /></div>
        <h3 className={styles.successTitle}>Review Submitted!</h3>
        <p className={styles.successMsg}>{result?.message}</p>
        <div className={styles.successReward}>
          <span>Estimated Reward</span>
          <strong>₹{result?.estimatedReward} Polar Credits</strong>
          <small>Subject to admin approval</small>
        </div>
        <div className={styles.statusBadge} data-status="under_review">
          ⏳ Under Review
        </div>
        <p className={styles.successNote}>
          Polar Credits are store credits only. They cannot be withdrawn, transferred, or converted to cash.
        </p>
      </div>
    );
  }

  // ── Full Form ────────────────────────────────────────────────────────────────
  return (
    <div className={styles.formWrapper}>
      <div className={styles.formHeader}>
        <div className={styles.formHeaderLeft}>
          <Camera size={24} className={styles.formHeaderIcon} />
          <div>
            <h3 className={styles.formTitle}>Review &amp; Earn Polar Credits</h3>
            <p className={styles.formSubtitle}>
              Earn ₹5 per approved photo · Upload up to 5 photos · Earn up to ₹25
            </p>
          </div>
        </div>
        <button className={styles.closeBtn} onClick={() => setStep('cta')}>
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>

        {/* Row 1: Email + Order ID */}
        <div className={styles.twoCol}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Your Email Address *</label>
            <input
              type="email"
              className={styles.input}
              placeholder="Used during checkout"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Order ID *</label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g. ORD-123456"
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              required
            />
            <small className={styles.fieldHint}>Find this in your order confirmation email</small>
          </div>
        </div>

        {/* Row 2: Star Rating */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Your Rating *</label>
          <div className={styles.starRow}>
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                className={`${styles.starBtn} ${star <= (hoverRating || rating) ? styles.starFilled : ''}`}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                aria-label={`${star} stars`}
              >
                <Star size={28} fill={star <= (hoverRating || rating) ? '#f59e0b' : 'none'} />
              </button>
            ))}
            <span className={styles.ratingLabel}>
              {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][hoverRating || rating]}
            </span>
          </div>
        </div>

        {/* Row 3: Written Review */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Written Review</label>
          <textarea
            className={styles.textarea}
            rows={4}
            placeholder="Share your honest experience with this product…"
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
          />
        </div>

        {/* Row 4: Photo Upload */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            Product Photos * <span className={styles.photoBadge}>{photos.length}/{MAX_PHOTOS}</span>
          </label>

          {/* Progress tracker */}
          <div className={styles.progressRow}>
            {[1, 2, 3, 4, 5].map(n => (
              <div key={n} className={`${styles.progressDot} ${n <= photos.length ? styles.progressDotFilled : ''}`}>
                {n <= photos.length ? <CheckCircle2 size={12} /> : n}
              </div>
            ))}
            <span className={styles.progressLabel}>
              Earn up to <strong>₹{estimatedReward > 0 ? estimatedReward : MAX_PHOTOS * REWARD_PER_PHOTO}</strong> Polar Credits
            </span>
          </div>

          {/* Drop zone */}
          {photos.length < MAX_PHOTOS && (
            <div
              className={`${styles.dropZone} ${dragOver ? styles.dropZoneActive : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <Upload size={32} className={styles.dropIcon} />
              <p className={styles.dropText}>
                Click or drag &amp; drop photos here
              </p>
              <p className={styles.dropSubtext}>
                JPG, PNG, WEBP · Up to {MAX_PHOTOS - photos.length} more photo{MAX_PHOTOS - photos.length !== 1 ? 's' : ''}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={e => handleFiles(e.target.files)}
              />
            </div>
          )}

          {/* Preview grid */}
          {photos.length > 0 && (
            <div className={styles.previewGrid}>
              {photos.map((photo, idx) => (
                <div key={idx} className={styles.previewItem}>
                  <img src={photo.dataUrl} alt={`Photo ${idx + 1}`} className={styles.previewImg} />
                  <button
                    type="button"
                    className={styles.removePhoto}
                    onClick={() => removePhoto(idx)}
                    aria-label="Remove photo"
                  >
                    <X size={14} />
                  </button>
                  <div className={styles.previewReward}>+₹5</div>
                </div>
              ))}
            </div>
          )}

          {/* Dynamic reward estimate */}
          {photos.length > 0 && (
            <div className={styles.rewardEstimate}>
              <ImageIcon size={16} />
              <span>
                Estimated reward: <strong>₹{estimatedReward} Polar Credits</strong>
                {' '}for {photos.length} photo{photos.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Review Guidelines */}
        <div className={styles.guidelines}>
          <h4 className={styles.guidelinesTitle}>📋 Review Guidelines</h4>
          <ul className={styles.guidelinesList}>
            <li>Upload clear, well-lit photos of the actual product.</li>
            <li>Photos must be original and taken by you.</li>
            <li>For wearable products, photos wearing or using the product are preferred.</li>
            <li>Do not upload screenshots, copied images, offensive content, or irrelevant photos.</li>
            <li>Rewards are manually reviewed and approved by our team within 2–3 business days.</li>
          </ul>
        </div>

        {/* Consent Checkbox */}
        <label className={styles.consentLabel}>
          <input
            type="checkbox"
            checked={consent}
            onChange={e => setConsent(e.target.checked)}
            className={styles.consentCheck}
          />
          <span>
            I confirm that these photos are mine and I allow this website to use them for product reviews,
            marketing, and social proof.
          </span>
        </label>

        {/* Disclaimer */}
        <p className={styles.disclaimer}>
          ⚠️ Polar Credits are store credits only. They cannot be withdrawn, transferred, or converted into cash.
          Valid for 90 days after approval. Minimum order value ₹999 to redeem.
        </p>

        {/* Error message */}
        {result && !result.success && (
          <div className={styles.errorMsg}>
            <AlertCircle size={16} />
            {result.message}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className={styles.submitBtn}
          disabled={loading || photos.length === 0 || !consent}
        >
          {loading ? (
            <><Loader2 size={18} className={styles.spin} /> Submitting…</>
          ) : (
            <><Camera size={18} /> Submit Photo Review &amp; Earn ₹{estimatedReward} Polar Credits</>
          )}
        </button>
      </form>
    </div>
  );
}
