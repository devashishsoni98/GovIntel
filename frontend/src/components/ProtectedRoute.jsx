import { useSelector } from "react-redux"
import { Navigate, useLocation } from "react-router-dom"
import { selectIsAuthenticated, selectUser } from "../redux/slices/authSlice"

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectUser)
  const location = useLocation()

  if (!isAuthenticated) {
    // Redirect to sign in page with return url
    return <Navigate to="/signin" state={{ from: location }} replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // User doesn't have permission to access this route
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export default ProtectedRoute
