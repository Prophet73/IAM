import { Home, ClipboardList, Building2 } from 'lucide-react'
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
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-2 animate-[fadeIn_0.4s_ease-out_both]">
        <h1 className="text-2xl font-bold tracking-[0.25em] text-[#1D252D]">SMINEX</h1>
      </div>
      <p className="text-xs text-[#1D252D]/50 font-medium mb-10 animate-[fadeIn_0.4s_ease-out_0.1s_both]">CRM жилых комплексов</p>

      {/* Role cards */}
      <div className="w-full space-y-3">
        {users.map((user, i) => {
          const config = roleConfig[user.role]
          const Icon = config.icon
          return (
            <button
              key={user.id}
              onClick={() => onSelectRole(user.role)}
              className={`w-full bg-white rounded-2xl p-4 text-left shadow-sm border border-gray-100 border-l-4 ${config.accent} transition-all hover:shadow-md active:scale-[0.97] flex items-center gap-4 animate-[fadeIn_0.4s_ease-out_both]`}
              style={{ animationDelay: `${200 + i * 80}ms` }}
            >
              <div className={`w-12 h-12 rounded-full ${config.iconBg} flex items-center justify-center shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#1D252D]">{user.roleLabel}</p>
                <p className="text-xs text-[#1D252D]/70 font-medium">{user.name}</p>
                <p className="text-[10px] text-[#1D252D]/40 mt-0.5">{user.description}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Footer */}
      <p className="text-[10px] text-[#1D252D]/30 mt-10 animate-[fadeIn_0.4s_ease-out_0.6s_both]">Демо-прототип · данные вымышлены</p>
    </div>
  )
}
