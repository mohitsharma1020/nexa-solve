import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '../../../../lib/firebaseAdmin';

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const hmacHeader = request.headers.get('X-Shopify-Hmac-Sha256');
    const topic = request.headers.get('X-Shopify-Topic');
    const shopDomain = request.headers.get('X-Shopify-Shop-Domain');
    
    const secret = process.env.SHOPIFY_WEBHOOK_SECRET;

    if (!secret || !hmacHeader) {
      console.error('[Webhook Error] Missing secret or HMAC header');
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    // Verify HMAC
    const generatedHash = crypto
      .createHmac('sha256', secret)
      .update(rawBody, 'utf8')
      .digest('base64');

    if (generatedHash !== hmacHeader) {
      console.error('[Webhook Error] HMAC validation failed');
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    console.log(`[Webhook Received] Topic: ${topic}, Order ID: ${payload.id}`);

    // Offload processing or handle quickly
    // For Netlify Functions (sync execution), we handle it directly but keep it fast.
    
    if (topic === 'orders/paid') {
      await handleOrderPaid(payload);
    } else if (topic === 'orders/fulfilled') {
      await handleOrderFulfilled(payload);
    } else if (topic === 'orders/cancelled' || topic === 'refunds/create') {
      await handleOrderCancelled(payload);
    }

    return NextResponse.json({ message: 'Webhook processed' }, { status: 200 });

  } catch (err) {
    console.error('[Webhook Processing Error]', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

// ── Webhook Handlers ──────────────────────────────────────────────

async function handleOrderPaid(order) {
  // Check for referral cart attributes
  const referralCode = order.note_attributes?.find(attr => attr.name === 'referralCode')?.value;
  const referrerId = order.note_attributes?.find(attr => attr.name === 'referrerCustomerId')?.value;

  if (referrerId && adminDb) {
    const rewardId = `rew_${order.id}`;
    const rewardRef = adminDb.collection('referralRewards').doc(rewardId);
    
    // Create pending reward
    await rewardRef.set({
      rewardId: rewardId,
      referrerCustomerId: referrerId,
      shopifyOrderId: order.id.toString(),
      shopifyOrderName: order.name,
      amount: 200,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }, { merge: true });

    console.log(`[Referral] Pending reward created for order ${order.name}`);
  }
}

async function handleOrderFulfilled(order) {
  const rewardId = `rew_${order.id}`;
  if (!adminDb) return;

  const rewardRef = adminDb.collection('referralRewards').doc(rewardId);
  const doc = await rewardRef.get();

  if (doc.exists && doc.data().status === 'pending') {
    const data = doc.data();
    await rewardRef.update({
      status: 'active',
      activatedAt: new Date().toISOString()
    });

    // Write to creditLedger
    const ledgerRef = adminDb.collection('creditLedger').doc(`txn_${rewardId}`);
    await ledgerRef.set({
      creditId: `txn_${rewardId}`,
      customerId: data.referrerCustomerId,
      type: 'referral_reward',
      amount: data.amount,
      status: 'active',
      sourceOrderId: data.shopifyOrderId,
      createdAt: new Date().toISOString(),
      notes: `Referral reward activated for fulfilled order ${data.shopifyOrderName}`
    });

    console.log(`[Referral] Activated reward ${rewardId} for fulfilled order ${order.name}`);
  }
}

async function handleOrderCancelled(order) {
  const rewardId = `rew_${order.id}`;
  if (!adminDb) return;

  const rewardRef = adminDb.collection('referralRewards').doc(rewardId);
  const doc = await rewardRef.get();

  if (doc.exists) {
    await rewardRef.update({
      status: 'reversed',
      reversedAt: new Date().toISOString(),
      reason: 'Order was cancelled or refunded'
    });

    console.log(`[Referral] Reversed reward ${rewardId} for cancelled order ${order.name}`);
  }
}
