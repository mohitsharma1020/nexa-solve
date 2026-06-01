const { HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const Razorpay = require("razorpay");
const { recalculateOrder } = require("./pricingHelper");

exports.handler = async (request) => {
  const data = request.data;
  
  if (!data.cartItems || data.cartItems.length === 0) {
    throw new HttpsError("invalid-argument", "Cart is empty.");
  }
  
  if (!data.customerDetails || !data.customerDetails.email) {
    throw new HttpsError("invalid-argument", "Customer email is required.");
  }

  const db = admin.firestore();
  
  // 1. Get or create customer profile
  let customerId = data.customerId;
  let availableCredits = 0;
  let isFirstOrder = true;
  let isReferred = false;

  if (customerId) {
    const customerRef = db.collection("customers").doc(customerId);
    const doc = await customerRef.get();
    if (doc.exists) {
      availableCredits = doc.data().polarCreditsBalance || 0;
      isFirstOrder = (doc.data().orders || []).length === 0;
      isReferred = !!doc.data().referredBy;
    }
  } else {
    // Look up by email
    const usersSnap = await db.collection("customers").where("email", "==", data.customerDetails.email).limit(1).get();
    if (!usersSnap.empty) {
      const doc = usersSnap.docs[0];
      customerId = doc.id;
      availableCredits = doc.data().polarCreditsBalance || 0;
      isFirstOrder = (doc.data().orders || []).length === 0;
      isReferred = !!doc.data().referredBy;
    } else {
      // Create new
      const newCustomerRef = db.collection("customers").doc();
      customerId = newCustomerRef.id;
      // Note: we can't capture referredBy from localStorage in backend directly,
      // it must be passed from frontend via data.referredBy
      isReferred = !!data.referredBy;
      
      await newCustomerRef.set({
        customerId,
        name: `${data.customerDetails.firstName} ${data.customerDetails.lastName}`.trim(),
        email: data.customerDetails.email,
        mobile: data.customerDetails.phone,
        referredBy: data.referredBy || null,
        orders: [],
        polarCreditsBalance: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  }

  // 2. Recalculate Totals
  let calculated;
  try {
    calculated = recalculateOrder(
      data.cartItems,
      data.discountCode,
      data.isCartBonusActive,
      isFirstOrder,
      data.polarCreditsApplied,
      availableCredits,
      isReferred
    );
  } catch (err) {
    throw new HttpsError("invalid-argument", err.message);
  }

  // 3. Create Pending Order in Firestore
  const internalOrderId = 'ORD-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
  
  const orderDoc = {
    orderId: internalOrderId,
    customerId,
    customerName: `${data.customerDetails.firstName} ${data.customerDetails.lastName}`.trim(),
    email: data.customerDetails.email,
    mobile: data.customerDetails.phone,
    shippingAddress: {
      address: data.customerDetails.address,
      city: data.customerDetails.city,
      state: data.customerDetails.state,
      pincode: data.customerDetails.pincode,
      country: data.customerDetails.country
    },
    items: calculated.safeItems,
    subtotal: calculated.subtotal,
    promoCode: data.discountCode || null,
    promoDiscount: calculated.promoDiscount,
    cartBonusDiscount: calculated.cartBonusAmount,
    polarCreditsUsed: calculated.polarCreditsUsed,
    shippingCharge: calculated.shippingCharge,
    shippingDiscount: calculated.shippingDiscount,
    finalAmount: calculated.finalAmount,
    currency: "INR",
    paymentProvider: "razorpay",
    internalOrderStatus: "pending_payment",
    paymentStatus: "pending",
    razorpayOrderId: null,
    razorpaySignatureVerified: false,
    firstOrderShippingApplied: isFirstOrder && calculated.shippingDiscount > 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  const orderRef = db.collection("orders").doc(internalOrderId);
  
  // 4. Create Razorpay Order or use Mock Mode
  const isMockMode = process.env.MOCK_PAYMENT_MODE === "true";
  let rzpOrderId = null;

  if (isMockMode || !process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET === "placeholder_secret") {
    // MOCK MODE
    rzpOrderId = "mock_order_" + Date.now();
    orderDoc.razorpayOrderId = rzpOrderId;
    await orderRef.set(orderDoc);
  } else {
    // REAL MODE
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    
    // Amount must be in paise (₹1 = 100 paise)
    const amountInPaise = Math.round(calculated.finalAmount * 100);
    
    try {
      const options = {
        amount: amountInPaise,
        currency: "INR",
        receipt: internalOrderId,
      };
      const rzpOrder = await instance.orders.create(options);
      rzpOrderId = rzpOrder.id;
      orderDoc.razorpayOrderId = rzpOrderId;
      await orderRef.set(orderDoc);
    } catch (error) {
      console.error("Razorpay Error:", error);
      throw new HttpsError("internal", "Failed to create payment order with provider.");
    }
  }

  // 5. Return safely to frontend
  return {
    internalOrderId,
    razorpayOrderId: rzpOrderId,
    amount: calculated.finalAmount,
    currency: "INR",
    keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
    mockMode: isMockMode
  };
};
