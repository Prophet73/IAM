import { useState, type ReactNode } from 'react'
import { Clock, CheckCircle2, Shirt, Sparkles, Car, Droplets, Baby, Wrench } from 'lucide-react'
import SubScreenHeader from './SubScreenHeader'
import { conciergeServices, type ActiveOrder } from '../../data/sminex'

const serviceIcons: Record<string, ReactNode> = {
  'shirt': <Shirt className="w-5 h-5" />,
  'sparkles': <Sparkles className="w-5 h-5" />,
  'car': <Car className="w-5 h-5" />,
  'droplets': <Droplets className="w-5 h-5" />,
  'baby': <Baby className="w-5 h-5" />,
  'wrench': <Wrench className="w-5 h-5" />,
}

interface ServicesScreenProps {
  onBack: () => void
  onToast: (msg: string) => void
}

export default function ServicesScreen({ onBack, onToast }: ServicesScreenProps) {
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([])

  const handleOrder = (_serviceId: string, serviceName: string) => {
    const newOrder: ActiveOrder = {
      id: `ao-${Date.now()}`,
      service: serviceName,
      status: 'pending',
      date: '26.02.2026',
    }
    setActiveOrders(prev => [newOrder, ...prev])
    onToast(`${serviceName} — заказ оформлен`)

    // Simulate status change after 3 seconds
    setTimeout(() => {
      setActiveOrders(prev =>
        prev.map(o => o.id === newOrder.id ? { ...o, status: 'in_progress' } : o)
      )
    }, 3000)
  }

  const orderStatusLabel: Record<string, string> = {
    pending: 'Ожидает', in_progress: 'В процессе', done: 'Выполнен',
  }
  const orderStatusColor: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    in_progress: 'bg-blue-100 text-blue-700',
    done: 'bg-green-100 text-green-700',
  }

  return (
    <div className="flex-1 overflow-y-auto animate-[fadeIn_0.2s_ease-out]">
      <SubScreenHeader title="Услуги" onBack={onBack} />

      <div className="px-5 pb-6 space-y-4">
        {/* Active orders */}
        {activeOrders.length > 0 && (
          <div>
            <h2 className="text-xs font-bold text-[#1D252D] mb-2">Активные заказы</h2>
            <div className="space-y-2">
              {activeOrders.map(order => (
                <div key={order.id} className="bg-white rounded-2xl p-3.5 shadow-sm border border-gray-50 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F5F1EC] flex items-center justify-center">
                    {order.status === 'done'
                      ? <CheckCircle2 className="w-4 h-4 text-green-600" />
                      : <Clock className="w-4 h-4 text-[#8B7355]" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#1D252D]">{order.service}</p>
                    <p className="text-[10px] text-[#1D252D]/40">{order.date}</p>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${orderStatusColor[order.status]}`}>
                    {orderStatusLabel[order.status]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Service grid */}
        <div>
          <h2 className="text-xs font-bold text-[#1D252D] mb-2">Консьерж-сервис</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {conciergeServices.map(service => (
              <div key={service.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-[#F5F1EC] flex items-center justify-center text-[#8B7355] mb-2">
                  {serviceIcons[service.icon]}
                </div>
                <p className="text-xs font-bold text-[#1D252D] mb-0.5">{service.name}</p>
                <p className="text-[10px] text-[#1D252D]/40 mb-2 flex-1">{service.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-[#8B7355]">{service.price}</span>
                  <button
                    onClick={() => handleOrder(service.id, service.name)}
                    className="text-[10px] font-semibold text-white bg-[#1D252D] px-3 py-1 rounded-full hover:opacity-90 transition-opacity active:scale-[0.95]"
                  >
                    Заказать
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
