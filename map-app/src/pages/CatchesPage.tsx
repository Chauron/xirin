import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useLayoutContext } from '../components/Layout';
import { Box, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Card } from '@mui/material';
import { format } from 'date-fns';

export const CatchesPage: React.FC = () => {
  const navigate = useNavigate();
  const { catches, loadCatches, spots, loadSpots } = useAppStore();
  const { setPageTitle, setShowBackButton } = useLayoutContext();

  useEffect(() => {
    setPageTitle('Historial de Capturas');
    setShowBackButton(false);
    loadCatches();
    if (spots.length === 0) loadSpots();
    
    return () => {
      setPageTitle('🌊 XIRIN MARINE');
    };
  }, [loadCatches, loadSpots, spots.length, setPageTitle, setShowBackButton]);

  const getSpotName = (spotId: number) => {
      return spots.find(s => s.id === spotId)?.name || 'Desconocido';
  };

  return (
    <Box sx={{ p: 2, bgcolor: 'background.default', minHeight: '100vh', pb: 10 }}>
      {catches.length === 0 ? (
          <Card sx={{ 
            p: 4, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.05) 0%, rgba(76, 175, 80, 0.05) 100%)',
            border: '1px solid rgba(0, 188, 212, 0.2)'
          }}>
            <Typography color="text.secondary" variant="h6">
              No hay capturas registradas
            </Typography>
            <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
              Añade tu primera captura desde un marcador
            </Typography>
          </Card>
      ) : (
          <List sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
              {catches.map((c) => (
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
                    <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                            <Avatar 
                              src={c.photoUrl} 
                              variant="rounded"
                              sx={{ 
                                width: 80, 
                                height: 80, 
                                mr: 2,
                                border: '2px solid',
                                borderColor: 'primary.main'
                              }}
                            >
                                <Typography variant="h4">{c.species.charAt(0)}</Typography>
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={
                                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                    {c.species} {c.weight ? `(${c.weight}kg)` : ''}
                                </Typography>
                            }
                            secondary={
                                <React.Fragment>
                                    <Typography component="span" variant="body1" sx={{ color: 'text.primary', fontWeight: 600 }}>
                                        📍 {getSpotName(c.spotId)}
                                    </Typography>
                                    <br />
                                    <Typography component="span" variant="body2" color="text.secondary">
                                      🕐 {format(new Date(c.date), 'dd/MM/yyyy HH:mm')}
                                    </Typography>
                                    <br />
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
                                </React.Fragment>
                            }
                        />
                    </ListItem>
                  </Card>
              ))}
          </List>
      )}
    </Box>
  );
};
