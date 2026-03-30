import styles from "./login.module.css";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className={styles.loginContainer}>
      <div className={`${styles.card} glass-card`}>
        <h1 className={styles.title}>Simón Movilidad</h1>
        <p className={styles.subtitle}>Ingresa a tu cuenta para continuar</p>
        
        <form className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Correo Electrónico</label>
            <input 
              type="email" 
              placeholder="nombre@ejemplo.com" 
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Contraseña</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className={styles.input}
            />
          </div>
          <Link href="/dashboard" className={styles.button}>
            Iniciar Sesión
          </Link>
        </form>
        
        <div className={styles.footer}>
          ¿No tienes una cuenta? <Link href="#" style={{color: "var(--primary)"}}>Contáctanos</Link>
        </div>
      </div>
    </div>
  );
}
