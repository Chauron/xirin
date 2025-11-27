import React from 'react';
import { AppBar, Toolbar, Typography, Box, BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import ListIcon from '@mui/icons-material/List';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getValue = () => {
    if (location.pathname === '/' || location.pathname.startsWith('/map')) return 0;
    if (location.pathname.startsWith('/catches')) return 1;
    if (location.pathname.startsWith('/settings')) return 2;
    return 0;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Xirin Marine
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, overflow: 'auto', position: 'relative' }}>
        <Outlet />
      </Box>

      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} elevation={3}>
        <BottomNavigation
          showLabels
          value={getValue()}
          onChange={(_, newValue) => {
            if (newValue === 0) navigate('/');
            if (newValue === 1) navigate('/catches');
            if (newValue === 2) navigate('/settings');
          }}
        >
          <BottomNavigationAction label="Mapa" icon={<MapIcon />} />
          <BottomNavigationAction label="Capturas" icon={<ListIcon />} />
          <BottomNavigationAction label="Ajustes" icon={<SettingsIcon />} />
        </BottomNavigation>
      </Paper>
      {/* Spacer for bottom nav */}
      <Box sx={{ height: 56 }} /> 
    </Box>
  );
};
