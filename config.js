/*
 * ============================================================
 *  EINSTELLUNGEN DER LANDINGPAGE
 * ============================================================
 *  Hier ändern Sie alle Texte, Preise und Kontaktdaten.
 *  Regeln, damit nichts kaputtgeht:
 *   - Texte stehen immer in "Anführungszeichen".
 *   - Nach jedem Eintrag steht ein Komma.
 *   - Zahlen ohne Anführungszeichen und ohne Tausenderpunkt (2500, nicht 2.500).
 *   - Einträge in [ECKIGEN KLAMMERN] sind Platzhalter und müssen noch ausgefüllt werden.
 *  Nach dem Speichern die Seite im Browser neu laden.
 * ============================================================
 */
window.LANDING_CONFIG = {

  brand: {
    name: "Malte Berning",
    tagline: "Anfrage-Assistent für Handwerksunternehmen"
  },

  // Adresse, unter der diese Landingpage erreichbar ist, z. B. "https://www.ihre-domain.de/".
  // Wird nur von link-bauen.html genutzt. Leer = die Adresse, unter der link-bauen.html gerade läuft.
  siteUrl: "https://berningmalte10-cloud.github.io/Landingpage/",

  owner: {
    name: "Malte Berning",
    region: "[REGION]",
    about: "[2–3 Sätze über mich: Wer ich bin, woher ich komme und warum ich Handwerksbetrieben bei Anfragen helfe.]",
    photo: ""               // z. B. "bilder/portrait.jpg" (lokal gespeichert, ca. 400 × 400 px). Leer = kein Foto.
  },

  contact: {
    phone: "0151 5618 6700",     // so, wie es angezeigt werden soll, z. B. "02872 123 45 67"
    email: "malteberning333@gmail.com",
    whatsapp: "",   // nur Ziffern mit Ländervorwahl, ohne +, z. B. "491701234567". Leer = kein WhatsApp-Knopf.
    whatsappText: "Hallo, ich interessiere mich für den Anfrage-Assistenten."
  },

  colors: {
    primary: "#1E5B4F",     // Hauptfarbe (Knöpfe, Überschriften-Akzente)
    accent: "#E3A33B"       // Akzentfarbe (Hervorhebungen)
  },

  // Adresse der Demo. Die Link-Parameter (firma, farbe, plz, ort, web, kuerzel) werden automatisch angehängt.
  demoUrl: "https://berningmalte10-cloud.github.io/Anfrage-demo/",

  // Zielgruppe ohne Link-Parameter: "Für Handwerksbetriebe im Münsterland"
  audience: {
    region: "im Münsterland",
    defaultGewerk: "handwerk"     // allgemein; per Link z. B. ?gewerk=maler für Beispiele eines Gewerks
  },

  pricing: {
    // Classic: nur einmalige Einrichtung, keine monatlichen Kosten (monthly: 0)
    classic: {
      name: "Classic",
      once: 390,
      salePrice: 249,   // Angebotspreis: 390 € wird rot durchgestrichen, 249 € grün darunter. Löschen = kein Angebot.
      monthly: 0,
      features: [
        "Bis zu 6 Leistungen mit passenden Fragen",
        "Einsatzgebiet über Ihre Postleitzahlen",
        "Anfragen mit Fotos per E-Mail in Ihr Postfach",
        "Einrichtung auf Ihrer Website inkl. Button",
        "Gemeinsame Testanfrage"
      ]
    },
    premium: {
      name: "Premium",
      once: 790,
      monthly: 39,
      features: [
        "Alles aus Classic",
        "Beliebig viele Leistungen und Fragen",
        "Automatische Eingangsbestätigung an Ihren Kunden",
        "Zweiter Empfänger, z. B. für Ihr Büro",
        "Kleine Änderungen inklusive",
        "Hilfe bei Fragen, Rückmeldung am selben Werktag"
      ]
    },
    // Hinweis zur Umsatzsteuer. Erst eintragen, wenn geprüft! Leer = kein Hinweis.
    // Beispiel: "Gemäß § 19 UStG wird keine Umsatzsteuer berechnet."
    vatNote: "",
    cancellation: "monatlich kündbar",   // gilt für Premium (Classic hat keine Laufzeit)
    pilot: {
      enabled: false,
      seats: 3,
      // {plaetze} wird durch die Zahl bei "seats" ersetzt.
      text: "Pilotphase: Die ersten {plaetze} Betriebe erhalten die Einrichtung zum halben Preis – im Gegenzug für ehrliches Feedback."
    }
  },

  // Standardwerte des Rechners „Was bringt Ihnen das?“ – bewusst vorsichtig gewählt.
  calculatorDefaults: {
    anfragenProWoche: 5,          // Anfragen pro Woche
    rueckfrageAnteil: 60,         // % der Anfragen, bei denen Sie zurückrufen / nachfragen müssen
    minutenProRueckfrage: 15,     // Minuten pro Rückfrage
    besichtigungenProMonat: 4,    // Besichtigungen pro Monat nur zum Einschätzen des Aufwands
    vermeidbarAnteil: 50,         // % davon mit Fotos vermeidbar
    minutenProBesichtigung: 60,   // Minuten pro Besichtigung inkl. Fahrt
    stundensatz: 55               // Ihr Stundensatz in €
  },

  // Häufige Fragen. {kuendigung} wird durch den Text bei pricing.cancellation ersetzt.
  faq: [
    {
      q: "Muss ich meine Website ändern?",
      a: "Nein. Der Assistent kommt als eigener Ordner auf Ihren Webspace. Auf Ihrer Seite kommt nur ein Button „Angebot anfragen“ dazu. Den setze ich bei der Einrichtung für Sie."
    },
    {
      q: "Funktioniert das mit meiner Website?",
      a: "Bei den meisten Hostern ja, zum Beispiel wenn Ihre Seite bei einem normalen Webhoster mit PHP liegt. Ist Ihre Seite mit einem Baukasten ohne PHP gebaut, läuft der Assistent über eine eigene Subdomain, etwa anfrage.ihr-betrieb.de. Das prüfe ich vorher für Sie."
    },
    {
      q: "Landen die Anfragen im Spam?",
      a: "Die E-Mails werden über Ihr eigenes Postfach verschickt, nicht über einen fremden Dienst. Bei der Einrichtung machen wir zusammen eine Testanfrage und markieren den Absender als sicher. So kommt die Anfrage dort an, wo Sie sie auch lesen."
    },
    {
      q: "Was ist mit Datenschutz?",
      a: "Der Assistent setzt keine Cookies und nutzt keine fremden Server. Anfragen werden nicht gespeichert, sondern nur per E-Mail an Sie geschickt. Fotos werden schon auf dem Handy des Kunden verkleinert, Standortdaten werden entfernt. Einen Hinweis für Ihre Datenschutzerklärung bekommen Sie von mir. Eine Rechtsberatung ist das nicht."
    },
    {
      q: "Was, wenn ein Kunde lieber anruft?",
      a: "Dann ruft er an. Ihre Telefonnummer bleibt, wo sie ist. Der Assistent ist ein zusätzlicher Weg für alle, die Sie gerade nicht erreichen oder lieber abends schreiben."
    },
    {
      q: "Kann ich Fragen und Leistungen ändern lassen?",
      a: "Ja. Mit Premium sind kleine Änderungen wie eine neue Leistung, eine andere Frage oder weitere Postleitzahlen enthalten, eine kurze Nachricht an mich genügt. Mit Classic mache ich Änderungen nach Absprache zu einem festen Preis."
    },
    {
      q: "Wie schnell ist es eingerichtet?",
      a: "In der Regel innerhalb einer Woche nach Ihrer Zusage. Dafür brauche ich nur den Zugang zu Ihrem Webspace oder die Kontaktdaten Ihres Webdesigners."
    },
    {
      q: "Wie kann ich kündigen?",
      a: "Bei Classic gibt es nichts zu kündigen: Sie zahlen einmal, der Assistent gehört dann Ihnen. Premium ist {kuendigung}, eine kurze E-Mail reicht."
    },
    {
      q: "Kommen später noch Kosten pro Anfrage dazu?",
      a: "Nein. Bei Classic zahlen Sie nur die Einrichtung, bei Premium zusätzlich die monatliche Gebühr. Wie viele Anfragen kommen, spielt für den Preis keine Rolle."
    }
  ],

  // Echte Kundenstimmen – nur mit Zustimmung des Betriebs eintragen. Leer = Abschnitt wird ausgeblendet.
  // Beispiel: { text: "…", name: "Max Mustermann", firma: "Malerbetrieb Mustermann, Rhede" }
  references: [],

  // false = Suchmaschinen sollen die Seite nicht aufnehmen. Nur wer den Link bekommt, findet sie.
  // true = Seite darf bei Google & Co. erscheinen. Dann zusätzlich in index.html, impressum.html und
  // datenschutz.html die Zeile <meta name="robots" content="noindex, nofollow"> löschen (siehe README).
  indexable: false,

  // Beispieltexte pro Gewerk (Leistungskacheln in der Handy-Vorschau und Beispiel-E-Mail).
  // Auswahl per Link-Parameter, z. B. ?gewerk=elektro. Ohne Parameter: "handwerk" (allgemein).
  // Verfügbare Symbole: roller, house, wallpaper, brush, floor, bath, tiles, sun, wrench, bolt, drop,
  //                     hammer, roof, window, door, flame, clock, alert, more
  gewerke: {
    handwerk: {
      label: "Handwerksbetriebe",
      vagueRequest: "„Bitte um ein Angebot.“ Keine Maße, kein Foto, keine Telefonnummer.",
      services: [
        { label: "Renovierung", icon: "house" },
        { label: "Reparatur", icon: "wrench" },
        { label: "Neu einbauen", icon: "hammer" },
        { label: "Wartung", icon: "clock" },
        { label: "Notfall", icon: "alert" },
        { label: "Etwas anderes", icon: "more" }
      ],
      mail: {
        kuerzel: "HW",
        nummer: "4821",
        leistung: "Renovierung",
        plz: "46414",
        ort: "Rhede",
        dringend: true,
        dringlichkeit: "Dringend – Beginn in den nächsten 2 Wochen gewünscht",
        beginn: "in den nächsten 2 Wochen",
        rueckruf: "werktags ab 17 Uhr",
        kunde: [
          ["Name", "Sabine Beispiel"],
          ["Telefon", "0151 000 000 00"],
          ["E-Mail", "s.beispiel@example.de"],
          ["Adresse", "Musterweg 12, {plz} {ort}"]
        ],
        auftrag: [
          ["Objekt", "Einfamilienhaus, Baujahr ca. 1985"],
          ["Bereich", "Wohnzimmer und Flur, ca. 45 m²"],
          ["Umfang", "Wände, Decke und Boden erneuern"],
          ["Zustand", "Alter Belag muss vorher raus"],
          ["Material", "Beratung gewünscht"],
          ["Zugang", "Parken direkt vor dem Haus möglich"]
        ],
        nachricht: "Wir sind werktags ab 17 Uhr zu Hause. Fotos vom Flur habe ich mit angehängt.",
        fotos: ["Wohnzimmer", "Flur", "Boden im Detail", "Decke"]
      }
    },
    maler: {
      label: "Malerbetriebe",
      vagueRequest: "„Bitte um Angebot fürs Wohnzimmer.“ Keine Maße, kein Foto, keine Telefonnummer.",
      services: [
        { label: "Innenanstrich", icon: "roller" },
        { label: "Fassade", icon: "house" },
        { label: "Tapezieren", icon: "wallpaper" },
        { label: "Lackierarbeiten", icon: "brush" },
        { label: "Bodenbeläge", icon: "floor" },
        { label: "Etwas anderes", icon: "more" }
      ],
      mail: {
        kuerzel: "MB",
        nummer: "4821",
        leistung: "Fassade",
        plz: "46414",
        ort: "Rhede",
        dringend: true,
        dringlichkeit: "Dringend – Beginn in den nächsten 2 Wochen gewünscht",
        beginn: "in den nächsten 2 Wochen",
        rueckruf: "werktags ab 17 Uhr",
        kunde: [
          ["Name", "Sabine Beispiel"],
          ["Telefon", "0151 000 000 00"],
          ["E-Mail", "s.beispiel@example.de"],
          ["Adresse", "Musterweg 12, {plz} {ort}"]
        ],
        auftrag: [
          ["Gebäude", "Einfamilienhaus, 2 Etagen"],
          ["Fläche", "ca. 180 m²"],
          ["Untergrund", "Putz, zuletzt vor ca. 12 Jahren gestrichen"],
          ["Zustand", "Farbe blättert an der Wetterseite ab"],
          ["Gerüst", "wird benötigt"],
          ["Farbwunsch", "Hellgrau, wie bisher"]
        ],
        nachricht: "Die Seite zur Straße ist am schlimmsten. Wir sind werktags ab 17 Uhr zu Hause.",
        fotos: ["Wetterseite", "Putz im Detail", "Eingang", "Giebel"]
      }
    },
    fliesen: {
      label: "Fliesenlegerbetriebe",
      vagueRequest: "„Bitte um Angebot fürs Bad.“ Keine Maße, kein Foto, keine Telefonnummer.",
      services: [
        { label: "Bad sanieren", icon: "bath" },
        { label: "Boden fliesen", icon: "floor" },
        { label: "Wandfliesen", icon: "tiles" },
        { label: "Terrasse & Balkon", icon: "sun" },
        { label: "Reparatur", icon: "wrench" },
        { label: "Etwas anderes", icon: "more" }
      ],
      mail: {
        kuerzel: "FL",
        nummer: "3107",
        leistung: "Bad sanieren",
        plz: "46399",
        ort: "Bocholt",
        dringend: false,
        dringlichkeit: "Normal – Beginn in 1 bis 3 Monaten",
        beginn: "in 1 bis 3 Monaten",
        rueckruf: "vormittags",
        kunde: [
          ["Name", "Thomas Beispiel"],
          ["Telefon", "0171 000 000 00"],
          ["E-Mail", "t.beispiel@example.de"],
          ["Adresse", "Beispielstraße 5, {plz} {ort}"]
        ],
        auftrag: [
          ["Raum", "Badezimmer im Obergeschoss"],
          ["Größe", "ca. 7 m² Boden, Wände bis 2 m hoch"],
          ["Bestand", "Fliesen aus den 90ern, sollen raus"],
          ["Wunsch", "Bodengleiche Dusche statt Wanne"],
          ["Material", "Fliesen werden vom Betrieb gestellt"]
        ],
        nachricht: "Wir möchten die Arbeiten gern vor Weihnachten abschließen.",
        fotos: ["Bad gesamt", "Wanne", "Boden", "Fenster"]
      }
    },
    elektro: {
      label: "Elektrobetriebe",
      vagueRequest: "„Bitte um Angebot für neue Steckdosen.“ Keine Anzahl, kein Foto, keine Telefonnummer.",
      services: [
        { label: "Steckdosen & Licht", icon: "bolt" },
        { label: "Sicherungskasten", icon: "tiles" },
        { label: "Wallbox", icon: "bolt" },
        { label: "Photovoltaik", icon: "sun" },
        { label: "Störung", icon: "alert" },
        { label: "Etwas anderes", icon: "more" }
      ],
      mail: {
        kuerzel: "EL", nummer: "2764", leistung: "Sicherungskasten", plz: "46395", ort: "Bocholt",
        dringend: true, dringlichkeit: "Dringend – Sicherung fliegt immer wieder raus",
        beginn: "so schnell wie möglich", rueckruf: "jederzeit",
        kunde: [["Name", "Jana Beispiel"], ["Telefon", "0160 000 000 00"], ["E-Mail", "j.beispiel@example.de"], ["Adresse", "Am Beispiel 3, {plz} {ort}"]],
        auftrag: [["Objekt", "Doppelhaushälfte, Baujahr 1972"], ["Problem", "FI-Schalter löst bei Regen aus"], ["Verteiler", "Alt, Schraubsicherungen"], ["Wunsch", "Neuer Zählerschrank"]],
        nachricht: "Betrifft vermutlich die Außensteckdose im Garten.",
        fotos: ["Verteiler", "Zähler", "Außensteckdose", "Typenschild"]
      }
    },
    sanitaer: {
      label: "SHK-Betriebe",
      vagueRequest: "„Bitte um Angebot für eine neue Heizung.“ Kein Baujahr, kein Foto, keine Telefonnummer.",
      services: [
        { label: "Heizung", icon: "flame" },
        { label: "Bad", icon: "bath" },
        { label: "Wasserschaden", icon: "drop" },
        { label: "Wartung", icon: "clock" },
        { label: "Notdienst", icon: "alert" },
        { label: "Etwas anderes", icon: "more" }
      ],
      mail: {
        kuerzel: "SH", nummer: "5190", leistung: "Heizung", plz: "46414", ort: "Rhede",
        dringend: false, dringlichkeit: "Normal – Beginn in 1 bis 3 Monaten",
        beginn: "in 1 bis 3 Monaten", rueckruf: "vormittags",
        kunde: [["Name", "Peter Beispiel"], ["Telefon", "0172 000 000 00"], ["E-Mail", "p.beispiel@example.de"], ["Adresse", "Beispielweg 8, {plz} {ort}"]],
        auftrag: [["Objekt", "Einfamilienhaus, ca. 140 m² Wohnfläche"], ["Heizung", "Gas-Brennwert, Baujahr 2004"], ["Wunsch", "Beratung Wärmepumpe"], ["Heizkörper", "Überall normale Heizkörper"]],
        nachricht: "Wir möchten wissen, ob eine Wärmepumpe bei uns sinnvoll ist.",
        fotos: ["Heizung", "Typenschild", "Heizraum", "Außenwand"]
      }
    },
    tischler: {
      label: "Tischlereien",
      vagueRequest: "„Bitte um Angebot für eine Treppe.“ Keine Maße, kein Foto, keine Telefonnummer.",
      services: [
        { label: "Fenster", icon: "window" },
        { label: "Türen", icon: "door" },
        { label: "Treppen", icon: "hammer" },
        { label: "Möbel nach Maß", icon: "tiles" },
        { label: "Reparatur", icon: "wrench" },
        { label: "Etwas anderes", icon: "more" }
      ],
      mail: {
        kuerzel: "TI", nummer: "3318", leistung: "Fenster", plz: "46399", ort: "Bocholt",
        dringend: false, dringlichkeit: "Normal – Beginn in 1 bis 3 Monaten",
        beginn: "in 1 bis 3 Monaten", rueckruf: "werktags ab 16 Uhr",
        kunde: [["Name", "Maria Beispiel"], ["Telefon", "0176 000 000 00"], ["E-Mail", "m.beispiel@example.de"], ["Adresse", "Musterstraße 21, {plz} {ort}"]],
        auftrag: [["Anzahl", "5 Fenster, 1 Balkontür"], ["Maße", "ca. 120 × 130 cm, Balkontür 90 × 210 cm"], ["Material", "Kunststoff, weiß"], ["Wunsch", "Dreifachverglasung"]],
        nachricht: "Die alten Fenster sind von 1990 und ziehen.",
        fotos: ["Fenster innen", "Fenster außen", "Balkontür", "Rahmen"]
      }
    },
    dachdecker: {
      label: "Dachdeckerbetriebe",
      vagueRequest: "„Bitte mal aufs Dach schauen.“ Keine Angaben, kein Foto, keine Telefonnummer.",
      services: [
        { label: "Dach neu eindecken", icon: "roof" },
        { label: "Reparatur", icon: "wrench" },
        { label: "Dachfenster", icon: "window" },
        { label: "Dämmung", icon: "house" },
        { label: "Sturmschaden", icon: "alert" },
        { label: "Etwas anderes", icon: "more" }
      ],
      mail: {
        kuerzel: "DD", nummer: "6042", leistung: "Sturmschaden", plz: "46414", ort: "Rhede",
        dringend: true, dringlichkeit: "Dringend – Ziegel verrutscht, Regen angesagt",
        beginn: "so schnell wie möglich", rueckruf: "jederzeit",
        kunde: [["Name", "Klaus Beispiel"], ["Telefon", "0157 000 000 00"], ["E-Mail", "k.beispiel@example.de"], ["Adresse", "Am Musterhof 4, {plz} {ort}"]],
        auftrag: [["Dach", "Satteldach, Tonziegel"], ["Schaden", "Ca. 6 Ziegel verrutscht, Südseite"], ["Höhe", "Traufe ca. 6 m"], ["Innen", "Noch kein Wasser im Dachboden"]],
        nachricht: "Die Stelle ist von der Straße aus gut zu sehen.",
        fotos: ["Dach Südseite", "Schaden nah", "Dachboden", "Haus gesamt"]
      }
    }
  }
};
