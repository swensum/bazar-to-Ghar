import { type JSX, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Aboutpage.module.scss";

import banner1 from "../assets/banner1.jpg";
import banner2 from "../assets/banner2.jpg";
import heroImg3 from "../assets/slider3.jpg";
import logo from "../assets/logo.png";

const BRAND_NAME = "Bazar to Ghar";

interface JourneyStep {
  label: string;
  description: string;
  icon: JSX.Element;
}

const journeySteps: JourneyStep[] = [
  {
    label: "Farm",
    description: "Picked fresh each morning by local growers we know by name.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c4-2 7-6 7-11a7 7 0 0 0-14 0c0 5 3 9 7 11z" />
        <path d="M12 11v6" />
        <path d="M9 8c1.5 1 4.5 1 6 0" />
      </svg>
    ),
  },
  {
    label: "Bazar",
    description: "Sorted and quality-checked the same day, no cold storage delays.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l1.5-5h15L21 9" />
        <path d="M4 9h16v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9z" />
        <path d="M9 13a3 3 0 0 0 6 0" />
      </svg>
    ),
  },
  {
    label: "Packed",
    description: "Weighed and boxed with care, ready within hours of your order.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 8l-9-5-9 5 9 5 9-5z" />
        <path d="M3 8v8l9 5 9-5V8" />
        <path d="M12 13v8" />
      </svg>
    ),
  },
  {
    label: "Your Ghar",
    description: "Delivered to your door, still cool from the morning harvest.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11l9-7 9 7" />
        <path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" />
      </svg>
    ),
  },
];

interface Feature {
  title: string;
  description: string;
  accent: "green" | "gold";
  icon: JSX.Element;
}

const features: Feature[] = [
  {
    title: "Picked Fresh, Daily",
    description: "Nothing sits in a warehouse. What's harvested today ships today.",
    accent: "green",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v6" /><path d="M12 22c5-1 8-5 8-11-4 0-7 2-8 5-1-3-4-5-8-5 0 6 3 10 8 11z" />
      </svg>
    ),
  },
  {
    title: "Local Growers First",
    description: "We buy directly from farms around the valley, cutting out middlemen.",
    accent: "gold",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" /><path d="M4 21v-1a8 8 0 0 1 16 0v1" />
      </svg>
    ),
  },
  {
    title: "Same-Day Delivery",
    description: "Order before noon, and it's at your ghar before dinner.",
    accent: "green",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
      </svg>
    ),
  },
  {
    title: "Fair Prices, Always",
    description: "Bazar prices, without the bazar trip. No markup for convenience.",
    accent: "gold",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1v22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
];

const stats = [
  { value: "500+", label: "Fresh products" },
  { value: "120+", label: "Partner farms" },
  { value: "15", label: "Cities served" },
  { value: "10,000+", label: "Happy homes" },
];

interface TeamMember {
  name: string;
  role: string;
  photo: string;
}

const teamMembers: TeamMember[] = [
  { name: "Sabnam Shrestha", role: "Founder & CEO", photo: banner1 },
  { name: "Rajan Thapa", role: "Head of Operations", photo: banner2 },
  { name: "Anita Gurung", role: "Sourcing Lead", photo: heroImg3 },
  { name: "Bikash Rai", role: "Delivery & Logistics", photo: logo },
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
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}

export default function AboutPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = `About Us | ${BRAND_NAME}`;
  }, []);

  // Scroll to the section matching the URL hash (e.g. /about#team)
  useEffect(() => {
  if (location.hash) {
    const id = location.hash.replace('#', '');

    const scrollToSection = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    // Try once early, then again after scroll restoration / animations settle
    const t1 = setTimeout(scrollToSection, 150);
    const t2 = setTimeout(scrollToSection, 700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }
}, [location.hash]);

  const hero = useReveal<HTMLElement>();
  const journey = useReveal<HTMLElement>();
  const why = useReveal<HTMLElement>();
  const story = useReveal<HTMLElement>();
  const team = useReveal<HTMLElement>();
  const cta = useReveal<HTMLElement>();

  const handleShopNow = () => {
    navigate("/products", { state: { selectedCategory: "all-products" } });
  };
  const trailContainerRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [trailPathD, setTrailPathD] = useState("");
  const [trailSvgBox, setTrailSvgBox] = useState({ width: 0, height: 0 });

  const ANCHOR_GAP = 12;      // gap between the icon top and where the line touches
  const ARCH_PADDING = 70;    // room reserved above the row for the arcs
  const ARCH_HEIGHTS = [30, 46]; // alternating arc heights for a natural rhythm

  useEffect(() => {
    function computeTrailPath() {
      const container = trailContainerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();

      const points = iconRefs.current
        .map((el) => {
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return {
            x: r.left + r.width / 2 - containerRect.left,
          
            y: r.top - containerRect.top - ANCHOR_GAP + ARCH_PADDING,
          };
        })
        .filter((p): p is { x: number; y: number } => p !== null);

      if (points.length < 2) return;

      let d = `M ${points[0].x},${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const archHeight = ARCH_HEIGHTS[i % ARCH_HEIGHTS.length];
        const archY = Math.min(p0.y, p1.y) - archHeight;
        const c1x = p0.x + (p1.x - p0.x) / 3;
        const c2x = p0.x + ((p1.x - p0.x) * 2) / 3;
        
        d += ` C ${c1x},${archY} ${c2x},${archY} ${p1.x},${p1.y}`;
      }

      setTrailPathD(d);
      setTrailSvgBox({ width: containerRect.width, height: containerRect.height + ARCH_PADDING });
    }

    computeTrailPath();
    const settleTimer = setTimeout(computeTrailPath, 300);
    window.addEventListener("resize", computeTrailPath);

    return () => {
      clearTimeout(settleTimer);
      window.removeEventListener("resize", computeTrailPath);
    };
  }, []);

  return (
    <main className={styles.page}>
      {/* Hero */}
      <section
        ref={hero.ref}
        className={`${styles.hero} ${hero.inView ? styles.revealed : ""}`}
      >
        <div className={styles.heroText}>
          <span className={styles.eyebrow}>Our Story</span>
          <h1 className={styles.heroTitle}>
            From the bazar,
            <br />
            straight to your ghar.
          </h1>
          <p className={styles.heroCopy}>
            {BRAND_NAME} started with a simple frustration: the best produce in the
            valley was always at the bazar, and the bazar was never close enough.
            So we built the bridge — real farmers, real freshness, delivered
            to your door the same day it's picked.
          </p>
          <div className={styles.heroActions}>
            <button className={styles.primaryBtn} onClick={handleShopNow}>
              Shop Fresh Today
            </button>
            <div className={styles.heroStat}>
              <strong>10,000+</strong>
              <span>families served across Nepal</span>
            </div>
          </div>
        </div>

        <div className={styles.heroImages}>
          <div className={styles.heroImagePrimary} style={{ backgroundImage: `url(${banner1})` }} />
          <div className={styles.heroImageSecondary} style={{ backgroundImage: `url(${banner2})` }} />
          <img src={logo} alt="" className={styles.heroLogoBadge} aria-hidden="true" />
        </div>
      </section>

      {/* Garland divider — nods to marigold bunting strung across bazar streets */}
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

      {/* Journey trail — signature section */}
      <section
        ref={journey.ref}
        className={`${styles.journey} ${journey.inView ? styles.revealed : ""}`}
      >
        <span className={styles.eyebrow}>How It Works</span>
        <h2 className={styles.sectionTitle}>How your basket travels</h2>
        <p className={styles.sectionSubtitle}>
          Every order follows the same short trail — no distribution centers,
          no weeks-old cold storage.
        </p>

        <div className={styles.trail} ref={trailContainerRef}>
          {trailPathD && (
            <svg
              className={styles.trailPath}
              viewBox={`0 0 ${trailSvgBox.width} ${trailSvgBox.height}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d={trailPathD} fill="none" pathLength="1" />
            </svg>
          )}

          <div className={styles.trailSteps}>
            {journeySteps.map((step, i) => (
              <div key={step.label} className={styles.trailStep} style={{ transitionDelay: `${i * 0.15}s` }}>
                <div
                  className={styles.trailIcon}
                  ref={(el) => { iconRefs.current[i] = el; }}
                >
                  {step.icon}
                </div>
                <h3 className={styles.trailLabel}>{step.label}</h3>
                <p className={styles.trailDescription}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section
        ref={why.ref}
        id="mission"
        className={`${styles.why} ${why.inView ? styles.revealed : ""}`}
      >
        <span className={styles.eyebrow}>Why {BRAND_NAME}</span>
        <h2 className={styles.sectionTitle}>Built for freshness, not shelf life</h2>

        <div className={styles.featureGrid}>
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={`${styles.featureCard} ${styles[`accent${feature.accent === "green" ? "Green" : "Gold"}`]}`}
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats band */}
      <section className={styles.statsBand}>
        <div className={styles.statsGrid}>
          {stats.map((stat) => (
            <div key={stat.label} className={styles.statItem}>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section
        ref={story.ref}
        id="story"
        className={`${styles.story} ${story.inView ? styles.revealed : ""}`}
      >
        <div className={styles.storyImage} style={{ backgroundImage: `url(${heroImg3})` }} />
        <div className={styles.storyText}>
          <span className={styles.eyebrow}>Why We Started</span>
          <h2 className={styles.sectionTitle}>A bazar trip shouldn't take an afternoon</h2>
          <p className={styles.storyCopy}>
            Every household in Nepal knows the routine — early mornings, crowded
            stalls, and the guesswork of what's actually fresh that day. We
            started {BRAND_NAME} to keep the good part of the bazar — real
            farmers, real produce, real prices — and remove the part that
            eats your whole morning.
          </p>
          <p className={styles.storyCopy}>
            Today we work with over a hundred farms across the valley, packing
            and delivering orders the same day they're placed, so your kitchen
            never has to wait on the harvest.
          </p>
        </div>
      </section>

      {/* Team */}
      <section
        ref={team.ref}
        id="team"
        className={`${styles.team} ${team.inView ? styles.revealed : ""}`}
      >
        <span className={styles.eyebrow}>The People Behind It</span>
        <h2 className={styles.sectionTitle}>Meet the team</h2>
        <p className={styles.sectionSubtitle}>
          A small crew working early mornings so your kitchen never runs short.
        </p>

        <div className={styles.teamGrid}>
          {teamMembers.map((member, i) => (
            <div
              key={member.name}
              className={styles.teamCard}
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div
                className={styles.teamPhoto}
                style={{ backgroundImage: `url(${member.photo})` }}
              />
              <h3 className={styles.teamName}>{member.name}</h3>
              <p className={styles.teamRole}>{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        ref={cta.ref}
        className={`${styles.cta} ${cta.inView ? styles.revealed : ""}`}
      >
        <span className={styles.ctaTag}>Hungry for fresh?</span>
        <h2 className={styles.ctaTitle}>Your bazar basket, packed and on its way.</h2>
        <button className={styles.ctaBtn} onClick={handleShopNow}>
          Shop Now
        </button>
      </section>
    </main>
  );
}