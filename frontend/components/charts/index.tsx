"use client";

import React from "react";

interface ChartProps {
  title: string;
  data: unknown[];
  type: "line" | "bar" | "pie";
}

export const TelemetryChart: React.FC<ChartProps> = ({ title, data, type }) => {
  return (
    <div className="chart-container">
      <h3>{title}</h3>
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--muted-foreground)" }}>
          {type.toUpperCase()} Chart Placeholder for {data.length} data points.
        </p>
      </div>
    </div>
  );
};
