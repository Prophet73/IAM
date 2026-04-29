import { useState, useEffect, useRef } from 'react'

export interface StoriesBrand {
  initials: string         // e.g. "SC" "CM" "P" "AI" "АП"
  name: string             // product name shown in header
  sub: string              // subtitle under name
  accent: string           // hex color, e.g. "#2563EB"
}

export interface MobileStoriesProps {
  brand: StoriesBrand
  slides: React.ReactNode[]   // each slide is a full-height card body
  durationMs?: number         // per-slide auto-advance, default 6000
  onClose: () => void
}

const SWIPE_MIN_DX = 70   // minimum px horizontal travel to count as a swipe — high enough to ignore micro-drift during long-press inspection of dense slides (CostManager matrix, Puls dashboard)
const TAP_BACK_RATIO = 0.3   // left 30% goes back, rest goes forward

/**
 * Light-themed mobile Stories shell shared across demos.
 *
 * — Tap left 30% of the screen to go back, anywhere else to advance.
 * — On the last slide, tapping forward closes the modal (Instagram-style).
 * — Swipe left/right also navigates between slides.
 * — Touch-and-hold pauses the auto-advance and dims the chrome (progress
 *   bars + brand header) so the artwork is unobstructed.
 *
 * Slides are rendered inside a flex-col container with justify-center,
 * so any short slide content sits centered with balanced whitespace.
 */
export function MobileStories({ brand, slides, durationMs = 6000, onClose }: MobileStoriesProps) {
  const TOTAL = slides.length
  const TICK = 50
  const [active, setActive] = useState(0)
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)
  const isLast = active === TOTAL - 1

  // Touch tracking — distinguishes a tap from a swipe
  const touchStart = useRef<{ x: number; y: number; t: number } | null>(null)
  const swipedRef = useRef(false)

  // Auto-advance — but stop on the last slide so the close-CTA stays
  useEffect(() => {
    if (paused || isLast) return
    const id = setInterval(() => {
      setProgress(p => {
        const next = p + (100 / (durationMs / TICK))
        if (next >= 100) {
          setActive(s => (s < TOTAL - 1 ? s + 1 : s))
          return 0
        }
        return next
      })
    }, TICK)
    return () => clearInterval(id)
  }, [paused, isLast, TOTAL, durationMs])

  // Reset progress when slide changes
  useEffect(() => { setProgress(0) }, [active])

  const goNext = () => { if (active < TOTAL - 1) setActive(s => s + 1) }
  const goPrev = () => { if (active > 0) setActive(s => s - 1) }

  const advanceOrClose = () => {
    if (isLast) onClose()
    else goNext()
  }

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    // Skip — the touch handlers already navigated, or interactive child was hit
    if (swipedRef.current) return
    const target = e.target as HTMLElement
    if (target.closest('button, a')) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    if (x < rect.width * TAP_BACK_RATIO) goPrev()
    else advanceOrClose()
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    swipedRef.current = false
    setPaused(true)
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    setPaused(false)
    const start = touchStart.current
    touchStart.current = null
    if (!start) return
    const dx = e.changedTouches[0].clientX - start.x
    const dy = e.changedTouches[0].clientY - start.y
    // horizontal swipe
    if (Math.abs(dx) >= SWIPE_MIN_DX && Math.abs(dx) > Math.abs(dy)) {
      swipedRef.current = true
      if (dx < 0) advanceOrClose()
      else goPrev()
    }
  }

  return (
    <div
      className="flex md:hidden flex-col h-full bg-[#F8FAFC] relative select-none"
      onClick={handleTap}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => { setPaused(false); touchStart.current = null }}
    >
      {/* Chrome: progress bars + header. Faded out on touch-hold so the
          slide artwork is unobstructed during a long-press inspection. */}
      <div className={`transition-opacity duration-200 ${paused ? 'opacity-0' : 'opacity-100'}`}>
        {/* Progress bars */}
        <div className="absolute top-0 left-0 right-0 z-30 flex gap-1 px-3 pt-3">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div key={i} className="flex-1 h-[3px] rounded-full bg-slate-200/80 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${i < active ? 100 : i === active ? progress : 0}%`,
                  background: brand.accent,
                  transition: 'width 50ms linear',
                }}
              />
            </div>
          ))}
        </div>

        {/* Compact header */}
        <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pt-3">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] text-white font-bold shrink-0"
              style={{ background: brand.accent }}
            >
              {brand.initials}
            </div>
            <div className="leading-tight">
              <div className="text-[12px] font-bold text-slate-800">{brand.name}</div>
              <div className="text-[9px] text-slate-400">{brand.sub}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/80 backdrop-blur text-slate-500 flex items-center justify-center border border-slate-200/60 text-base cursor-pointer hover:bg-white"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      </div>

      {/* Slide content — fade transition on key change */}
      <div key={active} className="flex-1 min-h-0 overflow-y-auto scrollbar-hidden animate-[fadeIn_0.3s_ease-out]">
        {slides[active]}
      </div>
    </div>
  )
}

/**
 * Standardized slide layout: title + visual + caption stacked tightly,
 * centered vertically as a single block. Children are wrapped in a stagger
 * container so direct-child elements with `data-stagger` cascade in.
 */
export function StorySlide({
  title,
  caption,
  children,
}: {
  title: string
  caption?: string
  children: React.ReactNode
}) {
  return (
    <div className="story-slide flex flex-col items-center justify-center min-h-full px-5 pt-16 pb-8 text-center gap-5">
      <h2 className="text-[22px] font-extrabold text-slate-800 leading-tight px-2 story-stagger" style={{ animationDelay: '0ms' }}>{title}</h2>
      <div className="w-full flex items-center justify-center story-stagger" style={{ animationDelay: '120ms' }}>{children}</div>
      {caption && <p className="text-[12px] text-slate-500 leading-relaxed max-w-[300px] story-stagger" style={{ animationDelay: '240ms' }}>{caption}</p>}
    </div>
  )
}

/**
 * Final slide variant with a close-CTA + a "full demo on PC" hint.
 */
export function StoryClosingSlide({
  title,
  caption,
  children,
  accent,
  onClose,
}: {
  title: string
  caption?: string
  children?: React.ReactNode
  accent: string
  onClose: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-5 pt-16 pb-8 text-center gap-5">
      <h2 className="text-[22px] font-extrabold text-slate-800 leading-tight px-2 story-stagger">{title}</h2>
      {children && <div className="w-full flex items-center justify-center story-stagger" style={{ animationDelay: '100ms' }}>{children}</div>}
      {caption && <p className="text-[12px] text-slate-500 leading-relaxed max-w-[300px] story-stagger" style={{ animationDelay: '200ms' }}>{caption}</p>}
      <button
        onClick={onClose}
        className="story-stagger px-7 py-3 rounded-2xl text-white text-[14px] font-bold border-none cursor-pointer shadow-lg active:scale-95 transition-transform"
        style={{ animationDelay: '320ms', background: accent, boxShadow: `0 8px 22px ${accent}40` }}
      >
        Закрыть превью
      </button>
      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 story-stagger" style={{ animationDelay: '420ms' }}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
        <span>Полная версия — на ПК</span>
      </div>
    </div>
  )
}

/**
 * Pain-slide with a checklist of frustrations — used as opening slide.
 * Cards cascade in with a stagger effect.
 */
export function PainSlide({
  title,
  intro,
  pains,
}: {
  title: string
  intro?: string
  pains: string[]
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-5 pt-16 pb-8 text-center gap-5">
      <h2 className="text-[22px] font-extrabold text-slate-800 leading-tight px-2 story-stagger">{title}</h2>
      {intro && <p className="text-[13px] text-slate-500 leading-relaxed max-w-[320px] story-stagger" style={{ animationDelay: '120ms' }}>{intro}</p>}
      <div className="w-full max-w-[320px] space-y-2">
        {pains.map((p, i) => (
          <div
            key={p}
            className="story-stagger flex items-start gap-2.5 rounded-xl px-3.5 py-2.5 bg-rose-50/60 border border-rose-100"
            style={{ animationDelay: `${250 + i * 110}ms` }}
          >
            <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            <span className="text-[12px] text-slate-700 leading-snug text-left">{p}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
