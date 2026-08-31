import { type JSX, useEffect } from "react";
import styles from "./LegalPage.module.scss";

const BRAND_NAME = "Bazar to Ghar";

export default function PrivacyPage(): JSX.Element {
  useEffect(() => {
    document.title = `Privacy Policy | ${BRAND_NAME}`;
  }, []);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <span className={styles.eyebrow}>Your data, handled responsibly</span>
        <h1 className={styles.heroTitle}>Privacy Policy</h1>
        <p className={styles.lastUpdated}>Last updated: August 31, 2026</p>
      </section>

     

      <div className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>1. Information We Collect</h2>
          <p className={styles.sectionText}>
            When you use {BRAND_NAME}, we may collect the following types of information:
          </p>
          <ul className={styles.list}>
            <li>Contact details you provide, such as your name, email address, and phone number</li>
            <li>Delivery address and location information needed to fulfill your order</li>
            <li>Order history and preferences</li>
            <li>Payment information, processed securely through our payment partners (we do not store full card details)</li>
            <li>Basic technical data such as browser type and device information, used to keep the site working properly</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>2. How We Use Your Information</h2>
          <p className={styles.sectionText}>We use the information we collect to:</p>
          <ul className={styles.list}>
            <li>Process and deliver your orders</li>
            <li>Communicate with you about your orders, account, or support requests</li>
            <li>Improve our products, website, and delivery experience</li>
            <li>Send occasional updates or offers, which you can opt out of at any time</li>
            <li>Detect and prevent fraud or misuse of our services</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>3. Cookies & Tracking</h2>
          <p className={styles.sectionText}>
            We use cookies and similar technologies to keep you signed in, remember
            your cart, and understand how our site is used so we can improve it. You
            can control cookies through your browser settings, though some features
            of the site may not work correctly if cookies are disabled.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>4. Sharing Your Information</h2>
          <p className={styles.sectionText}>
            We do not sell your personal information. We may share limited
            information with trusted third parties strictly to operate our
            business, such as:
          </p>
          <ul className={styles.list}>
            <li>Delivery partners, to get your order to your door</li>
            <li>Payment processors, to securely handle transactions</li>
            <li>Service providers who help us run the website and app</li>
          </ul>
          <p className={styles.sectionText}>
            We may also disclose information if required by law or to protect the
            rights, safety, or property of {BRAND_NAME} or our customers.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>5. Data Security</h2>
          <p className={styles.sectionText}>
            We take reasonable technical and organizational measures to protect
            your information from unauthorized access, loss, or misuse. However, no
            method of transmission or storage over the internet is completely
            secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>6. Your Rights & Choices</h2>
          <p className={styles.sectionText}>
            You can request to access, update, or delete the personal information
            we hold about you at any time by contacting us. You may also opt out of
            promotional messages while still receiving essential order-related
            communications.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>7. Children's Privacy</h2>
          <p className={styles.sectionText}>
            Our services are not directed to children, and we do not knowingly
            collect personal information from children under 13.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>8. Changes to This Policy</h2>
          <p className={styles.sectionText}>
            We may update this Privacy Policy from time to time. Any changes will
            be posted on this page with an updated "last updated" date.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>9. Contact Us</h2>
          <div className={styles.contactBox}>
            <p>If you have questions about this Privacy Policy, reach out to us:</p>
            <p><strong>Email:</strong> hello@bazartoghar.com</p>
            <p><strong>Phone:</strong> +977 9867862670</p>
            <p><strong>Address:</strong> Tinkune, 06, Butwal, Rupandehi, Nepal</p>
          </div>
        </section>
      </div>
    </main>
  );
}