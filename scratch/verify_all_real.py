import json
import os
from PIL import Image

with open('data/movies.json', 'r', encoding='utf-8') as f:
    movies = json.load(f)['movies']

fake_count = 0
real_count = 0

for m in movies:
    purl = m.get('posterUrl')
    if not purl or not os.path.exists(purl):
        print(f"MISSING FILE: {m['id']} {m['title']}")
        continue
    with Image.open(purl) as img:
        w, h = img.size
        # The fake ones had exactly 400x600 dimensions
        if w == 400 and h == 600:
            print(f"Still fake: [{m['id']}] {m['title']} ({w}x{h})")
            fake_count += 1
        else:
            real_count += 1

print("\n=== FINAL POSTER AUDIT ===")
print(f"Total movies checked: {len(movies)}")
print(f"Real theatrical posters: {real_count}")
print(f"Fake posters remaining: {fake_count}")
