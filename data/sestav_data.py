#!/usr/bin/env python3
"""Sestaví data/data.js z JSON souborů (suroviny, drinky, obrázky).
Prohlížeč neumí načíst lokální JSON přes fetch (CORS na file://),
proto se data vkládají jako <script src="data/data.js">.
Spustit po každé úpravě JSONů: python3 data/sestav_data.py"""
import json, os

BASE = os.path.dirname(os.path.abspath(__file__))

def nacti(soubor):
    with open(os.path.join(BASE, soubor), encoding="utf-8") as f:
        return json.load(f)

_sur = nacti("suroviny.json")
data = {
    "suroviny": _sur["suroviny"],
    "nahrady": _sur.get("nahrady", []),
    "drinky": nacti("drinky.json")["drinky"],
    "obrazky": nacti("obrazky.json") if os.path.exists(os.path.join(BASE, "obrazky.json")) else {},
    "znacky": nacti("znacky.json")["znacky"] if os.path.exists(os.path.join(BASE, "znacky.json")) else {},
}

# kontrola: každé id ve znacky.json musí existovat v surovinách
_ids = {s["id"] for s in data["suroviny"]}
_spatne = [i for i in data["znacky"] if i not in _ids]
if _spatne:
    print("Pozor, znacky.json odkazuje na neznámé suroviny:", ", ".join(_spatne))

# přimíchat trivii a klíčová slova (data/trivia.json, klíč = název drinku)
if os.path.exists(os.path.join(BASE, "trivia.json")):
    trivia = nacti("trivia.json")
    bez_trivie = []
    for d in data["drinky"]:
        t = trivia.get(d["nazev"])
        if t:
            d["trivia"] = t["trivia"]
            d["klicova_slova"] = t.get("klicova_slova", [])
        else:
            bez_trivie.append(d["nazev"])
    if bez_trivie:
        print("Pozor, drinky bez trivie:", ", ".join(bez_trivie))

with open(os.path.join(BASE, "data.js"), "w", encoding="utf-8") as f:
    f.write("// Generováno skriptem sestav_data.py — needitovat ručně, upravuj JSONy.\n")
    f.write("window.BARMAN_DATA = ")
    json.dump(data, f, ensure_ascii=False, indent=1)
    f.write(";\n")

print(f"OK: data.js — {len(data['suroviny'])} surovin, {len(data['drinky'])} drinků, {len(data['obrazky'])} obrázků")
