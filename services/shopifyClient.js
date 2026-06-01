const domain = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN || 'bcz5qp-zj.myshopify.com';
const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || 'd4d669238b3d526997a922344c926a4b';
const apiUrl = `https://${domain}/api/2024-04/graphql.json`;

/**
 * Execute a GraphQL query against the Shopify Storefront API.
 */
async function shopifyFetch({ query, variables = {} }) {
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const result = await response.json();
    if (result.errors) {
      console.error('Shopify API errors:', result.errors);
      throw new Error('Failed to fetch from Shopify API');
    }
    return result;
  } catch (error) {
    console.error('shopifyFetch error:', error);
    throw error;
  }
}

/**
 * Fetch a list of products.
 */
export async function getShopifyProducts(first = 50) {
  const query = `
    query getProducts($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            descriptionHtml
            description
            vendor
            featuredImage {
              url
              altText
              width
              height
            }
            images(first: 5) {
              edges {
                node {
                  url
                  altText
                  width
                  height
                }
              }
            }
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
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
  `;

  const response = await shopifyFetch({ query, variables: { first } });
  
  if (!response?.data?.products?.edges) return [];
  
  // Transform Shopify data into NexaSolve product card format
  return response.data.products.edges.map(({ node }) => transformShopifyProduct(node));
}

/**
 * Fetch a single product by its handle.
 */
export async function getShopifyProductByHandle(handle) {
  const query = `
    query getProductByHandle($handle: String!) {
      product(handle: $handle) {
        id
        title
        handle
        descriptionHtml
        description
        vendor
        featuredImage {
          url
          altText
          width
          height
        }
        images(first: 5) {
          edges {
            node {
              url
              altText
              width
              height
            }
          }
        }
        variants(first: 10) {
          edges {
            node {
              id
              title
              availableForSale
              price {
                amount
                currencyCode
              }
              compareAtPrice {
                amount
                currencyCode
              }
              image {
                url
              }
            }
          }
        }
      }
    }
  `;

  const response = await shopifyFetch({ query, variables: { handle } });
  if (!response?.data?.product) return null;
  return transformShopifyProduct(response.data.product);
}

/**
 * Utility: Convert a Shopify Product Node to match NexaSolve's custom frontend properties
 */
function transformShopifyProduct(node) {
  const defaultVariant = node.variants.edges[0]?.node;
  const price = defaultVariant ? parseFloat(defaultVariant.price.amount) : 0;
  const compareAtPrice = defaultVariant?.compareAtPrice ? parseFloat(defaultVariant.compareAtPrice.amount) : null;
  
  // Create images array
  const images = node.images.edges.map(img => img.node.url);
  if (images.length === 0 && node.featuredImage) {
    images.push(node.featuredImage.url);
  }

  return {
    id: node.id, // Shopify ID (gid://...)
    shopifyVariantId: defaultVariant?.id,
    title: node.title,
    slug: node.handle,
    price: price, // Raw number for React calculations
    originalPrice: compareAtPrice,
    currency: defaultVariant?.price.currencyCode || 'INR',
    description: node.description,
    descriptionHtml: node.descriptionHtml,
    image: node.featuredImage?.url || '',
    images: images,
    availableForSale: defaultVariant?.availableForSale || false,
    vendor: node.vendor,
    // Add these so existing premium UI continues to function cleanly:
    categoryLabel: 'Shopify Collection',
    rating: 4.8, // Static or derived if metaobjects exist
    reviews: 124, 
    badge: null,
    isShopifyProduct: true
  };
}

/**
 * Create a new Shopify Cart
 */
export async function createShopifyCart(lines = []) {
  const mutation = `
    mutation cartCreate($input: CartInput) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price {
                      amount
                    }
                    product {
                      title
                      handle
                    }
                  }
                }
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = { input: { lines } };
  const response = await shopifyFetch({ query: mutation, variables });
  return response?.data?.cartCreate;
}

/**
 * Add items to an existing Shopify Cart
 */
export async function addLinesToShopifyCart(cartId, lines = []) {
  const mutation = `
    mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id
          checkoutUrl
          lines(first: 100) {
            edges {
              node {
                id
                quantity
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = { cartId, lines };
  const response = await shopifyFetch({ query: mutation, variables });
  return response?.data?.cartLinesAdd;
}
