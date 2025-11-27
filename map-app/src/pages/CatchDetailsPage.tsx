import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useAppStore } from '../store/useAppStore';
import type { Catch } from '../models/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
  const [catchData, setCatchData] = useState<Catch | null>(null);

  useEffect(() => {
    const found = catches.find((c) => c.id === Number(id));
    if (found) {
      setCatchData(found);
    }
  }, [id, catches]);

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
        background: 'linear-gradient(135deg, #0a1929 0%, #1a237e 100%)',
        pb: 8,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.2) 0%, rgba(76, 175, 80, 0.2) 100%)',
          borderBottom: '1px solid rgba(0, 188, 212, 0.3)',
          p: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ color: '#00bcd4' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#fff' }}>
            Detalles de Captura
          </Typography>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2 }}>
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
                    label={`${catchData.weight} kg`}
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
                    {weather.temperature}°C
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
                    {weather.windSpeed} km/h
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
                      {weather.waveHeight} m
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
    </Box>
  );
}
