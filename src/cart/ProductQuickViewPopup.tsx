import { type JSX, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProductDetail } from "../contexts/ProductDetailContext";
import styles from "./ProductQuickViewPopup.module.scss";
import esewaLogo from "../assets/esewa.png";
import khaltiLogo from "../assets/khalti.png";
import visaLogo from "../assets/visa.png";

interface ProductQuickViewPopupProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: any, quantity: number, selectedPackage?: string) => void;
}

export default function ProductQuickViewPopup({
  product,
  isOpen,
  onClose,
  onAddToCart
}: ProductQuickViewPopupProps): JSX.Element {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const navigate = useNavigate();
  
  const {
    // State
    currentImageIndex,
    selectedPackage,
    quantity,
    
    // Actions
    setCurrentImageIndex,
    setSelectedPackage,
    setQuantity,
    
    // Functions
    renderStars
  } = useProductDetail();

  useEffect(() => {
    if (product && isOpen) {
      // Check if product is in wishlist
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      setIsFavorite(favorites.includes(product.id));
      
      // Reset to first image when popup opens
      setCurrentImageIndex(0);
      setSelectedPackage(product.packageOptions?.[0] || null);
      setQuantity(1);
    }
  }, [product, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setCurrentImageIndex(0);
      setSelectedPackage(null);
      setQuantity(1);
      setIsAddingToCart(false);
      setIsBuyingNow(false);
    }
  }, [isOpen]);

  const toggleFavorite = () => {
    if (!product) return;

    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    let newFavorites;

    if (isFavorite) {
      newFavorites = favorites.filter((id: string) => id !== product.id);
    } else {
      newFavorites = [...favorites, product.id];
    }

    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      onAddToCart(product, quantity, selectedPackage || '');
      onClose();
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    setIsBuyingNow(true);
    
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Always navigate to checkout with product data
      const checkoutProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: product.images?.[0] || product.image_url,
        images: product.images,
        image_url: product.image_url,
        selectedPackage: selectedPackage || undefined,
        discount_percentage: product.discount_percentage > 0 ? product.discount_percentage : undefined,
        material: product.material,
        material_type: product.material_type
      };
      
      // Navigate to checkout page with product data
      navigate('/checkout', {
        state: {
          product: checkoutProduct
        }
      });
      
      // Close the quick view popup
      onClose();
      
    } catch (error) {
      console.error('Error in buy now:', error);
    } finally {
      setIsBuyingNow(false);
    }
  };

  if (!isOpen || !product) return <></>;

  const discountedPrice = product.discount_percentage > 0
    ? product.price * (1 - product.discount_percentage / 100)
    : product.price;

  return (
    <div className={styles.popupOverlay} onClick={onClose}>
      <div className={styles.popupContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.popupContainer}>
          {/* Left Side - Images */}
          <div className={styles.imageSection}>
            <div className={styles.mainImage}>
              <img
                src={product.images?.[currentImageIndex] || product.image_url}
                alt={product.name}
                className={styles.productImage}
              />
              {product.discount_percentage > 0 && (
                <div className={styles.discountBadge}>
                  -{product.discount_percentage}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className={styles.thumbnailContainer}>
                {product.images.map((image: string, index: number) => (
                  <button
                    key={index}
                    className={`${styles.thumbnail} ${currentImageIndex === index ? styles.active : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img src={image} alt={`${product.name} view ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Middle Section - Product Info */}
          <div className={styles.infoSection}>
            <h1 className={styles.productName}>{product.name}</h1>
            <div className={styles.horizontalBar}></div>

            {/* Reviews */}
            <div className={styles.reviews}>
              <div className={styles.stars}>
                {renderStars(product.averageRating || 0)}
              </div>
              <span className={styles.reviewCount}>({product.reviewCount || 0} reviews)</span>
            </div>

            {/* Availability */}
            <div className={styles.availability}>
              <h3 className={styles.sectionTitle}>Availability :</h3>
              <span className={`${styles.status} ${product.in_stock ? styles.inStock : styles.outOfStock}`}>
                {product.in_stock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            {/* Price */}
            <div className={styles.priceSection}>
              {product.discount_percentage > 0 ? (
                <div className={styles.discountPrice}>
                  <span className={styles.currentPrice}>${discountedPrice.toFixed(2)}</span>
                  <span className={styles.originalPrice}>${product.price.toFixed(2)}</span>
                </div>
              ) : (
                <span className={styles.normalPrice}>${product.price.toFixed(2)}</span>
              )}
            </div>

            {/* Description */}
            <div className={styles.description}>
              <p>{product.description}</p>
            </div>

            {product.packageOptions && product.packageOptions.length > 0 && (
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
                  {product.packageOptions.map((pkg: string) => (
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

            {/* Material Section - Added below Package Options */}
            {product.material && (
              <div className={styles.materialSection}>
                <h3 className={styles.sectionTitle}>Material :</h3>
                <span className={styles.materialText}>
                  {product.material}
                </span>
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
                disabled={!product.in_stock || isAddingToCart}
              >
                {isAddingToCart ? (
                  <div className={styles.spinner}></div>
                ) : (
                  'Add to Cart'
                )}
              </button>
              <button
                className={styles.buyNowBtn}
                onClick={handleBuyNow}
                disabled={!product.in_stock || isBuyingNow}
              >
                {isBuyingNow ? (
                  <div className={styles.spinner}></div>
                ) : (
                  'Buy Now'
                )}
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
        </div>
        
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
}