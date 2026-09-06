import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"
import * as pdfjsLib from "pdfjs-dist"
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url"
import { PDFPage } from "./PDFPage"
import { PDFToolbar } from "./PDFToolbar"

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

interface FileViewerProps {
  files: File[]
}

export interface FileViewerHandle {
  loadFromBase64: (buffer: string) => void
  scrollToPage: (pageNum: number) => Promise<void>
  nextPage: () => Promise<void>
  previousPage: () => Promise<void>
  getCurrentPage: () => number
  getCurrentViewBase64: () => string
}

export const FileViewer = forwardRef<FileViewerHandle, FileViewerProps>(
  function FileViewer({ files }, ref) {
  // 状态管理
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null)
  const [pageNum, setPageNum] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [scale, setScale] = useState(1.2) // 默认缩放倍率
  const pageNumRef = useRef(1)
  const totalPagesRef = useRef(0)
  const pdfScrollRef = useRef<HTMLDivElement>(null)
  const pageElementsRef = useRef(new Map<number, HTMLDivElement>())

  // 筛选出 PDF 文件（当前逻辑只处理单个 PDF，图片逻辑可按需扩展在下方）
  const pdfFile = files.find((f) => f.type === "application/pdf")
  const imageFiles = files.filter((f) => f.type.startsWith("image/"))

  useEffect(() => {
    pageNumRef.current = pageNum
  }, [pageNum])

  useEffect(() => {
    totalPagesRef.current = totalPages
  }, [totalPages])

  const scrollToPage = async (nextPage: number) => {
    const targetPage = Math.max(
      1,
      Math.min(nextPage, totalPagesRef.current || nextPage),
    )
    setPageNum(targetPage)
    pageElementsRef.current.get(targetPage)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  }

  const getCurrentViewBase64 = () => {
    const canvas = pageElementsRef.current
      .get(pageNumRef.current)
      ?.querySelector("canvas")
    return canvas?.toDataURL("image/png") || "data:,"
  }

  useImperativeHandle(
    ref,
    () => ({
      loadFromBase64: () => undefined,
      scrollToPage,
      nextPage: () => scrollToPage(pageNumRef.current + 1),
      previousPage: () => scrollToPage(pageNumRef.current - 1),
      getCurrentPage: () => pageNumRef.current,
      getCurrentViewBase64,
    }),
    [totalPages],
  )

  // Effect 1: 解析并加载 PDF 文档
  useEffect(() => {
    if (!pdfFile) return

    const objectUrl = URL.createObjectURL(pdfFile)
    const loadingTask = pdfjsLib.getDocument({ url: objectUrl })

    loadingTask.promise
      .then((doc) => {
        setPdfDoc(doc)
        setTotalPages(doc.numPages)
        setPageNum(1) // 重置到第一页
      })
      .catch((err) => {
        if (err?.name !== "AbortException") {
          console.error("Failed to load PDF:", err)
        }
      })

    return () => {
      URL.revokeObjectURL(objectUrl)
      // 销毁文档实例，释放内存
      loadingTask.destroy()
    }
  }, [pdfFile])

  // 控制器逻辑
  const handlePrev = () => void scrollToPage(pageNumRef.current - 1)
  const handleNext = () => void scrollToPage(pageNumRef.current + 1)
  const handleZoomIn = () => setScale((prev) => Math.min(3, prev + 0.2))
  const handleZoomOut = () => setScale((prev) => Math.max(0.6, prev - 0.2))

  return (
    <div className="relative min-h-0 min-w-0 w-1/2 h-full border-r border-white/5 bg-[#0e0e11] flex flex-col overflow-hidden">
      <PDFToolbar
        scale={scale}
        pageNum={pageNum}
        totalPages={totalPages}
        hasDocument={Boolean(pdfDoc)}
        onZoomOut={handleZoomOut}
        onZoomIn={handleZoomIn}
        onPreviousPage={handlePrev}
        onNextPage={handleNext}
      />

      {/* PDF 渲染区域 */}
      <div
        ref={pdfScrollRef}
        className="absolute inset-0 min-h-0 bg-[#151518] flex flex-col overflow-auto custom-scrollbar"
      >
        {pdfFile ? (
          <div className="w-full max-w-full flex flex-col items-center">
            {pdfDoc &&
              Array.from({ length: totalPages }, (_, index) => {
                const pageNumber = index + 1
                return (
                  <PDFPage
                    key={pageNumber}
                    pdfDoc={pdfDoc}
                    pageNumber={pageNumber}
                    scale={scale}
                    containerRef={pdfScrollRef}
                    onVisible={setPageNum}
                    onElement={(number, element) => {
                      if (element) pageElementsRef.current.set(number, element)
                      else pageElementsRef.current.delete(number)
                    }}
                  />
                )
              })}
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-600">
            {imageFiles.length > 0 ? (
              <p>请在左侧查阅上传的图片</p>
            ) : (
              <>
                <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>当前未解析到 PDF 文件</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
  },
)