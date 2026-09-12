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
            AI 的能力越来越强，用 AI 学习已经变成了很多人默认的学习方式。
            不过，看起来 AI 解答的效果并不比老师的真人讲解效果好。
          </p>

          <p>
            我很多次看到身边的人打开 Gemini
            或豆包，上传了作业，输入了零星几个字的提示词， 然后枯燥地对着 AI 在
            5 秒内生成的、大段的、还带有 emoji 的解释盯半天，
            最后依旧似懂非懂，就跳过这道题，也懒得再追问。
          </p>

          <p>
            AI 已经足够聪明，它应该完全有能力把问题讲清楚。而那些同学也绝对有足够的理解能力搞懂知识本身。也许问题不在能力，而在方式。
          </p>

          <p>
            对比一个老师和一个没有特别设计 Prompt 的 AI，后者有几个明显的不足：
          </p>

          <ul className="list-disc pl-5 space-y-1 text-neutral-300/90 marker:text-neutral-500">
            <li>AI 在几秒内就吐出全部解答，学生很容易来不及跟上</li>
            <li>所有解释一次性列出来，读起来很枯燥，也抓不住重点</li>
            <li>直接告诉你答案，没法引导你主动思考</li>
            <li>它不会问你问题，也就无法根据你的反馈调整讲解方式</li>
          </ul>

          <p>
            所以我糊了一个网页，用更好的交互方式让学生搞懂一个概念，看看效果是不是会更好。
          </p>
        </div>
      </article>
    </main>
  )
}
