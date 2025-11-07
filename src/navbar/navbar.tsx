import { type JSX, useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserAlt } from "@fortawesome/free-regular-svg-icons";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { faHeart } from "@fortawesome/free-regular-svg-icons";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FiShoppingBag } from "react-icons/fi";
import { FaHeadphonesAlt } from "react-icons/fa"; 
import { supabase } from "../store/supabase";
import styles from "./Navbar.module.scss";
import logoImg from "../assets/logo.png";
import summerCollection from "../assets/kiwi.jpg";
import winterCollection from "../assets/juice.jpg";
import springCollection from "../assets/vegitable.jpg";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar(): JSX.Element {
  const [isScrolled, setIsScrolled] = useState(false);
  const [collectionDiscounts, setCollectionDiscounts] = useState<{[key: string]: number}>({});
  const mainNavRef = useRef<HTMLDivElement>(null);
  const [navHeight, setNavHeight] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (mainNavRef.current) {
      setNavHeight(mainNavRef.current.offsetHeight);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch collection discounts from products
  useEffect(() => {
    const fetchCollectionDiscounts = async () => {
      try {
        const collectionMappings = {
          "Summer": ["Fruits", "Berries", "Summer Fruits"],
          "Winter": ["Juices", "Drinks", "Beverages"],
          "Spring": ["Vegetables", "Greens", "Spring Veggies"]
        };

        const discounts: {[key: string]: number} = {};

        for (const [collection, categories] of Object.entries(collectionMappings)) {
          const { data: products, error } = await supabase
            .from('products')
            .select('discount_percentage, categories')
            .not('categories', 'is', null)
            .gt('discount_percentage', 0);

          if (error) continue;

          const collectionProducts = products?.filter(product => 
            product.categories && 
            Array.isArray(product.categories) &&
            categories.some(cat => product.categories.includes(cat))
          ) || [];

          const maxDiscount = collectionProducts.length > 0 
            ? Math.max(...collectionProducts.map(p => p.discount_percentage))
            : 0;

          discounts[collection] = Math.round(maxDiscount);
        }

        setCollectionDiscounts(discounts);
      } catch (error) {
        console.error('Error fetching collection discounts:', error);
      }
    };

    fetchCollectionDiscounts();
  }, []);

  const menuItems = [
    { title: "Home", options: ["New Arrivals"]},
    {
      title: "Shop",
      categories: [
        {
          heading: "Fresh Food",
          items: ["Fruits", "Dairy", "Bakery", "Drinks"],
        },
        {
          heading: "Fresh Vegis",
          items: ["Tomato", "Spinach", "Cucumber", "Broccoli"],
        },
        {
          heading: "Non Vegis",
          items: ["Chicken", "Fish", "Mutton", "Eggs"],
        },
        {
          heading: "Frozen Items",
          items: ["Frozen Pizza", "Ice Cream", "French Fries", "Peas"],
        },
      ],
    },
    { 
      title: "Collection", 
      type: "image-grid",
      collections: [
        { 
          name: "Summer", 
          image: summerCollection,
          description: "Fresh & Light",
          category: "Fruits",
          overlayText: {
            line1: "Fresh & Safe",
            line2: "Fruits",
            line3: `upto ${collectionDiscounts["Summer"] || 15}% off on all products`
          }
        },
        { 
          name: "Winter", 
          image: winterCollection,
          description: "Warm & Cozy",
          category: "Beverages",
          overlayText: {
            line1: "Healthy & Fresh",
            line2: "Juices",
            line3: `upto ${collectionDiscounts["Winter"] || 20}% off on all products`
          }
        },
        { 
          name: "Spring", 
          image: springCollection,
          description: "Bright & Blooming",
          category: "Vegitables",
          overlayText: {
            line1: "Fresh & Safe",
            line2: "Vegetables",
            line3: `upto ${collectionDiscounts["Spring"] || 25}% off on all products`
          }
        }
      ]
    },
    { title: "Blogs", options: ["Latest", "Tips", "Guides"] },
    { title: "Pages", options: ["About Us", "Contact Us", "FAQ"] },
  ];

const handleNewArrivalsClick = () => {
  if (location.pathname === '/') {
    const productSection = document.getElementById('product-showcase');
    if (productSection) {
      productSection.scrollIntoView({ behavior: 'smooth' });
    }
  } else {
    navigate('/', { 
      state: { 
        scrollToProducts: true,
        filterType: 'New Product'
      } 
    });
  }
};
  const handleCollectionClick = (collection: any) => {
    navigate('/products', { 
      state: { 
        selectedCategory: collection.category 
      } 
    });
  };

  // Modern smooth logo click handler
  const handleLogoClick = () => {
    if (location.pathname === '/') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      // Navigate to homepage
      navigate('/', { replace: true });
    }
  };

  return (
    <header className={styles.header}>
      {!isScrolled && (
        <div className={styles.topBar}>
          <p>Free shipping orders from all items</p>
        </div>
      )}

      {isScrolled && <div style={{ height: `${navHeight}px` }} />}

      <div 
        ref={mainNavRef}
        className={`${styles.mainNav} ${isScrolled ? styles.mainNavSticky : ''}`}
      >
        <div className={styles.mainBar}>
          <div 
            className={styles.logo} 
            onClick={handleLogoClick}
            style={{ cursor: 'pointer' }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleLogoClick()}
          >
            <img src={logoImg} alt="Logo" />
          </div>

          <div className={styles.centerSection}>
            <div className={styles.searchBar}>
              <input
                type="text"
                placeholder="Search products..."
                className={styles.searchInput}
              />
              <button className={styles.searchButton}>
                <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} />
              </button>
            </div>
          </div>

          <div className={styles.rightSection}>
            <div className={styles.accountBox}>
              <FontAwesomeIcon icon={faUserAlt} className={styles.accountIcon} />
              <div className={styles.accountText}>
                <p className={styles.accountLabel}>ACCOUNT</p>
                <div className={styles.accountLinks}>
                  <a href="#">Register</a>
                  <span>|</span>
                  <a href="#">Login</a>
                </div>
              </div>
            </div>

            <FontAwesomeIcon icon={faHeart} className={styles.icon} />
            <FiShoppingBag className={styles.icon} />
          </div>
        </div>

        <div className={styles.horizontalBar}></div>

        <nav className={styles.navMenu}>
  <div className={styles.navLinks}>
    {menuItems.map((item, index) => (
      <div key={index} className={styles.navItem}>
        <span>{item.title}</span>
        <FontAwesomeIcon icon={faChevronDown} className={styles.navArrow} />

        <div className={`${styles.dropdown} ${item.categories ? styles.shopDropdown : item.type === 'image-grid' ? styles.collectionDropdown : styles.regularDropdown}`}>
          {item.categories ? (
            <div className={styles.shopContent}>
              {item.categories.map((cat, i) => (
                <div key={i} className={styles.shopCategory}>
                  <h4>{cat.heading}</h4>
                  <div className={styles.shopItems}>
                    {cat.items.map((itm, j) => (
                      <a key={j} href="#" className={styles.dropdownItem}>
                        {itm}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : item.type === 'image-grid' ? (
            <div className={styles.collectionContent}>
              {item.collections?.map((collection, i) => (
                <div 
                  key={i} 
                  className={styles.collectionItem}
                  onClick={() => handleCollectionClick(collection)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.collectionImageWrapper}>
                    <img 
                      src={collection.image} 
                      alt={collection.name} 
                      className={styles.collectionImage}
                    />
                    <div className={styles.collectionOverlay}>
                      <div className={styles.overlayContent}>
                        <p className={styles.overlayLine1}>{collection.overlayText?.line1}</p>
                        <h3 className={styles.overlayLine2}>{collection.overlayText?.line2}</h3>
                        <p className={styles.overlayLine3}>{collection.overlayText?.line3}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.regularContent}>
              {item.options?.map((opt, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className={styles.dropdownItem}
                  onClick={(e) => {
                    e.preventDefault();
                    if (opt === "New Arrivals") {
                      handleNewArrivalsClick();
                    }
                  }}
                >
                  {opt}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    ))}
  </div>

  <div className={styles.hotline}>
    <FaHeadphonesAlt className={styles.hotlineIcon} />
    <div className={styles.hotlineTextContainer}>
      <span className={styles.hotlineText}>Hotline:</span>
      <span className={styles.hotlineNumber}>+1 234 567 890</span>
    </div>
  </div>
</nav>
      </div>
    </header>
  );
}