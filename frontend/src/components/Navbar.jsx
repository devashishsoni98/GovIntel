"use client"

import { useState, useEffect, useRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Shield, Menu, X, LogOut, User, ChevronDown } from "lucide-react"
import { selectIsAuthenticated, selectUser, logoutUser, USER_ROLES } from "../redux/slices/authSlice"

const Navbar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectUser)

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  
  const userMenuRef = useRef(null)
  const mobileMenuRef = useRef(null)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsUserMenuOpen(false)
  }, [location])

  const handleLogout = async () => {
    await dispatch(logoutUser())
    navigate("/")
  }

  const getNavLinks = () => {
    if (!isAuthenticated) {
      return [
        { name: "Home", href: "/", current: location.pathname === "/" },
        { name: "Features", href: "/features", current: false },
        { name: "How It Works", href: "/how-it-works", current: false },
      ]
    }

    const baseLinks = [
      { name: "Dashboard", href: "/dashboard", current: location.pathname === "/dashboard" },
    ]

    switch (user?.role) {
      case USER_ROLES.CITIZEN:
        return [
          ...baseLinks,
          { name: "My Grievances", href: "/my-grievances", current: location.pathname === "/my-grievances" },
          { name: "Submit Complaint", href: "/submit-complaint", current: location.pathname === "/submit-complaint" },
        ]
      case USER_ROLES.OFFICER:
        return [
          ...baseLinks,
          { name: "Assigned Cases", href: "/assigned-cases", current: location.pathname === "/assigned-cases" },
        ]
      case USER_ROLES.ADMIN:
        return [
          ...baseLinks,
          { name: "User Management", href: "/user-management", current: location.pathname === "/user-management" },
          { name: "Analytics", href: "/analytics", current: location.pathname === "/analytics" },
        ]
      default:
        return baseLinks
    }
  }

  const navLinks = getNavLinks()

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${isScrolled 
          ? "bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 shadow-xl shadow-slate-900/20" 
          : "bg-slate-900/80 backdrop-blur-sm"
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-x-2 group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              GovIntel
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`
                  px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base font-medium transition-all duration-300 hover:scale-105
                  ${link.current
                    ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                  }
                `}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-x-2 sm:gap-x-4">
            {isAuthenticated ? (
              /* User Menu */
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-x-2 sm:gap-x-3 p-2 rounded-lg hover:bg-slate-700/50 transition-all duration-300 hover:scale-105"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm sm:text-base">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-white font-medium text-sm">{user?.name}</p>
                    <p className="text-slate-400 text-xs capitalize">{user?.role}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isUserMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-xl shadow-slate-900/20 py-2 animate-fade-in">
                    <div className="px-4 py-3 border-b border-slate-700/50">
                      <p className="text-white font-medium">{user?.name}</p>
                      <p className="text-slate-400 text-sm">{user?.email}</p>
                      <p className="text-slate-500 text-xs capitalize mt-1">{user?.role}</p>
                    </div>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-x-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Sign In Button */
              <Link
                to="/signin"
                className="bg-gradient-to-r from-purple-500 to-blue-500 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-white font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 text-sm sm:text-base"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-300"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div 
            ref={mobileMenuRef}
            className="md:hidden absolute top-full left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 shadow-xl shadow-slate-900/20 animate-fade-in"
          >
            <div className="px-4 py-6 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`
                    block px-4 py-3 rounded-lg text-base font-medium transition-all duration-300
                    ${link.current
                      ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                    }
                  `}
                >
                  {link.name}
                </Link>
              ))}
              
              {isAuthenticated && (
                <div className="pt-4 border-t border-slate-700/50">
                  <div className="px-4 py-2">
                    <p className="text-white font-medium">{user?.name}</p>
                    <p className="text-slate-400 text-sm">{user?.email}</p>
                    <p className="text-slate-500 text-xs capitalize mt-1">{user?.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-x-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300 rounded-lg"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar