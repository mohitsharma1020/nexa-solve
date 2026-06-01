/**
 * Polar Credits & Referral System Service Layer
 * 
 * This service currently uses localStorage to mock a backend database.
 * When expanding to Firebase/Supabase, you ONLY need to replace the logic inside
 * these functions with actual database calls. The rest of the app will remain unchanged.
 */

// --- MOCK DATABASE UTILS ---
const delay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms));

const getDB = () => {
  if (typeof window === 'undefined') return { users: [], ledger: [] };
  const db = localStorage.getItem('nexa_db');
  if (!db) {
    // Initialize mock database
    const initialDB = {
      users: [
        {
          id: 'usr_me',
          name: 'Current User',
          referralCode: 'POLAR-MOHIT99',
          referredBy: null, // Who referred this user
        },
        {
          id: 'usr_friend',
          name: 'Friend User',
          referralCode: 'POLAR-FRIEND12',
          referredBy: 'POLAR-MOHIT99',
        }
      ],
      ledger: [
        {
          transactionId: 'txn_1001',
          userId: 'usr_me',
          type: 'referral_reward',
          amount: 200,
          status: 'active',
          sourceOrderId: 'ord_9988',
          referredUserId: 'usr_friend',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
          activatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 88 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Referral reward for Friend User'
        }
      ]
    };
    localStorage.setItem('nexa_db', JSON.stringify(initialDB));
    return initialDB;
  }
  return JSON.parse(db);
};

const saveDB = (db) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('nexa_db', JSON.stringify(db));
  }
};

// --- SERVICE EXPORTS ---

export const referralService = {
  
  // 1. Get User Profile with calculated credits
  async getUserProfile(userId = 'usr_me') {
    await delay();
    const db = getDB();
    const user = db.users.find(u => u.id === userId);
    
    if (!user) throw new Error("User not found");

    // Calculate credits from ledger
    const userLedger = db.ledger.filter(l => l.userId === userId);
    
    const totalEarned = userLedger
      .filter(l => l.type === 'referral_reward' && (l.status === 'active' || l.status === 'used'))
      .reduce((sum, l) => sum + l.amount, 0);
      
    const pendingCredits = userLedger
      .filter(l => l.type === 'referral_reward' && l.status === 'pending')
      .reduce((sum, l) => sum + l.amount, 0);
      
    const usedCredits = userLedger
      .filter(l => l.type === 'credit_used' && l.status === 'active')
      .reduce((sum, l) => sum + l.amount, 0);
      
    const activeEarned = userLedger
      .filter(l => l.type === 'referral_reward' && l.status === 'active')
      .reduce((sum, l) => sum + l.amount, 0);

    const availableCredits = Math.max(0, activeEarned - usedCredits);

    return {
      ...user,
      totalEarned,
      pendingCredits,
      usedCredits,
      availableCredits
    };
  },

  // 2. Get User's Ledger History
  async getUserLedger(userId = 'usr_me') {
    await delay();
    const db = getDB();
    return db.ledger
      .filter(l => l.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  // 3. Track a visitor's referral click (Saves to cookie/localstorage)
  async captureReferralCode(code) {
    if (typeof window === 'undefined') return;
    if (!code) return;
    
    const db = getDB();
    const isOwnCode = db.users.find(u => u.id === 'usr_me')?.referralCode === code;
    
    if (isOwnCode) {
      console.warn("Anti-Fraud: Cannot use your own referral code.");
      return;
    }
    
    // Store in localStorage (In production, use cookies to persist across subdomains)
    localStorage.setItem('nexa_captured_ref', code.toUpperCase());
  },

  // 4. Create Pending Reward upon successful order
  async processOrderCheckout(userId = 'usr_me', orderId, subtotal) {
    await delay();
    const db = getDB();
    
    // In a real app, we check if this is their first order in the Orders table.
    // For this mock, we assume it is, and check if they were referred.
    const capturedRef = localStorage.getItem('nexa_captured_ref');
    
    if (capturedRef) {
      // Find who owns this code
      const referrer = db.users.find(u => u.referralCode === capturedRef);
      
      if (referrer) {
        // Anti-Fraud: Ensure no existing reward for this referred user exists
        const existingReward = db.ledger.find(
          l => l.type === 'referral_reward' && l.referredUserId === userId
        );

        if (!existingReward) {
          // Create pending reward for the referrer
          const newTxn = {
            transactionId: 'txn_' + Date.now(),
            userId: referrer.id,
            type: 'referral_reward',
            amount: 200,
            status: 'pending', // Must wait for delivery/return window
            sourceOrderId: orderId,
            referredUserId: userId,
            createdAt: new Date().toISOString(),
            activatedAt: null,
            expiresAt: null,
            notes: `Referral reward for new customer order ${orderId}`
          };
          db.ledger.push(newTxn);
          saveDB(db);
        }
      }
      
      // Clear the captured ref so it's not reused
      localStorage.removeItem('nexa_captured_ref');
    }
  },

  // 5. Use Credits in an Order
  async useCredits(userId = 'usr_me', amount, orderId) {
    await delay();
    if (amount <= 0) return;
    if (amount > 200) throw new Error("Maximum ₹200 credits can be used per order.");
    
    const profile = await this.getUserProfile(userId);
    if (profile.availableCredits < amount) {
      throw new Error("Insufficient Polar Credits.");
    }

    const db = getDB();
    const newTxn = {
      transactionId: 'txn_' + Date.now(),
      userId: userId,
      type: 'credit_used',
      amount: amount, // Positive number representing the deduction
      status: 'active',
      sourceOrderId: orderId,
      referredUserId: null,
      createdAt: new Date().toISOString(),
      notes: `Credits redeemed on order ${orderId}`
    };
    
    db.ledger.push(newTxn);
    saveDB(db);
  },

  // --- ADMIN FUNCTIONS ---
  
  async getAllLedgerEntries() {
    await delay();
    return getDB().ledger.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async updateLedgerStatus(transactionId, newStatus) {
    await delay();
    const db = getDB();
    const txnIndex = db.ledger.findIndex(l => l.transactionId === transactionId);
    
    if (txnIndex >= 0) {
      const txn = db.ledger[txnIndex];
      txn.status = newStatus;
      
      if (newStatus === 'active' && !txn.activatedAt) {
        txn.activatedAt = new Date().toISOString();
        // Expires 90 days from activation
        txn.expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
      }
      
      saveDB(db);
      return txn;
    }
    throw new Error("Transaction not found");
  }
};
