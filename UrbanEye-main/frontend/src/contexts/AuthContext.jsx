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

  // Load saved session from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('urbanEyeUser')
    const savedAdmin = localStorage.getItem('urbanEyeAdmin')

    console.log('AuthContext - Loading from localStorage:', { savedUser, savedAdmin })

    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        console.log('AuthContext - Setting user:', userData)
        setUser(userData)
      } catch (error) {
        console.error('AuthContext - Error parsing user data:', error)
      }
    }
    
    if (savedAdmin) {
      try {
        const adminData = JSON.parse(savedAdmin)
        console.log('AuthContext - Setting admin:', adminData)
        setAdmin(adminData)
      } catch (error) {
        console.error('AuthContext - Error parsing admin data:', error)
      }
    }

    setLoading(false)
  }, [])

  // User login
  const loginUser = async (email, password) => {
    try {
      const { user: apiUser, token } = await apiService.login({ email, password, role: 'user' })
      setUser(apiUser)
      localStorage.setItem('urbanEyeUser', JSON.stringify(apiUser))
      localStorage.setItem('urbanEyeToken', token)
      return { success: true, user: apiUser }
    } catch {
      return { success: false, error: 'Invalid credentials' }
    }
  }

  // Admin login
  const loginAdmin = async (email, password, division) => {
    try {
      const response = await apiService.adminLogin({ email, password, division })
      
      // Check if response has the expected structure
      if (!response || !response.admin) {
        return { success: false, error: 'Invalid response from server' }
      }
      
      const { admin: apiAdmin, token } = response
      
      if (division && apiAdmin.division !== division) {
        return { success: false, error: 'Invalid credentials or division' }
      }
      setAdmin(apiAdmin)
      localStorage.setItem('urbanEyeAdmin', JSON.stringify(apiAdmin))
      localStorage.setItem('urbanEyeToken', token)
      return { success: true, admin: apiAdmin }
    } catch (error) {
      return { success: false, error: 'Invalid credentials or division' }
    }
  }

  // User signup
  const signupUser = async (userData) => {
    try {
      const { user: apiUser, token } = await apiService.signup({ ...userData, role: 'user' })
      setUser(apiUser)
      localStorage.setItem('urbanEyeUser', JSON.stringify(apiUser))
      localStorage.setItem('urbanEyeToken', token)
      return { success: true, user: apiUser }
    } catch {
      return { success: false, error: 'Signup failed' }
    }
  }

  // Logout
  const logout = () => {
    setUser(null)
    setAdmin(null)
    localStorage.removeItem('urbanEyeUser')
    localStorage.removeItem('urbanEyeAdmin')
  }

  // Submit complaint
  const submitComplaint = async (complaintData) => {
    try {
      const payload = {
        title: complaintData.title,
        description: complaintData.description,
        category: complaintData.category,
        severity: complaintData.severity,
        location: complaintData.location,
        userId: user?.id,
        division: getDivisionFromLocation(complaintData.location),
        coordinates: complaintData.coordinates,
      }

      // Create proper File object from blob if photoData exists
      let file = null
      if (complaintData.photoData?.blob) {
        file = new File([complaintData.photoData.blob], "complaint.jpg", { type: "image/jpeg" })
      } else if (complaintData.photo) {
        file = complaintData.photo
      }

      const { complaint } = await apiService.createComplaint(payload, file)

      return { success: true, complaint }
    } catch (error) {
      console.error('Submit complaint error:', error)
      return { success: false, error: 'Failed to submit complaint' }
    }
  }

  // Get complaints for logged-in user
  const getUserComplaints = () => {
    if (!user) return []
    return dataService.getComplaintsByUserId(user.id)
  }

  // Get complaints for logged-in admin
  const getAdminComplaints = () => {
    if (!admin) return []
    return dataService.getComplaintsByDivision(admin.division)
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


  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : (
        <div className="min-h-screen bg-gradient-to-br from-civic-bg via-white to-civic-muted/20 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-civic-accent mb-4"></div>
            <p className="text-civic-dark font-medium">Loading...</p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  )
}
