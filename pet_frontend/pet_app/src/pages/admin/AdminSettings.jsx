import React, { useContext } from 'react';
import { ConfigContext } from '../../contexts/ConfigContext';

const AdminSettings = () => {
  const config = useContext(ConfigContext);
  const { surface_color: surface, text_color: text, primary_action_color: primary, font_size: fontSize } = config;

  return (
    <div className="max-w-2xl mx-auto p-6 rounded-3xl shadow-md" style={{ background: surface }}>
      <h3 className="font-bold mb-6" style={{ fontSize: `${fontSize * 1.5}px`, color: text }}>System Settings</h3>
      <div className="space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <div>
            <p className="font-bold">Maintenance Mode</p>
            <p className="text-sm opacity-70">Disable site for users except Admin</p>
          </div>
          <button className="w-12 h-6 rounded-full bg-gray-300 relative transition-colors">
            <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></span>
          </button>
        </div>
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <div>
            <p className="font-bold">Email Notifications</p>
            <p className="text-sm opacity-70">Receive alerts for new registrations</p>
          </div>
          <button className="w-12 h-6 rounded-full relative transition-colors" style={{ background: primary }}>
            <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
          </button>
        </div>
        <div>
          <label className="block mb-2 font-bold">System Admin Email</label>
          <input type="email" defaultValue="admin@petcare.com" className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none" />
        </div>
        <button className="px-6 py-3 rounded-xl font-bold text-white w-full" style={{ background: primary }}>Save Changes</button>
      </div>
    </div>
  );
};

export default AdminSettings;