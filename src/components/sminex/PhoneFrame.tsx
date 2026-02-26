import { type ReactNode } from 'react'
import { ArrowLeft, Layers, Search } from 'lucide-react'

interface PhoneFrameProps {
  children: ReactNode
  onBack: () => void
  onOpenArchitecture: () => void
  onOpenDiscovery: () => void
}

export default function PhoneFrame({ children, onBack, onOpenArchitecture, onOpenDiscovery }: PhoneFrameProps) {
  return (
    <div className="min-h-screen bg-[#F5F1EC] flex flex-col items-center justify-center font-[Montserrat] p-4">
      {/* Top controls */}
      <div className="hidden md:flex items-center gap-4 mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#1D252D]/60 hover:text-[#1D252D] transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к портфолио
        </button>
        <button
          onClick={onOpenArchitecture}
          className="flex items-center gap-2 bg-white text-[#1D252D] rounded-full px-4 py-2 text-sm font-medium shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <Layers className="w-4 h-4 text-[#8B7355]" />
          Архитектура системы
        </button>
        <button
          onClick={onOpenDiscovery}
          className="flex items-center gap-2 bg-white text-[#1D252D] rounded-full px-4 py-2 text-sm font-medium shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <Search className="w-4 h-4 text-[#8B7355]" />
          Продуктовый анализ
        </button>
      </div>

      {/* Phone frame — visible on md+ */}
      <div className="hidden md:flex flex-col w-[390px] h-[844px] bg-[#1D252D] rounded-[3rem] p-3 shadow-2xl">
        {/* Notch */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-28 h-6 bg-black rounded-full" />
        </div>
        {/* Screen */}
        <div className="flex-1 bg-[#F5F1EC] rounded-[2.2rem] overflow-hidden flex flex-col relative">
          {/* Status bar */}
          <div className="flex items-center justify-between px-8 py-2 text-[#1D252D] text-xs font-semibold">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.237 4.237 0 00-6 0zm-4-4l2 2a7.074 7.074 0 0110 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/></svg>
            </div>
          </div>
          {/* Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {children}
          </div>
        </div>
      </div>

      {/* Mobile — full screen */}
      <div className="md:hidden fixed inset-0 bg-[#F5F1EC] flex flex-col overflow-hidden relative">
        {children}
      </div>
    </div>
  )
}
