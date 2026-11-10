#!/usr/bin/env python3
"""Sestaví celého Barmana jedním příkazem: python3 sestav.py

1. zkontroluje data (neznámá id, duplicity, osiřelé záznamy),
2. vygeneruje data/data.js — balík dat pro prohlížeč (ten neumí načíst
   lokální JSON přes fetch kvůli CORS na file://),
3. vygeneruje barman_komplet.html — jediný soubor se vším všudy (engine,
   data, fotky jako base64), který jde poslat komukoli,
4. pustí testy enginu (node data/test_engine.js).

Spustit po každé úpravě JSONů, engine.js nebo barman.html."""
import base64, json, os, re, subprocess, sys
from collections import Counter

PROJEKT = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(PROJEKT, "data")


def precti(*cesta):
    with open(os.path.join(PROJEKT, *cesta), encoding="utf-8") as f:
        return f.read()


def nacti(soubor):
    return json.loads(precti("data", soubor))


# ---------- 1) data a jejich kontrola ----------
_sur = nacti("suroviny.json")
suroviny, nahrady = _sur["suroviny"], _sur.get("nahrady", [])
drinky = nacti("drinky.json")["drinky"]
obrazky = nacti("obrazky.json")
znacky = nacti("znacky.json")["znacky"]
trivia = nacti("trivia.json")
trivia.pop("popis", None)

ids = {s["id"] for s in suroviny}
nazvy = {d["nazev"] for d in drinky}
chyby, varovani = [], []


def duplicity(hodnoty):
    return [h for h, n in Counter(hodnoty).items() if n > 1]


def seznam(polozky):
    return ", ".join(sorted(polozky))


if duplicity(s["id"] for s in suroviny):
    chyby.append("duplicitní id surovin: " + seznam(duplicity(s["id"] for s in suroviny)))
if duplicity(d["nazev"] for d in drinky):
    chyby.append("duplicitní názvy drinků: " + seznam(duplicity(d["nazev"] for d in drinky)))
for d in drinky:
    nezname = {s["id"] for s in d["suroviny"]} - ids
    if nezname:
        chyby.append(f"drink „{d['nazev']}“ používá neznámé suroviny: {seznam(nezname)}")
nezname = {i for sk in nahrady for i in sk["skupina"]} - ids
if nezname:
    chyby.append("záměny (nahrady) odkazují na neznámé suroviny: " + seznam(nezname))
if set(znacky) - ids:
    chyby.append("znacky.json odkazuje na neznámé suroviny: " + seznam(set(znacky) - ids))

if set(trivia) - nazvy:
    varovani.append("trivia k neexistujícím drinkům: " + seznam(set(trivia) - nazvy))
if nazvy - set(trivia):
    varovani.append("drinky bez trivie: " + seznam(nazvy - set(trivia)))
if set(obrazky) - nazvy:
    varovani.append("obrázky k neexistujícím drinkům: " + seznam(set(obrazky) - nazvy))
chybi_foto = [s for s in obrazky.values() if not os.path.exists(os.path.join(DATA, "img", s))]
if chybi_foto:
    varovani.append("v data/img chybí soubory: " + seznam(chybi_foto))
# surovina, kterou nepoužívá žádný recept ani žádná záměna, v baru jen překáží
pouzite = {s["id"] for d in drinky for s in d["suroviny"]}
pouzite |= {i for sk in nahrady for i in sk["skupina"]}
if ids - pouzite:
    varovani.append("suroviny bez jediného receptu: " + seznam(ids - pouzite))

for v in varovani:
    print("Pozor —", v)
if chyby:
    for c in chyby:
        print("CHYBA —", c)
    sys.exit("Data obsahují chyby, nic se negenerovalo.")

# přimíchat trivii a klíčová slova (klíč = název drinku)
for d in drinky:
    t = trivia.get(d["nazev"])
    if t:
        d["trivia"] = t["trivia"]
        d["klicova_slova"] = t.get("klicova_slova", [])

data = {"suroviny": suroviny, "nahrady": nahrady, "drinky": drinky,
        "obrazky": obrazky, "znacky": znacky}

# ---------- 2) data/data.js ----------
with open(os.path.join(DATA, "data.js"), "w", encoding="utf-8") as f:
    f.write("// Generováno skriptem sestav.py — needitovat ručně, upravuj JSONy.\n")
    f.write("window.BARMAN_DATA = ")
    json.dump(data, f, ensure_ascii=False, indent=1)
    f.write(";\n")
print(f"OK: data/data.js — {len(suroviny)} surovin, {len(drinky)} drinků, "
      f"{sum(len(z) for z in znacky.values())} značek, {len(obrazky)} obrázků")

# ---------- 3) barman_komplet.html ----------
vlozene = {}
for nazev, soubor in obrazky.items():
    cesta = os.path.join(DATA, "img", soubor)
    if os.path.exists(cesta):
        with open(cesta, "rb") as f:
            vlozene[nazev] = "data:image/jpeg;base64," + base64.b64encode(f.read()).decode()
vlozena_data = "window.BARMAN_DATA = " + json.dumps(
    dict(data, obrazky=vlozene), ensure_ascii=False) + ";"

html = precti("barman.html")
# Rozdávaný soubor nesmí nikam volat. Kód počítadla se proto vždy vyprázdní,
# ať už je v barman.html jakýkoli — samotná kontrola na file:// by stačila,
# ale tohle je pojistka pro případ, že si soubor někdo pověsí na web.
html = re.sub(r'window\.METRIKA_KOD\s*=\s*"[^"]*"', 'window.METRIKA_KOD = ""', html)
for znacka, obsah in (('<script src="engine.js"></script>', precti("engine.js")),
                      ('<script src="data/data.js"></script>', vlozena_data)):
    if znacka not in html:
        sys.exit(f"V barman.html chybí {znacka} — komplet nejde sestavit.")
    html = html.replace(znacka, "<script>\n" + obsah + "\n</script>")
if 'window.METRIKA_KOD = ""' not in html:
    sys.exit("V barman.html se nenašel kód počítadla — komplet by mohl volat ven.")

vystup = os.path.join(PROJEKT, "barman_komplet.html")
with open(vystup, "w", encoding="utf-8") as f:
    f.write(html)
print(f"OK: barman_komplet.html — {os.path.getsize(vystup) / 1024 / 1024:.1f} MB, "
      f"{len(vlozene)} fotek vloženo, počítadlo návštěv vyprázdněno")

# ---------- 4) testy ----------
try:
    vysledek = subprocess.run(["node", os.path.join(DATA, "test_engine.js")],
                              capture_output=True, text=True)
except FileNotFoundError:
    sys.exit("Node.js není nainstalovaný — testy enginu neproběhly.")
if vysledek.returncode != 0:
    print(vysledek.stdout)
    sys.exit("TESTY SELHALY — nepushovat, nerozdávat.")
print(f"OK: testy enginu — {vysledek.stdout.count('✓') - 1} kontrol prošlo")
