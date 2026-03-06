import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { tracker } from '../utils/tracker'

type Screen = 'search' | 'catalog' | 'analytics' | 'import' | 'settings'

/* ── Data ── */
const prescriptions = [
  /* Бетонные работы → Армирование */
  { id: 1, subtype: 'Армирование', text: 'Не обеспечена проектная толщина защитного слоя бетона. Фактическое расстояние от арматуры до опалубки 15мм при требуемом 25мм.', ntd: 'СП 70.13330', ntdClause: 'п.5.7.1', ntdFull: 'Несущие и ограждающие конструкции', rd: 'РД КЖ-1 лист 12', ntdOk: true, date: '12.01.2026' },
  /* Бетонные работы → Бетонирование */
  { id: 2, subtype: 'Бетонирование', text: 'Обнаружены раковины и каверны на поверхности монолитной стены подвала оси 3-4/А-Б. Глубина каверн до 30мм, площадь поражения ~0.8 м². Требуется инъектирование.', ntd: 'СП 70.13330', ntdClause: 'п.5.18.3', ntdFull: 'Несущие и ограждающие конструкции', rd: 'РД КЖ-2 лист 8', ntdOk: true, date: '15.01.2026' },
  /* Бетонные работы → Опалубка */
  { id: 3, subtype: 'Опалубка', text: 'Прогиб опалубки перекрытия на отм. +12.600 превышает допуск. Фактический прогиб 8мм при допустимом 3мм. Зафиксировано в осях 5-6/В-Г.', ntd: 'СП 70.13330', ntdClause: 'п.5.17.8', ntdFull: 'Несущие и ограждающие конструкции', rd: 'РД КЖ-3 лист 15', ntdOk: true, date: '18.01.2026' },
  /* Каменная кладка → Кладочные работы */
  { id: 4, subtype: 'Кладочные работы', text: 'Отклонение кладки от вертикали составляет 18мм на высоту этажа при допустимом 10мм. Кладка из керамического кирпича М150 на растворе М100.', ntd: 'СП 70.13330', ntdClause: 'п.9.2.1, табл.9.8', ntdFull: 'Несущие и ограждающие конструкции', rd: 'РД АР-1 лист 25', ntdOk: true, date: '22.01.2026' },
  /* Каменная кладка → Перегородки */
  { id: 5, subtype: 'Перегородки', text: 'Перегородки из ПГП толщиной 80мм не закреплены к перекрытию. Отсутствует упругая прокладка в узле примыкания к потолку. Этаж 9, секция 2.', ntd: 'СП 70.13330', ntdClause: 'п.9.3.2', ntdFull: 'Несущие и ограждающие конструкции', rd: 'РД АР-2 лист 31', ntdOk: true, date: '24.01.2026' },
  /* Кровля → Гидроизоляция */
  { id: 6, subtype: 'Гидроизоляция', text: 'Нарушена целостность гидроизоляционного ковра в зоне примыкания к парапету на отм. +28.500. Механические повреждения мембраны длиной ~1.2м.', ntd: 'СП 71.13330', ntdClause: 'п.5.1.23', ntdFull: 'Изоляционные и отделочные покрытия', rd: 'РД АР-1 лист 48', ntdOk: true, date: '28.01.2026' },
  /* Кровля → Водоотвод */
  { id: 7, subtype: 'Водоотвод', text: 'Уклон кровельного покрытия на участке между воронками В-3 и В-4 не соответствует проекту. Фактический уклон 0.5% при требуемом 1.5%. Образование застойных зон.', ntd: 'СП 17.13330', ntdClause: 'п.5.2.7', ntdFull: 'Кровли', rd: 'РД АР-3 лист 6', ntdOk: true, date: '30.01.2026' },
  /* Кровля → Утепление */
  { id: 8, subtype: 'Утепление', text: 'Толщина утеплителя кровли (ПИР 50мм) не соответствует проекту (ПИР 100мм). Участок в осях А-Б/1-3. Теплотехнический расчёт нарушен.', ntd: 'СП 50.13330', ntdClause: 'п.8.2', ntdFull: 'Тепловая защита зданий', rd: 'РД АР-3 лист 9', ntdOk: true, date: '01.02.2026' },
  /* Фасады → НВФ */
  { id: 9, subtype: 'НВФ', text: 'Монтаж навесного вентилируемого фасада выполнен с нарушением шага крепления кронштейнов. Фактический шаг 800мм при проектном 600мм. Участок 3-5 этажей.', ntd: 'СТО НОСТРОЙ 2.14.62', ntdClause: 'п.7.3.4', ntdFull: '', rd: 'РД АР-5 лист 14', ntdOk: false, date: '03.02.2026' },
  /* Фасады → Штукатурка */
  { id: 10, subtype: 'Штукатурка', text: 'Отслоение штукатурного слоя фасада на площади ~3.5 м² в уровне 2 этажа. Адгезия не обеспечена — основание не обработано грунтовкой.', ntd: 'СП 71.13330', ntdClause: 'п.7.2.13', ntdFull: 'Изоляционные и отделочные покрытия', rd: 'РД АР-5 лист 22', ntdOk: true, date: '05.02.2026' },
  /* Электромонтаж → Кабельные линии */
  { id: 11, subtype: 'Кабельные линии', text: 'Кабельные линии 0.4кВ в шахте проложены без соблюдения минимальных расстояний между силовыми и слаботочными трассами. Фактическое расстояние 50мм при требуемом 100мм.', ntd: 'ПУЭ-7', ntdClause: 'п.2.1.15, табл.2.1.1', ntdFull: 'Правила устройства электроустановок', rd: 'РД ЭОМ-1 лист 7', ntdOk: true, date: '06.02.2026' },
  /* Электромонтаж → Щитовое */
  { id: 12, subtype: 'Щитовое', text: 'Электрощит ВРУ-1 установлен с нарушением зоны обслуживания. Расстояние до стены 0.5м при требуемом не менее 0.8м. Подвал, пом. 001.', ntd: 'ПУЭ-7', ntdClause: 'п.4.1.23', ntdFull: 'Правила устройства электроустановок', rd: 'РД ЭОМ-2 лист 3', ntdOk: true, date: '07.02.2026' },
  /* Сантехника → Водоснабжение */
  { id: 13, subtype: 'Водоснабжение', text: 'Трубопровод ХВС Ду32 в техподполье проложен без уклона. Требуемый уклон i=0.002 не обеспечен на участке длиной 12м в осях 2-4.', ntd: 'СП 30.13330', ntdClause: 'п.8.3.1', ntdFull: 'Внутренний водопровод и канализация', rd: 'РД ВК-1 лист 5', ntdOk: true, date: '08.02.2026' },
  /* Сантехника → Канализация */
  { id: 14, subtype: 'Канализация', text: 'Канализационный стояк К1-5 смонтирован без ревизии на 5 этаже. По проекту ревизия предусмотрена через каждые 3 этажа.', ntd: 'СП 30.13330', ntdClause: 'п.8.6.4', ntdFull: 'Внутренний водопровод и канализация', rd: 'РД ВК-2 лист 11', ntdOk: true, date: '09.02.2026' },
  /* Металлоконструкции → Сварка */
  { id: 15, subtype: 'Сварка', text: 'Сварные соединения балки Б-12 к колонне К-5 не прошли ВИК. Обнаружены подрезы глубиной 1.5мм и непровар корня шва длиной 40мм.', ntd: 'СП 16.13330', ntdClause: 'п.14.1.8, табл.14.1', ntdFull: '', rd: 'РД КМ-1 лист 18', ntdOk: false, date: '10.02.2026' },
  /* Металлоконструкции → Антикор */
  { id: 16, subtype: 'Антикор', text: 'Антикоррозийное покрытие стальных колонн подземной автостоянки нанесено толщиной 80мкм при проектном значении 150мкм. Оси 1-3/А-В.', ntd: 'СП 28.13330', ntdClause: 'п.9.3.2', ntdFull: 'Защита строительных конструкций от коррозии', rd: 'РД КМ-1 лист 24', ntdOk: true, date: '11.02.2026' },
  /* Отделочные работы → Покраска */
  { id: 17, subtype: 'Покраска', text: 'Окраска стен МОП выполнена без шпаклевания. Видны дефекты основания, полосы от валика. Качество — ниже категории К3.', ntd: 'СП 71.13330', ntdClause: 'п.7.6.4', ntdFull: 'Изоляционные и отделочные покрытия', rd: 'РД АР-4 лист 7', ntdOk: true, date: '12.02.2026' },
  /* Отделочные работы → Плитка */
  { id: 18, subtype: 'Плитка', text: 'Отклонение поверхности керамогранита от плоскости 4мм на длине 2м при допустимом 2мм. Санузел кв. 412, корпус 2.', ntd: 'СП 71.13330', ntdClause: 'п.7.4.13, табл.7.6', ntdFull: 'Изоляционные и отделочные покрытия', rd: 'РД АР-4 лист 15', ntdOk: true, date: '13.02.2026' },
  /* Земляные работы → Котлован */
  { id: 19, subtype: 'Котлован', text: 'Перебор грунта при разработке котлована на отм. -4.200 составляет 300мм. Требуется устройство подготовки из щебня с уплотнением.', ntd: 'СП 45.13330', ntdClause: 'п.6.1.6, табл.6.3', ntdFull: 'Земляные сооружения, основания и фундаменты', rd: 'РД КЖ-0 лист 3', ntdOk: true, date: '14.02.2026' },
  /* Земляные работы → Обратная засыпка */
  { id: 20, subtype: 'Обратная засыпка', text: 'Обратная засыпка пазух котлована выполнена мёрзлым грунтом с включениями льда. Коэффициент уплотнения 0.89 при требуемом 0.95.', ntd: 'СП 45.13330', ntdClause: 'п.6.3.8', ntdFull: 'Земляные сооружения, основания и фундаменты', rd: 'РД КЖ-0 лист 5', ntdOk: true, date: '15.02.2026' },
  /* Геодезия → Исполнит. съёмка */
  { id: 21, subtype: 'Исполнит. съёмка', text: 'Отклонение оси колонны К-14 от проектного положения в плане составляет 22мм при допустимом 8мм. Отметка +6.000, секция 1.', ntd: 'СП 126.13330', ntdClause: 'п.10.2.3, табл.10.1', ntdFull: 'Геодезические работы в строительстве', rd: 'РД КЖ-1 лист 4', ntdOk: true, date: '16.02.2026' },
  /* Геодезия → Мониторинг */
  { id: 22, subtype: 'Мониторинг', text: 'Осадка фундаментной плиты корп. 2 по реперу Р-7 составила 18мм за последний цикл наблюдений при прогнозном значении 8мм. Требуется внеплановое обследование.', ntd: 'СП 22.13330', ntdClause: 'п.5.6.12', ntdFull: 'Основания зданий и сооружений', rd: 'ППГР лист 2', ntdOk: true, date: '17.02.2026' },
  /* Лифты → Монтаж */
  { id: 23, subtype: 'Монтаж', text: 'Отклонение направляющих лифта Л-3 от вертикали превышает 5мм на длине 5м при допустимом 1мм. Шахта 3, корпус 1.', ntd: 'ГОСТ 33984.1', ntdClause: 'п.5.2.5.2.1', ntdFull: 'Лифты. Общие требования безопасности', rd: 'РД КЖ-7 лист 2', ntdOk: true, date: '18.02.2026' },
  /* Лифты → Шахта */
  { id: 24, subtype: 'Шахта', text: 'Размеры лифтовой шахты не соответствуют паспорту оборудования. Ширина 1650мм при требуемой 1700мм. Корпус 2, шахта 1.', ntd: 'ГОСТ 33984.1', ntdClause: 'п.5.2.1.2', ntdFull: 'Лифты. Общие требования безопасности', rd: 'РД КЖ-7 лист 4', ntdOk: true, date: '18.02.2026' },
  /* Документация → ИД */
  { id: 25, subtype: 'ИД', text: 'Не оформлены акты освидетельствования скрытых работ на армирование плиты перекрытия П-5 (отм. +9.000). Бетонирование выполнено без подписанного АОСР.', ntd: 'РД 11-02-2006', ntdClause: 'п.5.3', ntdFull: 'Требования к составу и порядку ведения ИД', rd: 'РД КЖ-1 лист 20', ntdOk: true, date: '19.02.2026' },
  /* Документация → Журналы */
  { id: 26, subtype: 'Журналы', text: 'Общий журнал работ не заполняется с 01.02.2026. Отсутствуют записи о производстве работ за 14 рабочих дней. Корпус 1.', ntd: 'РД 11-05-2007', ntdClause: 'п.3, п.4', ntdFull: 'Порядок ведения общего и специальных журналов', rd: '—', ntdOk: true, date: '19.02.2026' },
]

const categories = [
  { emoji: '🏗', name: 'Бетонные работы', count: 1240, subtypes: ['Армирование', 'Бетонирование', 'Опалубка'] },
  { emoji: '🧱', name: 'Каменная кладка', count: 890, subtypes: ['Кладочные работы', 'Перегородки', 'Расшивка'] },
  { emoji: '🏠', name: 'Кровля', count: 670, subtypes: ['Гидроизоляция', 'Утепление', 'Водоотвод'] },
  { emoji: '🪟', name: 'Фасады', count: 520, subtypes: ['НВФ', 'Штукатурка', 'Остекление'] },
  { emoji: '🔌', name: 'Электромонтаж', count: 480, subtypes: ['Кабельные линии', 'Щитовое', 'Освещение'] },
  { emoji: '🚰', name: 'Сантехника', count: 440, subtypes: ['Водоснабжение', 'Канализация', 'Отопление'] },
  { emoji: '🏗', name: 'Металлоконструкции', count: 380, subtypes: ['Сварка', 'Болтовые соед.', 'Антикор'] },
  { emoji: '🪵', name: 'Отделочные работы', count: 350, subtypes: ['Штукатурка', 'Покраска', 'Плитка'] },
  { emoji: '⛏', name: 'Земляные работы', count: 310, subtypes: ['Котлован', 'Обратная засыпка', 'Планировка'] },
  { emoji: '📐', name: 'Геодезия', count: 280, subtypes: ['Разбивка', 'Исполнит. съёмка', 'Мониторинг'] },
  { emoji: '🛗', name: 'Лифты', count: 190, subtypes: ['Монтаж', 'Пусконаладка', 'Шахта'] },
  { emoji: '📋', name: 'Документация', count: 250, subtypes: ['ИД', 'Акты', 'Журналы'] },
]

const nav: { key: Screen; emoji: string; label: string; section?: string }[] = [
  { key: 'search', emoji: '🔍', label: 'Поиск' },
  { key: 'catalog', emoji: '📚', label: 'Каталог' },
  { key: 'analytics', emoji: '📊', label: 'Аналитика', section: 'АДМИНИСТРИРОВАНИЕ' },
  { key: 'import', emoji: '📥', label: 'Импорт' },
  { key: 'settings', emoji: '⚙️', label: 'Настройки' },
]

const titles: Record<Screen, string> = {
  search: 'Поиск предписаний',
  catalog: 'Каталог по категориям',
  analytics: 'Аналитика',
  import: 'Импорт данных',
  settings: 'Настройки',
}

const BRAND = '#2563EB'

/* ===== EXPORT ===== */
export function DataBookDemo() {
  const [open, setOpen] = useState(false)
  const openedAt = useRef(0)
  const handleOpen = (e: React.MouseEvent) => { e.stopPropagation(); setOpen(true); openedAt.current = Date.now(); tracker.track('demo_open', { product: 'databook' }) }
  const handleClose = () => { setOpen(false); tracker.track('demo_close', { product: 'databook', duration_s: Math.round((Date.now() - openedAt.current) / 1000) }) }
  return (
    <>
      <div className="btn-premium-wrap" onClick={handleOpen}>
        <button className="btn-premium">
          <div className="btn-premium-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold">Запустить демо</div>
            <div className="text-xs text-muted mt-0.5">Интерактивный концепт (live-демо)</div>
          </div>
          <svg className="btn-premium-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
      {open && <Modal onClose={handleClose} />}
    </>
  )
}

/* ===== MOBILE TEASER ===== */
function MobileTeaser({ onClose }: { onClose: () => void }) {
  const B = '#2563EB'
  const screens = ['search', 'catalog', 'card', 'import', 'analytics'] as const
  type Scr = typeof screens[number]
  const [scr, setScr] = useState<Scr>('search')
  const idx = screens.indexOf(scr)

  // Swipe
  const touchRef = useRef<{ x: number; y: number } | null>(null)
  const handleTouchStart = (e: React.TouchEvent) => { touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchRef.current) return
    const dx = e.changedTouches[0].clientX - touchRef.current.x
    const dy = e.changedTouches[0].clientY - touchRef.current.y
    touchRef.current = null
    if (Math.abs(dx) < 40 || Math.abs(dy) > Math.abs(dx)) return
    if (dx < 0 && idx < screens.length - 1) setScr(screens[idx + 1])
    if (dx > 0 && idx > 0) setScr(screens[idx - 1])
  }

  // Search animation
  const query = 'отклонение кладки'
  const [charIdx, setCharIdx] = useState(0)
  const [showResults, setShowResults] = useState(false)
  useEffect(() => {
    if (scr !== 'search') { setCharIdx(0); setShowResults(false); return }
    if (charIdx < query.length) {
      const t = setTimeout(() => setCharIdx(i => i + 1), 70)
      return () => clearTimeout(t)
    }
    if (!showResults) { const t = setTimeout(() => setShowResults(true), 400); return () => clearTimeout(t) }
  }, [scr, charIdx, showResults, query.length])

  // Import pipeline animation
  const pipelineStages = ['Нормализация', 'Лемматизация', 'Векторизация', 'Дедупликация', 'FTS-индексация']
  const [pipeStage, setPipeStage] = useState(-1)
  useEffect(() => {
    if (scr !== 'import') { setPipeStage(-1); return }
    const t = setTimeout(() => setPipeStage(0), 300)
    return () => clearTimeout(t)
  }, [scr])
  useEffect(() => {
    if (scr !== 'import' || pipeStage < 0 || pipeStage >= pipelineStages.length - 1) return
    const t = setTimeout(() => setPipeStage(s => s + 1), 600)
    return () => clearTimeout(t)
  }, [scr, pipeStage, pipelineStages.length])

  const labels: Record<Scr, string> = { search: 'Поиск', catalog: 'Каталог', card: 'Карточка', import: 'Импорт', analytics: 'Аналитика' }

  const searchResults = [
    { text: 'Отклонение кладки от вертикали 18мм при допустимом 10мм', ntd: 'СП 70.13330', clause: 'п.9.2.1', ok: true },
    { text: 'Кладка перегородок из ПГП не закреплена к перекрытию', ntd: 'СП 70.13330', clause: 'п.9.3.2', ok: true },
    { text: 'Отклонение кладки от горизонтали 15мм на 10м при допуске 7мм', ntd: 'СП 70.13330', clause: 'п.9.2.1', ok: true },
  ]

  const catGrid = [
    { e: '🏗', n: 'Бетонные', c: 1240 }, { e: '🧱', n: 'Кладка', c: 890 }, { e: '🏠', n: 'Кровля', c: 670 },
    { e: '🪟', n: 'Фасады', c: 520 }, { e: '🔌', n: 'Электро', c: 480 }, { e: '🚰', n: 'Сантехника', c: 440 },
    { e: '🏗', n: 'Металл', c: 380 }, { e: '🪵', n: 'Отделка', c: 350 }, { e: '⛏', n: 'Земляные', c: 310 },
    { e: '📐', n: 'Геодезия', c: 280 }, { e: '🛗', n: 'Лифты', c: 190 }, { e: '📋', n: 'Документы', c: 250 },
  ]

  return (
    <div className="flex md:hidden flex-col h-full bg-[#F8FAFC]" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-2 shrink-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] text-white font-bold" style={{ background: B }}>DB</div>
            <div><div className="text-sm font-bold text-slate-800">DataBook</div><div className="text-[9px] text-slate-400">Умный поиск предписаний</div></div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border-none text-sm cursor-pointer">&times;</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-slate-200/60 px-1 shrink-0 overflow-x-auto scrollbar-hidden">
        {screens.map(s => (
          <button key={s} onClick={() => setScr(s)}
            className={`flex-1 px-2 py-2.5 text-[10px] font-semibold whitespace-nowrap transition-colors border-none cursor-pointer bg-transparent ${scr === s ? 'text-[#2563EB]' : 'text-slate-400'}`}
            style={scr === s ? { borderBottom: `2px solid ${B}` } : { borderBottom: '2px solid transparent' }}
          >{labels[s]}</button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {/* ─── SEARCH ─── */}
        {scr === 'search' && <>
          {/* Category filter row */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hidden">
            {['Все', 'Кладка', 'Бетон', 'Кровля', 'Фасады'].map((c, i) => (
              <span key={c} className={`shrink-0 text-[9px] px-2.5 py-1 rounded-full font-medium ${i === 1 ? 'bg-[#2563EB]/10 text-[#2563EB]' : 'bg-white text-slate-500 border border-slate-200'}`}>{c}</span>
            ))}
          </div>
          {/* Search input */}
          <div className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 flex items-center gap-2 shadow-sm">
            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <span className="text-xs text-slate-700">{query.slice(0, charIdx)}<span className="inline-block w-[2px] h-[1em] bg-[#2563EB] ml-px align-middle animate-blink" /></span>
          </div>
          {/* Results */}
          {showResults && <>
            <div className="text-[9px] text-slate-400 px-1">Найдено: <span className="font-semibold text-slate-600">47 предписаний</span> · FTS + GIN индекс</div>
            <div className="space-y-2">
              {searchResults.map((r, i) => (
                <div key={i} className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm animate-[fadeIn_0.3s_ease-out_both]" style={{ animationDelay: `${i * 120}ms` }}
                  onClick={() => setScr('card')}>
                  <div className="text-[11px] text-slate-700 leading-relaxed mb-2">{r.text}</div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${r.ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{r.ntd}</span>
                    <span className="text-[9px] text-slate-400">{r.clause}</span>
                    <span className="text-[9px] text-slate-300 ml-auto">→</span>
                  </div>
                </div>
              ))}
            </div>
          </>}
        </>}

        {/* ─── CATALOG ─── */}
        {scr === 'catalog' && <>
          <div className="text-[9px] text-slate-400 px-1 mb-1">12 категорий · <span className="font-semibold text-slate-600">6 000 предписаний</span></div>
          <div className="grid grid-cols-3 gap-2">
            {catGrid.map((c, i) => (
              <div key={i} className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-sm text-center cursor-pointer hover:border-[#2563EB]/30 transition-colors"
                onClick={() => setScr('search')}>
                <div className="text-lg mb-1">{c.e}</div>
                <div className="text-[10px] font-semibold text-slate-700 leading-tight">{c.n}</div>
                <div className="text-[9px] text-slate-400 mt-0.5">{c.c.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </>}

        {/* ─── CARD ─── */}
        {scr === 'card' && <>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Card header */}
            <div className="px-3.5 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">СП 70.13330</span>
                <span className="text-[9px] text-slate-400">п.9.2.1, табл.9.8</span>
              </div>
              <div className="text-[11px] font-semibold text-slate-800 leading-relaxed">Отклонение кладки от вертикали составляет 18мм на высоту этажа при допустимом 10мм</div>
            </div>
            {/* Details */}
            <div className="px-3.5 py-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-slate-400">Категория</span>
                <span className="text-[10px] font-medium text-slate-700">🧱 Каменная кладка</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-slate-400">Подтип</span>
                <span className="text-[10px] font-medium text-slate-700">Кладочные работы</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-slate-400">РД</span>
                <span className="text-[10px] font-medium text-slate-700">РД АР-1 лист 25</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-slate-400">НТД полное</span>
                <span className="text-[10px] font-medium text-slate-700">Несущие и огражд. конструкции</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-slate-400">Дата</span>
                <span className="text-[10px] font-medium text-slate-700">22.01.2026</span>
              </div>
            </div>
            {/* NTD link */}
            <div className="px-3.5 py-2.5 border-t border-slate-100">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50/80">
                <div className="w-5 h-5 rounded bg-[#2563EB]/10 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-[#2563EB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                </div>
                <div>
                  <div className="text-[9px] font-semibold text-[#2563EB]">tehexpert.ru</div>
                  <div className="text-[8px] text-slate-400">Открыть НТД на tehexpert</div>
                </div>
              </div>
            </div>
            {/* Actions */}
            <div className="px-3.5 py-2.5 border-t border-slate-100 flex gap-2">
              <button className="flex-1 py-2 rounded-lg bg-[#2563EB] text-white text-[10px] font-semibold border-none cursor-pointer flex items-center justify-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                Копировать
              </button>
              <button className="flex-1 py-2 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-semibold border-none cursor-pointer">Похожие</button>
            </div>
          </div>
        </>}

        {/* ─── IMPORT ─── */}
        {scr === 'import' && <>
          {/* Source file */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-sm">📄</div>
              <div>
                <div className="text-[11px] font-semibold text-slate-700">prescriptions_export.xlsx</div>
                <div className="text-[9px] text-slate-400">1 247 строк · 2.3 MB</div>
              </div>
            </div>
            <div className="flex gap-1.5">
              <span className="text-[8px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Excel</span>
              <span className="text-[8px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">UTF-8</span>
              <span className="text-[8px] px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-semibold">Загружен</span>
            </div>
          </div>

          {/* NLP Pipeline */}
          <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider px-1">NLP Pipeline</div>
          <div className="space-y-1.5">
            {pipelineStages.map((stage, i) => {
              const done = i <= pipeStage
              const active = i === pipeStage
              const descriptions = ['Очистка текста, приведение к нижнему регистру', 'pymorphy2 — приведение к леммам', 'TF-IDF + sentence-transformers', 'Удаление дубликатов по cosine sim > 0.95', 'PostgreSQL GIN + pg_trgm + ts_vector']
              return (
                <div key={i} className={`bg-white rounded-lg p-2.5 border transition-all ${active ? 'border-[#2563EB]/40 shadow-sm' : done ? 'border-green-200' : 'border-slate-200 opacity-50'}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${done ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                      {done ? '✓' : i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-[10px] font-semibold ${active ? 'text-[#2563EB]' : done ? 'text-slate-700' : 'text-slate-400'}`}>{stage}</div>
                      <div className="text-[8px] text-slate-400 truncate">{descriptions[i]}</div>
                    </div>
                    {active && <div className="w-3 h-3 rounded-full border-2 border-[#2563EB] border-t-transparent animate-spin shrink-0" />}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Result */}
          {pipeStage >= pipelineStages.length - 1 && (
            <div className="bg-green-50 rounded-xl p-3 border border-green-200 animate-[fadeIn_0.3s_ease-out]">
              <div className="text-[10px] font-semibold text-green-700 mb-1">Импорт завершён</div>
              <div className="flex gap-3">
                <div className="text-center"><div className="text-sm font-bold text-green-700">1 247</div><div className="text-[8px] text-green-600">загружено</div></div>
                <div className="text-center"><div className="text-sm font-bold text-green-700">1 189</div><div className="text-[8px] text-green-600">уникальных</div></div>
                <div className="text-center"><div className="text-sm font-bold text-green-700">58</div><div className="text-[8px] text-green-600">дубликатов</div></div>
              </div>
            </div>
          )}
        </>}

        {/* ─── ANALYTICS ─── */}
        {scr === 'analytics' && <>
          {/* KPI row */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Предписаний', val: '6 024', icon: '📋' },
              { label: 'Поисков сегодня', val: '342', icon: '🔍' },
              { label: 'Копирований', val: '1 847', icon: '📋' },
              { label: 'Пользователей', val: '28', icon: '👥' },
            ].map((k, i) => (
              <div key={i} className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs">{k.icon}</span>
                  <span className="text-[9px] text-slate-400">{k.label}</span>
                </div>
                <div className="text-base font-bold text-slate-800">{k.val}</div>
              </div>
            ))}
          </div>

          {/* Popular queries */}
          <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider px-1 mt-1">Популярные запросы</div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {[
              { q: 'отклонение кладки', n: 89 },
              { q: 'защитный слой бетона', n: 74 },
              { q: 'гидроизоляция кровли', n: 61 },
              { q: 'сварные соединения', n: 53 },
              { q: 'крепление перегородок', n: 47 },
            ].map((item, i) => (
              <div key={i} className={`flex items-center justify-between px-3 py-2 ${i > 0 ? 'border-t border-slate-100' : ''}`}>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-slate-300 w-3 text-right">{i + 1}</span>
                  <span className="text-[10px] text-slate-700">{item.q}</span>
                </div>
                <span className="text-[9px] text-slate-400">{item.n}</span>
              </div>
            ))}
          </div>

          {/* Usage by category — mini bar chart */}
          <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider px-1 mt-1">По категориям</div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 space-y-1.5">
            {[
              { cat: 'Бетонные', pct: 82 }, { cat: 'Кладка', pct: 64 }, { cat: 'Кровля', pct: 48 },
              { cat: 'Фасады', pct: 35 }, { cat: 'Электро', pct: 28 },
            ].map((b, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[9px] text-slate-600">{b.cat}</span>
                  <span className="text-[9px] text-slate-400">{b.pct}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${b.pct}%`, background: B, opacity: 1 - i * 0.12 }} />
                </div>
              </div>
            ))}
          </div>
        </>}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 bg-white border-t border-slate-200/60 shrink-0">
        <div className="flex justify-center gap-1.5 mb-1.5">
          {screens.map((s, i) => (
            <div key={s} className={`rounded-full transition-all ${i === idx ? 'w-4 h-1.5' : 'w-1.5 h-1.5 bg-slate-300'}`} style={i === idx ? { background: B } : undefined} />
          ))}
        </div>
        <p className="text-[9px] text-slate-400 text-center">Полноэкранная версия с живым интерактивным демо доступна на ПК</p>
      </div>
    </div>
  )
}

/* ===== MODAL ===== */
function Modal({ onClose }: { onClose: () => void }) {
  const [screen, setScreen] = useState<Screen>('search')
  const handleKey = useCallback((e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }, [onClose])
  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    document.body.classList.add('demo-modal-open')
    return () => { document.removeEventListener('keydown', handleKey); document.body.classList.remove('demo-modal-open') }
  }, [handleKey])

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="demo-modal-enter relative w-full max-w-[1400px] rounded-2xl overflow-hidden shadow-2xl flex flex-col" style={{ height: '90vh', maxHeight: '920px' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 z-50 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center cursor-pointer border-none transition-colors text-lg" aria-label="Close">&times;</button>
        {/* Mobile teaser */}
        <MobileTeaser onClose={onClose} />
        <div className="hidden md:flex flex-1 min-h-0">
          {/* Sidebar — WHITE */}
          <div className="w-[240px] bg-white border-r border-slate-200 flex flex-col shrink-0">
            <div className="h-14 flex items-center px-4 border-b border-slate-200">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[0.6rem] text-white font-bold mr-3" style={{ background: BRAND }}>DB</div>
              <div><div className="text-sm font-bold text-slate-800">DataBook</div><div className="text-[0.58rem] text-slate-400">v3.0</div></div>
            </div>
            <div className="flex-1 py-2 px-3 space-y-0.5 overflow-y-auto">
              {nav.map(item => (
                <div key={item.key}>
                  {item.section && <div className="pt-4 pb-2 px-2"><div className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-wider">{item.section}</div></div>}
                  <button onClick={() => setScreen(item.key)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left cursor-pointer border-none transition-colors text-[0.8rem] ${screen === item.key ? 'bg-[#2563EB]/10 text-[#2563EB] font-semibold' : 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-800'}`}>
                    <span className="text-[0.85rem]">{item.emoji}</span><span>{item.label}</span>
                  </button>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-slate-200">
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50">
                <div className="w-8 h-8 rounded-full bg-[#2563EB]/10 flex items-center justify-center text-[0.65rem] font-bold" style={{ color: BRAND }}>НХ</div>
                <div className="flex-1 min-w-0"><div className="text-[0.75rem] font-semibold text-slate-700 truncate">Хроменок Н.В.</div><div className="text-[0.6rem] text-slate-400">Администратор</div></div>
              </div>
              <div className="text-[0.55rem] text-slate-400 text-center mt-2">v3.0 · Design by N. Khromenok</div>
            </div>
          </div>
          {/* Content */}
          <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
            <div className="h-14 flex items-center justify-between px-6 bg-white border-b border-slate-200 shrink-0">
              <h2 className="text-[0.95rem] font-bold text-slate-800 m-0">{titles[screen]}</h2>
              <div className="flex items-center gap-3">
                <span className="text-[0.72rem] text-slate-400">Строительный контроль</span>
                <span className="text-[0.72rem] text-slate-400">19 февр. 2026</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {screen === 'search' && <PgSearch />}
              {screen === 'catalog' && <PgCatalog />}
              {screen === 'analytics' && <PgAnalytics />}
              {screen === 'import' && <PgImport />}
              {screen === 'settings' && <PgSettings />}
            </div>
          </div>
        </div>
      </div>
    </div>, document.body)
}

/* ── Helpers ── */
function StatCard({ label, val, sub, color }: { label: string; val: string; sub: string; color: string }) {
  return <div className="bg-white rounded-xl p-4 border border-slate-200" style={{ borderLeftWidth: 3, borderLeftColor: color }}><span className="text-[0.65rem] text-slate-400 uppercase font-bold tracking-wider">{label}</span><div className="text-2xl font-extrabold text-slate-800 mt-1">{val}</div><div className="text-[0.7rem] text-slate-400 mt-0.5">{sub}</div></div>
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const q = query.toLowerCase()
  const parts: React.ReactNode[] = []
  let remaining = text
  let key = 0
  while (remaining.length > 0) {
    const idx = remaining.toLowerCase().indexOf(q)
    if (idx === -1) {
      parts.push(remaining)
      break
    }
    if (idx > 0) parts.push(remaining.slice(0, idx))
    parts.push(<mark key={key++} style={{ background: '#FDE68A', padding: '0 1px', borderRadius: 2 }}>{remaining.slice(idx, idx + query.length)}</mark>)
    remaining = remaining.slice(idx + query.length)
  }
  return <>{parts}</>
}

/* ===== SEARCH ===== */
function PgSearch() {
  const [query, setQuery] = useState('')
  const [selectedCat, setSelectedCat] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const wordCount = useMemo(() => {
    const w = query.trim().split(/\s+/).filter(Boolean)
    return w.length > 0 && query.trim() ? w.length : 0
  }, [query])

  const filtered = useMemo(() => {
    let list = prescriptions
    if (selectedCat) {
      const cat = categories.find(c => c.name === selectedCat)
      if (cat) {
        list = list.filter(p => cat.subtypes.some(s => p.subtype.toLowerCase().includes(s.toLowerCase())) || p.subtype.toLowerCase().includes(selectedCat.toLowerCase()))
      }
    }
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(p =>
        p.text.toLowerCase().includes(q) ||
        p.subtype.toLowerCase().includes(q) ||
        p.ntd.toLowerCase().includes(q)
      )
    }
    return list.slice(0, 8)
  }, [query, selectedCat])

  const matchPercent = useCallback((text: string) => {
    if (!query.trim()) return null
    const q = query.toLowerCase()
    const words = q.split(/\s+/).filter(Boolean)
    const matched = words.filter(w => text.toLowerCase().includes(w)).length
    return Math.round((matched / Math.max(words.length, 1)) * 100)
  }, [query])

  const handleCopy = useCallback((id: number, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }, [])

  const totalCount = selectedCat ? (categories.find(c => c.name === selectedCat)?.count || 0) : prescriptions.length

  return (
    <div className="p-6">
      {/* Search bar */}
      <div className="mb-5">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="m21 21-4.35-4.35"/></svg>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Введите запрос: бетон, трещины, кровля..."
            className="w-full pl-11 pr-24 py-3 bg-white border border-slate-200 rounded-xl text-[0.82rem] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB]/50 focus:ring-2 focus:ring-[#2563EB]/10 transition-all"
          />
          <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-[0.7rem] font-medium ${wordCount > 10 ? 'text-red-500' : 'text-slate-400'}`}>
            {wordCount} / 10 слов
          </span>
        </div>
      </div>

      <div className="flex gap-5">
        {/* Category sidebar */}
        <div className="w-[220px] shrink-0 space-y-1">
          <button
            onClick={() => setSelectedCat(null)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left cursor-pointer border-none transition-colors text-[0.75rem] ${!selectedCat ? 'bg-[#2563EB]/10 text-[#2563EB] font-semibold' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
          >
            <span className="text-[0.82rem]">📁</span>
            <span className="flex-1">Все категории</span>
            <span className="text-[0.65rem] text-slate-400">8,547</span>
          </button>
          {categories.map(cat => (
            <button
              key={cat.name}
              onClick={() => setSelectedCat(selectedCat === cat.name ? null : cat.name)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left cursor-pointer border-none transition-colors text-[0.72rem] ${selectedCat === cat.name ? 'bg-[#2563EB]/10 text-[#2563EB] font-semibold' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
            >
              <span className="text-[0.82rem]">{cat.emoji}</span>
              <span className="flex-1 truncate">{cat.name}</span>
              <span className="text-[0.6rem] text-slate-400">{cat.count}</span>
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="flex-1 min-w-0 space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <div className="text-3xl mb-3">🔍</div>
              <div className="text-[0.85rem] font-medium text-slate-500">Ничего не найдено</div>
              <div className="text-[0.72rem] text-slate-400 mt-1">Попробуйте изменить запрос или выбрать другую категорию</div>
            </div>
          )}
          {filtered.map(p => {
            const pct = matchPercent(p.text)
            return (
              <div key={p.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-[#2563EB]/30 hover:shadow-md transition-all" style={{ borderLeftWidth: 3, borderLeftColor: p.ntdOk ? '#10B981' : '#EF4444' }}>
                <div className="px-4 py-3">
                  {/* Header row */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[0.65rem] font-bold" style={{ background: `${BRAND}15`, color: BRAND }}>{p.subtype}</span>
                    {pct !== null && (
                      <span className="px-2 py-0.5 rounded text-[0.62rem] font-bold bg-amber-100 text-amber-700">{pct}%</span>
                    )}
                    <span className="text-[0.65rem] text-slate-400 ml-auto">{p.date}</span>
                  </div>
                  {/* Text */}
                  <div className="text-[0.78rem] text-slate-700 leading-relaxed mb-2.5">
                    {highlightText(p.text, query)}
                  </div>
                  {/* NTD + RD + actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[0.65rem] font-semibold ${p.ntdOk ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.ntdOk ? '#10B981' : '#EF4444' }} />
                      {p.ntd} {p.ntdClause}
                      {p.ntdFull && <span className="text-[0.58rem] font-normal opacity-70">· {p.ntdFull}</span>}
                    </span>
                    {p.rd && p.rd !== '—' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[0.65rem] font-semibold bg-blue-50 text-blue-600 border border-blue-200">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                        {p.rd}
                      </span>
                    )}
                    <a href="#" onClick={e => e.preventDefault()} className="px-2 py-0.5 rounded-full text-[0.6rem] font-medium no-underline" style={{ background: `${BRAND}10`, color: BRAND }}>Техэксперт</a>
                    <button
                      onClick={() => handleCopy(p.id, p.text)}
                      className="ml-auto flex items-center gap-1 px-2 py-1 rounded-lg text-[0.65rem] font-medium cursor-pointer border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                      style={copiedId === p.id ? { borderColor: '#10B981', color: '#10B981' } : { color: '#64748B' }}
                    >
                      {copiedId === p.id ? (
                        <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Скопировано</>
                      ) : (
                        <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>Копировать</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
          {filtered.length > 0 && (
            <div className="text-[0.72rem] text-slate-400 text-center pt-2">
              Показано {filtered.length} из {totalCount}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ===== CATALOG ===== */
function PgCatalog() {
  const [openCat, setOpenCat] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const handleCopy = useCallback((id: number, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }, [])

  if (openCat) {
    const cat = categories.find(c => c.name === openCat)
    const catPrescriptions = prescriptions.filter(p =>
      cat?.subtypes.some(s => p.subtype.toLowerCase().includes(s.toLowerCase())) || p.subtype.toLowerCase().includes(openCat.toLowerCase())
    )

    return (
      <div className="p-6">
        <button
          onClick={() => setOpenCat(null)}
          className="flex items-center gap-2 mb-5 text-[0.78rem] font-medium cursor-pointer border-none bg-transparent hover:text-[#2563EB] transition-colors"
          style={{ color: '#64748B' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          Назад к каталогу
        </button>
        <div className="flex items-center gap-3 mb-5">
          <span className="text-2xl">{cat?.emoji}</span>
          <div>
            <h3 className="text-[0.95rem] font-bold text-slate-800 m-0">{openCat}</h3>
            <span className="text-[0.72rem] text-slate-400">{cat?.count} записей</span>
          </div>
        </div>
        <div className="space-y-3">
          {catPrescriptions.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-[0.82rem]">В демо-данных нет записей для этой категории</div>
          ) : (
            catPrescriptions.map(p => (
              <div key={p.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden" style={{ borderLeftWidth: 3, borderLeftColor: p.ntdOk ? '#10B981' : '#EF4444' }}>
                <div className="px-4 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[0.65rem] font-bold" style={{ background: `${BRAND}15`, color: BRAND }}>{p.subtype}</span>
                    <span className="text-[0.65rem] text-slate-400 ml-auto">{p.date}</span>
                  </div>
                  <div className="text-[0.78rem] text-slate-700 leading-relaxed mb-2.5">{p.text}</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[0.65rem] font-semibold ${p.ntdOk ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.ntdOk ? '#10B981' : '#EF4444' }} />
                      {p.ntd} {p.ntdClause}{p.ntdFull && <span className="text-[0.58rem] font-normal opacity-70">· {p.ntdFull}</span>}
                    </span>
                    {p.rd && p.rd !== '—' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[0.65rem] font-semibold bg-blue-50 text-blue-600 border border-blue-200">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                        {p.rd}
                      </span>
                    )}
                    <button onClick={() => handleCopy(p.id, p.text)} className="ml-auto flex items-center gap-1 px-2 py-1 rounded-lg text-[0.65rem] font-medium cursor-pointer border border-slate-200 bg-white hover:bg-slate-50 transition-colors" style={copiedId === p.id ? { borderColor: '#10B981', color: '#10B981' } : { color: '#64748B' }}>
                      {copiedId === p.id ? (
                        <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Скопировано</>
                      ) : (
                        <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>Копировать</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-3 gap-4">
        {categories.map(cat => (
          <div
            key={cat.name}
            onClick={() => setOpenCat(cat.name)}
            className="bg-white rounded-xl border border-slate-200 p-4 cursor-pointer hover:border-[#2563EB]/30 hover:shadow-lg transition-all group"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: `${BRAND}10` }}>{cat.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[0.82rem] font-semibold text-slate-800 group-hover:text-[#2563EB] transition-colors">{cat.name}</div>
                <div className="text-[0.7rem] text-slate-400">{cat.count} записей</div>
              </div>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {cat.subtypes.map(s => (
                <span key={s} className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-[0.6rem] text-slate-500">{s}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ===== ANALYTICS ===== */
function PgAnalytics() {
  const weekData = [
    { day: 'Пн', val: 42 },
    { day: 'Вт', val: 58 },
    { day: 'Ср', val: 35 },
    { day: 'Чт', val: 67 },
    { day: 'Пт', val: 51 },
    { day: 'Сб', val: 12 },
    { day: 'Вс', val: 8 },
  ]
  const maxVal = Math.max(...weekData.map(d => d.val))

  const popularQueries = [
    { query: 'защитный слой бетона', count: 34 },
    { query: 'трещины кладка', count: 28 },
    { query: 'гидроизоляция кровля', count: 22 },
    { query: 'сварные соединения', count: 19 },
    { query: 'отклонение от вертикали', count: 15 },
  ]

  const activeUsers = [
    { name: 'Хроменок Н.В.', role: 'Администратор', last: '5 мин назад', searches: 12 },
    { name: 'Козлова Е.А.', role: 'Инженер СК', last: '18 мин назад', searches: 8 },
    { name: 'Иванов А.С.', role: 'Инженер СК', last: '1 час назад', searches: 6 },
    { name: 'Орлов П.С.', role: 'ГИП', last: '2 часа назад', searches: 4 },
    { name: 'Федорова Е.А.', role: 'Инженер СК', last: '3 часа назад', searches: 3 },
  ]

  const catUsage = [
    { name: 'Бетонные работы', pct: 28 },
    { name: 'Каменная кладка', pct: 19 },
    { name: 'Кровля', pct: 15 },
    { name: 'Фасады', pct: 12 },
    { name: 'Электромонтаж', pct: 10 },
    { name: 'Сантехника', pct: 8 },
    { name: 'Прочие', pct: 8 },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Поисков сегодня" val="47" sub="+12% к вчера" color={BRAND} />
        <StatCard label="Копирований" val="128" sub="за сегодня" color="#10B981" />
        <StatCard label="Активных пользователей" val="12" sub="сейчас онлайн" color="#8B5CF6" />
        <StatCard label="Записей в базе" val="8,547" sub="после дедупликации" color="#F59E0B" />
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Bar chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-[0.78rem] font-bold text-slate-800 mb-4">Поисков за неделю</div>
          <div className="flex items-end gap-3 h-[140px]">
            {weekData.map(d => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[0.62rem] font-bold text-slate-600">{d.val}</span>
                <div className="w-full rounded-t-md transition-all" style={{ height: `${(d.val / maxVal) * 110}px`, background: `linear-gradient(to top, ${BRAND}, ${BRAND}AA)` }} />
                <span className="text-[0.6rem] text-slate-400">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Popular queries */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-[0.78rem] font-bold text-slate-800 mb-4">Популярные запросы</div>
          <table className="w-full">
            <thead><tr className="text-[0.62rem] text-slate-400 uppercase tracking-wider">
              <th className="text-left pb-2 font-semibold">#</th>
              <th className="text-left pb-2 font-semibold">Запрос</th>
              <th className="text-right pb-2 font-semibold">Кол-во</th>
            </tr></thead>
            <tbody>{popularQueries.map((q, i) => (
              <tr key={q.query} className="border-t border-slate-50 text-[0.75rem]">
                <td className="py-2 text-slate-400 font-mono">{i + 1}</td>
                <td className="py-2 text-slate-700">{q.query}</td>
                <td className="py-2 text-right font-bold" style={{ color: BRAND }}>{q.count}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* User activity */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-[0.78rem] font-bold text-slate-800 mb-4">Активность пользователей</div>
          <table className="w-full">
            <thead><tr className="text-[0.62rem] text-slate-400 uppercase tracking-wider">
              <th className="text-left pb-2 font-semibold">Пользователь</th>
              <th className="text-left pb-2 font-semibold">Роль</th>
              <th className="text-left pb-2 font-semibold">Последний поиск</th>
              <th className="text-right pb-2 font-semibold">Запросов</th>
            </tr></thead>
            <tbody>{activeUsers.map(u => (
              <tr key={u.name} className="border-t border-slate-50 text-[0.73rem]">
                <td className="py-2 text-slate-700 font-medium">{u.name}</td>
                <td className="py-2 text-slate-500">{u.role}</td>
                <td className="py-2 text-slate-400">{u.last}</td>
                <td className="py-2 text-right font-bold text-slate-600">{u.searches}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>

        {/* Category usage */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-[0.78rem] font-bold text-slate-800 mb-4">Популярные категории</div>
          <div className="space-y-2.5">
            {catUsage.map(c => (
              <div key={c.name} className="flex items-center gap-3">
                <span className="text-[0.72rem] text-slate-600 w-[130px] shrink-0 truncate">{c.name}</span>
                <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${c.pct}%`, background: `linear-gradient(to right, ${BRAND}, ${BRAND}CC)` }} />
                </div>
                <span className="text-[0.68rem] font-bold text-slate-500 w-8 text-right">{c.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ===== IMPORT ===== */
function PgImport() {
  const pipelineSteps = [
    { emoji: '📝', name: 'Нормализация', desc: 'Очистка, унификация форматов, удаление дубликатов строк', status: 'done' as const },
    { emoji: '🔤', name: 'Лемматизация', desc: 'pymorphy2 — приведение к начальной форме слова', status: 'done' as const },
    { emoji: '📊', name: 'Векторизация', desc: 'TF-IDF + sentence-transformers для семантического поиска', status: 'done' as const },
    { emoji: '🔁', name: 'Дедупликация', desc: 'Cosine similarity > 0.92 → объединение записей', status: 'done' as const },
    { emoji: '🔍', name: 'FTS-индексация', desc: 'PostgreSQL tsvector + GIN-индекс для полнотекстового поиска', status: 'done' as const },
  ]

  return (
    <div className="p-6 max-w-[800px] mx-auto space-y-6">
      {/* Upload zone */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[0.65rem] text-white font-bold" style={{ background: BRAND }}>1</div>
          <span className="text-[0.82rem] font-semibold text-slate-800">Загрузка файла</span>
        </div>
        <div className="border-2 border-dashed rounded-xl p-8 text-center" style={{ borderColor: `${BRAND}40`, background: `${BRAND}05` }}>
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center" style={{ background: `${BRAND}15` }}>
            <svg className="w-6 h-6" style={{ color: BRAND }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
          </div>
          <div className="text-[0.82rem] font-medium text-slate-700 mb-1">Перетащите .xlsm файл или нажмите для выбора</div>
          <div className="text-[0.7rem] text-slate-400">Поддерживаются файлы Excel с макросами (.xlsm)</div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[0.65rem] text-white font-bold" style={{ background: BRAND }}>2</div>
          <span className="text-[0.82rem] font-semibold text-slate-800">Статистика обработки</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-extrabold text-slate-800">25,012</div>
            <div className="text-[0.7rem] text-slate-400 mt-1">Исходных записей</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-center relative">
            <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[0.7rem]">→</div>
            <div className="text-[0.65rem] font-bold text-amber-600 uppercase tracking-wider mb-1">Дедупликация</div>
            <div className="text-[0.82rem] font-bold text-slate-600">-65.8%</div>
            <div className="text-[0.65rem] text-slate-400">удалено дублей</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-extrabold" style={{ color: BRAND }}>8,547</div>
            <div className="text-[0.7rem] text-slate-400 mt-1">Уникальных записей</div>
          </div>
        </div>
      </div>

      {/* NLP Pipeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[0.65rem] text-white font-bold" style={{ background: BRAND }}>3</div>
          <span className="text-[0.82rem] font-semibold text-slate-800">NLP-пайплайн обработки</span>
        </div>
        <div className="space-y-1">
          {pipelineSteps.map((s, i) => (
            <div key={s.name} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-50/50 border border-transparent">
              <span className="text-[0.85rem] w-6 text-center">{s.status === 'done' ? '✅' : s.emoji}</span>
              <div className="flex-1 min-w-0">
                <span className="text-[0.78rem] text-slate-700 font-medium">{s.name}</span>
                <span className="text-[0.65rem] text-slate-400 ml-2">{s.desc}</span>
              </div>
              {i < pipelineSteps.length - 1 && (
                <span className="text-[0.6rem] text-slate-300">→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Last import */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[0.65rem] text-white font-bold" style={{ background: BRAND }}>4</div>
          <span className="text-[0.82rem] font-semibold text-slate-800">Последний импорт</span>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 space-y-2">
          {[
            ['Файл', 'prescriptions_export_2026.xlsm'],
            ['Дата импорта', '14.02.2026, 14:32'],
            ['Обработано', '1,247 новых записей'],
            ['Добавлено после дедупликации', '312 уникальных'],
            ['Время обработки', '2 мин 18 сек'],
            ['Оператор', 'Хроменок Н.В.'],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center text-[0.75rem]">
              <span className="text-slate-400 w-[200px] shrink-0">{label}:</span>
              <span className="text-slate-700 font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ===== SETTINGS ===== */
function PgSettings() {
  const users = [
    { name: 'Хроменок Н.В.', email: 'khromenok@company.ru', role: 'admin', status: 'active', lastLogin: '19.02.2026' },
    { name: 'Козлова Е.А.', email: 'kozlova@company.ru', role: 'editor', status: 'active', lastLogin: '19.02.2026' },
    { name: 'Иванов А.С.', email: 'ivanov@company.ru', role: 'user', status: 'active', lastLogin: '18.02.2026' },
    { name: 'Орлов П.С.', email: 'orlov@company.ru', role: 'user', status: 'active', lastLogin: '17.02.2026' },
    { name: 'Сидоров К.Л.', email: 'sidorov@company.ru', role: 'user', status: 'inactive', lastLogin: '10.02.2026' },
  ]
  const roleLabels: Record<string, string> = { admin: 'Админ', editor: 'Редактор', user: 'Пользователь' }
  const roleColors: Record<string, string> = { admin: 'bg-purple-100 text-purple-600', editor: 'bg-blue-100 text-blue-600', user: 'bg-slate-100 text-slate-500' }

  return (
    <div className="p-6 space-y-6">
      {/* OAuth2 */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[0.82rem] font-bold text-slate-800">OAuth2 / JetBrains Hub</div>
          <span className="px-2.5 py-1 rounded-lg text-[0.65rem] font-bold bg-green-100 text-green-600">Подключено</span>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 space-y-2">
          {[
            ['Hub URL', 'https://hub.company.ru'],
            ['Client ID', 'databook-prod-****'],
            ['Scope', 'profile, email, groups'],
            ['Авторизованных сессий', '12'],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center text-[0.75rem]">
              <span className="text-slate-400 w-[180px] shrink-0">{label}:</span>
              <span className="text-slate-700 font-mono text-[0.72rem]">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search engine */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[0.82rem] font-bold text-slate-800">Поисковый движок</div>
          <span className="px-2.5 py-1 rounded-lg text-[0.65rem] font-bold bg-green-100 text-green-600">Активен</span>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-3">
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <div className="text-xl font-extrabold text-slate-800">8 547</div>
            <div className="text-[0.65rem] text-slate-400">Записей в базе</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <div className="text-xl font-extrabold" style={{ color: BRAND }}>GIN</div>
            <div className="text-[0.65rem] text-slate-400">Индекс tsvector</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <div className="text-xl font-extrabold text-green-600">12 мс</div>
            <div className="text-[0.65rem] text-slate-400">Среднее время поиска</div>
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 space-y-2">
          {[
            ['Полнотекстовый поиск', 'PostgreSQL tsvector + GIN-индекс'],
            ['Конфигурация', 'russian + pymorphy2 лемматизация'],
            ['Fuzzy matching', 'pg_trgm (триграммы, порог 0.3)'],
            ['Дедупликация', 'TF-IDF + cosine similarity > 0.92'],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center text-[0.75rem]">
              <span className="text-slate-400 w-[200px] shrink-0">{label}:</span>
              <span className="text-slate-700 font-mono text-[0.72rem]">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* NTD Reference */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[0.82rem] font-bold text-slate-800">Справочник НТД</div>
          <span className="px-2.5 py-1 rounded-lg text-[0.65rem] font-bold bg-green-100 text-green-600">Актуален</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <div className="text-xl font-extrabold text-slate-800">342</div>
            <div className="text-[0.65rem] text-slate-400">СП / ГОСТ / СНиП</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <div className="text-xl font-extrabold text-green-600">289</div>
            <div className="text-[0.65rem] text-slate-400">Полный match (код + название)</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <div className="text-xl font-extrabold text-red-500">53</div>
            <div className="text-[0.65rem] text-slate-400">Только код (без названия)</div>
          </div>
        </div>
        <div className="text-[0.68rem] text-slate-400 mt-3">Последнее обновление: 14.02.2026 · Источник: Техэксперт API</div>
      </div>

      {/* User management */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[0.82rem] font-bold text-slate-800">Управление пользователями</div>
          <button className="px-3 py-1.5 rounded-lg text-[0.72rem] font-medium cursor-pointer border-none text-white transition-colors" style={{ background: BRAND }}>+ Добавить</button>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead><tr className="text-[0.62rem] text-slate-400 uppercase tracking-wider bg-slate-50">
              <th className="text-left px-4 py-2.5 font-semibold">Пользователь</th>
              <th className="text-left px-4 py-2.5 font-semibold">Email</th>
              <th className="text-center px-4 py-2.5 font-semibold">Роль</th>
              <th className="text-center px-4 py-2.5 font-semibold">Статус</th>
              <th className="text-left px-4 py-2.5 font-semibold">Посл. вход</th>
            </tr></thead>
            <tbody>{users.map((u, i) => (
              <tr key={u.email} className={`border-t border-slate-100 text-[0.73rem] hover:bg-slate-50/50 ${i % 2 ? 'bg-slate-50/30' : ''}`}>
                <td className="px-4 py-2.5 text-slate-700 font-medium">{u.name}</td>
                <td className="px-4 py-2.5 text-slate-500 font-mono text-[0.68rem]">{u.email}</td>
                <td className="px-4 py-2.5 text-center"><span className={`px-2 py-0.5 rounded text-[0.62rem] font-bold ${roleColors[u.role]}`}>{roleLabels[u.role]}</span></td>
                <td className="px-4 py-2.5 text-center"><span className={`w-2 h-2 rounded-full inline-block ${u.status === 'active' ? 'bg-green-500' : 'bg-slate-300'}`} /></td>
                <td className="px-4 py-2.5 text-slate-400 font-mono text-[0.68rem]">{u.lastLogin}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
