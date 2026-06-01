const crypto = require("crypto");
const admin = require("firebase-admin");

exports.handler = async (req, res) => {
  // We only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  
  if (!webhookSecret || webhookSecret === "placeholder_webhook_secret") {
    console.warn("Webhook secret not configured. Ignoring webhook.");
    return res.status(200).send("Webhook secret not configured. Ignored.");
  }

  const signature = req.headers['x-razorpay-signature'];
  if (!signature) {
    return res.status(400).send('Missing signature');
  }

  try {
    const bodyString = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(bodyString)
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).send('Invalid signature');
    }

    const payload = req.body;
    const db = admin.firestore();

    // The webhook payload can contain order.paid or payment.captured
    // Example: payload.event === "order.paid"
    const razorpayOrderId = payload.payload?.payment?.entity?.order_id 
                         || payload.payload?.order?.entity?.id;

    if (razorpayOrderId) {
      // Find the corresponding order in Firestore
      const ordersSnap = await db.collection("orders").where("razorpayOrderId", "==", razorpayOrderId).limit(1).get();
      
      if (!ordersSnap.empty) {
        const orderDoc = ordersSnap.docs[0];
        const orderData = orderDoc.data();
        const internalOrderId = orderData.orderId;

        // Record the webhook event securely
        const eventRef = db.collection("paymentEvents").doc();
        await eventRef.set({
          eventId: eventRef.id,
          orderId: internalOrderId,
          razorpayOrderId,
          eventType: payload.event,
          source: "webhook",
          rawPayload: payload,
          verified: true,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Update order status if not already paid
        if (orderData.paymentStatus !== "paid" && (payload.event === "order.paid" || payload.event === "payment.captured")) {
          // This is a backup mechanism. Usually `verifyPayment` handles this.
          await orderDoc.ref.update({
             paymentStatus: "paid",
             internalOrderStatus: "confirmed",
             razorpaySignatureVerified: true,
             webhookVerified: true,
             paidAt: admin.firestore.FieldValue.serverTimestamp(),
             updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });

          // Here you could also send admin email if it wasn't sent yet
        }
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).send('Internal Server Error');
  }
};
