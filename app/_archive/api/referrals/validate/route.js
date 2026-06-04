import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebaseAdmin';

export async function POST(request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ valid: false, error: 'No code provided' }, { status: 400 });
    }

    if (!adminDb) {
      // If adminDb is missing, we gracefully assume valid so we don't block checkout 
      // (it will fail securely in the webhook anyway).
      return NextResponse.json({ valid: true }); 
    }

    const codesSnapshot = await adminDb.collection('referralCodes').where('referralCode', '==', code).limit(1).get();
    
    if (codesSnapshot.empty) {
      return NextResponse.json({ valid: false, error: 'Invalid referral code' });
    }

    const codeData = codesSnapshot.docs[0].data();

    return NextResponse.json({ 
      valid: true,
      ownerEmail: codeData.ownerEmail
    });

  } catch (error) {
    console.error('[Referral Validate API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
