import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'

const AdminDashboard = () => {
  const { token, user } = useSelector((state) => state.auth)
  const isSuperAdmin = user?.role === 'admin' && user?.email === 'admin@foodie.com'
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setStats(response.data)
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchStats()
    }
  }, [token])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/menu"
          className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition text-center"
        >
          <div className="text-4xl mb-4">🍽️</div>
          <h2 className="text-2xl font-bold mb-2">Manage Menu</h2>
          <p className="text-gray-600">Add, edit, or remove menu items</p>
        </Link>
        <Link
          to="/admin/orders"
          className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition text-center"
        >
          <div className="text-4xl mb-4">📦</div>
          <h2 className="text-2xl font-bold mb-2">Manage Orders</h2>
          <p className="text-gray-600">View and update order status</p>
        </Link>
        {isSuperAdmin && (
          <Link
            to="/admin/users"
            className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-4">👤</div>
            <h2 className="text-2xl font-bold mb-2">Create Admin</h2>
            <p className="text-gray-600">Add new admin users</p>
          </Link>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard






