import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { MapPage } from './pages/MapPage';
import SpotsPage from './pages/SpotsPage';
import { SpotDetailsPage } from './pages/SpotDetailsPage';
import { AddCatchPage } from './pages/AddCatchPage';
import { EditCatchPage } from './pages/EditCatchPage';
import { CatchesPage } from './pages/CatchesPage';
import { CatchDetailsPage } from './pages/CatchDetailsPage';
import { SettingsPage } from './pages/SettingsPage';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { useSettingsStore } from './store/settingsStore';
import { useEffect, useMemo } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

function App() {
  const { settings, loadSettings } = useSettingsStore();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Configure status bar for native platforms
  useEffect(() => {
    const configureStatusBar = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          // Set status bar style to Light (white icons on dark background)
          await StatusBar.setStyle({ style: Style.Light });
          
          // Set dark semi-transparent background
          await StatusBar.setBackgroundColor({ color: '#CC000000' });
          
          // Don't overlay - let it be part of the layout
          await StatusBar.setOverlaysWebView({ overlay: false });
        } catch (error) {
          console.error('Error configuring status bar:', error);
        }
      }
    };
    
    configureStatusBar();
  }, []);

  const theme = useMemo(() => createTheme({
    palette: {
      mode: settings.darkMode ? 'dark' : 'light',
      primary: {
        main: '#00bcd4', // Cyan vibrante
      },
      secondary: {
        main: '#4caf50', // Verde agua
      },
      background: settings.darkMode ? {
        default: '#0a1929',
        paper: '#132f4c',
      } : {
        default: '#f5f5f5',
        paper: '#ffffff',
      },
      text: settings.darkMode ? {
        primary: '#fff',
        secondary: 'rgba(255, 255, 255, 0.7)',
      } : {
        primary: 'rgba(0, 0, 0, 0.87)',
        secondary: 'rgba(0, 0, 0, 0.6)',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: settings.darkMode 
              ? 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))'
              : 'linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9))',
            backdropFilter: 'blur(20px)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 8,
            '&:focus': {
              outline: 'none',
            },
            '&:focus-visible': {
              outline: 'none',
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            '&:focus': {
              outline: 'none',
            },
            '&:focus-visible': {
              outline: 'none',
            },
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            '&:focus': {
              outline: 'none',
            },
            '&:focus-visible': {
              outline: 'none',
            },
          },
        },
      },
      MuiButtonBase: {
        defaultProps: {
          disableRipple: false, // Keep ripple for mobile feedback
        },
        styleOverrides: {
          root: {
            '&:focus': {
              outline: 'none',
            },
            '&:focus-visible': {
              outline: 'none',
            },
          },
        },
      },
      MuiBottomNavigationAction: {
        styleOverrides: {
          root: {
            '&:focus': {
              outline: 'none',
            },
            '&:focus-visible': {
              outline: 'none',
            },
          },
        },
      },
    },
  }), [settings.darkMode]);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<MapPage />} />
            <Route path="map" element={<MapPage />} />
            <Route path="spots" element={<SpotsPage />} />
            <Route path="spot/:id" element={<SpotDetailsPage />} />
            <Route path="add-catch/:spotId" element={<AddCatchPage />} />
            <Route path="catches" element={<CatchesPage />} />
            <Route path="catch/:id" element={<CatchDetailsPage />} />
            <Route path="catch/:id/edit" element={<EditCatchPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
