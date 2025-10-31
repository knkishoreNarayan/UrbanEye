import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import NotificationSystem from './components/NotificationSystem'
import ProtectedRoute from './components/ProtectedRoute'

// Lazy load page components for better performance
const LandingPage = React.lazy(() => import('./pages/LandingPage'))
const UserSignup = React.lazy(() => import('./pages/UserSignup'))
const UserLogin = React.lazy(() => import('./pages/UserLogin'))
const AdminLogin = React.lazy(() => import('./pages/AdminLogin'))
const UserDashboard = React.lazy(() => import('./pages/UserDashboard'))
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'))
const AdminSignup = React.lazy(() => import('./pages/AdminSignup'))

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-civic-bg via-white to-civic-muted/20 flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-civic-accent mb-4"></div>
      <p className="text-civic-dark font-medium">Loading Urban Eye...</p>
    </div>
  </div>
)

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-civic-bg">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/signup" element={<UserSignup />} />
              <Route path="/login" element={<UserLogin />} />
              <Route path="/admin-signup" element={<AdminSignup />} />
              <Route path="/admin-login" element={<AdminLogin />} /> {/* Added admin login */}

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute userType="user">
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute userType="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>

          {/* Global Notification System */}
          <NotificationSystem />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
