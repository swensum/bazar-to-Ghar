import { type JSX, useState, useEffect, useRef } from "react";
import { supabase } from "../../store/supabase";
import { useNavigate } from "react-router-dom";
import type { CategoryWithCount } from "../../types/category";
import styles from "./CategoryPage.module.scss";

export default function CategoryPage(): JSX.Element {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [config, setConfig] = useState(() => getItemConfig(window.innerWidth));
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [showArrows, setShowArrows] = useState(false);
  const [autoSlide, setAutoSlide] = useState(true);
  const [, setIsMobile] = useState(window.innerWidth <= 768);
  
  const autoSlideRef = useRef(autoSlide);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  const { visibleCount, itemWidth, gap } = config;
  const step = itemWidth + gap;
  const viewportWidth = visibleCount * itemWidth + (visibleCount - 1) * gap;

  // Create extended array for seamless rotation (triple the array for infinite effect)
  const extendedCategories = [...categories, ...categories, ...categories];

  // Keep ref in sync with state
  useEffect(() => {
    autoSlideRef.current = autoSlide;
  }, [autoSlide]);

  useEffect(() => {
    fetchCategoriesWithCount();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      const newConfig = getItemConfig(width);
      setConfig(newConfig);
      setCurrentIndex(0);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto slide effect
  useEffect(() => {
    if (categories.length <= visibleCount) return;

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
  }, [categories.length, visibleCount]);

  const fetchCategoriesWithCount = async () => {
    try {
      setLoading(true);
      console.log('Starting to fetch categories...');

      // Fetch categories from Supabase
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesError) {
        console.error('Categories fetch error:', categoriesError);
        throw categoriesError;
      }

      console.log('Fetched categories:', categoriesData);

      if (!categoriesData || categoriesData.length === 0) {
        console.log('No categories found');
        setCategories([]);
        return;
      }

      // Fetch all products once to avoid multiple requests
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, categories');

      if (productsError) {
        console.error('Products fetch error:', productsError);
        throw productsError;
      }

      console.log('Fetched products:', productsData);

      // Count products for each category by matching category names
      const categoriesWithCount = categoriesData.map((category) => {
        const productCount = productsData.filter((product) => {
          // Check if the product's categories array contains this category name
          if (!product.categories || !Array.isArray(product.categories)) {
            return false;
          }
          
          // Debug logging
          console.log(`Checking category ${category.name} in product:`, product.categories);
          
          return product.categories.includes(category.name);
        }).length;

        console.log(`Category ${category.name} has ${productCount} products`);

        return {
          ...category,
          product_count: productCount
        };
      });

      console.log('Final categories with counts:', categoriesWithCount);
      setCategories(categoriesWithCount);

    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category: CategoryWithCount) => {
    // Navigate to products page with category data
    navigate(`/products`, { 
      state: { 
        selectedCategory: category 
      } 
    });
  };

  const handleNext = () => {
    setCurrentIndex((prev) => {
      const next = prev + 1;
      
      if (next >= categories.length * 2) {
        setIsTransitioning(false);
        const newIndex = next - categories.length;
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
      
      // When we go before the middle section, jump to equivalent position in last section
      if (next < 0) {
        setIsTransitioning(false);
        const newIndex = next + categories.length;
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
    // Pause auto-slide when user clicks arrow
    setAutoSlide(false);
    
    // Perform the navigation
    if (direction === 'prev') {
      handlePrev();
    } else {
      handleNext();
    }
    
    // Resume auto-slide after 5 seconds of inactivity
    setTimeout(() => {
      setAutoSlide(true);
    }, 5000);
  };

  const handleCarouselHover = (isHovering: boolean) => {
    setShowArrows(isHovering);
    
    // Pause auto-slide when user hovers over carousel
    if (isHovering) {
      setAutoSlide(false);
    } else {
      // Resume auto-slide when user leaves (after a brief delay)
      setTimeout(() => {
        setAutoSlide(true);
      }, 1000);
    }
  };

  function getItemConfig(width: number) {
    if (width < 361) {
      return { visibleCount: 2, itemWidth: 80, gap: 20, circleSize: 70 }; // Smaller for very small screens
    } else if (width < 481) {
      return { visibleCount: 2, itemWidth: 90, gap: 25, circleSize: 80 }; // Smaller for small mobile
    } else if (width < 769) {
      return { visibleCount: 3, itemWidth: 100, gap: 30, circleSize: 90 }; // Smaller for tablets
    } else if (width < 1201) {
      return { visibleCount: 4, itemWidth: 130, gap: 60, circleSize: 120 }; // Normal for desktop
    } else {
      return { visibleCount: 6, itemWidth: 150, gap: 70, circleSize: 120 }; // Large for big screens
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading categories...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header Section */}
      <section className={styles.headerSection}>
        <h1 className={styles.mainHeading}>Shop by Category</h1>
      </section>

      {/* Categories Section with Carousel */}
      <section 
        className={styles.categoriesSection}
        onMouseEnter={() => handleCarouselHover(true)}
        onMouseLeave={() => handleCarouselHover(false)}
      >
        <div className={styles.categoriesContainer}>
          <div 
            className={styles.categoriesViewport} 
            style={{ width: `${viewportWidth}px` }}
          >
            <div 
              className={styles.categoriesTrack}
              style={{ 
                transform: `translateX(-${currentIndex * step}px)`,
                gap: `${gap}px`,
                transition: isTransitioning ? 'transform 0.5s ease-in-out' : 'none'
              }}
            >
              {extendedCategories.map((category, index) => (
                <div 
                  key={`${category.id}-${index}`} 
                  className={styles.categoryItem}
                  style={{ 
                    flex: `0 0 ${itemWidth}px`, 
                    width: `${itemWidth}px`,
                    '--circle-size': `${config.circleSize}px` // CSS custom property for circle size
                  } as React.CSSProperties}
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className={styles.categoryCircle}>
                    <div className={styles.categoryImageWrapper}>
                      <img 
                        src={category.image_url} 
                        alt={category.name}
                        className={styles.categoryImage}
                        onError={(e) => {
                          // Fallback for broken images
                          e.currentTarget.src = '/images/placeholder-category.jpg';
                        }}
                      />
                      <div className={styles.categoryOverlay}>
                        <div className={styles.overlayContent}>
                          <h3 className={styles.overlayText}>{category.name}</h3>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.itemsCount}>
                    {category.product_count} {category.product_count === 1 ? 'item' : 'items'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Arrows positioned outside the viewport */}
        {showArrows && categories.length > visibleCount && (
          <>
            <PrevArrow onClick={() => handleArrowClick('prev')} />
            <NextArrow onClick={() => handleArrowClick('next')} />
          </>
        )}
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