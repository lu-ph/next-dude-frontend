import { useEffect, useState, useCallback, useRef } from "react"
import { useWebSocket } from "../context/WebSocketContext"
import {
  AgentBackendToClientMessage,
  AgentMessageType,
} from "../types/agent-types"
import type { AgentInput } from "../types/agent-types"

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
  const { sendMessage, subscribe } = useWebSocket()
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])

  const [currentReply, setCurrentReply] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [canSendMessage, setCanSendMessage] = useState(true)
  const [sessionId, setSessionId] = useState<string | undefined>()
  const currentReplyRef = useRef("")
  const sessionIdRef = useRef<string | undefined>(undefined)
  const canReceiveMessagesRef = useRef(true)

  useEffect(() => {
    const handleMessage = (msg: AgentBackendToClientMessage | any) => {
      if (!msg.type.startsWith("agent:")) return
      if (!canReceiveMessagesRef.current) return

      switch (msg.type) {
        case AgentMessageType.SESSION_CREATED:
          sessionIdRef.current = msg.payload.sessionId
          setSessionId(msg.payload.sessionId)
          break

        case AgentMessageType.TEXT_DELTA:
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
          setIsGenerating(false)
          break
      }
    }

    return subscribe(handleMessage)
  }, [subscribe])

  const sendChatRequest = useCallback(
    (prompt: string, images: string[] = []) => {
      canReceiveMessagesRef.current = true
      setCanSendMessage(true)
      setChatHistory((prev) => [...prev, { role: "user", text: prompt }])
      sendMessage({
        type: AgentMessageType.CHAT_REQUEST,
        payload: {
          prompt,
          sessionId: sessionIdRef.current,
          images,
        },
      })
    },
    [sendMessage],
  )

  const createSession = useCallback(
    (input: AgentInput) => {
      canReceiveMessagesRef.current = true
      setCanSendMessage(true)
      setChatHistory((prev) => [...prev, { role: "user", text: input.prompt }])
      sendMessage({
        type: AgentMessageType.CREATE_SESSION,
        id: crypto.randomUUID(),
        payload: {
          prompt: input.prompt,
          pdf: input.pdf!,
          images: input.images || [],
        },
      })
    },
    [sendMessage],
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

  return {
    chatHistory,
    currentReply,
    isGenerating,
    canSendMessage,
    sessionId,
    createSession,
    sendChatRequest,
    interruptChat,
  }
}
