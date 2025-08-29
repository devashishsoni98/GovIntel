import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import {
  Shield,
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  FileText,
  Building,
  Users,
  BarChart3,
  MessageSquare,
} from "lucide-react"
import { logoutUser, selectUser, selectIsAuthenticated, USER_ROLES } from "../redux/slices/authSlice"

const Navbar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(selectUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const toggleDropdown = (dropdownName) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName)
  }

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  const handleLogout = async () => {
    await dispatch(logoutUser())
    navigate("/signin")
  }

  const getRoleDisplayName = (role) => {
    switch (role) {
      case USER_ROLES.CITIZEN:
        return "Citizen"
      case USER_ROLES.OFFICER:
        return "Government Officer"
      case USER_ROLES.ADMIN:
        return "Administrator"
      default:
        return "User"
    }
  }

  const getRoleBasedNavigation = () => {
    const baseItems = [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: <Shield className="w-4 h-4" />,
      },
    ]

    if (user?.role === USER_ROLES.CITIZEN) {
      return [
        ...baseItems,
        {
          name: "My Grievances",
          href: "/my-grievances",
          icon: <MessageSquare className="w-4 h-4" />,
        },
        {
          name: "Submit Complaint",
          href: "/submit-complaint",
          icon: <FileText className="w-4 h-4" />,
        },
      ]
    }

    if (user?.role === USER_ROLES.OFFICER) {
      return [
        ...baseItems,
        {
          name: "Assigned Cases",
          href: "/assigned-cases",
          icon: <FileText className="w-4 h-4" />,
        },
      ]
    }

    if (user?.role === USER_ROLES.ADMIN) {
      return [
        ...baseItems,
        {
          name: "User Management",
          href: "/user-management",
          icon: <Users className="w-4 h-4" />,
        },
        {
          name: "Analytics",
          href: "/analytics",
          icon: <BarChart3 className="w-4 h-4" />,
        },
      ]
    }

    return baseItems
  }

  // Navigation items based on authentication and role
  const navigationItems = isAuthenticated
    ? getRoleBasedNavigation()
    : [
        {
          name: "Sign In",
          href: "/signin",
          icon: <LogOut className="w-4 h-4" />,
        },
      ]

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? "bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50 shadow-2xl" : "bg-transparent"
        }`}
      >
        <div className="max-w-screen-xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2 sm:py-3 md:py-4 gap-x-2">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-x-2 group cursor-pointer min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="hidden xl:inline text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent truncate">
                GovIntel
              </span>
            </Link>

            {/* Desktop Navigation (only ≥xl: 1280px) */}
            <div className="hidden lg:flex items-center gap-x-4 2xl:gap-x-8 min-w-0 flex-shrink">
              {navigationItems.map((item) => (
                <div key={item.name} className="relative" ref={dropdownRef}>
                  {item.dropdown ? (
                    <button
                      onClick={() => toggleDropdown(item.name)}
                      className="group flex items-center gap-x-1 text-slate-300 hover:text-white transition-all duration-300 py-2 relative text-base hover:scale-105"
                    >
                      {item.icon}
                      <span className="font-medium">{item.name}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${
                          activeDropdown === item.name ? "rotate-180" : ""
                        }`}
                      />
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 group-hover:w-full transition-all duration-500"></span>
                    </button>
                  ) : (
                    <Link
                      to={item.href}
                      className="group flex items-center gap-x-1 text-slate-300 hover:text-white transition-all duration-300 py-2 relative text-base hover:scale-105"
                    >
                      {item.icon}
                      <span className="font-medium">{item.name}</span>
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 group-hover:w-full transition-all duration-500"></span>
                    </Link>
                  )}

                  {/* Dropdown Menu */}
                  {item.dropdown && (
                    <div
                      className={`absolute top-full left-0 mt-2 w-56 sm:w-64 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl transition-all duration-300 z-50 ${
                        activeDropdown === item.name
                          ? "opacity-100 visible transform translate-y-0"
                          : "opacity-0 invisible transform -translate-y-2"
                      }`}
                    >
                      <div className="py-2">
                        {item.dropdown.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.name}
                            to={dropdownItem.href}
                            className="flex items-center gap-x-3 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 text-sm"
                          >
                            {dropdownItem.icon}
                            <span>{dropdownItem.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right Side Items (only ≥xl: 1280px) */}
            {isAuthenticated && (
              <div className="hidden lg:flex items-center gap-x-3 2xl:gap-x-4 min-w-0">
                {/* User Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => toggleDropdown("user")}
                    className="flex items-center gap-x-2 p-2 text-slate-300 hover:text-white transition-colors duration-300 hover:bg-slate-700/50 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${
                        activeDropdown === "user" ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* User Dropdown Menu */}
                  <div
                    className={`absolute top-full right-0 mt-2 w-56 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl transition-all duration-300 z-50 ${
                      activeDropdown === "user"
                        ? "opacity-100 visible transform translate-y-0"
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-x-3 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 text-sm"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Hamburger Menu (≤lg: 1024px and below) */}
            <div className="flex lg:hidden items-center">
              <button
                onClick={toggleMobileMenu}
                className="p-2 text-slate-400 hover:text-white transition-colors duration-300 hover:bg-slate-700/50 rounded-lg"
                aria-label="Open menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-[100] lg:hidden transition-all duration-500 ${
          isMobileMenuOpen ? "visible" : "invisible"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-500 ${
            isMobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={toggleMobileMenu}
        ></div>

        {/* Mobile Menu Panel */}
        <div
          className={`absolute top-0 left-0 h-full w-72 max-w-[90vw] bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 shadow-2xl transform transition-transform duration-500 ease-in-out ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
              <Link to="/" className="flex items-center gap-x-2 min-w-0" onClick={toggleMobileMenu}>
                <div className="w-7 h-7 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent truncate">
                  GovIntel
                </span>
              </Link>
              <button
                onClick={toggleMobileMenu}
                className="p-2 text-slate-400 hover:text-white transition-colors duration-300"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile Search */}
            {isAuthenticated && (
              <div></div>
            )}

            {/* Mobile Navigation */}
            <div className="flex-1 overflow-y-auto py-2">
              {navigationItems.map((item) => (
                <div key={item.name}>
                  {item.dropdown ? (
                    <div>
                      <button
                        onClick={() => toggleDropdown(`mobile-${item.name}`)}
                        className="w-full flex items-center justify-between px-5 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 text-base"
                      >
                        <div className="flex items-center gap-x-3">
                          {item.icon}
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-300 ${
                            activeDropdown === `mobile-${item.name}` ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {/* Mobile Dropdown */}
                      <div
                        className={`pl-10 pr-2 transition-all duration-300 overflow-hidden ${
                          activeDropdown === `mobile-${item.name}` ? "max-h-96 py-1" : "max-h-0 py-0"
                        }`}
                      >
                        {item.dropdown.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.name}
                            to={dropdownItem.href}
                            className="flex items-center gap-x-2 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded transition-all duration-200 text-sm"
                            onClick={toggleMobileMenu}
                          >
                            {dropdownItem.icon}
                            <span>{dropdownItem.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      className="flex items-center gap-x-3 px-5 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 text-base"
                      onClick={toggleMobileMenu}
                    >
                      {item.icon}
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  )}
                </div>
              ))}

              {/* User Menu in Mobile */}
              {isAuthenticated && (
                <div className="mt-4 border-t border-slate-700/50">
                  <div className="flex items-center gap-x-2 px-5 py-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{user?.name || "User"}</p>
                      <p className="text-slate-400 text-xs">{getRoleDisplayName(user?.role)}</p>
                    </div>
                  </div>
                  {userMenuItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="flex items-center gap-x-3 px-5 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 text-base"
                      onClick={toggleMobileMenu}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </Link>
                  ))}
                  <button
                    onClick={() => {
                      handleLogout()
                      toggleMobileMenu()
                    }}
                    className="w-full flex items-center gap-x-3 px-5 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 text-base"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar
