import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useSettingsStore } from '../store/settingsStore';
import { useLayoutContext } from '../components/Layout';
import type { Spot } from '../models/types';
import { fetchWeatherForecast, fetchMarineWeather } from '../api/weatherApi';
import { fetchTideData } from '../api/tideApi';
import { Box, Typography, Card, CardContent, Button, CircularProgress, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { convertTemperature, convertSpeed, convertWaveHeight, getTemperatureUnit, getSpeedUnit, getWaveHeightUnit, formatValue } from '../utils/units';
// Utilidades para iconos de cielo y viento
const getSkyIcon = (weatherCode: number, hour: number) => {
  // Ejemplo simple, puedes expandir según los códigos de Open-Meteo
  if ([0, 1].includes(weatherCode)) return hour >= 7 && hour <= 20 ? '☀️' : '🌙';
  if ([2, 3].includes(weatherCode)) return '⛅';
  if ([45, 48].includes(weatherCode)) return '🌫️';
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) return '🌧️';
  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) return '❄️';
  if ([95, 96, 99].includes(weatherCode)) return '⛈️';
  return '☁️';
};

const getWindArrow = (deg: number) => {
  // Unicode arrow for wind direction
  if (deg === undefined) return '';
  const arrows = ['↑','↗','→','↘','↓','↙','←','↖'];
  return arrows[Math.round(deg/45)%8];
};
import { format } from 'date-fns';

export const SpotDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { spots, loadSpots, catches, loadCatches } = useAppStore();
  const { settings } = useSettingsStore();
  const { setPageTitle, setShowBackButton } = useLayoutContext();
  const [spot, setSpot] = useState<Spot | undefined>(undefined);
  const [weather, setWeather] = useState<any>(null);
  const [marine, setMarine] = useState<any>(null);
  const [tideData, setTideData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(0); // 0: hoy, 1: mañana, 2: pasado
  const [mainTab, setMainTab] = useState(0); // 0: previsión, 1: capturas

  useEffect(() => {
    if (spots.length === 0) {
      loadSpots();
    } else {
      const foundSpot = spots.find(s => s.id === Number(id));
      setSpot(foundSpot);
      if (foundSpot) {
        setPageTitle(foundSpot.name);
        setShowBackButton(true);
      }
    }
    loadCatches();
    
    return () => {
      setPageTitle('🌊 XIRIN MARINE');
      setShowBackButton(false);
    };
  }, [spots, id, loadSpots, loadCatches, setPageTitle, setShowBackButton]);

  useEffect(() => {
    const loadData = async () => {
      if (spot) {
        setLoading(true);
        const wData = await fetchWeatherForecast(spot.location.lat, spot.location.lng);
        const mData = await fetchMarineWeather(spot.location.lat, spot.location.lng);
        setWeather(wData);
        setMarine(mData);
        setLoading(false);
      }
    };
    loadData();
  }, [spot]);

  useEffect(() => {
    const loadTideData = async () => {
      if (spot) {
  const tData = await fetchTideData(spot.location.lat, spot.location.lng, settings.tideProvider, selectedDay);
        setTideData(tData);
      }
    };
    loadTideData();
  }, [spot, selectedDay, settings.tideProvider]);

  if (!spot) return <Box p={2}>Cargando spot...</Box>;


  // Calcular índices de hora para el día seleccionado
  let dayStart = 0, dayEnd = 24;
  if (weather?.hourly?.time) {
    const baseDate = new Date(weather.hourly.time[0]);
    dayStart = weather.hourly.time.findIndex((t: string) => {
      const d = new Date(t);
      return d.getDate() !== baseDate.getDate();
    });
    if (dayStart === -1) dayStart = 0;
    dayStart += selectedDay * 24;
    dayEnd = dayStart + 24;
  }

  const chartData = weather?.hourly?.time?.slice(dayStart, dayEnd).map((time: string, index: number) => ({
    time: format(new Date(time), 'HH:mm'),
    temp: convertTemperature(weather.hourly.temperature_2m[dayStart + index], settings.units),
    wind: convertSpeed(weather.hourly.wind_speed_10m[dayStart + index], settings.units),
    wave: convertWaveHeight(marine?.hourly?.wave_height?.[dayStart + index] || 0, settings.units),
    waveDir: marine?.hourly?.wave_direction?.[dayStart + index] || 0,
    pressure: weather.hourly.pressure_msl?.[dayStart + index],
    humidity: weather.hourly.relative_humidity_2m?.[dayStart + index],
    sky: getSkyIcon(weather.hourly.weather_code?.[dayStart + index], Number(format(new Date(time), 'H'))),
    windDir: weather.hourly.wind_direction_10m?.[dayStart + index],
  })) || [];

  return (
    <Box sx={{ p: 2, pb: 10, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Typography variant="body1" color="text.secondary" paragraph>
        {spot.description}
      </Typography>
      <Typography variant="caption" display="block" gutterBottom sx={{ color: 'primary.main' }}>
        📍 {spot.type} | {spot.location.lat.toFixed(4)}, {spot.location.lng.toFixed(4)}
      </Typography>

      <Button 
        variant="contained" 
        startIcon={<AddAPhotoIcon />} 
        fullWidth 
        sx={{ 
          mb: 3, 
          py: 1.5,
          background: 'linear-gradient(45deg, #00bcd4 30%, #4caf50 90%)',
          boxShadow: '0 3px 15px rgba(0, 188, 212, 0.3)',
          '&:hover': {
            background: 'linear-gradient(45deg, #00acc1 30%, #43a047 90%)',
          }
        }}
        onClick={() => navigate(`/add-catch/${spot.id}`)}
      >
        Añadir Captura
      </Button>

      {/* Tabs principales: Previsión / Capturas */}
      <Tabs 
        value={mainTab} 
        onChange={(_, v) => setMainTab(v)} 
        variant="fullWidth"
        sx={{ 
          mb: 3,
          '& .MuiTab-root': {
            color: 'text.secondary',
            fontWeight: 600,
            fontSize: '1rem',
            py: 1.5,
            '&.Mui-selected': {
              color: 'primary.main',
            }
          },
          '& .MuiTabs-indicator': {
            backgroundColor: 'primary.main',
            height: 4,
            borderRadius: 4,
          }
        }}
      >
        <Tab label="⛅ Previsión" />
        <Tab label={`🎣 Capturas (${catches.filter(c => c.spotId === spot.id).length})`} />
      </Tabs>

      {mainTab === 0 && (
      <>
      {loading ? (
        <CircularProgress />
      ) : (
        <Box>
          {/* Selector de día */}
          <Tabs 
            value={selectedDay} 
            onChange={(_, v) => setSelectedDay(v)} 
            sx={{ 
              mb: 2,
              '& .MuiTab-root': {
                color: 'text.secondary',
                fontWeight: 600,
                '&.Mui-selected': {
                  color: 'primary.main',
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'primary.main',
                height: 3,
                borderRadius: 3,
              }
            }}
          >
            <Tab label="Hoy" />
            <Tab label="Mañana" />
            <Tab label="Pasado" />
          </Tabs>

          {/* Estado actual - solo para el día de hoy */}
          {selectedDay === 0 && (
          <Card 
            variant="outlined" 
            sx={{ 
              mb: 2,
              background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.1) 0%, rgba(76, 175, 80, 0.1) 100%)',
              border: '1px solid rgba(0, 188, 212, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 188, 212, 0.2)'
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                ⛅ Estado Actual
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ 
                    flex: '1 1 45%', 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: 'rgba(0, 188, 212, 0.1)',
                    border: '1px solid rgba(0, 188, 212, 0.2)'
                  }}>
                      <Typography variant="body2" color="text.secondary">🌡️ Temperatura</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {formatValue(convertTemperature(weather?.current?.temperature_2m, settings.units))}{getTemperatureUnit(settings.units)}
                      </Typography>
                  </Box>
                  <Box sx={{ 
                    flex: '1 1 45%', 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: 'rgba(76, 175, 80, 0.1)',
                    border: '1px solid rgba(76, 175, 80, 0.2)'
                  }}>
                      <Typography variant="body2" color="text.secondary">💨 Viento</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                        {formatValue(convertSpeed(weather?.current?.wind_speed_10m, settings.units), 0)} {getSpeedUnit(settings.units)}
                      </Typography>
                  </Box>
                  <Box sx={{ 
                    flex: '1 1 45%', 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: 'rgba(0, 188, 212, 0.1)',
                    border: '1px solid rgba(0, 188, 212, 0.2)'
                  }}>
                      <Typography variant="body2" color="text.secondary">🧭 Dirección</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {weather?.current?.wind_direction_10m}° {getWindArrow(weather?.current?.wind_direction_10m)}
                      </Typography>
                  </Box>
                  <Box sx={{ 
                    flex: '1 1 45%', 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: 'rgba(76, 175, 80, 0.1)',
                    border: '1px solid rgba(76, 175, 80, 0.2)'
                  }}>
                      <Typography variant="body2" color="text.secondary">📊 Presión</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {weather?.current?.pressure_msl} hPa
                      </Typography>
                  </Box>                  
              </Box>
            </CardContent>
          </Card>
          )}

          {/* Tide Information */}
          {tideData && (
            <Card 
              variant="outlined" 
              sx={{ 
                mb: 2,
                background: 'linear-gradient(135deg, rgba(0, 150, 200, 0.1) 0%, rgba(0, 100, 150, 0.1) 100%)',
                border: '1px solid rgba(0, 150, 200, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 150, 200, 0.2)'
              }}
            >
              <CardContent sx={{ py: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600, mb: 1.5 }}>
                  🌊 Mareas - {format(new Date(tideData.date), 'dd MMM')}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  {tideData.extremes.map((tide: any, index: number) => (
                    <Box 
                      key={index}
                      sx={{ 
                        flex: '1 1 22%', 
                        minWidth: '100px',
                        p: 1.5, 
                        borderRadius: 2, 
                        bgcolor: tide.type === 'high' ? 'rgba(0, 188, 212, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                        border: tide.type === 'high' ? '1px solid rgba(0, 188, 212, 0.3)' : '1px solid rgba(76, 175, 80, 0.3)',
                        textAlign: 'center'
                      }}
                    >
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          display: 'block',
                          fontSize: '0.65rem',
                          color: tide.type === 'high' ? 'primary.main' : 'secondary.main',
                          fontWeight: 600,
                          mb: 0.5
                        }}
                      >
                        {tide.type === 'high' ? 'PLEAMAR' : 'BAJAMAR'}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: tide.type === 'high' ? 'primary.main' : 'secondary.main', lineHeight: 1 }}>
                        {format(new Date(tide.time), 'HH:mm')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {formatValue(convertWaveHeight(tide.height, settings.units))}{getWaveHeightUnit(settings.units)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Charts */}
          <Card 
            variant="outlined"
            sx={{ 
              mb: 2,
              background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.05) 0%, rgba(76, 175, 80, 0.05) 100%)',
              border: '1px solid rgba(0, 188, 212, 0.2)',
              boxShadow: '0 4px 20px rgba(0, 188, 212, 0.1)'
            }}
          >
              <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    � Gráficas 24h
                  </Typography>
                  <Box sx={{ height: 300, width: '100%' }}>
                      <ResponsiveContainer>
                          <LineChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                              <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" />
                              <YAxis yAxisId="left" stroke="rgba(255,255,255,0.5)" label={{ value: `Oleaje (${getWaveHeightUnit(settings.units)})`, angle: -90, position: 'insideLeft', style: { fill: 'rgba(255,255,255,0.7)' } }} />
                              <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.5)" label={{ value: `Viento (${getSpeedUnit(settings.units)})`, angle: 90, position: 'insideRight', style: { fill: 'rgba(255,255,255,0.7)' } }} />
                              <RechartsTooltip 
                                contentStyle={{ 
                                  backgroundColor: 'rgba(19, 47, 76, 0.95)', 
                                  border: '1px solid rgba(0, 188, 212, 0.3)',
                                  borderRadius: 8
                                }}
                              />
                              <Legend 
                                wrapperStyle={{ 
                                  paddingTop: '10px'
                                }}
                                iconType="line"
                              />
                              <Line 
                                yAxisId="right"
                                type="monotone" 
                                dataKey="wind" 
                                stroke="#4caf50" 
                                strokeWidth={2}
                                name={`Viento (${getSpeedUnit(settings.units)})`}
                                dot={{ fill: '#4caf50', r: 3 }}
                              />
                              <Line 
                                yAxisId="left"
                                type="monotone" 
                                dataKey="wave" 
                                stroke="#ff9800" 
                                strokeWidth={2}
                                name={`Oleaje (${getWaveHeightUnit(settings.units)})`}
                                dot={{ fill: '#ff9800', r: 3 }}
                              />
                          </LineChart>
                      </ResponsiveContainer>
                  </Box>
              </CardContent>
          </Card>

          {/* Tabla horaria detallada */}
          <Card 
            variant="outlined" 
            sx={{ 
              background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.05) 0%, rgba(76, 175, 80, 0.05) 100%)',
              border: '1px solid rgba(0, 188, 212, 0.2)',
              boxShadow: '0 4px 20px rgba(0, 188, 212, 0.1)'
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                📅 Previsión Horaria
              </Typography>
              <TableContainer 
                component={Paper} 
                sx={{ 
                  bgcolor: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: 2,
                  '& .MuiTableCell-head': {
                    bgcolor: 'rgba(0, 188, 212, 0.1)',
                    fontWeight: 700,
                    color: 'primary.main',
                    opacity: 1
                  },
                  '& .MuiTableRow-root:hover': {
                    bgcolor: 'rgba(0, 188, 212, 0.05)'
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
                      <TableCell align="center" sx={{ minWidth: 70, py: 1.5 }}>�<br/>Presión</TableCell>
                      <TableCell align="center" sx={{ minWidth: 60, py: 1.5 }}>💧<br/>Hum</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {chartData.map((row: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>{row.time}</TableCell>
                        <TableCell align="center" sx={{ fontSize: '1.2rem' }}>{row.sky}</TableCell>
                        <TableCell align="center">
                          {formatValue(row.wind, 0)} {getSpeedUnit(settings.units)}<br/>{getWindArrow(row.windDir)}
                        </TableCell>
                        <TableCell align="center" sx={{ color: 'secondary.main', fontWeight: 600 }}>
                          {formatValue(row.wave)}{getWaveHeightUnit(settings.units)}<br/>{getWindArrow(row.waveDir)}
                        </TableCell>
                        <TableCell align="center" sx={{ color: 'primary.main', fontWeight: 600 }}>{formatValue(row.temp)}{getTemperatureUnit(settings.units)}</TableCell>
                        <TableCell align="center">{row.pressure} hPa</TableCell>
                        <TableCell align="center">{row.humidity}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      )}
      </>
      )}

      {/* Tab de Capturas */}
      {mainTab === 1 && (
        <Box>
          {catches.filter(c => c.spotId === spot.id).length === 0 ? (
            <Card sx={{ 
              p: 4, 
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.05) 0%, rgba(76, 175, 80, 0.05) 100%)',
              border: '1px solid rgba(0, 188, 212, 0.2)'
            }}>
              <Typography color="text.secondary" variant="h6">
                No hay capturas en esta ubicación
              </Typography>
              <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
                Añade tu primera captura usando el botón de arriba
              </Typography>
            </Card>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {catches
                .filter(c => c.spotId === spot.id)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((c) => (
                  <Card 
                    key={c.id}
                    onClick={() => navigate(`/catch/${c.id}`)}
                    sx={{ 
                      background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.05) 0%, rgba(76, 175, 80, 0.05) 100%)',
                      border: '1px solid rgba(0, 188, 212, 0.2)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(0, 188, 212, 0.3)'
                      }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        {c.photoUrl ? (
                          <Box
                            component="img"
                            src={c.photoUrl}
                            alt={c.species}
                            sx={{
                              width: 80,
                              height: 80,
                              borderRadius: 2,
                              objectFit: 'cover',
                              border: '2px solid rgba(0, 188, 212, 0.3)',
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 80,
                              height: 80,
                              borderRadius: 2,
                              bgcolor: 'rgba(0, 188, 212, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '2px solid rgba(0, 188, 212, 0.3)',
                            }}
                          >
                            <Typography variant="h3">🐟</Typography>
                          </Box>
                        )}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {c.species} {c.weight ? `(${c.weight}kg)` : ''}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            🕐 {format(new Date(c.date), 'dd/MM/yyyy HH:mm')}
                          </Typography>
                          <Box sx={{ 
                            mt: 1, 
                            p: 1, 
                            borderRadius: 1, 
                            bgcolor: 'rgba(0, 188, 212, 0.1)',
                            display: 'inline-block'
                          }}>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                              🌡️ {c.weather.temperature}°C | 💨 {c.weather.windSpeed}km/h
                            </Typography>
                          </Box>
                          {c.notes && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                              "{c.notes}"
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};
