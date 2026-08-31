import { type JSX, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { decodeEsewaResponse, verifyEsewaSignature } from "../utils/esewa";
import { useCart } from "../contexts/CartContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import styles from "./EsewaResultPage.module.scss";

export default function EsewaSuccessPage(): JSX.Element {
  useDocumentTitle("Payment Successful");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [status, setStatus] = useState<"verifying" | "confirmed" | "invalid">("verifying");
  const [details, setDetails] = useState<{ transactionCode: string; amount: number } | null>(null);

  useEffect(() => {
    const data = searchParams.get("data");

    if (!data) {
      setStatus("invalid");
      return;
    }

    const response = decodeEsewaResponse(data);

    if (!response || response.status !== "COMPLETE" || !verifyEsewaSignature(response)) {
      setStatus("invalid");
      return;
    }

    // Payment confirmed and signature verified — safe to treat as paid.
    // TODO: save the order to Firestore here (transaction_code, amount,
    // transaction_uuid, items from the cart, etc.) before clearing the cart.
    setDetails({
      transactionCode: response.transaction_code,
      amount: response.total_amount,
    });
    setStatus("confirmed");
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className={styles.page}>
      {status === "verifying" && (
        <div className={styles.card}>
          <div className={styles.spinner} />
          <h2>Verifying your payment...</h2>
        </div>
      )}

      {status === "confirmed" && details && (
        <div className={`${styles.card} ${styles.success}`}>
          <div className={styles.iconCircle}>
            <CheckIcon />
          </div>
          <h2>Payment successful!</h2>
          <p>Your order has been placed and paid via eSewa.</p>
          <div className={styles.detailsBox}>
            <div>
              <span>Transaction code</span>
              <strong>{details.transactionCode}</strong>
            </div>
            <div>
              <span>Amount paid</span>
              <strong>Rs. {details.amount.toFixed(2)}</strong>
            </div>
          </div>
          <button className={styles.primaryBtn} onClick={() => navigate("/")}>
            Continue Shopping
          </button>
        </div>
      )}

      {status === "invalid" && (
        <div className={`${styles.card} ${styles.failure}`}>
          <div className={`${styles.iconCircle} ${styles.failureCircle}`}>
            <CrossIcon />
          </div>
          <h2>We couldn't verify this payment</h2>
          <p>
            The payment response looks incomplete or invalid. If money was
            deducted from your eSewa account, please contact support with
            your transaction details before trying again.
          </p>
          <button className={styles.primaryBtn} onClick={() => navigate("/checkout")}>
            Back to Checkout
          </button>
        </div>
      )}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}