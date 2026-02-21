import React, { useState, useContext } from 'react';
import { ConfigContext } from '../../contexts/ConfigContext';
import AdminHeader from '../../components/headers/AdminHeader';

const AdminProfile = ({ user, onUpdateUser, onNavigate }) => {
  const config = useContext(ConfigContext);
  const { background_color: bg, surface_color: surface, text_color: text, primary_action_color: primary, font_size: fontSize } = config;

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);
    onUpdateUser({ ...user, password: password });
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <div className="min-h-full w-full" style={{ background: bg }}>
      <AdminHeader title="Admin Profile" onNavigate={onNavigate} showBackButton={true} onBack={() => onNavigate('admin-dashboard')} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="p-8 rounded-3xl shadow-xl" style={{ background: surface }}>
          <div className="flex items-center gap-6 mb-8">
            <div className="text-8xl">⚙️</div>
            <div>
              <h2 className="font-bold mb-2" style={{ fontSize: `${fontSize * 2}px`, color: text }}>Administrator</h2>
              <p style={{ fontSize: `${fontSize * 1.05}px`, color: text, opacity: 0.7 }}>System Administrator</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <h3 className="font-bold mb-4">Change Password</h3>
            <div>
              <label className="block mb-2 font-semibold" style={{ color: text }}>New Password</label>
              <input required type="password" className="input-focus w-full px-4 py-3 rounded-xl border-2" style={{ borderColor: `${primary}30`, color: text }} value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="btn-hover w-full py-4 rounded-xl font-bold shadow-lg" style={{ background: primary, color: 'white' }}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;