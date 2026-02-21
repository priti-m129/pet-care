import React, { useState, useEffect, useContext } from 'react';
import { ConfigContext } from '../../contexts/ConfigContext';
import AdminHeader from '../../components/headers/AdminHeader';
import AdminSidebar from './AdminSidebar';

// --- Import Sub-Pages ---
import AdminHome from './AdminHome';
import UserManagement from './UserManagement';
import VetManagement from './VetManagement';
import AdminMarketplace from './AdminMarketplace';
import AdminOrders from './AdminOrders';
import AdminReports from './AdminReports';
import AdminSettings from './AdminSettings';

// --- API ---
import { getAllUsers, deleteUser } from '../../api/dataService';
import axios from 'axios'; // IMPORT AXIOS

const AdminDashboard = ({ 
  onNavigate: globalNavigate, 
  products, 
  onAddProduct, 
  onDeleteProduct,
  notifications = [],
  onClearNotification,
  unreadCount = 0,
  onMarkAsRead
}) => {
  const config = useContext(ConfigContext);
  const { background_color: bg, surface_color: surface, primary_action_color: primary, font_size: fontSize } = config;

  const [activePage, setActivePage] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  // --- NEW: HANDLE APPROVE DOCUMENT ---
  const handleApproveDocument = async (doctorId) => {
    if(window.confirm("Are you sure you want to verify this doctor? This will unlock their dashboard.")) {
        try {
            // 1. Call the backend
            await axios.post(`http://localhost:8080/api/auth/admin/approve-doctor-document/${doctorId}`);
            
            alert("Doctor verified successfully!");
            
            // 2. CRITICAL: Refresh data to move doctor from 'Pending' to 'Verified' list
            fetchDashboardData();
            
        } catch (error) {
            console.error(error);
            alert("Failed to verify doctor.");
        }
    }
  };
  // ---------------------------------

  const handleDeleteUser = async (id) => {
    if(window.confirm("Are you sure you want to delete this user? This cannot be undone.")) {
      try {
        await deleteUser(id);
        setUsers(users.filter(u => u.id !== id));
        alert("User Deleted Successfully");
      } catch (error) {
        console.error("Full Error:", error);
        let errorMessage = "Failed to delete user.";
        if (error.response && error.response.data) errorMessage = error.response.data;
        alert(`Error: ${errorMessage}`);
      }
    }
  };
  
  const toggleNotifications = () => {
    setIsNotifOpen(!isNotifOpen);
    if (!isNotifOpen) onMarkAsRead();
  };

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: bg }}>
      <AdminSidebar onNavigate={setActivePage} activePage={activePage} />
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="h-20 flex items-center justify-between px-8 shadow-sm z-30" style={{ background: surface }}>
          <div className="flex-1">
            <AdminHeader title="Admin Dashboard" onNavigate={globalNavigate} />
          </div>
          <div className="relative">
            <button 
              onClick={toggleNotifications}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors relative focus:outline-none"
            >
              <span className="text-3xl filter drop-shadow-sm">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-white z-20 shadow-md animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>
            {/* Notification Dropdown ... keep as is */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fade-in-down">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                  <h4 className="font-bold text-gray-700">Notifications</h4>
                  <button 
                    onClick={() => notifications.forEach(n => onClearNotification(n.id))}
                    className="text-xs text-teal-600 hover:text-teal-800 font-semibold"
                  >
                    Clear All
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm flex flex-col items-center">
                      <span className="text-3xl mb-2 opacity-50">📭</span>
                      No new notifications
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div key={notif.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors flex justify-between items-start group">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 text-lg">
                            {notif.type === 'success' ? '✅' : notif.type === 'warning' ? '⚠️' : 'ℹ️'}
                          </div>
                          <div>
                            <p className="text-sm text-gray-800 font-medium leading-snug">{notif.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{notif.timestamp}</p>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onClearNotification(notif.id);
                          }}
                          className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            
            {activePage === 'dashboard' && (
              <AdminHome 
                users={users} 
                products={products} 
                loading={loading} 
                onNavigate={setActivePage} 
              />
            )}
            
            {activePage === 'user-management' && (
              <UserManagement 
                users={users} 
                loading={loading} 
                onDeleteUser={handleDeleteUser} 
              />
            )}
            
            {/* --- PASS THE NEW FUNCTION HERE --- */}
            {activePage === 'vet-management' && (
              <VetManagement 
                users={users} 
                loading={loading} 
                onApproveDocument={handleApproveDocument} // <--- THIS IS IMPORTANT
                onDeleteUser={handleDeleteUser} 
              />
            )}
            
            {activePage === 'marketplace' && (
              <AdminMarketplace 
                products={products} 
                onAddProduct={onAddProduct} 
                onDeleteProduct={onDeleteProduct} 
              />
            )}
            
            {activePage === 'orders' && <AdminOrders />}
            {activePage === 'reports' && <AdminReports />}
            {activePage === 'settings' && <AdminSettings />}

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;