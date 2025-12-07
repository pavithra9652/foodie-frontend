import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { API_URL } from '../../config.js'  


// Fetch menu items
export const fetchMenuItems = createAsyncThunk(
  'menu/fetchMenuItems',
  async (category = null, { rejectWithValue }) => {
    try {
      const url = category 
        ? `${API_URL}/api/menu?category=${category}`
        : `${API_URL}/api/menu`

      const response = await axios.get(url)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch menu'
      )
    }
  }
)

const menuSlice = createSlice({
  name: 'menu',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearMenu: (state) => {
      state.items = []
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenuItems.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMenuItems.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchMenuItems.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearMenu } = menuSlice.actions
export default menuSlice.reducer






