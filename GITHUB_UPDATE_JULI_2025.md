# GitHub Update Juli 2025 - Bau-Structura

## Neue Features und Verbesserungen

### 🗺️ Erweiterte Karten-Funktionalität

#### Automatische Projektadresse
- **"Karte öffnen" Button** übergibt jetzt automatisch Projektdaten via URL-Parameter
- **Direkter Kartensprung** zur Projektposition beim Öffnen der Karte
- **Toast-Benachrichtigungen** bestätigen das automatische Laden der Projektadresse
- **Koordinaten-Validierung** verhindert Fehler bei ungültigen GPS-Daten

#### Optimierte Deutschland-Adresssuche
- **Deutschland-spezifische Filterung** in der Nominatim-API
- **PLZ- und Hausnummer-Support** für präzise Adresssuche
- **Stabilere Suchparameter** mit 3-Zeichen-Minimum und 400ms Timeout
- **Verbesserte Suchergebnisse** durch Bounding-Box-Filterung

#### Selektive Distanzberechnung
- **Projekt-Distanzen entfernt** für übersichtlichere Sidebar
- **Entfernungsanzeige beibehalten** für individuell gesetzte Marker
- **Sortierte Anzeige** der 3 nächsten Marker nach Entfernung
- **Optimierte Benutzerführung** ohne überflüssige Informationen

### 🔧 Technische Verbesserungen
- **URL-Parameter-Integration** für nahtlose Navigation zwischen Seiten
- **Erweiterte Fehlerbehandlung** für robustere Karten-Funktionalität
- **Performance-Optimierung** der Adresssuche
- **Mobile Touch-Unterstützung** verbessert
- **Dateistruktur bereinigt** - maps-simple.tsx zu maps.tsx umbenannt für konsistente Namensgebung

## Benutzeranfrage-basierte Anpassungen

### UmweltAtlas Bayern entfernt
- **Komplette Entfernung** auf explizite Benutzeranfrage
- **Standortabhängige Daten** zeigten falsche Informationen (München-Daten in Würzburg)
- **Saubere Karten-Darstellung** ohne verwirrende Overlays

### Distanzberechnung angepasst
- **Benutzer-spezifische Wünsche** umgesetzt
- **Selektive Anzeige** nur relevanter Distanzen
- **Verbesserte Übersichtlichkeit** der Karten-Sidebar

## Installation des Updates

### 1. Projekt als ZIP herunterladen
```
Replit → Drei Punkte (⋮) → Download as zip
```

### 2. GitHub Repository aktualisieren
```
Repository: https://github.com/Lea43010/baustructura-final
Commit-Nachricht: "Bau-Structura Update Juli 2025 - Erweiterte Karten & Automatische Projektadresse"
```

### 3. Wichtige Dateien
- `client/src/pages/maps.tsx` - Hauptkarten-Komponente mit URL-Parameter-Support (umbenannt von maps-simple.tsx)
- `client/src/pages/project-details.tsx` - Automatische Projektadresse-Übergabe
- `client/src/components/maps/direct-address-search.tsx` - Optimierte Deutschland-Suche
- `client/src/App.tsx` - Aktualisierte Import-Struktur
- `replit.md` - Aktualisierte Projekt-Dokumentation

## Technische Details

### URL-Parameter-Format
```
/maps?address=[ENCODED_ADDRESS]&lat=[LATITUDE]&lng=[LONGITUDE]
```

### Deutschland-spezifische API-Parameter
```javascript
// Nominatim API mit Deutschland-Filterung
countrycodes: 'de',
bounded: 1,
viewbox: '5.8,47.2,15.1,55.1'  // Deutschland Bounding Box
```

### Automatische Validierung
```javascript
// Koordinaten-Validierung
if (!isNaN(lat) && !isNaN(lng) &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180) {
  // Sicheres Laden der Projektposition
}
```

## Changelog Integration

Alle Änderungen sind in `replit.md` dokumentiert und nachverfolgbar:

```
- July 2, 2025. Automatische Projektadresse in Karten implementiert
- July 2, 2025. Optimierte Deutschland-Adresssuche 
- July 2, 2025. Selektive Distanzberechnung angepasst
```

---

**Das Update ist bereit für GitHub!** 🚀

Folgen Sie der Anleitung in `GITHUB_UPLOAD_ANLEITUNG.md` für den manuellen Upload.