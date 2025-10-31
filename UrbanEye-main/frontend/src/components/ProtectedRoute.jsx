import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ children, userType }) => {
  const { user, admin } = useAuth()

  if (userType === 'user' && !user) {
    return <Navigate to="/login" replace />
  }

  if (userType === 'admin' && !admin) {
    return <Navigate to="/admin-login" replace />
  }
  return children
}

export default ProtectedRoute
