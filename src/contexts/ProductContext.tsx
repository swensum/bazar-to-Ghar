// contexts/ProductContext.tsx
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../store/supabase';

interface Category {
    id: string;
    name: string;
    image_url: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    product_count: number;
}

interface Product {
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
}

interface ProductContextType {
    // State
    categories: Category[];
    selectedCategory: Category | null;
    products: Product[];
    filteredProducts: Product[];
    loading: boolean;
    viewMode: 'grid' | 'list';
    sortBy: string;
    currentPage: number;
    maxPrice: number;
    sliderValues: { min: number; max: number };
    appliedPriceRange: { min: number; max: number };
    selectedMaterials: string[];
    availableMaterials: string[];
    selectedProductTypes: string[];
    availableProductTypes: string[];
    selectedAvailability: string[];
    
    // Actions
    setSelectedCategory: (category: Category) => void;
    setViewMode: (mode: 'grid' | 'list') => void;
    setSortBy: (sort: string) => void;
    setCurrentPage: (page: number) => void;
    setSliderValues: (values: { min: number; max: number }) => void;
    setSelectedMaterials: (materials: string[]) => void;
    setSelectedProductTypes: (types: string[]) => void;
    setSelectedAvailability: (availability: string[]) => void;
    applyPriceFilter: () => void;
    resetPriceFilter: () => void;
    applyMaterialFilter: () => void;
    resetMaterialFilter: () => void;
    applyProductTypeFilter: () => void;
    resetProductTypeFilter: () => void;
    applyAvailabilityFilter: () => void;
    resetAvailabilityFilter: () => void;
    applyAllFilters: () => void;
    applySorting: () => void;
    
    // Data fetching
    fetchCategories: () => Promise<void>;
    fetchProductsByCategory: (category: Category) => Promise<void>;
    
    // Utilities
    initializeFromNavigation: (category: Category | null) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Add localStorage utilities
const STORAGE_KEY = 'selected-category';

const saveCategoryToStorage = (category: Category | null) => {
  if (category) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(category));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
};

const loadCategoryFromStorage = (): Category | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(() => {
        // Load from localStorage on initial render
        return loadCategoryFromStorage();
    });
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState('default');
    const [currentPage, setCurrentPage] = useState(1);
    const [maxPrice, setMaxPrice] = useState(100);
    const [sliderValues, setSliderValues] = useState({ min: 0, max: 100 });
    const [appliedPriceRange, setAppliedPriceRange] = useState({ min: 0, max: 100 });
    const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
    const [availableMaterials, setAvailableMaterials] = useState<string[]>([]);
    const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);
    const [availableProductTypes, setAvailableProductTypes] = useState<string[]>([]);
    const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);

    // Persistent setter for selected category
    const setSelectedCategoryPersistent = (category: Category) => {
        setSelectedCategory(category);
        saveCategoryToStorage(category);
    };

    // Calculate max price from products - fixed value
    const calculateMaxPrice = (products: Product[]) => {
        if (products.length === 0) return 100;
        const highestPrice = Math.ceil(Math.max(...products.map(p => p.price)));
        return Math.ceil(highestPrice / 10) * 10;
    };

    // Extract available materials from products
    const extractMaterialsFromProducts = (products: Product[]) => {
        const materials = new Set<string>();
        products.forEach(product => {
            if (product.material && product.material.trim() !== '') {
                materials.add(product.material);
            }
        });
        return Array.from(materials).sort();
    };

    // Extract available product types from products
    const extractProductTypesFromProducts = (products: Product[]) => {
        const productTypes = new Set<string>();
        products.forEach(product => {
            if (product.product_types && Array.isArray(product.product_types)) {
                product.product_types.forEach(type => {
                    if (type && type.trim() !== '') {
                        productTypes.add(type);
                    }
                });
            }
        });
        
        if (productTypes.size === 0) {
            return ['Best Seller', 'New Product', 'Special Product'];
        }
        
        return Array.from(productTypes).sort();
    };

    // Apply sorting to filtered products
    const applySorting = (productsToSort: Product[]) => {
        let sortedProducts = [...productsToSort];
        
        switch (sortBy) {
            case 'price-low':
                sortedProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                sortedProducts.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'newest':
                sortedProducts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                break;
            case 'default':
            default:
                // Keep original order or apply any default sorting
                break;
        }
        
        return sortedProducts;
    };

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const { data: categoriesData, error: categoriesError } = await supabase
                .from('categories')
                .select('*')
                .order('name');

            if (categoriesError) throw categoriesError;

            const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select('id, categories');

            if (productsError) throw productsError;

            const categoriesWithCount = categoriesData.map((category) => {
                const productCount = productsData.filter((product) => {
                    return product.categories &&
                        Array.isArray(product.categories) &&
                        product.categories.includes(category.name);
                }).length;

                return {
                    ...category,
                    product_count: productCount
                };
            });

            // Add "All Products" category at the beginning
            const allProductsCount = productsData?.length || 0;
            const allProductsCategory: Category = {
                id: 'all-products',
                name: 'All Products',
                image_url: '',
                description: 'Browse all available products',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                product_count: allProductsCount
            };

            setCategories([allProductsCategory, ...categoriesWithCount]);

        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProductsByCategory = async (category: Category) => {
        try {
            setLoading(true);
            
            let productsList: Product[] = [];
            
            if (category.id === 'all-products') {
                // Fetch all products for "All Products" category
                const { data: allProducts, error } = await supabase
                    .from('products')
                    .select('*');
                
                if (error) {
                    console.error('Supabase error:', error);
                    throw error;
                }
                productsList = allProducts || [];
            } else {
                // Fetch products for specific category
                const { data: productsData, error } = await supabase
                    .from('products')
                    .select('*')
                    .contains('categories', `["${category.name}"]`);

                if (error) {
                    console.error('Supabase error:', error);
                    throw error;
                }
                productsList = productsData || [];
            }
            
            setProducts(productsList);
            
            const calculatedMaxPrice = calculateMaxPrice(productsList);
            setMaxPrice(calculatedMaxPrice);
            
            const materials = extractMaterialsFromProducts(productsList);
            setAvailableMaterials(materials);
            
            const productTypes = extractProductTypesFromProducts(productsList);
            setAvailableProductTypes(productTypes);
            
            // Reset all filters when category changes
            setSliderValues({ min: 0, max: calculatedMaxPrice });
            setAppliedPriceRange({ min: 0, max: calculatedMaxPrice });
            setSelectedMaterials([]);
            setSelectedProductTypes([]);
            setSelectedAvailability([]);
            
            // Apply initial sorting
            const sortedProducts = applySorting(productsList);
            setFilteredProducts(sortedProducts);
            setCurrentPage(1);
        } catch (error) {
            console.error('Error fetching products:', error);
            
            try {
                // Fallback: try to fetch all products and filter manually
                const { data: allProducts, error: allError } = await supabase
                    .from('products')
                    .select('*');
                
                if (allError) throw allError;
                
                let filtered: Product[] = [];
                
                if (category.id === 'all-products') {
                    filtered = allProducts || [];
                } else {
                    filtered = allProducts?.filter(product => {
                        if (!product.categories || !Array.isArray(product.categories)) return false;
                        return product.categories.includes(category.name);
                    }) || [];
                }
                
                setProducts(filtered);
                
                const materials = extractMaterialsFromProducts(filtered);
                setAvailableMaterials(materials);
                
                const productTypes = extractProductTypesFromProducts(filtered);
                setAvailableProductTypes(productTypes);
                
                const calculatedMaxPrice = calculateMaxPrice(filtered);
                setMaxPrice(calculatedMaxPrice);
                setSliderValues({ min: 0, max: calculatedMaxPrice });
                setAppliedPriceRange({ min: 0, max: calculatedMaxPrice });
                setSelectedMaterials([]);
                setSelectedProductTypes([]);
                setSelectedAvailability([]);
                
                const sortedProducts = applySorting(filtered);
                setFilteredProducts(sortedProducts);
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
                setProducts([]);
                setFilteredProducts([]);
                setAvailableMaterials([]);
                setAvailableProductTypes(['Best Seller', 'New Product', 'Special Product']);
                setMaxPrice(100);
                setSliderValues({ min: 0, max: 100 });
                setAppliedPriceRange({ min: 0, max: 100 });
                setSelectedMaterials([]);
                setSelectedProductTypes([]);
                setSelectedAvailability([]);
            }
        } finally {
            setLoading(false);
        }
    };

    // Apply all filters (price + materials + product types + availability) and sorting
    const applyAllFilters = () => {
        let filtered = products;
        
        // Apply price filter
        filtered = filtered.filter(product => 
            product.price >= sliderValues.min && product.price <= sliderValues.max
        );
        
        // Apply material filter if any materials are selected
        if (selectedMaterials.length > 0) {
            filtered = filtered.filter(product => 
                product.material && selectedMaterials.includes(product.material)
            );
        }
        
        // Apply product type filter if any types are selected
        if (selectedProductTypes.length > 0) {
            filtered = filtered.filter(product => 
                product.product_types && 
                product.product_types.some(type => selectedProductTypes.includes(type))
            );
        }
        
        // Apply availability filter if any availability options are selected
        if (selectedAvailability.length > 0) {
            filtered = filtered.filter(product => {
                if (selectedAvailability.includes('In Stock') && selectedAvailability.includes('Out of Stock')) {
                    return true; // Show all products
                } else if (selectedAvailability.includes('In Stock')) {
                    return product.in_stock === true;
                } else if (selectedAvailability.includes('Out of Stock')) {
                    return product.in_stock === false;
                }
                return true;
            });
        }
        
        // Apply sorting to the filtered results
        const sortedAndFiltered = applySorting(filtered);
        
        setFilteredProducts(sortedAndFiltered);
        setCurrentPage(1);
        setAppliedPriceRange(sliderValues);
    };

    // Apply sorting only
    const applySortingToFiltered = () => {
        const sortedProducts = applySorting(filteredProducts);
        setFilteredProducts(sortedProducts);
    };

    // Apply price filter only
    const applyPriceFilter = () => {
        applyAllFilters();
    };

    // Apply material filter only
    const applyMaterialFilter = () => {
        applyAllFilters();
    };

    // Apply product type filter only
    const applyProductTypeFilter = () => {
        applyAllFilters();
    };

    // Apply availability filter only
    const applyAvailabilityFilter = () => {
        applyAllFilters();
    };

    // Reset price filter
    const resetPriceFilter = () => {
        setSliderValues({ min: 0, max: maxPrice });
        setAppliedPriceRange({ min: 0, max: maxPrice });
        applyAllFilters();
    };

    // Reset material filter
    const resetMaterialFilter = () => {
        setSelectedMaterials([]);
        applyAllFilters();
    };

    // Reset product type filter
    const resetProductTypeFilter = () => {
        setSelectedProductTypes([]);
        applyAllFilters();
    };

    // Reset availability filter
    const resetAvailabilityFilter = () => {
        setSelectedAvailability([]);
        applyAllFilters();
    };

    // Auto-fetch products when selectedCategory changes
    useEffect(() => {
        if (selectedCategory) {
            fetchProductsByCategory(selectedCategory);
        }
    }, [selectedCategory]);

    // Apply filters and sorting when dependencies change
    useEffect(() => {
        applyAllFilters();
    }, [products, sliderValues, selectedMaterials, selectedProductTypes, selectedAvailability, sortBy]);

    // Handle automatic category selection when categories are loaded
    useEffect(() => {
        if (categories.length > 0 && !selectedCategory) {
            const allProductsCategory = categories.find(cat => cat.id === 'all-products');
            if (allProductsCategory) {
                setSelectedCategoryPersistent(allProductsCategory);
            }
        }
    }, [categories, selectedCategory]);

    const initializeFromNavigation = (categoryData: any) => {
    console.log('🔄 ProductContext: initializeFromNavigation received:', categoryData);
    
    // First, check if we have a stored category that should take precedence
    const storedCategory = loadCategoryFromStorage();
    console.log('💾 ProductContext: Stored category from localStorage:', storedCategory);
    console.log('📋 ProductContext: Available categories:', categories.map(c => ({id: c.id, name: c.name})));
    
    if (!categoryData && storedCategory) {
        // If no new category data but we have stored category, use it
        console.log('✅ ProductContext: Using stored category:', storedCategory);
        setSelectedCategoryPersistent(storedCategory);
        return;
    }

    if (!categoryData) {
        // No category data provided - default to "All Products"
        console.log('ℹ️ ProductContext: No category data, defaulting to All Products');
        if (categories.length > 0 && !selectedCategory) {
            const allProductsCategory = categories.find(cat => cat.id === 'all-products');
            if (allProductsCategory) {
                setSelectedCategoryPersistent(allProductsCategory);
            } else {
                setSelectedCategoryPersistent(categories[0]);
            }
        }
        return;
    }

    // Scenario 1: Category data is a full Category object (from CategoryPage)
    if (typeof categoryData === 'object' && categoryData.id && categoryData.name) {
        console.log('✅ ProductContext: Processing full category object');
        setSelectedCategoryPersistent(categoryData);
        return;
    }

    // Scenario 2: Category data is a string (could be ID or name from Homepage)
    if (typeof categoryData === 'string') {
        console.log('🔍 ProductContext: Processing category string:', categoryData);
        
        // First try to find by ID (for 'all-products' and other IDs)
        let foundCategory = categories.find(cat => cat.id === categoryData);
        
        // If not found by ID, try to find by name (case insensitive)
        if (!foundCategory) {
            foundCategory = categories.find(cat => 
                cat.name.toLowerCase() === categoryData.toLowerCase()
            );
            console.log('🔍 ProductContext: Category found by name:', foundCategory);
        }
        
        if (foundCategory) {
            console.log('✅ ProductContext: Found category:', foundCategory);
            setSelectedCategoryPersistent(foundCategory);
        } else {
            // Fallback to "All Products" if category not found
            console.log('❌ ProductContext: Category not found, falling back to All Products');
            const allProductsCategory = categories.find(cat => cat.id === 'all-products');
            if (allProductsCategory) {
                setSelectedCategoryPersistent(allProductsCategory);
            }
        }
        return;
    }

    // Scenario 3: Category data is in navigation state format { selectedCategory: ... }
    if (typeof categoryData === 'object' && categoryData.selectedCategory) {
        console.log('📦 ProductContext: Processing navigation state object');
        const navCategory = categoryData.selectedCategory;
        
        // If it's a full category object
        if (typeof navCategory === 'object' && navCategory.id && navCategory.name) {
            setSelectedCategoryPersistent(navCategory);
            return;
        }
        
        // If it's a category string (ID or name)
        if (typeof navCategory === 'string') {
            console.log('🔍 ProductContext: Processing nav category string:', navCategory);
            
            // First try to find by ID
            let foundCategory = categories.find(cat => cat.id === navCategory);
            
            // If not found by ID, try to find by name (case insensitive)
            if (!foundCategory) {
                foundCategory = categories.find(cat => 
                    cat.name.toLowerCase() === navCategory.toLowerCase()
                );
                console.log('🔍 ProductContext: Nav category found by name:', foundCategory);
            }
            
            if (foundCategory) {
                console.log('✅ ProductContext: Found nav category:', foundCategory);
                setSelectedCategoryPersistent(foundCategory);
                return;
            }
        }
    }

    // If we get here and no category is selected, default to "All Products"
    console.log('ℹ️ ProductContext: No valid category found, defaulting to All Products');
    if (categories.length > 0 && !selectedCategory) {
        const allProductsCategory = categories.find(cat => cat.id === 'all-products');
        if (allProductsCategory) {
            setSelectedCategoryPersistent(allProductsCategory);
        }
    }
};

    const value: ProductContextType = {
        // State
        categories,
        selectedCategory,
        products,
        filteredProducts,
        loading,
        viewMode,
        sortBy,
        currentPage,
        maxPrice,
        sliderValues,
        appliedPriceRange,
        selectedMaterials,
        availableMaterials,
        selectedProductTypes,
        availableProductTypes,
        selectedAvailability,
        
        // Actions - use the persistent setter
        setSelectedCategory: setSelectedCategoryPersistent,
        setViewMode,
        setSortBy,
        setCurrentPage,
        setSliderValues,
        setSelectedMaterials,
        setSelectedProductTypes,
        setSelectedAvailability,
        applyPriceFilter,
        resetPriceFilter,
        applyMaterialFilter,
        resetMaterialFilter,
        applyProductTypeFilter,
        resetProductTypeFilter,
        applyAvailabilityFilter,
        resetAvailabilityFilter,
        applyAllFilters,
        applySorting: applySortingToFiltered,
        
        // Data fetching
        fetchCategories,
        fetchProductsByCategory,
        
        // Utilities
        initializeFromNavigation,
    };

    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProduct = () => {
    const context = useContext(ProductContext);
    if (context === undefined) {
        throw new Error('useProduct must be used within a ProductProvider');
    }
    return context;
};