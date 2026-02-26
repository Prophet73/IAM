import { X, Smartphone, Globe, Shield, Layers, Database, Server, GitBranch, Zap } from 'lucide-react'

interface ArchitectureModalProps {
  onClose: () => void
}

export default function ArchitectureModal({ onClose }: ArchitectureModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease-out]">
      <div className="absolute inset-0 bg-[#1D252D]/95 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#F5F1EC] rounded-3xl p-6 md:p-8 animate-[scaleIn_0.3s_ease-out]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#1D252D]/40 hover:text-[#1D252D] transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#1D252D] mb-2">Архитектура CRM Sminex</h2>
          <p className="text-sm text-[#1D252D]/50">Микросервисная архитектура с event-driven подходом</p>
        </div>

        {/* Diagram */}
        <div className="space-y-2 mb-8">
          {/* Mobile App */}
          <div className="flex justify-center">
            <DiagramBlock icon={Smartphone} label="Mobile App" sub="React Native" color="bg-[#1D252D] text-white" />
          </div>
          <Arrow />

          {/* API Gateway */}
          <div className="flex justify-center">
            <DiagramBlock icon={Globe} label="API Gateway" sub="Kong / Nginx" color="bg-[#8B7355] text-white" />
          </div>
          <Arrow />

          {/* Microservices */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-2xl mx-auto">
            <DiagramBlock icon={Layers} label="Requests" sub="Service" color="bg-white text-[#1D252D]" small />
            <DiagramBlock icon={Shield} label="Users" sub="Service" color="bg-white text-[#1D252D]" small />
            <DiagramBlock icon={Zap} label="Notif." sub="Service" color="bg-white text-[#1D252D]" small />
            <DiagramBlock icon={Server} label="Analytics" sub="Service" color="bg-white text-[#1D252D]" small />
          </div>
          <Arrow />

          {/* Message Queue */}
          <div className="flex justify-center">
            <DiagramBlock icon={GitBranch} label="Message Queue" sub="Apache Kafka" color="bg-[#A09484] text-white" />
          </div>
          <Arrow />

          {/* Data layer */}
          <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
            <DiagramBlock icon={Database} label="PostgreSQL" sub="OLTP" color="bg-white text-[#1D252D]" small />
            <DiagramBlock icon={Database} label="Redis" sub="Cache" color="bg-white text-[#1D252D]" small />
          </div>
        </div>

        {/* Key decisions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <DecisionCard
            title="Event Sourcing"
            description="Все изменения заявок сохраняются как цепочка событий — полная аудиторность и возможность восстановления состояния"
          />
          <DecisionCard
            title="CQRS"
            description="Разделение записи и чтения для оптимальной работы аналитики и отчётов без нагрузки на основную БД"
          />
          <DecisionCard
            title="Push-уведомления"
            description="Real-time доставка через WebSocket для активных сессий и FCM/APNs для фоновых уведомлений"
          />
          <DecisionCard
            title="Мультитенантность"
            description="Полная изоляция данных по жилым комплексам с единым API и ролевым разграничением доступа"
          />
        </div>
      </div>
    </div>
  )
}

function DiagramBlock({ icon: Icon, label, sub, color, small }: {
  icon: typeof Smartphone
  label: string
  sub: string
  color: string
  small?: boolean
}) {
  return (
    <div className={`${color} rounded-xl ${small ? 'p-3' : 'px-6 py-3'} flex items-center gap-2.5 shadow-sm border border-gray-100 justify-center`}>
      <Icon className={`${small ? 'w-4 h-4' : 'w-5 h-5'} shrink-0`} />
      <div className="text-center">
        <p className={`${small ? 'text-xs' : 'text-sm'} font-semibold leading-tight`}>{label}</p>
        <p className={`${small ? 'text-[9px]' : 'text-[10px]'} opacity-60`}>{sub}</p>
      </div>
    </div>
  )
}

function Arrow() {
  return <div className="text-center text-[#1D252D]/20 text-lg leading-none py-0.5">↓</div>
}

function DecisionCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
      <p className="text-sm font-bold text-[#1D252D] mb-1">{title}</p>
      <p className="text-xs text-[#1D252D]/60 leading-relaxed">{description}</p>
    </div>
  )
}
