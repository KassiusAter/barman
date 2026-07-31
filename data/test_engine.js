#!/usr/bin/env node
/* Testy enginu projektu Barman: node data/test_engine.js */
"use strict";
const fs = require("fs");
const path = require("path");
const Barman = require(path.join(__dirname, "..", "engine.js"));

const drinky = JSON.parse(fs.readFileSync(path.join(__dirname, "drinky.json"))).drinky;
const suroviny = JSON.parse(fs.readFileSync(path.join(__dirname, "suroviny.json"))).suroviny;

/* přimíchat trivii stejně jako sestav_data.py */
const trivia = JSON.parse(fs.readFileSync(path.join(__dirname, "trivia.json")));
drinky.forEach(d => {
  if (trivia[d.nazev]) {
    d.trivia = trivia[d.nazev].trivia;
    d.klicova_slova = trivia[d.nazev].klicova_slova || [];
  }
});

let chyb = 0;
function ok(podminka, popis) {
  if (podminka) console.log("  ✓ " + popis);
  else { chyb++; console.log("  ✗ SELHALO: " + popis); }
}
function nazvy(sekce) { return sekce.map(z => z.drink.nazev); }

/* ---- Inventář 1: začátečník ---- */
console.log("\n[1] Začátečník: vodka, tonik, cola, citron, pomerančový džus");
const inv1 = ["vodka", "tonik", "cola", "citron", "dzus-pomerancovy"];
let v = Barman.vyhodnot(drinky, suroviny, inv1, 0);
console.log("  Hned: " + (nazvy(v.hned).join(", ") || "nic"));
ok(nazvy(v.hned).includes("Screwdriver"), "Screwdriver jde připravit hned (vodka + džus)");
ok(!nazvy(v.hned).includes("Beton"), "Beton nejde (chybí Becherovka)");

v = Barman.vyhodnot(drinky, suroviny, inv1, 1);
ok(nazvy(v.dokoupit).includes("Beton"), "s tolerancí 1 se Beton nabízí k dokoupení");
const beton = v.dokoupit.find(z => z.drink.nazev === "Beton");
ok(beton && beton.chybi.length === 1 && beton.chybi[0] === "becherovka",
  "u Betonu chybí právě Becherovka");
ok(v.radce.length > 0 && v.radce[0].odemkne >= v.radce[v.radce.length - 1].odemkne,
  "rádce je seřazený od nejužitečnějšího nákupu");
const becherRadce = v.radce.find(r => r.id === "becherovka");
ok(becherRadce && becherRadce.odemkne >= 1, "rádce ví, že Becherovka odemkne Beton");

/* ---- Inventář 2: česká hospoda ---- */
console.log("\n[2] Česká hospoda: becherovka, fernet, zelená, griotka, vaječňák, tuzemák, světlé pivo, tonik, vodka");
const inv2 = ["becherovka", "fernet", "zelena", "griotka", "vajecny-liker",
  "rum-tuzemsky", "pivo-svetle", "tonik", "vodka"];
v = Barman.vyhodnot(drinky, suroviny, inv2, 0);
console.log("  Hned (" + v.hned.length + "): " + nazvy(v.hned).join(", "));
["Beton", "Bavorák", "Mozek", "Žabí hlen", "Zelený mozek", "Semafor", "Šavle meče",
  "Cikán v jeteli", "Hornická vlajka", "Koně v trávě", "Vetřelec", "Polská vlajka",
  "Krvavá záda", "Magické oko", "Cesta do lesa", "Vodníkovo sperma"]
  .forEach(n => {
    const ceka = n !== "Vodníkovo sperma";
    ok(nazvy(v.hned).includes(n) === ceka,
      n + (ceka ? " jde připravit hned" : " nejde (chybí smetana)"));
  });
ok(v.hned.length >= 15, "hospoda umíchá aspoň 15 drinků hned (má " + v.hned.length + ")");

/* filtr typu */
v = Barman.vyhodnot(drinky, suroviny, inv2, 0, { typ: "shot" });
ok(v.hned.every(z => z.drink.typ === "shot"), "filtr typ=shot vrací jen shoty");

/* ---- Inventář 3: domácí koktejlový bar ---- */
console.log("\n[3] Domácí bar: gin, vodka, bílý rum, triple sec, limetka, citron, cukrový sirup, sodovka, tonik, máta");
const inv3 = ["gin", "vodka", "rum-bily", "triple-sec", "limetka", "citron",
  "cukrovy-sirup", "sodovka", "tonik", "mata"];
v = Barman.vyhodnot(drinky, suroviny, inv3, 2);
console.log("  Hned (" + v.hned.length + "): " + nazvy(v.hned).join(", "));
["Mojito", "Daiquiri", "Gin & Tonic", "Gin Fizz", "Tom Collins", "White Lady",
  "Southside", "Virgin Mojito"].forEach(n =>
  ok(nazvy(v.hned).includes(n), n + " jde připravit hned"));
ok(!nazvy(v.hned).includes("Margarita"), "Margarita nejde (chybí tequila)");
const marg = v.dokoupit.find(z => z.drink.nazev === "Margarita");
ok(marg && marg.chybi.join() === "tequila",
  "Margaritě chybí jen tequila (sůl je volitelná)");
const liit = v.dokoupit.find(z => z.drink.nazev === "Long Island Iced Tea");
ok(liit && liit.chybi.length === 2 && liit.chybi.includes("tequila") && liit.chybi.includes("cola"),
  "Long Islandu chybí přesně tequila a cola (tolerance 2)");
const radceTequila = v.radce.find(r => r.id === "tequila");
ok(radceTequila && radceTequila.odemkne >= 1, "rádce doporučuje tequilu (odemkne Margaritu)");

/* ---- nealko filtr ---- */
console.log("\n[4] Nealko filtr a vyhledávání");
v = Barman.vyhodnot(drinky, suroviny, inv3, 0, { jenNealko: true });
ok(v.hned.every(z => z.drink.nealko === true), "jenNealko vrací jen nealko drinky");
ok(nazvy(v.hned).includes("Virgin Mojito"), "Virgin Mojito v nealko výběru");

/* ---- vyhledávání vč. přezdívek a diakritiky ---- */
ok(Barman.najdiDrinky(drinky, "flusanec").some(d => d.nazev === "Žabí hlen"),
  "hledání „flusanec“ najde Žabí hlen (přezdívka)");
ok(Barman.najdiDrinky(drinky, "zabi").some(d => d.nazev === "Žabí hlen"),
  "hledání bez diakritiky („zabi“) funguje");
ok(Barman.najdiDrinky(drinky, "bavorak").some(d => d.nazev === "Bavorák"),
  "hledání „bavorak“ najde Bavorák");

/* ---- asociativní hledání přes trivii a klíčová slova ---- */
console.log("\n[4b] Trivia a asociativní hledání");
ok(drinky.every(d => d.trivia), "všech " + drinky.length + " drinků má trivii");
ok(Barman.najdiDrinky(drinky, "hemingway").some(d => d.nazev === "Daiquiri"),
  "„hemingway“ najde Daiquiri");
ok(Barman.najdiDrinky(drinky, "dajkyry").some(d => d.nazev === "Daiquiri"),
  "zkomolenina „dajkyry“ najde Daiquiri");
ok(Barman.najdiDrinky(drinky, "lebowski").some(d => d.nazev === "White Russian"),
  "„lebowski“ najde White Russian");
ok(Barman.najdiDrinky(drinky, "protřepat").some(d => d.nazev === "Dry Martini"),
  "„protřepat“ najde Dry Martini");
ok(Barman.najdiDrinky(drinky, "expo").some(d => d.nazev === "Beton"),
  "„expo“ najde Beton");
ok(Barman.najdiDrinky(drinky, "kocovina").some(d => d.nazev === "Bloody Mary"),
  "„kocovina“ najde Bloody Mary");
ok(Barman.najdiDrinky(drinky, "sex ve meste").some(d => d.nazev === "Cosmopolitan"),
  "„sex ve meste“ (bez diakritiky) najde Cosmopolitan");
ok(Barman.najdiDrinky(drinky, "ridic").some(d => d.nealko),
  "„řidič“ nabídne nealko drinky");
ok(Barman.najdiDrinky(drinky, "adams").some(d => d.nazev === "Supercloumák"),
  "„adams“ najde Supercloumák (kniha)");
ok(Barman.najdiDrinky(drinky, "svejk").some(d => d.nazev === "Šavle meče"),
  "„švejk“ najde Šavle meče (kniha)");
ok(Barman.najdiDrinky(drinky, "utopeny komunista").some(d => d.nazev === "Polská vlajka"),
  "přezdívka „utopený komunista“ najde Polskou vlajku");
ok(Barman.najdiDrinky(drinky, "krkonose").some(d => d.nazev === "Medvědí mléko"),
  "„krkonoše“ najdou Medvědí mléko");

/* ---- základní suroviny ---- */
console.log("\n[5] Základní suroviny (cukr, led, sůl…) se nepočítají jako chybějící");
v = Barman.vyhodnot(drinky, suroviny, ["cachaca", "limetka"], 0);
ok(nazvy(v.hned).includes("Caipirinha"),
  "Caipirinha jde s cachaçou a limetkou (cukr je základní)");

/* ---- „chutná mi“: řazení podle oblíbených surovin ---- */
console.log("\n[5b] Oblíbené suroviny řadí drinky dopředu");
const invGin = ["gin", "vodka", "rum-bily", "triple-sec", "limetka", "citron",
  "cukrovy-sirup", "sodovka", "tonik", "mata"];
let bezPrefu = Barman.vyhodnot(drinky, suroviny, invGin, 0).hned.map(z => z.drink.nazev);
let sPrefy = Barman.vyhodnot(drinky, suroviny, invGin, 0, { oblibene: ["gin"] });
ok(sPrefy.hned.slice(0, 4).every(z => z.oblibenych > 0),
  "s oblíbeným ginem jsou ginové drinky první: " + sPrefy.hned.slice(0, 4).map(z => z.drink.nazev).join(", "));
ok(sPrefy.hned.length === bezPrefu.length, "řazení nemění počet nabídnutých drinků");
ok(sPrefy.hned.every(z => typeof z.oblibenych === "number"), "každý záznam nese počet oblíbených surovin");
const mojito = sPrefy.hned.find(z => z.drink.nazev === "Mojito");
ok(mojito && mojito.oblibenych === 0, "Mojito bez ginu má oblibenych = 0");
/* uvnitř sekce „dokoupit“ rozhoduje nejdřív počet chybějících surovin */
const dok = Barman.vyhodnot(drinky, suroviny, invGin, 2, { oblibene: ["tequila"] }).dokoupit;
ok(dok.every((z, i) => i === 0 || dok[i - 1].chybi.length <= z.chybi.length),
  "v sekci dokoupit rozhoduje dál počet chybějících surovin");

/* ---- logické záměny surovin ---- */
console.log("\n[6] Logické záměny (citron ↔ limetka apod.)");
const NAHRADY = JSON.parse(fs.readFileSync(path.join(__dirname, "suroviny.json"))).nahrady;
/* Daiquiri = bílý rum + limetka + sirup; máme citron místo limetky a tuzemák místo bílého rumu */
v = Barman.vyhodnot(drinky, suroviny, ["rum-tuzemsky", "citron", "cukrovy-sirup"], 0, { nahrady: NAHRADY });
let dq = v.hned.find(z => z.drink.nazev === "Daiquiri");
ok(dq, "Daiquiri jde připravit se záměnami (citron za limetku, tuzemák za bílý rum)");
ok(dq && dq.zameny.length === 2 &&
  dq.zameny.some(z => z.za === "limetka" && z.nahrada === "citron") &&
  dq.zameny.some(z => z.za === "rum-bily" && z.nahrada === "rum-tuzemsky"),
  "záznam nese obě záměny s id i názvy");
/* bez nahrad se Daiquiri nesmí objevit v hned */
v = Barman.vyhodnot(drinky, suroviny, ["rum-tuzemsky", "citron", "cukrovy-sirup"], 0);
ok(!nazvy(v.hned).includes("Daiquiri"), "bez záměn Daiquiri v sekci hned není");
/* White Russian s mlékem místo smetany */
v = Barman.vyhodnot(drinky, suroviny, ["vodka", "kavovy-liker", "mleko"], 0, { nahrady: NAHRADY });
const wr = v.hned.find(z => z.drink.nazev === "White Russian");
ok(wr && wr.zameny.some(z => z.za === "smetana" && z.nahrada === "mleko"),
  "White Russian jde s mlékem místo smetany");
/* Bee's Knees: med je zaměnitelný za cukr (základní) → jde jen s ginem a citronem */
v = Barman.vyhodnot(drinky, suroviny, ["gin", "citron"], 0, { nahrady: NAHRADY });
const bk = v.hned.find(z => z.drink.nazev === "Bee's Knees");
ok(bk && bk.zameny.some(z => z.za === "med"),
  "Bee's Knees jde s cukrem místo medu (základní surovina jako náhrada)");
/* rádce nesmí doporučovat surovinu, kterou pokryje záměna */
v = Barman.vyhodnot(drinky, suroviny, ["rum-tuzemsky", "citron", "cukrovy-sirup"], 1, { nahrady: NAHRADY });
ok(!v.radce.some(r => r.id === "limetka" && r.odemkne > 0 &&
    v.hned.some(z => z.drink.nazev === "Daiquiri")),
  "rádce nepočítá Daiquiri mezi drinky odemykatelné limetkou (už jde přes citron)");

console.log("\n" + (chyb === 0 ? "VŠECHNY TESTY PROŠLY ✓" : chyb + " TESTŮ SELHALO ✗"));
process.exit(chyb === 0 ? 0 : 1);
