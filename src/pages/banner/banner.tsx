import { useState, useEffect, useRef, type JSX } from "react";
import styles from "./banner.module.scss";
import { useNavigate } from "react-router-dom";
import { useActiveOffer } from "../../hooks/useActiveOffer";

export default function BannerSection(): JSX.Element {
  const { activeOffer: currentOffer, loading, refetch } = useActiveOffer();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
const refetchRef = useRef(refetch);
useEffect(() => {
  refetchRef.current = refetch;
}, [refetch]);
  // Countdown timer
  useEffect(() => {
  if (!currentOffer) return;

  const calculateTimeLeft = () => {
    const endDate = new Date(currentOffer.end_date);
    const now = new Date();
    const difference = endDate.getTime() - now.getTime();

    if (difference > 0) {
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      });
    } else {
      refetchRef.current();
    }
  };

  calculateTimeLeft();
  const timer = setInterval(calculateTimeLeft, 1000);

  return () => clearInterval(timer);
}, [currentOffer]);

  const handleBannershopnow = () => {
    navigate('/products', {
      state: {
        selectedCategory: 'all-products'
      }
    });
  };

  // Show nothing if no active offer
  if (loading) {
    return (
      <section className={styles.bannerSection}>
        <div className={styles.bannerContent}>
          <div className={styles.loading}>Loading offer...</div>
        </div>
      </section>
    );
  }

  if (!currentOffer) {
    return (
      <section className={styles.bannerSection}>
        <div className={styles.bannerContent}>
          <div className={styles.noOffer}>
            <p>No offer today</p>
            <p>We will Let you know very soon, Thank You!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.bannerSection}>
      <div className={styles.bannerContent}>
        <div className={styles.textContent}>
          <p className={styles.subtitle}>{currentOffer.subtitle}</p>
          <h2 className={styles.title}>{currentOffer.title}</h2>

          <div className={styles.timer}>
            {timeLeft.days > 0 && (
              <>
                <div className={styles.timeUnit}>
                  <span className={styles.timeNumber}>{timeLeft.days.toString().padStart(2, '0')}</span>
                  <span className={styles.timeLabel}>Days</span>
                </div>
                <span className={styles.timeSeparator}>:</span>
              </>
            )}
            <div className={styles.timeUnit}>
              <span className={styles.timeNumber}>{timeLeft.hours.toString().padStart(2, '0')}</span>
              <span className={styles.timeLabel}>Hours</span>
            </div>
            <span className={styles.timeSeparator}>:</span>
            <div className={styles.timeUnit}>
              <span className={styles.timeNumber}>{timeLeft.minutes.toString().padStart(2, '0')}</span>
              <span className={styles.timeLabel}>Minutes</span>
            </div>
            <span className={styles.timeSeparator}>:</span>
            <div className={styles.timeUnit}>
              <span className={styles.timeNumber}>{timeLeft.seconds.toString().padStart(2, '0')}</span>
              <span className={styles.timeLabel}>Seconds</span>
            </div>
          </div>

          <button className={styles.shopNowButton} onClick={() => handleBannershopnow()}>
            Shop Now
          </button>
        </div>
      </div>
    </section>
  );
}