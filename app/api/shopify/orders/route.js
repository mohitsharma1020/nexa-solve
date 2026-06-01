import { NextResponse } from 'next/server';
import { adminAuth } from '../../../../lib/firebaseAdmin';

export async function GET(request) {
  try {
    // 1. Verify the Firebase ID Token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
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

    console.log(`[Shopify Orders API] Fetching orders for verified email: ${userEmail}`);

    // 2. Query Shopify Admin API
    const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
    const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!shopifyDomain || !adminToken) {
      console.error('[Shopify Orders API] Missing Shopify Admin credentials in environment variables.');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const shopifyGraphQLUrl = `https://${shopifyDomain}/admin/api/2024-04/graphql.json`;

    const query = `
      query getOrdersByEmail($query: String!) {
        orders(first: 20, query: $query, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              id
              name
              createdAt
              displayFinancialStatus
              displayFulfillmentStatus
              statusPageUrl
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              lineItems(first: 10) {
                edges {
                  node {
                    id
                    title
                    quantity
                    variant {
                      id
                      product {
                        id
                      }
                      image {
                        url
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const variables = {
      query: `email:${userEmail}`
    };

    const res = await fetch(shopifyGraphQLUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': adminToken,
      },
      body: JSON.stringify({ query, variables }),
      cache: 'no-store'
    });

    if (!res.ok) {
      console.error(`[Shopify Orders API] Admin API HTTP Error: ${res.status}`);
      return NextResponse.json({ error: 'Failed to fetch from Shopify Admin API' }, { status: res.status });
    }

    const json = await res.json();
    
    if (json.errors) {
      console.error('[Shopify Orders API] GraphQL Errors:', json.errors);
      return NextResponse.json({ error: 'GraphQL error' }, { status: 500 });
    }

    // Map the Admin API structure to match what the frontend expects
    const rawOrders = json.data?.orders?.edges || [];
    
    const mappedOrders = rawOrders.map(({ node }) => ({
      id: node.id,
      name: node.name,
      createdAt: node.createdAt,
      financialStatus: node.displayFinancialStatus,
      fulfillmentStatus: node.displayFulfillmentStatus,
      statusPageUrl: node.statusPageUrl,
      totalPrice: {
        amount: node.totalPriceSet?.shopMoney?.amount,
        currencyCode: node.totalPriceSet?.shopMoney?.currencyCode,
      },
      lineItems: {
        edges: node.lineItems.edges.map(li => ({
          node: {
            title: li.node.title,
            quantity: li.node.quantity,
            image: {
              url: li.node.variant?.image?.url || null
            }
          }
        }))
      }
    }));

    console.log(`[Shopify Orders API] Successfully mapped ${mappedOrders.length} orders for ${userEmail}`);

    return NextResponse.json({ orders: mappedOrders });

  } catch (error) {
    console.error('[Shopify Orders API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
