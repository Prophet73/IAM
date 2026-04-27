"""
IAM Portfolio - CV PDF builder
1-page A4 ATS-friendly resume in Russian, generated from portfolio data.
Output: public/cv-khromenok.pdf
"""

from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

PROJECT_ROOT = Path(__file__).parent.parent.absolute()
OUT = PROJECT_ROOT / "public" / "cv-khromenok.pdf"

# --- Fonts (Arial — supports Cyrillic, ATS-safe) ---
pdfmetrics.registerFont(TTFont("Arial",      "C:/Windows/Fonts/arial.ttf"))
pdfmetrics.registerFont(TTFont("Arial-Bold", "C:/Windows/Fonts/arialbd.ttf"))
pdfmetrics.registerFont(TTFont("Arial-It",   "C:/Windows/Fonts/ariali.ttf"))

# --- Colors ---
INK   = HexColor("#0e1118")
MUTED = HexColor("#5d6470")
RULE  = HexColor("#cdd2da")
ACC   = HexColor("#1e3a6e")  # blueprint blue accent

# --- Page geometry ---
W, H = A4
MARGIN_X = 18 * mm
MARGIN_Y = 16 * mm

c = canvas.Canvas(str(OUT), pagesize=A4)
c.setTitle("Никита Хроменок — Резюме")
c.setAuthor("Никита Хроменок")
c.setSubject("PropTech R&D & Product AI-Engineer")

y = H - MARGIN_Y


def set_font(name, size):
    c.setFont(name, size)


def text(x, y, s, color=INK):
    c.setFillColor(color)
    c.drawString(x, y, s)


def text_right(x, y, s, color=INK):
    c.setFillColor(color)
    c.drawRightString(x, y, s)


def hr(yy, color=RULE):
    c.setStrokeColor(color)
    c.setLineWidth(0.4)
    c.line(MARGIN_X, yy, W - MARGIN_X, yy)


def wrap(text, max_chars):
    """Crude word-wrap for fixed monospace assumption."""
    words = text.split()
    line, lines = "", []
    for w in words:
        if len(line) + len(w) + 1 > max_chars:
            lines.append(line.strip())
            line = w + " "
        else:
            line += w + " "
    if line:
        lines.append(line.strip())
    return lines


def section(title, yy):
    set_font("Arial-Bold", 8.5)
    c.setFillColor(ACC)
    c.drawString(MARGIN_X, yy, title.upper())
    # underline rule below the heading
    c.setStrokeColor(ACC)
    c.setLineWidth(0.6)
    c.line(MARGIN_X, yy - 2.5, MARGIN_X + 18, yy - 2.5)
    return yy - 6 * mm


# ── HEADER ─────────────────────────────────────────────────────────────────
set_font("Arial-Bold", 22)
text(MARGIN_X, y, "Никита Хроменок")
y -= 6 * mm
set_font("Arial", 10.5)
text(MARGIN_X, y, "PropTech R&D & Product AI-Engineer", color=ACC)
y -= 4.5 * mm
set_font("Arial", 9)
text(MARGIN_X, y,
     "KhromenokNV@mail.ru  ·  +7 926 897-32-25  ·  t.me/nickkhromenok  ·  Москва",
     color=MUTED)
y -= 5 * mm
hr(y)
y -= 5 * mm

# ── SUMMARY ────────────────────────────────────────────────────────────────
set_font("Arial", 9.5)
c.setFillColor(INK)
summary_lines = [
    "Полный цикл от снятия требований до деплоя: от исполнителя процесса → прототип за 2–4 недели →",
    "корпоративный контур с SSO, ролями и аудитом. 7+ лет в строительной отрасли + 1.5 года full-stack",
    "AI-разработки. 4 продукта в production, ~10 R&D-прототипов на едином инфраструктурном ядре.",
]
for line in summary_lines:
    text(MARGIN_X, y, line)
    y -= 4 * mm
y -= 2 * mm

# ── KEY FACTS (4 stat columns) ─────────────────────────────────────────────
y -= 1 * mm
set_font("Arial-Bold", 13)
c.setFillColor(ACC)
# Compute equal columns
col_w = (W - 2 * MARGIN_X) / 4
stats = [
    ("4",     "продукта в production"),
    ("~10",   "R&D-прототипов"),
    ("1.5",   "года full-stack AI-разработки"),
    ("7+",    "лет в строительной отрасли"),
]
for i, (val, label) in enumerate(stats):
    cx = MARGIN_X + i * col_w
    set_font("Arial-Bold", 13)
    c.setFillColor(ACC)
    c.drawString(cx, y, val)
    set_font("Arial", 7.6)
    c.setFillColor(MUTED)
    c.drawString(cx, y - 4 * mm, label)
y -= 9 * mm

# ── EXPERIENCE ─────────────────────────────────────────────────────────────
y = section("Опыт работы", y)

experience = [
    ("2024 — н.в.", "Департамент цифровой трансформации, Severin Development",
     "AI-продукты для строительной отрасли. Полный цикл R&D — от снятия требований до production. "
     "4 продукта в production, ~10 R&D-прототипов. Корпоративный контур: SSO/ADFS, RBAC, аудит."),
    ("2024",        "Руководитель группы СК / Департамент качества, Severin Development",
     "Координация 20+ инженеров. Внутренние регламенты, шаблоны для проектных команд."),
    ("2021 — 2024", "Инженер → ведущий инженер СК, Severin Development",
     "ЖК FORIVER (InGrad/Sminex) — 11 корпусов, 3 года на объекте, получение ЗОС."),
    ("2020 — 2021", "Инженер строительного контроля, ТСК-ТИТУЛ",
     "Приёмка работ, проверка КС-2, накопительные ведомости. ЖК Discovery (MR Group), Савёловский-сити."),
    ("2018 — 2020", "Строительно-технический эксперт, Судебная экспертиза",
     "Финансово-технический аудит. АО АККУЮ НУКЛЕАР, ВЦ «Павловопосадские платки»."),
    ("2016 — 2017", "Инженер ПТО, МГСУ • Парк Зарядье",
     "Исполнительная документация, фасады и благоустройство."),
]
for date, role, desc in experience:
    set_font("Arial-Bold", 8.5)
    c.setFillColor(MUTED)
    c.drawString(MARGIN_X, y, date)
    set_font("Arial-Bold", 9.5)
    c.setFillColor(INK)
    c.drawString(MARGIN_X + 28 * mm, y, role)
    y -= 3.7 * mm
    set_font("Arial", 8.6)
    c.setFillColor(MUTED)
    # crude word-wrap
    words = desc.split()
    line, lines = "", []
    max_chars = 100
    for w in words:
        if len(line) + len(w) + 1 > max_chars:
            lines.append(line.strip())
            line = w + " "
        else:
            line += w + " "
    if line:
        lines.append(line.strip())
    for ln in lines:
        c.drawString(MARGIN_X + 28 * mm, y, ln)
        y -= 3.5 * mm
    y -= 1.5 * mm

y -= 1 * mm

# ── PRODUCTS ───────────────────────────────────────────────────────────────
y = section("Продукты в production", y)

products = [
    ("AI-Hub",       "Корпоративная AI-экосистема: SSO-вход, AI-ассистент с каталогом моделей, RBAC по ролям × отделам, аудит."),
    ("Автопротокол", "ML-протоколирование совещаний (WhisperX + pyannote + Gemini). 5+ отраслевых доменов, GPU/CPU-очереди (Celery)."),
    ("Scanner",      "AI-поиск по строительным нормам + конструктор предписаний по фото. 14 933 пункта СП/ГОСТ, 90.9% точность на 88 кейсах, 0% галлюцинаций."),
    ("CostManager",  "Анализ строительных смет по базе реализованных проектов. Дефлирование цен, 14 разделов работ, Excel-отчёт с подсветкой отклонений."),
    ("Puls",         "Прототип платформы технического заказчика: 5 ролей со своими интерфейсами, связка договор → штатка → табель, портфельная аналитика."),
]
for name, desc in products:
    set_font("Arial-Bold", 9)
    c.setFillColor(INK)
    c.drawString(MARGIN_X, y, name)
    set_font("Arial", 8.6)
    c.setFillColor(MUTED)
    desc_lines = wrap(desc, 95)
    for i, line in enumerate(desc_lines):
        c.drawString(MARGIN_X + 26 * mm, y - i * 3.5 * mm, line)
    y -= max(4 * mm, len(desc_lines) * 3.5 * mm + 0.5 * mm)
y -= 1 * mm

# ── STACK ──────────────────────────────────────────────────────────────────
y = section("Стек и компетенции", y)

stack_groups = [
    ("LLM & AI-агенты",    "Gemini, Claude, GPT, Grok, DeepSeek, Ollama (Gemma, Qwen), MCP Protocol, Structured Output, Agentic Workflows"),
    ("RAG / Retrieval",    "RRF fusion across vec / BM25 / vocab / tags, multi-query decompose, "
                           "async concurrent retrieval, umbrella-rules, LLM-reranker, pgvector"),
    ("Speech & Audio",     "WhisperX, pyannote 3.1, wav2vec2, Silero VAD, FFmpeg, PyTorch + CUDA/GPU"),
    ("Backend",            "Python, FastAPI async, SQLAlchemy 2.0, Alembic, PostgreSQL 16, Pydantic, "
                           "Celery + Redis, WebSocket, NumPy, OAuth2/OIDC, ADFS, JWT"),
    ("Frontend",           "React 19, TypeScript, Tailwind v4, Vite, TanStack Query, Zustand, Recharts"),
    ("Infrastructure",     "Docker, Nginx"),
    ("Dev workflow",       "Claude Code — основной инструмент разработки"),
]
for label, items in stack_groups:
    set_font("Arial-Bold", 8.6)
    c.setFillColor(INK)
    c.drawString(MARGIN_X, y, label + ":")
    set_font("Arial", 8.6)
    c.setFillColor(MUTED)
    items_lines = wrap(items, 92)
    for i, line in enumerate(items_lines):
        c.drawString(MARGIN_X + 38 * mm, y - i * 3.5 * mm, line)
    y -= max(4 * mm, len(items_lines) * 3.5 * mm + 0.5 * mm)
y -= 1 * mm

# ── EDUCATION ──────────────────────────────────────────────────────────────
y = section("Образование", y)

edu = [
    ("2021 — 2025", "Аспирантура, ЭБСиГХ (исследователь)", "НИУ МГСУ"),
    ("2018 — 2020", "Магистратура, ПГС",   "НИУ МГСУ"),
    ("2014 — 2018", "Бакалавриат, ПГС",    "НИУ МГСУ"),
]
for date, degree, place in edu:
    set_font("Arial-Bold", 8.5)
    c.setFillColor(MUTED)
    c.drawString(MARGIN_X, y, date)
    set_font("Arial-Bold", 9)
    c.setFillColor(INK)
    c.drawString(MARGIN_X + 28 * mm, y, degree)
    set_font("Arial", 8.6)
    c.setFillColor(MUTED)
    c.drawString(MARGIN_X + 78 * mm, y, place)
    y -= 4 * mm

c.save()
print(f"[+] Готово: {OUT}")
print(f"    Размер: {OUT.stat().st_size / 1024:.1f} KB")
