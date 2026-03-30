import type { Vehicle, Alert } from '@/types'

const KEYS = {
  vehicles : 'cache:vehicles',
  alerts   : 'cache:alerts',
  lastSync : 'cache:lastSync',
}

export const simpleCache = {
  saveVehicles(vehicles: Vehicle[]) {
    localStorage.setItem(KEYS.vehicles, JSON.stringify(vehicles))
  },
  getVehicles(): Vehicle[] {
    try {
      return JSON.parse(localStorage.getItem(KEYS.vehicles) ?? '[]')
    } catch { return [] }
  },

  saveAlerts(alerts: Alert[]) {
    localStorage.setItem(KEYS.alerts, JSON.stringify(alerts))
  },
  getAlerts(): Alert[] {
    try {
      return JSON.parse(localStorage.getItem(KEYS.alerts) ?? '[]')
    } catch { return [] }
  },

  setLastSync() {
    localStorage.setItem(KEYS.lastSync, new Date().toISOString())
  },
  getLastSync(): string | null {
    return localStorage.getItem(KEYS.lastSync)
  },
}