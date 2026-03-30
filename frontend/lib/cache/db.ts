import type { SensorReading } from '@/types'

const DB_NAME    = 'simon-movilidad'
const DB_VERSION = 1

// abre (o crea) la base de datos IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result

      // store para lecturas de sensores (por vehicle_id)
      if (!db.objectStoreNames.contains('readings')) {
        const store = db.createObjectStore('readings', { keyPath: 'id' })
        store.createIndex('vehicle_id', 'vehicle_id', { unique: false })
        store.createIndex('recorded_at', 'recorded_at', { unique: false })
      }

      // store para alertas
      if (!db.objectStoreNames.contains('alerts')) {
        db.createObjectStore('alerts', { keyPath: 'id' })
      }
    }

    req.onsuccess = () => resolve(req.result)
    req.onerror   = () => reject(req.error)
  })
}

// guarda un array de registros en un store
export async function saveToCache<T>(storeName: string, items: T[]): Promise<void> {
  const db = await openDB()
  const tx = db.transaction(storeName, 'readwrite')
  const store = tx.objectStore(storeName)
  items.forEach(item => store.put(item))
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror    = () => reject(tx.error)
  })
}

// obtiene todos los registros de un store
export async function getFromCache<T>(storeName: string): Promise<T[]> {
  const db = await openDB()
  const tx = db.transaction(storeName, 'readonly')
  const store = tx.objectStore(storeName)
  const req = store.getAll()
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result as T[])
    req.onerror   = () => reject(req.error)
  })
}

// obtiene lecturas filtradas por vehicle_id
export async function getReadingsByVehicle(vehicleId: string): Promise<SensorReading[]> {
  const db = await openDB()
  const tx = db.transaction('readings', 'readonly')
  const store = tx.objectStore('readings')
  const index = store.index('vehicle_id')
  const req   = index.getAll(vehicleId)
  return new Promise((resolve, reject) => {
    req.onsuccess = () => {
      // ordena por fecha y retorna los últimos 50
      const sorted = (req.result as SensorReading[])
        .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
        .slice(-50)
      resolve(sorted)
    }
    req.onerror = () => reject(req.error)
  })
}

// limpia registros viejos (más de 24h) para no llenar el storage
export async function pruneOldReadings(): Promise<void> {
  const db        = await openDB()
  const tx        = db.transaction('readings', 'readwrite')
  const store     = tx.objectStore('readings')
  const cutoff    = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const index     = store.index('recorded_at')
  const range     = IDBKeyRange.upperBound(cutoff)
  const req       = index.openCursor(range)

  req.onsuccess = (e) => {
    const cursor = (e.target as IDBRequest).result
    if (cursor) {
      cursor.delete()
      cursor.continue()
    }
  }
}