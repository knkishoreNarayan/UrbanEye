import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import ComplaintDetailModal from '../components/ComplaintDetailModal';
import LocationMap from '../components/LocationMap';
import { showSuccessNotification, showErrorNotification } from '../components/NotificationSystem';
import {
  User,
  LogOut,
  FileText,
  Filter,
  Search,
  AlertTriangle,
  Check,
  Map as MapIcon,
  MapPin,
  List,
  Eye,
  Image as ImageIcon,
  X,
  Navigation,
  Home,
  Users,
  Settings,
  BarChart3,
  Bell,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Filter as FilterIcon,
  Download,
  Plus,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

// GPS Location Display Component
const GpsLocationDisplay = ({ coordinates, getAddressFromCoordinates }) => {
  const [address, setAddress] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (coordinates && coordinates.length === 2) {
      const [lng, lat] = coordinates
      setIsLoading(true)
      getAddressFromCoordinates(lat, lng).then(addr => {
        setAddress(addr)
        setIsLoading(false)
      }).catch(() => {
        setIsLoading(false)
      })
    }
  }, [coordinates, getAddressFromCoordinates])

  return (
    <div className="text-xs text-green-600 mt-1">
      <div className="flex items-center">
        <Navigation className="h-3 w-3 mr-1" />
        <span>GPS: {coordinates[1].toFixed(4)}, {coordinates[0].toFixed(4)}</span>
      </div>
      {isLoading && (
        <div className="text-blue-600 text-xs mt-1">
          <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-blue-600 inline-block mr-1"></div>
          Getting address...
        </div>
      )}
      {address && (
        <div className="text-gray-600 text-xs mt-1 line-clamp-1">
          {address}
        </div>
      )}
    </div>
  )
}

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md p-8 text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Admin Access Required</CardTitle>
            <p className="text-gray-600">Please log in to access the admin dashboard</p>
          </CardHeader>
          <CardContent className="mt-4">
            <Button
              onClick={() => navigate('/admin-login')}
              className="bg-civic-accent text-white px-6 py-2 rounded-lg hover:bg-civic-accent/90"
            >
              Go to Admin Login
            </Button>
          </CardContent>
        </Card>
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
  const [addressCache, setAddressCache] = useState({})
  const [showFilters, setShowFilters] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [dateRange, setDateRange] = useState('all')

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

  // Reverse geocoding function with caching
  const getAddressFromCoordinates = useCallback(async (lat, lng) => {
    const key = `${lat.toFixed(4)},${lng.toFixed(4)}`
    
    // Check cache first
    if (addressCache[key]) {
      return addressCache[key]
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      )
      const data = await response.json()
      
      if (data && data.display_name) {
        const address = data.display_name
        // Cache the result
        setAddressCache(prev => ({ ...prev, [key]: address }))
        return address
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error)
    }
    return null
  }, [addressCache])

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-civic-accent mb-4"></div>
          <p className="text-civic-dark font-medium">Loading Admin Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Tabs */}
        <Tabs defaultValue="list" className="space-y-4">
          <TabsList>
            <TabsTrigger value="list" className="flex items-center">
              <List className="h-4 w-4 mr-2" />
              List View
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center">
              <MapIcon className="h-4 w-4 mr-2" />
              Map View
            </TabsTrigger>
          </TabsList>

          {/* List View */}
          <TabsContent value="list" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search complaints..."
                      className="pl-10 w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </div>
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="potholes">Potholes</SelectItem>
                            <SelectItem value="street-lights">Street Lights</SelectItem>
                            <SelectItem value="garbage">Garbage</SelectItem>
                            <SelectItem value="water">Water Issues</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                        <Select value={dateRange} onValueChange={setDateRange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select date range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="yesterday">Yesterday</SelectItem>
                            <SelectItem value="7days">Last 7 days</SelectItem>
                            <SelectItem value="30days">Last 30 days</SelectItem>
                            <SelectItem value="all">All Time</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Complaints List */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-civic-accent"></div>
              </div>
            ) : filteredComplaints.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No complaints found</h3>
                  <p className="text-gray-500 mt-1">
                    {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' || dateRange !== 'all'
                      ? 'Try adjusting your filters'
                      : 'No complaints have been submitted yet'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredComplaints.map((complaint) => (
                  <Card
                    key={complaint.id || complaint._id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedComplaint?.id === complaint.id || selectedComplaint?._id === complaint._id
                        ? 'ring-2 ring-civic-accent'
                        : ''
                    }`}
                    onClick={() => handleComplaintClick(complaint)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-base font-medium text-gray-900 truncate">{complaint.title}</h3>
                            <StatusBadge status={complaint.status} />
                          </div>
                          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{complaint.description}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span className="truncate max-w-xs">{complaint.location}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span>
                                {new Date(complaint.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                            {complaint.category && (
                              <div className="flex items-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {complaint.category}
                                </span>
                              </div>
                            )}
                          </div>
                          {complaint.coordinates?.coordinates && (
                            <GpsLocationDisplay
                              coordinates={complaint.coordinates.coordinates}
                              getAddressFromCoordinates={getAddressFromCoordinates}
                            />
                          )}
                        </div>
                        {complaint.photo && (
                          <div className="ml-4 flex-shrink-0">
                            <div
                              className="h-16 w-16 rounded-md bg-gray-100 overflow-hidden border border-gray-200"
                              onClick={(e) => handleViewImage(complaint, e)}
                            >
                              <img
                                src={complaint.photo}
                                alt="Complaint"
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      {admin && (
                        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end space-x-2">
                          {complaint.status !== 'In Progress' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate(complaint.id || complaint._id, 'In Progress');
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
                              e.stopPropagation();
                              handleStatusUpdate(complaint.id || complaint._id, 'Resolved');
                            }}
                            disabled={isUpdating[complaint.id || complaint._id]}
                          >
                            {isUpdating[complaint.id || complaint._id] ? '...' : <Check className="h-4 w-4" />}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Map View */}
          <TabsContent value="map" className="h-[calc(100vh-200px)]">
            <LocationMap
              complaints={filteredComplaints}
              selectedComplaint={selectedComplaint}
              onComplaintSelect={handleComplaintClick}
              className="h-full rounded-lg border border-gray-200"
            />
          </TabsContent>
        </Tabs>
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

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-800',
      icon: Clock,
      label: 'Pending'
    },
    'in-progress': {
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      icon: AlertTriangle,
      label: 'In Progress'
    },
    resolved: {
      bg: 'bg-green-50',
      text: 'text-green-800',
      icon: CheckCircle,
      label: 'Resolved'
    },
    default: {
      bg: 'bg-gray-50',
      text: 'text-gray-800',
      icon: AlertCircle,
      label: 'Unknown'
    }
  };

  const { bg, text, icon: Icon, label } = statusConfig[status] || statusConfig.default;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </span>
  );
};

export default AdminDashboard
