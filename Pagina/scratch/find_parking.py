import urllib.request, re, os

url = 'https://www.gladiatorcontrol.com/s-projects-side-by-side'
req = urllib.request.Request('https://www.gladiatorcontrol.com', headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    links = set(re.findall(r'href=["\'](https?://www\.gladiatorcontrol\.com/[^"\']+)["\']', html))
    print("Found links:")
    for l in sorted(links):
        print(" -", l)
except Exception as e:
    print("Error:", e)
