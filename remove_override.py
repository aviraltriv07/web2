with open('css/styles.css', 'r', encoding='utf-8') as f:
    lines = f.readlines()

out = []
skip = False
for line in lines:
    if "/* Added Background Image Override */" in line:
        skip = True
    if skip and "}" in line:
        skip = False
        continue
    if not skip:
        out.append(line)

with open('css/styles.css', 'w', encoding='utf-8') as f:
    f.writelines(out)
