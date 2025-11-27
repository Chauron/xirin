import React, { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Box, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider } from '@mui/material';
import { format } from 'date-fns';

export const CatchesPage: React.FC = () => {
  const { catches, loadCatches, spots, loadSpots } = useAppStore();

  useEffect(() => {
    loadCatches();
    if (spots.length === 0) loadSpots();
  }, [loadCatches, loadSpots, spots.length]);

  const getSpotName = (spotId: number) => {
      return spots.find(s => s.id === spotId)?.name || 'Desconocido';
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>Historial de Capturas</Typography>
      
      {catches.length === 0 ? (
          <Typography color="text.secondary">No hay capturas registradas.</Typography>
      ) : (
          <List>
              {catches.map((c) => (
                  <React.Fragment key={c.id}>
                      <ListItem alignItems="flex-start">
                          <ListItemAvatar>
                              <Avatar 
                                src={c.photoUrl} 
                                variant="rounded"
                                sx={{ width: 60, height: 60, mr: 2 }}
                              >
                                  {c.species.charAt(0)}
                              </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                              primary={
                                  <Typography variant="h6">
                                      {c.species} {c.weight ? `(${c.weight}kg)` : ''}
                                  </Typography>
                              }
                              secondary={
                                  <React.Fragment>
                                      <Typography component="span" variant="body2" color="text.primary">
                                          {getSpotName(c.spotId)}
                                      </Typography>
                                      <br />
                                      {format(new Date(c.date), 'dd/MM/yyyy HH:mm')}
                                      <br />
                                      <Typography variant="caption">
                                          Temp: {c.weather.temperature}°C, Viento: {c.weather.windSpeed}km/h
                                      </Typography>
                                  </React.Fragment>
                              }
                          />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                  </React.Fragment>
              ))}
          </List>
      )}
    </Box>
  );
};
