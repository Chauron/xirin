import React, { useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Switch, Divider, Select, MenuItem, FormControl, InputLabel, Card } from '@mui/material';
import { useSettingsStore } from '../store/settingsStore';
import { useLayoutContext } from '../components/Layout';

export const SettingsPage: React.FC = () => {
  const {
    settings,
    setUnits,
    setTideProvider,
    setWaveProvider,
    setWeatherProvider,
    setLanguage,
    setDarkMode,
    setNotifyTides,
    loadSettings
  } = useSettingsStore();
  const { setPageTitle, setShowBackButton } = useLayoutContext();

  useEffect(() => {
    setPageTitle('Ajustes');
    setShowBackButton(false);
    loadSettings();
    
    return () => {
      setPageTitle('🌊 XIRIN MARINE');
    };
  }, [loadSettings, setPageTitle, setShowBackButton]);

  return (
    <Box sx={{ p: 2, bgcolor: 'background.default', minHeight: '100vh', pb: 10 }}>
      <List sx={{ gap: 1, display: 'flex', flexDirection: 'column' }}>
        <Card sx={{ 
          background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.05) 0%, rgba(76, 175, 80, 0.05) 100%)',
          border: '1px solid rgba(0, 188, 212, 0.2)'
        }}>
          <ListItem>
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'primary.main' }}>Unidades</InputLabel>
              <Select
                value={settings.units}
                label="Unidades"
                onChange={e => setUnits(e.target.value as any)}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0, 188, 212, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0, 188, 212, 0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  }
                }}
              >
                <MenuItem value="metric">🌡️ Métrico (°C, km/h, m)</MenuItem>
                <MenuItem value="imperial">🇺🇸 Imperial (°F, mph, ft)</MenuItem>
              </Select>
            </FormControl>
          </ListItem>
        </Card>
        <Divider />
        <Card sx={{ 
          background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.05) 0%, rgba(76, 175, 80, 0.05) 100%)',
          border: '1px solid rgba(0, 188, 212, 0.2)'
        }}>
          <ListItem>
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'primary.main' }}>Proveedor de Tiempo</InputLabel>
              <Select
                value={settings.weatherProvider}
                label="Proveedor de Tiempo"
                onChange={e => setWeatherProvider(e.target.value as any)}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0, 188, 212, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0, 188, 212, 0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  }
                }}
              >
                <MenuItem value="open-meteo">🌐 Open-Meteo (Global)</MenuItem>
                <MenuItem value="meteosix">🌊 MeteoSIX (Galicia)</MenuItem>
              </Select>
            </FormControl>
          </ListItem>
        </Card>
        <Divider />
        <Card sx={{ 
          background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.05) 0%, rgba(76, 175, 80, 0.05) 100%)',
          border: '1px solid rgba(0, 188, 212, 0.2)'
        }}>
          <ListItem>
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'primary.main' }}>Proveedor de Mareas</InputLabel>
              <Select
                value={settings.tideProvider}
                label="Proveedor de Mareas"
                onChange={e => setTideProvider(e.target.value as any)}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0, 188, 212, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0, 188, 212, 0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  }
                }}
              >
                <MenuItem value="none">🚫 Ninguno</MenuItem>
                <MenuItem value="opentide">🌊 OpenTidePrediction (Global)</MenuItem>
                <MenuItem value="meteosix">🌊 MeteoSIX (Galicia)</MenuItem>
                <MenuItem value="puertos">🇪🇸 Puertos del Estado (España)</MenuItem>
                <MenuItem value="noaa">🇺🇸 NOAA (EE.UU.)</MenuItem>
              </Select>
            </FormControl>
          </ListItem>
        </Card>
        <Divider />
        <Card sx={{ 
          background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.05) 0%, rgba(76, 175, 80, 0.05) 100%)',
          border: '1px solid rgba(0, 188, 212, 0.2)'
        }}>
          <ListItem>
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'primary.main' }}>Proveedor de Oleaje</InputLabel>
              <Select
                value={settings.waveProvider}
                label="Proveedor de Oleaje"
                onChange={e => setWaveProvider(e.target.value as any)}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0, 188, 212, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0, 188, 212, 0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  }
                }}
              >
                <MenuItem value="open-meteo">🌐 Open-Meteo (Global)</MenuItem>
                <MenuItem value="meteosix">🌊 MeteoSIX (Galicia)</MenuItem>
              </Select>
            </FormControl>
          </ListItem>
        </Card>
        <Divider />
        <Card sx={{ 
          background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.05) 0%, rgba(76, 175, 80, 0.05) 100%)',
          border: '1px solid rgba(0, 188, 212, 0.2)'
        }}>
          <ListItem>
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'primary.main' }}>Idioma</InputLabel>
              <Select
                value={settings.language}
                label="Idioma"
                onChange={e => setLanguage(e.target.value as any)}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0, 188, 212, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0, 188, 212, 0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  }
                }}
              >
                <MenuItem value="es">🇪🇸 Español</MenuItem>
                <MenuItem value="en">🇬🇧 English</MenuItem>
              </Select>
            </FormControl>
          </ListItem>
        </Card>
        <Divider />
        <Card sx={{ 
          background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.05) 0%, rgba(76, 175, 80, 0.05) 100%)',
          border: '1px solid rgba(0, 188, 212, 0.2)'
        }}>
          <ListItem>
            <ListItemText 
              primary={<Typography sx={{ fontWeight: 600 }}>🔔 Notificaciones de Mareas</Typography>} 
              secondary="Avisar en pleamar/bajamar" 
            />
            <Switch 
              checked={settings.notifyTides} 
              onChange={e => setNotifyTides(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: 'primary.main',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: 'primary.main',
                }
              }}
            />
          </ListItem>
        </Card>
        <Divider />
        <Card sx={{ 
          background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.05) 0%, rgba(76, 175, 80, 0.05) 100%)',
          border: '1px solid rgba(0, 188, 212, 0.2)'
        }}>
          <ListItem>
            <ListItemText 
              primary={<Typography sx={{ fontWeight: 600 }}>🌙 Modo Oscuro</Typography>}
            />
            <Switch 
              checked={settings.darkMode} 
              onChange={e => setDarkMode(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: 'primary.main',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: 'primary.main',
                }
              }}
            />
          </ListItem>
        </Card>
      </List>
      <Box sx={{ mt: 4, textAlign: 'center', p: 2, borderRadius: 2, bgcolor: 'rgba(0, 188, 212, 0.05)' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
          🌊 Xirin Marine App v0.1.0
        </Typography>
      </Box>
    </Box>
  );
};
