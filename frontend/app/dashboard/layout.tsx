import styles from "./dashboard.module.css";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebarLinks = [
    { href: "/dashboard", label: "General", icon: "📊" },
    { href: "/dashboard/map", label: "Mapa en Vivo", icon: "🗺️" },
    { href: "/dashboard/charts", label: "Histórico", icon: "📈" },
    { href: "/dashboard/alerts", label: "Alertas", icon: "🚨" },
  ];

  return (
    <div className={styles.layout}>
      <aside className={`${styles.sidebar} glass-card`}>
        <div className={styles.logo}>
          <span style={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--primary)" }}>Simón</span>
        </div>
        <nav className={styles.nav}>
          {sidebarLinks.map((link) => (
            <Link key={link.href} href={link.href} className={styles.navItem}>
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <Link href="/login" className={styles.logout}>
            Cerrar Sesión
          </Link>
        </div>
      </aside>
      
      <div className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <h2 className={styles.headerTitle}>Panel de Control</h2>
            <div className={styles.userInfo}>
              <div className={styles.avatar}>A</div>
              <span>Administrador</span>
            </div>
          </div>
        </header>
        <main className={styles.children}>
          {children}
        </main>
      </div>
    </div>
  );
}
