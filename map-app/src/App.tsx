import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { MapPage } from './pages/MapPage';
import SpotsPage from './pages/SpotsPage';
import { SpotDetailsPage } from './pages/SpotDetailsPage';
import { AddCatchPage } from './pages/AddCatchPage';
import { CatchesPage } from './pages/CatchesPage';
import { CatchDetailsPage } from './pages/CatchDetailsPage';
import { SettingsPage } from './pages/SettingsPage';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00bcd4', // Cyan vibrante
    },
    secondary: {
      main: '#4caf50', // Verde agua
    },
    background: {
      default: '#0a1929',
      paper: '#132f4c',
    },
    text: {
      primary: '#fff',
      secondary: 'rgba(255, 255, 255, 0.7)',
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
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
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
        },
      },
    },
  },
});

function App() {
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
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
