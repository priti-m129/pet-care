import React from 'react';

const DoctorSidebar = ({ onNavigate, user, activePage }) => {
  // FIX: Check for BOTH isApproved (Boolean) AND documentStatus (String 'APPROVED')
  // This ensures the sidebar unlocks regardless of which field your backend updates.
  const isApproved = user?.isApproved || user?.documentStatus === 'APPROVED';

  // Render "Locked" State if not approved
  if (!isApproved) {
    return (
      <div className="w-64 h-full flex-shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col items-center justify-center text-center p-6 shadow-xl">
        <div className="text-5xl mb-4 opacity-50">🔒</div>
        <h3 className="font-bold text-gray-700 text-lg">Account Pending</h3>
        <p className="text-sm text-gray-500 mt-3 leading-relaxed">
          Your account is currently under review by the administrator. 
          <br/>Please wait for approval to access the dashboard.
        </p>
      </div>
    );
  }

  // Menu Items
  const menuItems = [
    { id: 'doctor-dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'doctor-appointments', label: 'Appointments', icon: '📅' },
    { id: 'availability', label: 'Availability', icon: '📆' },
    { divider: true },
    { id: 'help-center', label: 'Help Center', icon: '❓' },
    { id: 'doctor-profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <div className="w-64 h-full flex-shrink-0 bg-white shadow-xl border-r border-gray-200 flex flex-col">
      {/* User Info */}
      <div className="bg-[#14b8a6] p-6 flex items-center gap-4 border-b border-gray-100">
        <div className="text-3xl">🩺</div>
        <div>
          <p className="font-bold text-gray-800">Dr. {user?.name || 'Account'}</p>
          <p className="text-sm text-gray-500">Doctor Portal</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 flex flex-col gap-2 py-4 overflow-y-auto px-3">
        {menuItems.map((item, index) => {
          if (item.divider) {
            return (
              <div key={`divider-${index}`} className="my-2 border-t border-gray-200 mx-2 opacity-50"></div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                activePage === item.id ? 'bg-[#14b8a6] text-white shadow-md' : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-semibold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DoctorSidebar;