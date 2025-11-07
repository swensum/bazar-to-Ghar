import { type JSX, useState, useEffect } from "react";
import { supabase } from "../../store/supabase";
import styles from "./Blog.module.scss";

interface BlogPost {
    id: string;
    title: string;
    summary: string;
    content: string;
    image_url: string;
    read_time: string;
    author_name: string;
    created_at: string;
    publish_date: string;
    slug: string;
}

export default function Blog(): JSX.Element {
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchBlogPosts();
    }, []);

    const fetchBlogPosts = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data: postsData, error } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('is_published', true)
                .order('publish_date', { ascending: false })
                .limit(6);

            if (error) throw error;

            setBlogPosts(postsData || []);
        } catch (error) {
            console.error('Error fetching blog posts:', error);
            setError('Failed to load blog posts');
        } finally {
            setLoading(false);
        }
    };

    const truncateSummary = (text: string, maxLines: number = 3): string => {
        const words = text.split(' ');
        const maxChars = maxLines * 60;
        if (text.length <= maxChars) return text;

        return words.reduce((acc, word) => {
            if (acc.length + word.length + 1 <= maxChars) {
                return acc + (acc ? ' ' : '') + word;
            }
            return acc;
        }, '') + '......';
    };

    const handleViewAllBlogs = () => {
        // Add your navigation logic here
        console.log('View All Blogs clicked');
        // Example: navigate('/blogs');
    };

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.loading}>Loading blog posts...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.page}>
                <div className={styles.error}>{error}</div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            {/* Header Section */}
            <section className={styles.headerSection}>
                <h1 className={styles.mainHeading}>Our Blog</h1>
                <p className={styles.subHeading}>Latest news, tips, and insights</p>
            </section>

            {/* Blog Posts Section */}
            <section className={styles.blogSection}>
                <div className={styles.blogContainer}>
                    {blogPosts.map((post, index) => (
                        <div key={post.id} className={styles.blogCard}>
                            {/* Numbering Container */}
                            <div className={styles.numberContainer}>
                                <span className={styles.number}>{(index + 1).toString().padStart(2, '0')}</span>
                            </div>

                            {/* Blog Image */}
                            <div className={styles.imageContainer}>
                                <img
                                    src={post.image_url}
                                    alt={post.title}
                                    className={styles.blogImage}
                                />
                            </div>

                            {/* Blog Content */}
                            <div className={styles.blogContent}>
                                {/* Read Time */}
                                <div className={styles.readTime}>
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="#666"
                                        className={styles.timeIcon}
                                    >
                                        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z" />
                                    </svg>
                                    <span>{post.read_time}</span>
                                </div>

                                {/* Title */}
                                <h2 className={styles.blogTitle}>{post.title}</h2>

                                {/* Summary */}
                                <p className={styles.blogSummary}>
                                    {truncateSummary(post.summary)}
                                </p>

                                {/* Read More - Fixed at bottom */}
                                <div className={styles.readMoreWrapper}>
                                    <button className={styles.readMoreBtn}>
                                        Read More
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            className={styles.arrowIcon}
                                        >
                                            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* View All Blogs Button */}
                <div className={styles.viewAllContainer}>
                    <button 
                        className={styles.viewAllBtn}
                        onClick={handleViewAllBlogs}
                    >
                        View All Blogs
                        
                    </button>
                </div>
            </section>
        </div>
    );
}