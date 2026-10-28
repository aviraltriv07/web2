import re

with open(r"c:\Users\Admin\OneDrive\Desktop\web2\js\main.js", 'r', encoding='utf-8') as f:
    content = f.read()

# Print the hamburger function section to see exact content
start = content.find('// Mobile hamburger menu')
end = content.find('\n}\n', start) + 3
print(repr(content[start:end]))
