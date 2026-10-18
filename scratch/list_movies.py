import json

with open('data/movies.json', 'r', encoding='utf-8') as f:
    movies = json.load(f)['movies']

for m in movies:
    print(f"[{m['id']}] {m['title']} ({m.get('year')}) | PosterUrl: {m.get('posterUrl')}")
