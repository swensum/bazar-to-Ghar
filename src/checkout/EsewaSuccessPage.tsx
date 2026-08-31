import { type JSX, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { decodeEsewaResponse, verifyEsewaSignature } from "../utils/esewa";
import { useCart } from "../contexts/CartContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import styles from "./EsewaResultPage.module.scss";

type PendingOrder = {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  area: string;
  items: any[];
  subtotal: number;
  shippingCharge: number;
  discount: number;
  grandTotal: number;
};

export default function EsewaSuccessPage(): JSX.Element {
  useDocumentTitle("Payment Successful");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [status, setStatus] = useState<"verifying" | "confirmed" | "invalid">("verifying");
  const [details, setDetails] = useState<{ transactionCode: string; amount: number } | null>(null);

  // Saved just before the eSewa redirect in CheckoutPage.handlePayNow —
  // holds the full order (contact info, address, items, totals) that the
  // eSewa response itself doesn't carry. Kept around in case the user
  // needs to go "Back to Checkout" from the invalid-payment branch below.
  const pendingOrderRef = useRef<PendingOrder | null>(null);

  // Guards against React 18 StrictMode's double effect invocation in dev,
  // which would otherwise call clearCart() twice and (once the Firestore
  // save below is implemented) risk writing the order twice.
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const raw = sessionStorage.getItem("pending-esewa-order");
    if (raw) {
      try {
        pendingOrderRef.current = JSON.parse(raw);
      } catch {
        pendingOrderRef.current = null;
      }
    }

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
    // TODO: save the order to Firestore here using pendingOrderRef.current
    // (contact info, address, items, totals) plus response.transaction_code,
    // response.transaction_uuid, response.total_amount.
    setDetails({
      transactionCode: response.transaction_code,
      amount: response.total_amount,
    });
    setStatus("confirmed");
    clearCart();

    // Order is fully captured now — drop the draft so a stale one can't
    // leak into a future checkout attempt.
    sessionStorage.removeItem("pending-esewa-order");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleBackToCheckout = () => {
    const order = pendingOrderRef.current;

    if (order) {
      navigate("/checkout", {
        state: {
          cartItems: order.items,
          cartTotal: order.subtotal,
          shippingCharge: order.shippingCharge,
          hasFreeShipping: order.shippingCharge === 0,
        },
      });
      return;
    }

    navigate("/checkout");
  };

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
          <button className={styles.primaryBtn} onClick={handleBackToCheckout}>
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