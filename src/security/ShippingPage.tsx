import { type JSX, useEffect } from "react";
import styles from "./ShippingPage.module.scss";

const BRAND_NAME = "Bazar to Ghar";

function TruckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 3h15v13H1z" />
      <path d="M16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function CoinIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9 9.5c0-1 1-1.5 3-1.5s3 .8 3 2-1 1.7-3 2-3 1-3 2 1 2 3 2 3-.5 3-1.5" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 6l7-3 8 3 7-3v16l-7 3-8-3-7 3z" />
      <path d="M8 3v16M16 6v16" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 8l-9-5-9 5 9 5 9-5z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}

export default function ShippingPage(): JSX.Element {
  useEffect(() => {
    document.title = `Shipping Info | ${BRAND_NAME}`;
  }, []);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <span className={styles.eyebrow}>Fresh, fast, to your door</span>
        <h1 className={styles.heroTitle}>Shipping Information</h1>
        <p className={styles.lastUpdated}>Last updated: August 31, 2026</p>
      </section>

      <div className={styles.routeDivider} aria-hidden="true">
        <svg viewBox="0 0 700 34" preserveAspectRatio="none">
          <path
            d="M10,17 C 120,-5 240,39 350,17 S 580,-5 690,17"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray="2 12"
            strokeLinecap="round"
          />
        </svg>
      </div>

     

      <div className={styles.factsStrip}>
        <div className={styles.factCard}>
          <div className={styles.factIcon}><ClockIcon /></div>
          <p className={styles.factValue}>Same-Day</p>
          <p className={styles.factLabel}>For orders before noon</p>
        </div>
        <div className={styles.factCard}>
          <div className={styles.factIcon}><TruckIcon /></div>
          <p className={styles.factValue}>7 AM – 9 PM</p>
          <p className={styles.factLabel}>Delivery hours, daily</p>
        </div>
        <div className={styles.factCard}>
          <div className={styles.factIcon}><CoinIcon /></div>
          <p className={styles.factValue}>Free Above Threshold</p>
          <p className={styles.factLabel}>Shown clearly at checkout</p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.sectionCard}>
          <div className={styles.sectionIcon}><MapIcon /></div>
          <div className={styles.sectionBody}>
            <h2 className={styles.sectionHeading}>Delivery Areas</h2>
            <p className={styles.sectionText}>
              We currently deliver across Butwal and surrounding areas within our
              service zone. You can confirm whether your address is covered by
              entering it at checkout — if it falls outside our delivery zone,
              you'll be notified before completing your order.
            </p>
          </div>
        </div>

        <div className={styles.sectionCard}>
          <div className={styles.sectionIcon}><ClockIcon /></div>
          <div className={styles.sectionBody}>
            <h2 className={styles.sectionHeading}>Delivery Timeframes</h2>
            <ul className={styles.list}>
              <li>Orders placed before 12:00 PM are typically delivered the same day</li>
              <li>Orders placed after 12:00 PM are delivered the next morning</li>
              <li>Delivery hours run from 7:00 AM to 9:00 PM, seven days a week</li>
            </ul>
            <p className={styles.sectionText}>
              These timeframes are estimates, not guarantees. Delivery may occasionally
              be delayed due to weather, traffic, or high order volumes, and we'll do
              our best to keep you informed if that happens.
            </p>
          </div>
        </div>

        <div className={styles.sectionCard}>
          <div className={styles.sectionIcon}><CoinIcon /></div>
          <div className={styles.sectionBody}>
            <h2 className={styles.sectionHeading}>Delivery Fees</h2>
            <p className={styles.sectionText}>
              Delivery fees, if any, are calculated based on your order total and
              distance from our stall, and are shown clearly at checkout before you
              confirm your order. Orders above a certain amount may qualify for free
              delivery — this threshold is displayed at checkout.
            </p>
          </div>
        </div>

        <div className={styles.sectionCard}>
          <div className={styles.sectionIcon}><BoxIcon /></div>
          <div className={styles.sectionBody}>
            <h2 className={styles.sectionHeading}>Order Tracking</h2>
            <p className={styles.sectionText}>
              Once your order is confirmed, you'll receive updates on its status. If
              you have questions about where your order is, you can reach out to us
              directly through the Contact page or our hotline.
            </p>
          </div>
        </div>

        <div className={styles.sectionCard}>
          <div className={styles.sectionIcon}><PinIcon /></div>
          <div className={styles.sectionBody}>
            <h2 className={styles.sectionHeading}>Receiving Your Order</h2>
            <p className={styles.sectionText}>
              Please ensure someone is available at the delivery address during the
              expected delivery window. If you're unavailable, our rider will attempt
              to contact you by phone. You can also leave delivery instructions
              (such as leaving the order with a neighbor or at your gate) at checkout.
            </p>
          </div>
        </div>

        <div className={styles.sectionCard}>
          <div className={styles.sectionIcon}><AlertIcon /></div>
          <div className={styles.sectionBody}>
            <h2 className={styles.sectionHeading}>Missed or Failed Deliveries</h2>
            <p className={styles.sectionText}>
              If a delivery cannot be completed after reasonable attempts to reach
              you, the order may be rescheduled or cancelled, depending on the
              circumstances. Repeated missed deliveries may affect the ability to use
              certain payment options, such as cash on delivery, in the future.
            </p>
          </div>
        </div>

        <div className={styles.contactCard}>
          <h2 className={styles.contactHeading}>Questions about a delivery?</h2>
          <p className={styles.contactText}>hello@bazartoghar.com</p>
          <p className={styles.contactText}>+977 9867862670</p>
          <p className={styles.contactText}>Tinkune, 06, Butwal, Rupandehi, Nepal</p>
        </div>
      </div>
    </main>
  );
}