# 🍸 Barman

**Zapiš si, co máš doma v baru — a hned vidíš, co si můžeš namíchat.**

Jednosouborová webová aplikace (čisté HTML/CSS/JavaScript, žádné závislosti,
žádný server) pro domácí barmany. Zaškrtáš suroviny, které vlastníš, a engine
ti ukáže, které drinky zvládneš připravit hned, které jsou na dosah jedné až
tří chybějících lahví — a kterou láhev koupit, aby ti odemkla nejvíc nových
drinků.

## Funkce

- **119 receptů**: oficiální IBA koktejly (Mojito, Negroni, Espresso Martini…),
  světová klasika (Gin & Tonic, White Russian, B52…) a zejména **česká
  hospodská a retro klasika** — Beton, Bavorák, Magické oko, Semafor, Mozek,
  Vodníkovo sperma, Cesta do lesa, TGV, Kofila, Béžovice, multimíchačky
  i Drátěnka.
- **Tolerance nákupu 0–3**: posuvníkem určíš, kolik surovin jsi ochoten
  dokoupit; aplikace vypíše, co přesně chybí.
- **Nákupní rádce**: „Kup Becherovku — odemkne 2 drinky hned, přiblíží 3 další.“
- **Logické záměny surovin**: nemáš limetku, ale máš citron? Drink se nabídne
  se zřetelně vyznačenou domácí záměnou (citron ↔ limetka, cukr ↔ sirup ↔ med,
  rumy mezi sebou, smetana ↔ mléko…).
- **Rozpoznávání obchodních značek**: napiš „Guinness“ a aplikace ví, že máš
  černé pivo; „zlatá Sierra“ znamená tequilu. Přes 550 značek, toleruje překlepy
  i skloňování.
- **Vlastní suroviny**: domácí slivovice, meruňkovice, ořechovka — cokoli si
  přidáš, eviduje se v inventáři.
- **Trivia a chytré hledání**: každý drink má zajímavost a asociativní klíčová
  slova — „hemingway“ najde Daiquiri, „lebowski“ White Russian, „švejk“ Šavli
  meče, „flusanec“ Žabí hlen.
- **Postup a servírování** u každého drinku: kroky přípravy, sklenice, ozdoba;
  47 drinků má fotografii, ostatní kreslenou SVG siluetu s barevnými vrstvami
  podle surovin (vrstvené panáky jako Semafor vypadají přesně tak, jak mají).
- **Soukromí**: inventář se ukládá jen v prohlížeči (localStorage) + export
  a import zálohy do souboru. Nic se nikam neposílá.

## Spuštění

Stáhni repozitář a otevři **`barman.html`** v prohlížeči. Hotovo — žádná
instalace, žádný build, žádný server.

Pro poslání kamarádovi jedním souborem slouží **`barman_komplet.html`**
(vše včetně fotek vloženo dovnitř, ~1,4 MB); generuje se skriptem
`python3 data/sestav_distribuci.py`.

## Struktura projektu

| Soubor | K čemu |
|---|---|
| `barman.html` | celá aplikace (UI) |
| `engine.js` | logika: vyhodnocení inventáře, záměny, nákupní rádce, hledání |
| `data/suroviny.json` | slovník 82 surovin + skupiny logických záměn |
| `data/drinky.json` | 119 receptů (zdroj pravdy) |
| `data/trivia.json` | zajímavosti a klíčová slova pro asociativní hledání |
| `data/znacky.json` | obchodní názvy → obecné suroviny |
| `data/data.js` | vygenerovaný balík dat pro prohlížeč (`sestav_data.py`) |
| `data/img/` | fotografie drinků (TheCocktailDB) |
| `data/test_engine.js` | testy enginu (`node data/test_engine.js`) |

## Úprava receptů

1. Edituj `data/drinky.json`, `data/suroviny.json` či `data/trivia.json`.
2. Přegeneruj data: `python3 data/sestav_data.py`
3. Obnov stránku. (Testy: `node data/test_engine.js`.)

## Zdroje a poděkování

- **Vybrané české lidové recepty byly zařazeny z knihy Alexandra Guhy
  „Pravé české míchačky“ (UK media, 2010) — velký dík patří jejímu autorovi.**
  Kniha je kulturologická studie českého alkoholového folklóru a vřele ji
  doporučujeme; recepty zde jsou přepsány vlastními slovy.
- Oficiální světové koktejly vycházejí ze seznamu **IBA** (International
  Bartenders Association).
- Fotografie drinků pocházejí z databáze **TheCocktailDB**.
- Část seznamu obchodních značek vychází z veřejného katalogu e-shopu
  **Warehouse #1** (warehouse1.cz).

## Licence

Kód je k dispozici pod licencí MIT (viz `LICENSE`). Recepty jsou lidové
a klasické receptury; pijte s mírou. 🥂
