import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { fetchCart, clearCartState } from '../store/slices/cartSlice'
import axios from 'axios'

const Checkout = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items, totalAmount } = useSelector((state) => state.cart)
  const { user, token } = useSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    deliveryAddress: user?.address || '',
    phone: user?.phone || '',
  })
  const [loading, setLoading] = useState(false)
  const [orderData, setOrderData] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    dispatch(fetchCart())
    if (items.length === 0) {
      navigate('/cart')
    }
  }, [dispatch, items.length, navigate])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }


  const handleCheckout = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccessMessage('')

    try {
      // Create order with payment completed directly
      const orderResponse = await axios.post(
        '/api/orders/create-direct',
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      if (orderResponse.data.message && orderResponse.data.order) {
        // Clear cart from Redux state
        dispatch(clearCartState())
        
        // Show success message
        setSuccessMessage('Payment Done! Order placed successfully.')
        setOrderData(orderResponse.data.order)
        
        // Navigate to orders page after a short delay
        setTimeout(() => {
          navigate('/orders')
        }, 1500)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to create order. Please try again.'
      alert(errorMessage)
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <span className="text-2xl">✅</span>
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Delivery Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Delivery Information</h2>
          <form onSubmit={handleCheckout} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Address
              </label>
              <textarea
                name="deliveryAddress"
                required
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={formData.deliveryAddress}
                onChange={handleChange}
                placeholder="Enter your delivery address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </div>
            <button
              type="submit"
              disabled={loading || successMessage}
              className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition font-semibold disabled:opacity-50"
            >
              {loading ? 'Processing...' : successMessage ? 'Payment Done!' : 'Proceed to Pay'}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div key={item._id} className="flex justify-between">
                <span>
                  {item.menuItem?.name} x {item.quantity}
                </span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{totalAmount}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>₹50</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total</span>
              <span>₹{totalAmount + 50}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout

