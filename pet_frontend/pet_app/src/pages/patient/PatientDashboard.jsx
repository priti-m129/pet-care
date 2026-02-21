import React, { useState, useContext, useEffect } from 'react';
import { ConfigContext } from '../../contexts/ConfigContext';
import PatientHeader from '../../components/headers/PatientHeader';
// Import API methods to get accurate data
import { getAppointments, getPets } from '../../api/dataService'; 

const PatientDashboard = ({ onNavigate, user, notifications = [], onClearNotification, unreadCount = 0, onMarkAsRead }) => {
  const config = useContext(ConfigContext);
  const { background_color: bg, surface_color: surface, text_color: text, primary_action_color: primary, secondary_action_color: secondary, font_size: fontSize } = config;  
  
  // State
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [activeReminder, setActiveReminder] = useState(null);
  
  // --- ACCURATE DATA STATE ---
  const [appointments, setAppointments] = useState([]);
  const [pets, setPets] = useState([]); 
  const [orders, setOrders] = useState([]); 

  // --- FETCH ACCURATE DATA ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;
      try {
        // Fetch Appointments (same as AppointmentsPage)
        const apptsRes = await getAppointments(user.id);
        setAppointments(apptsRes.data);

        // Fetch Pets (same as AppointmentsPage)
        const petsRes = await getPets(user.id);
        setPets(petsRes.data);

        // Fetch Orders (same as OrdersPage)
        const orderRes = await fetch(`http://localhost:8080/api/orders/my-orders/${user.id}`);
        if (orderRes.ok) {
          const orderData = await orderRes.json();
          setOrders(orderData);
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    fetchDashboardData();
  }, [user?.id]);

  // --- DYNAMIC UPCOMING APPOINTMENT LOGIC ---
  // Find the next upcoming appointment that is not cancelled or rejected
  const upcomingAppt = appointments.find(a => {
    const status = a.status?.toUpperCase();
    const isCancelled = status === 'CANCELLED' || status === 'REJECTED';
    const apptDate = new Date(a.date);
    const today = new Date();
    today.setHours(0,0,0,0);
    return !isCancelled && apptDate >= today;
  });

  // Formatting date for the ticket (e.g., "OCT", "24")
  const formatTicketDate = (dateString) => {
    if(!dateString) return { month: 'NA', day: 'NA' };
    const date = new Date(dateString);
    const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
    const day = date.getDate();
    return { month, day };
  };

  const StatCard = ({ icon, title, value, page }) => (
    <div onClick={() => page && onNavigate(page)} className="card-hover p-6 rounded-3xl shadow-md cursor-pointer" style={{ background: surface }}>
      <div className="text-5xl mb-3">{icon}</div>
      <p className="font-semibold mb-1" style={{ fontSize: `${fontSize * 0.95}px`, color: text, opacity: 0.7 }}>{title}</p>
      <p className="stat-number" style={{ fontSize: `${fontSize * 2.2}px`, color: primary }}>{value}</p>
    </div>
  );

  const toggleNotifications = () => {
    setIsNotifOpen(!isNotifOpen);
    if (!isNotifOpen) {
        onMarkAsRead();
    }
  };

  return (
    <div className="min-h-full w-full flex" style={{ background: bg }}>
      {/* --- SIDEBAR (Left) --- */}
      <div className="w-64 h-full flex-shrink-0 bg-white shadow-xl border-r border-gray-200 flex flex-col z-10">
        <div className="flex flex-col h-full">
          <div className="bg-[#14b8a6] p-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="text-3xl">👤</div>
              <div>
                <p className="font-bold text-gray-800">My Account</p>
                <p className="text-sm text-gray-500">Patient Portal</p>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-2 py-4 overflow-y-auto">
            <button onClick={() => onNavigate('patient-dashboard')} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left bg-gray-50 border-l-4 border-[#14b8a6]">
              <span className="text-xl">🏠</span>
              <span className="font-semibold text-gray-700">Dashboard</span>
            </button>
            <button onClick={() => onNavigate('my-pets')} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left">
              <span className="text-xl">🐕</span>
              <span className="font-semibold text-gray-700">My Pets</span>
            </button>
            <button onClick={() => onNavigate('appointments')} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left">
              <span className="text-xl">📅</span>
              <span className="font-semibold text-gray-700">Appointments</span>
            </button>
             <button onClick={() => onNavigate('marketplace')} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left">
              <span className="text-xl">🛒</span>
              <span className="font-semibold text-gray-700">Marketplace</span>
            </button>
             <button onClick={() => onNavigate('orders')} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left">
              <span className="text-xl">📦</span>
              <span className="font-semibold text-gray-700">Orders</span>
            </button>
            <button onClick={() => onNavigate('messages')} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left">
              <span className="text-xl">💬</span>
              <span className="font-semibold text-gray-700">Help & Support</span>
            </button>
            <button onClick={() => onNavigate('profile')} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left">
              <span className="text-xl">👤</span>
              <span className="font-semibold text-gray-700">Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col h-full relative">
        
        {/* Header & Notifications */}
        <div className="h-20 flex items-center justify-between px-8 shadow-sm z-30" style={{ background: surface }}>
          <div className="flex-1">
            <PatientHeader title="Dashboard" onNavigate={onNavigate} />
          </div>
          <div className="relative">
            <button onClick={toggleNotifications} className="p-2 rounded-full hover:bg-gray-100 transition-colors relative focus:outline-none">
              <span className="text-3xl filter drop-shadow-sm">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-white z-20 shadow-md animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>
            {isNotifOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fade-in-down">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                  <h4 className="font-bold text-gray-700">Notifications</h4>
                  <button onClick={() => notifications.forEach(n => onClearNotification(n.id))} className="text-xs text-teal-600 hover:text-teal-800 font-semibold">Clear All</button>
                </div>
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm flex flex-col items-center">
                      <span className="text-3xl mb-2 opacity-50">📭</span> No new notifications
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div key={notif.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors flex justify-between items-start group">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 text-lg">{notif.type === 'success' ? '✅' : notif.type === 'warning' ? '⚠️' : 'ℹ️'}</div>
                          <div>
                            <p className="text-sm text-gray-800 font-medium leading-snug">{notif.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{notif.timestamp}</p>
                          </div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); onClearNotification(notif.id); }} className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1">✕</button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            
            {/* Top Stats Row (Accurate Counts) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard icon="🐕" title="My Pets" value={pets.length} page="my-pets" />
              <StatCard icon="📅" title="Appointments" value={appointments.length} page="appointments" />
              <StatCard icon="💉" title="Vaccinations" value="Up to date" />
              <StatCard icon="🛒" title="Orders" value={orders.length} page="orders" />
            </div>

            {/* --- WIDGETS (No Recent Activity) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              
              {/* WIDGET 1: HEALTH SCORE (Visual) */}
              <div className="p-6 rounded-3xl shadow-md relative overflow-hidden" style={{ background: surface }}>
                <h3 className="font-bold mb-4 text-gray-700">Pet Health Score</h3>
                
                <div className="flex flex-col items-center justify-center py-4">
                  {/* CSS Conic Gradient for Donut Chart */}
                  <div 
                    className="relative w-40 h-40 rounded-full flex items-center justify-center shadow-inner"
                    style={{ 
                      background: `conic-gradient(${primary} 85%, #f3f4f6 0)` 
                    }}
                  >
                    <div className="absolute inset-3 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                      <span className="text-4xl font-extrabold" style={{ color: primary }}>85</span>
                      <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Points</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <p className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full text-sm inline-block">
                      Excellent Condition 🎉
                    </p>
                    <p className="text-xs text-gray-400 mt-2">Based on last 3 visits</p>
                  </div>
                </div>
              </div>

              {/* WIDGET 2: DYNAMIC NEXT APPOINTMENT TICKET */}
              <div className="p-0 rounded-3xl shadow-md overflow-hidden relative" style={{ background: '#e0f2fe' }}> 
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-20 rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white opacity-20 rounded-full"></div>

                <div className="p-6 relative z-10 h-full flex flex-col">
                  <h3 className="font-bold mb-1 text-sky-800">Upcoming Visit</h3>
                  <p className="text-xs text-sky-600 mb-6 opacity-80">Scheduled Appointment</p>

                  {upcomingAppt ? (
                    <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white flex-1 flex flex-col justify-center shadow-sm">
                      <div className="flex gap-4 items-center mb-3">
                        <div className="bg-sky-500 text-white p-3 rounded-xl text-center min-w-[70px]">
                          <div className="text-xs uppercase font-bold">{formatTicketDate(upcomingAppt.date).month}</div>
                          <div className="text-2xl font-bold leading-none">{formatTicketDate(upcomingAppt.date).day}</div>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 text-lg">{upcomingAppt.type}</h4>
                          <p className="text-sm text-gray-600">Dr. {upcomingAppt.doctorName}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-2 pt-3 border-t border-sky-200/50">
                        <span>🕒 {upcomingAppt.time}</span>
                        <span>•</span>
                        <span>{upcomingAppt.petName}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white flex-1 flex flex-col justify-center items-center text-center shadow-sm">
                      <p className="text-gray-600 font-medium">No upcoming appointments</p>
                      <button 
                        onClick={() => onNavigate('appointments')}
                        className="mt-3 text-sm text-sky-600 font-bold hover:underline"
                      >
                        Book One Now
                      </button>
                    </div>
                  )}

                  <button 
                    onClick={() => onNavigate('appointments')}
                    className="mt-4 w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-lg shadow-sky-200 transition-all transform active:scale-95"
                  >
                    View Details
                  </button>
                </div>
              </div>

              {/* WIDGET 3: QUICK ACTIONS & REMINDERS */}
              <div className="flex flex-col gap-6">
                 
                {/* Quick Actions Mini */}
                <div className="p-5 rounded-3xl shadow-md flex-1" style={{ background: surface }}>
                   <h3 className="font-bold mb-3 text-gray-700">Quick Actions</h3>
                   <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => onNavigate('my-pets')} className="p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 flex flex-col items-center justify-center gap-2 transition-colors">
                        <span className="text-2xl">➕</span>
                        <span className="text-xs font-semibold text-gray-600">Add Pet</span>
                      </button>
                      <button onClick={() => onNavigate('appointments')} className="p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 flex flex-col items-center justify-center gap-2 transition-colors">
                        <span className="text-2xl">📞</span>
                        <span className="text-xs font-semibold text-gray-600">Call Vet</span>
                      </button>
                   </div>
                </div>

                {/* Reminders Mini */}
                <div className="p-5 rounded-3xl shadow-md flex-1" style={{ background: surface }}>
                   <h3 className="font-bold mb-3 text-gray-700">Reminders</h3>
                   <div className="space-y-2">
                      <div onClick={() => setActiveReminder('vaccine')} className="flex items-center gap-3 p-2 rounded-xl hover:bg-orange-50 cursor-pointer transition-colors group">
                        <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">💉</div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-700">Vaccine Due</p>
                          <p className="text-xs text-gray-400">Nov 15, 2023</p>
                        </div>
                        <span className="text-gray-300 group-hover:text-orange-500">›</span>
                      </div>
                      <div onClick={() => setActiveReminder('checkup')} className="flex items-center gap-3 p-2 rounded-xl hover:bg-blue-50 cursor-pointer transition-colors group">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">🏥</div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-700">Annual Checkup</p>
                          <p className="text-xs text-gray-400">Dec 01, 2023</p>
                        </div>
                        <span className="text-gray-300 group-hover:text-blue-500">›</span>
                      </div>
                   </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL (Reminders) --- */}
      {activeReminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col relative animate-fade-in">
            <div className="p-6 border-b flex justify-between items-center" style={{ borderColor: '#f3f4f6' }}>
              <h3 className="text-2xl font-bold" style={{ color: text }}>
                {activeReminder === 'vaccine' ? '💉 Vaccination Schedule' : '🏥 Annual Checkups'}
              </h3>
              <button onClick={() => setActiveReminder(null)} className="text-gray-400 hover:text-gray-600 text-2xl focus:outline-none">✕</button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                    <th className="py-2 text-sm font-bold text-gray-500">Pet Name</th>
                    {activeReminder === 'vaccine' ? (
                      <>
                        <th className="py-2 text-sm font-bold text-gray-500">Vaccine</th>
                        <th className="py-2 text-sm font-bold text-gray-500">Date</th>
                        <th className="py-2 text-sm font-bold text-gray-500">Status</th>
                      </>
                    ) : (
                      <>
                        <th className="py-2 text-sm font-bold text-gray-500">Last Visit</th>
                        <th className="py-2 text-sm font-bold text-gray-500">Next Due</th>
                        <th className="py-2 text-sm font-bold text-gray-500">Vet</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {/* Reusing simple dummy data for the modal as requested previously */}
                  <tr className="hover:bg-gray-50" style={{ borderBottom: '1px solid #f9fafb' }}>
                    <td className="py-3 font-semibold">Bella</td>
                    <td className="py-3 text-gray-600">Rabies</td>
                    <td className="py-3 text-gray-600">2023-11-15</td>
                    <td className="py-3"><span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">Due Soon</span></td>
                  </tr>
                  <tr className="hover:bg-gray-50" style={{ borderBottom: '1px solid #f9fafb' }}>
                    <td className="py-3 font-semibold">Max</td>
                    <td className="py-3 text-gray-600">Distemper</td>
                    <td className="py-3 text-gray-600">2023-10-20</td>
                    <td className="py-3"><span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Completed</span></td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-6 p-4 bg-gray-50 rounded-xl text-center text-sm text-gray-500">This data is managed by your veterinary clinic.</div>
            </div>
            <div className="p-6 border-t flex justify-end" style={{ borderColor: '#f3f4f6' }}>
              <button onClick={() => { setActiveReminder(null); onNavigate('appointments'); }} className="px-6 py-2 rounded-xl font-bold text-white shadow-md hover:shadow-lg transition-all" style={{ background: primary }}>Book Appointment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;