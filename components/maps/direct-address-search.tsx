import React, { useState } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

interface AddressSearchProps {
  onLocationSelect: (location: {
    address: string;
    lat: number;
    lng: number;
  }) => void;
  placeholder?: string;
}

export const DirectAddressSearch: React.FC<AddressSearchProps> = ({
  onLocationSelect,
  placeholder = "Adresse suchen...",
}) => {
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Verbesserte Geocoding-Funktion mit mehreren APIs
  const searchWithMultipleAPIs = async (searchQuery: string) => {
    if (searchQuery.length < 3) return;
    
    setIsLoading(true);
    try {
      // Parallel API calls für bessere Geschwindigkeit und Vollständigkeit
      const [nominatimResults, photonResults, overpassResults] = await Promise.allSettled([
        // Nominatim mit erweiterten Parametern für bessere Straßensuche
        fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=de&limit=20&addressdetails=1&extratags=1&namedetails=1&dedupe=0&viewbox=5.98865807458,54.983104153,15.0169958839,47.3024876979&bounded=0`
        ).then(res => res.json()),
        
        // Photon mit erweiterten Tags
        fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=15&lang=de&bbox=5.98865807458,47.3024876979,15.0169958839,54.983104153`
        ).then(res => res.json()),
        
        // Zusätzliche Suche speziell für Straßennamen
        fetch(
          `https://nominatim.openstreetmap.org/search?format=json&street=${encodeURIComponent(searchQuery)}&countrycodes=de&limit=15&addressdetails=1&dedupe=0`
        ).then(res => res.json())
      ]);

      let allResults: any[] = [];

      // Nominatim-Ergebnisse verarbeiten
      if (nominatimResults.status === 'fulfilled' && nominatimResults.value) {
        const formatted = nominatimResults.value.map((result: any, index: number) => ({
          place_id: `nominatim_${index}`,
          description: result.display_name,
          structured_formatting: {
            main_text: result.name || result.display_name.split(',')[0],
            secondary_text: result.display_name.split(',').slice(1).join(',').trim()
          },
          geometry: {
            location: {
              lat: parseFloat(result.lat),
              lng: parseFloat(result.lon)
            }
          },
          source: 'Nominatim'
        }));
        allResults = [...allResults, ...formatted];
      }

      // Photon-Ergebnisse verarbeiten
      if (photonResults.status === 'fulfilled' && photonResults.value?.features) {
        const formatted = photonResults.value.features.map((result: any, index: number) => ({
          place_id: `photon_${index}`,
          description: `${result.properties.name || result.properties.street}, ${result.properties.city || result.properties.state}, Deutschland`,
          structured_formatting: {
            main_text: result.properties.name || result.properties.street || searchQuery,
            secondary_text: `${result.properties.city || result.properties.state}, Deutschland`
          },
          geometry: {
            location: {
              lat: result.geometry.coordinates[1],
              lng: result.geometry.coordinates[0]
            }
          },
          source: 'Photon'
        }));
        allResults = [...allResults, ...formatted];
      }

      // Straßenspezifische Nominatim-Ergebnisse verarbeiten
      if (overpassResults.status === 'fulfilled' && overpassResults.value) {
        const formatted = overpassResults.value.map((result: any, index: number) => ({
          place_id: `street_${index}`,
          description: result.display_name,
          structured_formatting: {
            main_text: result.name || result.display_name.split(',')[0],
            secondary_text: result.display_name.split(',').slice(1).join(',').trim()
          },
          geometry: {
            location: {
              lat: parseFloat(result.lat),
              lng: parseFloat(result.lon)
            }
          },
          source: 'Straßensuche'
        }));
        allResults = [...allResults, ...formatted];
      }



      // Duplikate entfernen und nach Relevanz sortieren
      const uniqueResults = allResults.filter((result, index, self) => 
        index === self.findIndex(r => 
          Math.abs(r.geometry.location.lat - result.geometry.location.lat) < 0.001 &&
          Math.abs(r.geometry.location.lng - result.geometry.location.lng) < 0.001
        )
      ).slice(0, 15); // Max 15 Ergebnisse
      
      console.log('Combined search results:', uniqueResults);
      setPredictions(uniqueResults);
      setShowSuggestions(uniqueResults.length > 0);
    } catch (error) {
      console.error('Multi-API search error:', error);
      setPredictions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Debouncing für bessere Performance
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleInputChange = (value: string) => {
    setQuery(value);
    console.log('Direct search input:', value);
    
    // Vorherige Suche abbrechen
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    if (value.length >= 3) {
      // Neue Suche mit 300ms Verzögerung starten
      const timeout = setTimeout(() => {
        searchWithMultipleAPIs(value);
      }, 300);
      setSearchTimeout(timeout);
    } else {
      setPredictions([]);
      setShowSuggestions(false);
    }
  };

  const handlePredictionClick = (prediction: any) => {
    console.log('Selected prediction:', prediction);
    setQuery(prediction.description);
    setShowSuggestions(false);
    
    onLocationSelect({
      address: prediction.description,
      lat: prediction.geometry.location.lat,
      lng: prediction.geometry.location.lng,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && predictions.length > 0) {
      e.preventDefault();
      handlePredictionClick(predictions[0]);
    }
  };

  return (
    <div className="relative">
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => {
              if (predictions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onBlur={() => {
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            className="pl-10"
            disabled={isLoading}
          />
          
          {isLoading && (
            <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />
          )}
          
          {/* Suggestions dropdown */}
          {showSuggestions && predictions.length > 0 && (
            <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {predictions.map((prediction) => (
                <div
                  key={prediction.place_id}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handlePredictionClick(prediction)}
                >
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {prediction.structured_formatting.main_text}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {prediction.structured_formatting.secondary_text}
                      </p>
                      {prediction.source && (
                        <p className="text-xs text-blue-500 mt-1">
                          {prediction.source}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* No results message */}
          {showSuggestions && predictions.length === 0 && query.length >= 3 && !isLoading && (
            <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                Keine Vorschläge gefunden
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};