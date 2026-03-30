"use client";

import React from "react";
import { Alert } from "@/types";

interface AlertPanelProps {
  alerts: Alert[];
  onResolve: (id: string) => void;
}

export const AlertPanel: React.FC<AlertPanelProps> = ({ alerts, onResolve }) => {
  return (
    <div className="alert-panel-container">
      {alerts.length === 0 ? (
        <p style={{ textAlign: "center", color: "var(--muted-foreground)" }}>
          No hay alertas pendientes.
        </p>
      ) : (
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {alerts.map((alert) => (
            <li key={alert.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
              <div>
                <strong>{alert.vehicle_id}:</strong> {alert.message}
              </div>
              <button 
                onClick={() => onResolve(alert.id)}
                style={{ color: "var(--primary)", fontSize: "0.875rem", fontWeight: 600 }}
              >
                Resolver
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
