"""
IAM Portfolio - Code Bundler
Собирает кодовую базу в один текстовый файл для анализа / передачи в LLM.
Использует git для определения tracked файлов, игнорирует мусор.
"""

import os
import subprocess
from pathlib import Path
from datetime import datetime
from typing import List

# --- НАСТРОЙКИ ---
PROJECT_ROOT = Path(__file__).parent.parent.absolute()
OUTPUT_DIR = PROJECT_ROOT / "scripts" / "bundles"
OUTPUT_FILENAME = f"iam_bundle_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"

ALLOWED_EXTENSIONS = {
    ".ts", ".tsx",      # TypeScript / React
    ".js", ".jsx",      # JavaScript
    ".css", ".scss",    # Стили
    ".html",            # HTML
    ".json",            # package.json, tsconfig, etc.
    ".md",              # Документация
    ".yml", ".yaml",    # CI/CD конфиги
    ".sh",              # Shell скрипты
    ".py",              # Python скрипты (bundler сам себя)
    ".gitignore",
    ".editorconfig",
}

ALLOWED_FILENAMES = {
    "CLAUDE.md",
    ".env.example",
    "Makefile",
}

IGNORED_DIR_NAMES = {
    "node_modules",
    "dist",
    "build",
    ".git",
    ".vscode",
    ".idea",
    "__pycache__",
    "bundles",          # Сам аутпут бандлера
    "coverage",
    ".playwright-mcp",
}

IGNORED_FILENAMES = {
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "bun.lock",
    "bun.lockb",
}

IGNORED_FILE_PATTERNS = {
    ".log",
    ".env",
    ".DS_Store",
    "Thumbs.db",
    ".min.js",
    ".min.css",
    ".map",             # Source maps — мусор
    ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".ico", ".webp",
    ".svg",             # SVG можно включить если нужно, пока исключаем
    ".woff", ".woff2", ".ttf", ".eot",
    ".zip", ".tar", ".gz",
}

MAX_FILE_SIZE = 2 * 1024 * 1024  # 2 MB


def get_git_tracked_files(include_untracked: bool = True) -> List[Path]:
    files = []

    try:
        result = subprocess.run(
            ["git", "ls-files"],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True,
            check=True
        )
        for line in result.stdout.strip().split('\n'):
            if line:
                fp = PROJECT_ROOT / line
                if fp.exists() and fp.is_file():
                    files.append(fp)

        print(f"    Tracked файлов: {len(files)}")

        if include_untracked:
            result = subprocess.run(
                ["git", "ls-files", "--others", "--exclude-standard"],
                cwd=PROJECT_ROOT,
                capture_output=True,
                text=True,
                check=True
            )
            untracked = 0
            for line in result.stdout.strip().split('\n'):
                if line:
                    fp = PROJECT_ROOT / line
                    if fp.exists() and fp.is_file():
                        files.append(fp)
                        untracked += 1
            print(f"    Untracked файлов: {untracked}")

        return files

    except subprocess.CalledProcessError:
        print("  [!] Git не доступен или не инициализирован.")
        return []
    except FileNotFoundError:
        print("  [!] Git не установлен.")
        return []


def should_include(fp: Path) -> bool:
    try:
        if fp.stat().st_size > MAX_FILE_SIZE:
            return False
    except OSError:
        return False

    if fp.name in IGNORED_FILENAMES:
        return False

    name_lower = fp.name.lower()
    suffix_lower = fp.suffix.lower()

    for pattern in IGNORED_FILE_PATTERNS:
        if suffix_lower == pattern or name_lower.endswith(pattern):
            return False

    for part in fp.parts:
        if part in IGNORED_DIR_NAMES:
            return False

    if fp.name in ALLOWED_FILENAMES:
        return True

    if suffix_lower in ALLOWED_EXTENSIONS:
        return True

    return False


def create_bundle(include_untracked: bool = True, verbose: bool = False):
    print("=" * 80)
    print("IAM Portfolio - Code Bundler")
    print("=" * 80)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUTPUT_DIR / OUTPUT_FILENAME

    print("\n[*] Получаю список файлов из git...")
    all_files = get_git_tracked_files(include_untracked=include_untracked)
    if not all_files:
        print("[!] Нет файлов для обработки.")
        return

    print(f"    Всего найдено: {len(all_files)}")

    print("\n[*] Фильтрую...")
    included = [f for f in all_files if should_include(f)]
    excluded = [f for f in all_files if not should_include(f)]

    print(f"    В bundle: {len(included)}")
    print(f"    Исключено: {len(excluded)}")

    if verbose:
        print("\n    Исключённые файлы:")
        for f in excluded[:20]:
            try:
                print(f"      - {f.relative_to(PROJECT_ROOT)}")
            except ValueError:
                print(f"      - {f}")
        if len(excluded) > 20:
            print(f"      ... и ещё {len(excluded) - 20}")

    # Сортировка: сначала корень, потом по директориям
    included.sort(key=lambda x: (str(x.parent), x.name))

    print(f"\n[*] Записываю bundle: {out_path.name}")

    with open(out_path, "w", encoding="utf-8") as out:
        # Шапка
        out.write("=" * 100 + "\n")
        out.write("IAM PORTFOLIO — CODE BUNDLE\n")
        out.write("=" * 100 + "\n")
        out.write(f"Generated : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        out.write(f"Root      : {PROJECT_ROOT}\n")
        out.write(f"Files     : {len(included)}\n")
        out.write("=" * 100 + "\n\n")

        # Оглавление
        out.write("TABLE OF CONTENTS\n")
        out.write("-" * 100 + "\n")
        for i, fp in enumerate(included, 1):
            try:
                rel = fp.relative_to(PROJECT_ROOT)
            except ValueError:
                rel = fp
            out.write(f"  {i:3d}. {rel}\n")
        out.write("\n" + "=" * 100 + "\n\n")

        # Файлы
        current_dir = None
        for i, fp in enumerate(included, 1):
            try:
                rel = str(fp.relative_to(PROJECT_ROOT))
                file_dir = str(fp.parent.relative_to(PROJECT_ROOT))
            except ValueError:
                rel = str(fp)
                file_dir = str(fp.parent)

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


def main():
    import argparse

    parser = argparse.ArgumentParser(
        description="Собирает кодовую базу IAM Portfolio в один файл"
    )
    parser.add_argument(
        "--tracked-only",
        action="store_true",
        help="Только tracked git файлы (без untracked новых)"
    )
    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="Показать исключённые файлы"
    )
    args = parser.parse_args()

    create_bundle(
        include_untracked=not args.tracked_only,
        verbose=args.verbose
    )


if __name__ == "__main__":
    main()
