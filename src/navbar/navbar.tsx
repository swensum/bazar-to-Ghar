import { type JSX, useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserAlt } from "@fortawesome/free-regular-svg-icons";
import { faChevronDown, faBars, faTimes, faChevronLeft, faChevronRight, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { faHeart } from "@fortawesome/free-regular-svg-icons";
import { FiShoppingBag } from "react-icons/fi";
import { FaHeadphonesAlt } from "react-icons/fa";
import styles from "./Navbar.module.scss";
import logoImg from "../assets/logo.png";
import summerCollection from "../assets/kiwi.jpg";
import winterCollection from "../assets/juice.jpg";
import springCollection from "../assets/vegitable.jpg";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // adjust path to match your project
import { useProduct } from "../contexts/ProductContext";
import { useCategories } from "../contexts/CategoryContext";
import { useFavorites } from "../contexts/FavoriteContext";
import { useProductDetail } from "../contexts/ProductDetailContext";

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

const MAX_SUGGESTIONS = 6;

export default function Navbar({ cartItemsCount, onCartClick }: NavbarProps): JSX.Element {
  const [isScrolled, setIsScrolled] = useState(false);
  const [collectionDiscounts, setCollectionDiscounts] = useState<{ [key: string]: number }>({});
  const mainNavRef = useRef<HTMLDivElement>(null);
  const [navHeight, setNavHeight] = useState(0);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileNavStack, setMobileNavStack] = useState<Array<{ title: string, content: any }>>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { currentUser, signOut } = useAuth();
  const { allProducts } = useProduct();
  const { categories } = useCategories();
  const [shopProducts, setShopProducts] = useState<Record<string, ShopProductItem[]>>({});
  const { favoritesCount } = useFavorites();
  const { setSelectedProduct, processProductData } = useProductDetail();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (!isMobileMenuOpen) {
      setMobileNavStack([]);
    }
  };
  const goHome = () => {
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

  const handleMobileNavClick = (item: any) => {
    if (item.title === "Home") {
      goHome();
      return;
    }

    if (item.categories || item.options) {
      setMobileNavStack(prev => [...prev, {
        title: item.title,
        content: item.categories || item.options
      }]);
    } else {
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
        handleShopItemClick(undefined, item);
    } else if (parentTitle === "Pages" && item === "Contact Us") {
        navigate('/contact');
    } else if (parentTitle === "Pages" && item === "About Us") {
        navigate('/about');
    } else if (parentTitle === "Pages" && item === "Blog") {
        navigate('/blogs');
    } else if (parentTitle === "Pages" && item === "FAQ") {
    navigate('/faq');
} else if (parentTitle === "Pages") {
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
    setShowSuggestions(false);
  }, [location]);

  // Close the suggestions dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (allProducts.length === 0) return;

    const collectionMappings = {
      "Summer": ["Fruits", "Berries", "Summer Fruits"],
      "Winter": ["Juices", "Drinks", "Beverages"],
      "Spring": ["Vegetables", "Greens", "Spring Veggies"]
    };

    const discounts: { [key: string]: number } = {};

    for (const [collectionName, categories] of Object.entries(collectionMappings)) {
      const collectionProducts = allProducts.filter((p) => {
        const cats = p.categories;
        return (
          p.discount_percentage > 0 &&
          cats !== undefined &&
          Array.isArray(cats) &&
          categories.some((cat) => cats.includes(cat))
        );
      });

      const maxDiscount = collectionProducts.length > 0
        ? Math.max(...collectionProducts.map(p => p.discount_percentage))
        : 0;

      discounts[collectionName] = Math.round(maxDiscount);
    }

    setCollectionDiscounts(discounts);
  }, [allProducts]);

  useEffect(() => {
    if (allProducts.length === 0) return;

    const grouped: Record<string, ShopProductItem[]> = {};

    Object.entries(PRODUCT_HEADING_CATEGORY_MAP).forEach(([heading, tags]) => {
      const matches = allProducts.filter((p) =>
        Array.isArray(p.categories) && p.categories.some((cat) => tags.includes(cat))
      );
      grouped[heading] = matches.map((p) => ({
        id: p.id,
        name: p.name,
        type: "product" as const,
      }));
    });

    setShopProducts(grouped);
  }, [allProducts]);

  const getShopItemHref = (item: { id?: string; name: string; type: string }) => {
    if (item.type === 'product' && item.id) {
      return `/product/${item.id}`;
    }
    return `/products?category=${encodeURIComponent(item.name)}`;
  };

  const handleShopItemClick = (
    e: React.MouseEvent<HTMLAnchorElement> | undefined,
    item: { id?: string; name: string; type: string }
  ) => {
    e?.preventDefault();

    if (item.type === 'category') {
      const categoryData = categories.find((c) => c.name === item.name);

      navigate('/products', {
        state: {
          selectedCategory: categoryData || { name: item.name },
          filterType: 'category'
        }
      });
    } else if (item.type === 'product') {
      if (item.id) {
        navigate(`/product/${item.id}`, {
          state: {
            productId: item.id
          }
        });
      } else {
        const match = allProducts.find((p) =>
          p.name?.toLowerCase().includes(item.name.toLowerCase())
        );

        if (match) {
          navigate(`/product/${match.id}`, {
            state: {
              product: match
            }
          });
        } else {
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
  const handleShopItemClickMobile = (item: { id?: string; name: string; type: string }) => {
    handleShopItemClick({ preventDefault: () => { } } as React.MouseEvent<HTMLAnchorElement>, item);
  };

  const getCollectionHref = (collection: any) =>
    `/products?category=${encodeURIComponent(collection.category)}`;

  const handleCollectionClick = (e: React.MouseEvent<HTMLAnchorElement>, collection: any) => {
    e.preventDefault();

    const categoryData = categories.find((c) => c.name === collection.category);

    navigate('/products', {
      state: {
        selectedCategory: categoryData || { name: collection.category }
      }
    });

    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
    setMobileNavStack([]);
  };

  // ---------------- Search + autocomplete ----------------

  const trimmedQuery = searchQuery.trim().toLowerCase();

  const searchSuggestions = trimmedQuery
    ? allProducts
      .filter((p) => p.name?.toLowerCase().includes(trimmedQuery))
      .slice(0, MAX_SUGGESTIONS)
    : [];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(e.target.value.trim().length > 0);
  };

  const handleSearchFocus = () => {
    if (searchQuery.trim().length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    navigate('/products', {
      state: {
        searchTerm: trimmed,
        filterType: 'product'
      }
    });

    setSearchQuery("");
    setShowSuggestions(false);
    setIsMobileMenuOpen(false);
  };

  const handleSuggestionClick = (product: any) => {
    const processedProduct = processProductData(product);
    setSelectedProduct(processedProduct);
    navigate(`/product/${product.id}`, {
      state: { productId: product.id }
    });

    setSearchQuery("");
    setShowSuggestions(false);
  };

  const menuItems = [
    { title: "Home" },
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
    { title: "Pages", options: ["About Us", "Blog", "Contact Us", "FAQ"] },
  ];

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    goHome();
  };

  const handleHomeNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    goHome();
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
          <a
            href="/"
            className={styles.logo}
            onClick={handleLogoClick}
          >
            <img src={logoImg} alt="Logo" />
          </a>

          <div className={styles.centerSection}>
            <div className={styles.searchWrapper} ref={searchWrapperRef}>
              <form className={styles.searchBar} onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  placeholder="Search products..."
                  className={styles.searchInput}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                  autoComplete="off"
                />
                <button type="submit" className={styles.searchButton} aria-label="Search">
                  <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} />
                </button>
              </form>

              {showSuggestions && (
                <div className={styles.searchSuggestions}>
                  {searchSuggestions.length > 0 ? (
                    <>
                      {searchSuggestions.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          className={styles.suggestionItem}
                          onClick={() => handleSuggestionClick(product)}
                        >
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className={styles.suggestionImage}
                          />
                          <div className={styles.suggestionText}>
                            <span className={styles.suggestionName}>{product.name}</span>
                            <span className={styles.suggestionPrice}>${product.price?.toFixed(2)}</span>
                          </div>
                        </button>
                      ))}
                      <button
                        type="button"
                        className={styles.suggestionSeeAll}
                        onClick={() => handleSearchSubmit()}
                      >
                        See all results for "{searchQuery.trim()}"
                      </button>
                    </>
                  ) : (
                    <div className={styles.noSuggestions}>
                      No products match "{searchQuery.trim()}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className={styles.rightSection}>
            <div className={styles.accountBox}>
              <FontAwesomeIcon icon={faUserAlt} className={styles.accountIcon} />
              <div className={styles.accountText}>
                {currentUser ? (
                  <>
                    <p className={styles.accountLabel}>
                      {currentUser.displayName || currentUser.email}
                    </p>
                    <div className={styles.accountLinks}>

                      <a href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          signOut();
                        }}
                      >
                        Logout
                      </a>
                    </div>
                  </>
                ) : (
                  <>
                    <p className={styles.accountLabel}>ACCOUNT</p>
                    <div className={styles.accountLinks}>
                      <a
                        href="/auth"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate('/auth', { state: { mode: 'signup' } });
                        }}
                      >
                        Register
                      </a>
                      <span>|</span>
                      <a
                        href="/auth"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate('/auth', { state: { mode: 'signin' } });
                        }}
                      >
                        Login
                      </a>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className={styles.favoriteIconContainer} onClick={() => navigate('/favorites')} style={{ cursor: 'pointer' }}>
              <FontAwesomeIcon icon={faHeart} className={styles.icon} />
              {favoritesCount > 0 && (
                <span className={styles.favoriteCount}>{favoritesCount}</span>
              )}
            </div>
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


        <nav className={`${styles.navMenu} ${isMobileMenuOpen ? styles.mobileOpen : ''}`}>
          <div className={styles.navLinks}>
            {menuItems.map((item, index) => {
              const isHome = item.title === "Home";

              return (
                <div
                  key={index}
                  className={`${styles.navItem} ${activeDropdown === item.title ? styles.active : ''}`}
                  onClick={() => {
                    if (isHome) return; // handled by the <a> itself
                    if (window.innerWidth <= 768) {
                      toggleDropdown(item.title);
                    }
                  }}
                >
                  {isHome ? (
                    <a href="/" onClick={handleHomeNavClick}>
                      Home
                    </a>
                  ) : (
                    <span>{item.title}</span>
                  )}

                  {!isHome && (
                    <FontAwesomeIcon icon={faChevronDown} className={styles.navArrow} />
                  )}

                  {!isHome && (
                    <div className={`${styles.dropdown} ${item.categories ? styles.shopDropdown : item.type === 'image-grid' ? styles.collectionDropdown : styles.regularDropdown}`}>
                      {item.categories ? (
                        <div className={styles.shopContent}>
                          {item.categories.map((cat, i) => (
                            <div key={i} className={styles.shopCategory}>
                              <h4>{cat.heading}</h4>
                              <div className={styles.shopItems}>
                                {cat.items.map((itm, j) => (
                                  <a
                                    key={j}
                                    href={getShopItemHref(itm)}
                                    className={styles.dropdownItem}
                                    onClick={(e) => handleShopItemClick(e, itm)}
                                  >
                                    {itm.name}
                                  </a>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : item.type === 'image-grid' ? (
                        <div className={styles.collectionContent}>
                          {item.collections?.map((collection, i) => (
                            <a
                              key={i}
                              href={getCollectionHref(collection)}
                              className={styles.collectionItem}
                              onClick={(e) => handleCollectionClick(e, collection)}
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
                            </a>
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
                                if (opt === "Contact Us") {
                                  navigate('/contact');
                                  setActiveDropdown(null);
                                } else if (opt === "About Us") {
                                  navigate('/about');
                                  setActiveDropdown(null);
                                } else if (opt === "Blog") {
                                  navigate('/blogs');
                                  setActiveDropdown(null);
                                 } else if (opt === "FAQ") {
  navigate('/faq');
  setActiveDropdown(null);
}else {
                                  console.log(`Navigate to ${opt}`);
                                }
                              }}
                            >
                              {opt}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className={styles.hotline}>
            <FaHeadphonesAlt className={styles.hotlineIcon} />
            <div className={styles.hotlineTextContainer}>
              <span className={styles.hotlineText}>Hotline:</span>
              <span className={styles.hotlineNumber}>+977 9867862670</span>
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
                    item.title === "Home" ? (
                      <a
                        key={index}
                        href="/"
                        className={styles.mobileMenuItem}
                        onClick={handleHomeNavClick}
                      >
                        <span className={styles.mobileMenuText}>Home</span>
                      </a>
                    ) : (
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
                              <a
                                key={itemIndex}
                                href={getShopItemHref(item)}
                                className={styles.mobileSubMenuItem}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleShopItemClickMobile(item);
                                }}
                              >
                                <span className={styles.mobileSubMenuText}>{item.name}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      // Pages options (About Us, Blog, Contact Us, FAQ)
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