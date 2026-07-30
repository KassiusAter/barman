# Projekt Barman — plán

**Cíl:** Aplikace, do které si uživatel zapíše svůj domácí bar (alkohol i nealko) a engine mu ukáže:
1. jaké míchané drinky si může připravit **hned teď**,
2. jaké drinky by mohl připravit, kdyby dokoupil **1, 2 nebo 3 suroviny** (tzv. tolerance),
3. bonus: **kterou jednu láhev koupit**, aby odemkla nejvíc nových drinků.

---

## V čem to poběží (doporučení)

**Jeden samostatný HTML soubor** (`barman.html`) — HTML + CSS + JavaScript v jednom.

Proč:
- Otevře se poklepáním v jakémkoli prohlížeči (Mac, Windows, mobil), **žádná instalace, žádný server**.
- Inventář se ukládá do `localStorage` prohlížeče — přežije zavření okna, nic se nikam neposílá.
- Jde snadno sdílet (poslat soubor manželce, nahrát na web) — sedí to k preferenci lokálních souborů.
- Volitelně jde později publikovat jako Artifact (odkaz na claude.ai) pro přístup z mobilu.

Alternativy zvážené a zamítnuté:
- *Python/Flask server* — zbytečná složitost, musel by běžet proces.
- *Nativní aplikace* — overkill pro tabulku a filtr.

## Pomůcky / stavební kameny

| Co | Čím |
|---|---|
| UI + logika | čisté HTML/CSS/JS, bez frameworků a bez externích knihoven |
| Databáze receptů | vlastní JSON (`data/drinky.json`), ~60–100 klasik (IBA koktejly + česká klasika) |
| Slovník surovin | vlastní JSON (`data/suroviny.json`) s kategoriemi a normalizací názvů |
| Ukládání inventáře | `localStorage` (+ tlačítko export/import JSON pro zálohu) |
| Mezikroky a testy | tato složka `~/AI/barman/` |

## Datový model

**Surovina** (`data/suroviny.json`):
```json
{ "id": "gin", "nazev": "Gin", "kategorie": "lihovina", "alko": true }
```
Kategorie: `lihovina`, `likér`, `víno/vermut`, `nealko/mixér`, `šťáva`, `sirup`, `ostatní` (ozdoby a led engine ignoruje, aby nekazily skóre).

**Drink** (`data/drinky.json`):
```json
{
  "nazev": "Gin & Tonic",
  "sklenice": "highball",
  "suroviny": [
    { "id": "gin", "mnozstvi": "50 ml" },
    { "id": "tonik", "mnozstvi": "150 ml" }
  ],
  "postup": "Do sklenice s ledem nalij gin, dolij tonikem, zamíchej.",
  "ozdoba": "plátek limetky"
}
```

## Engine (jádro logiky)

Pro každý drink spočítá `chybi = suroviny drinku − inventář uživatele`:
- `chybi == 0` → **„Můžeš míchat hned"** (zelená sekce)
- `chybi <= tolerance` (1–3 dle nastavení) → **„Dokup: …"** (žlutá sekce, vypíše konkrétní chybějící položky)
- jinak drink nezobrazovat (nebo šedě v rozbalovací sekci „vše ostatní")

**Nákupní rádce:** pro každou surovinu, kterou uživatel nemá, spočítat, kolik drinků by její koupě odemkla → seřadit → „Kup Angosturu, odemkne ti 6 drinků."

## Detail drinku: postup a servírování

Každý drink v detailu zobrazí:
- **Postup přípravy** krok za krokem (pole `postup` — protřepat/míchat/přímo do sklenice, pořadí surovin).
- **Servírování:** typ sklenice (`sklenice`), ozdoba (`ozdoba`), led ano/ne, případně poznámka („podávej s brčkem", „vychlazená sklenice").
- **Vizuál drinku** — jak drink vypadá. Varianty:
  1. **Fotografie z TheCocktailDB** (thecocktaildb.com) — volně dostupné fotky ke klasickým koktejlům; stáhneme je jednorázově do `data/img/` a HTML je načte lokálně. Nejhezčí výsledek, pro osobní použití bez problému. *(doporučeno)*
  2. **SVG ilustrace** — jednoduchá kreslená silueta sklenice s barvou drinku (barva se dá odvodit ze surovin). Žádné stahování, vše v jednom souboru, ale méně „šťavnaté".
  3. Kombinace: SVG jako fallback pro drinky, ke kterým fotka není.

Pozn.: pokud by aplikace měla být opravdu **jediný** soubor (např. pro Artifact/poslání mailem), fotky by se musely vložit přímo do HTML jako data-URI — soubor pak naroste na jednotky až desítky MB. Pro lokální použití je čistší HTML + složka `img/` vedle sebe.

## Fáze stavby

1. **Data** — sestavit `suroviny.json` (~80 položek) a `drinky.json` (~60–100 receptů, česky). Zdroj: IBA oficiální koktejly + běžná klasika (Cuba Libre, Mojito, Aperol Spritz…) + pár nealko drinků.
2. **Engine** — matching logika, otestovat na pár vzorových inventářích (testovací skript v `data/`).
   - Součástí fáze 1–2: stáhnout fotky drinků z TheCocktailDB do `data/img/` a spárovat je s recepty.
3. **UI** — `barman.html`: záložka *Můj bar* (zaškrtávání surovin po kategoriích + vyhledávání), záložka *Drinky* (výsledky + posuvník tolerance 0–3), detail drinku (recept, postup).
4. **Ladění** — export/import inventáře, drobnosti (filtr jen nealko drinky, počet porcí…).

Odhad: fáze 1–3 zvládneme v jedné až dvou seancích, není tu nic technicky riskantního.

## Otevřené otázky (rozhodneme za chodu)

- Počítat i „samozřejmosti" (cukr, led, voda) jako suroviny? Návrh: mít je v datech, ale defaultně je považovat za „vždy doma".
- Chce Marek i vlastní recepty přidávané z UI, nebo stačí editace JSON? (v1: jen JSON, jednodušší)
