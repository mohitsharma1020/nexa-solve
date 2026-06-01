import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminDb } from '../../../lib/firebaseAdmin';

export async function POST(request) {
  try {
    const { orderId, productId, productTitle, photos, rating, userEmail } = await request.json();

    if (!orderId || !productId || !photos || photos.length === 0) {
      return NextResponse.json({ error: 'Missing required fields or photos.' }, { status: 400 });
    }

    // Phase 5B: Secure Backend Verification
    // Verify user is authenticated via Customer Account API
    const cookieStore = cookies();
    const shopifyAccessToken = cookieStore.get('shopify_access_token')?.value;

    if (!shopifyAccessToken) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in to Shopify via your Account dashboard first.' }, { status: 401 });
    }

    // Fetch the specific order from Shopify to ensure the customer actually bought it
    // Shopify Customer API requires formatting the order ID as a full global ID if it's not already
    const globalOrderId = orderId.includes('gid://') ? orderId : `gid://shopify/Order/${orderId}`;
    
    const query = `
      query getOrder($id: ID!) {
        order(id: $id) {
          id
          financialStatus
          fulfillmentStatus
          lineItems(first: 50) {
            edges {
              node {
                variant {
                  product {
                    id
                  }
                }
              }
            }
          }
        }
      }
    `;

    const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
    const shopifyRes = await fetch(`https://${shopifyDomain}/account/customer/api/2024-04/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': shopifyAccessToken,
      },
      body: JSON.stringify({ query, variables: { id: globalOrderId } }),
    });

    const shopifyData = await shopifyRes.json();
    
    if (shopifyData.errors) {
      console.error('[Review Error] Shopify GraphQL Error:', shopifyData.errors);
      return NextResponse.json({ error: 'Failed to verify order with Shopify.' }, { status: 500 });
    }

    const orderNode = shopifyData.data?.order;
    if (!orderNode) {
      return NextResponse.json({ error: 'Order not found or does not belong to you.' }, { status: 403 });
    }

    // Fraud check: order must be paid or fulfilled
    if (orderNode.financialStatus !== 'PAID' && orderNode.fulfillmentStatus !== 'FULFILLED') {
      return NextResponse.json({ error: 'Only completed orders are eligible for review.' }, { status: 403 });
    }

    // Fraud check: verify the product exists in this order
    const lineItems = orderNode.lineItems.edges;
    const productPurchased = lineItems.some(({ node }) => {
      const pid = node.variant?.product?.id;
      return pid && (pid === productId || pid.includes(productId));
    });

    if (!productPurchased) {
      return NextResponse.json({ error: 'Product not found in this order.' }, { status: 403 });
    }

    // Phase 5C: Firestore Storage
    if (!adminDb) {
      return NextResponse.json({ error: 'Database not initialized.' }, { status: 500 });
    }

    const reviewId = `rev_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 5)}`;
    const limitedPhotos = photos.slice(0, 5); // Enforce max 5
    const estimatedReward = limitedPhotos.length * 5; // ₹5 per photo

    // Ensure no duplicates exist for this exact order and product
    const existingRef = await adminDb.collection('productReviews')
      .where('orderId', '==', orderId)
      .where('productId', '==', productId)
      .where('status', 'in', ['under_review', 'approved'])
      .get();

    if (!existingRef.empty) {
      return NextResponse.json({ error: 'You have already submitted a review for this product.' }, { status: 409 });
    }

    const reviewPayload = {
      reviewId,
      orderId,
      productId,
      productTitle,
      userEmail: userEmail || 'unknown',
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      photos: limitedPhotos,
      photoCount: limitedPhotos.length,
      estimatedReward: Math.min(estimatedReward, 25), // max ₹25
      status: 'under_review',
      createdAt: new Date().toISOString(),
    };

    await adminDb.collection('productReviews').doc(reviewId).set(reviewPayload);

    return NextResponse.json({ 
      success: true, 
      message: `Your photo review for ${productTitle} has been securely submitted and is pending admin approval.` 
    }, { status: 200 });

  } catch (error) {
    console.error('[Review Submission Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
