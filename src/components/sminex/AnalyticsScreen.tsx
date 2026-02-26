import { useState, useEffect } from 'react'
import { analyticsData } from '../../data/sminex'

const periods = ['Январь 2026', 'Февраль 2026', 'Март 2026']

// Muted accent colors for bars (one per day)
const barColors = ['#1D252D', '#2D3748', '#4A5568', '#1D252D', '#2D3748', '#8B7355', '#A09484']

export default function AnalyticsScreen() {
  const [periodIndex, setPeriodIndex] = useState(1) // February by default
  const maxDayCount = Math.max(...analyticsData.requestsByDay.map(d => d.count))
  const totalByType = analyticsData.requestsByType.reduce((sum, t) => sum + t.count, 0)

  let gradientParts: string[] = []
  let cumulative = 0
  for (const t of analyticsData.requestsByType) {
    const pct = (t.count / totalByType) * 100
    gradientParts.push(`${t.color} ${cumulative}% ${cumulative + pct}%`)
    cumulative += pct
  }
  const conicGradient = `conic-gradient(${gradientParts.join(', ')})`

  const cyclePeriod = () => {
    setPeriodIndex(prev => (prev + 1) % periods.length)
  }

  return (
    <div className="flex-1 overflow-y-auto animate-[fadeIn_0.2s_ease-out]">
      <div className="px-5 pt-4 pb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#1D252D]">Аналитика</h1>
          <button
            onClick={cyclePeriod}
            className="bg-white rounded-full px-3.5 py-1.5 text-xs font-medium text-[#1D252D] shadow-sm border border-gray-100 transition-all hover:shadow-md active:scale-[0.97]"
          >
            {periods[periodIndex]}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <KpiCard label="Всего заявок" value={analyticsData.totalRequests} />
          <KpiCard label="Среднее закрытие" value={analyticsData.avgCloseTime} suffix=" ч" />
          <KpiCard label="Удовлетворённость" value={analyticsData.satisfaction} suffix="/5" accent />
          <KpiCard label="SLA соблюдение" value={analyticsData.slaCompliance} suffix="%" />
        </div>

        {/* Bar chart */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
          <p className="text-xs font-semibold text-[#1D252D]/50 mb-4">Заявки по дням недели</p>
          <div className="flex items-end gap-2 h-28">
            {analyticsData.requestsByDay.map((d, i) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-medium text-[#1D252D]">{d.count}</span>
                <AnimatedBar height={(d.count / maxDayCount) * 100} delay={i * 80} color={barColors[i]} />
                <span className="text-[10px] text-[#1D252D]/40">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Donut chart */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
          <p className="text-xs font-semibold text-[#1D252D]/50 mb-4">Типы заявок</p>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 shrink-0">
              <div
                className="w-24 h-24 rounded-full"
                style={{ background: conicGradient }}
              />
              {/* Center hole for donut */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
                  <span className="text-sm font-bold text-[#1D252D]">{totalByType}</span>
                </div>
              </div>
            </div>
            <div className="space-y-1.5 flex-1">
              {analyticsData.requestsByType.map(t => (
                <div key={t.type} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                  <span className="text-[10px] text-[#1D252D]/70 flex-1">{t.type}</span>
                  <span className="text-[10px] font-medium text-[#1D252D]">{t.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top categories */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
          <p className="text-xs font-semibold text-[#1D252D]/50 mb-3">Топ-3 категории проблем</p>
          <div className="space-y-3">
            {analyticsData.topCategories.map((cat, i) => (
              <div key={cat.category} className="flex items-center gap-3">
                <span className="text-sm font-bold text-[#1D252D]/20 w-5">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-[#1D252D]">{cat.category}</p>
                    <span className={`text-[10px] font-medium ${cat.trend > 0 ? 'text-red-500' : cat.trend < 0 ? 'text-green-500' : 'text-gray-400'}`}>
                      {cat.trend > 0 ? '+' : ''}{cat.trend}%
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 bg-[#F5F1EC] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1D252D]/20 rounded-full transition-all duration-500"
                      style={{ width: `${(cat.count / analyticsData.topCategories[0].count) * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[#1D252D]/40 mt-0.5">{cat.count} заявок</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function AnimatedBar({ height, delay, color }: { height: number; delay: number; color: string }) {
  const [h, setH] = useState(0)
  useEffect(() => {
    const timer = setTimeout(() => setH(height), delay + 100)
    return () => clearTimeout(timer)
  }, [height, delay])
  return (
    <div
      className="w-full rounded-t-lg transition-all duration-500 ease-out"
      style={{ height: `${h}%`, backgroundColor: color }}
    />
  )
}

function KpiCard({ label, value, suffix, accent }: {
  label: string; value: number; suffix?: string; accent?: boolean
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
      <p className={`text-2xl font-bold ${accent ? 'text-[#8B7355]' : 'text-[#1D252D]'}`}>
        {display}{suffix ?? ''}
      </p>
    </div>
  )
}
