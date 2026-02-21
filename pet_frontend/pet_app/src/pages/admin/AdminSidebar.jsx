import React from 'react';

const AdminSidebar = ({ onNavigate, activePage }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'user-management', label: 'User Management', icon: '👤' },
    { id: 'vet-management', label: 'Vet Management', icon: '🐕' },
    { id: 'marketplace', label: 'Marketplace', icon: '📦' },
    { id: 'orders', label: 'Orders', icon: '💰' },
    { id: 'reports', label: 'Reports', icon: '📜' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="w-64 h-full flex-shrink-0 bg-white shadow-xl border-r border-gray-200 flex flex-col z-20">
      <div className="bg-[#14b8a6] p-6 flex items-center gap-4 border-b border-gray-100">
        <div className="text-3xl">🛡️</div>
        <div>
          <p className="font-bold text-gray-800">Admin Portal</p>
          <p className="text-sm text-gray-500">System Control</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2 py-4 overflow-y-auto">
        {menuItems.map((item) => (
          <button 
            key={item.id} 
            onClick={() => onNavigate(item.id)} 
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-left ${
              activePage === item.id 
                ? 'bg-[#14b8a6] text-white shadow-md' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-semibold">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminSidebar;