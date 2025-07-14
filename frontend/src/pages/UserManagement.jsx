import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  UserCheck, 
  UserX,
  Mail,
  Phone,
  Building,
  Shield,
  Calendar,
  MoreVertical,
  Download,
  Upload
} from "lucide-react"
import { selectUser } from "../redux/slices/authSlice"

const UserManagement = () => {
  const currentUser = useSelector(selectUser)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState({
    role: "",
    department: "",
    status: "",
    search: ""
  })
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 10
  })
  const [selectedUsers, setSelectedUsers] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingUser, setDeletingUser] = useState(null)
  const [departments, setDepartments] = useState([])

  const roleOptions = [
    { value: "", label: "All Roles" },
    { value: "citizen", label: "Citizens" },
    { value: "officer", label: "Officers" },
    { value: "admin", label: "Administrators" }
  ]

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" }
  ]

  useEffect(() => {
    fetchUsers()
    fetchDepartments()
  }, [filters, pagination.current])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError("")

      const queryParams = new URLSearchParams({
        page: pagination.current.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      })

      const response = await fetch(`/api/users?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.data.users || [])
        setPagination(data.data.pagination || { current: 1, pages: 1, total: 0 })
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Failed to fetch users")
      }
    } catch (error) {
      console.error("Fetch users error:", error)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments/active", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setDepartments(data.data || [])
      }
    } catch (error) {
      console.error("Fetch departments error:", error)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current: page }))
  }

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map(u => u._id))
    }
  }

  const handleCreateUser = () => {
    setShowCreateModal(true)
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setShowEditModal(true)
  }

  const handleDeleteUser = (user) => {
    setDeletingUser(user)
    setShowDeleteModal(true)
  }

  const handleToggleUserStatus = async (user) => {
    try {
      const response = await fetch(`/api/users/${user._id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          isActive: !user.isActive
        })
      })

      if (response.ok) {
        fetchUsers()
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Failed to update user status")
      }
    } catch (error) {
      console.error("Toggle user status error:", error)
      setError("Network error during status update")
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "text-red-400 bg-red-400/10 border-red-400/20"
      case "officer":
        return "text-blue-400 bg-blue-400/10 border-blue-400/20"
      case "citizen":
        return "text-green-400 bg-green-400/10 border-green-400/20"
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/20"
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <Shield className="w-4 h-4" />
      case "officer":
        return <UserCheck className="w-4 h-4" />
      case "citizen":
        return <Users className="w-4 h-4" />
      default:
        return <Users className="w-4 h-4" />
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 pt-20 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-slate-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 pt-20 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
            <p className="text-slate-400">Manage system users, roles, and permissions</p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            {selectedUsers.length > 0 && (
              <div className="flex items-center gap-2">
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-500/30 transition-all">
                  <Trash2 className="w-4 h-4" />
                  Delete ({selectedUsers.length})
                </button>
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-blue-500/30 transition-all">
                  <UserX className="w-4 h-4" />
                  Deactivate
                </button>
              </div>
            )}
            
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 hover:bg-green-500/30 transition-all">
              <Download className="w-4 h-4" />
              Export
            </button>
            
            <button 
              onClick={handleCreateUser}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-2 rounded-lg text-white font-medium hover:from-purple-600 hover:to-blue-600 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add User
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
              />
            </div>

            {/* Role Filter */}
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange("role", e.target.value)}
              className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Department Filter */}
            <select
              value={filters.department}
              onChange={(e) => handleFilterChange("department", e.target.value)}
              className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept.code}>
                  {dept.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => setFilters({ role: "", department: "", status: "", search: "" })}
              className="px-4 py-3 border border-slate-600 rounded-xl text-slate-300 hover:bg-slate-700/50 transition-all"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden">
          {/* Table Header */}
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Users ({pagination.total})</h2>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 rounded focus:ring-purple-500 focus:ring-2"
                />
                <span className="text-slate-400 text-sm">
                  Select All ({selectedUsers.length}/{users.length})
                </span>
              </div>
            </div>
          </div>

          {/* Table Content */}
          {users.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Users Found</h3>
              <p className="text-slate-400 mb-6">
                {Object.values(filters).some(f => f) 
                  ? "No users match your current filters."
                  : "No users have been created yet."
                }
              </p>
              <button 
                onClick={handleCreateUser}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 rounded-xl text-white font-semibold hover:from-purple-600 hover:to-blue-600 transition-all"
              >
                <Plus className="w-5 h-5" />
                Create First User
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === users.length}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 rounded focus:ring-purple-500 focus:ring-2"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => handleSelectUser(user._id)}
                          className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 rounded focus:ring-purple-500 focus:ring-2"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-white font-medium">{user.name}</div>
                            <div className="text-slate-400 text-sm flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="text-slate-400 text-sm flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(user.role)}`}>
                          {getRoleIcon(user.role)}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.department ? (
                          <div className="flex items-center gap-1 text-slate-300">
                            <Building className="w-4 h-4" />
                            <span className="capitalize">{user.department}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleUserStatus(user)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-all ${
                            user.isActive
                              ? "text-green-400 bg-green-400/10 border border-green-400/20 hover:bg-green-400/20"
                              : "text-red-400 bg-red-400/10 border border-red-400/20 hover:bg-red-400/20"
                          }`}
                        >
                          {user.isActive ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                          {user.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-slate-400 text-sm">
                          <Calendar className="w-3 h-3" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-all"
                            title="Edit User"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-green-400 hover:text-green-300 hover:bg-green-400/10 rounded-lg transition-all"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {user._id !== currentUser?.id && (
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between p-6 border-t border-slate-700/50">
              <div className="text-slate-400 text-sm">
                Showing {(pagination.current - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.current * pagination.limit, pagination.total)} of {pagination.total} users
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.current - 1)}
                  disabled={pagination.current === 1}
                  className="px-3 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {[...Array(pagination.pages)].map((_, i) => {
                  const page = i + 1
                  if (
                    page === 1 ||
                    page === pagination.pages ||
                    (page >= pagination.current - 1 && page <= pagination.current + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 rounded-lg transition-all ${
                          page === pagination.current
                            ? "bg-purple-500 text-white"
                            : "border border-slate-600 text-slate-300 hover:bg-slate-700/50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  } else if (page === pagination.current - 2 || page === pagination.current + 2) {
                    return (
                      <span key={page} className="text-slate-500">
                        ...
                      </span>
                    )
                  }
                  return null
                })}

                <button
                  onClick={() => handlePageChange(pagination.current + 1)}
                  disabled={pagination.current === pagination.pages}
                  className="px-3 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserManagement