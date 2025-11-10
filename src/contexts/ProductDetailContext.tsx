import React, { createContext, useContext, useState, type JSX, type ReactNode } from 'react';
import { supabase } from '../store/supabase';
import { categoryDetails } from '../data/categoryDetails';

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
    packageOptions?: string[];
    specifications?: Record<string, string>;
}

interface Review {
    id: string;
    product_id: string;
    customer_name: string;
    customer_email: string;
    review_title: string;
    rating: number;
    review_text: string;
    created_at: string;
    is_active: boolean;
    topic: string;
}
interface RelatedProduct {
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
    packageOptions?: string[];
    specifications?: Record<string, string>;
    reviewCount: number;
    averageRating: number;
}
interface ProductDetailContextType {
    // State
    selectedProduct: ProductDetail | null;
    currentImageIndex: number;
    selectedPackage: string | null;
    quantity: number;
    reviews: Review[];
    relatedProducts: RelatedProduct[];
    randomProducts: RelatedProduct[];
    isSubmitting: boolean;
    submitSuccess: boolean;
    loadingRelated: boolean;
    loadingRandom: boolean;
    
    // Review Form State
    reviewTitle: string;
    isWritingReview: boolean;
    reviewRating: number;
    reviewText: string;
    reviewerName: string;
    reviewerEmail: string;
    
    // Actions
    setSelectedProduct: (product: ProductDetail | null) => void;
    setCurrentImageIndex: (index: number) => void;
    setSelectedPackage: (pkg: string | null) => void;
    setQuantity: (quantity: number) => void;
    resetProductDetail: () => void;
    
    // Review Actions
    setReviewTitle: (title: string) => void;
    setIsWritingReview: (writing: boolean) => void;
    setReviewRating: (rating: number) => void;
    setReviewText: (text: string) => void;
    setReviewerName: (name: string) => void;
    setReviewerEmail: (email: string) => void;
    setSubmitSuccess: (success: boolean) => void;
    
    // Functions
    fetchProductDetail: (id: string) => Promise<void>;
    fetchReviews: () => Promise<void>;
    fetchRelatedProducts: () => Promise<void>;
    fetchRandomProducts: () => Promise<void>;
    handleSubmitReview: () => Promise<void>;
    handleRelatedProductClick: (product: RelatedProduct) => void;
    processProductData: (product: any) => RelatedProduct;
    getCategoryDetails: () => any;
    renderStars: (rating?: number) => JSX.Element[];
    renderReviewStars: (starNumber: number) => JSX.Element;
}

const ProductDetailContext = createContext<ProductDetailContextType | undefined>(undefined);

export const ProductDetailProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    
    // Review state
    const [reviews, setReviews] = useState<Review[]>([]);
    const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
    const [randomProducts, setRandomProducts] = useState<RelatedProduct[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [loadingRelated, setLoadingRelated] = useState(false);
    const [loadingRandom, setLoadingRandom] = useState(false);
    
    // Review form state
    const [reviewTitle, setReviewTitle] = useState('');
    const [isWritingReview, setIsWritingReview] = useState(false);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [reviewerName, setReviewerName] = useState('');
    const [reviewerEmail, setReviewerEmail] = useState('');

    const resetProductDetail = () => {
        setSelectedProduct(null);
        setCurrentImageIndex(0);
        setSelectedPackage(null);
        setQuantity(1);
        setReviews([]);
        setRelatedProducts([]);
        setRandomProducts([]);
        setReviewTitle('');
        setIsWritingReview(false);
        setReviewRating(0);
        setReviewText('');
        setReviewerName('');
        setReviewerEmail('');
        setSubmitSuccess(false);
    };

    const fetchProductDetail = async (id: string) => {
        try {
            const { data: product, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            if (product) {
                const productWithDetails = processProductData(product);
                setSelectedProduct(productWithDetails);
            }
        } catch (error) {
            console.error('Error fetching product details:', error);
            throw error;
        }
    };

    const fetchReviews = async () => {
        if (!selectedProduct) return;
        
        try {
            const { data: reviewsData, error } = await supabase
                .from('customer_reviews')
                .select('*')
                .eq('product_id', selectedProduct.id)
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            setReviews(reviewsData || []);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setReviews([]);
        }
    };

    const fetchRelatedProducts = async () => {
    if (!selectedProduct?.categories || selectedProduct.categories.length === 0) {
        return;
    }

    try {
        setLoadingRelated(true);
        const { data: allProducts, error } = await supabase
            .from('products')
            .select(`
                *,
                customer_reviews (
                    rating,
                    id
                )
            `)
            .neq('id', selectedProduct.id);

        if (error) throw error;

        const filteredRelated = allProducts?.filter(product =>
            product.categories &&
            Array.isArray(product.categories) &&
            product.categories.some((cat: string) =>
                selectedProduct.categories?.includes(cat)
            )
        ) || [];

        // Process products with review data
        const productsWithReviews = filteredRelated.map(product => ({
            ...processProductData(product),
            reviewCount: product.customer_reviews?.length || 0,
            averageRating: product.customer_reviews?.length 
                ? product.customer_reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / product.customer_reviews.length
                : 0
        }));

        setRelatedProducts(productsWithReviews);
    } catch (error) {
        console.error('Error fetching related products:', error);
        setRelatedProducts([]);
    } finally {
        setLoadingRelated(false);
    }
};

const fetchRandomProducts = async () => {
    if (!selectedProduct) return;
    
    try {
        setLoadingRandom(true);
        const { data: allProducts, error } = await supabase
            .from('products')
            .select(`
                *,
                customer_reviews (
                    rating,
                    id
                )
            `)
            .neq('id', selectedProduct.id);

        if (error) throw error;

        const shuffled = (allProducts || [])
            .sort(() => 0.5 - Math.random())
            .slice(0, 4);

        // Process products with review data
        const productsWithReviews = shuffled.map(product => ({
            ...processProductData(product),
            reviewCount: product.customer_reviews?.length || 0,
            averageRating: product.customer_reviews?.length 
                ? product.customer_reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / product.customer_reviews.length
                : 0
        }));

        setRandomProducts(productsWithReviews);
    } catch (error) {
        console.error('Error fetching random products:', error);
        setRandomProducts([]);
    } finally {
        setLoadingRandom(false);
    }
};

    const handleSubmitReview = async () => {
        if (!selectedProduct || !reviewRating || !reviewTitle || !reviewText || !reviewerName || !reviewerEmail) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            setIsSubmitting(true);
            
            const { error } = await supabase
                .from('customer_reviews')
                .insert([
                    {
                        product_id: selectedProduct.id,
                        customer_name: reviewerName,
                        customer_email: reviewerEmail,
                        review_title: reviewTitle,
                        rating: reviewRating,
                        review_text: reviewText,
                        topic: 'Product Review' 
                    }
                ]);

            if (error) throw error;

            // Reset form and show success message
            setReviewRating(0);
            setReviewTitle('');
            setReviewText('');
            setReviewerName('');
            setReviewerEmail('');
            setSubmitSuccess(true);
            
            // Refresh reviews list
            await fetchReviews();
            
            // Hide success message after 3 seconds
            setTimeout(() => {
                setSubmitSuccess(false);
                setIsWritingReview(false);
            }, 3000);

        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Error submitting review. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRelatedProductClick = (product: RelatedProduct) => {
        const processedProduct: RelatedProduct = {
            ...product,
            packageOptions: product.packageOptions || ['250g', '500g', '1kg'],
            images: product.images || [product.image_url]
        };
        setSelectedProduct(processedProduct);
        setCurrentImageIndex(0);
        setSelectedPackage(null);
        setQuantity(1);
    };

    const getCategoryDetails = () => {
        if (!selectedProduct?.categories || selectedProduct.categories.length === 0) {
            return categoryDetails['fruits'];
        }

        const productCategory = selectedProduct.categories.find(cat =>
            Object.keys(categoryDetails).includes(cat.toLowerCase())
        );

        return categoryDetails[productCategory?.toLowerCase() || 'fruits'];
    };

    const processProductData = (product: any): RelatedProduct => {
        let packageOptions = [];

        if (product.categories?.includes('Fruits') || product.categories?.includes('Vegetables')) {
            packageOptions = ['1 piece', '250g', '500g', '1kg'];
        } else if (product.categories?.includes('Beverages')) {
            packageOptions = ['250ml', '500ml', '1L', '2L'];
        } else if (product.categories?.includes('Dairy')) {
            packageOptions = ['250ml', '500ml', '1L', '2L', '250g', '500g'];
        } else {
            packageOptions = ['250g', '500g', '1kg'];
        }

        return {
            ...product,
            images: product.images || [product.image_url],
            packageOptions: packageOptions,
            specifications: getCategoryDetails().specifications
        };
    };

    // Star rendering functions
    const renderStars = (rating: number = 4.5): JSX.Element[] => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        const size = 16;
        const strokeWidth = 2.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <svg
                    key={`full-${i}`}
                    width={size}
                    height={size}
                    viewBox="0 0 24 24"
                    fill="#F5BE05"
                    stroke="#F5BE05"
                    strokeWidth={strokeWidth}
                >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            );
        }

        if (hasHalfStar) {
            stars.push(
                <svg
                    key="half"
                    width={size}
                    height={size}
                    viewBox="0 0 24 24"
                    fill="url(#half)"
                    stroke="#F5BE05"
                    strokeWidth={strokeWidth}
                >
                    <defs>
                        <linearGradient id="half">
                            <stop offset="50%" stopColor="#F5BE05" />
                            <stop offset="50%" stopColor="transparent" />
                        </linearGradient>
                    </defs>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            );
        }

        const emptyStars = 5 - stars.length;
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <svg
                    key={`empty-${i}`}
                    width={size}
                    height={size}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#F5BE05"
                    strokeWidth={strokeWidth}
                >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            );
        }

        return stars;
    };

    const renderReviewStars = (starNumber: number): JSX.Element => {
        const size = 20;
        const strokeWidth = 2.5;

        if (starNumber <= reviewRating) {
            return (
                <svg
                    width={size}
                    height={size}
                    viewBox="0 0 24 24"
                    fill="#F5BE05"
                    stroke="#F5BE05"
                    strokeWidth={strokeWidth}
                >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            );
        } else {
            return (
                <svg
                    width={size}
                    height={size}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#F5BE05"
                    strokeWidth={strokeWidth}
                >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            );
        }
    };

    const value: ProductDetailContextType = {
        // State
        selectedProduct,
        currentImageIndex,
        selectedPackage,
        quantity,
        reviews,
        relatedProducts,
        randomProducts,
        isSubmitting,
        submitSuccess,
        loadingRelated,
        loadingRandom,
        
        // Review Form State
        reviewTitle,
        isWritingReview,
        reviewRating,
        reviewText,
        reviewerName,
        reviewerEmail,
        
        // Actions
        setSelectedProduct,
        setCurrentImageIndex,
        setSelectedPackage,
        setQuantity,
        resetProductDetail,
        
        // Review Actions
        setReviewTitle,
        setIsWritingReview,
        setReviewRating,
        setReviewText,
        setReviewerName,
        setReviewerEmail,
        setSubmitSuccess,
        
        // Functions
        fetchProductDetail,
        fetchReviews,
        fetchRelatedProducts,
        fetchRandomProducts,
        handleSubmitReview,
        handleRelatedProductClick,
        processProductData,
        getCategoryDetails,
        renderStars,
        renderReviewStars,
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