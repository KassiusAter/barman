/*
 * Projekt Barman — engine
 * Čistý JavaScript bez závislostí. Funguje v prohlížeči (window.Barman)
 * i v Node.js (module.exports) — v Node kvůli testům v data/test_engine.js.
 */
(function (root) {
  "use strict";

  /**
   * Vyhodnotí celou databázi drinků proti inventáři uživatele.
   *
   * @param {Array}  drinky     pole drinků z drinky.json (klíč "drinky")
   * @param {Array}  suroviny   pole surovin ze suroviny.json (klíč "suroviny")
   * @param {Iterable<string>} inventar  id surovin, které uživatel má
   * @param {number} tolerance  kolik chybějících surovin je přípustných (0–3)
   * @param {Object} [moznosti] { jenNealko: bool, typ: string|null,
   *   nahrady: Array<{skupina: string[], poznamka: string}> — skupiny
   *   logicky zaměnitelných surovin (citron ↔ limetka apod.) }
   * @returns {{ hned: Array, dokoupit: Array, ostatni: Array, radce: Array }}
   *   hned      … drinky připravitelné okamžitě (případně se záměnami)
   *   dokoupit  … drinky s 1..tolerance chybějícími surovinami (vzestupně)
   *   ostatni   … zbytek (chybí víc než tolerance)
   *   radce     … nákupní doporučení: [{ id, nazev, odemkne, priblizi }]
   *   Každý záznam nese i pole zameny: [{ za, nahrada, zaNazev, nahradaNazev }].
   */
  function vyhodnot(drinky, suroviny, inventar, tolerance, moznosti) {
    moznosti = moznosti || {};
    tolerance = Math.max(0, Math.min(3, tolerance | 0));

    var slovnik = {};       // id -> surovina
    var vlastni = new Set(); // co má uživatel (vč. základních surovin)
    suroviny.forEach(function (s) {
      slovnik[s.id] = s;
      if (s.zakladni) vlastni.add(s.id);
    });
    Array.from(inventar).forEach(function (id) { vlastni.add(id); });

    var oblibene = new Set(moznosti.oblibene || []); // „chutná mi“

    // mapa záměn: id -> pole zaměnitelných id
    var zamenitelne = {};
    (moznosti.nahrady || []).forEach(function (sk) {
      (sk.skupina || []).forEach(function (id) {
        zamenitelne[id] = (zamenitelne[id] || []).concat(
          sk.skupina.filter(function (x) { return x !== id; }));
      });
    });

    function nazevSuroviny(id) {
      return slovnik[id] ? slovnik[id].nazev : id;
    }

    var hned = [], dokoupit = [], ostatni = [];

    drinky.forEach(function (d) {
      if (moznosti.jenNealko && !d.nealko) return;
      if (moznosti.typ && d.typ !== moznosti.typ) return;

      var chybi = [], zameny = [];
      d.suroviny.forEach(function (s) {
        if (s.volitelne || vlastni.has(s.id)) return;
        var alt = (zamenitelne[s.id] || []).find(function (a) {
          return vlastni.has(a);
        });
        if (alt) zameny.push({
          za: s.id, nahrada: alt,
          zaNazev: nazevSuroviny(s.id), nahradaNazev: nazevSuroviny(alt)
        });
        else chybi.push(s.id);
      });

      var zaznam = {
        drink: d,
        chybi: chybi,
        chybiNazvy: chybi.map(nazevSuroviny),
        zameny: zameny,
        // kolik surovin drinku má uživatel označené jako „chutná mi“
        oblibenych: d.suroviny.filter(function (s) {
          return oblibene.has(s.id);
        }).length
      };
      if (chybi.length === 0) hned.push(zaznam);
      else if (chybi.length <= tolerance) dokoupit.push(zaznam);
      else ostatni.push(zaznam);
    });

    // řazení: nejdřív drinky s oblíbenými surovinami, u nedostupných pak
    // podle počtu chybějících surovin
    function podleOblibenosti(a, b) {
      return b.oblibenych - a.oblibenych ||
        a.drink.nazev.localeCompare(b.drink.nazev, "cs");
    }
    hned.sort(podleOblibenosti);
    dokoupit.sort(function (a, b) {
      return a.chybi.length - b.chybi.length || podleOblibenosti(a, b);
    });
    ostatni.sort(function (a, b) {
      return a.chybi.length - b.chybi.length || podleOblibenosti(a, b);
    });

    return {
      hned: hned,
      dokoupit: dokoupit,
      ostatni: ostatni,
      radce: nakupniRadce(dokoupit.concat(ostatni), slovnik)
    };
  }

  /**
   * Nákupní rádce: pro každou chybějící surovinu spočítá,
   * kolik drinků by její koupě odemkla hned (byla jediná chybějící)
   * a u kolika dalších by přiblížila přípravu (chybí spolu s dalšími).
   */
  function nakupniRadce(nedostupne, slovnik) {
    var skore = {}; // id -> { odemkne, priblizi }
    nedostupne.forEach(function (z) {
      z.chybi.forEach(function (id) {
        if (!skore[id]) skore[id] = { odemkne: 0, priblizi: 0 };
        if (z.chybi.length === 1) skore[id].odemkne++;
        else skore[id].priblizi++;
      });
    });
    return Object.keys(skore)
      .map(function (id) {
        return {
          id: id,
          nazev: slovnik[id] ? slovnik[id].nazev : id,
          odemkne: skore[id].odemkne,
          priblizi: skore[id].priblizi
        };
      })
      .sort(function (a, b) {
        return b.odemkne - a.odemkne || b.priblizi - a.priblizi ||
          a.nazev.localeCompare(b.nazev, "cs");
      });
  }

  /**
   * Vyhledávání drinku podle názvu, lidových přezdívek (alt_nazvy),
   * klíčových slov a textu trivie — bez ohledu na velikost písmen
   * a diakritiku. Díky klíčovým slovům funguje i nepřesné zadání
   * („hemingway“ → Daiquiri, „lebowski“ → White Russian).
   */
  function najdiDrinky(drinky, dotaz) {
    var q = normalizuj(dotaz);
    if (!q) return drinky.slice();
    return drinky.filter(function (d) {
      if (normalizuj(d.nazev).indexOf(q) !== -1) return true;
      var dalsi = (d.alt_nazvy || []).concat(d.klicova_slova || []);
      if (d.trivia) dalsi.push(d.trivia);
      return dalsi.some(function (text) {
        return normalizuj(text).indexOf(q) !== -1;
      });
    });
  }

  function normalizuj(text) {
    return String(text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  var Barman = {
    vyhodnot: vyhodnot,
    nakupniRadce: nakupniRadce,
    najdiDrinky: najdiDrinky,
    normalizuj: normalizuj
  };

  if (typeof module !== "undefined" && module.exports) module.exports = Barman;
  else root.Barman = Barman;
})(typeof window !== "undefined" ? window : globalThis);
