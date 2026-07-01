import { useEffect, useState, useCallback } from "react";
import api from "../api/client";
import { useAuth } from "../api/AuthContext.jsx";
import TopBar from "../components/TopBar.jsx";
import MetricStrip from "../components/MetricStrip.jsx";
import EntryPanel from "../components/EntryPanel.jsx";
import MessagePreview from "../components/MessagePreview.jsx";
import ExportPanel from "../components/ExportPanel.jsx";
import HistoryPanel from "../components/HistoryPanel.jsx";
import Footer from "../components/Footer.jsx";
import { CalendarIcon, SearchIcon, CheckIcon } from "../components/icons.jsx";
import styles from "../styles/dashboard.module.css";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function formatDateLong(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "short", year: "numeric" });
}

export default function AnalystDashboard() {
  const { user } = useAuth();
  const [date, setDate] = useState(todayKey());
  const [requirements, setRequirements] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    const [reqRes, delRes, reportRes] = await Promise.all([
      api.get("/requirements", { params: { date } }),
      api.get("/deliveries", { params: { date } }),
      api.get("/reports", { params: { date } })
    ]);
    setRequirements(reqRes.data);
    setDeliveries(delRes.data);
    setReport(reportRes.data);
  }, [date]);

  const loadHistory = useCallback(async () => {
    const { data } = await api.get("/reports");
    setHistory(data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  async function withSaving(fn) {
    setSaving(true);
    try {
      await fn();
    } finally {
      setSaving(false);
    }
  }

  async function addRequirement(payload) {
    await withSaving(async () => {
      await api.post("/requirements", { ...payload, date });
      await load();
    });
  }

  async function addDelivery(payload) {
    await withSaving(async () => {
      await api.post("/deliveries", { ...payload, date });
      await load();
    });
  }

  async function deleteRequirement(id) {
    await withSaving(async () => {
      await api.delete(`/requirements/${id}`);
      await load();
    });
  }

  async function deleteDelivery(id) {
    await withSaving(async () => {
      await api.delete(`/deliveries/${id}`);
      await load();
    });
  }

  async function generateReport() {
    setGenerating(true);
    try {
      const { data } = await api.post("/reports/generate", { date });
      setReport(data);
      loadHistory();
      return data;
    } finally {
      setGenerating(false);
    }
  }

  async function clearToday() {
    await withSaving(async () => {
      await Promise.all([
        ...requirements.map(r => api.delete(`/requirements/${r.id}`)),
        ...deliveries.map(d => api.delete(`/deliveries/${d.id}`))
      ]);
      await load();
    });
  }

  return (
    <div className={styles.page}>
      <TopBar homePath="/analyst" />
      <div className={styles.container}>
        <div className={styles.headerCard}>
          <div>
            <h1 className={styles.pageTitle}>Daily Delivery Reporter</h1>
            <div className={styles.pageMeta}>
              <span className={styles.pageMetaDate}>
                <CalendarIcon /> {formatDateLong(date)}
              </span>
              <span className={styles.pageMetaDot}>&bull;</span>
              <span className={styles.lobBadge}>{user?.lob?.name || "—"}</span>
              <input
                className={styles.dateInputInline}
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                aria-label="Change date"
              />
            </div>
          </div>
          <span className={styles.savedBadge}>
            <CheckIcon /> {saving ? "Saving..." : "Saved"}
          </span>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeadRow}>
            <div>
              <h3 className={styles.panelTitle}>Daily Workspace</h3>
              <p className={styles.panelSubtitle}>Search and sort entries by module while today&apos;s report saves automatically.</p>
            </div>
            <div className={styles.searchBox}>
              <SearchIcon />
              <input placeholder="Type a module name..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </div>

        <div className={styles.twoCol}>
          <EntryPanel
            title="Requirements Received Today"
            kind="requirement"
            items={requirements}
            onAdd={addRequirement}
            onDelete={deleteRequirement}
            emptyText="No requirements logged for this date yet."
            filter={search}
            canEdit
          />
          <EntryPanel
            title="Deliveries Completed Today"
            kind="delivery"
            items={deliveries}
            onAdd={addDelivery}
            onDelete={deleteDelivery}
            emptyText="No deliveries logged for this date yet."
            filter={search}
            canEdit
          />
        </div>

        <MetricStrip requirements={requirements} deliveries={deliveries} />

        <MessagePreview date={date} requirements={requirements} deliveries={deliveries} />

        <ExportPanel
          date={date}
          requirements={requirements}
          deliveries={deliveries}
          report={report}
          generating={generating}
          onGenerate={generateReport}
          onClearToday={clearToday}
        />

        <HistoryPanel history={history} date={date} onSelectDate={setDate} onSave={generateReport} saving={generating} />
      </div>
      <Footer />
    </div>
  );
}
