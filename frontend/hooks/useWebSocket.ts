'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { WSMessage } from '@/types'

type MessageHandler = (msg: WSMessage) => void

export function useWebSocket(onMessage: MessageHandler) {
  const wsRef = useRef<WebSocket | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const handlerRef = useRef(onMessage)

  useEffect(() => {
    handlerRef.current = onMessage
  }, [onMessage])

  const connect = useCallback(function setup() {
    const url = process.env.NEXT_PUBLIC_WS_URL || ''
    if (!url) return

    // Limpiar restos anteriores
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (wsRef.current) {
        const oldWs = wsRef.current
        wsRef.current = null // nos desvinculamos antes de cerrar
        oldWs.close()
    }

    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      if (wsRef.current === ws) {
        console.log('✅ WS conectado')
      }
    }

    ws.onmessage = (e) => {
      if (wsRef.current === ws) {
        try {
          const msg: WSMessage = JSON.parse(e.data)
          handlerRef.current(msg)
        } catch (err) {
          console.warn('WS mensaje inválido', err)
        }
      }
    }

    ws.onclose = () => {
      // Solo reconectar si este es el WS activo que se cerró por fallo, no por limpieza
      if (wsRef.current === ws) {
        console.log('WS desconectado involuntariamente, reconectando en 3s...')
        timeoutRef.current = setTimeout(setup, 3000)
      }
    }

    ws.onerror = () => {
      // Solo avisar error si este WS sigue siendo el principal
      if (wsRef.current === ws) {
        console.warn('WS error: No se pudo conectar (¿el backend de Go está corriendo?)')
      }
    }
  }, [])

  useEffect(() => {
    connect()
    return () => {
      const currentWs = wsRef.current
      wsRef.current = null // marcar como cierre intencionado
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      currentWs?.close()
    }
  }, [connect])
}