'use client';
import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { dbService } from '../../services/dbService';

const CartContext = createContext();

// ── Cart Bonus Constants ────────────────────────────────────────
export const CART_BONUS_AMOUNT = 40;
const CART_BONUS_DURATION_MS = 10 * 60 * 1000; // 10 minutes
const LS_BONUS_EXPIRES = 'nexa_cart_bonus_expires';

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [discountCode, setDiscountCode] = useState('');   // input field value
  const [appliedPromoCode, setAppliedPromoCode] = useState(''); // confirmed applied code
  const [promoMessage, setPromoMessage] = useState({ text: '', type: '' });
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFirstOrder, setIsFirstOrder] = useState(true);

  // Polar Credits State
  const [availableCredits, setAvailableCredits] = useState(0);
  const [polarCreditsApplied, setPolarCreditsApplied] = useState(false);
  const [polarCreditsMessage, setPolarCreditsMessage] = useState('');

  // ── Cart Bonus State ────────────────────────────────────────
  const [cartBonusExpiresAt, setCartBonusExpiresAt] = useState(null); // timestamp ms
  const [cartBonusSecondsLeft, setCartBonusSecondsLeft] = useState(0);
  const bonusIntervalRef = useRef(null);

  // Derived bonus flags (computed each render from expiresAt + seconds)
  const isCartBonusActive = cartBonusExpiresAt !== null && Date.now() < cartBonusExpiresAt;
  const hasCartBonusExpired = cartBonusExpiresAt !== null && Date.now() >= cartBonusExpiresAt;
  const actualCartBonus = isCartBonusActive ? CART_BONUS_AMOUNT : 0;

  // ── Timer tick logic ────────────────────────────────────────
  const startBonusTick = useCallback((expiresAt) => {
    if (bonusIntervalRef.current) clearInterval(bonusIntervalRef.current);

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setCartBonusSecondsLeft(remaining);
      if (remaining <= 0) {
        clearInterval(bonusIntervalRef.current);
        bonusIntervalRef.current = null;
        // Force re-render to update isCartBonusActive derived value
        setCartBonusExpiresAt(expiresAt); // same value triggers re-render
      }
    };

    tick(); // immediate first tick
    bonusIntervalRef.current = setInterval(tick, 1000);
  }, []);

  // ── Load from localStorage on mount ─────────────────────────
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('nexa_cart');
      const savedPromo = localStorage.getItem('nexa_promo');
      const savedAppliedPromo = localStorage.getItem('nexa_applied_promo');
      const savedDiscount = localStorage.getItem('nexa_discount');
      const savedFirstOrder = localStorage.getItem('nexa_first_order');
      const savedPolarCredits = localStorage.getItem('nexa_polar_applied');
      const savedBonusExpires = localStorage.getItem(LS_BONUS_EXPIRES);

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
      if (savedFirstOrder !== null) setIsFirstOrder(savedFirstOrder === 'true');
      if (savedPolarCredits === 'true') setPolarCreditsApplied(true);
      setAvailableCredits(0);

      // Restore bonus timer if it exists and hasn't expired
      if (savedBonusExpires) {
        const expiresAt = Number(savedBonusExpires);
        if (expiresAt > Date.now()) {
          setCartBonusExpiresAt(expiresAt);
          startBonusTick(expiresAt);
        } else {
          // expired — keep expiresAt so we can show "expired" state
          setCartBonusExpiresAt(expiresAt);
          setCartBonusSecondsLeft(0);
        }
      }
    } catch (e) {
      console.error('Failed to load cart state from localStorage', e);
    }
    setIsInitialized(true);
  }, [startBonusTick]);

  // ── Save core state to localStorage ─────────────────────────
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('nexa_cart', JSON.stringify(cartItems));
      localStorage.setItem('nexa_promo', discountCode);
      localStorage.setItem('nexa_applied_promo', appliedPromoCode);
      localStorage.setItem('nexa_discount', discountAmount.toString());
      localStorage.setItem('nexa_first_order', isFirstOrder.toString());
      localStorage.setItem('nexa_polar_applied', polarCreditsApplied.toString());
    }
  }, [cartItems, discountCode, appliedPromoCode, discountAmount, isFirstOrder, polarCreditsApplied, isInitialized]);

  // ── Clean up interval on unmount ─────────────────────────────
  useEffect(() => {
    return () => {
      if (bonusIntervalRef.current) clearInterval(bonusIntervalRef.current);
    };
  }, []);

  const toggleDrawer = (state) => {
    setIsDrawerOpen(state !== undefined ? state : !isDrawerOpen);
  };

  // ── Start bonus timer (internal) ─────────────────────────────
  const initCartBonus = useCallback(() => {
    const expiresAt = Date.now() + CART_BONUS_DURATION_MS;
    setCartBonusExpiresAt(expiresAt);
    localStorage.setItem(LS_BONUS_EXPIRES, expiresAt.toString());
    startBonusTick(expiresAt);
  }, [startBonusTick]);

  // ── addToCart: start timer only on FIRST item added to empty cart ──
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
      const wasEmpty = prev.length === 0;
      const existing = prev.find(item => item.id === product.id);
      const next = existing
        ? prev.map(item =>
            item.id === product.id
              ? { ...item, quantity: Math.min(10, item.quantity + quantity) }
              : item
          )
        : [...prev, { ...product, quantity }];

      // Start bonus timer only when going from empty → non-empty
      // AND no active/expired bonus already exists
      if (wasEmpty && !localStorage.getItem(LS_BONUS_EXPIRES)) {
        // defer to next tick so state is settled
        setTimeout(initCartBonus, 0);
      }
      return next;
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
    // Timer NEVER resets on quantity change
  };

  const removeItem = (id) => {
    setCartItems(prev => {
      const next = prev.filter(item => item.id !== id);
      // If cart becomes empty, clear the bonus timer
      if (next.length === 0) {
        clearCartBonus();
      }
      return next;
    });
  };

  // ── Clear bonus state (called when cart empties) ─────────────
  const clearCartBonus = () => {
    if (bonusIntervalRef.current) clearInterval(bonusIntervalRef.current);
    bonusIntervalRef.current = null;
    setCartBonusExpiresAt(null);
    setCartBonusSecondsLeft(0);
    localStorage.removeItem(LS_BONUS_EXPIRES);
  };

  const clearCart = () => {
    setCartItems([]);
    setDiscountCode('');
    setAppliedPromoCode('');
    setDiscountAmount(0);
    setPromoMessage({ text: '', type: '' });
    setPolarCreditsApplied(false);
    setPolarCreditsMessage('');
    clearCartBonus();
  };

  // ── When a NEW cart session starts after empty (addToCart above handles it)
  // If cart was emptied AND user adds item again, fresh timer starts.
  // The logic in addToCart checks localStorage key absence after clearCartBonus removes it.

  const completeOrder = async (orderData, skipLocalDb = false) => {
    try {
      let newOrder = orderData;
      
      if (!skipLocalDb) {
        const userProfile = await dbService.getOrCreateUser(
          orderData.email,
          orderData.phone,
          `${orderData.firstName} ${orderData.lastName}`.trim()
        );

        newOrder = await dbService.createOrder({
          customerId: userProfile.id,
          customerName: userProfile.name,
          email: orderData.email,
          phone: orderData.phone,
          shippingAddress: {
            address: orderData.address,
            city: orderData.city,
            state: orderData.state,
            pincode: orderData.pincode,
            country: orderData.country
          },
          items: cartItems,
          subtotal,
          promoCode: discountCode,
          promoDiscount: actualDiscount,
          polarCreditsUsed: polarCreditsUsed || 0,
          cartBonusApplied: isCartBonusActive,
          cartBonusAmount: actualCartBonus,
          cartBonusStartedAt: cartBonusExpiresAt ? cartBonusExpiresAt - CART_BONUS_DURATION_MS : null,
          cartBonusExpiresAt,
          shippingCharge,
          shippingDiscount,
          finalAmount: total,
          paymentMethod: orderData.paymentMethod,
          paymentStatus: 'Paid'
        });

        if (polarCreditsApplied && polarCreditsUsed > 0) {
          await dbService.useCredits(userProfile.id, polarCreditsUsed, newOrder.orderId);
        }
      }

      setIsFirstOrder(false);
      clearCart();
      return newOrder;
    } catch (err) {
      console.error('Failed to complete order:', err);
      throw err;
    }
  };

  // ── Derived Cart Totals with Safety Checks ───────────────────
  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];
  
  const cartCount = safeCartItems.reduce((count, item) => count + (Number(item?.quantity) || 0), 0);
  
  const subtotal = safeCartItems.reduce((sum, item) => {
    // Only calculate if item is valid and has price/quantity
    if (item && item.price && !isNaN(item.price)) {
      return sum + (Number(item.price) * (Number(item.quantity) || 0));
    }
    return sum;
  }, 0);
  const FREE_SHIPPING_THRESHOLD = 599;
  const baseShipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 99;
  const shippingCharge = baseShipping > 0 ? 99 : 0;
  const shippingDiscount = (isFirstOrder && subtotal > 0 && shippingCharge > 0) ? 99 : 0;
  const shipping = shippingCharge - shippingDiscount;

  const actualDiscount = Math.min(discountAmount, subtotal);

  let polarCreditsUsed = 0;
  if (polarCreditsApplied) {
    if (subtotal >= 999 && availableCredits > 0) {
      const remainingTotal = subtotal + shipping - actualDiscount;
      polarCreditsUsed = Math.min(200, availableCredits, remainingTotal);
    }
  }

  // Cart bonus only applies while active, and never drives total below 0
  const isShopify = process.env.NEXT_PUBLIC_USE_SHOPIFY_CHECKOUT === 'true';
  const effectiveDiscount = isShopify ? 0 : actualDiscount;
  const effectiveBonus = isShopify ? 0 : actualCartBonus;

  const total = Math.max(
    0,
    subtotal + shipping - effectiveDiscount - polarCreditsUsed - effectiveBonus
  );

  const totalSavings = effectiveDiscount + shippingDiscount + polarCreditsUsed + effectiveBonus;
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

  const togglePolarCredits = () => {
    if (polarCreditsApplied) {
      setPolarCreditsApplied(false);
      setPolarCreditsMessage('');
    } else {
      if (availableCredits <= 0) {
        setPolarCreditsMessage('No Polar Credits available.');
        return;
      }
      if (subtotal < 999) {
        setPolarCreditsMessage('Polar Credits can be used on orders above ₹999.');
        return;
      }
      setPolarCreditsApplied(true);
      setPolarCreditsMessage('Polar Credits applied successfully.');
    }
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

        // Gather Referral Data
        const attributes = [];
        const discountCodes = [];
        
        if (typeof window !== 'undefined') {
          const refCode = localStorage.getItem('nexa_referral_code');
          if (refCode) {
            attributes.push({ key: 'referralCode', value: refCode });
            attributes.push({ key: 'referralSource', value: 'nexa_referral' });
            
            const discountCode = process.env.NEXT_PUBLIC_REFERRAL_DISCOUNT_CODE || 'ANTARCTICA';
            discountCodes.push(discountCode);
          }
        }

        const shopifyCart = await createShopifyCart(lines, attributes, discountCodes);
        if (shopifyCart && shopifyCart.cart && shopifyCart.cart.checkoutUrl) {
          console.log('[Shopify Checkout] Cart ID:', shopifyCart.cart.id);
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
      console.log('[Mock Checkout] Environment: USE_SHOPIFY_CHECKOUT=false, using Razorpay fallback');
      if (router) {
        router.push('/checkout');
      } else {
        window.location.href = '/checkout';
      }
    }
  };

  const value = {
    // Cart
    cartItems: safeCartItems,
    cartCount,
    discountCode,
    setDiscountCode,
    appliedPromoCode,
    promoMessage,
    discountAmount,
    actualDiscount,
    removePromo,
    availableCredits,
    polarCreditsApplied: polarCreditsApplied || false,
    polarCreditsMessage: polarCreditsMessage || '',
    polarCreditsUsed: polarCreditsUsed || 0,
    togglePolarCredits,
    isDrawerOpen,
    toggleDrawer,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    completeOrder,
    applyPromo,
    subtotal,
    shipping,
    shippingCharge,
    shippingDiscount,
    total,
    totalSavings,
    isFirstOrder,
    amountToFreeShipping,
    progressPercent,
    FREE_SHIPPING_THRESHOLD,
    isInitialized,
    // Cart Bonus
    isCartBonusActive,
    hasCartBonusExpired,
    cartBonusSecondsLeft,
    cartBonusExpiresAt,
    actualCartBonus,
    CART_BONUS_AMOUNT,
    processCheckout,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
