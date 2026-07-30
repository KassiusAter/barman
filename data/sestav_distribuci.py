#!/usr/bin/env python3
"""Sestaví barman_komplet.html — jediný soubor se vším všudy (engine, data,
fotky jako base64), který jde poslat komukoli a funguje bez dalších souborů.
Spustit po každé změně dat či aplikace: python3 data/sestav_distribuci.py"""
import base64, json, os

DATA = os.path.dirname(os.path.abspath(__file__))
PROJEKT = os.path.dirname(DATA)

def precti(cesta):
    with open(cesta, encoding="utf-8") as f:
        return f.read()

html = precti(os.path.join(PROJEKT, "barman.html"))
engine = precti(os.path.join(PROJEKT, "engine.js"))

# data.js znovu poskládat s obrázky vloženými jako data:URI
data_js = precti(os.path.join(DATA, "data.js"))
zacatek = data_js.index("{")
data = json.loads(data_js[zacatek:].rstrip().rstrip(";"))
vlozeno = 0
for nazev, soubor in list(data["obrazky"].items()):
    cesta = os.path.join(DATA, "img", soubor)
    if os.path.exists(cesta):
        b64 = base64.b64encode(open(cesta, "rb").read()).decode()
        data["obrazky"][nazev] = "data:image/jpeg;base64," + b64
        vlozeno += 1
    else:
        del data["obrazky"][nazev]

vlozena_data = "window.BARMAN_DATA = " + json.dumps(data, ensure_ascii=False) + ";"

html = html.replace('<script src="engine.js"></script>',
                    "<script>\n" + engine + "\n</script>")
html = html.replace('<script src="data/data.js"></script>',
                    "<script>\n" + vlozena_data + "\n</script>")

vystup = os.path.join(PROJEKT, "barman_komplet.html")
with open(vystup, "w", encoding="utf-8") as f:
    f.write(html)

mb = os.path.getsize(vystup) / 1024 / 1024
print(f"OK: barman_komplet.html — {mb:.1f} MB, {vlozeno} fotek vloženo, "
      f"{len(data['drinky'])} drinků, {len(data['suroviny'])} surovin")
