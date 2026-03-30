export interface User {
  user_id: string
  email: string
  role: 'admin' | 'user'
  exp: number
}

export interface Vehicle {
  id: string
  device_id: string  // enmascarado para no-admins
  name: string
}

export interface SensorReading {
  id: string
  vehicle_id: string
  latitude: number
  longitude: number
  speed: number
  fuel_level: number
  fuel_autonomy: number
  temperature: number
  recorded_at: string
}

export interface Alert {
  id: string
  vehicle_id: string
  type: string
  message: string
  resolved: boolean
  created_at: string
}

export interface WSMessage {
  event: 'sensor_reading' | 'alert'
  payload: SensorReading | Alert
}