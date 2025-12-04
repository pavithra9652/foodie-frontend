import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMenuItems, clearMenu } from '../store/slices/menuSlice'

const Home = () => {
  const dispatch = useDispatch()
  const { items, loading } = useSelector((state) => state.menu)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    // Clear old data and fetch fresh data when Home page loads
    dispatch(clearMenu())
    dispatch(fetchMenuItems()).then(() => {
      setIsInitialLoad(false)
    })
  }, [dispatch])

  const featuredItems = items.slice(0, 6)

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to Foodie</h1>
          <p className="text-xl mb-8">Delicious food delivered to your doorstep</p>
          <Link
            to="/menu"
            className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block"
          >
            Order Now
          </Link>
        </div>
      </section>

      {/* Featured Items */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Featured Items</h2>
        {(loading || isInitialLoad) ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading fresh menu items...</p>
          </div>
        ) : (
          <>
            {featuredItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredItems.map((item) => (
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
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary-600">
                          ₹{item.price}
                        </span>
                        <Link
                          to="/menu"
                          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-12">No items available</p>
            )}
          </>
        )}
      </section>
    </div>
  )
}

export default Home






