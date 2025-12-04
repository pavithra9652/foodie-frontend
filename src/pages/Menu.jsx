import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMenuItems } from '../store/slices/menuSlice'
import { addToCart, updateCartItem, removeFromCart, fetchCart } from '../store/slices/cartSlice'
import axios from 'axios'

const Menu = () => {
  const dispatch = useDispatch()
  const { items, loading } = useSelector((state) => state.menu)
  const { items: cartItems } = useSelector((state) => state.cart)
  const { token, user } = useSelector((state) => state.auth)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [allItems, setAllItems] = useState([]) // Store all items to determine which categories have items
  
  // All admins can access admin features
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    fetchCategories()
    fetchAllItems() // Fetch all items once to determine categories
    if (token) {
      dispatch(fetchCart())
    }
  }, [dispatch, token])

  useEffect(() => {
    // Fetch filtered items based on selected category
    const category = selectedCategory === 'all' ? null : selectedCategory
    dispatch(fetchMenuItems(category))
  }, [dispatch, selectedCategory])

  const fetchAllItems = async () => {
    try {
      const response = await axios.get('/api/menu')
      if (response.data && Array.isArray(response.data)) {
        setAllItems(response.data)
      }
    } catch (error) {
      console.error('Error fetching all items:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/menu/categories')
      if (response.data && Array.isArray(response.data)) {
        setCategories(response.data)
      } else {
        console.warn('Categories data is not an array:', response.data)
        setCategories([])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
    } finally {
      setLoadingCategories(false)
    }
  }

  // Group items by category using database categories order (for determining which categories have items)
  const groupItemsByCategory = (itemsToGroup = allItems) => {
    const grouped = {}
    
    // Initialize groups based on database categories order
    if (Array.isArray(categories)) {
      categories.forEach(cat => {
        if (cat && cat.name) {
          grouped[cat.name] = []
        }
      })
    }
    
    // Add items to their respective categories
    if (Array.isArray(itemsToGroup)) {
      itemsToGroup.forEach(item => {
        if (item && item.category) {
          const categoryName = item.category.toLowerCase()
          if (!grouped[categoryName]) {
            grouped[categoryName] = []
          }
          grouped[categoryName].push(item)
        }
      })
    }
    
    return grouped
  }

  // Get display name for category from database
  const getCategoryDisplayName = (categoryName) => {
    const category = categories.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase())
    if (category) {
      return category.displayName
    }
    // Fallback: format the category name if not found in database
    return categoryName.charAt(0).toUpperCase() + categoryName.slice(1).replace('-', ' ')
  }

  // Get categories that have items (for category filter buttons)
  // Use allItems to determine which categories have items, not filtered items
  const getCategoriesWithItems = () => {
    if (!Array.isArray(categories) || !Array.isArray(allItems)) return []
    const grouped = groupItemsByCategory(allItems) // Use allItems instead of filtered items
    return categories.filter(cat => {
      if (!cat || !cat.name) return false
      const itemCount = grouped[cat.name]?.length || 0
      return itemCount > 0
    }).sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''))
  }

  // Get categories in order from database, only showing categories that have items (for grouped display)
  const getCategoriesWithItemsForDisplay = () => {
    if (!Array.isArray(categories)) return []
    const groupedItems = groupItemsByCategory()
    return categories
      .filter(cat => cat && cat.name && groupedItems[cat.name] && groupedItems[cat.name].length > 0)
      .sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''))
  }

  const getCartItem = (menuItemId) => {
    return cartItems.find(item => item.menuItem?._id === menuItemId || item.menuItem === menuItemId)
  }

  const handleAddToCart = (itemId) => {
    if (isAdmin) {
      alert('Admin users cannot add items to cart')
      return
    }
    if (!token) {
      alert('Please login to add items to cart')
      return
    }
    dispatch(addToCart({ menuItemId: itemId, quantity: 1 }))
  }

  const handleQuantityChange = (itemId, newQuantity) => {
    if (isAdmin) {
      alert('Admin users cannot modify cart')
      return
    }
    const cartItem = getCartItem(itemId)
    if (!cartItem) return
    
    if (newQuantity <= 0) {
      dispatch(removeFromCart(cartItem._id))
    } else {
      dispatch(updateCartItem({ itemId: cartItem._id, quantity: newQuantity }))
    }
  }

  const renderCartControls = (item) => {
    // Don't show cart controls for admin users
    if (isAdmin) {
      return (
        <button
          disabled
          className="w-full bg-gray-300 text-gray-600 py-3 rounded-xl cursor-not-allowed font-semibold"
        >
          Admin View Only
        </button>
      )
    }
    
    const cartItem = getCartItem(item._id)
    const quantity = cartItem?.quantity || 0
    
    if (quantity > 0) {
      return (
        <div className="flex items-center justify-between bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-2">
          <button
            onClick={() => handleQuantityChange(item._id, quantity - 1)}
            className="w-10 h-10 rounded-full bg-primary-600 text-white hover:bg-primary-700 flex items-center justify-center font-bold text-lg transition-all hover:scale-110 shadow-md"
          >
            −
          </button>
          <span className="text-lg font-bold text-primary-700 px-4">{quantity}</span>
          <button
            onClick={() => handleQuantityChange(item._id, quantity + 1)}
            className="w-10 h-10 rounded-full bg-primary-600 text-white hover:bg-primary-700 flex items-center justify-center font-bold text-lg transition-all hover:scale-110 shadow-md"
          >
            +
          </button>
        </div>
      )
    } else {
      return (
        <button
          onClick={() => handleAddToCart(item._id)}
          className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Add to Cart 🛒
        </button>
      )
    }
  }

  // Get category icon/emoji
  const getCategoryIcon = (categoryName) => {
    const icons = {
      'appetizer': '🍤',
      'main-course': '🍽️',
      'dessert': '🍰',
      'beverage': '🥤',
      'salad': '🥗',
      'soup': '🍲'
    }
    return icons[categoryName.toLowerCase()] || '🍴'
  }

  // Get count of items in category
  const getCategoryItemCount = (categoryName) => {
    if (selectedCategory === 'all') {
      const grouped = groupItemsByCategory()
      return grouped[categoryName]?.length || 0
    }
    return selectedCategory === categoryName ? items.length : 0
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Menu</h1>

      {/* Category Filter - Centered */}
      <div className="mb-6 flex justify-center">
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg ${
              selectedCategory === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          {getCategoriesWithItems().map((category) => (
            <button
              key={category._id}
              onClick={() => setSelectedCategory(category.name)}
              className={`px-4 py-2 rounded-lg ${
                selectedCategory === category.name
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category.displayName}
            </button>
          ))}
        </div>
      </div>

        {loading || loadingCategories ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : selectedCategory === 'all' ? (
          // Show all items in a single grid without category grouping
          items.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No items available. Please run the seed script to add menu items.</p>
          ) : (
            <div className="flex justify-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl">
                {items.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold text-primary-600">
                          ₹{item.price}
                        </span>
                      </div>
                      {renderCartControls(item)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ) : (
          // Show filtered items for selected category
          <>
            <h2 className="text-2xl font-bold mb-4 text-center">
              {getCategoryDisplayName(selectedCategory)}
            </h2>
            {items.length === 0 ? (
              <p className="text-center text-gray-500 py-12">No items found</p>
            ) : (
              <div className="flex justify-center">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl">
                  {items.map((item) => (
                    <div
                      key={item._id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-2xl font-bold text-primary-600">
                            ₹{item.price}
                          </span>
                        </div>
                        {renderCartControls(item)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
    </div>
  )
}

export default Menu






