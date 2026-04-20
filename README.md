<p align="center">
  <img src="icons/icon128.png" width="96" alt="Advanced Chat for AutoDarts Logo"/>
</p>

<h1 align="center">Advanced Chat for AutoDarts</h1>

<p align="center">
  Speichert den Chatverlauf auf AutoDarts und zeigt ihn direkt im Spiel an.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-v3-blue?style=flat-square"/>
  <img src="https://img.shields.io/badge/Version-1.0.0-green?style=flat-square"/>
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square"/>
  <img src="https://img.shields.io/badge/Chrome-✓-brightgreen?style=flat-square&logo=googlechrome"/>
</p>

---

## Features

- 💬 **Persistenter Chatverlauf** – Nachrichten verschwinden nicht mehr nach wenigen Sekunden
- 🃏 **Card-Design** – Jede Nachricht als kompakte Karte mit Avatar, Name und Uhrzeit
- 🎯 **Pro-Match-Speicherung** – Lobby und Match mit gleicher UUID teilen einen Verlauf; neues Match = frischer Verlauf
- 🔄 **Auto-Scroll** – Neue Nachrichten immer sichtbar
- 🗑️ **Leeren-Button** – Verlauf jederzeit löschen

## Installation

### Chrome Web Store
*Coming soon*

### Manuell (Developer Mode)
1. Lade das neueste Release-ZIP von der [Releases](https://github.com/Marschl21/advanced-chat-autodarts/releases)-Seite herunter
2. ZIP entpacken
3. Chrome öffnen → `chrome://extensions/`
4. **Entwicklermodus** oben rechts aktivieren
5. **„Entpackte Erweiterung laden"** klicken → entpackten Ordner auswählen
6. [play.autodarts.io](https://play.autodarts.io) öffnen und den Chat-Button klicken

## Wie es funktioniert

Die Extension läuft im **MAIN world** (`world: "MAIN"`) und hängt sich in die WebSocket-Verbindung von AutoDarts ein, bevor die Seite selbst initialisiert. Eingehende Nachrichten auf dem `autodarts.chat`-Kanal werden abgefangen, per Match-UUID in `localStorage` gespeichert und als Cards oberhalb der Schnellnachrichten-Buttons angezeigt.

## Datenschutz

Alle Daten werden **lokal im Browser** via `localStorage` gespeichert. Es werden keine Daten an externe Server gesendet.

## Kompatibilität

| Browser | Status |
|---------|--------|
| Chrome  | ✅ Unterstützt |
| Edge    | ✅ Funktioniert (Chromium-basiert) |
| Brave   | ✅ Funktioniert (Chromium-basiert) |
| Firefox | ❌ Nicht unterstützt (`world: "MAIN"` ist Chrome-only) |

## Changelog

Siehe [CHANGELOG.md](CHANGELOG.md)

## Lizenz

[MIT](LICENSE) © 2026 Marschl21
