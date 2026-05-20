import React, { useMemo, useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  type: string;
}

interface MapViewProps {
  locations: Location[];
  onMarkerClick?: (location: Location) => void;
}

const containerStyle = {
  width: '100%',
  height: '500px',
};

const MapView: React.FC<MapViewProps> = ({ locations, onMarkerClick }) => {
  const [selectedMarker, setSelectedMarker] = useState<Location | null>(null);
  const center = useMemo(() => {
    if (locations.length === 0) {
      return { lat: -1.2557, lng: 116.7 };
    }

    const avgLat = locations.reduce((sum, loc) => sum + loc.latitude, 0) / locations.length;
    const avgLng = locations.reduce((sum, loc) => sum + loc.longitude, 0) / locations.length;
    return { lat: avgLat, lng: avgLng };
  }, [locations]);

  return (
