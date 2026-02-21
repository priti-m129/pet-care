import React, { useContext } from 'react';
import { ConfigContext } from '../../contexts/ConfigContext';

const PatientHeader = ({ title, onNavigate }) => {
  const config = useContext(ConfigContext);
  const { surface_color: surface, text_color: text, primary_action_color: primary, secondary_action_color: secondary } = config;

  return (
    <div className="shadow-md" style={{ background: surface }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🐾</div>
            <div>
              <h1 className="font-bold" style={{ fontSize: `${config.font_size * 1.6}px`, color: primary }}>{title}</h1>
              <p style={{ fontSize: `${config.font_size * 0.8}px`, color: text, opacity: 0.7 }}>Pet Care  Platform</p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default PatientHeader;