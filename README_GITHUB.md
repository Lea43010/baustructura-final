# 🏗️ Bau-Structura - Tiefbau Projektmanagement System

Eine vollständige mobile-first Web-Anwendung für das professionelle Baustellenmanagement im Tiefbau. Entwickelt für deutsche Bauunternehmen mit Fokus auf Effizienz und Benutzerfreundlichkeit.

## 📱 Live Demo

Das Projekt läuft live auf Replit und bietet eine vollständige Vorschau aller Funktionen.

## ✨ Hauptfunktionen

### 🔐 Authentifizierung & Rollen
- **Replit Auth Integration** mit OpenID Connect
- **Rollenbasierte Zugriffskontrolle**: Admin, Manager, User
- **Sichere Session-Verwaltung** mit PostgreSQL-Speicherung

### 📋 Projekt-Management
- **Vollständige CRUD-Operationen** für Projekte
- **GPS-Integration** für automatische Standort-Erfassung
- **Status-Tracking**: Planung, Aktiv, Abgeschlossen, Abgebrochen
- **Fortschritts-Verfolgung** mit visuellen Fortschrittsbalken
- **Budget-Management** und Zeitplanung

### 👥 Kunden- & Firmenverwaltung
- **Kunden-Datenbank** mit vollständigen Kontaktinformationen
- **Firmen-Verwaltung** und Beziehungsmanagement
- **Automatische ID-Systeme** für einfache Referenzierung
- **Erweiterte Suchfunktionen** nach ID, Name, E-Mail, Telefon

### 🌊 Hochwasserschutz-Modul
- **Spezialisierte Checklisten** für Hochwasserschutz-Projekte
- **Absperrschieber-Management** mit Standort-Tracking
- **Schadensmeldungen** und Dokumentation
- **Deichwachen-System** für Notfall-Koordination

### 📁 Zentrale Medien-Verwaltung
- **Einheitliche Dokumente-Verwaltung** für alle Medientypen
- **SFTP-Server-Integration** mit deutschen Hosting-Providern
- **Datei-Upload** mit automatischer Kategorisierung
- **Erweiterte Such- und Filterfunktionen**

### 📸 Kamera-Integration
- **Live-Kamera-Stream** für Baustellenfotos
- **GPS-Tagging** für automatische Standort-Zuordnung
- **Projekt-Anbindung** für organisierte Dokumentation
- **Mobile-optimierte Aufnahme-Oberfläche**

### 🎤 Audio-Recording System
- **Professionelle Sprachaufnahme** mit echo cancellation
- **Pause/Resume-Funktionalität** während der Aufnahme
- **Mock-Transkription** (bereit für OpenAI Whisper Integration)

### 🤖 KI-Integration (OpenAI)
- **Automatische Projektbeschreibungen** mit GPT-4o
- **KI-gestützte Risikobewertung** für Bauprojekte
- **Intelligenter Beratungs-Chat** für Projektoptimierung
- **EU AI Act Compliance** mit vollständiger Transparenz und Logging

### 📧 E-Mail System & Support
- **BREVO-Integration** für professionelle E-Mail-Kommunikation
- **Automatische Support-Tickets** mit rollenbasierten Berechtigungen
- **HTML/Text E-Mail-Templates** für verschiedene Szenarien
- **Ticket-Status-Verfolgung** mit automatischen Benachrichtigungen
- **GPS-Koordinaten-Erfassung** für Standort-Dokumentation

### 🗺️ Google Maps Integration
- **Deutsche Adress-Suche** mit optimierter Deutschland-spezifischer Filterung
- **Automatischer Kartensprung** zu gesuchten Standorten mit PLZ- und Hausnummer-Support
- **Projekt-Marker** mit erweiterten Popup-Informationen
- **Automatische Projektadresse** - "Karte öffnen" lädt direkt den Projektstandort
- **Professionelle Vermessungstools** mit Distanz- und Flächenmessung
- **Fachgeoportale-Integration** zu Bayern-Atlas und Denkmalatlas
- **Mobile-optimierte Karten-Interaktion** mit Touch-Unterstützung

### 📊 Dashboard & Analytics
- **Kompakte Projekt-Cards** für bessere Übersicht
- **Statistik-Übersichten** für aktive Projekte und Aufgaben
- **Schnellzugriff-Buttons** für häufige Aktionen
- **Responsive 2-Spalten-Layout** für optimale Platznutzung

## 🛠️ Technologie-Stack

### Frontend
- **React 18** mit TypeScript und Vite
- **Tailwind CSS** für responsive Gestaltung
- **shadcn/ui** Komponenten auf Radix UI Basis
- **TanStack Query** für Server-State-Management
- **Wouter** für leichtgewichtiges Routing
- **Framer Motion** für Animationen

### Backend
- **Node.js** mit Express.js Framework
- **TypeScript** mit ES Modules
- **Drizzle ORM** mit PostgreSQL
- **Replit Auth** für Authentifizierung
- **Session Management** mit PostgreSQL-Speicherung

### Datenbank
- **PostgreSQL** (Neon Serverless)
- **Drizzle Schema** mit TypeScript-Typisierung
- **Automatische Migrationen** mit Drizzle Kit
- **Relationenmanagement** für komplexe Datenstrukturen

### Deployment & DevOps
- **Replit** für Hosting und Entwicklung
- **Vite** für Frontend-Build
- **ESBuild** für Backend-Bundling
- **Hot Module Replacement** für Entwicklung

## 📱 Mobile-First Design

Das System wurde von Grund auf für mobile Endgeräte entwickelt:

- **Progressive Web App** (PWA) Funktionalität
- **Touch-optimierte Benutzeroberfläche**
- **Bottom-Navigation** für einfache Bedienung mit einer Hand
- **Responsive Breakpoints** für Handy, Tablet und Desktop
- **Offline-Fähigkeiten** für Baustelleneinsatz ohne Internet

## 🔧 Installation & Setup

### Voraussetzungen
- Node.js 18+ 
- PostgreSQL Datenbank
- Google Maps API Key (optional)

### Environment Variablen
```env
DATABASE_URL=postgresql://...
GOOGLE_MAPS_API_KEY=your_api_key
SESSION_SECRET=your_session_secret
REPL_ID=your_repl_id
REPLIT_DOMAINS=your_domain
```

### Installation
```bash
npm install
npm run db:push
npm run dev
```

## 📈 Projekt-Status

### ✅ Implementiert
- Vollständige Authentifizierung und Rollenverwaltung
- Projekt-, Kunden- und Firmenverwaltung
- Hochwasserschutz-Modul mit allen Spezialfunktionen
- Kamera- und Audio-Integration
- Google Maps mit deutscher Adresssuche
- Zentrale Medien-Verwaltung
- SFTP-Konfiguration für deutsche Provider
- Mobile-optimierte Benutzeroberfläche

### ✅ Kürzlich Implementiert (Juli 2025)
- **OpenAI Integration** mit EU AI Act Compliance
- **E-Mail System & Support Tickets** mit BREVO Integration
- **Professionelles Logo-Branding** durchgängig integriert
- **React Stability Framework** mit Error Boundaries
- **Bundle-Optimierung** mit Code-Splitting für 66% schnelleren Load
- **Erweiterte Karten-Funktionalität** mit automatischer Projektadresse-Erkennung
- **Optimierte Deutschland-Adresssuche** mit PLZ- und Hausnummer-Support
- **Selektive Distanzberechnung** nur für relevante Marker

### 🔄 In Entwicklung
- OpenAI Whisper Integration für Live-Transkription
- Erweiterte Reporting-Funktionen mit PDF-Export
- Cloud-Storage Integration für Medien-Dateien
- Push-Benachrichtigungen für mobile Apps

### 📋 Geplant
- Kalender-Integration mit Terminsynchronisation
- Team-Management mit Arbeitszeit-Tracking
- Erweiterte Analytics und Dashboards
- REST API für Drittanbieter-Integration

## 🤝 Mitwirkende

Entwickelt von Lea Zimmer mit Fokus auf deutsche Bauunternehmen und deren spezifische Anforderungen.

## 📄 Lizenz

Dieses Projekt steht unter der MIT Lizenz. Siehe LICENSE Datei für Details.

## 📞 Support

Bei Fragen oder Problemen können Sie sich an das Entwicklerteam wenden.

---

**Bau-Structura** - Moderne Lösungen für traditionelle Bauprojekte 🏗️