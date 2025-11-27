import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Paper, Typography } from '@mui/material';
import type { Point } from '../types';

interface PointsListProps {
  points: Point[];
}

export default function PointsList({ points }: PointsListProps) {
  if (points.length === 0) {
    return (
      <Paper sx={{ p: 2, m: 2, textAlign: 'center' }}>
        <Typography>No saved points yet.</Typography>
        <Typography variant="caption">Tap on the map to add points.</Typography>
      </Paper>
    );
  }

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper', overflow: 'auto', height: '100%' }}>
      {points.map((point) => (
        <ListItem key={point.id} divider>
          <ListItemIcon>
            <LocationOnIcon color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary={point.name} 
            secondary={`Lat: ${point.lat.toFixed(4)}, Lng: ${point.lng.toFixed(4)}`} 
          />
        </ListItem>
      ))}
    </List>
  );
}
