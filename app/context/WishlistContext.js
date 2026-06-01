'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { dbService } from '../../services/dbService';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [savedItems, setSavedItems] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('nexa_saved_items');
      if (stored) {
        setSavedItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load saved items', e);
    }
  }, []);

  // Save to local storage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('nexa_saved_items', JSON.stringify(savedItems));
    } catch (e) {
      console.error('Failed to save items', e);
    }
  }, [savedItems]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const toggleSavedItem = (product) => {
    setSavedItems((prev) => {
      const isCurrentlySaved = prev.some((item) => item.id === product.id);
      
      if (isCurrentlySaved) {
        showToast('Removed from Saved Items.');
        return prev.filter((item) => item.id !== product.id);
      } else {
        const itemToSave = {
          id: product.id,
          title: product.title,
          image: product.image,
          price: product.price,
          categoryLabel: product.categoryLabel,
          shortDescription: product.shortDescription,
          slug: product.slug,
          badge: product.badge,
          originalPrice: product.originalPrice,
          isAffiliate: product.affiliateLink ? true : false,
          affiliateLink: product.affiliateLink || null,
        };
        showToast('Added to Saved Items.');
        return [...prev, itemToSave];
      }
    });
  };

  const isSaved = (productId) => {
    return savedItems.some((item) => item.id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        savedItems,
        savedCount: savedItems.length,
        toggleSavedItem,
        isSaved,
      }}
    >
      {children}
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--color-primary)',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: '50px',
          fontWeight: '600',
          fontSize: '0.9rem',
          boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
          zIndex: 9999,
          animation: 'fadeInUp 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {toastMessage}
        </div>
      )}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
