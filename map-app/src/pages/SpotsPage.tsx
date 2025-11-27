import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  IconButton, 
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import type { Spot } from '../models/types';

export default function SpotsPage() {
  const navigate = useNavigate();
  const { spots, loadSpots, updateSpot, deleteSpot } = useAppStore();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    type: 'fishing' as 'fishing' | 'anchoring' | 'sailing' | 'observation' | 'other'
  });

  useEffect(() => {
    loadSpots();
  }, [loadSpots]);

  const handleEditClick = (spot: Spot, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedSpot(spot);
    setEditForm({
      name: spot.name,
      description: spot.description,
      type: spot.type
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (spot: Spot, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedSpot(spot);
    setDeleteDialogOpen(true);
  };

  const handleEditSave = () => {
    if (selectedSpot && selectedSpot.id) {
      updateSpot(selectedSpot.id, {
        name: editForm.name,
        description: editForm.description,
        type: editForm.type
      });
      setEditDialogOpen(false);
      setSelectedSpot(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedSpot && selectedSpot.id) {
      deleteSpot(selectedSpot.id);
      setDeleteDialogOpen(false);
      setSelectedSpot(null);
    }
  };

  const getTypeEmoji = (type: string) => {
    const emojis: Record<string, string> = {
      fishing: '�',
      anchoring: '⚓',
      sailing: '⛵',
      observation: '👁️',
      other: '📍'
    };
    return emojis[type] || '📍';
  };

  return (
    <Box sx={{ p: 2, pb: 10, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          fontWeight: 700,
          background: 'linear-gradient(45deg, #00bcd4 30%, #4caf50 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 3
        }}
      >
        📍 Mis Ubicaciones
      </Typography>

      {spots.length === 0 ? (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 8,
            px: 2
          }}
        >
          <LocationOnIcon 
            sx={{ 
              fontSize: 80, 
              color: 'text.secondary',
              opacity: 0.3,
              mb: 2
            }} 
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No tienes ubicaciones guardadas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ve al mapa y mantén presionado para añadir una nueva ubicación
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {spots.map((spot) => (
            <Card
              key={spot.id}
              sx={{
                cursor: 'pointer',
                background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.1) 0%, rgba(76, 175, 80, 0.1) 100%)',
                border: '1px solid rgba(0, 188, 212, 0.3)',
                boxShadow: '0 4px 20px rgba(0, 188, 212, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 32px rgba(0, 188, 212, 0.3)',
                }
              }}
              onClick={() => navigate(`/spot/${spot.id}`)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700,
                        color: 'primary.main',
                        mb: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      {getTypeEmoji(spot.type)} {spot.name}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {spot.description}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'text.secondary',
                        display: 'block'
                      }}
                    >
                      📍 {spot.type} | {spot.location.lat.toFixed(4)}, {spot.location.lng.toFixed(4)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, ml: 1 }}>
                    <IconButton
                      size="small"
                      onClick={(e) => handleEditClick(spot, e)}
                      sx={{
                        bgcolor: 'rgba(0, 188, 212, 0.1)',
                        '&:hover': { bgcolor: 'rgba(0, 188, 212, 0.2)' }
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => handleDeleteClick(spot, e)}
                      sx={{
                        bgcolor: 'rgba(244, 67, 54, 0.1)',
                        '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.2)' }
                      }}
                    >
                      <DeleteIcon fontSize="small" sx={{ color: '#f44336' }} />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* FAB para añadir ubicación */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          background: 'linear-gradient(45deg, #00bcd4 30%, #4caf50 90%)',
          boxShadow: '0 4px 20px rgba(0, 188, 212, 0.4)',
          '&:hover': {
            background: 'linear-gradient(45deg, #00acc1 30%, #43a047 90%)',
          }
        }}
        onClick={() => navigate('/map')}
      >
        <AddIcon />
      </Fab>

      {/* Edit Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))'
          }
        }}
      >
        <DialogTitle>Editar Ubicación</DialogTitle>
        <DialogContent sx={{ pt: 2, minWidth: 300 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre"
            fullWidth
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Descripción"
            fullWidth
            multiline
            rows={3}
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            select
            margin="dense"
            label="Tipo"
            fullWidth
            value={editForm.type}
            onChange={(e) => setEditForm({ ...editForm, type: e.target.value as any })}
          >
            <MenuItem value="fishing">� Pesca</MenuItem>
            <MenuItem value="anchoring">⚓ Fondeo</MenuItem>
            <MenuItem value="sailing">⛵ Navegación</MenuItem>
            <MenuItem value="observation">👁️ Observación</MenuItem>
            <MenuItem value="other">📍 Otro</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleEditSave}
            variant="contained"
            disabled={!editForm.name.trim()}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))'
          }
        }}
      >
        <DialogTitle>¿Eliminar ubicación?</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres eliminar <strong>{selectedSpot?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
