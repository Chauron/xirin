import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import type { Spot } from '../models/types';
import { fetchWeatherForecast, fetchMarineWeather } from '../api/weatherApi';
import { Box, Typography, Card, CardContent, Button, CircularProgress, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

export const SpotDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { spots, loadSpots } = useAppStore();
  const [spot, setSpot] = useState<Spot | undefined>(undefined);
  const [weather, setWeather] = useState<any>(null);
  const [marine, setMarine] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (spots.length === 0) {
      loadSpots();
    } else {
      const foundSpot = spots.find(s => s.id === Number(id));
      setSpot(foundSpot);
    }
  }, [spots, id, loadSpots]);

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

  if (!spot) return <Box p={2}>Cargando spot...</Box>;

  const chartData = weather?.hourly?.time?.slice(0, 24).map((time: string, index: number) => ({
      time: format(new Date(time), 'HH:mm'),
      temp: weather.hourly.temperature_2m[index],
      wind: weather.hourly.wind_speed_10m[index],
      wave: marine?.hourly?.wave_height?.[index] || 0
  })) || [];

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => navigate(-1)}><ArrowBackIcon /></IconButton>
        <Typography variant="h5" sx={{ ml: 1 }}>{spot.name}</Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" paragraph>
        {spot.description}
      </Typography>
      <Typography variant="caption" display="block" gutterBottom>
        Tipo: {spot.type} | Coordenadas: {spot.location.lat.toFixed(4)}, {spot.location.lng.toFixed(4)}
      </Typography>

      <Button 
        variant="contained" 
        startIcon={<AddAPhotoIcon />} 
        fullWidth 
        sx={{ mb: 3 }}
        onClick={() => navigate(`/add-catch/${spot.id}`)}
      >
        Añadir Captura
      </Button>

      {loading ? (
        <CircularProgress />
      ) : (
        <Box>
          {/* Current Conditions Card */}
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Estado Actual</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 45%' }}>
                      <Typography variant="body2">Temperatura</Typography>
                      <Typography variant="h5">{weather?.current?.temperature_2m}°C</Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 45%' }}>
                      <Typography variant="body2">Viento</Typography>
                      <Typography variant="h5">{weather?.current?.wind_speed_10m} km/h</Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 45%' }}>
                      <Typography variant="body2">Dirección Viento</Typography>
                      <Typography variant="h5">{weather?.current?.wind_direction_10m}°</Typography>
                  </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Charts */}
          <Card variant="outlined">
              <CardContent>
                  <Typography variant="h6" gutterBottom>Previsión 24h</Typography>
                  <Box sx={{ height: 250, width: '100%' }}>
                      <ResponsiveContainer>
                          <LineChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="time" />
                              <YAxis yAxisId="left" />
                              <YAxis yAxisId="right" orientation="right" />
                              <Tooltip />
                              <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#8884d8" name="Temp (°C)" />
                              <Line yAxisId="right" type="monotone" dataKey="wind" stroke="#82ca9d" name="Viento (km/h)" />
                              <Line yAxisId="right" type="monotone" dataKey="wave" stroke="#ff7300" name="Ola (m)" />
                          </LineChart>
                      </ResponsiveContainer>
                  </Box>
              </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};
