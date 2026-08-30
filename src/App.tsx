// App.tsx
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Navbar from "./navbar/navbar";
import ProductDetail from "./productdetail/ProductDetail";
import Footer from "./footer/footer";
import { ProductProvider } from "./contexts/ProductContext";
import { ProductDetailProvider } from "./contexts/ProductDetailContext";
import ProductItemDetailPage from "./productitem/ProductItemDetailPage";
import { QuickViewProvider, useQuickView } from "./contexts/QuickViewContext";
import { CartProvider, useCart } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import './auth/toast.scss';
import CartSidebar from "./cart/CartSidebar";
import "./App.css";
import LoadingScreen from "./loading/LoadingScreen";
import ProductQuickViewPopup from "./cart/ProductQuickViewPopup";
import CheckoutPage from "./checkout/CheckoutPage";
import AuthPage from "./auth/authpage";
import BlogDetailPage from "./blogdetail/BlogDetailPage";
import { ToastProvider } from "./contexts/ToastContext";
import { ToastViewport } from "./auth/Toast";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "./utils/PageTransition";
import { useScrollRestoration } from "./hooks/useScrollRestoration";
import { OfferProvider } from "./contexts/OfferContext";
import { CategoryProvider } from "./contexts/CategoryContext";
import ContactPage from "./components/ContactPage";
import FavoritesPage from "./favorites/FavoritesPage";
import { FavoriteProvider } from "./contexts/FavoriteContext";
import AboutPage from "./about/Aboutpage";

const CHROME_HIDDEN_PATHS = ["/checkout", "/login", "/signup", "/auth"];

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

  const location = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // true once it's safe to show the page (correct scroll position applied)
  const isReady = useScrollRestoration();

  const handleAddToCart = (product: any, quantity: number, selectedPackage?: string) => {
    const newItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.images?.[0] || product.image_url,
      selectedPackage: selectedPackage,
      discount_percentage: product.discount_percentage,
      material: product.material
    };

    addToCart(newItem);
    openCart();
    console.log('Added to cart:', newItem);
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    updateQuantity(id, quantity);
  };

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
  };

  return (
    <>
      <div className="app-content">
        <Routes>
          {CHROME_HIDDEN_PATHS.map((path) => (
            <Route key={path} path={path} element={null} />
          ))}
          <Route path="*" element={
            <Navbar
              cartItemsCount={getCartItemsCount()}
              onCartClick={openCart}
            />
          } />
        </Routes>

        <div style={{ opacity: isReady ? 1 : 0, transition: "opacity 0.2s ease" }}>
          <AnimatePresence mode="popLayout">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageTransition><Home /></PageTransition>} />
              <Route path="/products" element={<PageTransition><ProductDetail /></PageTransition>} />
              <Route path="/product/:productId" element={<PageTransition><ProductItemDetailPage /></PageTransition>} />
              <Route path="/checkout" element={<PageTransition><CheckoutPage /></PageTransition>} />
              <Route path="/auth" element={<PageTransition><AuthPage /></PageTransition>} />
              <Route path="/blog/:slug" element={<PageTransition><BlogDetailPage /></PageTransition>} />
              <Route path="/contact" element={<PageTransition><ContactPage /></PageTransition>} />
              <Route path="/favorites" element={<PageTransition><FavoritesPage /></PageTransition>} />
              <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
            </Routes>
          </AnimatePresence>
        </div>

        <Routes>
          {CHROME_HIDDEN_PATHS.map((path) => (
            <Route key={path} path={path} element={null} />
          ))}
          <Route path="*" element={<Footer />} />
        </Routes>
      </div>

      <ProductQuickViewPopup
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={closeQuickView}
        onAddToCart={handleAddToCart}
      />

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
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ToastProvider>
      <ToastViewport />

      <AuthProvider>
        <OfferProvider>
           <CategoryProvider>
            
          <ProductProvider>
            <ProductDetailProvider>
              <QuickViewProvider>
                <FavoriteProvider>
                <CartProvider>
                  <Router>
                    <AppContent />
                  </Router>
                </CartProvider>
                </FavoriteProvider>
              </QuickViewProvider>
            </ProductDetailProvider>
          </ProductProvider>
          </CategoryProvider>
        </OfferProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;