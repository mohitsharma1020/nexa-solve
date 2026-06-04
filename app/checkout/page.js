'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ShieldCheck, ArrowRight, CheckCircle2, Truck, RefreshCcw,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { functions } from '../../services/firebaseClient';
import { httpsCallable } from 'firebase/functions';

const paymentMethods = [
  { id: 'upi', label: 'UPI Payment', desc: 'GPay, PhonePe, Paytm' },
  { id: 'card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking', label: 'Net Banking', desc: 'All Indian Banks Supported' },
];

export default function CheckoutPage() {
  const [step] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    email: '', phone: '', firstName: '', lastName: '',
    address: '', city: '', state: '', pincode: '', country: 'India',
  });
  
  const router = useRouter();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_USE_SHOPIFY_CHECKOUT === 'true') {
      router.replace('/cart');
    }
  }, [router]);

  const {
    cartItems,
    subtotal,
    shipping,
    shippingCharge,
    shippingDiscount,
    total,
    totalSavings,
    isFirstOrder,
    discountCode,
    setDiscountCode,
    applyPromo,
    removePromo,
    appliedPromoCode,
    promoMessage,
    actualDiscount,
    FREE_SHIPPING_THRESHOLD,
    amountToFreeShipping,
    completeOrder,
    isInitialized,
  } = useCart();

  const promoIsApplied = appliedPromoCode === 'ANTARCTICA';

  if (!isInitialized) return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const inputStyle = {
    width: '100%', padding: '14px 18px', border: '1px solid var(--color-border)',
    borderRadius: 12, fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none',
    transition: 'all 0.2s ease', background: 'var(--color-white)',
    color: 'var(--color-primary)',
  };

  const labelStyle = {
    display: 'block', fontSize: '0.8rem', fontWeight: 600,
    color: 'var(--color-primary)', marginBottom: 6, textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const sectionTitleStyle = {
    fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-primary)',
    marginBottom: '1.25rem', paddingBottom: '0.75rem',
    borderBottom: '1px solid var(--color-border)',
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [mockPaymentData, setMockPaymentData] = useState(null);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.firstName) {
      alert("Please fill in required fields.");
      return;
    }
    
    // Block Amazon affiliate products
    if (cartItems.some(item => item.affiliateLink || item.category === 'affiliate')) {
      alert("Affiliate products cannot be purchased through the website checkout.");
      return;
    }

    setIsProcessing(true);
    
    try {
      // Bypass Firebase Cloud Functions (requires Blaze plan)
      // Process the mock order flow locally instead.
      const mockOrderData = {
        mockMode: true,
        internalOrderId: 'ORD-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000),
        amount: total,
        currency: 'INR'
      };
      
      setMockPaymentData(mockOrderData);
    } catch (err) {
      console.error(err);
      alert(err.message || "There was an error processing your order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMockVerification = async (signatureType) => {
    if (!mockPaymentData) return;
    setIsProcessing(true);
    try {
      if (signatureType === 'valid') {
        const orderDataFromContext = await completeOrder({
          ...formData,
          paymentMethod: 'Credit Card (Mock)',
          paymentStatus: 'Paid',
          orderId: mockPaymentData.internalOrderId
        });
        setCompletedOrder(orderDataFromContext);
        setOrderSuccess(true);
      } else {
        alert("Payment verification failed! (Simulated)");
        setMockPaymentData(null);
      }
    } catch (err) {
       console.error(err);
       alert("Payment failed or was cancelled.");
       setMockPaymentData(null);
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderSuccess && completedOrder) {
    const totalSaved = (completedOrder.promoDiscount || 0) +
                       (completedOrder.shippingDiscount || 0);

    return (
      <div style={{ maxWidth: 560, margin: '60px auto', padding: '40px 20px', textAlign: 'center' }}>
        {/* Success Icon */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, #00c853, #00e676)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', boxShadow: '0 12px 32px rgba(0,200,83,0.25)'
        }}>
          <CheckCircle2 size={40} color="#fff" />
        </div>

        <h1 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: 8 }}>Order Placed!</h1>
        <p style={{ fontSize: '1rem', color: 'var(--color-text-light)', marginBottom: 6 }}>
          Order ID: <strong style={{ color: 'var(--color-primary)' }}>{completedOrder.orderId}</strong>
        </p>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', marginBottom: 28 }}>
          A customer profile has been created for <strong>{completedOrder.email}</strong>.
          You can track this order from your account.
        </p>

        {/* Savings Summary */}
        {totalSaved > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,200,83,0.08), rgba(0,200,83,0.04))',
            border: '1px solid rgba(0,200,83,0.2)',
            borderRadius: 16, padding: '20px 24px', marginBottom: 28, textAlign: 'left'
          }}>
            <p style={{ fontWeight: 700, color: '#00a846', marginBottom: 12, fontSize: '0.95rem' }}>
              🎉 Total saved on this order: ₹{totalSaved.toLocaleString('en-IN')}
            </p>
            {completedOrder.promoDiscount > 0 && (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', margin: '4px 0' }}>
                • Promo ANTARCTICA: -₹{completedOrder.promoDiscount}
              </p>
            )}
            {completedOrder.shippingDiscount > 0 && (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', margin: '4px 0' }}>
                • Free Shipping: -₹{completedOrder.shippingDiscount}
              </p>
            )}
          </div>
        )}

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link
            href="/account"
            style={{
              display: 'block', background: 'var(--color-primary)', color: '#fff',
              padding: '14px 28px', borderRadius: '12px', fontWeight: 700,
              textDecoration: 'none', fontSize: '1rem'
            }}
          >
            Track My Order
          </Link>

          <Link
            href="/shop"
            style={{
              fontSize: '0.9rem', color: 'var(--color-text-light)',
              textDecoration: 'none', marginTop: 4
            }}
          >
            Continue Shopping →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Mock Modal */}
      {mockPaymentData && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: 16, maxWidth: 400, width: '90%', textAlign: 'center' }}>
            <h3 style={{ color: '#000', marginBottom: 16, fontSize: '1.25rem' }}>Mock Payment Mode</h3>
            <p style={{ color: '#555', marginBottom: 24, fontSize: '0.9rem' }}>
              Razorpay integration is in Mock Mode. Please simulate the payment outcome for order: {mockPaymentData.internalOrderId}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button 
                onClick={() => handleMockVerification("mock_success_signature")}
                disabled={isProcessing}
                style={{ padding: 12, background: 'var(--color-success)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                {isProcessing ? 'Processing...' : 'Simulate Success'}
              </button>
              <button 
                onClick={() => handleMockVerification("mock_failure_signature")}
                disabled={isProcessing}
                style={{ padding: 12, background: 'var(--color-error)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                {isProcessing ? 'Processing...' : 'Simulate Failure'}
              </button>
              <button 
                onClick={() => setMockPaymentData(null)}
                disabled={isProcessing}
                style={{ padding: 12, background: 'var(--color-border)', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                Cancel Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <section style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
        padding: '3rem 0 2.5rem', textAlign: 'center',
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 20px' }}>
          <ShieldCheck size={32} style={{ color: '#0066FF', marginBottom: '0.75rem' }} />
          <h1 style={{ color: '#fff', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Secure Checkout
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem' }}>
            Your payment is encrypted and protected
          </p>
        </div>
      </section>

      {/* Checkout Layout */}
      <section style={{
        maxWidth: 1200, margin: '0 auto', padding: '2.5rem 20px 5rem',
        display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2.5rem',
        alignItems: 'start',
      }}>
        {/* Left: Form */}
        <div>
          {/* Contact Info */}
          <div style={{
            background: 'var(--color-white)', borderRadius: 20, padding: '2rem',
            border: '1px solid var(--color-border)', marginBottom: '1.5rem',
          }}>
            <h2 style={sectionTitleStyle}>Contact Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle} type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} />
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input style={inputStyle} type="tel" name="phone" placeholder="+91 98765 43210" value={formData.phone} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div style={{
            background: 'var(--color-white)', borderRadius: 20, padding: '2rem',
            border: '1px solid var(--color-border)', marginBottom: '1.5rem',
          }}>
            <h2 style={sectionTitleStyle}>Shipping Address</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>First Name</label>
                <input style={inputStyle} type="text" name="firstName" placeholder="John" value={formData.firstName} onChange={handleChange} />
              </div>
              <div>
                <label style={labelStyle}>Last Name</label>
                <input style={inputStyle} type="text" name="lastName" placeholder="Doe" value={formData.lastName} onChange={handleChange} />
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Street Address</label>
              <input style={inputStyle} type="text" name="address" placeholder="123 Main Street, Apt 4B" value={formData.address} onChange={handleChange} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>City</label>
                <input style={inputStyle} type="text" name="city" placeholder="Mumbai" value={formData.city} onChange={handleChange} />
              </div>
              <div>
                <label style={labelStyle}>State</label>
                <input style={inputStyle} type="text" name="state" placeholder="Maharashtra" value={formData.state} onChange={handleChange} />
              </div>
              <div>
                <label style={labelStyle}>PIN Code</label>
                <input style={inputStyle} type="text" name="pincode" placeholder="400001" value={formData.pincode} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div style={{
            background: 'var(--color-white)', borderRadius: 20, padding: '2rem',
            border: '1px solid var(--color-border)',
          }}>
            <h2 style={sectionTitleStyle}>Payment Method</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {paymentMethods.map(method => (
                <label key={method.id} style={{
                  display: 'flex', alignItems: 'center', gap: '1rem', padding: '14px 18px',
                  borderRadius: 14, cursor: 'pointer', transition: 'all 0.2s ease',
                  border: paymentMethod === method.id ? '2px solid var(--color-accent)' : '2px solid var(--color-border)',
                  background: paymentMethod === method.id ? 'rgba(0, 102, 255, 0.04)' : 'transparent',
                }}>
                  <input
                    type="radio" name="payment" value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                    style={{ accentColor: 'var(--color-accent)' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                      {method.label}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                      {method.desc}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div style={{
          background: 'var(--color-white)', borderRadius: 20, padding: '2rem',
          border: '1px solid var(--color-border)', position: 'sticky', top: '120px',
        }}>

          <h2 style={sectionTitleStyle}>Order Summary</h2>

          {isFirstOrder && shippingDiscount > 0 && (
            <div style={{ background: 'rgba(0, 200, 83, 0.1)', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px' }}>
              <p style={{ color: 'var(--color-success)', fontSize: '0.9rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>🎉</span> Your first order includes free shipping. You saved ₹99.
              </p>
            </div>
          )}

          {/* Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {cartItems.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  position: 'relative', width: 64, height: 64, borderRadius: 12,
                  overflow: 'hidden', background: 'var(--color-secondary)', flexShrink: 0,
                }}>
                  <Image src={item.image} alt={item.title} fill sizes="64px" style={{ objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: 2, lineHeight: 1.3 }}>
                    {item.title}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                    Qty: {item.quantity}
                  </p>
                </div>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          {/* Summary Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--color-text-light)' }}>Subtotal</span>
              <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            
            {actualDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--color-success)', fontWeight: 600 }}>
                <span>Promo Discount</span>
                <span>-₹{actualDiscount.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--color-text-light)' }}>Shipping</span>
              <span style={{ fontWeight: 600, color: shippingCharge > 0 && shippingDiscount > 0 ? '#16a34a' : 'var(--color-primary)' }}>
                {shippingCharge > 0 ? (
                  shippingDiscount > 0 ? (
                    <>
                      <span style={{ textDecoration: 'line-through', color: 'var(--color-text-light)', marginRight: '8px' }}>₹{shippingCharge}</span>
                      <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>FREE</span>
                    </>
                  ) : (
                    `₹${shippingCharge}`
                  )
                ) : (
                  <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>FREE</span>
                )}
              </span>
            </div>
            
            {shippingCharge > 0 && !isFirstOrder && subtotal < FREE_SHIPPING_THRESHOLD && (
              <div style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--color-accent)', marginTop: '4px', marginBottom: '8px', fontWeight: 600 }}>
                Add ₹{amountToFreeShipping.toLocaleString('en-IN')} more to unlock free shipping
              </div>
            )}

          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Have a promo code? (Try ANTARCTICA)"
                value={discountCode}
                onChange={e => setDiscountCode(e.target.value)}
                style={{ ...inputStyle, padding: '10px 14px', flex: 1 }}
                disabled={promoIsApplied}
                onKeyDown={(e) => e.key === 'Enter' && !promoIsApplied && applyPromo()}
              />
              {promoIsApplied ? (
                <button
                  onClick={removePromo}
                  style={{
                    padding: '0 16px', background: 'var(--color-success)', color: '#fff',
                    border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer',
                    fontSize: '0.9rem', whiteSpace: 'nowrap'
                  }}
                  title="Remove promo code"
                >
                  APPLIED ✓
                </button>
              ) : (
                <button
                  onClick={applyPromo}
                  style={{
                    padding: '0 16px', background: 'var(--color-primary)', color: '#fff',
                    border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Apply
                </button>
              )}
            </div>
            {promoMessage.text && (
              <p style={{ color: promoMessage.type === 'error' ? 'var(--color-error)' : 'var(--color-success)', fontSize: '12px', marginTop: '6px' }}>
                {promoMessage.text}
              </p>
            )}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '0.75rem 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary)' }}>Total</span>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-primary)' }}>₹{total.toLocaleString('en-IN')}</span>
          </div>

          {totalSavings > 0 && (
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <p style={{ color: 'var(--color-success)', fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>
                {isFirstOrder && shippingDiscount > 0 && actualDiscount > 0 
                  ? `You saved ₹${totalSavings.toLocaleString('en-IN')} on your first order` 
                  : isFirstOrder && shippingDiscount > 0 
                    ? `You saved ₹${shippingDiscount.toLocaleString('en-IN')} with free shipping`
                    : `You saved ₹${actualDiscount.toLocaleString('en-IN')} on your order`}
              </p>
            </div>
          )}

          {/* Place Order Button */}
          <button 
            onClick={handleCheckout}
            disabled={isProcessing}
            style={{
              width: '100%', padding: '16px', background: isProcessing ? 'var(--color-border)' : 'var(--color-primary)',
              color: '#fff', borderRadius: 14, fontWeight: 700, fontSize: '1.1rem',
              border: 'none', cursor: isProcessing ? 'not-allowed' : 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: '10px',
              transition: 'all 0.2s ease',
            }}
          >
            {isProcessing ? 'Processing Order...' : 'Place Secure Order'}
            {!isProcessing && <ArrowRight size={20} />}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-light)', margin: 0, padding: '0 20px' }}>
            By placing your order, you agree to our Terms of Service and Privacy Policy.
          </p>

          {/* Trust */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '1.5rem', padding: '1rem 0 0',
            borderTop: '1px solid var(--color-border)',
          }}>
            {[
              { icon: <ShieldCheck size={16} />, label: 'Secure' },
              { icon: <Truck size={16} />, label: 'Fast Ship' },
              { icon: <RefreshCcw size={16} />, label: 'Returns' },
            ].map((badge, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-light)',
              }}>
                <span style={{ color: 'var(--color-accent)' }}>{badge.icon}</span>
                {badge.label}
              </div>
            ))}
          </div>

          {/* Return Assurance */}
          <p style={{
            textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-light)',
            marginTop: '1rem', lineHeight: 1.5,
          }}>
            30-day hassle-free returns · Your data is encrypted and secure
          </p>
        </div>
      </section>

      <style jsx>{`
        @media (max-width: 768px) {
          section {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
