import { X, Smartphone, Globe, Shield, Layers, Server, Zap, Sparkles } from 'lucide-react'

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
