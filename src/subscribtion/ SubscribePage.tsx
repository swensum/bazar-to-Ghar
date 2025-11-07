import { useState, useEffect, type JSX } from "react";
import { supabase } from "../store/supabase";
import styles from "./SubscribePage.module.scss";
import backgroundImage from "../assets/banner3.jpg"; 

export default function SubscribePage(): JSX.Element {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [message, setMessage] = useState("");
  const [couponUsed, setCouponUsed] = useState(false);

  useEffect(() => {
    const checkExistingSubscription = async () => {
      const storedEmail = localStorage.getItem('subscriberEmail');
      if (storedEmail) {
        const { data } = await supabase
          .from('subscribers')
          .select('coupon_used')
          .eq('email', storedEmail)
          .single();
          
        if (data) {
          setIsSubscribed(true);
          if (data.coupon_used) {
            setCouponUsed(true);
          }
        }
      }
    };

    checkExistingSubscription();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setMessage("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const { data: existingSubscriber, error: fetchError } = await supabase
        .from('subscribers')
        .select('id, coupon_used')
        .eq('email', email)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingSubscriber) {
        if (existingSubscriber.coupon_used) {
          setIsSubscribed(true);
          setCouponUsed(true);
          localStorage.setItem('subscriberEmail', email);
        } else {
          setIsSubscribed(true);
          localStorage.setItem('subscriberEmail', email);
        }
        return;
      }

      const { error: insertError } = await supabase
        .from('subscribers')
        .insert([
          { 
            email: email,
            coupon_code: 'VEGIST20',
            coupon_used: false
          }
        ]);

      if (insertError) {
        if (insertError.code === '23505') {
          setMessage("This email is already subscribed.");
        } else {
          throw insertError;
        }
      } else {
        setIsSubscribed(true);
        localStorage.setItem('subscriberEmail', email);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div 
        className={styles.backgroundImage}
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className={styles.overlay}></div>
        
        <div className={styles.contentContainer}>
          <div className={styles.textContent}>
            {!isSubscribed ? (
              <div className={styles.subscribeSection}>
                <h1 className={styles.mainTitle}>Get the latest deals</h1>
                <p className={styles.subTitle}>And receive 20% off coupon for first shopping</p>
                
                <form onSubmit={handleSubmit} className={styles.subscribeForm}>
                  <div className={styles.inputGroup}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className={styles.emailInput}
                      required
                      disabled={isSubmitting}
                    />
                    <button 
                      type="submit" 
                      className={styles.subscribeButton}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className={styles.loadingText}>
                          <span className={styles.spinner}></span>
                        </span>
                      ) : (
                        "Subscribe"
                      )}
                    </button>
                  </div>
                </form>
                
                {message && (
                  <div className={`${styles.message} ${styles.error}`}>
                    {message}
                  </div>
                )}
              </div>
            ) : couponUsed ? (
              <div className={styles.successSection}>
                <div className={styles.infoIcon}>✓</div>
                <h2 className={styles.successTitle}>Already Subscribed</h2>
                <p className={styles.successMessage}>
                  Stay tuned for our latest deals and offers!
                </p>
              </div>
            ) : (
              <div className={styles.successSection}>
                <div className={styles.successIcon}>✓</div>
                <h2 className={styles.successTitle}>Thank You!</h2>
                <p className={styles.successMessage}>
                  Use code: <strong className={styles.couponCode}>VEGIST20</strong>
                </p>
                <p className={styles.terms}>
                  20% off on first purchase
                </p>
               <p className={styles.terms1}>
                  * This code can be used only once and is valid for your first purchase only.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}