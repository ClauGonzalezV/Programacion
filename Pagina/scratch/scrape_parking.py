import urllib.request, os
from html.parser import HTMLParser

class MyParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.texts = []
    def handle_data(self, data):
        cleaned = data.strip()
        if cleaned and len(cleaned) > 1:
            self.texts.append(cleaned)

url = 'https://www.gladiatorcontrol.com/bloqueo-estacionamiento'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')

parser = MyParser()
parser.feed(html)

clean = []
for t in parser.texts:
    if not t.startswith(('{', '(', 'window', 'var ', 'function', '//#', '/*', '@', '.')) and len(t) > 2:
        if not any(c in t for c in ['{', '}', ';', '=>', 'var ', 'function', 'wix', 'Wix']):
            clean.append(t)

os.makedirs('scratch', exist_ok=True)
with open('scratch/bloqueo_clean.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(clean))

print("Saved bloqueo_clean.txt, lines:", len(clean))
