import { useState, useEffect, type JSX } from "react";
import { supabase } from "../../store/supabase";
import styles from "./banner.module.scss";
import { useNavigate } from "react-router-dom";

interface Offer {
  id: string;
  title: string;
  subtitle: string;
  end_date: string;
  is_active: boolean;
}

export default function BannerSection(): JSX.Element {
  const [currentOffer, setCurrentOffer] = useState<Offer | null>(null);
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch active offer from database
  useEffect(() => {
    fetchActiveOffer();
  }, []);

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
        // Offer expired, fetch new one
        fetchActiveOffer();
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
  
  const fetchActiveOffer = async () => {
    try {
      setLoading(true);
      const { data: offers, error } = await supabase
        .from('offers')
        .select('*')
        .eq('is_active', true)
        .gt('end_date', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (offers && offers.length > 0) {
        setCurrentOffer(offers[0]);
      } else {
        setCurrentOffer(null);
      }
    } catch (error) {
      console.error('Error fetching offer:', error);
      setCurrentOffer(null);
    } finally {
      setLoading(false);
    }
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