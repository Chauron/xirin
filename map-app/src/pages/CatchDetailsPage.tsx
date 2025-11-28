import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppStore } from '../store/useAppStore';
import { useSettingsStore } from '../store/settingsStore';
import { useLayoutContext } from '../components/Layout';
import type { Catch } from '../models/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { convertTemperature, convertSpeed, convertWeight, convertWaveHeight, getTemperatureUnit, getSpeedUnit, getWeightUnit, getWaveHeightUnit, formatValue } from '../utils/units';

const getWindArrow = (deg: number): string => {
  const arrows = ['↓', '↙', '←', '↖', '↑', '↗', '→', '↘'];
  const index = Math.round(deg / 45) % 8;
  return arrows[index];
};

export function CatchDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const catches = useAppStore((state) => state.catches);
  const spots = useAppStore((state) => state.spots);
  const deleteCatch = useAppStore((state) => state.deleteCatch);
  const { settings } = useSettingsStore();
  const { setPageTitle, setShowBackButton } = useLayoutContext();
  const [catchData, setCatchData] = useState<Catch | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  useEffect(() => {
    const found = catches.find((c) => c.id === Number(id));
    if (found) {
      setCatchData(found);
      setPageTitle(`Captura: ${found.species}`);
      setShowBackButton(true);
    }
    
    return () => {
      setPageTitle('🌊 XIRIN MARINE');
      setShowBackButton(false);
    };
  }, [id, catches, setPageTitle, setShowBackButton]);

  const handleEdit = () => {
    navigate(`/catch/${id}/edit`);
  };

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (catchData?.id) {
      await deleteCatch(catchData.id);
      setOpenDeleteDialog(false);
      navigate('/catches');
    }
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
  };

  if (!catchData) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Captura no encontrada</Typography>
      </Box>
    );
  }

  const spot = spots.find((s) => s.id === catchData.spotId);
  const weather = catchData.weather;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        pb: 10,
      }}
    >
      {/* Content */}
      <Box sx={{ p: 2 }}>
        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            fullWidth
            sx={{
              background: 'linear-gradient(45deg, #00bcd4 30%, #4caf50 90%)',
              boxShadow: '0 3px 15px rgba(0, 188, 212, 0.3)',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(45deg, #00acc1 30%, #43a047 90%)',
              }
            }}
          >
            Editar
          </Button>
          <Button
            variant="contained"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteClick}
            fullWidth
            sx={{
              background: 'linear-gradient(45deg, #f44336 30%, #e91e63 90%)',
              boxShadow: '0 3px 15px rgba(244, 67, 54, 0.3)',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(45deg, #d32f2f 30%, #c2185b 90%)',
              }
            }}
          >
            Eliminar
          </Button>
        </Box>

        {/* Imagen de la captura */}
        {catchData.photoUrl && (
          <Card
            sx={{
              mb: 2,
              background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.05) 0%, rgba(76, 175, 80, 0.05) 100%)',
              border: '1px solid rgba(0, 188, 212, 0.2)',
            }}
          >
            <Box
              component="img"
              src={catchData.photoUrl}
              alt="Captura"
              sx={{
                width: '100%',
                maxHeight: 400,
                objectFit: 'cover',
                borderRadius: '4px 4px 0 0',
              }}
            />
          </Card>
        )}

        {/* Información básica */}
        <Card
          sx={{
            mb: 2,
            background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.05) 0%, rgba(76, 175, 80, 0.05) 100%)',
            border: '1px solid rgba(0, 188, 212, 0.2)',
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                  border: '3px solid rgba(0, 188, 212, 0.3)',
                }}
              >
                🐟
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#fff' }}>
                  {catchData.species}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {format(new Date(catchData.date), "d 'de' MMMM 'de' yyyy, HH:mm", {
                    locale: es,
                  })}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2, borderColor: 'rgba(0, 188, 212, 0.1)' }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {catchData.weight && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 80 }}>
                    ⚖️ Peso:
                  </Typography>
                  <Chip
                    label={`${formatValue(convertWeight(catchData.weight, settings.units))} ${getWeightUnit(settings.units)}`}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(76, 175, 80, 0.2)',
                      color: '#4caf50',
                      fontWeight: 600,
                    }}
                  />
                </Box>
              )}

              {spot && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 80 }}>
                    📍 Ubicación:
                  </Typography>
                  <Chip
                    icon={<LocationOnIcon sx={{ fontSize: '1rem', color: '#00bcd4 !important' }} />}
                    label={spot.name}
                    size="small"
                    onClick={() => navigate(`/spot/${spot.id}`)}
                    sx={{
                      bgcolor: 'rgba(0, 188, 212, 0.2)',
                      color: '#00bcd4',
                      fontWeight: 600,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'rgba(0, 188, 212, 0.3)',
                      },
                    }}
                  />
                </Box>
              )}

              {catchData.notes && (
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    📝 Notas:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#fff',
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                      p: 2,
                      borderRadius: 1,
                      border: '1px solid rgba(0, 188, 212, 0.1)',
                    }}
                  >
                    {catchData.notes}
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Condiciones meteorológicas */}
        {weather && (
          <Card
            sx={{
              background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.05) 0%, rgba(76, 175, 80, 0.05) 100%)',
              border: '1px solid rgba(0, 188, 212, 0.2)',
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{ mb: 2, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 1 }}
              >
                ⛅ Condiciones del Mar
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {/* Temperatura */}
                <Box
                  sx={{
                    flex: '1 1 calc(33.333% - 16px)',
                    minWidth: 150,
                    p: 2,
                    background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.1) 0%, rgba(76, 175, 80, 0.1) 100%)',
                    borderRadius: 2,
                    border: '1px solid rgba(0, 188, 212, 0.2)',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                    🌡️ Temperatura
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#fff' }}>
                    {formatValue(convertTemperature(weather.temperature, settings.units))}{getTemperatureUnit(settings.units)}
                  </Typography>
                </Box>

                {/* Viento */}
                <Box
                  sx={{
                    flex: '1 1 calc(33.333% - 16px)',
                    minWidth: 150,
                    p: 2,
                    background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.1) 0%, rgba(76, 175, 80, 0.1) 100%)',
                    borderRadius: 2,
                    border: '1px solid rgba(0, 188, 212, 0.2)',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                    💨 Viento
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#fff' }}>
                    {formatValue(convertSpeed(weather.windSpeed, settings.units), 0)} {getSpeedUnit(settings.units)}
                  </Typography>
                </Box>

                {/* Dirección del viento */}
                <Box
                  sx={{
                    flex: '1 1 calc(33.333% - 16px)',
                    minWidth: 150,
                    p: 2,
                    background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.1) 0%, rgba(76, 175, 80, 0.1) 100%)',
                    borderRadius: 2,
                    border: '1px solid rgba(0, 188, 212, 0.2)',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                    🧭 Dirección
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#fff' }}>
                    {getWindArrow(weather.windDirection)} {weather.windDirection}°
                  </Typography>
                </Box>

                {/* Presión */}
                {weather.pressure && (
                  <Box
                    sx={{
                      flex: '1 1 calc(33.333% - 16px)',
                      minWidth: 150,
                      p: 2,
                      background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.1) 0%, rgba(76, 175, 80, 0.1) 100%)',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 188, 212, 0.2)',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                      📊 Presión
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#fff' }}>
                      {weather.pressure} hPa
                    </Typography>
                  </Box>
                )}

                {/* Cobertura de nubes */}
                {weather.cloudCover !== undefined && (
                  <Box
                    sx={{
                      flex: '1 1 calc(33.333% - 16px)',
                      minWidth: 150,
                      p: 2,
                      background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.1) 0%, rgba(76, 175, 80, 0.1) 100%)',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 188, 212, 0.2)',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                      ☁️ Nubes
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#fff' }}>
                      {weather.cloudCover}%
                    </Typography>
                  </Box>
                )}

                {/* Altura de ola */}
                {weather.waveHeight && (
                  <Box
                    sx={{
                      flex: '1 1 calc(33.333% - 16px)',
                      minWidth: 150,
                      p: 2,
                      background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.1) 0%, rgba(76, 175, 80, 0.1) 100%)',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 188, 212, 0.2)',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                      🌊 Oleaje
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#fff' }}>
                      {formatValue(convertWaveHeight(weather.waveHeight, settings.units))} {getWaveHeightUnit(settings.units)}
                    </Typography>
                  </Box>
                )}

                {/* Periodo de ola */}
                {weather.wavePeriod && (
                  <Box
                    sx={{
                      flex: '1 1 calc(33.333% - 16px)',
                      minWidth: 150,
                      p: 2,
                      background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.1) 0%, rgba(76, 175, 80, 0.1) 100%)',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 188, 212, 0.2)',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                      ⏱️ Periodo
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#fff' }}>
                      {weather.wavePeriod} s
                    </Typography>
                  </Box>
                )}

                {/* Dirección de ola */}
                {weather.waveDirection !== undefined && (
                  <Box
                    sx={{
                      flex: '1 1 calc(33.333% - 16px)',
                      minWidth: 150,
                      p: 2,
                      background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.1) 0%, rgba(76, 175, 80, 0.1) 100%)',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 188, 212, 0.2)',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                      🌊 Dirección Ola
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#fff' }}>
                      {getWindArrow(weather.waveDirection)} {weather.waveDirection}°
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: {
            bgcolor: '#1a1a2e',
            border: '2px solid rgba(244, 67, 54, 0.5)',
            boxShadow: '0 8px 32px rgba(244, 67, 54, 0.3)',
          }
        }}
      >
        <DialogTitle sx={{ color: '#fff', fontWeight: 600 }}>
          ⚠️ Confirmar eliminación
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.secondary' }}>
            ¿Estás seguro de que deseas eliminar esta captura? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleDeleteCancel}
            sx={{ 
              color: 'text.secondary',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.05)'
              }
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #f44336 30%, #e91e63 90%)',
              boxShadow: '0 3px 15px rgba(244, 67, 54, 0.3)',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(45deg, #d32f2f 30%, #c2185b 90%)',
              }
            }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
