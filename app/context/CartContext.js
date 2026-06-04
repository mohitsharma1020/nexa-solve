'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedPromoCode, setAppliedPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState({ text: '', type: '' });
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // ── Load from localStorage on mount ─────────────────────────
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('nexa_cart');
      const savedPromo = localStorage.getItem('nexa_promo');
      const savedAppliedPromo = localStorage.getItem('nexa_applied_promo');
      const savedDiscount = localStorage.getItem('nexa_discount');

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        const safeCart = Array.isArray(parsedCart) ? parsedCart : [];
        const validCart = safeCart.filter(item => !!item.shopifyVariantId);
        
        if (validCart.length < safeCart.length) {
          console.warn('CartContext: Purged legacy/mock items without shopifyVariantId');
          setTimeout(() => {
            alert('Some unavailable products were removed from your cart.');
          }, 500);
        }
        setCartItems(validCart);
      }
      if (savedPromo) setDiscountCode(savedPromo);
      if (savedAppliedPromo) setAppliedPromoCode(savedAppliedPromo);
      if (savedDiscount) setDiscountAmount(Number(savedDiscount) || 0);
    } catch (e) {
      console.error('Failed to load cart state from localStorage', e);
    }
    setIsInitialized(true);
  }, []);

  // ── Save core state to localStorage ─────────────────────────
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('nexa_cart', JSON.stringify(cartItems));
      localStorage.setItem('nexa_promo', discountCode);
      localStorage.setItem('nexa_applied_promo', appliedPromoCode);
      localStorage.setItem('nexa_discount', discountAmount.toString());
    }
  }, [cartItems, discountCode, appliedPromoCode, discountAmount, isInitialized]);

  const toggleDrawer = (state) => {
    setIsDrawerOpen(state !== undefined ? state : !isDrawerOpen);
  };

  const addToCart = (product, quantity = 1) => {
    if (product.isAffiliate || product.affiliateLink) {
      alert("This is an Amazon affiliate product and must be purchased on Amazon.");
      return;
    }
    if (!product.shopifyVariantId) {
      alert("This product is not available for checkout yet.");
      return;
    }

    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      return existing
        ? prev.map(item =>
            item.id === product.id
              ? { ...item, quantity: Math.min(10, item.quantity + quantity) }
              : item
          )
        : [...prev, { ...product, quantity }];
    });
    setIsDrawerOpen(true);
  };

  const updateQuantity = (id, delta) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, Math.min(10, item.quantity + delta)) }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
    setDiscountCode('');
    setAppliedPromoCode('');
    setDiscountAmount(0);
    setPromoMessage({ text: '', type: '' });
  };

  // ── Derived Cart Totals with Safety Checks ───────────────────
  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];
  
  const cartCount = safeCartItems.reduce((count, item) => count + (Number(item?.quantity) || 0), 0);
  
  const subtotal = safeCartItems.reduce((sum, item) => {
    if (item && item.price && !isNaN(item.price)) {
      return sum + (Number(item.price) * (Number(item.quantity) || 0));
    }
    return sum;
  }, 0);
  
  const FREE_SHIPPING_THRESHOLD = 599;
  const baseShipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 99;
  const shippingCharge = baseShipping > 0 ? 99 : 0;
  const shipping = shippingCharge;

  const actualDiscount = Math.min(discountAmount, subtotal);

  // When using Shopify checkout, discounts are handled on Shopify's side.
  // We don't apply them locally to the 'total' so they don't double count.
  const isShopify = process.env.NEXT_PUBLIC_USE_SHOPIFY_CHECKOUT === 'true';
  const effectiveDiscount = isShopify ? 0 : actualDiscount;

  const total = Math.max(0, subtotal + shipping - effectiveDiscount);
  const totalSavings = effectiveDiscount;
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPercent = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const applyPromo = (code) => {
    const trimmed = (code || discountCode).trim().toUpperCase();
    setDiscountCode(trimmed);

    if (trimmed === 'ANTARCTICA') {
      if (appliedPromoCode === 'ANTARCTICA') {
        setPromoMessage({ text: 'Promo code already applied.', type: 'error' });
      } else {
        setDiscountAmount(250);
        setAppliedPromoCode('ANTARCTICA');
        setPromoMessage({ text: 'Promo code applied. You saved ₹250.', type: 'success' });
      }
    } else if (trimmed === '') {
      setDiscountAmount(0);
      setAppliedPromoCode('');
      setPromoMessage({ text: '', type: '' });
    } else {
      setPromoMessage({ text: 'Invalid promo code.', type: 'error' });
      setDiscountAmount(0);
      setAppliedPromoCode('');
    }
  };

  const removePromo = () => {
    setDiscountCode('');
    setAppliedPromoCode('');
    setDiscountAmount(0);
    setPromoMessage({ text: '', type: '' });
  };

  // Re-validate promo when cart empties
  useEffect(() => {
    if (subtotal === 0 && discountAmount > 0) {
      setDiscountAmount(0);
      setAppliedPromoCode('');
      setPromoMessage({ text: '', type: '' });
      setDiscountCode('');
    }
  }, [subtotal, discountAmount]);

  const processCheckout = async (router) => {
    if (process.env.NEXT_PUBLIC_USE_SHOPIFY_CHECKOUT === 'true') {
      try {
        console.log('[Shopify Checkout] Environment: USE_SHOPIFY_CHECKOUT=true');
        const { createShopifyCart } = await import('../../services/shopifyClient');

        const lines = safeCartItems.map(item => ({
          merchandiseId: item.shopifyVariantId,
          quantity: item.quantity
        })).filter(l => l.merchandiseId);

        if (lines.length === 0) {
          alert('No valid Shopify products in cart.');
          return;
        }

        if (lines.length < safeCartItems.length) {
          alert('Some items are not available for Shopify checkout. Please remove them.');
          return;
        }

        const attributes = [];
        const discountCodes = [];
        
        // Pass any applied discount code to Shopify
        if (appliedPromoCode) {
          discountCodes.push(appliedPromoCode);
        }

        const shopifyCart = await createShopifyCart(lines, attributes, discountCodes);
        if (shopifyCart && shopifyCart.cart && shopifyCart.cart.checkoutUrl) {
          console.log('[Shopify Checkout] Redirecting to URL:', shopifyCart.cart.checkoutUrl);
          window.location.href = shopifyCart.cart.checkoutUrl;
        } else {
          alert('Shopify checkout is not ready. Please try again.');
        }
      } catch (err) {
        console.error('[Shopify Checkout Error]', err);
        alert('Shopify checkout is not ready. Please try again.');
      }
    } else {
      // Fallback
      if (router) {
        router.push('/checkout');
      } else {
        window.location.href = '/checkout';
      }
    }
  };

  const value = {
    cartItems: safeCartItems,
    cartCount,
    discountCode,
    setDiscountCode,
    appliedPromoCode,
    promoMessage,
    discountAmount,
    actualDiscount,
    removePromo,
    isDrawerOpen,
    toggleDrawer,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    applyPromo,
    subtotal,
    shipping,
    shippingCharge,
    total,
    totalSavings,
    amountToFreeShipping,
    progressPercent,
    FREE_SHIPPING_THRESHOLD,
    isInitialized,
    processCheckout,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
