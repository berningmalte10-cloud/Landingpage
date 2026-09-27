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
    name: "[MARKENNAME]",
    tagline: "Anfrage-Assistent für Handwerksbetriebe"
  },

  // Adresse, unter der diese Landingpage erreichbar ist, z. B. "https://www.ihre-domain.de/".
  // Wird nur von link-bauen.html genutzt. Leer = die Adresse, unter der link-bauen.html gerade läuft.
  siteUrl: "https://berningmalte10-cloud.github.io/Landingpage/",

  owner: {
    name: "[IHR NAME]",
    region: "[REGION]",
    about: "[2–3 Sätze über mich: Wer ich bin, woher ich komme und warum ich Handwerksbetrieben bei Anfragen helfe.]",
    photo: ""               // z. B. "bilder/portrait.jpg" (lokal gespeichert, ca. 400 × 400 px). Leer = kein Foto.
  },

  contact: {
    phone: "[TELEFON]",     // so, wie es angezeigt werden soll, z. B. "02872 123 45 67"
    email: "[E-MAIL]",
    whatsapp: "[WHATSAPP-NUMMER]",   // nur Ziffern mit Ländervorwahl, ohne +, z. B. "491701234567". Leer = kein WhatsApp-Knopf.
    whatsappText: "Hallo, ich interessiere mich für den Anfrage-Assistenten."
  },

  colors: {
    primary: "#1E5B4F",     // Hauptfarbe (Knöpfe, Überschriften-Akzente)
    accent: "#E3A33B"       // Akzentfarbe (Hervorhebungen)
  },

  // Adresse der Demo. Die Link-Parameter (firma, farbe, plz, ort, web, kuerzel) werden automatisch angehängt.
  demoUrl: "https://berningmalte10-cloud.github.io/Anfrage-demo/",

  // Adresse des Skripts, das Terminanfragen per E-Mail verschickt, z. B. "https://www.ihre-domain.de/termin.php".
  // Leer = Terminanfrage wird NICHT versendet, die Seite zeigt dann einen ehrlichen Hinweis mit Telefonnummer.
  bookingEndpoint: "",

  // Zielgruppe ohne Link-Parameter: "Für Malerbetriebe im Münsterland"
  audience: {
    region: "im Münsterland",
    defaultGewerk: "maler"
  },

  pricing: {
    start: {
      name: "Start",
      once: 590,
      monthly: 29,
      features: [
        "Bis zu 6 Leistungen mit passenden Fragen",
        "Einsatzgebiet über Ihre Postleitzahlen",
        "Anfragen mit Fotos per E-Mail in Ihr Postfach",
        "Einrichtung auf Ihrer Website inkl. Button",
        "Kleine Änderungen inklusive"
      ]
    },
    plus: {
      name: "Plus",
      once: 890,
      monthly: 49,
      features: [
        "Alles aus Start",
        "Beliebig viele Leistungen und Fragen",
        "Automatische Eingangsbestätigung an Ihren Kunden",
        "Zweiter Empfänger, z. B. für Ihr Büro",
        "Rückmeldung bei Fragen am selben Werktag"
      ]
    },
    // Hinweis zur Umsatzsteuer. Erst eintragen, wenn geprüft! Leer = kein Hinweis.
    // Beispiel: "Gemäß § 19 UStG wird keine Umsatzsteuer berechnet."
    vatNote: "",
    cancellation: "monatlich kündbar",
    pilot: {
      enabled: true,
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
    stundensatz: 55,              // Ihr Stundensatz in €
    verpassteAnrufeProWoche: 3,   // verpasste Anrufe pro Woche
    assistentAnteil: 30,          // % davon, der stattdessen den Assistenten nutzt
    auftragsquote: 20,            // % der Anfragen, die zum Auftrag werden
    auftragswert: 2500            // durchschnittlicher Auftragswert in €
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
      a: "Ja. Kleine Änderungen wie eine neue Leistung, eine andere Frage oder weitere Postleitzahlen sind in der monatlichen Betreuung enthalten. Eine kurze Nachricht an mich genügt."
    },
    {
      q: "Wie schnell ist es eingerichtet?",
      a: "In der Regel innerhalb einer Woche nach unserem Termin. Dafür brauche ich nur den Zugang zu Ihrem Webspace oder die Kontaktdaten Ihres Webdesigners."
    },
    {
      q: "Wie kann ich kündigen?",
      a: "Die Betreuung ist {kuendigung}. Eine kurze E-Mail reicht. Auf Wunsch entferne ich den Assistenten danach wieder von Ihrer Website."
    },
    {
      q: "Kommen später noch Kosten pro Anfrage dazu?",
      a: "Nein. Sie zahlen die Einrichtung einmal und danach die monatliche Gebühr Ihres Pakets. Wie viele Anfragen kommen, spielt für den Preis keine Rolle."
    }
  ],

  // Echte Kundenstimmen – nur mit Zustimmung des Betriebs eintragen. Leer = Abschnitt wird ausgeblendet.
  // Beispiel: { text: "…", name: "Max Mustermann", firma: "Malerbetrieb Mustermann, Rhede" }
  references: [],

  // false = Suchmaschinen sollen die Seite nicht aufnehmen. Nur wer den Link bekommt, findet sie.
  // true = Seite darf bei Google & Co. erscheinen. Dann zusätzlich in index.html, impressum.html und
  // datenschutz.html die Zeile <meta name="robots" content="noindex, nofollow"> löschen (siehe README).
  indexable: false,

  // Beispieltexte pro Gewerk. Auswahl per Link-Parameter ?gewerk=maler bzw. ?gewerk=fliesen
  gewerke: {
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
    }
  }
};
