import { useState } from 'react'
import type { Product } from '../data/products'

const statusConfig = {
  production: { label: 'PRODUCTION', bg: 'bg-surface-3', text: 'text-muted' },
  pilot: { label: 'ПИЛОТ', bg: 'bg-surface-3', text: 'text-muted' },
  prototype: { label: 'ПРОТОТИП', bg: 'bg-surface-3', text: 'text-muted' },
}

export function ProductCard({ product, demo }: { product: Product; demo?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const status = statusConfig[product.status]

  return (
    <div
      className="bg-surface border border-border rounded-2xl mb-3 transition-colors hover:border-accent/40"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-5 flex justify-between items-center gap-4 cursor-pointer text-left bg-transparent border-none"
      >
        <div className="flex-1 min-w-0">
          <div className="text-lg font-bold text-text-primary">{product.name}</div>
          <div className="text-sm text-muted mt-1">{product.oneliner}</div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`px-2.5 py-0.5 rounded text-[0.7rem] font-bold tracking-wide ${status.bg} ${status.text}`}>
            {status.label}
          </span>
          <span className={`px-3.5 py-1.5 rounded-lg text-[0.78rem] font-semibold transition-all flex items-center gap-1.5 ${open ? 'bg-accent/15 text-accent' : 'bg-accent text-white shadow-md shadow-accent/25 hover:shadow-lg hover:shadow-accent/30'}`}>
            {open ? 'Свернуть' : 'Подробнее'}
            <span className={`text-[0.7rem] transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>&#9662;</span>
          </span>
        </div>
      </button>

      <div className={`product-detail ${open ? 'open' : ''}`}>
        <div className="product-detail-inner">
          <div className="px-6 pb-6 border-t border-border">
            {/* Metrics */}
            <div className="flex gap-6 mt-5 flex-wrap">
              {product.metrics.map((m, i) => (
                <div key={i} className="text-center min-w-[100px]">
                  <div className="text-xl font-extrabold text-green">{m.value}</div>
                  <div className="text-[0.7rem] text-muted mt-0.5">{m.label}</div>
                </div>
              ))}
            </div>

            {/* Pain → Solution → Result */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
              <FlowBlock label="Задача" color="text-red" text={product.pain} />
              <FlowBlock label="Решение" color="text-accent" text={product.solution} />
              <FlowBlock label="Результат" color="text-green" text={product.result} />
            </div>

            {/* Tech tags */}
            <div className="flex flex-wrap gap-1.5 mt-4">
              {product.tech.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 bg-surface-3 border border-border rounded text-[0.7rem] text-muted font-medium"
                >
                  {t}
                </span>
              ))}
            </div>

            {/* Inline demo */}
            {demo}

            {/* Demo CTA */}
            {!demo && (
              <div className="mt-4 p-4 bg-surface-2 rounded-lg border border-dashed border-border text-center">
                <p className="text-sm text-muted">{product.demoText}</p>
                <a
                  href={`mailto:KhromenokNV@mail.ru?subject=${encodeURIComponent(product.demoSubject)}`}
                  className="inline-block mt-2 px-5 py-2 bg-accent text-white rounded-md text-sm font-semibold hover:opacity-85 transition-opacity no-underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Запросить демо
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function FlowBlock({ label, color, text }: { label: string; color: string; text: string }) {
  return (
    <div className="bg-surface-2 rounded-lg p-4">
      <div className={`text-[0.68rem] font-bold uppercase tracking-wider mb-1.5 ${color}`}>
        {label}
      </div>
      <p className="text-[0.82rem] text-muted leading-relaxed">{text}</p>
    </div>
  )
}
