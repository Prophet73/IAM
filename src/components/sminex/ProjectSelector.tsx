import { useState, useRef, useEffect } from 'react'
import { Building2, ChevronDown } from 'lucide-react'
import { complexes, type ResidentialComplex } from '../../data/sminex'

interface ProjectSelectorProps {
  selected: string | null
  onSelect: (complexId: string | null) => void
}

export default function ProjectSelector({ selected, onSelect }: ProjectSelectorProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const options: { id: string | null; name: string }[] = [
    { id: null, name: 'Все объекты' },
    ...complexes.map((c: ResidentialComplex) => ({ id: c.id, name: c.name })),
  ]

  const current = options.find(o => o.id === selected) ?? options[0]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-white rounded-full px-4 py-2 text-sm font-medium text-[#1D252D] shadow-sm border border-gray-100"
      >
        <Building2 className="w-4 h-4 text-[#8B7355]" />
        {current.name}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-2xl shadow-lg border border-gray-100 py-1 z-50 min-w-[180px]">
          {options.map(o => (
            <button
              key={o.id ?? 'all'}
              onClick={() => { onSelect(o.id); setOpen(false) }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                current.id === o.id ? 'bg-[#F5F1EC] font-semibold text-[#1D252D]' : 'text-[#1D252D]/70 hover:bg-[#F5F1EC]/50'
              }`}
            >
              {o.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
