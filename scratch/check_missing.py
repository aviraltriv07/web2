import json
import urllib.request
import os
import time

# TMDB image base URL (public, no API key needed for these)
# We'll use publicly accessible poster images

# Map of movie ID -> TMDB movie ID for poster download
# We'll use OMDB or just construct fallback gradient posters
# Since we don't have API keys, let's use a different approach

with open('data/movies.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

movies = data['movies']
poster_dir = 'images/posters'
existing_posters = set(os.listdir(poster_dir))

print("Movies missing poster images:")
missing = []
for m in movies:
    fname = os.path.basename(m.get('posterUrl', ''))
    fsize = 0
    if fname in existing_posters:
        fpath = os.path.join(poster_dir, fname)
        fsize = os.path.getsize(fpath)
    if fname not in existing_posters or fsize < 100:
        missing.append((m['id'], m['title'], fname, m.get('posterColor', {})))
        print(f"  {m['id']}: {m['title']} -> {fname} (size: {fsize})")

print(f"\nTotal missing: {len(missing)}")
