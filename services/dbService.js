/**
 * Central Database Service (Mocked via LocalStorage)
 * Handles Users, Orders, and Polar Credits Ledger
 */

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

const getDB = () => {
  if (typeof window === 'undefined') return { users: [], ledger: [], orders: [] };
  const db = localStorage.getItem('nexa_global_db');
  if (!db) {
    const initialDB = {
      users: [],
      ledger: [],
      orders: [],
      reviews: [],
    };
    localStorage.setItem('nexa_global_db', JSON.stringify(initialDB));
    return initialDB;
  }
  const parsed = JSON.parse(db);
  // Backward compat: ensure reviews array exists
  if (!parsed.reviews) parsed.reviews = [];
  return parsed;
};

const saveDB = (db) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('nexa_global_db', JSON.stringify(db));
  }
};

export const dbService = {
  // --- USER PROFILES ---
  async getOrCreateUser(email, phone, name, photoURL) {
    await delay();
    const db = getDB();
    
    // Try to find existing user by email or phone
    let user = db.users.find(u => 
      (email && u.email === email) || (phone && u.phone === phone)
    );

    if (!user) {
      // Check if we have any orders with this email/phone to recover the Firebase customerId
      const existingOrder = db.orders.find(o => 
        (email && o.customer && o.customer.email === email) || 
        (email && o.customerDetails && o.customerDetails.email === email)
      );
      
      const newUserId = existingOrder ? existingOrder.customerId : 'usr_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

      // Create new user profile
      user = {
        id: newUserId,
        name: name || (existingOrder && existingOrder.customer ? `${existingOrder.customer.firstName || ''} ${existingOrder.customer.lastName || ''}`.trim() : 'Guest User'),
        email: email || '',
        phone: phone || '',
        photoURL: photoURL || null,
        referralCode: 'NEXA' + Math.floor(10000 + Math.random() * 90000),
        referredBy: localStorage.getItem('nexa_captured_ref') || null,
        createdAt: new Date().toISOString(),
      };
      db.users.push(user);
      saveDB(db);
      
      // Clear captured ref
      localStorage.removeItem('nexa_captured_ref');
    }

    return this.getUserProfile(user.id);
  },

  async getUserProfile(userId) {
    const db = getDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) return null;

    const userLedger = db.ledger.filter(l => l.userId === userId);
    const userOrders = db.orders.filter(o => o.customerId === userId);
    
    const pendingCredits = userLedger
      .filter(l => (
        l.type === 'referral_reward' ||
        l.type === 'invited_customer_reward' ||
        l.type === 'photo_review_reward'
      ) && l.status === 'pending')
      .reduce((sum, l) => sum + l.amount, 0);
      
    const activeEarned = userLedger
      .filter(l => (
        l.type === 'referral_reward' ||
        l.type === 'invited_customer_reward' ||
        l.type === 'photo_review_reward'
      ) && l.status === 'active')
      .reduce((sum, l) => sum + l.amount, 0);
      
    const usedCredits = userLedger
      .filter(l => l.type === 'credit_used' && l.status === 'active')
      .reduce((sum, l) => sum + l.amount, 0);

    const availableCredits = Math.max(0, activeEarned - usedCredits);

    return {
      ...user,
      pendingCredits,
      usedCredits,
      availableCredits,
      orders: userOrders
    };
  },

  // --- ORDERS ---
  async createOrder(orderData) {
    await delay();
    const db = getDB();
    
    const newOrder = {
      orderId: 'ORD-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000),
      ...orderData,
      orderStatus: 'Processing', // Processing, Shipped, Delivered, Cancelled
      createdAt: new Date().toISOString(),
    };
    
    db.orders.push(newOrder);

    // If this user was referred, and this is their FIRST order, give the referrer pending credits
    if (orderData.customerId) {
      const user = db.users.find(u => u.id === orderData.customerId);
      const userOrderCount = db.orders.filter(o => o.customerId === orderData.customerId).length;
      
      if (user && user.referredBy && userOrderCount === 1) {
        const referrer = db.users.find(u => u.referralCode === user.referredBy);
        if (referrer) {
          db.ledger.push({
            transactionId: 'txn_' + Date.now() + '_ref',
            userId: referrer.id,
            type: 'referral_reward',
            amount: 200,
            status: 'pending',
            sourceOrderId: newOrder.orderId,
            referredUserId: user.id,
            createdAt: new Date().toISOString(),
            notes: `Referral reward for new customer order ${newOrder.orderId}`
          });
          db.ledger.push({
            transactionId: 'txn_' + Date.now() + '_inv',
            userId: user.id,
            type: 'invited_customer_reward',
            amount: 200,
            status: 'pending',
            sourceOrderId: newOrder.orderId,
            referrerUserId: referrer.id,
            createdAt: new Date().toISOString(),
            notes: `Welcome reward for completing first referred order ${newOrder.orderId}`
          });
        }
      }
    }

    saveDB(db);
    return newOrder;
  },

  async updateOrderStatus(orderId, newStatus) {
    await delay();
    const db = getDB();
    const order = db.orders.find(o => o.orderId === orderId);
    if (!order) throw new Error("Order not found");
    
    order.orderStatus = newStatus;
    
    // If delivered, activate pending referral rewards tied to this order
    if (newStatus === 'Delivered') {
      const pendingRewards = db.ledger.filter(l => l.sourceOrderId === orderId && (l.type === 'referral_reward' || l.type === 'invited_customer_reward') && l.status === 'pending');
      pendingRewards.forEach(reward => {
        reward.status = 'active';
        reward.activatedAt = new Date().toISOString();
        reward.expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
      });
    }
    
    // If cancelled, refunded or returned, reverse rewards
    if (newStatus === 'Cancelled' || newStatus === 'Refunded' || newStatus === 'Returned') {
      const pendingRewards = db.ledger.filter(l => l.sourceOrderId === orderId && (l.type === 'referral_reward' || l.type === 'invited_customer_reward') && l.status === 'pending');
      pendingRewards.forEach(reward => {
        reward.status = 'reversed';
        reward.notes += ` (Order ${newStatus})`;
      });
    }
    
    saveDB(db);
    return order;
  },

  // --- POLAR CREDITS ---
  async useCredits(userId, amount, orderId) {
    const db = getDB();
    db.ledger.push({
      transactionId: 'txn_' + Date.now(),
      userId: userId,
      type: 'credit_used',
      amount: amount,
      status: 'active',
      sourceOrderId: orderId,
      createdAt: new Date().toISOString(),
      notes: `Credits redeemed on order ${orderId}`
    });
    saveDB(db);
  },

  async captureReferralCode(code) {
    if (typeof window === 'undefined' || !code) return;
    localStorage.setItem('nexa_captured_ref', code.toUpperCase());
  },

  // --- ADMIN ---
  async getAllData() {
    await delay();
    return getDB();
  }
};
