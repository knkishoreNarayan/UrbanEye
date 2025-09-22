import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Eye, EyeOff, Mail, Lock, Home } from 'lucide-react'

const UserLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { loginUser } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
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

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    }
    
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const result = await loginUser(formData.email, formData.password)
      
      if (result.success) {
        // Redirect to user dashboard on successful login
        navigate('/dashboard')
      } else {
        // Handle login errors
        setErrors({ form: result.error || 'Invalid credentials. Please try again.' })
      }
    } catch (error) {
      setErrors({ form: 'An unexpected error occurred. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-civic-bg via-white to-civic-muted/20 flex items-center justify-center p-4">
      {/* Home Button */}
      <Link
        to="/"
        className="fixed top-4 left-4 z-50 bg-white/90 hover:bg-white border-2 border-civic-accent/30 hover:border-civic-accent text-civic-accent hover:text-civic-dark rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <Home className="h-5 w-5" />
      </Link>
      
      <div className="w-full max-w-md">
        <Card className="glass border-white/20 shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-civic-accent/10 rounded-full">
                <Mail className="h-8 w-8 text-civic-accent" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-civic-dark">Citizen Login</CardTitle>
            <CardDescription className="text-civic-text">
              Sign in to your Urban Eye account
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {errors.form && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {errors.form}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-civic-dark mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="Enter your email"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-civic-text/50" />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-civic-dark mb-1">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    placeholder="Enter your password"
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-civic-text/50" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-civic-text/50 hover:text-civic-dark"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link to="/signup" className="text-civic-accent hover:underline font-medium">
                    Don't have an account?
                  </Link>
                </div>
                <div className="text-sm">
                  <Link to="/admin-login" className="text-civic-accent hover:underline font-medium">
                    Admin Login
                  </Link>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full glow-effect"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col text-center">
            <p className="text-sm text-civic-text">
              By signing in, you agree to our{' '}
              <Link to="/terms" className="text-civic-accent hover:underline font-medium">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-civic-accent hover:underline font-medium">
                Privacy Policy
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default UserLogin