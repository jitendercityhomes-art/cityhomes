
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in Leaflet
if (typeof window !== 'undefined') {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
}

const ChangeView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, 16);
    }
  }, [center, map]);
  return null;
};

const MapEvents = ({ onClick }) => {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const BranchMap = ({ lat, lng, radius, color, onLocationChange }) => {
  return (
    <MapContainer 
      center={[lat || 19.2183, lng || 73.1302]} 
      zoom={16} 
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <ChangeView center={[lat, lng]} />
      <MapEvents onClick={onLocationChange} />
      <Marker 
        position={[lat, lng]} 
        draggable={true}
        eventHandlers={{
          dragend: (e) => {
            const marker = e.target;
            const position = marker.getLatLng();
            onLocationChange(position.lat, position.lng);
          },
        }}
      />
      <Circle 
        center={[lat, lng]} 
        radius={radius || 200}
        pathOptions={{ color: color, fillColor: color, fillOpacity: 0.2 }}
      />
    </MapContainer>
  );
};

export default BranchMap;
