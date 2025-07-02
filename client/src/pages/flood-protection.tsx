import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { useToast } from "../hooks/use-toast";
import { apiRequest, queryClient } from "../lib/queryClient";
import { PageHeader } from "../components/layout/page-header";
import { MobileNav } from "../components/layout/mobile-nav";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Search,
  Shield,
  Users,
  MapPin,
  Calendar,
  AlertCircle,
  Settings,
  FileText,
  Camera,
  ArrowLeft,
  ChevronRight,
  Edit,
  Trash2
} from "lucide-react";
import { useLocation } from "wouter";

export default function FloodProtection() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("checklists");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Handler für das Erstellen einer neuen Checkliste
  const handleCreateChecklist = async () => {
    try {
      const titel = (document.getElementById('titel') as HTMLInputElement)?.value;
      const typ = 'hochwasser'; // Default-Wert
      const pegelstand = (document.getElementById('pegelstand') as HTMLInputElement)?.value;
      const beschreibung = (document.getElementById('beschreibung') as HTMLTextAreaElement)?.value;

      if (!titel || !pegelstand) {
        toast({
          title: "Fehler",
          description: "Bitte füllen Sie alle Pflichtfelder aus.",
          variant: "destructive",
        });
        return;
      }

      // API-Aufruf zum Erstellen der Checkliste
      const response = await fetch("/api/flood/create-checklist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titel,
          typ,
          beginn_pegelstand_cm: parseInt(pegelstand),
          beschreibung
        }),
      });

      if (!response.ok) {
        throw new Error("Fehler beim Erstellen der Checkliste");
      }

      toast({
        title: "Erfolgreich",
        description: `Checkliste "${titel}" wurde erstellt.`,
      });

      setIsCreateDialogOpen(false);
      
      // Form-Felder zurücksetzen
      (document.getElementById('titel') as HTMLInputElement).value = '';
      (document.getElementById('pegelstand') as HTMLInputElement).value = '';
      (document.getElementById('beschreibung') as HTMLTextAreaElement).value = '';

    } catch (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Erstellen der Checkliste.",
        variant: "destructive",
      });
    }
  };

  // Handler für das Bearbeiten einer Checkliste
  const handleEditChecklist = (checklistId: string) => {
    setLocation(`/flood-protection/checklist/${checklistId}`);
  };

  // Handler für das Löschen einer einzelnen Checkliste
  const handleDeleteChecklist = async (checklistId: string, titel: string) => {
    const confirmed = window.confirm(`Möchten Sie die Checkliste "${titel}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`);
    
    if (!confirmed) return;

    try {
      await fetch(`/api/flood/checklists/${checklistId}`, {
        method: "DELETE",
      });

      toast({
        title: "Checkliste gelöscht",
        description: `"${titel}" wurde erfolgreich gelöscht.`,
      });

      // Hier würden wir normalerweise die Query invalidieren
      // queryClient.invalidateQueries(['/api/flood/checklists']);

    } catch (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Löschen der Checkliste.",
        variant: "destructive",
      });
    }
  };

  // Handler für das Löschen aller Checklisten
  const handleDeleteAllChecklists = async () => {
    const confirmed = window.confirm(
      `Möchten Sie wirklich ALLE Checklisten löschen? Diese Aktion kann nicht rückgängig gemacht werden.\n\nAlle Aufgaben, Prüfungen und Dokumentationen gehen verloren.`
    );
    
    if (!confirmed) return;

    const doubleConfirmed = window.confirm(
      `Sind Sie sich absolut sicher? Geben Sie zur Bestätigung "ALLE LÖSCHEN" ein.`
    );

    if (!doubleConfirmed) return;

    try {
      await fetch("/api/flood/checklists/delete-all", {
        method: "DELETE",
      });

      toast({
        title: "Alle Checklisten gelöscht",
        description: "Alle Checklisten wurden erfolgreich gelöscht.",
      });

    } catch (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Löschen der Checklisten.",
        variant: "destructive",
      });
    }
  };

  // Handler für das Duplizieren einer Checkliste
  const handleDuplicateChecklist = async (checklistId: string) => {
    try {
      await fetch("/api/flood/checklists/duplicate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ checklistId }),
      });

      toast({
        title: "Checkliste dupliziert",
        description: "Eine Kopie der Checkliste wurde erstellt.",
      });

    } catch (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Duplizieren der Checkliste.",
        variant: "destructive",
      });
    }
  };

  // Demo-Daten
  const demoChecklists = [
    {
      id: "1",
      titel: "Hochwasserereignis Mai 2025",
      typ: "hochwasser",
      status: "in_bearbeitung",
      erstellt_am: "2025-05-15T08:00:00Z",
      erstellt_von: "Thomas Müller",
      beginn_pegelstand_cm: 245,
      fortschritt: 68,
      aufgaben_gesamt: 11,
      aufgaben_erledigt: 7
    },
    {
      id: "2", 
      titel: "Routineübung Frühjahr",
      typ: "uebung",
      status: "abgeschlossen",
      erstellt_am: "2025-03-20T10:30:00Z",
      erstellt_von: "Sarah Weber",
      fortschritt: 100,
      aufgaben_gesamt: 11,
      aufgaben_erledigt: 11
    },
    {
      id: "3",
      titel: "Hochwasserübung Herbst",
      typ: "uebung", 
      status: "offen",
      erstellt_am: "2025-06-28T14:15:00Z",
      erstellt_von: "Michael Bach",
      fortschritt: 0,
      aufgaben_gesamt: 11,
      aufgaben_erledigt: 0
    }
  ];

  const demoAbsperrschieber = [
    {
      id: 1,
      nummer: 1,
      bezeichnung: "Absperrschieber DN 300",
      lage: "Lohr km 1,470, Nähe Kupfermühle",
      beschreibung: "Absperrschieber DN 300 mit Festspindel bis unter die Schachtdeckelunterkante",
      status: "funktionsfähig",
      letzte_pruefung: "2025-06-25",
      koordinaten_lat: 49.7962,
      koordinaten_lng: 9.9332
    },
    {
      id: 2,
      nummer: 2,
      bezeichnung: "Absperrschütz bei ehem. Grundwehr", 
      lage: "Lohr km 1,320",
      beschreibung: "Absperrschütz bei ehem. Grundwehr",
      status: "wartung_erforderlich",
      letzte_pruefung: "2025-06-20",
      koordinaten_lat: 49.7951,
      koordinaten_lng: 9.9318
    },
    {
      id: 3,
      nummer: 3,
      bezeichnung: "Absperrschieber DN 1800",
      lage: "Mutterbach, Überführungsbauwerk Nähe Parkplatz Augenklinik, Grundstück Weierich",
      beschreibung: "Absperrschieber DN1800 im Mutterbach mit aufgesetztem Schieber DN 300 (Nr.4)",
      status: "funktionsfähig",
      letzte_pruefung: "2025-06-26",
      koordinaten_lat: 49.7945,
      koordinaten_lng: 9.9305
    }
  ];

  const demoSchadensfaelle = [
    {
      id: "1",
      absperrschieber_nummer: 1,
      problem_beschreibung: "Festsitzender Deckel bei Schieber Nr. 1",
      status: "behoben",
      prioritaet: 2,
      gemeldet_am: "2025-06-25T09:15:00Z",
      gemeldet_von: "Klaus Werner",
      massnahme: "Mit Vorschlaghammer den Schacht freischlagen"
    },
    {
      id: "2",
      absperrschieber_nummer: 2,
      problem_beschreibung: "Kein Zulauf in Mühlgraben bei Schieber Nr. 2",
      status: "in_bearbeitung", 
      prioritaet: 1,
      gemeldet_am: "2025-06-28T11:30:00Z",
      gemeldet_von: "Anna Schmidt",
      massnahme: "Prüfen ob Schieber geschlossen ist >> öffnen; Rechen am Zulaufrohr in Lohr räumen"
    }
  ];

  const demoDeichwachen = [
    {
      id: "1",
      name: "Klaus Werner",
      telefon: "0171-1234567",
      schicht_beginn: "2025-06-29T06:00:00Z",
      schicht_ende: "2025-06-29T18:00:00Z",
      bereich: "Deichabschnitt A (km 0,0 - 2,5)",
      bemerkung: "Erfahrener Deichwächter"
    },
    {
      id: "2",
      name: "Anna Schmidt",
      telefon: "0172-9876543",
      schicht_beginn: "2025-06-29T18:00:00Z",
      schicht_ende: "2025-06-30T06:00:00Z",
      bereich: "Deichabschnitt B (km 2,5 - 5,0)",
      bemerkung: "Nachtschicht"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "offen": return "bg-blue-500";
      case "in_bearbeitung": return "bg-orange-500";
      case "abgeschlossen": return "bg-green-500";
      case "funktionsfähig": return "bg-green-500";
      case "wartung_erforderlich": return "bg-orange-500";
      case "defekt": return "bg-red-500";
      case "behoben": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "offen": return "Offen";
      case "in_bearbeitung": return "In Bearbeitung";
      case "abgeschlossen": return "Abgeschlossen";
      case "funktionsfähig": return "Funktionsfähig";
      case "wartung_erforderlich": return "Wartung erforderlich";
      case "defekt": return "Defekt";
      case "behoben": return "Behoben";
      default: return status;
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return "text-red-600 bg-red-100";
      case 2: return "text-orange-600 bg-orange-100";
      case 3: return "text-yellow-600 bg-yellow-100";
      case 4: return "text-blue-600 bg-blue-100";
      case 5: return "text-gray-600 bg-gray-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Zurück zum Dashboard
          </Button>
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Hochwasserschutz</h1>
          </div>
        </div>
      </PageHeader>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aktive Checklisten</p>
                  <p className="text-2xl font-bold text-gray-900">2</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Absperrschieber</p>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Settings className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Offene Schäden</p>
                  <p className="text-2xl font-bold text-gray-900">1</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Deichwachen</p>
                  <p className="text-2xl font-bold text-gray-900">2</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full max-w-lg grid-cols-5">
              <TabsTrigger value="checklists">Checklisten</TabsTrigger>
              <TabsTrigger value="schieber">Schieber</TabsTrigger>
              <TabsTrigger value="schaden">Schäden</TabsTrigger>
              <TabsTrigger value="wachen">Wachen</TabsTrigger>
              <TabsTrigger value="verwalten">Verwalten</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Neue Checkliste
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    JSON importieren
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Checkliste aus JSON importieren</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="json-input">JSON-Daten einfügen:</Label>
                      <Textarea
                        id="json-input"
                        placeholder="Fügen Sie hier die JSON-Daten der Checkliste ein..."
                        rows={10}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="checklist-type">Typ der Checkliste:</Label>
                      <Select defaultValue="hochwasser">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hochwasser">Hochwasserereignis</SelectItem>
                          <SelectItem value="uebung">Übung</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Importvorgang:</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Neue Checkliste wird erstellt</li>
                        <li>• Aufgaben werden aus JSON übernommen</li>
                        <li>• Absperrschieber werden aktualisiert/erstellt</li>
                        <li>• Schadensfälle-Vorlagen werden importiert</li>
                      </ul>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline">Abbrechen</Button>
                      <Button>Import starten</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <TabsContent value="checklists" className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Checklisten durchsuchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select defaultValue="alle">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Status filtern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alle">Alle Status</SelectItem>
                  <SelectItem value="offen">Offen</SelectItem>
                  <SelectItem value="in_bearbeitung">In Bearbeitung</SelectItem>
                  <SelectItem value="abgeschlossen">Abgeschlossen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {demoChecklists.map((checklist) => (
                <Card key={checklist.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{checklist.titel}</CardTitle>
                        <p className="text-sm text-gray-500">
                          Erstellt: {new Date(checklist.erstellt_am).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(checklist.status)} text-white`}>
                        {getStatusText(checklist.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Typ</span>
                        <Badge variant="outline">
                          {checklist.typ === "hochwasser" ? "Hochwasser" : "Übung"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Erstellt von</span>
                        <span className="font-medium">{checklist.erstellt_von}</span>
                      </div>

                      {checklist.beginn_pegelstand_cm && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Pegelstand</span>
                          <span className="font-medium">{checklist.beginn_pegelstand_cm} cm</span>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Aufgaben</span>
                          <span className="font-medium">{checklist.aufgaben_erledigt}/{checklist.aufgaben_gesamt}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${checklist.fortschritt}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setLocation(`/flood-protection/checklist/${checklist.id}`)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Öffnen
                        </Button>
                        {checklist.status !== "abgeschlossen" && (
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleEditChecklist(checklist.id)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Bearbeiten
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="schieber" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {demoAbsperrschieber.map((schieber) => (
                <Card key={schieber.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">Schieber Nr. {schieber.nummer}</CardTitle>
                        <p className="text-sm text-gray-600 font-medium">{schieber.bezeichnung}</p>
                      </div>
                      <Badge className={`${getStatusColor(schieber.status)} text-white`}>
                        {getStatusText(schieber.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{schieber.lage}</span>
                      </div>
                      
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {schieber.beschreibung}
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Letzte Prüfung</span>
                        <span className="font-medium">
                          {new Date(schieber.letzte_pruefung).toLocaleDateString('de-DE')}
                        </span>
                      </div>

                      {schieber.koordinaten_lat && schieber.koordinaten_lng && (
                        <div className="text-xs text-gray-500">
                          GPS: {schieber.koordinaten_lat.toFixed(4)}, {schieber.koordinaten_lng.toFixed(4)}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Camera className="h-4 w-4 mr-1" />
                          Prüfen
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Schaden
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="schaden" className="space-y-6">
            <div className="space-y-4">
              {demoSchadensfaelle.map((schaden) => (
                <Card key={schaden.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{schaden.problem_beschreibung}</CardTitle>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <Settings className="h-4 w-4" />
                            <span>Schieber Nr. {schaden.absperrschieber_nummer}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(schaden.gemeldet_am).toLocaleDateString('de-DE')}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{schaden.gemeldet_von}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${getPriorityColor(schaden.prioritaet)}`}>
                          Priorität {schaden.prioritaet}
                        </Badge>
                        <Badge className={`${getStatusColor(schaden.status)} text-white`}>
                          {getStatusText(schaden.status)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-3 rounded mb-4">
                      <p className="text-sm text-gray-700">
                        <strong>Maßnahme:</strong> {schaden.massnahme}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                      {schaden.status !== "behoben" && (
                        <Button size="sm">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Bearbeiten
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="wachen" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {demoDeichwachen.map((wache) => (
                <Card key={wache.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{wache.name}</CardTitle>
                        <p className="text-sm text-gray-600">{wache.telefon}</p>
                      </div>
                      <Badge variant="outline">Eingeteilt</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Schicht</span>
                        <span className="font-medium">
                          {new Date(wache.schicht_beginn).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} - 
                          {new Date(wache.schicht_ende).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{wache.bereich}</span>
                      </div>

                      {wache.bemerkung && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {wache.bemerkung}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Edit className="h-4 w-4 mr-1" />
                          Bearbeiten
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Entfernen
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="verwalten" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Alle Checklisten verwalten</h3>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleDeleteAllChecklists}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Alle löschen
                </Button>
              </div>

              <div className="space-y-3">
                {demoChecklists.map((checklist) => (
                  <Card key={checklist.id} className="p-4 border border-gray-200 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{checklist.titel}</h4>
                            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                              <span>ID: {checklist.id}</span>
                              <Badge variant="outline" className="text-xs">
                                {checklist.typ === "hochwasser" ? "Hochwasser" : "Übung"}
                              </Badge>
                              <Badge className={`${getStatusColor(checklist.status)} text-white text-xs`}>
                                {getStatusText(checklist.status)}
                              </Badge>
                              <span>Erstellt: {new Date(checklist.erstellt_am).toLocaleDateString('de-DE')}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right text-sm">
                          <div className="text-gray-600">Fortschritt</div>
                          <div className="font-medium">{checklist.fortschritt}%</div>
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setLocation(`/flood-protection/checklist/${checklist.id}`)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Öffnen
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDuplicateChecklist(checklist.id)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Duplizieren
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeleteChecklist(checklist.id, checklist.titel)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Löschen
                          </Button>
                        </div>
                      </div>
                    </div>

                    {checklist.beginn_pegelstand_cm && (
                      <div className="mt-3 text-sm text-gray-600 bg-blue-50 p-2 rounded">
                        Pegelstand: {checklist.beginn_pegelstand_cm} cm
                      </div>
                    )}
                  </Card>
                ))}

                {demoChecklists.length === 0 && (
                  <Card className="p-8 text-center">
                    <div className="text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-medium mb-2">Keine Checklisten vorhanden</p>
                      <p className="text-sm">Erstellen Sie eine neue Checkliste, um zu beginnen.</p>
                    </div>
                  </Card>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800 mb-1">Wichtiger Hinweis</p>
                    <p className="text-yellow-700">
                      Das Löschen von Checklisten kann nicht rückgängig gemacht werden. 
                      Alle zugehörigen Aufgaben, Prüfungen und Dokumentationen gehen verloren.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <MobileNav />

      {/* Dialog für neue Checkliste */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Neue Checkliste erstellen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="titel" className="text-sm font-medium">
                Titel <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="titel"
                placeholder="z.B. Hochwasserereignis Juni 2025"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="typ" className="text-sm font-medium">
                Typ <span className="text-red-500">*</span>
              </Label>
              <Select defaultValue="hochwasser">
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Typ auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hochwasser">Hochwasserereignis</SelectItem>
                  <SelectItem value="uebung">Übung</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="pegelstand" className="text-sm font-medium">
                Aktueller Pegelstand (cm) <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="pegelstand"
                type="number"
                placeholder="z.B. 245"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="beschreibung" className="text-sm font-medium">
                Beschreibung / Notizen
              </Label>
              <Textarea 
                id="beschreibung"
                placeholder="Zusätzliche Informationen zum Ereignis..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Automatisch erstellt:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 11 Standardaufgaben (Beginn + Ende)</li>
                <li>• Schieber-Prüfungen für alle aktiven Anlagen</li>
                <li>• Schadensmelde-System</li>
                <li>• Deichwachen-Verwaltung</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Abbrechen
              </Button>
              <Button onClick={handleCreateChecklist}>
                <Plus className="h-4 w-4 mr-2" />
                Checkliste erstellen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}