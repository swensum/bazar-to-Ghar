import { type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "../contexts/FavoriteContext";
import { useProduct } from "../contexts/ProductContext";
import { useProductDetail } from "../contexts/ProductDetailContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import styles from "./FavoritesPage.module.scss";

export default function FavoritesPage(): JSX.Element {
  useDocumentTitle("Your Favorites");
  const navigate = useNavigate();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const { allProducts } = useProduct();
  const { setSelectedProduct, processProductData } = useProductDetail();

  const favoriteProducts = allProducts.filter((p) => favoriteIds.includes(p.id));

  const handleProductClick = (product: any) => {
    const processed = processProductData(product);
    setSelectedProduct(processed);
    navigate(`/product/${product.id}`);
  };

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(id);
  };

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <span className={styles.eyebrow}>your picks</span>
        <h1 className={styles.title}>Saved for later</h1>
        <p className={styles.subtitle}>
          {favoriteProducts.length > 0
            ? `${favoriteProducts.length} item${favoriteProducts.length > 1 ? "s" : ""} you've hearted, ready when you are.`
            : "Nothing saved yet — tap the heart on anything you like."}
        </p>
      </section>

      {favoriteProducts.length === 0 ? (
        <div className={styles.emptyState}>
          <EmptyHeart />
          <h2 className={styles.emptyTitle}>Your favorites list is empty</h2>
          <p className={styles.emptyText}>
            Browse the shop and tap the heart on anything you'd like to save
            for later.
          </p>
          <button className={styles.browseBtn} onClick={() => navigate("/products")}>
            Browse Products
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {favoriteProducts.map((product) => {
            const discountedPrice =
              product.discount_percentage > 0
                ? product.price * (1 - product.discount_percentage / 100)
                : product.price;

            return (
              <a
                key={product.id}
                href={`/product/${product.id}`}
                className={styles.card}
                onClick={(e) => {
                  e.preventDefault();
                  handleProductClick(product);
                }}
              >
                <div className={styles.imageWrap}>
                  <img src={product.image_url} alt={product.name} className={styles.image} />

                  {!product.in_stock ? (
                    <div className={styles.outOfStock}>Out of Stock</div>
                  ) : product.discount_percentage > 0 ? (
                    <div className={styles.discountBadge}>-{product.discount_percentage}%</div>
                  ) : null}

                  <button
                    className={styles.removeBtn}
                    aria-label="Remove from favorites"
                    onClick={(e) => handleRemove(e, product.id)}
                  >
                    <HeartIcon filled />
                  </button>
                </div>

                <div className={styles.info}>
                  <h3 className={styles.name}>{product.name}</h3>
                  {product.in_stock ? (
                    product.discount_percentage > 0 ? (
                      <div className={styles.priceRow}>
                        <span className={styles.discountedPrice}>${discountedPrice.toFixed(2)}</span>
                        <span className={styles.originalPrice}>${product.price.toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className={styles.price}>${product.price.toFixed(2)}</span>
                    )
                  ) : (
                    <span className={styles.outOfStockText}>Currently unavailable</span>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

function HeartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function EmptyHeart() {
  return (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="emptyHeartIcon" style={{ color: "#e8654a" }}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeDasharray="3 4" />
    </svg>
  );
}