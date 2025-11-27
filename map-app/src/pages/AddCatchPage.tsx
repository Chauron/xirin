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
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => navigate(-1)}><ArrowBackIcon /></IconButton>
        <Typography variant="h6" sx={{ ml: 1 }}>Nueva Captura en {spot.name}</Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button variant="outlined" onClick={takePhoto}>
            {photoUrl ? 'Cambiar Foto' : 'Tomar Foto'}
        </Button>
        
        {photoUrl && (
            <Card>
                <CardMedia component="img" height="200" image={photoUrl} alt="Captura" />
            </Card>
        )}

        <TextField 
            label="Especie" 
            value={species} 
            onChange={(e) => setSpecies(e.target.value)} 
            fullWidth 
            required
        />
        <TextField 
            label="Peso (kg)" 
            type="number"
            value={weight} 
            onChange={(e) => setWeight(e.target.value)} 
            fullWidth 
        />
        <TextField 
            label="Notas" 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            fullWidth 
            multiline
            rows={3}
        />

        <Button 
            variant="contained" 
            onClick={handleSave} 
            disabled={loading || !species}
            size="large"
        >
            {loading ? 'Guardando...' : 'Guardar Captura'}
        </Button>
      </Box>
    </Box>
  );
};
