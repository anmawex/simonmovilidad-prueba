import styles from "../dashboard.module.css";

export default function MapPage() {
  return (
    <div className={styles.mapContainer}>
      <h2 style={{ marginBottom: "1rem" }}>Mapa en Tiempo Real</h2>
      <div className={`${styles.card} glass-card`} style={{ 
        height: "calc(100vh - 12rem)", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        backgroundColor: "var(--secondary)" 
      }}>
        <div style={{ textAlign: "center" }}>
          <span style={{ fontSize: "3rem", display: "block" }}>🗺️</span>
          <p style={{ marginTop: "1rem", color: "var(--muted-foreground)" }}>
            El mapa interactivo se cargará aquí usando MapLibre GL JS.
          </p>
        </div>
      </div>
    </div>
  );
}
