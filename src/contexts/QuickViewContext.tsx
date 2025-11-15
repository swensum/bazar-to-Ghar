import { createContext, useContext, useState } from "react";

interface QuickViewContextType {
  quickViewProduct: any;
  isQuickViewOpen: boolean;
  isQuickViewLoading: boolean;
  openQuickView: (product: any) => void;
  closeQuickView: () => void;
  setQuickViewLoading: (loading: boolean) => void;
}

const QuickViewContext = createContext<QuickViewContextType | undefined>(undefined);

export const QuickViewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isQuickViewLoading, setIsQuickViewLoading] = useState(false);

  const openQuickView = (product: any) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
    setIsQuickViewLoading(false); // Reset loading when opening
  };

  const closeQuickView = () => {
    setIsQuickViewOpen(false);
    setQuickViewProduct(null);
    setIsQuickViewLoading(false);
  };

  const setQuickViewLoading = (loading: boolean) => {
    setIsQuickViewLoading(loading);
  };

  return (
    <QuickViewContext.Provider value={{
      quickViewProduct,
      isQuickViewOpen,
      isQuickViewLoading,
      openQuickView,
      closeQuickView,
      setQuickViewLoading
    }}>
      {children}
    </QuickViewContext.Provider>
  );
};

export const useQuickView = () => {
  const context = useContext(QuickViewContext);
  if (context === undefined) {
    throw new Error('useQuickView must be used within a QuickViewProvider');
  }
  return context;
};