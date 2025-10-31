import React, { useState, useEffect, lazy, Suspense, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Button } from '../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'

// Lazy load heavy components
const ComplaintDetailModal = lazy(() => import('../components/ComplaintDetailModal'))
const LocationMap = lazy(() => import('../components/LocationMap'))
const CameraCapture = lazy(() => import('../components/CameraCapture'))
import { showSuccessNotification, showErrorNotification } from '../components/NotificationSystem'
import {
  User,
  LogOut,
  MapPin,
  AlertTriangle,
  Clock,
  CheckCircle,
  FileText,
  Filter,
  Map,
  BarChart3,
  TrendingUp,
  Calendar,
  RefreshCw
} from 'lucide-react'

const UserDashboard = () => {
  const { user, logout, submitComplaint, getUserComplaints } = useAuth()
  const navigate = useNavigate()
  
  const [complaintForm, setComplaintForm] = useState({
    title: '',
    description: '',
    category: '',
    severity: '',
    location: ''
  })
  
  const [capturedPhoto, setCapturedPhoto] = useState(null)
  const [voiceRecording, setVoiceRecording] = useState(null)
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filter, setFilter] = useState('all')
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showMap, setShowMap] = useState(false)

  // Load user complaints on component mount
  useEffect(() => {
    const loadComplaints = async () => {
      if (user) {
        try {
          setLoading(true)
          console.log('Loading complaints for user:', user)
          const userComplaints = await getUserComplaints()
          console.log('Loaded complaints:', userComplaints)
          setComplaints(userComplaints)
        } catch (error) {
          console.error('Error loading complaints:', error)
        }
      }
      setLoading(false)
    }
    
    loadComplaints()
  }, [user, getUserComplaints])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setComplaintForm(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSelectChange = (name, value) => {
    setComplaintForm(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user makes a selection
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateComplaintForm = () => {
    const newErrors = {}
    
    if (!complaintForm.title.trim()) {
      newErrors.title = 'Title is required'
    }
    
    if (!complaintForm.description.trim()) {
      newErrors.description = 'Description is required'
    }
    
    if (!complaintForm.category) {
      newErrors.category = 'Category is required'
    }
    
    if (!complaintForm.severity) {
      newErrors.severity = 'Severity is required'
    }
    
    if (!complaintForm.location.trim()) {
      newErrors.location = 'Location is required'
    }
    
    return newErrors
  }

  const handleSubmitComplaint = async (e) => {
    e.preventDefault()
    
    const newErrors = validateComplaintForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Include photo data in the submission
      const formData = {
        ...complaintForm,
        photoData: capturedPhoto,
        voiceRecording: voiceRecording
      };
      
      const result = await submitComplaint(formData)
      
      if (result.success) {
        // Reset form and update complaints list
        setComplaintForm({
          title: '',
          description: '',
          category: '',
          severity: '',
          location: ''
        })
        setCapturedPhoto(null) // Reset photo
        setVoiceRecording(null) // Reset voice recording
        
        // Refresh complaints list
        const updatedComplaints = await getUserComplaints()
        setComplaints(updatedComplaints)
        
        // Clear errors
        setErrors({})
        
        // Show success notification
        showSuccessNotification('Complaint Submitted', 'Your complaint has been submitted successfully and will be reviewed by the relevant authorities.')
      } else {
        setErrors({ form: result.error || 'Failed to submit complaint. Please try again.' })
        showErrorNotification('Submission Failed', result.error || 'Failed to submit complaint. Please try again.')
      }
    } catch (error) {
      console.error('Submit complaint error:', error)
      setErrors({ form: 'An unexpected error occurred. Please try again.' })
      showErrorNotification('Unexpected Error', 'An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleComplaintClick = (complaint) => {
    setSelectedComplaint(complaint)
    setShowDetailModal(true)
  }

  const handleMapComplaintSelect = (complaint) => {
    setSelectedComplaint(complaint)
    setShowDetailModal(true)
  }

  const handlePhotoCapture = (photoData) => {
    setCapturedPhoto(photoData)
    
    // Auto-fill location if geo-location is available
    if (photoData.geoLocation && !complaintForm.location.trim()) {
      setComplaintForm(prev => ({
        ...prev,
        location: `Lat: ${photoData.geoLocation.latitude.toFixed(6)}, Lng: ${photoData.geoLocation.longitude.toFixed(6)}`
      }))
    }
  }

  const handleVoiceRecording = (recordingData) => {
    setVoiceRecording(recordingData)
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

  const filteredComplaints = useMemo(() => {
    return complaints.filter(complaint => {
      if (filter === 'all') return true
      return complaint.status === filter
    })
  }, [complaints, filter])

  const complaintCategories = [
    'Roads', 'Electricity', 'Water Supply', 'Waste Management',
    'Street Lighting', 'Public Transport', 'Parks & Recreation',
    'Building & Infrastructure', 'Health & Sanitation', 'Other'
  ]

  const severityLevels = ['Low', 'Medium', 'High', 'Critical']

  // Show loading spinner only for initial load
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-civic-bg via-white to-civic-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-civic-accent mx-auto mb-4"></div>
          <p className="text-civic-dark text-lg">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Show error if no user
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-civic-bg via-white to-civic-muted/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-civic-dark text-lg">Please log in to access your dashboard.</p>
          <Button onClick={() => navigate('/login')} className="mt-4">
            Go to Login
          </Button>
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
              <span className="text-2xl font-bold text-civic-dark">Urban Eye</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-civic-accent" />
                <span className="text-civic-dark">{user?.fullName}</span>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-civic-dark mb-2">Welcome, {user?.fullName}</h1>
          <p className="text-civic-text">Report civic issues and track their resolution status</p>
          
          {/* Quick Actions */}
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowMap(!showMap)}
              className="border-civic-accent text-civic-accent hover:bg-civic-accent hover:text-white"
            >
              <Map className="h-4 w-4 mr-2" />
              {showMap ? 'Hide Map' : 'Show Map'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const userComplaints = getUserComplaints()
                setComplaints(userComplaints)
              }}
              className="border-civic-accent text-civic-accent hover:bg-civic-accent hover:text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Dashboard Statistics */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="glass border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-civic-text">Total Issues</p>
                    <p className="text-2xl font-bold text-civic-dark">{complaints.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-civic-accent" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-civic-text">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {complaints.filter(c => c.status === 'Pending').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-civic-text">In Progress</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {complaints.filter(c => c.status === 'In Progress').length}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-civic-text">Resolved</p>
                    <p className="text-2xl font-bold text-green-600">
                      {complaints.filter(c => c.status === 'Resolved').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Location Map */}
        {showMap && (
          <div className="mb-8">
            <Suspense fallback={
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-civic-accent mx-auto mb-4"></div>
                <p className="text-civic-text">Loading map...</p>
              </div>
            }>
              <LocationMap
                complaints={complaints}
                selectedComplaint={selectedComplaint}
                onComplaintSelect={handleMapComplaintSelect}
              />
            </Suspense>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Complaint Submission Form */}
          <div className="xl:col-span-2">
            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle className="text-civic-dark">Report New Issue</CardTitle>
                <CardDescription>
                  Submit a new civic issue for resolution
                </CardDescription>
              </CardHeader>
              <CardContent>
                {errors.form && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                    {errors.form}
                  </div>
                )}
                
                <form onSubmit={handleSubmitComplaint} className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-civic-dark mb-1">
                      Issue Title
                    </label>
                    <Input
                      id="title"
                      name="title"
                      value={complaintForm.title}
                      onChange={handleInputChange}
                      className={errors.title ? 'border-red-500' : ''}
                      placeholder="Briefly describe the issue"
                    />
                    {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-civic-dark mb-1">
                      Description
                    </label>
                    <Textarea
                      id="description"
                      name="description"
                      value={complaintForm.description}
                      onChange={handleInputChange}
                      className={errors.description ? 'border-red-500' : ''}
                      placeholder="Provide detailed information about the issue"
                    />
                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-civic-dark mb-1">
                        Category
                      </label>
                      <Select 
                        name="category" 
                        value={complaintForm.category}
                        onValueChange={(value) => handleSelectChange('category', value)}
                      >
                        <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {complaintCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="severity" className="block text-sm font-medium text-civic-dark mb-1">
                        Severity
                      </label>
                      <Select 
                        name="severity" 
                        value={complaintForm.severity}
                        onValueChange={(value) => handleSelectChange('severity', value)}
                      >
                        <SelectTrigger className={errors.severity ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                        <SelectContent>
                          {severityLevels.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.severity && <p className="mt-1 text-sm text-red-600">{errors.severity}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-civic-dark mb-1">
                      Location
                    </label>
                    <div className="relative">
                      <Input
                        id="location"
                        name="location"
                        value={complaintForm.location}
                        onChange={handleInputChange}
                        className={`pl-10 ${errors.location ? 'border-red-500' : ''}`}
                        placeholder="Enter the location of the issue"
                      />
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-civic-text/50" />
                    </div>
                    {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-civic-accent hover:bg-civic-accent/90 text-white"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Issue'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Camera and Voice Recording */}
          <div className="xl:col-span-1">
            <Suspense fallback={
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-civic-accent mx-auto mb-4"></div>
                <p className="text-civic-text">Loading camera...</p>
              </div>
            }>
              <CameraCapture
                onPhotoCapture={handlePhotoCapture}
                onVoiceRecording={handleVoiceRecording}
              />
            </Suspense>
          </div>

        </div>

        {/* User Complaints List */}
        <div className="mt-8">
          <Card className="glass border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-civic-dark">My Issues</CardTitle>
                  <CardDescription>
                    Track the status of your reported issues
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-civic-text" />
                  <Select value={filter} onValueChange={setFilter}>
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
            </CardHeader>
            
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-civic-accent mx-auto mb-4"></div>
                  <p className="text-civic-text">Loading your issues...</p>
                </div>
              ) : filteredComplaints.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-civic-accent mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-civic-dark mb-2">No Issues Found</h3>
                  <p className="text-civic-text">
                    {filter !== 'all'
                      ? `No ${filter.toLowerCase()} issues found.`
                      : 'You haven\'t reported any issues yet. Submit your first issue above!'}
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
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-civic-dark">{complaint.title}</h3>
                            <p className="text-sm text-civic-text mt-1 line-clamp-2">
                              {complaint.description}
                            </p>
                            
                            <div className="flex items-center justify-between mt-3 text-sm">
                              <div className="flex items-center text-civic-text">
                                <span className="font-medium">Category:</span>
                                <span className="ml-1">{complaint.category}</span>
                              </div>
                              <div className="flex items-center text-civic-text">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>{complaint.location}</span>
                              </div>
                              <div className="flex items-center text-civic-text">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            
                            {complaint.photo && (
                              <div className="mt-3">
                                <img
                                  src={complaint.photo}
                                  alt="Issue photo"
                                  className="w-32 h-24 object-cover rounded-md border border-white/20"
                                />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col items-end space-y-2 ml-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityClass(complaint.severity)}`}>
                              {complaint.severity}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(complaint.status)}`}>
                              {complaint.status === 'Pending' && <Clock className="h-3 w-3 mr-1" />}
                              {complaint.status === 'In Progress' && <AlertTriangle className="h-3 w-3 mr-1" />}
                              {complaint.status === 'Resolved' && <CheckCircle className="h-3 w-3 mr-1" />}
                              {complaint.status}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Complaint Detail Modal */}
      <Suspense fallback={null}>
        <ComplaintDetailModal
          complaint={selectedComplaint}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedComplaint(null)
          }}
          isAdmin={false}
        />
      </Suspense>
    </div>
  )
}

export default UserDashboard
