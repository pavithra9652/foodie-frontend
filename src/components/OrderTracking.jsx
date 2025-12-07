const OrderTracking = ({ orderStatus, showLabels = true, statusHistory = null, estimatedDeliveryTime = null }) => {
  const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: '📝' },
    { key: 'confirmed', label: 'Confirmed', icon: '✅' },
    { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
    { key: 'out-for-delivery', label: 'Out for Delivery', icon: '🚚' },
    { key: 'delivered', label: 'Delivered', icon: '🎉' },
  ]

  const cancelledStep = { key: 'cancelled', label: 'Cancelled', icon: '❌' }

  const getStatusIndex = (status) => {
    if (status === 'cancelled') return -1
    return statusSteps.findIndex(step => step.key === status)
  }

  const currentIndex = getStatusIndex(orderStatus)
  const isCancelled = orderStatus === 'cancelled'

  return (
    <div className="w-full">
      {isCancelled ? (
        <div className="flex items-center justify-center p-4 bg-red-50 rounded-lg">
          <span className="text-2xl mr-2">{cancelledStep.icon}</span>
          <span className="text-lg font-semibold text-red-800">{cancelledStep.label}</span>
        </div>
      ) : (
        <div className="relative">
          {/* Estimated Delivery Time */}
          {estimatedDeliveryTime && orderStatus === 'out-for-delivery' && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Estimated Delivery:</strong>{' '}
                {new Date(estimatedDeliveryTime).toLocaleString()}
              </p>
            </div>
          )}
          
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
            <div
              className="h-full bg-primary-600 transition-all duration-500"
              style={{ width: `${(currentIndex / (statusSteps.length - 1)) * 100}%` }}
            />
          </div>

          {/* Status Steps */}
          <div className="relative flex justify-between">
            {statusSteps.map((step, index) => {
              const isActive = index <= currentIndex
              const isCurrent = index === currentIndex

              return (
                <div key={step.key} className="flex flex-col items-center" style={{ flex: 1 }}>
                  <div
                    className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-lg scale-110'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {step.icon}
                    {isCurrent && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                    )}
                  </div>
                  {showLabels && (
                    <div className="mt-2 text-center">
                      <p
                        className={`text-xs font-medium ${
                          isActive ? 'text-primary-600' : 'text-gray-400'
                        }`}
                      >
                        {step.label}
                      </p>
                      {statusHistory && isActive && (() => {
                        const statusEntry = statusHistory.find(h => h.status === step.key);
                        if (statusEntry) {
                          return (
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(statusEntry.timestamp).toLocaleString()}
                            </p>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderTracking

