import { useState } from 'react'
import { Package, Truck, MailOpen, CheckCircle2, Copy, Box } from 'lucide-react'
import SubScreenHeader from './SubScreenHeader'
import { initialPackages, type Package as PackageType } from '../../data/sminex'

interface PackagesScreenProps {
  onBack: () => void
  onToast: (msg: string) => void
}

export default function PackagesScreen({ onBack, onToast }: PackagesScreenProps) {
  const [packages, setPackages] = useState<PackageType[]>(initialPackages)

  const handlePickup = (id: string) => {
    setPackages(prev => prev.map(p =>
      p.id === id ? { ...p, status: 'picked_up' as const, statusLabel: 'Забрано' } : p
    ))
    onToast('Посылка отмечена как полученная')
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code)
    onToast(`Код ${code} скопирован`)
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case 'in_transit': return <Truck className="w-4 h-4 text-blue-500" />
      case 'delivered': return <MailOpen className="w-4 h-4 text-green-500" />
      case 'in_locker': return <Box className="w-4 h-4 text-amber-500" />
      case 'picked_up': return <CheckCircle2 className="w-4 h-4 text-gray-400" />
      default: return <Package className="w-4 h-4 text-gray-400" />
    }
  }

  const statusBgColor: Record<string, string> = {
    in_transit: 'bg-blue-50',
    delivered: 'bg-green-50',
    in_locker: 'bg-amber-50',
    picked_up: 'bg-gray-50',
  }

  const statusBadgeColor: Record<string, string> = {
    in_transit: 'bg-blue-100 text-blue-700',
    delivered: 'bg-green-100 text-green-700',
    in_locker: 'bg-amber-100 text-amber-700',
    picked_up: 'bg-gray-100 text-gray-500',
  }

  const active = packages.filter(p => p.status !== 'picked_up')
  const history = packages.filter(p => p.status === 'picked_up')

  return (
    <div className="flex-1 overflow-y-auto animate-[fadeIn_0.2s_ease-out]">
      <SubScreenHeader title="Посылки" onBack={onBack} />

      <div className="px-5 pb-6 space-y-4">
        {/* Active packages */}
        {active.length > 0 && (
          <div>
            <h2 className="text-xs font-bold text-[#1D252D] mb-2">Активные</h2>
            <div className="space-y-2.5">
              {active.map(pkg => (
                <div key={pkg.id} className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
                  <div className="p-4 flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${statusBgColor[pkg.status]}`}>
                      {statusIcon(pkg.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-bold text-[#1D252D]">{pkg.carrier}</p>
                        <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${statusBadgeColor[pkg.status]}`}>
                          {pkg.statusLabel}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#1D252D]/60 mb-0.5">{pkg.description}</p>
                      <p className="text-[10px] text-[#1D252D]/30">{pkg.trackingNumber}</p>
                      {pkg.deliveryDate && (
                        <p className="text-[10px] text-blue-600 mt-1">Ожидается: {pkg.deliveryDate}</p>
                      )}
                      {pkg.arrivedAt && (
                        <p className="text-[10px] text-[#1D252D]/40 mt-0.5">Доставлено: {pkg.arrivedAt}</p>
                      )}
                    </div>
                  </div>

                  {/* Locker info + actions */}
                  {pkg.status === 'in_locker' && pkg.lockerCode && (
                    <div className="border-t border-gray-50 bg-amber-50/50 px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-[#1D252D]/40">Ячейка №{pkg.lockerNumber}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-lg font-mono font-bold text-[#1D252D] tracking-widest">{pkg.lockerCode}</span>
                            <button
                              onClick={() => handleCopyCode(pkg.lockerCode!)}
                              className="text-[#8B7355] hover:text-[#1D252D] transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => handlePickup(pkg.id)}
                          className="text-[10px] font-semibold text-white bg-[#1D252D] px-3.5 py-2 rounded-full hover:opacity-90 transition-opacity active:scale-[0.95]"
                        >
                          Забрал
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {active.length === 0 && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-50 text-center">
            <Package className="w-10 h-10 text-[#1D252D]/15 mx-auto mb-2" />
            <p className="text-sm font-semibold text-[#1D252D]/30">Нет активных посылок</p>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div>
            <h2 className="text-xs font-bold text-[#1D252D] mb-2">Полученные</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-50 divide-y divide-gray-50">
              {history.map(pkg => (
                <div key={pkg.id} className="flex items-center gap-3 px-4 py-3 opacity-50">
                  <div className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#1D252D]">{pkg.carrier} · {pkg.description}</p>
                  </div>
                  <span className="text-[10px] text-[#1D252D]/30 shrink-0">{pkg.arrivedAt}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
