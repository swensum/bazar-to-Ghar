import { type JSX, useEffect } from "react";
import styles from "./LegalPage.module.scss";

const BRAND_NAME = "Bazar to Ghar";

export default function TermsPage(): JSX.Element {
  useEffect(() => {
    document.title = `Terms of Service | ${BRAND_NAME}`;
  }, []);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <span className={styles.eyebrow}>Please read before ordering</span>
        <h1 className={styles.heroTitle}>Terms of Service</h1>
        <p className={styles.lastUpdated}>Last updated: August 31, 2026</p>
      </section>

      

      <div className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>1. Acceptance of Terms</h2>
          <p className={styles.sectionText}>
            By accessing or using {BRAND_NAME}, you agree to be bound by these
            Terms of Service. If you do not agree with any part of these terms,
            please do not use our website or services.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>2. Using Our Service</h2>
          <p className={styles.sectionText}>
            You agree to use {BRAND_NAME} only for lawful purposes and in a way
            that does not infringe the rights of, or restrict or inhibit the use
            of, this site by anyone else. You are responsible for maintaining the
            confidentiality of your account details.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>3. Orders & Payment</h2>
          <ul className={styles.list}>
            <li>All orders are subject to availability and confirmation of the order price</li>
            <li>Prices are listed in the applicable local currency and may change without prior notice</li>
            <li>Payment must be completed through one of our accepted payment methods before or upon delivery, depending on the method chosen</li>
            <li>We reserve the right to refuse or cancel any order at our discretion, including in cases of suspected fraud or pricing errors</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>4. Delivery</h2>
          <p className={styles.sectionText}>
            We aim to deliver orders within the estimated timeframe shown at
            checkout. Delivery times are estimates and not guaranteed, and may be
            affected by factors outside our control such as weather or traffic
            conditions. Please ensure someone is available to receive the order at
            the provided address.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>5. Cancellations & Refunds</h2>
          <p className={styles.sectionText}>
            Orders can typically be cancelled or modified before they are packed
            for delivery. Once an order has been dispatched, cancellation may not
            be possible. If you receive a damaged, incorrect, or missing item,
            contact us within 24 hours and we will arrange a replacement or refund
            at our discretion.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>6. Product Information</h2>
          <p className={styles.sectionText}>
            We make reasonable efforts to ensure product descriptions, images, and
            pricing are accurate. However, actual products may vary slightly (for
            example, due to natural variation in fresh produce), and we do not
            guarantee that all information on the site is completely error-free.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>7. Intellectual Property</h2>
          <p className={styles.sectionText}>
            All content on this website, including text, graphics, logos, and
            images, is the property of {BRAND_NAME} or its licensors and is
            protected by applicable intellectual property laws. You may not
            reproduce or use this content without our prior written permission.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>8. Limitation of Liability</h2>
          <p className={styles.sectionText}>
            To the fullest extent permitted by law, {BRAND_NAME} shall not be
            liable for any indirect, incidental, or consequential damages arising
            from your use of our website or services.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>9. Governing Law</h2>
          <p className={styles.sectionText}>
            These Terms shall be governed by and construed in accordance with the
            laws of Nepal, without regard to its conflict of law provisions.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>10. Changes to These Terms</h2>
          <p className={styles.sectionText}>
            We may revise these Terms of Service from time to time. Continued use
            of the site after changes are posted constitutes acceptance of the
            updated terms.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>11. Contact Us</h2>
          <div className={styles.contactBox}>
            <p>Questions about these Terms? Reach out to us:</p>
            <p><strong>Email:</strong> hello@bazartoghar.com</p>
            <p><strong>Phone:</strong> +977 9867862670</p>
            <p><strong>Address:</strong> Tinkune, 06, Butwal, Rupandehi, Nepal</p>
          </div>
        </section>
      </div>
    </main>
  );
}