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

  const handleShopItemClick = async (item: { name: string; type: string }) => {
  if (item.type === 'category') {
    try {
      // Fetch the full category data
      const { data: categoryData, error } = await supabase
        .from('categories')
        .select('*')
        .eq('name', item.name)
        .single();

      if (error) throw error;

      navigate('/products', { 
        state: { 
          selectedCategory: categoryData,
          filterType: 'category'
        } 
      });
    } catch (error) {
      console.error('Error fetching category:', error);
      // Fallback: navigate with just the name
      navigate('/products', { 
        state: { 
          selectedCategory: { name: item.name },
          filterType: 'category'
        } 
      });
    }
  } else if (item.type === 'product') {
    try {
      // Fetch the actual product data by name
      const { data: productData, error } = await supabase
        .from('products')
        .select('*')
        .ilike('name', `%${item.name}%`) // Use ilike for case-insensitive search
        .single();

      if (error) throw error;

      // Navigate to the actual product detail page
      navigate(`/product/${productData.id}`, { 
        state: { 
          product: productData
        } 
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      // Fallback: navigate to products page with search term
      navigate('/products', { 
        state: { 
          searchTerm: item.name,
          filterType: 'product'
        } 
      });
    }
  }
};
  const handleCollectionClick = async (collection: any) => {
    try {
      // Fetch the full category data for the collection
      const { data: categoryData, error } = await supabase
        .from('categories')
        .select('*')
        .eq('name', collection.category)
        .single();

      if (error) throw error;

      navigate('/products', { 
        state: { 
          selectedCategory: categoryData
        } 
      });
    } catch (error) {
      console.error('Error fetching category:', error);
      // Fallback
      navigate('/products', { 
        state: { 
          selectedCategory: { name: collection.category }
        } 
      });
    }
  };

  const menuItems = [
    { title: "Home", options: ["New Arrivals"]},
    {
      title: "Shop",
      categories: [
        {
          heading: "Fresh Food",
          items: [
            { name: "Fruits", type: "category" },
            { name: "Dairy", type: "category" },
            { name: "Bakery", type: "category" },
            { name: "Drinks", type: "category" }
          ],
        },
        {
          heading: "Fresh Vegis",
          items: [
            { name: "Tomato", type: "product" },
            { name: "Spinach", type: "product" },
            { name: "Cucumber", type: "product" },
            { name: "Broccoli", type: "product" }
          ],
        },
        {
          heading: "Non Vegis",
          items: [
            { name: "Chicken", type: "product" },
            { name: "Fish", type: "product" },
            { name: "Mutton", type: "product" },
            { name: "Eggs", type: "product" }
          ],
        },
        {
          heading: "Frozen Items",
          items: [
            { name: "Frozen Pizza", type: "product" },
            { name: "Ice Cream", type: "product" },
            { name: "French Fries", type: "product" },
            { name: "Peas", type: "product" }
          ],
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
                              <div 
                                key={j} 
                                className={styles.dropdownItem}
                                onClick={() => handleShopItemClick(itm)}
                                style={{ cursor: 'pointer' }}
                              >
                                {itm.name}
                              </div>
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