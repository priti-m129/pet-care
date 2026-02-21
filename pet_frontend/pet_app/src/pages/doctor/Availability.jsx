import React, { useContext, useState, useEffect } from 'react';
import { ConfigContext } from '../../contexts/ConfigContext';
import DoctorHeader from '../../components/headers/DoctorHeader';
import DoctorSidebar from '../../components/DoctorSidebar';

// --- SVG ICONS ---
const ClockIcon = () => (
  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CalendarXIcon = () => (
  <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
);

const Availability = ({ onNavigate, user }) => {
  const config = useContext(ConfigContext);
  const { background_color: bg, surface_color: surface, text_color: text, primary_action_color: primary, font_size: fontSize } = config;  

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // --- NEW: State for blocked dates visualization ---
  const [blockedDates, setBlockedDates] = useState([]);
  const [newBlockDate, setNewBlockDate] = useState('');

  // State to simulate schedule
  const [schedule, setSchedule] = useState({
    Monday: { checked: true, start: '09:00', end: '17:00' },
    Tuesday: { checked: true, start: '09:00', end: '17:00' },
    Wednesday: { checked: false, start: '09:00', end: '17:00' },
    Thursday: { checked: true, start: '09:00', end: '17:00' },
    Friday: { checked: true, start: '09:00', end: '15:00' },
    Saturday: { checked: false, start: '09:00', end: '13:00' },
    Sunday: { checked: false, start: '09:00', end: '13:00' },
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Load existing schedule on mount
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/patient/doctor/availability/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          const newSchedule = { ...schedule };
          data.forEach(item => {
            if (newSchedule[item.dayOfWeek]) {
              newSchedule[item.dayOfWeek] = {
                checked: true,
                start: item.startTime || '09:00',
                end: item.endTime || '17:00'
              };
            }
          });
          setSchedule(newSchedule);
        }
      } catch (error) {
        console.error("Error fetching schedule", error);
      }
    };
    if(user?.id) fetchSchedule();
  }, [user]);

  const handleChange = (day, field, value) => {
    setSchedule({
      ...schedule,
      [day]: { ...schedule[day], [field]: value }
    });
  };

  // --- HOLIDAYS HANDLERS ---
  const handleAddBlockDate = () => {
    if (!newBlockDate) return;
    if (!blockedDates.includes(newBlockDate)) {
      setBlockedDates([...blockedDates, newBlockDate].sort());
    }
    setNewBlockDate('');
  };

  const removeBlockDate = (dateToRemove) => {
    setBlockedDates(blockedDates.filter(d => d !== dateToRemove));
  };

  const handleSaveSchedule = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      const payload = Object.keys(schedule).map(day => ({
        doctor: { id: user.id },
        dayOfWeek: day,
        startTime: schedule[day].checked ? schedule[day].start : null,
        endTime: schedule[day].checked ? schedule[day].end : null
      })).filter(item => item.startTime !== null);

      // Assuming you might also want to save blocked dates, add that logic here if backend supports it
      // For now, we stick to the original endpoint logic

      const response = await fetch('http://localhost:8080/api/patient/doctor/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSaveMessage('Schedule updated successfully!');
      } else {
        setSaveMessage('Failed to update schedule.');
      }
    } catch (error) {
      console.error(error);
      setSaveMessage('Error connecting to server.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  return (
    <div className="min-h-screen w-full flex" style={{ background: bg }}>
      <DoctorSidebar onNavigate={onNavigate} user={user} activePage="availability" />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <DoctorHeader title="Manage Availability" onNavigate={onNavigate} />
        
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* --- LEFT COLUMN: WEEKLY SCHEDULE (2/3 width) --- */}
            <div className="lg:col-span-2 space-y-6">
              <div className="mb-4">
                <h2 className="text-3xl font-extrabold" style={{ color: text }}>Weekly Routine</h2>
                <p className="text-sm opacity-60 mt-1">Configure your regular working hours for each day.</p>
              </div>

              <div className="space-y-3">
                {days.map((day, index) => (
                  <div 
                    key={day} 
                    className={`relative group rounded-2xl border transition-all duration-300 ${schedule[day]?.checked ? 'bg-white shadow-md border-gray-100 hover:shadow-lg hover:border-indigo-100' : 'bg-gray-50 border-gray-100 opacity-70'}`}
                  >
                    <div className="p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                      
                      {/* Left: Day Name & Toggle */}
                      <div className="flex items-center gap-4 w-full md:w-auto md:flex-1">
                        {/* Custom Toggle Switch */}
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={schedule[day]?.checked || false} 
                            onChange={(e) => handleChange(day, 'checked', e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                        </label>
                        
                        <div>
                          <span className={`font-bold text-lg block transition-colors ${schedule[day]?.checked ? 'text-gray-800' : 'text-gray-400'}`}>{day}</span>
                          {!schedule[day]?.checked && <span className="text-xs text-red-400 font-semibold tracking-wide">OFF</span>}
                        </div>
                      </div>

                      {/* Right: Time Inputs */}
                      <div className={`flex items-center gap-3 w-full md:w-auto transition-all duration-300 overflow-hidden ${schedule[day]?.checked ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-2 border border-gray-200 flex-1">
                          <ClockIcon />
                          <input 
                            type="time" 
                            className="bg-transparent w-full outline-none text-gray-700 font-semibold"
                            value={schedule[day]?.start}
                            onChange={(e) => handleChange(day, 'start', e.target.value)}
                          />
                        </div>
                        <span className="text-gray-300 font-bold">-</span>
                        <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-2 border border-gray-200 flex-1">
                          <ClockIcon />
                          <input 
                            type="time" 
                            className="bg-transparent w-full outline-none text-gray-700 font-semibold"
                            value={schedule[day]?.end}
                            onChange={(e) => handleChange(day, 'end', e.target.value)}
                          />
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* --- RIGHT COLUMN: SETTINGS & BLOCKED DATES (1/3 width, Sticky) --- */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-6">
                
                {/* Summary Card */}
                <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                   <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                      <div className="p-3 bg-green-100 rounded-full text-green-600">
                         <CheckIcon />
                      </div>
                      <div>
                         <h3 className="font-bold text-gray-800">Active Days</h3>
                         <p className="text-xs text-gray-500">You work {Object.values(schedule).filter(d => d.checked).length} days/week</p>
                      </div>
                   </div>
                   
                   {/* Save Button Group */}
                   <button 
                        onClick={handleSaveSchedule}
                        disabled={isSaving}
                        className="w-full py-4 rounded-xl text-white font-bold shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-lg"
                        style={{ background: primary }}
                    >
                        {isSaving ? (
                           <>
                             <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                             Saving...
                           </>
                        ) : 'Update Schedule'}
                    </button>

                    {saveMessage && (
                      <div className={`mt-3 text-center text-sm font-semibold p-2 rounded-lg ${saveMessage.includes('success') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                        {saveMessage}
                      </div>
                   )}
                </div>

                {/* Block Dates Card */}
                <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-800">Block Dates</h3>
                        <CalendarXIcon />
                    </div>
                    <p className="text-xs text-gray-500 mb-4">Add specific holidays or leave days.</p>
                    
                    <div className="flex gap-2 mb-4">
                       <input 
                           type="date" 
                           className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 transition"
                           value={newBlockDate}
                           onChange={(e) => setNewBlockDate(e.target.value)}
                       />
                       <button 
                           onClick={handleAddBlockDate}
                           className="p-3 rounded-xl bg-gray-800 hover:bg-black text-white transition"
                       >
                           +
                       </button>
                    </div>

                    {/* List of Blocked Dates */}
                    <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                        {blockedDates.length === 0 ? (
                            <div className="text-center text-xs text-gray-400 py-4 italic">No blocked dates added.</div>
                        ) : (
                            blockedDates.map(date => (
                                <div key={date} className="flex items-center justify-between bg-red-50 p-3 rounded-xl border border-red-100 group">
                                    <span className="text-sm font-semibold text-red-800">{date}</span>
                                    <button 
                                        onClick={() => removeBlockDate(date)}
                                        className="w-6 h-6 flex items-center justify-center rounded-full bg-white text-red-500 hover:bg-red-500 hover:text-white transition text-xs shadow-sm"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))
                        )}
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

export default Availability;