# Landingpage Anfrage-Assistent

Eine schnelle, schlanke Landingpage für den Anfrage-Assistenten für Handwerksbetriebe.
Reines HTML, CSS und JavaScript – kein Framework, kein Build-Schritt, keine Cookies, keine externen Server.

| Datei | Wofür |
|---|---|
| `index.html` | Die Landingpage |
| `style.css` | Gestaltung |
| `app.js` | Personalisierung, Rechner, Preise |
| `config.js` | **Alle Texte, Preise und Kontaktdaten, die Sie ändern** |
| `impressum.html`, `datenschutz.html` | Rechtstexte (Gerüst mit Platzhaltern) |
| `link-bauen.html` | Ihr Werkzeug für personalisierte Links (nicht verlinkt, `noindex`) |

---

## 1. Auf GitHub Pages veröffentlichen

1. Auf GitHub das Repository öffnen.
2. Oben auf **Settings** klicken, links auf **Pages**.
3. Unter **Build and deployment** → **Source**: „Deploy from a branch“ wählen.
4. Unter **Branch**: den Branch mit diesen Dateien (z. B. `main`) und den Ordner `/ (root)` wählen, **Save** klicken.
5. Nach 1–2 Minuten erscheint oben die Adresse, z. B. `https://ihr-name.github.io/Landingpage/`.
6. Diese Adresse in `config.js` bei `siteUrl` eintragen (für `link-bauen.html`).

**Eigene Domain (optional):** In **Settings → Pages → Custom domain** Ihre Domain eintragen und beim Domain-Anbieter einen CNAME-Eintrag auf `ihr-name.github.io` setzen.

**Anderer Webspace:** Einfach alle Dateien per FTP in einen Ordner hochladen. Fertig.


### Nicht auffindbar, nur per Link

Die Seite ist so eingestellt, dass Suchmaschinen sie **nicht** aufnehmen (`noindex` in `index.html`, `impressum.html`, `datenschutz.html` und `indexable: false` in `config.js`). Nur wer Ihren Link bekommt, findet sie.

Gut zu wissen:
- Geheim ist die Seite dadurch nicht. Wer den Link hat, kann ihn weitergeben. Bei einem öffentlichen Repository ist außerdem der Quellcode einsehbar.
- Bereits aufgenommene Seiten verschwinden erst nach einiger Zeit aus Google.
- Soll die Seite später doch gefunden werden: in `config.js` `indexable: true` setzen **und** in den drei HTML-Dateien die Zeile `<meta name="robots" content="noindex, nofollow">` löschen.

---

## 2. `config.js` anpassen

`config.js` mit einem einfachen Texteditor öffnen (nicht mit Word). Jede Einstellung ist kommentiert.

- **Texte** stehen in `"Anführungszeichen"`. Nach jedem Eintrag steht ein Komma.
- **Zahlen** ohne Anführungszeichen und ohne Tausenderpunkt: `2500`, nicht `2.500`.
- Alles in `[ECKIGEN KLAMMERN]` ist ein Platzhalter.

Wichtige Bereiche:

| Bereich | Inhalt |
|---|---|
| `brand` | Markenname, Unterzeile |
| `owner` | Ihr Name, Region, Text „Über mich“, Foto (Datei lokal ablegen, z. B. `bilder/portrait.jpg`, ca. 400 × 400 px, als JPG/WebP) |
| `contact` | Telefon, E-Mail, WhatsApp-Nummer (nur Ziffern mit 49 vorne, ohne +) |
| `colors` | Haupt- und Akzentfarbe der Seite |
| `demoUrl` | Adresse der Demo |
| `pricing` | Pakete Classic und Premium (Preise, Leistungen; `monthly: 0` = keine monatlichen Kosten), Umsatzsteuer-Hinweis, Kündigung, Pilotangebot (an/aus mit `enabled: true/false`) |
| `calculatorDefaults` | Standardwerte des Rechners |
| `faq` | Häufige Fragen |
| `references` | Echte Kundenstimmen – leer lassen, bis Sie welche mit Zustimmung haben. Leer = Abschnitt unsichtbar. |
| `indexable` | `false` (Standard) = Suchmaschinen sollen die Seite nicht aufnehmen, siehe Abschnitt „Nicht auffindbar“ |
| `gewerke` | Beispieltexte je Gewerk (Leistungskacheln, Beispiel-E-Mail). Neues Gewerk: einen Block kopieren und umbenennen. |

Fehler gemacht? Im Browser die Entwicklertools (F12 → Konsole) zeigen meist die Zeile. Häufigste Ursache: ein fehlendes Komma oder Anführungszeichen.

Lokal ansehen: `index.html` einfach im Browser öffnen, oder im Ordner `python3 -m http.server` starten und `http://localhost:8000` aufrufen.

---

## 3. Personalisierten Link erzeugen

Öffnen Sie `https://ihre-adresse/link-bauen.html` (am besten als Lesezeichen auf dem Handy).

1. Firma, Anrede (z. B. „Herr Klein“), Farbe, PLZ und Ort eintragen.
2. Knopf **Per WhatsApp teilen** oder **Per SMS teilen** – die Nachricht ist vorbereitet:
   „Hallo Herr Klein, wie besprochen hier der Link – in 2 Minuten sehen Sie, wie es funktioniert: … Viele Grüße, [IHR NAME]“
3. Oder **Link kopieren** und in eine E-Mail einfügen.

Die Seite versteht diese Parameter:

| Parameter | Wirkung | Beispiel |
|---|---|---|
| `firma` | „Für [Firma]“ im Hero und im Rechner | `firma=Malerbetrieb%20Klein-Uebbing` |
| `name` | Anrede im Hero: „Guten Tag Herr Klein, …“ | `name=Herr%20Klein` |
| `farbe` | Farbe der Handy-Vorschau und der Demo (nur `#rrggbb`) | `farbe=%235cb83c` |
| `plz`, `ort`, `web` | werden an die Demo weitergegeben, Beispiel-E-Mail zeigt den Ort | `plz=46414&ort=Rhede` |
| `kuerzel` | Kürzel für die Anfragenummer (Demo und Beispiel-E-Mail) | `kuerzel=MK` |
| `gewerk` | Beispieltexte fürs Gewerk (`maler`, `fliesen`) | `gewerk=maler` |

Alle Werte werden bereinigt (Länge, erlaubte Zeichen) und nur als Text eingesetzt. Nichts wird gespeichert.

---

## 4. Abnahme selbst prüfen

- Ohne Parameter: `index.html` – wirkt allgemein („Für Malerbetriebe im Münsterland“).
- Mit Parametern: `index.html?firma=Malerbetrieb%20Beispiel&name=Herr%20Beispiel&farbe=%23b3261e&plz=46399&ort=Bocholt`
- Sicherheit: `index.html?firma=%3Cscript%3Ealert(1)%3C/script%3E` – es erscheint nur bereinigter Text.
- Lighthouse: Chrome → F12 → Lighthouse → „Mobil“.

---

## Platzhalter, die Sie noch ausfüllen müssen

| Platzhalter | Wo |
|---|---|
| `[MARKENNAME]` | `config.js` (`brand.name`), Kopfzeile in `impressum.html` und `datenschutz.html` |
| `[DOMAIN]` | `config.js` (`siteUrl`) – steht bereits auf der GitHub-Pages-Adresse |
| `[IHR NAME]` | `config.js` (`owner.name`) |
| `[REGION]` | `config.js` (`owner.region`), ggf. `audience.region` |
| `[2–3 Sätze über mich]` | `config.js` (`owner.about`) |
| `[TELEFON]` | `config.js` (`contact.phone`), `impressum.html`, `datenschutz.html` |
| `[E-MAIL]` | `config.js` (`contact.email`), `impressum.html`, `datenschutz.html` |
| `[WHATSAPP-NUMMER]` | `config.js` (`contact.whatsapp`) – leer lassen, wenn kein WhatsApp |
| `[FOTO-PFAD]` | `config.js` (`owner.photo`) – optional |
| `[DEMO-URL]` | `config.js` (`demoUrl`) – steht auf der bestehenden Demo |
| Impressumsangaben | `impressum.html` |
| Datenschutzerklärung | `datenschutz.html` – rechtlich prüfen lassen |
| Text zum Pilotangebot | `config.js` (`pricing.pilot.text`) – Vorschlag ist eingetragen, bitte bestätigen |
| Umsatzsteuer-Hinweis | `config.js` (`pricing.vatNote`) – erst nach Prüfung eintragen |
| Leistungen je Paket | `config.js` (`pricing.classic.features`, `pricing.premium.features`) – Vorschläge, bitte prüfen |
