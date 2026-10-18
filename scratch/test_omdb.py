import urllib.request
import urllib.parse
import json

keys = ['trilogy', 'b7cdc134', '3a8b417c', 'thewdb', 'cb6c3f3f', '5e7e1f7c']
for k in keys:
    url = f"http://www.omdbapi.com/?t=Aliens&apikey={k}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"Key {k}: Response: {data.get('Response')}, Poster: {data.get('Poster')}")
            if data.get('Response') == 'True' and data.get('Poster') and data.get('Poster') != 'N/A':
                print(f"--> Working key found: {k}!")
                break
    except Exception as e:
        print(f"Key {k} error:", e)
