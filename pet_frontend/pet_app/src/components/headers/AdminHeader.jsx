import React, { useContext } from 'react';
import { ConfigContext } from '../../contexts/ConfigContext';

const AdminHeader = ({ title, onNavigate, showBackButton, onBack }) => {
  const config = useContext(ConfigContext);
  const { surface_color: surface, text_color: text, primary_action_color: primary } = config;

  return (
    <div className="shadow-md" style={{ background: surface }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <button onClick={onBack} className="mr-4 text-lg font-semibold" style={{ color: text, background: 'none', border: 'none', cursor: 'pointer' }}>
                ← Back to Dashboard
              </button>
            )}
            <div className="text-4xl">⚙️</div>
            <div>
              <h1 className="font-bold" style={{ fontSize: `${config.font_size * 1.6}px`, color: primary }}>{title}</h1>
              <p style={{ fontSize: `${config.font_size * 0.8}px`, color: text, opacity: 0.7 }}>Administrative Dashboard</p>
            </div>
          </div>
          <button onClick={() => onNavigate('admin-profile')} className="btn-hover px-4 py-2 rounded-full font-semibold" style={{ background: primary + '20', color: primary, fontSize: `${config.font_size * 0.9}px` }}>
            Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;