import styles from "./dashboard.module.css";

export default function DashboardPage() {
  const stats = [
    { title: "Vehículos en Línea", value: "84", change: "+12% vs ayer", positive: true },
    { title: "Alertas Activas", value: "3", change: "-25% vs ayer", positive: true },
    { title: "Combustible Promedio", value: "48%", change: "-5% vs ayer", positive: false },
    { title: "Velocidad Promedio", value: "24 km/h", change: "+2 km/h vs ayer", positive: true },
  ];

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardGrid}>
        {stats.map((stat, idx) => (
          <div key={idx} className={`${styles.card} glass-card`}>
            <div className={styles.cardTitle}>{stat.title}</div>
            <div className={styles.mainStat}>{stat.value}</div>
            <div className={`${styles.statChange} ${stat.positive ? styles.up : styles.down}`}>
              {stat.positive ? "↑" : "↓"} {stat.change}
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: "2rem" }}>
        <div className={`${styles.card} glass-card`} style={{ padding: "2rem", minHeight: "300px" }}>
          <h3 style={{ marginBottom: "1rem" }}>Actividad Reciente</h3>
          <p style={{ color: "var(--muted-foreground)" }}>No hay actividad reciente en la flota.</p>
        </div>
      </div>
    </div>
  );
}
