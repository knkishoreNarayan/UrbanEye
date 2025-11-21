import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Eye, EyeOff, Mail, Lock, Building, User, Home } from "lucide-react"

const AdminSignup = () => {
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
      const response = await fetch("http://localhost:4000/api/admin/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setMessage("✅ Admin registered successfully! Please login.")
        setFormData({ full_name: "", email: "", password: "", division: "" })
        setTimeout(() => navigate("/admin-login"), 1500) // ✅ fixed redirect path
      } else {
        setMessage("❌ " + (result.error || "Signup failed"))
      }
    } catch (error) {
      setMessage("❌ Server error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center p-4">
      {/* Premium Home Button */}
      <Link
        to="/"
        className="fixed top-6 left-6 z-50 bg-white hover:bg-slate-50 border border-slate-300 hover:border-indigo-400 text-slate-700 hover:text-indigo-600 rounded-xl p-3 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <Home className="h-5 w-5" />
      </Link>

      <div className="w-full max-w-md">
        <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-2xl">
          <CardHeader className="text-center pb-6 pt-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl blur-md opacity-50"></div>
                <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg">
                  <User className="h-10 w-10 text-white" />
                </div>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-slate-800 mb-2">Admin Signup</CardTitle>
            <CardDescription className="text-slate-600 text-base">
              Create your UrbanEye Admin account
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            {message && (
              <div
                className={`mb-6 p-4 rounded-xl text-sm font-medium border ${
                  message.startsWith("✅") ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label htmlFor="full_name" className="block text-sm font-semibold text-slate-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <Input
                    id="full_name"
                    name="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={handleChange}
                    className={`pl-12 h-11 bg-slate-50 border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl ${errors.full_name ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
                    placeholder="Enter your full name"
                  />
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                </div>
                {errors.full_name && <p className="mt-2 text-sm text-red-600 font-medium">{errors.full_name}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                  Admin Email
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`pl-12 h-11 bg-slate-50 border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl ${errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
                    placeholder="Enter your admin email"
                  />
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                </div>
                {errors.email && <p className="mt-2 text-sm text-red-600 font-medium">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className={`pl-12 pr-12 h-11 bg-slate-50 border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl ${errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
                    placeholder="Enter your password"
                  />
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="mt-2 text-sm text-red-600 font-medium">{errors.password}</p>}
              </div>

              {/* Division */}
              <div>
                <label htmlFor="division" className="block text-sm font-semibold text-slate-700 mb-2">
                  Division
                </label>
                <div className="relative">
                  <Input
                    id="division"
                    name="division"
                    type="text"
                    value={formData.division}
                    onChange={handleChange}
                    className={`pl-12 h-11 bg-slate-50 border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl ${errors.division ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
                    placeholder="Enter your division"
                  />
                  <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                </div>
                {errors.division && <p className="mt-2 text-sm text-red-600 font-medium">{errors.division}</p>}
              </div>

              {/* Submit */}
              <Button type="submit" className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl mt-6" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing Up...
                  </>
                ) : (
                  "Admin Sign Up"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col text-center space-y-2 pb-8 px-8">
            <p className="text-sm text-slate-600">Already have an account?</p>
            <Link to="/admin-login" className="text-indigo-600 hover:underline font-semibold">
              Go to Admin Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default AdminSignup
