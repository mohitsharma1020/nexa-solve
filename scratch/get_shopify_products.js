const token = 'd4d669238b3d526997a922344c926a4b';
const domain = 'bcz5qp-zj.myshopify.com';
const endpoint = `https://${domain}/api/2024-04/graphql.json`;

const query = `
{
  products(first: 10) {
    edges {
      node {
        id
        title
        handle
        availableForSale
        variants(first: 5) {
          edges {
            node {
              id
              availableForSale
              price {
                amount
              }
              compareAtPrice {
                amount
              }
            }
          }
        }
      }
    }
  }
}
`;

fetch(endpoint, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': token,
  },
  body: JSON.stringify({ query })
})
.then(res => res.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(console.error);
