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
  Camera
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

  console.log('AdminDashboard render - admin:', admin ? 'present' : 'null')

  const [complaints, setComplaints] = useState([])
  const [filteredComplaints, setFilteredComplaints] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isUpdating, setIsUpdating] = useState({})
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [activeTab, setActiveTab] = useState('list') // "list" or "map"

  useEffect(() => {
    console.log('AdminDashboard useEffect - admin:', admin ? 'present' : 'null')
    if (!admin) {
      console.log('AdminDashboard: No admin data, returning early')
      return
    }

    const fetchComplaints = async () => {
      try {
        console.log('AdminDashboard: Fetching complaints for division:', admin.division)
        const complaintsData = await getAdminComplaints()
        console.log('AdminDashboard: Complaints fetched, count:', complaintsData?.length || 0)
        setComplaints(complaintsData || [])
        setFilteredComplaints(complaintsData || [])
      } catch (err) {
        console.error('Failed to fetch complaints:', err)
      }
    }

    fetchComplaints()
    getAdmins() // keeping admins in case you use them later
  }, [admin, getAdmins, getAdminComplaints])

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
        const updatedComplaints = await getAdminComplaints()
        setComplaints(updatedComplaints)
        setFilteredComplaints(updatedComplaints)
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
    setSelectedComplaint(complaint)
    setShowDetailModal(true)
  }

  const handleModalStatusUpdate = async (complaintId, newStatus) => {
    await handleStatusUpdate(complaintId, newStatus)
    const updatedComplaints = await getAdminComplaints()
    const updatedComplaint = updatedComplaints.find(c => c.id === complaintId)
    setSelectedComplaint(updatedComplaint)
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

  // Show loading if admin data is not available
  if (!admin) {
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
                <span className="text-civic-dark">{admin?.fullName} ({admin?.division})</span>
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
                  {filteredComplaints.map((complaint) => (
                    <Card
                      key={complaint.id}
                      className="border-white/20 cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleComplaintClick(complaint)}
                    >
                      <CardContent className="p-4 flex justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-civic-dark">{complaint.title}</h3>
                          <p className="text-sm text-civic-text mt-1 line-clamp-2">{complaint.description}</p>
                          <p className="text-xs text-civic-text mt-1">Category: {complaint.category}</p>
                          <p className="text-xs text-civic-text mt-1">User: {typeof complaint.userId === 'object' ? (complaint.userId.fullName || complaint.userId.email || complaint.userId.id || 'Unknown') : complaint.userId}</p>
                          <p className="text-xs text-civic-text mt-1">Location: {complaint.location}</p>
                          {complaint.photo && (
                            <div className="mt-2">
                              <div className="relative">
                                <img
                                  src={complaint.photo}
                                  alt="Issue Photo"
                                  className="max-h-40 w-full object-contain rounded shadow-sm border border-gray-200"
                                  onError={(e) => {
                                    console.error('Image load error for complaint:', complaint.id, 'Photo data:', complaint.photo?.substring(0, 50) + '...')
                                    e.target.style.display = 'none'
                                    // Show fallback message
                                    const fallback = document.createElement('div')
                                    fallback.className = 'max-h-40 w-full flex items-center justify-center bg-gray-100 rounded border border-gray-200 text-gray-600 text-sm'
                                    fallback.innerHTML = '📷 Photo available - Click "View Photo" to see it'
                                    e.target.parentNode.appendChild(fallback)
                                  }}
                                  onLoad={() => console.log('Image loaded successfully for complaint:', complaint.id)}
                                />
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="mt-2 w-full"
                                onClick={(e) => {
                                  e.stopPropagation()
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
                              >
                                <Camera className="h-3 w-3 mr-1" />
                                View Photo
                              </Button>
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
                                    handleStatusUpdate(complaint.id, 'In Progress')
                                  }}
                                  disabled={isUpdating[complaint.id]}
                                >
                                  {isUpdating[complaint.id] ? '...' : 'Start'}
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="default"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleStatusUpdate(complaint.id, 'Resolved')
                                }}
                                disabled={isUpdating[complaint.id]}
                              >
                                {isUpdating[complaint.id] ? '...' : <Check className="h-4 w-4" />}
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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
          setShowDetailModal(false)
          setSelectedComplaint(null)
        }}
        onStatusUpdate={handleModalStatusUpdate}
        isAdmin={true}
        isUpdating={selectedComplaint ? isUpdating[selectedComplaint.id] : false}
      />
    </div>
  )
}

export default AdminDashboard
