import os
import glob

katex_headers = """
    <!-- KaTeX for math rendering -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
</head>"""

html_files = glob.glob('*.html')
for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if "katex.min.css" not in content:
        content = content.replace("</head>", katex_headers)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Injected into {file}")
    else:
        print(f"Already in {file}")
