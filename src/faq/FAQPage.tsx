import { type JSX, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./FAQPage.module.scss";

const BRAND_NAME = "Bazar to Ghar";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  items: FAQItem[];
}

const faqCategories: FAQCategory[] = [
  {
    title: "Ordering",
    items: [
      {
        question: "How do I place an order?",
        answer:
          "Browse products, add whatever you need to your cart, and check out. You'll get a confirmation once your order is placed, and we start prepping it the same day.",
      },
      {
        question: "Is there a minimum order amount?",
        answer:
          "No minimum for browsing or checkout, but orders under a small threshold may carry a delivery fee. This is shown clearly at checkout before you pay.",
      },
      {
        question: "Can I edit or cancel my order after placing it?",
        answer:
          "Yes, as long as it hasn't been packed yet. Contact us as soon as possible through the Contact page or hotline and we'll do our best to adjust it.",
      },
    ],
  },
  {
    title: "Delivery",
    items: [
      {
        question: "How fast is delivery?",
        answer:
          "Order before noon and it typically arrives the same day. Orders placed later are delivered the next morning, still fresh from that day's harvest.",
      },
      {
        question: "Which areas do you deliver to?",
        answer:
          "We currently deliver across the city and nearby zones. You can check coverage for your address at checkout — if it's outside our zone, we'll let you know before you pay.",
      },
      {
        question: "What if I'm not home when the delivery arrives?",
        answer:
          "Our rider will try to reach you by phone. You can also leave delivery instructions at checkout, like leaving the order with a neighbor or at your gate.",
      },
    ],
  },
  {
    title: "Products & Quality",
    items: [
      {
        question: "Where does the produce come from?",
        answer:
          "Directly from local partner farms around the valley. Most items are picked the same morning they're packed, so nothing sits in storage for long.",
      },
      {
        question: "What if I receive a damaged or low-quality item?",
        answer:
          "Reach out within 24 hours with a photo if possible, and we'll replace the item or refund it — whichever you prefer.",
      },
    ],
  },
  {
    title: "Payments & Refunds",
    items: [
      {
        question: "What payment methods do you accept?",
        answer:
          "Cash on delivery, major mobile wallets, and card payments online at checkout.",
      },
      {
        question: "How do refunds work?",
        answer:
          "Approved refunds are processed within 3–5 business days back to your original payment method, or as store credit if you prefer.",
      },
    ],
  },
];

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}

export default function FAQPage(): JSX.Element {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `FAQ | ${BRAND_NAME}`;
  }, []);

  const hero = useReveal<HTMLElement>();
  const faqSection = useReveal<HTMLElement>();
  const cta = useReveal<HTMLElement>();

  const [openKey, setOpenKey] = useState<string | null>(null);

  const toggleItem = (key: string) => {
    setOpenKey((prev) => (prev === key ? null : key));
  };

  const handleContactUs = () => {
    navigate("/contact");
  };

  return (
    <main className={styles.page}>
      {/* Hero */}
      <section
        ref={hero.ref}
        className={`${styles.hero} ${hero.inView ? styles.revealed : ""}`}
      >
        <span className={styles.eyebrow}>Need a hand?</span>
        <h1 className={styles.heroTitle}>Frequently Asked Questions</h1>
        <p className={styles.heroCopy}>
          Everything about ordering, delivery, and freshness — answered.
          Can't find what you're looking for? Our team is a message away.
        </p>
      </section>

      {/* Garland divider */}
      <div className={styles.garlandDivider} aria-hidden="true">
        <svg viewBox="0 0 1200 40" preserveAspectRatio="none">
          <path
            d="M0,4 Q50,36 100,4 T200,4 T300,4 T400,4 T500,4 T600,4 T700,4 T800,4 T900,4 T1000,4 T1100,4 T1200,4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* FAQ accordion */}
      <section
        ref={faqSection.ref}
        className={`${styles.faqSection} ${faqSection.inView ? styles.revealed : ""}`}
      >
        <div className={styles.faqGrid}>
          {faqCategories.map((category, catIndex) => (
            <div
              key={category.title}
              className={styles.categoryBlock}
              style={{ transitionDelay: `${catIndex * 0.08}s` }}
            >
              <h2 className={styles.categoryTitle}>{category.title}</h2>

              <div className={styles.itemList}>
                {category.items.map((item, itemIndex) => {
                  const key = `${catIndex}-${itemIndex}`;
                  const isOpen = openKey === key;

                  return (
                    <div
                      key={key}
                      className={`${styles.faqItem} ${isOpen ? styles.open : ""}`}
                    >
                      <button
                        type="button"
                        className={styles.faqQuestion}
                        onClick={() => toggleItem(key)}
                        aria-expanded={isOpen}
                      >
                        <span>{item.question}</span>
                        <span className={styles.faqIcon}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 5v14M5 12h14" className={styles.plusVertical} />
                          </svg>
                        </span>
                      </button>

                      <div className={styles.faqAnswerWrapper}>
                        <p className={styles.faqAnswer}>{item.answer}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        ref={cta.ref}
        className={`${styles.cta} ${cta.inView ? styles.revealed : ""}`}
      >
        <span className={styles.ctaTag}>Still stuck?</span>
        <h2 className={styles.ctaTitle}>We're happy to help, just ask.</h2>
        <button className={styles.ctaBtn} onClick={handleContactUs}>
          Contact Us
        </button>
      </section>
    </main>
  );
}