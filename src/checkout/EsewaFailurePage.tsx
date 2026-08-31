import { type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import styles from "./EsewaResultPage.module.scss";

export default function EsewaFailurePage(): JSX.Element {
  useDocumentTitle("Payment Failed");
  const navigate = useNavigate();

  const handleBackToCheckout = () => {
    // CheckoutPage requires `product` or `cartItems` in location.state to
    // render the actual form — navigating with no state drops the user on
    // its "No items found" empty state instead. Restore the items/totals
    // we saved just before redirecting to eSewa so the form comes back
    // exactly as the user left it.
    const raw = sessionStorage.getItem("pending-esewa-order");

    if (raw) {
      try {
        const order = JSON.parse(raw);
        navigate("/checkout", {
          state: {
            cartItems: order.items,
            cartTotal: order.subtotal,
            shippingCharge: order.shippingCharge,
            hasFreeShipping: order.shippingCharge === 0,
          },
        });
        return;
      } catch {
        // fall through to plain navigate below if parsing fails
      }
    }

    // No saved order to restore from (e.g. sessionStorage was cleared) —
    // send the user to checkout anyway; they'll see the empty state and
    // can navigate from cart/product again.
    navigate("/checkout");
  };

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
        <button className={styles.primaryBtn} onClick={handleBackToCheckout}>
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