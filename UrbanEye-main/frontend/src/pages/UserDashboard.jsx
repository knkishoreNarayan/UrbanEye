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
import Chatbot from '../components/Chatbot/Chatbot'

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Premium Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl blur-sm opacity-50"></div>
                <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-xl">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  UrbanEye
                </span>
                <p className="text-xs text-slate-500 font-medium">Citizen Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
                <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-sm font-semibold">
                    {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-700">{user?.fullName}</p>
                  <p className="text-xs text-slate-500">Citizen</p>
                </div>
              </div>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Premium Tabs Navigation */}
        <Tabs defaultValue="dashboard" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 lg:w-[480px] bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm p-1.5 rounded-xl">
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 rounded-lg"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              <span className="font-medium">Overview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="submit" 
              className="flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 rounded-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="font-medium">New Report</span>
            </TabsTrigger>
            <TabsTrigger 
              value="complaints" 
              className="flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 rounded-lg"
            >
              <List className="h-4 w-4 mr-2" />
              <span className="font-medium">My Reports</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-8">
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-slate-800 mb-3">
                Welcome back, <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{user?.fullName?.split(' ')[0]}</span>
              </h1>
              <p className="text-slate-600 text-lg">Monitor and manage your civic issue reports</p>
            </div>

            {/* Premium Dashboard Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full -mr-16 -mt-16"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">Total Reports</p>
                      <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {complaints.length}
                      </p>
                      <p className="text-xs text-slate-500 mt-2">All time submissions</p>
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
                      <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">Pending Review</p>
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
                      <TrendingUp className="h-6 w-6 text-white" />
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



            {/* Recent Issues Preview */}
            <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-slate-800">Recent Activity</CardTitle>
                    <CardDescription className="text-slate-600 mt-1">
                      Your latest civic issue reports
                    </CardDescription>
                  </div>
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                      <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-slate-600 font-medium">Loading your reports...</p>
                  </div>
                ) : complaints.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center">
                      <FileText className="h-10 w-10 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No Reports Yet</h3>
                    <p className="text-slate-600 mb-6 max-w-md mx-auto">
                      Start making a difference in your community by reporting your first civic issue.
                    </p>
                    <Button
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      onClick={() => setActiveTab('submit')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Submit Your First Report
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {complaints.slice(0, 3).map((complaint) => (
                      <div 
                        key={complaint.id} 
                        className="group flex items-center justify-between p-4 bg-slate-50/50 hover:bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all duration-200 cursor-pointer"
                        onClick={() => {
                          setSelectedComplaint(complaint)
                          setShowDetailModal(true)
                        }}
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                            {complaint.title}
                          </h4>
                          <div className="flex items-center mt-2 text-sm text-slate-500">
                            <MapPin className="h-3.5 w-3.5 mr-1" />
                            <span>{complaint.location}</span>
                            <span className="mx-2">•</span>
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 ml-4">
                          <Badge 
                            variant={complaint.status === 'Resolved' ? 'default' : 'secondary'}
                            className={`
                              ${complaint.status === 'Pending' ? 'bg-amber-100 text-amber-700 border-amber-200' : ''}
                              ${complaint.status === 'In Progress' ? 'bg-blue-100 text-blue-700 border-blue-200' : ''}
                              ${complaint.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : ''}
                              font-medium px-3 py-1
                            `}
                          >
                            {complaint.status}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation()
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
                        className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-600 transition-all duration-200 mt-4"
                        onClick={() => setActiveTab('complaints')}
                      >
                        View All {complaints.length} Reports
                        <TrendingUp className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Submit Issue Tab */}
          <TabsContent value="submit" className="space-y-8">
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-slate-800 mb-3">Submit New Report</h1>
              <p className="text-slate-600 text-lg">Report a civic issue to help improve your community</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Complaint Submission Form */}
              <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-slate-800">Report Details</CardTitle>
                      <CardDescription className="text-slate-600 mt-1">
                        Provide comprehensive information about the issue
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {errors.form && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
                      {errors.form}
                    </div>
                  )}

                  <form onSubmit={handleSubmitComplaint} className="space-y-6">
                    <div>
                      <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">
                        Report Title
                      </label>
                      <Input
                        id="title"
                        name="title"
                        value={complaintForm.title}
                        onChange={handleInputChange}
                        className={`h-12 bg-slate-50 border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl ${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
                        placeholder="Brief, descriptive title of the issue"
                      />
                      {errors.title && <p className="mt-2 text-sm text-red-600 font-medium">{errors.title}</p>}
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">
                        Detailed Description
                      </label>
                      <Textarea
                        id="description"
                        name="description"
                        value={complaintForm.description}
                        onChange={handleInputChange}
                        className={`min-h-[120px] bg-slate-50 border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl ${errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
                        placeholder="Provide comprehensive details about the issue, including when it started and its impact"
                      />
                      {errors.description && <p className="mt-2 text-sm text-red-600 font-medium">{errors.description}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="category" className="block text-sm font-semibold text-slate-700 mb-2">
                          Issue Category
                        </label>
                        <Select
                          name="category"
                          value={complaintForm.category}
                          onValueChange={(value) => handleSelectChange('category', value)}
                        >
                          <SelectTrigger className={`h-12 bg-slate-50 border-slate-300 rounded-xl ${errors.category ? 'border-red-500' : ''}`}>
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
                        {errors.category && <p className="mt-2 text-sm text-red-600 font-medium">{errors.category}</p>}
                      </div>

                      <div>
                        <label htmlFor="severity" className="block text-sm font-semibold text-slate-700 mb-2">
                          Priority Level
                        </label>
                        <Select
                          name="severity"
                          value={complaintForm.severity}
                          onValueChange={(value) => handleSelectChange('severity', value)}
                        >
                          <SelectTrigger className={`h-12 bg-slate-50 border-slate-300 rounded-xl ${errors.severity ? 'border-red-500' : ''}`}>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            {severityLevels.map((level) => (
                              <SelectItem key={level} value={level}>
                                {level}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.severity && <p className="mt-2 text-sm text-red-600 font-medium">{errors.severity}</p>}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="location" className="block text-sm font-semibold text-slate-700 mb-2">
                        Location Address
                      </label>
                      <div className="relative">
                        <Input
                          id="location"
                          name="location"
                          value={complaintForm.location}
                          onChange={handleInputChange}
                          className={`pl-12 h-12 bg-slate-50 border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl ${errors.location ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
                          placeholder="Enter the specific location or address"
                        />
                        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                      </div>
                      {errors.location && <p className="mt-2 text-sm text-red-600 font-medium">{errors.location}</p>}

                      {/* GPS Location Section */}
                      <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-slate-700 flex items-center">
                            <Navigation className="h-4 w-4 mr-2 text-indigo-600" />
                            GPS Coordinates
                          </span>
                          <div className="flex space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={getCurrentLocation}
                              disabled={isGettingLocation}
                              className="text-xs h-8 border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600"
                            >
                              {isGettingLocation ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-indigo-600 mr-1.5"></div>
                                  Locating...
                                </>
                              ) : (
                                <>
                                  <Navigation className="h-3 w-3 mr-1.5" />
                                  Capture GPS
                                </>
                              )}
                            </Button>
                            {gpsLocation && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={clearLocation}
                                className="text-xs h-8 text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                              >
                                <X className="h-3 w-3 mr-1" />
                                Clear
                              </Button>
                            )}
                          </div>
                        </div>

                        {gpsLocation ? (
                          <div className="text-xs bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
                            <div className="flex items-center text-emerald-700 font-semibold mb-2">
                              <CheckCircle className="h-4 w-4 mr-1.5" />
                              <span>GPS Location Captured Successfully</span>
                            </div>
                            <div className="text-slate-700 space-y-2">
                              <div>
                                <div className="font-semibold text-slate-800">Coordinates:</div>
                                <div className="font-mono text-xs bg-white px-2 py-1 rounded mt-1">
                                  {gpsLocation.lat.toFixed(6)}, {gpsLocation.lng.toFixed(6)}
                                </div>
                              </div>
                              {gpsAddress && (
                                <div>
                                  <div className="font-semibold text-slate-800">Resolved Address:</div>
                                  <div className="text-xs bg-white px-2 py-1 rounded mt-1">
                                    {gpsAddress}
                                  </div>
                                </div>
                              )}
                              {isGettingAddress && (
                                <div className="text-blue-600 flex items-center">
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1.5"></div>
                                  Resolving address...
                                </div>
                              )}
                            </div>
                          </div>
                        ) : gpsError ? (
                          <div className="text-xs text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg font-medium">
                            {gpsError}
                          </div>
                        ) : (
                          <div className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                            Click "Capture GPS" to automatically record your current location coordinates
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting Report...
                        </>
                      ) : (
                        <>
                          <Plus className="h-5 w-5 mr-2" />
                          Submit Report
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Photo Capture Section */}
              <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                      <Camera className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-slate-800 flex items-center">
                        Photo Evidence
                        <span className="text-red-500 ml-2 text-sm">*Required</span>
                      </CardTitle>
                      <CardDescription className="text-slate-600 mt-1">
                        Capture visual documentation of the issue
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {photoConfirmed ? (
                    <div className="space-y-5">
                      <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                        Photo confirmed and ready for submission
                      </div>
                      <div className="relative w-full aspect-video bg-slate-100 rounded-xl overflow-hidden border-2 border-emerald-200 shadow-lg">
                        <img
                          src={capturedPhoto?.dataUrl}
                          alt="Captured photo preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 right-3 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                          Confirmed
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleRetakePhoto}
                          className="border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Retake Photo
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="relative w-full aspect-video bg-slate-100 rounded-xl overflow-hidden border-2 border-slate-200 shadow-inner">
                        {isCameraActive && !capturedPhoto ? (
                          <>
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
                            <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center animate-pulse">
                              <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                              Live
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-center p-6">
                            <div className="w-20 h-20 mb-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center">
                              <Camera className="h-10 w-10 text-indigo-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Photo Required</h3>
                            <p className="text-slate-600 mb-6 max-w-xs">
                              Visual evidence is required for all civic issue reports
                            </p>
                            <Button 
                              type="button" 
                              onClick={startCamera}
                              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                              <Camera className="h-5 w-5 mr-2" />
                              Activate Camera
                            </Button>
                          </div>
                        )}
                      </div>

                      {isCameraActive && !capturedPhoto && (
                        <div className="flex justify-center">
                          <Button 
                            type="button" 
                            onClick={capturePhoto}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8"
                          >
                            <Camera className="h-5 w-5 mr-2" />
                            Capture Photo
                          </Button>
                        </div>
                      )}

                      {capturedPhoto && !photoConfirmed && (
                        <div className="space-y-4">
                          <div className="relative w-full aspect-video bg-slate-100 rounded-xl overflow-hidden border-2 border-slate-200 shadow-lg">
                            <img
                              src={capturedPhoto.dataUrl}
                              alt="Captured photo preview"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-3 right-3 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                              Preview
                            </div>
                          </div>
                          <div className="flex justify-center space-x-3">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={retakePhoto}
                              className="border-slate-300 hover:border-slate-400 hover:bg-slate-50"
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Retake
                            </Button>
                            <Button
                              type="button"
                              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                              onClick={confirmPhoto}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Confirm Photo
                            </Button>
                          </div>
                        </div>
                      )}

                      {cameraError && (
                        <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-4 rounded-xl text-center font-medium">
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
          <TabsContent value="complaints" className="space-y-8">
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-slate-800 mb-3">My Reports</h1>
              <p className="text-slate-600 text-lg">Track and manage all your submitted civic issue reports</p>
            </div>

            {/* Premium Search and Filter */}
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
                    <Select value={filter} onValueChange={setFilter}>
                      <SelectTrigger className="w-[200px] h-12 bg-slate-50 border-slate-300 rounded-xl">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Reports</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Premium Issues List */}
            <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg">
              <CardContent className="p-6">
                {loading ? (
                  <div className="text-center py-16">
                    <div className="relative w-16 h-16 mx-auto mb-6">
                      <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-slate-600 font-medium text-lg">Loading your reports...</p>
                  </div>
                ) : searchedComplaints.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
                      <FileText className="h-12 w-12 text-slate-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-3">
                      {searchTerm || filter !== 'all' ? 'No Reports Found' : 'No Reports Yet'}
                    </h3>
                    <p className="text-slate-600 mb-6 max-w-md mx-auto">
                      {searchTerm || filter !== 'all'
                        ? `No reports match your search criteria. Try adjusting your filters.`
                        : 'You haven\'t submitted any civic issue reports yet. Start making a difference today!'}
                    </p>
                    {!searchTerm && filter === 'all' && (
                      <Button
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        onClick={() => setActiveTab('submit')}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Submit Your First Report
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {searchedComplaints.map((complaint) => (
                      <Card
                        key={complaint.id}
                        className="border border-slate-200 cursor-pointer hover:shadow-xl hover:border-indigo-300 transition-all duration-300 hover:-translate-y-1 bg-white"
                        onClick={() => handleComplaintClick(complaint)}
                      >
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-3">
                                <h3 className="text-xl font-bold text-slate-800 hover:text-indigo-600 transition-colors">
                                  {complaint.title}
                                </h3>
                              </div>
                              <p className="text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                                {complaint.description}
                              </p>

                              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                                <div className="flex items-center text-slate-600">
                                  <span className="font-semibold text-slate-700 mr-2">Category:</span>
                                  <Badge variant="outline" className="bg-slate-50 border-slate-300 text-slate-700">
                                    {complaint.category}
                                  </Badge>
                                </div>
                                <div className="flex items-center text-slate-600">
                                  <MapPin className="h-4 w-4 mr-1.5 text-slate-500" />
                                  <span>{complaint.location}</span>
                                </div>
                                <div className="flex items-center text-slate-600">
                                  <Calendar className="h-4 w-4 mr-1.5 text-slate-500" />
                                  <span>{new Date(complaint.createdAt).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 mt-4">
                                {complaint.photo && (
                                  <div className="relative group">
                                    <img
                                      src={complaint.photo}
                                      alt="Issue photo"
                                      className="w-32 h-24 object-cover rounded-lg border-2 border-slate-200 shadow-sm group-hover:shadow-md transition-shadow"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors flex items-center justify-center">
                                      <ImageIcon className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                  </div>
                                )}

                                {complaint.coordinates && complaint.coordinates.coordinates && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => handleViewOnMap(complaint, e)}
                                    className="border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                                  >
                                    <Map className="h-4 w-4 mr-2" />
                                    View Location
                                  </Button>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col items-end space-y-3 ml-6">
                              <Badge 
                                className={`
                                  ${complaint.severity === 'Critical' ? 'bg-red-100 text-red-700 border-red-300' : ''}
                                  ${complaint.severity === 'High' ? 'bg-orange-100 text-orange-700 border-orange-300' : ''}
                                  ${complaint.severity === 'Medium' ? 'bg-amber-100 text-amber-700 border-amber-300' : ''}
                                  ${complaint.severity === 'Low' ? 'bg-green-100 text-green-700 border-green-300' : ''}
                                  font-semibold px-3 py-1.5 text-sm
                                `}
                              >
                                {complaint.severity}
                              </Badge>
                              <Badge 
                                className={`
                                  ${complaint.status === 'Pending' ? 'bg-amber-100 text-amber-700 border-amber-300' : ''}
                                  ${complaint.status === 'In Progress' ? 'bg-blue-100 text-blue-700 border-blue-300' : ''}
                                  ${complaint.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : ''}
                                  font-semibold px-3 py-1.5 text-sm flex items-center
                                `}
                              >
                                {complaint.status === 'Pending' && <Clock className="h-3.5 w-3.5 mr-1.5" />}
                                {complaint.status === 'In Progress' && <TrendingUp className="h-3.5 w-3.5 mr-1.5" />}
                                {complaint.status === 'Resolved' && <CheckCircle className="h-3.5 w-3.5 mr-1.5" />}
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

      {/* Chatbot */}
      <Chatbot />
    </div>
  )
}

export default UserDashboard

