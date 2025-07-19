import api from "./index"

export const userService = {
  // Get all users (admin only)
  getUsers: async () => {
    const response = await api.get("/users")
    return response.data.data
  },

  // Get user by ID
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`)
    return response.data.data
  },

  // Update user
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData)
    return response.data.data
  },

  // Activate/deactivate user
  toggleUserStatus: async (id, isActive) => {
    const response = await api.patch(`/users/${id}/status`, { isActive })
    return response.data.data
  },

  // Get user statistics (admin only)
  getUserStatistics: async () => {
    const response = await api.get("/users/statistics")
    return response.data.data
  },
}
