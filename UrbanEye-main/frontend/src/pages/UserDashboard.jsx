import React, { useState, useEffect, lazy, Suspense, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Button } from '../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Badge } from '../components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'

// Lazy load heavy components
const ComplaintDetailModal = lazy(() => import('../components/ComplaintDetailModal'))
const LocationMap = lazy(() => import('../components/LocationMap'))
const IntegratedMapModal = lazy(() => import('../components/IntegratedMapModal'))
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
  RefreshCw,
  Camera,
  RotateCcw,
  Navigation,
  Search,
  Plus,
  Eye,
  Image as ImageIcon,
  X,
  List
} from 'lucide-react'

const UserDashboard = () => {
  const { user, logout, submitComplaint, getUserComplaints } = useAuth()
  const navigate = useNavigate()
  
  const [complaintForm, setComplaintForm] = useState({
    title: '',
    description: '',
    category: '',
    severity: '',
    location: '',
    coordinates: null
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
  const [photoConfirmed, setPhotoConfirmed] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [gpsLocation, setGpsLocation] = useState(null)
  const [gpsError, setGpsError] = useState(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [gpsAddress, setGpsAddress] = useState(null)
  const [isGettingAddress, setIsGettingAddress] = useState(false)
  const [showMapModal, setShowMapModal] = useState(false)
  const [selectedComplaintForMap, setSelectedComplaintForMap] = useState(null)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard') // 'dashboard', 'complaints', 'submit'

  // Camera refs
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  // If no user, redirect to login
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-civic-bg via-white to-civic-muted/20 flex items-center justify-center">
        <Card className="w-full max-w-md p-8 text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">User Access Required</CardTitle>
            <p className="text-gray-600">Please log in to access your dashboard</p>
          </CardHeader>
          <CardContent className="mt-4">
            <Button
              onClick={() => navigate('/login')}
              className="bg-civic-accent text-white px-6 py-2 rounded-lg hover:bg-civic-accent/90"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Load user complaints on component mount
  useEffect(() => {
    const fetchUserComplaints = async () => {
      if (user) {
        try {
          setLoading(true)
          console.log('Fetching complaints for user ID:', user.id)
          console.log('Auth token:', localStorage.getItem('urbanEyeToken'))

          const response = await fetch(`http://localhost:4000/api/complaints?userId=${user.id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('urbanEyeToken')}`
            }
          })

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          const data = await response.json()
          console.log('Fetched user complaints:', data)
          setComplaints(data.complaints || [])
        } catch (error) {
          console.error('Error loading complaints:', error)
          // Fallback to localStorage if API fails
          try {
            const userComplaints = getUserComplaints()
            setComplaints(userComplaints)
          } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError)
          }
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    fetchUserComplaints()
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
    
    if (!photoConfirmed) {
      newErrors.photo = 'Photo is required - please capture and confirm a photo'
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
      // Include photo and voice recording in the submission
      const formData = {
        ...complaintForm,
        coordinates: complaintForm.coordinates ? JSON.stringify(complaintForm.coordinates) : null,
        photo: capturedPhoto?.blob || null,
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
          location: '',
          coordinates: null
        })
        setCapturedPhoto(null) // Reset photo
        setPhotoConfirmed(false) // Reset photo confirmation
        setVoiceRecording(null) // Reset voice recording
        setGpsLocation(null) // Reset GPS location
        setGpsAddress(null) // Reset GPS address
        setGpsError(null) // Reset GPS error
        
        // Refresh complaints list from API
        try {
          const response = await fetch(`http://localhost:4000/api/complaints?userId=${user.id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('urbanEyeToken')}`
            }
          })
          const data = await response.json()
          setComplaints(data.complaints || [])
        } catch (error) {
          console.error('Error refreshing complaints after submission:', error)
        }
        
        // Clear errors
        setErrors({})
        
        // Show success notification
        showSuccessNotification('Complaint Submitted', 'Your complaint has been submitted successfully and will be reviewed by the relevant authorities.')
      } else {
        setErrors({ form: result.error || 'Failed to submit complaint. Please try again.' })
        showErrorNotification('Submission Failed', result.error || 'Failed to submit complaint. Please try again.')
      }
    } catch (error) {
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

  const handleViewOnMap = (complaint, event) => {
    event.stopPropagation()
    setSelectedComplaintForMap(complaint)
    setShowMapModal(true)
  }

  const handleMapComplaintSelect = (complaint) => {
    setSelectedComplaint(complaint)
    setShowDetailModal(true)
  }


  const handleVoiceRecording = (recordingData) => {
    setVoiceRecording(recordingData)
  }

  const handleRetakePhoto = () => {
    setCapturedPhoto(null)
    setPhotoConfirmed(false)
  }

  // Camera functions
  const startCamera = async () => {
    try {
      console.log('Starting camera...')
      setCameraError(null)
      if (streamRef.current) stopCamera()

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      })

      console.log('Camera stream obtained:', stream)
      streamRef.current = stream
      setIsCameraActive(true)

      // The video element will be set up by the ref callback
    } catch (error) {
      console.error('Camera error:', error)
      setCameraError('Unable to access camera. Please check browser permissions and HTTPS.')
      setIsCameraActive(false)
    }
  }

  const stopCamera = () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      if (videoRef.current) {
        try { videoRef.current.pause() } catch {}
        videoRef.current.srcObject = null
      }
    } finally {
      setIsCameraActive(false)
    }
  }

  const capturePhoto = () => {
    console.log('Capture photo called')
    const video = videoRef.current
    const canvas = canvasRef.current
    console.log('Video element:', video)
    console.log('Canvas element:', canvas)
    
    if (!video || !canvas) {
      console.log('Missing video or canvas element')
      return
    }

    if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
      console.log('Video not ready:', { readyState: video.readyState, width: video.videoWidth, height: video.videoHeight })
      setCameraError('Video not ready yet. Please try again in a moment.')
      return
    }

    const context = canvas.getContext('2d')
    if (!context) {
      setCameraError('Could not get canvas context.')
      return
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob((blob) => {
      if (!blob) {
        setCameraError('Failed to create image blob.')
        return
      }

      const file = new File([blob], "complaint.jpg", { type: "image/jpeg" })
      const photoData = {
        blob,
        file,
        dataUrl: canvas.toDataURL('image/jpeg', 0.8),
        timestamp: new Date().toISOString()
      }
      console.log('Photo captured successfully:', photoData)
      setCapturedPhoto(photoData)
      stopCamera()
    }, 'image/jpeg', 0.8)
  }

  const retakePhoto = () => {
    setCapturedPhoto(null)
    setCameraError(null)
    startCamera()
  }

  const confirmPhoto = () => {
    if (capturedPhoto) {
      setPhotoConfirmed(true)
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.photo
        return newErrors
      })
    }
  }

  // GPS Location Functions
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by this browser.')
      return
    }

    setIsGettingLocation(true)
    setGpsError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setGpsLocation(coords)
        setComplaintForm(prev => ({
          ...prev,
          coordinates: coords
        }))
        setIsGettingLocation(false)
        
        // Get address from coordinates
        const address = await getAddressFromCoordinates(coords.lat, coords.lng)
        if (address) {
          showSuccessNotification('Location Captured', `GPS location and address captured successfully!`)
        } else {
          showSuccessNotification('Location Captured', 'GPS location captured successfully!')
        }
      },
      (error) => {
        let errorMessage = 'Failed to get location: '
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location access denied by user.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information unavailable.'
            break
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.'
            break
          default:
            errorMessage += 'Unknown error occurred.'
            break
        }
        setGpsError(errorMessage)
        setIsGettingLocation(false)
        showErrorNotification('Location Error', errorMessage)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  }

  const clearLocation = () => {
    setGpsLocation(null)
    setGpsAddress(null)
    setComplaintForm(prev => ({
      ...prev,
      coordinates: null
    }))
    setGpsError(null)
  }

  // Reverse Geocoding Function
  const getAddressFromCoordinates = async (lat, lng) => {
    setIsGettingAddress(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      )
      const data = await response.json()
      
      if (data && data.display_name) {
        const address = data.display_name
        setGpsAddress(address)
        return address
      } else {
        throw new Error('No address found for these coordinates')
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error)
      setGpsAddress(null)
      return null
    } finally {
      setIsGettingAddress(false)
    }
  }

  // Cleanup camera on unmount
  useEffect(() => {
    return () => stopCamera()
  }, [])

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

  const searchedComplaints = useMemo(() => {
    return filteredComplaints.filter(complaint => {
      if (!searchTerm) return true
      return (
        complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })
  }, [filteredComplaints, searchTerm])

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
        {/* Tabs Navigation */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="dashboard" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="submit" className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Submit Issue
            </TabsTrigger>
            <TabsTrigger value="complaints" className="flex items-center">
              <List className="h-4 w-4 mr-2" />
              My Issues
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-civic-dark mb-2">Welcome, {user?.fullName}</h1>
              <p className="text-civic-text">Track your civic issues and their resolution status</p>
            </div>

            {/* Dashboard Statistics */}
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

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setActiveTab('submit')}
                className="border-civic-accent text-civic-accent hover:bg-civic-accent hover:text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Submit New Issue
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveTab('complaints')}
                className="border-civic-accent text-civic-accent hover:bg-civic-accent hover:text-white"
              >
                <List className="h-4 w-4 mr-2" />
                View My Issues
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  if (user) {
                    try {
                      console.log('Refreshing complaints for user:', user.id)
                      const response = await fetch(`http://localhost:4000/api/complaints?userId=${user.id}`, {
                        headers: {
                          Authorization: `Bearer ${localStorage.getItem('urbanEyeToken')}`
                        }
                      })
                      const data = await response.json()
                      console.log('Refreshed complaints:', data)
                      setComplaints(data.complaints || [])
                    } catch (error) {
                      console.error('Error refreshing complaints:', error)
                      showErrorNotification('Refresh Failed', 'Failed to refresh complaints. Please try again.')
                    }
                  }
                }}
                className="border-civic-accent text-civic-accent hover:bg-civic-accent hover:text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {/* Recent Issues Preview */}
            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle className="text-civic-dark">Recent Issues</CardTitle>
                <CardDescription>
                  Your latest reported issues
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-civic-accent mx-auto mb-4"></div>
                    <p className="text-civic-text">Loading your issues...</p>
                  </div>
                ) : complaints.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-civic-accent mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-civic-dark mb-2">No Issues Found</h3>
                    <p className="text-civic-text">You haven't reported any issues yet.</p>
                    <Button
                      className="mt-4 bg-civic-accent hover:bg-civic-accent/90 text-white"
                      onClick={() => setActiveTab('submit')}
                    >
                      Submit Your First Issue
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {complaints.slice(0, 3).map((complaint) => (
                      <div key={complaint.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-civic-dark">{complaint.title}</h4>
                          <p className="text-sm text-civic-text">{complaint.location}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={complaint.status === 'Resolved' ? 'default' : 'secondary'}>
                            {complaint.status}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedComplaint(complaint)
                              setShowDetailModal(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {complaints.length > 3 && (
                      <Button
                        variant="outline"
                        className="w-full border-civic-accent text-civic-accent hover:bg-civic-accent hover:text-white"
                        onClick={() => setActiveTab('complaints')}
                      >
                        View All {complaints.length} Issues
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Submit Issue Tab */}
          <TabsContent value="submit" className="space-y-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-civic-dark mb-2">Submit New Issue</h1>
              <p className="text-civic-text">Report a civic issue for resolution</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Complaint Submission Form */}
              <Card className="glass border-white/20">
                <CardHeader>
                  <CardTitle className="text-civic-dark">Issue Details</CardTitle>
                  <CardDescription>
                    Provide detailed information about the civic issue
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

                      {/* GPS Location Section */}
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-civic-dark">GPS Location</span>
                          <div className="flex space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={getCurrentLocation}
                              disabled={isGettingLocation}
                              className="text-xs"
                            >
                              {isGettingLocation ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-civic-accent mr-1"></div>
                                  Getting...
                                </>
                              ) : (
                                <>
                                  <Navigation className="h-3 w-3 mr-1" />
                                  Get GPS
                                </>
                              )}
                            </Button>
                            {gpsLocation && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={clearLocation}
                                className="text-xs text-red-600 hover:text-red-700"
                              >
                                Clear
                              </Button>
                            )}
                          </div>
                        </div>

                        {gpsLocation ? (
                          <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                            <div className="flex items-center">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              <span>GPS Location Captured</span>
                            </div>
                            <div className="mt-1 text-gray-600">
                              <div className="font-medium">Coordinates:</div>
                              <div>Lat: {gpsLocation.lat.toFixed(6)}, Lng: {gpsLocation.lng.toFixed(6)}</div>
                              {gpsAddress && (
                                <>
                                  <div className="font-medium mt-2">Address:</div>
                                  <div className="text-xs">{gpsAddress}</div>
                                </>
                              )}
                              {isGettingAddress && (
                                <div className="text-blue-600 mt-1">
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 inline-block mr-1"></div>
                                  Getting address...
                                </div>
                              )}
                            </div>
                          </div>
                        ) : gpsError ? (
                          <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                            {gpsError}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500">
                            Click "Get GPS" to automatically capture your current location
                          </div>
                        )}
                      </div>
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

              {/* Photo Capture Section */}
              <Card className="glass border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    Attach Photo
                    <span className="text-red-500 ml-1">*</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {photoConfirmed ? (
                    <div className="space-y-4">
                      <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Photo confirmed and ready for submission
                      </div>
                      <div className="relative w-full aspect-video bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={capturedPhoto?.dataUrl}
                          alt="Captured photo preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex justify-center space-x-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleRetakePhoto}
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Retake Photo
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative w-full aspect-video bg-gray-200 rounded-lg overflow-hidden">
                        {isCameraActive && !capturedPhoto ? (
                          <video
                            ref={(node) => {
                              console.log('Video ref callback called with node:', node)
                              videoRef.current = node
                              if (node && streamRef.current) {
                                console.log('Setting up video element with stream')
                                node.srcObject = streamRef.current
                                node.muted = true
                                node.playsInline = true
                                node.play().catch(err => {
                                  console.error("Video play error:", err)
                                })
                              }
                            }}
                            autoPlay
                            playsInline
                            muted
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-center p-4">
                            <Camera className="h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-gray-600 mb-4">Photo is required for complaint submission</p>
                            <Button type="button" onClick={startCamera}>
                              <Camera className="h-5 w-5 mr-2" />
                              Start Camera
                            </Button>
                          </div>
                        )}
                      </div>

                      {isCameraActive && !capturedPhoto && (
                        <div className="flex justify-center">
                          <Button type="button" onClick={capturePhoto}>
                            <Camera className="h-5 w-5 mr-2" />
                            Capture Photo
                          </Button>
                        </div>
                      )}

                      {capturedPhoto && !photoConfirmed && (
                        <div className="space-y-3">
                          <div className="relative w-full aspect-video bg-gray-200 rounded-lg overflow-hidden">
                            <img
                              src={capturedPhoto.dataUrl}
                              alt="Captured photo preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex justify-center space-x-3">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={retakePhoto}
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Retake
                            </Button>
                            <Button
                              type="button"
                              className="bg-green-600 text-white"
                              onClick={confirmPhoto}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Use Photo
                            </Button>
                          </div>
                        </div>
                      )}

                      {cameraError && (
                        <div className="text-sm text-red-600 text-center">
                          {cameraError}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Hidden canvas for photo capture */}
                  <canvas ref={canvasRef} className="hidden" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* My Issues Tab */}
          <TabsContent value="complaints" className="space-y-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-civic-dark mb-2">My Issues</h1>
              <p className="text-civic-text">Track the status of your reported issues</p>
            </div>

            {/* Search and Filter */}
            <Card className="glass border-white/20">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search your issues..."
                      className="pl-10 w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={filter} onValueChange={setFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Issues</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Issues List */}
            <Card className="glass border-white/20">
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-civic-accent mx-auto mb-4"></div>
                    <p className="text-civic-text">Loading your issues...</p>
                  </div>
                ) : searchedComplaints.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-civic-accent mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-civic-dark mb-2">
                      {searchTerm || filter !== 'all' ? 'No Issues Found' : 'No Issues Yet'}
                    </h3>
                    <p className="text-civic-text">
                      {searchTerm || filter !== 'all'
                        ? `No issues match your search criteria.`
                        : 'You haven\'t reported any issues yet. Submit your first issue!'}
                    </p>
                    {!searchTerm && filter === 'all' && (
                      <Button
                        className="mt-4 bg-civic-accent hover:bg-civic-accent/90 text-white"
                        onClick={() => setActiveTab('submit')}
                      >
                        Submit Your First Issue
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {searchedComplaints.map((complaint) => (
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
                                  <Badge variant="outline" className="ml-2">
                                    {complaint.category}
                                  </Badge>
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

                              {complaint.coordinates && complaint.coordinates.coordinates && (
                                <div className="mt-3">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => handleViewOnMap(complaint, e)}
                                    className="text-xs h-6 px-2"
                                  >
                                    <Map className="h-3 w-3 mr-1" />
                                    View on Map
                                  </Button>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col items-end space-y-2 ml-4">
                              <Badge variant={complaint.severity === 'Critical' ? 'destructive' : 'default'}>
                                {complaint.severity}
                              </Badge>
                              <Badge variant={
                                complaint.status === 'Resolved' ? 'default' :
                                complaint.status === 'In Progress' ? 'secondary' : 'outline'
                              }>
                                {complaint.status === 'Pending' && <Clock className="h-3 w-3 mr-1" />}
                                {complaint.status === 'In Progress' && <AlertTriangle className="h-3 w-3 mr-1" />}
                                {complaint.status === 'Resolved' && <CheckCircle className="h-3 w-3 mr-1" />}
                                {complaint.status}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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

      {/* Integrated Map Modal */}
      <Suspense fallback={null}>
        <IntegratedMapModal
          isOpen={showMapModal}
          onClose={() => {
            setShowMapModal(false)
            setSelectedComplaintForMap(null)
          }}
          coordinates={selectedComplaintForMap?.coordinates?.coordinates}
          complaintTitle={selectedComplaintForMap?.title}
          complaintLocation={selectedComplaintForMap?.location}
        />
      </Suspense>
    </div>
  )
}

export default UserDashboard

