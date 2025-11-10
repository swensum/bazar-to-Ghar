// ProductDetail.tsx
import { type JSX, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import styles from "./ProductDetail.module.scss";
import refreshImage from "../assets/side-banner.webp";
import dealbanner from "../assets/dealbanner.webp";
import productImage from "../assets/collection-banner.jpg";
import { useProduct } from "../contexts/ProductContext";
import { useProductDetail } from "../contexts/ProductDetailContext";

export default function ProductDetail(): JSX.Element {
    const location = useLocation();
    const navigate = useNavigate()
    const { setSelectedProduct } = useProductDetail();
    const {
        categories,
        selectedCategory,
        filteredProducts,
        loading,
        viewMode,
        sortBy,
        currentPage,
        maxPrice,
        sliderValues,
        selectedMaterials,
        availableMaterials,
        selectedProductTypes,
        availableProductTypes,
        selectedAvailability,
        setSelectedCategory,
        setViewMode,
        setSortBy,
        setCurrentPage,
        setSliderValues,
        setSelectedMaterials,
        applyPriceFilter,
        resetPriceFilter,
        resetMaterialFilter,
        fetchCategories,
        initializeFromNavigation,
        setSelectedProductTypes,
        resetProductTypeFilter,
        setSelectedAvailability,
        resetAvailabilityFilter,
    } = useProduct();

    const [isInitializing, setIsInitializing] = useState(true);
    const itemsPerPage = 8;

    useEffect(() => {
        const initialize = async () => {
            setIsInitializing(true);
            await fetchCategories();

            // Wait a bit for state to update, then initialize navigation
            setTimeout(() => {
                // Pass the entire location.state to handle all scenarios
                initializeFromNavigation(location.state);

                // Add a small delay to ensure everything is loaded
                setTimeout(() => {
                    setIsInitializing(false);
                }, 500);
            }, 100);
        };

        initialize();
    }, [location.state]);

    // Add this useEffect to scroll to selected category in sidebar
    useEffect(() => {
        if (selectedCategory && !isInitializing) {
            // Small delay to ensure DOM is updated
            setTimeout(() => {
                const selectedElement = document.querySelector(`[data-category-id="${selectedCategory.id}"]`);
                if (selectedElement) {
                    selectedElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            }, 100);
        }
    }, [selectedCategory, isInitializing]);

    const handleCategoryClick = (category: any) => {
        setSelectedCategory(category);
    };

    const handleMinSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.min(Number(e.target.value), sliderValues.max - 1);
        setSliderValues({ ...sliderValues, min: value });
    };

    const handleMaxSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.max(Number(e.target.value), sliderValues.min + 1);
        setSliderValues({ ...sliderValues, max: value });
    };

    const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.min(Math.max(0, Number(e.target.value)), sliderValues.max - 1);
        setSliderValues({ ...sliderValues, min: value });
    };

    const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.min(Math.max(sliderValues.min + 1, Number(e.target.value)), maxPrice);
        setSliderValues({ ...sliderValues, max: value });
    };

    const handleMaterialClick = (material: string) => {
        if (selectedMaterials.includes(material)) {
            setSelectedMaterials(selectedMaterials.filter(m => m !== material));
        } else {
            setSelectedMaterials([...selectedMaterials, material]);
        }
    };

    const handleResetMaterialFilter = () => {
        resetMaterialFilter();
    };

    const handleProductTypeClick = (productType: string) => {
        if (selectedProductTypes.includes(productType)) {
            setSelectedProductTypes(selectedProductTypes.filter(type => type !== productType));
        } else {
            setSelectedProductTypes([...selectedProductTypes, productType]);
        }
    };

    const handleResetProductTypeFilter = () => {
        resetProductTypeFilter();
    };

    const handleAvailabilityClick = (availability: string) => {
        if (selectedAvailability.includes(availability)) {
            setSelectedAvailability(selectedAvailability.filter(item => item !== availability));
        } else {
            setSelectedAvailability([...selectedAvailability, availability]);
        }
    };

    const handleResetAvailabilityFilter = () => {
        resetAvailabilityFilter();
    };

    const handleRefreshClick = () => {
        window.location.reload();

        resetPriceFilter();
        resetMaterialFilter();
        resetProductTypeFilter();
        resetAvailabilityFilter();
        setCurrentPage(1);
    };

    const renderStars = (rating: number = 0) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const strokeWidth = 2.5;
        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <svg key={`full-${i}`} width="16" height="16" viewBox="0 0 24 24" fill="#F5BE05" stroke="#F5BE05" strokeWidth={strokeWidth}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            );
        }

        if (hasHalfStar) {
            stars.push(
                <svg key="half" width="16" height="16" viewBox="0 0 24 24" fill="#F5BE05" stroke="#F5BE05" strokeWidth={strokeWidth}>
                    <defs>
                        <linearGradient id="half">
                            <stop offset="50%" stopColor="#F5BE05" />
                            <stop offset="50%" stopColor="transparent" />
                        </linearGradient>
                    </defs>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="url(#half)" />
                </svg>
            );
        }

        const emptyStars = 5 - stars.length;
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <svg key={`empty-${i}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F5BE05" strokeWidth={strokeWidth}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            );
        }

        return stars;
    };

    // Pagination logic
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

    if (isInitializing || loading) {
        return (
            <div className={styles.page}>
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <div className={styles.loadingText}>Loading products...</div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.bannerContainer}>
                <img src={dealbanner} alt="Banner" className={styles.bannerImage} />
            </div>

            <div className={styles.container}>
                <div className={styles.categoriesSidebar}>
                    <h3 className={styles.sidebarTitle}>Categories</h3>
                    <div className={styles.categoriesList}>
                        {categories.map((category) => (
                            <div
                                data-category-id={category.id}
                                key={category.id}
                                className={styles.categoryItem}
                                onClick={() => handleCategoryClick(category)}
                            >
                                <input
                                    type="checkbox"
                                    className={styles.checkbox}
                                    checked={selectedCategory?.id === category.id}
                                    readOnly
                                />
                                <span className={`${styles.categoryName} ${selectedCategory?.id === category.id ? styles.selected : ''}`}>
                                    {category.name}
                                </span>
                                <span className={styles.itemsCount}>({category.product_count})</span>
                            </div>
                        ))}
                    </div>
                    <div className={styles.horizontalBar}></div>
                    <div className={styles.filterText}>Filter</div>
                    {selectedCategory && (
                        <div className={styles.itemsCountText}>
                            {filteredProducts.length} products
                        </div>
                    )}

                    <div className={styles.horizontalBar}></div>

                    <div className={styles.priceRangeSection}>
                        <h4 className={styles.priceRangeTitle}>Price Range</h4>

                        <div className={styles.high}>
                            <h4 className={styles.hightext}>The highest price is ${maxPrice}</h4>
                            <a className={styles.resetButton} onClick={resetPriceFilter}>
                                Reset
                            </a>
                        </div>

                        <div className={styles.rangeSliderContainer}>
                            <div className={styles.sliderWrapper}>
                                <div className={styles.sliderTrack}>
                                    <div
                                        className={styles.sliderRange}
                                        style={{
                                            left: `${(sliderValues.min / maxPrice) * 100}%`,
                                            right: `${100 - (sliderValues.max / maxPrice) * 100}%`
                                        }}
                                    ></div>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max={maxPrice}
                                    value={sliderValues.min}
                                    onChange={handleMinSliderChange}
                                    className={`${styles.rangeSlider} ${styles.rangeMin}`}
                                />
                                <input
                                    type="range"
                                    min="0"
                                    max={maxPrice}
                                    value={sliderValues.max}
                                    onChange={handleMaxSliderChange}
                                    className={`${styles.rangeSlider} ${styles.rangeMax}`}
                                />
                            </div>
                        </div>
                        <div className={styles.priceInputs}>
                            <div className={styles.priceInputGroup}>
                                <label className={styles.priceLabel}>From</label>
                                <div className={styles.inputWithSymbol}>
                                    <span className={styles.currencySymbol}>$</span>
                                    <input
                                        type="number"
                                        className={styles.priceInput}
                                        placeholder="0"
                                        min="0"
                                        max={maxPrice}
                                        value={sliderValues.min}
                                        onChange={handleMinInputChange}
                                    />
                                </div>
                            </div>

                            <div className={styles.dashSeparator}>-</div>

                            <div className={styles.priceInputGroup}>
                                <label className={styles.priceLabel}>To</label>
                                <div className={styles.inputWithSymbol}>
                                    <span className={styles.currencySymbol}>$</span>
                                    <input
                                        type="number"
                                        className={styles.priceInput}
                                        placeholder={maxPrice.toString()}
                                        min="0"
                                        max={maxPrice}
                                        value={sliderValues.max}
                                        onChange={handleMaxInputChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.filterButtons}>
                            <button className={styles.applyButton} onClick={applyPriceFilter}>
                                Apply Filter
                            </button>
                        </div>
                    </div>

                    <div className={styles.horizontalBar}></div>

                    <div className={styles.materialRangeSection}>
                        <h4 className={styles.materialRangeTitle}>Material</h4>
                        <div className={styles.high}>
                            <h4 className={styles.hightext}>{selectedMaterials.length} selected</h4>
                            <a className={styles.resetButton} onClick={handleResetMaterialFilter}>
                                Reset
                            </a>
                        </div>
                        <div className={styles.materialsList}>
                            {availableMaterials.map((material) => {
                                // Calculate count for each material
                                const materialCount = filteredProducts.filter(product =>
                                    product.material === material
                                ).length;

                                return (
                                    <div
                                        key={material}
                                        className={styles.materialItem}
                                        onClick={() => handleMaterialClick(material)}
                                    >
                                        <input
                                            type="checkbox"
                                            className={styles.checkbox}
                                            checked={selectedMaterials.includes(material)}
                                            readOnly
                                        />
                                        <span className={`${styles.materialName} ${selectedMaterials.includes(material) ? styles.selected : ''}`}>
                                            {material}
                                        </span>
                                        <span className={styles.materialCount}>({materialCount})</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className={styles.horizontalBar}></div>

                    <div className={styles.productTypeSection}>
                        <h4 className={styles.productTypeTitle}>Product Type</h4>
                        <div className={styles.high}>
                            <h4 className={styles.hightext}>{selectedProductTypes.length} selected</h4>
                            <a className={styles.resetButton} onClick={handleResetProductTypeFilter}>
                                Reset
                            </a>
                        </div>

                        {/* Product Type options list - dynamically from availableProductTypes */}
                        <div className={styles.productTypesList}>
                            {availableProductTypes.map((productType) => {
                                // Calculate count for each product type
                                const productTypeCount = filteredProducts.filter(product =>
                                    product.product_types && product.product_types.includes(productType)
                                ).length;

                                return (
                                    <div
                                        key={productType}
                                        className={styles.productTypeItem}
                                        onClick={() => handleProductTypeClick(productType)}
                                    >
                                        <input
                                            type="checkbox"
                                            className={styles.checkbox}
                                            checked={selectedProductTypes.includes(productType)}
                                            readOnly
                                        />
                                        <span className={`${styles.productTypeName} ${selectedProductTypes.includes(productType) ? styles.selected : ''}`}>
                                            {productType}
                                        </span>
                                        <span className={styles.productTypeCount}>({productTypeCount})</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className={styles.horizontalBar}></div>

                    <div className={styles.availabilitySection}>
                        <h4 className={styles.availabilityTitle}>Availability</h4>
                        <div className={styles.high}>
                            <h4 className={styles.hightext}>{selectedAvailability.length} selected</h4>
                            <a className={styles.resetButton} onClick={handleResetAvailabilityFilter}>
                                Reset
                            </a>
                        </div>

                        <div className={styles.availabilityList}>
                            {['In Stock', 'Out of Stock'].map((availability) => {
                                // Calculate count for each availability option
                                const availabilityCount = filteredProducts.filter(product => {
                                    if (availability === 'In Stock') return product.in_stock === true;
                                    if (availability === 'Out of Stock') return product.in_stock === false;
                                    return false;
                                }).length;

                                return (
                                    <div
                                        key={availability}
                                        className={styles.availabilityItem}
                                        onClick={() => handleAvailabilityClick(availability)}
                                    >
                                        <input
                                            type="checkbox"
                                            className={styles.checkbox}
                                            checked={selectedAvailability.includes(availability)}
                                            readOnly
                                        />
                                        <span className={`${styles.availabilityName} ${selectedAvailability.includes(availability) ? styles.selected : ''}`}>
                                            {availability}
                                        </span>
                                        <span className={styles.availabilityCount}>({availabilityCount})</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className={styles.refreshSection}>
                        <div className={styles.refreshImageContainer}>
                            <img
                                src={refreshImage}
                                alt="Refresh"
                                className={styles.refreshImage}
                                onClick={handleRefreshClick}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.productSection}>
                    {selectedCategory && (
                        <div className={styles.categoryHeader}>
                            <h1 className={styles.categoryTitle}>
                                {selectedCategory.name} ({selectedCategory.product_count})
                            </h1>
                        </div>
                    )}

                    <div className={styles.productBannerContainer}>
                        <img src={productImage} alt="Product Banner" className={styles.productBannerImage} />
                    </div>

                    <div className={styles.controlsContainer}>
                        <div className={styles.viewControls}>
                            <button
                                className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
                                onClick={() => setViewMode('grid')}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="7" height="7"></rect>
                                    <rect x="14" y="3" width="7" height="7"></rect>
                                    <rect x="14" y="14" width="7" height="7"></rect>
                                    <rect x="3" y="14" width="7" height="7"></rect>
                                </svg>
                            </button>
                            <button
                                className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
                                onClick={() => setViewMode('list')}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="5" cy="7" r="1" fill="currentColor" />
                                    <circle cx="5" cy="12" r="1" fill="currentColor" />
                                    <circle cx="5" cy="17" r="1" fill="currentColor" />
                                    <line x1="9" y1="7" x2="19" y2="7" fill="currentColor" />
                                    <line x1="9" y1="12" x2="19" y2="12" fill="currentColor" />
                                    <line x1="9" y1="17" x2="19" y2="17" fill="currentColor" />
                                </svg>
                            </button>
                        </div>

                        <div className={styles.sortContainer}>
                            <span className={styles.sortLabel}>Sort by:</span>
                            <select
                                className={styles.sortDropdown}
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="default">Default</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="name">Name</option>
                                <option value="newest">Newest</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.longHorizontalBar}></div>
                    <div className={styles.productsContainer}>
                        {currentProducts.length > 0 ? (
                            viewMode === 'grid' ? (
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
                                                <div className={styles.productCardImageContainer}>
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        className={styles.productCardImage}
                                                    />
                                                    {!product.in_stock ? (
                                                        <div className={styles.outOfStock}>Out of Stock</div>
                                                    ) : product.discount_percentage > 0 ? (
                                                        <div className={styles.discountBadge}>-{product.discount_percentage}%</div>
                                                    ) : null}

                                                    <div className={styles.productOverlay}>
                                                        <div className={styles.actionIcons}>
                                                            <button className={styles.iconBtn} aria-label="Add to favorites">
                                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                                                </svg>
                                                            </button>
                                                            <button className={styles.iconBtn} aria-label="Add to cart">
                                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <circle cx="9" cy="21" r="1" />
                                                                    <circle cx="20" cy="21" r="1" />
                                                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
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
                                                            {renderStars(product.averageRating || 0)}
                                                        </div>
                                                        <span className={styles.reviewCount}>({product.reviewCount || 0})</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                // List View (new code)
                                <div className={styles.productsList}>
                                    {currentProducts.map((product) => {
                                        const discountedPrice = product.discount_percentage > 0
                                            ? product.price * (1 - product.discount_percentage / 100)
                                            : product.price;

                                        return (
                                            <div key={product.id} className={styles.productListItem} onClick={() => {
                            setSelectedProduct(product);
                            navigate(`/product/${product.id}`);
                          }}>
                                                <div className={styles.listItemImageContainer}>
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        className={styles.listItemImage}
                                                    />
                                                    {!product.in_stock ? (
                                                        <div className={styles.listOutOfStock}>Out of Stock</div>
                                                    ) : product.discount_percentage > 0 ? (
                                                        <div className={styles.listDiscountBadge}>-{product.discount_percentage}%</div>
                                                    ) : null}
                                                </div>

                                                <div className={styles.listItemContent}>
                                                    <h3 className={styles.listItemName}>{product.name}</h3>

                                                    {product.in_stock ? (
                                                        <div className={styles.listPriceContainer}>
                                                            {product.discount_percentage > 0 ? (
                                                                <div className={styles.listDiscountPriceRow}>
                                                                    <span className={styles.listDiscountedPrice}>${discountedPrice.toFixed(2)}</span>
                                                                    <span className={styles.listOriginalPrice}>${product.price.toFixed(2)}</span>
                                                                </div>
                                                            ) : (
                                                                <span className={styles.listNormalPrice}>${product.price.toFixed(2)}</span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className={styles.listOutOfStockText}>Currently Unavailable</div>
                                                    )}

                                                    <div className={styles.listItemReviews}>
                                                        <div className={styles.listStars}>
                                                            {renderStars(product.averageRating || 0)}
                                                        </div>
                                                        <span className={styles.listReviewCount}>({product.reviewCount || 0})</span>
                                                    </div>

                                                    <p className={styles.listItemDescription}>
                                                        {product.description || "Premium quality product with excellent features and durability."}
                                                    </p>

                                                    <div className={styles.listActionIcons}>
                                                        <button className={styles.listIconBtn} aria-label="Add to favorites">
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                                            </svg>
                                                        </button>
                                                        <button className={styles.listIconBtn} aria-label="Add to cart">
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <circle cx="9" cy="21" r="1" />
                                                                <circle cx="20" cy="21" r="1" />
                                                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )
                        ) : (
                            <div className={styles.noProducts}>
                                <p>No products found in {selectedCategory?.name} category.</p>
                            </div>
                        )}
                    </div>

                    {totalPages >= 1 && filteredProducts.length > 0 && (
                        <div className={styles.pagination}>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}