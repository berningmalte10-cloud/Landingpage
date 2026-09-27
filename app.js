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
    p.gewerk = Object.prototype.hasOwnProperty.call(gewerke, g) ? g : get(C, "audience.defaultGewerk", "maler");
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
    if (brand) document.title = "Anfrage-Assistent für Handwerksbetriebe – " + brand;

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
      // Ohne E-Mail-Adresse zeigt der Fußzeilen-Link „Kontakt“ weiter auf den Terminbereich.
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

    // Terminformular vorbelegen
    if (P.firma) $("#bk-betrieb").value = P.firma;
    if (P.name) $("#bk-name").value = P.name;

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
    { key: "stundensatz", label: "Ihr Stundensatz", min: 20, max: 150, step: 1, unit: "€" },
    { group: "Verpasste Anrufe und Aufträge" },
    { key: "verpassteAnrufeProWoche", label: "Verpasste Anrufe pro Woche", min: 0, max: 30, step: 1, unit: "" },
    { key: "assistentAnteil", label: "Anteil davon, der stattdessen den Assistenten nutzt", min: 0, max: 100, step: 5, unit: "%" },
    { key: "auftragsquote", label: "Anteil der Anfragen, die zum Auftrag werden", min: 0, max: 100, step: 5, unit: "%" },
    { key: "auftragswert", label: "Durchschnittlicher Auftragswert", min: 0, max: 50000, step: 100, unit: "€" }
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

    var cost = get(C, "pricing.start", {});
    setText("#res-costs", "Kosten zum Vergleich (Paket " + (cost.name || "Start") + "): " + euro(cost.once || 0) + " einmalig, " + euro(cost.monthly || 0) + " pro Monat.");
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
    var monthly = Number(get(C, "pricing.start.monthly", 29));
    var setup = Number(get(C, "pricing.start.once", 590));

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
     * 5) Zusätzliche Anfragen
     *    = verpasste Anrufe/Woche × 4,33 × Anteil, der den Assistenten nutzt
     *    Standard: 3 × 4,33 × 0,30 = 3,9 → „rund 4“
     * 6) Mögliche zusätzliche Aufträge = 5) × Auftragsquote            Standard: 3,9 × 0,20 = 0,78
     * 7) Möglicher zusätzlicher Auftragswert = 6) × Auftragswert       Standard: 0,78 × 2.500 € = 1.948 € → „≈ 1.950 €“
     *    (wird bewusst NICHT in die Amortisation eingerechnet)
     *
     * 8) Amortisation in Monaten = Einrichtung ÷ (Wert der Zeit − monatliche Gebühr), nur wenn der Nenner positiv ist
     *    Standard: 590 € ÷ (288,75 € − 29 €) = 2,3 → aufgerundet „etwa 3 Monaten“
     */
    var hRueck = v.anfragenProWoche * WEEKS_PER_MONTH * (v.rueckfrageAnteil / 100) * v.minutenProRueckfrage / 60;
    var hBesicht = v.besichtigungenProMonat * (v.vermeidbarAnteil / 100) * v.minutenProBesichtigung / 60;
    var hours = hRueck + hBesicht;
    var timeValue = hours * v.stundensatz;
    var extraRequests = v.verpassteAnrufeProWoche * WEEKS_PER_MONTH * (v.assistentAnteil / 100);
    var extraOrders = extraRequests * (v.auftragsquote / 100);
    var extraOrderValue = extraOrders * v.auftragswert;
    var net = timeValue - monthly;
    var payback = net > 0 ? setup / net : null;

    // Anzeige
    var hRounded = roundHalf(hours);
    var hoursText;
    if (hours <= 0) hoursText = "0 Stunden";
    else if (hRounded < 0.5) hoursText = "Unter 1 Stunde";
    else hoursText = "Rund " + nf1.format(hRounded) + (hRounded === 1 ? " Stunde" : " Stunden");

    var reqRounded = Math.round(extraRequests);
    var reqText;
    if (extraRequests <= 0) reqText = "Keine";
    else if (reqRounded < 1) reqText = "Weniger als 1";
    else reqText = "Rund " + nf0.format(reqRounded);

    var paybackText;
    if (payback === null) {
      paybackText = hours > 0
        ? "Bei diesen Werten trägt sich der Assistent nicht allein durch gesparte Zeit. Entscheidend sind dann die zusätzlichen Anfragen."
        : "Bei diesen Werten sparen Sie keine Zeit. Entscheidend sind dann die zusätzlichen Anfragen.";
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
      setText("#res-requests", reqText);
      setText("#res-payback", paybackText);
      setText("#res-orders", "rund " + euro(roundTen(extraOrderValue)) + " pro Monat");
      setText("#res-orders-note", "Wenn " + nf0.format(v.auftragsquote) + " % der zusätzlichen Anfragen zum Auftrag werden. Nicht in die Amortisation eingerechnet.");
    }, 120);

    var mini = $("#calc-mini");
    if (mini) {
      mini.textContent = "";
      mini.appendChild(el("span", "", (hRounded > 0 ? "≈ " + nf1.format(hRounded) : "0") + " Std. · " + euro(roundTen(timeValue))));
      mini.appendChild(el("span", "", "+" + nf0.format(reqRounded) + " Anfragen / Monat"));
    }

    var steps = $("#res-steps");
    if (steps) {
      var f1 = function (n) { return nf1.format(Math.round(n * 10) / 10); };
      var lines = [
        "Rückfragen: " + v.anfragenProWoche + " Anfragen × 4,33 Wochen × " + v.rueckfrageAnteil + " % × " + v.minutenProRueckfrage + " Min. = " + f1(hRueck) + " Std.",
        "Besichtigungen: " + v.besichtigungenProMonat + " × " + v.vermeidbarAnteil + " % × " + v.minutenProBesichtigung + " Min. = " + f1(hBesicht) + " Std.",
        "Wert der Zeit: " + f1(hours) + " Std. × " + euro(v.stundensatz) + " = " + euro(Math.round(timeValue)),
        "Zusätzliche Anfragen: " + v.verpassteAnrufeProWoche + " verpasste Anrufe × 4,33 × " + v.assistentAnteil + " % = " + f1(extraRequests),
        "Möglicher Auftragswert: " + f1(extraRequests) + " × " + v.auftragsquote + " % × " + euro(v.auftragswert) + " = " + euro(Math.round(extraOrderValue)),
        payback === null
          ? "Amortisation: Wert der Zeit liegt nicht über der monatlichen Gebühr von " + euro(monthly) + "."
          : "Amortisation: " + euro(setup) + " ÷ (" + euro(Math.round(timeValue)) + " − " + euro(monthly) + ") = " + f1(payback) + " Monate"
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
    [["start", false], ["plus", true]].forEach(function (pair) {
      var p = pr[pair[0]];
      if (!p) return;
      var card = el("article", "price" + (pair[1] ? " is-featured" : ""));
      var h = el("h3", "", p.name || pair[0]);
      if (pair[1]) h.appendChild(el("span", "price-tag", "Mehr Möglichkeiten"));
      card.appendChild(h);

      var once = el("p", "price-once");
      once.appendChild(document.createTextNode(euro(p.once) + " "));
      once.appendChild(el("small", "", "einmalig für die Einrichtung"));
      card.appendChild(once);
      if (pilotOn) {
        card.appendChild(el("p", "res-small", "In der Pilotphase: " + euro(Math.round(p.once / 2)) + " einmalig"));
      }
      card.appendChild(el("p", "price-monthly", "+ " + euro(p.monthly) + " pro Monat"));

      var ul = el("ul", "checklist");
      (p.features || []).forEach(function (f) {
        var li = el("li");
        li.appendChild(icon("check"));
        li.appendChild(el("span", "", f));
        ul.appendChild(li);
      });
      card.appendChild(ul);

      var btn = el("a", "btn " + (pair[1] ? "btn-primary" : "btn-secondary"), "Termin anfragen");
      btn.href = "#termin";
      card.appendChild(btn);
      host.appendChild(card);
    });

    var notes = [];
    if (pr.cancellation) notes.push("Laufzeit: " + pr.cancellation + ".");
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

  /* ---------- 9. Terminanfrage ---------- */

  var WEEKDAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

  function buildDayChips() {
    var host = $("#bk-days");
    if (!host) return;
    var first = host.firstElementChild; // „Jeder Tag passt“ bleibt am Ende
    var d = new Date();
    var added = 0;
    while (added < 8) {
      d.setDate(d.getDate() + 1);
      var wd = d.getDay();
      if (wd === 0 || wd === 6) continue;
      var labelText = WEEKDAYS[wd] + " " + d.getDate() + "." + (d.getMonth() + 1) + ".";
      var lab = el("label", "chip");
      var input = document.createElement("input");
      input.type = "checkbox";
      input.name = "tage";
      input.value = labelText;
      var span = el("span", "", labelText);
      lab.appendChild(input);
      lab.appendChild(span);
      host.insertBefore(lab, first);
      added++;
    }
  }

  function setupBooking() {
    var form = $("#booking");
    if (!form) return;
    buildDayChips();

    var steps = $all(".bk-step", form);
    var current = 0;

    function showStep(i, focus) {
      current = i;
      steps.forEach(function (s, idx) { s.classList.toggle("is-active", idx === i); });
      setText("#bk-step-label", "Schritt " + (i + 1) + " von " + steps.length);
      $("#bk-bar").style.width = ((i + 1) / steps.length * 100) + "%";
      if (focus) {
        var legend = steps[i].querySelector("legend");
        legend.setAttribute("tabindex", "-1");
        legend.focus({ preventScroll: true });
        var top = form.getBoundingClientRect().top;
        if (top < 70) form.scrollIntoView({ block: "start" });
      }
    }

    function setError(id, msg, inputs) {
      var p = $("#" + id);
      if (!p) return;
      p.textContent = msg || "";
      p.hidden = !msg;
      (inputs || []).forEach(function (inp) {
        if (msg) inp.setAttribute("aria-invalid", "true");
        else inp.removeAttribute("aria-invalid");
      });
    }

    function checked(name) {
      return $all('input[name="' + name + '"]', form).filter(function (i) { return i.checked; });
    }

    // Prüft einen Schritt, zeigt Meldungen direkt am Feld und gibt das erste fehlerhafte Feld zurück.
    function validateStep(i) {
      var firstBad = null;
      function bad(elm) { if (!firstBad) firstBad = elm; }

      if (i === 0) {
        var art = $all('input[name="art"]', form);
        var ok = checked("art").length > 0;
        setError("err-art", ok ? "" : "Bitte wählen Sie, wie wir uns treffen möchten.", art);
        if (!ok) bad(art[0]);
      }
      if (i === 1) {
        var tage = $all('input[name="tage"]', form);
        var okT = checked("tage").length > 0;
        setError("err-tage", okT ? "" : "Bitte wählen Sie mindestens einen Tag.", tage);
        if (!okT) bad(tage[0]);
        var zeit = $all('input[name="zeit"]', form);
        var okZ = checked("zeit").length > 0;
        setError("err-zeit", okZ ? "" : "Bitte wählen Sie eine Tageszeit.", zeit);
        if (!okZ) bad(zeit[0]);
      }
      if (i === 2) {
        var name = $("#bk-name"), betrieb = $("#bk-betrieb"), tel = $("#bk-telefon"), ds = $("#bk-datenschutz");
        var nOk = name.value.trim().length >= 2;
        setError("err-name", nOk ? "" : "Bitte geben Sie Ihren Namen ein.", [name]);
        if (!nOk) bad(name);
        var bOk = betrieb.value.trim().length >= 2;
        setError("err-betrieb", bOk ? "" : "Bitte geben Sie den Namen Ihres Betriebs ein.", [betrieb]);
        if (!bOk) bad(betrieb);
        var tv = tel.value.trim();
        var digits = tv.replace(/\D/g, "");
        var tMsg = "";
        if (!tv) tMsg = "Bitte geben Sie eine Telefonnummer ein, unter der ich Sie erreiche.";
        else if (!/^[\d\s+()\/-]+$/.test(tv) || digits.length < 6 || digits.length > 16) tMsg = "Die Telefonnummer sieht nicht vollständig aus. Bitte prüfen Sie sie.";
        setError("err-telefon", tMsg, [tel]);
        if (tMsg) bad(tel);
        setError("err-datenschutz", ds.checked ? "" : "Bitte bestätigen Sie den Hinweis zum Datenschutz.", [ds]);
        if (!ds.checked) bad(ds);
      }
      return firstBad;
    }

    // Fehlermeldung verschwindet, sobald das Feld korrigiert wird
    form.addEventListener("change", function (e) {
      var n = e.target.name;
      if (n === "art") setError("err-art", "", $all('input[name="art"]', form));
      if (n === "tage") setError("err-tage", "", $all('input[name="tage"]', form));
      if (n === "zeit") setError("err-zeit", "", $all('input[name="zeit"]', form));
      if (n === "datenschutz" && e.target.checked) setError("err-datenschutz", "", [e.target]);
    });
    form.addEventListener("input", function (e) {
      var map = { name: "err-name", betrieb: "err-betrieb", telefon: "err-telefon" };
      if (map[e.target.name] && e.target.getAttribute("aria-invalid")) setError(map[e.target.name], "", [e.target]);
    });

    // „Jeder Tag passt“ schließt einzelne Tage aus und umgekehrt
    form.addEventListener("change", function (e) {
      if (e.target.name !== "tage" || !e.target.checked) return;
      var any = e.target.value === "Mir ist jeder Tag recht";
      $all('input[name="tage"]', form).forEach(function (i) {
        if (i === e.target) return;
        if (any || i.value === "Mir ist jeder Tag recht") i.checked = false;
      });
    });

    $all("[data-next]", form).forEach(function (b) {
      b.addEventListener("click", function () {
        var badField = validateStep(current);
        if (badField) { badField.focus(); return; }
        showStep(current + 1, true);
      });
    });
    $all("[data-prev]", form).forEach(function (b) {
      b.addEventListener("click", function () { showStep(current - 1, true); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      // Falls jemand per Enter abschickt: alle Schritte prüfen
      for (var i = 0; i < steps.length; i++) {
        var badField = validateStep(i);
        if (badField) {
          if (i !== current) showStep(i, false);
          badField.focus();
          return;
        }
      }
      var data = {
        art: checked("art").map(function (x) { return x.value; })[0] || "",
        tage: checked("tage").map(function (x) { return x.value; }),
        zeit: checked("zeit").map(function (x) { return x.value; })[0] || "",
        name: $("#bk-name").value.trim(),
        betrieb: $("#bk-betrieb").value.trim(),
        telefon: $("#bk-telefon").value.trim(),
        notiz: $("#bk-notiz").value.trim(),
        website: $("#bk-website").value,           // Honeypot
        datenschutz: true,
        quelle: window.location.pathname,
        gesendet: new Date().toISOString()
      };

      var submitBtn = $("#bk-submit");
      var errBox = $("#bk-send-error");
      errBox.hidden = true;
      submitBtn.disabled = true;
      submitBtn.textContent = "Wird gesendet …";

      sendBooking(data).then(function (result) {
        showDone(data, result);
      }, function () {
        submitBtn.disabled = false;
        submitBtn.textContent = "Termin anfragen";
        var phone = get(C, "contact.phone", "");
        errBox.textContent = "Das hat leider nicht geklappt. Bitte versuchen Sie es noch einmal" +
          (isFilled(phone) ? " oder rufen Sie mich an: " + phone + "." : ".");
        errBox.hidden = false;
      });
    });

    showStep(0, false);
  }

  /*
   * Versendet die Terminanfrage an den Endpoint aus config.js (bookingEndpoint).
   * Erwartet: POST mit JSON, Antwort mit HTTP-Status 2xx.
   * Ergebnis: { sent: true } bei Erfolg, { sent: false } wenn kein Endpoint eingetragen ist.
   * Ausgefüllter Honeypot: Es wird nichts gesendet, der Nutzer sieht trotzdem „Danke“.
   */
  function sendBooking(data) {
    var endpoint = String(C.bookingEndpoint || "").trim();
    if (data.website) return Promise.resolve({ sent: true, spam: true });
    if (!endpoint) return Promise.resolve({ sent: false });

    var payload = {};
    Object.keys(data).forEach(function (k) { if (k !== "website") payload[k] = data[k]; });
    payload.hp = data.website;

    var controller = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (controller) controller.abort(); }, 15000);
    return fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload),
      credentials: "omit",
      signal: controller ? controller.signal : undefined
    }).then(function (res) {
      clearTimeout(timer);
      if (!res.ok) throw new Error("HTTP " + res.status);
      return { sent: true };
    }, function (err) {
      clearTimeout(timer);
      throw err;
    });
  }

  function showDone(data, result) {
    var form = $("#booking");
    var done = $("#bk-done");
    setText("#bk-done-title", "Danke, " + data.name + "!");
    setText("#bk-done-text", result.sent
      ? "Ihre Terminanfrage ist angekommen. Ich melde mich innerhalb eines Werktags telefonisch, um den Termin zu bestätigen."
      : "Ihre Angaben sind vollständig. Hier noch einmal im Überblick:");

    var summary = [
      ["Termin", data.art],
      ["Tage", data.tage.join(", ")],
      ["Tageszeit", data.zeit],
      ["Name", data.name],
      ["Betrieb", data.betrieb],
      ["Telefon", data.telefon]
    ];
    if (data.notiz) summary.push(["Anmerkung", data.notiz]);
    var dl = $("#bk-summary");
    dl.textContent = "";
    summary.forEach(function (r) { dl.appendChild(el("dt", "", r[0])); dl.appendChild(el("dd", "", r[1])); });

    var notSent = $("#bk-not-sent");
    notSent.hidden = !!result.sent;
    if (!result.sent) {
      var email = get(C, "contact.email", "");
      var mailBtn = $("#bk-mail-fallback");
      if (isFilled(email)) {
        var body = "Guten Tag,\n\nich möchte einen 15-Minuten-Termin zum Anfrage-Assistenten vereinbaren.\n\n" +
          summary.map(function (r) { return r[0] + ": " + r[1]; }).join("\n") + "\n\nViele Grüße\n" + data.name;
        mailBtn.href = "mailto:" + email + "?subject=" + encodeURIComponent("Terminanfrage " + data.betrieb) + "&body=" + encodeURIComponent(body);
      } else {
        mailBtn.hidden = true;
      }
    }

    form.hidden = true;
    done.hidden = false;
    done.focus();
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
    setupBooking();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
