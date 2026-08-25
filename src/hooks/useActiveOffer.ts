import { useState, useEffect, useCallback } from "react";
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

export function useActiveOffer() {
  const [activeOffer, setActiveOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);

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
    fetchActiveOffer();
  }, [fetchActiveOffer]);

  return { activeOffer, loading, refetch: fetchActiveOffer };
}