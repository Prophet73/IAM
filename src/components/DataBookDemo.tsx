import { useState, useMemo } from 'react'
import { samplePrescriptions } from '../data/prescriptions'

export function DataBookDemo() {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    if (!query.trim()) return samplePrescriptions.slice(0, 6)
    const q = query.toLowerCase()
    return samplePrescriptions
      .filter(
        (p) =>
          p.text.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.object.toLowerCase().includes(q)
      )
      .slice(0, 8)
  }, [query])

  const highlight = (text: string) => {
    if (!query.trim()) return text
    const q = query.toLowerCase()
    const idx = text.toLowerCase().indexOf(q)
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <mark>{text.slice(idx, idx + query.length)}</mark>
        {text.slice(idx + query.length)}
      </>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 mt-8">
      <div className="text-center mb-5">
        <div className="inline-block px-3 py-1 bg-accent-soft text-accent rounded-full text-[0.72rem] font-bold tracking-wide mb-3">
          ИНТЕРАКТИВНАЯ ДЕМОНСТРАЦИЯ
        </div>
        <h3 className="text-xl font-bold mb-1">Мини-DataBook</h3>
        <p className="text-sm text-muted max-w-lg mx-auto">
          Поиск по 20 предписаниям строительного контроля.
          В production-версии — 8 500+ записей с NLP-лемматизацией и fuzzy matching.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="relative mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Попробуйте: бетон, фасад, трещины, кровля, арматура..."
            className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-sm text-text-primary placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted text-xs">
            {results.length} из {samplePrescriptions.length}
          </span>
        </div>

        <div className="space-y-2">
          {results.map((p) => (
            <div
              key={p.id}
              className="p-3 bg-surface-2 border border-border rounded-lg hover:border-accent/30 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-green-soft text-green rounded text-[0.66rem] font-bold">
                  {p.category}
                </span>
                <span className="text-[0.68rem] text-muted">{p.object}</span>
                <span className="text-[0.68rem] text-muted ml-auto">{p.date}</span>
              </div>
              <p className="text-[0.8rem] text-muted leading-relaxed">
                {highlight(p.text)}
              </p>
            </div>
          ))}
          {results.length === 0 && (
            <div className="text-center py-8 text-muted text-sm">
              Ничего не найдено. Попробуйте другой запрос.
            </div>
          )}
        </div>

        {query.trim() && results.length > 0 && (
          <div className="text-center mt-4 text-[0.72rem] text-muted">
            Клиентский поиск по подстроке. Production: PostgreSQL FTS + лемматизация + fuzzy + vector similarity
          </div>
        )}
      </div>
    </div>
  )
}
