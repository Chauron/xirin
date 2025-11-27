import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import type { Point } from '../types';

interface MapViewProps {
  points: Point[];
  onAddPoint: (lat: number, lng: number) => void;
}

const MapEvents = ({ onAddPoint }: { onAddPoint: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onAddPoint(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export default function MapView({ points, onAddPoint }: MapViewProps) {
  const center: LatLngExpression = [40.4168, -3.7038];

  return (
    <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <MapEvents onAddPoint={onAddPoint} />
      {points.map((point) => (
        <Marker key={point.id} position={[point.lat, point.lng]}>
          <Popup>
            {point.name} <br /> {point.date}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
