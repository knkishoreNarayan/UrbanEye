import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import ComplaintDetailModal from '../components/ComplaintDetailModal'
import LocationMap from '../components/LocationMap'
import { showSuccessNotification, showErrorNotification } from '../components/NotificationSystem'
import {
  User,
  LogOut,
  FileText,
  Filter,
  Search,
  AlertTriangle,
  Check,
  Map as MapIcon,
  List,
  Eye,
  Image as ImageIcon,
  X
} from 'lucide-react'

const AdminDashboard = () => {
  const {
    admin,
    logout,
    getAdminComplaints,
    updateComplaintStatus,
    getAdmins,
  } = useAuth()
  const navigate = useNavigate()

  // Debug logging
  console.log('AdminDashboard - admin:', admin)
  
  // If no admin, show a message instead of blank page
  if (!admin) {
    console.log('No admin found, showing login message')
    return (
      <div className="min-h-screen bg-gradient-to-br from-civic-bg via-white to-civic-muted/20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-civic-dark mb-4">Admin Access Required</h2>
          <p className="text-civic-text mb-6">Please log in as an admin to access this dashboard.</p>
          <button 
            onClick={() => navigate('/admin-login')}
            className="bg-civic-accent text-white px-6 py-2 rounded-lg hover:bg-civic-accent/90"
          >
            Go to Admin Login
          </button>
        </div>
      </div>
    )
  }


  const [complaints, setComplaints] = useState([])
  const [filteredComplaints, setFilteredComplaints] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isUpdating, setIsUpdating] = useState({})
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [activeTab, setActiveTab] = useState('list') // "list" or "map"
  const [loading, setLoading] = useState(true)

  // Debug logging after state declarations
  console.log('AdminDashboard - showDetailModal:', showDetailModal)
  console.log('AdminDashboard - selectedComplaint:', selectedComplaint)

  useEffect(() => {
    // Check if admin is logged in, if not redirect to login
    if (!admin) {
      console.log('No admin found, redirecting to admin login')
      navigate('/admin-login')
      return
    }

    const fetchComplaints = async () => {
      try {
        setLoading(true)
        console.log('Fetching complaints for division:', admin.division)
        const res = await fetch(`http://localhost:4000/api/complaints?division=${admin.division}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('urbanEyeToken')}`
          }
        })
        const data = await res.json()
        console.log('Complaints fetched:', data)
        console.log('First complaint structure:', data.complaints?.[0])
        setComplaints(data.complaints || [])
        setFilteredComplaints(data.complaints || [])
      } catch (err) {
        console.error('Failed to fetch complaints:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchComplaints()
    getAdmins() // keeping admins in case you use them later
  }, [admin, getAdmins, navigate])

  useEffect(() => {
    let result = complaints
    if (searchTerm) {
      result = result.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (statusFilter !== 'all') {
      result = result.filter(c => c.status === statusFilter)
    }
    setFilteredComplaints(result)
  }, [searchTerm, statusFilter, complaints])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleStatusUpdate = async (complaintId, newStatus) => {
    setIsUpdating(prev => ({ ...prev, [complaintId]: true }))
    try {
      const result = await updateComplaintStatus(complaintId, newStatus)
      if (result.success) {
        const updatedComplaints = getAdminComplaints()
        setComplaints(updatedComplaints)
        showSuccessNotification('Status Updated', `Complaint status updated to ${newStatus}`)
      } else {
        showErrorNotification('Update Failed', result.error || 'Failed to update complaint status')
      }
    } catch (error) {
      showErrorNotification('Update Error', 'An unexpected error occurred while updating the status')
    } finally {
      setIsUpdating(prev => ({ ...prev, [complaintId]: false }))
    }
  }

  const handleComplaintClick = (complaint) => {
    console.log('Complaint clicked:', complaint)
    setSelectedComplaint(complaint)
    setShowDetailModal(true)
  }


  const handleModalStatusUpdate = async (complaintId, newStatus) => {
    await handleStatusUpdate(complaintId, newStatus)
    const updatedComplaints = getAdminComplaints()
    const updatedComplaint = updatedComplaints.find(c => c.id === complaintId)
    setSelectedComplaint(updatedComplaint)
  }

  const handleViewImage = (complaint, event) => {
    event.stopPropagation()
    if (complaint.photo) {
      setSelectedImage(complaint.photo)
      setShowImageModal(true)
    }
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

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-civic-bg via-white to-civic-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-civic-accent mb-4"></div>
          <p className="text-civic-dark font-medium">Loading Admin Dashboard...</p>
        </div>
      </div>
    )
  }

  
  return (
    <div className="min-h-screen bg-gradient-to-br from-civic-bg via-white to-civic-muted/20">
      {/* Header */}
      <header className="glass border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-civic-accent" />
              <span className="text-2xl font-bold text-civic-dark">Urban Eye Admin</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-civic-accent" />
                <span className="text-civic-dark">{admin?.fullName || 'Admin'} ({admin?.division || 'Unknown'})</span>
              </div>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="border-civic-accent text-civic-accent hover:bg-civic-accent hover:text-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex space-x-4">
        <Button 
          variant={activeTab === 'list' ? 'default' : 'outline'} 
          onClick={() => setActiveTab('list')}
        >
          <List className="h-4 w-4 mr-2" /> List View
        </Button>
        <Button 
          variant={activeTab === 'map' ? 'default' : 'outline'} 
          onClick={() => setActiveTab('map')}
        >
          <MapIcon className="h-4 w-4 mr-2" /> Map View
        </Button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Complaint List View */}
        {activeTab === 'list' && (
          <Card className="glass border-white/20">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-civic-dark">Issue Management</CardTitle>
                  <CardDescription>
                    Manage and update status of civic issues in your division
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-civic-text/50" />
                    <Input
                      type="text"
                      placeholder="Search issues..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 text-civic-text mr-2" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {filteredComplaints.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-civic-accent mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-civic-dark mb-2">No Issues Found</h3>
                  <p className="text-civic-text">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'No issues match your search criteria.' 
                      : 'There are no issues in your division at this time.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredComplaints.map((complaint) => {
                    // Debug: log each complaint to see its structure
                    console.log('Rendering complaint:', complaint)
                    return (
                    <Card
                      key={complaint.id || complaint._id}
                      className="border-white/20 cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleComplaintClick(complaint)}
                    >
                      <CardContent className="p-4 flex justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-civic-dark">{complaint.title || 'Untitled'}</h3>
                          <p className="text-sm text-civic-text mt-1 line-clamp-2">{complaint.description || 'No description'}</p>
                          <p className="text-xs text-civic-text mt-1">Category: {complaint.category || 'Uncategorized'}</p>
                          <p className="text-xs text-civic-text mt-1">User: {complaint.userId?.fullName || complaint.userId?.email || complaint.userId?._id || 'N/A'}</p>
                          <p className="text-xs text-civic-text mt-1">Location: {complaint.location || 'Unknown'}</p>
                          {complaint.photo && (
                            <div className="mt-2 relative group">
                              <img 
                                src={complaint.photo} 
                                alt="Issue Photo" 
                                className="max-h-32 w-full object-cover rounded shadow-sm"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded flex items-center justify-center">
                                <Button 
                                  size="sm"
                                  variant="secondary"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 hover:bg-white text-gray-800"
                                  onClick={(e) => handleViewImage(complaint, e)}
                                >
                                  <Eye className="h-4 w-4 mr-1" /> View Image
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityClass(complaint.severity)}`}>
                            {complaint.severity}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusClass(complaint.status)}`}>
                            {complaint.status}
                          </span>
                          {complaint.status !== 'Resolved' && (
                            <div className="flex space-x-1 mt-2">
                              {complaint.status !== 'In Progress' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleStatusUpdate(complaint.id || complaint._id, 'In Progress')
                                  }}
                                  disabled={isUpdating[complaint.id || complaint._id]}
                                >
                                  {isUpdating[complaint.id || complaint._id] ? '...' : 'Start'}
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="default"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleStatusUpdate(complaint.id || complaint._id, 'Resolved')
                                }}
                                disabled={isUpdating[complaint.id || complaint._id]}
                              >
                                {isUpdating[complaint.id || complaint._id] ? '...' : <Check className="h-4 w-4" />}
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Map View */}
        {activeTab === 'map' && (
          <LocationMap
            complaints={filteredComplaints}
            selectedComplaint={selectedComplaint}
            onComplaintSelect={setSelectedComplaint}
            className="shadow-lg"
          />
        )}
      </main>

      {/* Complaint Detail Modal */}
      <ComplaintDetailModal
        complaint={selectedComplaint}
        isOpen={showDetailModal}
        onClose={() => {
          console.log('Closing modal')
          setShowDetailModal(false)
          setSelectedComplaint(null)
        }}
        onStatusUpdate={handleModalStatusUpdate}
        isAdmin={true}
        isUpdating={selectedComplaint ? isUpdating[selectedComplaint.id || selectedComplaint._id] : false}
      />

      {/* Image View Modal */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4">
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <ImageIcon className="h-5 w-5 mr-2" />
                  Complaint Photo
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowImageModal(false)
                    setSelectedImage(null)
                  }}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-4">
                <img
                  src={selectedImage}
                  alt="Complaint evidence"
                  className="w-full h-auto max-h-[70vh] object-contain rounded"
                />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default AdminDashboard
