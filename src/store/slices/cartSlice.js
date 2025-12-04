import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// Use proxy in development, direct URL in production
const API_URL = import.meta.env.DEV ? '/api' : import.meta.env.VITE_API_URL || '/api'

// Helper to get auth headers
const getAuthHeaders = (getState) => {
  const token = getState().auth.token || localStorage.getItem('token')
  if (!token) {
    throw new Error('No authentication token found')
  }
  return {
    headers: { Authorization: `Bearer ${token}` }
  }
}

// Get cart
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState)
      const response = await axios.get(`${API_URL}/cart`, headers)
      return response.data
    } catch (error) {
      if (error.response?.status === 401) {
        // Clear invalid token
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart')
    }
  }
)

// Add to cart
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ menuItemId, quantity }, { getState, rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/cart/add`,
        { menuItemId, quantity },
        getAuthHeaders(getState)
      )
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to cart')
    }
  }
)

// Update cart item
export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity }, { getState, rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/cart/update/${itemId}`,
        { quantity },
        getAuthHeaders(getState)
      )
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart')
    }
  }
)

// Remove from cart
export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId, { getState, rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_URL}/cart/remove/${itemId}`,
        getAuthHeaders(getState)
      )
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from cart')
    }
  }
)

// Clear cart
export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { getState, rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_URL}/cart/clear`,
        getAuthHeaders(getState)
      )
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear cart')
    }
  }
)

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    totalAmount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearCartState: (state) => {
      state.items = []
      state.totalAmount = 0
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items || []
        state.totalAmount = action.payload.totalAmount || 0
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload.items || []
        state.totalAmount = action.payload.totalAmount || 0
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.items = action.payload.items || []
        state.totalAmount = action.payload.totalAmount || 0
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = action.payload.items || []
        state.totalAmount = action.payload.totalAmount || 0
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.items = []
        state.totalAmount = 0
      })
  },
})

export const { clearCartState } = cartSlice.actions
export default cartSlice.reducer

