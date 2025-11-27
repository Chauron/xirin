import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useAppStore } from '../store/useAppStore';
import { Box, Dialog, DialogTitle, DialogContent, TextField, Button, MenuItem, Select, FormControl, InputLabel, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapClickHandler = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng.lat, e.latlng.lng);
        }
    });
    return null;
};

export const MapPage: React.FC = () => {
  const { spots, loadSpots, addSpot } = useAppStore();
  const navigate = useNavigate();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newSpotLocation, setNewSpotLocation] = useState<{lat: number, lng: number} | null>(null);
  const [newSpotName, setNewSpotName] = useState('');
  const [newSpotDesc, setNewSpotDesc] = useState('');
  const [newSpotType, setNewSpotType] = useState('fishing');

  useEffect(() => {
    loadSpots();
  }, [loadSpots]);

  const handleMapClick = (lat: number, lng: number) => {
      setNewSpotLocation({ lat, lng });
      setOpenAddDialog(true);
  };

  const handleSaveSpot = async () => {
      if (newSpotLocation && newSpotName) {
          await addSpot({
              name: newSpotName,
              description: newSpotDesc,
              location: newSpotLocation,
              type: newSpotType as any,
              createdAt: new Date(),
              updatedAt: new Date()
          });
          setOpenAddDialog(false);
          setNewSpotName('');
          setNewSpotDesc('');
          setNewSpotLocation(null);
      }
  };

  return (
    <Box sx={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer center={[40.416775, -3.703790]} zoom={6} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onMapClick={handleMapClick} />
        
        {spots.map((spot) => (
            <Marker 
                key={spot.id} 
                position={[spot.location.lat, spot.location.lng]}
                eventHandlers={{
                    click: () => {
                        navigate(`/spot/${spot.id}`);
                    }
                }}
            >
                <Popup>
                    <strong>{spot.name}</strong><br/>
                    {spot.type}
                </Popup>
            </Marker>
        ))}
      </MapContainer>

      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
          <DialogTitle>Añadir Nuevo Marcador</DialogTitle>
          <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                  <TextField 
                      label="Nombre" 
                      value={newSpotName} 
                      onChange={(e) => setNewSpotName(e.target.value)} 
                      fullWidth 
                  />
                  <TextField 
                      label="Descripción" 
                      value={newSpotDesc} 
                      onChange={(e) => setNewSpotDesc(e.target.value)} 
                      fullWidth 
                      multiline
                      rows={2}
                  />
                  <FormControl fullWidth>
                      <InputLabel>Tipo</InputLabel>
                      <Select
                          value={newSpotType}
                          label="Tipo"
                          onChange={(e) => setNewSpotType(e.target.value)}
                      >
                          <MenuItem value="fishing">Pesca</MenuItem>
                          <MenuItem value="anchoring">Fondeo</MenuItem>
                          <MenuItem value="sailing">Navegación</MenuItem>
                          <MenuItem value="observation">Observación</MenuItem>
                          <MenuItem value="other">Otro</MenuItem>
                      </Select>
                  </FormControl>
                  <Typography variant="caption">
                      Lat: {newSpotLocation?.lat.toFixed(4)}, Lng: {newSpotLocation?.lng.toFixed(4)}
                  </Typography>
                  <Button variant="contained" onClick={handleSaveSpot}>Guardar</Button>
              </Box>
          </DialogContent>
      </Dialog>
    </Box>
  );
};
