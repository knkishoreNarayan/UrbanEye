import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Eye, EyeOff, Mail, Lock, Building, User, Home } from "lucide-react"

const AdminSignup = () => {
  const { signupUser } = useAuth()
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    division: "",
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    } else if (!formData.email.endsWith("@bbmp.gov.in")) {
      newErrors.email = "Only @bbmp.gov.in emails are allowed"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    }

    if (!formData.division.trim()) {
      newErrors.division = "Division is required"
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    try {
      const result = await signupUser({
        fullName: formData.full_name,
        email: formData.email,
        password: formData.password,
        role: "admin",
        division: formData.division
      })

      if (result.success) {
        setMessage("✅ Admin registered successfully! Please login.")
        setFormData({ full_name: "", email: "", password: "", division: "" })
        setTimeout(() => navigate("/admin-login"), 1500)
      } else {
        setMessage("❌ " + (result.error || "Signup failed"))
      }
    } catch (error) {
      console.error('Signup error:', error)
      setMessage("❌ Server error. Please try again.")
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
                <User className="h-8 w-8 text-civic-accent" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-civic-dark">Admin Signup</CardTitle>
            <CardDescription className="text-civic-text">
              Create your Urban Eye Admin account
            </CardDescription>
          </CardHeader>

          <CardContent>
            {message && (
              <div
                className={`mb-4 p-3 rounded-md text-sm ${
                  message.startsWith("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-civic-dark mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <Input
                    id="full_name"
                    name="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={handleChange}
                    className={`pl-10 ${errors.full_name ? "border-red-500" : ""}`}
                    placeholder="Enter your full name"
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-civic-text/50" />
                </div>
                {errors.full_name && <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-civic-dark mb-1">
                  Admin Email
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                    placeholder="Enter your admin email"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-civic-text/50" />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              {/* Password */}
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
                    className={`pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
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

              {/* Division */}
              <div>
                <label htmlFor="division" className="block text-sm font-medium text-civic-dark mb-1">
                  Division
                </label>
                <div className="relative">
                  <select
                    id="division"
                    name="division"
                    value={formData.division}
                    onChange={handleChange}
                    className={`w-full px-10 py-2 border rounded-md focus:ring-2 focus:ring-civic-accent focus:border-civic-accent ${errors.division ? "border-red-500" : "border-gray-300"}`}
                  >
                    <option value="">Select your division</option>
                    <option value="Koramangala">Koramangala</option>
                    <option value="BTM Layout">BTM Layout</option>
                    <option value="HSR Layout">HSR Layout</option>
                    <option value="Indiranagar">Indiranagar</option>
                    <option value="Whitefield">Whitefield</option>
                    <option value="Marathahalli">Marathahalli</option>
                    <option value="Jayanagar">Jayanagar</option>
                    <option value="Bannerghatta">Bannerghatta</option>
                    <option value="Electronic City">Electronic City</option>
                    <option value="Hebbal">Hebbal</option>
                    <option value="Yelahanka">Yelahanka</option>
                    <option value="Malleshwaram">Malleshwaram</option>
                    <option value="General">General</option>
                  </select>
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-civic-text/50" />
                </div>
                {errors.division && <p className="mt-1 text-sm text-red-600">{errors.division}</p>}
              </div>

              {/* Submit */}
              <Button type="submit" className="w-full glow-effect" disabled={isSubmitting}>
                {isSubmitting ? "Signing Up..." : "Admin Sign Up"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col text-center space-y-2">
            <p className="text-sm text-civic-text">Already have an account?</p>
            <Link to="/admin-login" className="text-civic-accent hover:underline font-medium">
              Go to Admin Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default AdminSignup
