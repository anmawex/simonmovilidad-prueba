'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { WSMessage } from '@/types'

type MessageHandler = (msg: WSMessage) => void

export function useWebSocket(onMessage: MessageHandler) {
  const wsRef      = useRef<WebSocket | null>(null)
  const handlerRef = useRef(onMessage)

  // mantiene el handler actualizado sin reconectar
  useEffect(() => {
    handlerRef.current = onMessage
  }, [onMessage])

  const connect = useCallback(function setup() {
    const url = process.env.NEXT_PUBLIC_WS_URL || ''
    if (!url) {
      console.warn('WS error: NEXT_PUBLIC_WS_URL no está definida')
      return
    }

    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => console.log('WS conectado')

    ws.onmessage = (e) => {
      try {
        const msg: WSMessage = JSON.parse(e.data)
        handlerRef.current(msg)
      } catch {
        console.warn('WS mensaje inválido:', e.data)
      }
    }

    ws.onclose = () => {
      // solo reconectar si el WebSocket actual sigue siendo el de la referencia
      // (evita reconectar tras un unmount o si se inició otra conexión)
      if (wsRef.current === ws) {
        console.log('WS desconectado, reconectando en 3s...')
        setTimeout(setup, 3000) // reconexión automática
      }
    }

    ws.onerror = () => console.warn('WS error: No se pudo conectar (¿el backend de Go está corriendo?)')
  }, [])

  useEffect(() => {
    connect()
    return () => {
      const ws = wsRef.current
      wsRef.current = null // marcamos como cerrado intencionalmente
      ws?.close()
    }
  }, [connect])
}