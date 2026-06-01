const fetch = require("node-fetch"); // node-fetch not required in Node 18+, but we can use native fetch since Firebase runs on Node 20.

const ADMIN_EMAIL = 'mohitsharma123100@gmail.com';
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

exports.sendOrderNotification = async (order, accessKey) => {
  if (!accessKey || accessKey === 'YOUR_WEB3FORMS_KEY') {
    console.log("No Web3Forms access key configured. Email will not be sent.");
    return false;
  }

  const itemsList = (order.items || [])
    .map(item => `• ${item.quantity}x ${item.title || item.name} — ₹${((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}`)
    .join('\n');

  const bonusLine = order.cartBonusDiscount > 0
    ? `10-Min Cart Bonus: -₹${order.cartBonusDiscount}`
    : '';

  const emailBody = `
🛍️ PAID ORDER RECEIVED — NexaSolve Store
=========================================

Order ID  : ${order.orderId}
Razorpay  : ${order.razorpayOrderId || 'N/A'} (Payment ID: ${order.razorpayPaymentId || 'N/A'})
Status    : ${order.paymentStatus || 'paid'}

─────────────────────────────────────────
CUSTOMER DETAILS
─────────────────────────────────────────
Name    : ${order.customerName}
Email   : ${order.email}
Phone   : ${order.mobile || 'Not provided'}

─────────────────────────────────────────
SHIPPING ADDRESS
─────────────────────────────────────────
${order.shippingAddress?.address || ''}
${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} — ${order.shippingAddress?.pincode || ''}
${order.shippingAddress?.country || 'India'}

─────────────────────────────────────────
ORDER ITEMS
─────────────────────────────────────────
${itemsList}

─────────────────────────────────────────
PAYMENT BREAKDOWN
─────────────────────────────────────────
Subtotal          : ₹${(order.subtotal || 0).toLocaleString('en-IN')}
Promo Discount    : -₹${(order.promoDiscount || 0).toLocaleString('en-IN')}
Polar Credits     : -₹${(order.polarCreditsUsed || 0).toLocaleString('en-IN')}
${bonusLine}
Shipping          : ₹${(order.shippingCharge || 0).toLocaleString('en-IN')}
Shipping Discount : -₹${(order.shippingDiscount || 0).toLocaleString('en-IN')}
─────────────────────────────────────────
TOTAL PAID        : ₹${(order.finalAmount || 0).toLocaleString('en-IN')}
Payment Method    : ${order.paymentProvider || 'N/A'}
─────────────────────────────────────────

Manage this order: https://nexa-solve-store-9901.web.app/admin

— NexaSolve Order Management
  `.trim();

  try {
    const res = await fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        access_key: accessKey,
        subject: `🛍️ New Paid Order ${order.orderId} — ₹${(order.finalAmount || 0).toLocaleString('en-IN')} — ${order.customerName}`,
        from_name: 'NexaSolve Backend',
        email: ADMIN_EMAIL,     // reply-to
        message: emailBody,
        botcheck: '',
      }),
    });

    const data = await res.json();
    if (data.success) {
      console.log(`✅ Admin email sent to ${ADMIN_EMAIL}`);
    } else {
      console.warn('⚠️ Web3Forms returned non-success:', data);
    }
    return data.success;
  } catch (err) {
    console.error('Failed to send order notification email:', err);
    return false;
  }
};
