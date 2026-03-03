import { useState } from 'react'
import { X, Sparkles, Send, CheckCircle2, Loader2, Workflow } from 'lucide-react'

export default function AiConcierge({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<'idle' | 'typing' | 'analyzing' | 'calling_api' | 'done'>('idle')
  const [inputText, setInputText] = useState('')

  const runSimulation = () => {
    if (phase !== 'idle') return
    let i = 0
    const targetText = 'Закажи клининг на завтра и забронируй хаммам на вечер'
    setPhase('typing')

    const typeInterval = setInterval(() => {
      i++
      setInputText(targetText.slice(0, i))
      if (i >= targetText.length) {
        clearInterval(typeInterval)
        setTimeout(() => setPhase('analyzing'), 600)
        setTimeout(() => setPhase('calling_api'), 2500)
        setTimeout(() => setPhase('done'), 4500)
      }
    }, 40)
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-white/70 backdrop-blur-2xl animate-[fadeIn_0.3s_ease-out]">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center justify-between border-b border-gray-200/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1D252D] to-[#8B7355] flex items-center justify-center shadow-lg">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#1D252D]">AI-Консьерж</h2>
            <p className="text-[10px] text-[#1D252D]/50 font-medium">Agentic Workflow Active</p>
          </div>
        </div>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm text-[#1D252D]/50 hover:text-[#1D252D]">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4">
        {/* Welcome message */}
        <div className="flex items-start gap-3 max-w-[85%]">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#1D252D] to-[#8B7355] flex items-center justify-center shrink-0 mt-1">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <div className="bg-white rounded-2xl rounded-tl-sm p-3.5 shadow-sm border border-gray-100">
            <p className="text-xs text-[#1D252D] leading-relaxed">
              Здравствуйте! Я ваш персональный AI-ассистент. Напишите мне задачу в свободной форме, и я сам организую процессы через службы Sminex.
            </p>
          </div>
        </div>

        {/* Suggestion Chips */}
        {phase === 'idle' && (
          <div className="flex flex-wrap gap-2 ml-9">
            <button onClick={runSimulation} className="px-3 py-1.5 bg-white border border-[#8B7355]/30 rounded-full text-[10px] font-medium text-[#8B7355] shadow-sm hover:bg-[#8B7355]/5 transition-colors">
              Клининг и хаммам на завтра
            </button>
            <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-[10px] font-medium text-[#1D252D]/60 shadow-sm">
              Подать машину через 15 минут
            </button>
          </div>
        )}

        {/* User Message */}
        {phase !== 'idle' && (
          <div className="self-end bg-[#1D252D] text-white rounded-2xl rounded-tr-sm p-3.5 shadow-md max-w-[85%] animate-[slideUp_0.3s_ease-out]">
            <p className="text-xs leading-relaxed">{inputText}</p>
          </div>
        )}

        {/* Agentic Progress */}
        {(phase === 'analyzing' || phase === 'calling_api' || phase === 'done') && (
          <div className="flex items-start gap-3 max-w-[90%] animate-[fadeIn_0.3s_ease-out]">
            <div className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 mt-1">
              <Workflow className="w-3 h-3 text-[#8B7355]" />
            </div>
            <div className="flex-1 bg-white/80 rounded-2xl rounded-tl-sm p-3.5 shadow-sm border border-[#8B7355]/20">
              <p className="text-[10px] font-bold text-[#8B7355] uppercase tracking-wider mb-2">Лог агента</p>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-[11px] text-[#1D252D]/70">Интент распознан: [CLEANING, BOOKING]</span>
                </div>

                {phase === 'calling_api' || phase === 'done' ? (
                  <>
                    <div className="flex items-center gap-2 animate-[fadeIn_0.2s_ease-out]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-[11px] text-[#1D252D]/70">POST /api/services/cleaning {`{date: "tomorrow"}`}</span>
                    </div>
                    <div className="flex items-center gap-2 animate-[fadeIn_0.2s_ease-out_0.2s_both]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-[11px] text-[#1D252D]/70">POST /api/club/booking {`{amenity: "hammam", time: "evening"}`}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 text-[#8B7355] animate-spin" />
                    <span className="text-[11px] text-[#1D252D]/70">Формирование API запросов...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Final response */}
        {phase === 'done' && (
          <div className="flex items-start gap-3 max-w-[85%] animate-[slideUp_0.3s_ease-out]">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#1D252D] to-[#8B7355] flex items-center justify-center shrink-0 mt-1">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-sm p-3.5 shadow-sm border border-green-500/20">
              <p className="text-xs text-[#1D252D] leading-relaxed">
                Всё готово! Уборка назначена на завтра (с 10:00 до 13:00). Приватный хаммам забронирован на завтра с 19:00 до 21:00.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            readOnly
            placeholder="Напишите задачу..."
            className="w-full bg-[#F5F1EC] rounded-full pl-4 pr-12 py-3.5 text-sm text-[#1D252D] focus:outline-none"
          />
          <button className="absolute right-1.5 w-9 h-9 rounded-full bg-[#1D252D] flex items-center justify-center text-white transition-transform active:scale-95">
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
