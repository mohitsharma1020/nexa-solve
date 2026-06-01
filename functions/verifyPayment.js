const { HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const crypto = require("crypto");
const { sendOrderNotification } = require("./emailHelper");

exports.handler = async (request) => {
  const data = request.data;
  const { internalOrderId, razorpay_payment_id, razorpay_order_id, razorpay_signature, mockMode } = data;

  if (!internalOrderId) {
    throw new HttpsError("invalid-argument", "Missing internal order ID.");
  }

  const db = admin.firestore();
  const orderRef = db.collection("orders").doc(internalOrderId);
  
  // Transaction to ensure we don't process payment twice
  return await db.runTransaction(async (transaction) => {
    const orderDoc = await transaction.get(orderRef);
    if (!orderDoc.exists) {
      throw new HttpsError("not-found", "Order not found.");
    }
    
    const orderData = orderDoc.data();
    if (orderData.paymentStatus === "paid") {
      return { success: true, message: "Order is already marked as paid." };
    }

    const isMockServerMode = process.env.MOCK_PAYMENT_MODE === "true";
    let isValid = false;

    if (mockMode || isMockServerMode) {
      // MOCK VERIFICATION
      if (razorpay_signature === "mock_success_signature") {
        isValid = true;
      } else {
        isValid = false;
      }
    } else {
      // REAL RAZORPAY VERIFICATION
      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        throw new HttpsError("invalid-argument", "Missing Razorpay payment parameters.");
      }
      
      const secret = process.env.RAZORPAY_KEY_SECRET;
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(body.toString())
        .digest("hex");
        
      isValid = (expectedSignature === razorpay_signature);
    }

    // Record Event
    const eventRef = db.collection("paymentEvents").doc();
    const eventDoc = {
      eventId: eventRef.id,
      orderId: internalOrderId,
      razorpayOrderId: razorpay_order_id || orderData.razorpayOrderId,
      razorpayPaymentId: razorpay_payment_id || "N/A",
      eventType: "checkout_callback",
      source: (mockMode || isMockServerMode) ? "mock" : "checkout",
      status: isValid ? "success" : "failed",
      verified: isValid,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    transaction.set(eventRef, eventDoc);

    if (isValid) {
      // Update Order
      const updateData = {
        paymentStatus: "paid",
        internalOrderStatus: "confirmed",
        razorpayPaymentId: razorpay_payment_id || "mock_payment_" + Date.now(),
        razorpaySignatureVerified: true,
        paidAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      transaction.update(orderRef, updateData);

      // Deduct Polar Credits
      if (orderData.polarCreditsUsed > 0 && orderData.customerId) {
        const customerRef = db.collection("customers").doc(orderData.customerId);
        transaction.update(customerRef, {
          polarCreditsBalance: admin.firestore.FieldValue.increment(-orderData.polarCreditsUsed)
        });
      }
      
      // Update user orders array
      if (orderData.customerId) {
         const customerRef = db.collection("customers").doc(orderData.customerId);
         transaction.update(customerRef, {
           orders: admin.firestore.FieldValue.arrayUnion(internalOrderId),
           lastOrderAt: admin.firestore.FieldValue.serverTimestamp()
         });
      }

      // Defer email to run outside transaction (done below)
      return { success: true, orderId: internalOrderId, orderData: { ...orderData, ...updateData } };
    } else {
      transaction.update(orderRef, {
        paymentStatus: "failed",
        internalOrderStatus: "payment_verification_failed",
        razorpaySignatureVerified: false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      throw new HttpsError("permission-denied", "Payment signature verification failed.");
    }
  }).then(async (result) => {
    if (result && result.success && result.orderData) {
      // Send Email asynchronously
      const web3FormsKey = process.env.WEB3FORMS_KEY || null; // Requires env setup if you want backend emails
      // I'll leave the call here in case you add WEB3FORMS_KEY to the backend env.
      await sendOrderNotification(result.orderData, web3FormsKey);
    }
    return result;
  });
};
