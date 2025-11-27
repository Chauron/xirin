import React from 'react';
import { AppBar, Toolbar, Typography, Box, BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ListIcon from '@mui/icons-material/List';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getValue = () => {
    if (location.pathname === '/' || location.pathname.startsWith('/map')) return 0;
    if (location.pathname.startsWith('/spots') || location.pathname.startsWith('/spot')) return 1;
    if (location.pathname.startsWith('/catches') || location.pathname.startsWith('/catch')) return 2;
    if (location.pathname.startsWith('/settings')) return 3;
    return 0;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default' }}>
      <AppBar 
        position="static" 
        sx={{ 
          background: 'linear-gradient(135deg, #0a1929 0%, #1a237e 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          paddingTop: 'env(safe-area-inset-top)',
        }}
      >
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 1 }}>
            🌊 XIRIN MARINE
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, overflow: 'auto', position: 'relative', bgcolor: 'background.default' }}>
        <Outlet />
      </Box>

      <Paper sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000,
        background: 'linear-gradient(135deg, #0a1929 0%, #1a237e 100%)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.5)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }} elevation={3}>
        <BottomNavigation
          showLabels
          value={getValue()}
          onChange={(_, newValue) => {
            if (newValue === 0) navigate('/map');
            if (newValue === 1) navigate('/spots');
            if (newValue === 2) navigate('/catches');
            if (newValue === 3) navigate('/settings');
          }}
          sx={{ 
            background: 'transparent',
            '& .MuiBottomNavigationAction-root': {
              color: 'rgba(255,255,255,0.5)',
              '&.Mui-selected': {
                color: '#00bcd4'
              }
            }
          }}
        >
          <BottomNavigationAction label="Mapa" icon={<MapIcon />} />
          <BottomNavigationAction label="Ubicaciones" icon={<LocationOnIcon />} />
          <BottomNavigationAction label="Capturas" icon={<ListIcon />} />
          <BottomNavigationAction label="Ajustes" icon={<SettingsIcon />} />
        </BottomNavigation>
      </Paper>
      {/* Spacer for bottom nav */}
      <Box sx={{ height: 56 }} /> 
    </Box>
  );
};
