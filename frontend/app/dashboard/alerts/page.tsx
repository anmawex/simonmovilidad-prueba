import styles from "../dashboard.module.css";

export default function AlertsPage() {
  const alerts = [
    { type: "high", vehicle: "A123-B", message: "Bajo nivel de combustible", time: "hace 5 min", status: "Pendiente" },
    { type: "medium", vehicle: "C456-D", message: "Exceso de velocidad (95 km/h)", time: "hace 22 min", status: "Revisado" },
    { type: "low", vehicle: "E789-F", message: "Puerta trasera mal cerrada", time: "hace 1 hora", status: "Pendiente" },
  ];

  return (
    <div className={styles.alertsContainer}>
      <h2 style={{ marginBottom: "1.5rem" }}>Panel de Alertas (Admin)</h2>
      <div className={`${styles.card} glass-card`} style={{ padding: "1.5rem" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", color: "var(--foreground)" }}>
          <thead>
            <tr style={{ textAlign: "left", fontSize: "0.875rem", color: "var(--muted-foreground)", borderBottom: "1px solid var(--border)" }}>
              <th style={{ padding: "0.75rem 0.5rem" }}>Gravedad</th>
              <th style={{ padding: "0.75rem 0.5rem" }}>Vehículo</th>
              <th style={{ padding: "0.75rem 0.5rem" }}>Mensaje</th>
              <th style={{ padding: "0.75rem 0.5rem" }}>Tiempo</th>
              <th style={{ padding: "0.75rem 0.5rem" }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid var(--border)", fontSize: "0.875rem" }}>
                <td style={{ padding: "1rem 0.5rem" }}>
                  <span style={{ 
                    padding: "0.25rem 0.5rem", 
                    borderRadius: "0.25rem", 
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    backgroundColor: alert.type === 'high' ? 'rgba(239, 68, 68, 0.1)' : alert.type === 'medium' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                    color: alert.type === 'high' ? '#ef4444' : alert.type === 'medium' ? '#f59e0b' : '#3b82f6'
                  }}>
                    {alert.type.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: "1rem 0.5rem", fontWeight: 600 }}>{alert.vehicle}</td>
                <td style={{ padding: "1rem 0.5rem" }}>{alert.message}</td>
                <td style={{ padding: "1rem 0.5rem", color: "var(--muted-foreground)" }}>{alert.time}</td>
                <td style={{ padding: "1rem 0.5rem" }}>{alert.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
