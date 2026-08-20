import { type JSX, useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserAlt } from "@fortawesome/free-regular-svg-icons";
import { faChevronDown, faBars, faTimes, faChevronLeft, faChevronRight, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { faHeart } from "@fortawesome/free-regular-svg-icons";
import { FiShoppingBag } from "react-icons/fi";
import { FaHeadphonesAlt } from "react-icons/fa";
import { dbLite } from "../store/firebaselite";
import { collection as fsCollection, getDocs, query, where, limit } from "firebase/firestore/lite";
import styles from "./Navbar.module.scss";
import logoImg from "../assets/logo.png";
import summerCollection from "../assets/kiwi.jpg";
import winterCollection from "../assets/juice.jpg";
import springCollection from "../assets/vegitable.jpg";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface NavbarProps {
  cartItemsCount: number;
  onCartClick: () => void;
}
const PRODUCT_HEADING_CATEGORY_MAP: Record<string, string[]> = {
  "Fresh Vegis": ["Vegetables", "Vegitables"],
  "Non Vegis": ["Meat", "Poultry", "Seafood"],
  "Frozen Items": ["Frozen"],
};

interface ShopProductItem {
  id: string;
  name: string;
  type: "product";
}

export default function Navbar({ cartItemsCount, onCartClick }: NavbarProps): JSX.Element {
  const [isScrolled, setIsScrolled] = useState(false);
  const [collectionDiscounts, setCollectionDiscounts] = useState<{ [key: string]: number }>({});
  const mainNavRef = useRef<HTMLDivElement>(null);
  const [navHeight, setNavHeight] = useState(0);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileNavStack, setMobileNavStack] = useState<Array<{ title: string, content: any }>>([]);
  const location = useLocation();
const { user, signOut } = useAuth();
const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
 
const handleSignOut = async () => {
  await signOut();
  setIsAccountMenuOpen(false);
  navigate('/');
};
  const [shopProducts, setShopProducts] = useState<Record<string, ShopProductItem[]>>({});

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (!isMobileMenuOpen) {
      setMobileNavStack([]);
    }
  };

  const handleMobileNavClick = (item: any) => {
    if (item.categories || item.options) {
      setMobileNavStack(prev => [...prev, {
        title: item.title,
        content: item.categories || item.options
      }]);
    } else {
      if (item.title === "Home") {
        navigate('/');
      }
      setIsMobileMenuOpen(false);
      setMobileNavStack([]);
    }
  };

  const handleMobileBack = () => {
    if (mobileNavStack.length > 0) {
      setMobileNavStack(prev => prev.slice(0, -1));
    }
  };

  const handleMobileItemClick = (item: any, parentTitle?: string) => {
    if (item && typeof item === 'object' && (item.type === 'category' || item.type === 'product')) {
      handleShopItemClick(item);
    } else if (parentTitle === "Home" && item === "New Arrivals") {
      handleNewArrivalsClick();
    } else if (parentTitle === "Blogs" || parentTitle === "Pages") {
      console.log(`Navigate to ${item} under ${parentTitle}`);
    } else if (typeof item === 'string') {
      console.log(`Navigate to ${item}`);
    }
    setIsMobileMenuOpen(false);
    setMobileNavStack([]);
  };

  const toggleDropdown = (title: string) => {
    setActiveDropdown(activeDropdown === title ? null : title);
  };

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

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
    setMobileNavStack([]);
  }, [location]);

  useEffect(() => {
    const fetchCollectionDiscounts = async () => {
      try {
        const collectionMappings = {
          "Summer": ["Fruits", "Berries", "Summer Fruits"],
          "Winter": ["Juices", "Drinks", "Beverages"],
          "Spring": ["Vegetables", "Greens", "Spring Veggies"]
        };

        const discounts: { [key: string]: number } = {};

        const productsRef = fsCollection(dbLite, "products");
        const snapshot = await getDocs(productsRef);
        const allProducts = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            discount_percentage: data.discountPercentage || 0,
            categories: Array.isArray(data.categories) ? data.categories : null,
          };
        });

        for (const [collectionName, categories] of Object.entries(collectionMappings)) {
          const products = allProducts.filter(
            (p) => p.categories !== null && p.discount_percentage > 0
          );

          const collectionProducts = products?.filter(product => {
            const cats = product.categories;
            return cats !== null && Array.isArray(cats) && categories.some(cat => cats.includes(cat));
          }) || [];

          const maxDiscount = collectionProducts.length > 0
            ? Math.max(...collectionProducts.map(p => p.discount_percentage))
            : 0;

          discounts[collectionName] = Math.round(maxDiscount);
        }

        setCollectionDiscounts(discounts);
      } catch (error) {
        console.error('Error fetching collection discounts:', error);
      }
    };

    fetchCollectionDiscounts();
  }, []);
  useEffect(() => {
    const fetchShopProducts = async () => {
      try {
        const productsRef = fsCollection(dbLite, "products");
        const snapshot = await getDocs(productsRef);
        const allProducts = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            name: data.name as string,
            categories: Array.isArray(data.categories) ? (data.categories as string[]) : [],
          };
        });

        const grouped: Record<string, ShopProductItem[]> = {};

        Object.entries(PRODUCT_HEADING_CATEGORY_MAP).forEach(([heading, tags]) => {
          const matches = allProducts.filter((p) =>
            p.categories.some((cat) => tags.includes(cat))
          );
         grouped[heading] = matches.map((p) => ({
  id: p.id,
  name: p.name,
  type: "product" as const,
}));
        });

        setShopProducts(grouped);
      } catch (error) {
        console.error('Error fetching shop products:', error);
      }
    };

    fetchShopProducts();
  }, []);

  const handleShopItemClick = async (item: { id?: string; name: string; type: string }) => {
    if (item.type === 'category') {
      try {
        const categoriesRef = fsCollection(dbLite, "categories");
        const q = query(categoriesRef, where("name", "==", item.name), limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) throw new Error("Category not found");

        const docSnap = snapshot.docs[0];
        const data = docSnap.data();
        const categoryData = {
          id: docSnap.id,
          name: data.name,
          image_url: data.imageUrl,
          description: data.description ?? null,
        };

        navigate('/products', {
          state: {
            selectedCategory: categoryData,
            filterType: 'category'
          }
        });
      } catch (error) {
        console.error('Error fetching category:', error);
        navigate('/products', {
          state: {
            selectedCategory: { name: item.name },
            filterType: 'category'
          }
        });
      }
    } else if (item.type === 'product') {
      if (item.id) {
        // We already have the real Firestore document id from
        // fetchShopProducts — no name search needed, so this can never
        // point at a nonexistent product.
        navigate(`/product/${item.id}`, {
          state: {
            productId: item.id
          }
        });
      } else {
        // Fallback path, kept for any legacy string-only product entries
        // that don't carry an id.
        try {
          const productsRef = fsCollection(dbLite, "products");
          const snapshot = await getDocs(productsRef);
          const match = snapshot.docs.find((docSnap) => {
            const name = docSnap.data().name as string;
            return name?.toLowerCase().includes(item.name.toLowerCase());
          });

          if (!match) throw new Error("Product not found");

          const productData = { id: match.id, ...match.data() };

          navigate(`/product/${match.id}`, {
            state: {
              product: productData
            }
          });
        } catch (error) {
          console.error('Error fetching product:', error);
          navigate('/products', {
            state: {
              searchTerm: item.name,
              filterType: 'product'
            }
          });
        }
      }
    }
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
    setMobileNavStack([]);
  };

  const handleCollectionClick = async (collection: any) => {
    try {
      const categoriesRef = fsCollection(dbLite, "categories");
      const q = query(categoriesRef, where("name", "==", collection.category), limit(1));
      const snapshot = await getDocs(q);

      if (snapshot.empty) throw new Error("Category not found");

      const docSnap = snapshot.docs[0];
      const data = docSnap.data();
      const categoryData = {
        id: docSnap.id,
        name: data.name,
        image_url: data.imageUrl,
        description: data.description ?? null,
      };

      navigate('/products', {
        state: {
          selectedCategory: categoryData
        }
      });
    } catch (error) {
      console.error('Error fetching category:', error);
      navigate('/products', {
        state: {
          selectedCategory: { name: collection.category }
        }
      });
    }
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
    setMobileNavStack([]);
  };

  const menuItems = [
    { title: "Home", options: ["New Arrivals"] },
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
          items: shopProducts["Fresh Vegis"] || [],
        },
        {
          heading: "Non Vegis",
          items: shopProducts["Non Vegis"] || [],
        },
        {
          heading: "Frozen Items",
          items: shopProducts["Frozen Items"] || [],
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
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
    setMobileNavStack([]);
  };

  const handleLogoClick = () => {
    if (location.pathname === '/') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      navigate('/', { replace: true });
    }
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
    setMobileNavStack([]);
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
            

<div className={styles.accountBox} onClick={() => user && setIsAccountMenuOpen((v) => !v)}>
  <FontAwesomeIcon icon={faUserAlt} className={styles.accountIcon} />
  <div className={styles.accountText}>
    {user ? (
      <>
        <p className={styles.accountLabel}>ACCOUNT</p>
        <span style={{ cursor: 'pointer' }}>
          {user.displayName || user.email?.split('@')[0]}
        </span>
      </>
    ) : (
      <>
        <p className={styles.accountLabel}>ACCOUNT</p>
        <div className={styles.accountLinks}>
          <a onClick={() => navigate('/signup')} style={{ cursor: 'pointer' }}>Register</a>
          <span>|</span>
          <a onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>Login</a>
        </div>
      </>
    )}
  </div>

  {user && isAccountMenuOpen && (
    <div className={styles.accountDropdown} onClick={(e) => e.stopPropagation()}>
      <button onClick={handleSignOut} className={styles.signOutButton}>
        Sign out
      </button>
    </div>
  )}
</div>

            <FontAwesomeIcon icon={faHeart} className={styles.icon} />

            {/* Updated Cart Icon with Count */}
            <div className={styles.cartIconContainer}>
              <FiShoppingBag
                className={styles.icon}
                onClick={onCartClick}
                style={{ cursor: 'pointer' }}
              />
              {cartItemsCount > 0 && (
                <span className={styles.cartCount}>{cartItemsCount}</span>
              )}
            </div>

            <button
              className={styles.mobileMenuToggle}
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              <FontAwesomeIcon
                icon={isMobileMenuOpen ? faTimes : faBars}
                className={styles.mobileMenuIcon}
              />
            </button>
          </div>
        </div>

        <div className={styles.horizontalBar}></div>

        {/* Desktop Navigation */}
        <nav className={`${styles.navMenu} ${isMobileMenuOpen ? styles.mobileOpen : ''}`}>
          <div className={styles.navLinks}>
            {menuItems.map((item, index) => (
              <div
                key={index}
                className={`${styles.navItem} ${activeDropdown === item.title ? styles.active : ''}`}
                onClick={() => window.innerWidth <= 768 && toggleDropdown(item.title)}
              >
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

        {/* Mobile Navigation Overlay */}
        {isMobileMenuOpen && (
          <div className={styles.mobileMenuOverlay} onClick={toggleMobileMenu} />
        )}

        {/* Mobile Side Menu */}
        <div className={`${styles.mobileSideMenu} ${isMobileMenuOpen ? styles.mobileSideMenuOpen : ''}`}>
          <div className={styles.mobileMenuHeader}>
            {mobileNavStack.length > 0 ? (
              <>
                <button className={styles.mobileBackButton} onClick={handleMobileBack}>
                  <FontAwesomeIcon icon={faChevronLeft} className={styles.backIcon} />
                </button>
                <span className={styles.mobileMenuTitle}>{mobileNavStack[mobileNavStack.length - 1].title}</span>
              </>
            ) : (
              <span className={styles.mobileMenuTitle}>Menu</span>
            )}
            <button className={styles.mobileCloseButton} onClick={toggleMobileMenu}>
              <FontAwesomeIcon icon={faTimes} className={styles.closeIcon} />
            </button>
          </div>

          <div className={styles.mobileMenuContent}>
            {mobileNavStack.length === 0 ? (
              <div className={styles.mobileMainMenu}>
                {menuItems.map((item, index) => (
                  item.title !== "Collection" && (
                    <div
                      key={index}
                      className={styles.mobileMenuItem}
                      onClick={() => handleMobileNavClick(item)}
                    >
                      <span className={styles.mobileMenuText}>{item.title}</span>
                      {(item.categories || item.options) && (
                        <FontAwesomeIcon icon={faChevronRight} className={styles.mobileMenuArrow} />
                      )}
                    </div>
                  )
                ))}
              </div>
            ) : (
              <div className={styles.mobileSubMenu}>
                {mobileNavStack[mobileNavStack.length - 1].content && (
                  <>
                    {mobileNavStack[mobileNavStack.length - 1].title === "Shop" ? (
                      // Shop categories
                      mobileNavStack[mobileNavStack.length - 1].content.map((category: any, index: number) => (
                        <div key={index} className={styles.mobileCategorySection}>
                          <h4 className={styles.mobileCategoryHeading}>{category.heading}</h4>
                          <div className={styles.mobileCategoryItems}>
                            {category.items.map((item: any, itemIndex: number) => (
                              <div
                                key={itemIndex}
                                className={styles.mobileSubMenuItem}
                                onClick={() => handleMobileItemClick(item)}
                              >
                                <span className={styles.mobileSubMenuText}>{item.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      // Home, Blogs, Pages options
                      mobileNavStack[mobileNavStack.length - 1].content.map((option: string, index: number) => (
                        <div
                          key={index}
                          className={styles.mobileSubMenuItem}
                          onClick={() => handleMobileItemClick(option, mobileNavStack[mobileNavStack.length - 1].title)}
                        >
                          <span className={styles.mobileSubMenuText}>{option}</span>
                        </div>
                      ))
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {mobileNavStack.length === 0 && (
            <div className={styles.mobileHotline}>
              <FaHeadphonesAlt className={styles.mobileHotlineIcon} />
              <div className={styles.mobileHotlineTextContainer}>
                <span className={styles.mobileHotlineText}>Hotline:</span>
                <span className={styles.mobileHotlineNumber}>+1 234 567 890</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}





