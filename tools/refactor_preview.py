#!/usr/bin/env python3
from __future__ import annotations

import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "refactor-output"


def copy_repo() -> None:
    if OUT.exists():
        shutil.rmtree(OUT)

    def ignore(path: str, names: list[str]) -> set[str]:
        ignored = {".git", ".github", "refactor-output", "HNH-Refactor-Preview.zip"}
        return {name for name in names if name in ignored}

    shutil.copytree(ROOT, OUT, ignore=ignore)


def clean_css(css: str) -> str:
    css = re.sub(r"/\*\s*v\d+[^*]*\*/", "", css, flags=re.I)
    css = re.sub(r"\n{4,}", "\n\n\n", css)
    return css.strip() + "\n"


def write_css_modules(html: str) -> tuple[str, list[str]]:
    style_re = re.compile(r"<style(?:\s[^>]*)?>(.*?)</style>", re.I | re.S)
    styles = [m.group(1) for m in style_re.finditer(html)]
    if not styles:
        raise RuntimeError("No <style> blocks found in index.html")

    projects_start = next(
        (i for i, block in enumerate(styles) if "Production project library" in block),
        max(1, len(styles) // 2),
    )
    contact_start = next(
        (i for i, block in enumerate(styles) if "v28" in block and "attachment" in block.lower()),
        max(projects_start + 1, (len(styles) * 3) // 4),
    )

    groups = {
        "core.css": styles[:projects_start],
        "projects-clients.css": styles[projects_start:contact_start],
        "contact.css": styles[contact_start:],
    }

    css_dir = OUT / "assets" / "css"
    css_dir.mkdir(parents=True, exist_ok=True)
    written: list[str] = []

    for name, blocks in groups.items():
        content = clean_css("\n\n".join(blocks))
        if name == "contact.css":
            content += "\n/* Current approved mobile contact lift, migrated from runtime JS. */\n"
            content += "@media (max-width: 620px) {\n"
            content += "  #contact > .section-shell { position: relative; top: -20px; }\n"
            content += "}\n"
        (css_dir / name).write_text(content, encoding="utf-8")
        written.append(f"assets/css/{name}")

    html = style_re.sub("", html)
    links = "\n".join(
        f'<link rel="stylesheet" href="{path}">' for path in written
    )
    html = html.replace("</head>", f"{links}\n</head>", 1)
    return html, written


def extract_inline_scripts(html: str) -> tuple[str, list[str]]:
    script_re = re.compile(r"<script([^>]*)>(.*?)</script>", re.I | re.S)
    extracted: dict[str, str] = {}

    def replacement(match: re.Match[str]) -> str:
        attrs = match.group(1) or ""
        body = match.group(2) or ""
        if re.search(r"\bsrc\s*=", attrs, re.I):
            if "data/projects.js" in attrs or "assets/js/projects.js" in attrs:
                return ""
            return match.group(0)

        stripped = body.strip()
        if not stripped:
            return ""
        if "document.documentElement.classList.add('js')" in stripped:
            return match.group(0)
        if "Full-screen panel navigation" in stripped:
            extracted["panels.js"] = stripped
            return ""
        if "const items = [...document.querySelectorAll('.expertise-item')]" in stripped:
            extracted["expertise.js"] = stripped
            return ""
        if "const grid = document.querySelector('.clients .client-grid')" in stripped:
            extracted["clients.js"] = stripped
            return ""
        if "initAttachmentManager" in stripped:
            extracted["attachments.js"] = stripped
            return ""
        if "const body = document.body" in stripped and "showSlide" in stripped:
            extracted["site.js"] = stripped
            return ""
        return match.group(0)

    html = script_re.sub(replacement, html)

    js_dir = OUT / "assets" / "js"
    js_dir.mkdir(parents=True, exist_ok=True)
    order = ["site.js", "panels.js", "expertise.js", "clients.js", "attachments.js"]
    written: list[str] = []
    for name in order:
        if name not in extracted:
            continue
        (js_dir / name).write_text(extracted[name].strip() + "\n", encoding="utf-8")
        written.append(f"assets/js/{name}")

    projects_js = js_dir / "projects.js"
    if projects_js.exists():
        text = projects_js.read_text(encoding="utf-8")
        text = re.sub(
            r"\n// Mobile Contact: raise content slightly.*?\n}\n?$",
            "\n",
            text,
            flags=re.S,
        )
        projects_js.write_text(text.rstrip() + "\n", encoding="utf-8")

    load_block = "\n".join([
        '<script src="assets/js/site.js"></script>',
        '<script src="assets/js/panels.js"></script>',
        '<script src="assets/js/expertise.js"></script>',
        '<script src="data/projects.js?v=23"></script>',
        '<script src="assets/js/projects.js?v=23"></script>',
        '<script src="assets/js/clients.js"></script>',
        '<script src="assets/js/attachments.js"></script>',
    ])
    html = html.replace("</body>", f"{load_block}\n</body>", 1)
    return html, written


def tidy_html(html: str) -> str:
    html = re.sub(r"<!--\s*/?HNH attachment remove fix\s*-->", "", html, flags=re.I)
    html = re.sub(r"\n{3,}", "\n\n", html)
    return html.strip() + "\n"


def move_docs() -> list[str]:
    moved: list[str] = []
    docs = OUT / "docs"
    docs.mkdir(exist_ok=True)
    for name in ("DOMAIN_SETUP.md", "TIMESTAMP_CLEANUP.md"):
        src = OUT / name
        if src.exists():
            dst = docs / name
            shutil.move(str(src), str(dst))
            moved.append(f"{name} -> docs/{name}")
    return moved


def remove_known_redundant_files() -> list[str]:
    candidates = [
        "apple-touch-icon-v31.png",
        "apple-touch-icon-v32.png",
        "favicon-16x16-v31.png",
        "favicon-16x16-v32.png",
        "favicon-32x32-v31.png",
        "favicon-32x32-v32.png",
        "favicon-home-32-v32.png",
        "favicon-home-v32.ico",
        "favicon-v31.ico",
        "favicon-v32.ico",
    ]
    removed: list[str] = []
    for rel in candidates:
        p = OUT / rel
        if p.exists():
            p.unlink()
            removed.append(rel)

    optional = [
        "assets/logos/clients/republic-polytechnic.webp",
        "assets/images/projects/acrylic-coating/raffles-institution/01.jpg",
        "assets/icons/hnh-loader-bw-full.png",
        "assets/icons/hnh-loader-mark.png",
        "assets/icons/hnh-loader.png",
    ]
    text_suffixes = {".html", ".css", ".js", ".json", ".md", ".xml", ".txt", ".webmanifest", ".py", ".sh"}
    text_blob = "\n".join(
        p.read_text(encoding="utf-8", errors="ignore")
        for p in OUT.rglob("*")
        if p.is_file() and p.suffix.lower() in text_suffixes
    )
    for rel in optional:
        p = OUT / rel
        if p.exists() and rel not in text_blob:
            p.unlink()
            removed.append(rel)
    return removed


def write_local_server() -> None:
    script = OUT / "serve-local.sh"
    script.write_text(
        "#!/usr/bin/env bash\n"
        "set -e\n"
        "cd \"$(dirname \"$0\")\"\n"
        "echo 'Serving H&H refactor preview at http://localhost:8080'\n"
        "python3 -m http.server 8080\n",
        encoding="utf-8",
    )
    script.chmod(0o755)


def validate_references() -> list[str]:
    missing: set[str] = set()
    text_suffixes = {".html", ".css", ".js", ".json", ".webmanifest"}
    pattern = re.compile(r"(?<![A-Za-z0-9_-])((?:assets|data)/[A-Za-z0-9_./%?=&+-]+)")
    for p in OUT.rglob("*"):
        if not p.is_file() or p.suffix.lower() not in text_suffixes:
            continue
        text = p.read_text(encoding="utf-8", errors="ignore")
        for raw in pattern.findall(text):
            rel = raw.split("?", 1)[0].rstrip("'\"),;]}")
            target = OUT / rel
            if not target.exists():
                missing.add(rel)
    return sorted(missing)


def write_report(before_size: int, css_files: list[str], js_files: list[str], moved: list[str], removed: list[str], missing: list[str]) -> None:
    after_size = (OUT / "index.html").stat().st_size
    lines = [
        "# H&H Website Refactor Preview",
        "",
        "This package is a local-review build. It has not been applied to the live `main` branch.",
        "",
        "## Main structural changes",
        "",
        f"- `index.html`: {before_size:,} bytes -> {after_size:,} bytes",
        "- Inline CSS extracted into ordered stylesheet modules while preserving cascade order.",
        "- Inline JavaScript extracted into responsibility-based modules.",
        "- The approved mobile Contact lift is now CSS, not runtime JS inside the Projects renderer.",
        "- Historical favicon generation duplicates removed; canonical favicon files retained.",
        "- Deployment/cleanup notes moved into `docs/`.",
        "- Project image library, client logos and data sources preserved.",
        "",
        "## CSS modules",
        "",
    ]
    lines.extend(f"- `{x}`" for x in css_files)
    lines += ["", "## JavaScript modules", ""]
    lines.extend(f"- `{x}`" for x in js_files)
    lines += [
        "- `assets/js/projects.js` — project archive/detail rendering (existing module, cleaned of Contact positioning)",
        "",
        "## Directory cleanup",
        "",
    ]
    lines.extend(f"- Moved: `{x}`" for x in moved)
    lines.extend(f"- Removed: `{x}`" for x in removed)
    lines += ["", "## Local inspection", "", "Run:", "", "```bash", "./serve-local.sh", "```", "", "Then open `http://localhost:8080`.", ""]
    if missing:
        lines += ["## Reference validation warnings", ""]
        lines.extend(f"- Missing reference: `{x}`" for x in missing)
    else:
        lines += ["## Reference validation", "", "No missing local `assets/` or `data/` references were detected by the preview builder."]
    (OUT / "REFACTOR_REPORT.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    copy_repo()
    index = OUT / "index.html"
    before_size = index.stat().st_size
    html = index.read_text(encoding="utf-8")
    html, css_files = write_css_modules(html)
    html, js_files = extract_inline_scripts(html)
    html = tidy_html(html)
    index.write_text(html, encoding="utf-8")
    moved = move_docs()
    removed = remove_known_redundant_files()
    write_local_server()
    missing = validate_references()
    write_report(before_size, css_files, js_files, moved, removed, missing)
    print(f"Built refactor preview at {OUT}")
    print(f"index.html: {before_size:,} -> {index.stat().st_size:,} bytes")
    print(f"CSS modules: {', '.join(css_files)}")
    print(f"JS modules: {', '.join(js_files)}")
    print(f"Removed {len(removed)} redundant files")
    if missing:
        print("WARNING missing refs:")
        for item in missing:
            print(" -", item)


if __name__ == "__main__":
    main()
