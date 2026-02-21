import React, { useContext, useState, useEffect } from 'react';
import { ConfigContext } from '../../contexts/ConfigContext';
import PatientSidebar from '../../components/patient/PatientSidebar';

const OrdersPage = ({ onNavigate, user }) => {
  const config = useContext(ConfigContext);
  const { background_color: bg, surface_color: surface, text_color: text, primary_action_color: primary, font_size: fontSize } = config;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for Search
  const [searchQuery, setSearchQuery] = useState('');

  // State for Tracking Modal
  const [trackingModal, setTrackingModal] = useState({ isOpen: false, order: null });

  // Fetch Orders from DB
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`http://localhost:8080/api/orders/my-orders/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  // --- SEARCH LOGIC ---
  const filteredOrders = orders.filter((order) => {
    const lowerQuery = searchQuery.toLowerCase();
    const matchesId = order.id.toString().includes(lowerQuery);
    const matchesStatus = (order.status || "").toLowerCase().includes(lowerQuery);

    // Search inside items JSON
    let matchesItems = false;
    try {
      const items = JSON.parse(order.itemsJson || "[]");
      matchesItems = items.some((item) => item.name.toLowerCase().includes(lowerQuery));
    } catch (e) {}

    return matchesId || matchesStatus || matchesItems;
  });

  // --- HELPER: Get Status Badge Style ---
  const getStatusBadge = (status) => {
    const s = (status || "Processing").toLowerCase();
    if (s === 'delivered') return 'bg-green-100 text-green-700 border-green-200';
    if (s === 'cancelled' || s === 'rejected') return 'bg-red-100 text-red-700 border-red-200';
    if (s === 'shipped') return 'bg-blue-100 text-blue-700 border-blue-200';
    if (s === 'out for delivery') return 'bg-purple-100 text-purple-700 border-purple-200';
    return 'bg-yellow-100 text-yellow-700 border-yellow-200'; // Processing
  };

  // Handler: Open Tracking Modal
  const handleTrackOrder = (order) => {
    setTrackingModal({ isOpen: true, order: order });
  };

  // Handler: Close Tracking Modal
  const closeTrackingModal = () => {
    setTrackingModal({ isOpen: false, order: null });
  };

  // --- UPDATED HANDLER: DELETE FROM DB AND SCREEN ---
  const handleCancelOrder = async (orderId) => {
    if(window.confirm("Are you sure you want to delete this order? This cannot be undone.")) {
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
        console.error("Network Error:", error);
        alert("Network error.");
      }
    }
  };

  // --- LOGIC: 4 Steps Tracking ---
  const getStepStatus = (order, stepLevel) => {
    const status = (order.status || "").toLowerCase();
    
    if (status === 'delivered') return true; // All active
    if (status === 'out for delivery') return stepLevel <= 3; 
    if (status === 'shipped') return stepLevel <= 2; 
    if (status === 'processing' || status === 'confirmed') return stepLevel === 1; 
    
    return false;
  };

  return (
    <div className="min-h-full w-full flex" style={{ background: bg }}>
      {/* --- SIDEBAR --- */}
      <PatientSidebar activeView="orders" onViewChange={onNavigate} />
      
      <div className="flex-1 p-6 sm:p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* --- HEADER & SEARCH --- */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h2 className="font-bold mb-1" style={{ fontSize: `${fontSize * 1.5}px`, color: text }}>My Orders</h2>
              <p className="text-sm opacity-60">Manage and track your purchases</p>
            </div>
            
            {/* Search Bar */}
            <div className="relative w-full md:w-96">
                <span className="absolute left-3.5 top-3 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </span>
                <input
                    type="text"
                    placeholder="Search by ID, status, or item name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-10 py-2.5 rounded-xl border-2 focus:outline-none focus:ring-0 transition-all shadow-sm bg-white"
                    style={{ borderColor: `${primary}30`, color: text }}
                />
                {searchQuery && (
                    <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </button>
                )}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: primary }}></div>
            </div>
          ) : filteredOrders.length === 0 ? (
             <div className="p-10 rounded-3xl shadow-sm border border-gray-200 text-center flex flex-col items-center justify-center" style={{ background: surface, opacity: 0.7 }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <h3 className="text-xl font-bold mb-2" style={{ color: text }}>No Orders Found</h3>
                {searchQuery ? (
                    <p className="text-sm text-gray-500 mb-4">Try adjusting your search terms.</p>
                ) : (
                    <p className="text-sm text-gray-500 mb-4">Looks like you haven't made any purchases yet.</p>
                )}
                <button 
                    onClick={() => { onNavigate('marketplace'); setSearchQuery(''); }} 
                    className="px-6 py-2.5 rounded-xl font-bold text-white shadow-md hover:shadow-lg transition-all"
                    style={{ background: primary }}
                >
                    Start Shopping
                </button>
             </div>
          ) : (
             <div className="grid grid-cols-1 gap-6">
               {filteredOrders.map((order) => {
                 const status = (order.status || "Processing").toLowerCase();
                 const isCancellable = status !== 'delivered' && status !== 'cancelled' && status !== 'rejected';

                 return (
                 <div key={order.id} className="p-0 rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md" style={{ background: surface }}>
                   
                   {/* Card Header */}
                   <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-50 text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg leading-tight" style={{ color: text }}>Order #{order.id}</h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {new Date(order.orderDate).toLocaleDateString()} • {new Date(order.orderDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(order.status)}`}>
                            {order.status || 'Processing'}
                        </span>
                        <p className="font-bold text-lg whitespace-nowrap" style={{ color: primary }}>${order.total}</p>
                      </div>
                   </div>
                   
                   {/* Order Items Grid */}
                   <div className="p-5 bg-gray-50/30">
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                       {(() => {
                         try {
                           const items = JSON.parse(order.itemsJson || "[]");
                           return items.length > 0 ? items.map((item, idx) => (
                             <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
                               <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center text-gray-400">
                                 {item.imageUrl ? (
                                   <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                 ) : (
                                   <span className="text-xs">🐾</span>
                                 )}
                               </div>
                               <div className="flex-1 min-w-0">
                                 <p className="font-bold text-sm truncate" style={{ color: text }}>{item.name}</p>
                                 <div className="flex justify-between items-center mt-0.5">
                                     <p className="text-[10px] text-gray-500">Qty: {item.quantity}</p>
                                     <p className="text-xs font-bold" style={{ color: primary }}>${item.price * item.quantity}</p>
                                 </div>
                               </div>
                             </div>
                           )) : null;
                         } catch (e) { return null; }
                       })()}
                     </div>
                   </div>

                   {/* Action Buttons */}
                   <div className="p-4 bg-white flex flex-col sm:flex-row gap-3 border-t border-gray-100">
                     <button 
                       onClick={() => handleTrackOrder(order)}
                       className="flex-1 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
                       style={{ background: primary, color: 'white' }}
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7" />
                        </svg>
                       Track Order
                     </button>
                     
                     {isCancellable && (
                        <button 
                        onClick={() => handleCancelOrder(order.id)}
                        className="flex-1 py-2.5 rounded-xl font-bold border border-red-200 text-red-600 hover:bg-red-50 transition-all text-sm flex items-center justify-center gap-2"
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Cancel Order
                        </button>
                     )}
                     {!isCancellable && (
                        <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
                            {status === 'delivered' ? 'Archived' : 'Closed'}
                        </div>
                     )}
                   </div>
                 </div>
                );
               })}
             </div>
          )}
        </div>
      </div>

      {/* --- TRACKING MODAL (Improved Visuals) --- */}
      {trackingModal.isOpen && trackingModal.order && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-0 overflow-hidden animate-fade-in">
            
            {/* Modal Header */}
            <div className="p-6 bg-gray-50 border-b flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Track Order</h3>
                <p className="text-sm text-gray-500">ID: #{trackingModal.order.id}</p>
              </div>
              <button 
                onClick={closeTrackingModal}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm border border-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-8">
                {/* Timeline with Connecting Line */}
                <div className="relative space-y-8 pl-4 border-l-2 border-gray-100 ml-3">
                    
                    {/* Step 1 */}
                    <div className="relative pl-8">
                        <div className={`absolute -left-[21px] top-1 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs z-10 ${getStepStatus(trackingModal.order, 1) ? 'bg-green-500 shadow-green-200 shadow-md' : 'bg-gray-200'}`}>
                            {getStepStatus(trackingModal.order, 1) ? '✓' : '1'}
                        </div>
                        <p className={`font-bold text-sm ${getStepStatus(trackingModal.order, 1) ? 'text-gray-800' : 'text-gray-400'}`}>Order Confirmed</p>
                        <p className="text-xs text-gray-500 mt-0.5">We have received your order.</p>
                    </div>

                    {/* Step 2 */}
                    <div className="relative pl-8">
                        <div className={`absolute -left-[21px] top-1 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs z-10 ${getStepStatus(trackingModal.order, 2) ? 'bg-green-500 shadow-green-200 shadow-md' : 'bg-gray-200'}`}>
                            {getStepStatus(trackingModal.order, 2) ? '✓' : '2'}
                        </div>
                        <p className={`font-bold text-sm ${getStepStatus(trackingModal.order, 2) ? 'text-gray-800' : 'text-gray-400'}`}>Shipped</p>
                        <p className="text-xs text-gray-500 mt-0.5">Order has left the warehouse.</p>
                    </div>

                    {/* Step 3 */}
                    <div className="relative pl-8">
                        <div className={`absolute -left-[21px] top-1 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs z-10 ${getStepStatus(trackingModal.order, 3) ? 'bg-green-500 shadow-green-200 shadow-md' : 'bg-gray-200'}`}>
                            {getStepStatus(trackingModal.order, 3) ? '✓' : '3'}
                        </div>
                        <p className={`font-bold text-sm ${getStepStatus(trackingModal.order, 3) ? 'text-gray-800' : 'text-gray-400'}`}>Out for Delivery</p>
                        <p className="text-xs text-gray-500 mt-0.5">Package is on its way to you.</p>
                    </div>

                    {/* Step 4 */}
                    <div className="relative pl-8">
                        <div className={`absolute -left-[21px] top-1 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs z-10 ${getStepStatus(trackingModal.order, 4) ? 'bg-green-500 shadow-green-200 shadow-md' : 'bg-gray-200'}`}>
                            {getStepStatus(trackingModal.order, 4) ? '✓' : '4'}
                        </div>
                        <p className={`font-bold text-sm ${getStepStatus(trackingModal.order, 4) ? 'text-gray-800' : 'text-gray-400'}`}>Delivered</p>
                        <p className="text-xs text-gray-500 mt-0.5">Arrived at your doorstep.</p>
                    </div>

                </div>

                {/* Details Box */}
                <div className="mt-8 p-4 rounded-xl bg-gray-50 border border-gray-100 flex justify-between items-center">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Total</span>
                        <span className="font-bold text-lg text-gray-800">${trackingModal.order.total}</span>
                    </div>
                    <div className="h-8 w-px bg-gray-200"></div>
                    <div className="flex flex-col text-right">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Tracking ID</span>
                        <span className="font-bold text-sm text-blue-600">{`TRK-${trackingModal.order.id}`}</span>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-white border-t border-gray-100">
                <button 
                    onClick={closeTrackingModal}
                    className="w-full py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all"
                    style={{ background: primary }}
                >
                    Done
                </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrdersPage;