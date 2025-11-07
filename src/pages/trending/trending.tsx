import { type JSX, useState, useEffect, useRef } from "react";
import { supabase } from "../../store/supabase";
import styles from "./trending.module.scss";

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
}

export default function TrendingProducts(): JSX.Element {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [config, setConfig] = useState(() => getItemConfig(window.innerWidth));
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [showArrows, setShowArrows] = useState(false);
  const [autoSlide, setAutoSlide] = useState(true);
  
  const autoSlideRef = useRef(autoSlide);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { visibleCount, itemWidth, gap } = config;
  const step = itemWidth + gap;
  const viewportWidth = visibleCount * itemWidth + (visibleCount - 1) * gap;

  // Create extended array for seamless rotation
  const extendedProducts = [...products, ...products, ...products];

  // Keep ref in sync with state
  useEffect(() => {
    autoSlideRef.current = autoSlide;
  }, [autoSlide]);

  useEffect(() => {
    fetchTrendingProducts();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const newConfig = getItemConfig(window.innerWidth);
      setConfig(newConfig);
      setCurrentIndex(0);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto slide effect
  useEffect(() => {
    if (products.length <= visibleCount) return;

    const startAutoSlide = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        if (autoSlideRef.current) {
          handleNext();
        }
      }, 3000);
    };

    startAutoSlide();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [products.length, visibleCount]);

  const fetchTrendingProducts = async () => {
    try {
      setLoading(true);

      const { data: productsData, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(12); // Fetch 12 trending products for better sliding

      if (error) throw error;

      setProducts(productsData || []);
    } catch (error) {
      console.error('Error fetching trending products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => {
      const next = prev + 1;
      
      if (next >= products.length * 2) {
        setIsTransitioning(false);
        const newIndex = next - products.length;
        setTimeout(() => {
          setCurrentIndex(newIndex);
          setTimeout(() => setIsTransitioning(true), 50);
        }, 0);
        return newIndex;
      }
      
      return next;
    });
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => {
      const next = prev - 1;
      
      if (next < 0) {
        setIsTransitioning(false);
        const newIndex = next + products.length;
        setTimeout(() => {
          setCurrentIndex(newIndex);
          setTimeout(() => setIsTransitioning(true), 50);
        }, 0);
        return newIndex;
      }
      
      return next;
    });
  };

  const handleArrowClick = (direction: 'prev' | 'next') => {
    setAutoSlide(false);
    
    if (direction === 'prev') {
      handlePrev();
    } else {
      handleNext();
    }
    
    setTimeout(() => {
      setAutoSlide(true);
    }, 5000);
  };

  const handleCarouselHover = (isHovering: boolean) => {
    setShowArrows(isHovering);
    
    if (isHovering) {
      setAutoSlide(false);
    } else {
      setTimeout(() => {
        setAutoSlide(true);
      }, 1000);
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

  function getItemConfig(width: number) {
    // Always show 4 items, adjust width based on screen size
    if (width < 768) {
      return { visibleCount: 2, itemWidth: 200, gap: 20 }; // 2 items on mobile
    } else if (width < 1024) {
      return { visibleCount: 3, itemWidth: 220, gap: 25 }; // 3 items on tablet
    } else {
      return { visibleCount: 4, itemWidth: 280, gap: 30 }; // 4 items on desktop
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading trending products...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header Section */}
      <section className={styles.headerSection}>
        <h1 className={styles.mainHeading}>Trending Products</h1>
        <p className={styles.subHeading}>Discover our most popular items</p>
      </section>

      {/* Products Carousel Section */}
      <section 
        className={styles.productsSection}
        onMouseEnter={() => handleCarouselHover(true)}
        onMouseLeave={() => handleCarouselHover(false)}
      >
        <div className={styles.productsContainer}>
          <div 
            className={styles.productsViewport} 
            style={{ width: `${viewportWidth}px` }}
          >
            <div 
              className={styles.productsTrack}
              style={{ 
                transform: `translateX(-${currentIndex * step}px)`,
                gap: `${gap}px`,
                transition: isTransitioning ? 'transform 0.5s ease-in-out' : 'none'
              }}
            >
              {extendedProducts.map((product, index) => {
  const discountedPrice = product.discount_percentage > 0 
    ? product.price * (1 - product.discount_percentage / 100)
    : product.price;

  return (
    <div 
      key={`${product.id}-${index}`} 
      className={styles.productCard}
      style={{ flex: `0 0 ${itemWidth}px`, width: `${itemWidth}px` }}
    >
      <div className={styles.productImageContainer}>
        <img 
          src={product.image_url} 
          alt={product.name}
          className={styles.productImage}
        />
        {/* Show either out of stock OR discount badge at the same position */}
        {!product.in_stock ? (
          <div className={styles.outOfStock}>Out of Stock</div>
        ) : product.discount_percentage > 0 ? (
          <div className={styles.discountBadge}>-{product.discount_percentage}%</div>
        ) : null}
        
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
        
        {/* Show prices only if item is in stock */}
        {product.in_stock ? (
          <div className={styles.priceContainer}>
            {product.discount_percentage > 0 ? (
              <>
                <div className={styles.discountPriceRow}>
                  <span className={styles.discountedPrice}>${discountedPrice.toFixed(2)}</span>
                  <span className={styles.originalPrice}>${product.price.toFixed(2)}</span>
                </div>
              </>
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
          
          {/* Arrows */}
          {showArrows && products.length > visibleCount && (
            <>
              <PrevArrow onClick={() => handleArrowClick('prev')} />
              <NextArrow onClick={() => handleArrowClick('next')} />
            </>
          )}
        </div>
      </section>
    </div>
  );
}

const NextArrow = (props: any) => {
  const { onClick } = props;
  return (
    <button 
      className={`${styles.arrow} ${styles.arrowRight}`}
      onClick={onClick}
      aria-label="Next slide"
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 6l6 6-6 6" />
        <path d="M12 6l6 6-6 6" />
      </svg>
    </button>
  );
};

const PrevArrow = (props: any) => {
  const { onClick } = props;
  return (
    <button 
      className={`${styles.arrow} ${styles.arrowLeft}`}
      onClick={onClick}
      aria-label="Previous slide"
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 18l-6-6 6-6" />
        <path d="M12 18l-6-6 6-6" />
      </svg>
    </button>
  );
};