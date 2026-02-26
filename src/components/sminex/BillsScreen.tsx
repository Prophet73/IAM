import { useState } from 'react'
import { CreditCard, CheckCircle2, Receipt } from 'lucide-react'
import SubScreenHeader from './SubScreenHeader'
import { initialBills, paymentHistory, type Bill } from '../../data/sminex'

interface BillsScreenProps {
  onBack: () => void
  onToast: (msg: string) => void
}

export default function BillsScreen({ onBack, onToast }: BillsScreenProps) {
  const [bills, setBills] = useState<Bill[]>(initialBills)
  const [payingId, setPayingId] = useState<string | null>(null)

  const unpaid = bills.filter(b => !b.isPaid)
  const paid = bills.filter(b => b.isPaid)
  const totalUnpaid = unpaid.reduce((sum, b) => sum + b.amount, 0)

  const handlePay = (id: string) => {
    setPayingId(id)
    // Animate for 1.5s then mark as paid
    setTimeout(() => {
      setBills(prev => prev.map(b => b.id === id ? { ...b, isPaid: true } : b))
      setPayingId(null)
      onToast('Оплата прошла успешно')
    }, 1500)
  }

  const handlePayAll = () => {
    const unpaidIds = unpaid.map(b => b.id)
    setPayingId('all')
    setTimeout(() => {
      setBills(prev => prev.map(b => unpaidIds.includes(b.id) ? { ...b, isPaid: true } : b))
      setPayingId(null)
      onToast('Все счета оплачены')
    }, 1500)
  }

  const formatAmount = (amount: number) =>
    amount.toLocaleString('ru-RU') + ' ₽'

  return (
    <div className="flex-1 overflow-y-auto animate-[fadeIn_0.2s_ease-out]">
      <SubScreenHeader title="Счета" onBack={onBack} />

      <div className="px-5 pb-6 space-y-4">
        {/* Total card */}
        <div className="bg-[#1D252D] rounded-2xl p-5 text-white">
          <p className="text-[10px] text-white/50 font-medium mb-1">К оплате за февраль</p>
          <p className="text-3xl font-bold mb-4">{formatAmount(totalUnpaid)}</p>
          {unpaid.length > 0 && (
            <button
              onClick={handlePayAll}
              disabled={payingId !== null}
              className={`w-full py-3 rounded-full text-sm font-semibold transition-all active:scale-[0.97] ${
                payingId === 'all'
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-[#1D252D] hover:bg-white/90'
              }`}
            >
              {payingId === 'all' ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Обработка...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Оплатить всё
                </span>
              )}
            </button>
          )}
          {unpaid.length === 0 && (
            <div className="flex items-center justify-center gap-2 text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-semibold">Все счета оплачены</span>
            </div>
          )}
        </div>

        {/* Unpaid bills */}
        {unpaid.length > 0 && (
          <div>
            <h2 className="text-xs font-bold text-[#1D252D] mb-2">Детализация</h2>
            <div className="space-y-2">
              {unpaid.map(bill => (
                <div key={bill.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F5F1EC] flex items-center justify-center">
                    <Receipt className="w-4 h-4 text-[#8B7355]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#1D252D]">{bill.name}</p>
                    <p className="text-xs text-[#1D252D]/50 font-medium">{formatAmount(bill.amount)}</p>
                  </div>
                  <button
                    onClick={() => handlePay(bill.id)}
                    disabled={payingId !== null}
                    className={`text-[10px] font-semibold px-3 py-1.5 rounded-full transition-all active:scale-[0.95] ${
                      payingId === bill.id
                        ? 'bg-green-500 text-white'
                        : 'bg-[#1D252D] text-white hover:opacity-90'
                    }`}
                  >
                    {payingId === bill.id ? (
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </span>
                    ) : 'Оплатить'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Paid bills */}
        {paid.length > 0 && (
          <div>
            <h2 className="text-xs font-bold text-[#1D252D] mb-2">Оплачено</h2>
            <div className="space-y-2">
              {paid.map(bill => (
                <div key={bill.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex items-center gap-3 opacity-60">
                  <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#1D252D]">{bill.name}</p>
                    <p className="text-xs text-[#1D252D]/50 font-medium">{formatAmount(bill.amount)}</p>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                    Оплачено
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment history */}
        <div>
          <h2 className="text-xs font-bold text-[#1D252D] mb-2">История платежей</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-50 divide-y divide-gray-50">
            {paymentHistory.map(payment => (
              <div key={payment.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-xs font-medium text-[#1D252D]">{payment.month}</p>
                  <p className="text-[10px] text-[#1D252D]/40">{payment.date}</p>
                </div>
                <span className="text-xs font-bold text-[#1D252D]">{formatAmount(payment.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
