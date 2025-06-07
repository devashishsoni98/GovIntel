import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import {
  Shield,
  Menu,
  X,
  ChevronDown,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  FileText,
  Calendar,
  HelpCircle,
  Phone,
  Building,
  Database,
} from "lucide-react"

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
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

  // Navigation options
  const navigationItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <Shield className="w-4 h-4" />,
    },
    {
      name: "Reports",
      href: "#",
      icon: <FileText className="w-4 h-4" />,
      dropdown: [
        { name: "Monthly Reports", href: "/reports/monthly", icon: <Calendar className="w-4 h-4" /> },
        { name: "Department Reports", href: "/reports/departments", icon: <Building className="w-4 h-4" /> },
        { name: "Custom Reports", href: "/reports/custom", icon: <Settings className="w-4 h-4" /> },
        { name: "Export Data", href: "/reports/export", icon: <Database className="w-4 h-4" /> },
      ],
    },
    {
      name: "Sign In",
      href: "/signin",
      icon: <LogOut className="w-4 h-4" />,
    },
  ]

  const userMenuItems = [
    { name: "Profile", href: "/profile", icon: <User className="w-4 h-4" /> },
    { name: "Settings", href: "/settings", icon: <Settings className="w-4 h-4" /> },
    { name: "Help Center", href: "/help", icon: <HelpCircle className="w-4 h-4" /> },
    { name: "Contact Support", href: "/contact", icon: <Phone className="w-4 h-4" /> },
    { name: "Sign Out", href: "/signin", icon: <LogOut className="w-4 h-4" /> },
  ]

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50 shadow-2xl"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-screen-xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2 sm:py-3 md:py-4 gap-x-2">
            {/* Logo (text only on xl and above) */}
            <Link to="/" className="flex items-center gap-x-2 group cursor-pointer min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              {/* Only show text on xl and up */}
              <span className="hidden xl:inline text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent truncate">
                GovIntel
              </span>
            </Link>

            {/* Desktop Navigation (only ≥xl: 1280px) */}
            <div className="hidden xl:flex items-center gap-x-4 2xl:gap-x-8 min-w-0 flex-shrink">
              {navigationItems.map((item) => (
                <div key={item.name} className="relative" ref={dropdownRef}>
                  {item.dropdown ? (
                    <button
                      onClick={() => toggleDropdown(item.name)}
                      className="group flex items-center gap-x-1 text-slate-300 hover:text-white transition-colors duration-300 py-2 relative text-base"
                    >
                      {item.icon}
                      <span className="font-medium">{item.name}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${
                          activeDropdown === item.name ? "rotate-180" : ""
                        }`}
                      />
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 group-hover:w-full transition-all duration-300"></span>
                    </button>
                  ) : (
                    <Link
                      to={item.href}
                      className="group flex items-center gap-x-1 text-slate-300 hover:text-white transition-colors duration-300 py-2 relative text-base"
                    >
                      {item.icon}
                      <span className="font-medium">{item.name}</span>
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 group-hover:w-full transition-all duration-300"></span>
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
            <div className="hidden xl:flex items-center gap-x-3 2xl:gap-x-4 min-w-0">
              {/* Search Bar */}
              <div className="relative min-w-0">
                <div
                  className={`flex items-center bg-slate-700/50 border border-slate-600/50 rounded-xl transition-all duration-300 ${
                    isSearchFocused ? "ring-2 ring-purple-500/50 border-purple-500/50 w-56 xl:w-80" : "w-40 xl:w-64"
                  }`}
                >
                  <Search className="w-5 h-5 text-slate-400 ml-3" />
                  <input
                    type="text"
                    placeholder="Search grievances, reports..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="w-full px-2 py-2 bg-transparent text-white placeholder-slate-400 focus:outline-none text-sm"
                  />
                </div>
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-slate-400 hover:text-white transition-colors duration-300 hover:bg-slate-700/50 rounded-lg">
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

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
                      : "opacity-0 invisible transform -translate-y-2"
                  }`}
                >
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-slate-700/50">
                      <p className="text-white font-medium text-sm">John Doe</p>
                      <p className="text-slate-400 text-xs">Municipal Administrator</p>
                    </div>
                    {userMenuItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center gap-x-3 px-4 py-2 transition-all duration-200 text-sm ${
                          item.name === "Sign Out"
                            ? "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                        }`}
                      >
                        {item.icon}
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Hamburger Menu (≤lg: 1024px and below) */}
            <div className="flex xl:hidden items-center">
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

      {/* Mobile Menu Overlay (z-[100] to be above everything) */}
      <div
        className={`fixed inset-0 z-[100] xl:hidden transition-all duration-500 ${
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
              <Link
                to="/"
                className="flex items-center gap-x-2 min-w-0"
                onClick={toggleMobileMenu}
              >
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
            <div className="p-3 border-b border-slate-700/50">
              <div className="flex items-center bg-slate-700/50 border border-slate-600/50 rounded-xl">
                <Search className="w-5 h-5 text-slate-400 ml-2" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full px-2 py-2 bg-transparent text-white placeholder-slate-400 focus:outline-none text-sm"
                />
              </div>
            </div>

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
                        style={{
                          transition: "max-height 0.3s cubic-bezier(0.4,0,0.2,1)",
                        }}
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
              <div className="mt-4 border-t border-slate-700/50">
                <div className="flex items-center gap-x-2 px-5 py-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">John Doe</p>
                    <p className="text-slate-400 text-xs">Municipal Administrator</p>
                  </div>
                </div>
                {userMenuItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-x-3 px-5 py-3 transition-all duration-200 text-base ${
                      item.name === "Sign Out"
                        ? "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                    }`}
                    onClick={toggleMobileMenu}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar
