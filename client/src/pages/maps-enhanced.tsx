import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { useToast } from "../hooks/use-toast";
import { PageHeader } from "../components/layout/page-header";
import { MobileNav } from "../components/layout/mobile-nav";
import { ArrowLeft, Search, Plus, Minus, Navigation, X, MapPin, Hammer, Wrench, Check, Ruler, Download, Trash2, Edit3, Layers, Target, Move, Save, Building2, Crosshair } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { DirectAddressSearch } from "../components/maps/direct-address-search";
import { apiRequest, queryClient } from "../lib/queryClient";
import type { Project } from "../shared/schema";

// Erweiterte Marker-Typen für Bauprojekte
interface CustomMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description: string;
  type: 'project' | 'marker' | 'measurement';
  projectId?: number;
  color: string;
  icon: string;
  createdAt: string;
}

// Messung-Interface für Distanzen
interface Measurement {
  id: string;
  points: { lat: number; lng: number }[];
  distance: number;
  type: 'line' | 'area';
  title: string;
  unit: 'meters' | 'kilometers';
}

// Google Maps Komponente mit erweiterten Features
interface EnhancedMapProps {
  projects: Project[];
  selectedProject: Project | null;
  onProjectSelect: (project: Project) => void;
  markers: CustomMarker[];
  measurements: Measurement[];
  onMarkerAdd: (marker: Omit<CustomMarker, 'id' | 'createdAt'>) => void;
  onMeasurementAdd: (measurement: Omit<Measurement, 'id'>) => void;
  searchLocation: { lat: number; lng: number; address: string } | null;
  drawingMode: string;
  onDrawingModeChange: (mode: string) => void;
}

function EnhancedGoogleMap({ 
  projects, 
  selectedProject, 
  onProjectSelect, 
  markers,
  measurements,
  onMarkerAdd,
  onMeasurementAdd,
  searchLocation,
  drawingMode,
  onDrawingModeChange
}: EnhancedMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [googleMarkers, setGoogleMarkers] = useState<any[]>([]);
  const [searchMarker, setSearchMarker] = useState<any>(null);
  const [measurementPath, setMeasurementPath] = useState<any[]>([]);
  const [drawingManager, setDrawingManager] = useState<any>(null);

  // Initialisiere die Karte mit erweiterten Optionen
  useEffect(() => {
    if (mapRef.current && !map && (window as any).google?.maps) {
      const newMap = new (window as any).google.maps.Map(mapRef.current, {
        center: { lat: 48.1351, lng: 11.5820 }, // München
        zoom: 12,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: (window as any).google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: (window as any).google.maps.ControlPosition.TOP_RIGHT
        },
        streetViewControl: true,
        streetViewControlOptions: {
          position: (window as any).google.maps.ControlPosition.RIGHT_TOP
        },
        fullscreenControl: true,
        fullscreenControlOptions: {
          position: (window as any).google.maps.ControlPosition.RIGHT_TOP
        },
        zoomControl: true,
        zoomControlOptions: {
          position: (window as any).google.maps.ControlPosition.RIGHT_CENTER
        },
        mapTypeId: 'roadmap', // Straßenansicht für bessere Übersicht
        gestureHandling: 'greedy',
        styles: []
      });

      // Drawing Manager für Messungen und Markierungen
      const drawingMgr = new (window as any).google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: false,
        polygonOptions: {
          fillColor: '#ff0000',
          fillOpacity: 0.3,
          strokeWeight: 2,
          clickable: false,
          editable: true,
          draggable: true
        },
        polylineOptions: {
          strokeColor: '#ff0000',
          strokeWeight: 3,
          clickable: false,
          editable: true,
          draggable: true
        }
      });
      
      drawingMgr.setMap(newMap);
      setDrawingManager(drawingMgr);

      // Event Listener für Drawing Manager
      (window as any).google.maps.event.addListener(drawingMgr, 'polylinecomplete', (polyline: any) => {
        const path = polyline.getPath();
        const distance = (window as any).google.maps.geometry.spherical.computeLength(path);
        const points = [];
        for (let i = 0; i < path.getLength(); i++) {
          const point = path.getAt(i);
          points.push({ lat: point.lat(), lng: point.lng() });
        }
        
        onMeasurementAdd({
          points,
          distance: Math.round(distance),
          type: 'line',
          title: `Distanz ${Math.round(distance)}m`,
          unit: distance > 1000 ? 'kilometers' : 'meters'
        });
        
        polyline.setMap(null); // Temporäre Linie entfernen
        drawingMgr.setDrawingMode(null);
        onDrawingModeChange('');
      });

      // Event Listener für Polygon (Flächenmessung)
      (window as any).google.maps.event.addListener(drawingMgr, 'polygoncomplete', (polygon: any) => {
        const path = polygon.getPath();
        const area = (window as any).google.maps.geometry.spherical.computeArea(path);
        const points = [];
        for (let i = 0; i < path.getLength(); i++) {
          const point = path.getAt(i);
          points.push({ lat: point.lat(), lng: point.lng() });
        }
        
        onMeasurementAdd({
          points,
          distance: Math.round(area),
          type: 'area',
          title: `Fläche ${Math.round(area)}m²`,
          unit: 'meters'
        });
        
        polygon.setMap(null);
        drawingMgr.setDrawingMode(null);
        onDrawingModeChange('');
      });

      // Click Event für Marker-Platzierung
      newMap.addListener('click', (event: any) => {
        console.log('Map clicked, drawingMode:', drawingMode);
        
        if (drawingMode === 'marker') {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          
          console.log('Creating marker at:', lat, lng);
          
          // Sofort Marker hinzufügen ohne Geocoding-Verzögerung
          const markerData = {
            lat: Number(lat),
            lng: Number(lng),
            title: `Marker ${new Date().toLocaleTimeString('de-DE')}`,
            description: `Position: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            type: 'marker' as const,
            projectId: selectedProject?.id,
            color: '#dc2626',
            icon: '📍'
          };
          
          console.log('Adding marker:', markerData);
          onMarkerAdd(markerData);
          onDrawingModeChange('');
        }
      });

      setMap(newMap);
    }
  }, [mapRef.current, drawingMode]);

  // Drawing Mode ändern
  useEffect(() => {
    if (drawingManager) {
      let drawingModeValue = null;
      if (drawingMode === 'line') {
        drawingModeValue = (window as any).google.maps.drawing.OverlayType.POLYLINE;
      } else if (drawingMode === 'area') {
        drawingModeValue = (window as any).google.maps.drawing.OverlayType.POLYGON;
      }
      drawingManager.setDrawingMode(drawingModeValue);
    }
  }, [drawingMode, drawingManager]);

  // Projekt-Marker rendern
  useEffect(() => {
    if (map && projects) {
      // Vorherige Marker entfernen
      googleMarkers.forEach(marker => marker.setMap(null));
      
      const newMarkers = projects
        .filter(project => 
          project.latitude && 
          project.longitude && 
          typeof project.latitude === 'number' && 
          typeof project.longitude === 'number' &&
          !isNaN(project.latitude) &&
          !isNaN(project.longitude)
        )
        .map(project => {
          console.log('Creating project marker for:', project.name);
          
          const marker = new (window as any).google.maps.Marker({
            position: { 
              lat: Number(project.latitude), 
              lng: Number(project.longitude) 
            },
            map: map,
            title: project.name,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="56" height="56" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="28" cy="28" r="24" fill="#10b981" stroke="#ffffff" stroke-width="4"/>
                  <circle cx="28" cy="28" r="8" fill="#ffffff"/>
                  <text x="28" y="35" text-anchor="middle" fill="#10b981" font-size="18" font-weight="bold">P</text>
                </svg>
              `),
              scaledSize: new (window as any).google.maps.Size(56, 56)
            },
            animation: (window as any).google.maps.Animation.BOUNCE
          });

          // Animation nach 2 Sekunden stoppen
          setTimeout(() => {
            if (marker) {
              marker.setAnimation(null);
            }
          }, 2000);

          // Info Window für Projekt-Details
          const infoWindow = new (window as any).google.maps.InfoWindow({
            content: `
              <div style="max-width: 250px;">
                <h3 style="margin: 0 0 8px 0; color: #1f2937; font-weight: bold;">${project.name}</h3>
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">${project.description || 'Keine Beschreibung'}</p>
                <div style="display: flex; gap: 8px;">
                  <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${project.status}</span>
                </div>
                <button onclick="window.selectProject(${project.id})" style="
                  margin-top: 8px; 
                  padding: 6px 12px; 
                  background: #2563eb; 
                  color: white; 
                  border: none; 
                  border-radius: 4px; 
                  cursor: pointer;
                  font-size: 14px;
                ">Projekt öffnen</button>
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });

          return marker;
        });

      setGoogleMarkers(newMarkers);

      // Global function für Projekt-Auswahl
      (window as any).selectProject = (projectId: number) => {
        const project = projects.find(p => p.id === projectId);
        if (project) onProjectSelect(project);
      };
    }
  }, [map, projects]);

  // Custom Marker rendern
  useEffect(() => {
    if (map && markers && markers.length > 0) {
      markers.forEach(markerData => {
        // Koordinaten validieren
        if (typeof markerData.lat === 'number' && 
            typeof markerData.lng === 'number' && 
            !isNaN(markerData.lat) && 
            !isNaN(markerData.lng)) {
          
          console.log('Creating custom marker:', markerData);
          
          const marker = new (window as any).google.maps.Marker({
            position: { 
              lat: Number(markerData.lat), 
              lng: Number(markerData.lng) 
            },
            map: map,
            title: markerData.title,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="48" height="48" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="20" fill="${markerData.color}" stroke="#ffffff" stroke-width="4"/>
                  <circle cx="24" cy="24" r="8" fill="#ffffff"/>
                  <text x="24" y="30" text-anchor="middle" fill="#000000" font-size="16" font-weight="bold">M</text>
                </svg>
              `),
              scaledSize: new (window as any).google.maps.Size(48, 48)
            },
            animation: (window as any).google.maps.Animation.DROP
          });
          
          console.log('Marker created successfully');

          const infoWindow = new (window as any).google.maps.InfoWindow({
            content: `
              <div>
                <h4>${markerData.title}</h4>
                <p>${markerData.description}</p>
                <small>Erstellt: ${new Date(markerData.createdAt).toLocaleDateString('de-DE')}</small>
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });
        }
      });
    }
  }, [map, markers]);

  // Messungen rendern
  useEffect(() => {
    if (map && measurements) {
      measurements.forEach(measurement => {
        if (measurement.type === 'line') {
          const polyline = new (window as any).google.maps.Polyline({
            path: measurement.points,
            geodesic: true,
            strokeColor: '#ff0000',
            strokeOpacity: 1.0,
            strokeWeight: 3,
            map: map
          });

          // Label für Distanz
          const midpoint = measurement.points[Math.floor(measurement.points.length / 2)];
          const label = new (window as any).google.maps.InfoWindow({
            content: `<div style="background: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${measurement.title}</div>`,
            position: midpoint
          });
          label.open(map);
        }
      });
    }
  }, [map, measurements]);

  // Suchmarker handhaben
  useEffect(() => {
    if (map && searchLocation && 
        typeof searchLocation.lat === 'number' && 
        typeof searchLocation.lng === 'number' &&
        !isNaN(searchLocation.lat) && 
        !isNaN(searchLocation.lng)) {
      
      if (searchMarker) {
        searchMarker.setMap(null);
      }

      const newSearchMarker = new (window as any).google.maps.Marker({
        position: { 
          lat: Number(searchLocation.lat), 
          lng: Number(searchLocation.lng) 
        },
        map: map,
        title: 'Suchergebnis: ' + searchLocation.address,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="16" fill="#dc2626" stroke="#ffffff" stroke-width="3"/>
              <circle cx="20" cy="20" r="8" fill="#ffffff"/>
            </svg>
          `),
          scaledSize: new (window as any).google.maps.Size(40, 40)
        },
        animation: (window as any).google.maps.Animation.BOUNCE
      });

      setSearchMarker(newSearchMarker);
      map.panTo({ 
        lat: Number(searchLocation.lat), 
        lng: Number(searchLocation.lng) 
      });
      map.setZoom(16);

      // Animation nach 3 Sekunden stoppen
      setTimeout(() => {
        if (newSearchMarker) {
          newSearchMarker.setAnimation(null);
        }
      }, 3000);
    }
  }, [map, searchLocation]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
}

// Hauptkomponente
export default function EnhancedMaps() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // States für erweiterte Funktionen
  const [markers, setMarkers] = useState<CustomMarker[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchLocation, setSearchLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [drawingMode, setDrawingMode] = useState<string>('');
  const [showMarkerDialog, setShowMarkerDialog] = useState(false);
  const [newMarker, setNewMarker] = useState({
    title: '',
    description: '',
    type: 'marker' as const,
    color: '#2563eb'
  });

  // Projekte laden
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Google Maps API Key laden
  const { data: mapsConfig } = useQuery<{ apiKey?: string }>({
    queryKey: ["/api/config/maps-key"],
  });

  // Marker hinzufügen
  const handleMarkerAdd = (marker: Omit<CustomMarker, 'id' | 'createdAt'>) => {
    const newMarkerData: CustomMarker = {
      ...marker,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setMarkers(prev => [...prev, newMarkerData]);
    toast({
      title: "Marker hinzugefügt",
      description: `Neuer Marker "${marker.title}" wurde erstellt.`,
    });
  };

  // Messung hinzufügen
  const handleMeasurementAdd = (measurement: Omit<Measurement, 'id'>) => {
    const newMeasurement: Measurement = {
      ...measurement,
      id: Date.now().toString()
    };
    setMeasurements(prev => [...prev, newMeasurement]);
    toast({
      title: "Messung hinzugefügt",
      description: measurement.type === 'line' 
        ? `Distanz: ${measurement.distance}m` 
        : `Fläche: ${measurement.distance}m²`,
    });
  };

  // Karte als PDF exportieren
  const exportToPDF = () => {
    toast({
      title: "PDF Export",
      description: "PDF-Export wird vorbereitet...",
    });
    // Hier würde die PDF-Generierung implementiert werden
  };

  // Alle Marker löschen
  const clearAllMarkers = () => {
    setMarkers([]);
    setMeasurements([]);
    toast({
      title: "Karte bereinigt",
      description: "Alle Marker und Messungen wurden entfernt.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Kartendaten...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Kompakte Header-Zeile */}
      <div className="bg-white border-b shadow-sm px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück
            </Button>
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Tiefbau Map</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedProject?.id.toString() || ""} onValueChange={(value) => {
            const project = projects.find(p => p.id.toString() === value);
            setSelectedProject(project || null);
          }}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Projekt auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Alle Projekte</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id.toString()}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Seitliche Toolbar */}
        <div className="w-80 bg-white border-r shadow-sm p-4 overflow-y-auto">
          {/* Baustellenstandort Eingabefelder */}
          <div className="space-y-4 mb-6">
            <div>
              <Label className="text-sm font-medium text-gray-700">Baustellenstandort:</Label>
              <Input placeholder="Stadt/Gemeinde" className="mt-1" />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Baustellenstraße:</Label>
              <Input placeholder="Straße und Hausnummer" className="mt-1" />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Baustellenpostleitzahl:</Label>
              <Input placeholder="PLZ" className="mt-1" />
            </div>
          </div>

          {/* Adresssuche */}
          <div className="mb-6">
            <DirectAddressSearch
              onLocationSelect={(location) => setSearchLocation(location)}
              placeholder="Adresse suchen..."
            />
          </div>

          {/* Zeichenwerkzeuge */}
          <div className="space-y-3 mb-6">
            <h3 className="font-medium text-gray-900">Werkzeuge</h3>
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant={drawingMode === 'marker' ? 'default' : 'outline'}
                onClick={() => setDrawingMode(drawingMode === 'marker' ? '' : 'marker')}
                className="w-full justify-start"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Marker setzen
              </Button>
              <Button
                variant={drawingMode === 'line' ? 'default' : 'outline'}
                onClick={() => setDrawingMode(drawingMode === 'line' ? '' : 'line')}
                className="w-full justify-start"
              >
                <Ruler className="h-4 w-4 mr-2" />
                Distanz messen
              </Button>
              <Button
                variant={drawingMode === 'area' ? 'default' : 'outline'}
                onClick={() => setDrawingMode(drawingMode === 'area' ? '' : 'area')}
                className="w-full justify-start"
              >
                <Layers className="h-4 w-4 mr-2" />
                Fläche messen
              </Button>
            </div>
          </div>

          {/* Route-Funktionen */}
          <div className="space-y-3 mb-6">
            <h3 className="font-medium text-gray-900">Route</h3>
            <div className="bg-gray-50 border rounded-lg p-3">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Route Start:</span>
                  <div className="text-gray-600">Kein Startpunkt</div>
                </div>
                <div>
                  <span className="font-medium">Route Ende:</span>
                  <div className="text-gray-600">Kein Endpunkt</div>
                </div>
                <div>
                  <span className="font-medium">Streckenlänge:</span>
                  <div className="text-gray-600">Keine Route</div>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" className="flex-1">
                  <Trash2 className="h-3 w-3 mr-1" />
                  Route löschen
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Save className="h-3 w-3 mr-1" />
                  Route speichern
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Download className="h-3 w-3 mr-1" />
                  PDF-Bericht
                </Button>
              </div>
            </div>
          </div>

          {/* Kartenoptionen */}
          <div className="space-y-3 mb-6">
            <h3 className="font-medium text-gray-900">Kartenoptionen</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                Karte
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                Satellit
              </Button>
            </div>
          </div>

            {/* Aktiver Modus Anzeige */}
            {drawingMode && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-base font-medium text-blue-800">
                  {drawingMode === 'marker' && '📍 Klicken Sie auf die Karte, um einen Marker zu setzen'}
                  {drawingMode === 'line' && '📏 Klicken Sie auf die Karte, um eine Distanz zu messen'}
                  {drawingMode === 'area' && '📐 Klicken Sie auf die Karte, um eine Fläche zu messen'}
                </p>
              </div>
            )}

            {/* Debug Info */}
            <div className="mt-3 p-2 bg-gray-50 border border-gray-200 rounded-md">
              <p className="text-sm text-gray-600">
                Projekte: {projects.length} | Marker: {markers.length} | Messungen: {measurements.length}
                {selectedProject && ` | Ausgewählt: ${selectedProject.name}`}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Aktueller Modus: {drawingMode || 'Kein Modus'} | 
                Projekte mit Koordinaten: {projects.filter(p => p.latitude && p.longitude).length}
              </p>
            </div>

            {/* Test Marker Button */}
            <div className="mt-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  const testMarker = {
                    lat: 48.1351 + (Math.random() - 0.5) * 0.01,
                    lng: 11.5820 + (Math.random() - 0.5) * 0.01,
                    title: `Test Marker ${Date.now()}`,
                    description: 'Test Marker für Debugging',
                    type: 'marker' as const,
                    color: '#ef4444',
                    icon: '🔴'
                  };
                  handleMarkerAdd(testMarker);
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Test Marker
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Karte */}
        <div className="flex-1 mx-4 mb-4">
          <Card className="h-full">
            <CardContent className="p-0 h-full">
              {mapsConfig && mapsConfig.apiKey ? (
                <Wrapper
                  apiKey={mapsConfig.apiKey}
                  libraries={['drawing', 'geometry']}
                  render={(status: Status) => {
                    if (status === Status.LOADING) return <div className="h-full flex items-center justify-center">Lade Google Maps...</div>;
                    if (status === Status.FAILURE) return <div className="h-full flex items-center justify-center text-red-500">Fehler beim Laden der Karte</div>;
                    return (
                      <EnhancedGoogleMap
                        projects={projects}
                        selectedProject={selectedProject}
                        onProjectSelect={setSelectedProject}
                        markers={markers}
                        measurements={measurements}
                        onMarkerAdd={handleMarkerAdd}
                        onMeasurementAdd={handleMeasurementAdd}
                        searchLocation={searchLocation}
                        drawingMode={drawingMode}
                        onDrawingModeChange={setDrawingMode}
                      />
                    );
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">Google Maps API-Schlüssel nicht verfügbar</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Statistiken */}
        <div className="mx-4 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{projects.filter(p => p.latitude && p.longitude).length}</div>
                <div className="text-sm text-gray-600">Projekte auf Karte</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{markers.length}</div>
                <div className="text-sm text-gray-600">Custom Marker</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{measurements.filter(m => m.type === 'line').length}</div>
                <div className="text-sm text-gray-600">Distanzmessungen</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{measurements.filter(m => m.type === 'area').length}</div>
                <div className="text-sm text-gray-600">Flächenmessungen</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}