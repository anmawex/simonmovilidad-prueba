import styles from "../dashboard.module.css";

export default function ChartsPage() {
  return (
    <div className={styles.chartsContainer}>
      <h2 style={{ marginBottom: "1.5rem" }}>Gráficos Históricos de Telemetría</h2>
      <div className={styles.dashboardGrid}>
        <div className={`${styles.card} glass-card`} style={{ minHeight: "300px" }}>
          <h3 className={styles.cardTitle}>Promedio de Velocidad Semanal</h3>
          <p style={{ color: "var(--muted-foreground)" }}>Gráficos de Chart.js se renderizarán aquí.</p>
        </div>
        <div className={`${styles.card} glass-card`} style={{ minHeight: "300px" }}>
          <h3 className={styles.cardTitle}>Estado de Batería y Sensores</h3>
          <p style={{ color: "var(--muted-foreground)" }}>Gráficos históricos en desarrollo.</p>
        </div>
      </div>
    </div>
  );
}
