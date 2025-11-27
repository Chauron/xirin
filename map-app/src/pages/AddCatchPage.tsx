import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Box, Button, TextField, Typography, Card, CardMedia, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getCurrentConditions } from '../api/weatherApi';

export const AddCatchPage: React.FC = () => {
  const { spotId } = useParams<{ spotId: string }>();
  const navigate = useNavigate();
  const { spots, addCatch } = useAppStore();
  const [species, setSpecies] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const spot = spots.find(s => s.id === Number(spotId));

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
        // Fetch current weather conditions automatically
        const weatherData = await getCurrentConditions(spot.location.lat, spot.location.lng);
        
        await addCatch({
            spotId: spot.id!,
            date: new Date(),
            species,
            weight: weight ? parseFloat(weight) : undefined,
            notes,
            photoUrl,
            weather: {
                temperature: weatherData?.temperature || 0,
                windSpeed: weatherData?.windSpeed || 0,
                windDirection: weatherData?.windDirection || 0,
                // Add other fields as needed
            }
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
    <Box sx={{ p: 2, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton 
          onClick={() => navigate(-1)}
          sx={{ 
            bgcolor: 'rgba(0, 188, 212, 0.1)', 
            '&:hover': { bgcolor: 'rgba(0, 188, 212, 0.2)' }
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ ml: 1, fontWeight: 700 }}>
          Nueva Captura en {spot.name}
        </Typography>
      </Box>

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
