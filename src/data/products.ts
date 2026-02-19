export interface Product {
  id: string
  name: string
  oneliner: string
  status: 'production' | 'pilot' | 'prototype'
  metrics: { value: string; label: string }[]
  pain: string
  solution: string
  result: string
  tech: string[]
  demoText: string
  demoSubject: string
}

export const products: Product[] = [
  {
    id: 'aihub',
    name: 'AI-Hub',
    oneliner: 'Корпоративный SSO-портал и инфраструктурное ядро экосистемы',
    status: 'production',
    metrics: [
      { value: 'OAuth2', label: '+ PKCE + OIDC' },
      { value: 'ADFS', label: 'корпоративная интеграция' },
      { value: 'CI/CD', label: 'GitHub Actions' },
    ],
    pain: 'Разрозненные инструменты без единой авторизации. Каждый сервис — отдельный вход. Отсутствие контроля доступов и аудита использования.',
    solution: 'OAuth2 Authorization Server с PKCE. Интеграция с Active Directory (ADFS/OIDC). AI-чат (Gemini streaming), каталог приложений, система промптов, admin-панель с RBAC.',
    result: 'Единая точка входа для всей экосистемы. Полный аудит действий. Управление пользователями, группами, доступами. Автоматический деплой через GitHub Actions.',
    tech: ['FastAPI async', 'React 19', 'TypeScript', 'PostgreSQL', 'OAuth2/PKCE', 'ADFS/OIDC', 'JWT', 'Docker', 'Nginx', 'GitHub Actions'],
    demoText: 'Документация и демонстрация admin-панели — по запросу',
    demoSubject: 'AI-Hub Demo',
  },
  {
    id: 'autoprotocol',
    name: 'Автопротокол v2',
    oneliner: 'ML-система автоматического протоколирования совещаний',
    status: 'production',
    metrics: [
      { value: '7', label: 'этапов ML-пайплайна' },
      { value: '90+', label: 'языков транскрипции' },
      { value: '3', label: 'бизнес-домена' },
    ],
    pain: 'Ручное протоколирование совещаний. Администратор проекта тратит значительное время на расшифровку, структурирование и распределение поручений.',
    solution: 'Многоэтапный ML-пайплайн: транскрипция (WhisperX) → диаризация спикеров (pyannote) → анализ эмоций (wav2vec2) → структурирование и генерация артефактов (Gemini).',
    result: 'Кратное сокращение времени подготовки протоколов. Автоматическая генерация риск-брифов. Пилотируется на проектах. Три конфигурации: строительство, HR, IT.',
    tech: ['FastAPI', 'Celery', 'Redis', 'WhisperX', 'pyannote', 'wav2vec2', 'Gemini', 'CUDA/GPU', 'React', 'Docker'],
    demoText: 'Демонстрация обработки аудиозаписи — по запросу',
    demoSubject: 'Autoprotocol Demo',
  },
  {
    id: 'costmanager',
    name: 'CostManager',
    oneliner: 'AI-аналитика себестоимости строительства и бенчмаркинг объектов-аналогов',
    status: 'production',
    metrics: [
      { value: '~8', label: 'пользователей (отдел)' },
      { value: 'P10/P90', label: 'статистический анализ' },
      { value: 'Decimal', label: 'финансовая точность' },
    ],
    pain: 'Ручной анализ строительных смет. Классификация позиций вручную. Сравнение объектов-аналогов в разрозненных таблицах Excel.',
    solution: 'AI-автоклассификация сметных позиций (Gemini + Ollama). Иерархическая разбивка затрат с дефлятированием. Генерация аналитических Excel-отчётов с P10/P90.',
    result: 'Департамент экономики строительства полностью перешёл на инструмент. Профессиональные отчёты: титульный лист, сравнительный анализ, попарное сравнение, рыночная валидация.',
    tech: ['Python', 'Flask', 'PostgreSQL', 'Gemini API', 'Ollama', 'xlsxwriter', 'NumPy', 'Chart.js'],
    demoText: 'Примеры отчётов и демонстрация интерфейса — по запросу',
    demoSubject: 'CostManager Demo',
  },
  {
    id: 'databook',
    name: 'DataBook',
    oneliner: 'Интеллектуальный поиск по базе предписаний строительного контроля',
    status: 'production',
    metrics: [
      { value: '8 500+', label: 'уникальных предписаний' },
      { value: '~25 000', label: 'исходных записей' },
      { value: 'ежедневно', label: 'используется инженерами' },
    ],
    pain: 'Инженеры СК тратят значительное время на поиск прецедентов предписаний в разрозненных источниках. Нет единой структурированной базы.',
    solution: 'NLP-система с лемматизацией русского языка. Дедупликация через векторную близость (25 000 → 8 500). Полнотекстовый поиск PostgreSQL с fuzzy matching.',
    result: 'Ежедневно используется инженерами на объектах. Organic adoption: внедрение без административного давления. Поиск прецедента — секунды вместо часов.',
    tech: ['Python', 'FastAPI', 'PostgreSQL FTS', 'NLP', 'Vector Similarity', 'React', 'Docker'],
    demoText: 'Демонстрация доступна по запросу',
    demoSubject: 'DataBook Demo',
  },
]
