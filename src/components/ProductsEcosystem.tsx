import { useState, useEffect, useRef, useCallback } from 'react'
import type { Product } from '../data/products'

const statusConfig = {
  production: { label: 'PRODUCTION', textColor: 'text-green',  dotColor: 'bg-green'  },
  pilot:      { label: 'ПИЛОТ',      textColor: 'text-amber',  dotColor: 'bg-amber'  },
  prototype:  { label: 'ПРОТОТИП',   textColor: 'text-purple', dotColor: 'bg-purple' },
}

type NodePos = 'top' | 'left' | 'right' | 'bottom'

const nodePos: Record<string, NodePos> = {
  autoprotocol: 'top',
  databook:     'left',
  costmanager:  'right',
  puls:         'bottom',
}

const auraColor: Record<string, string> = {
  aihub:        'bg-accent',
  costmanager:  'bg-green',
  autoprotocol: 'bg-purple',
  databook:     'bg-cyan',
  puls:         'bg-amber',
}

const posClass: Record<NodePos, string> = {
  top:    '-top-6 left-1/2 -translate-x-1/2',
  left:   'top-1/2 -left-10 -translate-y-1/2',
  right:  'top-1/2 -right-10 -translate-y-1/2',
  bottom: '-bottom-6 left-1/2 -translate-x-1/2',
}

export function ProductsEcosystem({
  products,
  demos,
}: {
  products: Product[]
  demos: Partial<Record<string, React.ReactNode>>
}) {
  const [selectedId, setSelectedId] = useState('aihub')
  const aiHub      = products.find(p => p.id === 'aihub')!
  const satellites = products.filter(p => p.id !== 'aihub')

  // Refs for each card in the right column
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})
  // Flag to suppress observer updates during programmatic scroll
  const isScrollingTo = useRef(false)

  const setCardRef = useCallback((id: string) => (el: HTMLDivElement | null) => {
    cardRefs.current[id] = el
  }, [])

  // IntersectionObserver: track which card is closest to viewport center
  useEffect(() => {
    // Only on desktop (lg breakpoint = 1024px)
    if (window.innerWidth < 1024) return

    const ratios = new Map<string, number>()

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingTo.current) return

        for (const entry of entries) {
          const id = entry.target.getAttribute('data-product-id')
          if (id) ratios.set(id, entry.intersectionRatio)
        }

        // Pick the card with the highest intersection ratio
        let bestId = ''
        let bestRatio = 0
        for (const [id, ratio] of ratios) {
          if (ratio > bestRatio) {
            bestRatio = ratio
            bestId = id
          }
        }

        if (bestId && bestRatio > 0.25) {
          setSelectedId(bestId)
        }
      },
      {
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
        rootMargin: '-30% 0px -30% 0px',
      },
    )

    for (const el of Object.values(cardRefs.current)) {
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [products])

  // Click on graph node → smooth scroll to card
  const scrollToCard = useCallback((id: string) => {
    setSelectedId(id)
    const el = cardRefs.current[id]
    if (!el) return

    isScrollingTo.current = true
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })

    // Re-enable observer after scroll fully settles
    const timer = setTimeout(() => { isScrollingTo.current = false }, 1200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[42%_1fr] gap-8 lg:gap-12 items-start">

      {/* ── Mobile: product grid ── */}
      <div className="lg:hidden">
        <div className="grid grid-cols-3 gap-2 mb-2">
          {products.slice(0, 3).map(p => {
            const st = statusConfig[p.status]
            const active = selectedId === p.id
            return (
              <button key={p.id} onClick={() => setSelectedId(p.id)}
                className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl text-[12px] font-semibold transition-all border ${
                  active ? 'bg-accent text-white border-accent shadow-lg shadow-accent/20' : 'bg-surface border-border text-muted'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-white' : st.dotColor}`} />
                {p.name}
              </button>
            )
          })}
        </div>
        <div className="grid grid-cols-2 gap-2 max-w-[67%] mx-auto">
          {products.slice(3).map(p => {
            const st = statusConfig[p.status]
            const active = selectedId === p.id
            return (
              <button key={p.id} onClick={() => setSelectedId(p.id)}
                className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl text-[12px] font-semibold transition-all border ${
                  active ? 'bg-accent text-white border-accent shadow-lg shadow-accent/20' : 'bg-surface border-border text-muted'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-white' : st.dotColor}`} />
                {p.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Ecosystem graph (desktop — sticky) ── */}
      <div className="hidden lg:flex items-center justify-center sticky top-24 h-[calc(100vh-8rem)]">
        <div className="aspect-square w-full max-w-[520px] mx-auto relative overflow-visible">

          {/* Context aura */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[120px] pointer-events-none z-0 transition-colors duration-1000 ease-in-out context-aura ${auraColor[selectedId] ?? 'bg-accent'}`} />

          {/* SVG animated beam lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" aria-hidden="true">
            <line x1="50%" y1="50%" x2="50%" y2="2%"   className={`beam-line ${selectedId === 'autoprotocol' ? 'beam-active' : 'beam-idle'}`} />
            <line x1="50%" y1="50%" x2="0%"  y2="50%"  className={`beam-line ${selectedId === 'databook' ? 'beam-active' : 'beam-idle'}`} />
            <line x1="50%" y1="50%" x2="100%" y2="50%" className={`beam-line ${selectedId === 'costmanager' ? 'beam-active' : 'beam-idle'}`} />
            <line x1="50%" y1="50%" x2="50%" y2="98%"  className={`beam-line ${selectedId === 'puls' ? 'beam-active' : 'beam-idle'}`} />
          </svg>

          {/* Center node: AI-Hub */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <button
              onClick={() => scrollToCard('aihub')}
              className={`w-[172px] h-[172px] rounded-full flex flex-col items-center justify-center text-center p-4 transition-all duration-300 cursor-pointer bg-surface border-2 ${
                selectedId === 'aihub'
                  ? 'border-accent shadow-[0_0_40px_var(--color-accent-soft)] scale-110'
                  : 'border-accent/30 shadow-[0_0_20px_var(--color-accent-soft)] hover:border-accent/60 hover:scale-105'
              }`}
            >
              <span className="text-[9px] font-bold uppercase tracking-widest text-accent mb-1">Ядро</span>
              <span className="font-display text-lg font-bold text-text-primary">{aiHub.name}</span>
              <span className="text-[10px] text-muted mt-1 leading-tight">{aiHub.oneliner}</span>
            </button>
          </div>

          {/* Satellite nodes */}
          {satellites.map(p => {
            const pos    = nodePos[p.id]
            const status = statusConfig[p.status]
            return (
              <button
                key={p.id}
                onClick={() => scrollToCard(p.id)}
                className={`absolute z-10 w-[178px] bg-surface rounded-xl p-3 text-center transition-all duration-500 cursor-pointer border ${posClass[pos]} ${
                  selectedId === p.id
                    ? 'border-accent shadow-[0_0_32px_var(--color-accent-soft)] scale-110 opacity-100'
                    : 'border-border opacity-50 grayscale hover:border-accent/40 hover:scale-105 hover:shadow-lg hover:opacity-90 hover:grayscale-0'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${status.dotColor}`} />
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${status.textColor}`}>{status.label}</span>
                </div>
                <div className="font-bold text-sm text-text-primary leading-snug">{p.name}</div>
                <div className="text-[10px] text-muted mt-0.5 leading-tight">{p.oneliner}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Detail cards: mobile shows only selected, desktop shows all ── */}
      <div className="flex flex-col gap-6 lg:gap-[40vh] lg:pt-[30vh] lg:pb-[50vh] relative z-10">
        {/* Mobile: compact card */}
        <div className="lg:hidden">
          <MobileCard
            product={products.find(p => p.id === selectedId)!}
            demo={demos[selectedId]}
          />
        </div>

        {/* Desktop: all cards stacked */}
        {products.map(p => (
          <div
            key={p.id}
            ref={setCardRef(p.id)}
            data-product-id={p.id}
            className="hidden lg:block"
          >
            <DetailCard
              product={p}
              demo={demos[p.id]}
              isActive={selectedId === p.id}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Spotlight wrapper ── */
function Spotlight({ children, isActive }: { children: React.ReactNode; isActive: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const [spot, setSpot] = useState({ x: 0, y: 0, on: false })

  return (
    <div
      ref={ref}
      className="relative overflow-hidden"
      onMouseMove={e => {
        const r = ref.current?.getBoundingClientRect()
        if (r) setSpot({ x: e.clientX - r.left, y: e.clientY - r.top, on: true })
      }}
      onMouseLeave={() => setSpot(p => ({ ...p, on: false }))}
    >
      <div
        className={`pointer-events-none absolute inset-0 rounded-2xl z-[1] transition-opacity duration-300 ${spot.on && isActive ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background: spot.on
            ? `radial-gradient(400px circle at ${spot.x}px ${spot.y}px, var(--color-accent-soft), transparent 60%)`
            : 'none',
        }}
      />
      <div className="relative z-[2]">{children}</div>
    </div>
  )
}

/* ── Mobile compact card ── */
function MobileCard({
  product,
  demo,
}: {
  product: Product
  demo?: React.ReactNode
}) {
  const status = statusConfig[product.status]
  return (
    <div className="border border-border/60 border-t-white/[0.06] rounded-2xl bg-surface/60 backdrop-blur-xl spring-card opacity-100 scale-100 shadow-2xl">
      <div className="px-5 py-4">
        {/* Header */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${status.dotColor}`} />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${status.textColor}`}>{status.label}</span>
          </div>
          <h3 className="font-display text-xl font-bold text-text-primary">{product.name}</h3>
          <p className="text-muted text-xs mt-0.5">{product.oneliner}</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2">
          {product.metrics.map((m, i) => (
            <div key={i} className="bg-surface-2 rounded-lg px-2 py-2 text-center">
              <div className="text-base font-extrabold text-green leading-tight">{m.value}</div>
              <div className="text-[10px] text-muted mt-0.5 leading-tight">{m.label}</div>
            </div>
          ))}
        </div>

        {/* CTA demo block */}
        {demo && (
          <div className="mt-4 pt-3 border-t border-border">
            {demo}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Detail card ── */
function DetailCard({
  product,
  demo,
  isActive,
}: {
  product: Product
  demo?: React.ReactNode
  isActive: boolean
}) {
  const status = statusConfig[product.status]
  return (
    <div
      className={`flex flex-col border border-border/60 border-t-white/[0.06] rounded-2xl bg-surface/60 backdrop-blur-xl relative spring-card ${
        isActive
          ? 'opacity-100 scale-100 grayscale-0 shadow-2xl'
          : 'opacity-30 scale-95 grayscale-[50%]'
      }`}
    >
      <Spotlight isActive={isActive}>
        <div className="px-5 py-4">
          {/* Header */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${status.dotColor}`} />
              <span className={`text-[10px] font-bold uppercase tracking-wider ${status.textColor}`}>{status.label}</span>
            </div>
            <h3 className="font-display text-xl font-bold text-text-primary">{product.name}</h3>
            <p className="text-muted text-xs mt-0.5">{product.oneliner}</p>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {product.metrics.map((m, i) => (
              <div key={i} className="bg-surface-2 rounded-lg px-2 py-2 text-center">
                <div className="text-base font-extrabold text-green leading-tight">{m.value}</div>
                <div className="text-[10px] text-muted mt-0.5 leading-tight">{m.label}</div>
              </div>
            ))}
          </div>

          {/* Timeline: Pain → Solution → Result */}
          <div className="flex gap-4 mb-3">
            {/* Vertical line with dots */}
            <div className="flex flex-col items-center shrink-0 py-1">
              <div className="w-2.5 h-2.5 rounded-full bg-red border-2 border-red-soft shrink-0" />
              <div className="w-px flex-1 bg-gradient-to-b from-red via-accent to-green" />
              <div className="w-2.5 h-2.5 rounded-full bg-accent border-2 border-accent-soft shrink-0" />
              <div className="w-px flex-1 bg-gradient-to-b from-accent to-green" />
              <div className="w-2.5 h-2.5 rounded-full bg-green border-2 border-green-soft shrink-0" />
            </div>

            {/* Text blocks */}
            <div className="flex flex-col gap-3 flex-1 min-w-0">
              <TimelineBlock label="Задача"    color="red"    text={product.pain}     />
              <TimelineBlock label="Решение"   color="accent" text={product.solution} />
              <TimelineBlock label="Результат" color="green"  text={product.result}   />
            </div>
          </div>

          {/* Tech tags */}
          <div className="flex flex-wrap gap-1">
            {product.tech.map(t => (
              <span key={t} className="px-1.5 py-0.5 bg-surface-3 border border-border rounded text-[10px] text-muted font-medium">
                {t}
              </span>
            ))}
          </div>

          {/* CTA demo block */}
          {demo && (
            <div className="mt-4 pt-3 border-t border-border">
              {demo}
            </div>
          )}
        </div>
      </Spotlight>
    </div>
  )
}

const timelineColors: Record<string, { badge: string }> = {
  red:    { badge: 'bg-red-soft text-red'       },
  accent: { badge: 'bg-accent-soft text-accent' },
  green:  { badge: 'bg-green-soft text-green'   },
}

function TimelineBlock({ label, color, text }: { label: string; color: string; text: string }) {
  const c = timelineColors[color] ?? timelineColors.accent
  return (
    <div>
      <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-widest mb-1 ${c.badge}`}>
        {label}
      </span>
      <p className="text-xs text-text-primary/70 leading-relaxed">{text}</p>
    </div>
  )
}
