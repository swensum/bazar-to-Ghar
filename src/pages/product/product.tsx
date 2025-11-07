import { type JSX, useState, useEffect, useRef } from "react";
import { supabase } from "../../store/supabase";
import styles from "./ProductShowcase.module.scss";
import { useLocation, useNavigate } from "react-router-dom";
import { useProductDetail } from "../../contexts/ProductDetailContext";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
  in_stock: boolean;
  created_at: string;
  discount_percentage: number;
  product_types: string[]; 
  
  material: string | null; 
}

type ProductType = 'Best Seller' | 'Special Product' | 'New Product';
interface ProductShowcaseProps {
  initialFilter?: ProductType;
}
export default function ProductShowcase({ initialFilter }: ProductShowcaseProps): JSX.Element {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedType, setSelectedType] = useState<ProductType>(initialFilter || 'Best Seller');
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState(0);
  const { setSelectedProduct } = useProductDetail();
const navigate = useNavigate();

  const productsPerPage = 8;
  const trackRef = useRef<HTMLDivElement>(null);
const location = useLocation();

  const productTypes: ProductType[] = ['Best Seller', 'Special Product', 'New Product'];

  useEffect(() => {
    fetchProducts();
  }, []);
 useEffect(() => {
    if (location.state?.filterType) {
      setSelectedType(location.state.filterType);
    }
    
    if (location.state?.scrollToProducts) {
      setTimeout(() => {
        const element = document.getElementById('product-showcase');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location.state]);

  useEffect(() => {
    filterProductsByType();
  }, [products, selectedType]);

  useEffect(() => {
    setCurrentPage(0); 
  }, [filteredProducts]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data: productsData, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Ensure product_types is always an array, even if null/undefined
      const productsWithSafeTypes = (productsData || []).map(product => ({
        ...product,
        product_types: Array.isArray(product.product_types) ? product.product_types : []
      }));

      setProducts(productsWithSafeTypes);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProductsByType = () => {
    if (selectedType === 'New Product') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const newProducts = products.filter(product => 
        new Date(product.created_at) > thirtyDaysAgo
      );
      setFilteredProducts(newProducts);
    } else {
      // Filter products where the product_types array contains the selected type
      const filtered = products.filter(product => 
        Array.isArray(product.product_types) && 
        product.product_types.includes(selectedType)
      );
      setFilteredProducts(filtered);
    }
  };

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const currentProducts = filteredProducts.slice(
    currentPage * productsPerPage,
    (currentPage + 1) * productsPerPage
  );

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const renderStars = (rating: number = 4.5) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={`full-${i}`} width="16" height="16" viewBox="0 0 24 24" fill="#f5ab1e" stroke="#f5ab1e">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <svg key="half" width="16" height="16" viewBox="0 0 24 24" fill="#f5ab1e" stroke="#f5ab1e">
          <defs>
            <linearGradient id="half">
              <stop offset="50%" stopColor="#f5ab1e" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="url(#half)"/>
        </svg>
      );
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ddd">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      );
    }

    return stars;
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading products...</div>
      </div>
    );
  }

  return (
    <div id="product-showcase" className={styles.page}>
      <section className={styles.headerSection}>
        <h1 className={styles.mainHeading}>Our Products</h1>
        <p className={styles.subHeading}>Discover our amazing collection</p>
      </section>

      {/* Filter Options */}
      <section className={styles.filterSection}>
        <div className={styles.filterContainer}>
          {productTypes.map((type) => (
            <button
              key={type}
              className={`${styles.filterButton} ${
                selectedType === type ? styles.active : ''
              }`}
              onClick={() => setSelectedType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </section>

      {/* Products Carousel */}
      <section className={styles.productsSection}>
        <div className={styles.productsContainer}>
          {filteredProducts.length > 0 ? (
            <>

              {/* Products Carousel */}
              <div className={styles.carouselContainer}>
                <button 
                  className={`${styles.carouselArrow} ${styles.arrowLeft} ${currentPage === 0 ? styles.disabled : ''}`}
                  onClick={prevPage}
                  disabled={currentPage === 0}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6"/>
                  </svg>
                </button>

                <div className={styles.carouselViewport}>
                  <div className={styles.carouselTrack} ref={trackRef}>
                    <div className={styles.productsGrid}>
                      {currentProducts.map((product) => {
                        const discountedPrice = product.discount_percentage > 0 
                          ? product.price * (1 - product.discount_percentage / 100)
                          : product.price;

                        return (
                          <div key={product.id} className={styles.productCard} onClick={() => {
        setSelectedProduct(product);
        navigate(`/product/${product.id}`);
    }}>
                            <div className={styles.productImageContainer}>
                              <img 
                                src={product.image_url} 
                                alt={product.name}
                                className={styles.productImage}
                              />
                              {!product.in_stock ? (
                                <div className={styles.outOfStock}>Out of Stock</div>
                              ) : product.discount_percentage > 0 ? (
                                <div className={styles.discountBadge}>-{product.discount_percentage}%</div>
                              ) : null}
                              
                              {/* Display product type badges */}
                              {Array.isArray(product.product_types) && product.product_types.length > 0 && (
                                <div className={styles.productTypeBadges}>
                                  {product.product_types.map((type, index) => (
                                    <span key={index} className={styles.productTypeBadge}>
                                      {type}
                                    </span>
                                  ))}
                                </div>
                              )}
                              
                              <div className={styles.productOverlay}>
                                <div className={styles.actionIcons}>
                                  <button className={styles.iconBtn} aria-label="Add to favorites">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                    </svg>
                                  </button>
                                  <button className={styles.iconBtn} aria-label="Add to cart">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <circle cx="9" cy="21" r="1"/>
                                      <circle cx="20" cy="21" r="1"/>
                                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                            
                            <div className={styles.productInfo}>
                              <h3 className={styles.productName}>{product.name}</h3>
                              
                              {product.in_stock ? (
                                <div className={styles.priceContainer}>
                                  {product.discount_percentage > 0 ? (
                                    <div className={styles.discountPriceRow}>
                                      <span className={styles.discountedPrice}>${discountedPrice.toFixed(2)}</span>
                                      <span className={styles.originalPrice}>${product.price.toFixed(2)}</span>
                                    </div>
                                  ) : (
                                    <span className={styles.normalPrice}>${product.price.toFixed(2)}</span>
                                  )}
                                </div>
                              ) : (
                                <div className={styles.outOfStockText}>Currently Unavailable</div>
                              )}
                              
                              <div className={styles.productReviews}>
                                <div className={styles.stars}>
                                  {renderStars()}
                                </div>
                                <span className={styles.reviewCount}>(128)</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <button 
                  className={`${styles.carouselArrow} ${styles.arrowRight} ${currentPage === totalPages - 1 ? styles.disabled : ''}`}
                  onClick={nextPage}
                  disabled={currentPage === totalPages - 1}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              </div>

            
            </>
          ) : (
            <div className={styles.noProducts}>
              <p>No {selectedType.toLowerCase()} products found</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}