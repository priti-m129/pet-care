import React, { useState, useContext } from 'react';
import { ConfigContext } from '../../contexts/ConfigContext';
import PatientHeader from '../../components/headers/PatientHeader';
import PatientSidebar from '../../components/patient/PatientSidebar';

const PatientProfile = ({ user, onNavigate, onUpdateUser }) => {
  const config = useContext(ConfigContext);
  const { background_color: bg, primary_action_color: primary, text_color: text, font_size: fontSize } = config;
  
  // Form State
  const [formData, setFormData] = useState({ 
    name: user.name || '', 
    email: user.email || '', 
    phone: user.phone || '', 
    password: '' 
  });
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false); // State for mobile menu toggle

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      };

      // Only include password if the user typed one
      if (formData.password) {
        payload.password = formData.password;
      }

      // Call the parent function (App.jsx) which handles the Database Update
      await onUpdateUser(payload);
      
      alert('Profile updated successfully!');
      setShowMenu(false); // Close mobile menu if open
    } catch (error) {
      console.error("Failed to update profile", error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Full Screen Flex Container
    <div className="min-h-screen w-full flex flex-col md:flex-row overflow-hidden" style={{ background: bg }}>
      
      {/* LEFT: Mobile Header / Sidebar */}
      <div className="md:w-64 md:h-full w-full flex-shrink-0 md:relative md:static">
        
        {/* Mobile Header (Hamburger) */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <div className="font-bold text-gray-800">Profile Settings</div>
          <button onClick={() => setShowMenu(!showMenu)} className="text-2xl">☰</button>
        </div>

        {/* Mobile Menu Overlay */}
        {showMenu && (
          <div className="md:hidden absolute inset-0 z-50 bg-white shadow-2xl h-full">
             <PatientSidebar activeView="profile" onViewChange={onNavigate} />
             <button onClick={() => setShowMenu(false)} className="absolute top-4 right-4 text-gray-500 p-2">✕</button>
          </div>
        )}

        {/* Desktop Sidebar */}
        <div className="hidden md:flex h-full bg-white shadow-xl z-10">
           <PatientSidebar activeView="profile" onViewChange={onNavigate} />
        </div>
      </div>

      {/* RIGHT: Main Content Area */}
      <div className="flex-1 overflow-y-auto h-full">
        
        {/* Header */}
        <div className="p-4 bg-white border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            
            {/* --- USER INFO CARD --- */}
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-4xl font-bold shadow-md mb-2">
                 {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              
              <div>
                <h3 className="font-bold text-xl text-gray-800">{user.name || 'User Name'}</h3>
                <p className="text-sm text-gray-500">Patient Account</p>
                <div className="flex gap-2 mt-1">
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs font-semibold">Active</span>
                  <span className="text-gray-600 text-xs">ID: {user.id || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* --- FORM CARD --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left: Form */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-bold mb-6 text-lg text-gray-700">Edit Information</h3>
                <form onSubmit={handleSave} className="space-y-5">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                      <div className="relative">
                        <input 
                          required
                          disabled={loading}
                          className="input-focus w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all" 
                          style={{ borderColor: `${primary}30`, color: text, opacity: loading ? 0.6 : 1 }} 
                          placeholder="Enter your full name" 
                          value={formData.name} 
                          onChange={e => setFormData({...formData, name: e.target.value})} 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                      <div className="relative">
                         <input 
                            required
                            disabled={loading}
                            type="email"
                            className="input-focus w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all" 
                            style={{ borderColor: `${primary}30`, color: text, opacity: loading ? 0.6 : 1 }} 
                            placeholder="Enter your email" 
                            value={formData.email} 
                            onChange={e => setFormData({...formData, email: e.target.value})} 
                          />
                      </div>
                    </div>
                  </div>

                  <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                     <div className="relative">
                        <input 
                          required
                          disabled={loading}
                          className="input-focus w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all" 
                          style={{ borderColor: `${primary}30`, color: text, opacity: loading ? 0.6 : 1 }} 
                          placeholder="Enter your phone number" 
                          value={formData.phone} 
                          onChange={e => setFormData({...formData, phone: e.target.value})} 
                        />
                     </div>
                  </div>
                  
                  <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-1">New Password <span className="text-xs text-gray-400 font-normal">(Optional)</span></label>
                     <div className="relative">
                        <input 
                          disabled={loading}
                          type="password"
                          className="input-focus w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all" 
                          style={{ borderColor: `${primary}30`, color: text, opacity: loading ? 0.6 : 1 }} 
                          placeholder="Enter new password" 
                          value={formData.password} 
                          onChange={e => setFormData({...formData, password: e.target.value})} 
                        />
                     </div>
                  </div>

                  {/* Submit Button */}
                  <div className="md:col-span-2">
                     <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-3 rounded-xl font-bold text-white shadow-lg hover:bg-blue-600 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
                        style={{ background: primary, fontSize: `${fontSize * 1.1}px` }}
                      >
                        {loading ? (
                           <div className="h-5 w-5 border-4 border-t-2 border-gray-200 border-white rounded-full animate-spin"></div>
                        ) : (
                           <span>Save Changes</span>
                        )}
                     </button>
                  </div>
                </form>
              </div>

              {/* Right: Account Info */}
              <div className="bg-white rounded-2xl p-6 shadow-md">
                <h3 className="font-bold mb-5 text-lg text-gray-700">Account Details</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-gray-100 pb-3">
                     <span className="text-gray-500 text-sm">Registered on</span>
                     <span className="font-semibold text-gray-800">Jan 2023</span>
                  </div>
                  
                  <div className="flex justify-between border-b border-gray-100 pb-3">
                     <span className="text-gray-500 text-sm">Patient ID</span>
                     <span className="font-semibold text-gray-800">{user.id || 'N/A'}</span>
                  </div>

                  <div className="flex justify-between border-b border-gray-100 pb-3">
                     <span className="text-gray-500 text-sm">Plan</span>
                     <span className="font-semibold text-primary" style={{ color: primary }}>Standard</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;