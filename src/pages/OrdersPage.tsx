import { type JSX, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getUserOrders, type OrderRecord } from "../utils/orders";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import styles from "./Orderspage.module.scss";

export default function OrdersPage(): JSX.Element {
  useDocumentTitle("My Orders");
  const { currentUser, authReady } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authReady) return;
    if (!currentUser) {
      navigate("/auth", { state: { mode: "signin", from: "/orders" } });
      return;
    }
    getUserOrders(currentUser.uid)
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [authReady, currentUser, navigate]);

  const formatDate = (createdAt: any) => {
   
    try {
      const date = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt);
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>My Orders</h1>
        <div className={styles.emptyState}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <p>You haven't placed any orders yet.</p>
          <button className={styles.shopButton} onClick={() => navigate("/products")}>
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>My Orders</h1>

      {orders.map((order) => (
        <div key={order.id} className={styles.orderCard}>
          <div className={styles.orderHeader}>
            <div className={styles.orderMeta}>
              <span className={styles.transactionCode}>#{order.transactionCode}</span>
              <span className={styles.orderDate}>{formatDate(order.createdAt)}</span>
            </div>
            <span className={styles.statusBadge}>{order.status}</span>
          </div>

          <div className={styles.orderItems}>
            {order.items.map((item, i) => (
              <div key={i} className={styles.orderItemRow}>
                <span>
                  {item.name}
                  <span className={styles.itemQty}>× {item.quantity}</span>
                </span>
                <span>Rs {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className={styles.orderFooter}>
            <span>Total Paid</span>
            <span>Rs {order.totalAmountPaid.toFixed(2)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}