"use client"

import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { Upload, X, MapPin, FileText, ImageIcon, Video, Mic, Send, Loader } from 'lucide-react'
import { selectUser } from "../redux/slices/authSlice"
import { createGrievance, reset } from "../redux/slices/grievanceSlice"

const SubmitComplaint = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const { isLoading, isError, isSuccess, message } = useSelector((state) => state.grievances)
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium",
    location: {
      address: "",
      coordinates: {
        latitude: "",
        longitude: "",
      },
      landmark: "",
    },
    isAnonymous: false,
    expectedResolutionDate: "",
  })

  const [attachments, setAttachments] = useState([])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const categories = [
    { value: "infrastructure", label: "Infrastructure", icon: "🏗️" },
    { value: "sanitation", label: "Sanitation", icon: "🧹" },
    { value: "water_supply", label: "Water Supply", icon: "💧" },
    { value: "electricity", label: "Electricity", icon: "⚡" },
    { value: "transportation", label: "Transportation", icon: "🚌" },
    { value: "healthcare", label: "Healthcare", icon: "🏥" },
    { value: "education", label: "Education", icon: "🎓" },
    { value: "police", label: "Police", icon: "👮" },
    { value: "other", label: "Other", icon: "📋" },
  ]

  const priorities = [
    { value: "low", label: "Low", color: "text-green-400" },
    { value: "medium", label: "Medium", color: "text-yellow-400" },
    { value: "high", label: "High", color: "text-orange-400" },
    { value: "urgent", label: "Urgent", color: "text-red-400" },
  ]

  // Add this function to map category to department
  const getCategoryDepartment = (category) => {
    const categoryDepartmentMap = {
      infrastructure: "municipal",
      sanitation: "municipal",
      water_supply: "municipal",
      electricity: "municipal",
      transportation: "transport",
      healthcare: "health",
      education: "education",
      police: "police",
      other: "municipal",
    }
    return categoryDepartmentMap[category] || "municipal"
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }))
    }
  }

  const handleLocationChange = (e) => {
    const { name, value } = e.target

    if (name.includes("coordinates.")) {
      const field = name.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          coordinates: {
            ...prev.location.coordinates,
            [field]: value,
          },
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [name]: value,
        },
      }))
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      const validTypes = [
        "image/",
        "video/",
        "audio/",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]
      const isValidType = validTypes.some((type) => file.type.startsWith(type))
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB

      if (!isValidType) {
        setError(`${file.name} is not a supported file type`)
        return false
      }

      if (!isValidSize) {
        setError(`${file.name} is too large. Maximum size is 10MB`)
        return false
      }

      return true
    })

    if (attachments.length + validFiles.length > 5) {
      setError("Maximum 5 files allowed")
      return
    }

    setAttachments((prev) => [...prev, ...validFiles])
    setError("")
  }

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const getFileIcon = (file) => {
    if (file.type.startsWith("image/")) return <ImageIcon className="w-4 h-4" />
    if (file.type.startsWith("video/")) return <Video className="w-4 h-4" />
    if (file.type.startsWith("audio/")) return <Mic className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            location: {
              ...prev.location,
              coordinates: {
                latitude: position.coords.latitude.toString(),
                longitude: position.coords.longitude.toString(),
              },
            },
          }))
        },
        (error) => {
          setError("Unable to get your location. Please enter manually.")
        },
      )
    } else {
      setError("Geolocation is not supported by this browser.")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validate required fields
    if (!formData.title.trim()) {
      setError("Title is required")
      return
    }
    if (!formData.description.trim()) {
      setError("Description is required")
      return
    }
    if (!formData.category) {
      setError("Category is required")
      return
    }
    if (!formData.location.address.trim()) {
      setError("Address is required")
      return
    }

    try {
      // Create FormData for file upload
      const submitData = new FormData()

      // Add form fields
      submitData.append("title", formData.title.trim())
      submitData.append("description", formData.description.trim())
      submitData.append("category", formData.category)
      submitData.append("priority", formData.priority)
      submitData.append("isAnonymous", formData.isAnonymous.toString())

      // Add department based on category
      const department = getCategoryDepartment(formData.category)
      submitData.append("department", department)

      // Format location to match backend expectations
      const locationData = {
        address: formData.location.address.trim(),
        coordinates: {
          lat: parseFloat(formData.location.coordinates.latitude) || 0,
          lng: parseFloat(formData.location.coordinates.longitude) || 0,
        }
      }
      
      // Add landmark if provided
      if (formData.location.landmark && formData.location.landmark.trim()) {
        locationData.landmark = formData.location.landmark.trim()
      }

      // Convert to string for FormData
      const locationString = JSON.stringify(locationData)
      console.log("Location data being sent:", locationString)
      submitData.append("location", locationString)

      if (formData.expectedResolutionDate) {
        submitData.append("expectedResolutionDate", formData.expectedResolutionDate)
      }

      // Add attachments
      attachments.forEach((file) => {
        submitData.append("attachments", file)
      })

      // ENHANCED DEBUG: Log the FormData contents
      console.log("=== FORM DATA DEBUG ===")
      console.log("Form state:", formData)
      console.log("Department:", department)
      console.log("Location data:", locationData)
      console.log("Attachments:", attachments)
      
      console.log("FormData entries:")
      for (let [key, value] of submitData.entries()) {
        if (value instanceof File) {
          console.log(key, `File: ${value.name} (${value.size} bytes)`)
        } else {
          console.log(key, value)
        }
      }
      console.log("=== END DEBUG ===")

      // Dispatch Redux action
      const result = await dispatch(createGrievance(submitData))
      
      if (createGrievance.fulfilled.match(result)) {
        setSuccess("Complaint submitted successfully!")
        setTimeout(() => {
          dispatch(reset())
          navigate("/my-grievances")
        }, 2000)
      } else {
        setError(result.payload || "Failed to submit complaint")
      }
    } catch (error) {
      console.error("Submit error:", error)
      setError("Network error. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 pt-20 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Submit Complaint</h1>
          <p className="text-slate-400">Report your grievance with detailed information for faster resolution</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-green-400">{success}</p>
          </div>
        )}

        {(error || (isError && message)) && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400">{error || message}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Complaint Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
                  Complaint Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  placeholder="Brief title describing your complaint"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.icon} {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-slate-300 mb-2">
                  Priority Level
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                >
                  {priorities.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
                  Detailed Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none"
                  placeholder="Provide detailed information about your complaint..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Location Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Address */}
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-slate-300 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.location.address}
                  onChange={handleLocationChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  placeholder="Enter the location where the issue occurred"
                  required
                />
              </div>

              {/* Coordinates */}
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-slate-300 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  id="latitude"
                  name="coordinates.latitude"
                  value={formData.location.coordinates.latitude}
                  onChange={handleLocationChange}
                  step="any"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-slate-300 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  id="longitude"
                  name="coordinates.longitude"
                  value={formData.location.coordinates.longitude}
                  onChange={handleLocationChange}
                  step="any"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  placeholder="Optional"
                />
              </div>

              {/* Get Current Location Button */}
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-blue-500/30 transition-all"
                >
                  <MapPin className="w-4 h-4" />
                  Use Current Location
                </button>
              </div>

              {/* Landmark */}
              <div className="md:col-span-2">
                <label htmlFor="landmark" className="block text-sm font-medium text-slate-300 mb-2">
                  Nearby Landmark
                </label>
                <input
                  type="text"
                  id="landmark"
                  name="landmark"
                  value={formData.location.landmark}
                  onChange={handleLocationChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  placeholder="Any nearby landmark to help locate the issue"
                />
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Attachments</h2>
            <p className="text-slate-400 text-sm mb-4">
              Upload photos, videos, audio recordings, or documents (Max 5 files, 10MB each)
            </p>

            {/* File Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500/50 transition-all"
            >
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-300 mb-2">Click to upload files</p>
              <p className="text-slate-500 text-sm">Supports: Images, Videos, Audio, PDF, Word documents</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Attached Files */}
            {attachments.length > 0 && (
              <div className="mt-6">
                <h3 className="text-white font-medium mb-4">Attached Files ({attachments.length}/5)</h3>
                <div className="space-y-3">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-slate-700/30 border border-slate-600/30 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3">
                        {getFileIcon(file)}
                        <div>
                          <p className="text-white text-sm font-medium">{file.name}</p>
                          <p className="text-slate-400 text-xs">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Additional Options */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Additional Options</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Expected Resolution Date */}
              <div>
                <label htmlFor="expectedResolutionDate" className="block text-sm font-medium text-slate-300 mb-2">
                  Expected Resolution Date
                </label>
                <input
                  type="date"
                  id="expectedResolutionDate"
                  name="expectedResolutionDate"
                  value={formData.expectedResolutionDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                />
              </div>

              {/* Anonymous Submission */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAnonymous"
                  name="isAnonymous"
                  checked={formData.isAnonymous}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 rounded focus:ring-purple-500 focus:ring-2"
                />
                <label htmlFor="isAnonymous" className="ml-3 text-slate-300">
                  Submit anonymously
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="w-full sm:w-auto px-6 py-3 border border-slate-600 rounded-xl text-slate-300 hover:bg-slate-700/50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto group bg-gradient-to-r from-purple-500 to-blue-500 px-8 py-3 rounded-xl text-white font-semibold hover:from-purple-600 hover:to-blue-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Complaint
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SubmitComplaint