import api from "./index"

export const grievanceService = {
  // Get all grievances (with optional filters)
  getGrievances: async (filters = {}) => {
    const response = await api.get("/grievances", { params: filters })
    return response.data.data
  },

  // Get a single grievance by ID
  getGrievanceById: async (id) => {
    const response = await api.get(`/grievances/${id}`)
    return response.data.data
  },

  // Create a new grievance
  createGrievance: async (grievanceData) => {
    // Check if grievanceData is already a FormData object
    if (grievanceData instanceof FormData) {
      // Use the FormData directly
      const response = await api.post("/grievances", grievanceData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data.data
    } else {
      // Handle regular object data
      const formData = new FormData()

      // Add text fields
      Object.keys(grievanceData).forEach((key) => {
        if (key !== "attachments") {
          formData.append(key, grievanceData[key])
        }
      })

      // Add attachments if any
      if (grievanceData.attachments && grievanceData.attachments.length) {
        grievanceData.attachments.forEach((file) => {
          formData.append("attachments", file)
        })
      }

      const response = await api.post("/grievances", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      return response.data.data
    }
  },

  // Update a grievance
  updateGrievance: async (id, updateData) => {
    const response = await api.put(`/grievances/${id}`, updateData)
    return response.data.data
  },

  // Update grievance status
  updateStatus: async (id, status, comment) => {
    const response = await api.patch(`/grievances/${id}/status`, {
      status,
      comment,
    })
    return response.data.data
  },

  // Add feedback to a resolved grievance
  addFeedback: async (id, rating, comment) => {
    const response = await api.post(`/grievances/${id}/feedback`, {
      rating,
      comment,
    })
    return response.data.data
  },

  // Get grievance statistics
  getStatistics: async () => {
    const response = await api.get("/grievances/statistics")
    return response.data.data
  },
}