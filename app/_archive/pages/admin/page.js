'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Users, Package, RefreshCcw, Camera } from 'lucide-react';
import { dbService } from '../../services/dbService';

export default function AdminPage() {
  const [data, setData] = useState({ users: [], orders: [], ledger: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // orders, users, ledger

  const loadData = async () => {
    setLoading(true);
    const globalDB = await dbService.getAllData();
    setData(globalDB);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    if (confirm(`Change order ${orderId} status to ${newStatus}?`)) {
      await dbService.updateOrderStatus(orderId, newStatus);
      loadData(); // Reload to reflect changes, like activated credits
    }
  };

  if (loading) {
    return <div style={{ padding: '100px', textAlign: 'center' }}>Loading Admin Panel...</div>;
  }

  const statCardStyle = {
    background: '#fff', padding: 25, borderRadius: 20, 
    border: '1px solid var(--color-border)', flex: 1,
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
  };

  return (
    <div style={{ maxWidth: 1200, margin: '60px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: 12 }}>
          <LayoutDashboard size={32} color="var(--color-accent)" /> 
          Admin Dashboard
        </h1>
        <button onClick={loadData} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
          <RefreshCcw size={16} /> Refresh Data
        </button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 40 }}>
        <div style={statCardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-text-light)', marginBottom: 10 }}>
            <Package size={20} /> Total Orders
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{data.orders.length}</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-text-light)', marginBottom: 10 }}>
            <Users size={20} /> Total Customers
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{data.users.length}</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-text-light)', marginBottom: 10 }}>
            <span style={{ fontSize: '1.2rem' }}>💎</span> Active Credits Issued
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>
            ₹{data.ledger.filter(l =>
              (l.type === 'referral_reward' || l.type === 'invited_customer_reward' || l.type === 'photo_review_reward')
              && l.status === 'active'
            ).reduce((sum, l) => sum + l.amount, 0)}
          </div>
        </div>
        <Link href="/admin/reviews" style={{ ...statCardStyle, textDecoration: 'none', display: 'block', borderColor: '#c7d2fe', background: 'linear-gradient(135deg, #f8f9ff, #eff6ff)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#3b82f6', marginBottom: 10 }}>
            <Camera size={20} /> Photo Reviews
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#3b82f6' }}>
            {(data.reviews || []).filter(r => r.status === 'under_review').length}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#6e6e73', marginTop: 4 }}>Pending Approval →</div>
        </Link>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 15, marginBottom: 30, borderBottom: '1px solid var(--color-border)' }}>
        {['orders', 'users', 'ledger'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 24px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '1rem', fontWeight: 600, textTransform: 'capitalize',
              color: activeTab === tab ? 'var(--color-accent)' : 'var(--color-text-light)',
              borderBottom: activeTab === tab ? '3px solid var(--color-accent)' : '3px solid transparent'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ background: '#fff', borderRadius: 20, border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        
        {activeTab === 'orders' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--color-off-white)' }}>
                <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>Order ID</th>
                <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>Customer</th>
                <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>Amount</th>
                <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>Status</th>
                <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.orders.map(order => (
                <tr key={order.orderId} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '16px 20px', fontWeight: 600 }}>{order.orderId}</td>
                  <td style={{ padding: '16px 20px' }}>
                    {order.customerName}<br/>
                    <small style={{ color: 'var(--color-text-light)' }}>{order.email}</small>
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: 600 }}>₹{order.finalAmount}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600,
                      background: order.orderStatus === 'Delivered' ? 'rgba(0, 200, 83, 0.1)' : 'rgba(0, 102, 255, 0.1)',
                      color: order.orderStatus === 'Delivered' ? 'var(--color-success)' : 'var(--color-accent)'
                    }}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    {order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled' && (
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => handleStatusUpdate(order.orderId, 'Delivered')} style={{ padding: '6px 12px', background: 'var(--color-success)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' }}>
                          Mark Delivered
                        </button>
                        <button onClick={() => handleStatusUpdate(order.orderId, 'Cancelled')} style={{ padding: '6px 12px', background: 'transparent', color: 'var(--color-error)', border: '1px solid var(--color-error)', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' }}>
                          Cancel
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {data.orders.length === 0 && (
                <tr><td colSpan="5" style={{ padding: 30, textAlign: 'center', color: 'var(--color-text-light)' }}>No orders found.</td></tr>
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'users' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--color-off-white)' }}>
                <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>Name & Email</th>
                <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>Referral Code</th>
                <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>Referred By</th>
                <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <strong>{user.name}</strong><br/>
                    <small style={{ color: 'var(--color-text-light)' }}>{user.email} | {user.phone}</small>
                  </td>
                  <td style={{ padding: '16px 20px' }}><code style={{ color: 'var(--color-accent)' }}>{user.referralCode}</code></td>
                  <td style={{ padding: '16px 20px' }}>{user.referredBy || '-'}</td>
                  <td style={{ padding: '16px 20px' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'ledger' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--color-off-white)' }}>
                <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>Type</th>
                <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>Amount</th>
                <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>Status</th>
                <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>Source Order</th>
                <th style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {data.ledger.map(l => (
                <tr key={l.transactionId} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600,
                      background: l.type === 'credit_used' ? 'rgba(255, 59, 48, 0.1)' : 'rgba(0, 200, 83, 0.1)',
                      color: l.type === 'credit_used' ? 'var(--color-error)' : 'var(--color-success)'
                    }}>
                      {l.type.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: 700 }}>₹{l.amount}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ 
                      color: l.status === 'active' ? 'var(--color-success)' : l.status === 'pending' ? 'var(--color-warning)' : 'var(--color-text-light)'
                    }}>
                      • {l.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>{l.sourceOrderId}</td>
                  <td style={{ padding: '16px 20px', fontSize: '0.9rem', color: 'var(--color-text-light)' }}>{l.notes}</td>
                </tr>
              ))}
              {data.ledger.length === 0 && (
                <tr><td colSpan="5" style={{ padding: 30, textAlign: 'center', color: 'var(--color-text-light)' }}>No transactions yet.</td></tr>
              )}
            </tbody>
          </table>
        )}

      </div>
    </div>
  );
}
