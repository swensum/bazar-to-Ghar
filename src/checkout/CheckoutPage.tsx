// checkout/CheckoutPage.tsx
import { type JSX, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./CheckoutPage.module.scss";
import appLogo from "../assets/logo.png";

export default function CheckoutPage(): JSX.Element {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState("");
    const [newsletterOptIn, setNewsletterOptIn] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [area, setArea] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("esewa"); // Default to eSewa
    const [esewaId, setEsewaId] = useState("");
    const [esewaPassword, setEsewaPassword] = useState("");
    const [khaltiNumber, setKhaltiNumber] = useState("");
    const [khaltiMpin, setKhaltiMpin] = useState("");
    const [discountCode, setDiscountCode] = useState("");
    const [isDiscountApplied, setIsDiscountApplied] = useState(false);
    // Get the product from location state (passed during navigation)
    const product = location.state?.product;
    const quantity = location.state?.quantity || 1;
    const selectedPackage = location.state?.selectedPackage;

    // Set first payment option as default when page loads or reloads
    useEffect(() => {
        setPaymentMethod("esewa");
    }, []);

    const handleSignIn = () => {
        console.log("Sign in clicked");
    };

    const handlePayNow = () => {
        console.log("Pay now clicked");
        // Handle payment logic here
    };
    const handleApplyDiscount = () => {
        if (discountCode.trim()) {
            console.log("Applying discount code:", discountCode);
            setIsDiscountApplied(true);
            // Add your discount logic here
        }
    };
    const handlePaymentMethodChange = (method: string) => {
        setPaymentMethod(method);
    };

    const hasValue = (value: string) => {
        return value.length > 0;
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

    // Calculate discounted price
    const discountedPrice = product.discount_percentage > 0
        ? product.price * (1 - product.discount_percentage / 100)
        : product.price;

    const totalPrice = discountedPrice * quantity;

    // Determine button text based on payment method
    const payButtonText = paymentMethod === 'cod' ? 'Proceed' : 'Pay Now';

    return (
        <div className={styles.checkoutPage}>
            {/* Header with Logo */}
            <header className={styles.checkoutHeader}>
                <div className={styles.logoContainer}>
                    <div className={styles.logo} onClick={() => navigate('/')}>
                        <img
                            src={appLogo}
                            alt="Website Logo"
                            className={styles.logoImage}
                        />
                    </div>
                </div>
            </header>

            {/* Full Width Horizontal Bar */}
            <div className={styles.horizontalBar}></div>

            {/* Main Content */}
            <div className={styles.checkoutContainer}>
                <div className={styles.checkoutContent}>
                    {/* Left Section - Contact Information */}
                    <div className={styles.leftSection}>
                        <div className={styles.contactSection}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>Contact</h2>
                                <button
                                    className={styles.signInButton}
                                    onClick={handleSignIn}
                                >
                                    Sign in
                                </button>
                            </div>

                            {/* Email Field - Shopify Style */}
                            <div className={styles.fieldWrapper}>
                                <div className={`${styles.inputContainer} ${hasValue(email) ? styles.hasValue : ''}`}>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={styles.shopifyInput}
                                    />
                                    <label
                                        htmlFor="email"
                                        className={styles.shopifyLabel}
                                    >
                                        <span className={styles.labelText}>
                                            Email or mobile phone number
                                        </span>
                                    </label>
                                </div>
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
                                    <span className={styles.checkboxText}>
                                        Email me with news and offers
                                    </span>
                                </label>
                            </div>

                            {/* Delivery Section */}
                            <div className={styles.deliverySection}>
                                <h2 className={styles.deliveryTitle}>Delivery</h2>

                                {/* First Name and Last Name Fields - Shopify Style */}
                                <div className={styles.nameFields}>
                                    <div className={styles.fieldWrapper}>
                                        <div className={`${styles.inputContainer} ${hasValue(firstName) ? styles.hasValue : ''}`}>
                                            <input
                                                id="firstName"
                                                type="text"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                className={styles.shopifyInput}
                                            />
                                            <label
                                                htmlFor="firstName"
                                                className={styles.shopifyLabel}
                                            >
                                                <span className={styles.labelText}>
                                                    First name
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className={styles.fieldWrapper}>
                                        <div className={`${styles.inputContainer} ${hasValue(lastName) ? styles.hasValue : ''}`}>
                                            <input
                                                id="lastName"
                                                type="text"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                className={styles.shopifyInput}
                                            />
                                            <label
                                                htmlFor="lastName"
                                                className={styles.shopifyLabel}
                                            >
                                                <span className={styles.labelText}>
                                                    Last name
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Address Field */}
                                <div className={styles.fieldWrapper}>
                                    <div className={`${styles.inputContainer} ${hasValue(address) ? styles.hasValue : ''}`}>
                                        <input
                                            id="address"
                                            type="text"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            className={styles.shopifyInput}
                                        />
                                        <label
                                            htmlFor="address"
                                            className={styles.shopifyLabel}
                                        >
                                            <span className={styles.labelText}>
                                                Address (Street, Tole, Area)
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                {/* City Selection - Bhairahawa or Butwal */}
                                <div className={styles.fieldWrapper}>
                                    <div className={`${styles.inputContainer} ${hasValue(city) ? styles.hasValue : ''}`}>
                                        <select
                                            id="city"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            className={styles.shopifySelect}
                                        >
                                            <option value=""></option>
                                            <option value="bhairahawa">Bhairahawa</option>
                                            <option value="butwal">Butwal</option>
                                        </select>
                                        <label
                                            htmlFor="city"
                                            className={styles.shopifyLabel}
                                        >
                                            <span className={styles.labelText}>
                                                Select City
                                            </span>
                                        </label>
                                    </div>
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
                                        <label
                                            htmlFor="area"
                                            className={styles.shopifyLabel}
                                        >
                                            <span className={styles.labelText}>
                                                Area / Landmark (Optional)
                                            </span>
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
                                    {/* Payment Method Options with different background */}
                                    <div className={styles.paymentOptionsSection}>
                                        <div className={styles.paymentOptionsText}>
                                            <div className={styles.paymentOptionText}>
                                                <span
                                                    className={`${styles.paymentText} ${paymentMethod === 'esewa' ? styles.active : ''}`}
                                                    onClick={() => handlePaymentMethodChange('esewa')}
                                                >
                                                    eSewa
                                                </span>
                                            </div>
                                            <div className={styles.paymentOptionText}>
                                                <span
                                                    className={`${styles.paymentText} ${paymentMethod === 'khalti' ? styles.active : ''}`}
                                                    onClick={() => handlePaymentMethodChange('khalti')}
                                                >
                                                    Khalti
                                                </span>
                                            </div>
                                            <div className={styles.paymentOptionText}>
                                                <span
                                                    className={`${styles.paymentText} ${paymentMethod === 'cod' ? styles.active : ''}`}
                                                    onClick={() => handlePaymentMethodChange('cod')}
                                                >
                                                    COD
                                                </span>
                                            </div>
                                        </div>

                                        {/* Horizontal Bar Below Payment Options */}
                                        <div className={styles.paymentHorizontalBar}></div>
                                    </div>

                                    {/* Payment Login Fields */}
                                    {paymentMethod === 'esewa' && (
                                        <div className={styles.paymentLogin}>
                                            <div className={styles.fieldWrapper}>
                                                <div className={`${styles.inputContainer} ${hasValue(esewaId) ? styles.hasValue : ''}`}>
                                                    <input
                                                        type="text"
                                                        value={esewaId}
                                                        onChange={(e) => setEsewaId(e.target.value)}
                                                        className={styles.shopifyInput}
                                                    />
                                                    <label className={styles.shopifyLabel}>
                                                        <span className={styles.labelText}>
                                                            eSewa ID or Mobile Number
                                                        </span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div className={styles.fieldWrapper}>
                                                <div className={`${styles.inputContainer} ${hasValue(esewaPassword) ? styles.hasValue : ''}`}>
                                                    <input
                                                        type="password"
                                                        value={esewaPassword}
                                                        onChange={(e) => setEsewaPassword(e.target.value)}
                                                        className={styles.shopifyInput}
                                                    />
                                                    <label className={styles.shopifyLabel}>
                                                        <span className={styles.labelText}>
                                                            eSewa Password
                                                        </span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {paymentMethod === 'khalti' && (
                                        <div className={styles.paymentLogin}>
                                            <div className={styles.fieldWrapper}>
                                                <div className={`${styles.inputContainer} ${hasValue(khaltiNumber) ? styles.hasValue : ''}`}>
                                                    <input
                                                        type="text"
                                                        value={khaltiNumber}
                                                        onChange={(e) => setKhaltiNumber(e.target.value)}
                                                        className={styles.shopifyInput}
                                                    />
                                                    <label className={styles.shopifyLabel}>
                                                        <span className={styles.labelText}>
                                                            Khalti Mobile Number
                                                        </span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div className={styles.fieldWrapper}>
                                                <div className={`${styles.inputContainer} ${hasValue(khaltiMpin) ? styles.hasValue : ''}`}>
                                                    <input
                                                        type="password"
                                                        value={khaltiMpin}
                                                        onChange={(e) => setKhaltiMpin(e.target.value)}
                                                        className={styles.shopifyInput}
                                                    />
                                                    <label className={styles.shopifyLabel}>
                                                        <span className={styles.labelText}>
                                                            Khalti MPIN
                                                        </span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {paymentMethod === 'cod' && (
                                        <div className={styles.codNote}>
                                            <p>💵 Pay with cash when your order is delivered</p>
                                            <p>✅ No extra charges for cash on delivery</p>
                                        </div>
                                    )}
                                </div>

                                {/* Pay Now / Proceed Button */}
                                <button
                                    className={styles.payNowButton}
                                    onClick={handlePayNow}
                                >
                                    {payButtonText}
                                </button>
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
        <div className={styles.quantityBadge}>
          {quantity}
        </div>
      </div>
      <div className={styles.productDetails}>
        <div className={styles.productHeader}>
          <h3 className={styles.productName}>{product.name}</h3>
          <span className={styles.productPrice}>
            ${totalPrice.toFixed(2)}
          </span>
        </div>
        <div className={styles.productSpecs}>
          <span className={styles.sizeText}>
            {selectedPackage || 'Standard'}
          </span>
          <span className={styles.separator}>/</span>
          <span className={styles.materialText}>
            {product.material || product.material_type || 'Cotton'}
          </span>
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
              <span className={styles.discountLabelText}>
                Discount code
              </span>
            </label>
          </div>
        </div>
        <button 
          className={`${styles.applyButton} ${discountCode.trim() ? styles.applyButtonActive : ''}`}
          onClick={handleApplyDiscount}
          disabled={!discountCode.trim()}
        >
          Apply
        </button>
      </div>
      {isDiscountApplied && (
        <div className={styles.discountAppliedMessage}>
          Discount code applied successfully!
        </div>
      )}
    </div>
  </div>
</div>
                </div>
            </div>
        </div>
    );
}