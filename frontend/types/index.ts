/**
 * TypeScript definitions and interfaces for the project.
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

export interface Vehicle {
  id: string;
  name: string;
  plate: string;
  latitude: number;
  longitude: number;
  speed: number;
  fuel: number;
  status: "online" | "offline";
  lastUpdate: string;
}

export interface TelemetryData {
  vehicleId: string;
  timestamp: string;
  payload: Record<string, any>;
}

export interface Alert {
  id: string;
  type: "high" | "medium" | "low";
  vehicleId: string;
  message: string;
  time: string;
  status: "pending" | "resolved";
}
