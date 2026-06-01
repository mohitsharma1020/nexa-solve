import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('Authorization') || '';
    const adminSecret = authHeader.replace('Bearer ', '').trim();

    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 403 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Database not initialized.' }, { status: 500 });
    }

    // Fetch all pending reviews
    const snapshot = await adminDb.collection('productReviews')
      .where('status', '==', 'under_review')
      .orderBy('createdAt', 'desc')
      .get();

    const reviews = [];
    snapshot.forEach(doc => {
      reviews.push({ id: doc.id, ...doc.data() });
    });

    return NextResponse.json({ success: true, reviews }, { status: 200 });
  } catch (error) {
    console.error('[Admin Fetch Reviews Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
