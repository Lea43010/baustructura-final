# GitHub Upload - Manuelle Anleitung

Da die automatische Git-Integration Probleme hat, verwenden Sie diese manuelle Methode:

## Schritt 1: Projekt als ZIP herunterladen

1. **In Replit:**
   - Klicken Sie auf die **drei Punkte (⋮)** neben dem Projekt-Namen oben
   - Wählen Sie **"Download as zip"**
   - Speichern Sie die Datei (z.B. `TiefbauManagement.zip`)

## Schritt 2: Dateien zu GitHub hochladen

1. **Gehen Sie zu Ihrem GitHub Repository:**
   - https://github.com/Lea43010/baustructura-final

2. **README-Datei erstellen:**
   - Klicken Sie "Add a README file"
   - Kopieren Sie den Inhalt aus `README_GITHUB.md` (aus dem Download)
   - Klicken Sie "Commit new file"

3. **Alle Projektdateien hochladen:**
   - Klicken Sie "uploading an existing file"
   - Entpacken Sie die ZIP-Datei auf Ihrem Computer
   - Ziehen Sie ALLE Ordner und Dateien in das GitHub-Upload-Feld:
     - `client/` (kompletter Ordner)
     - `server/` (kompletter Ordner) 
     - `shared/` (kompletter Ordner)
     - `package.json`
     - `vite.config.ts`
     - `tailwind.config.ts`
     - `drizzle.config.ts`
     - etc.

4. **Commit erstellen:**
   - Commit-Nachricht: `Bau-Structura Update Juli 2025 - Erweiterte Karten & Automatische Projektadresse`
   - Beschreibung:
     ```
     Neueste Updates (Juli 2025):
     - Automatische Projektadresse in Karten implementiert
     - Optimierte Deutschland-Adresssuche mit PLZ/Hausnummer
     - Selektive Distanzberechnung für bessere UX
     - URL-Parameter für direkte Kartensprünge
     - Erweiterte Fachgeoportale-Integration
     - UmweltAtlas Bayern entfernt (auf Benutzeranfrage)
     - Verbesserte Touch-Unterstützung für mobile Geräte
     - Dateistruktur bereinigt (maps-simple.tsx → maps.tsx)
     
     Vorherige Updates (Juni 2025):
     - OpenAI Integration mit EU AI Act Compliance
     - E-Mail System & Support Tickets (BREVO)
     - Professionelles Logo-Branding durchgängig
     - React Stability Framework mit Error Boundaries
     - Bundle-Optimierung (66% schnellerer Load)
     - Audio-Recording und Kamera-Integration
     - Hochwasserschutz-Modul komplett
     ```
   - Klicken Sie "Commit changes"

## Wichtige Dateien für GitHub:

✅ **Müssen hochgeladen werden:**
- Kompletter `client/` Ordner
- Kompletter `server/` Ordner  
- Kompletter `shared/` Ordner
- `package.json` und alle Config-Dateien
- `README_GITHUB.md` (als README.md umbenennen)

❌ **NICHT hochladen:**
- `.env` Dateien (falls vorhanden)
- `node_modules/` (wird automatisch ignoriert)
- `.replit` Dateien

Nach dem Upload haben Sie ein vollständiges Backup Ihres Projekts auf GitHub!