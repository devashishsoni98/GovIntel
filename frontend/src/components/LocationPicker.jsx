import React, { useState, useEffect } from "react"
import { FaMapMarkerAlt } from "react-icons/fa"

const LocationPicker = ({ onLocationChange, initialLocation }) => {
  const [location, setLocation] = useState({
    address: "",
    coordinates: { lat: 0, lng: 0 },
    ...initialLocation,
  })
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)

  useEffect(() => {
    if (onLocationChange) {
      onLocationChange(location)
    }
  }, [location, onLocationChange])

  const handleAddressChange = (e) => {
    setLocation(prev => ({
      ...prev,
      address: e.target.value,
    }))
  }

  const handleCoordinateChange = (field, value) => {
    const numValue = parseFloat(value) || 0
    setLocation(prev => ({
      ...prev,
      coordinates: {
        ...prev.coordinates,
        [field]: numValue,
      },
    }))
  }

  const getCurrentLocation = () => {
    setIsLoadingLocation(true)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setLocation(prev => ({
            ...prev,
            address: prev.address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            coordinates: {
              lat: latitude,
              lng: longitude,
            },
          }))
          setIsLoadingLocation(false)
        },
        () => {
          setIsLoadingLocation(false)
          alert("Unable to retrieve your location")
        }
      )
    } else {
      setIsLoadingLocation(false)
      alert("Geolocation is not supported by this browser")
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <input
          type="text"
          value={location.address}
          onChange={handleAddressChange}
          placeholder="Enter address or location description"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <button
        type="button"
        onClick={getCurrentLocation}
        disabled={isLoadingLocation}
        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 flex items-center gap-2"
      >
        <FaMapMarkerAlt className="w-4 h-4" />
        {isLoadingLocation ? "Getting Location..." : "Use Current Location"}
      </button>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Latitude
          </label>
          <input
            type="number"
            step="any"
            value={location.coordinates.lat}
            onChange={(e) => handleCoordinateChange("lat", e.target.value)}
            placeholder="0.000000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Longitude
          </label>
          <input
            type="number"
            step="any"
            value={location.coordinates.lng}
            onChange={(e) => handleCoordinateChange("lng", e.target.value)}
            placeholder="0.000000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
      </div>
    </div>
  )
}

export default LocationPicker