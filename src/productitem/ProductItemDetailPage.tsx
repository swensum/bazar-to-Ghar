import { type JSX, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../store/supabase";
import { useProductDetail } from "../contexts/ProductDetailContext";
import styles from "./ProductItemDetailPage.module.scss";
import itembanner from "../assets/dealbanner.webp";

export default function ProductItemDetailPage(): JSX.Element {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const [isFavorite, setIsFavorite] = useState(false);

    const toggleFavorite = () => {
        setIsFavorite(!isFavorite);
    };
    const {
        selectedProduct,
        currentImageIndex,
        selectedPackage,
        quantity,
        setSelectedProduct,
        setCurrentImageIndex,
        setSelectedPackage,
        setQuantity,
        resetProductDetail
    } = useProductDetail();

    useEffect(() => {
        if (productId) {
            fetchProductDetail(productId);
        } else {
            resetProductDetail();
        }

        return () => {
            resetProductDetail();
        };
    }, [productId]);

    const fetchProductDetail = async (id: string) => {
        try {
            const { data: product, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            if (product) {
                // Determine package options based on product type
                let packageOptions = [];

                // Customize package options based on product categories
                if (product.categories?.includes('Fruits') || product.categories?.includes('Vegetables')) {
                    packageOptions = ['1 piece', '250g', '500g', '1kg'];
                } else if (product.categories?.includes('Beverages')) {
                    packageOptions = ['250ml', '500ml', '1L', '2L'];
                } else if (product.categories?.includes('Dairy')) {
                    packageOptions = ['250ml', '500ml', '1L', '2L', '250g', '500g'];
                } else {
                    packageOptions = ['250g', '500g', '1kg']; // Default for other products
                }

                const productWithDetails = {
                    ...product,
                    images: product.images || [product.image_url],
                    packageOptions: packageOptions,
                    specifications: {
                        'Storage': 'Keep refrigerated',
                        'Shelf Life': '7-10 days',
                        'Origin': 'Local farm',
                        'Organic': product.material?.includes('Organic') ? 'Yes' : 'No',
                        'Allergens': 'None',
                        'Dietary Info': 'Vegetarian'
                    }
                };
                setSelectedProduct(productWithDetails);
            }
        } catch (error) {
            console.error('Error fetching product details:', error);
            navigate('/products');
        }
    };

    const handleAddToCart = () => {
        console.log('Added to cart:', {
            product: selectedProduct,
            package: selectedPackage,
            quantity: quantity
        });
        // You can implement your cart logic here
    };

    const handleBuyNow = () => {
        console.log('Buy now:', {
            product: selectedProduct,
            package: selectedPackage,
            quantity: quantity
        });
    };

    const renderStars = (rating: number = 4.5) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        const size = 16;
        const strokeWidth = 2.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <svg
                    key={`full-${i}`}
                    width={size}
                    height={size}
                    viewBox="0 0 24 24"
                    fill="#F5BE05"
                    stroke="#F5BE05"
                    strokeWidth={strokeWidth}
                >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            );
        }

        if (hasHalfStar) {
            stars.push(
                <svg
                    key="half"
                    width={size}
                    height={size}
                    viewBox="0 0 24 24"
                    fill="url(#half)"
                    stroke="#F5BE05"
                    strokeWidth={strokeWidth}
                >
                    <defs>
                        <linearGradient id="half">
                            <stop offset="50%" stopColor="#F5BE05" />
                            <stop offset="50%" stopColor="transparent" />
                        </linearGradient>
                    </defs>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            );
        }

        const emptyStars = 5 - stars.length;
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <svg
                    key={`empty-${i}`}
                    width={size}
                    height={size}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ddd"
                    strokeWidth={strokeWidth}
                >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            );
        }

        return stars;
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

    return (
        <div className={styles.page}>
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
                                {selectedProduct.images.map((image, index) => (
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
                    </div>
                    <div className={styles.infoSection}>
                        <h1 className={styles.productName}>{selectedProduct.name}</h1>
                        <div className={styles.horizontalBar}></div>

                        {/* Reviews */}
                        <div className={styles.reviews}>
                            <div className={styles.stars}>
                                {renderStars()}
                            </div>
                            <span className={styles.reviewCount}>(128 reviews)</span>
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
                                    {selectedProduct.packageOptions.map((pkg) => (
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
                                >
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                                <span className={styles.wishlistText}>WishList</span>
                            </button>
                        </div>
                      <div className={styles.horizontalBar}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}