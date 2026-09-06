import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App"
import { WebSocketProvider } from "./context/WebSocketContext"

const rootElement = document.getElementById("root")

if (!rootElement) {
  throw new Error("Root element was not found")
}

createRoot(rootElement).render(
  <StrictMode>
    <WebSocketProvider
      url={import.meta.env.VITE_WS_URL || "ws://localhost:8080/ws"}
    >
      <App />
    </WebSocketProvider>
  </StrictMode>,
)
