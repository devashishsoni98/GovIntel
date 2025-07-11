"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { Shield, Mail, Lock, User, Eye, EyeOff, ArrowRight, Building, Phone, Users } from "lucide-react"
import {
  loginUser,
  registerUser,
  clearError,
  USER_ROLES,
  selectAuthLoading,
  selectAuthError,
  selectIsAuthenticated,
} from "../redux/slices/authSlice"

const NAVBAR_HEIGHT_MOBILE = 56 // px
const NAVBAR_HEIGHT_DESKTOP = 72 // px

const SignIn = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const loading = useSelector(selectAuthLoading)
  const error = useSelector(selectAuthError)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [departments, setDepartments] = useState([])
  const [loadingDepartments, setLoadingDepartments] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    phone: "",
    officerPasscode: "",
    role: USER_ROLES.CITIZEN, // Default role
  })

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard")
    }
  }, [isAuthenticated, navigate])

  // Clear error when component mounts or form switches
  useEffect(() => {
    dispatch(clearError())
  }, [dispatch, isLogin])

  // Fetch departments when officer role is selected
  useEffect(() => {
    if (!isLogin && formData.role === USER_ROLES.OFFICER) {
      fetchDepartments()
    }
  }, [isLogin, formData.role])

  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true)
      const response = await fetch("/api/departments/active")
      
      if (response.ok) {
        const data = await response.json()
        setDepartments(data.data || [])
      } else {
        console.error("Failed to fetch departments")
      }
    } catch (error) {
      console.error("Error fetching departments:", error)
    } finally {
      setLoadingDepartments(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch(clearError())

    if (isLogin) {
      // Login
      const result = await dispatch(
        loginUser({
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      )

      if (loginUser.fulfilled.match(result)) {
        navigate("/dashboard")
      }
    } else {
      // Registration
      if (formData.password !== formData.confirmPassword) {
        // Handle password mismatch
        return
      }

      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        ...(formData.role === USER_ROLES.OFFICER && {
          department: formData.department,
          phone: formData.phone,
          officerPasscode: formData.officerPasscode,
        }),
        ...(formData.role === USER_ROLES.CITIZEN && {
          phone: formData.phone,
        }),
      }

      const result = await dispatch(registerUser(userData))

      if (registerUser.fulfilled.match(result)) {
        navigate("/dashboard")
      }
    }
  }

  const toggleForm = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setIsLogin(!isLogin)
      // Reset form data when switching
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        department: "",
        phone: "",
        officerPasscode: "",
        role: USER_ROLES.CITIZEN,
      })
      setTimeout(() => {
        setIsAnimating(false)
      }, 50)
    }, 300)
  }

  // Animation classes
  const formClasses = `transition-all duration-500 ease-in-out ${
    isAnimating ? "opacity-0 transform translate-y-4" : "opacity-100 transform translate-y-0"
  }`

  const getRoleDisplayName = (role) => {
    switch (role) {
      case USER_ROLES.CITIZEN:
        return "Citizen"
      case USER_ROLES.OFFICER:
        return "Government Officer"
      case USER_ROLES.ADMIN:
        return "Administrator"
      default:
        return "Citizen"
    }
  }

  return (
    <div
      className={`
        min-h-screen
        bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900
        text-white
        flex items-center justify-center
        px-2 xs:px-4 sm:px-8 md:px-12
        pt-[56px] sm:pt-[56px] md:pt-[72px] lg:pt-[72px]
        relative
      `}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-40 h-40 xs:w-64 xs:h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 xs:w-96 xs:h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 xs:w-80 xs:h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto my-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-x-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent hidden sm:inline">
              GovIntel
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            {isLogin ? "Welcome Back" : "Join GovIntel"}
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            {isLogin
              ? "Sign in to access your government dashboard"
              : "Create your account to get started with AI-powered grievance management"}
          </p>
        </div>

        {/* Form Container */}
        <div className="relative bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 xs:p-6 sm:p-8 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-2xl"></div>

          <div className="relative z-10">
            {/* Form Toggle */}
            <div className="flex mb-8 bg-slate-700/30 rounded-xl p-1">
              <button
                onClick={() => {
                  if (!isLogin) toggleForm()
                }}
                className={`flex-1 py-2 xs:py-3 px-2 xs:px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isLogin
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  if (isLogin) toggleForm()
                }}
                className={`flex-1 py-2 xs:py-3 px-2 xs:px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                  !isLogin
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Form */}
            <div className={formClasses}>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role Selection */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-slate-300 mb-2">
                    I am a
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all backdrop-blur-sm"
                      required
                    >
                      <option value={USER_ROLES.CITIZEN}>Citizen</option>
                      <option value={USER_ROLES.OFFICER}>Government Officer</option>
                      {/* Only show Admin option during login, not registration */}
                      {isLogin && <option value={USER_ROLES.ADMIN}>Administrator</option>}
                    </select>
                  </div>
                </div>

                {/* Name Field (Sign Up Only) */}
                {!isLogin && (
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all backdrop-blur-sm"
                        placeholder="Enter your full name"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                {/* Department Field (Sign Up Only - Officers) */}
                {!isLogin && formData.role === USER_ROLES.OFFICER && (
                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-slate-300 mb-2">
                      Department *
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      {loadingDepartments ? (
                        <div className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-400">
                          Loading departments...
                        </div>
                      ) : (
                        <select
                          id="department"
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all backdrop-blur-sm"
                          required={!isLogin && formData.role === USER_ROLES.OFFICER}
                        >
                          <option value="">Select your department</option>
                          {departments.map((dept) => (
                            <option key={dept._id} value={dept.code.toUpperCase()}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                )}

                {/* Officer Passcode Field (Sign Up Only - Officers) */}
                {!isLogin && formData.role === USER_ROLES.OFFICER && (
                  <div>
                    <label htmlFor="officerPasscode" className="block text-sm font-medium text-slate-300 mb-2">
                      Officer Passcode *
                    </label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="password"
                        id="officerPasscode"
                        name="officerPasscode"
                        value={formData.officerPasscode}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all backdrop-blur-sm"
                        placeholder="Enter officer passcode"
                        required={!isLogin && formData.role === USER_ROLES.OFFICER}
                      />
                    </div>
                    <p className="text-slate-500 text-xs mt-1">
                      Contact your administrator for the officer passcode
                    </p>
                  </div>
                )}

                {/* Phone Field (Sign Up Only - Citizens and Officers) */}
                {!isLogin && (formData.role === USER_ROLES.CITIZEN || formData.role === USER_ROLES.OFFICER) && (
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all backdrop-blur-sm"
                        placeholder="Enter your phone number"
                        required={
                          !isLogin && (formData.role === USER_ROLES.CITIZEN || formData.role === USER_ROLES.OFFICER)
                        }
                      />
                    </div>
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all backdrop-blur-sm"
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-12 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all backdrop-blur-sm"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field (Sign Up Only) */}
                {!isLogin && (
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-12 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all backdrop-blur-sm"
                        placeholder="Confirm your password"
                        required={!isLogin}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Forgot Password (Login Only) */}
                {isLogin && (
                  <div className="flex justify-end">
                    <button type="button" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                      Forgot your password?
                    </button>
                  </div>
                )}

                {/* Terms and Conditions (Sign Up Only) */}
                {!isLogin && (
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="terms"
                      className="mt-1 w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 rounded focus:ring-purple-500 focus:ring-2"
                      required={!isLogin}
                    />
                    <label htmlFor="terms" className="text-sm text-slate-300">
                      I agree to the{" "}
                      <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">
                        Privacy Policy
                      </a>
                    </label>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full bg-gradient-to-r from-purple-500 to-blue-500 py-3 px-4 rounded-xl text-white font-semibold hover:from-purple-600 hover:to-blue-600 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      {isLogin ? "Sign In" : "Create Account"}
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignIn