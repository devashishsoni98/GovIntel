import api from "./index"

export const userService = {
  // Get all users (admin only)
  getUsers: async () => {
    const response = await api.get("/api/users")
    return response.data.data
  },

  // Get user by ID
  getUserById: async (id) => {
    const response = await api.get(`/api/users/${id}`)
    return response.data.data
  },

  // Update user
  updateUser: async (id, userData) => {
    const response = await api.put(`/api/users/${id}`, userData)
    return response.data.data
  },

  // Activate/deactivate user
  toggleUserStatus: async (id, isActive) => {
    const response = await api.patch(`/api/users/${id}/status`, { isActive })
    return response.data.data
  },

  // Get user statistics (admin only)
  getUserStatistics: async () => {
    const response = await api.get("/api/users/statistics")
    return response.data.data
  },
}
