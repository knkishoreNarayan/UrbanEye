import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ children, userType }) => {
  const { user, admin } = useAuth()

  console.log('ProtectedRoute - userType:', userType, 'user:', !!user, 'admin:', !!admin)

  if (userType === 'user' && !user) {
    console.log('ProtectedRoute: Redirecting user to login')
    return <Navigate to="/login" replace />
  }

  if (userType === 'admin' && !admin) {
    console.log('ProtectedRoute: Redirecting admin to admin-login')
    return <Navigate to="/admin-login" replace />
  }

  console.log('ProtectedRoute: Rendering children')
  return children
}

export default ProtectedRoute
