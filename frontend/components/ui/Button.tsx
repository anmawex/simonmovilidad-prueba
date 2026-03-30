import React from "react";
import styles from "./ui.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = "primary", 
  size = "md", 
  isLoading,
  className = "",
  ...props 
}) => {
  const variantClass = styles[variant];
  const sizeClass = styles[size];
  
  return (
    <button 
      className={`${styles.button} ${variantClass} ${sizeClass} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? "Cargando..." : children}
    </button>
  );
};
