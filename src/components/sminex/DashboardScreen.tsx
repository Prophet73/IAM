import { useState, useEffect } from 'react'
import { Plus, FileText, TrendingUp, TrendingDown, Video, Camera, Home, Sparkles, Receipt, Car, CloudSun, LayoutGrid, CalendarCheck, Package, Star, ChevronDown } from 'lucide-react'
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

  const mainTiles: { icon: React.ReactNode; label: string; screen: SubScreen; iconBg: string; iconColor: string }[] = [
    { icon: <Video className="w-5 h-5" />, label: 'Домофон', screen: 'intercom', iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
    { icon: <Camera className="w-5 h-5" />, label: 'Камеры', screen: 'cameras', iconBg: 'bg-slate-100', iconColor: 'text-slate-600' },
    { icon: <Home className="w-5 h-5" />, label: 'Умный дом', screen: 'smart-home', iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
    { icon: <Sparkles className="w-5 h-5" />, label: 'Услуги', screen: 'services', iconBg: 'bg-violet-50', iconColor: 'text-violet-600' },
    { icon: <Receipt className="w-5 h-5" />, label: 'Счета', screen: 'bills', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { icon: <Car className="w-5 h-5" />, label: 'Парковка', screen: 'parking', iconBg: 'bg-orange-50', iconColor: 'text-orange-600' },
  ]

  const extraTiles: { icon: React.ReactNode; label: string; screen: SubScreen; accent?: boolean }[] = [
    { icon: <Star className="w-4 h-4" />, label: 'Привилегии', screen: 'privileges', accent: true },
    { icon: <LayoutGrid className="w-4 h-4" />, label: 'Схема', screen: 'floor-plan' },
    { icon: <CalendarCheck className="w-4 h-4" />, label: 'Бронь', screen: 'booking' },
    { icon: <Package className="w-4 h-4" />, label: 'Посылки', screen: 'packages' },
  ]

  return (
    <div className="flex-1 overflow-y-auto animate-[fadeIn_0.2s_ease-out]">
      <div className="px-5 pt-4 pb-6 space-y-4">
        {/* Header: greeting + weather + avatar */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-[#1D252D]/50 text-xs font-medium">26 февраля</p>
              <span className="text-[#1D252D]/30 text-xs">·</span>
              <div className="flex items-center gap-1">
                <CloudSun className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-medium text-[#1D252D]/50">−3°C</span>
              </div>
            </div>
            <h1 className="text-xl font-bold text-[#1D252D]">Здравствуйте, {user.name.split(' ')[0]}</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#1D252D] flex items-center justify-center text-white font-bold text-sm">
            {user.initials}
          </div>
        </div>

        {/* Multi-apartment switcher */}
        {properties.length > 1 && activeProperty && (
          <div className="relative">
            <button
              onClick={() => setShowPropertyPicker(!showPropertyPicker)}
              className="w-full bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex items-center gap-3 transition-all hover:shadow-md active:scale-[0.99]"
            >
              <div className="w-9 h-9 rounded-xl bg-[#F5F1EC] flex items-center justify-center text-[#8B7355] text-xs font-bold shrink-0">
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
                      prop.id === activeProperty.id ? 'bg-[#F5F1EC]' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      prop.id === activeProperty.id ? 'bg-[#1D252D] text-white' : 'bg-[#F5F1EC] text-[#8B7355]'
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

        {/* Main service grid 2×3 */}
        <div className="grid grid-cols-3 gap-2.5">
          {mainTiles.map((tile, i) => (
            <button
              key={tile.label}
              onClick={() => onOpenSubScreen?.(tile.screen)}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex flex-col items-center gap-2 transition-all hover:shadow-md active:scale-[0.95] animate-[fadeIn_0.3s_ease-out_both]"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className={`w-10 h-10 rounded-xl ${tile.iconBg} flex items-center justify-center ${tile.iconColor} transition-transform duration-200`}>
                {tile.icon}
              </div>
              <span className="text-[11px] font-semibold text-[#1D252D]">{tile.label}</span>
            </button>
          ))}
        </div>

        {/* Extra services — horizontal scroll */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-hide">
          {extraTiles.map(tile => (
            <button
              key={tile.label}
              onClick={() => onOpenSubScreen?.(tile.screen)}
              className={`shrink-0 flex items-center gap-2 rounded-full px-4 py-2.5 transition-all active:scale-[0.97] ${
                tile.accent
                  ? 'bg-gradient-to-r from-[#1D252D] to-[#8B7355] text-white'
                  : 'bg-white text-[#1D252D] border border-gray-100 shadow-sm'
              }`}
            >
              <span className={tile.accent ? 'text-amber-300' : 'text-[#8B7355]'}>{tile.icon}</span>
              <span className="text-xs font-semibold">{tile.label}</span>
            </button>
          ))}
        </div>

        {/* New request button */}
        <button
          onClick={onCreateRequest}
          className="w-full bg-[#1D252D] text-white rounded-full py-3 text-sm font-semibold transition-opacity hover:opacity-90 flex items-center justify-center gap-2 active:scale-[0.97]"
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

        <div className="grid grid-cols-2 gap-3">
          <MetricCard label="Новых заявок" value={dashboardMetrics.newRequests} trend={dashboardMetrics.newRequestsTrend} suffix="" />
          <MetricCard label="Среднее время ответа" value={dashboardMetrics.avgResponseTime} trend={dashboardMetrics.avgResponseTrend} suffix=" ч" />
          <MetricCard label="SLA выполнение" value={dashboardMetrics.slaCompliance} trend={dashboardMetrics.slaTrend} suffix="%" />
          <MetricCard label="Просроченных" value={dashboardMetrics.overdue} trend={dashboardMetrics.overdueTrend} suffix="" alert={dashboardMetrics.overdue > 0} />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCreateRequest}
            className="flex-1 bg-[#1D252D] text-white rounded-full py-3 text-sm font-semibold transition-opacity hover:opacity-90 flex items-center justify-center gap-2 active:scale-[0.97]"
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
