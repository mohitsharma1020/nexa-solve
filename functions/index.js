/**
 * NexaSolve Cloud Functions
 * Entry point for backend logic.
 */

const { onRequest, onCall } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");

// Set safe cost-controlled defaults
setGlobalOptions({ 
  region: "asia-south1", // Mumbai region for faster response in India
  memory: "256MiB",      // Minimal memory for simple order logic
  timeoutSeconds: 30,    // Hard limit to prevent hanging functions
  maxInstances: 5        // Prevent infinite scaling spikes
});

admin.initializeApp();

const createOrder = require("./createOrder");
const verifyPayment = require("./verifyPayment");
const razorpayWebhook = require("./razorpayWebhook");

// Export callable functions
exports.createOrder = onCall(createOrder.handler);
exports.verifyPayment = onCall(verifyPayment.handler);

// Export webhook endpoint
exports.razorpayWebhook = onRequest(razorpayWebhook.handler);
