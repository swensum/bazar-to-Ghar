import { useState, useEffect, type JSX } from "react";
import { db } from "../store/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import styles from "./SubscribePage.module.scss";
import backgroundImage from "../assets/banner3.jpg";

export default function SubscribePage(): JSX.Element {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [message, setMessage] = useState("");
  const [couponUsed, setCouponUsed] = useState(false);
  const [, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile on component mount and on resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    const checkExistingSubscription = async () => {
      const storedEmail = localStorage.getItem("subscriberEmail");
      if (storedEmail) {
        try {
          const subscribersRef = collection(db, "subscribers");
          const q = query(subscribersRef, where("email", "==", storedEmail));
          const snapshot = await getDocs(q);

          if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            setIsSubscribed(true);
            if (data.couponUsed) {
              setCouponUsed(true);
            }
          }
        } catch (error) {
          console.error("Error checking existing subscription:", error);
        }
      }
    };

    checkExistingSubscription();

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setMessage("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const subscribersRef = collection(db, "subscribers");

     
      const existingQuery = query(subscribersRef, where("email", "==", email));
      const existingSnapshot = await getDocs(existingQuery);

      if (!existingSnapshot.empty) {
        const existingSubscriber = existingSnapshot.docs[0].data();

        if (existingSubscriber.couponUsed) {
          setIsSubscribed(true);
          setCouponUsed(true);
          localStorage.setItem("subscriberEmail", email);
        } else {
          setIsSubscribed(true);
          localStorage.setItem("subscriberEmail", email);
        }
        return;
      }

      // No existing subscriber found — create one.
      // Firestore has no unique-constraint equivalent to Supabase's
      // Postgres error code 23505, so uniqueness is enforced here by the
      // existence check above rather than by a DB-level constraint.
      await addDoc(subscribersRef, {
        email: email,
        couponCode: "VEGIST20",
        couponUsed: false,
        createdAt: serverTimestamp(),
      });

      setIsSubscribed(true);
      localStorage.setItem("subscriberEmail", email);
    } catch (error) {
      console.error("Subscription error:", error);
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