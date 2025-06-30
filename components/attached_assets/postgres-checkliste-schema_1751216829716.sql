-- Haupttabelle für Checklisten-Instanzen
CREATE TABLE checklisten (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titel VARCHAR(255) NOT NULL DEFAULT 'Hochwasserereignis oder Übung',
    typ VARCHAR(50) NOT NULL CHECK (typ IN ('hochwasser', 'uebung')),
    erstellt_am TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    erstellt_von VARCHAR(255) NOT NULL,
    beginn_datum TIMESTAMP WITH TIME ZONE,
    beginn_pegelstand_cm INTEGER,
    ende_datum TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'offen' CHECK (status IN ('offen', 'in_bearbeitung', 'abgeschlossen')),
    notizen TEXT
);

-- Index für bessere Performance bei Zeitabfragen
CREATE INDEX idx_checklisten_erstellt_am ON checklisten(erstellt_am);
CREATE INDEX idx_checklisten_status ON checklisten(status);

-- Template-Tabelle für Aufgaben (Master-Daten)
CREATE TABLE aufgaben_vorlagen (
    id SERIAL PRIMARY KEY,
    kategorie VARCHAR(50) NOT NULL CHECK (kategorie IN ('beginn', 'ende')),
    nummer INTEGER NOT NULL,
    beschreibung TEXT NOT NULL,
    erfordert_datum BOOLEAN DEFAULT FALSE,
    erfordert_pegelstand BOOLEAN DEFAULT FALSE,
    aktiv BOOLEAN DEFAULT TRUE,
    UNIQUE(kategorie, nummer)
);

-- Ausgefüllte Aufgaben für eine spezifische Checkliste
CREATE TABLE checklisten_aufgaben (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checkliste_id UUID NOT NULL REFERENCES checklisten(id) ON DELETE CASCADE,
    vorlage_id INTEGER NOT NULL REFERENCES aufgaben_vorlagen(id),
    erledigt BOOLEAN DEFAULT FALSE,
    erledigt_am TIMESTAMP WITH TIME ZONE,
    erledigt_von VARCHAR(255),
    datum DATE,
    pegelstand_cm INTEGER,
    bemerkung TEXT,
    UNIQUE(checkliste_id, vorlage_id)
);

CREATE INDEX idx_checklisten_aufgaben_checkliste ON checklisten_aufgaben(checkliste_id);

-- Absperrschieber Inventar (Master-Daten)
CREATE TABLE absperrschieber (
    id SERIAL PRIMARY KEY,
    nummer INTEGER NOT NULL UNIQUE,
    bezeichnung VARCHAR(255) NOT NULL,
    lage TEXT NOT NULL,
    beschreibung TEXT,
    koordinaten_lat DECIMAL(10, 8),
    koordinaten_lng DECIMAL(11, 8),
    aktiv BOOLEAN DEFAULT TRUE
);

-- Mögliche Schadensfälle pro Absperrschieber (Master-Daten)
CREATE TABLE schadensfall_vorlagen (
    id SERIAL PRIMARY KEY,
    absperrschieber_id INTEGER NOT NULL REFERENCES absperrschieber(id) ON DELETE CASCADE,
    problem TEXT NOT NULL,
    massnahme TEXT NOT NULL,
    prioritaet INTEGER DEFAULT 3 CHECK (prioritaet BETWEEN 1 AND 5),
    aktiv BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_schadensfall_vorlagen_schieber ON schadensfall_vorlagen(absperrschieber_id);

-- Absperrschieber-Prüfungen pro Checkliste
CREATE TABLE schieber_pruefungen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checkliste_id UUID NOT NULL REFERENCES checklisten(id) ON DELETE CASCADE,
    absperrschieber_id INTEGER NOT NULL REFERENCES absperrschieber(id),
    geprueft BOOLEAN DEFAULT FALSE,
    geprueft_am TIMESTAMP WITH TIME ZONE,
    geprueft_von VARCHAR(255),
    funktionsfaehig BOOLEAN,
    bemerkung TEXT,
    UNIQUE(checkliste_id, absperrschieber_id)
);

CREATE INDEX idx_schieber_pruefungen_checkliste ON schieber_pruefungen(checkliste_id);

-- Gemeldete Schadensfälle
CREATE TABLE schadensfall_meldungen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checkliste_id UUID NOT NULL REFERENCES checklisten(id) ON DELETE CASCADE,
    absperrschieber_id INTEGER NOT NULL REFERENCES absperrschieber(id),
    schadensfall_vorlage_id INTEGER REFERENCES schadensfall_vorlagen(id),
    gemeldet_am TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    gemeldet_von VARCHAR(255) NOT NULL,
    problem_beschreibung TEXT NOT NULL,
    durchgefuehrte_massnahme TEXT,
    status VARCHAR(50) DEFAULT 'offen' CHECK (status IN ('offen', 'in_bearbeitung', 'behoben', 'nicht_behebbar')),
    behoben_am TIMESTAMP WITH TIME ZONE,
    behoben_von VARCHAR(255),
    prioritaet INTEGER DEFAULT 3 CHECK (prioritaet BETWEEN 1 AND 5),
    foto_urls TEXT[]
);

CREATE INDEX idx_schadensfall_meldungen_checkliste ON schadensfall_meldungen(checkliste_id);
CREATE INDEX idx_schadensfall_meldungen_status ON schadensfall_meldungen(status);

-- Deichwachen-Einteilung
CREATE TABLE deichwachen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checkliste_id UUID NOT NULL REFERENCES checklisten(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    telefon VARCHAR(50),
    schicht_beginn TIMESTAMP WITH TIME ZONE NOT NULL,
    schicht_ende TIMESTAMP WITH TIME ZONE NOT NULL,
    bereich VARCHAR(255),
    bemerkung TEXT
);

CREATE INDEX idx_deichwachen_checkliste ON deichwachen(checkliste_id);

-- Audit-Log für wichtige Änderungen
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checkliste_id UUID REFERENCES checklisten(id) ON DELETE CASCADE,
    tabelle VARCHAR(100) NOT NULL,
    datensatz_id UUID NOT NULL,
    aktion VARCHAR(50) NOT NULL CHECK (aktion IN ('erstellt', 'aktualisiert', 'geloescht')),
    benutzer VARCHAR(255) NOT NULL,
    zeitstempel TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    alte_werte JSONB,
    neue_werte JSONB
);

CREATE INDEX idx_audit_log_checkliste ON audit_log(checkliste_id);
CREATE INDEX idx_audit_log_zeitstempel ON audit_log(zeitstempel);

-- Views für häufige Abfragen

-- Übersicht aller offenen Checklisten
CREATE VIEW offene_checklisten AS
SELECT 
    c.id,
    c.titel,
    c.typ,
    c.erstellt_am,
    c.erstellt_von,
    c.beginn_datum,
    c.beginn_pegelstand_cm,
    COUNT(DISTINCT ca.id) FILTER (WHERE ca.erledigt = FALSE) AS offene_aufgaben,
    COUNT(DISTINCT sm.id) FILTER (WHERE sm.status != 'behoben') AS offene_schadensfaelle
FROM checklisten c
LEFT JOIN checklisten_aufgaben ca ON c.id = ca.checkliste_id
LEFT JOIN schadensfall_meldungen sm ON c.id = sm.checkliste_id
WHERE c.status != 'abgeschlossen'
GROUP BY c.id;

-- Fortschritt pro Checkliste
CREATE VIEW checklisten_fortschritt AS
SELECT 
    c.id,
    c.titel,
    COUNT(ca.id) AS gesamt_aufgaben,
    COUNT(ca.id) FILTER (WHERE ca.erledigt = TRUE) AS erledigte_aufgaben,
    CASE 
        WHEN COUNT(ca.id) > 0 
        THEN ROUND((COUNT(ca.id) FILTER (WHERE ca.erledigt = TRUE))::NUMERIC / COUNT(ca.id) * 100, 2)
        ELSE 0 
    END AS fortschritt_prozent
FROM checklisten c
LEFT JOIN checklisten_aufgaben ca ON c.id = ca.checkliste_id
GROUP BY c.id;

-- Funktionen für automatische Zeitstempel
CREATE OR REPLACE FUNCTION update_erledigt_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.erledigt = TRUE AND OLD.erledigt = FALSE THEN
        NEW.erledigt_am = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_erledigt_timestamp
BEFORE UPDATE ON checklisten_aufgaben
FOR EACH ROW
EXECUTE FUNCTION update_erledigt_timestamp();

-- Beispiel-Daten einfügen (Master-Daten für Aufgaben)
INSERT INTO aufgaben_vorlagen (kategorie, nummer, beschreibung, erfordert_datum, erfordert_pegelstand) VALUES
-- Beginn des Betriebes
('beginn', 1, 'Checkliste mit Datum des Aufbaubeginns und Pegelstand versehen', TRUE, TRUE),
('beginn', 2, 'Alarmpläne in Einsatzzentrale auslegen; Beginn mit Alarmstufe 1, weitere Alarmstufen in Abhängigkeit der HW-Pegel verwenden', FALSE, FALSE),
('beginn', 3, 'Arbeitsanweisungen (bei Bedarf Übersichtslagepläne) entsprechend den Alarmplänen ausgeben und abarbeiten', FALSE, FALSE),
('beginn', 4, 'Deichwachen einteilen', FALSE, FALSE),
-- Ende des Betriebes
('ende', 1, 'Checkliste mit Datum des Abbaubeginns versehen', TRUE, FALSE),
('ende', 2, 'Alarmpläne und Arbeitsanweisungen "Aufbau" im Teil 2 Register 6 ablegen', FALSE, FALSE),
('ende', 3, 'Abbauplan in Einsatzzentrale auslegen (nicht nach Alarmstufen gegliedert)', FALSE, FALSE),
('ende', 4, 'Arbeitsanweisungen ausgeben und abarbeiten (bei unerreichten Alarmstufen nicht verwendete Bauteile auf Schäden kontrollieren und diese ggf. in den Arbeitsanweisungen kennzeichnen)', FALSE, FALSE),
('ende', 5, 'Eintragung (Aufbau, Abbau, Unterschrift, Übung) in die Liste "Chronik der Hochwasserschutzanlage" (im Teil 3 unter Register 2)', FALSE, FALSE),
('ende', 6, 'Sämtliche Unterlagen sortieren, kontrollieren und in Teil 2 unter Register 6 abheften', FALSE, FALSE),
('ende', 7, 'Neue Unterlagen für nächsten Betrieb vorbereiten, in Teil 2 bereitstellen', FALSE, FALSE);

-- Beispiel-Daten für Absperrschieber (erste 3 als Beispiel)
INSERT INTO absperrschieber (nummer, bezeichnung, lage, beschreibung) VALUES
(1, 'Absperrschieber DN 300', 'Lohr km 1,470, Nähe Kupfermühle', 'Absperrschieber DN 300 mit Festspindel bis unter die Schachtdeckelunterkante'),
(2, 'Absperrschütz bei ehem. Grundwehr', 'Lohr km 1,320', 'Absperrschütz bei ehem. Grundwehr'),
(3, 'Absperrschieber DN 1800', 'Mutterbach, Überführungsbauwerk Nähe Parkplatz Augenklinik, Grundstück Weierich', 'Absperrschieber DN1800 im Mutterbach mit aufgesetztem Schieber DN 300 (Nr.4)');

-- Beispiel-Schadensfälle für Absperrschieber 1
INSERT INTO schadensfall_vorlagen (absperrschieber_id, problem, massnahme, prioritaet) VALUES
(1, 'festsitzender Deckel', 'mit Vorschlaghammer den Schacht freischlagen', 2),
(1, 'kein Zulauf in Mühlgraben', 'prüfen ob Schieber geschlossen ist >> öffnen; Rechen am Zulaufrohr in Lohr räumen; Mindestwassermenge am Grundwehr zulaufen lassen', 1),
(1, 'Bedienungsschlüssel geht verloren oder ist defekt', 'Ersatzschlüssel holen oder Schlosser holen', 3),
(1, 'nur bei Wartung: Schieber lässt sich nicht schließen', 'Reparatur im Zuge der Wartung', 4);