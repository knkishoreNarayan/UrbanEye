import React, { createContext, useContext, useState, useEffect } from 'react'
import dataService from '../services/dataService'
import apiService from '../services/apiService'

const AuthContext = createContext()

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  console.log('AuthProvider rendered - user:', !!user, 'admin:', !!admin, 'loading:', loading)

  // Track admin state changes
  useEffect(() => {
    console.log('AuthProvider: Admin state changed to:', admin)
  }, [admin])

  // Load saved session from localStorage
  useEffect(() => {
    try {
      console.log('AuthProvider: Loading saved session from localStorage')
      const savedUser = localStorage.getItem('urbanEyeUser')
      const savedAdmin = localStorage.getItem('urbanEyeAdmin')

      console.log('AuthProvider: Saved data - user:', !!savedUser, 'admin:', !!savedAdmin)

      if (savedUser) {
        console.log('AuthProvider: Found saved user:', JSON.parse(savedUser))
        setUser(JSON.parse(savedUser))
      }
      if (savedAdmin) {
        console.log('AuthProvider: Found saved admin:', JSON.parse(savedAdmin))
        setAdmin(JSON.parse(savedAdmin))
      }

      setLoading(false)
      console.log('AuthProvider: Loading complete - user:', !!savedUser, 'admin:', !!savedAdmin)
    } catch (error) {
      console.error('AuthProvider: Error loading saved session:', error)
      setLoading(false)
    }
  }, [])

  // User login
  const loginUser = async (email, password) => {
    try {
      const { user: apiUser, token } = await apiService.login({ email, password, role: 'user' })
      setUser(apiUser)
      localStorage.setItem('urbanEyeUser', JSON.stringify(apiUser))
      localStorage.setItem('urbanEyeToken', token)
      return { success: true, user: apiUser }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error.message || 'Invalid credentials' }
    }
  }

  // Admin login
  const loginAdmin = async (email, password, division) => {
    try {
      console.log('AuthContext: Attempting admin login', { email, division })
      const { user: apiAdmin, token } = await apiService.login({ email, password, role: 'admin' })
      console.log('AuthContext: API response received', { apiAdmin, hasToken: !!token })
      
      if (division && apiAdmin.division !== division) {
        console.log('AuthContext: Division mismatch', { expected: division, actual: apiAdmin.division })
        return { success: false, error: 'Invalid credentials or division' }
      }
      
      console.log('AuthContext: Setting admin state with:', apiAdmin)
      console.log('AuthContext: Admin data structure:', {
        id: apiAdmin.id,
        fullName: apiAdmin.fullName,
        email: apiAdmin.email,
        role: apiAdmin.role,
        division: apiAdmin.division,
        isActive: apiAdmin.isActive
      })
      setAdmin(apiAdmin)
      localStorage.setItem('urbanEyeAdmin', JSON.stringify(apiAdmin))
      localStorage.setItem('urbanEyeToken', token)
      console.log('AuthContext: Admin login successful, admin state set')
      return { success: true, admin: apiAdmin }
    } catch (error) {
      console.error('AuthContext: Admin login error', error)
      return { success: false, error: error.message || 'Invalid credentials or division' }
    }
  }

  // User signup
  const signupUser = async (userData) => {
    try {
      const { user: apiUser, token } = await apiService.signup({ ...userData, role: 'user' })
      // Don't automatically log in after signup - user needs to login separately
      return { success: true, user: apiUser }
    } catch (error) {
      console.error('Signup error:', error)
      return { success: false, error: error.message || 'Signup failed' }
    }
  }

  // Logout
  const logout = () => {
    setUser(null)
    setAdmin(null)
    localStorage.removeItem('urbanEyeUser')
    localStorage.removeItem('urbanEyeAdmin')
    localStorage.removeItem('urbanEyeToken')
  }

  // Submit complaint
  const submitComplaint = async (complaintData) => {
    try {
      console.log('SubmitComplaint - Received data:', {
        hasPhotoData: !!complaintData.photoData,
        photoDataType: typeof complaintData.photoData,
        photoDataKeys: complaintData.photoData ? Object.keys(complaintData.photoData) : null
      })

      const payload = {
        title: complaintData.title,
        description: complaintData.description,
        category: complaintData.category,
        severity: complaintData.severity,
        location: complaintData.location,
        division: getDivisionFromLocation(complaintData.location),
      }

      // Handle photo data properly
      let file = null
      if (complaintData.photoData?.file) {
        console.log('Using photoData.file')
        file = complaintData.photoData.file
      } else if (complaintData.photoData?.blob) {
        console.log('Creating file from photoData.blob')
        file = new File([complaintData.photoData.blob], "complaint.jpg", { type: "image/jpeg" })
      } else if (complaintData.photo) {
        console.log('Using complaintData.photo')
        file = complaintData.photo
      } else {
        console.log('No photo data found')
      }

      console.log('File to send:', {
        hasFile: !!file,
        fileType: typeof file,
        fileName: file?.name,
        fileSize: file?.size
      })

      const { complaint } = await apiService.createComplaint(payload, file)

      return { success: true, complaint }
    } catch (error) {
      console.error('Submit complaint error:', error)
      return { success: false, error: error.message || 'Failed to submit complaint' }
    }
  }

  // Get complaints for logged-in user
  const getUserComplaints = async () => {
    if (!user) return []
    try {
      return await dataService.getComplaintsByUserId(user.id)
    } catch (error) {
      console.error('Error fetching user complaints:', error)
      return []
    }
  }

  // Get complaints for logged-in admin
  const getAdminComplaints = async () => {
    if (!admin) return []
    try {
      return await dataService.getComplaintsByDivision(admin.division)
    } catch (error) {
      console.error('Error fetching admin complaints:', error)
      return []
    }
  }

  // Update complaint status
  const updateComplaintStatus = async (complaintId, newStatus) => {
    try {
      await apiService.updateComplaintStatus(complaintId, { status: newStatus })
      const updatedComplaint = dataService.updateComplaintStatus(complaintId, newStatus)
      if (updatedComplaint) {
        return { success: true, complaint: updatedComplaint }
      }
      return { success: true }
    } catch {
      return { success: false, error: 'Failed to update status' }
    }
  }

  // Admin management
  const addAdmin = (adminData) => dataService.addAdmin(adminData)
  const updateAdmin = (adminData) => dataService.updateAdmin(adminData.id, adminData)
  const deleteAdmin = (adminId) => dataService.deleteAdmin(adminId)
  const getAdmins = () => dataService.getAdmins()

  // Complaint data functions
  const getAllComplaints = () => dataService.getComplaints()
  const searchComplaints = (query, filters) => dataService.searchComplaints(query, filters)
  const getComplaintStats = () => dataService.getComplaintStats()

  // Helper: Get division from location
  const getDivisionFromLocation = (location) => {
    const locationDivisionMap = {
      koramangala: 'Koramangala',
      btm: 'BTM Layout',
      hsr: 'HSR Layout',
      indiranagar: 'Indiranagar',
      whitefield: 'Whitefield',
      marathahalli: 'Marathahalli',
      jayanagar: 'Jayanagar',
      'electronic city': 'Electronic City',
      hebbal: 'Hebbal',
      yelahanka: 'Yelahanka',
    }

    const locationLower = location.toLowerCase()
    for (const [key, division] of Object.entries(locationDivisionMap)) {
      if (locationLower.includes(key)) {
        return division
      }
    }
    return 'General'
  }

  // Context value
  const value = {
    user,
    admin,
    loading,
    loginUser,
    loginAdmin,
    signupUser,
    logout,
    submitComplaint,
    getUserComplaints,
    getAdminComplaints,
    updateComplaintStatus,
    addAdmin,
    updateAdmin,
    deleteAdmin,
    getAdmins,
    getAllComplaints,
    searchComplaints,
    getComplaintStats,
    dataService,
  }

  console.log('AuthProvider render - loading:', loading, 'user:', !!user, 'admin:', !!admin)
  
  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : (
        <div className="min-h-screen bg-gradient-to-br from-civic-bg via-white to-civic-muted/20 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-civic-accent mb-4"></div>
            <p className="text-civic-dark font-medium">Loading Urban Eye...</p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  )
}
