import { useState } from 'react'
import { X, TrendingUp, Lightbulb, Smartphone } from 'lucide-react'

interface DiscoveryModalProps {
  onClose: () => void
}

type Tab = 'market' | 'solutions' | 'monetization'

const tabs: { id: Tab; label: string; icon: typeof TrendingUp }[] = [
  { id: 'market', label: 'R&D Vision', icon: Lightbulb },
  { id: 'solutions', label: 'UX & Фичи', icon: Smartphone },
  { id: 'monetization', label: 'Бизнес-модель', icon: TrendingUp },
]

export default function DiscoveryModal({ onClose }: DiscoveryModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('market')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease-out]">
      <div className="absolute inset-0 bg-[#1D252D]/95 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#F5F1EC] rounded-3xl p-6 md:p-8 animate-[scaleIn_0.3s_ease-out]">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#1D252D]/40 hover:text-[#1D252D] transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#1D252D] mb-1">Product Discovery</h2>
          <p className="text-sm text-[#1D252D]/50">Обоснование продуктовых решений</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1 mb-6 shadow-sm">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === t.id
                  ? 'bg-[#1D252D] text-white shadow-sm'
                  : 'text-[#1D252D]/50 hover:text-[#1D252D]/80'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'market' && <MarketTab />}
        {activeTab === 'solutions' && <SolutionsTab />}
        {activeTab === 'monetization' && <MonetizationTab />}
      </div>
    </div>
  )
}

/* ── Market Tab ── */

function MarketTab() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-[#1D252D] to-[#2D3748] rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B7355]/20 rounded-full blur-3xl" />
        <h3 className="text-lg font-bold mb-2 relative z-10">Смена парадигмы: От кнопок к Агентам</h3>
        <p className="text-sm text-white/70 leading-relaxed relative z-10">
          Текущие приложения УК — это просто цифровые формы заявок. Премиум-клиент не хочет искать нужную категорию в меню. Он хочет написать "Сделайте уборку завтра и забронируйте хаммам на вечер", а система должна сама раскидать это по базам и слотам.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-red-100">
          <h4 className="text-sm font-bold text-[#1D252D] mb-2 flex items-center gap-2"><span className="text-red-500">Боль УК</span></h4>
          <ul className="space-y-2 text-xs text-[#1D252D]/70">
            <li>• 70% времени диспетчера уходит на рутинную маршрутизацию заявок.</li>
            <li>• Низкая конверсия в платные доп. услуги (клининг, химчистка) из-за сложного UX.</li>
            <li>• Нет предиктивной аналитики по поломкам инфраструктуры.</li>
          </ul>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
          <h4 className="text-sm font-bold text-[#1D252D] mb-2 flex items-center gap-2"><span className="text-green-600">R&D Решение</span></h4>
          <ul className="space-y-2 text-xs text-[#1D252D]/70">
            <li>• Внедрение LLM-агента (Agentic Workflow) для парсинга намерений резидента.</li>
            <li>• Бесшовная покупка услуг прямо в чате с ассистентом.</li>
            <li>• Дашборды для директора с AI-анализом причин роста заявок.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

/* ── Solutions Tab ── */

const solutions = [
  {
    feature: 'Мульти-квартира',
    reason: 'У премиум-резидентов 2-3 объекта. Переключение в одном приложении — must-have',
    benchmark: 'Capital Group, Самолёт',
  },
  {
    feature: 'Умный дом + сценарии',
    reason: '100% новостроек к 2025 — smart home. Сценарии «Ухожу» / «Сон» дают retention',
    benchmark: 'Etalon+МТС (Larnitech)',
  },
  {
    feature: 'Привилегии партнёров',
    reason: 'Премиальная аудитория ожидает lifestyle-бонусы. Растёт LTV через экосистему',
    benchmark: 'Capital Life, Самолёт Клуб',
  },
  {
    feature: 'Бронирование удобств',
    reason: 'Парковка, спортзал, переговорка — высокий спрос, низкая автоматизация. Снижает нагрузку на УК',
    benchmark: 'MR Group RESIDENTS',
  },
  {
    feature: 'Посылки и шкафчики',
    reason: 'Маркетплейсы дали +300% доставок. Шкафчики уменьшают жалобы на 60%',
    benchmark: 'PickPoint интеграции',
  },
  {
    feature: 'Схема квартиры',
    reason: 'Визуализация помогает создавать заявки точнее. Снижает дублирование на 25%',
    benchmark: 'Уникальная фича',
  },
  {
    feature: 'Консьерж-услуги',
    reason: 'Химчистка, вода, уборка — высокая маржинальность для УК. До +25% к ARPU',
    benchmark: 'Sminex, ЖК бизнес-класса',
  },
  {
    feature: 'Домофон и камеры',
    reason: 'Безопасность — топ-1 приоритет резидентов. Видеозвонки на телефон = wow-эффект',
    benchmark: 'Etalon, MR Group',
  },
]

function SolutionsTab() {
  return (
    <div className="space-y-2">
      <p className="text-xs text-[#1D252D]/50 mb-3">Каждое решение основано на анализе конкурентов и потребностях резидентов</p>
      {solutions.map(s => (
        <div key={s.feature} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <p className="text-sm font-bold text-[#1D252D]">{s.feature}</p>
            <span className="text-[10px] bg-[#8B7355]/10 text-[#8B7355] px-2 py-0.5 rounded-full font-medium whitespace-nowrap shrink-0">
              {s.benchmark}
            </span>
          </div>
          <p className="text-xs text-[#1D252D]/60 leading-relaxed">{s.reason}</p>
        </div>
      ))}
    </div>
  )
}

/* ── Monetization Tab ── */

const revenueChannels = [
  { title: 'Маркетплейс услуг', desc: 'Комиссия с каждой транзакции (клининг, ремонт, доставка)', metric: '5–15%', metricLabel: 'комиссии' },
  { title: 'Подписки Premium', desc: 'Расширенный умный дом, видеонаблюдение, приоритетные заявки', metric: '₽990', metricLabel: '/мес' },
  { title: 'Доп. услуги УК', desc: 'Химчистка, вода, мелкий ремонт — прямая продажа через приложение', metric: '+25%', metricLabel: 'к ARPU' },
  { title: 'Аренда парковки', desc: 'Почасовая и помесячная аренда гостевых мест через приложение', metric: '₽4K', metricLabel: '/мес за место' },
  { title: 'Партнёрские комиссии', desc: 'Рестораны, фитнес, салоны — CPA за привлечённого клиента', metric: '10–20%', metricLabel: 'от чека' },
  { title: 'Реклама 1 этажа', desc: 'Продвижение бизнесов в приложении с геотаргетингом на резидентов', metric: '₽15K', metricLabel: '/мес за слот' },
]

const indirectBenefits = [
  { title: 'Репутация бренда', desc: 'Цифровой сервис → рост NPS → рекомендации → снижение CAC' },
  { title: 'Удержание резидентов', desc: 'Экосистема услуг создаёт switching costs → снижение оттока' },
  { title: 'Рост стоимости м²', desc: 'Цифровой комфорт = аргумент при продаже, +3-5% к стоимости' },
]

function MonetizationTab() {
  return (
    <div className="space-y-6">
      {/* Revenue channels */}
      <div>
        <h3 className="text-sm font-bold text-[#1D252D] mb-3">Каналы дохода</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {revenueChannels.map(ch => (
            <div key={ch.title} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <p className="text-sm font-bold text-[#1D252D]">{ch.title}</p>
                <div className="text-right shrink-0">
                  <span className="text-sm font-bold text-[#8B7355]">{ch.metric}</span>
                  <span className="text-[10px] text-[#1D252D]/40 ml-0.5">{ch.metricLabel}</span>
                </div>
              </div>
              <p className="text-xs text-[#1D252D]/60 leading-relaxed">{ch.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Indirect */}
      <div>
        <h3 className="text-sm font-bold text-[#1D252D] mb-3">Косвенный доход</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {indirectBenefits.map(b => (
            <div key={b.title} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
              <p className="text-sm font-bold text-[#1D252D] mb-1">{b.title}</p>
              <p className="text-xs text-[#1D252D]/60 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
