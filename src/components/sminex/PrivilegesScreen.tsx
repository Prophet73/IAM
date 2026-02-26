import { useState, type ReactNode } from 'react'
import { Copy, Star, Utensils, Sofa, Dumbbell, Car, Sparkles, Heart, Leaf, Bed, Wrench, Stethoscope } from 'lucide-react'
import SubScreenHeader from './SubScreenHeader'
import { partnerCategories, partners } from '../../data/sminex'

const partnerIcons: Record<string, ReactNode> = {
  'utensils': <Utensils className="w-5 h-5" />,
  'sofa': <Sofa className="w-5 h-5" />,
  'dumbbell': <Dumbbell className="w-5 h-5" />,
  'car': <Car className="w-5 h-5" />,
  'sparkles': <Sparkles className="w-5 h-5" />,
  'heart': <Heart className="w-5 h-5" />,
  'leaf': <Leaf className="w-5 h-5" />,
  'bed': <Bed className="w-5 h-5" />,
  'wrench': <Wrench className="w-5 h-5" />,
  'stethoscope': <Stethoscope className="w-5 h-5" />,
}

interface PrivilegesScreenProps {
  onBack: () => void
  onToast: (msg: string) => void
}

export default function PrivilegesScreen({ onBack, onToast }: PrivilegesScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState('pc-all')

  const filtered = selectedCategory === 'pc-all'
    ? partners
    : partners.filter(p => p.categoryId === selectedCategory)

  const handleCopyPromo = (code: string, partnerName: string) => {
    navigator.clipboard?.writeText(code)
    onToast(`Промокод ${code} скопирован — ${partnerName}`)
  }

  return (
    <div className="flex-1 overflow-y-auto animate-[fadeIn_0.2s_ease-out]">
      <SubScreenHeader title="Привилегии" onBack={onBack} />

      <div className="px-5 pb-6 space-y-4">
        {/* Hero banner */}
        <div className="bg-gradient-to-r from-[#1D252D] to-[#8B7355] rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-amber-300 fill-amber-300" />
            <p className="text-xs font-bold text-white/80">Клуб Ривер Парк</p>
          </div>
          <p className="text-lg font-bold mb-1">Привилегии резидента</p>
          <p className="text-[10px] text-white/60">Эксклюзивные скидки и предложения от {partners.length} партнёров</p>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-hide">
          {partnerCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-[#1D252D] text-white'
                  : 'bg-white text-[#1D252D]/60 border border-gray-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Partner cards */}
        <div className="space-y-2.5">
          {filtered.map(partner => (
            <div key={partner.id} className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
              <div className="p-4 flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#F5F1EC] flex items-center justify-center text-[#8B7355] shrink-0">
                  {partnerIcons[partner.logo]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-xs font-bold text-[#1D252D]">{partner.name}</p>
                    {partner.isExclusive && (
                      <span className="text-[8px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
                        EXCLUSIVE
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#1D252D]/50 mb-1.5">{partner.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#8B7355]">{partner.discount}</span>
                  </div>
                </div>
              </div>

              {/* Promo code */}
              {partner.promoCode && (
                <div className="border-t border-gray-50 px-4 py-2.5 bg-[#F5F1EC]/50 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] text-[#1D252D]/40">Промокод</p>
                    <p className="text-xs font-mono font-bold text-[#1D252D] tracking-wider">{partner.promoCode}</p>
                  </div>
                  <button
                    onClick={() => handleCopyPromo(partner.promoCode!, partner.name)}
                    className="flex items-center gap-1 text-[10px] font-semibold text-[#8B7355] hover:text-[#1D252D] transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    Копировать
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
