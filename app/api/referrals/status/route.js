import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '../../../../../lib/firebaseAdmin';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing authorization' }, { status: 401 });
    }

    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const email = decodedToken.email;
    if (!email) {
      return NextResponse.json({ error: 'No email found' }, { status: 400 });
    }

    // 1. Get or Create Referral Code
    let referralCode = '';
    let totalReferrals = 0;
    let activeRewards = 0;
    
    const codesSnapshot = await adminDb.collection('referralCodes').where('ownerEmail', '==', email).limit(1).get();
    
    if (codesSnapshot.empty) {
      // Create new code
      const baseCode = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
      referralCode = `NEXA${baseCode}${randomChars}`.substring(0, 12);
      
      await adminDb.collection('referralCodes').doc(referralCode).set({
        referralCode,
        ownerEmail: email,
        ownerId: decodedToken.uid,
        createdAt: new Date().toISOString(),
        totalReferrals: 0,
        activeRewards: 0
      });
    } else {
      const data = codesSnapshot.docs[0].data();
      referralCode = data.referralCode;
      totalReferrals = data.totalReferrals || 0;
      activeRewards = data.activeRewards || 0;
    }

    // 2. Get Pending Rewards
    const pendingSnapshot = await adminDb.collection('referralRewards')
      .where('referrerEmail', '==', email)
      .where('status', '==', 'pending')
      .get();
      
    const pendingRewards = [];
    let pendingCredits = 0;
    
    pendingSnapshot.forEach(doc => {
      const data = doc.data();
      pendingRewards.push(data);
      pendingCredits += data.amount || 0;
    });

    // 3. Get Active Credits from Ledger
    const ledgerSnapshot = await adminDb.collection('creditLedger')
      .where('ownerEmail', '==', email)
      .where('status', '==', 'active')
      .get();
      
    let activeCredits = 0;
    ledgerSnapshot.forEach(doc => {
      activeCredits += doc.data().amount || 0;
    });

    // We can also fetch recent history (latest 10 rewards)
    const historySnapshot = await adminDb.collection('referralRewards')
      .where('referrerEmail', '==', email)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
      
    const history = [];
    historySnapshot.forEach(doc => history.push(doc.data()));

    return NextResponse.json({ 
      referralCode,
      totalReferrals,
      pendingCredits,
      activeCredits,
      pendingRewards,
      history
    });

  } catch (error) {
    console.error('[Referral API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
