import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { CartItem } from '../types/Cart';
import { Storage } from '../utils/storage';

interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  addToCart: (item: CartItem) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getCartTotal: () => number;
  getCartItemsCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on component mount
  useEffect(() => {
    console.log('🔄 Loading cart from localStorage...');
    try {
      const savedCart = Storage.loadCart();
      console.log('📦 Cart loaded:', savedCart);
      
      // Validate that we have an array
      if (Array.isArray(savedCart)) {
        setCartItems(savedCart);
      } else {
        console.warn('⚠️ Invalid cart data in localStorage, resetting to empty array');
        setCartItems([]);
      }
    } catch (error) {
      console.error('❌ Error loading cart:', error);
      setCartItems([]);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save cart to localStorage whenever cartItems change
  useEffect(() => {
    if (!isInitialized) {
      console.log('⏳ Skipping save - cart not initialized yet');
      return;
    }
    
    console.log('💾 Saving cart to localStorage:', cartItems);
    try {
      Storage.saveCart(cartItems);
      console.log('✅ Cart saved successfully');
    } catch (error) {
      console.error('❌ Error saving cart:', error);
    }
  }, [cartItems, isInitialized]);

  const addToCart = (newItem: CartItem) => {
    console.log('➕ Adding to cart:', newItem);
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        item => item.id === newItem.id && item.selectedPackage === newItem.selectedPackage
      );

      if (existingItemIndex > -1) {
        // Update quantity if item already exists
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + newItem.quantity
        };
        console.log('📝 Updated existing item, new cart:', updatedItems);
        return updatedItems;
      } else {
        // Add new item
        const newItems = [...prevItems, newItem];
        console.log('🆕 Added new item, new cart:', newItems);
        return newItems;
      }
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    console.log('🔢 Updating quantity for item:', id, 'to:', quantity);
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (id: string) => {
    console.log('🗑️ Removing item:', id);
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const clearCart = () => {
    console.log('🧹 Clearing cart');
    setCartItems([]);
    // Don't call Storage.clearCart() here - let the useEffect handle it
  };

  const openCart = () => {
    console.log('📖 Opening cart sidebar');
    setIsCartOpen(true);
  };
  
  const closeCart = () => {
    console.log('📕 Closing cart sidebar');
    setIsCartOpen(false);
  };

  const getCartTotal = () => {
    const total = cartItems.reduce((total, item) => {
      const itemPrice = item.discount_percentage 
        ? item.price * (1 - item.discount_percentage / 100)
        : item.price;
      return total + (itemPrice * item.quantity);
    }, 0);
    console.log('💰 Cart total calculated:', total);
    return total;
  };

  const getCartItemsCount = () => {
    const count = cartItems.reduce((count, item) => count + item.quantity, 0);
    console.log('🔢 Cart items count:', count);
    return count;
  };

  const value: CartContextType = {
    cartItems,
    isCartOpen,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    openCart,
    closeCart,
    getCartTotal,
    getCartItemsCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};