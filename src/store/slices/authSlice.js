import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// Use proxy in development, direct URL in production
const API_URL = import.meta.env.DEV ? '/api' : import.meta.env.VITE_API_URL || '/api'

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_URL,
})

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only clear token for 401 on authenticated routes, not login/register
    const url = error.config?.url || ''
    const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/register')
    
    if (error.response?.status === 401 && !isAuthRoute) {
      // Clear invalid token only for authenticated routes
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    return Promise.reject(error)
  }
)

// Load user from localStorage
const loadUserFromStorage = () => {
  try {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    if (token && userStr) {
      return { token, user: JSON.parse(userStr) }
    }
  } catch (error) {
    console.error('Error loading user from storage:', error)
  }
  return { token: null, user: null }
}

const initialState = {
  user: loadUserFromStorage().user,
  token: loadUserFromStorage().token,
  loading: false,
  error: null,
}

// Register
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      // Use regular axios for register (not the api instance with interceptors)
      const response = await axios.post(`${API_URL}/auth/register`, userData)
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      return response.data
    } catch (error) {
      // Return the actual error message from backend
      console.error('Registration error:', error)
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Registration failed'
      return rejectWithValue(errorMessage)
    }
  }
)

// Login
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      // Use regular axios for login (not the api instance with interceptors)
      // Make sure we're using the proxy path
      const loginUrl = `${API_URL}/auth/login`
      console.log('Login URL:', loginUrl)
      
      const response = await axios.post(loginUrl, credentials, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      // Store token and user in localStorage
      if (response.data.token && response.data.user) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        console.log('Login successful, token stored')
      }
      
      return response.data
    } catch (error) {
      console.error('Login API error:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      
      // Return the actual error message from backend
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Login failed'
      return rejectWithValue(errorMessage)
    }
  }
)

// Get current user
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/me')
      return response.data.user
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get user')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.error = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get current user
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload
      })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer

