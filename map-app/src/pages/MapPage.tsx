import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { useAppStore } from '../store/useAppStore';
import { useLayoutContext } from '../components/Layout';
import { Box, Dialog, DialogTitle, DialogContent, TextField, Button, MenuItem, Select, FormControl, InputLabel, Typography, IconButton, Tooltip, Menu, ListItemIcon, ListItemText, CircularProgress, Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import LayersIcon from '@mui/icons-material/Layers';
import MapIcon from '@mui/icons-material/Map';
import SatelliteIcon from '@mui/icons-material/Satellite';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import AddIcon from '@mui/icons-material/Add';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import ExploreIcon from '@mui/icons-material/Explore';
import { Geolocation } from '@capacitor/geolocation';
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

// Helper function to get cardinal direction from degrees
const getCardinalDirection = (degrees: number, short: boolean = false): string => {
  const directions = short 
    ? ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    : ['Norte', 'Noreste', 'Este', 'Sureste', 'Sur', 'Suroeste', 'Oeste', 'Noroeste'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
};

// Componente para controlar el centrado del mapa
const MapController = ({ center, zoom }: { center: [number, number] | null; zoom?: number }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  
  return null;
};

const MapClickHandler = ({ onMapClick, isSelecting }: { onMapClick: (lat: number, lng: number) => void; isSelecting: boolean }) => {
    useMapEvents({
        click(e) {
            if (isSelecting) {
                onMapClick(e.latlng.lat, e.latlng.lng);
            }
        }
    });
    return null;
};

export const MapPage: React.FC = () => {
  const { spots, loadSpots, addSpot } = useAppStore();
  const { setPageTitle, setShowBackButton } = useLayoutContext();
  const navigate = useNavigate();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newSpotLocation, setNewSpotLocation] = useState<{lat: number, lng: number} | null>(null);
  const [newSpotName, setNewSpotName] = useState('');
  const [newSpotDesc, setNewSpotDesc] = useState('');
  const [newSpotType, setNewSpotType] = useState('fishing');
  const [mapLayer, setMapLayer] = useState<'standard' | 'satellite' | 'nautical'>('satellite');
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [layerMenuAnchor, setLayerMenuAnchor] = useState<null | HTMLElement>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [selectingOnMap, setSelectingOnMap] = useState(false);
  const [heading, setHeading] = useState<number>(0);

  useEffect(() => {
    // No heading en el mapa, solo icono en la brújula
    setPageTitle('');
    setShowBackButton(false);
    loadSpots();
    // Obtener ubicación inicial del usuario
    getCurrentLocation();
    
    // Watch heading changes
    let watchId: string;
    const startWatching = async () => {
      watchId = await Geolocation.watchPosition({
        enableHighAccuracy: true,
      }, (position) => {
        if (position && position.coords.heading !== null && position.coords.heading !== undefined) {
          setHeading(position.coords.heading);
        }
      });
    };
    
    startWatching();

    return () => {
      if (watchId) {
        Geolocation.clearWatch({ id: watchId });
      }
    };
  }, [loadSpots, setPageTitle, setShowBackButton]);

  const getCurrentLocation = async () => {
    setLocating(true);
    setLocationError(null);
    try {
      // Solicitar permisos primero
      const permission = await Geolocation.checkPermissions();
      if (permission.location !== 'granted') {
        const requestResult = await Geolocation.requestPermissions();
        if (requestResult.location !== 'granted') {
          throw new Error('Permisos de ubicación denegados');
        }
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
      const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
      setUserLocation(coords);
      setLocating(false);
    } catch (error: any) {
      console.error('Error obteniendo ubicación:', error);
      setLocationError(error.message || 'No se pudo obtener la ubicación');
      setLocating(false);
    }
  };

  const handleCenterOnUser = () => {
    if (locating) return; // Evitar múltiples intentos simultáneos
    
    if (userLocation) {
      setMapCenter(userLocation);
    } else {
      getCurrentLocation().then(() => {
        if (userLocation) {
          setMapCenter(userLocation);
        }
      });
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
      setNewSpotLocation({ lat, lng });
      setSelectingOnMap(false);
      setOpenAddDialog(true);
  };

  const handleAddWithCurrentLocation = async () => {
    if (locating) return;
    
    if (userLocation) {
      setNewSpotLocation({ lat: userLocation[0], lng: userLocation[1] });
      setOpenAddDialog(true);
    } else {
      await getCurrentLocation();
      if (userLocation) {
        setNewSpotLocation({ lat: userLocation[0], lng: userLocation[1] });
        setOpenAddDialog(true);
      }
    }
  };

  const handleAddBySelectingOnMap = () => {
    setSelectingOnMap(true);
    setSpeedDialOpen(false);
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
      <MapContainer center={[40.416775, -3.703790]} zoom={6} style={{ height: '100%', width: '100%' }} zoomControl={false}>
        {/* Capa base según selección */}
        {mapLayer === 'standard' && (
          <TileLayer
            attribution=''
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}
        
        {mapLayer === 'satellite' && (
          <TileLayer
            attribution=''
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        )}
        
        {mapLayer === 'nautical' && (
          <>
            {/* Mapa base náutico de NOAA (US) */}
            <TileLayer
              attribution=''
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              opacity={0.5}
            />
            {/* Capa de cartas náuticas OpenSeaMap */}
            <TileLayer
              attribution=''
              url="https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
            />
          </>
        )}
        
        <MapClickHandler onMapClick={handleMapClick} isSelecting={selectingOnMap} />
        <MapController center={mapCenter} zoom={13} />
        
        {/* Marcador de ubicación del usuario */}
        {userLocation && (
          <Marker 
            position={userLocation}
            icon={L.divIcon({
              className: 'custom-user-marker',
              html: '<div style="background: #00bcd4; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })}
          >
            <Popup>
              <strong>📍 Tu ubicación</strong>
            </Popup>
          </Marker>
        )}
        
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

      {/* Compass/GPS heading indicator */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          px: 3,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          minWidth: 280,
        }}
      >
        {/* Compass rose */}
        <Box
          sx={{
            position: 'relative',
            width: 50,
            height: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Compass background */}
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '2px solid',
              borderColor: 'primary.main',
              bgcolor: 'action.hover',
            }}
          />
          
          {/* Cardinal directions */}
          <Typography
            sx={{
              position: 'absolute',
              top: -2,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '0.7rem',
              fontWeight: 700,
              color: 'error.main',
            }}
          >
            N
          </Typography>
          <Typography
            sx={{
              position: 'absolute',
              right: 4,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '0.6rem',
              fontWeight: 600,
              color: 'text.secondary',
            }}
          >
            E
          </Typography>
          <Typography
            sx={{
              position: 'absolute',
              bottom: -2,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '0.6rem',
              fontWeight: 600,
              color: 'text.secondary',
            }}
          >
            S
          </Typography>
          <Typography
            sx={{
              position: 'absolute',
              left: 4,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '0.6rem',
              fontWeight: 600,
              color: 'text.secondary',
            }}
          >
            W
          </Typography>

          {/* Needle/Arrow */}
          <ExploreIcon
            sx={{
              position: 'absolute',
              fontSize: '2rem',
              color: 'primary.main',
              transform: `rotate(${heading}deg)`,
              transition: 'transform 0.3s ease-out',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
            }}
          />
        </Box>

        {/* GPS Info */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
              Rumbo del GPS
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
              Rumbo
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1 }}>
              {Math.round(heading)}° {getCardinalDirection(heading)}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1 }}>
              {Math.round(heading)}° {getCardinalDirection(heading, true)}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Controles flotantes */}
      <Box
        sx={{
          position: 'absolute',
          top: 128,
          right: 16,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {/* Botón de capas */}
        <Tooltip title="Cambiar mapa" placement="left">
          <IconButton
            onClick={(e) => setLayerMenuAnchor(e.currentTarget)}
            sx={{
              bgcolor: 'background.paper',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              '&:hover': {
                bgcolor: 'primary.main',
                color: 'white',
              },
              width: 48,
              height: 48,
            }}
          >
            <LayersIcon />
          </IconButton>
        </Tooltip>

        {/* Menú de capas */}
        <Menu
          anchorEl={layerMenuAnchor}
          open={Boolean(layerMenuAnchor)}
          onClose={() => setLayerMenuAnchor(null)}
          sx={{
            '& .MuiPaper-root': {
              bgcolor: 'background.paper',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              minWidth: 200,
            }
          }}
        >
          <MenuItem 
            onClick={() => {
              setMapLayer('standard');
              setLayerMenuAnchor(null);
            }}
            selected={mapLayer === 'standard'}
            sx={{
              '&.Mui-selected': {
                bgcolor: 'rgba(0, 188, 212, 0.15)',
              }
            }}
          >
            <ListItemIcon>
              <MapIcon sx={{ color: mapLayer === 'standard' ? 'primary.main' : 'inherit' }} />
            </ListItemIcon>
            <ListItemText primary="Mapa Estándar" />
          </MenuItem>
          <MenuItem 
            onClick={() => {
              setMapLayer('satellite');
              setLayerMenuAnchor(null);
            }}
            selected={mapLayer === 'satellite'}
            sx={{
              '&.Mui-selected': {
                bgcolor: 'rgba(0, 188, 212, 0.15)',
              }
            }}
          >
            <ListItemIcon>
              <SatelliteIcon sx={{ color: mapLayer === 'satellite' ? 'primary.main' : 'inherit' }} />
            </ListItemIcon>
            <ListItemText primary="Satélite" />
          </MenuItem>
          <MenuItem 
            onClick={() => {
              setMapLayer('nautical');
              setLayerMenuAnchor(null);
            }}
            selected={mapLayer === 'nautical'}
            sx={{
              '&.Mui-selected': {
                bgcolor: 'rgba(0, 188, 212, 0.15)',
              }
            }}
          >
            <ListItemIcon>
              <DirectionsBoatIcon sx={{ color: mapLayer === 'nautical' ? 'primary.main' : 'inherit' }} />
            </ListItemIcon>
            <ListItemText primary="Carta Náutica" />
          </MenuItem>
        </Menu>

        {/* Botón de ubicación */}
        <Tooltip title={locating ? "Obteniendo ubicación..." : "Mi ubicación"} placement="left">
          <IconButton
            onClick={handleCenterOnUser}
            disabled={locating}
            sx={{
              bgcolor: 'background.paper',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              color: 'text.primary',
              '&:hover': {
                bgcolor: 'primary.main',
                color: 'white',
              },
              '&.Mui-disabled': {
                bgcolor: 'background.paper',
                opacity: 0.7,
              },
              width: 48,
              height: 48,
              position: 'relative',
            }}
          >
            {locating ? (
              <CircularProgress size={24} sx={{ color: 'primary.main' }} />
            ) : (
              <MyLocationIcon />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Snackbar para errores de ubicación */}
      <Snackbar
        open={!!locationError}
        autoHideDuration={4000}
        onClose={() => setLocationError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setLocationError(null)} 
          severity="error" 
          sx={{ 
            width: '100%',
            bgcolor: 'rgba(211, 47, 47, 0.9)',
            color: 'white'
          }}
        >
          {locationError}
        </Alert>
      </Snackbar>

      {/* Botón flotante para añadir ubicación */}
      {!speedDialOpen && !selectingOnMap && (
        <IconButton
          onClick={() => setSpeedDialOpen(true)}
          sx={{
            position: 'absolute',
            bottom: 90,
            right: 16,
            zIndex: 1000,
            width: 56,
            height: 56,
            background: 'linear-gradient(45deg, #00bcd4 30%, #4caf50 90%)',
            boxShadow: '0 4px 20px rgba(0, 188, 212, 0.4)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(45deg, #00acc1 30%, #43a047 90%)',
            }
          }}
        >
          <AddIcon />
        </IconButton>
      )}

      {/* Menú de opciones para añadir */}
      {speedDialOpen && (
        <>
          {/* Overlay para cerrar al tocar fuera */}
          <Box
            onClick={() => setSpeedDialOpen(false)}
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
              bgcolor: 'rgba(0,0,0,0.3)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 160,
              right: 16,
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            <Button
              variant="contained"
              startIcon={<GpsFixedIcon />}
              onClick={handleAddWithCurrentLocation}
              sx={{
                bgcolor: 'background.paper',
                color: 'text.primary',
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                '&:hover': {
                  bgcolor: 'primary.main',
                  color: 'white'
                },
                justifyContent: 'flex-start',
                textTransform: 'none',
                fontWeight: 600,
                py: 1.5,
                px: 2.5,
                minWidth: 220,
              }}
            >
              Usar mi ubicación
            </Button>
            <Button
              variant="contained"
              startIcon={<AddLocationIcon />}
              onClick={handleAddBySelectingOnMap}
              sx={{
                bgcolor: 'background.paper',
                color: 'text.primary',
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                '&:hover': {
                  bgcolor: 'secondary.main',
                  color: 'white'
                },
                justifyContent: 'flex-start',
                textTransform: 'none',
                fontWeight: 600,
                py: 1.5,
                px: 2.5,
                minWidth: 220,
              }}
            >
              Seleccionar en mapa
            </Button>
          </Box>
          {/* Botón principal transformado en X */}
          <IconButton
            onClick={() => setSpeedDialOpen(false)}
            sx={{
              position: 'absolute',
              bottom: 90,
              right: 16,
              zIndex: 1000,
              width: 56,
              height: 56,
              background: 'linear-gradient(45deg, #f44336 30%, #e91e63 90%)',
              boxShadow: '0 4px 20px rgba(244, 67, 54, 0.4)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(45deg, #d32f2f 30%, #c2185b 90%)',
              }
            }}
          >
            ✕
          </IconButton>
        </>
      )}

      {/* Indicador de modo selección */}
      {selectingOnMap && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1001,
            bgcolor: 'primary.main',
            color: 'white',
            px: 3,
            py: 1.5,
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0, 188, 212, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontWeight: 600,
          }}
        >
          <AddLocationIcon />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Toca el mapa para añadir ubicación
          </Typography>
          <IconButton
            size="small"
            onClick={() => setSelectingOnMap(false)}
            sx={{
              ml: 1,
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.2)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.3)'
              }
            }}
          >
            ✕
          </IconButton>
        </Box>
      )}

      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ 
            background: 'linear-gradient(135deg, #0a1929 0%, #1a237e 100%)',
            color: 'white',
            fontWeight: 700
          }}>
            📍 Añadir Nuevo Marcador
          </DialogTitle>
          <DialogContent sx={{ mt: 2, bgcolor: 'background.paper' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                  <TextField 
                      label="Nombre" 
                      value={newSpotName} 
                      onChange={(e) => setNewSpotName(e.target.value)} 
                      fullWidth 
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'rgba(0, 188, 212, 0.3)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(0, 188, 212, 0.5)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                            borderWidth: 2,
                          },
                        },
                      }}
                  />
                  <TextField 
                      label="Descripción" 
                      value={newSpotDesc} 
                      onChange={(e) => setNewSpotDesc(e.target.value)} 
                      fullWidth 
                      multiline
                      rows={2}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'rgba(0, 188, 212, 0.3)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(0, 188, 212, 0.5)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                            borderWidth: 2,
                          },
                        },
                      }}
                  />
                  <FormControl fullWidth>
                      <InputLabel sx={{ color: 'primary.main' }}>Tipo</InputLabel>
                      <Select
                          value={newSpotType}
                          label="Tipo"
                          onChange={(e) => setNewSpotType(e.target.value)}
                          sx={{
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(0, 188, 212, 0.3)',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(0, 188, 212, 0.5)',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'primary.main',
                            }
                          }}
                      >
                          <MenuItem value="fishing">🎣 Pesca</MenuItem>
                          <MenuItem value="anchoring">⚓ Fondeo</MenuItem>
                          <MenuItem value="sailing">⛵ Navegación</MenuItem>
                          <MenuItem value="observation">🔭 Observación</MenuItem>
                          <MenuItem value="other">📌 Otro</MenuItem>
                      </Select>
                  </FormControl>
                  <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                      📍 Lat: {newSpotLocation?.lat.toFixed(4)}, Lng: {newSpotLocation?.lng.toFixed(4)}
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={handleSaveSpot}
                    sx={{ 
                      py: 1.5,
                      background: 'linear-gradient(45deg, #00bcd4 30%, #4caf50 90%)',
                      boxShadow: '0 3px 15px rgba(0, 188, 212, 0.3)',
                      fontWeight: 700,
                      '&:hover': {
                        background: 'linear-gradient(45deg, #00acc1 30%, #43a047 90%)',
                      }
                    }}
                  >
                    Guardar
                  </Button>
              </Box>
          </DialogContent>
      </Dialog>
    </Box>
  );
};
