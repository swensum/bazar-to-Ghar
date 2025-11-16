import { type JSX, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { CartItem } from "../types/Cart";
import styles from "./CartSidebar.module.scss";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  cartTotal: number;
}

export default function CartSidebar({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  cartTotal
}: CartSidebarProps): JSX.Element {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const freeShippingThreshold = 50;

  // Calculate progress for free shipping
  const amountNeeded = Math.max(0, freeShippingThreshold - cartTotal);

  useEffect(() => {
    const progressPercentage = Math.min((cartTotal / freeShippingThreshold) * 100, 100);
    setProgress(progressPercentage);
  }, [cartTotal]);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    onUpdateQuantity(id, newQuantity);
  };

  const getDiscountedPrice = (item: CartItem) => {
    return item.discount_percentage 
      ? item.price * (1 - item.discount_percentage / 100)
      : item.price;
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) return;
    
    // Close the cart sidebar
    onClose();
    
    // Navigate to checkout with all cart items
    navigate('/checkout', {
      state: {
        cartItems: cartItems,
        cartTotal: cartTotal
      }
    });
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className={styles.overlay} onClick={onClose}></div>}
      
      {/* Sidebar */}
      <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        {/* AppBar */}
        <div className={styles.appBar}>
          <div className={styles.appBarContent}>
            <h2 className={styles.appBarTitle}>
              My Shopping Cart ({cartItems.reduce((count, item) => count + item.quantity, 0)})
            </h2>
            <button className={styles.closeButton} onClick={onClose}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Horizontal Bar */}
        <div className={styles.horizontalBar}></div>

        {/* Free Shipping Progress Bar */}
        <div className={styles.shippingSection}>
          <div className={styles.shippingText}>
            {amountNeeded > 0 ? (
              <span>Spend <strong>${amountNeeded.toFixed(2)}</strong> more and get free shipping!</span>
            ) : (
              <span className={styles.freeShippingAchieved}>🎉 You've earned free shipping!</span>
            )}
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Cart Items */}
        <div className={styles.cartItemsSection}>
          {cartItems.length === 0 ? (
            <div className={styles.emptyCart}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              <p>Your cart is empty</p>
              <button className={styles.continueShopping} onClick={onClose}>
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              <div className={styles.cartItems}>
                {cartItems.map((item) => {
                  const discountedPrice = getDiscountedPrice(item);
                  const totalPrice = discountedPrice * item.quantity;

                  return (
                    <div key={`${item.id}-${item.selectedPackage}`} className={styles.cartItem}>
                      <div className={styles.itemImage}>
                        <img src={item.image} alt={item.name} />
                      </div>
                      
                      <div className={styles.itemDetails}>
                        <h4 className={styles.itemName}>{item.name}</h4>
                        
                        {/* Material Information */}
                        {item.material && (
                          <p className={styles.itemMaterial}>Material: {item.material}</p>
                        )}
                        
                        {item.selectedPackage && (
                          <p className={styles.itemPackage}>Package: {item.selectedPackage}</p>
                        )}
                        
                        <div className={styles.priceSection}>
                          {item.discount_percentage ? (
                            <div className={styles.discountPrice}>
                              <span className={styles.currentPrice}>${discountedPrice.toFixed(2)}</span>
                              <span className={styles.originalPrice}>${item.price.toFixed(2)}</span>
                            </div>
                          ) : (
                            <span className={styles.normalPrice}>${item.price.toFixed(2)}</span>
                          )}
                        </div>

                        <div className={styles.quantitySection}>
                          <div className={styles.quantityControls}>
                            <button
                              className={styles.quantityBtn}
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            >
                              -
                            </button>
                            <span className={styles.quantity}>{item.quantity}</span>
                            <button
                              className={styles.quantityBtn}
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                          
                          <button 
                            className={styles.removeBtn}
                            onClick={() => onRemoveItem(item.id)}
                          >
                            Remove
                          </button>
                        </div>

                        <div className={styles.itemTotal}>
                          Total: <strong>${totalPrice.toFixed(2)}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cart Summary */}
              <div className={styles.cartSummary}>
                <div className={styles.summaryRow}>
                  <span>Subtotal:</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Shipping:</span>
                  <span>{amountNeeded > 0 ? '$10.00' : 'FREE'}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Tax:</span>
                  <span>${(cartTotal * 0.1).toFixed(2)}</span>
                </div>
                <div className={styles.summaryTotal}>
                  <span>Total:</span>
                  <span>${(cartTotal + (amountNeeded > 0 ? 10 : 0) + (cartTotal * 0.1)).toFixed(2)}</span>
                </div>
                
                <button 
                  className={styles.checkoutBtn}
                  onClick={handleProceedToCheckout}
                  disabled={cartItems.length === 0}
                >
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}