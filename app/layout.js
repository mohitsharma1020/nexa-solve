import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: {
    default: 'NexaSolve | Smart Products for Easier Everyday Living',
    template: '%s | NexaSolve',
  },
  description:
    'Discover trending, useful finds that solve real problems. Premium quality gadgets, home essentials, travel tools & lifestyle accessories.',
  keywords: [
    'smart gadgets',
    'home essentials',
    'travel accessories',
    'lifestyle products',
    'premium quality',
    'trending products',
    'NexaSolve',
  ],
  openGraph: {
    title: 'NexaSolve | Smart Products for Easier Everyday Living',
    description:
      'Discover trending, useful finds that solve real problems. Premium quality gadgets, home essentials, travel tools & lifestyle accessories.',
    type: 'website',
    locale: 'en_US',
    siteName: 'NexaSolve',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NexaSolve | Smart Products for Easier Everyday Living',
    description:
      'Discover trending, useful finds that solve real problems. Premium quality gadgets, home essentials, travel tools & lifestyle accessories.',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <WishlistProvider>
          <CartProvider>
            <Navbar />
            <CartDrawer />
            <main>{children}</main>
            <Footer />
          </CartProvider>
        </WishlistProvider>
      </body>
    </html>
  );
}
