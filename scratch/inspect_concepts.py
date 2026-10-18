import json
import os

with open('data/science-concepts.json', 'r', encoding='utf-8') as f:
    sdata = json.load(f)

concepts = sdata.get('concepts', [])
print(f"Total concepts: {len(concepts)}")
for c in concepts:
    titles = c.get('relatedMovieTitles', [])
    ids = c.get('relatedMovies', [])
    print(f"[{c['id']}] {c['title']} ({c.get('category')}) -> IDs: {ids} -> {titles}")

with open('data/movies.json', 'r', encoding='utf-8') as f:
    mdata = json.load(f)

movies = mdata.get('movies', [])
print(f"\nTotal movies: {len(movies)}")
movies_with_concepts = set()
for c in concepts:
    for mid in c.get('relatedMovies', []):
        movies_with_concepts.add(mid)

print(f"Movies linked to science concepts: {len(movies_with_concepts)} / {len(movies)}")

unlinked = [m for m in movies if m['id'] not in movies_with_concepts]
print(f"\nUnlinked movies ({len(unlinked)}):")
for m in unlinked[:30]:
    print(f"  [{m['id']}] {m['title']} ({m.get('genre')}) - concepts: {m.get('concepts')}")
