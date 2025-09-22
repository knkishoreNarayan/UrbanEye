import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Eye, EyeOff, Mail, Lock, Building, Home } from "lucide-react";

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    division: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    else if (!formData.email.endsWith("@bbmp.gov.in"))
      newErrors.email = "Only @bbmp.gov.in emails allowed";

    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.division.trim()) newErrors.division = "Division is required";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await loginAdmin(
        formData.email,
        formData.password,
        formData.division
      );

      if (result.success) {
        console.log('AdminLogin: Login successful, navigating to admin dashboard')
        navigate("/admin-dashboard");
      } else {
        console.log('AdminLogin: Login failed:', result.error)
        setErrors({ form: result.error });
      }
    } catch (error) {
      setErrors({ form: "Unexpected error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const commonDivisions = [
    "Koramangala",
    "BTM Layout",
    "HSR Layout",
    "Indiranagar",
    "Whitefield",
    "Marathahalli",
    "Jayanagar",
    "Bannerghatta",
    "Electronic City",
    "Hebbal",
    "Yelahanka",
    "Malleshwaram",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-civic-bg via-white to-civic-muted/20 flex items-center justify-center p-4">
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
                <Building className="h-8 w-8 text-civic-accent" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-civic-dark">
              Admin Login
            </CardTitle>
            <CardDescription className="text-civic-text">
              Sign in to your Urban Eye Admin account
            </CardDescription>
          </CardHeader>

          <CardContent>
            {errors.form && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {errors.form}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-civic-dark mb-1"
                >
                  Admin Email
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`pl-10 ${
                      errors.email ? "border-red-500" : ""
                    }`}
                    placeholder="Enter your admin email"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-civic-text/50" />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-civic-dark mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className={`pl-10 pr-10 ${
                      errors.password ? "border-red-500" : ""
                    }`}
                    placeholder="Enter your password"
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-civic-text/50" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-civic-text/50 hover:text-civic-dark"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Division */}
              <div>
                <label
                  htmlFor="division"
                  className="block text-sm font-medium text-civic-dark mb-1"
                >
                  Division
                </label>
                <div className="relative">
                  <select
                    id="division"
                    name="division"
                    value={formData.division}
                    onChange={handleChange}
                    className={`w-full px-10 py-2 border rounded-md focus:ring-2 focus:ring-civic-accent focus:border-civic-accent ${
                      errors.division ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select your division</option>
                    {commonDivisions.map((division) => (
                      <option key={division} value={division}>
                        {division}
                      </option>
                    ))}
                    <option value="General">General</option>
                  </select>
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-civic-text/50" />
                </div>
                {errors.division && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.division}
                  </p>
                )}
              </div>

              {/* Links */}
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link
                    to="/login"
                    className="text-civic-accent hover:underline font-medium"
                  >
                    Citizen Login
                  </Link>
                </div>
                <div className="text-sm">
                  <Link
                    to="/signup"
                    className="text-civic-accent hover:underline font-medium"
                  >
                    Citizen Signup
                  </Link>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full glow-effect"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing In..." : "Admin Sign In"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col text-center">
            <p className="text-sm text-civic-text">
              Admin access is restricted to authorized personnel only
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
