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
    <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-8 lg:gap-10 items-start">

      {/* ── Mobile: tab pills ── */}
      <div className="flex lg:hidden flex-wrap gap-2 justify-center">
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

      {/* ── Ecosystem graph (desktop) ── */}
      <div className="hidden lg:flex items-center justify-center">
        <div className="aspect-square w-full max-w-[600px] mx-auto relative">

          {/* SVG connector lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
            <line x1="50%" y1="50%" x2="50%" y2="6%"  stroke="var(--color-border)" strokeWidth="1" strokeDasharray="5 5" />
            <line x1="50%" y1="50%" x2="6%"  y2="50%" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="5 5" />
            <line x1="50%" y1="50%" x2="94%" y2="50%" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="5 5" />
            <line x1="50%" y1="50%" x2="50%" y2="94%" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="5 5" />
          </svg>

          {/* Center node: AI-Hub */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <button
              onClick={() => setSelectedId('aihub')}
              className={`w-[172px] h-[172px] rounded-full flex flex-col items-center justify-center text-center p-4 transition-all duration-300 cursor-pointer bg-surface border-2 ${
                selectedId === 'aihub'
                  ? 'border-accent shadow-[0_0_48px_rgba(79,124,255,0.28)] scale-105'
                  : 'border-border hover:border-accent/40 hover:scale-105'
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
                onClick={() => setSelectedId(p.id)}
                className={`absolute z-10 w-[178px] bg-surface rounded-xl p-3 text-center transition-all duration-300 cursor-pointer border ${posClass[pos]} ${
                  selectedId === p.id
                    ? 'border-accent shadow-[0_4px_28px_rgba(79,124,255,0.22)] scale-105'
                    : 'border-border hover:border-accent/40 hover:scale-105 hover:shadow-lg'
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

      {/* ── Detail card ── */}
      <DetailCard key={selectedId} product={selected} demo={demos[selectedId]} />
    </div>
  )
}

function DetailCard({ product, demo }: { product: Product; demo?: React.ReactNode }) {
  const status = statusConfig[product.status]
  return (
    <div className="flex flex-col px-5 py-4 border border-border rounded-2xl bg-surface relative overflow-y-auto max-h-[calc(100vh-10rem)] detail-card-in">

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

      {/* Pain → Solution → Result (vertical) */}
      <div className="flex flex-col gap-2 mb-3">
        <FlowBlock label="Задача"    color="red"    text={product.pain}     />
        <FlowBlock label="Решение"   color="accent" text={product.solution} />
        <FlowBlock label="Результат" color="green"  text={product.result}   />
      </div>

      {/* Tech tags */}
      <div className="flex flex-wrap gap-1">
        {product.tech.map(t => (
          <span key={t} className="px-1.5 py-0.5 bg-surface-3 border border-border rounded text-[10px] text-muted font-medium">
            {t}
          </span>
        ))}
      </div>

      {/* Demo trigger */}
      {demo && <div className="mt-auto pt-3">{demo}</div>}
    </div>
  )
}

const flowColors: Record<string, { badge: string; text: string }> = {
  red:    { badge: 'bg-red-soft text-red',       text: 'text-red'    },
  accent: { badge: 'bg-accent-soft text-accent', text: 'text-accent' },
  green:  { badge: 'bg-green-soft text-green',   text: 'text-green'  },
}

function FlowBlock({ label, color, text }: { label: string; color: string; text: string }) {
  const c = flowColors[color] ?? flowColors.accent
  return (
    <div className="flex items-start gap-3 px-3 py-2.5 bg-surface-2 rounded-xl">
      <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider mt-px ${c.badge}`}>
        {label}
      </span>
      <p className="text-xs text-muted leading-relaxed">{text}</p>
    </div>
  )
}
