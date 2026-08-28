// contact/ContactPage.tsx
import { type JSX, useState } from "react";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { dbLite } from "../store/firebaselite";
import { collection, addDoc, serverTimestamp } from "firebase/firestore/lite";
import styles from "./ContactPage.module.scss";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
interface FormState {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  subject: "General question",
  message: "",
};

export default function ContactPage(): JSX.Element {
  useDocumentTitle("Contact Us");

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus("error");
      return;
    }

    setStatus("submitting");

    try {
      await addDoc(collection(dbLite, "contact_messages"), {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        subject: form.subject,
        message: form.message.trim(),
        createdAt: serverTimestamp(),
        isRead: false,
      });

      setStatus("success");
      setForm(INITIAL_FORM);
    } catch (error) {
      console.error("Error sending message:", error);
      setStatus("error");
    }
  };

  return (
    <div className={styles.page}>
      {/* ---------------- Hero ---------------- */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>fresh picks, real people</span>
          <h1 className={styles.heroTitle}>
            Got a craving,
            <br />
            a question, or just&nbsp;say hi?
          </h1>
          <p className={styles.heroSub}>
            Every order, every message, every "where's my mango" — a real
            person on our team reads it. Usually within a day.
          </p>

          <RouteAnimation className={styles.routeWrap} />
        </div>
      </section>

      {/* ---------------- Crate cards ---------------- */}
      <section className={styles.crateSection}>
        <div className={styles.crateGrid}>
          <CrateCard
            icon={<PinIcon />}
            label="Our stall"
            value={
              <>
                Tinkune, 06

                <br />
              Butwal, Rupandehi, Nepal
              </>
            }
          />
          <CrateCard
            icon={<PhoneIcon />}
            label="Ring / WhatsApp"
            value="+977 9867862670"
          />
          <CrateCard
            icon={<MailIcon />}
            label="Email"
            value="hello@bazartoghar.com"
          />
          <CrateCard
            icon={<ClockIcon />}
            label="Open every day"
            value="7:00 AM – 9:00 PM"
          />
        </div>
      </section>

      <RouteAnimation className={styles.dividerRoute} compact />

      {/* ---------------- Form + side panel ---------------- */}
      <section className={styles.mainSection}>
        <div className={styles.mainGrid}>
          <form className={styles.formCard} onSubmit={handleSubmit} noValidate>
            <span className={styles.formEyebrow}>drop us a line</span>
            <h2 className={styles.formTitle}>Write your order slip</h2>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="name">
                  Your name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className={styles.formInput}
                  placeholder="Sabnam Shrestha"
                  value={form.name}
                  onChange={handleChange}
                  disabled={status === "submitting"}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="phone">
                  Phone (optional)
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className={styles.formInput}
                  placeholder="98X-XXXXXXX"
                  value={form.phone}
                  onChange={handleChange}
                  disabled={status === "submitting"}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="email">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className={styles.formInput}
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                disabled={status === "submitting"}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="subject">
                What's this about?
              </label>
              <select
                id="subject"
                name="subject"
                className={styles.formSelect}
                value={form.subject}
                onChange={handleChange}
                disabled={status === "submitting"}
              >
                <option>General question</option>
                <option>Order issue</option>
                <option>Partnership / bulk orders</option>
                <option>Feedback</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="message">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                className={styles.formTextarea}
                placeholder="Tell us what's going on..."
                value={form.message}
                onChange={handleChange}
                disabled={status === "submitting"}
              />
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={status === "submitting"}
            >
              {status === "submitting" ? (
                <span className={styles.spinner} />
              ) : (
                "Send it our way"
              )}
            </button>

            {status === "success" && (
              <div className={styles.successBox}>
                <CheckIcon />
                <span>Thanks! We'll get back to you within a day.</span>
              </div>
            )}
            {status === "error" && (
              <div className={styles.errorBox}>
                Please fill in your name, email, and message.
              </div>
            )}
          </form>

          <aside className={styles.sidePanel}>
            <div className={styles.zoneCard}>
              <div className={styles.pinWrap}>
                <span className={styles.pinPulse} />
                <span className={styles.pinPulse2} />
                <PinIcon className={styles.pinIcon} />
              </div>
              <h3 className={styles.zoneTitle}>We deliver across the city</h3>
              <p className={styles.zoneText}>
                Same-day delivery, 7 days a week. Order before 6 PM for
                doorstep delivery today.
              </p>
            </div>

            <div className={styles.factCard}>
              <h4 className={styles.factTitle}>Quick facts</h4>
              <ul className={styles.factList}>
                <li>
                  <LeafIcon /> Sourced fresh every morning
                </li>
                <li>
                  <LeafIcon /> Average reply time: under 24 hours
                </li>
                <li>
                  <LeafIcon /> Support desk open every day
                </li>
              </ul>
            </div>

            <div className={styles.socialCard}>
              <h4 className={styles.factTitle}>Find us elsewhere</h4>
              <div className={styles.socialRow}>
  <a href="#" className={styles.socialLink} aria-label="Facebook">
    <FaFacebookF />
  </a>
  <a href="#" className={styles.socialLink} aria-label="Instagram">
    <FaInstagram />
  </a>
  <a href="#" className={styles.socialLink} aria-label="WhatsApp">
    <FaWhatsapp />
  </a>
</div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small presentational pieces                                        */
/* ------------------------------------------------------------------ */

function CrateCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className={styles.crateCard}>
      <div className={styles.crateIcon}>{icon}</div>
      <div className={styles.crateLabel}>{label}</div>
      <div className={styles.crateValue}>{value}</div>
    </div>
  );
}

function RouteAnimation({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const height = compact ? 60 : 140;
  const pathD = compact
    ? "M10,30 C 120,-10 260,70 400,30 S 620,-10 780,30"
    : "M10,90 C 150,10 300,150 450,80 S 700,10 880,80";

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 900 ${height}`}
        className={styles.routeSvg}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d={pathD}
          className={styles.routePath}
          fill="none"
          strokeWidth={compact ? 2 : 3}
          strokeDasharray="2 14"
          strokeLinecap="round"
        />
        {!compact && (
          <>
            <g transform="translate(10, 74)">
              <StallIcon />
            </g>
            <g transform="translate(850, 60)">
              <HouseIcon />
            </g>
          </>
        )}
        <g className={styles.bikeGroup}>
          <BikeIcon />
          <animateMotion
            path={pathD}
            dur={compact ? "9s" : "7s"}
            repeatCount="indefinite"
            rotate="auto"
          />
        </g>
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Icons (inline, no external icon deps)                              */
/* ------------------------------------------------------------------ */

function PinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.68 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.32 1.85.55 2.81.68A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 6-10 7L2 6" />
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

function LeafIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 12-11 2 8-2 12-5 13a7 7 0 0 1 0 0z" />
      <path d="M6.5 17.5C9 15 12 12 15 8" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function StallIcon() {
  return (
    <svg width="40" height="36" viewBox="0 0 40 36" fill="none">
      <path d="M2 12 L20 2 L38 12" stroke="#F3EFE4" strokeWidth="2" fill="none" />
      <rect x="4" y="12" width="32" height="20" rx="1" fill="#C98A4B" opacity="0.9" />
      <rect x="4" y="12" width="32" height="6" fill="#C2452D" opacity="0.85" />
      <rect x="10" y="20" width="6" height="12" fill="#1F2E23" opacity="0.4" />
      <rect x="24" y="20" width="6" height="12" fill="#1F2E23" opacity="0.4" />
    </svg>
  );
}

function HouseIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <path d="M4 18 L20 4 L36 18" stroke="#F3EFE4" strokeWidth="2" fill="none" />
      <rect x="8" y="18" width="24" height="18" fill="#7FA65A" opacity="0.9" />
      <rect x="17" y="24" width="6" height="12" fill="#1F2E23" opacity="0.4" />
    </svg>
  );
}

function BikeIcon() {
  return (
    <g transform="translate(-12,-10)">
      <circle cx="6" cy="18" r="5" fill="none" stroke="#F3EFE4" strokeWidth="2" />
      <circle cx="20" cy="18" r="5" fill="none" stroke="#F3EFE4" strokeWidth="2" />
      <path
        d="M6 18 L11 8 H16 M11 8 L14 14 H20 L16 18 H6 M14 14 L16 18"
        fill="none"
        stroke="#F3EFE4"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect x="15" y="4" width="6" height="5" rx="1" fill="#C2452D" />
    </g>
  );
}