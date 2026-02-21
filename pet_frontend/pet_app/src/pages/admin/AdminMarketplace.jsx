import React, { useContext, useState, useEffect } from 'react';
import { ConfigContext } from '../../contexts/ConfigContext';

const AdminMarketplace = () => {
  const config = useContext(ConfigContext);
  const { surface_color: surface, text_color: text, primary_action_color: primary, font_size: fontSize } = config;

  // State for the product list
  const [products, setProducts] = useState([]);
  
  // State for the form inputs
  const [form, setForm] = useState({ 
    name: '', 
    price: '', 
    category: 'Food', 
    description: '', 
    imageFile: null 
  });

  // State to show a preview of the selected image
  const [imagePreview, setImagePreview] = useState(null);

  // --- NEW STATE FOR UI CONTROLS ---
  const [showForm, setShowForm] = useState(false); // Toggle form visibility
  const [searchQuery, setSearchQuery] = useState(''); // Search query

  const API_URL = 'http://localhost:8080/api/products';

  // 1. Fetch products on load
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // 2. Handle File Selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, imageFile: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // 3. Handle Add Product
  const handleAdd = async () => {
    if (!form.name || !form.price) return alert("Please fill in Name and Price");

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('price', form.price);
    formData.append('category', form.category);
    formData.append('description', form.description);
    
    if (form.imageFile) {
      formData.append('image', form.imageFile);
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server Response:", errorText);
        throw new Error('Failed to add product');
      }

      const savedProduct = await response.json();
      setProducts([...products, savedProduct]);
      
      // Reset and Close Form
      setForm({ name: '', price: '', category: 'Food', description: '', imageFile: null });
      setImagePreview(null);
      setShowForm(false);
      alert("Product Added to Database!");

    } catch (error) {
      console.error("Error adding product:", error);
      alert("Error adding product. Check console (F12) for details.");
    }
  };

  // 4. Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProducts(products.filter(prod => prod.id !== id));
        alert("Product Deleted!");
      } else {
        alert("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  // --- FILTER LOGIC ---
  const filteredProducts = products.filter((prod) => {
    const lowerQuery = searchQuery.toLowerCase();
    return (
      prod.name.toLowerCase().includes(lowerQuery) ||
      prod.category.toLowerCase().includes(lowerQuery)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* --- HEADER: Title, Search, Add Button --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="font-bold text-2xl" style={{ color: text }}>Marketplace Inventory</h2>
            <p className="text-sm opacity-60">Manage products and stock.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
                <span className="absolute left-3 top-2.5 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </span>
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border-2 focus:outline-none focus:ring-0 transition-all shadow-sm bg-white"
                    style={{ borderColor: `${primary}30` }}
                />
                {searchQuery && (
                    <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Add Product Button */}
            <button 
                onClick={() => setShowForm(!showForm)}
                className="w-full sm:w-auto px-6 py-2 rounded-xl font-bold text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                style={{ background: primary }}
            >
                {showForm ? (
                    <>Close Form <span>✕</span></>
                ) : (
                    <>Add Product <span>+</span></>
                )}
            </button>
        </div>
      </div>

      {/* --- COLLAPSIBLE ADD PRODUCT FORM --- */}
      {showForm && (
        <div className="p-6 rounded-3xl shadow-md border border-gray-100 animate-slide-down" style={{ background: surface }}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg" style={{ color: text }}>Add New Product</h3>
                <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded">ADMIN MODE</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Product Name</label>
                    <input 
                    type="text" 
                    placeholder="e.g. Premium Dog Food" 
                    className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500 transition-colors" 
                    value={form.name} 
                    onChange={e => setForm({...form, name: e.target.value})} 
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Price ($)</label>
                    <input 
                    type="number" 
                    placeholder="0.00" 
                    className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500 transition-colors" 
                    value={form.price} 
                    onChange={e => setForm({...form, price: e.target.value})} 
                    />
                </div>
                
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                    <select 
                    className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500 transition-colors bg-white" 
                    value={form.category} 
                    onChange={e => setForm({...form, category: e.target.value})}
                    >
                        <option value="Food">Food</option>
                        <option value="Toys">Toys</option>
                        <option value="Accessories">Accessories</option>
                        <option value="Medicine">Medicine</option>
                    </select>
                </div>
                
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Product Image</label>
                    <input 
                    type="file" 
                    accept="image/*" 
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={handleImageChange} 
                    />
                </div>
            </div>

            {/* Image Preview */}
            {imagePreview && (
                <div className="mb-4 flex items-center space-x-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-16 h-16 object-cover rounded-lg border border-white shadow-sm"
                    />
                    <div className="flex-1">
                        <p className="text-xs text-gray-400 font-bold uppercase">Selected File</p>
                        <p className="text-sm text-gray-700 font-medium truncate">{form.imageFile ? form.imageFile.name : "Image"}</p>
                    </div>
                    <button 
                        onClick={() => { setForm({...form, imageFile: null}); setImagePreview(null); }}
                        className="text-xs text-red-500 font-bold hover:underline"
                    >
                        Remove
                    </button>
                </div>
            )}
            
            <div className="space-y-1 mb-4">
                <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                <textarea 
                    placeholder="Enter product details..." 
                    className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500 transition-colors" 
                    rows="3" 
                    value={form.description} 
                    onChange={e => setForm({...form, description: e.target.value})}
                ></textarea>
            </div>
            
            <div className="flex gap-3">
                <button 
                    onClick={() => setShowForm(false)} 
                    className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleAdd} 
                    className="flex-1 py-2.5 rounded-xl font-bold text-white shadow-md hover:shadow-lg transition-all" 
                    style={{ background: primary }}
                >
                    Save Product
                </button>
            </div>
        </div>
      )}

      {/* --- INVENTORY LIST SECTION --- */}
      <div>
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg" style={{ color: text }}>
                Inventory ({filteredProducts.length})
            </h3>
            {searchQuery && (
                <span className="text-xs text-gray-500">Showing results for "{searchQuery}"</span>
            )}
        </div>
        
        {filteredProducts.length === 0 ? (
            <div className="p-10 rounded-3xl shadow-sm border border-gray-100 text-center" style={{ background: surface, opacity: 0.7 }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="text-gray-500 font-medium">No products found.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((prod) => (
                <div key={prod.id} className="relative group p-4 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow" style={{ background: '#fff' }}>
                    {/* Delete Button */}
                    <button 
                    onClick={() => handleDelete(prod.id)} 
                    className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-400 hover:text-red-500 hover:shadow-md transition-all z-10 opacity-0 group-hover:opacity-100"
                    title="Delete Product"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                    
                    {/* Image Display */}
                    <div className="w-full aspect-square bg-gray-100 rounded-xl mb-3 overflow-hidden flex items-center justify-center text-gray-400 border border-gray-100">
                    {prod.imageUrl ? (
                        <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                        <span>No Image</span>
                    )}
                    </div>
                    
                    {/* Product Info */}
                    <div className="space-y-1">
                        <p className="font-bold text-sm truncate" title={prod.name} style={{ color: text }}>{prod.name}</p>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400 bg-gray-50 px-2 py-0.5 rounded">{prod.category}</span>
                            <p className="font-bold text-base" style={{ color: primary }}>${prod.price}</p>
                        </div>
                    </div>
                </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminMarketplace;