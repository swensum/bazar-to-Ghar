import { type JSX, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { dbLite } from "../store/firebaselite";
import { collection, getDocs, query, where, limit } from "firebase/firestore/lite";
import ReactMarkdown from "react-markdown";
import styles from "./BlogDetailPage.module.scss";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

interface BlogDetail {
  id: string;
  title: string;
  summary: string;
  content: string;
  image_url: string;
  read_time: string;
  author_name: string;
  publish_date: string;
  slug: string;
}

export default function BlogDetailPage(): JSX.Element {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<BlogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useDocumentTitle(post?.title);

  useEffect(() => {
    if (slug) {
      fetchPostBySlug(slug);
    }
  }, [slug]);

  const fetchPostBySlug = async (slugValue: string) => {
    try {
      setLoading(true);
      setNotFound(false);

      const postsRef = collection(dbLite, "blog_posts");
      const q = query(postsRef, where("slug", "==", slugValue), where("isPublished", "==", true), limit(1));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setNotFound(true);
        setPost(null);
        return;
      }

      const docSnap = snapshot.docs[0];
      const data = docSnap.data();

      setPost({
        id: docSnap.id,
        title: data.title,
        summary: data.summary,
        content: data.content,
        image_url: data.imageUrl,
        read_time: data.readTime,
        author_name: data.authorName,
        publish_date: data.publishDate?.toDate
          ? data.publishDate.toDate().toISOString()
          : data.publishDate,
        slug: data.slug,
      });
    } catch (error) {
      console.error("Error fetching blog post:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = post?.publish_date
    ? new Date(post.publish_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading article...</div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <h2>Article not found</h2>
          <button className={styles.backBtn} onClick={() => navigate("/")}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <article className={styles.page}>
      {/* Hero image */}
      <div className={styles.heroImageContainer}>
        <img src={post.image_url} alt={post.title} className={styles.heroImage} />
      </div>

      <div className={styles.container}>
        {/* Meta row: author, date, read time */}
        <div className={styles.metaRow}>
          <div className={styles.authorInfo}>
            <div className={styles.authorAvatar}>
              {post.author_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className={styles.authorName}>{post.author_name}</div>
              <div className={styles.metaSub}>
                {formattedDate} · {post.read_time}
              </div>
            </div>
          </div>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>

        {/* Title */}
        <h1 className={styles.title}>{post.title}</h1>

        {/* Summary as a lead paragraph */}
        <p className={styles.summary}>{post.summary}</p>

        <div className={styles.divider} />

        {/* Markdown content */}
        <div className={styles.content}>
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </div>
    </article>
  );
}