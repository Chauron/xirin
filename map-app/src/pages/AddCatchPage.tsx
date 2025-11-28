import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useLayoutContext } from '../components/Layout';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Box, Button, TextField, Typography, Card, CardMedia } from '@mui/material';
import { getCurrentConditions, getDayWeatherData } from '../api/weatherApi';
import { fetchTideData } from '../api/tideApi';
import { useSettingsStore } from '../store/settingsStore';

export const AddCatchPage: React.FC = () => {
  const { spotId } = useParams<{ spotId: string }>();
  const navigate = useNavigate();
  const { spots, addCatch } = useAppStore();
  const { settings } = useSettingsStore();
  const { setPageTitle, setShowBackButton } = useLayoutContext();
  const [species, setSpecies] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const spot = spots.find(s => s.id === Number(spotId));

  useEffect(() => {
    setPageTitle(spot ? `Añadir Captura - ${spot.name}` : 'Añadir Captura');
    setShowBackButton(true);
    
    return () => {
      setPageTitle('🌊 XIRIN MARINE');
      setShowBackButton(false);
    };
  }, [spot, setPageTitle, setShowBackButton]);

  const takePhoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri
      });
      setPhotoUrl(image.webPath);
    } catch (error) {
      console.error('Error taking photo', error);
    }
  };

  const handleSave = async () => {
    if (!spot || !species) return;
    setLoading(true);

    try {
        const now = new Date();
        
        // Fetch current weather conditions automatically
        const weatherData = await getCurrentConditions(spot.location.lat, spot.location.lng);
        
        // Fetch full day weather data
        const hourlyWeather = await getDayWeatherData(spot.location.lat, spot.location.lng, now);
        
        // Fetch tide data for 3 days (yesterday, today, tomorrow) to ensure we have previous and next tides
        const [tideDataYesterday, tideDataToday, tideDataTomorrow] = await Promise.all([
          fetchTideData(spot.location.lat, spot.location.lng, settings.tideProvider, -1),
          fetchTideData(spot.location.lat, spot.location.lng, settings.tideProvider, 0),
          fetchTideData(spot.location.lat, spot.location.lng, settings.tideProvider, 1)
        ]);
        
        // Combine all tide events from 3 days
        const allTideEvents = [
          ...(tideDataYesterday?.extremes || []),
          ...(tideDataToday?.extremes || []),
          ...(tideDataTomorrow?.extremes || [])
        ];
        
        console.log('Tide provider:', settings.tideProvider);
        console.log('Combined tide events:', allTideEvents);
        
        let tideType: 'high' | 'low' | 'rising' | 'falling' | undefined = undefined;
        let tideHeight: number | undefined = undefined;
        
        if (allTideEvents.length > 0) {
          // Find the closest tide events before and after current time
          const currentTime = now.getTime();
          const sortedExtremes = allTideEvents
            .map(e => ({ ...e, timestamp: new Date(e.time).getTime() }))
            .sort((a, b) => a.timestamp - b.timestamp);
          
          const beforeTide = sortedExtremes.filter(e => e.timestamp <= currentTime).pop();
          const afterTide = sortedExtremes.find(e => e.timestamp > currentTime);
          
          if (beforeTide && afterTide) {
            // Determine if rising or falling
            if (beforeTide.type === 'low' && afterTide.type === 'high') {
              tideType = 'rising';
            } else if (beforeTide.type === 'high' && afterTide.type === 'low') {
              tideType = 'falling';
            }
            
            // Interpolate tide height
            const totalDuration = afterTide.timestamp - beforeTide.timestamp;
            const elapsed = currentTime - beforeTide.timestamp;
            const progress = elapsed / totalDuration;
            tideHeight = beforeTide.height + (afterTide.height - beforeTide.height) * progress;
          } else if (beforeTide) {
            tideType = beforeTide.type;
            tideHeight = beforeTide.height;
          } else if (afterTide) {
            tideType = afterTide.type;
            tideHeight = afterTide.height;
          }
        }
        
        await addCatch({
            spotId: spot.id!,
            date: now,
            species,
            weight: weight ? parseFloat(weight) : undefined,
            notes,
            photoUrl,
            weather: {
                temperature: weatherData?.temperature || 0,
                windSpeed: weatherData?.windSpeed || 0,
                windDirection: weatherData?.windDirection || 0,
                tideType,
                tideHeight,
            },
            hourlyWeather,
            tideEvents: allTideEvents,
        });
        navigate(-1);
    } catch (error) {
        console.error("Error saving catch", error);
    } finally {
        setLoading(false);
    }
  };

  if (!spot) return <Typography>Spot no encontrado</Typography>;

  return (
    <Box sx={{ p: 2, bgcolor: 'background.default', minHeight: '100vh', pb: 10 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button 
          variant="outlined" 
          onClick={takePhoto}
          sx={{ 
            py: 2,
            borderWidth: 2,
            borderColor: 'primary.main',
            color: 'primary.main',
            fontWeight: 600,
            '&:hover': {
              borderWidth: 2,
              bgcolor: 'rgba(0, 188, 212, 0.1)'
            }
          }}
        >
            {photoUrl ? '📸 Cambiar Foto' : '📷 Tomar Foto'}
        </Button>
        
        {photoUrl && (
            <Card sx={{ 
              overflow: 'hidden',
              border: '2px solid',
              borderColor: 'primary.main',
              boxShadow: '0 8px 24px rgba(0, 188, 212, 0.3)'
            }}>
                <CardMedia component="img" height="200" image={photoUrl} alt="Captura" />
            </Card>
        )}

        <TextField 
            label="Especie" 
            value={species} 
            onChange={(e) => setSpecies(e.target.value)} 
            fullWidth 
            required
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
            label="Peso (kg)" 
            type="number"
            value={weight} 
            onChange={(e) => setWeight(e.target.value)} 
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
            label="Notas" 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            fullWidth 
            multiline
            rows={3}
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

        <Button 
            variant="contained" 
            onClick={handleSave} 
            disabled={loading || !species}
            size="large"
            sx={{ 
              py: 1.5,
              background: 'linear-gradient(45deg, #00bcd4 30%, #4caf50 90%)',
              boxShadow: '0 3px 15px rgba(0, 188, 212, 0.3)',
              fontWeight: 700,
              fontSize: '1.1rem',
              '&:hover': {
                background: 'linear-gradient(45deg, #00acc1 30%, #43a047 90%)',
              },
              '&:disabled': {
                background: 'rgba(255, 255, 255, 0.12)'
              }
            }}
        >
            {loading ? '⏳ Guardando...' : '✅ Guardar Captura'}
        </Button>
      </Box>
    </Box>
  );
};
