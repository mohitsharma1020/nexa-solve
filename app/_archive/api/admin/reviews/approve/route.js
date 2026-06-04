import { NextResponse } from 'next/server';
import { adminDb } from '../../../../../lib/firebaseAdmin';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('Authorization') || '';
    const adminSecret = authHeader.replace('Bearer ', '').trim();

    // In a real production app, use Next-Auth or a secure admin token mechanism.
    // For now, we will use a server-side secret check.
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 403 });
    }

    const { reviewId, approvedPhotoCount } = await request.json();

    if (!adminDb) {
      return NextResponse.json({ error: 'Database not initialized.' }, { status: 500 });
    }

    const reviewRef = adminDb.collection('productReviews').doc(reviewId);
    const doc = await reviewRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Review not found.' }, { status: 404 });
    }

    const reviewData = doc.data();

    if (reviewData.status === 'approved') {
      return NextResponse.json({ error: 'Review is already approved.' }, { status: 400 });
    }

    // Phase 5D: Calculate exact reward amount based on approved photos
    const cappedPhotos = Math.min(approvedPhotoCount || reviewData.photoCount, 5);
    const rewardAmount = cappedPhotos * 5; // ₹5 per photo
    const finalReward = Math.min(rewardAmount, 25); // Hard cap at ₹25

    // 1. Update review status
    await reviewRef.update({
      status: 'approved',
      approvedPhotoCount: cappedPhotos,
      rewardAmount: finalReward,
      reviewedAt: new Date().toISOString()
    });

    // 2. Issue Polar Credits only if reward > 0
    if (finalReward > 0 && reviewData.userEmail) {
      // Look up customer ID if we only have email, or just store by email for now
      // Assuming we link creditLedger via email or we pull customerId if available
      const creditId = `txn_${reviewId}`;
      const ledgerRef = adminDb.collection('creditLedger').doc(creditId);
      
      await ledgerRef.set({
        creditId,
        userEmail: reviewData.userEmail,
        type: 'photo_review_reward',
        amount: finalReward,
        status: 'active', // Active immediately upon admin approval
        sourceOrderId: reviewData.orderId,
        reviewId: reviewId,
        createdAt: new Date().toISOString(),
        notes: `Admin approved photo review for ${reviewData.productTitle} (${cappedPhotos} photos)`
      });
      
      console.log(`[Admin Action] Approved review ${reviewId} for ${reviewData.userEmail}. Minted ₹${finalReward} Polar Credits.`);
    } else {
      console.log(`[Admin Action] Approved review ${reviewId} with 0 photos. No credits minted.`);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Review approved. ₹${finalReward} Polar Credits added to ledger.` 
    }, { status: 200 });

  } catch (error) {
    console.error('[Admin Review Approval Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
