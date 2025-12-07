import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import OrderTracking from '../components/OrderTracking'

const Orders = () => {
  const { token } = useSelector((state) => state.auth)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('/api/orders/my-orders', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setOrders(response.data)
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchOrders()
      // Auto-refresh every 30 seconds
      const interval = setInterval(() => {
        fetchOrders()
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [token])

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      'out-for-delivery': 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
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
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">You have no orders yet.</p>
          <Link
            to="/menu"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Start Ordering
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-semibold">{order._id.slice(-8).toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-semibold">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Order Tracking */}
              <div className="mb-4">
                <OrderTracking 
                  orderStatus={order.orderStatus} 
                  showLabels={true}
                  statusHistory={order.statusHistory}
                  estimatedDeliveryTime={order.estimatedDeliveryTime}
                />
              </div>

              <div className="flex justify-between items-center mb-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-500">Items</p>
                  <p className="font-semibold">{order.items.length} item(s)</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-xl font-bold text-primary-600">
                    ₹{order.totalAmount + 50}
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <Link
                  to={`/orders/${order._id}`}
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  View Full Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Orders




