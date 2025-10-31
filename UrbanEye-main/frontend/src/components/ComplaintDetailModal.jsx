import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import IntegratedMapModal from './IntegratedMapModal'
import { 
  X, 
  MapPin, 
  Clock, 
  User, 
  AlertTriangle,
  CheckCircle,
  FileText,
  Camera,
  Eye,
  Navigation,
  Map
} from 'lucide-react'

const ComplaintDetailModal = ({ complaint, isOpen, onClose, onStatusUpdate, isAdmin = false, isUpdating = false }) => {
  console.log('ComplaintDetailModal - isOpen:', isOpen, 'complaint:', complaint, 'isAdmin:', isAdmin)
  
  // All hooks must be called before any conditional returns
  const [gpsAddress, setGpsAddress] = useState(null)
  const [isGettingAddress, setIsGettingAddress] = useState(false)
  const [showMapModal, setShowMapModal] = useState(false)

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

  // Get address from GPS coordinates when modal opens
  useEffect(() => {
    if (isOpen && complaint?.coordinates?.coordinates && complaint.coordinates.coordinates.length === 2) {
      const [lng, lat] = complaint.coordinates.coordinates
      getAddressFromCoordinates(lat, lng)
    }
  }, [isOpen, complaint])
  
  // Early return after all hooks
  if (!isOpen || !complaint) {
    console.log('ComplaintDetailModal - Not rendering (isOpen:', isOpen, 'complaint:', !!complaint, ')')
    return null
  }

  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'Low': return 'severity-low'
      case 'Medium': return 'severity-medium'
      case 'High': return 'severity-high'
      case 'Critical': return 'severity-critical'
      default: return ''
    }
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending': return 'status-pending'
      case 'In Progress': return 'status-in-progress'
      case 'Resolved': return 'status-resolved'
      default: return ''
    }
  }

  const handleStatusUpdate = (newStatus) => {
    if (onStatusUpdate) {
      onStatusUpdate(complaint.id || complaint._id, newStatus)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-xl text-civic-dark">{complaint.title}</CardTitle>
              <CardDescription className="text-civic-text mt-1">
                Complaint ID: #{complaint.id || complaint._id}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Status and Severity Badges */}
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSeverityClass(complaint.severity)}`}>
                <AlertTriangle className="h-4 w-4 mr-1" />
                {complaint.severity} Priority
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(complaint.status)}`}>
                {complaint.status === 'Pending' && <Clock className="h-4 w-4 mr-1" />}
                {complaint.status === 'In Progress' && <AlertTriangle className="h-4 w-4 mr-1" />}
                {complaint.status === 'Resolved' && <CheckCircle className="h-4 w-4 mr-1" />}
                {complaint.status}
              </span>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-civic-dark mb-2 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Description
              </h3>
              <p className="text-civic-text leading-relaxed">{complaint.description}</p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center text-civic-text">
                  <MapPin className="h-4 w-4 mr-2 text-civic-accent" />
                  <div>
                    <span className="font-medium">Location:</span>
                    <p className="text-sm">{complaint.location}</p>
                  </div>
                </div>
                
                {/* GPS Coordinates Display */}
                {complaint.coordinates && complaint.coordinates.coordinates && (
                  <div className="flex items-start text-civic-text">
                    <Navigation className="h-4 w-4 mr-2 text-civic-accent mt-0.5" />
                    <div>
                      <span className="font-medium">GPS Location:</span>
                      <p className="text-sm">
                        Lat: {complaint.coordinates.coordinates[1].toFixed(6)}, 
                        Lng: {complaint.coordinates.coordinates[0].toFixed(6)}
                      </p>
                      {gpsAddress && (
                        <div className="mt-1">
                          <span className="font-medium text-xs">Address:</span>
                          <p className="text-xs text-gray-600 mt-1">{gpsAddress}</p>
                        </div>
                      )}
                      {isGettingAddress && (
                        <div className="text-blue-600 mt-1 text-xs">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 inline-block mr-1"></div>
                          Getting address...
                        </div>
                      )}
                      <div className="mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-6 px-2"
                          onClick={() => setShowMapModal(true)}
                        >
                          <Map className="h-3 w-3 mr-1" />
                          View on Map
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center text-civic-text">
                  <FileText className="h-4 w-4 mr-2 text-civic-accent" />
                  <div>
                    <span className="font-medium">Category:</span>
                    <p className="text-sm">{complaint.category}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-civic-text">
                  <Clock className="h-4 w-4 mr-2 text-civic-accent" />
                  <div>
                    <span className="font-medium">Reported:</span>
                    <p className="text-sm">{new Date(complaint.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                
                {isAdmin && (
                  <div className="flex items-center text-civic-text">
                    <User className="h-4 w-4 mr-2 text-civic-accent" />
                    <div>
                      <span className="font-medium">User:</span>
                      <p className="text-sm">{complaint.userId?.fullName || complaint.userId?.email || complaint.userId?._id || 'Unknown'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Photo */}
            {complaint.photo && (
              <div>
                <h3 className="text-lg font-semibold text-civic-dark flex items-center mb-3">
                  <Camera className="h-5 w-5 mr-2" />
                  Attached Photo
                </h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <img 
                    src={complaint.photo} 
                    alt="Complaint evidence" 
                    className="w-full h-64 object-cover"
                  />
                </div>
              </div>
            )}

            {/* Admin Actions */}
            {isAdmin && complaint.status !== 'Resolved' && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-civic-dark mb-3">Admin Actions</h3>
                <div className="flex gap-2">
                  {complaint.status !== 'In Progress' && (
                    <Button
                      onClick={() => handleStatusUpdate('In Progress')}
                      disabled={isUpdating}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isUpdating ? 'Updating...' : 'Start Progress'}
                    </Button>
                  )}
                  <Button
                    onClick={() => handleStatusUpdate('Resolved')}
                    disabled={isUpdating}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isUpdating ? 'Updating...' : 'Mark Resolved'}
                  </Button>
                </div>
              </div>
            )}

            {/* Close Button */}
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integrated Map Modal */}
      <IntegratedMapModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        coordinates={complaint?.coordinates?.coordinates}
        complaintTitle={complaint?.title}
        complaintLocation={complaint?.location}
      />
    </div>
  )
}

export default ComplaintDetailModal