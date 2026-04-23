import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { tracker } from '../utils/tracker'

/* ===== TYPES & DATA ===== */

type Screen = 'databook' | 'scanner' | 'citations' | 'document' | 'admin' | 'architecture' | 'taxonomy' | 'quality'
type AdminTab = 'overview' | 'unresolved' | 'errors' | 'users'

const BRAND = '#2563EB'

const nav: { key: Screen; emoji: string; label: string; section?: string }[] = [
  { key: 'databook',     emoji: '📚', label: 'DataBook' },
  { key: 'scanner',      emoji: '📷', label: 'Сканер + конструктор' },
  { key: 'admin',        emoji: '🛠',  label: 'Админ · использование', section: 'АДМИНИСТРИРОВАНИЕ' },
  { key: 'architecture', emoji: '⚙️', label: 'Как работает',           section: 'АРХИТЕКТУРА' },
  { key: 'taxonomy',     emoji: '🌳', label: 'Таксономия' },
  { key: 'quality',      emoji: '📊', label: 'Качество поиска' },
]

const titles: Record<Screen, string> = {
  databook:     'DataBook — архив выявленных предписаний',
  scanner:      'Сканер + конструктор предписаний',
  citations:    'Нормативное обоснование',
  document:     'Документ (DOCX)',
  admin:        'Административная панель',
  architecture: 'Как это работает',
  taxonomy:     'Таксономия · структура данных',
  quality:      'Качество поиска',
}

/* ── Реальная таксономия work_types (из emb2/data/work_types_taxonomy.json) ── */
const WORK_TYPES = [
  { code: '1',  name: 'Геодезия',               icon: '📐', docs: ['СП 126', 'СП 317', 'ГОСТ Р 51872'] },
  { code: '2',  name: 'Подготовительные',       icon: '🚜', docs: ['СП 48'] },
  { code: '3',  name: 'Котлован, земляные',     icon: '⛏', docs: ['СП 45', 'СП 22'] },
  { code: '4',  name: 'Фундаменты, сваи',       icon: '🏗', docs: ['СП 45', 'СП 24'] },
  { code: '5',  name: 'Монолитные ЖБ',          icon: '🧱', docs: ['СП 70', 'СП 63'] },
  { code: '6',  name: 'Сборные ЖБ',             icon: '🔳', docs: ['СП 70'] },
  { code: '7',  name: 'Металлоконструкции',     icon: '⚙️', docs: ['СП 16', 'СП 28'] },
  { code: '8',  name: 'Кладка',                 icon: '🧱', docs: ['СП 70'] },
  { code: '9',  name: 'Лифты, эскалаторы',      icon: '🛗', docs: [] },
  { code: '10', name: 'Кровли',                 icon: '🏠', docs: ['СП 17'] },
  { code: '11', name: 'Двери, ворота',          icon: '🚪', docs: [] },
  { code: '12', name: 'Светопрозрачные',        icon: '🪟', docs: [] },
  { code: '13', name: 'Фасады',                 icon: '🏢', docs: ['СП 71', 'СП 28'] },
  { code: '14', name: 'Отделка',                icon: '🎨', docs: ['СП 71'] },
  { code: '15', name: 'ЭОМ, СС',                icon: '🔌', docs: ['СП 76', 'СП 256', 'СП 484'] },
  { code: '16', name: 'ОВ, ВК',                 icon: '🚰', docs: ['СП 60', 'СП 30', 'СП 485'] },
  { code: '17', name: 'Наружные сети',          icon: '🌐', docs: ['СП 32'] },
  { code: '18', name: 'Благоустройство',        icon: '🌳', docs: ['СП 82', 'СП 42'] },
  { code: '19', name: 'Организация',            icon: '📋', docs: ['СП 48'] },
  { code: '21', name: 'Док-ция, журналы',       icon: '📓', docs: ['ГОСТ Р 21.101'] },
]

/* ── Универсальные подвиды — пересекают все виды работ (emb2: universal_subtypes) ── */
const UNIVERSAL_SUBTYPES = [
  'Входной контроль',
  'Геодезические отклонения',
  'Без РД / ОТД',
  'Сохранность работ',
  'Без освидетельствования',
  'Исполнительная документация',
  'Температурно-влажностный режим',
  'Технологическая последовательность',
  'Заделка проходов коммуникаций',
]

/* ── Специфичные subtypes для каждого work_type (из taxonomy.json) ── */
const WORK_SUBTYPES: Record<string, string[]> = {
  '1':  ['Разбивка осей и отметок', 'Геотехнический мониторинг', 'Топосъёмка'],
  '2':  ['Демонтаж', 'Расчистка территории', 'Подготовка основания'],
  '3':  ['Вертикальная планировка', 'Устройство котлованов', 'Шпунт', 'Распорные системы', 'Водопонижение', 'Дренажная система', 'Обратная засыпка', 'Стена в грунте', 'Подстилающие слои'],
  '4':  ['Бурение скважин', 'Свайные работы', 'Набор прочности свай', 'Ростверк', 'Гидроизоляция', 'Теплоизоляция'],
  '5':  ['Арматурный каркас', 'Установка опалубки', 'Бетонирование', 'Уход за бетоном', 'Набор прочности', 'Дефекты', 'Ремонт конструкций'],
  '6':  ['Монтаж сборных', 'Заполнение стыков', 'Анкеровка', 'Испытание нагружением'],
  '7':  ['Монтаж МК', 'Огнезащита', 'Герметизация стыков', 'Антикоррозия', 'Ограждения'],
  '8':  ['Кладка из кирпича', 'Кладка из газобетона', 'Кладка из ПГП'],
  '9':  ['Монтаж оборудования', 'Отделка кабины', 'Монтаж эскалаторов', 'ПНР', 'Электромонтаж'],
  '10': ['Подстилающие слои', 'Кровельное покрытие', 'Отливы, фартуки', 'Фундаменты оборудования', 'Тех. надстройки'],
  '11': ['Двери МОП', 'Квартирные двери', 'Дверные порталы', 'Технические двери', 'Ворота', 'Технические люки'],
  '12': ['Кронштейны', 'Рамы', 'Стеклопакеты', 'Монтажные швы', 'Витражи', 'Безрамное остекление', 'Стеклянные ограждения'],
  '13': ['Кронштейны', 'Утеплитель', 'Направляющие', 'Облицовка', 'Швы', 'Штукатурный фасад', 'АКП', 'Фиброцементные', 'Противопожарная отсечка', 'Фасадное освещение', 'Ограждения балконов', 'Ламели'],
  '14': ['Шумоизоляция', 'Гидроизоляция', 'Стяжка', 'Напольное покрытие', 'Лестницы', 'Топинг', 'ГКЛ перегородки', 'Штукатурка', 'Шпатлевка', 'Окраска', 'Декоративка', 'Плинтус', 'Керамогранит', 'Натур. камень', 'Декор', 'ГКЛ потолки', 'Подвесные потолки', '+ ещё 5'],
  '15': ['ЭО', 'ЭМ', 'Молниезащита', 'СКС', 'Связь', 'Радиофикация', 'АПС', 'СОУЭ', 'ОС', 'СКУД', 'СВН', 'АК', 'АСКУ', 'ОКЛ', 'Прокладка КЛ'],
  '16': ['Отопление', 'Вентиляция', 'Кондиционирование', 'ПДВ', 'Водопровод', 'Канализация', 'Ливневка', 'ИТП/ЦТП', 'ХС', 'ВПВ', 'АУПТ', 'Газ', 'Технологические трубы', 'Пылеудаление'],
  '17': ['Наружное ЭО', 'КЛ', 'Наружный водопровод', 'Хоз-быт канализация', 'Ливневка', 'Тепловые сети', 'Газопроводы', 'Сети связи'],
  '18': ['Ландшафт', 'Дренаж', 'Подстилающие слои', 'Озеленение', 'Мощение', 'Водоотвод', 'Асфальт', 'Бордюры', 'МАФ'],
}

/* ── Уровень 1: MAIN_TABS (TaxonomyTab из реального emb2) ── */
type TabKey = 'all' | 'construction' | 'ot' | 'organization' | 'documents'

const MAIN_TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'all',          label: 'Все',                     icon: '📚' },
  { key: 'construction', label: 'Строительный контроль',   icon: '🏗' },
  { key: 'ot',           label: 'Охрана труда',            icon: '🦺' },
  { key: 'organization', label: 'Организация',             icon: '📋' },
  { key: 'documents',    label: 'Документы',               icon: '📄' },
]

/* ── Уровень 2: Control types (только для Construction tab) ── */
const CONSTRUCTION_CONTROL_TYPES = [
  { code: 'all',          label: 'Все' },
  { code: 'входной',      label: 'Входной' },
  { code: 'операционный', label: 'Операционный' },
  { code: 'приёмочный',   label: 'Приёмочный' },
  { code: 'геодезический', label: 'Геодезический' },
  { code: 'лабораторный', label: 'Лабораторный' },
]

/* ── work_types особого назначения (связаны с OT/org/doc control_types) — для чтения в дереве ── */
// OT_WORK_TYPE = { code: '20', name: 'Охрана труда и ПСЭБ' } — зафиксирован на ot tab
// ORG_WORK_TYPE = { code: '19', name: 'Организация строительства' } — зафиксирован на organization tab
// DOC_WORK_TYPE = { code: '21', name: 'Исполнительная документация' } — зафиксирован на documents tab

/* ── subtypes для work_type 20_охрана_труда (НЕ work_types, это SUBTYPES!) ── */
const OT_SUBTYPES = [
  { code: 'охрана_труда',           name: 'Охрана труда',           icon: '🦺' },
  { code: 'электробезопасность',    name: 'Электробезопасность',    icon: '⚡' },
  { code: 'пожарная_безопасность',  name: 'Пожарная безопасность',  icon: '🔥' },
  { code: 'промышленная_безопасность', name: 'Промышленная безоп.', icon: '🏭' },
  { code: 'санитарная_безопасность',   name: 'Санитарная безоп.',   icon: '🧴' },
  { code: 'экологическая_безопасность', name: 'Экологическая безоп.', icon: '🌱' },
]

/* ── org_types (для Organization tab) ── */
const ORG_TYPES = [
  'Подготовительные работы',
  'Временные сооружения',
  'Организация проезда и прохода',
  'Соответствие бытового городка стройгенплану',
  'Содержание территории в чистоте',
  'Складирование и хранение материалов',
  'Аттестационно-разрешительная документация',
  'Приказы на ответственных лиц',
  'Временное инженерное обеспечение',
  'Размещение стройтехники',
  'Освещение стройплощадки',
]

/* ── doc_types (для Documents tab) ── */
const DOC_TYPES = [
  'Общий журнал работ',
  'Специальный журнал работ',
  'Журнал входного контроля',
  'Журналы ОТ и ТБ',
  'Журнал выдачи наряд-допусков',
]

/* ── Реальные теги (из emb2 material_tags + defect_tags) ── */
// для data-driven рендера tag → category-color

/* ── DataBook архив — 20 реальных (обезличенных) записей ───── */
type PrescItem = {
  id: number
  tab: Exclude<TabKey, 'all'>
  work: string
  workCode: string
  subtype: string
  control: string   // для construction — входной/операционный/..., для ot — 'охрана_труда', для org — 'организационный', для doc — 'документационный'
  text: string
  ntdDoc: string
  ntdClause: string
  tags: { c: string; v: string }[]
  hasPhoto: boolean
}

const ARCHIVE: PrescItem[] = [
  { id: 1, tab: 'construction', workCode: '10', work: 'Кровли', subtype: 'Устройство подстилающих слоёв', control: 'операционный',
    text: 'В ходе операционного контроля выявлено нарушение технологии устройства кровли стилобата в осях 6.П-11.П на отм. -1.320. Производилась отсыпка мороженого щебня.',
    ntdDoc: 'СП 70.13330', ntdClause: 'п.5.7.1',
    tags: [{ c: 'materials', v: 'теплоизоляция' }, { c: 'defects', v: 'загрязнение' }, { c: 'constructs', v: 'кровля' }],
    hasPhoto: true },
  { id: 2, tab: 'construction', workCode: '11', work: 'Двери, ворота и люки', subtype: 'Монтаж ворот', control: 'входной',
    text: 'По запросу строительного контроля не предоставлены документы качества на распорные анкеры для монтажа консолей противопожарных ворот. Фактически применены анкеры разных марок.',
    ntdDoc: 'СП 48.13330.2019', ntdClause: 'п.9.5',
    tags: [{ c: 'documents', v: 'сертификат' }, { c: 'materials', v: 'крепёж' }, { c: 'defects', v: 'несоответствие' }],
    hasPhoto: false },
  { id: 3, tab: 'construction', workCode: '12', work: 'Светопрозрачные конструкции', subtype: 'Установка рам', control: 'операционный',
    text: 'В осях 9/А-Ж с отм. +11.450 по +18.290 произведён монтаж несущих элементов светопрозрачных конструкций с отступлением от РД — нарушена геометрия крепления.',
    ntdDoc: 'СП 48.13330.2019', ntdClause: 'п.8.1',
    tags: [{ c: 'defects', v: 'отступление от РД' }, { c: 'defects', v: 'несоосность' }, { c: 'materials', v: 'стекло' }],
    hasPhoto: true },
  { id: 4, tab: 'construction', workCode: '1', work: 'Геодезия', subtype: 'Разбивка осей и отметок', control: 'геодезический',
    text: 'Уничтожены рабочие высотные репера на монтажном горизонте, с которых производилась выверка положения конструкций. Геодезический контроль невозможен.',
    ntdDoc: 'СП 126.13330.2017', ntdClause: 'п.6.10',
    tags: [{ c: 'equip', v: 'репера' }, { c: 'defects', v: 'утрата' }],
    hasPhoto: false },
  { id: 5, tab: 'construction', workCode: '13', work: 'Фасады', subtype: 'Монтаж направляющих', control: 'операционный',
    text: 'Шаг крепления кронштейнов навесного вентилируемого фасада 800 мм при проектном 600 мм. Участок 3-5 этажей. Крепёж установлен не по РД.',
    ntdDoc: 'СТО НОСТРОЙ 2.14.62', ntdClause: 'п.7.3.4',
    tags: [{ c: 'constructs', v: 'НВФ' }, { c: 'materials', v: 'крепёж' }, { c: 'defects', v: 'шаг' }],
    hasPhoto: true },
  { id: 6, tab: 'construction', workCode: '14', work: 'Отделка', subtype: 'Производство без РД', control: 'операционный',
    text: 'Производство отделочных работ ведётся без РД, выданной в производство. Не согласованы узлы, не утверждена ведомость отделки.',
    ntdDoc: 'СП 48.13330', ntdClause: 'п.4.6',
    tags: [{ c: 'documents', v: 'отсутствие РД' }, { c: 'defects', v: 'несогласованные узлы' }],
    hasPhoto: false },
  { id: 7, tab: 'construction', workCode: '15', work: 'ЭОМ, СС', subtype: 'Силовое электрооборудование', control: 'операционный',
    text: 'Крепление вертикально проложенного кабеля электрообогрева выполнено без навивки на водосточные трубы. Шаг креплений более 250 мм при требуемом 150 мм.',
    ntdDoc: 'РД ЭМ', ntdClause: 'лист 2, схема узлов',
    tags: [{ c: 'materials', v: 'кабель' }, { c: 'defects', v: 'шаг' }, { c: 'constructs', v: 'электрообогрев' }],
    hasPhoto: true },
  { id: 8, tab: 'construction', workCode: '16', work: 'ОВ, ВК', subtype: 'Противопожарный водопровод', control: 'приёмочный',
    text: 'Пожарные клапаны ВПВ в осях 3-10 этажей смонтированы впритык к простенку — не обеспечена оперативная доступность. Нарушены габариты модуля пожарного шкафа.',
    ntdDoc: 'ГОСТ Р 51844-2009', ntdClause: 'п.5.6',
    tags: [{ c: 'constructs', v: 'клапан ВПВ' }, { c: 'defects', v: 'нет доступа' }],
    hasPhoto: true },
  { id: 9, tab: 'construction', workCode: '17', work: 'Наружные сети', subtype: 'Ливневая канализация', control: 'приёмочный',
    text: 'Устройство колодцев наружной дождевой канализации выполнено без освидетельствования скрытых работ. Акты АОСР не оформлены.',
    ntdDoc: 'Постановление №468', ntdClause: 'положение о СК, п.3',
    tags: [{ c: 'documents', v: 'отсутствие АОСР' }, { c: 'constructs', v: 'колодцы' }],
    hasPhoto: false },
  { id: 10, tab: 'construction', workCode: '18', work: 'Благоустройство', subtype: 'Подстилающие слои', control: 'приёмочный',
    text: 'По запросу СК не предоставлены протоколы лабораторных испытаний качества уплотнения песчаного основания под устройство подпорной стенки.',
    ntdDoc: 'СП 82.13330.2016', ntdClause: 'п.4.13',
    tags: [{ c: 'documents', v: 'отсутствие ЛИ' }, { c: 'constructs', v: 'подпорная стенка' }],
    hasPhoto: false },
  { id: 11, tab: 'ot', workCode: '20', work: 'Охрана труда и ПСЭБ', subtype: 'санитарная_безопасность', control: 'охрана_труда',
    text: 'На территории строительной площадки в местах бытовых помещений не ведётся своевременная уборка снега проходов к рабочим местам.',
    ntdDoc: 'СНиП 12-03-2001', ntdClause: 'п.6.1.6',
    tags: [{ c: 'hazards', v: 'скользко' }, { c: 'barriers', v: 'проход' }],
    hasPhoto: false },
  { id: 12, tab: 'documents', workCode: '21', work: 'Исполнительная документация', subtype: 'Общий журнал работ', control: 'документационный',
    text: 'Лицо, осуществляющее строительство, не фиксирует результаты геодезического контроля точности геометрических параметров в общем журнале работ.',
    ntdDoc: 'ГОСТ Р 21.101', ntdClause: 'раздел 6',
    tags: [{ c: 'documents', v: 'общий журнал' }, { c: 'defects', v: 'не фиксируется' }],
    hasPhoto: false },
  { id: 13, tab: 'construction', workCode: '5', work: 'Монолитные ЖБ', subtype: 'Установка опалубки', control: 'геодезический',
    text: 'На исполнительной схеме устройства опалубки монолитных конструкций в границах СВП2 выявлены отклонения от вертикали, превышающие допустимые значения по табл. 5.11.',
    ntdDoc: 'СП 70.13330.2019', ntdClause: 'табл. 5.11',
    tags: [{ c: 'defects', v: 'отклонение' }, { c: 'materials', v: 'опалубка' }],
    hasPhoto: true },
  { id: 14, tab: 'construction', workCode: '3', work: 'Котлован, земляные', subtype: 'Устройство котлованов', control: 'операционный',
    text: 'Крутизна откоса котлована более 1:1 не соответствует ППР. По всей протяжённости участка земляных работ выявлены вывалы грунта из-под подошвы откоса.',
    ntdDoc: 'ППР 34', ntdClause: 'табл. 13 лист 11',
    tags: [{ c: 'defects', v: 'геометрия' }, { c: 'hazards', v: 'обрушение' }],
    hasPhoto: true },
  { id: 15, tab: 'construction', workCode: '4', work: 'Фундаменты, сваи', subtype: 'Устройство ростверка', control: 'операционный',
    text: 'Открытые поверхности бетонной подготовки не укрыты от испарения воды и попадания атмосферных осадков. Не обеспечено поддержание температурно-влажностного режима.',
    ntdDoc: 'СП 70.13330.2012', ntdClause: 'п.5.4.1',
    tags: [{ c: 'materials', v: 'бетон' }, { c: 'defects', v: 'ТВР' }],
    hasPhoto: false },
  { id: 16, tab: 'construction', workCode: '6', work: 'Сборные ЖБ', subtype: 'Входной контроль', control: 'входной',
    text: 'При входном контроле ЖБ-гребёнок на строительной площадке: на лицевой поверхности конструкций ПС 110×116 отсутствуют документы о качестве, выявлены пустоты и сколы более допустимого.',
    ntdDoc: 'СП 70.13330.2012', ntdClause: 'Приложение Х',
    tags: [{ c: 'documents', v: 'паспорт качества' }, { c: 'defects', v: 'сколы' }, { c: 'defects', v: 'пустоты' }],
    hasPhoto: true },
  { id: 17, tab: 'construction', workCode: '7', work: 'Металлоконструкции', subtype: 'Монтаж каркаса', control: 'операционный',
    text: 'При освидетельствовании монтажа металлического каркаса в осях Т-7 – Т-8 расстояние от ЖБ-стены до несущей стойки 80×80 менее проектного. Болтовые соединения выполнены без шайб.',
    ntdDoc: 'СП 48.13330.2019', ntdClause: 'п.8.1.1',
    tags: [{ c: 'defects', v: 'геометрия' }, { c: 'materials', v: 'крепёж' }, { c: 'constructs', v: 'каркас' }],
    hasPhoto: true },
  { id: 18, tab: 'construction', workCode: '8', work: 'Кладка', subtype: 'Кладка из газобетонного блока', control: 'операционный',
    text: 'При устройстве перегородок из газоблока в осях 7-А26/Б7 на отм. ±0.000 не выполнена перевязка между рядами в месте сопряжения внутренней и наружной стен (угловой узел).',
    ntdDoc: 'СП 70.13330.2012', ntdClause: 'п.9.2.1',
    tags: [{ c: 'materials', v: 'газобетон' }, { c: 'defects', v: 'нет перевязки' }],
    hasPhoto: true },
  { id: 19, tab: 'construction', workCode: '9', work: 'Лифты, эскалаторы', subtype: 'Сохранность работ', control: 'приёмочный',
    text: 'На корпусе №2 затоплены лифтовые приямки лифтов №2.4.1, 2.4.2, 2.3.2, 2.3.1. Не приняты меры по сохранности выполненных работ.',
    ntdDoc: 'ППР', ntdClause: 'раздел 4, меры сохранности',
    tags: [{ c: 'defects', v: 'протечка' }, { c: 'constructs', v: 'приямок' }],
    hasPhoto: true },
  { id: 20, tab: 'ot', workCode: '20', work: 'Охрана труда и ПСЭБ', subtype: 'охрана_труда', control: 'охрана_труда',
    text: 'Работник выполняет монтажные работы на высоте ≈4 м (перекрытие) без страховочной привязи, без каски. Рядом — открытый край перекрытия без временного ограждения.',
    ntdDoc: 'СП 48.13330.2019', ntdClause: 'п.6.2.3',
    tags: [{ c: 'ppe', v: 'страховка' }, { c: 'ppe', v: 'каска' }, { c: 'barriers', v: 'ограждение' }, { c: 'hazards', v: 'высота' }],
    hasPhoto: true },
]

const ARCHIVE_STATS = { total: 8577, norms: 70, clauses: 14933, chunks: 20722, workTypes: WORK_TYPES.length, tagCats: 8, deduped: 'из ~25 000 исходных' }

const TAG_COLOR: Record<string, string> = {
  materials:  'bg-amber-50/70 border-amber-200 text-amber-800',
  defects:    'bg-rose-50/70 border-rose-200 text-rose-800',
  constructs: 'bg-teal-50/70 border-teal-200 text-teal-800',
  documents:  'bg-indigo-50/70 border-indigo-200 text-indigo-800',
  hazards:    'bg-orange-50/70 border-orange-200 text-orange-800',
  equip:      'bg-sky-50/70 border-sky-200 text-sky-800',
  ppe:        'bg-violet-50/70 border-violet-200 text-violet-800',
  barriers:   'bg-pink-50/70 border-pink-200 text-pink-800',
}

/* ── Vision case ─────────────────────────────────────────────── */
// Инженер пишет бытовым языком
const CASE_ENGINEER_RAW = 'Ребята работают без касок на 4 этаже на перекрытии'

// AI переводит на инженерный
const CASE_AI_TRANSLATED = 'Работники выполняют монтажные работы на высоте ≈4 м без защитных касок. Средства индивидуальной защиты от головных травм отсутствуют.'

// AI нашёл на фото дополнительные нарушения, которые инженер не назвал
const CASE_AI_EXTRA = [
  { id: 'a', text: 'Отсутствует страховочная привязь у работника на высоте', preselected: true },
  { id: 'b', text: 'Открытый край перекрытия без временного ограждения (высота ≥1.1 м)', preselected: true },
  { id: 'c', text: 'Материалы складированы на проходной части перекрытия', preselected: false },
]

const CASE_CLASSIFICATION = {
  control: 'охрана труда',
  work:    'монолитные ЖБ (на перекрытии)',
  subtype: 'работа на высоте без СИЗ',
}
const CASE_TAGS = [
  { c: 'hazards',  v: 'высота' },
  { c: 'ppe',      v: 'страховочная привязь' },
  { c: 'ppe',      v: 'каска' },
  { c: 'barriers', v: 'ограждение перекрытия' },
]

const CITATIONS = [
  { rank: 1, doc: 'СП 48.13330.2019',    clause: 'п.6.2.3', text: 'При работе на высоте более 1.8 м от земли или пола при отсутствии ограждений применяется страховочная привязь.', critical: true, aiPick: true },
  { rank: 2, doc: 'Приказ Минтруда 782н', clause: 'п.52',   text: 'Работы на высоте допускается выполнять только работникам, прошедшим обучение и аттестацию, с применением СИЗ от падения.', critical: true, aiPick: true },
  { rank: 3, doc: 'ГОСТ 12.4.059-89',     clause: 'п.5.4',   text: 'Открытые края перекрытий и технологические проёмы ограждаются временными ограждениями высотой не менее 1.1 м.', critical: false, aiPick: true },
  { rank: 4, doc: 'СП 48.13330.2019',     clause: 'п.6.1.7', text: 'Каска защитная должна применяться всеми работниками и ИТР на строительной площадке.', critical: false, aiPick: false },
  { rank: 5, doc: 'СТО НОСТРОЙ 2.35.82',  clause: 'п.4.3',   text: 'Перед допуском к работе на высоте проводится инструктаж и проверка знаний требований охраны труда.', critical: false, aiPick: false },
]

/* ── Шаблоны документа ───────────────────────────────────────── */
const DOC_TEMPLATES = [
  { id: 'presc',  name: 'Стандартное предписание',         desc: 'Выявление + обоснование + срок устранения' },
  { id: 'act',    name: 'Акт выявленных нарушений',        desc: 'Формальный акт со ссылками на НТД' },
  { id: 'brief',  name: 'Краткая сводка (служебная записка)', desc: 'Одна страница для руководителя' },
  { id: 'report', name: 'Детальный отчёт',                 desc: 'С фото, анализом и рекомендациями' },
]

/* ── Эвал — реальные цифры production-прогона 2026-04-17 ─────── */
const EVAL = {
  goldenCases: 88,
  recall30: 90.9,           // Правильный пункт в топ-30
  exactFirst: 56.8,         // Первый же ответ — точный (50/88)
  top5: 77.3,               // В топ-5 (68/88)
  top10: 83.0,              // В топ-10 (73/88)
  llmExact: 75.0,           // LLM выбрала точно target (66/88)
  inTopic: 80.7,            // Цитата «в тему» (по Claude-судье, 155/192)
  hallucinations: 0,        // % галлюцинаций
  linksTotal: 192,          // всего ссылок дала модель
  abTest: [
    { method: 'Смешанный поиск + переранжирование (продакшен)', recall: 90.9, active: true },
    { method: 'Взвешенная сумма оценок',                        recall: 73.9 },
    { method: 'Только семантический поиск',                     recall: 70.5 },
    { method: 'Только по ключевым словам',                      recall: 56.8 },
  ],
  rankDistribution: [
    { pos: 'В 1-м результате', hits: 50, total: 88 },
    { pos: 'В первых 5',       hits: 68, total: 88 },
    { pos: 'В первых 10',      hits: 73, total: 88 },
    { pos: 'В первых 30',      hits: 80, total: 88 },
  ],
}

/* ── Admin — usage, unresolved, top queries (только ОТ) ──────── */
const ADMIN_USAGE = [
  { label: 'Поисков за сутки',          value: '126', sub: '+8% к среднему',    spark: [38, 41, 52, 48, 57, 126] },
  { label: 'Копирований цитат',         value: '73',  sub: 'инженеры → в документы', spark: [21, 28, 24, 35, 41, 73] },
  { label: 'Открытий PDF-норм',         value: '41',  sub: 'ТехЭксперт-ссылки', spark: [11, 14, 12, 18, 22, 41] },
  { label: 'Сгенерировано предписаний', value: '12',  sub: 'через Сканер',      spark: [3, 4, 6, 5, 8, 12] },
]

const POPULAR_QUERIES = [
  { q: 'страховочная привязь высота',               n: 42 },
  { q: 'каска монтажные работы',                    n: 31 },
  { q: 'ограждение открытого края перекрытия',      n: 28 },
  { q: 'инструктаж при работе на высоте',           n: 22 },
  { q: 'складирование отходов на стройплощадке',    n: 19 },
  { q: 'наряд-допуск на работы повышенной опасности', n: 14 },
]

const UNRESOLVED_CASES = [
  { q: 'требования к страховочным системам при работе в ограниченных пространствах', n: 7, reason: 'нет профильного норматива в базе' },
  { q: 'требования к освещённости временных проходов в условиях недостаточной видимости', n: 5, reason: 'релевантные пункты не в топ-10' },
  { q: 'порядок допуска персонала субподрядчиков на высотные работы', n: 4, reason: 'пограничный домен: ОТ ↔ организация' },
  { q: 'средства коллективной защиты при работе с ручным электроинструментом на высоте', n: 3, reason: 'требование на стыке ОТ и электробезопасности' },
]

/* ── Admin taxonomy (для admin tab) ─────────────────────────── */
const ADMIN_TAXO_STATS = {
  workTypes: WORK_TYPES.length,
  univSubtypes: UNIVERSAL_SUBTYPES.length,
  materialTags: 29,
  defectTags: 15,
  toolTags: 7,
  totalTagPairs: 52, // tag-categories × values
}

/* ═════════════════════ EXPORT ═════════════════════ */
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
            <div className="text-sm font-bold">Запустить демо Scanner</div>
            <div className="text-xs text-muted mt-0.5">DataBook + AI-конструктор предписаний</div>
          </div>
          <svg className="btn-premium-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
      {open && <Modal onClose={handleClose} />}
    </>
  )
}

/* ═════════════════════ MOBILE TEASER ═════════════════════ */
function MobileTeaser({ onClose }: { onClose: () => void }) {
  const screens = ['intro', 'databook', 'scanner', 'document', 'admin'] as const
  type Scr = typeof screens[number]
  const [scr, setScr] = useState<Scr>('intro')
  const idx = screens.indexOf(scr)

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

  const labels: Record<Scr, string> = { intro: 'О продукте', databook: 'DataBook', scanner: 'Сканер', document: 'Документ', admin: 'Админ' }

  return (
    <div className="flex md:hidden flex-col h-full bg-[#F8FAFC]" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="bg-white px-4 pt-4 pb-2 shrink-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] text-white font-bold" style={{ background: BRAND }}>SC</div>
            <div>
              <div className="text-sm font-bold text-slate-800">Scanner</div>
              <div className="text-[9px] text-slate-400">DataBook + AI-конструктор</div>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border-none text-sm cursor-pointer">&times;</button>
        </div>
      </div>
      <div className="flex bg-white border-b border-slate-200/60 px-1 shrink-0 overflow-x-auto scrollbar-hidden">
        {screens.map(s => (
          <button key={s} onClick={() => setScr(s)}
            className={`flex-1 px-2 py-2.5 text-[10px] font-semibold whitespace-nowrap transition-colors border-none cursor-pointer bg-transparent ${scr === s ? 'text-[#2563EB]' : 'text-slate-400'}`}
            style={scr === s ? { borderBottom: `2px solid ${BRAND}` } : { borderBottom: '2px solid transparent' }}
          >{labels[s]}</button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {scr === 'intro' && <>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Три сущности, один продукт</div>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#2563EB]/10 flex items-center justify-center text-base shrink-0">📚</div>
                <div>
                  <div className="text-[12px] font-semibold text-slate-800">DataBook</div>
                  <div className="text-[11px] text-slate-500 leading-snug">Архив {ARCHIVE_STATS.total.toLocaleString('ru-RU')} реальных предписаний — классифицирован и размечен.</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#2563EB]/10 flex items-center justify-center text-base shrink-0">📋</div>
                <div>
                  <div className="text-[12px] font-semibold text-slate-800">Библиотека нормативов</div>
                  <div className="text-[11px] text-slate-500 leading-snug">{ARCHIVE_STATS.clauses.toLocaleString('ru-RU')} пунктов СП/ГОСТ — размечены <b>по той же таксономии</b>. Это даёт симметрию для точного поиска.</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#2563EB]/10 flex items-center justify-center text-base shrink-0">📷</div>
                <div>
                  <div className="text-[12px] font-semibold text-slate-800">Сканер + конструктор</div>
                  <div className="text-[11px] text-slate-500 leading-snug">Фото нарушения → AI описывает → находит пункты в библиотеке → готовый DOCX.</div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-amber-50/60 border border-amber-200/50 rounded-xl p-3">
            <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">Статус</div>
            <div className="text-[11px] text-slate-700">Пилот по охране труда. Архитектура универсальна — масштабируется на {WORK_TYPES.length - 2} вида работ.</div>
          </div>
        </>}
        {scr === 'databook' && <>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white rounded-xl p-2.5 border border-slate-200 text-center">
              <div className="text-sm font-bold text-slate-800">{ARCHIVE_STATS.total.toLocaleString('ru-RU')}</div>
              <div className="text-[8px] text-slate-400 mt-0.5">предписаний</div>
            </div>
            <div className="bg-white rounded-xl p-2.5 border border-slate-200 text-center">
              <div className="text-sm font-bold text-slate-800">{ARCHIVE_STATS.workTypes}</div>
              <div className="text-[8px] text-slate-400 mt-0.5">видов работ</div>
            </div>
            <div className="bg-white rounded-xl p-2.5 border border-slate-200 text-center">
              <div className="text-sm font-bold text-slate-800">{ARCHIVE_STATS.tagCats}</div>
              <div className="text-[8px] text-slate-400 mt-0.5">категорий тегов</div>
            </div>
          </div>
          <div className="space-y-1.5">
            {ARCHIVE.slice(0, 4).map(p => (
              <div key={p.id} className="bg-white rounded-xl p-2.5 border border-slate-200">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className="text-[9px] font-bold text-slate-700">{p.work}</span>
                  <span className="text-[8px] text-slate-400">·</span>
                  <span className="text-[8px] text-slate-500">{p.control}</span>
                </div>
                <div className="text-[10px] text-slate-700 leading-snug line-clamp-2">{p.text}</div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {p.tags.slice(0, 3).map(t => (
                    <span key={t.v} className={`text-[8px] px-1.5 py-0.5 rounded border ${TAG_COLOR[t.c] || ''}`}>{t.v}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>}
        {scr === 'scanner' && <>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="relative aspect-video flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)' }}>
              <svg className="w-12 h-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3">
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">AI описал нарушение</div>
            <div className="text-[11px] text-slate-700 leading-relaxed">{CASE_AI_TRANSLATED}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3">
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Найденное обоснование</div>
            <div className="space-y-1.5">
              {CITATIONS.slice(0, 3).map(c => (
                <div key={c.rank} className="border-l-2 border-[#2563EB]/40 pl-2">
                  <div className="text-[10px] font-semibold text-slate-700">{c.doc} · {c.clause}</div>
                  <div className="text-[10px] text-slate-500 leading-snug line-clamp-2">{c.text}</div>
                </div>
              ))}
            </div>
          </div>
        </>}
        {scr === 'document' && <>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#2563EB]/10 text-[#2563EB]">DOCX</span>
              <span className="text-[10px] text-slate-600">Предписание №SC-127</span>
            </div>
            <div className="p-3 space-y-2.5">
              <div>
                <div className="text-[9px] text-slate-400 mb-0.5">НАРУШЕНИЕ</div>
                <div className="text-[10px] text-slate-700 leading-snug">Работа на высоте без страховочной привязи, без каски, без ограждения.</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-400 mb-1">ОБОСНОВАНИЕ</div>
                <div className="space-y-1.5">
                  {CITATIONS.slice(0, 2).map(c => (
                    <div key={c.rank} className="border-l-2 border-[#2563EB]/30 pl-2">
                      <div className="text-[9px] font-semibold text-slate-700">{c.doc} · {c.clause}</div>
                      <div className="text-[9px] text-slate-500 italic leading-snug">«{c.text}»</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <button className="w-full py-2.5 rounded-xl text-white text-[11px] font-semibold border-none shadow-sm" style={{ background: BRAND }}>📄 Скачать DOCX</button>
        </>}
        {scr === 'admin' && <>
          <div className="grid grid-cols-2 gap-2">
            {ADMIN_USAGE.map(s => (
              <div key={s.label} className="bg-white rounded-xl p-2.5 border border-slate-200">
                <div className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">{s.label}</div>
                <div className="text-lg font-bold text-slate-800 mt-1">{s.value}</div>
                <div className="text-[8px] text-slate-400 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl p-3 border border-slate-200">
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">Нерешённые запросы</div>
            <div className="space-y-1.5">
              {UNRESOLVED_CASES.slice(0, 3).map(c => (
                <div key={c.q} className="border-l-2 border-amber-400/50 pl-2">
                  <div className="text-[10px] text-slate-700 leading-snug">«{c.q}»</div>
                  <div className="text-[9px] text-amber-700 mt-0.5">{c.reason} · {c.n}×</div>
                </div>
              ))}
            </div>
          </div>
        </>}
      </div>
      <div className="px-4 py-2.5 bg-white border-t border-slate-200/60 shrink-0">
        <div className="flex justify-center gap-1.5 mb-1.5">
          {screens.map((s, i) => (
            <div key={s} className={`rounded-full transition-all ${i === idx ? 'w-4 h-1.5' : 'w-1.5 h-1.5 bg-slate-300'}`} style={i === idx ? { background: BRAND } : undefined} />
          ))}
        </div>
        <p className="text-[9px] text-slate-400 text-center">Полноэкранная версия — на ПК</p>
      </div>
    </div>
  )
}

/* ═════════════════════ MODAL ═════════════════════ */
function Modal({ onClose }: { onClose: () => void }) {
  const [screen, setScreen] = useState<Screen>('databook')
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
        <MobileTeaser onClose={onClose} />
        <div className="hidden md:flex flex-1 min-h-0">
          <div className="w-[240px] bg-white border-r border-slate-200 flex flex-col shrink-0">
            <div className="h-14 flex items-center px-4 border-b border-slate-200">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[0.6rem] text-white font-bold mr-3" style={{ background: BRAND }}>SC</div>
              <div><div className="text-sm font-bold text-slate-800">Scanner</div><div className="text-[0.58rem] text-slate-400">пилот · охрана труда</div></div>
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
                <div className="flex-1 min-w-0"><div className="text-[0.75rem] font-semibold text-slate-700 truncate">Хроменок Н.В.</div><div className="text-[0.6rem] text-slate-400">Инженер СК</div></div>
              </div>
              <div className="text-[0.55rem] text-slate-400 text-center mt-2">Scanner · DataBook + AI</div>
            </div>
          </div>
          <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
            <div className="h-14 flex items-center justify-between px-6 bg-white border-b border-slate-200 shrink-0">
              <h2 className="text-[0.95rem] font-bold text-slate-800 m-0">{titles[screen]}</h2>
              <div className="flex items-center gap-3">
                <span className="text-[0.72rem] text-slate-400">Пилот · охрана труда</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {screen === 'databook'     && <PgDataBook   onOpenScanner={() => setScreen('scanner')} />}
              {screen === 'scanner'      && <PgScannerFlow />}
              {screen === 'admin'        && <PgAdmin />}
              {screen === 'architecture' && <PgArchitecture />}
              {screen === 'taxonomy'     && <PgTaxonomy />}
              {screen === 'quality'      && <PgQuality />}
            </div>
          </div>
        </div>
      </div>
    </div>, document.body,
  )
}

/* ═════════════════════ PG: DATABOOK ═════════════════════ */
function PgDataBook({ onOpenScanner }: { onOpenScanner: () => void }) {
  const [tab, setTab] = useState<TabKey>('all')
  const [wt, setWt]   = useState<string>('all')
  const [ct, setCt]   = useState<string>('all')
  const [us, setUs]   = useState<string>('all')
  const [q, setQ]     = useState('')

  // Reset dependent filters when tab changes
  useEffect(() => { setWt('all'); setCt('all'); setUs('all') }, [tab])

  const filtered = useMemo(() => ARCHIVE.filter(p =>
    (tab === 'all' || p.tab === tab) &&
    (wt === 'all' || p.workCode === wt) &&
    (ct === 'all' || p.control === ct) &&
    (us === 'all' || p.subtype.toLowerCase().includes(us.toLowerCase())) &&
    (q === '' || p.text.toLowerCase().includes(q.toLowerCase()) || p.ntdDoc.toLowerCase().includes(q.toLowerCase())),
  ), [tab, wt, ct, us, q])

  // На разных табах третий слой показывает разные вещи:
  // construction → work_types (17 видов)
  // ot → subtypes одного work_type "20_охрана_труда" (5 штук)
  // organization → org_types для work_type "19_организация"
  // documents → doc_types для work_type "21_документация"
  const thirdLayer = tab === 'ot' ? OT_SUBTYPES.map(s => ({ code: s.code, name: s.name, icon: s.icon }))
                   : tab === 'organization' ? ORG_TYPES.map(o => ({ code: o, name: o, icon: '📋' }))
                   : tab === 'documents' ? DOC_TYPES.map(d => ({ code: d, name: d, icon: '📓' }))
                   : WORK_TYPES

  const thirdLayerLabel = tab === 'ot' ? `Направление охраны труда (${OT_SUBTYPES.length})`
                        : tab === 'organization' ? `Организационный вопрос (${ORG_TYPES.length})`
                        : tab === 'documents' ? `Тип документа (${DOC_TYPES.length})`
                        : `Вид работ (${WORK_TYPES.length})`

  // control_type dropdown показывается только на Construction tab
  const showControlType = tab === 'construction' || tab === 'all'
  // universal subtypes — только на Construction
  const showUniSubtype = tab === 'construction' || tab === 'all'
  // третий слой показывается всегда
  const showThirdLayer = true

  return (
    <div className="p-5 max-w-[1320px] mx-auto">
      {/* Intro */}
      <div className="bg-gradient-to-br from-[#2563EB]/5 to-[#4F46E5]/5 border border-[#2563EB]/15 rounded-2xl p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#2563EB]/10 flex items-center justify-center text-lg shrink-0">📚</div>
          <div>
            <h3 className="text-[0.9rem] font-bold text-slate-800 m-0 mb-1">DataBook — архив + источник таксономии</h3>
            <p className="text-[0.76rem] text-slate-600 leading-relaxed">
              {ARCHIVE_STATS.total.toLocaleString('ru-RU')} дедуплицированных предписаний ({ARCHIVE_STATS.deduped}). Классифицированы по {ARCHIVE_STATS.workTypes} видам работ, {UNIVERSAL_SUBTYPES.length} универсальным подвидам и {ARCHIVE_STATS.tagCats} категориям тегов. Инженер ищет здесь прецеденты; система использует эти данные как <b>вторую плоскость к таксономии</b> (первую формирует сама нормативка) — и как эталонный набор для проверки качества поиска.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <StatMini label="Предписаний"      value={ARCHIVE_STATS.total.toLocaleString('ru-RU')} sub="дедуплицированы" />
        <StatMini label="Видов работ"      value={ARCHIVE_STATS.workTypes.toString()} sub="включая организацию и ИД" />
        <StatMini label="Категорий тегов"  value={ARCHIVE_STATS.tagCats.toString()} sub="materials, defects, ppe..." />
        <StatMini label="Ссылок в НТД"     value={ARCHIVE_STATS.norms.toString()} sub="документов СП/ГОСТ/приказов" />
      </div>

      {/* Filters card — реальная 5-слойная иерархия из emb2 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-3">
        {/* СЛОЙ 1: MAIN_TABS (главный переключатель разделов) */}
        <div className="px-3 py-3 border-b border-slate-200 bg-slate-50/50">
          <div className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-wider mb-2">Слой 1 · главный раздел</div>
          <div className="flex gap-1.5 items-center flex-wrap">
            {MAIN_TABS.map(t => {
              const isOT = t.key === 'ot'
              const active = tab === t.key
              return (
                <button key={t.key} onClick={() => setTab(t.key)} className={`shrink-0 px-3 py-1.5 rounded-md text-[0.75rem] font-semibold border cursor-pointer transition-colors flex items-center gap-1.5 ${active ? (isOT ? 'bg-red-500 text-white border-red-500' : 'bg-[#2563EB] text-white border-[#2563EB]') : (isOT ? 'bg-red-50 text-red-700 border-red-200 hover:border-red-300' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300')}`}>
                  <span className="text-[0.85rem]">{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* СЛОЙ 2: CONTROL TYPE (только для Construction) */}
        {showControlType && (
          <div className="px-3 py-3 border-b border-slate-100 overflow-x-auto">
            <div className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-wider mb-2">Слой 2 · вид контроля {tab === 'construction' ? `(${CONSTRUCTION_CONTROL_TYPES.length - 1})` : ''}</div>
            <div className="flex gap-1.5 items-center">
              {CONSTRUCTION_CONTROL_TYPES.map(c => (
                <button key={c.code} onClick={() => setCt(c.code)} className={`shrink-0 px-2.5 py-1.5 rounded-md text-[0.7rem] font-medium border cursor-pointer transition-colors ${ct === c.code ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* СЛОЙ 3: work_type / OT subtypes / org_type / doc_type */}
        {showThirdLayer && (
          <div className="px-3 py-3 border-b border-slate-100 overflow-x-auto">
            <div className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-wider mb-2">Слой 3 · {thirdLayerLabel}</div>
            {/* Для OT/Organization/Documents — сверху показываем «Выбран work_type» */}
            {tab === 'ot' && (
              <div className="mb-2 flex items-center gap-1.5 text-[0.68rem] text-slate-500"><span className="font-semibold">work_type:</span><span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-medium">🦺 20_охрана_труда</span><span className="text-slate-400">← зафиксирован</span></div>
            )}
            {tab === 'organization' && (
              <div className="mb-2 flex items-center gap-1.5 text-[0.68rem] text-slate-500"><span className="font-semibold">work_type:</span><span className="px-1.5 py-0.5 rounded bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20 font-medium">📋 19_организация</span><span className="text-slate-400">← зафиксирован</span></div>
            )}
            {tab === 'documents' && (
              <div className="mb-2 flex items-center gap-1.5 text-[0.68rem] text-slate-500"><span className="font-semibold">work_type:</span><span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200 font-medium">📓 21_документация</span><span className="text-slate-400">← зафиксирован</span></div>
            )}
            <div className="flex gap-1.5 items-center">
              <button onClick={() => setWt('all')} className={`shrink-0 px-2.5 py-1.5 rounded-md text-[0.7rem] font-medium border cursor-pointer transition-colors ${wt === 'all' ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>Все</button>
              {thirdLayer.map(w => (
                <button key={w.code} onClick={() => setWt(w.code)} className={`shrink-0 px-2.5 py-1.5 rounded-md text-[0.7rem] font-medium border cursor-pointer transition-colors flex items-center gap-1 ${wt === w.code ? (tab === 'ot' ? 'bg-red-500 text-white border-red-500' : 'bg-[#2563EB] text-white border-[#2563EB]') : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                  <span className="text-[0.8rem]">{w.icon}</span>
                  <span>{w.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* СЛОЙ 4: SUBTYPES — когда work_type выбран, показываем специфичные + универсальные */}
        {showUniSubtype && (
          <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/30 overflow-x-auto">
            <div className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Слой 4 · подвид работ · специфичные
              {wt !== 'all' && tab === 'construction' && WORK_SUBTYPES[wt] ? ` для «${WORK_TYPES.find(w => w.code === wt)?.name}» (${WORK_SUBTYPES[wt].length})` : ` (при выборе вида работ сверху — появятся свои: для отделки — штукатурка/шпатлёвка/окраска; для фасадов — подсистема/утеплитель/облицовка и т.д.)`}
              {' '}⊕ универсальные ({UNIVERSAL_SUBTYPES.length})
            </div>
            <div className="flex gap-1.5 items-center flex-wrap">
              <button onClick={() => setUs('all')} className={`shrink-0 px-2 py-1 rounded text-[0.65rem] font-medium border cursor-pointer ${us === 'all' ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-500 border-slate-200'}`}>Все</button>
              {/* Специфичные subtypes, если wt выбран */}
              {wt !== 'all' && tab === 'construction' && WORK_SUBTYPES[wt] && WORK_SUBTYPES[wt].map(u => (
                <button key={u} onClick={() => setUs(u)} className={`shrink-0 px-2 py-1 rounded text-[0.65rem] font-medium border cursor-pointer ${us === u ? 'bg-teal-600 text-white border-teal-600' : 'bg-teal-50/60 text-teal-800 border-teal-200 hover:border-teal-300'}`}>{u}</button>
              ))}
              {/* Разделитель */}
              {wt !== 'all' && tab === 'construction' && WORK_SUBTYPES[wt] && (
                <span className="text-slate-300 mx-1 shrink-0">│</span>
              )}
              {/* Универсальные — показываются всегда */}
              {UNIVERSAL_SUBTYPES.map(u => (
                <button key={u} onClick={() => setUs(u)} className={`shrink-0 px-2 py-1 rounded text-[0.65rem] font-medium border cursor-pointer ${us === u ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>{u}</button>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="p-3 border-b border-slate-100 flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Поиск по тексту или НТД..." className="flex-1 bg-transparent border-none outline-none text-[0.78rem] text-slate-700 placeholder:text-slate-400" />
          </div>
        </div>

        {/* Active chips */}
        {(tab !== 'all' || wt !== 'all' || ct !== 'all' || us !== 'all' || q !== '') && (
          <div className="px-3 py-2 bg-slate-50/50 border-b border-slate-100 flex items-center gap-1.5 flex-wrap">
            <span className="text-[0.62rem] text-slate-400 uppercase font-bold tracking-wider">Активно:</span>
            {tab !== 'all' && (
              <Chip label={MAIN_TABS.find(t => t.key === tab)?.label || ''} onClear={() => setTab('all')} color={tab === 'ot' ? 'red' : 'blue'} />
            )}
            {wt !== 'all' && (
              <Chip label={thirdLayer.find(w => w.code === wt)?.name || ''} onClear={() => setWt('all')} color="blue" />
            )}
            {ct !== 'all' && (
              <Chip label={CONSTRUCTION_CONTROL_TYPES.find(c => c.code === ct)?.label || ''} onClear={() => setCt('all')} color="slate" />
            )}
            {us !== 'all' && <Chip label={us} onClear={() => setUs('all')} color="green" />}
            {q && <Chip label={`«${q}»`} onClear={() => setQ('')} color="amber" />}
          </div>
        )}
      </div>

      {/* Result count */}
      <div className="flex items-center justify-between text-[0.72rem] text-slate-500 mb-2 px-1">
        <span>Показано <b className="text-slate-700">{filtered.length}</b> из {ARCHIVE_STATS.total.toLocaleString('ru-RU')}</span>
        <button onClick={onOpenScanner} className="text-[0.7rem] font-semibold text-[#2563EB] hover:underline cursor-pointer border-none bg-transparent">
          🧠 Создать новое предписание через Сканер →
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-[0.62rem] text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-2.5 font-semibold w-[18%]">Классификация</th>
              <th className="text-left px-4 py-2.5 font-semibold">Описание нарушения</th>
              <th className="text-left px-4 py-2.5 font-semibold w-[18%]">НТД</th>
              <th className="text-center px-4 py-2.5 font-semibold w-[70px]">Фото</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/60 align-top transition-colors">
                <td className="px-4 py-3">
                  <div className="text-[0.82rem] font-semibold text-slate-800 leading-snug">{p.work}</div>
                  <div className="text-[0.68rem] text-slate-400 mt-0.5">{p.control === 'ОТ' ? '🦺 Охрана труда' : p.control}</div>
                  {p.subtype && <div className="text-[0.66rem] text-slate-500 mt-0.5">{p.subtype}</div>}
                </td>
                <td className="px-4 py-3">
                  <div className="text-[0.78rem] text-slate-700 leading-relaxed">{p.text}</div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {p.tags.map(t => (
                      <span key={t.v} className={`text-[0.62rem] px-1.5 py-0.5 rounded border ${TAG_COLOR[t.c] || ''}`}>{t.v}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-[0.75rem] font-mono font-semibold text-slate-700">{p.ntdDoc}</div>
                  <div className="text-[0.68rem] text-slate-500 mt-0.5">{p.ntdClause}</div>
                  <a className="text-[0.65rem] text-[#2563EB] mt-1 inline-block hover:underline cursor-pointer">открыть в ТехЭксперт →</a>
                </td>
                <td className="px-4 py-3 text-center">
                  {p.hasPhoto ? (
                    <button className="inline-flex flex-col items-center text-[#2563EB] cursor-pointer border-none bg-transparent">
                      <div className="w-7 h-7 rounded-full bg-[#2563EB]/10 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="6" width="18" height="14" rx="2"/><circle cx="12" cy="13" r="3"/><path d="M8 6l2-3h4l2 3"/></svg>
                      </div>
                      <span className="text-[0.55rem] font-medium mt-0.5">Фото</span>
                    </button>
                  ) : (
                    <span className="text-[0.7rem] text-slate-300">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="py-10 text-center text-[0.78rem] text-slate-400">Ничего не найдено</div>}
      </div>
    </div>
  )
}

function Chip({ label, onClear, color }: { label: string; onClear: () => void; color: 'blue' | 'slate' | 'green' | 'amber' | 'red' }) {
  const cls = {
    blue:  'bg-[#2563EB]/10 text-[#2563EB]',
    slate: 'bg-slate-200 text-slate-700',
    green: 'bg-emerald-100 text-emerald-800',
    amber: 'bg-amber-100 text-amber-800',
    red:   'bg-red-100 text-red-700',
  }[color]
  return (
    <span className={`text-[0.68rem] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${cls}`}>
      {label}
      <button onClick={onClear} className="text-[0.8rem] leading-none bg-transparent border-none cursor-pointer opacity-60 hover:opacity-100">×</button>
    </span>
  )
}

/* ═════════════════════ PG: SCANNER FLOW (wrapper с top-степпером) ═════════════════════ */
type FlowStepKey = 'analyze' | 'citations' | 'document'
function PgScannerFlow() {
  const [step, setStep] = useState<FlowStepKey>('analyze')
  const steps: { key: FlowStepKey; num: number; label: string; icon: string }[] = [
    { key: 'analyze',   num: 1, label: 'Анализ фото', icon: '📷' },
    { key: 'citations', num: 2, label: 'Обоснование', icon: '🎯' },
    { key: 'document',  num: 3, label: 'Документ',    icon: '📄' },
  ]
  return (
    <div>
      {/* Top stepper */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-3">
        <div className="max-w-[960px] mx-auto flex items-center gap-2">
          {steps.map((s, i) => {
            const done = steps.findIndex(x => x.key === step) > i
            const active = s.key === step
            return (
              <React.Fragment key={s.key}>
                <button onClick={() => setStep(s.key)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-colors text-[0.78rem] font-medium ${active ? 'bg-[#2563EB] text-white border-[#2563EB]' : done ? 'bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/20' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
                  <span className={`w-5 h-5 rounded-full text-[0.65rem] font-bold flex items-center justify-center ${active ? 'bg-white text-[#2563EB]' : done ? 'bg-[#2563EB] text-white' : 'bg-slate-100 text-slate-500'}`}>{done ? '✓' : s.num}</span>
                  <span className="shrink-0">{s.icon}</span>
                  <span>{s.label}</span>
                </button>
                {i < steps.length - 1 && <div className={`flex-1 h-[2px] ${done ? 'bg-[#2563EB]/30' : 'bg-slate-200'}`} />}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* Step content */}
      {step === 'analyze'   && <PgScanner    onNext={() => setStep('citations')} />}
      {step === 'citations' && <PgCitations  onNext={() => setStep('document')} />}
      {step === 'document'  && <PgDocument />}
    </div>
  )
}

/* ═════════════════════ PG: SCANNER (шаг 1) ═════════════════════ */
function PgScanner({ onNext }: { onNext: () => void }) {
  const [step, setStep] = useState<'upload' | 'analyzing' | 'done'>('upload')
  const [progress, setProgress] = useState(0)
  const [engineerText, setEngineerText] = useState(CASE_ENGINEER_RAW)
  const [extraSelected, setExtraSelected] = useState<string[]>(() => CASE_AI_EXTRA.filter(e => e.preselected).map(e => e.id))

  useEffect(() => {
    if (step !== 'analyzing') return
    const id = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(id); setStep('done'); return 100 }
        return p + 3
      })
    }, 50)
    return () => clearInterval(id)
  }, [step])

  const toggleExtra = (id: string) => setExtraSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  return (
    <div className="p-6 max-w-[960px] mx-auto">
      {/* Block 1: Photo + engineer text */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[0.92rem] font-bold text-slate-800 mb-1">Что инженер видит на объекте</h3>
            <p className="text-[0.74rem] text-slate-500">Загружает фото и пишет суть бытовым языком — подробностей не требуется.</p>
          </div>
          <span className="text-[0.62rem] font-bold px-2 py-1 rounded bg-[#2563EB]/10 text-[#2563EB] uppercase tracking-wider">1/3 · ввод</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4">
          {/* Photo */}
          <div className="relative rounded-xl overflow-hidden border-2 border-dashed border-[#2563EB]/30" style={{ aspectRatio: '4/3' }}>
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)' }}>
              <div className="text-center">
                <svg className="w-10 h-10 mx-auto mb-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.25"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <div className="text-[0.7rem] text-slate-300 font-medium">Фото с объекта</div>
              </div>
            </div>
          </div>

          {/* Engineer's raw text */}
          <div className="flex flex-col">
            <div className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Описание инженера (как удобно)</div>
            <textarea
              value={engineerText}
              onChange={e => setEngineerText(e.target.value)}
              disabled={step !== 'upload'}
              className="flex-1 min-h-[80px] rounded-lg border border-slate-200 bg-slate-50 p-3 text-[0.8rem] text-slate-700 resize-none outline-none focus:border-[#2563EB]/40"
              placeholder='например: "ребята без касок на высоте"'
            />
            <div className="text-[0.62rem] text-slate-400 mt-1">AI сам переведёт на инженерный язык и дополнит фотоанализом.</div>
          </div>
        </div>

        {step === 'upload' && (
          <button onClick={() => setStep('analyzing')} className="w-full mt-4 py-3 rounded-xl text-white text-[0.85rem] font-semibold border-none cursor-pointer shadow-sm animate-guide-pulse" style={{ background: BRAND }}>
            🧠 Запустить AI-анализ
          </button>
        )}

        {step === 'analyzing' && (
          <div className="mt-4 py-6 flex flex-col items-center gap-2">
            <div className="text-[0.78rem] font-semibold text-slate-700">AI анализирует фото + описание…</div>
            <div className="w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-75" style={{ width: `${progress}%`, background: BRAND }} />
            </div>
            <div className="text-[0.68rem] font-mono text-slate-400">перевод → поиск дополнительных нарушений → классификация</div>
          </div>
        )}
      </div>

      {/* Block 2: AI translation + extra findings */}
      {step === 'done' && (
        <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[0.92rem] font-bold text-slate-800">AI перевёл на инженерный язык</h3>
              <span className="text-[0.62rem] font-bold px-2 py-1 rounded bg-[#2563EB]/10 text-[#2563EB] uppercase tracking-wider">2/3 · разбор</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-wider mb-1">Исходное (инженер)</div>
                <div className="text-[0.78rem] text-slate-600 italic leading-snug">«{engineerText}»</div>
              </div>
              <div className="bg-[#2563EB]/5 rounded-lg p-3 border border-[#2563EB]/20">
                <div className="text-[0.6rem] font-bold text-[#2563EB] uppercase tracking-wider mb-1">AI-перевод</div>
                <div className="text-[0.78rem] text-slate-800 leading-snug">{CASE_AI_TRANSLATED}</div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[0.82rem] font-bold text-slate-800">AI также обнаружил на фото</div>
                  <div className="text-[0.68rem] text-slate-500">Нарушения, которые инженер не назвал. Отметь галочками, что включить в предписание.</div>
                </div>
                <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-700 uppercase tracking-wider">vision</span>
              </div>
              <div className="space-y-2">
                {CASE_AI_EXTRA.map(e => {
                  const on = extraSelected.includes(e.id)
                  return (
                    <label key={e.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${on ? 'border-[#2563EB]/40 bg-[#2563EB]/5' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                      <input type="checkbox" checked={on} onChange={() => toggleExtra(e.id)} className="mt-0.5 shrink-0 accent-[#2563EB]" />
                      <div className="flex-1 text-[0.78rem] text-slate-700">{e.text}</div>
                      {e.preselected && <span className="text-[0.55rem] font-bold px-1.5 py-0.5 rounded bg-[#2563EB]/10 text-[#2563EB] uppercase">AI уверен</span>}
                    </label>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Block 3: Classification (auto) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[0.92rem] font-bold text-slate-800">Классификация по таксономии</h3>
              <span className="text-[0.62rem] text-slate-400">авто из AI-перевода + тегов фото</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <MiniPill label="Вид контроля" value={CASE_CLASSIFICATION.control} />
              <MiniPill label="Вид работ"    value={CASE_CLASSIFICATION.work} />
              <MiniPill label="Подвид"       value={CASE_CLASSIFICATION.subtype} />
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-wider mb-2">Теги (совпадают с DataBook)</div>
              <div className="flex flex-wrap gap-1.5">
                {CASE_TAGS.map(t => (
                  <span key={t.v} className={`px-2 py-0.5 rounded border text-[0.68rem] font-medium ${TAG_COLOR[t.c] || ''}`}>{t.v}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
            <div className="text-[0.78rem] text-slate-600">
              В предписание войдёт: <b className="text-slate-800">1 исходное</b> + <b className="text-slate-800">{extraSelected.length} доп.</b> нарушение
            </div>
            <button onClick={onNext} className="px-5 py-2.5 rounded-lg text-white text-[0.78rem] font-semibold border-none cursor-pointer" style={{ background: BRAND }}>
              🎯 Подобрать нормы →
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

function MiniPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2">
      <div className="text-[0.6rem] text-slate-400 uppercase font-bold tracking-wider">{label}</div>
      <div className="text-[0.78rem] font-semibold text-slate-800 mt-0.5">{value}</div>
    </div>
  )
}

/* ═════════════════════ PG: CITATIONS ═════════════════════ */
function PgCitations({ onNext }: { onNext: () => void }) {
  // По умолчанию выбрано то, что выбрала AI
  const [selected, setSelected] = useState<number[]>(() => CITATIONS.filter(c => c.aiPick).map(c => c.rank))
  const toggle = (rank: number) => setSelected(prev => prev.includes(rank) ? prev.filter(r => r !== rank) : [...prev, rank])

  const aiPickedCount = CITATIONS.filter(c => c.aiPick).length
  const engineerAdded = selected.filter(r => !CITATIONS.find(c => c.rank === r)?.aiPick).length

  return (
    <div className="p-6 max-w-[940px] mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#2563EB]/10 flex items-center justify-center text-lg shrink-0">🎯</div>
          <div className="flex-1">
            <h3 className="text-[0.9rem] font-bold text-slate-800 m-0 mb-1">Подборка пунктов из библиотеки нормативов</h3>
            <p className="text-[0.76rem] text-slate-500">AI уже отметил <b>{aiPickedCount} пункта</b>, которые считает основными. Инженер может добавить/убрать — окончательный выбор за ним.</p>
          </div>
          <span className="text-[0.62rem] font-bold px-2 py-1 rounded bg-[#2563EB]/10 text-[#2563EB] uppercase tracking-wider">2/3 · выбор</span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {CITATIONS.map(c => {
          const on = selected.includes(c.rank)
          return (
            <label key={c.rank} className={`flex items-start gap-3 bg-white rounded-xl border p-4 cursor-pointer transition-colors ${on ? 'border-[#2563EB]/40 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}>
              <input type="checkbox" checked={on} onChange={() => toggle(c.rank)} className="mt-0.5 shrink-0 accent-[#2563EB]" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-[0.8rem] font-bold text-slate-800">{c.doc}</span>
                  <span className="text-[0.72rem] text-slate-500">{c.clause}</span>
                  {c.aiPick && <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded bg-[#2563EB]/10 text-[#2563EB] uppercase tracking-wider">🤖 AI выбрал</span>}
                  {c.critical && <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded bg-red-100 text-red-600 uppercase tracking-wider">критичный</span>}
                </div>
                <div className="text-[0.82rem] text-slate-700 leading-relaxed">{c.text}</div>
              </div>
            </label>
          )
        })}
      </div>

      <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
        <div className="text-[0.76rem] text-slate-600">
          Итого <b className="text-slate-800">{selected.length}</b> пунктов
          <span className="text-[0.68rem] text-slate-400 ml-2">({aiPickedCount - (CITATIONS.filter(c => c.aiPick && selected.includes(c.rank)).length - selected.filter(r => CITATIONS.find(c => c.rank === r)?.aiPick).length + 0)} от AI{engineerAdded > 0 ? ` + ${engineerAdded} от инженера` : ''})</span>
        </div>
        <button onClick={onNext} className="px-5 py-2.5 rounded-lg text-white text-[0.78rem] font-semibold border-none cursor-pointer disabled:opacity-50" style={{ background: BRAND }} disabled={selected.length === 0}>
          📄 Выбрать шаблон документа →
        </button>
      </div>

    </div>
  )
}

/* ═════════════════════ PG: DOCUMENT ═════════════════════ */
function PgDocument() {
  const [template, setTemplate] = useState<string>('presc')
  const tpl = DOC_TEMPLATES.find(t => t.id === template) || DOC_TEMPLATES[0]

  return (
    <div className="p-6 max-w-[960px] mx-auto">
      {/* Template picker */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-[0.92rem] font-bold text-slate-800 m-0">Шаблон документа</h3>
            <p className="text-[0.72rem] text-slate-500 mt-0.5">Один и тот же набор данных — любой шаблон на выход. Все — в редактируемом DOCX.</p>
          </div>
          <span className="text-[0.62rem] font-bold px-2 py-1 rounded bg-[#2563EB]/10 text-[#2563EB] uppercase tracking-wider">3/3 · документ</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {DOC_TEMPLATES.map(t => (
            <button key={t.id} onClick={() => setTemplate(t.id)} className={`text-left p-3 rounded-xl border cursor-pointer transition-colors ${template === t.id ? 'border-[#2563EB]/40 bg-[#2563EB]/5' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
              <div className={`text-[0.72rem] font-semibold ${template === t.id ? 'text-[#2563EB]' : 'text-slate-800'}`}>{t.name}</div>
              <div className="text-[0.62rem] text-slate-500 mt-1 leading-snug">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* DOCX preview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
          <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded bg-[#2563EB]/10 text-[#2563EB]">DOCX · редактируемый</span>
          <span className="text-[0.8rem] font-semibold text-slate-700">{tpl.name}</span>
          <button className="ml-auto px-4 py-1.5 rounded-md text-white text-[0.72rem] font-semibold border-none cursor-pointer" style={{ background: BRAND }}>⬇ Скачать DOCX</button>
        </div>

        <div className="p-8 bg-white" style={{ fontFamily: 'Georgia, serif' }}>
          {template === 'presc' && <DocPresc />}
          {template === 'act' && <DocAct />}
          {template === 'brief' && <DocBrief />}
          {template === 'report' && <DocReport />}
        </div>
      </div>

      <div className="mt-4 text-[0.72rem] text-slate-500 text-center">После выпуска документ попадает в DataBook — пополняет корпус для калибровки системы.</div>
    </div>
  )
}

/* ── 4 варианта документа ── */
function DocPresc() {
  return (
    <>
      <div className="text-center mb-5 pb-4 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-800 m-0 mb-1">Предписание № SC-127</h1>
        <div className="text-[0.72rem] text-slate-500">Охрана труда · 19.02.2026</div>
      </div>
      <div className="mb-5">
        <div className="text-[0.7rem] font-bold text-slate-500 uppercase tracking-wider mb-2">Выявленные нарушения</div>
        <div className="text-[0.85rem] text-slate-800 leading-relaxed space-y-2">
          <div>• {CASE_AI_TRANSLATED}</div>
          {CASE_AI_EXTRA.filter(e => e.preselected).map(e => <div key={e.id}>• {e.text}</div>)}
        </div>
      </div>
      <div className="mb-5">
        <div className="text-[0.7rem] font-bold text-slate-500 uppercase tracking-wider mb-2">Нормативное обоснование</div>
        <div className="space-y-3">
          {CITATIONS.slice(0, 3).map(c => (
            <div key={c.rank} className="border-l-4 border-[#2563EB]/50 pl-3 py-1">
              <div className="text-[0.72rem] font-bold text-slate-700">{c.doc} — {c.clause}</div>
              <div className="text-[0.8rem] text-slate-600 italic leading-relaxed">«{c.text}»</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-5 grid grid-cols-[auto_1fr] gap-4 items-start">
        <PhotoStub />
        <div>
          <div className="text-[0.7rem] font-bold text-slate-500 uppercase tracking-wider mb-1">Фото-фиксация</div>
          <div className="text-[0.78rem] text-slate-600 leading-relaxed">Снимок с привязкой ко времени и месту (19.02.2026, 09:15).</div>
        </div>
      </div>
      <div className="pt-4 border-t border-slate-200 grid grid-cols-[1fr_auto] items-center gap-4">
        <div>
          <div className="text-[0.7rem] font-bold text-slate-500 uppercase tracking-wider mb-1">Срок устранения</div>
          <div className="text-[0.82rem] text-slate-800">до конца смены · 19.02.2026 18:00</div>
          <div className="text-[0.72rem] text-slate-500 mt-2">Инспектор: Хроменок Н.В. · инженер СК</div>
        </div>
        <QrStub />
      </div>
    </>
  )
}

function DocAct() {
  return (
    <>
      <div className="text-center mb-5 pb-4 border-b-2 border-slate-700">
        <div className="text-[0.62rem] uppercase tracking-widest text-slate-500">Общество с ограниченной ответственностью</div>
        <h1 className="text-lg font-bold text-slate-800 m-0 my-1">АКТ ВЫЯВЛЕННЫХ НАРУШЕНИЙ № SC-127</h1>
        <div className="text-[0.72rem] text-slate-500">г. Москва · 19 февраля 2026 года</div>
      </div>
      <div className="text-[0.82rem] text-slate-700 leading-relaxed mb-4">
        Настоящий акт составлен инспектором строительного контроля <b>Хроменок Н.В.</b> по факту выявленных нарушений правил охраны труда в ходе проведения планового обхода объекта.
      </div>
      <div className="mb-5">
        <div className="text-[0.7rem] font-bold text-slate-700 uppercase tracking-wider mb-2">УСТАНОВЛЕНО:</div>
        <ol className="list-decimal pl-5 text-[0.82rem] text-slate-800 leading-relaxed space-y-2">
          <li>{CASE_AI_TRANSLATED} <span className="text-slate-500 italic">(нарушение {CITATIONS[0].doc}, {CITATIONS[0].clause})</span></li>
          {CASE_AI_EXTRA.filter(e => e.preselected).map((e, i) => (
            <li key={e.id}>{e.text} <span className="text-slate-500 italic">(нарушение {CITATIONS[i + 1]?.doc}, {CITATIONS[i + 1]?.clause})</span></li>
          ))}
        </ol>
      </div>
      <div className="mb-5">
        <div className="text-[0.7rem] font-bold text-slate-700 uppercase tracking-wider mb-2">НОРМАТИВНАЯ БАЗА (ПОЛНЫЕ ЦИТАТЫ):</div>
        <div className="space-y-2 text-[0.78rem] text-slate-700 leading-relaxed">
          {CITATIONS.slice(0, 3).map(c => (
            <div key={c.rank}><b>{c.doc}, {c.clause}:</b> «{c.text}»</div>
          ))}
        </div>
      </div>
      <div className="pt-4 border-t border-slate-200 text-[0.78rem] text-slate-700">
        Настоящий акт подлежит вручению ответственному лицу с немедленным исполнением предписанных мер до конца рабочей смены 19.02.2026.
      </div>
      <div className="mt-6 grid grid-cols-2 gap-8 text-[0.78rem] text-slate-700">
        <div><div className="border-b border-slate-400 mb-1 h-6" /><div className="text-[0.68rem] text-slate-500">Инспектор / подпись</div></div>
        <div><div className="border-b border-slate-400 mb-1 h-6" /><div className="text-[0.68rem] text-slate-500">Ответственный / подпись</div></div>
      </div>
    </>
  )
}

function DocBrief() {
  const allViolations = [CASE_AI_TRANSLATED, ...CASE_AI_EXTRA.filter(e => e.preselected).map(e => e.text)]
  return (
    <>
      <div className="text-center mb-4">
        <div className="text-[0.65rem] uppercase tracking-wider text-slate-500 mb-0.5">Служебная записка · для руководителя</div>
        <h1 className="text-base font-bold text-slate-800 m-0">SC-127 · 19.02.2026 · ОТ</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="text-[0.62rem] font-bold text-red-700 uppercase tracking-wider">Критических</div>
          <div className="text-3xl font-bold text-red-700">{CITATIONS.filter(c => c.critical).length}</div>
          <div className="text-[0.68rem] text-slate-600">из {allViolations.length} нарушений</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="text-[0.62rem] font-bold text-amber-700 uppercase tracking-wider">Срок</div>
          <div className="text-base font-bold text-amber-800 leading-snug mt-1">до конца смены<br/>19.02.2026 18:00</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-[0.7rem] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Суть</div>
        <div className="text-[0.82rem] text-slate-800 leading-relaxed">
          На участке монолитных работ (отм. +4 м) зафиксировано <b>{allViolations.length} нарушений охраны труда</b>. Основные — отсутствие СИЗ у работников и временных ограждений открытых краёв. Требуется остановка работ до устранения.
        </div>
      </div>

      <div className="mb-4">
        <div className="text-[0.7rem] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Ключевые НТД</div>
        <div className="text-[0.78rem] text-slate-600 leading-relaxed">
          {CITATIONS.slice(0, 3).map(c => `${c.doc} ${c.clause}`).join(' · ')}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-200 text-[0.72rem] text-slate-500 flex items-center justify-between">
        <span>Инспектор: Хроменок Н.В.</span>
        <span>Подробности — приложение (предписание №SC-127)</span>
      </div>
    </>
  )
}

function DocReport() {
  return (
    <>
      <div className="mb-5 pb-3 border-b border-slate-200">
        <div className="text-[0.62rem] uppercase tracking-wider text-slate-500">Детальный отчёт об инциденте ОТ</div>
        <h1 className="text-lg font-bold text-slate-800 m-0 mt-1">SC-127 · Работы на высоте без СИЗ</h1>
        <div className="text-[0.72rem] text-slate-500 mt-1">19.02.2026 · подготовлен инспектором Хроменок Н.В.</div>
      </div>

      <div className="mb-5 grid grid-cols-[auto_1fr] gap-4 items-start">
        <PhotoStub big />
        <div>
          <div className="text-[0.68rem] font-bold text-slate-700 uppercase tracking-wider mb-1">Место и обстоятельства</div>
          <div className="text-[0.8rem] text-slate-700 leading-relaxed">
            Участок монолитных работ, отм. +4 м (перекрытие). Смена первая. Работы по укладке арматурного каркаса. На момент обхода на площадке 3 работника подрядной организации.
          </div>
        </div>
      </div>

      <div className="mb-5">
        <div className="text-[0.7rem] font-bold text-slate-700 uppercase tracking-wider mb-2">Детальное описание нарушений</div>
        <div className="space-y-3 text-[0.8rem] text-slate-700 leading-relaxed">
          <div><b>1. {CASE_AI_TRANSLATED}</b><div className="text-slate-600 mt-0.5">Риск: падение с высоты. Категория: критический.</div></div>
          {CASE_AI_EXTRA.filter(e => e.preselected).map((e, i) => (
            <div key={e.id}><b>{i + 2}. {e.text}</b><div className="text-slate-600 mt-0.5">Риск: {i === 0 ? 'падение работника с высоты' : 'падение предметов, травма'}. Категория: {i === 0 ? 'критический' : 'существенный'}.</div></div>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <div className="text-[0.7rem] font-bold text-slate-700 uppercase tracking-wider mb-2">Нормативное обоснование</div>
        <table className="w-full text-[0.76rem] text-slate-700 border-collapse">
          <thead><tr className="bg-slate-50"><th className="text-left px-2 py-1.5 border border-slate-200 font-semibold">НТД</th><th className="text-left px-2 py-1.5 border border-slate-200 font-semibold">Пункт</th><th className="text-left px-2 py-1.5 border border-slate-200 font-semibold">Требование</th></tr></thead>
          <tbody>
            {CITATIONS.slice(0, 3).map(c => (
              <tr key={c.rank}>
                <td className="px-2 py-1.5 border border-slate-200 font-mono">{c.doc}</td>
                <td className="px-2 py-1.5 border border-slate-200 font-mono">{c.clause}</td>
                <td className="px-2 py-1.5 border border-slate-200 italic">{c.text}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-5">
        <div className="text-[0.7rem] font-bold text-slate-700 uppercase tracking-wider mb-2">Рекомендации</div>
        <ol className="list-decimal pl-5 text-[0.8rem] text-slate-700 leading-relaxed space-y-1">
          <li>Немедленная остановка работ на высоте до устранения.</li>
          <li>Выдача работникам страховочных привязей и касок.</li>
          <li>Установка временных ограждений открытых краёв перекрытий высотой не менее 1.1 м.</li>
          <li>Внеплановый инструктаж бригады по охране труда при работе на высоте.</li>
          <li>Повторная проверка в следующую смену.</li>
        </ol>
      </div>

      <div className="pt-3 border-t border-slate-200 text-[0.74rem] text-slate-600">
        <b>Аналитический вывод:</b> системная проблема — отсутствие предсменного контроля СИЗ. Рекомендую ввести обязательный чек-лист перед допуском к работе на высоте.
      </div>
    </>
  )
}

function PhotoStub({ big }: { big?: boolean }) {
  const size = big ? 'w-36 h-28' : 'w-32 h-32'
  return (
    <div className={`${size} rounded border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0`}>
      <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.25"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
    </div>
  )
}

function QrStub() {
  return (
    <div className="w-20 h-20 rounded bg-slate-900 flex items-center justify-center shrink-0">
      <svg className="w-14 h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="3" width="5" height="5"/><rect x="16" y="3" width="5" height="5"/><rect x="3" y="16" width="5" height="5"/>
        <rect x="10" y="10" width="4" height="4"/>
      </svg>
    </div>
  )
}

/* ═════════════════════ PG: ADMIN ═════════════════════ */
function PgAdmin() {
  const [tab, setTab] = useState<AdminTab>('overview')

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-4 overflow-hidden">
        <div className="flex items-center gap-1 px-2 py-2 overflow-x-auto">
          {[
            { k: 'overview',   l: 'Обзор' },
            { k: 'unresolved', l: '🟠 Нерешённые кейсы' },
            { k: 'errors',     l: 'Ошибки' },
            { k: 'users',      l: 'Пользователи' },
          ].map(t => (
            <button key={t.k} onClick={() => setTab(t.k as AdminTab)} className={`shrink-0 px-3 py-1.5 rounded-md text-[0.74rem] font-medium border cursor-pointer transition-colors ${tab === t.k ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'bg-white text-slate-600 border-transparent hover:bg-slate-50'}`}>
              {t.l}
            </button>
          ))}
        </div>
      </div>

      {tab === 'overview' && <AdminOverview />}
      {tab === 'unresolved' && <AdminUnresolved />}
      {tab === 'errors' && <AdminErrors />}
      {tab === 'users' && <AdminUsers />}
    </div>
  )
}

function AdminOverview() {
  return (
    <>
      <div className="grid grid-cols-4 gap-3 mb-4">
        {ADMIN_USAGE.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-start justify-between mb-1">
              <div className="text-[0.62rem] text-slate-400 uppercase font-bold tracking-wider">{s.label}</div>
              <Sparkline values={s.spark} />
            </div>
            <div className="text-2xl font-bold text-slate-800 leading-none mt-1">{s.value}</div>
            <div className="text-[0.68rem] text-slate-400 mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-4">
        <h3 className="text-[0.9rem] font-bold text-slate-800 m-0 mb-1">Топ запросов инженеров</h3>
        <p className="text-[0.7rem] text-slate-500 mb-3">По пилоту «охрана труда» · за неделю</p>
        <div className="space-y-1">
          {POPULAR_QUERIES.map((item, i) => (
            <div key={item.q} className={`flex items-center justify-between py-2 ${i > 0 ? 'border-t border-slate-100' : ''}`}>
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-[0.7rem] text-slate-300 w-4 text-right shrink-0">{i + 1}</span>
                <span className="text-[0.8rem] text-slate-700 truncate">{item.q}</span>
              </div>
              <span className="text-[0.72rem] text-slate-500 shrink-0 ml-3">{item.n}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

function AdminUnresolved() {
  return (
    <div className="bg-white rounded-2xl border border-amber-200/70 shadow-sm p-5">
      <div className="mb-4">
        <h3 className="text-[0.94rem] font-bold text-slate-800 m-0 mb-1 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Нерешённые кейсы — пробелы в базе
        </h3>
        <p className="text-[0.74rem] text-slate-500 leading-relaxed">
          Запросы инженеров, которые не завершились скачиванием цитаты или созданием предписания. Это сырьё для <b>расширения базы нормативов</b> и <b>уточнения таксономии</b>. Решения по каждому кейсу принимает оператор системы.
        </p>
      </div>

      <div className="space-y-2">
        {UNRESOLVED_CASES.map(c => (
          <div key={c.q} className="border border-slate-200 rounded-xl p-3 hover:bg-slate-50/60">
            <div className="text-[0.82rem] text-slate-800 font-medium leading-snug">«{c.q}»</div>
            <div className="text-[0.7rem] text-slate-500 mt-1.5 flex items-center gap-2 flex-wrap">
              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">{c.reason}</span>
              <span>·</span>
              <span>{c.n} обращений за неделю</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AdminErrors() {
  const errors = [
    { ts: '2026-04-22 09:14', endpoint: '/api/databook/search', code: 500, msg: 'Timeout embedding service (>5s)', n: 3 },
    { ts: '2026-04-21 17:02', endpoint: '/api/scanner/classify', code: 429, msg: 'Rate limit Gemini API', n: 1 },
    { ts: '2026-04-20 11:48', endpoint: '/api/databook/search', code: 400, msg: 'Invalid tag category in filter', n: 2 },
  ]
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
        <h3 className="text-[0.88rem] font-bold text-slate-800 m-0">Журнал ошибок · последние 7 дней</h3>
      </div>
      <table className="w-full">
        <thead><tr className="text-[0.6rem] text-slate-400 uppercase tracking-wider bg-slate-50/50">
          <th className="text-left px-4 py-2 font-semibold">Время</th>
          <th className="text-left px-4 py-2 font-semibold">Эндпоинт</th>
          <th className="text-center px-4 py-2 font-semibold">Код</th>
          <th className="text-left px-4 py-2 font-semibold">Сообщение</th>
          <th className="text-center px-4 py-2 font-semibold">Повт.</th>
        </tr></thead>
        <tbody>
          {errors.map((e, i) => (
            <tr key={i} className="border-t border-slate-100 text-[0.74rem] hover:bg-slate-50/50">
              <td className="px-4 py-2.5 font-mono text-slate-500">{e.ts}</td>
              <td className="px-4 py-2.5 font-mono text-slate-700">{e.endpoint}</td>
              <td className="px-4 py-2.5 text-center"><span className={`px-2 py-0.5 rounded text-[0.62rem] font-bold ${e.code >= 500 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{e.code}</span></td>
              <td className="px-4 py-2.5 text-slate-600">{e.msg}</td>
              <td className="px-4 py-2.5 text-center text-slate-500">{e.n}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AdminUsers() {
  const users = [
    { name: 'Хроменок Н.В.',   role: 'admin',    active: true,  searches: 28, copies: 14 },
    { name: 'Иванов А.С.',     role: 'инженер',  active: true,  searches: 42, copies: 23 },
    { name: 'Петрова М.В.',    role: 'инженер',  active: true,  searches: 19, copies: 7  },
    { name: 'Сидоров К.Л.',    role: 'инженер',  active: false, searches: 3,  copies: 1  },
    { name: 'Козлова Е.А.',    role: 'инженер',  active: true,  searches: 26, copies: 11 },
    { name: 'Васин В.И.',      role: 'viewer',   active: true,  searches: 8,  copies: 0  },
  ]
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-[0.88rem] font-bold text-slate-800 m-0">Пользователи пилота · {users.filter(u => u.active).length} активных</h3>
        <button className="px-3 py-1.5 rounded-md text-white text-[0.7rem] font-semibold border-none cursor-pointer" style={{ background: BRAND }}>+ Пригласить</button>
      </div>
      <table className="w-full">
        <thead><tr className="text-[0.6rem] text-slate-400 uppercase tracking-wider bg-slate-50/50">
          <th className="text-left px-4 py-2 font-semibold">Пользователь</th>
          <th className="text-left px-4 py-2 font-semibold">Роль</th>
          <th className="text-center px-4 py-2 font-semibold">Поисков (неделя)</th>
          <th className="text-center px-4 py-2 font-semibold">Копирований</th>
          <th className="text-center px-4 py-2 font-semibold">Статус</th>
        </tr></thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={i} className="border-t border-slate-100 text-[0.75rem] hover:bg-slate-50/50">
              <td className="px-4 py-2.5 font-medium text-slate-700">{u.name}</td>
              <td className="px-4 py-2.5"><span className={`px-2 py-0.5 rounded text-[0.62rem] font-bold ${u.role === 'admin' ? 'bg-red-100 text-red-600' : u.role === 'viewer' ? 'bg-slate-100 text-slate-500' : 'bg-[#2563EB]/10 text-[#2563EB]'}`}>{u.role}</span></td>
              <td className="px-4 py-2.5 text-center font-mono text-slate-600">{u.searches}</td>
              <td className="px-4 py-2.5 text-center font-mono text-slate-600">{u.copies}</td>
              <td className="px-4 py-2.5 text-center"><span className={`inline-block w-2 h-2 rounded-full ${u.active ? 'bg-green-500' : 'bg-slate-300'}`} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PgTaxonomy() {
  const [expanded, setExpanded] = useState<string[]>(['root', 'construction', 'con-wt'])
  const toggle = (id: string) => setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const isOpen = (id: string) => expanded.includes(id)

  return (
  <div className="p-6 max-w-[1100px] mx-auto space-y-4">
    {/* Intro */}
    <div className="bg-gradient-to-br from-[#2563EB]/5 to-[#4F46E5]/5 border border-[#2563EB]/15 rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#2563EB]/10 flex items-center justify-center text-lg shrink-0">🌳</div>
        <div>
          <h3 className="text-[0.9rem] font-bold text-slate-800 m-0 mb-1">Структура данных</h3>
          <p className="text-[0.76rem] text-slate-600 leading-relaxed">
            Все 8 577 предписаний и 14 933 пункта нормативов размечены <b>по одной и той же структуре</b>. Это симметрия — она даёт точный поиск нормативки по описанию нарушения. Ниже — дерево: как устроены разделы, какие поля используются в каждом.
          </p>
        </div>
      </div>
    </div>

    {/* Tree */}
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-[0.92rem] font-bold text-slate-800 m-0">Структура данных — дерево таксономии</h3>
          <p className="text-[0.72rem] text-slate-500 mt-0.5">Как устроены 8 577 предписаний · кликай чтобы раскрыть ветку</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setExpanded(['root', 'construction', 'con-wt', 'con-wt-5', 'con-wt-10', 'con-vs', 'ot', 'organization', 'documents', 'tags'])} className="text-[0.65rem] font-semibold text-[#2563EB] hover:underline cursor-pointer bg-transparent border-none">развернуть всё</button>
          <span className="text-slate-300">|</span>
          <button onClick={() => setExpanded(['root'])} className="text-[0.65rem] text-slate-500 hover:underline cursor-pointer bg-transparent border-none">свернуть</button>
        </div>
      </div>

      <div className="text-[0.8rem] text-slate-700 space-y-0.5">
        <TreeNode id="root" label="Все 8 577 предписаний" open={isOpen('root')} onToggle={() => toggle('root')} icon="📚" bold sub="классифицированы по 5 осям">

          <TreeNode id="construction" label="Строительный контроль" open={isOpen('construction')} onToggle={() => toggle('construction')} icon="🏗" sub="обычная инженерная работа на объекте">
            <TreeLeaf>Пять видов контроля: <b>входной · операционный · приёмочный · геодезический · лабораторный</b></TreeLeaf>
            <TreeNode id="con-wt" label="18 видов работ" open={isOpen('con-wt')} onToggle={() => toggle('con-wt')} icon="📐" sub="каждый вид — свой набор подвидов">
              <TreeLeaf>Геодезия · Подготовительные · Котлован · Фундаменты · Монолитные ЖБ · Сборные ЖБ · Металлоконструкции · Кладка · Лифты · Кровли · Двери · СПК · Фасады · Отделка · ЭОМ · ОВ-ВК · Наружные сети · Благоустройство</TreeLeaf>
              <TreeNode id="con-wt-5" label="Пример: Монолитные ЖБ" open={isOpen('con-wt-5')} onToggle={() => toggle('con-wt-5')} icon="🧱">
                <TreeLeaf><b className="text-teal-700">Свои подвиды работ:</b> {WORK_SUBTYPES['5'].join(' · ')}</TreeLeaf>
                <TreeLeaf><b className="text-slate-600">+ 9 общих паттернов нарушений (встречаются у любых работ):</b> Без РД/ОТД · Сохранность результата · Без освидетельствования · Отклонение геометрии/осей · Нарушение температурно-влажностного режима · Нарушение технологической последовательности · Заделка проходов коммуникаций · Отсутствие ИД · Нарушения входного контроля (именно патерн нарушения, не вид контроля)</TreeLeaf>
              </TreeNode>
              <TreeNode id="con-wt-10" label="Пример: Отделка" open={isOpen('con-wt-10')} onToggle={() => toggle('con-wt-10')} icon="🎨">
                <TreeLeaf><b className="text-teal-700">Свои подвиды работ:</b> Штукатурка · Шпатлёвка · Окраска · Керамогранит · Плинтус · ещё 16 (гидроизоляция, стяжка, подвесные потолки и т.д.)</TreeLeaf>
                <TreeLeaf><b className="text-slate-600">+ те же 9 общих паттернов нарушений</b></TreeLeaf>
              </TreeNode>
              <TreeLeaf className="italic text-slate-400">...и так для каждого из 18 видов работ — свой набор подвидов (от 3 до 21)</TreeLeaf>
            </TreeNode>
            <TreeNode id="con-vs" label="Тип нарушения (отдельная ось)" open={isOpen('con-vs')} onToggle={() => toggle('con-vs')} icon="⚠️" sub="что именно не так — независимо от вида работ">
              <TreeLeaf>Несоосность · Отклонение · Трещина · Коррозия · Протечка · Скол · Пустоты · Загрязнение · Промерзание · Деформация · ещё ~30</TreeLeaf>
            </TreeNode>
          </TreeNode>

          <TreeNode id="ot" label="Охрана труда" open={isOpen('ot')} onToggle={() => toggle('ot')} icon="🦺" sub="отдельный раздел для ОТ-нарушений" accent="red">
            <TreeLeaf><b>6 направлений:</b> {OT_SUBTYPES.map(s => `${s.icon} ${s.name}`).join(' · ')}</TreeLeaf>
            <TreeLeaf className="text-slate-500">Тип нарушения (та же ось, что и в стр. контроле) тоже применим</TreeLeaf>
          </TreeNode>

          <TreeNode id="organization" label="Организация стройплощадки" open={isOpen('organization')} onToggle={() => toggle('organization')} icon="📋" sub="общие вопросы объекта — не по конкретной работе" accent="blue">
            <TreeLeaf><b>{ORG_TYPES.length} организационных вопросов:</b> {ORG_TYPES.join(' · ')}</TreeLeaf>
          </TreeNode>

          <TreeNode id="documents" label="Документация и журналы" open={isOpen('documents')} onToggle={() => toggle('documents')} icon="📓" sub="нарушения по ведению документации" accent="amber">
            <TreeLeaf><b>{DOC_TYPES.length} типов документов:</b> {DOC_TYPES.join(' · ')}</TreeLeaf>
            <TreeLeaf className="text-slate-500">Тип нарушения тоже применим</TreeLeaf>
          </TreeNode>

          <TreeNode id="tags" label="Сквозные теги" open={isOpen('tags')} onToggle={() => toggle('tags')} icon="🏷" sub="размечают предписания во всех разделах одновременно" accent="green">
            <TreeLeaf><b>8 категорий:</b> материалы (бетон, кирпич, кабель...) · дефекты (трещина, протечка, скол...) · конструктивы (кровля, фасад...) · документы · опасности · оборудование · СИЗ · ограждения</TreeLeaf>
            <TreeLeaf className="text-slate-500">Это то, что делает возможным смешанный поиск по нормативам: теги предписания ↔ теги пунктов НТД</TreeLeaf>
          </TreeNode>

        </TreeNode>
      </div>
    </div>
  </div>
  )
}

/* ── Tree node components ── */
function TreeNode({ label, open, onToggle, icon, sub, children, bold, accent }: { id: string; label: string; open: boolean; onToggle: () => void; icon: string; sub?: string; children?: React.ReactNode; bold?: boolean; accent?: 'red' | 'blue' | 'amber' | 'green' }) {
  const accentBg = accent === 'red' ? 'bg-red-50/60 border-l-red-400' : accent === 'blue' ? 'bg-blue-50/40 border-l-blue-400' : accent === 'amber' ? 'bg-amber-50/40 border-l-amber-400' : accent === 'green' ? 'bg-emerald-50/40 border-l-emerald-400' : 'hover:bg-slate-50'
  return (
    <div>
      <button onClick={onToggle} className={`w-full flex items-start gap-1 py-1 px-2 rounded border-none bg-transparent cursor-pointer text-left border-l-2 border-l-transparent ${accentBg}`}>
        <span className="text-slate-400 shrink-0 w-3">{open ? '▼' : '▶'}</span>
        <span className="shrink-0">{icon}</span>
        <span className={`flex-1 ${bold ? 'font-bold text-slate-900' : 'text-slate-800'}`}>{label}</span>
        {sub && <span className="text-[0.64rem] text-slate-400 italic shrink-0">{sub}</span>}
      </button>
      {open && children && (
        <div className="ml-5 pl-3 border-l border-slate-200 mt-0.5">
          {children}
        </div>
      )}
    </div>
  )
}

function TreeLeaf({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex items-start gap-1.5 py-0.5 px-2 text-[0.76rem] text-slate-600 leading-relaxed ${className || ''}`}><span className="text-slate-300 shrink-0">└─</span><span className="flex-1">{children}</span></div>
}

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1
  const width = 60, height = 18
  const points = values.map((v, i) => `${(i / (values.length - 1)) * width},${height - ((v - min) / range) * height}`).join(' ')
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline points={points} fill="none" stroke={BRAND} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ═════════════════════ PG: ARCHITECTURE ═════════════════════ */
function PgArchitecture() {
  return (
    <div className="p-6 max-w-[1100px] mx-auto space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-700 text-white rounded-2xl p-6 shadow-sm">
        <div className="text-[0.62rem] uppercase tracking-widest opacity-70 mb-2">Под капотом</div>
        <h3 className="text-xl font-bold m-0 mb-2">Это не обёртка над ChatGPT</h3>
        <p className="text-[0.85rem] opacity-90 leading-relaxed max-w-[740px]">
          В системе <b>три переплетённые сущности</b>: архив реальных предписаний, библиотека нормативов (размеченная по той же таксономии) и сканер-конструктор. Запрос инженера проходит через <b>таксономический фильтр</b> → <b>смешанный поиск</b> по нормативам → <b>переранжирование</b>, и только потом AI <b>выбирает из проверенного пула пунктов</b>. На выходе — документ с цитатами из первоисточников.
        </p>
      </div>

      {/* 3 сущности */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-[0.88rem] font-bold text-slate-800 mb-1">Три сущности с общей таксономией</h3>
        <p className="text-[0.72rem] text-slate-500 mb-4">Симметричная разметка тегов — ключ к качественному поиску</p>

        <div className="grid grid-cols-3 gap-3">
          {[
            { n: 1, title: 'DataBook', sub: `${ARCHIVE_STATS.total.toLocaleString('ru-RU')} реальных предписаний`, icon: '📚',
              body: 'Что инженер писал в реальности. Каждое предписание классифицировано по 4 осям и размечено тегами.' },
            { n: 2, title: 'Библиотека нормативов', sub: `${ARCHIVE_STATS.clauses.toLocaleString('ru-RU')} пунктов СП/ГОСТ`, icon: '📋',
              body: 'Каждый пункт размечен по ТОЙ ЖЕ таксономии, что и предписания. Теги предписания → теги нормативов — симметрия.' },
            { n: 3, title: 'Сканер', sub: 'фото → DOCX', icon: '📷',
              body: 'Workflow: фото → AI-описание → таксономическая классификация → фильтр + поиск → выбор цитат → документ.' },
          ].map(s => (
            <div key={s.n} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-xl">{s.icon}</div>
                <div>
                  <div className="text-[0.75rem] font-bold text-slate-800">{s.title}</div>
                  <div className="text-[0.62rem] text-slate-500">{s.sub}</div>
                </div>
              </div>
              <div className="text-[0.72rem] text-slate-600 leading-snug">{s.body}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 text-[0.74rem] text-slate-600">
          <b>Замкнутый контур:</b> новые предписания из Сканера пополняют DataBook → таксономия уточняется → поиск улучшается.
        </div>
      </div>

      {/* TAXONOMY SCHEMA — 5-layer реальная структура */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-[0.88rem] font-bold text-slate-800 mb-1">Схема таксономии · 6 слоёв от общего к частному</h3>
        <p className="text-[0.72rem] text-slate-500 mb-4">
          Охрана труда, Организация и Документы — отдельные «плоскости» со своими work_types, а не значения control_type.
        </p>

        <div className="space-y-2">
          {/* Layer 1: MAIN TABS */}
          <TaxoLayer num="1" name="Главный раздел (TaxonomyTab)" sub="5 веток" color="slate">
            <div className="flex flex-wrap gap-1.5">
              {MAIN_TABS.map(t => (
                <span key={t.key} className={`text-[0.66rem] px-2 py-0.5 rounded border font-semibold ${t.key === 'ot' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/30'}`}>
                  {t.icon} {t.label}
                </span>
              ))}
            </div>
          </TaxoLayer>

          {/* Layer 2: Control type */}
          <TaxoLayer num="2" name="Вид контроля" sub="только для «Строительный контроль»" color="blue">
            <div className="flex flex-wrap gap-1.5 items-center">
              {CONSTRUCTION_CONTROL_TYPES.slice(1).map(c => (
                <span key={c.code} className="text-[0.62rem] px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">{c.label}</span>
              ))}
              <span className="text-[0.6rem] text-slate-400 italic ml-1">для других вкладок — фиксируется (охрана_труда / организационный / документационный)</span>
            </div>
          </TaxoLayer>

          {/* Layer 3: Work type — 21 штука в одном списке (с мета-типами) */}
          <TaxoLayer num="3" name="Вид работ (work_type)" sub="18 обычных + 3 «мета» (организация, охрана труда, документация)" color="teal">
            <div className="space-y-1.5">
              <div className="flex flex-wrap gap-1 items-center">
                <span className="text-[0.58rem] font-bold text-slate-400 uppercase tracking-wider mr-1">ОБЫЧНЫЕ (18):</span>
                {WORK_TYPES.slice(0, 8).map(w => (
                  <span key={w.code} className="text-[0.6rem] px-1.5 py-0.5 rounded bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20">{w.icon} {w.name}</span>
                ))}
                <span className="text-[0.6rem] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">+ ещё {WORK_TYPES.length - 3 - 8}</span>
              </div>
              <div className="flex flex-wrap gap-1 items-center">
                <span className="text-[0.58rem] font-bold text-slate-500 uppercase tracking-wider mr-1">МЕТА:</span>
                <span className="text-[0.6rem] px-1.5 py-0.5 rounded bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20">📋 19_организация</span>
                <span className="text-[0.6rem] px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">🦺 20_охрана_труда</span>
                <span className="text-[0.6rem] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">📓 21_документация</span>
              </div>
            </div>
          </TaxoLayer>

          {/* Layer 4: Subtypes */}
          <TaxoLayer num="4" name="Подвид" sub={`${UNIVERSAL_SUBTYPES.length} универсальных + specific per work_type`} color="emerald">
            <div className="flex flex-wrap gap-1">
              {UNIVERSAL_SUBTYPES.slice(0, 5).map(u => (
                <span key={u} className="text-[0.6rem] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">{u}</span>
              ))}
              <span className="text-[0.6rem] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">+ ещё {UNIVERSAL_SUBTYPES.length - 5}</span>
            </div>
          </TaxoLayer>

          {/* Layer 5: violation_subtype */}
          <TaxoLayer num="5" name="Тип нарушения (violation_subtype)" sub="ортогонально всему — что именно не так" color="slate">
            <div className="flex flex-wrap gap-1">
              {['Несоосность', 'Отклонение', 'Трещина', 'Коррозия', 'Протечка', 'Скол', 'Пустоты', 'Загрязнение', 'Промерзание', 'Деформация'].map(v => (
                <span key={v} className="text-[0.6rem] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">{v}</span>
              ))}
              <span className="text-[0.6rem] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">+ ещё ~30</span>
            </div>
            <div className="text-[0.64rem] text-slate-500 mt-1.5 italic">Есть на Construction, ОТ, Documents · нет на Organization</div>
          </TaxoLayer>

          {/* Layer 6: Tags */}
          <TaxoLayer num="6" name="Теги (сквозные, JSONB)" sub={`${ARCHIVE_STATS.tagCats} категорий · ${ADMIN_TAXO_STATS.materialTags + ADMIN_TAXO_STATS.defectTags + ADMIN_TAXO_STATS.toolTags}+ значений`} color="amber">
            <div className="flex flex-wrap gap-1">
              {['materials', 'defects', 'constructs', 'documents', 'hazards', 'equip', 'ppe', 'barriers'].map(c => (
                <span key={c} className={`text-[0.6rem] px-1.5 py-0.5 rounded border ${TAG_COLOR[c]}`}>{c}</span>
              ))}
            </div>
          </TaxoLayer>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-[0.74rem] text-slate-600 leading-relaxed">
          <b>Ключевое:</b> у Организации вместо «вида работ» — список организационных вопросов (11), у Документов — типы документов (5). Тип нарушения (слой 5) — ортогональная ось, отдельная от subtype. Все 3 сущности (DataBook · библиотека нормативов · сканер) используют <b>одну иерархию</b> — это даёт симметрию для поиска.
        </div>
      </div>

      {/* Ключевые инженерные решения */}
      <div className="grid grid-cols-2 gap-3">
        <ArchCard title="Проверка качества на реальных связках" body="Теги из реальных предписаний сопоставлены с тегами нормативов — это даёт эталонные связки «нарушение ↔ пункт НТД». На этих парах собран набор из 88 эталонных случаев — на нём сравниваем конфигурации ранкера." tag="данные, не эвристика" />
        <ArchCard title="Поиск по нормам в простом переводе" body="AI не «знает» нормативы — их нужно подать в момент запроса. Алгоритм: ищем пункты параллельно по смыслу и по ключевым словам → сливаем списки по позициям → AI выбирает из проверенного пула, а не сочиняет." tag="смешанный поиск" />
      </div>
    </div>
  )
}

function TaxoLayer({ num, name, sub, color, children }: { num: string; name: string; sub?: string; color: 'slate' | 'blue' | 'teal' | 'emerald' | 'amber'; children: React.ReactNode }) {
  const borders = {
    slate:   'border-l-4 border-l-slate-500',
    blue:    'border-l-4 border-l-[#2563EB]',
    teal:    'border-l-4 border-l-teal-500',
    emerald: 'border-l-4 border-l-emerald-500',
    amber:   'border-l-4 border-l-amber-500',
  }[color]
  return (
    <div className={`border border-slate-200 rounded-xl p-3 ${borders}`}>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-[0.6rem] font-mono text-slate-400 font-bold uppercase tracking-wider">Слой {num}</span>
        <span className="text-[0.82rem] font-bold text-slate-800">{name}</span>
        {sub && <span className="text-[0.66rem] text-slate-400">· {sub}</span>}
      </div>
      {children}
    </div>
  )
}

function ArchCard({ title, body, tag }: { title: string; body: string; tag: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[0.84rem] font-bold text-slate-800 m-0">{title}</h4>
        <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded bg-[#2563EB]/10 text-[#2563EB] uppercase tracking-wider">{tag}</span>
      </div>
      <div className="text-[0.78rem] text-slate-600 leading-relaxed">{body}</div>
    </div>
  )
}

/* ═════════════════════ PG: QUALITY ═════════════════════ */
function PgQuality() {
  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <div className="bg-gradient-to-br from-[#2563EB] to-[#4F46E5] text-white rounded-2xl p-6 shadow-sm mb-4 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
        <div className="relative">
          <div className="text-[0.68rem] uppercase tracking-widest opacity-80 mb-2">Ключевая метрика · прод-прогон от 17.04.2026</div>
          <div className="flex items-baseline gap-3 mb-2">
            <div className="text-5xl font-extrabold">{EVAL.recall30}%</div>
            <div className="text-sm opacity-80">правильный пункт в топ-30 результатов</div>
          </div>
          <div className="text-[0.78rem] opacity-90">Из {EVAL.goldenCases} реальных кейсов — {Math.round(EVAL.goldenCases * EVAL.recall30 / 100)} нашли корректный пункт НТД.</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        <StatMini label="Эталонные кейсы"     value={EVAL.goldenCases.toString()} sub="размечены вручную из DataBook" />
        <StatMini label="Первый ответ точный" value={`${EVAL.exactFirst}%`}       sub="в точку с 1-го результата" />
        <StatMini label="В топ-5"             value={`${EVAL.top5}%`}             sub="инженер пролистает 5" />
        <StatMini label="LLM = target"        value={`${EVAL.llmExact}%`}         sub="модель выбрала именно тот пункт" />
      </div>

      {/* Semantic quality (Claude judge) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-[0.88rem] font-bold text-slate-800 m-0">Семантическая проверка цитат</h3>
            <p className="text-[0.72rem] text-slate-500 mt-0.5">Независимый судья (Claude) оценивает {EVAL.linksTotal} ссылок, которые дала модель</p>
          </div>
          <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded bg-green-100 text-green-700 uppercase tracking-wider">0% галлюцинаций</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-700">{EVAL.inTopic}%</div>
            <div className="text-[0.7rem] text-slate-600 mt-1">в точку</div>
            <div className="text-[0.62rem] text-slate-400">155 из {EVAL.linksTotal}</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-amber-700">{(100 - EVAL.inTopic - EVAL.hallucinations).toFixed(1)}%</div>
            <div className="text-[0.7rem] text-slate-600 mt-1">частично / косвенно</div>
            <div className="text-[0.62rem] text-slate-400">37 из {EVAL.linksTotal}</div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-slate-700">{EVAL.hallucinations}%</div>
            <div className="text-[0.7rem] text-slate-600 mt-1">выдуманных пунктов</div>
            <div className="text-[0.62rem] text-slate-400">0 из {EVAL.linksTotal}</div>
          </div>
        </div>
        <div className="mt-3 text-[0.72rem] text-slate-500 leading-snug">
          Ноль галлюцинаций — потому что AI <b>выбирает из существующих пунктов</b> библиотеки, а не сочиняет тексты.
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[0.88rem] font-bold text-slate-800 m-0">Какая конфигурация поиска работает лучше</h3>
            <p className="text-[0.72rem] text-slate-500 mt-0.5">Все варианты — на одних и тех же {EVAL.goldenCases} эталонных случаях</p>
          </div>
          <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded bg-green-100 text-green-700 uppercase tracking-wider">продакшен</span>
        </div>
        <div className="space-y-3">
          {EVAL.abTest.map((t, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[0.78rem] ${t.active ? 'font-bold text-slate-800' : 'text-slate-600'}`}>{t.method}</span>
                <span className="text-[0.76rem] font-mono font-semibold text-slate-700">{t.recall}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${t.recall}%`, background: t.active ? BRAND : '#94a3b8' }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 text-[0.74rem] text-slate-600 leading-relaxed">
          <b>Инсайт:</b> взвешенные формулы теряют качество когда часть тегов предписания отсутствует — ложный бонус сбивает ранжирование. Переранжирование <b>по позициям</b> в двух списках — устойчиво к таким пробелам.
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-[0.88rem] font-bold text-slate-800 m-0 mb-1">Где находится правильный ответ</h3>
        <p className="text-[0.72rem] text-slate-500 mb-4">Накопительная точность по позиции в результатах поиска</p>
        <div className="space-y-2.5">
          {EVAL.rankDistribution.map(r => {
            const pct = (r.hits / r.total) * 100
            return (
              <div key={r.pos}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[0.74rem] font-semibold text-slate-700">{r.pos}</span>
                  <span className="text-[0.72rem] text-slate-500">{r.hits} из {r.total} <span className="ml-1 font-mono text-slate-400">({pct.toFixed(0)}%)</span></span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: BRAND }} />
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 text-[0.74rem] text-slate-600">
          В половине случаев правильный ответ — уже первый в выдаче. В 77% случаев инженеру достаточно пролистать 5 результатов.
        </div>
      </div>
    </div>
  )
}

function StatMini({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
      <div className="text-[0.6rem] text-slate-400 uppercase font-bold tracking-wider mb-1">{label}</div>
      <div className="text-xl font-bold text-slate-800 leading-none">{value}</div>
      <div className="text-[0.65rem] text-slate-400 mt-1">{sub}</div>
    </div>
  )
}
