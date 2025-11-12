import { type JSX, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProductDetail } from "../contexts/ProductDetailContext";
import styles from "./ProductItemDetailPage.module.scss";
import itembanner from "../assets/dealbanner.webp";
import esewaLogo from "../assets/esewa.png";
import khaltiLogo from "../assets/khalti.png";
import visaLogo from "../assets/visa.png";
import { useCart } from "../contexts/CartContext";

export default function ProductItemDetailPage(): JSX.Element {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
const { addToCart, openCart } = useCart();
    
    const [isFavorite, setIsFavorite] = useState(false);
    const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
    const [showThankYou, setShowThankYou] = useState(false);

    const {
        // State
        selectedProduct,
        currentImageIndex,
        selectedPackage,
        quantity,
        reviews,
        relatedProducts,
        randomProducts,
        isSubmitting,
        submitSuccess,
        loadingRandom,
        reviewTitle,
        isWritingReview,
        reviewRating,
        reviewText,
        reviewerName,
        reviewerEmail,

        // Actions
        setCurrentImageIndex,
        setSelectedPackage,
        setQuantity,
        resetProductDetail,
        setReviewTitle,
        setIsWritingReview,
        setReviewRating,
        setReviewText,
        setReviewerName,
        setReviewerEmail,
        setSubmitSuccess,

        // Functions
        fetchProductDetail,
        fetchReviews,
        fetchRelatedProducts,
        fetchRandomProducts,
        handleSubmitReview,
        handleRelatedProductClick,
        getCategoryDetails,
        renderStars,
        renderReviewStars
    } = useProductDetail();

    useEffect(() => {
        if (productId) {
            fetchProductDetail(productId).catch(() => {
                navigate('/products');
            });
        } else {
            resetProductDetail();
        }

        return () => {
            resetProductDetail();
        };
    }, [productId]);

    useEffect(() => {
        if (selectedProduct) {
            fetchRelatedProducts();
            fetchRandomProducts();
            fetchReviews();
            const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            setIsFavorite(favorites.includes(selectedProduct.id));
        }
    }, [selectedProduct]);
    useEffect(() => {
        if (submitSuccess) {
            setShowThankYou(true);
            const timer = setTimeout(() => {
                setShowThankYou(false);
                setSubmitSuccess(false);
            }, 3000); // Show for 3 seconds
            return () => clearTimeout(timer);
        }
    }, [submitSuccess, setSubmitSuccess]);

    const toggleFavorite = () => {
        if (!selectedProduct) return;

        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        let newFavorites;

        if (isFavorite) {
            // Remove from favorites
            newFavorites = favorites.filter((id: string) => id !== selectedProduct.id);
        } else {
            // Add to favorites
            newFavorites = [...favorites, selectedProduct.id];
        }

        localStorage.setItem('favorites', JSON.stringify(newFavorites));
        setIsFavorite(!isFavorite);
    };

        const handleAddToCart = () => {
        if (!selectedProduct) return;
        
        // Create cart item
        const cartItem = {
            id: selectedProduct.id,
            name: selectedProduct.name,
            price: selectedProduct.price,
            quantity: quantity,
            image: selectedProduct.images?.[0] || selectedProduct.image_url,
            selectedPackage: selectedPackage || undefined,
            discount_percentage: selectedProduct.discount_percentage > 0 ? selectedProduct.discount_percentage : undefined
        };

        // Add to cart using context
        addToCart(cartItem);
        
        // Open cart sidebar
        openCart();
        
        console.log('Added to cart:', cartItem);
    };


    const handleBuyNow = () => {
        if (!selectedProduct) return;
        console.log('Buy now:', {
            product: selectedProduct,
            package: selectedPackage,
            quantity: quantity
        });
    };

    // Calculate average rating from reviews
    const calculateAverageRating = () => {
        if (reviews.length === 0) return 0;
        const total = reviews.reduce((sum, review) => sum + review.rating, 0);
        return total / reviews.length;
    };

    if (!selectedProduct) {
        return (
            <div className={styles.page}>
                <div className={styles.loading}>Loading product details...</div>
            </div>
        );
    }

    const discountedPrice = selectedProduct.discount_percentage > 0
        ? selectedProduct.price * (1 - selectedProduct.discount_percentage / 100)
        : selectedProduct.price;

    const averageRating = calculateAverageRating();

    return (
        <div className={styles.page}>
            {/* Pop-down Notification */}
            {showThankYou && (
                <div className={styles.popdownNotification}>
                    <div className={styles.popdownContent}>
                        <span className={styles.popdownText}>Thank you for your review!</span>
                    </div>
                </div>
            )}

            <div className={styles.banneritemContainer}>
                <img src={itembanner} alt="Banner" className={styles.banneritemImage} />
            </div>
            <div className={styles.container}>
                <div className={styles.productDetail}>
                    {/* Left Side - Images */}
                    <div className={styles.imageSection}>
                        <div className={styles.mainImage}>
                            <img
                                src={selectedProduct.images?.[currentImageIndex] || selectedProduct.image_url}
                                alt={selectedProduct.name}
                                className={styles.productImage}
                            />
                            {selectedProduct.discount_percentage > 0 && (
                                <div className={styles.discountBadge}>
                                    -{selectedProduct.discount_percentage}% OFF
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Images */}
                        {selectedProduct.images && selectedProduct.images.length > 1 && (
                            <div className={styles.thumbnailContainer}>
                                {selectedProduct.images.map((image: string, index: number) => (
                                    <button
                                        key={index}
                                        className={`${styles.thumbnail} ${currentImageIndex === index ? styles.active : ''}`}
                                        onClick={() => setCurrentImageIndex(index)}
                                    >
                                        <img src={image} alt={`${selectedProduct.name} view ${index + 1}`} />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Related Products Horizontal Scroll */}
                        {relatedProducts.length > 0 && (
                            <div className={styles.relatedProductsSection}>
                                <div className={styles.relatedProductsScroll}>
                                    {relatedProducts.map((product) => (
                                        <button
                                            key={product.id}
                                            className={styles.relatedProductThumb}
                                            onClick={() => handleRelatedProductClick(product)}
                                        >
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className={styles.relatedThumbImage}
                                            />
                                            {product.discount_percentage > 0 && (
                                                <div className={styles.relatedThumbDiscount}>
                                                    -{product.discount_percentage}%
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Middle Section - Product Info */}
                    <div className={styles.infoSection}>
                        <h1 className={styles.productName}>{selectedProduct.name}</h1>
                        <div className={styles.horizontalBar}></div>

                        {/* Reviews - Use actual average rating */}
                        <div className={styles.reviews}>
                            <div className={styles.stars}>
                                {renderStars(averageRating)}
                            </div>
                            <span className={styles.reviewCount}>({reviews.length} reviews)</span>
                        </div>

                        {/* Availability */}
                        <div className={styles.availability}>
                            <h3 className={styles.sectionTitle}>Availability :</h3>
                            <span className={`${styles.status} ${selectedProduct.in_stock ? styles.inStock : styles.outOfStock}`}>
                                {selectedProduct.in_stock ? 'In Stock' : 'Out of Stock'}
                            </span>
                        </div>

                        {/* Price */}
                        <div className={styles.priceSection}>
                            {selectedProduct.discount_percentage > 0 ? (
                                <div className={styles.discountPrice}>
                                    <span className={styles.currentPrice}>${discountedPrice.toFixed(2)}</span>
                                    <span className={styles.originalPrice}>${selectedProduct.price.toFixed(2)}</span>
                                </div>
                            ) : (
                                <span className={styles.normalPrice}>${selectedProduct.price.toFixed(2)}</span>
                            )}
                        </div>

                        {/* Description */}
                        <div className={styles.description}>
                            <p>{selectedProduct.description}</p>
                        </div>

                        {selectedProduct.packageOptions && selectedProduct.packageOptions.length > 0 && (
                            <div className={styles.packageSection}>
                                <div className={styles.packageHeader}>
                                    <h3 className={styles.sectionTitle}>Package :</h3>
                                    {selectedPackage && (
                                        <span className={styles.selectedPackageText}>
                                            <strong>{selectedPackage}</strong>
                                        </span>
                                    )}
                                </div>
                                <div className={styles.packageOptions}>
                                    {selectedProduct.packageOptions.map((pkg: string) => (
                                        <button
                                            key={pkg}
                                            className={`${styles.packageOption} ${selectedPackage === pkg ? styles.selected : ''}`}
                                            onClick={() => setSelectedPackage(pkg)}
                                        >
                                            {pkg}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity */}
                        <div className={styles.quantitySection}>
                            <h3 className={styles.sectionTitle}>Quantity :</h3>
                            <div className={styles.quantitySelector}>
                                <button
                                    className={styles.quantityBtn}
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={quantity <= 1}
                                >
                                    -
                                </button>
                                <span className={styles.quantity}>{quantity}</span>
                                <button
                                    className={styles.quantityBtn}
                                    onClick={() => setQuantity(quantity + 1)}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className={styles.actionButtons}>
                            <button
                                className={styles.addToCartBtn}
                                onClick={handleAddToCart}
                                disabled={!selectedProduct.in_stock}
                            >
                                Add to Cart
                            </button>
                            <button
                                className={styles.buyNowBtn}
                                onClick={handleBuyNow}
                                disabled={!selectedProduct.in_stock}
                            >
                                Buy Now
                            </button>
                        </div>

                        <div className={styles.wishlistSection}>
                            <button
                                className={`${styles.wishlistBtn} ${isFavorite ? styles.favorite : ''}`}
                                aria-label="Add to favorites"
                                onClick={toggleFavorite}
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    stroke="black"
                                    strokeWidth="1.5"
                                    fill={isFavorite ? "currentColor" : "none"}
                                >
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                                <span className={styles.wishlistText}>
                                    Wishlist
                                </span>
                            </button>
                        </div>

                        <div className={styles.horizontalBar}></div>
                        <div className={styles.paymentMethods}>
                            <span className={styles.paymentText}>We accept:</span>
                            <div className={styles.paymentIcons}>
                                <img src={esewaLogo} alt="eSewa" className={styles.paymentLogo} />
                                <img src={khaltiLogo} alt="Khalti" className={styles.paymentLogo} />
                                <img src={visaLogo} alt="Visa" className={styles.paymentLogo} />
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Information Cards */}
                    <div className={styles.infoCardsSection}>
                        <div className={styles.infoCard}>
                            <div className={styles.infoCardContent}>
                                <div className={styles.infoCardIcon}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                <h3 className={styles.infoCardTitle}>Free Delivery</h3>
                                <p className={styles.infoCardText}>
                                    Free delivery on orders above $50. Same day delivery available in selected areas.
                                </p>
                            </div>
                        </div>

                        <div className={styles.infoCard}>
                            <div className={styles.infoCardContent}>
                                <div className={styles.infoCardIcon}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h3 className={styles.infoCardTitle}>Secure Payment</h3>
                                <p className={styles.infoCardText}>
                                    Your payment information is protected with 256-bit SSL encryption.
                                </p>
                            </div>
                        </div>

                        <div className={styles.infoCard}>
                            <div className={styles.infoCardContent}>
                                <div className={styles.infoCardIcon}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </div>
                                <h3 className={styles.infoCardTitle}>Quality Guarantee</h3>
                                <p className={styles.infoCardText}>
                                    100% quality guarantee. Return within 7 days if not satisfied with the product.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description and Reviews Tabs Section */}
                <div className={styles.tabsSection}>
                    <div className={styles.tabsContainer}>
                        <button
                            className={`${styles.tabButton} ${activeTab === 'description' ? styles.active : ''}`}
                            onClick={() => setActiveTab('description')}
                        >
                            DESCRIPTION
                        </button>
                        <button
                            className={`${styles.tabButton} ${activeTab === 'reviews' ? styles.active : ''}`}
                            onClick={() => setActiveTab('reviews')}
                        >
                            REVIEWS
                        </button>
                    </div>

                    <div className={styles.tabContent}>
                        {/* Description Content - Only show when activeTab is 'description' */}
                        {activeTab === 'description' && (
                            <div className={styles.descriptionContent}>
                                <h3 className={styles.detailsTitle}>{getCategoryDetails().title}</h3>
                                <div className={styles.detailsList}>
                                    {getCategoryDetails().points.map((point: string, index: number) => (
                                        <div key={index} className={styles.detailItem}>
                                            <span className={styles.detailBullet}>•</span>
                                            <span>{point}</span>
                                        </div>
                                    ))}
                                </div>

                                {getCategoryDetails().specifications && (
                                    <div className={styles.specifications}>
                                        <h4 className={styles.specsTitle}>Product Specifications</h4>
                                        <div className={styles.detailsList}>
                                            {(Object.entries(getCategoryDetails().specifications ?? {}) as [string, string][]).map(([key, value]) => (
                                                <div key={key} className={styles.detailItem}>
                                                    <span className={styles.detailBullet}>•</span>
                                                    <span><strong>{key}:</strong> {value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {loadingRandom ? (
                                    <div className={styles.loading}>Loading recommended products...</div>
                                ) : randomProducts.length > 0 ? (
                                    <div className={styles.bottomRelatedProducts}>
                                        <h3 className={styles.relatedProductsTitle}>You May Also Like</h3>
                                        <div className={styles.relatedProductsGrid}>
                                            {randomProducts.map((product) => {
                                                const discountedPrice = product.discount_percentage > 0
                                                    ? product.price * (1 - product.discount_percentage / 100)
                                                    : product.price;

                                                return (
                                                    <div
                                                        key={product.id}
                                                        className={styles.relatedProductCard}
                                                        onClick={() => handleRelatedProductClick(product)}
                                                    >
                                                        <div className={styles.relatedProductImage}>
                                                            <img
                                                                src={product.image_url}
                                                                alt={product.name}
                                                                className={styles.relatedImage}
                                                            />
                                                            {!product.in_stock ? (
                                                                <div className={styles.relatedOutOfStock}>Out of Stock</div>
                                                            ) : product.discount_percentage > 0 ? (
                                                                <div className={styles.relatedDiscountBadge}>-{product.discount_percentage}%</div>
                                                            ) : null}

                                                            <div className={styles.relatedProductOverlay}>
                                                                <div className={styles.relatedActionIcons}>
                                                                    <button className={styles.relatedIconBtn} aria-label="Add to favorites">
                                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                                                        </svg>
                                                                    </button>
                                                                    <button className={styles.relatedIconBtn} aria-label="Add to cart">
                                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                            <circle cx="9" cy="21" r="1" />
                                                                            <circle cx="20" cy="21" r="1" />
                                                                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className={styles.relatedProductInfo}>
                                                            <h3 className={styles.relatedProductName}>{product.name}</h3>

                                                            {product.in_stock ? (
                                                                <div className={styles.relatedPriceContainer}>
                                                                    {product.discount_percentage > 0 ? (
                                                                        <div className={styles.relatedDiscountPriceRow}>
                                                                            <span className={styles.relatedCurrentPrice}>${discountedPrice.toFixed(2)}</span>
                                                                            <span className={styles.relatedOriginalPrice}>${product.price.toFixed(2)}</span>
                                                                        </div>
                                                                    ) : (
                                                                        <span className={styles.relatedNormalPrice}>${product.price.toFixed(2)}</span>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className={styles.relatedOutOfStockText}>Currently Unavailable</div>
                                                            )}

                                                            <div className={styles.relatedProductReviews}>
                                                                <div className={styles.relatedStars}>
                                                                    {renderStars(product.averageRating || 0)}
                                                                </div>
                                                                <span className={styles.relatedReviewCount}>({product.reviewCount || 0})</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        )}


                        {activeTab === 'reviews' && (
                            <div className={styles.reviewsContent}>
                                <h3 className={styles.reviewsTitle}>Customer Reviews</h3>

                                {/* Show existing reviews if any - Horizontal Scroll Container */}
                                {reviews.length > 0 ? (
                                    <div className={styles.reviewsHorizontalContainer}>
                                        <div className={styles.reviewsScrollWrapper}>
                                            {reviews.map((review) => (
                                                <div key={review.id} className={styles.reviewCard}>
                                                    <div className={styles.reviewCardHeader}>
                                                        <h4 className={styles.reviewerName}>{review.customer_name}</h4>
                                                        <div className={styles.reviewStars}>
                                                            {renderStars(review.rating)}
                                                        </div>
                                                    </div>
                                                    <div className={styles.reviewCardBody}>
                                                        <h5 className={styles.reviewTitle}>{review.review_title}</h5>
                                                        <p className={styles.reviewText}>{review.review_text}</p>
                                                        <span className={styles.reviewDate}>
                                                            {new Date(review.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (

                                    <div className={styles.reviewEmptyState}>
                                        <div className={styles.reviewLeftSection}>
                                            <div className={styles.emptyStars}>
                                                {renderStars(0)}
                                            </div>
                                            <span className={styles.beFirstText}>Be the first to write a review</span>
                                        </div>
                                        <div className={styles.verticalDivider}></div>
                                        <button
                                            className={styles.writeReviewBtn}
                                            onClick={() => setIsWritingReview(!isWritingReview)}
                                        >
                                            {isWritingReview ? 'Cancel Review' : 'Write a Review'}
                                        </button>
                                    </div>
                                )}

                                {/* Review Form */}
                                {isWritingReview && (
                                    <div className={styles.reviewFormContainer}>
                                        <div className={styles.horizontalBar}></div>
                                        <div className={styles.reviewForm}>
                                            <div className={styles.ratingSection}>
                                                <label className={styles.ratingLabel}>Write a review</label>
                                                <label className={styles.ratingText}>Rating</label>
                                                <div className={styles.starRating}>
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            className={styles.starButton}
                                                            onClick={() => setReviewRating(star)}
                                                            disabled={isSubmitting}
                                                        >
                                                            {renderReviewStars(star)}
                                                        </button>
                                                    ))}
                                                </div>
                                                {reviewRating > 0 && (
                                                    <div className={styles.selectedRating}>
                                                        <span>Selected: {reviewRating} star{reviewRating > 1 ? 's' : ''}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className={styles.formGroup}>
                                                <label className={styles.formLabel}>Review Title *</label>
                                                <input
                                                    type="text"
                                                    className={styles.formInput}
                                                    placeholder="Give your review a title"
                                                    value={reviewTitle}
                                                    onChange={(e) => setReviewTitle(e.target.value)}
                                                    disabled={isSubmitting}
                                                />
                                            </div>

                                            <div className={styles.formGroup}>
                                                <label className={styles.formLabel}>Your Review *</label>
                                                <textarea
                                                    className={styles.reviewTextarea}
                                                    placeholder="Share your experience with this product..."
                                                    rows={5}
                                                    value={reviewText}
                                                    onChange={(e) => setReviewText(e.target.value)}
                                                    disabled={isSubmitting}
                                                />
                                            </div>

                                            <div className={styles.formRow}>
                                                <div className={styles.formGroup}>
                                                    <label className={styles.formLabel}>Your Name *</label>
                                                    <input
                                                        type="text"
                                                        className={styles.formInput}
                                                        placeholder="Enter your name"
                                                        value={reviewerName}
                                                        onChange={(e) => setReviewerName(e.target.value)}
                                                        disabled={isSubmitting}
                                                    />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label className={styles.formLabel}>Your Email *</label>
                                                    <input
                                                        type="email"
                                                        className={styles.formInput}
                                                        placeholder="Enter your email"
                                                        value={reviewerEmail}
                                                        onChange={(e) => setReviewerEmail(e.target.value)}
                                                        disabled={isSubmitting}
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                className={styles.submitReviewBtn}
                                                onClick={handleSubmitReview}
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? 'Submitting...' : 'Submit Review'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}