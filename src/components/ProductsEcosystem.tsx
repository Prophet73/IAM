import { useState } from 'react'
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

const posClass: Record<NodePos, string> = {
  top:    'top-0 left-1/2 -translate-x-1/2',
  left:   'top-1/2 left-0 -translate-y-1/2',
  right:  'top-1/2 right-0 -translate-y-1/2',
  bottom: 'bottom-0 left-1/2 -translate-x-1/2',
}

export function ProductsEcosystem({
  products,
  demos,
}: {
  products: Product[]
  demos: Partial<Record<string, React.ReactNode>>
}) {
  const [selectedId, setSelectedId] = useState('aihub')
  const selected   = products.find(p => p.id === selectedId)!
  const aiHub      = products.find(p => p.id === 'aihub')!
  const satellites = products.filter(p => p.id !== 'aihub')

  return (
    <div>
      {/* ── Ecosystem graph (desktop) ── */}
      <div className="relative w-full min-h-[500px] max-w-[760px] mx-auto hidden md:flex items-center justify-center mb-10">

        {/* SVG connector lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
          <line x1="50%" y1="50%" x2="50%" y2="10%" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="5 5" />
          <line x1="50%" y1="50%" x2="12%" y2="50%" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="5 5" />
          <line x1="50%" y1="50%" x2="88%" y2="50%" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="5 5" />
          <line x1="50%" y1="50%" x2="50%" y2="90%" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="5 5" />
        </svg>

        {/* Center node: AI-Hub */}
        <button
          onClick={() => setSelectedId('aihub')}
          className={`relative z-10 w-[192px] h-[192px] rounded-full flex flex-col items-center justify-center text-center p-6 transition-all duration-300 cursor-pointer bg-surface border-2 ${
            selectedId === 'aihub'
              ? 'border-accent shadow-[0_0_48px_rgba(79,124,255,0.28)] scale-105'
              : 'border-border hover:border-accent/40 hover:scale-105'
          }`}
        >
          <span className="text-[9px] font-bold uppercase tracking-widest text-accent mb-1.5">Ядро экосистемы</span>
          <span className="font-display text-lg font-bold text-text-primary">{aiHub.name}</span>
          <span className="text-[10px] text-muted mt-1.5 leading-tight">{aiHub.oneliner}</span>
        </button>

        {/* Satellite nodes */}
        {satellites.map(p => {
          const pos    = nodePos[p.id]
          const status = statusConfig[p.status]
          return (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={`absolute z-10 w-[190px] bg-surface rounded-xl p-4 text-center transition-all duration-300 cursor-pointer border ${posClass[pos]} ${
                selectedId === p.id
                  ? 'border-accent shadow-[0_4px_28px_rgba(79,124,255,0.22)] scale-105'
                  : 'border-border hover:border-accent/40 hover:scale-105 hover:shadow-lg'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 mb-1.5">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${status.dotColor}`} />
                <span className={`text-[9px] font-bold uppercase tracking-wider ${status.textColor}`}>{status.label}</span>
              </div>
              <div className="font-bold text-sm text-text-primary leading-snug">{p.name}</div>
              <div className="text-[10px] text-muted mt-1 leading-tight">{p.oneliner}</div>
            </button>
          )
        })}
      </div>

      {/* ── Mobile: tab pills ── */}
      <div className="flex md:hidden flex-wrap gap-2 mb-6 justify-center">
        {products.map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedId(p.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border ${
              selectedId === p.id
                ? 'bg-accent text-white border-accent'
                : 'bg-surface border-border text-muted hover:text-text-primary hover:border-accent/40'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* ── Detail card ── */}
      <DetailCard key={selectedId} product={selected} demo={demos[selectedId]} />
    </div>
  )
}

function DetailCard({ product, demo }: { product: Product; demo?: React.ReactNode }) {
  const status = statusConfig[product.status]
  return (
    <div className="bg-surface border border-border rounded-2xl px-6 py-6 md:px-8 md:py-7 detail-card-in">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`w-2 h-2 rounded-full shrink-0 ${status.dotColor}`} />
            <span className={`text-xs font-bold uppercase tracking-wider ${status.textColor}`}>{status.label}</span>
          </div>
          <h3 className="font-display text-2xl font-bold text-text-primary">{product.name}</h3>
          <p className="text-muted text-sm mt-1">{product.oneliner}</p>
        </div>
        {product.id === 'puls' && (
          <a
            href="https://github.com/Prophet73/Puls"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 border border-border rounded-lg text-sm font-semibold text-muted hover:border-accent/50 hover:text-text-primary transition-all no-underline shrink-0 self-start"
          >
            GitHub →
          </a>
        )}
      </div>

      {/* Metrics */}
      <div className="flex divide-x divide-border mb-6">
        {product.metrics.map((m, i) => (
          <div key={i} className="px-5 first:pl-0">
            <div className="text-xl font-extrabold text-green">{m.value}</div>
            <div className="text-xs text-muted mt-0.5">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Pain → Solution → Result */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-3 mb-6 items-stretch">
        <FlowBlock label="Задача"    color="text-red"    text={product.pain}     />
        <span className="hidden md:flex items-center text-muted/40 text-lg">→</span>
        <FlowBlock label="Решение"   color="text-accent" text={product.solution} />
        <span className="hidden md:flex items-center text-muted/40 text-lg">→</span>
        <FlowBlock label="Результат" color="text-green"  text={product.result}   />
      </div>

      {/* Tech tags */}
      <div className="flex flex-wrap gap-1.5">
        {product.tech.map(t => (
          <span key={t} className="px-2 py-0.5 bg-surface-3 border border-border rounded text-xs text-muted font-medium">
            {t}
          </span>
        ))}
      </div>

      {/* Demo trigger (self-contained component with own open/close state) */}
      {demo && <div className="mt-5">{demo}</div>}
    </div>
  )
}

function FlowBlock({ label, color, text }: { label: string; color: string; text: string }) {
  return (
    <div className="bg-surface-2 rounded-lg p-4">
      <div className={`text-xs font-bold uppercase tracking-wider mb-1.5 ${color}`}>{label}</div>
      <p className="text-sm text-muted leading-relaxed">{text}</p>
    </div>
  )
}
