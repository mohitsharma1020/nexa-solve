/**
 * Photo Review Service
 * Handles photo review submission, admin approval, and Polar Credits ledger
 * Credits: ₹5 per approved photo | Max 5 photos | Max ₹25 per review
 */

const REWARD_PER_PHOTO = 5;
const MAX_PHOTOS = 5;
const MAX_REWARD = 25;
const CREDIT_EXPIRY_DAYS = 90;

const getDB = () => {
  if (typeof window === 'undefined') return { users: [], ledger: [], orders: [], reviews: [] };
  const db = localStorage.getItem('nexa_global_db');
  if (!db) return { users: [], ledger: [], orders: [], reviews: [] };
  const parsed = JSON.parse(db);
  // Ensure reviews array exists (backward compat)
  if (!parsed.reviews) parsed.reviews = [];
  return parsed;
};

const saveDB = (db) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('nexa_global_db', JSON.stringify(db));
  }
};

export const photoReviewService = {

  /**
   * Submit a photo review for a purchased product.
   * Returns { success, reviewId, message }
   */
  async submitReview({ userId, productId, orderId, customerName, customerEmail, rating, reviewText, photos, consentGiven }) {
    const db = getDB();

    // Fraud check 1: user must exist
    const user = db.users.find(u => u.id === userId);
    if (!user) return { success: false, message: 'User not found. Please log in.' };

    // Fraud check 2: order must belong to user and contain product
    const order = db.orders.find(o => o.orderId === orderId && o.customerId === userId);
    if (!order) return { success: false, message: 'Order not found or does not belong to your account.' };

    const productInOrder = order.items && order.items.some(item => item.id === productId || item.slug === productId);
    if (!productInOrder) return { success: false, message: 'This product was not found in the specified order.' };

    // Fraud check 3: no cancelled/refunded orders
    if (['Cancelled', 'Refunded', 'Returned'].includes(order.orderStatus)) {
      return { success: false, message: 'Reviews are not eligible for orders that have been cancelled or refunded.' };
    }

    // Fraud check 4: one rewarded review per product per order
    const existingReview = db.reviews.find(r =>
      r.userId === userId &&
      r.productId === productId &&
      r.orderId === orderId &&
      r.status !== 'rejected'
    );
    if (existingReview) {
      return { success: false, message: 'You have already submitted a photo review for this product from this order.' };
    }

    // Limit photos to max 5
    const limitedPhotos = (photos || []).slice(0, MAX_PHOTOS);
    if (limitedPhotos.length === 0) {
      return { success: false, message: 'Please upload at least 1 product photo to earn Polar Credits.' };
    }

    const review = {
      reviewId: 'rev_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      userId,
      productId,
      orderId,
      customerName,
      customerEmail,
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      reviewText: reviewText || '',
      photos: limitedPhotos,
      photoCount: limitedPhotos.length,
      status: 'under_review',   // submitted → under_review → approved/rejected
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      approvedPhotoCount: 0,
      rejectionReason: null,
      consentGiven: !!consentGiven,
      creditLedgerId: null,
      estimatedReward: limitedPhotos.length * REWARD_PER_PHOTO,
    };

    db.reviews.push(review);
    saveDB(db);

    return {
      success: true,
      reviewId: review.reviewId,
      estimatedReward: review.estimatedReward,
      message: `Your photo review has been submitted. Once approved, your Polar Credits will be added to your account.`,
    };
  },

  /**
   * Admin: Get all reviews (for admin panel)
   */
  async getAllReviews() {
    const db = getDB();
    const reviews = db.reviews || [];
    // Enrich with user and order info
    return reviews.map(r => {
      const user = db.users.find(u => u.id === r.userId);
      const order = db.orders.find(o => o.orderId === r.orderId);
      return {
        ...r,
        userName: user?.name || r.customerName,
        userEmail: user?.email || r.customerEmail,
        orderAmount: order?.finalAmount,
        orderStatus: order?.orderStatus,
      };
    }).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  },

  /**
   * Admin: Approve a review with N approved photos.
   * Credits: approvedPhotoCount × ₹5, max ₹25
   */
  async approveReview(reviewId, approvedPhotoCount) {
    const db = getDB();
    const review = db.reviews.find(r => r.reviewId === reviewId);
    if (!review) return { success: false, message: 'Review not found.' };
    if (review.status === 'approved') return { success: false, message: 'Already approved.' };

    // Fraud: check order not cancelled after submission
    const order = db.orders.find(o => o.orderId === review.orderId);
    if (order && ['Cancelled', 'Refunded', 'Returned'].includes(order.orderStatus)) {
      review.status = 'rejected';
      review.rejectionReason = 'Order was cancelled or refunded after review submission.';
      review.reviewedAt = new Date().toISOString();
      saveDB(db);
      return { success: false, message: 'Order was cancelled. Review rejected.' };
    }

    // Duplicate credit check
    if (review.creditLedgerId) {
      return { success: false, message: 'Credits already issued for this review.' };
    }

    const cappedCount = Math.min(approvedPhotoCount, MAX_PHOTOS, review.photoCount);
    const rewardAmount = Math.min(cappedCount * REWARD_PER_PHOTO, MAX_REWARD);

    review.status = 'approved';
    review.approvedPhotoCount = cappedCount;
    review.reviewedAt = new Date().toISOString();
    review.rejectionReason = null;

    if (rewardAmount > 0) {
      const txnId = 'txn_' + Date.now().toString(36) + '_photo';
      const expiresAt = new Date(Date.now() + CREDIT_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();

      const ledgerEntry = {
        transactionId: txnId,
        userId: review.userId,
        type: 'photo_review_reward',
        amount: rewardAmount,
        status: 'active',
        sourceOrderId: review.orderId,
        reviewId: review.reviewId,
        productId: review.productId,
        photoCount: review.photoCount,
        approvedPhotoCount: cappedCount,
        rewardPerPhoto: REWARD_PER_PHOTO,
        maxReward: MAX_REWARD,
        approvedByAdmin: true,
        submittedAt: review.submittedAt,
        reviewedAt: new Date().toISOString(),
        expiresAt,
        createdAt: new Date().toISOString(),
        notes: `Photo review reward: ${cappedCount} photo(s) approved for product ${review.productId}`,
      };

      db.ledger.push(ledgerEntry);
      review.creditLedgerId = txnId;
    }

    saveDB(db);
    return {
      success: true,
      approvedPhotoCount: cappedCount,
      rewardAmount,
      message: `Review approved. ₹${rewardAmount} Polar Credits have been added to the customer's account.`,
    };
  },

  /**
   * Admin: Reject a review with a reason.
   */
  async rejectReview(reviewId, reason) {
    const db = getDB();
    const review = db.reviews.find(r => r.reviewId === reviewId);
    if (!review) return { success: false, message: 'Review not found.' };

    review.status = 'rejected';
    review.rejectionReason = reason || 'Did not meet review guidelines.';
    review.reviewedAt = new Date().toISOString();

    // If credits were already issued, reverse them
    if (review.creditLedgerId) {
      const ledger = db.ledger.find(l => l.transactionId === review.creditLedgerId);
      if (ledger) {
        ledger.status = 'reversed';
        ledger.notes += ' (Review later rejected by admin)';
      }
    }

    saveDB(db);
    return { success: true, message: 'Review rejected.' };
  },

  /**
   * Admin: Reverse credits (e.g. after order refund)
   */
  async reverseReviewCredits(reviewId, reason) {
    const db = getDB();
    const review = db.reviews.find(r => r.reviewId === reviewId);
    if (!review || !review.creditLedgerId) return { success: false, message: 'No credits to reverse.' };

    const ledger = db.ledger.find(l => l.transactionId === review.creditLedgerId);
    if (ledger) {
      ledger.status = 'reversed';
      ledger.notes += ` | Reversed: ${reason || 'Admin reversal'}`;
    }
    review.status = 'rejected';
    review.rejectionReason = reason || 'Credits reversed by admin.';
    saveDB(db);
    return { success: true };
  },

  /**
   * Get all reviews submitted by a user (for dashboard)
   */
  async getUserReviews(userId) {
    const db = getDB();
    const reviews = (db.reviews || []).filter(r => r.userId === userId);
    return reviews.map(r => {
      const ledger = r.creditLedgerId ? db.ledger.find(l => l.transactionId === r.creditLedgerId) : null;
      return {
        ...r,
        creditStatus: ledger?.status || null,
        creditAmount: ledger?.amount || 0,
      };
    }).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  },

  /**
   * Get products eligible for review (user has bought but not yet reviewed)
   */
  async getEligibleProducts(userId) {
    const db = getDB();
    const userOrders = db.orders.filter(o =>
      o.customerId === userId &&
      !['Cancelled', 'Refunded', 'Returned'].includes(o.orderStatus)
    );

    const eligiblePairs = [];
    userOrders.forEach(order => {
      (order.items || []).forEach(item => {
        const alreadyReviewed = db.reviews.some(r =>
          r.userId === userId &&
          r.productId === (item.slug || item.id) &&
          r.orderId === order.orderId &&
          r.status !== 'rejected'
        );
        if (!alreadyReviewed) {
          eligiblePairs.push({
            orderId: order.orderId,
            orderDate: order.createdAt,
            product: item,
          });
        }
      });
    });

    return eligiblePairs;
  },

  // Constants
  REWARD_PER_PHOTO,
  MAX_PHOTOS,
  MAX_REWARD,
};
