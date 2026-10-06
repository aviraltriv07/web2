import glob

for filepath in glob.glob('js/*.js'):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # We need to replace \[ with \\[ and \] with \\] inside the template literals.
    content = content.replace(r'\[ ${', r'\\[ ${')
    content = content.replace(r'} \]', r'} \\]')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
