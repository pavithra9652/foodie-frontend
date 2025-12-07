import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import { fetchCart } from '../../store/slices/cartSlice'

const Navbar = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, token } = useSelector((state) => state.auth)
  const { items } = useSelector((state) => state.cart)

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  // All admins can access admin features
  const isAdmin = user?.role === 'admin'
  const isSuperAdmin = user?.role === 'admin' && user?.email === 'admin@foodie.com'

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  useEffect(() => {
    if (token) {
      dispatch(fetchCart())
    }
  }, [token, dispatch])

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary-600">🍔 Foodie</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {/* Hide Home and Menu for admin */}
            {!isAdmin && (
              <>
                <Link
                  to="/"
                  className="text-gray-700 hover:text-primary-600 transition"
                >
                  Home
                </Link>
                <Link
                  to="/menu"
                  className="text-gray-700 hover:text-primary-600 transition"
                >
                  Menu
                </Link>
              </>
            )}
            {token ? (
              <>
                {/* Hide Cart and Orders for admin */}
                {!isAdmin && (
                  <>
                    <Link
                      to="/cart"
                      className="relative text-gray-700 hover:text-primary-600 transition"
                    >
                      Cart
                      {cartItemCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {cartItemCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/orders"
                      className="text-gray-700 hover:text-primary-600 transition"
                    >
                      Orders
                    </Link>
                  </>
                )}
                {/* Show Admin link only for admin */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="text-gray-700 hover:text-primary-600 transition"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-primary-600 transition"
                >
                  Logout
                </button>
                <span className="text-sm text-gray-600">{user?.name}</span>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu */}
          <div className="md:hidden flex items-center space-x-4">
            {/* Hide cart for admin on mobile too */}
            {token && !isAdmin && (
              <Link
                to="/cart"
                className="relative text-gray-700"
              >
                <span className="text-xl">🛒</span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            )}
            {!token && (
              <>
                <Link
                  to="/login"
                  className="group relative flex justify-center py-2 px-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="group relative flex justify-center py-2 px-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

