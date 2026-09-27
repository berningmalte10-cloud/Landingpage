<?php
/*
 * Beispiel-Endpoint für die Terminanfrage der Landingpage.
 * Läuft NICHT auf GitHub Pages (dort gibt es kein PHP), sondern auf einem normalen Webspace mit PHP.
 *
 * Einrichtung:
 *  1. Die drei Werte unten anpassen.
 *  2. Datei auf den Webspace laden, z. B. nach https://www.ihre-domain.de/termin.php
 *  3. In config.js eintragen: bookingEndpoint: "https://www.ihre-domain.de/termin.php"
 *  4. Einmal selbst testen.
 */

$empfaenger = '[E-MAIL]';                        // Hier kommen die Terminanfragen an
$absender   = 'termin@[DOMAIN]';                 // Adresse auf Ihrer eigenen Domain (wichtig gegen Spam-Filter)
$erlaubteHerkunft = 'https://[DOMAIN]';          // Adresse der Landingpage, z. B. https://ihr-name.github.io

// ---------------------------------------------------------------

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && rtrim($origin, '/') === rtrim($erlaubteHerkunft, '/')) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Accept');
    header('Vary: Origin');
}
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo '{"ok":false}'; exit; }

$raw = file_get_contents('php://input', false, null, 0, 20000);
$data = json_decode($raw, true);
if (!is_array($data)) { http_response_code(400); echo '{"ok":false}'; exit; }

// Honeypot ausgefüllt: so tun, als wäre alles in Ordnung, aber nichts senden
if (!empty($data['hp'])) { echo '{"ok":true}'; exit; }

function feld($data, $key, $max) {
    $v = isset($data[$key]) && is_string($data[$key]) ? $data[$key] : '';
    $v = preg_replace('/[\x00-\x09\x0B-\x1F\x7F]/u', '', $v);   // Steuerzeichen raus (Zeilenumbruch bleibt)
    return mb_substr(trim($v), 0, $max);
}
function einzeilig($v) { return trim(preg_replace('/\s+/u', ' ', $v)); }

$art     = einzeilig(feld($data, 'art', 60));
$zeit    = einzeilig(feld($data, 'zeit', 60));
$name    = einzeilig(feld($data, 'name', 80));
$betrieb = einzeilig(feld($data, 'betrieb', 100));
$telefon = einzeilig(feld($data, 'telefon', 30));
$notiz   = feld($data, 'notiz', 600);
$tage    = [];
if (isset($data['tage']) && is_array($data['tage'])) {
    foreach (array_slice($data['tage'], 0, 12) as $t) {
        if (is_string($t)) $tage[] = einzeilig(mb_substr($t, 0, 40));
    }
}

if ($art === '' || $zeit === '' || !$tage || mb_strlen($name) < 2 || mb_strlen($betrieb) < 2
    || !preg_match('/^[\d\s+()\/-]{6,30}$/', $telefon) || empty($data['datenschutz'])) {
    http_response_code(422);
    echo '{"ok":false}';
    exit;
}

$betreff = 'Terminanfrage: ' . $betrieb . ' (' . $art . ')';
$text  = "Neue Terminanfrage über die Landingpage\n\n";
$text .= "Termin:     $art\n";
$text .= "Tage:       " . implode(', ', $tage) . "\n";
$text .= "Tageszeit:  $zeit\n\n";
$text .= "Name:       $name\n";
$text .= "Betrieb:    $betrieb\n";
$text .= "Telefon:    $telefon\n";
if ($notiz !== '') $text .= "\nAnmerkung:\n$notiz\n";
$text .= "\nEingegangen: " . date('d.m.Y H:i') . " Uhr\n";

$headers  = 'From: ' . $absender . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "Content-Transfer-Encoding: 8bit\r\n";

$ok = mail($empfaenger, '=?UTF-8?B?' . base64_encode($betreff) . '?=', $text, $headers, '-f' . $absender);

http_response_code($ok ? 200 : 500);
echo json_encode(['ok' => (bool)$ok]);
