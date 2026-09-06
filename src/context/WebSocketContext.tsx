import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
} from "react"
import { BackendToClientMessage, ClientToBackendMessage } from "../types/types"

interface WebSocketContextValue {
  sendMessage: (msg: ClientToBackendMessage) => void
  subscribe: (handler: (msg: BackendToClientMessage) => void) => () => void
  isConnected: boolean
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null)

export const WebSocketProvider: React.FC<{
  url: string
  children: React.ReactNode
}> = ({ url, children }) => {
  const wsRef = useRef<WebSocket | null>(null)
  const [isConnected, setIsConnected] = React.useState(false)

  const listenersRef = useRef<Set<(msg: BackendToClientMessage) => void>>(
    new Set(),
  )

  useEffect(() => {
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => setIsConnected(true)
    ws.onclose = () => setIsConnected(false)
    ws.onmessage = (event) => {
      try {
        const message: BackendToClientMessage = JSON.parse(event.data)
        console.log("[WebSocket] Received:", message)
        listenersRef.current.forEach((listener) => listener(message))
      } catch (e) {
        console.error("Failed to parse WebSocket message", e)
      }
    }

    return () => ws.close()
  }, [url])

  const sendMessage = useCallback((msg: ClientToBackendMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log("[WebSocket] Sending:", msg)
      wsRef.current.send(JSON.stringify(msg))
    } else {
      console.warn("WebSocket is not connected")
    }
  }, [])

  const subscribe = useCallback(
    (handler: (msg: BackendToClientMessage) => void) => {
      listenersRef.current.add(handler)
      return () => listenersRef.current.delete(handler)
    },
    [],
  )

  return (
    <WebSocketContext.Provider value={{ sendMessage, subscribe, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export const useWebSocket = () => {
  const context = useContext(WebSocketContext)
  if (!context)
    throw new Error("useWebSocket must be used within WebSocketProvider")
  return context
}
