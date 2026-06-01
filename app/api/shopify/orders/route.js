import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '../../../../lib/firebaseAdmin';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: 'Server misconfigured: Missing Firebase Admin variables (FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY)' }, { status: 500 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (error) {
      console.error('[Shopify Orders API] Firebase token verification failed:', error);
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const userEmail = decodedToken.email;
    if (!userEmail) {
      return NextResponse.json({ error: 'No email associated with this account' }, { status: 400 });
    }

    // Fetch Orders securely from Firebase using the email
    const ordersSnapshot = await adminDb
      .collection('users')
      .doc(userEmail)
      .collection('orders')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const orders = [];
    ordersSnapshot.forEach(doc => {
      orders.push(doc.data());
    });

    return NextResponse.json({ orders });

  } catch (error) {
    console.error('[Shopify Orders API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
