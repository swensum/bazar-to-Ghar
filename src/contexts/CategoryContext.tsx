// contexts/CategoryContext.tsx
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { dbLite } from "../store/firebaselite";
import { collection, getDocs, orderBy, query } from "firebase/firestore/lite";
import type { CategoryWithCount } from "../types/category";

interface CategoryContextValue {
  categories: CategoryWithCount[];
  loading: boolean;
  refetch: () => Promise<void>;
}

const CategoryContext = createContext<CategoryContextValue | undefined>(undefined);

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchCategoriesWithCount = useCallback(async () => {
    try {
      setLoading(true);

      const categoriesRef = collection(dbLite, "categories");
      const categoriesQuery = query(categoriesRef, orderBy("name"));
      const categoriesSnapshot = await getDocs(categoriesQuery);

      const categoriesData = categoriesSnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name,
          image_url: data.imageUrl,
          description: data.description ?? null,
          created_at: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
          updated_at: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        };
      });

      if (categoriesData.length === 0) {
        setCategories([]);
        return;
      }

      const productsRef = collection(dbLite, "products");
      const productsSnapshot = await getDocs(productsRef);
      const productsData = productsSnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return { id: docSnap.id, categories: Array.isArray(data.categories) ? data.categories : [] };
      });

      const categoriesWithCount = categoriesData.map((category) => {
        const productCount = productsData.filter(
          (product) => product.categories.includes(category.name)
        ).length;
        return { ...category, product_count: productCount };
      });

      setCategories(categoriesWithCount);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasFetched) return;
    setHasFetched(true);
    fetchCategoriesWithCount();
  }, [hasFetched, fetchCategoriesWithCount]);

  return (
    <CategoryContext.Provider value={{ categories, loading, refetch: fetchCategoriesWithCount }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const ctx = useContext(CategoryContext);
  if (!ctx) throw new Error("useCategories must be used within a CategoryProvider");
  return ctx;
}