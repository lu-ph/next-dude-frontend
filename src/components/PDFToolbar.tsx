interface PDFToolbarProps {
  scale: number
  pageNum: number
  totalPages: number
  hasDocument: boolean
  onZoomOut: () => void
  onZoomIn: () => void
  onPreviousPage: () => void
  onNextPage: () => void
}

export function PDFToolbar({
  scale,
  pageNum,
  totalPages,
  hasDocument,
  onZoomOut,
  onZoomIn,
  onPreviousPage,
  onNextPage,
}: PDFToolbarProps) {
  return (
    <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between bg-neutral-900/70 backdrop-blur-xl border border-white/15 rounded-xl px-2 py-1.5 shadow-lg shadow-black/20">
      <div className="flex items-center gap-1">
        <button
          onClick={onZoomOut}
          disabled={scale <= 0.6}
          className="p-1.5 rounded-lg text-neutral-400 hover:bg-white/10 hover:text-white disabled:opacity-30 transition-colors"
          title="缩小"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
        </button>
        <span className="text-[11px] font-medium text-neutral-300 font-mono w-10 text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={onZoomIn}
          disabled={scale >= 3}
          className="p-1.5 rounded-lg text-neutral-400 hover:bg-white/10 hover:text-white disabled:opacity-30 transition-colors"
          title="放大"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onPreviousPage}
          disabled={pageNum <= 1 || !hasDocument}
          className="p-1.5 rounded-lg text-neutral-400 hover:bg-white/10 hover:text-white disabled:opacity-30 transition-colors"
          title="上一页"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-xs font-medium text-neutral-300 font-mono">
          {pageNum} / {totalPages || "-"}
        </span>
        <button
          onClick={onNextPage}
          disabled={pageNum >= totalPages || !hasDocument}
          className="p-1.5 rounded-lg text-neutral-400 hover:bg-white/10 hover:text-white disabled:opacity-30 transition-colors"
          title="下一页"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
