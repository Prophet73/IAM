Ты — Senior Product Engineer. Твоя задача — обновить концепт приложения Sminex (файлы в src/components/sminex), чтобы он транслировал R&D-вижн: "Мы делаем не просто приложение с кнопками, а умную экосистему с AI-агентами для резидентов и автоматизацией для УК".

Выполни 4 шага:

Шаг 1. Обновление стартового экрана (src/components/sminex/RoleSelectScreen.tsx)
Добавь "Манифест" над выбором ролей. Замени код компонента на этот:
```tsx
import { Home, ClipboardList, Building2, Sparkles, Network } from 'lucide-react'
import { users, type UserRole } from '../../data/sminex'

interface RoleSelectScreenProps {
  onSelectRole: (role: UserRole) => void
}

const roleConfig: Record<UserRole, { icon: typeof Home; accent: string; iconBg: string }> = {
  resident: { icon: Home, accent: 'border-l-blue-400', iconBg: 'bg-[#1D252D]' },
  manager: { icon: ClipboardList, accent: 'border-l-amber-400', iconBg: 'bg-[#8B7355]' },
  director: { icon: Building2, accent: 'border-l-emerald-400', iconBg: 'bg-[#1D252D]' },
}

export default function RoleSelectScreen({ onSelectRole }: RoleSelectScreenProps) {
  return (
    <div className="flex-1 flex flex-col px-6 py-8 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="text-center mb-6 animate-[fadeIn_0.4s_ease-out_both]">
        <h1 className="text-2xl font-bold tracking-[0.25em] text-[#1D252D]">SMINEX</h1>
        <p className="text-[10px] text-[#1D252D]/50 font-bold uppercase tracking-widest mt-1">R&D Concept 2026</p>
      </div>

      {/* R&D Manifesto Card */}
      <div className="bg-[#1D252D] rounded-3xl p-5 mb-8 text-white shadow-xl relative overflow-hidden animate-[slideUp_0.4s_ease-out_0.1s_both]">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#8B7355]/20 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-2 mb-3 relative z-10">
          <Sparkles className="w-5 h-5 text-[#8B7355]" />
          <h2 className="text-sm font-bold">От кнопок — к Агентам</h2>
        </div>
        <p className="text-xs text-white/70 leading-relaxed mb-4 relative z-10">
          Современный премиум-сервис — это не бесконечные меню и формы. Это экосистема, где <span className="text-white font-semibold">AI-Дворецкий</span> организует быт резидента, а <span className="text-white font-semibold">LLM-пайплайны</span> снимают до 40% рутинной нагрузки с УК.
        </p>
        <div className="flex gap-2 relative z-10">
          <span className="px-2 py-1 rounded bg-white/10 text-[9px] font-medium border border-white/5 flex items-center gap-1"><Network className="w-3 h-3 text-[#8B7355]"/> Agentic Workflow</span>
          <span className="px-2 py-1 rounded bg-white/10 text-[9px] font-medium border border-white/5 flex items-center gap-1"><Building2 className="w-3 h-3 text-[#8B7355]"/> Smart Management</span>
        </div>
      </div>

      <p className="text-xs text-[#1D252D]/50 font-bold uppercase tracking-wider mb-4 px-2 animate-[fadeIn_0.4s_ease-out_0.2s_both]">Выберите интерфейс</p>

      {/* Role cards */}
      <div className="w-full space-y-3 pb-8">
        {users.map((user, i) => {
          const config = roleConfig[user.role]
          const Icon = config.icon
          return (
            <button
              key={user.id}
              onClick={() => onSelectRole(user.role)}
              className={`w-full bg-white rounded-2xl p-4 text-left shadow-sm border border-gray-100 border-l-4 ${config.accent} transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97] flex items-center gap-4 animate-[fadeIn_0.4s_ease-out_both]`}
              style={{ animationDelay: `${300 + i * 80}ms` }}
            >
              <div className={`w-12 h-12 rounded-full ${config.iconBg} flex items-center justify-center shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#1D252D]">{user.roleLabel}</p>
                <p className="text-xs text-[#1D252D]/70 font-medium">{user.name}</p>
                <p className="text-[10px] text-[#1D252D]/40 mt-1 leading-tight">{user.description}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
Шаг 2. Обновление продуктового видения в src/components/sminex/DiscoveryModal.tsx
Замени табы и вкладку "Рынок" на "Vision", добавив фокус на R&D:
Найди массив tabs и замени его на:
code
Tsx
const tabs: { id: Tab; label: string; icon: typeof TrendingUp }[] =[
  { id: 'market', label: 'R&D Vision', icon: Lightbulb },
  { id: 'solutions', label: 'UX & Фичи', icon: Smartphone },
  { id: 'monetization', label: 'Бизнес-модель', icon: TrendingUp },
]
Не забудь добавить импорт Smartphone из lucide-react.
Замени компонент <MarketTab /> на следующий код:
code
Tsx
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
Шаг 3. Добавление AI и интеграций в src/components/sminex/ArchitectureModal.tsx
В диаграмме микросервисов нужно показать AI-слой и слой интеграций с железом/1С.
В ArchitectureModal.tsx найди блок {/* Microservices */} и замени его вместе с нижними блоками:
code
Tsx
{/* AI Layer */}
          <div className="flex justify-center mb-2">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-xl px-8 py-3 flex items-center gap-3 shadow-lg border border-purple-500/30">
              <Sparkles className="w-5 h-5 text-purple-300" />
              <div className="text-center text-white">
                <p className="text-sm font-bold">AI Agent Layer</p>
                <p className="text-[10px] text-purple-200">LLM Routing (Gemini/Claude) + RAG</p>
              </div>
            </div>
          </div>
          <Arrow />

          {/* Microservices */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-2xl mx-auto">
            <DiagramBlock icon={Layers} label="Requests" sub="Service" color="bg-white text-[#1D252D]" small />
            <DiagramBlock icon={Shield} label="Users" sub="Service" color="bg-white text-[#1D252D]" small />
            <DiagramBlock icon={Zap} label="IoT & Home" sub="Service" color="bg-white text-[#1D252D]" small />
            <DiagramBlock icon={Server} label="Analytics" sub="Service" color="bg-white text-[#1D252D]" small />
          </div>
          <Arrow />

          {/* Infrastructure & Integrations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-3xl mx-auto mt-4">
            <div className="bg-[#A09484]/10 rounded-xl p-4 border border-[#A09484]/30 text-center">
              <p className="text-xs font-bold text-[#1D252D] mb-1">Message Broker</p>
              <p className="text-[10px] text-[#1D252D]/60 font-mono bg-white rounded px-2 py-1 inline-block">Apache Kafka</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 text-center">
              <p className="text-xs font-bold text-[#1D252D] mb-1">Databases</p>
              <p className="text-[10px] text-[#1D252D]/60 font-mono bg-white rounded px-2 py-1 inline-block">PostgreSQL + Redis</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border border-green-100 text-center">
              <p className="text-xs font-bold text-[#1D252D] mb-1">External Integrations</p>
              <p className="text-[10px] text-[#1D252D]/60 font-mono bg-white rounded px-2 py-1 inline-block">1C:ERP / Larnitech / СКУД</p>
            </div>
          </div>
Не забудь добавить импорт Sparkles из lucide-react.
Шаг 4. Дашборд директора: бизнес-метрики в src/components/sminex/DashboardScreen.tsx
В компоненте ManagerDashboard (когда user.role === 'director') добавь карточку с AI-метрикой.
Внутри ManagerDashboard перед <div className="flex gap-3"> вставь:
code
Tsx
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
Убедись, что нет синтаксических ошибок и все нужные иконки импортированы.