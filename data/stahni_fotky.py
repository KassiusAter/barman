#!/usr/bin/env python3
"""Stáhne fotky drinků z TheCocktailDB do data/img/ a vytvoří data/obrazky.json
(mapa: název drinku z drinky.json -> soubor obrázku). České drinky v DB nejsou,
ty dostanou SVG fallback v aplikaci."""
import json, time, urllib.parse, os, subprocess

def stahni(url, do_souboru=None):
    """curl místo urllib — python.org build na macOS nemá SSL certifikáty"""
    cmd = ["curl", "-s", "--max-time", "25", url]
    if do_souboru:
        cmd += ["-o", do_souboru]
        subprocess.run(cmd, check=True)
        return None
    return subprocess.run(cmd, check=True, capture_output=True).stdout

BASE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(BASE, "img")
os.makedirs(IMG, exist_ok=True)

# název v drinky.json -> hledaný název v TheCocktailDB
MAPA = {
    "Mojito": "Mojito", "Daiquiri": "Daiquiri", "Margarita": "Margarita",
    "Piña Colada": "Pina Colada", "Cuba Libre": "Cuba Libre", "Negroni": "Negroni",
    "Americano": "Americano", "Old Fashioned": "Old Fashioned",
    "Whiskey Sour": "Whiskey Sour", "Manhattan": "Manhattan",
    "Dry Martini": "Dry Martini", "Cosmopolitan": "Cosmopolitan",
    "Sex on the Beach": "Sex on the Beach", "Tequila Sunrise": "Tequila Sunrise",
    "Sea Breeze": "Sea breeze", "Long Island Iced Tea": "Long Island Tea",
    "Mai Tai": "Mai Tai", "Bloody Mary": "Bloody Mary", "Moscow Mule": "Moscow Mule",
    "Dark 'n' Stormy": "Dark and Stormy", "Espresso Martini": "Espresso Martini",
    "White Russian": "White Russian", "Black Russian": "Black Russian",
    "Irish Coffee": "Irish Coffee", "B52": "B-52", "Grasshopper": "Grasshopper",
    "Brandy Alexander": "Brandy Alexander", "Sidecar": "Sidecar",
    "White Lady": "White Lady", "French 75": "French 75", "Bellini": "Bellini",
    "Mimosa": "Mimosa", "Kir": "Kir", "Gin Fizz": "Gin Fizz",
    "Tom Collins": "Tom Collins", "Paloma": "Paloma", "Caipirinha": "Caipirinha",
    "Mint Julep": "Mint Julep", "Boulevardier": "Boulevardier",
    "Screwdriver": "Screwdriver", "Gin & Tonic": "Gin Tonic",
    "Amaretto Sour": "Amaretto Sour", "Sangria": "Sangria",
    "Aperol Spritz": "Aperol Spritz", "Hugo": "Hugo", "Bee's Knees": "Bee's Knees",
    "Gin Basil Smash": "Gin Basil Smash", "Southside": "Southside",
    "Garibaldi": "Garibaldi", "Virgin Mojito": "Virgin Mojito",
    "Shirley Temple": "Shirley Temple", "Virgin Colada": "Pina Colada",
    "Jägerbomb": "Jagerbomb", "Vodka Semtex": "Vodka Red Bull",
}

def slug(name):
    tab = str.maketrans("áčďéěíňóřšťúůýžÁÉ&'ñ ", "acdeeinorstuuyzAE__n-")
    return "".join(c for c in name.translate(tab).lower() if c.isalnum() or c == "-")

vysledek, chybi = {}, []
for nazev, dotaz in MAPA.items():
    url = "https://www.thecocktaildb.com/api/json/v1/1/search.php?s=" + urllib.parse.quote(dotaz)
    try:
        data = json.loads(stahni(url))
        drinks = data.get("drinks") or []
        thumb = drinks[0].get("strDrinkThumb") if drinks else None
        if not thumb:
            chybi.append(nazev); continue
        fn = slug(nazev) + ".jpg"
        cesta = os.path.join(IMG, fn)
        if not os.path.exists(cesta):
            stahni(thumb + "/medium", cesta)
        vysledek[nazev] = fn
    except Exception as e:
        chybi.append(f"{nazev} ({e})")
    time.sleep(0.3)

json.dump(vysledek, open(os.path.join(BASE, "obrazky.json"), "w"),
          ensure_ascii=False, indent=2)
print(f"Staženo: {len(vysledek)} fotek do {IMG}")
print("Bez fotky (SVG fallback):", ", ".join(chybi) if chybi else "nic")
