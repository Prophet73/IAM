import { useRef, useEffect, useState } from 'react'
import { Home, ListTodo, BarChart3, User, Bell } from 'lucide-react'
import { type UserRole } from '../../data/sminex'

export type Tab = 'dashboard' | 'requests' | 'analytics' | 'notifications' | 'profile'

interface BottomNavProps {
  active: Tab
  onNavigate: (tab: Tab) => void
  requestsBadge?: number
  notifBadge?: number
  userRole: UserRole
}

export default function BottomNav({ active, onNavigate, requestsBadge, notifBadge, userRole }: BottomNavProps) {
  const allTabs: { id: Tab; label: string; icon: typeof Home; roles: UserRole[] }[] = [
    { id: 'dashboard', label: 'Главная', icon: Home, roles: ['resident', 'manager', 'director'] },
    { id: 'requests', label: userRole === 'resident' ? 'Мои заявки' : 'Заявки', icon: ListTodo, roles: ['resident', 'manager', 'director'] },
    { id: 'notifications', label: 'Уведомления', icon: Bell, roles: ['resident'] },
    { id: 'analytics', label: 'Аналитика', icon: BarChart3, roles: ['manager', 'director'] },
    { id: 'profile', label: 'Профиль', icon: User, roles: ['resident', 'manager', 'director'] },
  ]

  const tabs = allTabs.filter(t => t.roles.includes(userRole))
  const activeIndex = tabs.findIndex(t => t.id === active)

  const navRef = useRef<HTMLElement>(null)
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  useEffect(() => {
    if (!navRef.current || activeIndex < 0) return
    const buttons = navRef.current.querySelectorAll<HTMLButtonElement>('[data-tab]')
    const btn = buttons[activeIndex]
    if (!btn) return
    const navRect = navRef.current.getBoundingClientRect()
    const btnRect = btn.getBoundingClientRect()
    setIndicator({
      left: btnRect.left - navRect.left,
      width: btnRect.width,
    })
  }, [activeIndex, tabs.length])

  return (
    <nav ref={navRef} className="flex items-center justify-around bg-white/95 backdrop-blur-sm border-t border-gray-100/80 px-2 py-2 shrink-0 relative">
      {/* Sliding indicator */}
      {indicator.width > 0 && (
        <div
          className="absolute top-1.5 h-[calc(100%-12px)] bg-[#F5F1EC] rounded-xl transition-all duration-300 ease-out"
          style={{ left: indicator.left, width: indicator.width }}
        />
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
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200 relative z-10 ${
              isActive ? 'text-[#1D252D]' : 'text-gray-400'
            }`}
          >
            <Icon
              className={`w-6 h-6 transition-transform duration-200 ${isActive ? 'scale-105' : 'scale-100'}`}
              fill={isActive ? 'currentColor' : 'none'}
              strokeWidth={1.5}
            />
            {badge !== undefined && badge > 0 && (
              <span className="absolute -top-0.5 right-1 bg-red-500 text-white text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                {badge}
              </span>
            )}
            <span className={`text-[10px] font-medium transition-all duration-200 ${isActive ? 'text-[#1D252D]' : ''}`}>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
