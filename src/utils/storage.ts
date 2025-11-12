import type { CartItem } from '../types/Cart';

const CART_STORAGE_KEY = 'shopping_cart';

export const Storage = {
  // Save cart to localStorage
  saveCart: (cartItems: CartItem[]): void => {
    try {
      // Validate data before saving
      if (!Array.isArray(cartItems)) {
        console.error('Invalid cart items data:', cartItems);
        return;
      }
      
      const serializedCart = JSON.stringify(cartItems);
      localStorage.setItem(CART_STORAGE_KEY, serializedCart);
      console.log('💾 Cart saved to localStorage successfully');
    } catch (error) {
      console.error('❌ Error saving cart to localStorage:', error);
      // Handle quota exceeded error
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded. Clearing old data...');
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
  },

  // Load cart from localStorage - FIXED SYNTAX
  loadCart: (): CartItem[] => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (!storedCart) {
        console.log('📭 No cart found in localStorage');
        return [];
      }
      
      const parsedCart = JSON.parse(storedCart);
      
      // Validate the parsed data is an array
      if (!Array.isArray(parsedCart)) {
        console.warn('⚠️ Invalid cart data in localStorage, returning empty array');
        return [];
      }
      
      console.log('📦 Cart loaded from localStorage:', parsedCart);
      return parsedCart;
    } catch (error) {
      console.error('❌ Error loading cart from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem(CART_STORAGE_KEY);
      return [];
    }
  },

  // Clear cart from localStorage
  clearCart: (): void => {
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      console.log('🗑️ Cart cleared from localStorage');
    } catch (error) {
      console.error('❌ Error clearing cart from localStorage:', error);
    }
  }
};