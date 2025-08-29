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
    console.log("GrievanceService: Creating grievance with data:", grievanceData)
    
    // Always expect FormData from the frontend
    const response = await api.post("/grievances", grievanceData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    
    console.log("GrievanceService: Response:", response.data)
    return response.data.data
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