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
