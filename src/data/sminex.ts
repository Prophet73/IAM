import type { ComponentType } from 'react'
import { Droplets, Volume2, Car, DoorOpen, ArrowUpDown, Trash2, Trees, Zap } from 'lucide-react'

export type SubScreen = 'intercom' | 'cameras' | 'smart-home' | 'services' | 'bills' | 'parking' | 'floor-plan' | 'booking' | 'packages' | 'privileges' | null

export type RequestStatus = 'new' | 'in_progress' | 'completed' | 'overdue'
export type Priority = 'low' | 'medium' | 'high' | 'critical'
export type UserRole = 'resident' | 'manager' | 'director'

export interface OwnedProperty {
  id: string
  complexId: string
  complexName: string
  apartment: string
  type: 'apartment' | 'studio' | 'penthouse' | 'storage' | 'commercial'
  typeLabel: string
  area: number
  floor: number
  rooms: FloorPlanRoom[]
}

export interface FloorPlanRoom {
  id: string
  name: string
  x: number
  y: number
  w: number
  h: number
  temperature?: number
  humidity?: number
  devicesOn: number
  devicesTotal: number
}

export interface UserProfile {
  id: string
  name: string
  initials: string
  role: UserRole
  roleLabel: string
  complexId?: string
  apartment?: string
  phone?: string
  position?: string
  description: string
  properties?: OwnedProperty[]
}

export interface ResidentialComplex {
  id: string
  name: string
  address: string
}

export interface TimelineEvent {
  date: string
  status: string
  author: string
}

export interface ChatMessage {
  id: string
  author: string
  role: 'resident' | 'manager' | 'executor'
  text: string
  date: string
}

export interface ServiceRequest {
  id: string
  number: number
  type: string
  category: string
  complexId: string
  apartment: string
  resident: string
  residentId?: string
  phone: string
  description: string
  status: RequestStatus
  priority: Priority
  createdAt: string
  updatedAt: string
  assignee?: string
  timeline: TimelineEvent[]
  chat: ChatMessage[]
  rating?: number
}

export interface Notification {
  id: string
  text: string
  time: string
  type: 'status_change' | 'assigned' | 'completed' | 'rate' | 'info'
  read: boolean
  requestNumber?: number
  forRole: UserRole[]
}

export interface DashboardMetrics {
  newRequests: number
  newRequestsTrend: number
  avgResponseTime: number
  avgResponseTrend: number
  slaCompliance: number
  slaTrend: number
  overdue: number
  overdueTrend: number
}

export interface AnalyticsData {
  period: string
  totalRequests: number
  avgCloseTime: number
  satisfaction: number
  slaCompliance: number
  requestsByDay: { day: string; count: number }[]
  requestsByType: { type: string; count: number; color: string }[]
  topCategories: { category: string; count: number; trend: number }[]
}

export const users: UserProfile[] = [
  {
    id: 'resident-1',
    name: 'Иванов А.С.',
    initials: 'ИА',
    role: 'resident',
    roleLabel: 'Собственник',
    complexId: 'river-park',
    apartment: '142',
    phone: '+7 (999) 123-45-67',
    description: 'кв. 142, Ривер Парк',
    properties: [
      {
        id: 'prop-1',
        complexId: 'river-park',
        complexName: 'Ривер Парк',
        apartment: '142',
        type: 'apartment',
        typeLabel: 'Квартира',
        area: 98.5,
        floor: 12,
        rooms: [
          { id: 'rm-hall', name: 'Прихожая', x: 0, y: 0, w: 30, h: 25, temperature: 22, humidity: 40, devicesOn: 1, devicesTotal: 2 },
          { id: 'rm-living', name: 'Гостиная', x: 30, y: 0, w: 45, h: 55, temperature: 22.5, humidity: 45, devicesOn: 3, devicesTotal: 4 },
          { id: 'rm-kitchen', name: 'Кухня', x: 75, y: 0, w: 25, h: 40, temperature: 23, humidity: 50, devicesOn: 1, devicesTotal: 2 },
          { id: 'rm-bedroom', name: 'Спальня', x: 0, y: 25, w: 30, h: 40, temperature: 21, humidity: 48, devicesOn: 1, devicesTotal: 3 },
          { id: 'rm-child', name: 'Детская', x: 0, y: 65, w: 30, h: 35, temperature: 22, humidity: 45, devicesOn: 0, devicesTotal: 2 },
          { id: 'rm-bath', name: 'Ванная', x: 75, y: 40, w: 25, h: 30, temperature: 24, humidity: 65, devicesOn: 1, devicesTotal: 1 },
          { id: 'rm-wc', name: 'С/У', x: 75, y: 70, w: 25, h: 30, devicesOn: 0, devicesTotal: 0 },
          { id: 'rm-balcony', name: 'Балкон', x: 30, y: 55, w: 45, h: 15, devicesOn: 0, devicesTotal: 1 },
        ],
      },
      {
        id: 'prop-2',
        complexId: 'west-garden',
        complexName: 'Вест Гарден',
        apartment: '301',
        type: 'studio',
        typeLabel: 'Студия',
        area: 42.0,
        floor: 3,
        rooms: [
          { id: 'rm2-main', name: 'Студия', x: 0, y: 0, w: 70, h: 70, temperature: 21, humidity: 42, devicesOn: 1, devicesTotal: 3 },
          { id: 'rm2-bath', name: 'Ванная', x: 70, y: 0, w: 30, h: 40, temperature: 23, humidity: 60, devicesOn: 0, devicesTotal: 1 },
          { id: 'rm2-balcony', name: 'Балкон', x: 0, y: 70, w: 70, h: 30, devicesOn: 0, devicesTotal: 0 },
        ],
      },
      {
        id: 'prop-3',
        complexId: 'river-park',
        complexName: 'Ривер Парк',
        apartment: 'К-12',
        type: 'storage',
        typeLabel: 'Кладовая',
        area: 8.0,
        floor: -1,
        rooms: [
          { id: 'rm3-main', name: 'Кладовая', x: 0, y: 0, w: 100, h: 100, temperature: 18, humidity: 35, devicesOn: 0, devicesTotal: 0 },
        ],
      },
    ],
  },
  {
    id: 'manager-1',
    name: 'Смирнов К.А.',
    initials: 'СК',
    role: 'manager',
    roleLabel: 'Управляющий',
    complexId: 'river-park',
    position: 'Управляющий ЖК',
    description: 'Ривер Парк',
  },
  {
    id: 'director-1',
    name: 'Хроменок Н.В.',
    initials: 'ХН',
    role: 'director',
    roleLabel: 'Директор УК',
    position: 'Директор управляющей компании',
    description: 'Все жилые комплексы',
  },
]

export const complexes: ResidentialComplex[] = [
  { id: 'river-park', name: 'Ривер Парк', address: 'Москва, наб. Шелепихинская, 34' },
  { id: 'west-garden', name: 'Вест Гарден', address: 'Москва, ул. Минская, 2' },
]

export const initialRequests: ServiceRequest[] = [
  {
    id: 'r1', number: 2847, type: 'Протечка', category: 'Сантехника',
    complexId: 'river-park', apartment: '142', resident: 'Иванов А.С.', residentId: 'resident-1', phone: '+7 (999) 123-45-67',
    description: 'Протечка трубы в ванной комнате, вода капает с потолка',
    status: 'new', priority: 'critical', createdAt: '2026-02-26 09:15', updatedAt: '2026-02-26 09:15',
    timeline: [
      { date: '2026-02-26 09:15', status: 'Заявка создана', author: 'Система' },
    ],
    chat: [
      { id: 'c1', author: 'Иванов А.С.', role: 'resident', text: 'Вода капает с потолка в ванной, срочно нужен сантехник!', date: '2026-02-26 09:15' },
      { id: 'c2', author: 'Управляющий', role: 'manager', text: 'Принято, направляем специалиста. Ориентировочное время — 1 час.', date: '2026-02-26 09:22' },
    ],
  },
  {
    id: 'r2', number: 2846, type: 'Шум', category: 'Нарушения',
    complexId: 'river-park', apartment: '87', resident: 'Петрова М.В.', phone: '+7 (999) 234-56-78',
    description: 'Шум от ремонтных работ в соседней квартире после 21:00',
    status: 'in_progress', priority: 'medium', createdAt: '2026-02-25 22:30', updatedAt: '2026-02-26 08:00',
    assignee: 'Смирнов К.А.',
    timeline: [
      { date: '2026-02-25 22:30', status: 'Заявка создана', author: 'Система' },
      { date: '2026-02-26 08:00', status: 'Взята в работу', author: 'Смирнов К.А.' },
    ],
    chat: [
      { id: 'c3', author: 'Петрова М.В.', role: 'resident', text: 'В квартире 88 опять ремонт после 21. Невозможно уснуть.', date: '2026-02-25 22:30' },
      { id: 'c4', author: 'Смирнов К.А.', role: 'manager', text: 'Зафиксировали. Направим предупреждение собственнику кв. 88.', date: '2026-02-26 08:00' },
    ],
  },
  {
    id: 'r3', number: 2845, type: 'Парковка', category: 'Территория',
    complexId: 'west-garden', apartment: '201', resident: 'Козлов Д.И.', phone: '+7 (999) 345-67-89',
    description: 'На моём парковочном месте №47 стоит чужой автомобиль',
    status: 'in_progress', priority: 'high', createdAt: '2026-02-25 18:45', updatedAt: '2026-02-25 19:10',
    assignee: 'Васильев П.Р.',
    timeline: [
      { date: '2026-02-25 18:45', status: 'Заявка создана', author: 'Система' },
      { date: '2026-02-25 19:10', status: 'Взята в работу', author: 'Васильев П.Р.' },
    ],
    chat: [
      { id: 'c5', author: 'Козлов Д.И.', role: 'resident', text: 'На моём месте №47 стоит серый BMW X5, гос.номер А777АА. Прошу убрать.', date: '2026-02-25 18:45' },
      { id: 'c6', author: 'Васильев П.Р.', role: 'manager', text: 'Устанавливаем владельца ТС. Если не удастся связаться — вызовем эвакуатор.', date: '2026-02-25 19:10' },
    ],
  },
  {
    id: 'r4', number: 2844, type: 'Домофон', category: 'Оборудование',
    complexId: 'river-park', apartment: '56', resident: 'Сидорова Е.Н.', phone: '+7 (999) 456-78-90',
    description: 'Не работает домофон в подъезде 3, невозможно открыть дверь',
    status: 'completed', priority: 'high', createdAt: '2026-02-24 14:20', updatedAt: '2026-02-25 11:00',
    assignee: 'Техслужба',
    timeline: [
      { date: '2026-02-24 14:20', status: 'Заявка создана', author: 'Система' },
      { date: '2026-02-24 15:00', status: 'Взята в работу', author: 'Техслужба' },
      { date: '2026-02-25 11:00', status: 'Выполнена', author: 'Техслужба' },
    ],
    chat: [
      { id: 'c7', author: 'Сидорова Е.Н.', role: 'resident', text: 'Домофон в 3-м подъезде не работает с утра.', date: '2026-02-24 14:20' },
      { id: 'c8', author: 'Техслужба', role: 'executor', text: 'Вышел из строя контроллер. Заменили, домофон работает.', date: '2026-02-25 11:00' },
    ],
    rating: 5,
  },
  {
    id: 'r5', number: 2843, type: 'Лифт', category: 'Оборудование',
    complexId: 'west-garden', apartment: '310', resident: 'Николаев В.П.', phone: '+7 (999) 567-89-01',
    description: 'Лифт в корпусе 2 застревает между этажами 5 и 6',
    status: 'overdue', priority: 'critical', createdAt: '2026-02-22 10:00', updatedAt: '2026-02-24 10:00',
    assignee: 'Лифтовая служба',
    timeline: [
      { date: '2026-02-22 10:00', status: 'Заявка создана', author: 'Система' },
      { date: '2026-02-22 11:30', status: 'Взята в работу', author: 'Лифтовая служба' },
      { date: '2026-02-24 10:00', status: 'Просрочена', author: 'Система' },
    ],
    chat: [
      { id: 'c9', author: 'Николаев В.П.', role: 'resident', text: 'Лифт в корпусе 2 опять застрял! Третий раз за неделю.', date: '2026-02-22 10:00' },
      { id: 'c10', author: 'Лифтовая служба', role: 'executor', text: 'Ожидаем запчасть от производителя. Срок поставки — 2 дня.', date: '2026-02-22 14:00' },
      { id: 'c11', author: 'Николаев В.П.', role: 'resident', text: 'Прошло уже 2 дня, лифт всё ещё не работает!', date: '2026-02-24 10:00' },
    ],
  },
  {
    id: 'r6', number: 2842, type: 'Уборка', category: 'Клининг',
    complexId: 'river-park', apartment: '—', resident: 'Совет дома', phone: '+7 (999) 678-90-12',
    description: 'Грязный холл первого этажа в корпусе 1, не убирали 3 дня',
    status: 'completed', priority: 'medium', createdAt: '2026-02-23 08:00', updatedAt: '2026-02-23 16:00',
    assignee: 'Клининг',
    timeline: [
      { date: '2026-02-23 08:00', status: 'Заявка создана', author: 'Система' },
      { date: '2026-02-23 09:00', status: 'Взята в работу', author: 'Клининг' },
      { date: '2026-02-23 16:00', status: 'Выполнена', author: 'Клининг' },
    ],
    chat: [
      { id: 'c12', author: 'Совет дома', role: 'resident', text: 'Холл 1 этажа в корпусе 1 — очень грязно. Просим убрать.', date: '2026-02-23 08:00' },
    ],
    rating: 4,
  },
  {
    id: 'r7', number: 2841, type: 'Благоустройство', category: 'Территория',
    complexId: 'west-garden', apartment: '—', resident: 'Морозова А.Л.', phone: '+7 (999) 789-01-23',
    description: 'Сломана скамейка на детской площадке во дворе',
    status: 'in_progress', priority: 'medium', createdAt: '2026-02-24 12:00', updatedAt: '2026-02-25 09:00',
    assignee: 'Хоз. служба',
    timeline: [
      { date: '2026-02-24 12:00', status: 'Заявка создана', author: 'Система' },
      { date: '2026-02-25 09:00', status: 'Взята в работу', author: 'Хоз. служба' },
    ],
    chat: [
      { id: 'c13', author: 'Морозова А.Л.', role: 'resident', text: 'На детской площадке сломана скамейка, торчат гвозди. Опасно для детей!', date: '2026-02-24 12:00' },
    ],
  },
  {
    id: 'r8', number: 2840, type: 'Протечка', category: 'Сантехника',
    complexId: 'west-garden', apartment: '115', resident: 'Андреев С.М.', phone: '+7 (999) 890-12-34',
    description: 'Течёт кран на кухне, невозможно полностью закрыть',
    status: 'new', priority: 'low', createdAt: '2026-02-26 07:00', updatedAt: '2026-02-26 07:00',
    timeline: [
      { date: '2026-02-26 07:00', status: 'Заявка создана', author: 'Система' },
    ],
    chat: [
      { id: 'c14', author: 'Андреев С.М.', role: 'resident', text: 'Кран на кухне подтекает, вода капает постоянно.', date: '2026-02-26 07:00' },
    ],
  },
  {
    id: 'r9', number: 2839, type: 'Электрика', category: 'Оборудование',
    complexId: 'river-park', apartment: '204', resident: 'Белова О.К.', phone: '+7 (999) 901-23-45',
    description: 'Не горит освещение на лестничной клетке 7 этажа',
    status: 'completed', priority: 'medium', createdAt: '2026-02-22 19:00', updatedAt: '2026-02-23 10:00',
    assignee: 'Электрик',
    timeline: [
      { date: '2026-02-22 19:00', status: 'Заявка создана', author: 'Система' },
      { date: '2026-02-22 20:00', status: 'Взята в работу', author: 'Электрик' },
      { date: '2026-02-23 10:00', status: 'Выполнена', author: 'Электрик' },
    ],
    chat: [],
    rating: 5,
  },
  {
    id: 'r10', number: 2838, type: 'Шум', category: 'Нарушения',
    complexId: 'west-garden', apartment: '78', resident: 'Громов И.Д.', phone: '+7 (999) 012-34-56',
    description: 'Громкая музыка из квартиры 79 каждые выходные',
    status: 'overdue', priority: 'low', createdAt: '2026-02-20 23:00', updatedAt: '2026-02-23 12:00',
    assignee: 'Смирнов К.А.',
    timeline: [
      { date: '2026-02-20 23:00', status: 'Заявка создана', author: 'Система' },
      { date: '2026-02-21 09:00', status: 'Взята в работу', author: 'Смирнов К.А.' },
      { date: '2026-02-23 12:00', status: 'Просрочена', author: 'Система' },
    ],
    chat: [],
  },
  {
    id: 'r11', number: 2837, type: 'Домофон', category: 'Оборудование',
    complexId: 'river-park', apartment: '33', resident: 'Кузнецов П.В.', phone: '+7 (999) 111-22-33',
    description: 'Домофонная трубка в квартире не работает, нет связи',
    status: 'new', priority: 'medium', createdAt: '2026-02-26 08:30', updatedAt: '2026-02-26 08:30',
    timeline: [
      { date: '2026-02-26 08:30', status: 'Заявка создана', author: 'Система' },
    ],
    chat: [
      { id: 'c15', author: 'Кузнецов П.В.', role: 'resident', text: 'Трубка домофона перестала работать, не слышу вызовы.', date: '2026-02-26 08:30' },
    ],
  },
  {
    id: 'r12', number: 2836, type: 'Уборка', category: 'Клининг',
    complexId: 'west-garden', apartment: '—', resident: 'Жильцы подъезда 2', phone: '+7 (999) 222-33-44',
    description: 'Мусор у контейнерной площадки не вывозился 2 дня',
    status: 'completed', priority: 'high', createdAt: '2026-02-24 07:00', updatedAt: '2026-02-24 14:00',
    assignee: 'Клининг',
    timeline: [
      { date: '2026-02-24 07:00', status: 'Заявка создана', author: 'Система' },
      { date: '2026-02-24 08:00', status: 'Взята в работу', author: 'Клининг' },
      { date: '2026-02-24 14:00', status: 'Выполнена', author: 'Клининг' },
    ],
    chat: [],
    rating: 3,
  },
  {
    id: 'r13', number: 2835, type: 'Лифт', category: 'Оборудование',
    complexId: 'river-park', apartment: '178', resident: 'Фёдорова Н.С.', phone: '+7 (999) 333-44-55',
    description: 'Лифт издаёт скрежет при движении, страшно пользоваться',
    status: 'in_progress', priority: 'high', createdAt: '2026-02-25 11:00', updatedAt: '2026-02-25 14:00',
    assignee: 'Лифтовая служба',
    timeline: [
      { date: '2026-02-25 11:00', status: 'Заявка создана', author: 'Система' },
      { date: '2026-02-25 14:00', status: 'Взята в работу', author: 'Лифтовая служба' },
    ],
    chat: [
      { id: 'c16', author: 'Фёдорова Н.С.', role: 'resident', text: 'Лифт скрежещет при движении, вибрация. Боюсь ездить.', date: '2026-02-25 11:00' },
    ],
  },
  {
    id: 'r14', number: 2834, type: 'Благоустройство', category: 'Территория',
    complexId: 'river-park', apartment: '—', resident: 'Волков А.А.', phone: '+7 (999) 444-55-66',
    description: 'Яма на дороге при въезде во двор, можно повредить машину',
    status: 'new', priority: 'medium', createdAt: '2026-02-25 16:00', updatedAt: '2026-02-25 16:00',
    timeline: [
      { date: '2026-02-25 16:00', status: 'Заявка создана', author: 'Система' },
    ],
    chat: [],
  },
  {
    id: 'r15', number: 2833, type: 'Электрика', category: 'Оборудование',
    complexId: 'west-garden', apartment: '95', resident: 'Соколова Т.М.', phone: '+7 (999) 555-66-77',
    description: 'Мигает свет в коридоре, возможно проблема с проводкой',
    status: 'completed', priority: 'medium', createdAt: '2026-02-21 13:00', updatedAt: '2026-02-22 09:00',
    assignee: 'Электрик',
    timeline: [
      { date: '2026-02-21 13:00', status: 'Заявка создана', author: 'Система' },
      { date: '2026-02-21 15:00', status: 'Взята в работу', author: 'Электрик' },
      { date: '2026-02-22 09:00', status: 'Выполнена', author: 'Электрик' },
    ],
    chat: [],
    rating: 4,
  },
]

export const initialNotifications: Notification[] = [
  { id: 'n1', text: 'Ваша заявка #2847 зарегистрирована', time: '09:15', type: 'info', read: true, requestNumber: 2847, forRole: ['resident'] },
  { id: 'n2', text: 'Управляющий ответил по заявке #2847', time: '09:22', type: 'status_change', read: true, requestNumber: 2847, forRole: ['resident'] },
  { id: 'n3', text: 'Заявка #2844 выполнена — оцените работу', time: 'Вчера', type: 'rate', read: false, requestNumber: 2844, forRole: ['resident'] },
  { id: 'n4', text: 'Новая заявка #2847 — Протечка, кв. 142', time: '09:15', type: 'info', read: false, requestNumber: 2847, forRole: ['manager', 'director'] },
  { id: 'n5', text: 'Заявка #2843 просрочена — Лифт, Вест Гарден', time: 'Вчера', type: 'status_change', read: false, requestNumber: 2843, forRole: ['manager', 'director'] },
  { id: 'n6', text: 'Техслужба закрыла заявку #2844', time: 'Вчера', type: 'completed', read: true, requestNumber: 2844, forRole: ['manager', 'director'] },
  { id: 'n7', text: 'SLA нарушен по 2 заявкам', time: '2 дня назад', type: 'status_change', read: true, forRole: ['director'] },
]

export const requestTypeIcons: Record<string, ComponentType<{ className?: string }>> = {
  'Протечка': Droplets,
  'Шум': Volume2,
  'Парковка': Car,
  'Домофон': DoorOpen,
  'Лифт': ArrowUpDown,
  'Уборка': Trash2,
  'Благоустройство': Trees,
  'Электрика': Zap,
}

export const requestTypeColors: Record<string, string> = {
  'Протечка': 'bg-blue-100 text-blue-600',
  'Шум': 'bg-purple-100 text-purple-600',
  'Парковка': 'bg-amber-100 text-amber-600',
  'Домофон': 'bg-emerald-100 text-emerald-600',
  'Лифт': 'bg-orange-100 text-orange-600',
  'Уборка': 'bg-teal-100 text-teal-600',
  'Благоустройство': 'bg-green-100 text-green-600',
  'Электрика': 'bg-yellow-100 text-yellow-600',
}

export const executors = [
  { id: 'tech', name: 'Техслужба' },
  { id: 'cleaning', name: 'Клининг' },
  { id: 'electric', name: 'Электрик' },
  { id: 'elevator', name: 'Лифтовая служба' },
  { id: 'maintenance', name: 'Хоз. служба' },
]

export const requestTypes = [
  'Протечка', 'Шум', 'Парковка', 'Домофон', 'Лифт', 'Уборка', 'Благоустройство', 'Электрика',
]

export const dashboardMetrics: DashboardMetrics = {
  newRequests: 5,
  newRequestsTrend: 12,
  avgResponseTime: 2.4,
  avgResponseTrend: -8,
  slaCompliance: 94,
  slaTrend: 3,
  overdue: 2,
  overdueTrend: -1,
}

export const analyticsData: AnalyticsData = {
  period: 'Февраль 2026',
  totalRequests: 47,
  avgCloseTime: 18.5,
  satisfaction: 4.7,
  slaCompliance: 94,
  requestsByDay: [
    { day: 'Пн', count: 8 },
    { day: 'Вт', count: 6 },
    { day: 'Ср', count: 9 },
    { day: 'Чт', count: 7 },
    { day: 'Пт', count: 10 },
    { day: 'Сб', count: 4 },
    { day: 'Вс', count: 3 },
  ],
  requestsByType: [
    { type: 'Сантехника', count: 12, color: '#1D252D' },
    { type: 'Оборудование', count: 10, color: '#8B7355' },
    { type: 'Клининг', count: 8, color: '#A09484' },
    { type: 'Нарушения', count: 7, color: '#C4B8A8' },
    { type: 'Территория', count: 6, color: '#D8CFC4' },
    { type: 'Прочее', count: 4, color: '#E8E0D8' },
  ],
  topCategories: [
    { category: 'Сантехника', count: 12, trend: 15 },
    { category: 'Лифты и домофоны', count: 10, trend: -5 },
    { category: 'Уборка территории', count: 8, trend: 0 },
  ],
}

export const statusLabels: Record<RequestStatus, string> = {
  new: 'Новая',
  in_progress: 'В работе',
  completed: 'Выполнена',
  overdue: 'Просрочена',
}

export const statusColors: Record<RequestStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-amber-100 text-amber-800',
  completed: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
}

export const priorityLabels: Record<Priority, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
  critical: 'Критический',
}

export const priorityColors: Record<Priority, string> = {
  low: 'text-gray-500',
  medium: 'text-amber-600',
  high: 'text-orange-600',
  critical: 'text-red-600',
}

// ─── Premium Features: Types ───

export interface GuestPass {
  id: string
  guestName: string
  date: string
  timeRange: string
  status: 'active' | 'used' | 'expired'
}

export interface EntryEvent {
  id: string
  type: 'entry' | 'exit' | 'delivery' | 'guest'
  description: string
  time: string
}

export interface Camera {
  id: string
  name: string
  location: string
  isLive: boolean
  isRecording: boolean
}

export interface SmartDevice {
  id: string
  name: string
  type: 'light' | 'outlet' | 'lock' | 'curtains'
  isOn: boolean
  room: string
}

export interface LightScene {
  id: string
  name: string
  icon: string
  isActive: boolean
}

export interface Sensor {
  id: string
  name: string
  value: string
  unit: string
  room: string
}

export interface ConciergeService {
  id: string
  name: string
  icon: string
  price: string
  description: string
}

export interface ActiveOrder {
  id: string
  service: string
  status: 'pending' | 'in_progress' | 'done'
  date: string
}

export interface Bill {
  id: string
  name: string
  amount: number
  isPaid: boolean
}

export interface PaymentHistory {
  id: string
  month: string
  amount: number
  date: string
}

export interface ParkingSpot {
  id: string
  number: string
  level: string
  type: 'owned' | 'guest'
  status: 'free' | 'occupied'
}

export interface ParkingEvent {
  id: string
  description: string
  time: string
}

// ─── Premium Features: Mock Data ───

export const guestPasses: GuestPass[] = [
  { id: 'gp1', guestName: 'Петров Д.М.', date: '26.02.2026', timeRange: '14:00–18:00', status: 'active' },
  { id: 'gp2', guestName: 'Курьер Яндекс', date: '25.02.2026', timeRange: '12:00–12:30', status: 'used' },
  { id: 'gp3', guestName: 'Сидорова А.К.', date: '24.02.2026', timeRange: '10:00–22:00', status: 'expired' },
]

export const entryEvents: EntryEvent[] = [
  { id: 'ee1', type: 'entry', description: 'Ваш вход через подъезд 2', time: '09:12' },
  { id: 'ee2', type: 'delivery', description: 'Курьер Ozon — посылка', time: '08:45' },
  { id: 'ee3', type: 'guest', description: 'Гость: Петров Д.М.', time: 'Вчера 17:30' },
  { id: 'ee4', type: 'exit', description: 'Ваш выход через паркинг', time: 'Вчера 08:50' },
]

export const cameras: Camera[] = [
  { id: 'cam1', name: 'Подъезд', location: 'Вход, подъезд 2', isLive: true, isRecording: true },
  { id: 'cam2', name: 'Парковка', location: 'Уровень B1', isLive: true, isRecording: true },
  { id: 'cam3', name: 'Двор', location: 'Детская площадка', isLive: true, isRecording: false },
  { id: 'cam4', name: 'Детская', location: 'Игровая комната', isLive: true, isRecording: true },
]

export const smartRooms = ['Все', 'Гостиная', 'Спальня', 'Кухня', 'Ванная']

export const smartDevices: SmartDevice[] = [
  { id: 'sd1', name: 'Люстра', type: 'light', isOn: true, room: 'Гостиная' },
  { id: 'sd2', name: 'Торшер', type: 'light', isOn: false, room: 'Гостиная' },
  { id: 'sd3', name: 'Розетка TV', type: 'outlet', isOn: true, room: 'Гостиная' },
  { id: 'sd4', name: 'Потолочный свет', type: 'light', isOn: true, room: 'Спальня' },
  { id: 'sd5', name: 'Ночник', type: 'light', isOn: false, room: 'Спальня' },
  { id: 'sd6', name: 'Шторы', type: 'curtains', isOn: false, room: 'Спальня' },
  { id: 'sd7', name: 'Подсветка', type: 'light', isOn: true, room: 'Кухня' },
  { id: 'sd8', name: 'Замок', type: 'lock', isOn: true, room: 'Гостиная' },
]

export const lightScenes: LightScene[] = [
  { id: 'ls1', name: 'Яркий день', icon: 'sun', isActive: false },
  { id: 'ls2', name: 'Вечерний', icon: 'sunset', isActive: true },
  { id: 'ls3', name: 'Кинотеатр', icon: 'film', isActive: false },
  { id: 'ls4', name: 'Ночной', icon: 'moon', isActive: false },
]

export const sensors: Sensor[] = [
  { id: 'sn1', name: 'Температура', value: '22.5', unit: '°C', room: 'Гостиная' },
  { id: 'sn2', name: 'Влажность', value: '45', unit: '%', room: 'Гостиная' },
  { id: 'sn3', name: 'CO₂', value: '420', unit: 'ppm', room: 'Гостиная' },
  { id: 'sn4', name: 'Температура', value: '21.0', unit: '°C', room: 'Спальня' },
  { id: 'sn5', name: 'Влажность', value: '50', unit: '%', room: 'Спальня' },
]

export const conciergeServices: ConciergeService[] = [
  { id: 'cs1', name: 'Химчистка', icon: 'shirt', price: 'от 1 500 ₽', description: 'Забор и доставка одежды' },
  { id: 'cs2', name: 'Клининг', icon: 'sparkles', price: 'от 3 000 ₽', description: 'Уборка квартиры' },
  { id: 'cs3', name: 'Автомойка', icon: 'car', price: 'от 1 200 ₽', description: 'Мойка в паркинге' },
  { id: 'cs4', name: 'Вода', icon: 'droplets', price: '350 ₽', description: 'Доставка воды 19л' },
  { id: 'cs5', name: 'Няня', icon: 'baby', price: 'от 800 ₽/ч', description: 'Присмотр за детьми' },
  { id: 'cs6', name: 'Мастер', icon: 'wrench', price: 'от 2 000 ₽', description: 'Мелкий ремонт' },
]

export const initialBills: Bill[] = [
  { id: 'b1', name: 'ЖКХ', amount: 8450, isPaid: false },
  { id: 'b2', name: 'Электричество', amount: 2180, isPaid: false },
  { id: 'b3', name: 'Водоснабжение', amount: 1340, isPaid: false },
  { id: 'b4', name: 'Интернет', amount: 990, isPaid: true },
  { id: 'b5', name: 'Парковка', amount: 5000, isPaid: true },
]

export const paymentHistory: PaymentHistory[] = [
  { id: 'ph1', month: 'Январь 2026', amount: 17960, date: '28.01.2026' },
  { id: 'ph2', month: 'Декабрь 2025', amount: 18200, date: '27.12.2025' },
  { id: 'ph3', month: 'Ноябрь 2025', amount: 16800, date: '25.11.2025' },
]

export const parkingSpot: ParkingSpot = {
  id: 'ps1', number: '47', level: 'B1', type: 'owned', status: 'free',
}

export const parkingEvents: ParkingEvent[] = [
  { id: 'pe1', description: 'Въезд вашего автомобиля', time: '09:05' },
  { id: 'pe2', description: 'Выезд вашего автомобиля', time: 'Вчера 08:50' },
  { id: 'pe3', description: 'Гостевой пропуск: А777АА', time: 'Вчера 17:20' },
]

// ─── Amenity Booking ───

export interface Amenity {
  id: string
  name: string
  icon: string
  description: string
  pricePerHour: number
  location: string
  slots: AmenitySlot[]
}

export interface AmenitySlot {
  id: string
  time: string
  available: boolean
}

export interface AmenityBooking {
  id: string
  amenityId: string
  amenityName: string
  date: string
  time: string
  status: 'upcoming' | 'active' | 'past'
}

export const amenities: Amenity[] = [
  {
    id: 'am1', name: 'SPA-зона', icon: 'waves', description: 'Сауна, хаммам, бассейн',
    pricePerHour: 3000, location: 'Корпус 1, -1 этаж',
    slots: [
      { id: 's1', time: '10:00–12:00', available: true },
      { id: 's2', time: '12:00–14:00', available: false },
      { id: 's3', time: '14:00–16:00', available: true },
      { id: 's4', time: '16:00–18:00', available: true },
      { id: 's5', time: '18:00–20:00', available: false },
      { id: 's6', time: '20:00–22:00', available: true },
    ],
  },
  {
    id: 'am2', name: 'Спортзал', icon: 'dumbbell', description: 'Тренажёры, свободные веса',
    pricePerHour: 0, location: 'Корпус 1, -1 этаж',
    slots: [
      { id: 's7', time: '07:00–09:00', available: true },
      { id: 's8', time: '09:00–11:00', available: true },
      { id: 's9', time: '11:00–13:00', available: false },
      { id: 's10', time: '17:00–19:00', available: true },
      { id: 's11', time: '19:00–21:00', available: false },
    ],
  },
  {
    id: 'am3', name: 'Переговорная', icon: 'briefcase', description: 'Коворкинг, 8 мест, проектор',
    pricePerHour: 1500, location: 'Корпус 2, 1 этаж',
    slots: [
      { id: 's12', time: '09:00–11:00', available: true },
      { id: 's13', time: '11:00–13:00', available: true },
      { id: 's14', time: '13:00–15:00', available: false },
      { id: 's15', time: '15:00–17:00', available: true },
    ],
  },
  {
    id: 'am4', name: 'Лаунж на крыше', icon: 'mountain', description: 'Терраса, барбекю, бар',
    pricePerHour: 5000, location: 'Крыша, 25 этаж',
    slots: [
      { id: 's16', time: '12:00–15:00', available: true },
      { id: 's17', time: '15:00–18:00', available: false },
      { id: 's18', time: '18:00–21:00', available: true },
      { id: 's19', time: '21:00–00:00', available: true },
    ],
  },
  {
    id: 'am5', name: 'Детская комната', icon: 'puzzle', description: 'Игровая, аниматор',
    pricePerHour: 800, location: 'Корпус 1, 1 этаж',
    slots: [
      { id: 's20', time: '10:00–12:00', available: true },
      { id: 's21', time: '12:00–14:00', available: true },
      { id: 's22', time: '14:00–16:00', available: false },
      { id: 's23', time: '16:00–18:00', available: true },
    ],
  },
  {
    id: 'am6', name: 'Кинозал', icon: 'film', description: '12 мест, Dolby Atmos',
    pricePerHour: 4000, location: 'Корпус 2, -1 этаж',
    slots: [
      { id: 's24', time: '14:00–16:00', available: true },
      { id: 's25', time: '16:00–18:00', available: true },
      { id: 's26', time: '18:00–20:00', available: false },
      { id: 's27', time: '20:00–22:00', available: true },
    ],
  },
]

// ─── Packages & Lockers ───

export interface Package {
  id: string
  carrier: string
  trackingNumber: string
  description: string
  status: 'in_transit' | 'delivered' | 'in_locker' | 'picked_up'
  statusLabel: string
  lockerCode?: string
  lockerNumber?: string
  deliveryDate?: string
  arrivedAt?: string
}

export const initialPackages: Package[] = [
  {
    id: 'pkg1', carrier: 'Ozon', trackingNumber: 'OZ-8847291',
    description: 'Книги и канцелярия', status: 'in_locker',
    statusLabel: 'В ячейке', lockerCode: '4829', lockerNumber: '12',
    arrivedAt: '26.02 · 08:45',
  },
  {
    id: 'pkg2', carrier: 'Wildberries', trackingNumber: 'WB-3319204',
    description: 'Одежда', status: 'in_transit',
    statusLabel: 'В пути', deliveryDate: '27.02.2026',
  },
  {
    id: 'pkg3', carrier: 'Яндекс Маркет', trackingNumber: 'YM-5567102',
    description: 'Электроника', status: 'delivered',
    statusLabel: 'Доставлено курьером', arrivedAt: '25.02 · 14:20',
  },
  {
    id: 'pkg4', carrier: 'CDEK', trackingNumber: 'CD-1104887',
    description: 'Подарок', status: 'picked_up',
    statusLabel: 'Забрано', arrivedAt: '23.02 · 10:00',
  },
]

// ─── Partner Privileges ───

export interface PartnerCategory {
  id: string
  name: string
}

export interface Partner {
  id: string
  name: string
  categoryId: string
  logo: string
  discount: string
  description: string
  promoCode?: string
  isExclusive: boolean
}

export const partnerCategories: PartnerCategory[] = [
  { id: 'pc-all', name: 'Все' },
  { id: 'pc-food', name: 'Рестораны' },
  { id: 'pc-beauty', name: 'Красота' },
  { id: 'pc-fitness', name: 'Спорт' },
  { id: 'pc-auto', name: 'Авто' },
  { id: 'pc-home', name: 'Интерьер' },
  { id: 'pc-kids', name: 'Дети' },
]

export const partners: Partner[] = [
  { id: 'p1', name: 'Maison Dellos', categoryId: 'pc-food', logo: 'utensils', discount: '−15%', description: 'Рестораны Café Пушкинъ, Турандот, Бочка', isExclusive: true },
  { id: 'p2', name: 'BoConcept', categoryId: 'pc-home', logo: 'sofa', discount: '−20%', description: 'Мебель и аксессуары, дизайн-консультация', promoCode: 'SMINEX20', isExclusive: true },
  { id: 'p3', name: 'World Class', categoryId: 'pc-fitness', logo: 'dumbbell', discount: '−30%', description: 'Годовой абонемент в премиум-клуб', isExclusive: false },
  { id: 'p4', name: 'Mercedes-Benz', categoryId: 'pc-auto', logo: 'car', discount: 'Тест-драйв', description: 'Персональный менеджер, приоритет на новинки', isExclusive: true },
  { id: 'p5', name: 'Babor SPA', categoryId: 'pc-beauty', logo: 'sparkles', discount: '−25%', description: 'Премиум-уход, комплексные программы', promoCode: 'RIVER25', isExclusive: false },
  { id: 'p6', name: 'Little Angels', categoryId: 'pc-kids', logo: 'heart', discount: '−15%', description: 'Билингвальный детский сад, подготовка к школе', isExclusive: false },
  { id: 'p7', name: 'LavkaLavka', categoryId: 'pc-food', logo: 'leaf', discount: '−10%', description: 'Фермерские продукты с доставкой', promoCode: 'FRESH10', isExclusive: false },
  { id: 'p8', name: 'Togas', categoryId: 'pc-home', logo: 'bed', discount: '−20%', description: 'Постельное бельё и текстиль премиум-класса', promoCode: 'HOME20', isExclusive: true },
  { id: 'p9', name: 'Performance', categoryId: 'pc-auto', logo: 'wrench', discount: '−15%', description: 'Детейлинг, керамика, тонировка в паркинге', isExclusive: false },
  { id: 'p10', name: 'Dr.Loder', categoryId: 'pc-fitness', logo: 'stethoscope', discount: 'Чекап', description: 'Медицинский чекап, персональная программа', isExclusive: true },
]

// ─── Smart Home Scenarios ───

export interface SmartScenario {
  id: string
  name: string
  icon: string
  description: string
  isActive: boolean
  actions: string[]
}

export const smartScenarios: SmartScenario[] = [
  {
    id: 'sc1', name: 'Я дома', icon: 'home',
    description: 'Включить свет, поднять температуру, разблокировать',
    isActive: false,
    actions: ['Свет → Вечерний', 'Климат → 22°C', 'Замок → Закрыт', 'Шторы → Открыты'],
  },
  {
    id: 'sc2', name: 'Я ушёл', icon: 'door-open',
    description: 'Выключить всё, снизить температуру, заблокировать',
    isActive: false,
    actions: ['Свет → Выкл', 'Климат → 18°C', 'Замок → Закрыт', 'Шторы → Закрыты', 'Розетки → Выкл'],
  },
  {
    id: 'sc3', name: 'Доброе утро', icon: 'sunrise',
    description: 'Плавный свет, открыть шторы, включить кофемашину',
    isActive: false,
    actions: ['Свет → 30%', 'Шторы → Открыты', 'Розетка кофе → Вкл', 'Климат → 22°C'],
  },
  {
    id: 'sc4', name: 'Спокойной ночи', icon: 'moon-star',
    description: 'Ночник в спальне, закрыть шторы, снизить температуру',
    isActive: false,
    actions: ['Свет → Ночник', 'Шторы → Закрыты', 'Климат → 20°C', 'Замок → Закрыт'],
  },
]
