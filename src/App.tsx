import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./navbar/navbar";
import ProductDetail from "./productdetail/ProductDetail";
import Footer from "./footer/footer";
import { ProductProvider } from "./contexts/ProductContext";
import ScrollToTop from "./ScrollToTop";
import { ProductDetailProvider } from "./contexts/ProductDetailContext";
import ProductItemDetailPage from "./productitem/ProductItemDetailPage";

function App() {
  return (
    <ProductProvider>
       <ProductDetailProvider>
      <Router>
        <ScrollToTop />
        <Navbar />
        <Routes>
          
          <Route path="/" element={<Home />} />
          
          {/* Products page */}
          <Route path="/products" element={<ProductDetail />} />
          <Route path="/product/:productId" element={<ProductItemDetailPage />} />
        </Routes>
        <Footer /> 
      </Router>
      </ProductDetailProvider>
    </ProductProvider>
  );
}

export default App;