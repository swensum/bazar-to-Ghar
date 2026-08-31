import { type JSX, useEffect } from "react";
import styles from "./ReturnsPage.module.scss";

const BRAND_NAME = "Bazar to Ghar";

function ReplaceIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 1l4 4-4 4" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <path d="M7 23l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

function RefundIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9 9.5c0-1 1-1.5 3-1.5s3 .8 3 2-1 1.7-3 2-3 1-3 2 1 2 3 2 3-.5 3-1.5" />
    </svg>
  );
}

function CreditIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}

export default function ReturnsPage(): JSX.Element {
  useEffect(() => {
    document.title = `Returns & Refunds | ${BRAND_NAME}`;
  }, []);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <span className={styles.eyebrow}>Not quite right? We'll fix it</span>
        <h1 className={styles.heroTitle}>Returns & Refunds</h1>
        <p className={styles.lastUpdated}>Last updated: August 31, 2026</p>
      </section>

     

      <div className={styles.promiseBanner}>
        <h2 className={styles.promiseTitle}>Our promise</h2>
        <p className={styles.promiseText}>
          Because we deliver fresh produce and perishable goods, our returns
          process works a little differently from typical retail. Rather than
          asking you to ship items back, we ask you to let us know quickly so we
          can make it right.
        </p>
      </div>

      <div className={styles.optionsGrid}>
        <div className={styles.optionCard}>
          <div className={styles.optionIcon}><ReplaceIcon /></div>
          <h3 className={styles.optionTitle}>Replacement</h3>
          <p className={styles.optionText}>On your next delivery, at no extra cost</p>
        </div>
        <div className={styles.optionCard}>
          <div className={styles.optionIcon}><RefundIcon /></div>
          <h3 className={styles.optionTitle}>Refund</h3>
          <p className={styles.optionText}>Back to your original payment method</p>
        </div>
        <div className={styles.optionCard}>
          <div className={styles.optionIcon}><CreditIcon /></div>
          <h3 className={styles.optionTitle}>Store Credit</h3>
          <p className={styles.optionText}>Toward a future order, if you prefer</p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.timelineItem}>
          <span className={styles.timelineDot} />
          <h2 className={styles.sectionHeading}>1. Reporting an Issue</h2>
          <p className={styles.sectionText}>
            If an item arrives damaged, spoiled, incorrect, or missing from your
            order, please contact us within 24 hours of delivery. Including a photo
            of the item helps us resolve the issue faster.
          </p>
        </div>

        <div className={styles.timelineItem}>
          <span className={styles.timelineDot} />
          <h2 className={styles.sectionHeading}>2. We Review It</h2>
          <p className={styles.sectionText}>
            Our support team looks into what happened and determines the best fix
            — which option applies depends on the situation and item availability.
          </p>
        </div>

        <div className={styles.timelineItem}>
          <span className={styles.timelineDot} />
          <h2 className={styles.sectionHeading}>3. Non-Returnable Situations</h2>
          <p className={styles.sectionText}>
            Because of the perishable nature of our products, we generally cannot
            accept physical returns of food items once delivered. Refunds or
            replacements for quality issues are handled based on your report and,
            where applicable, photo evidence rather than a physical return.
          </p>
        </div>

        <div className={styles.timelineItem}>
          <span className={styles.timelineDot} />
          <h2 className={styles.sectionHeading}>4. Refund Processing Time</h2>
          <p className={styles.sectionText}>
            Approved refunds are typically processed within 3–5 business days,
            depending on your payment method and provider. Refunds to mobile
            wallets or cards may take slightly longer to reflect, depending on your
            bank or provider's processing times.
          </p>
        </div>

        <div className={styles.timelineItem}>
          <span className={styles.timelineDot} />
          <h2 className={styles.sectionHeading}>5. Order Cancellations</h2>
          <ul className={styles.list}>
            <li>Free cancellation before an order is packed for delivery</li>
            <li>Once out for delivery, orders can no longer be cancelled</li>
            <li>You can still report an issue after delivery under the process above</li>
          </ul>
        </div>

        <div className={styles.contactCard}>
          <h2 className={styles.contactHeading}>Need to report an issue?</h2>
          <p className={styles.contactText}>hello@bazartoghar.com</p>
          <p className={styles.contactText}>+977 9867862670</p>
          <p className={styles.contactText}>Tinkune, 06, Butwal, Rupandehi, Nepal</p>
        </div>
      </div>
    </main>
  );
}