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

import "./App.css";
import LoadingScreen from "./loading/LoadingScreen";

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
        <Router>
          <ScrollToTop />
          <div className="app-content">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<ProductDetail />} />
              <Route path="/product/:productId" element={<ProductItemDetailPage />} />
            </Routes>
            <Footer />
          </div>
        </Router>
      </ProductDetailProvider>
    </ProductProvider>
  );
}

export default App;