// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Navbar from "./navbar/navbar";
import ProductDetail from "./productdetail/ProductDetail";
import Footer from "./footer/footer";
import { ProductProvider } from "./contexts/ProductContext";
import ScrollToTop from "./ScrollToTop";
import { ProductDetailProvider } from "./contexts/ProductDetailContext";
import ProductItemDetailPage from "./productitem/ProductItemDetailPage";
import { QuickViewProvider, useQuickView } from "./contexts/QuickViewContext";
import { CartProvider, useCart } from "./contexts/CartContext";
import CartSidebar from "./cart/CartSidebar";

import "./App.css";
import LoadingScreen from "./loading/LoadingScreen";
import ProductQuickViewPopup from "./cart/ProductQuickViewPopup";

// Create a separate component that uses the QuickView hook
function AppContent() {
  const { quickViewProduct, isQuickViewOpen, closeQuickView } = useQuickView();
  const { 
    cartItems, 
    isCartOpen, 
    addToCart, 
    updateQuantity, 
    removeFromCart, 
    openCart, 
    closeCart, 
    getCartItemsCount,
    getCartTotal 
  } = useCart();

  const handleAddToCart = (product: any, quantity: number, selectedPackage?: string) => {
    // Add item to cart
    const newItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.images?.[0] || product.image_url,
      selectedPackage: selectedPackage,
      discount_percentage: product.discount_percentage
    };

    addToCart(newItem);
    
    // Open cart sidebar
    openCart();
    console.log('Added to cart:', newItem);
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    updateQuantity(id, quantity);
  };

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
  };

  const handleBuyNow = (product: any, quantity: number, selectedPackage?: string) => {
    handleAddToCart(product, quantity, selectedPackage);
    // You can add additional buy now logic here
    closeQuickView();
  };

  return (
    <>
      <div className="app-content">
        <Navbar 
          cartItemsCount={getCartItemsCount()} 
          onCartClick={openCart} 
        />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductDetail />} />
          <Route path="/product/:productId" element={<ProductItemDetailPage />} />
        </Routes>
        <Footer />
      </div>
      
      {/* Quick View Popup */}
      <ProductQuickViewPopup
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={closeQuickView}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={closeCart}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        cartTotal={getCartTotal()}
      />
    </>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial app loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Increased to 2 seconds for better experience
    
    return () => clearTimeout(timer);
  }, []);

  // Show loading screen until everything is ready
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ProductProvider>
      <ProductDetailProvider>
        <QuickViewProvider>
          <CartProvider>
            <Router>
              <ScrollToTop />
              <AppContent />
            </Router>
          </CartProvider>
        </QuickViewProvider>
      </ProductDetailProvider>
    </ProductProvider>
  );
}

export default App;