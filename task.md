Задача: Обновить глобальную палитру и добавить классы премиального glassmorphism в src/index.css.

1. В @theme блоке измени цвета для dark mode:
--color-bg: #050505; (очень глубокий черный)
--color-surface: #0a0a0a;
--color-surface-2: #121212;
--color-border: #1f1f1f;
--color-accent: #3b82f6; (чистый, "дорогой" синий, как у Apple)
2. Добавь кастомные утилиты для премиального карточного дизайна в конец index.css:
.glass-panel {
  background: linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
  border: 1px solid rgba(255,255,255,0.05);
  box-shadow: 0 4px 24px -1px rgba(0,0,0,0.2), inset 0 1px 0 0 rgba(255,255,255,0.05);
  backdrop-filter: blur(16px);
}
3. Пройдись по src/App.tsx и замени у всех карточек (в секциях Hero, Approach, Research) текущие фоны (bg-surface/50, border-border/60) на класс `glass-panel`.
4. Во всех секциях в App.tsx увеличь padding по вертикали: вместо py-14/py-16 поставь py-24 или py-32. Дизайну нужен "воздух".
Кнопка "Открыть демо" — это главный конверсионный элемент. Она не должна быть просто плашкой с текстом. Мы сделаем её тактильной, с эффектом внутреннего свечения и плавной отдачей на клик.
Задача: Создать премиальную кнопку для открытия демок и применить её ко всем продуктам.

1. В src/index.css добавь анимацию блика и класс кнопки:
@keyframes shimmer {
  100% { transform: translateX(100%); }
}
.btn-premium {
  position: relative;
  overflow: hidden;
  background: var(--color-accent);
  color: white;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.1), 0 4px 12px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255,255,255,0.2);
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.btn-premium::after {
  content: '';
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transform: translateX(-100%);
  animation: shimmer 3s infinite;
}
.btn-premium:hover {
  transform: translateY(-1px);
  box-shadow: 0 0 0 1px rgba(0,0,0,0.1), 0 8px 24px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255,255,255,0.2);
}
.btn-premium:active {
  transform: translateY(1px) scale(0.98);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

2. Открой файлы: src/components/DataBookDemo.tsx, DemoAIHub.tsx, DemoAutoprotocol.tsx, DemoCostManager.tsx, DemoPuls.tsx.
3. Найди кнопку "Открыть демо" в каждом из них. Замени её текущие классы на `btn-premium px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer`. Оставь SVG иконку внутри.
Читаемость — признак хорошего тона. Если текст сливается в кашу, его не будут читать. Расставим правильные контрасты: заголовки — ослепительно белые (или с градиентом), описание — приглушенное, метрики — яркие.
Задача: Вылизать типографику и визуальную иерархию в src/App.tsx и src/components/ProductsEcosystem.tsx.

1. В index.css для body добавь: `text-rendering: optimizeLegibility; -webkit-font-smoothing: antialiased;`.
2. В App.tsx (секция Approach): Метрики в карточках (свойство metric) выглядят слабо. Оберни их вывод в стильный бейдж: `mt-auto pt-4 border-t border-white/5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-green`. Рядом с текстом добавь маленькую круглую точку `w-1.5 h-1.5 rounded-full bg-green`.
3. В ProductsEcosystem.tsx: Сделай центральный узел (AI-Hub) более акцентным. Измени цвет бордера на градиентный или сделай свечение сильнее.
4. В боковых карточках (DetailCard) в ProductsEcosystem.tsx: текст `product.pain`, `solution`, `result` сделай более читаемым. Метки "Задача", "Решение", "Результат" сделай моноширинными (font-mono) или очень мелкими uppercase с межбуквенным интервалом (tracking-widest), чтобы они выглядели как технические лейблы, а не просто текст.