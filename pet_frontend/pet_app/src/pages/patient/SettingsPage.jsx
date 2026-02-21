import React, { useContext } from 'react';
import { ConfigContext } from '../../contexts/ConfigContext';
import PatientHeader from '../../components/headers/PatientHeader';

const SettingsPage = () => {
  const config = useContext(ConfigContext);
  const { background_color: bg, surface_color: surface, text_color: text, font_size: fontSize } = config;

  return (
    <div className="min-h-full w-full flex" style={{ background: bg }}>
      <PatientHeader title="Settings" onNavigate={() => {}} />
      <div className="flex-1 flex flex-col h-full p-8">
        <h2 className="font-bold mb-4" style={{ fontSize: `${fontSize * 1.5}px`, color: text }}>Settings</h2>
        <div className="p-6 rounded-3xl shadow-md text-center" style={{ background: surface, opacity: 0.6 }}>
          <p style={{ fontSize: `${fontSize * 1.1}px` }}>Settings coming soon.</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;