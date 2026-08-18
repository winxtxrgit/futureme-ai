import os
import re
import sys
import subprocess
import shutil
import tempfile
from pathlib import Path

# Paths (resolved relative to this script so it runs on any machine / OS)
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "Data"
TEMP_DIR = Path(tempfile.gettempdir()) / "futurepath_pdf_gen"


def _resolve_chrome() -> str:
    """Locate a headless Chrome/Chromium binary across OSes (override with CHROME_PATH env)."""
    env = os.environ.get("CHROME_PATH")
    candidates = [
        env,
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/usr/bin/google-chrome",
        "/usr/bin/chromium-browser",
        "/usr/bin/chromium",
    ]
    for path in candidates:
        if path and Path(path).exists():
            return path
    return shutil.which("google-chrome") or shutil.which("chromium") or "chrome"


CHROME_PATH = _resolve_chrome()

# HTML Template with Sarabun Font & Print CSS
HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Sarabun:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap');

  :root {{
    --primary: #0a7d4f;
    --primary-light: #e6f4ee;
    --ink: #1a2332;
    --muted: #5a6678;
    --line: #dde3ea;
    --bg: #f8fafc;
    --card: #ffffff;
  }}

  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  
  html[lang="th"] {{
    font-size: 100%;
  }}

  body {{
    font-family: 'Sarabun', 'TH Sarabun New', 'TH Sarabun PSK', sans-serif;
    color: var(--ink);
    background: #fff;
    line-height: 1.7;
    font-size: 15px;
    padding: 30px 40px;
  }}

  ::first-letter {{
    font-size: inherit;
    font-weight: inherit;
  }}

  header {{
    border-bottom: 3px solid var(--primary);
    padding-bottom: 16px;
    margin-bottom: 24px;
  }}

  header h1 {{
    font-size: 24pt;
    color: var(--primary);
    line-height: 1.3;
    font-weight: 700;
  }}

  header .meta {{
    font-size: 11pt;
    color: var(--muted);
    margin-top: 6px;
  }}

  h1 {{ font-size: 20pt; color: var(--primary); margin: 24px 0 12px; font-weight: 700; break-after: avoid; }}
  h2 {{ font-size: 16pt; color: #111827; margin: 20px 0 10px; font-weight: 600; border-bottom: 1px solid var(--line); padding-bottom: 6px; break-after: avoid; }}
  h3 {{ font-size: 14.5pt; color: #374151; margin: 16px 0 8px; font-weight: 600; break-after: avoid; }}
  h4 {{ font-size: 13pt; color: #4b5563; margin: 14px 0 6px; font-weight: 600; break-after: avoid; }}

  p, li {{ font-size: 13pt; margin-bottom: 8px; text-align: justify; text-justify: inter-word; }}
  ul, ol {{ padding-left: 24px; margin-bottom: 12px; }}
  li {{ margin-bottom: 4px; }}

  blockquote {{
    background: var(--primary-light);
    border-left: 4px solid var(--primary);
    padding: 12px 18px;
    margin: 14px 0;
    border-radius: 0 8px 8px 0;
    font-size: 12pt;
  }}

  table, table.data {{
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
    font-size: 12pt;
    break-inside: avoid;
    page-break-inside: avoid;
  }}

  table tr, table.data tr {{
    break-inside: avoid;
    page-break-inside: avoid;
  }}

  th, td {{
    border: 1px solid var(--line);
    padding: 8px 12px;
    text-align: left;
    vertical-align: top;
  }}

  th {{
    background: var(--primary-light);
    color: var(--primary);
    font-weight: 600;
  }}

  tr:nth-child(even) td {{
    background: #f9fafb;
  }}

  pre, code {{
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 11pt;
  }}

  pre {{
    background: #1e293b;
    color: #e2e8f0;
    padding: 14px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 14px 0;
    white-space: pre-wrap;
    break-inside: avoid;
    page-break-inside: avoid;
  }}

  .footer {{
    margin-top: 40px;
    padding-top: 12px;
    border-top: 1px solid var(--line);
    font-size: 10pt;
    color: var(--muted);
    text-align: center;
  }}

  @page {{
    size: A4;
    margin: 15mm 15mm 15mm 15mm;
  }}

  @media print {{
    body {{ padding: 0; background: #fff; }}
    table, pre, blockquote {{ break-inside: avoid; page-break-inside: avoid; }}
    h1, h2, h3 {{ break-after: avoid; page-break-after: avoid; }}
  }}
</style>
</head>
<body>
<header>
  <h1>{title}</h1>
  <div class="meta">FuturePath AI System Documentation — JUMP THAILAND Hackathon 2026</div>
</header>
<main>
{content}
</main>
<footer class="footer">
  จัดทำโดย FuturePath AI Team · อ้างอิงจากคลังข้อมูลวิจัย 2026
</footer>
</body>
</html>
"""

def markdown_to_html(md_text, title):
    """Simple robust markdown renderer for document conversion."""
    content = md_text
    
    # Remove YAML frontmatter if present
    content = re.sub(r'^---[\s\S]*?---\n', '', content)
    
    # Headers
    content = re.sub(r'^# (.*?)$', r'<h1>\1</h1>', content, flags=re.MULTILINE)
    content = re.sub(r'^## (.*?)$', r'<h2>\1</h2>', content, flags=re.MULTILINE)
    content = re.sub(r'^### (.*?)$', r'<h3>\1</h3>', content, flags=re.MULTILINE)
    content = re.sub(r'^#### (.*?)$', r'<h4>\1</h4>', content, flags=re.MULTILINE)
    
    # Bold & Italic
    content = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', content)
    content = re.sub(r'\*(.*?)\*', r'<em>\1</em>', content)
    
    # Blockquotes
    def replace_blockquote(match):
        lines = match.group(0).split('\n')
        cleaned = [re.sub(r'^>\s?', '', l) for l in lines]
        return f"<blockquote>{'<br>'.join(cleaned)}</blockquote>"
    content = re.sub(r'(^>.*?$\n?)+', replace_blockquote, content, flags=re.MULTILINE)
    
    # Code blocks (fenced)
    def replace_code_block(match):
        code = match.group(2).replace('<', '&lt;').replace('>', '&gt;')
        return f"<pre><code>{code}</code></pre>"
    content = re.sub(r'```(\w+)?\n([\s\S]*?)```', replace_code_block, content)
    
    # Tables
    def parse_table(match):
        rows = match.group(0).strip().split('\n')
        html = ['<table>']
        in_tbody = False
        for i, row in enumerate(rows):
            if '---' in row:
                continue
            cols = [c.strip() for c in row.strip('|').split('|')]
            if i == 0:
                html.append('<thead><tr>' + ''.join(f'<th>{c}</th>' for c in cols) + '</tr></thead>')
            else:
                if not in_tbody:
                    html.append('<tbody>')
                    in_tbody = True
                html.append('<tr>' + ''.join(f'<td>{c}</td>' for c in cols) + '</tr>')
        if in_tbody:
            html.append('</tbody>')
        html.append('</table>')
        return ''.join(html)
    content = re.sub(r'(^\|.*?\|$\n?)+', parse_table, content, flags=re.MULTILINE)
    
    # Unordered Lists
    def parse_list(match):
        items = match.group(0).strip().split('\n')
        html = ['<ul>']
        for item in items:
            text = re.sub(r'^\s*[\*\-]\s+', '', item)
            html.append(f'<li>{text}</li>')
        html.append('</ul>')
        return ''.join(html)
    content = re.sub(r'(^\s*[\*\-]\s+.*?$\n?)+', parse_list, content, flags=re.MULTILINE)
    
    # Links
    content = re.sub(r'\[(.*?)\]\((.*?)\)', r'<a href="\2">\1</a>', content)
    
    # Paragraphs (lines that are not HTML tags)
    lines = content.split('\n\n')
    formatted_paragraphs = []
    for block in lines:
        block = block.strip()
        if not block:
            continue
        if block.startswith('<h') or block.startswith('<table') or block.startswith('<ul') or block.startswith('<blockquote') or block.startswith('<pre'):
            formatted_paragraphs.append(block)
        else:
            formatted_paragraphs.append(f"<p>{block}</p>")
            
    final_content = '\n'.join(formatted_paragraphs)
    return HTML_TEMPLATE.format(title=title, content=final_content)

def convert_md_to_pdf(md_file_path, output_pdf_path):
    """Converts a Markdown file to PDF using Chrome Headless via Temp directory."""
    print(f"[CONVERT] {md_file_path.name} -> {output_pdf_path.name}")
    
    # Read Markdown
    with open(md_file_path, 'r', encoding='utf-8') as f:
        md_text = f.read()
        
    title = md_file_path.stem.replace('_', ' ')
    html_content = markdown_to_html(md_text, title)
    
    # Setup Temp paths
    TEMP_DIR.mkdir(parents=True, exist_ok=True)
    temp_html_path = TEMP_DIR / "doc.html"
    temp_pdf_path = TEMP_DIR / "doc.pdf"
    
    with open(temp_html_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
        
    # Run Chrome CLI via Start-Process (powershell wrapper)
    ps_cmd = f"""
    Start-Process -FilePath "{CHROME_PATH}" -ArgumentList "--headless", "--disable-gpu", "--no-sandbox", "--allow-file-access-from-files", "--no-pdf-header-footer", "--print-to-pdf={temp_pdf_path}", "{temp_html_path}" -Wait -NoNewWindow
    """
    
    subprocess.run(["powershell", "-Command", ps_cmd], check=True)
    
    # Copy PDF back
    if temp_pdf_path.exists():
        output_pdf_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy(temp_pdf_path, output_pdf_path)
        print(f"[SUCCESS] PDF generated at {output_pdf_path}")
    else:
        print(f"[ERROR] Failed to generate PDF for {md_file_path}")

def process_all_categories():
    """Processes all markdown files in Data subdirectories."""
    # Find all subdirectories in Data
    subdirs = [d for d in DATA_DIR.iterdir() if d.is_dir()]
    
    total_converted = 0
    for subdir in subdirs:
        print(f"\n==========================================")
        print(f" Category: {subdir.name}")
        print(f"==========================================")
        
        md_files = list(subdir.glob("*.md"))
        for md_file in md_files:
            pdf_name = md_file.stem + ".pdf"
            output_pdf = subdir / pdf_name
            try:
                convert_md_to_pdf(md_file, output_pdf)
                total_converted += 1
            except Exception as e:
                print(f"[FAIL] Error converting {md_file}: {e}")
                
    # Also convert USER_MANUAL.md in root
    user_manual_md = BASE_DIR / "USER_MANUAL.md"
    if user_manual_md.exists():
        print(f"\n==========================================")
        print(f" Master Document: USER_MANUAL.md")
        print(f"==========================================")
        convert_md_to_pdf(user_manual_md, BASE_DIR / "USER_MANUAL.pdf")
        total_converted += 1

    print(f"\n[COMPLETE] Successfully converted {total_converted} documents to PDF!")

if __name__ == "__main__":
    process_all_categories()
