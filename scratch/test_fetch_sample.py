import json
import urllib.request
import urllib.parse
import os
from PIL import Image

def fetch_omdb_poster(title, year=None):
    # Clean title
    clean_title = title.replace("&", "and")
    # OMDB lookup
    params = {'t': clean_title, 'apikey': 'trilogy'}
    if year:
        params['y'] = str(year)
    url = "http://www.omdbapi.com/?" + urllib.parse.urlencode(params)
    
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            if data.get('Response') == 'True' and data.get('Poster') and data.get('Poster') != 'N/A':
                return data.get('Poster')
    except Exception as e:
        print(f"OMDB error for {title}: {e}")
    
    # Try without year if year failed
    if year:
        params = {'t': clean_title, 'apikey': 'trilogy'}
        url = "http://www.omdbapi.com/?" + urllib.parse.urlencode(params)
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        try:
            with urllib.request.urlopen(req, timeout=8) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                if data.get('Response') == 'True' and data.get('Poster') and data.get('Poster') != 'N/A':
                    return data.get('Poster')
        except:
            pass
    return None

test_movies = [
    ("Aliens", 1986),
    ("Tenet", 2020),
    ("Back to the Future", 1985),
    ("Akira", 1988),
    ("I, Robot", 2004),
    ("The Truman Show", 1998)
]

for title, year in test_movies:
    poster_url = fetch_omdb_poster(title, year)
    print(f"{title} ({year}) -> {poster_url}")
