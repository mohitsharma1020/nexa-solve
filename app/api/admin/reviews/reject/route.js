import { NextResponse } from 'next/server';
import { adminDb } from '../../../../../lib/firebaseAdmin';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('Authorization') || '';
    const adminSecret = authHeader.replace('Bearer ', '').trim();

    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 403 });
    }

    const { reviewId, reason } = await request.json();

    if (!adminDb) {
      return NextResponse.json({ error: 'Database not initialized.' }, { status: 500 });
    }

    const reviewRef = adminDb.collection('productReviews').doc(reviewId);
    const doc = await reviewRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Review not found.' }, { status: 404 });
    }

    const reviewData = doc.data();

    if (reviewData.status !== 'under_review') {
      return NextResponse.json({ error: `Review is already ${reviewData.status}.` }, { status: 400 });
    }

    // Reject review without minting credits
    await reviewRef.update({
      status: 'rejected',
      rejectionReason: reason || 'Does not meet review guidelines.',
      reviewedAt: new Date().toISOString()
    });

    console.log(`[Admin Action] Rejected review ${reviewId} for ${reviewData.userEmail}. Reason: ${reason || 'None provided'}`);

    return NextResponse.json({ 
      success: true, 
      message: `Review rejected successfully.` 
    }, { status: 200 });

  } catch (error) {
    console.error('[Admin Review Rejection Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
