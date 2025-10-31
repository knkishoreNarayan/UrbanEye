import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { MapPin, Navigation, Maximize2, Minimize2, CheckCircle, AlertTriangle, Clock, Search } from 'lucide-react';
import { Input } from './ui/input';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Convert location name → coordinates using Nominatim API
const geocodeLocation = async (location) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`
    );
    const data = await response.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch (error) {
    console.error('Geocoding failed:', error);
  }
  // fallback to Bengaluru center
  return { lat: 12.9716, lng: 77.5946 };
};

const LocationMap = ({ complaints = [], selectedComplaint, onComplaintSelect, className = '' }) => {
  const [mapCenter, setMapCenter] = useState({ lat: 12.9716, lng: 77.5946 });
  const [markers, setMarkers] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const processMarkers = async () => {
      const markerList = await Promise.all(
        complaints.map(async (c) => {
          // Prefer GPS coordinates from database
          if (c.coordinates && c.coordinates.coordinates && c.coordinates.coordinates.length === 2) {
            const [lng, lat] = c.coordinates.coordinates;
            return { ...c, position: { lat, lng } };
          }
          // Prefer user-provided position field
          if (c.position && typeof c.position.lat === 'number' && typeof c.position.lng === 'number') {
            return { ...c, position: c.position };
          }
          // Or use lat/lng fields if present
          if (typeof c.lat === 'number' && typeof c.lng === 'number') {
            return { ...c, position: { lat: c.lat, lng: c.lng } };
          }
          // Otherwise, geocode from textual location
          if (c.location) {
            const pos = await geocodeLocation(c.location);
            return { ...c, position: pos };
          }
          // Fallback to Bengaluru center if nothing else available
          return { ...c, position: { lat: 12.9716, lng: 77.5946 } };
        })
      );
      setMarkers(markerList);

      if (markerList.length > 0) {
        setMapCenter(markerList[markerList.length - 1].position);
      }
    };
    processMarkers();
  }, [complaints]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          setMapCenter(loc);
        },
        (err) => console.error('Error getting location:', err)
      );
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const loc = await geocodeLocation(searchQuery);
    setMapCenter(loc);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Resolved':
        return <CheckCircle className="h-3 w-3" />;
      case 'In Progress':
        return <AlertTriangle className="h-3 w-3" />;
      case 'Pending':
        return <Clock className="h-3 w-3" />;
      default:
        return <MapPin className="h-3 w-3" />;
    }
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''} ${className}`}>
      <Card className={`glass border-white/20 ${isFullscreen ? 'h-full rounded-none' : ''}`}>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-civic-dark flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Complaint Locations
            </CardTitle>
            <CardDescription>
              Interactive map showing complaint locations and status
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={getCurrentLocation}>
              <Navigation className="h-4 w-4 mr-1" />
              My Location
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className={`${isFullscreen ? 'h-full pb-4' : ''}`}>
          <div className="flex space-x-2 mb-4">
            <Input
              placeholder="Search for a location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div
            className={`relative rounded-lg overflow-hidden ${
              isFullscreen ? 'h-full' : 'h-96'
            }`}
          >
            <MapContainer
              center={[mapCenter.lat, mapCenter.lng]}
              zoom={13}
              className="w-full h-full"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />

              {markers.map((m) => (
                <Marker key={m.id} position={[m.position.lat, m.position.lng]}>
                  <Popup>
                    <div>
                      <h3 className="font-semibold text-sm">{m.title}</h3>
                      <p className="text-xs">Status: {m.status}</p>
                      <p className="text-xs">Priority: {m.severity}</p>
                      <Button
                        size="sm"
                        className="mt-1 text-xs"
                        onClick={() => onComplaintSelect(m)}
                      >
                        View Details
                      </Button>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {userLocation && (
                <Marker position={[userLocation.lat, userLocation.lng]}>
                  <Popup>Your Location</Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationMap;
