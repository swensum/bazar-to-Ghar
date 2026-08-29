import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface FavoriteContextValue {
  favoriteIds: string[];
  isFavorited: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;
  favoritesCount: number;
}

const FavoriteContext = createContext<FavoriteContextValue | undefined>(undefined);
const STORAGE_KEY = "favorites"; // same key your old ProductItemDetailPage logic used

function loadFavorites(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function FavoriteProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => loadFavorites());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteIds));
    } catch (error) {
      console.error("Error saving favorites:", error);
    }
  }, [favoriteIds]);

  const isFavorited = useCallback(
    (productId: string) => favoriteIds.includes(productId),
    [favoriteIds]
  );

  const toggleFavorite = useCallback((productId: string) => {
    setFavoriteIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  }, []);

  return (
    <FavoriteContext.Provider
      value={{ favoriteIds, isFavorited, toggleFavorite, favoritesCount: favoriteIds.length }}
    >
      {children}
    </FavoriteContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoriteContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoriteProvider");
  }
  return context;
}