import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { 
  X, 
  MapPin, 
  Clock, 
  User, 
  AlertTriangle,
  CheckCircle,
  FileText,
  Camera
} from 'lucide-react'

const ComplaintDetailModal = ({ complaint, isOpen, onClose, onStatusUpdate, isAdmin = false, isUpdating = false }) => {
  if (!isOpen || !complaint) return null

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
      onStatusUpdate(complaint.id, newStatus)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-xl text-civic-dark">{complaint.title}</CardTitle>
              <CardDescription className="text-civic-text mt-1">
                Complaint ID: #{complaint.id}
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
                      <span className="font-medium">User ID:</span>
                      <p className="text-sm">#{typeof complaint.userId === 'object' ? complaint.userId.id || complaint.userId._id : complaint.userId}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Photo */}
            {complaint.photo && (
              <div>
                <h3 className="text-lg font-semibold text-civic-dark mb-3 flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                  Attached Photo
                </h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <img 
                    src={complaint.photo} 
                    alt="Complaint evidence" 
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      console.error('Image load error in modal:', e)
                      e.target.style.display = 'none'
                    }}
                    onLoad={() => console.log('Image loaded successfully in modal for complaint:', complaint.id)}
                  />
                </div>
              </div>
            )}

            {/* Photo Button for Admin */}
            {isAdmin && complaint.photo && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Open photo in new tab/window
                    const newWindow = window.open('', '_blank')
                    if (newWindow) {
                    newWindow.document.write(`
                      <html>
                        <head><title>Complaint Photo - ${complaint.title}</title></head>
                        <body style="margin:0; padding:20px; background:#f5f5f5; display:flex; justify-content:center; align-items:center; min-height:100vh;">
                          <div style="max-width:90%; max-height:90%; text-align:center;">
                            <h2 style="margin-bottom:20px; color:#333;">${complaint.title}</h2>
                            <img src="${complaint.photo}" alt="Complaint evidence" style="max-width:100%; max-height:80vh; object-fit:contain; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.15);" />
                            <p style="margin-top:20px; color:#666; font-size:14px;">Complaint ID: ${complaint.id}</p>
                          </div>
                        </body>
                      </html>
                    `)
                      newWindow.document.close()
                    }
                  }}
                  className="w-full"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  View Full Photo
                </Button>
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
    </div>
  )
}

export default ComplaintDetailModal