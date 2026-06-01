import * as admin from 'firebase-admin';

let adminDb = null;
let adminAuth = null;

if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Handle newlines correctly from environment variables
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      console.log('Firebase Admin Initialized successfully.');
    } catch (error) {
      console.error('Firebase Admin Initialization Error:', error.message);
    }
  }
  
  if (admin.apps.length > 0) {
    adminDb = admin.firestore();
    adminAuth = admin.auth();
  }
} else {
  console.warn('Firebase Admin is not initialized. Missing environment variables.');
}

export { adminDb, adminAuth };
