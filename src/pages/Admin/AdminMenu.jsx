import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'

const AdminMenu = () => {
  const { token, user } = useSelector((state) => state.auth)
  const isSuperAdmin = user?.role === 'admin' && user?.email === 'admin@foodie.com'
  const [menuItems, setMenuItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [newCategory, setNewCategory] = useState({ name: '', displayName: '' })
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    available: true,
    preparationTime: 20,
  })

  useEffect(() => {
    fetchMenuItems()
    fetchCategories()
  }, [])

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get('/api/admin/menu', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMenuItems(response.data)
    } catch (error) {
      console.error('Error fetching menu items:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      // Try to fetch from admin endpoint (super admin only)
      // If not super admin, fall back to public categories endpoint
      try {
        const response = await axios.get('/api/admin/categories', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const fetchedCategories = response.data
        setCategories(fetchedCategories)
        // Set default category if none selected and categories exist
        if (!formData.category && fetchedCategories.length > 0) {
          setFormData(prev => ({ ...prev, category: fetchedCategories[0].name }))
        }
      } catch (adminError) {
        // If admin endpoint fails, try public endpoint
        const publicResponse = await axios.get('/api/menu/categories')
        const fetchedCategories = publicResponse.data
        setCategories(fetchedCategories)
        // Set default category if none selected and categories exist
        if (!formData.category && fetchedCategories.length > 0) {
          setFormData(prev => ({ ...prev, category: fetchedCategories[0].name }))
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      // Fallback to public categories
      try {
        const publicResponse = await axios.get('/api/menu/categories')
        const fetchedCategories = publicResponse.data
        setCategories(fetchedCategories)
        if (!formData.category && fetchedCategories.length > 0) {
          setFormData(prev => ({ ...prev, category: fetchedCategories[0].name }))
        }
      } catch (fallbackError) {
        console.error('Error fetching public categories:', fallbackError)
      }
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingItem) {
        await axios.put(
          `/api/admin/menu/${editingItem._id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
      } else {
        await axios.post(
          '/api/admin/menu',
          formData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
      }
      setShowModal(false)
      setEditingItem(null)
      setFormData({
        name: '',
        description: '',
        price: '',
        category: categories.length > 0 ? categories[0].name : '',
        image: '',
        available: true,
        preparationTime: 20,
      })
      fetchMenuItems()
      fetchCategories()
    } catch (error) {
      console.error('Error saving menu item:', error)
      alert(error.response?.data?.message || 'Failed to save menu item')
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image,
      available: item.available,
      preparationTime: item.preparationTime,
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return
    }
    try {
      await axios.delete(`/api/admin/menu/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchMenuItems()
    } catch (error) {
      console.error('Error deleting menu item:', error)
      alert('Failed to delete menu item')
    }
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/admin/categories', newCategory, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setNewCategory({ name: '', displayName: '' })
      setShowCategoryModal(false)
      fetchCategories()
      alert('Category added successfully!')
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add category')
    }
  }

  const handleDeleteCategory = async (id, categoryName) => {
    if (!window.confirm(`Are you sure you want to delete the category "${categoryName}"?`)) {
      return
    }
    try {
      await axios.delete(`/api/admin/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchCategories()
      // If deleted category was selected, reset to first category
      if (formData.category === categoryName && categories.length > 1) {
        const remainingCategories = categories.filter(c => c._id !== id)
        if (remainingCategories.length > 0) {
          setFormData(prev => ({ ...prev, category: remainingCategories[0].name }))
        }
      }
      alert('Category deleted successfully!')
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete category')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Menu Management</h1>
        <div className="flex gap-3">
          {isSuperAdmin && (
            <button
              onClick={() => setShowCategoryModal(true)}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Manage Categories
            </button>
          )}
          <button
            onClick={() => {
              setEditingItem(null)
              setFormData({
                name: '',
                description: '',
                price: '',
                category: categories.length > 0 ? categories[0].name : '',
                image: '',
                available: true,
                preparationTime: 20,
              })
              setShowModal(true)
            }}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            Add New Item
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <div
            key={item._id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold">{item.name}</h3>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    item.available
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {item.available ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-2">{item.description}</p>
              <p className="text-lg font-bold text-primary-600 mb-4">
                ₹{item.price}
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  required
                  rows="3"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input
                  type="number"
                  name="price"
                  required
                  min="0"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  name="category"
                  required
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {categories.length === 0 ? (
                    <option value="">No categories available. Please add a category first.</option>
                  ) : (
                    categories.map((cat) => (
                      <option key={cat._id} value={cat.name}>
                        {cat.displayName}
                      </option>
                    ))
                  )}
                </select>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(true)}
                  className="mt-2 text-sm text-primary-600 hover:text-primary-700"
                >
                  + Add New Category
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input
                  type="url"
                  name="image"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.image}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Preparation Time (minutes)
                </label>
                <input
                  type="number"
                  name="preparationTime"
                  min="0"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.preparationTime}
                  onChange={handleChange}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="available"
                  className="mr-2"
                  checked={formData.available}
                  onChange={handleChange}
                />
                <label className="text-sm font-medium">Available</label>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition"
                >
                  {editingItem ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingItem(null)
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Manage Categories</h2>
            
            {/* Add Category Form */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Add New Category</h3>
              <form onSubmit={handleAddCategory} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Category Name (internal)</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="e.g., main-course"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value.toLowerCase() })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Display Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="e.g., Main Course"
                    value={newCategory.displayName}
                    onChange={(e) => setNewCategory({ ...newCategory, displayName: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                >
                  Add Category
                </button>
              </form>
            </div>

            {/* Existing Categories */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Existing Categories</h3>
              {categories.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No categories found. Add one above.</p>
              ) : (
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <div
                      key={cat._id}
                      className="flex items-center justify-between p-3 bg-white border rounded-lg"
                    >
                      <div>
                        <p className="font-semibold">{cat.displayName}</p>
                        <p className="text-sm text-gray-500">{cat.name}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(cat._id, cat.name)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => {
                  setShowCategoryModal(false)
                  setNewCategory({ name: '', displayName: '' })
                }}
                className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminMenu






