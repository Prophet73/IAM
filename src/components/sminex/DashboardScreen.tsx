import { useState, useEffect } from 'react'
import { Plus, FileText, TrendingUp, TrendingDown, CloudSun, ChevronDown, ShieldCheck, Car, Thermometer, Sparkles } from 'lucide-react'
import { dashboardMetrics, complexes, statusColors, statusLabels, type ServiceRequest, type UserProfile, type SubScreen, type OwnedProperty } from '../../data/sminex'
import ProjectSelector from './ProjectSelector'

interface DashboardScreenProps {
  requests: ServiceRequest[]
  user: UserProfile
  selectedComplex: string | null
  onSelectComplex: (id: string | null) => void
  onOpenRequest: (request: ServiceRequest) => void
  onNavigateRequests: () => void
  onCreateRequest: () => void
  onOpenSubScreen?: (screen: SubScreen) => void
  activePropertyId?: string
  onSelectProperty?: (id: string) => void
}

export default function DashboardScreen({
  requests, user, selectedComplex, onSelectComplex,
  onOpenRequest, onNavigateRequests, onCreateRequest, onOpenSubScreen,
  activePropertyId, onSelectProperty,
}: DashboardScreenProps) {
  const filtered = selectedComplex
    ? requests.filter(r => r.complexId === selectedComplex)
    : requests

  if (user.role === 'resident') {
    return (
      <ResidentDashboard
        requests={filtered}
        user={user}
        onOpenRequest={onOpenRequest}
        onCreateRequest={onCreateRequest}
        onOpenSubScreen={onOpenSubScreen}
        activePropertyId={activePropertyId}
        onSelectProperty={onSelectProperty}
      />
    )
  }

  return (
    <ManagerDashboard
      requests={filtered}
      user={user}
      selectedComplex={selectedComplex}
      onSelectComplex={onSelectComplex}
      onOpenRequest={onOpenRequest}
      onNavigateRequests={onNavigateRequests}
      onCreateRequest={onCreateRequest}
    />
  )
}

function ResidentDashboard({ requests, user, onOpenRequest, onCreateRequest, onOpenSubScreen, activePropertyId, onSelectProperty }: {
  requests: ServiceRequest[]
  user: UserProfile
  onOpenRequest: (r: ServiceRequest) => void
  onCreateRequest: () => void
  onOpenSubScreen?: (screen: SubScreen) => void
  activePropertyId?: string
  onSelectProperty?: (id: string) => void
}) {
  const [showPropertyPicker, setShowPropertyPicker] = useState(false)

  const myRequests = requests.filter(r => r.residentId === user.id || r.resident === user.name)
  const latestTwo = [...myRequests].sort((a, b) => b.number - a.number).slice(0, 2)

  const properties = user.properties ?? []
  const activeProperty: OwnedProperty | undefined = properties.find(p => p.id === activePropertyId) ?? properties[0]

  const clubCards = [
    { title: 'SPA & Wellness', subtitle: 'Релакс и восстановление', bg: 'bg-gradient-to-br from-blue-900 to-slate-800' },
    { title: 'Private Cinema', subtitle: 'Персональные показы', bg: 'bg-gradient-to-br from-purple-900 to-slate-900' },
    { title: 'Cigar Lounge', subtitle: 'Премиальная коллекция', bg: 'bg-gradient-to-br from-amber-900 to-slate-900' },
  ]

  return (
    <div className="flex-1 overflow-y-auto animate-[fadeIn_0.2s_ease-out]">
      <div className="px-5 pt-4 pb-6 space-y-4">

        {/* ── VIP Card ── */}
        <div className="relative overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-[#1D252D] via-[#1D252D] to-black border border-[#8B7355]/30 p-5 shadow-xl"
          style={{ aspectRatio: '1.586' }}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none" />
          <div className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer pointer-events-none" />
          <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-[#8B7355]/10 blur-3xl" />

          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/40 text-[10px] font-medium tracking-wider uppercase mb-1">Резидент</p>
                <h1 className="text-lg font-bold text-white">{user.name}</h1>
              </div>
              <div className="flex items-center gap-1.5">
                <CloudSun className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-white/70">−3°C</span>
              </div>
            </div>

            <div className="flex items-end justify-between">
              {activeProperty && (
                <div className="bg-white/10 backdrop-blur-md rounded-xl px-3 py-2 border border-white/10">
                  <p className="text-white/40 text-[9px] font-medium tracking-wide uppercase">Квартира</p>
                  <p className="text-white font-bold text-sm">{activeProperty.apartment}</p>
                </div>
              )}
              <div className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white/80 font-bold text-xs border border-white/10">
                {user.initials}
              </div>
            </div>
          </div>
        </div>

        {/* Multi-apartment switcher */}
        {properties.length > 1 && activeProperty && (
          <div className="relative">
            <button
              onClick={() => setShowPropertyPicker(!showPropertyPicker)}
              className="w-full bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex items-center gap-3 transition-all hover:shadow-md active:scale-[0.99]"
            >
              <div className="w-9 h-9 rounded-xl bg-[#F9F9F8] flex items-center justify-center text-[#8B7355] text-xs font-bold shrink-0">
                {activeProperty.apartment}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-xs font-bold text-[#1D252D] truncate">{activeProperty.complexName} · кв. {activeProperty.apartment}</p>
                <p className="text-[10px] text-[#1D252D]/40">{activeProperty.typeLabel} · {activeProperty.area} м²</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#1D252D]/30 transition-transform ${showPropertyPicker ? 'rotate-180' : ''}`} />
            </button>

            {showPropertyPicker && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-lg border border-gray-100 z-10 overflow-hidden animate-[fadeIn_0.1s_ease-out]">
                {properties.map(prop => (
                  <button
                    key={prop.id}
                    onClick={() => { onSelectProperty?.(prop.id); setShowPropertyPicker(false) }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors ${
                      prop.id === activeProperty.id ? 'bg-[#F9F9F8]' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      prop.id === activeProperty.id ? 'bg-[#1D252D] text-white' : 'bg-[#F9F9F8] text-[#8B7355]'
                    }`}>
                      {prop.apartment.slice(0, 3)}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-[#1D252D]">{prop.complexName} · кв. {prop.apartment}</p>
                      <p className="text-[10px] text-[#1D252D]/40">{prop.typeLabel} · {prop.area} м²</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Widget 1: Smart Home Status ── */}
        <button
          onClick={() => onOpenSubScreen?.('smart-home')}
          className="w-full bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-white/50 shadow-sm text-left transition-all hover:shadow-md active:scale-[0.98]"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] text-[#1D252D]/40 font-medium uppercase tracking-wide">Умный дом</p>
              <p className="text-sm font-bold text-[#1D252D]">Охрана включена</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 bg-[#F9F9F8] rounded-lg px-2.5 py-1.5">
              <Thermometer className="w-3.5 h-3.5 text-[#8B7355]" />
              <span className="text-xs font-semibold text-[#1D252D]">22°C</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-[#1D252D]/50">Все системы работают штатно</p>
            <span className="text-[11px] font-semibold text-[#8B7355]">Снять с охраны →</span>
          </div>
        </button>

        {/* ── Widget 2: Valet / Parking ── */}
        <button
          onClick={() => onOpenSubScreen?.('parking')}
          className="w-full bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-white/50 shadow-sm text-left transition-all hover:shadow-md active:scale-[0.98]"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1D252D] to-[#3a4a5c] flex items-center justify-center shadow-lg shadow-[#1D252D]/20">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-[#1D252D]/40 font-medium uppercase tracking-wide">Паркинг B1</p>
              <p className="text-sm font-bold text-[#1D252D]">Mercedes-Benz <span className="text-[#1D252D]/50 font-medium">А777АА</span></p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-[#1D252D] to-[#8B7355] rounded-xl py-2.5 px-4 text-center">
            <span className="text-xs font-semibold text-white">Подать машину к подъезду</span>
          </div>
        </button>

        {/* ── Sminex Premium Club ── */}
        <div>
          <h2 className="text-sm font-bold text-[#1D252D] mb-3">Sminex Premium Club</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
            {clubCards.map((card, i) => (
              <button
                key={card.title}
                onClick={() => onOpenSubScreen?.('booking')}
                className={`shrink-0 w-64 aspect-video ${card.bg} rounded-2xl p-5 flex flex-col justify-end text-left relative overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] animate-[fadeIn_0.3s_ease-out_both]`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-[1px] rounded-[calc(1rem-1px)] border border-white/10 pointer-events-none" />
                <div className="relative z-10">
                  <p className="text-white/50 text-[10px] font-medium uppercase tracking-wider mb-1">{card.subtitle}</p>
                  <p className="text-white text-lg font-bold">{card.title}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* New request button */}
        <button
          onClick={onCreateRequest}
          className="w-full bg-[#1D252D] text-white rounded-full py-3 text-sm font-semibold transition-opacity hover:opacity-90 flex items-center justify-center gap-2 active:scale-[0.97] shadow-[0_8px_20px_rgba(29,37,45,0.25)]"
        >
          <Plus className="w-4 h-4" />
          Новая заявка
        </button>

        {/* Latest 2 requests */}
        {latestTwo.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-[#1D252D] mb-2">Последние заявки</h2>
            <div className="space-y-2">
              {latestTwo.map((req, i) => (
                <button
                  key={req.id}
                  onClick={() => onOpenRequest(req)}
                  className="w-full bg-white rounded-2xl p-3.5 text-left shadow-sm border border-gray-50 transition-shadow hover:shadow-md animate-[fadeIn_0.2s_ease-out]"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#1D252D]">#{req.number}</span>
                      <span className="text-xs text-[#1D252D]/50">{req.type}</span>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[req.status]}`}>
                      {statusLabels[req.status]}
                    </span>
                  </div>
                  <p className="text-xs text-[#1D252D]/70 line-clamp-1">{req.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ManagerDashboard({
  requests, user, selectedComplex, onSelectComplex,
  onOpenRequest, onNavigateRequests, onCreateRequest,
}: {
  requests: ServiceRequest[]
  user: UserProfile
  selectedComplex: string | null
  onSelectComplex: (id: string | null) => void
  onOpenRequest: (r: ServiceRequest) => void
  onNavigateRequests: () => void
  onCreateRequest: () => void
}) {
  const latestRequests = [...requests].sort((a, b) => b.number - a.number).slice(0, 3)
  const getComplexName = (id: string) => complexes.find(c => c.id === id)?.name ?? id
  const firstName = user.name.split(' ')[0]

  return (
    <div className="flex-1 overflow-y-auto animate-[fadeIn_0.2s_ease-out]">
      <div className="px-5 pt-4 pb-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#1D252D]/50 text-xs font-medium">26 февраля 2026</p>
            <h1 className="text-xl font-bold text-[#1D252D]">Добрый день, {firstName}</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#1D252D] flex items-center justify-center text-white font-bold text-sm">
            {user.initials}
          </div>
        </div>

        {user.role === 'director' && (
          <ProjectSelector selected={selectedComplex} onSelect={onSelectComplex} />
        )}

        {user.role === 'director' && (
          <div className="bg-gradient-to-r from-[#1D252D] to-[#3a4a5c] rounded-2xl p-4 text-white shadow-lg relative overflow-hidden">
            <Sparkles className="absolute right-[-10px] top-[-10px] w-24 h-24 text-white/5 rotate-12" />
            <div className="relative z-10">
              <p className="text-[10px] text-white/60 font-medium uppercase tracking-wider mb-1">Эффективность AI-Агентов</p>
              <div className="flex items-end gap-3 mb-2">
                <p className="text-3xl font-bold text-[#8B7355]">34%</p>
                <p className="text-xs text-white/80 pb-1.5">заявок маршрутизировано без диспетчера</p>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5"><div className="bg-[#8B7355] h-1.5 rounded-full w-[34%]" /></div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <MetricCard label="Новых заявок" value={dashboardMetrics.newRequests} trend={dashboardMetrics.newRequestsTrend} suffix="" />
          <MetricCard label="Среднее время ответа" value={dashboardMetrics.avgResponseTime} trend={dashboardMetrics.avgResponseTrend} suffix=" ч" />
          <MetricCard label="SLA выполнение" value={dashboardMetrics.slaCompliance} trend={dashboardMetrics.slaTrend} suffix="%" />
          <MetricCard label="Просроченных" value={dashboardMetrics.overdue} trend={dashboardMetrics.overdueTrend} suffix="" alert={dashboardMetrics.overdue > 0} />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCreateRequest}
            className="flex-1 bg-[#1D252D] text-white rounded-full py-3 text-sm font-semibold transition-opacity hover:opacity-90 flex items-center justify-center gap-2 active:scale-[0.97] shadow-[0_8px_20px_rgba(29,37,45,0.25)]"
          >
            <Plus className="w-4 h-4" />
            Создать заявку
          </button>
          <button className="flex-1 bg-white text-[#1D252D] rounded-full py-3 text-sm font-semibold border border-gray-200 transition-colors hover:bg-gray-50 flex items-center justify-center gap-2 active:scale-[0.97]">
            <FileText className="w-4 h-4" />
            Отчёт за неделю
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#1D252D]">Последние заявки</h2>
            <button onClick={onNavigateRequests} className="text-xs text-[#8B7355] font-medium">Все заявки →</button>
          </div>
          <div className="space-y-2.5">
            {latestRequests.map((req, i) => (
              <button
                key={req.id}
                onClick={() => onOpenRequest(req)}
                className="w-full bg-white rounded-2xl p-4 text-left shadow-sm border border-gray-50 transition-shadow hover:shadow-md animate-[fadeIn_0.2s_ease-out]"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#1D252D]">#{req.number}</span>
                    <span className="text-xs text-[#1D252D]/50">{req.type}</span>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[req.status]}`}>
                    {statusLabels[req.status]}
                  </span>
                </div>
                <p className="text-xs text-[#1D252D]/70 line-clamp-1">{req.description}</p>
                <p className="text-[10px] text-[#1D252D]/40 mt-1.5">{getComplexName(req.complexId)} · кв. {req.apartment}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, trend, suffix, alert }: {
  label: string; value: number; trend: number; suffix: string; alert?: boolean
}) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    if (value === 0) { setDisplay(0); return }
    const duration = 600
    const steps = 20
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) { setDisplay(value); clearInterval(timer) }
      else setDisplay(Number.isInteger(value) ? Math.round(current) : Number(current.toFixed(1)))
    }, duration / steps)
    return () => clearInterval(timer)
  }, [value])

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
      <p className="text-[10px] text-[#1D252D]/50 font-medium mb-1">{label}</p>
      <p className={`text-2xl font-bold ${alert ? 'text-red-600' : 'text-[#1D252D]'}`}>
        {display}{suffix}
      </p>
      <div className="flex items-center gap-1 mt-1">
        {trend > 0 ? (
          <TrendingUp className="w-3 h-3 text-green-500" />
        ) : trend < 0 ? (
          <TrendingDown className="w-3 h-3 text-red-500" />
        ) : null}
        <span className={`text-[10px] font-medium ${trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-400'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      </div>
    </div>
  )
}
