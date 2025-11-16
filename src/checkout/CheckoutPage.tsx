// checkout/CheckoutPage.tsx
import { type JSX, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./CheckoutPage.module.scss";
import appLogo from "../assets/logo.png";

export default function CheckoutPage(): JSX.Element {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Form state
    const [email, setEmail] = useState("");
    const [newsletterOptIn, setNewsletterOptIn] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [area, setArea] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("esewa");
    const [esewaId, setEsewaId] = useState("");
    const [esewaPassword, setEsewaPassword] = useState("");
    const [khaltiNumber, setKhaltiNumber] = useState("");
    const [khaltiMpin, setKhaltiMpin] = useState("");
    
    // Discount state
    const [discountCode, setDiscountCode] = useState("");
    const [isDiscountApplied, setIsDiscountApplied] = useState(false);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [couponMessage, setCouponMessage] = useState("");
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
    
    // Validation state
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Get the product from location state
    const product = location.state?.product;
    const quantity = location.state?.quantity || 1;
    const selectedPackage = location.state?.selectedPackage;

    // Set first payment option as default when page loads or reloads
    useEffect(() => {
        setPaymentMethod("esewa");
    }, []);

    // Validation rules
    const validateField = (name: string, value: string): string => {
        switch (name) {
            case 'email':
                if (!value.trim()) return "Email is required";
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email address";
                return "";
            
            case 'firstName':
                if (!value.trim()) return "First name is required";
                if (value.trim().length < 2) return "First name must be at least 2 characters";
                if (!/^[a-zA-Z\s]*$/.test(value)) return "First name can only contain letters and spaces";
                return "";
            
            case 'lastName':
                if (!value.trim()) return "Last name is required";
                if (value.trim().length < 2) return "Last name must be at least 2 characters";
                if (!/^[a-zA-Z\s]*$/.test(value)) return "Last name can only contain letters and spaces";
                return "";
            
            case 'address':
                if (!value.trim()) return "Address is required";
                if (value.trim().length < 10) return "Please enter a complete address (at least 10 characters)";
                return "";
            
            case 'city':
                if (!value.trim()) return "Please select a city";
                return "";
            
            case 'esewaId':
                if (paymentMethod === 'esewa' && !value.trim()) return "eSewa ID is required";
                if (paymentMethod === 'esewa' && value.trim().length < 5) return "Please enter a valid eSewa ID";
                return "";
            
            case 'esewaPassword':
                if (paymentMethod === 'esewa' && !value.trim()) return "eSewa password is required";
                return "";
            
            case 'khaltiNumber':
                if (paymentMethod === 'khalti' && !value.trim()) return "Khalti number is required";
                if (paymentMethod === 'khalti' && !/^98[0-9]{8}$/.test(value.replace(/\s/g, ''))) return "Please enter a valid Khalti number (98XXXXXXXX)";
                return "";
            
            case 'khaltiMpin':
                if (paymentMethod === 'khalti' && !value.trim()) return "Khalti MPIN is required";
                if (paymentMethod === 'khalti' && value.length !== 4) return "MPIN must be 4 digits";
                return "";
            
            default:
                return "";
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        
        // Contact fields
        newErrors.email = validateField('email', email);
        newErrors.firstName = validateField('firstName', firstName);
        newErrors.lastName = validateField('lastName', lastName);
        newErrors.address = validateField('address', address);
        newErrors.city = validateField('city', city);
        
        // Payment method specific fields
        if (paymentMethod === 'esewa') {
            newErrors.esewaId = validateField('esewaId', esewaId);
            newErrors.esewaPassword = validateField('esewaPassword', esewaPassword);
        } else if (paymentMethod === 'khalti') {
            newErrors.khaltiNumber = validateField('khaltiNumber', khaltiNumber);
            newErrors.khaltiMpin = validateField('khaltiMpin', khaltiMpin);
        }
        
        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error !== "");
    };

    const handleFieldBlur = (fieldName: string) => {
        setTouched(prev => ({ ...prev, [fieldName]: true }));
        
        const error = validateField(fieldName, 
            fieldName === 'email' ? email :
            fieldName === 'firstName' ? firstName :
            fieldName === 'lastName' ? lastName :
            fieldName === 'address' ? address :
            fieldName === 'city' ? city :
            fieldName === 'esewaId' ? esewaId :
            fieldName === 'esewaPassword' ? esewaPassword :
            fieldName === 'khaltiNumber' ? khaltiNumber :
            fieldName === 'khaltiMpin' ? khaltiMpin : ''
        );
        
        if (error) {
            setErrors(prev => ({ ...prev, [fieldName]: error }));
        } else {
            setErrors(prev => ({ ...prev, [fieldName]: "" }));
        }
    };

    const handleSignIn = () => {
        console.log("Sign in clicked");
    };

    const handlePayNow = () => {
        // Mark all fields as touched
        const allTouched = {
            email: true, firstName: true, lastName: true, 
            address: true, city: true, esewaId: true, 
            esewaPassword: true, khaltiNumber: true, khaltiMpin: true
        };
        setTouched(allTouched);
        
        if (validateForm()) {
            console.log("Form submitted successfully!");
            // Handle payment logic here
        } else {
            console.log("Form has errors, please fix them");
            // Scroll to first error
            const firstErrorField = Object.keys(errors).find(key => errors[key]);
            if (firstErrorField) {
                const element = document.getElementById(firstErrorField);
                element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    };

    const handleApplyDiscount = async () => {
        if (!discountCode.trim()) return;
        
        setIsValidatingCoupon(true);
        setCouponMessage("");

        try {
            const { validateCoupon } = await import("../utils/couponValidation");
            const result = await validateCoupon(discountCode, email);
            
            if (result.valid) {
                setIsDiscountApplied(true);
                setCouponMessage(result.message);
                
                if (result.discountType === "percentage") {
                    const discountValue = (totalPrice * result.discount) / 100;
                    setDiscountAmount(discountValue);
                } else {
                    setDiscountAmount(result.discount || 0);
                }
            } else {
                setIsDiscountApplied(false);
                setDiscountAmount(0);
                setCouponMessage(result.message);
            }
        } catch (error) {
            console.error("Error applying coupon:", error);
            setCouponMessage("Error applying coupon. Please try again.");
            setIsDiscountApplied(false);
            setDiscountAmount(0);
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    const handlePaymentMethodChange = (method: string) => {
        setPaymentMethod(method);
        // Clear payment method errors when switching
        setErrors(prev => ({
            ...prev,
            esewaId: "", esewaPassword: "", khaltiNumber: "", khaltiMpin: ""
        }));
    };

    const hasValue = (value: string) => {
        return value.length > 0;
    };

    const getFieldError = (fieldName: string): string => {
        return touched[fieldName] ? errors[fieldName] || "" : "";
    };

    if (!product) {
        return (
            <div className={styles.checkoutPage}>
                <div className={styles.errorMessage}>
                    <p>No product found. Please go back and try again.</p>
                    <button onClick={() => navigate('/')}>Return to Home</button>
                </div>
            </div>
        );
    }

    // Calculate prices
    const discountedPrice = product.discount_percentage > 0
        ? product.price * (1 - product.discount_percentage / 100)
        : product.price;

    const totalPrice = discountedPrice * quantity;
    const subtotal = totalPrice;
    const shippingCharge: number = 5;
    const discount = discountAmount;
    const grandTotal = subtotal + shippingCharge - discount;

    // Determine button text based on payment method
    const payButtonText = paymentMethod === 'cod' ? 'Proceed' : 'Pay Now';

    return (
        <div className={styles.checkoutPage}>
            <header className={styles.checkoutHeader}>
                <div className={styles.logoContainer}>
                    <div className={styles.logo} onClick={() => navigate('/')}>
                        <img src={appLogo} alt="Website Logo" className={styles.logoImage} />
                    </div>
                </div>
            </header>

            <div className={styles.horizontalBar}></div>

            <div className={styles.checkoutContainer}>
                <div className={styles.checkoutContent}>
                    {/* Left Section - Contact Information */}
                    <div className={styles.leftSection}>
                        <div className={styles.contactSection}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>Contact</h2>
                                <button className={styles.signInButton} onClick={handleSignIn}>
                                    Sign in
                                </button>
                            </div>

                            {/* Email Field */}
                            <div className={styles.fieldWrapper}>
                                <div className={`${styles.inputContainer} ${hasValue(email) ? styles.hasValue : ''} ${getFieldError('email') ? styles.inputError : ''}`}>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onBlur={() => handleFieldBlur('email')}
                                        className={styles.shopifyInput}
                                    />
                                    <label htmlFor="email" className={styles.shopifyLabel}>
                                        <span className={styles.labelText}>Email or mobile phone number</span>
                                    </label>
                                </div>
                                {getFieldError('email') && <div className={styles.errorText}>{getFieldError('email')}</div>}
                            </div>

                            {/* Newsletter Checkbox */}
                            <div className={styles.newsletterSection}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={newsletterOptIn}
                                        onChange={(e) => setNewsletterOptIn(e.target.checked)}
                                        className={styles.checkboxInput}
                                    />
                                    <span className={styles.checkboxText}>Email me with news and offers</span>
                                </label>
                            </div>

                            {/* Delivery Section */}
                            <div className={styles.deliverySection}>
                                <h2 className={styles.deliveryTitle}>Delivery</h2>

                                {/* Name Fields */}
                                <div className={styles.nameFields}>
                                    <div className={styles.fieldWrapper}>
                                        <div className={`${styles.inputContainer} ${hasValue(firstName) ? styles.hasValue : ''} ${getFieldError('firstName') ? styles.inputError : ''}`}>
                                            <input
                                                id="firstName"
                                                type="text"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                onBlur={() => handleFieldBlur('firstName')}
                                                className={styles.shopifyInput}
                                            />
                                            <label htmlFor="firstName" className={styles.shopifyLabel}>
                                                <span className={styles.labelText}>First name</span>
                                            </label>
                                        </div>
                                        {getFieldError('firstName') && <div className={styles.errorText}>{getFieldError('firstName')}</div>}
                                    </div>
                                    
                                    <div className={styles.fieldWrapper}>
                                        <div className={`${styles.inputContainer} ${hasValue(lastName) ? styles.hasValue : ''} ${getFieldError('lastName') ? styles.inputError : ''}`}>
                                            <input
                                                id="lastName"
                                                type="text"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                onBlur={() => handleFieldBlur('lastName')}
                                                className={styles.shopifyInput}
                                            />
                                            <label htmlFor="lastName" className={styles.shopifyLabel}>
                                                <span className={styles.labelText}>Last name</span>
                                            </label>
                                        </div>
                                        {getFieldError('lastName') && <div className={styles.errorText}>{getFieldError('lastName')}</div>}
                                    </div>
                                </div>

                                {/* Address Field */}
                                <div className={styles.fieldWrapper}>
                                    <div className={`${styles.inputContainer} ${hasValue(address) ? styles.hasValue : ''} ${getFieldError('address') ? styles.inputError : ''}`}>
                                        <input
                                            id="address"
                                            type="text"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            onBlur={() => handleFieldBlur('address')}
                                            className={styles.shopifyInput}
                                        />
                                        <label htmlFor="address" className={styles.shopifyLabel}>
                                            <span className={styles.labelText}>Address (Street, Tole, Area)</span>
                                        </label>
                                    </div>
                                    {getFieldError('address') && <div className={styles.errorText}>{getFieldError('address')}</div>}
                                </div>

                                {/* City Selection */}
                                <div className={styles.fieldWrapper}>
                                    <div className={`${styles.inputContainer} ${hasValue(city) ? styles.hasValue : ''} ${getFieldError('city') ? styles.inputError : ''}`}>
                                        <select
                                            id="city"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            onBlur={() => handleFieldBlur('city')}
                                            className={styles.shopifySelect}
                                        >
                                            <option value=""></option>
                                            <option value="bhairahawa">Bhairahawa</option>
                                            <option value="butwal">Butwal</option>
                                        </select>
                                        <label htmlFor="city" className={styles.shopifyLabel}>
                                            <span className={styles.labelText}>Select City</span>
                                        </label>
                                    </div>
                                    {getFieldError('city') && <div className={styles.errorText}>{getFieldError('city')}</div>}
                                </div>

                                {/* Area/Landmark Field */}
                                <div className={styles.fieldWrapper}>
                                    <div className={`${styles.inputContainer} ${hasValue(area) ? styles.hasValue : ''}`}>
                                        <input
                                            id="area"
                                            type="text"
                                            value={area}
                                            onChange={(e) => setArea(e.target.value)}
                                            className={styles.shopifyInput}
                                        />
                                        <label htmlFor="area" className={styles.shopifyLabel}>
                                            <span className={styles.labelText}>Area / Landmark (Optional)</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Delivery Note */}
                                <div className={styles.deliveryNote}>
                                    <p>🚚 We deliver to Bhairahawa and Butwal only</p>
                                    <p>⏰ Delivery within 24 hours</p>
                                </div>
                            </div>

                            {/* Payment Section */}
                            <div className={styles.paymentSection}>
                                <h2 className={styles.paymentTitle}>Payment</h2>

                                <div className={styles.paymentContainer}>
                                    {/* Payment Method Options */}
                                    <div className={styles.paymentOptionsSection}>
                                        <div className={styles.paymentOptionsText}>
                                            <div className={styles.paymentOptionText}>
                                                <span className={`${styles.paymentText} ${paymentMethod === 'esewa' ? styles.active : ''}`} onClick={() => handlePaymentMethodChange('esewa')}>
                                                    eSewa
                                                </span>
                                            </div>
                                            <div className={styles.paymentOptionText}>
                                                <span className={`${styles.paymentText} ${paymentMethod === 'khalti' ? styles.active : ''}`} onClick={() => handlePaymentMethodChange('khalti')}>
                                                    Khalti
                                                </span>
                                            </div>
                                            <div className={styles.paymentOptionText}>
                                                <span className={`${styles.paymentText} ${paymentMethod === 'cod' ? styles.active : ''}`} onClick={() => handlePaymentMethodChange('cod')}>
                                                    COD
                                                </span>
                                            </div>
                                        </div>
                                        <div className={styles.paymentHorizontalBar}></div>
                                    </div>

                                    {/* eSewa Fields */}
                                    {paymentMethod === 'esewa' && (
                                        <div className={styles.paymentLogin}>
                                            <div className={styles.fieldWrapper}>
                                                <div className={`${styles.inputContainer} ${hasValue(esewaId) ? styles.hasValue : ''} ${getFieldError('esewaId') ? styles.inputError : ''}`}>
                                                    <input
                                                        type="text"
                                                        value={esewaId}
                                                        onChange={(e) => setEsewaId(e.target.value)}
                                                        onBlur={() => handleFieldBlur('esewaId')}
                                                        className={styles.shopifyInput}
                                                    />
                                                    <label className={styles.shopifyLabel}>
                                                        <span className={styles.labelText}>eSewa ID or Mobile Number</span>
                                                    </label>
                                                </div>
                                                {getFieldError('esewaId') && <div className={styles.errorText}>{getFieldError('esewaId')}</div>}
                                            </div>
                                            <div className={styles.fieldWrapper}>
                                                <div className={`${styles.inputContainer} ${hasValue(esewaPassword) ? styles.hasValue : ''} ${getFieldError('esewaPassword') ? styles.inputError : ''}`}>
                                                    <input
                                                        type="password"
                                                        value={esewaPassword}
                                                        onChange={(e) => setEsewaPassword(e.target.value)}
                                                        onBlur={() => handleFieldBlur('esewaPassword')}
                                                        className={styles.shopifyInput}
                                                    />
                                                    <label className={styles.shopifyLabel}>
                                                        <span className={styles.labelText}>eSewa Password</span>
                                                    </label>
                                                </div>
                                                {getFieldError('esewaPassword') && <div className={styles.errorText}>{getFieldError('esewaPassword')}</div>}
                                            </div>
                                        </div>
                                    )}

                                    {/* Khalti Fields */}
                                    {paymentMethod === 'khalti' && (
                                        <div className={styles.paymentLogin}>
                                            <div className={styles.fieldWrapper}>
                                                <div className={`${styles.inputContainer} ${hasValue(khaltiNumber) ? styles.hasValue : ''} ${getFieldError('khaltiNumber') ? styles.inputError : ''}`}>
                                                    <input
                                                        type="text"
                                                        value={khaltiNumber}
                                                        onChange={(e) => setKhaltiNumber(e.target.value)}
                                                        onBlur={() => handleFieldBlur('khaltiNumber')}
                                                        className={styles.shopifyInput}
                                                    />
                                                    <label className={styles.shopifyLabel}>
                                                        <span className={styles.labelText}>Khalti Mobile Number</span>
                                                    </label>
                                                </div>
                                                {getFieldError('khaltiNumber') && <div className={styles.errorText}>{getFieldError('khaltiNumber')}</div>}
                                            </div>
                                            <div className={styles.fieldWrapper}>
                                                <div className={`${styles.inputContainer} ${hasValue(khaltiMpin) ? styles.hasValue : ''} ${getFieldError('khaltiMpin') ? styles.inputError : ''}`}>
                                                    <input
                                                        type="password"
                                                        value={khaltiMpin}
                                                        onChange={(e) => setKhaltiMpin(e.target.value)}
                                                        onBlur={() => handleFieldBlur('khaltiMpin')}
                                                        className={styles.shopifyInput}
                                                    />
                                                    <label className={styles.shopifyLabel}>
                                                        <span className={styles.labelText}>Khalti MPIN</span>
                                                    </label>
                                                </div>
                                                {getFieldError('khaltiMpin') && <div className={styles.errorText}>{getFieldError('khaltiMpin')}</div>}
                                            </div>
                                        </div>
                                    )}

                                    {/* COD Note */}
                                    {paymentMethod === 'cod' && (
                                        <div className={styles.codNote}>
                                            <p>💵 Pay with cash when your order is delivered</p>
                                            <p>✅ No extra charges for cash on delivery</p>
                                        </div>
                                    )}
                                </div>

                                {/* Desktop Pay Now Button */}
                                <button className={styles.payNowButton} onClick={handlePayNow}>
                                    {payButtonText}
                                </button>

                                {/* Desktop Footer */}
                                <div className={styles.footerSection}>
                                    <div className={styles.footerHorizontalBar}></div>
                                    <div className={styles.copyrightText}>
                                        All rights reserved Bazar to Ghar
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Vertical Separator */}
                    <div className={styles.verticalSeparator}></div>

                    {/* Right Section - Product Display */}
                    <div className={styles.rightSection}>
                        <div className={styles.productDisplay}>
                            <div className={styles.productItem}>
                                <div className={styles.imageContainer}>
                                    <img 
                                        src={product.images?.[0] || product.image_url} 
                                        alt={product.name}
                                        className={styles.productImage}
                                    />
                                    <div className={styles.quantityBadge}>{quantity}</div>
                                </div>
                                <div className={styles.productDetails}>
                                    <div className={styles.productHeader}>
                                        <h3 className={styles.productName}>{product.name}</h3>
                                        <span className={styles.productPrice}>${totalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className={styles.productSpecs}>
                                        <span className={styles.sizeText}>{selectedPackage || 'Standard'}</span>
                                        <span className={styles.separator}>/</span>
                                        <span className={styles.materialText}>{product.material || product.material_type || 'Cotton'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Discount Code Section */}
                            <div className={styles.discountSection}>
                                <div className={styles.discountRow}>
                                    <div className={styles.discountFieldWrapper}>
                                        <div className={`${styles.discountInputContainer} ${hasValue(discountCode) ? styles.hasValue : ''}`}>
                                            <input
                                                type="text"
                                                value={discountCode}
                                                onChange={(e) => setDiscountCode(e.target.value)}
                                                className={styles.discountInput}
                                                placeholder=" "
                                            />
                                            <label className={styles.discountLabel}>
                                                <span className={styles.discountLabelText}>Discount code</span>
                                            </label>
                                        </div>
                                    </div>
                                    <button 
                                        className={`${styles.applyButton} ${discountCode.trim() && !isValidatingCoupon ? styles.applyButtonActive : ''}`}
                                        onClick={handleApplyDiscount}
                                        disabled={!discountCode.trim() || isValidatingCoupon}
                                    >
                                        {isValidatingCoupon ? <span className={styles.loadingText}>Applying...</span> : "Apply"}
                                    </button>
                                </div>
                                {couponMessage && (
                                    <div className={`${styles.couponMessage} ${isDiscountApplied ? styles.couponSuccess : styles.couponError}`}>
                                        {couponMessage}
                                    </div>
                                )}
                            </div>

                            {/* Order Summary */}
                            <div className={styles.orderSummary}>
                                <div className={styles.summaryRow}>
                                    <span className={styles.summaryLabel}>Subtotal:</span>
                                    <span className={styles.summaryValue}>${subtotal.toFixed(2)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className={styles.summaryRow}>
                                        <span className={styles.summaryLabel}>Discount:</span>
                                        <span className={styles.discountValue}>-${discount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className={styles.summaryRow}>
                                    <span className={styles.summaryLabel}>Shipping:</span>
                                    <span className={styles.summaryValue}>
                                        {shippingCharge > 0 ? `$${shippingCharge.toFixed(2)}` : 'Free'}
                                    </span>
                                </div>
                                <div className={styles.summaryRow}>
                                    <span className={styles.summaryLabel}>Grand Total:</span>
                                    <span className={styles.grandTotal}>${grandTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Mobile Pay Now Button */}
                            <button 
                                className={styles.mobilePayNowButton}
                                onClick={handlePayNow}
                            >
                                {payButtonText}
                            </button>

                            {/* Mobile Footer */}
                            <div className={styles.mobileFooterSection}>
                                <div className={styles.footerHorizontalBar}></div>
                                <div className={styles.copyrightText}>
                                    All rights reserved Bazar to Ghar
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}