import { type JSX, useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { dbLite } from "../store/firebaselite";
import { collection, getDocs } from "firebase/firestore/lite";
import Slider from "react-slick";
import styles from "./Home.module.scss";
import heroImg1 from "../assets/slider1.webp";
import heroImg2 from "../assets/slider2.webp";
import heroImg3 from "../assets/slider3.jpg";
import logo from "../assets/logo.png";
import category1 from "../assets/banner1.jpg";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import category2 from "../assets/banner2.jpg";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import CategoryPage from "./category/category";
import TrendingProducts from "./trending/trending";
import BannerSection from "./banner/banner";
import CustomerReviews from "../reviews/CustomerReviews";
import SubscribePage from "../subscribtion/ SubscribePage";
import Blog from "./blog/blog";
import ProductShowcase from "./product/product";
import { useActiveOffer } from "../hooks/useActiveOffer";

interface Category {
  image: string;
  title: string;
  description: string;
  buttonText: string;
  category: string;
  discountPercent?: string | null;
  averageDiscount?: number;
  productsOnSale?: number;
  hasDiscount?: boolean;
}

interface Slide {
  image: string;
  saleTag: string;
  title: string;
  buttonText: string;
  alignment: string;
  showLogo?: boolean;
}

const slides: Slide[] = [
  {
    image: heroImg1,
    saleTag: "Summer vege sale",
    title: "Fresh fruits\n& vegetables",
    buttonText: "Shop now",
    alignment: "left",
  },
  {
    image: heroImg2,
    saleTag: "Organic specials",
    title: "Prod of Nepal\n100% of packaging",
    buttonText: "Shop now",
    alignment: "right",
  },
  {
    image: heroImg3,
    saleTag: "Top selling!",
    title: "Fresh for your\nhealth",
    buttonText: "Shop now",
    alignment: "center",
    showLogo: true,
  }
];

const baseCategories: Category[] = [
  {
    image: category1,
    title: "Fresh Fruits",
    description: "Organic fruits from local farms",
    buttonText: "Shop now",
    category: "Fruits"
  },
  {
    image: category2,
    title: "Vegetables",
    description: "Fresh vegetables daily delivered",
    buttonText: "Shop now",
    category: "Vegitables"
  }
];

export default function Home(): JSX.Element {
  useDocumentTitle(); 
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState(baseCategories);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sliderRef = useRef<Slider>(null);
  const navigate = useNavigate();
  const location = useLocation();
 const { activeOffer } = useActiveOffer();
  useEffect(() => {
    // Check if mobile on component mount and on resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Trigger entrance animations after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
  const applyCategoryDiscounts = async () => {
    try {
      let productCountByCategory: Record<string, number> = {};

      // Only bother counting products if there's an active offer to show badges for
      if (activeOffer && activeOffer.applicable_categories.length > 0) {
        const productsRef = collection(dbLite, "products");
        const snapshot = await getDocs(productsRef);

        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          const cats: string[] = Array.isArray(data.categories) ? data.categories : [];
          cats.forEach((cat) => {
            productCountByCategory[cat] = (productCountByCategory[cat] || 0) + 1;
          });
        });
      }

      const updatedCategories = baseCategories.map((baseCategory) => {
        const isOnOffer =
          !!activeOffer && activeOffer.applicable_categories.includes(baseCategory.category);

        return {
          ...baseCategory,
          averageDiscount: isOnOffer ? activeOffer!.discount_percentage : 0,
          productsOnSale: isOnOffer ? (productCountByCategory[baseCategory.category] || 0) : 0,
          hasDiscount: isOnOffer,
        };
      });

      setCategories(updatedCategories);
    } catch (error) {
      console.error('Error applying category discounts:', error);
    }
  };

  applyCategoryDiscounts();
}, [activeOffer]);

  const handleSlideShopNow = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate('/products', {
      state: {
        selectedCategory: 'all-products'
      }
    });
  };

  const handleCategoryShopNow = (e: React.MouseEvent<HTMLAnchorElement>, categoryName: string) => {
    e.preventDefault();
    navigate('/products', {
      state: {
        selectedCategory: categoryName
      }
    });
  };

  const sliderSettings = {
    dots: false,
    arrows: !isMobile, // Hide arrows on mobile
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 6000,
    pauseOnHover: true,
    adaptiveHeight: true,
    cssEase: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    nextArrow: isMobile ? <></> : <NextArrow />, // Empty fragment on mobile
    prevArrow: isMobile ? <></> : <PrevArrow />, // Empty fragment on mobile
    beforeChange: (_current: number, next: number) => {
      setCurrentSlide(next);
    }
  };

  const goToSlide = (index: number) => {
    if (sliderRef.current) {
      sliderRef.current.slickGoTo(index);
    }
  };

  const getAlignmentClass = (alignment: string) => {
    switch (alignment) {
      case 'left':
        return styles.overlayLeft;
      case 'right':
        return styles.overlayRight;
      case 'center':
        return styles.overlayCenter;
      default:
        return styles.overlayLeft;
    }
  };

  return (
    <main className={`${styles.page} ${isVisible ? styles.pageVisible : ''}`}>
      {/* Hero Slider Section */}
      <section className={`${styles.heroSlider} ${isVisible ? styles.sectionVisible : ''}`}>
        <Slider
          ref={sliderRef}
          {...sliderSettings}
          className={styles.slider}
        >
          {slides.map((slide, index) => (
            <div key={index} className={styles.slideContainer}>
              <div
                className={styles.slide}
                style={{
                  backgroundImage: `url(${slide.image})`,
                }}
                role="img"
                aria-label={`Slide ${index + 1}`}
              >
                <div className={`${styles.overlay} ${getAlignmentClass(slide.alignment)}`}>
                  {slide.showLogo && (
                    <div className={styles.logoContainer}>
                      <img
                        src={logo}
                        alt="Company Logo"
                        className={styles.logo}
                      />
                    </div>
                  )}
                  <div className={styles.saleTag}>{slide.saleTag}</div>
                  <h1 className={styles.title}>
                    {slide.title.split('\n').map((line, lineIndex) => (
                      <span key={lineIndex}>
                        {line}
                        {lineIndex < slide.title.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </h1>
                  <a
                    href="/products"
                    className={styles.shopNowBtn}
                    onClick={handleSlideShopNow}
                  >
                    {slide.buttonText}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </Slider>

        {/* Custom Indicators - Connected to slider state */}
        <div className={styles.indicators}>
          {slides.map((_, index) => (
            <span
              key={index}
              className={`${styles.indicator} ${index === currentSlide ? styles.active : ""
                }`}
              onClick={() => goToSlide(index)}
              aria-current={index === currentSlide ? "true" : undefined}
              role="button"
              tabIndex={0}
            />
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className={`${styles.categoriesSection} ${isVisible ? styles.sectionVisible : ''}`}>
        <div className={styles.categoriesContainer}>
          {categories.map((category, index) => (
            <div 
              key={index} 
              className={styles.categoryCard}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div
                className={styles.categoryImage}
                style={{
                  backgroundImage: `url(${category.image})`
                }}
              >
                {/* Only show discount circle if category has products on sale */}
                {category.hasDiscount && (
                  <div className={`${styles.discountCircle} ${index === 0 ? styles.discountCircleGreen : styles.discountCircleOrange}`}>
                    <div className={styles.discountContent}>
                      <span className={styles.discountPercent}>
                        {category.averageDiscount}%<br />OFF
                      </span>
                    </div>
                  </div>
                )}

                <div className={styles.categoryOverlay}>
                  <h3 className={styles.categoryTitle}>{category.title}</h3>
                  <p className={styles.categoryDescription}>{category.description}</p>

                  <a
                    href={`/products?category=${encodeURIComponent(category.category)}`}
                    className={styles.categoryShopBtn}
                    onClick={(e) => handleCategoryShopNow(e, category.category)}
                  >
                    {category.buttonText}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Other Sections with Staggered Animations */}
      <div className={`${isVisible ? styles.sectionVisible : ''}`}>
        <CategoryPage />
      </div>
      
      <div className={`${isVisible ? styles.sectionVisible : ''}`} style={{ animationDelay: '0.1s' }}>
        <TrendingProducts />
      </div>
      
      <div className={`${isVisible ? styles.sectionVisible : ''}`} style={{ animationDelay: '0.2s' }}>
        <BannerSection />
      </div>
      
      <div className={`${isVisible ? styles.sectionVisible : ''}`} style={{ animationDelay: '0.3s' }}>
        <ProductShowcase 
          initialFilter={location.state?.filterType} 
        />
      </div>
      
      <div className={`${isVisible ? styles.sectionVisible : ''}`} style={{ animationDelay: '0.4s' }}>
        <CustomerReviews />
      </div>
      
      <div className={`${isVisible ? styles.sectionVisible : ''}`} style={{ animationDelay: '0.5s' }}>
        <Blog />
      </div>
      
      <div className={`${isVisible ? styles.sectionVisible : ''}`} style={{ animationDelay: '0.6s' }}>
        <SubscribePage />
      </div>
    </main>
  );
}

// Arrow components - will be hidden on mobile
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