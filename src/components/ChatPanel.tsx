import { FormEvent, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import type { ChatMessage } from "../hooks/use-agent-service"

interface ChatPanelProps {
  isFullScreen: boolean
  chatHistory: ChatMessage[]
  currentReply: string
  isGenerating: boolean
  canSendMessage: boolean
  onSend: (prompt: string) => void
  onInterrupt: () => void
}

const formatToolValue = (value: unknown) => {
  if (typeof value === "string") return value
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

export function ChatPanel({
  isFullScreen,
  chatHistory,
  currentReply,
  isGenerating,
  canSendMessage,
  onSend,
  onInterrupt,
}: ChatPanelProps) {
  const [prompt, setPrompt] = useState("")

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const nextPrompt = prompt.trim()
    if (!nextPrompt || isGenerating || !canSendMessage) return
    onSend(nextPrompt)
    setPrompt("")
  }

  const lastMessage = chatHistory[chatHistory.length - 1]
  const shouldRenderCurrentReply = lastMessage?.role !== "agent"

  return (
    <div
      className={`min-h-0 min-w-0 h-full flex flex-col relative bg-[#09090B] ${isFullScreen ? "w-full" : "w-1/2 border-l border-white/5"}`}
    >
      <div className="min-h-0 flex-1 overflow-y-auto p-8 pb-32 flex flex-col gap-10">
        {chatHistory.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={message.role === "user" ? "flex flex-col items-end gap-2" : "flex gap-4 max-w-[90%]"}
          >
            {message.role === "tool" ? (
              <details className="ml-12 max-w-[90%] rounded-lg border border-white/10 bg-white/[0.03] text-xs text-neutral-400">
                <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-neutral-300 transition-colors hover:bg-white/[0.04] [&::-webkit-details-marker]:hidden">
                  <span className="text-neutral-500">▸</span>
                  <span className="font-medium">工具调用</span>
                  <span className="font-mono text-sky-300/80">{message.name}</span>
                  {message.result === undefined && !message.error && (
                    <span className="ml-auto text-neutral-500">执行中...</span>
                  )}
                  {(message.result !== undefined || message.error) && (
                    <span className={`ml-auto ${message.error ? "text-red-300/80" : "text-emerald-300/80"}`}>
                      {message.error ? "失败" : "已完成"}
                    </span>
                  )}
                </summary>
                <div className="space-y-3 border-t border-white/10 px-4 py-3">
                  <div>
                    <div className="mb-1 text-neutral-500">输入</div>
                    <pre className="overflow-x-auto whitespace-pre-wrap rounded bg-black/20 p-2 font-mono text-neutral-300">
                      {formatToolValue(message.input)}
                    </pre>
                  </div>
                  {(message.result !== undefined || message.error) && (
                    <div>
                      <div className="mb-1 text-neutral-500">
                        {message.error ? "错误" : "结果"}
                      </div>
                      <pre className={`overflow-x-auto whitespace-pre-wrap rounded bg-black/20 p-2 font-mono ${message.error ? "text-red-300" : "text-neutral-300"}`}>
                        {message.error || formatToolValue(message.result)}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            ) : message.role === "user" ? (
              <div className="bg-neutral-800 text-white px-5 py-3 rounded-2xl rounded-tr-sm max-w-[85%] text-sm leading-relaxed shadow-sm [&_a]:text-sky-400 [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-neutral-500 [&_blockquote]:pl-4 [&_code]:rounded [&_code]:bg-black/30 [&_code]:px-1 [&_code]:py-0.5 [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-black/40 [&_pre]:p-3 [&_pre_code]:bg-transparent [&_h1]:mb-3 [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-semibold [&_hr]:my-4 [&_li]:ml-4 [&_li]:list-disc [&_ol]:my-2 [&_p]:my-2 [&_table]:my-3 [&_table]:w-full [&_td]:border [&_td]:border-neutral-700 [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-neutral-700 [&_th]:bg-neutral-700/60 [&_th]:px-2 [&_th]:py-1">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {message.text}
                </ReactMarkdown>
              </div>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center text-xs font-bold font-serif shrink-0">
                  AI
                </div>
                <div className="flex-1 pt-1 border-l-[3px] border-neutral-700/80 pl-6 py-1 text-sm leading-relaxed text-neutral-300 [&_a]:text-sky-400 [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-neutral-500 [&_blockquote]:pl-4 [&_code]:rounded [&_code]:bg-black/30 [&_code]:px-1 [&_code]:py-0.5 [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-black/40 [&_pre]:p-3 [&_pre_code]:bg-transparent [&_h1]:mb-3 [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-semibold [&_hr]:my-4 [&_li]:ml-4 [&_li]:list-disc [&_ol]:my-2 [&_p]:my-2 [&_table]:my-3 [&_table]:w-full [&_td]:border [&_td]:border-neutral-700 [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-neutral-700 [&_th]:bg-neutral-700/60 [&_th]:px-2 [&_th]:py-1">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {message.text}
                  </ReactMarkdown>
                </div>
              </>
            )}
          </div>
        ))}
        {(isGenerating || currentReply) && shouldRenderCurrentReply && (
          <div className="flex gap-4 max-w-[90%]">
            <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center text-xs font-bold font-serif shrink-0">
              AI
            </div>
            <div className="flex-1 pt-1 border-l-[3px] border-neutral-700/80 pl-6 py-1 text-sm leading-relaxed text-neutral-300">
              {isGenerating && !currentReply && (
                <div className="mb-2 animate-pulse text-xs text-neutral-500">正在思考</div>
              )}
              {currentReply && (
                <div className="[&_a]:text-sky-400 [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-neutral-500 [&_blockquote]:pl-4 [&_code]:rounded [&_code]:bg-black/30 [&_code]:px-1 [&_code]:py-0.5 [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-black/40 [&_pre]:p-3 [&_pre_code]:bg-transparent [&_h1]:mb-3 [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-semibold [&_hr]:my-4 [&_li]:ml-4 [&_li]:list-disc [&_ol]:my-2 [&_p]:my-2 [&_table]:my-3 [&_table]:w-full [&_td]:border [&_td]:border-neutral-700 [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-neutral-700 [&_th]:bg-neutral-700/60 [&_th]:px-2 [&_th]:py-1">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {currentReply}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#09090B] via-[#09090B] to-transparent">
        <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto flex items-center bg-neutral-900 border border-neutral-800 rounded-2xl p-2 shadow-2xl focus-within:border-neutral-600 focus-within:ring-1 focus-within:ring-neutral-600 transition-all">
          <button className="p-3 text-neutral-500 hover:text-white transition-colors rounded-xl hover:bg-neutral-800">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>
          <input
            type="text"
            placeholder="继续追问..."
            value={prompt}
            disabled={!canSendMessage}
            onChange={(event) => setPrompt(event.target.value)}
            className="flex-1 bg-transparent border-none focus:outline-none text-white placeholder:text-neutral-600 text-sm px-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <button
            type={isGenerating ? "button" : "submit"}
            onClick={isGenerating ? onInterrupt : undefined}
            disabled={!canSendMessage}
            className="bg-white text-black px-4 py-2 rounded-xl text-sm font-medium hover:bg-neutral-200 transition-colors disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-500"
          >
            {!canSendMessage ? "已停止" : isGenerating ? "停止" : "发送"}
          </button>
        </form>
      </div>
    </div>
  )
}
