import { products } from '../../data/products';

export function generateStaticParams() {
  return products.map((product) => ({
    id: product.slug,
  }));
}

export default function ProductLayout({ children }) {
  return <>{children}</>;
}
