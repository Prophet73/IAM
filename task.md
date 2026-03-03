Задача: Добавить премиальные UI-паттерны в основное портфолио (Text Blur Reveal, Infinite Marquee, Bento Grid), не затрагивая код демонстрационных компонентов (в папке sminex и других демках).

Выполни следующие шаги:

1. Добавь анимации в `src/index.css`
В конец файла добавь следующие стили:

```css
/* ── Text Blur Reveal ── */
@keyframes blurFadeIn {
  0% { opacity: 0; filter: blur(12px); transform: translateY(12px); }
  100% { opacity: 1; filter: blur(0); transform: translateY(0); }
}

.animate-blur-fade {
  opacity: 0;
  animation: blurFadeIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.delay-100 { animation-delay: 100ms; }
.delay-200 { animation-delay: 200ms; }
.delay-300 { animation-delay: 300ms; }

/* ── Infinite Marquee ── */
@keyframes marquee {
  0% { transform: translateX(0%); }
  100% { transform: translateX(-50%); }
}

.animate-marquee {
  animation: marquee 35s linear infinite;
  width: max-content;
}
Внедри Text Blur Reveal в секции Hero в src/App.tsx
Найди компонент Hero и обнови классы анимаций в левой колонке:
У контейнера с бейджем, заголовком и текстом убери animate-[fadeIn...] и добавь animate-blur-fade.
Разнеси delay: бейджу дай класс animate-blur-fade, заголовку <h1> дай animate-blur-fade delay-100, абзацу <p> дай animate-blur-fade delay-200, блоку с кнопками дай animate-blur-fade delay-300.
Добавь Infinite Marquee под Hero в src/App.tsx
Создай новый компонент TechMarquee вне Hero (или прямо под блоком статистики внутри Hero):
code
Tsx
function TechMarquee() {
  const TECH_STACK =['Python', 'FastAPI', 'React 19', 'TypeScript', 'PostgreSQL', 'Redis', 'Celery', 'WhisperX', 'pyannote', 'Ollama', 'Gemini API', 'Docker', 'Tailwind v4', 'Agentic Workflow'];
  const doubledStack = [...TECH_STACK, ...TECH_STACK]; // Для бесшовного лупа

  return (
    <div className="w-full overflow-hidden border-y border-white/5 bg-white/[0.01] py-5 mt-16 backdrop-blur-sm animate-blur-fade delay-300">
      <div className="flex animate-marquee hover:[animation-play-state:paused]">
        {doubledStack.map((tech, i) => (
          <div key={i} className="flex items-center justify-center px-8 shrink-0">
            <span className="text-xs font-semibold text-muted uppercase tracking-widest">{tech}</span>
            <span className="ml-16 w-1.5 h-1.5 rounded-full bg-accent/30" />
          </div>
        ))}
      </div>
    </div>
  )
}
Вызови <TechMarquee /> в самом низу компонента Hero (после закрывающего дива max-w-[1080px]), чтобы полоса шла на всю ширину экрана.
Сделай Bento Grid в секции Research в src/App.tsx
Найди компонент Research, где выводится items.map. Измени контейнер и логику вывода карточек, чтобы получилась асимметричная сетка:
Замени grid-cols-1 sm:grid-cols-2 на grid-cols-1 md:grid-cols-4 auto-rows-[minmax(180px,auto)].
При маппинге items назначай spanClass в зависимости от индекса (i):
i === 0 (LLM): md:col-span-2 md:row-span-2
i === 1 (Speech & NLP): md:col-span-2 md:row-span-1
i === 2 (Аспирантура): md:col-span-1 md:row-span-1
i === 3 (AI-ассистированная разработка): md:col-span-1 md:row-span-1
Добавь класс flex flex-col к карточкам внутри маппинга, чтобы контент растягивался. Сделай заголовок первой карточки чуть крупнее (text-lg), чем у остальных.
Сохрани изменения и убедись в отсутствии синтаксических ошибок.