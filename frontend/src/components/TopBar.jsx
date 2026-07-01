import { NavLink, useNavigate } from "react-router-dom";
import styles from "../styles/dashboard.module.css";
import { useAuth } from "../api/AuthContext.jsx";
import { PulseIcon, LogoutIcon } from "./icons.jsx";

const ROLE_LABEL = {
  SUPER_ADMIN: "Super Admin",
  ANALYST: "Reporting Lead"
};

function initials(name) {
  if (!name) return "?";
  return name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
}

export default function TopBar({ homePath = "/" }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className={styles.topbar}>
      <div className={styles.brand}>
        <span className={styles.logoIcon}><PulseIcon size={18} /></span>
        <span className={styles.brandName}>Daily Delivery Reporter</span>
      </div>

      <nav className={styles.nav}>
        <NavLink to={homePath} end className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}>
          Dashboard
        </NavLink>
        <a
          href="#history"
          className={styles.navLink}
          onClick={e => {
            e.preventDefault();
            document.getElementById("history")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Reports
        </a>
      </nav>

      <div className={styles.who}>
        <div className={styles.whoText}>
          <span className={styles.whoRole}>{ROLE_LABEL[user?.role] || user?.role}</span>
          <span className={styles.whoLob}>LOB: {user?.lob?.name || "—"}</span>
        </div>
        <span className={styles.avatar}>
          {initials(user?.name)}
          <span className={styles.avatarDot} />
        </span>
        <button
          className={styles.logoutIconBtn}
          onClick={() => {
            logout();
            navigate("/login");
          }}
          aria-label="Log out"
          title="Log out"
        >
          <LogoutIcon />
        </button>
      </div>
    </header>
  );
}
