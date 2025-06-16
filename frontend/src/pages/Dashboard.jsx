"use client"
import { useSelector } from "react-redux"
import { selectUser, USER_ROLES } from "../redux/slices/authSlice"
import CitizenDashboard from "../components/dashboards/CitizenDashboard"
import OfficerDashboard from "../components/dashboards/OfficerDashboard"
import AdminDashboard from "../components/dashboards/AdminDashboard"

const Dashboard = () => {
  const user = useSelector(selectUser)

  const renderDashboard = () => {
    switch (user?.role) {
      case USER_ROLES.CITIZEN:
        return <CitizenDashboard />
      case USER_ROLES.OFFICER:
        return <OfficerDashboard />
      case USER_ROLES.ADMIN:
        return <AdminDashboard />
      default:
        return (
          <div className="pt-20 p-8 text-center">
            <h1 className="text-white text-2xl mb-4">Access Denied</h1>
            <p className="text-slate-400">Invalid user role</p>
          </div>
        )
    }
  }

  return renderDashboard()
}

export default Dashboard
