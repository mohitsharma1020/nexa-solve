/**
 * Email Service — Web3Forms Integration
 *
 * Uses Web3Forms (https://web3forms.com) to send emails without any backend.
 * Web3Forms is a free, serverless email API that works from the browser.
 *
 * Setup (one-time, free):
 *   1. Go to https://web3forms.com
 *   2. Enter mohitsharma123100@gmail.com
 *   3. Click "Create Access Key" — you'll receive it in your email
 *   4. Set NEXT_PUBLIC_WEB3FORMS_KEY in your .env.local file:
 *      NEXT_PUBLIC_WEB3FORMS_KEY=your_actual_key_here
 *
 * The email will be delivered to mohitsharma123100@gmail.com for every order.
 */

const ADMIN_EMAIL = 'mohitsharma123100@gmail.com';
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

function buildOrderEmailHTML(order) {
  const itemsList = (order.items || [])
    .map(item => `• ${item.quantity}x ${item.title} — ₹${(item.price * item.quantity).toLocaleString('en-IN')}`)
    .join('\n');

  const bonusLine = order.cartBonusApplied
    ? `10-Min Cart Bonus: -₹${order.cartBonusAmount || 40}`
    : '';

  return `
🛍️ NEW ORDER RECEIVED — NexaSolve Store
=========================================

Order ID  : ${order.orderId}
Date      : ${new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
Status    : ${order.orderStatus || 'Processing'}

─────────────────────────────────────────
CUSTOMER DETAILS
─────────────────────────────────────────
Name    : ${order.customerName}
Email   : ${order.email}
Phone   : ${order.phone || 'Not provided'}

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
Promo Discount    : -₹${(order.promoDiscount || 0).toLocaleString('en-IN')}${order.promoCode ? ` (${order.promoCode})` : ''}
Polar Credits     : -₹${(order.polarCreditsUsed || 0).toLocaleString('en-IN')}
${bonusLine}
Shipping          : ₹${(order.shippingCharge || 0).toLocaleString('en-IN')}
Shipping Discount : -₹${(order.shippingDiscount || 0).toLocaleString('en-IN')}
─────────────────────────────────────────
TOTAL PAID        : ₹${(order.finalAmount || 0).toLocaleString('en-IN')}
Payment Method    : ${order.paymentMethod || 'N/A'}
─────────────────────────────────────────

Manage this order: https://nexa-solve-store-9901.web.app/admin

— NexaSolve Order Management
  `.trim();
}

export const emailService = {
  async sendOrderNotification(order) {
    try {
      const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
      const emailBody = buildOrderEmailHTML(order);

      // ── Log to console always (useful for dev / admin browser console) ──
      console.group(`📦 NexaSolve Order Notification — ${order.orderId}`);
      console.log(emailBody);
      console.groupEnd();

      // ── Send via Web3Forms if key is configured ───────────────────────
      if (accessKey && accessKey !== 'YOUR_WEB3FORMS_KEY') {
        const res = await fetch(WEB3FORMS_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            access_key: accessKey,
            subject: `🛍️ New Order ${order.orderId} — ₹${(order.finalAmount || 0).toLocaleString('en-IN')} — ${order.customerName}`,
            from_name: 'NexaSolve Store',
            email: ADMIN_EMAIL,     // reply-to
            message: emailBody,
            // Honeypot for spam prevention
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
      } else {
        // Key not set — show setup instructions in console
        console.warn(
          `⚠️ Web3Forms key not configured.\n` +
          `To receive real order emails at ${ADMIN_EMAIL}:\n` +
          `  1. Visit https://web3forms.com\n` +
          `  2. Enter your email to get a free access key\n` +
          `  3. Add NEXT_PUBLIC_WEB3FORMS_KEY=your_key to .env.local\n` +
          `  4. Rebuild and redeploy`
        );
        return true; // Fail-open so order processing continues
      }
    } catch (error) {
      // Fail silently — never block an order because of email failure
      console.error('Failed to send order notification email:', error);
      return false;
    }
  },

  /**
   * Send customer order confirmation (optional, future use)
   */
  async sendCustomerConfirmation(order) {
    // Architecture is ready for customer emails when needed
    console.log(`[Customer confirmation for ${order.email} — Order ${order.orderId}]`);
  },
};
