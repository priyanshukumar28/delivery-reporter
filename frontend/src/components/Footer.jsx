import styles from "../styles/dashboard.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <span>© 2024 Daily Delivery Reporter. All rights reserved.</span>
      <div className={styles.footerLinks}>
        <a href="#" onClick={e => e.preventDefault()}>Support</a>
        <a href="#" onClick={e => e.preventDefault()}>Documentation</a>
        <a href="#" onClick={e => e.preventDefault()}>System Status</a>
      </div>
    </footer>
  );
}
