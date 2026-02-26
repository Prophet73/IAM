import { ChevronLeft } from 'lucide-react'

interface SubScreenHeaderProps {
  title: string
  onBack: () => void
  rightElement?: React.ReactNode
}

export default function SubScreenHeader({ title, onBack, rightElement }: SubScreenHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-5 pt-3 pb-2">
      <button
        onClick={onBack}
        className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-[#1D252D]/60 hover:text-[#1D252D] hover:bg-white transition-colors shadow-sm"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <h1 className="flex-1 text-lg font-bold text-[#1D252D]">{title}</h1>
      {rightElement}
    </div>
  )
}
