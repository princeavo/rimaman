import React, { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Location } from '../../types';

interface LocationMapProps {
  locations: Location[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

const customIcon = L.divIcon({
  className: '',
  html: `<div style="background:#006b32;width:40px;height:40px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;">
    <span style="font-family:'Plus Jakarta Sans',sans-serif;font-size:18px;font-weight:900;color:white;line-height:1;">R</span>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -24],
});

interface MapControllerProps {
  locations: Location[];
  selectedId?: string | null;
  markerRefs: React.MutableRefObject<Record<string, L.Marker>>;
}

const MapController: React.FC<MapControllerProps> = ({ locations, selectedId, markerRefs }) => {
  const map = useMap();

  useEffect(() => {
    if (!selectedId) return;
    const loc = locations.find((l) => l.id === selectedId);
    if (!loc) return;
    map.flyTo(loc.coordinates, 15, { animate: true, duration: 0.8 });
    const timer = setTimeout(() => {
      markerRefs.current?.[selectedId]?.openPopup();
    }, 900);
    return () => clearTimeout(timer);
  }, [selectedId, locations, map, markerRefs]);

  return null;
};

export const LocationMap: React.FC<LocationMapProps> = ({ locations, selectedId, onSelect }) => {
  const markerRefs = useRef<Record<string, L.Marker>>({});

  const center = useMemo<[number, number]>(() => {
    if (locations.length === 0) return [6.42, 2.44];
    const avgLat = locations.reduce((s, l) => s + l.coordinates[0], 0) / locations.length;
    const avgLng = locations.reduce((s, l) => s + l.coordinates[1], 0) / locations.length;
    return [avgLat, avgLng];
  }, [locations]);

  return (
    <MapContainer
      center={center}
      zoom={11}
      style={{ height: '480px', width: '100%', borderRadius: '2rem' }}
      className="shadow-2xl shadow-primary/5"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController locations={locations} selectedId={selectedId} markerRefs={markerRefs} />
      {locations.map((location) => (
        <Marker
          key={location.id}
          position={location.coordinates}
          icon={customIcon}
          ref={(ref) => {
            if (ref) markerRefs.current[location.id] = ref;
          }}
          eventHandlers={{ click: () => onSelect?.(location.id) }}
        >
          <Popup minWidth={180}>
            <div style={{ padding: '4px 2px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#c41230', marginBottom: '2px' }}>
                {location.type}
              </div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#138A00', marginBottom: location.address ? '4px' : '8px' }}>
                {location.name}
              </div>
              {location.address && (
                <div style={{ fontSize: '12px', color: '#555', marginBottom: '8px', lineHeight: '1.4' }}>
                  {location.address}
                </div>
              )}
              <a
                href={location.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '12px', fontWeight: 600, color: '#138A00', textDecoration: 'none' }}
              >
                Voir sur Google Maps
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
