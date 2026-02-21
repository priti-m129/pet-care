import React from 'react';

const PatientSidebar = ({ activeView, onViewChange }) => {
  const menuItems = [
    { id: 'patient-dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'my-pets', label: 'My Pets', icon: '🐶' },
    { id: 'appointments', label: 'Appointments', icon: '📅' },
    { id: 'marketplace', label: 'Marketplace', icon: '🛒' },
    { id: 'orders', label: 'My Orders', icon: '📦' },
    { id: 'messages', label: 'Messages', icon: '✉️' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <div 
      className="w-64 min-w-[16rem] h-full flex-shrink-0 bg-white shadow-xl border-r border-gray-200 flex flex-col z-20"
      // EXPLANATION OF CLASSES:
      // w-64        -> Sets fixed width of 256px.
      // min-w-[16rem] -> Forces it to stay at least 16rem wide (prevents squishing).
      // flex-shrink-0 -> Tells flexbox NOT to shrink this element even if content is large.
      // h-full       -> Takes full height of screen.
    >
      {/* User Info Header */}
      <div className="bg-[#14b8a6] p-6 flex items-center gap-4 border-b border-gray-100">
        <div className="text-3xl">🐾</div>
        <div>
          <p className="font-bold text-gray-800">Patient Portal</p>
          <p className="text-sm text-gray-500">Your Health Center</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 flex flex-col gap-2 py-4 overflow-y-auto">
        {menuItems.map((item) => (
          <button 
            key={item.id} 
            onClick={() => onViewChange(item.id)} 
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-left ${
              activeView === item.id 
                ? 'bg-[#14b8a6] text-white shadow-md' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-semibold">{item.label}</span>
          </button>
        ))}

        {/* Logout */}
        
      </div>
    </div>
  );
};

export default PatientSidebar;