const products = [
  { id: 1, price: 6499, category: 'smart-gadgets' },
  { id: 2, price: 11999, category: 'smart-gadgets' },
  { id: 3, price: 15999, category: 'smart-gadgets' },
  { id: 4, price: 7499, category: 'lifestyle' },
  { id: 5, price: 5299, category: 'lifestyle' },
  { id: 6, price: 2999, category: 'lifestyle' },
  { id: 7, price: 4999, category: 'lifestyle' },
  { id: 8, price: 100, category: 'affiliate' }, // Amazon Affiliate - should be blocked
  { id: 101, price: 2499, category: 'polar-heritage' },
  { id: 102, price: 3499, category: 'polar-heritage' },
  { id: 103, price: 2999, category: 'polar-heritage' },
  { id: 104, price: 1999, category: 'polar-heritage' }
];

const PROMO_CODE = "ANTARCTICA";
const PROMO_DISCOUNT = 250; // The actual logic gives 250 in CartContext
const CART_BONUS_AMOUNT = 40;
const FREE_SHIPPING_THRESHOLD = 599;
const SHIPPING_CHARGE = 99;

exports.recalculateOrder = (cartItems, discountCode, isCartBonusActive, isFirstOrder, polarCreditsApplied, availableCredits, isReferred = false) => {
  let subtotal = 0;
  const safeItems = [];

  for (const item of cartItems) {
    if (!item || !item.id) continue;
    
    const product = products.find(p => p.id === item.id);
    if (!product) {
      throw new Error(`Product ID ${item.id} not found.`);
    }
    
    // Reject affiliate products
    if (product.category === 'affiliate' || item.affiliateLink) {
      throw new Error(`Affiliate products cannot be purchased through the checkout.`);
    }

    const qty = Number(item.quantity) || 1;
    subtotal += product.price * qty;
    
    safeItems.push({
      ...item,
      price: product.price,
      quantity: qty
    });
  }

  // Shipping
  const baseShipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE;
  let shippingDiscount = 0;
  if (isFirstOrder && subtotal > 0 && baseShipping > 0) {
    shippingDiscount = SHIPPING_CHARGE;
  }
  const shipping = baseShipping - shippingDiscount;

  // Promo
  let actualDiscount = 0;
  if (discountCode && discountCode.trim().toUpperCase() === PROMO_CODE) {
    actualDiscount = Math.min(PROMO_DISCOUNT, subtotal);
  } else if (isReferred && isFirstOrder) {
    // Automatic ₹200 off for referred users on their first order
    actualDiscount = Math.min(200, subtotal);
  }

  // Cart Bonus
  let actualCartBonus = 0;
  if (isCartBonusActive) {
    actualCartBonus = CART_BONUS_AMOUNT;
  }

  // Polar Credits
  let polarCreditsUsed = 0;
  if (polarCreditsApplied) {
    if (subtotal >= 999 && availableCredits > 0) {
      const remainingTotal = subtotal + shipping - actualDiscount;
      polarCreditsUsed = Math.min(200, availableCredits, remainingTotal);
    }
  }

  const finalAmount = Math.max(
    0,
    subtotal + shipping - actualDiscount - polarCreditsUsed - actualCartBonus
  );

  return {
    safeItems,
    subtotal,
    shippingCharge: baseShipping,
    shippingDiscount,
    promoDiscount: actualDiscount,
    cartBonusAmount: actualCartBonus,
    polarCreditsUsed: polarCreditsUsed,
    finalAmount,
    currency: "INR"
  };
};
