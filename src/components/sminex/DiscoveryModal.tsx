import { useState } from 'react'
import { X, TrendingUp, Lightbulb, DollarSign, ExternalLink } from 'lucide-react'

interface DiscoveryModalProps {
  onClose: () => void
}

type Tab = 'market' | 'solutions' | 'monetization'

const tabs: { id: Tab; label: string; icon: typeof TrendingUp }[] = [
  { id: 'market', label: 'Рынок', icon: TrendingUp },
  { id: 'solutions', label: 'Решения', icon: Lightbulb },
  { id: 'monetization', label: 'Монетизация', icon: DollarSign },
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

const players = [
  { monogram: 'SM', name: 'Sminex', features: 'Премиум CRM, консьерж, умный дом Larnitech', metric: 'NPS 4.8', color: 'bg-[#1D252D]' },
  { monogram: 'CG', name: 'Capital Group', features: 'Приложение Capital Life, сервисы и lifestyle', metric: '15K+ резидентов', color: 'bg-[#8B7355]' },
  { monogram: 'ET', name: 'Etalon + МТС', features: 'Умный дом из коробки, MTS IoT-платформа', metric: '100% smart home', color: 'bg-[#4A5568]' },
  { monogram: 'MR', name: 'MR Group', features: 'Приложение RESIDENTS, бронирование, оплата', metric: '1M+ м² в управлении', color: 'bg-[#A09484]' },
  { monogram: 'SD', name: 'Самолёт + Domiland', features: 'Суперапп для жизни, маркетплейс услуг', metric: '1.4M пользователей', color: 'bg-[#2D3748]' },
]

const marketStats = [
  { value: '100%', label: 'Smart home в новостройках к 2025' },
  { value: '96%', label: 'Заявок через приложение (Сбер данные)' },
  { value: '+100%', label: 'Рост платных заявок за год' },
  { value: '1.4M', label: 'Пользователей суперапп Домиленд' },
]

const sources = [
  { name: 'Habr — Умный дом Etalon + MTS', url: 'https://habr.com/ru/companies/mts/articles/' },
  { name: 'RBC — Цифровизация девелоперов', url: 'https://www.rbc.ru/business/' },
  { name: 'CNews — PropTech в России 2024', url: 'https://www.cnews.ru/reviews/' },
  { name: 'Forbes — Самолёт и Домиленд', url: 'https://www.forbes.ru/tekhnologii/' },
  { name: 'ComNews — Smart home рынок', url: 'https://www.comnews.ru/' },
]

function MarketTab() {
  return (
    <div className="space-y-6">
      {/* Players */}
      <div>
        <h3 className="text-sm font-bold text-[#1D252D] mb-3">Ключевые игроки</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {players.map(p => (
            <div key={p.name} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex gap-3">
              <div className={`w-10 h-10 rounded-full ${p.color} flex items-center justify-center shrink-0`}>
                <span className="text-[11px] font-bold text-white tracking-tight">{p.monogram}</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-bold text-[#1D252D]">{p.name}</p>
                  <span className="text-[10px] bg-[#8B7355]/10 text-[#8B7355] px-1.5 py-0.5 rounded-full font-medium">{p.metric}</span>
                </div>
                <p className="text-xs text-[#1D252D]/60 leading-relaxed">{p.features}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div>
        <h3 className="text-sm font-bold text-[#1D252D] mb-3">Цифры рынка</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {marketStats.map(s => (
            <div key={s.value} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 text-center">
              <p className="text-xl font-bold text-[#8B7355]">{s.value}</p>
              <p className="text-[10px] text-[#1D252D]/50 mt-1 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sources */}
      <div>
        <h3 className="text-sm font-bold text-[#1D252D] mb-3">Источники</h3>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 space-y-2">
          {sources.map(s => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-[#8B7355] hover:text-[#6B5A42] transition-colors"
            >
              <ExternalLink className="w-3 h-3 shrink-0" />
              {s.name}
            </a>
          ))}
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
