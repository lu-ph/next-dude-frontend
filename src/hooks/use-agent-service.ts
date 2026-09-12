import { useEffect, useState, useCallback, useRef } from "react"
import { useWebSocket } from "../context/WebSocketContext"
import {
  AgentBackendToClientMessage,
  AgentMessageType,
} from "../types/agent-types"
import type { AgentInput } from "../types/agent-types"

const getHttpBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL
  if (configuredUrl) return configuredUrl.replace(/\/$/, "")

  const websocketUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8080/ws"
  return websocketUrl.replace(/^ws/, "http").replace(/\/ws\/?$/, "")
}

export type ChatMessage =
  | { role: "user" | "agent"; text: string }
  | {
      role: "tool"
      id: string
      name: string
      input: Record<string, unknown>
      result?: unknown
      error?: string
    }

export const useAgentService = () => {
  const {
    sendMessage,
    subscribe,
    setSessionId: setWebSocketSessionId,
    connectSession,
  } = useWebSocket()
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])

  const [currentReply, setCurrentReply] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [canSendMessage, setCanSendMessage] = useState(true)
  const [sessionId, setSessionId] = useState<string | undefined>()
  const [error, setError] = useState<string | null>(null)
  const currentReplyRef = useRef("")
  const sessionIdRef = useRef<string | undefined>(undefined)
  const canReceiveMessagesRef = useRef(true)

  useEffect(() => {
    const handleMessage = (msg: AgentBackendToClientMessage | any) => {
      if (!msg.type.startsWith("agent:")) return
      if (!canReceiveMessagesRef.current) return

      switch (msg.type) {
        case AgentMessageType.SESSION_CREATED:
          setError(null)
          sessionIdRef.current = msg.payload.sessionId
          setSessionId(msg.payload.sessionId)
          break

        case AgentMessageType.TEXT_DELTA:
          setError(null)
          setIsGenerating(true)
          currentReplyRef.current += msg.payload.text
          const nextReply = currentReplyRef.current
          setCurrentReply(nextReply)
          setChatHistory((prev) => {
            const lastMessage = prev[prev.length - 1]
            if (lastMessage?.role === "agent") {
              return [...prev.slice(0, -1), { ...lastMessage, text: nextReply }]
            }
            return [...prev, { role: "agent", text: nextReply }]
          })
          break

        case AgentMessageType.TOOL_CALL:
          setIsGenerating(true)
          setChatHistory((prev) => [
            ...prev,
            {
              role: "tool",
              id: msg.payload.id,
              name: msg.payload.name,
              input: msg.payload.input,
            },
          ])
          break

        case AgentMessageType.TOOL_RESULT:
          setChatHistory((prev) =>
            prev.map((message) =>
              message.role === "tool" && message.id === msg.payload.id
                ? {
                    ...message,
                    result: msg.payload.result,
                    error: msg.payload.error,
                  }
                : message,
            ),
          )
          break

        case AgentMessageType.FINAL:
          setIsGenerating(false)
          const finalReply = currentReplyRef.current
          if (finalReply) {
            setChatHistory((prev) => {
              const lastMessage = prev[prev.length - 1]
              if (lastMessage?.role === "agent") return prev
              return [...prev, { role: "agent", text: finalReply }]
            })
          }
          currentReplyRef.current = ""
          setCurrentReply("")
          break

        case AgentMessageType.ERROR:
          console.error("Agent Error:", msg.payload.error)
          setError(msg.payload.error)
          setIsGenerating(false)
          break
      }
    }

    return subscribe(handleMessage)
  }, [subscribe])

  const sendChatRequest = useCallback(
    (prompt: string, images: string[] = []) => {
      canReceiveMessagesRef.current = true
      setError(null)
      setIsGenerating(true)
      setCanSendMessage(true)
      setChatHistory((prev) => [...prev, { role: "user", text: prompt }])
      sendMessage({
        type: AgentMessageType.CHAT_REQUEST,
        payload: {
          prompt,
          sessionId: sessionIdRef.current!,
          images,
        },
      })
    },
    [sendMessage],
  )

  const createSession = useCallback(
    async (input: AgentInput) => {
      canReceiveMessagesRef.current = true
      setError(null)
      setCanSendMessage(true)
      const headers: HeadersInit = input.pdf
        ? {
            "Content-Type": "application/pdf",
            "X-Filename": encodeURIComponent(input.pdf.name),
          }
        : {}
      const response = await fetch(`${getHttpBaseUrl()}/createsession`, {
        method: "POST",
        headers,
        body: input.pdf,
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(`Session creation failed (${response.status}): ${message}`)
      }

      const result = (await response.json()) as { sessionId?: string }
      if (!result.sessionId) {
        throw new Error("Session creation response did not include sessionId")
      }

      sessionIdRef.current = result.sessionId
      setSessionId(result.sessionId)
      setWebSocketSessionId(result.sessionId)
      return result.sessionId
    },
    [setWebSocketSessionId],
  )

  const interruptChat = useCallback(() => {
    canReceiveMessagesRef.current = false
    setCanSendMessage(false)
    setIsGenerating(false)
    currentReplyRef.current = ""
    setCurrentReply("")
    sendMessage({
      type: AgentMessageType.CHAT_INTERRUPT,
      payload: { reason: "User triggered interrupt" },
    })
  }, [sendMessage])

  const reportError = useCallback((message: string) => {
    setError(message)
    setIsGenerating(false)
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return {
    chatHistory,
    currentReply,
    isGenerating,
    canSendMessage,
    sessionId,
    error,
    reportError,
    clearError,
    createSession,
    connectSession,
    sendChatRequest,
    interruptChat,
  }
}
