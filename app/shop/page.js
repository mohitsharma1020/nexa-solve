import { affiliateProducts } from '../data/affiliateProducts';
import { getShopifyProducts } from '../../services/shopifyClient';
import ShopClient from './ShopClient';

export default async function ShopPage() {
  const shopifyProducts = await getShopifyProducts(100);
  
  const mappedAffiliates = affiliateProducts.map(p => ({
    id: p.id,
    title: p.productName || p.title,
    slug: p.id,
    price: null,
    priceDisplay: p.priceDisplay || 'Check on Amazon',
    originalPrice: null,
    rating: p.ratingDisplay || 4.5,
    reviews: 120,
    category: 'affiliate',
    categoryLabel: p.category || 'Recommended',
    image: p.image,
    images: [p.image],
    badge: p.badge || 'Amazon Pick',
    shortDescription: p.shortName || p.description,
    description: p.description,
    affiliateLink: p.affiliateLink || p.amazonLink,
    isAffiliate: true,
  }));

  const allProducts = [...shopifyProducts, ...mappedAffiliates];

  return <ShopClient products={allProducts} />;
}
