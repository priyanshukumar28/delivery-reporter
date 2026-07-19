import styles from "../styles/dashboard.module.css";
import { DocIcon, BoltIcon, LayersIcon, BugIcon, SparkIcon, ClockAlertIcon } from "./icons.jsx";

export default function MetricStrip({ requirements, deliveries, delays = [] }) {
  const modules = new Set([...requirements, ...deliveries].map(i => i.module).filter(Boolean)).size;
  const bugFixes = deliveries.filter(d => d.type === "Bug Fix").length;
  const features = deliveries.filter(d => d.type === "Feature").length;
  const flagged = delays.filter(d => d.status === "Delayed" || d.status === "At Risk").length;

  const tiles = [
    { label: "Total Requirements Received", value: requirements.length, icon: <DocIcon /> },
    { label: "Total Deliveries Completed", value: deliveries.length, icon: <BoltIcon /> },
    { label: "Number of Modules Worked On", value: modules, icon: <LayersIcon /> },
    { label: "Number of Bug Fixes", value: bugFixes, icon: <BugIcon /> },
    { label: "Number of Features Delivered", value: features, icon: <SparkIcon /> },
    { label: "Delayed / At Risk Items", value: flagged, icon: <ClockAlertIcon /> }
  ];

  return (
    <div className={styles.metricStrip}>
      {tiles.map(tile => (
        <div className={styles.metricTile} key={tile.label}>
          <div className={styles.metricValue}>{tile.value}</div>
          <div className={styles.metricLabel}>
            <span className={styles.metricIcon}>{tile.icon}</span>
            {tile.label}
          </div>
        </div>
      ))}
    </div>
  );
}