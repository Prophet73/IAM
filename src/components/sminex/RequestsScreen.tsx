import { useState } from 'react'
import { Search } from 'lucide-react'
import {
  complexes, statusColors, statusLabels, priorityLabels, priorityColors,
  requestTypeIcons, requestTypeColors,
  type ServiceRequest, type RequestStatus, type UserProfile,
} from '../../data/sminex'

interface RequestsScreenProps {
  requests: ServiceRequest[]
  user: UserProfile
  selectedComplex: string | null
  onOpenRequest: (request: ServiceRequest) => void
}

type FilterStatus = 'all' | RequestStatus

export default function RequestsScreen({ requests, user, selectedComplex, onOpenRequest }: RequestsScreenProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterStatus>('all')

  // Filter by role
  let roleFiltered = requests
  if (user.role === 'resident') {
    roleFiltered = requests.filter(r => r.residentId === user.id || r.resident === user.name)
  } else if (user.role === 'manager' && user.complexId) {
    roleFiltered = requests.filter(r => r.complexId === user.complexId)
  }

  // Filter by complex selector (director)
  if (selectedComplex) {
    roleFiltered = roleFiltered.filter(r => r.complexId === selectedComplex)
  }

  const filtered = roleFiltered
    .filter(r => filter === 'all' || r.status === filter)
    .filter(r => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        r.description.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.resident.toLowerCase().includes(q) ||
        String(r.number).includes(q)
      )
    })
    .sort((a, b) => b.number - a.number)

  const getComplexName = (id: string) => complexes.find(c => c.id === id)?.name ?? id

  const filters: { id: FilterStatus; label: string; count: number }[] = [
    { id: 'all', label: 'Все', count: roleFiltered.length },
    { id: 'new', label: 'Новые', count: roleFiltered.filter(r => r.status === 'new').length },
    { id: 'in_progress', label: 'В работе', count: roleFiltered.filter(r => r.status === 'in_progress').length },
    { id: 'completed', label: 'Выполнены', count: roleFiltered.filter(r => r.status === 'completed').length },
    { id: 'overdue', label: 'Просрочены', count: roleFiltered.filter(r => r.status === 'overdue').length },
  ]

  return (
    <div className="flex-1 overflow-y-auto animate-[fadeIn_0.2s_ease-out]">
      <div className="px-5 pt-4 pb-6 space-y-4">
        <h1 className="text-xl font-bold text-[#1D252D]">
          {user.role === 'resident' ? 'Мои заявки' : 'Заявки'}
        </h1>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1D252D]/30" />
          <input
            type="text"
            placeholder="Поиск по номеру, типу, описанию..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white rounded-full pl-10 pr-4 py-2.5 text-sm text-[#1D252D] placeholder:text-[#1D252D]/30 border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8B7355]/30"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-hide">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === f.id
                  ? 'bg-[#1D252D] text-white'
                  : 'bg-white text-[#1D252D]/60 border border-gray-100'
              }`}
            >
              {f.label}
              <span className={`ml-1.5 ${filter === f.id ? 'text-white/60' : 'text-[#1D252D]/30'}`}>{f.count}</span>
            </button>
          ))}
        </div>

        <div className="space-y-2.5">
          {filtered.length === 0 && (
            <div className="text-center py-8 text-[#1D252D]/40 text-sm">Заявки не найдены</div>
          )}
          {filtered.map((req, i) => {
            const TypeIcon = requestTypeIcons[req.type]
            const typeColor = requestTypeColors[req.type] || 'bg-gray-100 text-gray-600'
            return (
              <button
                key={req.id}
                onClick={() => onOpenRequest(req)}
                className="w-full bg-white rounded-2xl p-4 text-left shadow-sm border border-gray-50 transition-shadow hover:shadow-md animate-[slideUp_0.3s_ease-out_both]"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-start gap-3">
                  {TypeIcon && (
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${typeColor}`}>
                      <TypeIcon className="w-4 h-4" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#1D252D]">#{req.number}</span>
                        <span className="text-xs text-[#1D252D]/50">{req.type}</span>
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[req.status]}`}>
                        {statusLabels[req.status]}
                      </span>
                    </div>
                    <p className="text-xs text-[#1D252D]/70 line-clamp-1 mb-1.5">{req.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#1D252D]/40">
                        {user.role !== 'resident' && `${getComplexName(req.complexId)} · `}кв. {req.apartment}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-medium ${priorityColors[req.priority]}`}>{priorityLabels[req.priority]}</span>
                        <span className="text-[10px] text-[#1D252D]/30">{req.createdAt.split(' ')[0].slice(5)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
