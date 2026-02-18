import { useState } from 'react'

interface CodeSnippet {
  id: string
  label: string
  product: string
  productColor: string
  file: string
  description: string
  code: string
}

const snippets: CodeSnippet[] = [
  {
    id: 'oauth',
    label: 'OAuth2 Access Control',
    product: 'AI-Hub',
    productColor: 'bg-accent-soft text-accent',
    file: 'backend/src/services/oauth_service.py',
    description: 'Многоуровневая проверка доступа: публичность → департамент → прямой доступ → групповой доступ → legacy fallback',
    code: `@staticmethod
async def check_user_access(
    db: AsyncSession,
    user: User,
    application: Application,
) -> bool:
    """
    Check if user has access to the application.

    Access is granted if:
    1. Application is public (is_public=True), OR
    2. User's department is in allowed_departments (if set), OR
    3. User has direct ApplicationAccess, OR
    4. User is member of a group with ApplicationAccess
    """
    # 1. Public apps are accessible to everyone
    if application.is_public:
        return True

    # 2. Check department restrictions (if allowed_departments is set)
    allowed_departments = application.allowed_departments or []
    if allowed_departments:
        user_department = user.department or ""
        if user_department in allowed_departments:
            return True

    # 3. Check direct user access
    direct_access = await db.execute(
        select(ApplicationAccess).where(
            ApplicationAccess.user_id == user.id,
            ApplicationAccess.application_id == application.id
        )
    )
    if direct_access.scalar_one_or_none():
        return True

    # 4. Check group access
    from ..models.user_group import user_group_members
    user_groups = await db.execute(
        select(user_group_members.c.group_id).where(
            user_group_members.c.user_id == user.id
        )
    )
    group_ids = [row[0] for row in user_groups.fetchall()]

    if group_ids:
        group_access = await db.execute(
            select(ApplicationAccess).where(
                ApplicationAccess.group_id.in_(group_ids),
                ApplicationAccess.application_id == application.id
            )
        )
        if group_access.scalar_one_or_none():
            return True

    # 5. Legacy: if no rules defined, open to all authenticated
    if not allowed_departments:
        any_access_rules = await db.execute(
            select(ApplicationAccess).where(
                ApplicationAccess.application_id == application.id
            ).limit(1)
        )
        if not any_access_rules.scalar_one_or_none():
            return True

    return False`,
  },
  {
    id: 'streaming',
    label: 'Streaming Chat + Async',
    product: 'AI-Hub',
    productColor: 'bg-accent-soft text-accent',
    file: 'backend/src/api/chat.py',
    description: 'SSE-стриминг через thread pool для sync SDK, неблокирующее сохранение в БД, подсчёт токенов',
    code: `async def generate() -> AsyncGenerator[str, None]:
    try:
        # Run sync SDK in thread pool to avoid blocking
        response_text, input_tokens, output_tokens = await asyncio.to_thread(
            sync_generate_content,
            model_name,
            contents,
            chat_settings.system_prompt,
            chat_settings.max_tokens
        )

        # Stream response in small JSON-encoded chunks
        chunk_size = 12
        for i in range(0, len(response_text), chunk_size):
            chunk = response_text[i:i + chunk_size]
            yield f"data: {json.dumps(chunk)}\\n\\n"
            await asyncio.sleep(0.015)

        yield f"event: done\\ndata: {session_id}\\n\\n"

        # Save assistant message — new session to avoid blocking stream
        from ..db.base import AsyncSessionLocal
        async with AsyncSessionLocal() as new_db:
            assistant_message = ChatMessage(
                user_id=current_user.id,
                session_id=session_id,
                role="assistant",
                content=response_text,
                model_name=model_name,
                input_tokens=input_tokens,
                output_tokens=output_tokens
            )
            new_db.add(assistant_message)
            await new_db.commit()

    except Exception as e:
        error_msg = str(e)
        logger.error(f"Gemini error (model={model_name}): {error_msg}")
        yield f"event: error\\ndata: {error_msg}\\n\\n"

return StreamingResponse(
    generate(),
    media_type="text/event-stream",
    headers={
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Session-Id": str(session_id),
    }
)`,
  },
  {
    id: 'gemini',
    label: 'AI-классификация (Gemini)',
    product: 'CostManager',
    productColor: 'bg-green-soft text-green',
    file: 'gemini_autoclassifier_routes.py',
    description: 'Chain-of-Thought промпт с few-shot примерами, structured JSON output, confidence scoring',
    code: `# УЛУЧШЕННЫЙ ПРОМПТ С FEW-SHOT И CoT
prompt = f"""Ты — эксперт по классификации строительных работ.
Всегда углубляйся до максимальной глубины.

**РАБОТА:** "{smet_name}"
**ТЕКУЩИЙ ПУТЬ:** {breadcrumb_str}

**ДОСТУПНЫЕ КАТЕГОРИИ:**
{context_list_str}

**КРИТИЧЕСКИ ВАЖНЫЕ ПРАВИЛА:**
1. Всегда выбирай наиболее конкретную категорию
2. STOP_HERE ТОЛЬКО если работа охватывает 3+ разные системы
3. UNCERTAIN только если уверенность <70%
4. ОБЯЗАТЕЛЬНЫЕ СООТВЕТСТВИЯ:
   - "водоснабжение" → "Хозяйственно-питьевой водопровод"
   - "хоз-бытовая канализация" → "Бытовая канализация"
   - "отопление" → "Отопление"
   - "вентиляция" → "Вентиляция общеобменная"

**ПРИМЕРЫ:**
- "Комплекс работ по монтажу систем вентиляции"
  → 8.2.2 (Вентиляция общеобменная), ключевое 'вентиляция'
- "Комплекс работ по монтажу теплового пункта"
  → 8.2.6 (Тепловые пункты), не STOP
- "водоснабжение, канализация, отопление"
  → STOP_HERE (3+ разные системы)

**ШАГ-ЗА-ШАГОМ:**
1. Выдели ключевые слова из работы
2. Сопоставь с именами категорий
3. Выбери самую конкретную
4. Оцени уверенность 0-1

Ответ: JSON {{"code": "код", "reason": "объяснение",
              "confidence": 0.9}}"""`,
  },
  {
    id: 'stats',
    label: 'P10/P90 аналитика',
    product: 'CostManager',
    productColor: 'bg-green-soft text-green',
    file: 'analogs_routes.py',
    description: 'Статистический анализ: перцентили, выбросы, медиана, стандартное отклонение через numpy',
    code: `def process_tree_for_stats(node_list):
    node_list.sort(key=lambda x: natural_sort_key(x['code']))
    for node in node_list:
        for metric in all_metrics_for_stats:
            ids_for_stats = [
                c_id for c_id in columns_info
                if c_id != reference_entity_col_id
            ]
            values = np.array([
                float(comparison_data[c_id]
                      .get(node['id'], {})
                      .get(metric, 0))
                for c_id in ids_for_stats
                if comparison_data[c_id]
                   .get(node['id'], {})
                   .get(metric) is not None
            ])
            non_zero_values = values[values != 0]
            stats_dict = {
                'avg': 0, 'min': 0, 'max': 0,
                'median': 0, 'p10': 0, 'p90': 0,
                'std': 0, 'count': 0, 'avg_no_outliers': 0
            }
            if len(non_zero_values) > 0:
                p10 = np.percentile(non_zero_values, 10)
                p90 = np.percentile(non_zero_values, 90)
                # Фильтрация выбросов по P10/P90
                values_no_outliers = non_zero_values[
                    (non_zero_values >= p10) &
                    (non_zero_values <= p90)
                ]
                stats_dict.update({
                    'avg': np.mean(non_zero_values),
                    'min': np.min(non_zero_values),
                    'max': np.max(non_zero_values),
                    'median': np.median(non_zero_values),
                    'p10': p10, 'p90': p90,
                    'std': np.std(non_zero_values),
                    'count': len(non_zero_values),
                    'avg_no_outliers': (
                        np.mean(values_no_outliers)
                        if len(values_no_outliers) > 0
                        else 0
                    )
                })
            statistics[node['id']][metric] = stats_dict`,
  },
  {
    id: 'excel',
    label: 'Excel-отчёты',
    product: 'CostManager',
    productColor: 'bg-green-soft text-green',
    file: 'analogs_routes.py',
    description: 'Генерация профессиональных отчётов: цветовые схемы, мульти-листы, форматирование, титульные страницы',
    code: `def _generate_comparison_excel(
    columns_info, categories_structure,
    comparison_data, statistics,
    reference_entity_col_id, target_date
):
    output = io.BytesIO()
    workbook = xlsxwriter.Workbook(
        output, {'in_memory': True, 'strings_to_numbers': True}
    )

    # Пастельная палитра для аналогов + зелёный для эталона
    pastel_colors = ['#FDE9D9', '#DEEAF6', '#FFF2CC', '#EAECEE']
    darker_shades_map = {
        '#E2EFDA': '#C5E0B4',  # Зеленый (Эталон)
        '#FDE9D9': '#F8CBAC',  # Оранжевый
        '#DEEAF6': '#BDD7EE',  # Синий
        '#FFF2CC': '#FFE699',  # Золотой
    }

    # Форматы: условное форматирование отклонений
    f = {
        'pct_dev_high': workbook.add_format({
            'font_color': '#9C0006',
            'bg_color': '#FFC7CE',
            'num_format': '0.0%'
        }),
        'pct_dev_low': workbook.add_format({
            'font_color': '#006100',
            'bg_color': '#D5F5E3',
            'num_format': '0.0%'
        }),
        'rub_c': workbook.add_format({
            'border': 1,
            'num_format': '#,##0.00',
            'align': 'center'
        }),
    }

    # Цветовая карта: эталон = зелёный, аналоги = пастельные
    col_color_map = {}
    color_index = 0
    for col_id in sorted_col_ids:
        if col_id == reference_entity_col_id:
            col_color_map[col_id] = {
                'light': '#E2EFDA', 'dark': '#C5E0B4'
            }
        else:
            base = pastel_colors[color_index % len(pastel_colors)]
            col_color_map[col_id] = {
                'light': base,
                'dark': darker_shades_map[base]
            }
            color_index += 1

    # Титульный лист
    ws_title = workbook.add_worksheet("Титульный лист")
    ws_title.merge_range(
        'B2:C2',
        'Сравнительный анализ стоимостных показателей',
        f['h_title']
    )`,
  },
  {
    id: 'ratelimit',
    label: 'Rate Limiting Middleware',
    product: 'AI-Hub',
    productColor: 'bg-accent-soft text-accent',
    file: 'backend/src/core/rate_limit.py',
    description: 'Path-aware rate limiting со sliding windows, X-Forwarded-For, автоочистка памяти',
    code: `class RateLimitMiddleware(BaseHTTPMiddleware):
    """In-memory rate limiting with path-based limits."""

    def __init__(self, app):
        super().__init__(app)
        self.requests: Dict[str, Dict[str, Tuple[int, float]]] = (
            defaultdict(dict)
        )
        # Rate limits: (max_requests, window_seconds)
        self.limits = {
            '/auth/': (50, 60),
            '/oauth/token': (30, 60),
            '/api/admin/': (100, 60),
            'default': (200, 60),
        }

    def _get_client_ip(self, request: Request) -> str:
        forwarded = request.headers.get('X-Forwarded-For')
        if forwarded:
            return forwarded.split(',')[0].strip()
        return request.client.host if request.client else 'unknown'

    def _check_rate_limit(
        self, client_ip: str, limit_key: str
    ) -> Tuple[bool, int]:
        max_requests, window_seconds = self.limits[limit_key]
        now = time.time()

        if limit_key not in self.requests[client_ip]:
            self.requests[client_ip][limit_key] = (1, now)
            return True, 0

        count, window_start = self.requests[client_ip][limit_key]

        if now - window_start > window_seconds:
            self.requests[client_ip][limit_key] = (1, now)
            return True, 0

        if count < max_requests:
            self.requests[client_ip][limit_key] = (
                count + 1, window_start
            )
            return True, 0

        retry_after = int(
            window_seconds - (now - window_start)
        ) + 1
        return False, retry_after

    def _cleanup_old_entries(self):
        """Prevent memory growth — remove expired entries."""
        now = time.time()
        max_window = max(l[1] for l in self.limits.values())
        for ip in list(self.requests.keys()):
            for key in list(self.requests[ip].keys()):
                _, start = self.requests[ip][key]
                if now - start > max_window * 2:
                    del self.requests[ip][key]
            if not self.requests[ip]:
                del self.requests[ip]`,
  },
]

export function CodeShowcase() {
  const [activeId, setActiveId] = useState(snippets[0].id)
  const active = snippets.find((s) => s.id === activeId)!

  return (
    <section id="code" className="py-16">
      <div className="max-w-[1080px] mx-auto px-8">
        <div className="mb-10">
          <div className="inline-block px-3 py-1 rounded text-[0.7rem] font-bold tracking-wider uppercase mb-3 bg-red-soft text-red">
            Исходный код
          </div>
          <h2 className="text-2xl font-bold mb-2">Фрагменты production-кода</h2>
          <p className="text-muted text-[0.92rem] max-w-[620px]">
            Реальный код из рабочих проектов. FastAPI async, SQLAlchemy, Gemini API, numpy, xlsxwriter.
          </p>
        </div>

        {/* Tab buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {snippets.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveId(s.id)}
              className={`px-3 py-1.5 rounded-lg text-[0.78rem] font-medium border transition-all cursor-pointer ${
                activeId === s.id
                  ? 'bg-accent/15 border-accent/40 text-accent'
                  : 'bg-surface border-border text-muted hover:border-accent/20 hover:text-text-primary'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Code display */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="px-5 py-3 border-b border-border flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded text-[0.66rem] font-bold ${active.productColor}`}>
                {active.product}
              </span>
              <span className="text-[0.8rem] font-semibold">{active.label}</span>
            </div>
            <span className="text-[0.72rem] text-muted font-mono">{active.file}</span>
          </div>

          {/* Description */}
          <div className="px-5 py-2.5 border-b border-border bg-surface-2">
            <p className="text-[0.78rem] text-muted">{active.description}</p>
          </div>

          {/* Code block */}
          <div className="overflow-x-auto">
            <pre className="p-5 text-[0.75rem] leading-relaxed font-mono text-text-primary/90">
              <code>{active.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  )
}
