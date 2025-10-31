import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Button } from './ui/button'
import { X, Navigation, MapPin } from 'lucide-react'

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const IntegratedMapModal = ({ isOpen, onClose, coordinates, complaintTitle, complaintLocation }) => {
  const [mapCenter, setMapCenter] = useState({ lat: 12.9716, lng: 77.5946 })
  const [gpsAddress, setGpsAddress] = useState(null)
  const [isGettingAddress, setIsGettingAddress] = useState(false)

  useEffect(() => {
    if (isOpen && coordinates && coordinates.length === 2) {
      const [lng, lat] = coordinates
      setMapCenter({ lat, lng })
      
      // Get address from coordinates
      getAddressFromCoordinates(lat, lng)
    }
  }, [isOpen, coordinates])

  const getAddressFromCoordinates = async (lat, lng) => {
    setIsGettingAddress(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      )
      const data = await response.json()
      
      if (data && data.display_name) {
        setGpsAddress(data.display_name)
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error)
    } finally {
      setIsGettingAddress(false)
    }
  }

  if (!isOpen || !coordinates) {
    return null
  }

  const [lng, lat] = coordinates

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-civic-accent" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Complaint Location</h3>
              <p className="text-sm text-gray-600">{complaintTitle}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Location Info */}
        <div className="p-4 bg-blue-50 border-b">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center text-sm text-gray-700">
                <Navigation className="h-4 w-4 mr-2 text-civic-accent" />
                <span className="font-medium">GPS Coordinates:</span>
              </div>
              <p className="text-sm text-gray-600 ml-6">
                Lat: {lat.toFixed(6)}, Lng: {lng.toFixed(6)}
              </p>
            </div>
            <div>
              <div className="flex items-center text-sm text-gray-700">
                <MapPin className="h-4 w-4 mr-2 text-civic-accent" />
                <span className="font-medium">Reported Location:</span>
              </div>
              <p className="text-sm text-gray-600 ml-6">{complaintLocation}</p>
            </div>
          </div>
          
          {gpsAddress && (
            <div className="mt-3">
              <div className="flex items-center text-sm text-gray-700">
                <MapPin className="h-4 w-4 mr-2 text-green-600" />
                <span className="font-medium">GPS Address:</span>
              </div>
              <p className="text-sm text-gray-600 ml-6">{gpsAddress}</p>
            </div>
          )}
          
          {isGettingAddress && (
            <div className="mt-3 text-blue-600 text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 inline-block mr-2"></div>
              Getting address from GPS coordinates...
            </div>
          )}
        </div>

        {/* Map */}
        <div className="h-96 w-full">
          <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={16}
            className="w-full h-full"
            style={{ zIndex: 1 }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            
            {/* GPS Location Marker */}
            <Marker position={[lat, lng]}>
              <Popup>
                <div className="text-center">
                  <h4 className="font-semibold text-sm mb-2">{complaintTitle}</h4>
                  <p className="text-xs text-gray-600 mb-2">GPS Location</p>
                  <p className="text-xs">
                    Lat: {lat.toFixed(6)}<br/>
                    Lng: {lng.toFixed(6)}
                  </p>
                  {gpsAddress && (
                    <p className="text-xs text-gray-500 mt-2">{gpsAddress}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Click and drag to explore the area around the complaint location
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`
                window.open(googleMapsUrl, '_blank')
              }}
            >
              Open in Google Maps
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IntegratedMapModal
