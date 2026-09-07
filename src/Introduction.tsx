import { useEffect, useRef } from "react"

export default function Introduction() {
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual"
    }

    if (mainRef.current) {
      mainRef.current.scrollTop = 0
    }
  }, [])

  return (
    <main className="h-full overflow-y-auto bg-[#09090B] text-neutral-300 selection:bg-white/20 font-sans antialiased">
      <article className="mx-auto w-full max-w-[680px] px-6 py-16 sm:px-8 sm:py-24">
        <h1 className="mb-10 text-2xl sm:text-3xl font-semibold tracking-tight text-white">
          这个网页做什么？
        </h1>

        <div className="space-y-10 text-[19px] sm:text-[18px] leading-[2] text-neutral-300/90 font-normal">
          <p>
            AI 的能力越来越强，使用 AI 来学习已经变成了很多人默认的学习方式。
						但是 AI 解答的效果似乎并不比老师的真人解答效果好。
          </p>

          <p>
            我很多次看到身边的人打开 Gemini 或豆包，上传了作业，输入了零星几个字的提示词，
						然后枯燥地对着 AI 在 5 秒内生成的、大段的、还带有 emoji 的解释盯半天，
						最后依旧似懂非懂，跳过了这一题，也懒得继续打字追问。
          </p>

          <p>
            AI 已经足够聪明，相当于一个博士。AI
            应该有能力将一个问题解答得很好，那些同学也绝对有完全足够的能力理解问题。也许这只是方式的问题？
          </p>

          <p>
            对比一个老师和一个没有特定 Prompt 的 AI，我找到了后者的一些缺点：
          </p>

          <ul className="list-disc pl-5 space-y-1 text-neutral-300/90 marker:text-neutral-500">
            <li>AI 在 5 秒内吐出所有解答，容易来不及跟上</li>
            <li>AI 一次性列出所有解释，这样读起来非常枯燥，且找不到重点</li>
            <li>AI 直接告诉你答案，那就没法引导你主动思考</li>
            <li>AI 不会问你问题，它就没法接受你的反馈，从而调整解答方式</li>
          </ul>

          <p>
            所以我糊了一个网页，尝试用更好的交互方式让学生搞懂一个概念，看看效果是不是会更好。
          </p>
        </div>
      </article>
    </main>
  )
}
