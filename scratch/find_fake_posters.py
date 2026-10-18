import json
import os

with open('data/movies.json', 'r', encoding='utf-8') as f:
    movies = json.load(f)['movies']

print(f"Total movies: {len(movies)}")
# Let's check which movies are in movies.json
for m in movies:
    purl = m.get('posterUrl', '')
    size = os.path.getsize(purl) if os.path.exists(purl) else 0
    # In generate_posters.py, width was 400, height was 600
    # Let's inspect image dimensions using PIL
    from PIL import Image
    try:
        with Image.open(purl) as img:
            w, h = img.size
            # The fake posters have exactly 400x600 size
            is_fake = (w == 400 and h == 600)
            if is_fake or m['id'] >= 54 or m['id'] == 88:
                print(f"[{m['id']}] {m['title']} ({m.get('year')}) -> {w}x{h}, {size} bytes (FAKE: {is_fake})")
    except Exception as e:
        print(f"[{m['id']}] {m['title']} ERROR: {e}")
