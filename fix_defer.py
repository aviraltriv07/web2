import glob

for file in glob.glob('*.html'):
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace('<script defer src="https://cdn.jsdelivr.net/npm/katex', '<script src="https://cdn.jsdelivr.net/npm/katex')
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
