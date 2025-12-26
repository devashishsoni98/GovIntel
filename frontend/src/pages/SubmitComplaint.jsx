"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { Upload, X, MapPin, FileText, ImageIcon, Video, Mic, Send, Loader } from "lucide-react"
import { selectUser } from "../redux/slices/authSlice"
import { createGrievance, reset } from "../redux/slices/grievanceSlice"
import api from "../api"   // ✅ axios instance

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
  const [departments, setDepartments] = useState([])
  const [loadingDepartments, setLoadingDepartments] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // ===========================
  // Fetch departments
  // ===========================
  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true)

      const res = await api.get("/departments/active")

      setDepartments(res.data?.data || [])
    } catch (err) {
      console.error("Fetch departments error:", err)
      setError("Failed to load departments")
    } finally {
      setLoadingDepartments(false)
    }
  }

  // ===========================
  // Categories
  // ===========================
  const getCategories = () => {
    const categoryMap = {
      MUNICIPAL: [
        { value: "infrastructure", label: "Infrastructure", icon: "🏗️" },
        { value: "sanitation", label: "Sanitation", icon: "🧹" },
        { value: "water_supply", label: "Water Supply", icon: "💧" },
        { value: "electricity", label: "Electricity", icon: "⚡" },
        { value: "other", label: "Other Municipal", icon: "🏛️" },
      ],
      HEALTH: [{ value: "healthcare", label: "Healthcare", icon: "🏥" }],
      EDUCATION: [{ value: "education", label: "Education", icon: "🎓" }],
      TRANSPORT: [{ value: "transportation", label: "Transportation", icon: "🚌" }],
      POLICE: [{ value: "police", label: "Police", icon: "👮" }],
      REVENUE: [{ value: "revenue", label: "Revenue & Tax", icon: "💰" }],
    }

    const all = []
    departments.forEach((d) => {
      all.push(...(categoryMap[d.code] || []))
    })
    return all
  }

  const priorities = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
  ]

  // ===========================
  // Input handlers
  // ===========================
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

  // ===========================
  // Files
  // ===========================
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    setError("")

    const valid = files.filter((f) => f.size <= 10 * 1024 * 1024)
    if (attachments.length + valid.length > 5) {
      setError("Maximum 5 files allowed")
      return
    }

    setAttachments((prev) => [...prev, ...valid])
  }

  const removeAttachment = (i) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== i))
  }

  const getCurrentLocation = () => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          coordinates: {
            latitude: pos.coords.latitude.toString(),
            longitude: pos.coords.longitude.toString(),
          },
        },
      }))
    })
  }

  // ===========================
  // Submit
  // ===========================
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!formData.title || !formData.description || !formData.category || !formData.location.address) {
      setError("Please fill all required fields")
      return
    }

    try {
      const fd = new FormData()

      fd.append("title", formData.title)
      fd.append("description", formData.description)
      fd.append("category", formData.category)
      fd.append("priority", formData.priority)
      fd.append("isAnonymous", formData.isAnonymous)

      fd.append(
        "location",
        JSON.stringify({
          address: formData.location.address,
          landmark: formData.location.landmark,
          coordinates: {
            latitude: Number(formData.location.coordinates.latitude) || 0,
            longitude: Number(formData.location.coordinates.longitude) || 0,
          },
        })
      )

      if (formData.expectedResolutionDate) {
        fd.append("expectedResolutionDate", formData.expectedResolutionDate)
      }

      attachments.forEach((f) => fd.append("attachments", f))

      const res = await api.post("/grievances", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      if (res.data?.success) {
        setSuccess("Complaint submitted successfully")
        setTimeout(() => navigate("/my-grievances"), 1500)
      } else {
        setError(res.data?.message || "Submission failed")
      }
    } catch (err) {
      console.error("Submit error:", err)
      setError(err.response?.data?.message || "Network error")
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 pt-20 sm:pt-24 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto pt-20">
        {/* Header */}
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-white mb-2">Submit Complaint</h1>
          <p className="text-slate-400">Report your grievance with detailed information for faster resolution</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg animate-bounce-in">
            <p className="text-green-400">{success}</p>
          </div>
        )}

        {(error || (isError && message)) && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg animate-bounce-in">
            <p className="text-red-400">{error || message}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 sm:p-6 animate-slide-up">
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
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all hover:bg-slate-700/70"
                  placeholder="Brief title describing your complaint"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-2">
                  Category *
                </label>
                {loadingDepartments ? (
                  <div className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-400 flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    Loading categories...
                  </div>
                ) : (
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all hover:bg-slate-700/70"
                    required
                  >
                    <option value="">Select a category</option>
                    {getCategories().map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.icon} {category.label}
                      </option>
                    ))}
                  </select>
                )}
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
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all hover:bg-slate-700/70"
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
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none hover:bg-slate-700/70"
                  placeholder="Provide detailed information about your complaint..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 sm:p-6 animate-slide-up" style={{animationDelay: '0.1s'}}>
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
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all hover:bg-slate-700/70"
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
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all hover:bg-slate-700/70"
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
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all hover:bg-slate-700/70"
                  placeholder="Optional"
                />
              </div>

              {/* Get Current Location Button */}
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-blue-500/30 transition-all hover:scale-105"
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
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all hover:bg-slate-700/70"
                  placeholder="Any nearby landmark to help locate the issue"
                />
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 sm:p-6 animate-slide-up" style={{animationDelay: '0.2s'}}>
            <h2 className="text-xl font-bold text-white mb-6">Attachments</h2>
            <p className="text-slate-400 text-sm mb-4">
              Upload photos, videos, audio recordings, or documents (Max 5 files, 10MB each)
            </p>

            {/* File Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-600 rounded-xl p-6 sm:p-8 text-center cursor-pointer hover:border-purple-500/50 transition-all hover:bg-slate-700/20 group"
            >
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4 group-hover:text-purple-400 group-hover:scale-110 transition-all" />
              <p className="text-slate-300 mb-2">Click to upload files</p>
              <p className="text-slate-500 text-sm">Supports: Images, Videos, Audio, PDF, Word documents, Text files</p>
              <p className="text-slate-600 text-xs mt-2">Maximum 5 files, 10MB each</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
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
                      className="flex items-center justify-between bg-slate-700/30 border border-slate-600/30 rounded-lg p-3 hover:bg-slate-700/50 transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-3">
                        {getFileIcon(file)}
                        <div>
                          <p className="text-white text-sm font-medium">{file.name}</p>
                          <p className="text-slate-400 text-xs">{formatFileSize(file.size)} • {file.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {file.type.startsWith('image/') && (
                          <div className="w-8 h-8 bg-slate-600/50 rounded overflow-hidden">
                            <img
                              src={URL.createObjectURL(file)}
                              alt="Preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none'
                              }}
                            />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="text-red-400 hover:text-red-300 transition-all hover:scale-110 opacity-70 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Additional Options */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 sm:p-6 animate-slide-up" style={{animationDelay: '0.3s'}}>
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
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all hover:bg-slate-700/70"
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
              className="w-full sm:w-auto px-6 py-3 border border-slate-600 rounded-xl text-slate-300 hover:bg-slate-700/50 transition-all hover:scale-105"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto group bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 rounded-xl text-white font-semibold hover:from-purple-600 hover:to-blue-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
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