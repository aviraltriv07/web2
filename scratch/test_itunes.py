import urllib.request
import urllib.parse
import json

title = "Inception"
url = f"https://itunes.apple.com/search?term={urllib.parse.quote(title)}&entity=movie&limit=5"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        print(f"Results count: {data.get('resultCount')}")
        for r in data.get('results', []):
            art = r.get('artworkUrl100', '')
            high_res = art.replace('100x100bb', '600x900bb')
            print(f"  Movie: {r.get('trackName')} ({r.get('releaseDate')[:4]}) -> {high_res}")
except Exception as e:
    print("iTunes API error:", e)
