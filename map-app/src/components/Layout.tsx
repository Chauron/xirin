import React, { createContext, useContext, useState } from 'react';
import { AppBar, Toolbar, Typography, Box, BottomNavigation, BottomNavigationAction, Paper, IconButton } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ListIcon from '@mui/icons-material/List';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

interface LayoutContextType {
  setPageTitle: (title: string) => void;
  setShowBackButton: (show: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType>({
  setPageTitle: () => {},
  setShowBackButton: () => {},
});

export const useLayoutContext = () => useContext(LayoutContext);

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState('🌊 XIRIN MARINE');
  const [showBackButton, setShowBackButton] = useState(false);

  const getValue = () => {
    if (location.pathname === '/' || location.pathname.startsWith('/map')) return 0;
    if (location.pathname.startsWith('/spots') || location.pathname.startsWith('/spot')) return 1;
    if (location.pathname.startsWith('/catches') || location.pathname.startsWith('/catch')) return 2;
    if (location.pathname.startsWith('/settings')) return 3;
    return 0;
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <LayoutContext.Provider value={{ setPageTitle, setShowBackButton }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default' }}>
        <AppBar 
          position="static" 
          sx={{ 
            bgcolor: 'background.paper',
            color: 'text.primary',
            boxShadow: 1,
            pt: 'env(safe-area-inset-top)',
          }}
        >
          <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
            {showBackButton && (
              <IconButton
                edge="start"
                onClick={handleBack}
                sx={{ 
                  mr: 2,
                  color: 'primary.main',
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            )}
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 0.5 }}>
              {pageTitle}
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
        bgcolor: 'background.paper',
        boxShadow: 3,
        pb: 'env(safe-area-inset-bottom)',
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
            minHeight: 56,
            '& .MuiBottomNavigationAction-root': {
              color: 'text.secondary',
              '&.Mui-selected': {
                color: 'primary.main'
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
    </LayoutContext.Provider>
  );
};
