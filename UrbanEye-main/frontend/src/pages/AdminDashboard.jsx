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
import ExportReports from '../components/ExportReports';
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
    
    // Search filter
    if (searchTerm) {
      result = result.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(c => c.status === statusFilter)
    }
    
    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(c => c.category === categoryFilter)
    }
    
    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date()
      const filterDate = new Date()
      
      switch (dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0)
          break
        case 'yesterday':
          filterDate.setDate(now.getDate() - 1)
          filterDate.setHours(0, 0, 0, 0)
          break
        case '7days':
          filterDate.setDate(now.getDate() - 7)
          break
        case '30days':
          filterDate.setDate(now.getDate() - 30)
          break
        default:
          break
      }
      
      if (dateRange !== 'all') {
        result = result.filter(c => new Date(c.createdAt) >= filterDate)
      }
    }
    
    setFilteredComplaints(result)
  }, [searchTerm, statusFilter, categoryFilter, dateRange, complaints])

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Loading Administration Portal</h3>
          <p className="text-slate-600">Please wait while we prepare your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Premium Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl blur-sm opacity-50"></div>
                <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-xl">
                  <Settings className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Administration Portal
                </h1>
                <p className="text-sm text-slate-600 font-medium mt-0.5">
                  {admin.fullName} • {admin.division} Division
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-3 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-emerald-700">System Active</span>
              </div>
              <Avatar className="h-10 w-10 border-2 border-white shadow-md">
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-sm font-semibold">
                  {admin?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full -mr-16 -mt-16"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">Total Reports</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {complaints.length}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">All submissions</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/10 to-orange-400/10 rounded-full -mr-16 -mt-16"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">Pending</p>
                  <p className="text-4xl font-bold text-amber-600">
                    {complaints.filter(c => c.status === 'Pending').length}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">Awaiting action</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full -mr-16 -mt-16"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">In Progress</p>
                  <p className="text-4xl font-bold text-blue-600">
                    {complaints.filter(c => c.status === 'In Progress').length}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">Being addressed</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/10 to-green-400/10 rounded-full -mr-16 -mt-16"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">Resolved</p>
                  <p className="text-4xl font-bold text-emerald-600">
                    {complaints.filter(c => c.status === 'Resolved').length}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">Successfully closed</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Premium Tabs */}
        <Tabs defaultValue="list" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 lg:w-[480px] bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm p-1.5 rounded-xl">
            <TabsTrigger 
              value="list" 
              className="flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 rounded-lg"
            >
              <List className="h-4 w-4 mr-2" />
              <span className="font-medium">List View</span>
            </TabsTrigger>
            <TabsTrigger 
              value="map" 
              className="flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 rounded-lg"
            >
              <MapIcon className="h-4 w-4 mr-2" />
              <span className="font-medium">Map View</span>
            </TabsTrigger>
            <TabsTrigger 
              value="export" 
              className="flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 rounded-lg"
            >
              <Download className="h-4 w-4 mr-2" />
              <span className="font-medium">Export</span>
            </TabsTrigger>
          </TabsList>

          {/* List View */}
          <TabsContent value="list" className="space-y-6">
            {/* Premium Filters */}
            <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Search by title, description, location, or category..."
                      className="pl-12 h-12 bg-slate-50 border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl text-slate-700"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[200px] h-12 bg-slate-50 border-slate-300 rounded-xl">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowFilters(!showFilters)}
                      className={`h-12 border-slate-300 rounded-xl transition-all duration-200 ${
                        showFilters 
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-600' 
                          : 'hover:bg-slate-50 hover:border-slate-400'
                      }`}
                    >
                      <FilterIcon className="h-4 w-4 mr-2" />
                      Advanced
                      {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
                    </Button>
                  </div>
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Category Filter</label>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                          <SelectTrigger className="h-12 bg-slate-50 border-slate-300 rounded-xl">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="Roads">Roads</SelectItem>
                            <SelectItem value="Street Lighting">Street Lighting</SelectItem>
                            <SelectItem value="Water Supply">Water Supply</SelectItem>
                            <SelectItem value="Drainage">Drainage</SelectItem>
                            <SelectItem value="Waste Management">Waste Management</SelectItem>
                            <SelectItem value="Public Transport">Public Transport</SelectItem>
                            <SelectItem value="Parks & Recreation">Parks & Recreation</SelectItem>
                            <SelectItem value="Traffic">Traffic</SelectItem>
                            <SelectItem value="Electricity">Electricity</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Date Range</label>
                        <Select value={dateRange} onValueChange={setDateRange}>
                          <SelectTrigger className="h-12 bg-slate-50 border-slate-300 rounded-xl">
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

            {/* Premium Complaints List */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
              </div>
            ) : filteredComplaints.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg">
                <CardContent className="p-16 text-center">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
                    <FileText className="h-12 w-12 text-slate-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">No Reports Found</h3>
                  <p className="text-slate-600 max-w-md mx-auto">
                    {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' || dateRange !== 'all'
                      ? 'No reports match your current filter criteria. Try adjusting your filters.'
                      : 'No civic issue reports have been submitted to your division yet.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredComplaints.map((complaint) => (
                  <Card
                    key={complaint.id || complaint._id}
                    className={`border border-slate-200 cursor-pointer hover:shadow-xl hover:border-indigo-300 transition-all duration-300 hover:-translate-y-1 bg-white ${
                      complaint.severity === 'Critical' ? 'border-l-4 border-l-red-500' : 
                      complaint.severity === 'High' ? 'border-l-4 border-l-orange-500' : ''
                    } ${
                      selectedComplaint?.id === complaint.id || selectedComplaint?._id === complaint._id
                        ? 'ring-2 ring-indigo-500 shadow-lg'
                        : ''
                    }`}
                    onClick={() => handleComplaintClick(complaint)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-xl font-bold text-slate-800 hover:text-indigo-600 transition-colors">
                              {complaint.title}
                            </h3>
                            <Badge 
                              className={`
                                ${complaint.status === 'Pending' ? 'bg-amber-100 text-amber-700 border-amber-300' : ''}
                                ${complaint.status === 'In Progress' ? 'bg-blue-100 text-blue-700 border-blue-300' : ''}
                                ${complaint.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : ''}
                                font-semibold px-3 py-1.5 text-sm flex items-center
                              `}
                            >
                              {complaint.status === 'Pending' && <Clock className="h-3.5 w-3.5 mr-1.5" />}
                              {complaint.status === 'In Progress' && <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />}
                              {complaint.status === 'Resolved' && <CheckCircle className="h-3.5 w-3.5 mr-1.5" />}
                              {complaint.status}
                            </Badge>
                          </div>
                          <p className="text-slate-600 mt-2 line-clamp-2 leading-relaxed">{complaint.description}</p>
                          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                            <div className="flex items-center text-slate-600">
                              <MapPin className="h-4 w-4 mr-1.5 text-slate-500" />
                              <span className="truncate max-w-xs">{complaint.location}</span>
                            </div>
                            <div className="flex items-center text-slate-600">
                              <Calendar className="h-4 w-4 mr-1.5 text-slate-500" />
                              <span>
                                {new Date(complaint.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                            {complaint.category && (
                              <Badge variant="outline" className="bg-slate-50 border-slate-300 text-slate-700">
                                {complaint.category}
                              </Badge>
                            )}
                            {complaint.mlAnalysis && complaint.mlAnalysis.mlServiceAvailable !== false && (
                              <Badge className={`${
                                complaint.mlAnalysis.detected 
                                  ? 'bg-purple-100 text-purple-700 border-purple-300' 
                                  : 'bg-blue-100 text-blue-700 border-blue-300'
                              }`}>
                                🤖 {complaint.mlAnalysis.detected ? 'AI Detected' : 'AI Scanned'}
                              </Badge>
                            )}
                            <Badge 
                              className={`
                                ${complaint.severity === 'Critical' ? 'bg-red-100 text-red-700 border-red-300' : ''}
                                ${complaint.severity === 'High' ? 'bg-orange-100 text-orange-700 border-orange-300' : ''}
                                ${complaint.severity === 'Medium' ? 'bg-amber-100 text-amber-700 border-amber-300' : ''}
                                ${complaint.severity === 'Low' ? 'bg-green-100 text-green-700 border-green-300' : ''}
                                font-semibold
                              `}
                            >
                              {complaint.severity}
                            </Badge>
                          </div>
                          {complaint.coordinates?.coordinates && (
                            <GpsLocationDisplay
                              coordinates={complaint.coordinates.coordinates}
                              getAddressFromCoordinates={getAddressFromCoordinates}
                            />
                          )}
                        </div>
                        {complaint.photo && (
                          <div className="ml-6 flex-shrink-0">
                            <div
                              className="relative group h-24 w-24 rounded-xl bg-slate-100 overflow-hidden border-2 border-slate-200 shadow-sm hover:shadow-md transition-all"
                              onClick={(e) => handleViewImage(complaint, e)}
                            >
                              <img
                                src={complaint.photo}
                                alt="Complaint"
                                className="h-full w-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      {admin && (
                        <div className="mt-4 pt-4 border-t border-slate-200 flex justify-end space-x-3">
                          {complaint.status !== 'In Progress' && complaint.status !== 'Resolved' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate(complaint.id || complaint._id, 'In Progress');
                              }}
                              disabled={isUpdating[complaint.id || complaint._id]}
                              className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
                            >
                              {isUpdating[complaint.id || complaint._id] ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              ) : (
                                <>
                                  <AlertTriangle className="h-4 w-4 mr-2" />
                                  Start Progress
                                </>
                              )}
                            </Button>
                          )}
                          {complaint.status !== 'Resolved' && (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate(complaint.id || complaint._id, 'Resolved');
                              }}
                              disabled={isUpdating[complaint.id || complaint._id]}
                              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                            >
                              {isUpdating[complaint.id || complaint._id] ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark Resolved
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Map View */}
          <TabsContent value="map" className="h-[calc(100vh-300px)]">
            <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg h-full overflow-hidden">
              <LocationMap
                complaints={filteredComplaints}
                selectedComplaint={selectedComplaint}
                onComplaintSelect={handleComplaintClick}
                className="h-full rounded-xl"
              />
            </Card>
          </TabsContent>

          {/* Export Reports */}
          <TabsContent value="export">
            <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg">
              <ExportReports 
                complaints={filteredComplaints}
                onExport={(data) => {
                  console.log('Export completed:', data);
                  showSuccessNotification('Export Successful', `Exported ${data.count} reports as ${data.format.toUpperCase()}`);
                }}
              />
            </Card>
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

      {/* Premium Image View Modal */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
          <div className="relative max-w-5xl max-h-[90vh] w-full">
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                <h3 className="text-xl font-bold text-slate-800 flex items-center">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg mr-3">
                    <ImageIcon className="h-5 w-5 text-white" />
                  </div>
                  Report Evidence Photo
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowImageModal(false)
                    setSelectedImage(null)
                  }}
                  className="h-10 w-10 p-0 hover:bg-slate-100 rounded-xl"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="p-6 bg-slate-50">
                <div className="bg-white rounded-xl overflow-hidden shadow-inner border border-slate-200">
                  <img
                    src={selectedImage}
                    alt="Complaint evidence"
                    className="w-full h-auto max-h-[70vh] object-contain"
                  />
                </div>
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
