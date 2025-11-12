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


import "./App.css";
import LoadingScreen from "./loading/LoadingScreen";
import ProductQuickViewPopup from "./cart/ProductQuickViewPopup";

// Create a separate component that uses the QuickView hook
function AppContent() {
  const { quickViewProduct, isQuickViewOpen, closeQuickView } = useQuickView();

  const handleAddToCart = (product: any, quantity: number, selectedPackage?: string) => {
    console.log('Added to cart from popup:', {
      product,
      quantity,
      selectedPackage
    });

  };
const handleBuyNow = (product: any, quantity: number, selectedPackage?: string) => {
  console.log('Buy now from popup:', {
    product,
    quantity,
    selectedPackage
  });
  // Add your buy now logic here (redirect to checkout, etc.)
  closeQuickView();
};
  return (
    <>
      <div className="app-content">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductDetail />} />
          <Route path="/product/:productId" element={<ProductItemDetailPage />} />
        </Routes>
        <Footer />
      </div>
      
     <ProductQuickViewPopup
  product={quickViewProduct}
  isOpen={isQuickViewOpen}
  onClose={closeQuickView}
  onAddToCart={handleAddToCart}
  onBuyNow={handleBuyNow}
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
          <Router>
            <ScrollToTop />
            <AppContent />
          </Router>
        </QuickViewProvider>
      </ProductDetailProvider>
    </ProductProvider>
  );
}

export default App;