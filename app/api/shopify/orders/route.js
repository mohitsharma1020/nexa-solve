import { NextResponse } from 'next/server';

export async function GET(request) {
  const token = request.cookies.get('shopify_access_token')?.value;
  console.log('[Shopify Orders API] Shopify auth cookie found:', !!token);

  if (!token) {
    console.warn('[Shopify Orders API] Unauthorized: No access token found');
    return NextResponse.json({ error: 'unauthorized', message: 'No access token found' }, { status: 401 });
  }

  const shopifyAuthUrl = process.env.SHOPIFY_CUSTOMER_ACCOUNT_URL;
  if (!shopifyAuthUrl) {
    return NextResponse.json({ error: 'configuration_error', message: 'SHOPIFY_CUSTOMER_ACCOUNT_URL is not set' }, { status: 500 });
  }

  const query = `
    query getCustomerOrders {
      customer {
        id
        firstName
        lastName
        emailAddress {
          emailAddress
        }
        orders(first: 10, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              id
              name
              createdAt
              financialStatus
              fulfillmentStatus
              statusPageUrl
              totalPrice {
                amount
                currencyCode
              }
              lineItems(first: 10) {
                edges {
                  node {
                    id
                    title
                    quantity
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

  try {
    const res = await fetch(`${shopifyAuthUrl}/account/customer/api/2024-04/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();
    console.log(`[Shopify Orders API] GraphQL fetch status: ${res.ok ? 'success' : 'error'}, HTTP ${res.status}`);

    if (data.errors) {
      console.error('[Shopify Orders API Error]', data.errors);
      return NextResponse.json({ error: 'graphql_error', details: data.errors }, { status: 400 });
    }

    const orders = data.data.customer?.orders?.edges?.map(e => e.node) || [];
    console.log(`[Shopify Orders API] Order count returned: ${orders.length}`);

    return NextResponse.json({
      customer: data.data.customer,
      orders: orders
    });

  } catch (error) {
    console.error('[Shopify Orders Fetch Error]', error);
    return NextResponse.json({ error: 'server_error', message: 'Failed to fetch orders' }, { status: 500 });
  }
}
