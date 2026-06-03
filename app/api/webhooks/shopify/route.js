import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '../../../../lib/firebaseAdmin';

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const hmacHeader = request.headers.get('X-Shopify-Hmac-Sha256');
    const topic = request.headers.get('X-Shopify-Topic');
    
    const secret = process.env.SHOPIFY_WEBHOOK_SECRET;

    if (!secret || !hmacHeader) {
      console.error('[Webhook Error] Missing secret or HMAC header');
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

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

    if (!adminDb) {
      console.error('[Webhook Error] adminDb not initialized');
      return NextResponse.json({ error: 'database_error' }, { status: 500 });
    }

    // Idempotency Check
    const webhookId = request.headers.get('X-Shopify-Webhook-Id');
    if (webhookId) {
      const processedRef = adminDb.collection('processedWebhooks').doc(webhookId);
      const processedDoc = await processedRef.get();
      if (processedDoc.exists) {
        console.log(`[Webhook] Skipping already processed webhook: ${webhookId}`);
        return NextResponse.json({ message: 'Already processed' }, { status: 200 });
      }
      await processedRef.set({ topic, orderId: payload.id, processedAt: new Date().toISOString() });
    }

    if (topic === 'orders/create' || topic === 'orders/updated' || topic === 'orders/paid') {
      await syncOrderToFirebase(payload);
    }
    
    if (topic === 'orders/paid') {
      await handleOrderPaid(payload);
    } else if (topic === 'orders/fulfilled') {
      await handleOrderFulfilled(payload);
      await syncOrderToFirebase(payload);
    } else if (topic === 'orders/cancelled' || topic === 'refunds/create') {
      await handleOrderCancelled(payload);
      await syncOrderToFirebase(payload);
    }

    return NextResponse.json({ message: 'Webhook processed' }, { status: 200 });

  } catch (err) {
    console.error('[Webhook Processing Error]', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

// ── Webhook Handlers ──────────────────────────────────────────────

async function syncOrderToFirebase(order) {
  const email = order.email || order.customer?.email;
  if (!email) return;

  const orderId = order.id.toString();
  
  const formattedOrder = {
    id: `gid://shopify/Order/${orderId}`,
    name: order.name,
    createdAt: order.created_at,
    financialStatus: order.financial_status?.toUpperCase() || 'PENDING',
    fulfillmentStatus: order.fulfillment_status?.toUpperCase() || 'UNFULFILLED',
    statusPageUrl: order.order_status_url,
    totalPrice: {
      amount: order.current_total_price,
      currencyCode: order.currency,
    },
    lineItems: {
      edges: (order.line_items || []).map(li => ({
        node: {
          title: li.title,
          quantity: li.quantity,
          image: { url: null }
        }
      }))
    },
    updatedAt: new Date().toISOString()
  };

  try {
    await adminDb.collection('users').doc(email).collection('orders').doc(orderId).set(formattedOrder, { merge: true });
  } catch (err) {
    console.error(`[Order Sync] Failed to sync order ${order.name} to Firebase:`, err);
  }
}

async function handleOrderPaid(order) {
  const referralCode = order.note_attributes?.find(attr => attr.name === 'referralCode')?.value;
  const buyerEmail = order.email || order.customer?.email;
  
  if (!referralCode || !buyerEmail) return;

  // 1. Look up the referral code owner
  const codesSnapshot = await adminDb.collection('referralCodes').where('referralCode', '==', referralCode).limit(1).get();
  if (codesSnapshot.empty) {
    console.log(`[Referral] Code ${referralCode} not found in database.`);
    return;
  }
  
  const codeDoc = codesSnapshot.docs[0].data();
  const referrerEmail = codeDoc.ownerEmail;

  // 2. Fraud Check: Self-Referral
  if (referrerEmail.toLowerCase() === buyerEmail.toLowerCase()) {
    console.log(`[Referral Fraud] Blocked self-referral for ${buyerEmail}`);
    return;
  }

  // 3. Fraud Check: Must be First Order
  const buyerOrdersSnapshot = await adminDb.collection('users').doc(buyerEmail).collection('orders').get();
  // Ensure this is their ONLY paid order (or one of very few if webhooks fire concurrently, but safely assume if count > 1, it's not first)
  if (buyerOrdersSnapshot.size > 1) {
    console.log(`[Referral Fraud] Blocked because ${buyerEmail} already has previous orders.`);
    return;
  }

  // 4. Fraud Check: Prevent multiple rewards for the same referred customer
  const existingRewardSnapshot = await adminDb.collection('referralRewards')
    .where('referredEmail', '==', buyerEmail)
    .where('status', 'in', ['pending', 'active'])
    .limit(1).get();
    
  if (!existingRewardSnapshot.empty) {
    console.log(`[Referral Fraud] Blocked because ${buyerEmail} has already been referred before.`);
    return;
  }

  // 5. Create Pending Reward
  const rewardId = `rew_${order.id}`;
  const rewardRef = adminDb.collection('referralRewards').doc(rewardId);
  
  await rewardRef.set({
    rewardId: rewardId,
    referralCode: referralCode,
    referrerEmail: referrerEmail,
    referredEmail: buyerEmail,
    shopifyOrderId: order.id.toString(),
    shopifyOrderName: order.name,
    amount: 200,
    status: 'pending',
    createdAt: new Date().toISOString(),
    reason: 'first_paid_referral_order'
  });

  // Increment totalReferrals on the code document
  await codesSnapshot.docs[0].ref.update({
    totalReferrals: adminDb.FieldValue ? adminDb.FieldValue.increment(1) : (codeDoc.totalReferrals || 0) + 1
  });

  console.log(`[Referral] Pending reward created for order ${order.name} via code ${referralCode}`);
}

async function handleOrderFulfilled(order) {
  const rewardId = `rew_${order.id}`;
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
      ownerEmail: data.referrerEmail,
      type: 'referral_reward',
      amount: data.amount,
      status: 'active',
      sourceOrderId: data.shopifyOrderId,
      createdAt: new Date().toISOString(),
      notes: `Referral reward activated for fulfilled order ${data.shopifyOrderName}`
    });

    // Increment activeRewards on the code document
    const codesSnapshot = await adminDb.collection('referralCodes').where('referralCode', '==', data.referralCode).limit(1).get();
    if (!codesSnapshot.empty) {
      await codesSnapshot.docs[0].ref.update({
        activeRewards: adminDb.FieldValue ? adminDb.FieldValue.increment(1) : ((codesSnapshot.docs[0].data().activeRewards || 0) + 1)
      });
    }

    console.log(`[Referral] Activated reward ${rewardId} for fulfilled order ${order.name}`);
  }
}

async function handleOrderCancelled(order) {
  const rewardId = `rew_${order.id}`;
  const rewardRef = adminDb.collection('referralRewards').doc(rewardId);
  const doc = await rewardRef.get();

  if (doc.exists && doc.data().status === 'pending') {
    await rewardRef.update({
      status: 'reversed',
      reversedAt: new Date().toISOString(),
      reason: 'Order was cancelled or refunded'
    });

    console.log(`[Referral] Reversed pending reward ${rewardId} for cancelled order ${order.name}`);
  } else if (doc.exists && doc.data().status === 'active') {
    // If it was already activated, we must create a reversal ledger entry
    const data = doc.data();
    await rewardRef.update({
      status: 'reversed',
      reversedAt: new Date().toISOString(),
      reason: 'Order was cancelled after fulfillment'
    });
    
    const reversalId = `rev_${order.id}`;
    const ledgerRef = adminDb.collection('creditLedger').doc(reversalId);
    await ledgerRef.set({
      creditId: reversalId,
      ownerEmail: data.referrerEmail,
      type: 'referral_reversal',
      amount: -data.amount,
      status: 'active',
      sourceOrderId: data.shopifyOrderId,
      createdAt: new Date().toISOString(),
      notes: `Referral reward reversed for cancelled order ${data.shopifyOrderName}`
    });
    
    // Decrement activeRewards
    const codesSnapshot = await adminDb.collection('referralCodes').where('referralCode', '==', data.referralCode).limit(1).get();
    if (!codesSnapshot.empty) {
      await codesSnapshot.docs[0].ref.update({
        activeRewards: adminDb.FieldValue ? adminDb.FieldValue.increment(-1) : ((codesSnapshot.docs[0].data().activeRewards || 0) - 1)
      });
    }
  }
}
