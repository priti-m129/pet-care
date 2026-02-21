import React, { useContext, useState, useEffect } from 'react';
import { ConfigContext } from '../../contexts/ConfigContext';

const AdminOrders = () => {
  const config = useContext(ConfigContext);
  const { surface_color: surface, text_color: text, font_size: fontSize } = config;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [viewModal, setViewModal] = useState({ isOpen: false, order: null });
  
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/orders/all');
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        } else {
          console.error("Failed to fetch all orders");
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllOrders();
  }, []);

  const handleDelete = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        const response = await fetch(`http://localhost:8080/api/orders/${orderId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setOrders(orders.filter(order => order.id !== orderId));
          alert("Order deleted successfully.");
        } else {
          alert("Failed to delete order.");
        }
      } catch (error) {
        console.error("Error deleting order:", error);
        alert("An error occurred.");
      }
    }
  };

  const handleStatusUpdate = async () => {
    setUpdating(true);
    try {
      const response = await fetch(`http://localhost:8080/api/orders/${viewModal.order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setOrders(orders.map(o => o.id === viewModal.order.id ? { ...o, status: newStatus } : o));
        setViewModal({ ...viewModal, order: { ...viewModal.order, status: newStatus }});
        alert("Status updated successfully!");
      } else {
        alert("Failed to update status.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Network error.");
    } finally {
      setUpdating(false);
    }
  };

  const openModal = (order) => {
    setViewModal({ isOpen: true, order: order });
    setNewStatus(order.status || 'Processing'); 
  };

  return (
    <div className="p-6 rounded-3xl shadow-md" style={{ background: surface }}>
      <h3 className="font-bold mb-6" style={{ fontSize: `${fontSize * 1.5}px`, color: text }}>All Orders</h3>
      
      {loading ? (
        <p className="text-center opacity-70">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-center opacity-50">No orders found in the system.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer ID</th>
                <th className="p-3">Items</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                let itemCount = 0;
                try {
                  const items = JSON.parse(order.itemsJson || "[]");
                  itemCount = items.length;
                } catch (e) { itemCount = 0; }

                return (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3">#{order.id}</td>
                    <td className="p-3 font-semibold text-gray-600">User ID: {order.userId}</td>
                    <td className="p-3 text-sm text-gray-600">{itemCount} Items</td>
                    <td className="p-3 font-bold">${order.total}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold w-fit ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>{order.status || 'Processing'}</span>
                    </td>
                    <td className="p-3 flex gap-2">
                      <button 
                        onClick={() => openModal(order)} 
                        className="text-sm text-blue-600 hover:underline font-semibold"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => handleDelete(order.id)}
                        className="text-sm text-red-600 hover:underline font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* --- VIEW DETAILS MODAL --- */}
      {viewModal.isOpen && viewModal.order && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 relative transition-all transform scale-100">
            
            <button 
              onClick={() => setViewModal({ isOpen: false, order: null })}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold"
            >
              ✕
            </button>

            <h3 className="text-2xl font-bold mb-4" style={{ color: text }}>Order #{viewModal.order.id}</h3>

            {/* --- TRACKING CONTROL (Expanded Options) --- */}
            <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100">
              <p className="text-sm font-bold text-blue-800 mb-2">Update Order Status</p>
              <div className="flex gap-3">
                <select 
                  value={newStatus} 
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="flex-1 p-2 rounded-lg border border-blue-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>
                <button 
                  onClick={handleStatusUpdate}
                  disabled={updating}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Customer ID</p>
                <p className="font-bold">{viewModal.order.userId}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                <p className="font-bold text-green-600">${viewModal.order.total}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl col-span-2">
                <p className="text-sm text-gray-500 mb-1">Delivery Address</p>
                <p className="font-semibold">{viewModal.order.deliveryAddress || "No address provided"}</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="font-bold text-sm mb-3" style={{ color: text }}>Items Ordered:</p>
              <ul className="space-y-3 max-h-40 overflow-y-auto border p-4 rounded-xl bg-white border-gray-100">
                {(() => {
                  try {
                    const items = JSON.parse(viewModal.order.itemsJson || "[]");
                    return items.length > 0 ? items.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3 border-b border-gray-100 pb-2">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden shrink-0 flex items-center justify-center text-gray-400">
                          {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /> : <span className="text-xl">🐾</span>}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm" style={{ color: text }}>{item.name}</p>
                          <p className="text-xs text-gray-500">{item.category || ''}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-xs text-gray-500">Qty: {item.quantity || 1}</p>
                           <span className="font-bold text-green-600">${item.price}</span>
                        </div>
                      </li>
                    )) : <li className="text-gray-400">No items found</li>;
                  } catch (e) { return <li className="text-red-500">Error parsing items</li>; }
                })()}
              </ul>
            </div>

            <div className="flex justify-end pt-4 border-t">
               <button 
                  onClick={() => setViewModal({ isOpen: false, order: null })}
                  className="px-6 py-2 rounded-lg font-bold text-white shadow-sm hover:shadow-md"
                  style={{ backgroundColor: '#14b8a6' }}
                >
                  Close
                </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminOrders;