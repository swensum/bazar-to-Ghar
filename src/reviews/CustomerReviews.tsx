import { type JSX, useState, useEffect, useRef } from "react";
import { supabase } from "../store/supabase";
import styles from "./CustomerReviews.module.scss";

interface Review {
  id: string;
  customer_name: string;
  customer_image: string;
  rating: number;
  review_text: string;
  created_at: string;
  topic: string | null;
}

export default function CustomerReviews(): JSX.Element {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [componentKey, setComponentKey] = useState(0);

  useEffect(() => {
    fetchReviews();
    setComponentKey(prev => prev + 1);
  }, []);

  // Reset currentSlide when reviews change
  useEffect(() => {
    if (reviews.length > 0) {
      setCurrentSlide(0);
    }
  }, [reviews.length]);

  // Auto slide every 5 seconds
  useEffect(() => {
    if (reviews.length <= 2) return;

    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [reviews.length, currentSlide]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible again - reset any stuck states
        setIsTransitioning(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data: reviewsData, error } = await supabase
        .from('customer_reviews')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setReviews(reviewsData || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (reviews.length <= 2) return;
    setIsTransitioning(true);
    setCurrentSlide(prev => {
      const totalSlides = Math.ceil(reviews.length / 2);
      if (prev === totalSlides - 1) {
        return 0;
      }
      return prev + 1;
    });
  };

  const handlePrev = () => {
    if (reviews.length <= 2) return;
    setIsTransitioning(true);
    setCurrentSlide(prev => {
      const totalSlides = Math.ceil(reviews.length / 2);
      if (prev === 0) {
        return totalSlides - 1;
      }
      return prev - 1;
    });
  };

  const goToSlide = (index: number) => {
    if (reviews.length <= 2) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
  };

  const handleTransitionEnd = () => {
    setIsTransitioning(false);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={index < rating ? "#f5ab1e" : "#ddd"}
        stroke={index < rating ? "#f5ab1e" : "#ddd"}
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ));
  };

  // Get review pairs for sliding
  const getReviewPairs = () => {
    const pairs = [];
    for (let i = 0; i < reviews.length; i += 2) {
      pairs.push(reviews.slice(i, i + 2));
    }
    return pairs;
  };

  const reviewPairs = getReviewPairs();
  const totalRealSlides = Math.ceil(reviews.length / 2);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setIsTransitioning(false);
    };
  }, []);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading reviews...</div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.noReviews}>No reviews yet</div>
      </div>
    );
  }

  return (
    <div className={styles.page} key={componentKey}>
      {/* Header Section */}
      <section className={styles.headerSection}>
        <h1 className={styles.mainHeading}>What Our Customers Say</h1>
        <p className={styles.subHeading}>Real reviews from real customers</p>
      </section>

      {/* Reviews Carousel */}
      <section className={styles.reviewsSection}>
        <div className={styles.reviewsCarousel}>
          {/* Navigation Arrows */}
          {reviews.length > 2 && (
            <>
              <button 
                className={`${styles.arrow} ${styles.arrowLeft}`}
                onClick={handlePrev}
                aria-label="Previous reviews"
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

              <button 
                className={`${styles.arrow} ${styles.arrowRight}`}
                onClick={handleNext}
                aria-label="Next reviews"
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
            </>
          )}

          {/* Sliding Container */}
          <div className={styles.carouselViewport}>
            <div 
              className={styles.carouselTrack}
              style={{ 
                transform: `translateX(-${currentSlide * 100}%)`,
                transition: isTransitioning ? 'transform 0.6s ease-in-out' : 'none'
              }}
              onTransitionEnd={handleTransitionEnd}
              ref={sliderRef}
            >
              {reviewPairs.map((pair, pairIndex) => (
                <div key={pairIndex} className={styles.carouselSlide}>
                  <div className={styles.reviewsContainer}>
                    {pair.map((review) => (
                      <div key={`${review.id}-${pairIndex}`} className={styles.reviewCard}>
                        {/* Top Circle with Review Icon */}
                        <div className={styles.circleContainer}>
                          <div className={styles.outerCircle}>
                            <div className={styles.circle}>
                              <svg 
                                width="24" 
                                height="24" 
                                viewBox="0 0 24 24" 
                                fill="white"
                                className={styles.reviewIcon}
                              >
                                <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"/>
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Topic Name in Double Quotes */}
                        <div className={styles.topicContainer}>
                          <h3 className={styles.topic}>
                            "{review.topic || 'Excellent Service'}"
                          </h3>
                        </div>

                        {/* Review Message */}
                        <div className={styles.messageContainer}>
                          <p className={styles.message}>{review.review_text}</p>
                        </div>

                        {/* Reviewer Name */}
                        <div className={styles.nameContainer}>
                          <p className={styles.reviewerName}>{review.customer_name}</p>
                        </div>

                        {/* Rating Stars */}
                        <div className={styles.ratingContainer}>
                          <div className={styles.stars}>
                            {renderStars(review.rating)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Dots */}
          {reviews.length > 2 && (
            <div className={styles.indicators}>
              {Array.from({ length: totalRealSlides }).map((_, index) => (
                <span
                  key={index}
                  className={`${styles.indicator} ${
                    currentSlide === index ? styles.active : ""
                  }`}
                  onClick={() => goToSlide(index)}
                  aria-current={currentSlide === index ? "true" : undefined}
                  role="button"
                  tabIndex={0}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}