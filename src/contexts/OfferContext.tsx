import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { dbLite } from "../store/firebaselite";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore/lite";

export interface Offer {
  id: string;
  title: string;
  subtitle: string;
  end_date: string;
  is_active: boolean;
  discount_percentage: number;
  applicable_categories: string[];
}

interface OfferContextValue {
  activeOffer: Offer | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

const OfferContext = createContext<OfferContextValue | undefined>(undefined);

export function OfferProvider({ children }: { children: ReactNode }) {
  const [activeOffer, setActiveOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchActiveOffer = useCallback(async () => {
    try {
      setLoading(true);
      const offersRef = collection(dbLite, "offers");
      const q = query(
        offersRef,
        where("isActive", "==", true),
        orderBy("endDate", "desc"),
        limit(10)
      );
      const snapshot = await getDocs(q);

      const now = new Date();
      const offer = snapshot.docs
        .map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            title: data.title,
            subtitle: data.subtitle,
            end_date: data.endDate?.toDate
              ? data.endDate.toDate().toISOString()
              : data.endDate,
            is_active: data.isActive,
            discount_percentage: data.discountPercentage ?? 0,
            applicable_categories: data.applicableCategories ?? [],
          };
        })
        .find((o) => new Date(o.end_date) > now);

      setActiveOffer(offer || null);
    } catch (error) {
      console.error("Error fetching offer:", error);
      setActiveOffer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Guard: only fetch once per app session, even under StrictMode's
    // double-invoke or multiple consumers mounting/unmounting.
    if (hasFetched) return;
    setHasFetched(true);
    fetchActiveOffer();
  }, [hasFetched, fetchActiveOffer]);

  return (
    <OfferContext.Provider value={{ activeOffer, loading, refetch: fetchActiveOffer }}>
      {children}
    </OfferContext.Provider>
  );
}

// Drop-in replacement for your old `useActiveOffer()` hook.
// Same return shape, but now reads from shared context instead of
// firing its own Firestore query every time a component uses it.
export function useActiveOffer() {
  const ctx = useContext(OfferContext);
  if (!ctx) {
    throw new Error("useActiveOffer must be used within an OfferProvider");
  }
  return ctx;
}