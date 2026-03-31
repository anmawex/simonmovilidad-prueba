'use client'

import { useEffect, useRef, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useWebSocket } from '@/hooks/useWebSocket'
import type { SensorReading, WSMessage } from '@/types'

export default function LiveMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<maplibregl.Map | null>(null)
  const markersRef   = useRef<Record<string, maplibregl.Marker>>({})

  const upsertMarker = useCallback((reading: SensorReading) => {
    const { vehicle_id, latitude, longitude, fuel_level, fuel_autonomy, speed } = reading
    const map = mapRef.current
    if (!map) return

    const targetColor = fuel_autonomy < 1.0 ? '#ef4444' : '#3b82f6'

    if (markersRef.current[vehicle_id]) {
      // mueve el marker existente
      const marker = markersRef.current[vehicle_id]
      marker.setLngLat([longitude, latitude])
      
      // MapLibre default markers are SVGs. We dynamically change the fill.
      const el = marker.getElement()
      const paths = el.querySelectorAll('path, g[fill], circle')
      paths.forEach(p => {
        const fill = p.getAttribute('fill')
        if (fill && fill !== 'none' && fill !== '#ffffff' && fill !== 'white') {
           p.setAttribute('fill', targetColor)
        }
      })

    } else {
      // crea un marker nuevo con popup
      const popup = new maplibregl.Popup({ offset: 25 })

      const marker = new maplibregl.Marker({ color: targetColor })
        .setLngLat([longitude, latitude])
        .setPopup(popup)
        .addTo(map)

      markersRef.current[vehicle_id] = marker
    }

    // actualiza el popup con los datos más recientes
    const marker = markersRef.current[vehicle_id]
    marker.getPopup()?.setHTML(`
      <div style="font-size:13px;line-height:1.6;color:#000">
        <strong>Vehículo: ${vehicle_id}</strong><br/>
        Velocidad: ${speed.toFixed(1)} km/h<br/>
        Autonomía: ${fuel_autonomy.toFixed(1)}h<br/>
        ${fuel_autonomy < 1.0 ? '<span style="color:#ef4444;font-weight:bold">⚠ Autonomía crítica</span>' : ''}
      </div>
    `)
  }, [])

  // inicializa el mapa una sola vez
  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [-75.8814, 8.7479], 
      zoom: 6,
    })

    mapRef.current = map
    map.addControl(new maplibregl.NavigationControl(), 'top-right')

    return () => {
      setTimeout(() => { map.remove() }, 0)
      mapRef.current = null
    }
  }, [])

  // carga inicial de datos históricos (última ubicación conocida)
  useEffect(() => {
    async function loadLatest() {
      const token = localStorage.getItem('token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      if (!token || !apiUrl || !mapRef.current) return

      try {
        const response = await fetch(`${apiUrl}/api/sensors/latest`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.ok) {
          const readings: SensorReading[] = await response.json()
          readings.forEach(upsertMarker)
        }
      } catch (err) {
        console.error('Error cargando ubicaciones iniciales:', err)
      }
    }

    // esperar un momento a que el mapa esté listo
    const t = setTimeout(loadLatest, 1000)
    return () => clearTimeout(t)
  }, [upsertMarker])

  // maneja mensajes del WebSocket
  const handleMessage = useCallback((msg: WSMessage) => {
    if (msg.event === 'sensor_reading') {
      upsertMarker(msg.payload as SensorReading)
    }
  }, [upsertMarker])

  useWebSocket(handleMessage)

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-xl overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0 z-0" />

      {/* leyenda */}
      <div className="absolute bottom-6 right-6 bg-secondary/90 border border-border rounded-lg shadow-xl px-4 py-3 text-xs space-y-2 z-10 backdrop-blur-md">
        <h4 className="font-bold text-foreground mb-1 uppercase tracking-wider">Estado Flota</h4>
        <div className="flex items-center gap-2 text-foreground font-medium">
          <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
          Activo y en Movimiento
        </div>
        <div className="flex items-center gap-2 text-foreground font-medium">
          <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
          Autonomía &lt; 1 hora
        </div>
      </div>
    </div>
  )
}