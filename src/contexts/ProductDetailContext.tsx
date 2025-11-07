import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface ProductDetail {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    category_id: string;
    categories?: string[];
    in_stock: boolean;
    created_at: string;
    discount_percentage: number;
    material: string | null;
    product_types?: string[];
    images?: string[];
    packageOptions?: string[]; // Add this
    specifications?: Record<string, string>;
}

interface ProductDetailContextType {
    // State
    selectedProduct: ProductDetail | null;
    currentImageIndex: number;
    selectedPackage: string | null; // Change from selectedSize to selectedPackage
    quantity: number;
    
    // Actions
    setSelectedProduct: (product: ProductDetail | null) => void;
    setCurrentImageIndex: (index: number) => void;
    setSelectedPackage: (pkg: string | null) => void; // Change from setSelectedSize to setSelectedPackage
    setQuantity: (quantity: number) => void;
    resetProductDetail: () => void;
}

const ProductDetailContext = createContext<ProductDetailContextType | undefined>(undefined);

export const ProductDetailProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null); // Change variable name
    const [quantity, setQuantity] = useState(1);

    const resetProductDetail = () => {
        setSelectedProduct(null);
        setCurrentImageIndex(0);
        setSelectedPackage(null); // Change variable name
        setQuantity(1);
    };

    const value: ProductDetailContextType = {
        // State
        selectedProduct,
        currentImageIndex,
        selectedPackage, // Change variable name
        quantity,
        
        // Actions
        setSelectedProduct,
        setCurrentImageIndex,
        setSelectedPackage, // Change function name
        setQuantity,
        resetProductDetail,
    };

    return (
        <ProductDetailContext.Provider value={value}>
            {children}
        </ProductDetailContext.Provider>
    );
};

export const useProductDetail = () => {
    const context = useContext(ProductDetailContext);
    if (context === undefined) {
        throw new Error('useProductDetail must be used within a ProductDetailProvider');
    }
    return context;
};