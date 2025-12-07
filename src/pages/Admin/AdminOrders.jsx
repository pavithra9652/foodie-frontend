import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import OrderTracking from '../../components/OrderTracking'

const AdminOrders = () => {
  const { token } = useSelector((state) => state.auth)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchOrders()
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchOrders()
    }, 30000)

    return () => clearInterval(interval)
  }, [statusFilter])

  const fetchOrders = async () => {
    try {
      const url = statusFilter
        ? `/api/admin/orders?status=${statusFilter}`
        : '/api/admin/orders'
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setOrders(response.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await axios.put(
        `/api/admin/orders/${orderId}/status`,
        { orderStatus: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      fetchOrders()
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Failed to update order status')
    }
  }

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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Order Management</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">All Orders</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="preparing">Preparing</option>
          <option value="out-for-delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-semibold">{order._id.slice(-8).toUpperCase()}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Customer: {order.user?.name} ({order.user?.email})
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Order Date</p>
                <p className="font-semibold">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(
                    order.orderStatus
                  )}`}
                >
                  {order.orderStatus.charAt(0).toUpperCase() +
                    order.orderStatus.slice(1).replace('-', ' ')}
                </span>
              </div>
            </div>

            {/* Order Tracking Timeline */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-3">Order Progress:</p>
              <OrderTracking 
                orderStatus={order.orderStatus} 
                showLabels={true}
                statusHistory={order.statusHistory}
                estimatedDeliveryTime={order.estimatedDeliveryTime}
              />
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Items:</p>
              <div className="space-y-1">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-gray-500">Delivery Address</p>
                <p className="font-semibold">{order.deliveryAddress}</p>
                <p className="text-sm text-gray-500">Phone: {order.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-2xl font-bold text-primary-600">
                  ₹{order.totalAmount + 50}
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Update Status:</p>
              <div className="flex flex-wrap gap-2">
                {['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(order._id, status)}
                      disabled={order.orderStatus === status}
                      className={`px-3 py-1 rounded text-sm transition ${
                        order.orderStatus === status
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No orders found</p>
        </div>
      )}
    </div>
  )
}

export default AdminOrders




