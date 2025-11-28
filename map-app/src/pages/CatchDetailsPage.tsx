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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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

const getSkyIcon = (hour: number) => {
  return hour >= 7 && hour <= 20 ? '☀️' : '🌙';
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

        {/* Gráfico de Mareas */}
        {catchData.tideEvents && catchData.tideEvents.length > 0 && (
          <Card
            sx={{
              mb: 2,
              background: 'linear-gradient(135deg, rgba(0, 150, 200, 0.05) 0%, rgba(0, 100, 150, 0.05) 100%)',
              border: '1px solid rgba(0, 150, 200, 0.2)',
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{ mb: 2, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 1 }}
              >
                🌊 Mareas del Día
              </Typography>

              {/* Visual timeline de mareas */}
              <Box sx={{ position: 'relative', py: 3 }}>
                {/* Línea horizontal */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    height: 4,
                    background: 'linear-gradient(90deg, rgba(0, 188, 212, 0.3) 0%, rgba(0, 150, 200, 0.3) 100%)',
                    borderRadius: 2,
                  }}
                />

                {/* Eventos de marea */}
                <Box sx={{ display: 'flex', justifyContent: 'space-around', position: 'relative' }}>
                  {catchData.tideEvents.map((tide, index) => {
                    const tideTime = new Date(tide.time);
                    const catchTime = new Date(catchData.date);
                    const isCatchBetween = index < catchData.tideEvents!.length - 1 &&
                      catchTime >= tideTime &&
                      catchTime <= new Date(catchData.tideEvents![index + 1].time);

                    return (
                      <Box key={index} sx={{ position: 'relative', textAlign: 'center', flex: 1 }}>
                        {/* Punto de marea */}
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: tide.type === 'high' ? '#00bcd4' : '#4caf50',
                            border: '3px solid',
                            borderColor: tide.type === 'high' ? 'rgba(0, 188, 212, 0.3)' : 'rgba(76, 175, 80, 0.3)',
                            margin: '0 auto',
                            position: 'relative',
                            zIndex: 2,
                            boxShadow: `0 0 20px ${tide.type === 'high' ? 'rgba(0, 188, 212, 0.5)' : 'rgba(76, 175, 80, 0.5)'}`,
                          }}
                        />

                        {/* Información de marea */}
                        <Box sx={{ mt: 2 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              fontSize: '0.65rem',
                              color: tide.type === 'high' ? '#00bcd4' : '#4caf50',
                              fontWeight: 700,
                              mb: 0.5,
                            }}
                          >
                            {tide.type === 'high' ? 'PLEAMAR' : 'BAJAMAR'}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#fff' }}>
                            {format(tideTime, 'HH:mm')}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {formatValue(convertWaveHeight(tide.height, settings.units))} {getWaveHeightUnit(settings.units)}
                          </Typography>
                        </Box>

                        {/* Marcador de captura */}
                        {isCatchBetween && (
                          <Box
                            sx={{
                              position: 'absolute',
                              left: '50%',
                              top: -10,
                              transform: 'translateX(-50%)',
                            }}
                          >
                            <Box
                              sx={{
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                bgcolor: '#ff9800',
                                border: '3px solid rgba(255, 152, 0, 0.3)',
                                boxShadow: '0 0 20px rgba(255, 152, 0, 0.8)',
                                animation: 'pulse 2s infinite',
                                '@keyframes pulse': {
                                  '0%, 100%': {
                                    transform: 'scale(1)',
                                    opacity: 1,
                                  },
                                  '50%': {
                                    transform: 'scale(1.2)',
                                    opacity: 0.8,
                                  },
                                },
                              }}
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                position: 'absolute',
                                top: -25,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                color: '#ff9800',
                                fontWeight: 700,
                                fontSize: '0.7rem',
                                whiteSpace: 'nowrap',
                                textShadow: '0 0 10px rgba(255, 152, 0, 0.5)',
                              }}
                            >
                              📍 {format(catchTime, 'HH:mm')}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </Box>

              {/* Estado de marea en el momento */}
              {weather.tideType && (
                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 193, 7, 0.1) 100%)',
                    border: '2px solid rgba(255, 152, 0, 0.3)',
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#ff9800', fontWeight: 700, textAlign: 'center' }}>
                    📍 En el momento de la captura: {' '}
                    {weather.tideType === 'high' ? 'Pleamar' : weather.tideType === 'low' ? 'Bajamar' : weather.tideType === 'rising' ? 'Marea Subiendo' : 'Marea Bajando'}
                    {weather.tideHeight && ` (${formatValue(weather.tideHeight)} m)`}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* Condiciones meteorológicas en el momento */}
        {weather && (
          <Card
            sx={{
              mb: 2,
              background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.05) 0%, rgba(76, 175, 80, 0.05) 100%)',
              border: '1px solid rgba(0, 188, 212, 0.2)',
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{ mb: 2, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 1 }}
              >
                ⛅ Condiciones en el Momento
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

                {/* Gráfico de Mareas Curva */}
                {catchData.tideEvents && catchData.tideEvents.length > 0 ? (
                  <Box
                    sx={{
                      flex: '1 1 100%',
                      p: 2,
                      background: 'linear-gradient(135deg, rgba(0, 150, 200, 0.1) 0%, rgba(0, 100, 150, 0.1) 100%)',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 150, 200, 0.2)',
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, textAlign: 'center', fontWeight: 600 }}>
                      🌊 Curva de Marea
                    </Typography>
                    {(() => {
                      try {
                        const catchTime = new Date(catchData.date).getTime();
                        
                        // Encontrar marea anterior y siguiente
                        const sortedTides = [...catchData.tideEvents!]
                          .map(t => ({ ...t, timestamp: new Date(t.time).getTime() }))
                          .sort((a, b) => a.timestamp - b.timestamp);
                        
                        const prevTide = sortedTides.filter(t => t.timestamp <= catchTime).pop();
                        const nextTide = sortedTides.find(t => t.timestamp > catchTime);
                        
                        if (!prevTide || !nextTide) {
                          return (
                            <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', display: 'block' }}>
                              No hay suficientes datos de marea para mostrar el gráfico.
                              <br />
                              <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.disabled' }}>
                                Activa un proveedor de mareas en Ajustes.
                              </Typography>
                            </Typography>
                          );
                        }

                        // Dimensiones del SVG
                        const width = 280;
                        const height = 120;
                        const padding = 20;
                        const graphWidth = width - (padding * 2);
                        const graphHeight = height - (padding * 2);

                        // Calcular posición de la captura en el ciclo (0 a 1)
                        const totalDuration = nextTide.timestamp - prevTide.timestamp;
                        const elapsed = catchTime - prevTide.timestamp;
                        const progress = elapsed / totalDuration;

                        // Calcular alturas relativas
                        const minHeight = Math.min(prevTide.height, nextTide.height);
                        const maxHeight = Math.max(prevTide.height, nextTide.height);
                        const heightRange = maxHeight - minHeight || 1;

                        // Función para convertir altura de marea a coordenada Y
                        const getY = (height: number) => {
                          const normalized = (height - minHeight) / heightRange;
                          return padding + graphHeight - (normalized * graphHeight);
                        };

                        // Generar puntos para la curva sinusoidal
                        const points: string[] = [];
                        const numPoints = 50;
                        for (let i = 0; i <= numPoints; i++) {
                          const t = i / numPoints;
                          const x = padding + (t * graphWidth);
                          
                          // Interpolación sinusoidal entre las dos mareas
                          let tideHeight;
                          if (prevTide.type === 'low' && nextTide.type === 'high') {
                            // Subiendo: seno de 0 a π/2
                            const sineValue = Math.sin(t * Math.PI / 2);
                            tideHeight = prevTide.height + (nextTide.height - prevTide.height) * sineValue;
                          } else {
                            // Bajando: seno de π/2 a π
                            const sineValue = Math.sin(Math.PI / 2 + t * Math.PI / 2);
                            tideHeight = prevTide.height + (nextTide.height - prevTide.height) * (1 - sineValue);
                          }
                          
                          const y = getY(tideHeight);
                          points.push(`${x},${y}`);
                        }

                        // Posición de la captura en el gráfico
                        const catchX = padding + (progress * graphWidth);
                        let catchTideHeight;
                        if (prevTide.type === 'low' && nextTide.type === 'high') {
                          const sineValue = Math.sin(progress * Math.PI / 2);
                          catchTideHeight = prevTide.height + (nextTide.height - prevTide.height) * sineValue;
                        } else {
                          const sineValue = Math.sin(Math.PI / 2 + progress * Math.PI / 2);
                          catchTideHeight = prevTide.height + (nextTide.height - prevTide.height) * (1 - sineValue);
                        }
                        const catchY = getY(catchTideHeight);

                        return (
                          <Box sx={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', mt: 1 }}>
                            <svg width={width} height={height} style={{ maxWidth: '100%', height: 'auto' }}>
                              {/* Área bajo la curva */}
                              <defs>
                                <linearGradient id="tideGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                  <stop offset="0%" style={{ stopColor: 'rgba(0, 188, 212, 0.3)', stopOpacity: 1 }} />
                                  <stop offset="100%" style={{ stopColor: 'rgba(0, 188, 212, 0.05)', stopOpacity: 1 }} />
                                </linearGradient>
                              </defs>
                              
                              {/* Área rellena */}
                              <path
                                d={`M ${padding},${height - padding} L ${points.join(' L ')} L ${width - padding},${height - padding} Z`}
                                fill="url(#tideGradient)"
                                opacity="0.6"
                              />

                              {/* Línea de la curva */}
                              <polyline
                                points={points.join(' ')}
                                fill="none"
                                stroke="#00bcd4"
                                strokeWidth="3"
                                strokeLinecap="round"
                              />

                              {/* Punto de marea anterior */}
                              <circle
                                cx={padding}
                                cy={getY(prevTide.height)}
                                r="6"
                                fill={prevTide.type === 'high' ? '#00bcd4' : '#f44336'}
                                stroke="rgba(255,255,255,0.3)"
                                strokeWidth="2"
                              />

                              {/* Punto de marea siguiente */}
                              <circle
                                cx={width - padding}
                                cy={getY(nextTide.height)}
                                r="6"
                                fill={nextTide.type === 'high' ? '#00bcd4' : '#f44336'}
                                stroke="rgba(255,255,255,0.3)"
                                strokeWidth="2"
                              />

                              {/* Línea vertical en el momento de captura */}
                              <line
                                x1={catchX}
                                y1={padding}
                                x2={catchX}
                                y2={height - padding}
                                stroke="#ff9800"
                                strokeWidth="2"
                                strokeDasharray="4,4"
                                opacity="0.6"
                              />

                              {/* Punto de captura */}
                              <circle
                                cx={catchX}
                                cy={catchY}
                                r="8"
                                fill="#ff9800"
                                stroke="rgba(255, 152, 0, 0.5)"
                                strokeWidth="3"
                              >
                                <animate
                                  attributeName="r"
                                  values="8;10;8"
                                  dur="2s"
                                  repeatCount="indefinite"
                                />
                              </circle>

                              {/* Etiquetas de tiempo */}
                              <text
                                x={padding}
                                y={height - 5}
                                fill="rgba(255,255,255,0.7)"
                                fontSize="10"
                                textAnchor="middle"
                              >
                                {format(new Date(prevTide.time), 'HH:mm')}
                              </text>
                              
                              <text
                                x={width - padding}
                                y={height - 5}
                                fill="rgba(255,255,255,0.7)"
                                fontSize="10"
                                textAnchor="middle"
                              >
                                {format(new Date(nextTide.time), 'HH:mm')}
                              </text>

                              <text
                                x={catchX}
                                y={15}
                                fill="#ff9800"
                                fontSize="11"
                                fontWeight="bold"
                                textAnchor="middle"
                              >
                                📍 {format(new Date(catchData.date), 'HH:mm')}
                              </text>

                              {/* Etiquetas de tipo de marea */}
                              <text
                                x={padding}
                                y={getY(prevTide.height) - 12}
                                fill={prevTide.type === 'high' ? '#00bcd4' : '#f44336'}
                                fontSize="9"
                                fontWeight="bold"
                                textAnchor="middle"
                              >
                                {prevTide.type === 'high' ? 'ALTA' : 'BAJA'}
                              </text>

                              <text
                                x={width - padding}
                                y={getY(nextTide.height) - 12}
                                fill={nextTide.type === 'high' ? '#00bcd4' : '#f44336'}
                                fontSize="9"
                                fontWeight="bold"
                                textAnchor="middle"
                              >
                                {nextTide.type === 'high' ? 'ALTA' : 'BAJA'}
                              </text>
                            </svg>
                          </Box>
                        );
                      } catch (error) {
                        console.error('Error rendering tide graph:', error);
                        return (
                          <Typography variant="caption" sx={{ color: 'error.main', textAlign: 'center', display: 'block' }}>
                            Error al cargar el gráfico de mareas
                          </Typography>
                        );
                      }
                    })()}
                  </Box>
                ) : weather.tideType ? (
                  <Box
                    sx={{
                      flex: '1 1 100%',
                      p: 2,
                      background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 193, 7, 0.1) 100%)',
                      borderRadius: 2,
                      border: '1px solid rgba(255, 152, 0, 0.2)',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="body2" sx={{ color: '#ff9800', fontWeight: 600 }}>
                      ℹ️ Gráfico de mareas no disponible
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                      Activa un proveedor de mareas en Ajustes para ver el gráfico
                    </Typography>
                  </Box>
                ) : null}

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

        {/* Datos meteorológicos del día completo */}
        {catchData.hourlyWeather && catchData.hourlyWeather.length > 0 && (
          <Card
            sx={{
              mb: 2,
              background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.05) 0%, rgba(76, 175, 80, 0.05) 100%)',
              border: '1px solid rgba(0, 188, 212, 0.2)',
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{ mb: 2, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 1 }}
              >
                📊 Datos del Día Completo
              </Typography>

              <TableContainer 
                component={Paper} 
                sx={{ 
                  bgcolor: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: 2,
                  maxHeight: 500,
                  '& .MuiTableCell-head': {
                    bgcolor: 'rgba(0, 188, 212, 0.1)',
                    fontWeight: 700,
                    color: 'primary.main',
                    opacity: 1,
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                  },
                  '& .MuiTableRow-root:hover': {
                    bgcolor: 'rgba(0, 188, 212, 0.05)'
                  },
                  '& .MuiTableRow-root.catch-time': {
                    bgcolor: 'rgba(76, 175, 80, 0.15)',
                    '& .MuiTableCell-root': {
                      borderLeft: '4px solid #4caf50',
                      fontWeight: 700,
                    }
                  }
                }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" sx={{ minWidth: 60, py: 1.5 }}>Hora</TableCell>
                      <TableCell align="center" sx={{ minWidth: 40, py: 1.5 }}>☁️<br/>Tiempo</TableCell>
                      <TableCell align="center" sx={{ minWidth: 100, py: 1.5 }}>💨<br/>Viento</TableCell>
                      <TableCell align="center" sx={{ minWidth: 100, py: 1.5 }}>🌊<br/>Oleaje</TableCell>
                      <TableCell align="center" sx={{ minWidth: 60, py: 1.5 }}>🌡️<br/>Temp</TableCell>
                      <TableCell align="center" sx={{ minWidth: 70, py: 1.5 }}>📊<br/>Presión</TableCell>
                      <TableCell align="center" sx={{ minWidth: 60, py: 1.5 }}>☁️<br/>Nubes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {catchData.hourlyWeather.map((hourData, index) => {
                      const hour = new Date(hourData.time).getHours();
                      const isCatchTime = new Date(hourData.time).getHours() === new Date(catchData.date).getHours();
                      
                      return (
                        <TableRow key={index} className={isCatchTime ? 'catch-time' : ''}>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>
                            {hour.toString().padStart(2, '0')}:00
                            {isCatchTime && (
                              <Typography variant="caption" sx={{ display: 'block', color: '#4caf50', fontWeight: 700 }}>
                                📍 CAPTURA
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center" sx={{ fontSize: '1.2rem' }}>
                            {getSkyIcon(hour)}
                          </TableCell>
                          <TableCell align="center">
                            {formatValue(convertSpeed(hourData.windSpeed, settings.units), 0)} {getSpeedUnit(settings.units)}
                            <br/>
                            {getWindArrow(hourData.windDirection)}
                          </TableCell>
                          <TableCell align="center" sx={{ color: 'secondary.main', fontWeight: 600 }}>
                            {hourData.waveHeight 
                              ? `${formatValue(convertWaveHeight(hourData.waveHeight, settings.units))}${getWaveHeightUnit(settings.units)}`
                              : '-'
                            }
                            {hourData.waveDirection !== undefined && hourData.waveHeight && (
                              <>
                                <br/>{getWindArrow(hourData.waveDirection)}
                              </>
                            )}
                          </TableCell>
                          <TableCell align="center" sx={{ color: 'primary.main', fontWeight: 600 }}>
                            {formatValue(convertTemperature(hourData.temperature, settings.units))}{getTemperatureUnit(settings.units)}
                          </TableCell>
                          <TableCell align="center">
                            {hourData.pressure ? `${hourData.pressure} hPa` : '-'}
                          </TableCell>
                          <TableCell align="center">
                            {hourData.cloudCover !== undefined ? `${hourData.cloudCover}%` : '-'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {/* Action buttons at the end */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            fullWidth
            sx={{
              py: 1.5,
              background: 'linear-gradient(45deg, #00bcd4 30%, #4caf50 90%)',
              boxShadow: '0 3px 15px rgba(0, 188, 212, 0.3)',
              fontWeight: 700,
              fontSize: '1.1rem',
              '&:hover': {
                background: 'linear-gradient(45deg, #00acc1 30%, #43a047 90%)',
              }
            }}
          >
            ✏️ Editar Captura
          </Button>
          <Button
            variant="contained"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteClick}
            fullWidth
            sx={{
              py: 1.5,
              background: 'linear-gradient(45deg, #f44336 30%, #e91e63 90%)',
              boxShadow: '0 3px 15px rgba(244, 67, 54, 0.3)',
              fontWeight: 700,
              fontSize: '1.1rem',
              '&:hover': {
                background: 'linear-gradient(45deg, #d32f2f 30%, #c2185b 90%)',
              }
            }}
          >
            🗑️ Eliminar
          </Button>
        </Box>
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
