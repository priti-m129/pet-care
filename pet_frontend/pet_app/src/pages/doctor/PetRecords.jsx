import React, { useContext } from 'react';
import { ConfigContext } from '../../contexts/ConfigContext';
import DoctorHeader from '../../components/headers/DoctorHeader';
import DoctorSidebar from '../../components/DoctorSidebar';

const PetRecords = ({ onNavigate, user }) => {
  const config = useContext(ConfigContext);
  const { background_color: bg, surface_color: surface, text_color: text, secondary_action_color: secondary, font_size: fontSize } = config;  

  return (
    <div className="min-h-full w-full flex" style={{ background: bg }}>
      <DoctorSidebar onNavigate={onNavigate} user={user} activePage="pet-records" />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <DoctorHeader title="Pet Records" onNavigate={onNavigate} />
        
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {/* Search Bar */}
            <div className="mb-8 relative">
              <input type="text" placeholder="Search by Pet Name or Owner..." className="w-full p-4 rounded-2xl shadow-md outline-none" style={{ fontSize: `${fontSize}px` }} />
              <span className="absolute right-6 top-4 text-2xl">🔍</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pet Card 1 */}
              <div className="p-6 rounded-3xl shadow-md cursor-pointer hover:shadow-xl transition-shadow" style={{ background: surface }} onClick={() => onNavigate('pet-details')}>
                <div className="flex items-center gap-4 mb-4">
                  <img src="https://via.placeholder.com/60" className="rounded-full" alt="Pet" />
                  <div>
                    <h3 className="font-bold text-lg">Bella</h3>
                    <p className="text-sm opacity-70">Golden Retriever • 3 Yrs</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="opacity-60">Last Visit:</span>
                    <span className="font-semibold">Oct 10, 2023</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="opacity-60">Allergies:</span>
                    <span className="font-semibold text-red-500">Chicken</span>
                  </div>
                </div>
                <button className="w-full mt-4 py-2 rounded-xl text-sm font-bold border" style={{ borderColor: secondary, color: secondary }}>View History</button>
              </div>

              {/* Pet Card 2 */}
              <div className="p-6 rounded-3xl shadow-md cursor-pointer hover:shadow-xl transition-shadow" style={{ background: surface }}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-2xl">🐈</div>
                  <div>
                    <h3 className="font-bold text-lg">Luna</h3>
                    <p className="text-sm opacity-70">Siamese • 2 Yrs</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="opacity-60">Last Visit:</span>
                    <span className="font-semibold">Sep 05, 2023</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="opacity-60">Allergies:</span>
                    <span className="font-semibold text-green-600">None</span>
                  </div>
                </div>
                <button className="w-full mt-4 py-2 rounded-xl text-sm font-bold border" style={{ borderColor: secondary, color: secondary }}>View History</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetRecords;