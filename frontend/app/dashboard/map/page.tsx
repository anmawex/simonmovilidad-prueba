'use client'

import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'

// MapLibre necesita el DOM — se carga solo en el cliente
const LiveMap = dynamic(() => import('@/components/map/LiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-gray-400">
      Cargando mapa...
    </div>
  ),
})

export default function MapPage() {
  const [isSimulating, setIsSimulating] = useState(false)
  const simulationRef = useRef<NodeJS.Timeout | null>(null)
  
  // guardamos las coordenadas y fuel en ref para que el intervalo pueda leerlas/mutarlas sin recrear el useEffect
  const simData = useRef({ lat: 8.7479, lon: -75.8814, fuel: 30 })

  const sendReading = async (lat: number, lon: number, fuel: number) => {
    const token = localStorage.getItem('token')
    if (!token) {
      console.error('No hay token para simular')
      return
    }

    try {
      await fetch('http://localhost:8080/api/sensors/readings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vehicle_id: 'V-101',
          latitude: lat,
          longitude: lon,
          speed: 40 + Math.random() * 40,
          fuel_level: fuel,
          temperature: 24 + Math.random() * 5
        })
      })
    } catch (err) {
      console.error('Error enviando telemetría simulada', err)
    }
  }

  const resetSimulation = async () => {
    simData.current = { lat: 8.7479, lon: -75.8814, fuel: 30 }
    // envia inmediatamente la coordenada de reseteo para que el mapa reaccione 
    await sendReading(8.7479, -75.8814, 30)
  }

  const toggleSimulation = () => {
    if (isSimulating) {
      if (simulationRef.current) clearInterval(simulationRef.current)
      setIsSimulating(false)
      return
    }

    setIsSimulating(true)

    simulationRef.current = setInterval(async () => {
      // modificamos datos actuales
      simData.current.lat += (Math.random() - 0.2) * 0.005 
      simData.current.lon += (Math.random() - 0.5) * 0.005 
      simData.current.fuel -= Math.random() * 2 // consumo rápido para la prueba
      if (simData.current.fuel < 0) simData.current.fuel = 0

      await sendReading(simData.current.lat, simData.current.lon, simData.current.fuel)
    }, 2000) // 2 segundos
  }

  // cleanup simulation on unmount
  useEffect(() => {
    return () => {
      if (simulationRef.current) clearInterval(simulationRef.current)
    }
  }, [])

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Mapa en vivo</h1>
        <div className="flex items-center gap-3">
          <button 
            onClick={resetSimulation}
            className="px-4 py-2 rounded-lg text-sm font-bold bg-secondary border border-border hover:bg-muted text-foreground transition-colors"
          >
            🔄 Restablecer 100%
          </button>
          
          <button 
            onClick={toggleSimulation}
            className={`px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-colors ${
              isSimulating 
              ? 'bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500/30' 
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {isSimulating ? '🛑 Detener Simulación' : '▶️ Simular Vehículo (V-101)'}
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-[500px] border border-border/50 rounded-xl overflow-hidden glass-card">
        <LiveMap />
      </div>
    </div>
  )
}