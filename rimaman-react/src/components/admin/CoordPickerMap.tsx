import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from '../common/Icon';

const COTONOU: [number, number] = [6.36, 2.42];

const markerIcon = L.divIcon({
  className: '',
  html: `<div style="background:#8a5a00;width:32px;height:32px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;">
    <span style="font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:900;color:white;line-height:1;">R</span>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface CoordPickerMapProps {
  lat: number;
  lng: number;
  onCoordsChange: (lat: number, lng: number) => void;
  onSuggestionSelect?: (name: string, address: string) => void;
}

const ClickHandler: React.FC<{ onCoordsChange: (lat: number, lng: number) => void }> = ({ onCoordsChange }) => {
  useMapEvents({
    click(e) {
      onCoordsChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const ViewUpdater: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat !== 0 || lng !== 0) {
      map.flyTo([lat, lng], Math.max(map.getZoom(), 15), { animate: true, duration: 0.6 });
    }
  }, [lat, lng, map]);
  return null;
};

export const CoordPickerMap: React.FC<CoordPickerMapProps> = ({ lat, lng, onCoordsChange, onSuggestionSelect }) => {
  const hasCoords = lat !== 0 || lng !== 0;

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced fetch suggestions
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (q.length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&countrycodes=bj,tg,ng,gh&accept-language=fr`;
        const res = await fetch(url);
        const data = await res.json() as NominatimResult[];
        setSuggestions(data);
        setOpen(data.length > 0);
        setActiveIndex(-1);
      } catch {
        setSuggestions([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const pickSuggestion = (s: NominatimResult) => {
    onCoordsChange(parseFloat(s.lat), parseFloat(s.lon));
    const parts = s.display_name.split(',').map((p) => p.trim());
    const name = parts[0] ?? '';
    const address = parts.slice(1, 4).join(', ');
    setQuery(name);
    setOpen(false);
    setSuggestions([]);
    onSuggestionSelect?.(name, address);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = activeIndex >= 0 ? suggestions[activeIndex] : suggestions[0];
      if (target) pickSuggestion(target);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Search with suggestions */}
      <div ref={containerRef} className="relative">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-outline-variant bg-white focus-within:border-primary transition-colors">
          {loading
            ? <span className="w-4 h-4 border-2 border-on-surface-variant/30 border-t-primary rounded-full animate-spin flex-shrink-0" />
            : <Icon name="search" size="sm" className="text-on-surface-variant flex-shrink-0" />}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder="Rechercher un lieu (ex : Marché Dantokpa)"
            className="flex-1 text-sm bg-transparent focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setSuggestions([]); setOpen(false); }}
              className="text-on-surface-variant hover:text-on-surface transition-colors flex-shrink-0"
            >
              <Icon name="close" size="sm" />
            </button>
          )}
        </div>

        {open && suggestions.length > 0 && (
          <ul className="absolute z-[1000] left-0 right-0 top-full mt-1 bg-white border border-outline-variant rounded-xl shadow-lg overflow-hidden max-h-52 overflow-y-auto">
            {suggestions.map((s, i) => {
              const [main, ...rest] = s.display_name.split(',');
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => pickSuggestion(s)}
                    className={`w-full text-left px-3 py-2.5 flex items-start gap-2 hover:bg-surface-container transition-colors ${
                      i === activeIndex ? 'bg-surface-container' : ''
                    }`}
                  >
                    <Icon name="location_on" size="sm" className="text-primary flex-shrink-0 mt-0.5" />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-on-surface truncate">{main}</span>
                      <span className="block text-xs text-on-surface-variant truncate">{rest.slice(0, 3).join(',')}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Map */}
      <MapContainer
        center={hasCoords ? [lat, lng] : COTONOU}
        zoom={hasCoords ? 15 : 12}
        style={{ height: '200px', width: '100%', borderRadius: '0.75rem', cursor: 'crosshair' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <ClickHandler onCoordsChange={onCoordsChange} />
        <ViewUpdater lat={lat} lng={lng} />
        {hasCoords && (
          <Marker
            position={[lat, lng]}
            icon={markerIcon}
            draggable
            eventHandlers={{
              dragend(e) {
                const pos = (e.target as L.Marker).getLatLng();
                onCoordsChange(pos.lat, pos.lng);
              },
            }}
          />
        )}
      </MapContainer>
    </div>
  );
};
