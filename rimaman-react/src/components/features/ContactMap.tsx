import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface ContactMapProps {
  lat: number;
  lng: number;
  googleUrl?: string | null;
}

const markerIcon = L.divIcon({
  className: '',
  html: `<div style="background:#006b32;width:40px;height:40px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;">
    <span style="font-family:'Plus Jakarta Sans',sans-serif;font-size:18px;font-weight:900;color:white;line-height:1;">R</span>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -22],
});

export const ContactMap: React.FC<ContactMapProps> = ({ lat, lng, googleUrl }) => (
  <MapContainer
    center={[lat, lng]}
    zoom={16}
    style={{ height: '100%', width: '100%' }}
    scrollWheelZoom={false}
  >
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    <Marker position={[lat, lng]} icon={markerIcon}>
      <Popup>
        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", padding: '4px' }}>
          <strong style={{ color: '#006b32' }}>RIMAMAN – Moulin d'Or</strong>
          {googleUrl && (
            <>
              <br />
              <a
                href={googleUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#006b32', fontWeight: 700, fontSize: '13px' }}
              >
                Ouvrir dans Google Maps ↗
              </a>
            </>
          )}
        </div>
      </Popup>
    </Marker>
  </MapContainer>
);
