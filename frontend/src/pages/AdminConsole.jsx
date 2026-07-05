import { useEffect, useState, useCallback } from "react";
import api from "../api/client";
import TopBar from "../components/TopBar.jsx";
import styles from "../styles/dashboard.module.css";

export default function AdminConsole() {
  const [lobs, setLobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [lobForm, setLobForm] = useState({ name: "", headName: "", headPhone: "", headEmail: "" });
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "ANALYST", lobId: "" });

  const load = useCallback(async () => {
    const [lobRes, userRes] = await Promise.all([api.get("/lobs"), api.get("/lobs/users")]);
    setLobs(lobRes.data);
    setUsers(userRes.data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createLob(e) {
    e.preventDefault();
    await api.post("/lobs", lobForm);
    setLobForm({ name: "", headName: "", headPhone: "", headEmail: "" });
    load();
  }

  async function createUser(e) {
    e.preventDefault();
    await api.post("/lobs/users", userForm);
    setUserForm({ name: "", email: "", password: "", role: "ANALYST", lobId: "" });
    load();
  }

  return (
    <div className={styles.page}>
      <TopBar homePath="/admin" />
      <div className={styles.container}>
        <div className={styles.twoCol}>
          <div className={styles.panel}>
            <div className={styles.panelHeadRow}>
              <h3 className={styles.panelTitle}>Lines of Business</h3>
            </div>
            <form onSubmit={createLob} style={{ display: "grid", gap: 10, marginBottom: 16 }}>
              <input placeholder="LOB name" value={lobForm.name} onChange={e => setLobForm({ ...lobForm, name: e.target.value })} required />
              <input placeholder="Head name" value={lobForm.headName} onChange={e => setLobForm({ ...lobForm, headName: e.target.value })} />
              <input placeholder="Head WhatsApp number (E.164, e.g. 919999999999)" value={lobForm.headPhone} onChange={e => setLobForm({ ...lobForm, headPhone: e.target.value })} />
              <input placeholder="Head email (for daily report email)" type="email" value={lobForm.headEmail} onChange={e => setLobForm({ ...lobForm, headEmail: e.target.value })} />
              <button className={styles.addBtn} type="submit">Add LOB</button>
            </form>
            <div className={styles.rows}>
              {lobs.map(lob => (
                <div className={styles.row} key={lob.id}>
                  <span className={styles.rowTitle}>{lob.name}</span>
                  <span className={styles.rowModule}>{lob.headName || "No head assigned"}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHeadRow}>
              <h3 className={styles.panelTitle}>Users</h3>
            </div>
            <form onSubmit={createUser} style={{ display: "grid", gap: 10, marginBottom: 16 }}>
              <input placeholder="Full name" value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} required />
              <input placeholder="Email" type="email" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} required />
              <input placeholder="Temporary password" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} required />
              <select value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
                <option value="ANALYST">Analyst</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
              <select value={userForm.lobId} onChange={e => setUserForm({ ...userForm, lobId: e.target.value })}>
                <option value="">No LOB</option>
                {lobs.map(lob => (
                  <option key={lob.id} value={lob.id}>{lob.name}</option>
                ))}
              </select>
              <button className={styles.addBtn} type="submit">Create user</button>
            </form>
            <div className={styles.rows}>
              {users.map(u => (
                <div className={styles.row} key={u.id}>
                  <span className={styles.rowTitle}>{u.name}</span>
                  <span className={styles.rowModule}>{u.role} &middot; {u.lob?.name || "—"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}