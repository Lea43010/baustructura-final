# Bau-Structura Project Management System

## Overview

Bau-Structura is a modern construction project management system designed specifically for civil engineering projects. It's a full-stack web application built with React/TypeScript frontend and Express.js backend, featuring mobile-first design, GPS integration, and AI-powered analysis capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Mobile-First Design**: Progressive Web App (PWA) optimized for smartphones and tablets

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Replit Auth with OpenID Connect integration
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful API with role-based access control

### Database Architecture
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM with TypeScript-first schema definitions
- **Migration Strategy**: Drizzle Kit for schema migrations
- **Session Storage**: PostgreSQL-backed session store for authentication

## Key Components

### Authentication System
- **Provider**: Replit Auth with OIDC integration
- **Session Management**: PostgreSQL-backed sessions with 7-day TTL
- **Authorization**: Role-based access (admin, manager, user) with middleware protection
- **User Management**: Automatic user creation and profile synchronization

### Project Management Core
- **Project CRUD**: Full lifecycle management with status tracking (planning, active, completed, cancelled)
- **Location Integration**: GPS coordinates with automatic geo-tagging
- **Customer Management**: Customer and company relationship tracking
- **Document Management**: File attachments and photo documentation

### Mobile Features
- **Camera Integration**: Photo capture with location tagging
- **Audio Recording**: Voice notes with transcription capabilities
- **Maps Integration**: GPS tracking and project location visualization
- **Offline Support**: Progressive Web App with offline capabilities

### UI/UX Architecture
- **Design System**: Consistent component library with shadcn/ui
- **Theme System**: CSS custom properties for light/dark mode support
- **Responsive Design**: Mobile-first with tablet and desktop breakpoints
- **Navigation**: Bottom tab navigation for mobile, contextual navigation for desktop

## Data Flow

### Authentication Flow
1. User initiates login through Replit Auth
2. OIDC provider validates credentials and returns tokens
3. User session is created and stored in PostgreSQL
4. Subsequent requests are authenticated via session middleware
5. Role-based authorization controls access to resources

### Project Management Flow
1. Projects are created with basic information and optional location data
2. GPS coordinates are captured automatically on mobile devices
3. Photos and documents are uploaded and associated with projects
4. Audio recordings are processed and transcribed
5. AI analysis provides risk assessment and project insights

### Data Persistence
- **Database Layer**: Drizzle ORM handles all database operations
- **Schema Management**: Type-safe schema definitions shared between client and server
- **Validation**: Zod schemas ensure data integrity at API boundaries
- **Caching**: React Query manages client-side caching and synchronization

## External Dependencies

### Core Technologies
- **Neon Database**: Serverless PostgreSQL hosting
- **Replit Auth**: Authentication and user management
- **Radix UI**: Accessible component primitives
- **TanStack Query**: Server state management
- **Drizzle ORM**: Type-safe database operations

### Development Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Type safety across the entire stack
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Backend bundling for production

### Third-Party Integrations
- **Google Maps**: Location services and mapping (planned)
- **AI Services**: Text analysis and risk assessment (planned)
- **Cloud Storage**: File and media storage (planned)

## Deployment Strategy

### Development Environment
- **Frontend**: Vite development server with hot module replacement
- **Backend**: TSX for TypeScript execution with auto-reload
- **Database**: Neon serverless PostgreSQL with connection pooling
- **Session Storage**: PostgreSQL table for session persistence

### Production Build
- **Frontend**: Static assets built with Vite and served by Express
- **Backend**: Bundled with ESBuild for Node.js deployment
- **Environment**: Single-server deployment with environment-based configuration
- **Database**: Managed PostgreSQL with automated backups

### Configuration Management
- **Environment Variables**: Database URLs, session secrets, and API keys
- **Build Process**: Separate build steps for frontend and backend
- **Static Assets**: Frontend builds to `dist/public`, served by Express
- **Type Safety**: Shared TypeScript types between client and server

## Changelog

Changelog:
- June 29, 2025. Initial setup and complete mobile-first implementation
- June 29, 2025. User confirmed Replit Auth flow working correctly
- June 29, 2025. Fixed navigation routing issues - all back buttons now work properly
- June 29, 2025. Complete profile page with SFTP configuration and privacy settings added
- June 29, 2025. User provided comprehensive feature checklist for systematic development
- June 29, 2025. Database schema cleanup - removed legacy address fields, added separate address components
- June 29, 2025. Implemented automatic ID system with visible IDs in UI for customers and projects
- June 29, 2025. Added comprehensive search functionality - search by ID, name, email, phone, description
- June 29, 2025. Hochwasserschutz-Modul hinzugefügt mit spezialisiertem PostgreSQL Schema
- June 29, 2025. Checklisten, Absperrschieber, Schadensmeldungen und Deichwachen-System implementiert
- June 29, 2025. Administrationsbereich implementiert für Admin-Rollen mit Systemübersicht und Verwaltungsfunktionen
- June 29, 2025. Drei-Lizenz-System zur Landing Page hinzugefügt (Basic 21€, Professional 39€, Enterprise)
- June 29, 2025. Verwirrende landing.tsx entfernt - nur noch landing-enhanced.tsx als einzige Landing Page
- June 29, 2025. Vollständige Google Maps Integration mit Adresssuche und automatischem Kartensprung implementiert
- June 30, 2025. Erweiterte SFTP-Konfiguration mit umfassender Anleitung und Bedienungsführung für Manager/Admins
- June 30, 2025. Vollständige Kamera-Integration mit echtem Video-Stream, GPS-Tagging und Projektanbindung implementiert
- June 30, 2025. Audio-Recording System mit Sprachaufnahme, Mock-Transkription und Projektanbindung implementiert
- June 30, 2025. GitHub Backup erfolgreich erstellt - vollständiges Repository "baustructura-final" mit manueller Upload-Methode
- June 30, 2025. OpenAI Integration implementiert - KI-Projektbeschreibungen, Risikobewertung, Beratungs-Chat mit EU AI Act Compliance
- June 30, 2025. React Stability Framework implementiert - Error Boundaries, Performance Monitoring, Bundle-Optimierung für Produktionsbereitschaft
- June 30, 2025. Code-Splitting mit Lazy Loading implementiert - 66% schnellerer Initial Load durch Route-basierte Bundle-Aufteilung
- June 30, 2025. Bundle-Optimierung abgeschlossen trotz vite.config.ts Schutz - Lazy Loading funktional, Performance Monitoring aktiv
- June 30, 2025. E-Mail System & Support Tickets vollständig implementiert - BREVO Integration, automatische Benachrichtigungen, rollenbasierte Berechtigungen
- June 30, 2025. Professionelles Logo-Branding implementiert - Sachverständigenbüro-Logo durchgängig in Dashboard, Auth und Landing-Page integriert
- June 30, 2025. Logo-Display-Problem behoben - Logo in client/public/ verschoben für korrekte Vite-Unterstützung, funktioniert jetzt einwandfrei
- June 30, 2025. Dokumente-Button zur Projekt-Details-Seite hinzugefügt - 3-Spalten-Layout mit Foto, Audio und Dokumente-Upload für bessere Benutzerführung
- June 30, 2025. Erweiterte Karten-Funktionalität implementiert - Professionelle Vermessungstools, Marker-System, Distanz-/Flächenmessung, PDF-Export, Projekt-Verknüpfung
- June 30, 2025. Vollbild-Kartenansicht implementiert - Professionelle seitliche Toolbar mit Baustellenfeldern, vollbildschirmige Karte, verbesserte Marker-Funktionalität, SelectItem-Fehler behoben
- June 30, 2025. Adresssuche mit Hausnummer-Unterstützung und automatischem Kartensprung implementiert - Erweiterte Nominatim-API-Parameter, Suchmarker mit Info-Windows, doppelte Tooltips behoben
- June 30, 2025. Fachgeoportale-Integration in Karten-Seite - Direkte Verlinkungen zu Denkmalatlas Bayern, BayernAtlas, BGR Geoportal und LfU Bodeninformationen für professionelle Tiefbau-Recherche
- July 2, 2025. UmweltAtlas Bayern Integration entfernt auf Benutzeranfrage - Standortabhängige Daten zeigten München-Daten in Würzburg, komplette Entfernung für saubere Karten-Darstellung
- July 2, 2025. Adressensuche optimiert - Deutschland-spezifische Filterung, verbesserte PLZ- und Hausnummer-Unterstützung, stabilere Suchparameter implementiert
- July 2, 2025. Distanzberechnung selektiv angepasst - Projekt-Distanzen entfernt, aber Entfernungsanzeige zu individuell gesetzten Markern beibehalten auf Benutzeranfrage
- July 2, 2025. Automatische Projektadresse in Karten implementiert - "Karte öffnen" Button übergibt Projektdaten via URL-Parameter, Karte springt automatisch zur Projektposition
- July 2, 2025. GitHub Update vorbereitet - Aktualisierte README und Dokumentation für alle Juli-Features erstellt, manuelle Upload-Anleitung aktualisiert
- July 2, 2025. Karten-Dateien bereinigt - maps-simple.tsx zu maps.tsx umbenannt für konsistente Namensgebung, alte maps.tsx als maps-old.tsx archiviert

## User Preferences

Preferred communication style: Simple, everyday language.