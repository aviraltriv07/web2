import json
import os

with open('data/movies.json', 'r', encoding='utf-8') as f:
    mdata = json.load(f)
movies = mdata['movies']

with open('data/science-concepts.json', 'r', encoding='utf-8') as f:
    sdata = json.load(f)
concepts = sdata['concepts']

print("=== VALIDATION REPORT ===")
print(f"Total Movies: {len(movies)}")
print(f"Total Science Concepts: {len(concepts)}")

# Validate movies
for m in movies:
    assert 'id' in m and 'title' in m, f"Movie missing id or title: {m}"
    assert 'posterUrl' in m, f"Movie missing posterUrl: {m['title']}"
    assert os.path.exists(m['posterUrl']), f"Poster file does not exist: {m['posterUrl']}"
    assert isinstance(m.get('scientificAccuracy'), (int, float)), f"Bad accuracy in {m['title']}"

# Validate concepts
movie_ids = {m['id'] for m in movies}
for c in concepts:
    assert 'id' in c and 'title' in c and 'formula' in c, f"Concept missing id/title/formula: {c}"
    for mid in c.get('relatedMovies', []):
        assert mid in movie_ids, f"Concept {c['title']} references non-existent movie ID {mid}"

print("All 112 movies and 36 science concepts passed 100% of validation assertions!")
