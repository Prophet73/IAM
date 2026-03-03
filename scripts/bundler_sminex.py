"""
Sminex Demo — Code Bundler
Собирает только файлы, относящиеся к /sminex демо, в один текстовый файл.
"""

import os
import subprocess
from pathlib import Path
from datetime import datetime
from typing import List

# --- НАСТРОЙКИ ---
PROJECT_ROOT = Path(__file__).parent.parent.absolute()
OUTPUT_DIR = PROJECT_ROOT / "scripts" / "bundles"
OUTPUT_FILENAME = f"sminex_bundle_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"

# Файлы/директории, которые относятся к Sminex
SMINEX_PATHS = [
    "src/components/sminex",   # Все компоненты
    "src/pages/SminexDemo.tsx", # Главная страница
    "src/data/sminex.ts",       # Данные
]

# Дополнительные файлы контекста (конфиг проекта)
CONTEXT_FILES = [
    "CLAUDE.md",
    "package.json",
    "tsconfig.json",
    "src/index.css",            # Тема Tailwind
]

ALLOWED_EXTENSIONS = {
    ".ts", ".tsx", ".css", ".json", ".md",
}

MAX_FILE_SIZE = 2 * 1024 * 1024  # 2 MB


def collect_sminex_files() -> List[Path]:
    """Собирает все файлы Sminex по заданным путям."""
    files: List[Path] = []

    for rel_path in SMINEX_PATHS:
        full = PROJECT_ROOT / rel_path
        if full.is_file():
            files.append(full)
        elif full.is_dir():
            for fp in sorted(full.rglob("*")):
                if fp.is_file() and fp.suffix.lower() in ALLOWED_EXTENSIONS:
                    files.append(fp)

    for rel_path in CONTEXT_FILES:
        full = PROJECT_ROOT / rel_path
        if full.is_file():
            files.append(full)

    # Дедупликация с сохранением порядка
    seen = set()
    unique: List[Path] = []
    for fp in files:
        if fp not in seen:
            seen.add(fp)
            unique.append(fp)

    return unique


def should_include(fp: Path) -> bool:
    try:
        if fp.stat().st_size > MAX_FILE_SIZE:
            return False
    except OSError:
        return False
    return True


def create_bundle():
    print("=" * 80)
    print("Sminex Demo — Code Bundler")
    print("=" * 80)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUTPUT_DIR / OUTPUT_FILENAME

    print("\n[*] Собираю файлы Sminex...")
    all_files = collect_sminex_files()
    included = [f for f in all_files if should_include(f)]

    print(f"    Найдено: {len(included)} файлов")

    if not included:
        print("[!] Нет файлов для обработки.")
        return

    # Сортировка: контекст сверху, потом data, потом pages, потом components
    def sort_key(fp: Path) -> tuple:
        rel = str(fp.relative_to(PROJECT_ROOT))
        if rel in [p.replace("/", os.sep) for p in CONTEXT_FILES] or rel in CONTEXT_FILES:
            return (0, rel)
        if "data" in rel:
            return (1, rel)
        if "pages" in rel:
            return (2, rel)
        return (3, rel)

    included.sort(key=sort_key)

    print(f"\n[*] Записываю bundle: {out_path.name}")

    with open(out_path, "w", encoding="utf-8") as out:
        # Шапка
        out.write("=" * 100 + "\n")
        out.write("SMINEX DEMO — CODE BUNDLE\n")
        out.write("=" * 100 + "\n")
        out.write(f"Generated : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        out.write(f"Root      : {PROJECT_ROOT}\n")
        out.write(f"Files     : {len(included)}\n")
        out.write("=" * 100 + "\n\n")

        # Оглавление
        out.write("TABLE OF CONTENTS\n")
        out.write("-" * 100 + "\n")
        for i, fp in enumerate(included, 1):
            rel = fp.relative_to(PROJECT_ROOT)
            size_kb = fp.stat().st_size / 1024
            out.write(f"  {i:3d}. {rel}  ({size_kb:.1f} KB)\n")
        out.write("\n" + "=" * 100 + "\n\n")

        # Файлы
        current_dir = None
        for i, fp in enumerate(included, 1):
            rel = str(fp.relative_to(PROJECT_ROOT))
            file_dir = str(fp.parent.relative_to(PROJECT_ROOT))

            # Заголовок директории
            if file_dir != current_dir:
                current_dir = file_dir
                out.write("\n" + "#" * 100 + "\n")
                out.write(f"# DIR: {file_dir}\n")
                out.write("#" * 100 + "\n\n")

            # Заголовок файла
            out.write("=" * 100 + "\n")
            out.write(f"FILE [{i}/{len(included)}]: {rel}\n")
            out.write(f"Size: {fp.stat().st_size:,} bytes\n")
            out.write("=" * 100 + "\n\n")

            # Содержимое
            try:
                content = fp.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                try:
                    content = "[WARNING: latin-1]\n\n" + fp.read_text(encoding="latin-1")
                except Exception as e:
                    content = f"[ERROR reading file: {e}]"
            except Exception as e:
                content = f"[ERROR: {e}]"

            out.write(content)
            if content and not content.endswith('\n'):
                out.write('\n')

            out.write("\n" + "=" * 100 + "\n")
            out.write(f"END: {rel}\n")
            out.write("=" * 100 + "\n\n")

        # Футер
        out.write("=" * 100 + "\n")
        out.write("END OF BUNDLE\n")
        out.write(f"Files: {len(included)}\n")
        out.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        out.write("=" * 100 + "\n")

    size_kb = out_path.stat().st_size / 1024
    size_mb = size_kb / 1024

    print("\n" + "=" * 80)
    print("[+] Готово!")
    print(f"    Файл : {out_path}")
    print(f"    Размер: {f'{size_mb:.2f} MB' if size_mb >= 1 else f'{size_kb:.1f} KB'}")
    print(f"    Файлов: {len(included)}")
    print("=" * 80)


if __name__ == "__main__":
    create_bundle()
