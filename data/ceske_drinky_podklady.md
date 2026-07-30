# Podklady: tradiční české (hospodské/retro) míchané drinky

Rešerše 30. 7. 2026 pro databázi `drinky.json`. Zdroje dole. Pozn.: část z nich jsou
vrstvené panáky („shoty"), ne longdrinky — v databázi navrhuju odlišit polem
`typ: "longdrink" | "shot" | "pivní mix"`.

## Longdrinky

### Beton *(český národní koktejl, hit 80. let)*
- 40 ml Becherovka, 100 ml tonik, led
- Sklenici naplnit ledem, nalít Becherovku, dolít tonikem, lehce promíchat.
- Servírování: longdrinková sklenice, plátek citronu.

### Bavorák
- 50 ml fernet (bylinný), 200 ml tonik, led
- Sklenici naplnit ledem, přidat fernet, dolít tonikem, promíchat barovou lžičkou.
- Servírování: longdrinková sklenice (350 ml), plátek citronu. Barvou připomíná pivo.

### Houba (Polejvák)
- Červené víno + cola/Kofola, poměr 1:1 až 2:3 dle chuti.
- Jen slít a promíchat. (Španělská obdoba: calimocho.)

### Rudé kladivo
- 1 panák rumu + 1 panák fernetu, dolít červeným (nebo ovocným) vínem.

### Lední medvěd
- Panák vodky v sektu. Stupňování: „V-2" (2 panáky), „Sojuz 3" (3 panáky).

## Vrstvené panáky (shoty)

### Vodníkovo sperma
- Zelená (peprmintový likér) + smetana/mléko (varianty: smetana do kávy, kyselá smetana, vaječný likér).
- Do panáku nalít zelenou, pomalu přilít smetanu „jako do kávy", aby se vrstvy nesmíchaly.
- Vizuální drink; mléko peprmint překvapivě zjemní. Jeden z nejlevnějších hospodských panáků.

### Mozek (Mozek v krvi)
- Griotka + vaječný likér.
- Sklenici do poloviny naplnit griotkou, vaječňák nalévat tenkým pramínkem krouživě — čím pomaleji, tím lepší „mozkové záhyby".

### Zelený mozek (Mozek vojenský)
- Zelená + vaječný koňak; vaječňák velmi zvolna vlévat do zelené (obrácený postup než Žabí hlen).

### Žabí hlen (Flusanec, Vejce se špenátem)
- Vaječný likér + zelená.
- Sklenici do poloviny naplnit vaječňákem, zelenou přilévat po obvodu sklenice nebo do středu.

### Semafor
- Vaječňák + griotka + zelená (tři vrstvy).
- Pečlivě a zvolna vrstvit po lžičce/tyčince: griotka, vaječňák, zelená.

### Šavle meče (Čert, Táta s mámou, Vrtule, Bramboračka)
- Tuzemský rum 2 díly + griotka 1 díl (nebo dle chuti), slít do panáku.

### Cikán v jeteli *(ostravská legenda)*
- Panák zelené zlehka přelít fernetem (vrstvené).

### Hornická/Havířská vlajka
- Zelená dole, fernet nahoře — vrstvit, nemíchat.

### Koně v trávě
- Zelenou opatrně přelít rumem (vrstvené).

### Vetřelec
- Zelená + fernet + rum, opatrně vrstvit v tomto pořadí.

### Polská vlajka
- Griotka + vodka 1:2, vodku opatrně vlít na griotku.

### Krvavá záda
- Panák vodky + panák griotky; rituál: pije se z vodky a griotka do ní přetéká (dle jiného zdroje se před vypitím obrací tričko naruby).

## Pivní mixy

### Magické oko (Tygří oko, Bludička)
- Do půllitru piva opatrně spustit celý panák zelené i se sklenkou. Nemíchat.

### Žabinec
- Griotka na dno půllitru, natočit černé pivo, do pěny zašlehat 2 cl zelené.

### Cesta do lesa / Cesta z lesa
- Třetinka piva: upíjet a vypité doplňovat zelenou (do lesa); obrácený postup = z lesa.

### Čambavamba *(spíš kuriozita, do DB asi ne)*
- Do půllitru panák od 11 druhů: rum, fernet, vodka, slivovice, starorežná, výčepní lihovina, becherovka, zelená, griotka, myslivec, vaječňák.

## Dopady na datový model

- Nové pole **`typ`**: `longdrink` / `shot` / `pivní mix` (+ filtr v UI).
- Nové pole **`alt_nazvy`**: lidové přezdívky (Žabí hlen = Flusanec…), aby fungovalo vyhledávání.
- Suroviny k doplnění do `suroviny.json`: **zelená (peprmintový likér), griotka, vaječný likér/koňak, fernet, becherovka, tuzemský rum, slivovice, Kofola, černé pivo, světlé pivo, sekt, smetana, červené víno**.
- Fotky: TheCocktailDB tyhle drinky mít nebude → použít SVG fallback (vrstvené shoty jsou pro SVG ideální — jde vykreslit vrstvy barvami surovin).
- Postupy u shotů = hlavně technika vrstvení → v UI dává smysl pole `postup` psát krok za krokem.

## Zdroje

- https://www.toprecepty.cz/clanky/6564-beton-bavorak-mozek-i-zabi-hlen-recepty-na-koktejly-ktere-frcely-v-socialismu-muzete-otestovat-i-dnes/
- https://www.kupi.cz/magazin/clanek/25257-koktejly-za-socialismu
- https://vebr.webnode.cz/mixy/ceskoslovenske-koktejly/
- https://alkoholia.cz/recepty/vodnikovo-sperma
- https://www.alkoholium.cz/zabi-hlen-nebo-vodnikovo-sperma-nesmysly-ne-jen-koktejly-ze-zelene/
