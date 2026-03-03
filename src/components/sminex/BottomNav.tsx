import { Home, Sparkles, User, ListTodo, BarChart3, Bell } from 'lucide-react'
import { type UserRole } from '../../data/sminex'

export type Tab = 'dashboard' | 'services' | 'requests' | 'analytics' | 'notifications' | 'profile'

interface BottomNavProps {
  active: Tab
  onNavigate: (tab: Tab) => void
  requestsBadge?: number
  notifBadge?: number
  userRole: UserRole
  onOpenAiConcierge?: () => void
}

export default function BottomNav({ active, onNavigate, requestsBadge, notifBadge, userRole, onOpenAiConcierge }: BottomNavProps) {
  const allTabs: { id: Tab; label: string; icon: typeof Home; roles: UserRole[] }[] = [
    { id: 'dashboard', label: 'Главная', icon: Home, roles: ['resident', 'manager', 'director'] },
    { id: 'requests', label: 'Заявки', icon: ListTodo, roles: ['manager', 'director'] },
    { id: 'notifications', label: 'Уведомления', icon: Bell, roles: ['manager', 'director'] },
    { id: 'analytics', label: 'Аналитика', icon: BarChart3, roles: ['manager', 'director'] },
    { id: 'profile', label: 'Профиль', icon: User, roles: ['resident', 'manager', 'director'] },
  ]

  const tabs = allTabs.filter(t => t.roles.includes(userRole))
  const isResident = userRole === 'resident'

  return (
    <nav className="absolute bottom-4 left-4 right-4 z-30 flex items-center justify-around rounded-[1.75rem] bg-white/80 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/50 px-2 py-2">
      {/* AI Concierge floating button — resident only */}
      {isResident && (
        <div className="absolute left-1/2 -top-6 -translate-x-1/2">
          <button
            onClick={onOpenAiConcierge}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#1D252D] to-[#8B7355] flex items-center justify-center text-white shadow-[0_8px_24px_rgba(139,115,85,0.4)] transition-transform hover:scale-105 active:scale-95 border-2 border-white/20"
          >
            <Sparkles className="w-6 h-6" />
          </button>
        </div>
      )}

      {tabs.map(tab => {
        const isActive = active === tab.id
        const Icon = tab.icon
        const badge = tab.id === 'requests' ? requestsBadge : tab.id === 'notifications' ? notifBadge : undefined

        return (
          <button
            key={tab.id}
            data-tab={tab.id}
            onClick={() => onNavigate(tab.id)}
            className="flex flex-col items-center gap-0.5 relative transition-all duration-200"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
              isActive
                ? 'bg-[#1D252D] text-white scale-110 shadow-lg shadow-[#1D252D]/25'
                : 'text-gray-400 hover:text-gray-600'
            }`}>
              <Icon
                className="w-[18px] h-[18px]"
                fill={isActive ? 'currentColor' : 'none'}
                strokeWidth={1.5}
              />
            </div>
            {badge !== undefined && badge > 0 && (
              <span className="absolute -top-0.5 right-0 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-white/80">
                {badge}
              </span>
            )}
            {isActive && (
              <span className="text-[9px] font-semibold text-[#1D252D] animate-[fadeIn_0.15s_ease-out]">{tab.label}</span>
            )}
          </button>
        )
      })}
    </nav>
  )
}
