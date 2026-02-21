import React, { useContext } from 'react';
import { ConfigContext } from '../../contexts/ConfigContext';
import DoctorHeader from '../../components/headers/DoctorHeader';
import DoctorSidebar from '../../components/DoctorSidebar';

const DoctorConsultations = ({ onNavigate, user }) => {
  const config = useContext(ConfigContext);
  const { background_color: bg, surface_color: surface, text_color: text, primary_action_color: primary, font_size: fontSize } = config;  

  return (
    <div className="min-h-full w-full flex" style={{ background: bg }}>
      <DoctorSidebar onNavigate={onNavigate} user={user} activePage="doctor-consultations" />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <DoctorHeader title="Consultations" onNavigate={onNavigate} />
        
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Active Consultation Card */}
            <div className="p-6 rounded-3xl shadow-md border-2 border-red-100" style={{ background: '#fff0f0' }}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="font-bold text-red-700">LIVE SESSION</span>
                </div>
                <span className="text-sm text-red-600 font-semibold">04:23</span>
              </div>
              <h3 className="font-bold text-2xl mb-1 text-gray-800">Max (Pug)</h3>
              <p className="text-gray-500 mb-4">Owner: Sarah Smith • Video Call</p>
              <button className="w-full py-3 rounded-xl font-bold text-white shadow-lg" style={{ background: primary }}>Join Session</button>
            </div>

            {/* Pending Requests */}
            <div className="p-6 rounded-3xl shadow-md" style={{ background: surface }}>
              <h3 className="font-bold mb-4" style={{ fontSize: `${fontSize * 1.2}px`, color: text }}>Incoming Requests</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm">
                  <div>
                    <p className="font-bold text-gray-800">Luna (Cat)</p>
                    <p className="text-xs text-gray-500">Requested 2m ago</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-full hover:bg-red-100 text-red-500">✕</button>
                    <button className="p-2 rounded-full hover:bg-green-100 text-green-600">✓</button>
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm">
                  <div>
                    <p className="font-bold text-gray-800">Charlie (Beagle)</p>
                    <p className="text-xs text-gray-500">Requested 15m ago</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-full hover:bg-red-100 text-red-500">✕</button>
                    <button className="p-2 rounded-full hover:bg-green-100 text-green-600">✓</button>
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

export default DoctorConsultations;