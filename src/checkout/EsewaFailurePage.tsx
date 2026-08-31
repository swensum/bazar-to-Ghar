import { type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import styles from "./EsewaResultPage.module.scss";

export default function EsewaFailurePage(): JSX.Element {
  useDocumentTitle("Payment Failed");
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <div className={`${styles.card} ${styles.failure}`}>
        <div className={`${styles.iconCircle} ${styles.failureCircle}`}>
          <CrossIcon />
        </div>
        <h2>Payment was not completed</h2>
        <p>
          Your eSewa payment was cancelled or didn't go through. No amount
          has been charged. You can try again from checkout.
        </p>
        <button className={styles.primaryBtn} onClick={() => navigate("/checkout")}>
          Back to Checkout
        </button>
      </div>
    </div>
  );
}

function CrossIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}