/*
 * Landingpage Anfrage-Assistent – Logik
 * Kein Framework, keine externen Anfragen, keine Cookies, kein Web Storage.
 * Alle Werte aus Link-Parametern werden bereinigt und nur per textContent eingesetzt.
 */
(function () {
  "use strict";

  var C = window.LANDING_CONFIG || {};
  document.documentElement.classList.add("js");

  /* ---------- Hilfsfunktionen ---------- */

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function get(obj, path, fallback) {
    var val = path.split(".").reduce(function (o, k) { return o && o[k] !== undefined ? o[k] : undefined; }, obj);
    return val === undefined || val === null ? fallback : val;
  }
  function setText(sel, text) { $all(sel).forEach(function (el) { el.textContent = text; }); }
  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }
  function icon(name) {
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "icon");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    var use = document.createElementNS(ns, "use");
    use.setAttribute("href", "#i-" + name);
    svg.appendChild(use);
    return svg;
  }
  // Platzhalter wie "[TELEFON]" gelten als „noch nicht ausgefüllt“.
  function isFilled(v) { return typeof v === "string" && v.trim() !== "" && !/^\[.*\]$/.test(v.trim()); }
  function fill(template, values) {
    return String(template).replace(/\{(\w+)\}/g, function (m, k) { return values[k] !== undefined ? values[k] : m; });
  }

  var nf0 = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });
  var nf1 = new Intl.NumberFormat("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  function euro(n) { return nf0.format(n) + " €"; }

  /* ---------- Farben ---------- */

  function isHex(v) { return typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v); }
  // Relative Helligkeit nach WCAG, um lesbare Schrift auf der Farbe zu wählen.
  function luminance(hex) {
    var rgb = [1, 3, 5].map(function (i) {
      var c = parseInt(hex.substr(i, 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  }
  function readableOn(hex) {
    var L = luminance(hex);
    var withWhite = 1.05 / (L + 0.05);
    var withDark = (L + 0.05) / (luminance("#1c2321") + 0.05);
    return withWhite >= withDark ? "#ffffff" : "#1c2321";
  }
  function darken(hex, amount) {
    var out = "#";
    for (var i = 1; i < 7; i += 2) {
      var c = Math.max(0, Math.round(parseInt(hex.substr(i, 2), 16) * (1 - amount)));
      out += ("0" + c.toString(16)).slice(-2);
    }
    return out;
  }

  /* ---------- Link-Parameter lesen und bereinigen ---------- */

  // Entfernt Steuerzeichen, lässt nur erlaubte Zeichen stehen und kürzt auf maxLen.
  function cleanText(raw, maxLen, allowed) {
    if (typeof raw !== "string") return "";
    // Werte mit Zeichen, die nach HTML oder Code aussehen, werden komplett verworfen.
    if (/[<>"`{}\\]/.test(raw)) return "";
    var s = raw.normalize ? raw.normalize("NFC") : raw;
    s = Array.from(s).filter(function (ch) { return allowed.test(ch); }).join("");
    s = s.replace(/\s+/g, " ").trim();
    return Array.from(s).slice(0, maxLen).join("").trim();
  }

  var RE_FIRMA = /[\p{L}\p{N} .,&'’+\/()-]/u;
  var RE_NAME = /[\p{L} .'’-]/u;
  var RE_ORT = /[\p{L} .\/()-]/u;

  function readParams() {
    var q = new URLSearchParams(window.location.search);
    var p = {};

    p.firma = cleanText(q.get("firma"), 60, RE_FIRMA);
    p.name = cleanText(q.get("name"), 40, RE_NAME);
    p.ort = cleanText(q.get("ort"), 50, RE_ORT);

    var farbe = (q.get("farbe") || "").trim();
    if (/^[0-9a-fA-F]{6}$/.test(farbe)) farbe = "#" + farbe;   // falls ohne # übergeben
    p.farbe = isHex(farbe) ? farbe.toLowerCase() : "";

    // PLZ: kommagetrennt, nur Ziffern (2–5 Stellen, damit auch PLZ-Bereiche wie "464" gehen), höchstens 60 Einträge
    var plz = (q.get("plz") || "").split(/[,;\s]+/).filter(function (x) { return /^\d{2,5}$/.test(x); });
    p.plz = plz.slice(0, 60).join(",");

    // Website: nur Domain + optionaler Pfad, kein HTML, keine Leerzeichen
    var web = (q.get("web") || "").trim().toLowerCase();
    p.web = /^(https?:\/\/)?[a-z0-9äöüß-]+(\.[a-z0-9äöüß-]+)*\.[a-z]{2,}(\/[a-z0-9._~\/-]*)?$/.test(web) && web.length <= 100 ? web : "";

    p.kuerzel = cleanText(q.get("kuerzel"), 6, /[A-Za-z0-9]/).toUpperCase();

    var gewerke = C.gewerke || {};
    var g = (q.get("gewerk") || "").trim().toLowerCase();
    p.gewerk = Object.prototype.hasOwnProperty.call(gewerke, g) ? g : get(C, "audience.defaultGewerk", "handwerk");
    if (!gewerke[p.gewerk]) p.gewerk = Object.keys(gewerke)[0] || "";
    return p;
  }

  var P = readParams();
  var G = (C.gewerke || {})[P.gewerk] || {};

  /* ---------- Demo-Link bauen ---------- */

  function buildDemoUrl() {
    var base = C.demoUrl || "https://berningmalte10-cloud.github.io/Anfrage-demo/";
    var parts = [];
    ["firma", "farbe", "plz", "ort", "web", "kuerzel"].forEach(function (key) {
      if (P[key]) parts.push(key + "=" + encodeURIComponent(P[key]).replace(/%2C/g, ","));
    });
    if (!parts.length) return base;
    return base + (base.indexOf("?") === -1 ? "?" : "&") + parts.join("&");
  }

  /* ---------- Allgemeine Inhalte aus config.js ---------- */

  function applyConfig() {
    var brand = get(C, "brand.name", "");
    setText("[data-brand]", brand);
    setText("[data-tagline]", get(C, "brand.tagline", ""));
    setText("[data-owner]", get(C, "owner.name", ""));
    if (brand) document.title = brand + " – " + get(C, "brand.tagline", "Anfrage-Assistent");

    // Der noindex-Hinweis steht fest in index.html (zuverlässig auch für Suchmaschinen ohne JavaScript).
    // Hier wird er nur abgeglichen, falls config.js und HTML nicht übereinstimmen.
    var robots = document.querySelector('meta[name="robots"]');
    if (C.indexable === true && robots) {
      robots.parentNode.removeChild(robots);
    } else if (C.indexable !== true && !robots) {
      var meta = document.createElement("meta");
      meta.name = "robots";
      meta.content = "noindex, nofollow";
      document.head.appendChild(meta);
    }

    // Farben der Seite
    var root = document.documentElement.style;
    var primary = get(C, "colors.primary", "");
    var accent = get(C, "colors.accent", "");
    if (isHex(primary)) {
      root.setProperty("--primary", primary);
      root.setProperty("--primary-dark", darken(primary, 0.25));
      root.setProperty("--on-primary", readableOn(primary));
      root.setProperty("--demo-accent", primary);
      root.setProperty("--on-demo", readableOn(primary));
    }
    if (isHex(accent)) {
      root.setProperty("--accent", accent);
      root.setProperty("--on-accent", readableOn(accent));
    }

    // Kontakt
    var phone = get(C, "contact.phone", "");
    var email = get(C, "contact.email", "");
    var wa = String(get(C, "contact.whatsapp", "")).replace(/\D/g, "");
    setText("[data-phone]", phone);
    var telDigits = phone.replace(/[^\d+]/g, "");
    $all("[data-tel]").forEach(function (a) {
      if (isFilled(phone) && telDigits.length >= 5) a.href = "tel:" + telDigits;
      else a.hidden = true;
    });
    $all("[data-copy-phone]").forEach(function (b) { if (!isFilled(phone)) b.hidden = true; });
    $all("[data-whatsapp]").forEach(function (a) {
      if (wa.length >= 8) {
        a.href = "https://wa.me/" + wa + "?text=" + encodeURIComponent(get(C, "contact.whatsappText", ""));
        a.hidden = false;
      }
    });
    $all("[data-mailto]").forEach(function (a) {
      // Ohne E-Mail-Adresse zeigt der Fußzeilen-Link „Kontakt“ weiter auf den Kontaktbereich.
      if (isFilled(email)) a.href = "mailto:" + email + "?subject=" + encodeURIComponent("Anfrage-Assistent");
      else if (!a.closest(".site-footer")) a.hidden = true;
    });

    // Über mich
    setText("#about-name", get(C, "owner.name", ""));
    setText("#about-region", get(C, "owner.region", ""));
    setText("#about-text", get(C, "owner.about", ""));
    var photo = get(C, "owner.photo", "");
    var slot = $("#about-photo-slot");
    if (slot && photo) {
      var img = document.createElement("img");
      img.className = "about-photo";
      img.src = photo;
      img.alt = "Foto von " + get(C, "owner.name", "");
      img.width = 160;
      img.height = 160;
      img.loading = "lazy";
      img.decoding = "async";
      slot.appendChild(img);
      slot.hidden = false;
    } else if (slot) {
      slot.parentNode.classList.add("no-photo");
    }

    var year = $("#year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  /* ---------- Personalisierung (Hero, Handy, E-Mail) ---------- */

  function applyPersonalization() {
    var audience = (G.label || "Handwerksbetriebe") + " " + get(C, "audience.region", "");
    setText("#hero-for", P.firma ? "Für " + P.firma : "Für " + audience.trim());

    if (P.name) {
      var greet = $("#hero-greeting");
      greet.textContent = "Guten Tag " + P.name + ", wie besprochen: Hier sehen Sie in zwei Minuten, wie es funktioniert.";
      greet.hidden = false;
    }

    var demo = $("#demo-link");
    if (demo) demo.href = buildDemoUrl();

    // Handy-Vorschau
    if (P.farbe) {
      var phone = $("#demo-phone");
      phone.style.setProperty("--demo-accent", P.farbe);
      phone.style.setProperty("--on-demo", readableOn(P.farbe));
    }
    setText("#phone-firm", P.firma || "Ihr Betrieb");
    if (P.firma || P.farbe) {
      setText("#phone-caption", "So sieht der erste Schritt für Ihre Kunden aus" + (P.farbe ? " – in Ihrer Farbe." : "."));
    }
    var tiles = $("#phone-tiles");
    if (tiles && G.services && G.services.length) {
      tiles.textContent = "";
      G.services.slice(0, 6).forEach(function (s, i) {
        var t = el("span", "ph-tile" + (i === 0 ? " is-selected" : ""));
        t.appendChild(icon(s.icon || "more"));
        t.appendChild(document.createTextNode(s.label));
        tiles.appendChild(t);
      });
    }

    if (G.vagueRequest) setText("#problem-vague", G.vagueRequest);

    // Rechner-Überschrift
    if (P.firma) setText("#calc-result-title", "Ihre Schätzung für " + P.firma);

    renderMail();
  }

  function renderMail() {
    var m = G.mail;
    if (!m) return;
    // Mit plz/ort-Parametern wird die Beispiel-E-Mail auf den Ort des Betriebs umgestellt.
    var plz = P.plz ? P.plz.split(",")[0] : m.plz;
    if (plz.length !== 5) plz = m.plz;
    var ort = P.ort || m.ort;
    var kuerzel = P.kuerzel || m.kuerzel;
    var year = new Date().getFullYear();
    var nummer = kuerzel + "-" + year + "-" + m.nummer;
    var vals = { plz: plz, ort: ort };

    setText("#mail-subject", (m.dringend ? "[DRINGEND] " : "") + "Neue Anfrage: " + m.leistung + " · " + plz + " " + ort + " · " + nummer);
    setText("#mail-urgency-text", m.dringlichkeit);
    var urg = $("#mail-urgency");
    if (urg) urg.classList.toggle("is-normal", !m.dringend);
    setText("#mail-leistung", m.leistung);
    setText("#mail-ort", plz + " " + ort);
    setText("#mail-beginn", m.beginn);
    setText("#mail-rueckruf", m.rueckruf);
    var kundeName = (m.kunde && m.kunde[0]) ? m.kunde[0][1] : "";
    setText("#mail-replyto", kundeName);

    function rows(target, list) {
      var dl = $(target);
      if (!dl) return;
      dl.textContent = "";
      (list || []).forEach(function (r) {
        dl.appendChild(el("dt", "", r[0]));
        dl.appendChild(el("dd", "", fill(r[1], vals)));
      });
    }
    rows("#mail-kunde", m.kunde);
    rows("#mail-auftrag", m.auftrag);
    setText("#mail-nachricht", m.nachricht ? "„" + m.nachricht + "“" : "");

    var fotos = $("#mail-fotos");
    if (fotos) {
      fotos.textContent = "";
      (m.fotos || []).slice(0, 5).forEach(function (f) {
        var li = el("li");
        li.appendChild(icon("image"));
        li.appendChild(document.createTextNode(f));
        fotos.appendChild(li);
      });
    }
  }

  /* ---------- 6. Rechner ---------- */

  // Eingabefelder: Schlüssel = Name in config.js → calculatorDefaults
  var CALC_FIELDS = [
    { group: "Rückfragen bei Anfragen" },
    { key: "anfragenProWoche", label: "Anfragen pro Woche", min: 0, max: 40, step: 1, unit: "" },
    { key: "rueckfrageAnteil", label: "Anteil, bei dem Sie zurückrufen oder nachfragen müssen", min: 0, max: 100, step: 5, unit: "%" },
    { key: "minutenProRueckfrage", label: "Minuten pro Rückfrage", min: 0, max: 60, step: 5, unit: "Min." },
    { group: "Besichtigungen" },
    { key: "besichtigungenProMonat", label: "Besichtigungen pro Monat, nur um den Aufwand einzuschätzen", min: 0, max: 40, step: 1, unit: "" },
    { key: "vermeidbarAnteil", label: "Davon mit Fotos vermeidbar", min: 0, max: 100, step: 5, unit: "%" },
    { key: "minutenProBesichtigung", label: "Minuten pro Besichtigung inkl. Fahrt", min: 0, max: 240, step: 5, unit: "Min." },
    { key: "stundensatz", label: "Ihr Stundensatz", min: 20, max: 150, step: 1, unit: "€" }
  ];
  var WEEKS_PER_MONTH = 4.33;
  var calcValues = {};

  function buildCalculator() {
    var host = $("#calc-inputs");
    var mini = $("#calc-mini");
    if (!host) return;
    var defaults = C.calculatorDefaults || {};
    var group = null;

    CALC_FIELDS.forEach(function (f) {
      if (f.group) {
        group = el("fieldset", "calc-group");
        group.appendChild(el("legend", "", f.group));
        host.insertBefore(group, mini);
        return;
      }
      var val = Number(defaults[f.key]);
      if (!isFinite(val)) val = f.min;
      val = Math.min(f.max, Math.max(f.min, val));
      calcValues[f.key] = val;

      var id = "calc-" + f.key;
      var wrap = el("div", "calc-field");
      var row = el("div", "calc-row");
      var label = el("label", "", f.label);
      label.htmlFor = id;
      label.id = id + "-label";

      var numWrap = el("span", "num-wrap");
      var num = document.createElement("input");
      num.type = "number";
      num.id = id;
      num.inputMode = "numeric";
      num.min = f.min; num.max = f.max; num.step = f.step;
      num.value = val;
      numWrap.appendChild(num);
      // Einheit immer anlegen (auch leer), damit alle Zahlenfelder bündig stehen
      var unit = el("span", "unit", f.unit);
      unit.setAttribute("aria-hidden", "true");
      numWrap.appendChild(unit);
      if (f.unit) {
        num.setAttribute("aria-describedby", id + "-unit");
        var unitSr = el("span", "visually-hidden", unitSpoken(f.unit));
        unitSr.id = id + "-unit";
        numWrap.appendChild(unitSr);
      }

      var range = document.createElement("input");
      range.type = "range";
      range.min = f.min; range.max = f.max; range.step = f.step;
      range.value = val;
      range.setAttribute("aria-labelledby", id + "-label");
      range.setAttribute("aria-valuetext", valueText(val, f.unit));

      row.appendChild(label);
      row.appendChild(numWrap);
      wrap.appendChild(row);
      wrap.appendChild(range);
      group.appendChild(wrap);

      // Schieberegler und Zahlenfeld synchron halten
      range.addEventListener("input", function () {
        num.value = range.value;
        setCalc(f, Number(range.value), range);
      });
      num.addEventListener("input", function () {
        if (num.value === "") return;
        var n = Number(num.value.replace(",", "."));
        if (!isFinite(n)) return;
        var clamped = Math.min(f.max, Math.max(f.min, n));
        range.value = clamped;
        setCalc(f, clamped, range);
      });
      num.addEventListener("change", function () {
        var n = Number(String(num.value).replace(",", "."));
        if (num.value === "" || !isFinite(n)) n = calcValues[f.key];
        n = Math.min(f.max, Math.max(f.min, n));
        num.value = n;
        range.value = n;
        setCalc(f, n, range);
      });
    });

    calculate();
  }

  function unitSpoken(unit) {
    return { "%": "Prozent", "Min.": "Minuten", "€": "Euro" }[unit] || unit;
  }
  function valueText(v, unit) {
    return nf1.format(v) + (unit ? " " + unitSpoken(unit) : "");
  }
  function setCalc(f, v, range) {
    calcValues[f.key] = v;
    range.setAttribute("aria-valuetext", valueText(v, f.unit));
    calculate();
  }

  // Rundung: Stunden auf 0,5, Euro auf 10
  function roundHalf(n) { return Math.round(n * 2) / 2; }
  function roundTen(n) { return Math.round(n / 10) * 10; }

  var calcTimer = null;
  function calculate() {
    var v = calcValues;
    // Amortisation wird mit dem Paket Classic gerechnet (einmalige Einrichtung, keine monatlichen Kosten)
    var monthly = Number(get(C, "pricing.classic.monthly", 0));
    var setup = Number(get(C, "pricing.classic.salePrice", 0)) || Number(get(C, "pricing.classic.once", 390));

    /*
     * Rechenweg (Monat = 4,33 Wochen):
     *
     * 1) Gesparte Stunden für Rückfragen
     *    = Anfragen/Woche × 4,33 × Rückfrage-Anteil × Minuten pro Rückfrage ÷ 60
     *    Standard: 5 × 4,33 × 0,60 × 15 ÷ 60 = 3,25 Std.
     *
     * 2) Gesparte Stunden für Besichtigungen
     *    = Besichtigungen/Monat × vermeidbarer Anteil × Minuten pro Besichtigung ÷ 60
     *    Standard: 4 × 0,50 × 60 ÷ 60 = 2,0 Std.
     *
     * 3) Gesparte Stunden gesamt = 1) + 2)          Standard: 5,25 Std. → angezeigt „rund 5 Stunden“
     * 4) Wert der Zeit = Stunden × Stundensatz       Standard: 5,25 × 55 € = 288,75 € → „≈ 290 €“
     *
     * 5) Amortisation in Monaten = Einrichtung ÷ (Wert der Zeit − monatliche Gebühr), nur wenn der Nenner positiv ist
     *    Standard (Paket Classic, Angebotspreis): 249 € ÷ (288,75 € − 0 €) = 0,86 → aufgerundet „etwa 1 Monat“
     */
    var hRueck = v.anfragenProWoche * WEEKS_PER_MONTH * (v.rueckfrageAnteil / 100) * v.minutenProRueckfrage / 60;
    var hBesicht = v.besichtigungenProMonat * (v.vermeidbarAnteil / 100) * v.minutenProBesichtigung / 60;
    var hours = hRueck + hBesicht;
    var timeValue = hours * v.stundensatz;
    var net = timeValue - monthly;
    var payback = net > 0 ? setup / net : null;

    // Anzeige
    var hRounded = roundHalf(hours);
    var hoursText;
    if (hours <= 0) hoursText = "0 Stunden";
    else if (hRounded < 0.5) hoursText = "Unter 1 Stunde";
    else hoursText = "Rund " + nf1.format(hRounded) + (hRounded === 1 ? " Stunde" : " Stunden");

    var paybackText;
    if (payback === null) {
      paybackText = "Bei diesen Werten spart Ihnen der Assistent kaum Zeit.";
    } else {
      var months = Math.max(1, Math.ceil(payback));
      paybackText = months > 36
        ? "Allein durch gesparte Zeit dauert es bei diesen Werten mehr als drei Jahre, bis sich die Einrichtung bezahlt gemacht hat."
        : "Die Einrichtung hat sich nach etwa " + months + (months === 1 ? " Monat" : " Monaten") + " allein durch gesparte Zeit bezahlt gemacht.";
    }

    // Kurzes Warten, damit Screenreader beim Ziehen nicht jede Zwischenstufe vorlesen
    clearTimeout(calcTimer);
    calcTimer = setTimeout(function () {
      setText("#res-hours", hoursText);
      setText("#res-hours-value", "≈ " + euro(roundTen(timeValue)) + " Arbeitszeit pro Monat");
      setText("#res-payback", paybackText);
    }, 120);

    var mini = $("#calc-mini");
    if (mini) {
      mini.textContent = "";
      mini.appendChild(el("span", "", (hRounded > 0 ? "≈ " + nf1.format(hRounded) : "0") + " Std. pro Monat"));
      mini.appendChild(el("span", "", "≈ " + euro(roundTen(timeValue))));
    }

    var steps = $("#res-steps");
    if (steps) {
      var f1 = function (n) { return nf1.format(Math.round(n * 10) / 10); };
      var lines = [
        "Rückfragen: " + v.anfragenProWoche + " Anfragen × 4,33 Wochen × " + v.rueckfrageAnteil + " % × " + v.minutenProRueckfrage + " Min. = " + f1(hRueck) + " Std.",
        "Besichtigungen: " + v.besichtigungenProMonat + " × " + v.vermeidbarAnteil + " % × " + v.minutenProBesichtigung + " Min. = " + f1(hBesicht) + " Std.",
        "Wert der Zeit: " + f1(hours) + " Std. × " + euro(v.stundensatz) + " = " + euro(Math.round(timeValue)),
        payback === null
          ? "Amortisation: Der Wert der gesparten Zeit ist zu gering."
          : "Amortisation (Paket " + get(C, "pricing.classic.name", "Classic") + "): " + euro(setup) +
            (monthly > 0 ? " ÷ (" + euro(Math.round(timeValue)) + " − " + euro(monthly) + ")" : " ÷ " + euro(Math.round(timeValue))) +
            " = " + f1(payback) + " Monate"
      ];
      steps.textContent = "";
      lines.forEach(function (t) { steps.appendChild(el("li", "", t)); });
    }
  }

  /* ---------- 8. Preise ---------- */

  function renderPricing() {
    var pr = C.pricing || {};
    var pilot = pr.pilot || {};
    var pilotOn = pilot.enabled && pilot.text;
    if (pilotOn) {
      setText("#pilot-text", fill(pilot.text, { plaetze: pilot.seats }));
      $("#pilot").hidden = false;
    }

    var host = $("#prices");
    if (!host) return;
    [["classic", false], ["premium", true]].forEach(function (pair) {
      var p = pr[pair[0]];
      if (!p) return;
      var card = el("article", "price" + (pair[1] ? " is-featured" : ""));
      var h = el("h3", "", p.name || pair[0]);
      if (pair[1]) h.appendChild(el("span", "price-tag", "Mit Betreuung"));
      card.appendChild(h);

      var once = el("p", "price-once");
      if (p.salePrice && p.salePrice < p.once) {
        // Angebotspreis: alter Preis rot durchgestrichen, darunter der neue Preis in Grün
        var old = el("s", "price-old");
        old.appendChild(el("span", "visually-hidden", "statt "));
        old.appendChild(document.createTextNode(euro(p.once)));
        once.appendChild(old);
        var now = el("span", "price-sale");
        now.appendChild(el("span", "visually-hidden", "jetzt "));
        now.appendChild(document.createTextNode(euro(p.salePrice)));
        once.appendChild(now);
      } else {
        once.appendChild(document.createTextNode(euro(p.once) + " "));
      }
      once.appendChild(el("small", "", "einmalig für die Einrichtung"));
      card.appendChild(once);
      if (pilotOn) {
        card.appendChild(el("p", "res-small", "In der Pilotphase: " + euro(Math.round(p.once / 2)) + " einmalig"));
      }
      card.appendChild(el("p", "price-monthly", p.monthly > 0 ? "+ " + euro(p.monthly) + " pro Monat" : "Keine monatlichen Kosten"));

      var ul = el("ul", "checklist");
      (p.features || []).forEach(function (f) {
        var li = el("li");
        li.appendChild(icon("check"));
        li.appendChild(el("span", "", f));
        ul.appendChild(li);
      });
      card.appendChild(ul);

      host.appendChild(card);
    });

    var notes = [];
    if (pr.cancellation) notes.push(get(pr, "premium.name", "Premium") + " ist " + pr.cancellation + ".");
    notes.push("Keine Kosten pro Anfrage.");
    if (isFilled(pr.vatNote || "")) notes.push(pr.vatNote);
    setText("#price-notes", notes.join(" "));
  }

  /* ---------- 10. FAQ, Referenzen ---------- */

  function renderFaq() {
    var host = $("#faq");
    if (!host) return;
    var kuendigung = get(C, "pricing.cancellation", "monatlich kündbar");
    (C.faq || []).forEach(function (item) {
      var d = document.createElement("details");
      d.appendChild(el("summary", "", item.q));
      d.appendChild(el("p", "", fill(item.a, { kuendigung: kuendigung })));
      host.appendChild(d);
    });
  }

  function renderReferences() {
    var refs = (C.references || []).filter(function (r) { return r && r.text; });
    if (!refs.length) return;
    var host = $("#refs");
    refs.forEach(function (r) {
      var fig = el("figure", "ref");
      fig.appendChild(el("blockquote", "", "„" + r.text + "“"));
      fig.appendChild(el("figcaption", "", [r.name, r.firma].filter(Boolean).join(", ")));
      host.appendChild(fig);
    });
    $("#referenzen").hidden = false;
  }

  /* ---------- Telefonnummer kopieren ---------- */

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  }
  function legacyCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }
  function setupCopy() {
    var status = $("#copy-status");
    $all("[data-copy-phone]").forEach(function (b) {
      b.addEventListener("click", function () {
        copyText(get(C, "contact.phone", "")).then(function (ok) {
          status.textContent = ok ? "Nummer kopiert." : "Kopieren hat nicht geklappt. Bitte die Nummer oben markieren.";
          setTimeout(function () { status.textContent = ""; }, 4000);
        });
      });
    });
  }

  /* ---------- Start ---------- */

  function init() {
    applyConfig();
    applyPersonalization();
    buildCalculator();
    renderPricing();
    renderFaq();
    renderReferences();
    setupCopy();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
