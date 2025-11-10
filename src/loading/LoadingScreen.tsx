// LoadingScreen.jsx
import logo from "../assets/logo.png";
import styles from "./loading.module.scss";

export default function LoadingScreen() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingContent}>
        <div className={styles.logoWrapper}>
          <img
            src={logo}
            alt="Company Logo"
            className={styles.loadingLogo}
          />
          <div className={styles.logoGlow}></div>
        </div>
        
        <div className={styles.loadingProgress}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill}></div>
          </div>
          <div className={styles.loadingDots}>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
          </div>
        </div>
        
        
      </div>
      
      <div className={styles.backgroundShapes}>
        <div className={styles.shape1}></div>
        <div className={styles.shape2}></div>
        <div className={styles.shape3}></div>
      </div>
    </div>
  );
}