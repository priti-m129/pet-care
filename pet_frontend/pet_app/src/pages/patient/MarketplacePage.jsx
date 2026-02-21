import React, { useState, useEffect, useContext } from 'react';
import { ConfigContext } from '../../contexts/ConfigContext';
import PatientSidebar from '../../components/patient/PatientSidebar';

const MarketplacePage = ({ onNavigate, user, onPlaceOrder }) => {
  const config = useContext(ConfigContext);
  const { background_color: bg, surface_color: surface, text_color: text, primary_action_color: primary, font_size: fontSize } = config;

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [address, setAddress] = useState({ street: '', city: '', zip: '' });

  // --- NEW STATE FOR SEARCH & FILTER ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const PRODUCT_API_URL = 'http://localhost:8080/api/products';
  const ORDER_API_URL = 'http://localhost:8080/api/orders';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(PRODUCT_API_URL);
        if (response.ok) setProducts(await response.json());
      } catch (error) { console.error("Error fetching products:", error); }
    };
    fetchProducts();

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // --- DERIVED DATA: CATEGORIES & FILTERED PRODUCTS ---
  // Extract unique categories from products, ensuring "ALL" is first
  const categories = ['ALL', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter((product) => {
    // Category Filter
    const matchesCategory = selectedCategory === 'ALL' || product.category === selectedCategory;
    
    // Search Filter (Name or Description)
    const lowerQuery = searchQuery.toLowerCase();
    const matchesSearch = 
      product.name.toLowerCase().includes(lowerQuery) || 
      (product.description && product.description.toLowerCase().includes(lowerQuery));

    return matchesCategory && matchesSearch;
  });

  // --- SMART ADD TO CART ---
  const handleAddToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevCart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  // --- UPDATE QUANTITY ---
  const handleUpdateQuantity = (productId, change) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === productId) {
          const newQuantity = item.quantity + change;
          if (newQuantity < 1) return item;
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
    });
  };

  // --- REMOVE ITEM ---
  const handleRemoveFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const handleOpenCheckoutModal = () => {
    if (cart.length === 0) return alert("Your cart is empty!");
    setShowCheckoutModal(true);
  };

  const handleFinalPayment = () => {
    if (!address.street || !address.city || !address.zip) {
      return alert("Please fill in all address details.");
    }

    const totalAmount = cart.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
    const amountInPaise = Math.round(totalAmount * 100);

    const options = {
      key: "rzp_test_S7IJ8H7u2xLJ3A", 
      amount: amountInPaise, 
      currency: "INR", 
      name: "Pet Care App",
      description: `Payment for ${cart.length} items`,
      image: "https://via.placeholder.com/150",
      
      // --- PAYMENT SUCCESS HANDLER ---
      handler: async function (response) {
        if (!response) return alert("Payment failed.");
        
        // Prepare Order Data (IMPORTANT: Sending email here)
        const orderData = {
          userId: user?.id,
          email: user?.email, // <--- MUST include this for Order.java to save it
          total: totalAmount,
          status: "Processing",
          itemsJson: JSON.stringify(cart),
          deliveryAddress: `${address.street}, ${address.city}, ${address.zip}`
        };

        try {
          const saveResponse = await fetch(ORDER_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
          });

          if (saveResponse.ok) {
            const savedOrder = await saveResponse.json();
            
            if (onPlaceOrder) {
              onPlaceOrder({ itemName: `Order #${savedOrder.id}` }, true);
            }

            alert(`Payment Successful! Order #${savedOrder.id} placed.`);
            setCart([]); 
            setShowCheckoutModal(false);
            setAddress({ street: '', city: '', zip: '' });
          } else {
            alert("Payment successful, but failed to save order.");
          }
        } catch (err) {
          console.error("Error saving order:", err);
          alert("Error processing order.");
        }
      },
      
      // --- PAYMENT FAILURE / DISMISS HANDLER ---
      modal: {
        ondismiss: async function() {
          // Call backend to log failure and send email
          try {
            await fetch(`${ORDER_API_URL}/failed`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: user?.email })
            });
          } catch (e) {
            console.error("Could not log payment failure", e);
          }

          if (onPlaceOrder) {
            onPlaceOrder({ itemName: "Shopping Cart" }, false);
          }
        }
      },
      
      prefill: {
        name: user?.name || "Patient",
        email: user?.email || "patient@example.com",
        contact: "9999999999"
      },
      theme: { color: primary },
    };

    try {
      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (err) {
      console.error("Razorpay Error:", err);
      alert("Payment Gateway failed to load.");
    }
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);

  return (
    <div className="min-h-full w-full flex" style={{ background: bg }}>
      <PatientSidebar activeView="marketplace" onViewChange={onNavigate} />
      
      <div className="flex-1 flex flex-col h-full p-6 lg:p-8">
        <h2 className="font-bold mb-6" style={{ fontSize: `${fontSize * 1.5}px`, color: text }}>Pet Marketplace</h2>
        
        <div className="flex flex-col lg:flex-row gap-8 h-full">
          
          {/* LEFT COLUMN: Products */}
          <div className="flex-1">
            {/* --- NEW: SEARCH & FILTER SECTION --- */}
            <div className="mb-8 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Search for food, toys, accessories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-12 py-3 rounded-xl border-2 focus:outline-none focus:ring-0 transition-all shadow-sm bg-white"
                        style={{ borderColor: `${primary}30`, color: text }}
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-5 py-2 rounded-lg text-sm font-bold capitalize transition-all duration-200 ${selectedCategory === cat ? 'text-white shadow-md transform scale-105' : 'text-gray-600 bg-gray-100 hover:bg-gray-200'}`}
                            style={selectedCategory === cat ? { background: primary } : {}}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>
            {/* ------------------------------- */}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.length === 0 ? (
                <div className="col-span-full text-center py-12 opacity-60 flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p>No products found matching your search or filters.</p>
                    <button 
                        onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); }}
                        className="mt-4 text-sm font-bold underline"
                        style={{ color: primary }}
                    >
                        Clear Filters
                    </button>
                </div>
              ) : (
                filteredProducts.map((prod) => (
                  <div key={prod.id} className="rounded-2xl shadow-sm overflow-hidden flex flex-col transition-transform hover:-translate-y-1" style={{ background: surface, border: '1px solid #e5e7eb' }}>
                    <div className="h-40 bg-gray-200 w-full flex items-center justify-center text-gray-400 relative">
                      {prod.imageUrl ? (
                        <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl">🐾</span>
                      )}
                      {/* Show category badge on card */}
                      <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold shadow-sm" style={{ color: primary }}>
                        {prod.category}
                      </span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg" style={{ color: text }}>{prod.name}</h3>
                      </div>
                      <p className="text-sm opacity-70 mb-4 flex-1 line-clamp-2">{prod.description}</p>
                      <div className="flex justify-between items-center mt-auto">
                        <p className="font-bold text-xl" style={{ color: primary }}>${prod.price}</p>
                        <button onClick={() => handleAddToCart(prod)} className="px-4 py-2 rounded-lg text-white text-sm font-bold hover:opacity-90 transition-opacity shadow-sm" style={{ background: primary }}>Add to Cart</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Cart Sidebar */}
          <div className="w-full lg:w-96 flex-shrink-0">
            <div className="sticky top-6 rounded-3xl shadow-md border border-gray-200 flex flex-col" style={{ background: surface, maxHeight: 'calc(100vh - 100px)' }}>
              
              <div className="p-6 border-b pb-4">
                <h2 className="font-bold text-xl mb-2" style={{ color: text }}>My Cart</h2>
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-70">{totalItems} Items</span>
                  <span className="font-bold text-xl" style={{ color: primary }}>
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-10 opacity-60">
                    <p>Your cart is empty.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex gap-3 items-center p-3 rounded-xl bg-gray-50 relative">
                      
                      <div className="w-14 h-14 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                         {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">🐾</div>}
                      </div>

                      <div className="flex-1">
                        <p className="font-bold text-sm truncate" style={{ color: text }}>{item.name}</p>
                        <p className="font-bold text-sm mt-1" style={{ color: primary }}>${(item.price * item.quantity).toFixed(2)}</p>
                      </div>

                      <div className="flex flex-col items-end justify-between">
                        <button onClick={() => handleRemoveFromCart(item.id)} className="text-gray-400 hover:text-red-500 text-xs mb-1">Remove</button>
                        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-md shadow-sm">
                          <button 
                            onClick={() => handleUpdateQuantity(item.id, -1)}
                            disabled={item.quantity <= 1}
                            className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 text-gray-600 disabled:opacity-50 rounded-l-md"
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                          <button 
                            onClick={() => handleUpdateQuantity(item.id, 1)}
                            className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 text-gray-600 rounded-r-md"
                          >
                            +
                          </button>
                        </div>
                      </div>

                    </div>
                  ))
                )}
              </div>

              <div className="p-4 border-t">
                <button 
                  onClick={handleOpenCheckoutModal}
                  className="w-full py-3 rounded-xl font-bold text-white shadow-md hover:shadow-lg transition-all"
                  style={{ background: primary }}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* --- CHECKOUT MODAL --- */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            
            <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="text-xl font-bold" style={{ color: text }}>Delivery Details</h3>
              <button onClick={() => setShowCheckoutModal(false)} className="text-gray-400 hover:text-red-500 text-2xl">✕</button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 rounded-xl bg-blue-50 mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Total Items:</span>
                  <span className="font-bold">{totalItems}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="font-bold">Total Amount:</span>
                  <span className="font-bold text-blue-600">${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1" style={{ color: text }}>Street Address</label>
                <input 
                  type="text" 
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2"
                  placeholder="e.g. 123 Pet Lane"
                  value={address.street}
                  onChange={e => setAddress({...address, street: e.target.value})}
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold mb-1" style={{ color: text }}>City</label>
                  <input 
                    type="text" 
                    className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2"
                    placeholder="e.g. Metropolis"
                    value={address.city}
                    onChange={e => setAddress({...address, city: e.target.value})}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold mb-1" style={{ color: text }}>Zip Code</label>
                  <input 
                    type="text" 
                    className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2"
                    placeholder="e.g. 123456"
                    value={address.zip}
                    onChange={e => setAddress({...address, zip: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex gap-4">
               <button 
                  onClick={() => setShowCheckoutModal(false)}
                  className="flex-1 py-3 rounded-xl font-bold border border-gray-300 text-gray-700 hover:bg-white transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleFinalPayment}
                  className="flex-1 py-3 rounded-xl font-bold text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2" 
                  style={{ background: primary }}
                >
                  Pay Now
                </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default MarketplacePage;