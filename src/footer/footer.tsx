import { type JSX } from "react";
import styles from "./Footer.module.scss";
import { IoLocationOutline } from "react-icons/io5";
import { FiPhone } from "react-icons/fi";
import { FaFacebookF, FaInstagram, FaYoutube, FaWhatsapp } from "react-icons/fa";
import { SiGmail } from "react-icons/si";
import { useNavigate } from "react-router-dom";
import { supabase } from "../store/supabase";
import logo from "../assets/logo.png";

export default function Footer(): JSX.Element {
    const navigate = useNavigate();

    const handleCategoryClick = async (categoryName: string) => {
        try {
            // Fetch the full category data
            const { data: categoryData, error } = await supabase
                .from('categories')
                .select('*')
                .eq('name', categoryName)
                .single();

            if (error) throw error;

            navigate('/products', { 
                state: { 
                    selectedCategory: categoryData,
                    filterType: 'category'
                } 
            });
        } catch (error) {
            console.error('Error fetching category:', error);
            
            navigate('/products', { 
                state: { 
                    selectedCategory: { name: categoryName },
                    filterType: 'category'
                } 
            });
        }
    };

    const handleNavigation = (filterType: string) => {
        navigate('/products', { 
            state: { 
                filterType: filterType
            } 
        });
    };

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.contentWrapper}>
                    {/* Logo, Address and Phone in same horizontal line */}
                    <div className={styles.topSection}>
                        <div className={styles.logoSection}>
                            <img
                                src={logo}
                                alt="Company Logo"
                                className={styles.logo}
                            />
                            <div className={styles.aboutSection}>
                                <p className={styles.aboutText}>
                                    Our mission is to make healthy living accessible and
                                    affordable for everyone through our carefully curated selection.
                                </p>
                            </div>
                        </div>

                        <div className={styles.addressSection}>
                            <div className={styles.addressItem}>
                                <div className={styles.addressIcon}>
                                    <IoLocationOutline size={48} color="#f5ab1e" />
                                </div>
                                <div className={styles.addressContent}>
                                    <h4 className={styles.addressTitle}>Address</h4>
                                    <p className={styles.addressText}>
                                        Tinkune, 06<br />
                                       Butwal, Rupandehi
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Phone Number Section */}
                        <div className={styles.phoneSection}>
                            <div className={styles.phoneItem}>
                                <div className={styles.phoneIcon}>
                                    <FiPhone size={48} color="#f5ab1e" />
                                </div>
                                <div className={styles.phoneContent}>
                                    <h4 className={styles.phoneTitle}>Get in Touch</h4>
                                    <p className={styles.phoneText}>
                                        +977 9800000000
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Horizontal Separator Bar */}
                    <div className={styles.separator}></div>

                    {/* Footer Links Sections */}
                    <div className={styles.linksContainer}>
                        {/* Shop Section */}
                        <div className={styles.linkSection}>
                            <h4 className={styles.sectionTitle}>Shop</h4>
                            <ul className={styles.linkList}>
                                <li>
                                    <a 
                                        href="/products" 
                                        className={styles.link}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            navigate('/products');
                                        }}
                                    >
                                        All Products
                                    </a>
                                </li>
                                <li>
                                    <a 
                                        href="/new-arrivals" 
                                        className={styles.link}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleNavigation('New Product');
                                        }}
                                    >
                                        New Products
                                    </a>
                                </li>
                                <li>
                                    <a 
                                        href="/best-sellers" 
                                        className={styles.link}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleNavigation('Best Seller');
                                        }}
                                    >
                                        Best Sellers
                                    </a>
                                </li>
                                <li>
                                    <a 
                                        href="/fruits" 
                                        className={styles.link}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleCategoryClick('Fruits');
                                        }}
                                    >
                                        Fruits
                                    </a>
                                </li>
                                <li>
                                    <a 
                                        href="/vegetables" 
                                        className={styles.link}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleCategoryClick('Vegitables'); 
                                        }}
                                    >
                                        Vegetables
                                    </a>
                                </li>
                            </ul>
                        </div>


                      
                        <div className={styles.linkSection}>
                            <h4 className={styles.sectionTitle}>Information</h4>
                            <ul className={styles.linkList}>
                                <li><a href="/shipping" className={styles.link}>Shipping Info</a></li>
                                <li><a href="/returns" className={styles.link}>Returns & Refunds</a></li>
                                <li><a href="/privacy" className={styles.link}>Privacy Policy</a></li>
                                <li><a href="/terms" className={styles.link}>Terms of Service</a></li>
                                <li><a href="/faq" className={styles.link}>FAQ</a></li>
                            </ul>
                        </div>

                        {/* About Section */}
                        <div className={styles.linkSection}>
                            <h4 className={styles.sectionTitle}>About</h4>
                            <ul className={styles.linkList}>
                                <li><a href="/our-story" className={styles.link}>Our Story</a></li>
                                <li><a href="/mission" className={styles.link}>Our Mission</a></li>
                                <li><a href="/team" className={styles.link}>Our Team</a></li>
                                <li><a href="/blog" className={styles.link}>Blog</a></li>
                                <li><a href="/contact" className={styles.link}>Contact Us</a></li>
                            </ul>
                        </div>

                        {/* Follow Us Section */}
                        <div className={styles.linkSection}>
                            <h4 className={styles.sectionTitle}>Follow Us</h4>
                            <div className={styles.socialSection}>
                                {/* Email Address */}
                                <div className={styles.emailItem}>
                                    <SiGmail className={styles.emailIcon} />
                                    <span className={styles.emailText}>info@company.com</span>
                                </div>
                                
                                {/* Social Media Icons */}
                                <div className={styles.socialIcons}>
                                    <a href="https://facebook.com" className={styles.socialLink} aria-label="Facebook">
                                        <FaFacebookF className={styles.socialIcon} />
                                    </a>
                                    <a href="https://instagram.com" className={styles.socialLink} aria-label="Instagram">
                                        <FaInstagram className={styles.socialIcon} />
                                    </a>
                                    <a href="https://youtube.com" className={styles.socialLink} aria-label="YouTube">
                                        <FaYoutube className={styles.socialIcon} />
                                    </a>
                                    <a href="https://whatsapp.com" className={styles.socialLink} aria-label="WhatsApp">
                                        <FaWhatsapp className={styles.socialIcon} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Copyright Section */}
                    <div className={styles.copyrightSection}>
                        <p className={styles.copyrightText}>
                            © 2025 Bazar To Ghar. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}