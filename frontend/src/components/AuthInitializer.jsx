"use client"

import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { initializeAuth } from "../redux/slices/authSlice"

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch()

  useEffect(() => {
    // Initialize auth state from localStorage on app start
    dispatch(initializeAuth())
  }, [dispatch])

  return children
}

export default AuthInitializer
