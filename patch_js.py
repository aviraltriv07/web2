import glob
import re

def fix_js_files():
    for filepath in glob.glob('js/*.js'):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Wrap ${variable.formula} with \\[ and \\] inside templates if not already wrapped
        # e.g., >${concept.formula}< becomes >\\[ ${concept.formula} \\]<
        # Be careful not to double wrap
        content = re.sub(r'>\s*\$\{\s*([a-zA-Z0-9_\.]+\.?formula)\s*\}\s*<', r'>\\[ ${\1} \\]<', content)
        
        # for `<code\>${exp.formula}</code>`
        content = re.sub(r'<code>\s*\$\{\s*([a-zA-Z0-9_\.]+\.?formula(?: \|\| \'[^\']+\')?)\s*\}\s*</code>', r'<code>\\[ ${\1} \\]</code>', content)

        # for formula tags `Eq: ${r.formula}`
        content = re.sub(r'Eq:\s*\$\{\s*([a-zA-Z0-9_\.]+\.?formula)\s*\}', r'Eq: \\[ ${\1} \\]', content)
        
        # for main.js search result `${c.category} • ${c.formula || c.description.substring(0, 60) + '...'}` 
        # this one is tricky, let's just do it manually if needed, or leave it (it's a preview)
        
        # After modal.classList.add('active'); we should call window.renderMath(modal)
        # Or just window.renderMath(document.body)
        if "modal.classList.add('active');" in content:
            content = content.replace("modal.classList.add('active');", "modal.classList.add('active');\n    if (window.renderMath) window.renderMath(document.body);")
        
        if "document.getElementById('experimentFormula').innerHTML =" in content:
            content = content.replace(
                "document.getElementById('experimentFormula').innerHTML = `<code>${exp.formula}</code>`;", 
                "document.getElementById('experimentFormula').innerHTML = `<code>\\\\[ ${exp.formula} \\\\]</code>`;\n    if (window.renderMath) window.renderMath(document.getElementById('experimentFormula'));"
            )
            
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

fix_js_files()
