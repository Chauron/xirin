import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Switch, Divider } from '@mui/material';

export const SettingsPage: React.FC = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>Ajustes</Typography>
      
      <List>
          <ListItem>
              <ListItemText primary="Unidades Métricas" secondary="Usar km/h, °C, metros" />
              <Switch defaultChecked />
          </ListItem>
          <Divider />
          <ListItem>
              <ListItemText primary="Notificaciones de Mareas" secondary="Avisar en pleamar/bajamar" />
              <Switch />
          </ListItem>
          <Divider />
          <ListItem>
              <ListItemText primary="Modo Oscuro" />
              <Switch />
          </ListItem>
      </List>
      
      <Box sx={{ mt: 4 }}>
          <Typography variant="caption" color="text.secondary">
              Xirin Marine App v0.1.0
          </Typography>
      </Box>
    </Box>
  );
};
