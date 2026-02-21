import React, { useContext } from 'react';
import { ConfigContext } from '../../contexts/ConfigContext';
import DoctorHeader from '../../components/headers/DoctorHeader';
import DoctorSidebar from '../../components/DoctorSidebar';

const DoctorMessages = ({ onNavigate, user }) => {
  const config = useContext(ConfigContext);
  const { background_color: bg, surface_color: surface, text_color: text, primary_action_color: primary, font_size: fontSize } = config;  

  return (
    <div className="min-h-full w-full flex" style={{ background: bg }}>
      <DoctorSidebar onNavigate={onNavigate} user={user} activePage="doctor-messages" />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <DoctorHeader title="Messages" onNavigate={onNavigate} />
        
        <div className="flex-1 flex overflow-hidden">
          {/* Contacts Sidebar (Embedded) */}
          <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto p-4">
            <div className="space-y-2">
              {[
                { name: 'John Doe', msg: 'Is the vaccination due next week?', time: '2m', unread: true },
                { name: 'Sarah Smith', msg: 'Thank you for the help!', time: '1h', unread: false },
                { name: 'Mike Ross', msg: 'Can we reschedule?', time: '1d', unread: false },
              ].map((chat, i) => (
                <div key={i} className={`p-3 rounded-xl cursor-pointer flex gap-3 ${chat.unread ? 'bg-[#f0fdfa]' : 'hover:bg-gray-50'}`}>
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0"></div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-sm truncate">{chat.name}</span>
                      <span className="text-xs text-gray-400">{chat.time}</span>
                    </div>
                    <p className="text-xs text-gray-600 truncate">{chat.msg}</p>
                  </div>
                  {chat.unread && <div className="w-2 h-2 rounded-full bg-[#14b8a6] mt-2"></div>}
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-gray-50">
            <div className="flex-1 flex items-center justify-center">
               <div className="text-center opacity-50">
                 <div className="text-4xl mb-2">💬</div>
                 <p>Select a conversation to start chatting</p>
               </div>
            </div>
            {/* Input Area (Visible if chat selected, simplified here) */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex gap-2">
                <input type="text" placeholder="Type a message..." className="flex-1 p-3 rounded-xl border border-gray-200" />
                <button className="px-6 py-3 rounded-xl text-white font-bold" style={{ background: primary }}>Send</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorMessages;