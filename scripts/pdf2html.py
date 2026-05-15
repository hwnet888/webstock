import pdfplumber
import fitz  # pymupdf
import os
import re
import json
import subprocess
import tempfile
from pathlib import Path
from html import escape

PDF_DIR = Path(__file__).parent.parent / "pdf"
HTML_DIR = Path(__file__).parent.parent / "html"
CHARS_PER_PAGE = 3000


def parse_date(filename: str) -> str:
    m = re.search(r"(\d{4})(\d{2})(\d{2})", filename)
    if m:
        return f"{m.group(1)}-{m.group(2)}-{m.group(3)}"
    return "unknown"


def parse_title(filename: str) -> str:
    name = Path(filename).stem
    name = re.sub(r"\d{8}", "", name)
    name = name.strip()
    return name if name else "未命名文章"


def extract_text_pdfplumber(pdf_path: Path) -> str:
    text_parts = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            t = page.extract_text()
            if t:
                text_parts.append(t)
    return "\n\n".join(text_parts)


def extract_text_ocr(pdf_path: Path) -> str:
    """Extract text from image-based PDF using OCR."""
    doc = fitz.open(pdf_path)
    text_parts = []

    with tempfile.TemporaryDirectory() as tmpdir:
        for i, page in enumerate(doc):
            # Render page to image at 300 DPI
            pix = page.get_pixmap(dpi=300)
            img_path = os.path.join(tmpdir, f"page_{i:03d}.png")
            pix.save(img_path)

            # Run tesseract OCR with Chinese
            txt_path = os.path.join(tmpdir, f"page_{i:03d}")
            subprocess.run(
                ["tesseract", img_path, txt_path, "-l", "chi_sim", "--psm", "6"],
                capture_output=True,
                timeout=120,
            )
            txt_file = txt_path + ".txt"
            if os.path.exists(txt_file):
                t = Path(txt_file).read_text(encoding="utf-8").strip()
                if t:
                    text_parts.append(t)

    doc.close()
    return "\n\n".join(text_parts)


def extract_text(pdf_path: Path) -> str:
    """Extract text, falling back to OCR for image-based PDFs."""
    text = extract_text_pdfplumber(pdf_path)
    if len(text.strip()) > 100:
        return text
    # Try pymupdf built-in text extraction
    doc = fitz.open(pdf_path)
    mupdf_text = "\n\n".join(page.get_text() for page in doc)
    doc.close()
    if len(mupdf_text.strip()) > 100:
        return mupdf_text
    # Fall back to OCR
    print("  [OCR mode] Image-based PDF detected, running OCR...")
    return extract_text_ocr(pdf_path)


def split_pages(text: str, chars_per_page: int = CHARS_PER_PAGE) -> list[str]:
    paragraphs = text.split("\n\n")
    pages = []
    current = ""

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue
        if len(current) + len(para) + 2 <= chars_per_page:
            current += ("\n\n" if current else "") + para
        else:
            if current:
                pages.append(current)
            if len(para) > chars_per_page:
                sentences = re.split(r"(?<=[。！？\.\!\?])", para)
                current = ""
                for s in sentences:
                    if len(current) + len(s) <= chars_per_page:
                        current += s
                    else:
                        if current:
                            pages.append(current)
                        current = s
            else:
                current = para
    if current:
        pages.append(current)

    return pages if pages else [text]


def text_to_html(text: str, title: str, date_str: str, page_num: int, total_pages: int) -> str:
    paragraphs = text.strip().split("\n\n")

    html_paras = []
    for p in paragraphs:
        p = p.strip()
        if not p:
            continue
        p = escape(p)
        p = p.replace("\n", "<br>")
        p = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", p)
        html_paras.append(f"  <p>{p}</p>")

    nav = ""
    if total_pages > 1:
        nav_parts = ['  <nav class="pagination">']
        if page_num > 1:
            prev = "index.html" if page_num == 2 else f"page_{page_num - 1}.html"
            nav_parts.append(f'    <a href="{prev}">&larr; 上一页</a>')
        else:
            nav_parts.append('    <span></span>')
        nav_parts.append(f'    <span>第 {page_num}/{total_pages} 页</span>')
        if page_num < total_pages:
            nav_parts.append(f'    <a href="page_{page_num + 1}.html">下一页 &rarr;</a>')
        else:
            nav_parts.append('    <span></span>')
        nav_parts.append("  </nav>")
        nav = "\n".join(nav_parts)

    return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{escape(title)} - 第{page_num}页</title>
  <style>
    :root {{
      --color-bg: #0f1117;
      --color-surface: #1a1d27;
      --color-border: #2a2d3a;
      --color-text: #e1e4ed;
      --color-text-muted: #8b8fa3;
      --color-accent: #4da6ff;
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans SC", sans-serif;
      background: var(--color-bg);
      color: var(--color-text);
      line-height: 1.85;
      -webkit-font-smoothing: antialiased;
    }}
    .container {{ max-width: 720px; margin: 0 auto; padding: 2rem 1.5rem; }}
    h1 {{ font-size: 1.75rem; margin-bottom: 0.5rem; }}
    .meta {{ font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid var(--color-border); }}
    p {{ margin-bottom: 1rem; font-size: 1.05rem; }}
    strong {{ color: #fff; }}
    .pagination {{
      display: flex; justify-content: space-between; align-items: center;
      margin-top: 2.5rem; padding-top: 1rem; border-top: 1px solid var(--color-border);
    }}
    .pagination a {{ color: var(--color-accent); text-decoration: none; }}
    .pagination a:hover {{ text-decoration: underline; }}
    .pagination span {{ color: var(--color-text-muted); font-size: 0.9rem; }}
    .back {{ margin-top: 1rem; text-align: center; }}
    .back a {{ color: var(--color-accent); text-decoration: none; font-size: 0.9rem; }}
  </style>
</head>
<body>
<div class="container">
  <h1>{escape(title)}</h1>
  <div class="meta">发布时间：{date_str}{" | " + f"第 {page_num}/{total_pages} 页" if total_pages > 1 else ""}</div>
{nav}
{"\n".join(html_paras)}
{nav}
  <div class="back"><a href="/news">&larr; 返回资讯列表</a></div>
</div>
</body>
</html>"""


def main():
    HTML_DIR.mkdir(exist_ok=True)

    pdf_files = sorted([f for f in PDF_DIR.iterdir() if f.suffix.lower() == ".pdf"])
    articles_meta = []

    for pdf_path in pdf_files:
        filename = pdf_path.name
        title = parse_title(filename)
        date_str = parse_date(filename)

        print(f"Processing: {filename}")
        print(f"  Title: {title}, Date: {date_str}")

        text = extract_text(pdf_path)
        print(f"  Extracted {len(text)} characters")

        if len(text.strip()) < 50:
            print(f"  WARNING: Very little text extracted, skipping")
            continue

        pages = split_pages(text)
        total = len(pages)
        print(f"  Split into {total} page(s)")

        slug = re.sub(r"[^\w一-鿿]+", "-", title).strip("-").lower()[:50]
        article_dir = HTML_DIR / slug
        article_dir.mkdir(exist_ok=True)

        for i, page_text in enumerate(pages, 1):
            html = text_to_html(page_text, title, date_str, i, total)
            if i == 1:
                page_path = article_dir / "index.html"
            else:
                page_path = article_dir / f"page_{i}.html"
            page_path.write_text(html, encoding="utf-8")

        excerpt = text.replace("\n", " ").strip()[:150] + "..."

        articles_meta.append({
            "slug": slug,
            "title": title,
            "date": date_str,
            "excerpt": excerpt,
            "pages": total,
            "source": filename,
        })

        print(f"  -> {article_dir}/")

    meta_path = HTML_DIR / "articles.json"
    meta_path.write_text(json.dumps(articles_meta, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nMetadata: {meta_path}")
    print(f"Total articles: {len(articles_meta)}")


if __name__ == "__main__":
    main()
