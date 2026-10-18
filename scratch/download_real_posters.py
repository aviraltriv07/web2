import json
import urllib.request
import urllib.parse
import os
import time
from PIL import Image
import io

# Movies with fake posters
fake_ids = [45] + list(range(54, 113))

with open('data/movies.json', 'r', encoding='utf-8') as f:
    movies = json.load(f)['movies']

# Map of custom queries for movies that might need special search formatting
TITLE_OVERRIDES = {
    82: ("eXistenZ", 1999),
    77: ("A.I. Artificial Intelligence", 2001),
    66: ("Back to the Future Part II", 1989),
    67: ("Back to the Future Part III", 1990),
    91: ("A Quiet Place Part II", 2020),
    86: ("Furiosa: A Mad Max Saga", 2024),
    60: ("Solaris", 1972),
    61: ("Solaris", 2002),
    45: ("Akira", 1988),
    74: ("Tron: Legacy", 2010),
    71: ("The Matrix Reloaded", 2003),
    88: ("I, Robot", 2004)
}

API_KEYS = ['trilogy', 'b7cdc134', '3a8b417c', 'thewdb']

def fetch_poster_url(title, year):
    # Try different queries
    queries = [
        (title, year),
        (title, None),
        (title.replace(":", ""), year),
        (title.replace(":", ""), None)
    ]
    
    for q_title, q_year in queries:
        for key in API_KEYS:
            params = {'t': q_title, 'apikey': key}
            if q_year:
                params['y'] = str(q_year)
            url = "http://www.omdbapi.com/?" + urllib.parse.urlencode(params)
            
            try:
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=6) as resp:
                    data = json.loads(resp.read().decode('utf-8'))
                    poster = data.get('Poster')
                    if data.get('Response') == 'True' and poster and poster != 'N/A' and poster.startswith('http'):
                        return poster
            except Exception as e:
                pass
            time.sleep(0.05)
    return None

def download_and_save(poster_url, output_path):
    req = urllib.request.Request(poster_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=12) as resp:
        img_bytes = resp.read()
    
    # Open with PIL to ensure it's a valid RGB JPEG
    with Image.open(io.BytesIO(img_bytes)) as img:
        img = img.convert('RGB')
        # If the image is large, we can keep high quality
        img.save(output_path, 'JPEG', quality=95)
    return len(img_bytes)

def main():
    movies_to_process = [m for m in movies if m['id'] in fake_ids]
    print(f"Total movies to replace with real posters: {len(movies_to_process)}")
    
    success = 0
    failed = []
    
    for m in movies_to_process:
        mid = m['id']
        title = m['title']
        year = m.get('year')
        purl = m.get('posterUrl')
        
        if mid in TITLE_OVERRIDES:
            q_title, q_year = TITLE_OVERRIDES[mid]
        else:
            q_title, q_year = title, year
        
        print(f"Searching real poster for [{mid}] {title} ({year})...")
        poster_url = fetch_poster_url(q_title, q_year)
        
        if poster_url:
            try:
                size = download_and_save(poster_url, purl)
                print(f"  -> SUCCESS! Saved {purl} ({size} bytes) from {poster_url[:60]}...")
                success += 1
            except Exception as e:
                print(f"  -> Download failed: {e}")
                failed.append((mid, title, f"Download error: {e}"))
        else:
            print(f"  -> FAILED to find poster on OMDB")
            failed.append((mid, title, "Not found on OMDB"))
        
        time.sleep(0.1)

    print("\n===============================")
    print(f"Successfully downloaded: {success} / {len(movies_to_process)}")
    if failed:
        print(f"Failed count: {len(failed)}")
        for f in failed:
            print(f"  [{f[0]}] {f[1]}: {f[2]}")

if __name__ == '__main__':
    main()
