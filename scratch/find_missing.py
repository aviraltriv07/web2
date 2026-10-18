import json, os

with open('data/movies.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

movies = data['movies']
poster_dir = 'images/posters'
existing_posters = set(os.listdir(poster_dir))

print(f'Total movies: {len(movies)}')
print()
print('Movies WITHOUT poster files:')
for m in movies:
    fname = os.path.basename(m.get('posterUrl', ''))
    if fname not in existing_posters:
        print(f'  ID {m["id"]}: {m["title"]} -> {fname}')

print()
print('Existing poster files:')
for p in sorted(existing_posters):
    print(f'  {p}')
