import React, { useState, useEffect, useContext, useMemo } from 'react';
import { ConfigContext } from '../../contexts/ConfigContext';
import DoctorHeader from '../../components/headers/DoctorHeader';
import DoctorSidebar from '../../components/DoctorSidebar';
import { getDoctorAppointments } from '../../api/dataService';
import axios from 'axios';
import { 
  LineChart, Line, Area, 
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

const DoctorDashboard = ({ onNavigate, user: initialUser, notifications, onClearNotification, unreadCount, onMarkAsRead, allUsers }) => {
  const config = useContext(ConfigContext);
  const { background_color: bg, surface_color: surface, text_color: text, primary_action_color: primary, font_size: fontSize } = config;  
  
  const [appointments, setAppointments] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  // --- REVIEWS MODAL STATE ---
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [averageRating, setAverageRating] = useState("0.0");
  
  // Local state for User
  const [user, setUser] = useState(initialUser);
  
  // State for the 4 file inputs
  const [files, setFiles] = useState({
    mbbs: null,
    registration: null,
    resume: null,
    identity: null
  });

  // Sync user if prop changes
  useEffect(() => {
      setUser(initialUser);
  }, [initialUser]);

  // --- AUTO-CALCULATE RATING & STATS EFFECT ---
  useEffect(() => {
    if (!appointments.length) return;

    // 1. Calculate Average Rating
    const reviewedAppts = appointments.filter(a => a.rating && a.rating > 0);
    if (reviewedAppts.length > 0) {
      const total = reviewedAppts.reduce((acc, curr) => acc + (curr.rating || 0), 0);
      setAverageRating((total / reviewedAppts.length).toFixed(1));
    } else {
      setAverageRating("0.0");
    }
  }, [appointments]);

  // --- REAL-TIME DATA CALCULATIONS ---
  
  // 1. Pending Requests Count (No Prescription)
  const pendingRequestsCount = appointments.filter(appt => !appt.prescription || appt.prescription.trim() === '').length;

  // 2. Today's Schedule Count
  const todayScheduleCount = appointments.filter(appt => {
    const apptDateStr = appt.date || appt.appointmentDate;
    if (!apptDateStr) return false;
    try {
      const apptDate = new Date(apptDateStr).toDateString();
      const today = new Date().toDateString();
      return apptDate === today;
    } catch (e) {
      return false;
    }
  }).length;

  // 3. Total Unique Patients Count
  const totalPatientsCount = useMemo(() => {
    const uniquePatients = new Set(appointments.map(appt => appt.patientId || appt.patientName));
    return uniquePatients.size;
  }, [appointments]);

  // 4. Generate Chart Data from Real Appointments
  
  // Weekly Volume Data (Group by Day of Week)
  const weeklyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const initialData = days.map(day => ({ name: day, patients: 0, new: 0 }));
    
    appointments.forEach(appt => {
      try {
        const dayName = days[new Date(appt.date || appt.appointmentDate).getDay()];
        const dayData = initialData.find(d => d.name === dayName);
        if (dayData) {
          dayData.patients += 1;
          // Assuming 'new' logic might depend on your data, here we treat all as volume
          dayData.new += 1; 
        }
      } catch(e) {}
    });
    return initialData;
  }, [appointments]);

  // Appointment Trends (Mock logic or Last 5 months summary)
  const appointmentTrends = [
    { month: 'Jan', appointments: 20 },
    { month: 'Feb', appointments: 35 },
    { month: 'Mar', appointments: 45 },
    { month: 'Apr', appointments: 50 },
    { month: 'May', appointments: 65 },
  ];

  // Rating Distribution Data (Real)
  const ratingData = useMemo(() => {
    const distribution = [
      { name: '5 Star', value: 0 },
      { name: '4 Star', value: 0 },
      { name: '3 Star', value: 0 },
      { name: '2 Star', value: 0 },
      { name: '1 Star', value: 0 }
    ];
    
    appointments.filter(a => a.rating && a.rating > 0).forEach(appt => {
        const rating = parseInt(appt.rating);
        if (rating >= 1 && rating <= 5) {
            distribution[5 - rating].value += 1;
        }
    });
    
    // If no data, provide placeholder visuals so chart isn't empty
    if (distribution.every(d => d.value === 0)) {
        return [
            { name: '5 Star', value: 40 },
            { name: '4 Star', value: 30 },
            { name: '3 Star', value: 15 },
            { name: '2 Star', value: 10 },
            { name: '1 Star', value: 5 }
        ];
    }
    return distribution;
  }, [appointments]);

  // --- POLLING LOGIC ---
  useEffect(() => {
    if (user && user.role === 'DOCTOR' && user.documentStatus !== 'APPROVED') {
      const intervalId = setInterval(async () => {
        try {
          const response = await axios.get(`http://localhost:8080/api/auth/user/${user.id}`);
          const freshUser = response.data;
          if (freshUser.documentStatus === 'APPROVED') {
            setUser(freshUser);
            clearInterval(intervalId);
            alert("Congratulations! Your account has been verified.");
          }
        } catch (error) {
          console.error("Error checking status", error);
        }
      }, 3000);
      return () => clearInterval(intervalId);
    }
  }, [user]);

  useEffect(() => {
    const fetchMyAppointments = async () => {
      if (user && user.id) {
        try {
          setLoading(true);
          const response = await getDoctorAppointments(user.id);
          setAppointments(response.data || []);
        } catch (error) {
          console.error("Failed to fetch appointments", error);
          setAppointments([]);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchMyAppointments();
  }, [user?.id]);

  const toggleNotifications = () => {
    setIsNotifOpen(!isNotifOpen);
    if (!isNotifOpen) onMarkAsRead();
  };

  const handleFileChange = (e, type) => {
    setFiles({ ...files, [type]: e.target.files[0] });
  };

  const handleUpload = async (type) => {
    if (!files[type]) {
      alert("Please select a file first");
      return;
    }
    const formData = new FormData();
    formData.append("file", files[type]);
    formData.append("type", type);

    try {
      const res = await axios.post(`http://localhost:8080/api/auth/upload-document/${user.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data) {
          setUser(res.data);
          setFiles({ ...files, [type]: null }); 
          alert(`${type.toUpperCase()} Document Uploaded Successfully!`);
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  const handleOpenReviews = () => {
    setShowReviewsModal(true);
  };

  const StatCard = ({ icon, title, value, page, onClick, color = 'bg-indigo-500' }) => (
    <div onClick={onClick || (page ? () => onNavigate(page) : null)} 
         className={`p-6 rounded-2xl shadow-sm cursor-pointer hover:shadow-lg transition-all duration-300 relative overflow-hidden group`}
         style={{ background: surface }}>
      
      <div className={`absolute -right-4 -bottom-4 text-9xl opacity-5 transform group-hover:scale-110 transition-transform`}>
        {icon}
      </div>

      <div className="relative z-10 flex justify-between items-start">
        <div>
           <p className="font-semibold text-sm uppercase tracking-wider opacity-60 mb-1">{title}</p>
           <p className="font-extrabold text-3xl" style={{ color: primary }}>{value}</p>
        </div>
        <div className={`p-3 rounded-xl shadow-md ${color} bg-opacity-10`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );

  const isVerified = user && user.documentStatus === 'APPROVED';

  return (
    <div className="min-h-screen w-full flex" style={{ background: bg }}>
      <DoctorSidebar onNavigate={onNavigate} user={user} activePage="doctor-dashboard" />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* --- TOP BAR --- */}
        <div className="h-20 flex items-center justify-between px-8 shadow-sm z-30 flex-shrink-0" style={{ background: surface }}>
          <div className="flex-1">
            <DoctorHeader title="Doctor Dashboard" onNavigate={onNavigate} />
          </div>
          <div className="relative z-50">
            <button onClick={toggleNotifications} className="p-2 rounded-full hover:bg-gray-100 transition-colors relative focus:outline-none">
              <span className="text-3xl filter drop-shadow-sm">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-white z-20 shadow-md animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>
            {isNotifOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in-down" style={{ zIndex: 9999 }}>
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                  <h4 className="font-bold text-gray-700">Notifications</h4>
                  <button onClick={() => notifications.forEach(n => onClearNotification(n.id))} className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold">Clear All</button>
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
        
        {/* --- SCROLLABLE MAIN CONTENT --- */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
             {!isVerified ? (
               // --- DOCUMENT UPLOAD CENTER ---
               <div className="max-w-5xl mx-auto">
                  <div className="mb-10 text-center">
                    <div className="bg-indigo-50 text-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl shadow-md">📄</div>
                    <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Account Verification Center</h2>
                    <p className="text-gray-500 max-w-lg mx-auto">
                      To ensure safety of our platform and verify your credentials, please upload following documents. 
                      Our admin team will review them within 24 hours.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <UploadCard type="mbbs" title="MBBS Degree Certificate" icon="🎓" user={user} fileName={files.mbbs?.name} uploadedFile={user?.mbbsDegree} onSelect={(e) => handleFileChange(e, 'mbbs')} onUpload={() => handleUpload('mbbs')} />
                    <UploadCard type="registration" title="Medical Council Registration" icon="📋" user={user} fileName={files.registration?.name} uploadedFile={user?.medicalRegistration} onSelect={(e) => handleFileChange(e, 'registration')} onUpload={() => handleUpload('registration')} />
                    <UploadCard type="resume" title="Updated Resume (CV)" icon="📝" user={user} fileName={files.resume?.name} uploadedFile={user?.resume} onSelect={(e) => handleFileChange(e, 'resume')} onUpload={() => handleUpload('resume')} />
                    <UploadCard type="identity" title="Identity Proof (Aadhaar/Passport)" icon="🪪" user={user} fileName={files.identity?.name} uploadedFile={user?.identityProof} onSelect={(e) => handleFileChange(e, 'identity')} onUpload={() => handleUpload('identity')} />
                  </div>
               </div>
             ) : (
               // --- MODERN DASHBOARD CONTENT ---
               <>
                  {/* ROW 1: STATS (Updated with real counts) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                        icon="📅" 
                        title="Today's Schedule" 
                        value={loading ? "..." : todayScheduleCount} 
                        page="doctor-appointments" 
                        color="bg-indigo-100 text-indigo-600" 
                        onClick={() => onNavigate('doctor-appointments', { filter: 'today' })}
                    />
                    <StatCard 
                        icon="⏳" 
                        title="Pending Requests" 
                        value={loading ? "..." : pendingRequestsCount} 
                        page="doctor-appointments" 
                        color="bg-orange-100 text-orange-600" 
                        onClick={() => onNavigate('doctor-appointments', { filter: 'pending' })}
                    />
                    <StatCard icon="⭐" title="Avg Rating" value={averageRating} onClick={handleOpenReviews} color="bg-yellow-100 text-yellow-600" />
                    <StatCard 
                        icon="👥" 
                        title="Total Patients" 
                        value={loading ? "..." : totalPatientsCount} 
                        color="bg-green-100 text-green-600" 
                    />
                  </div>

                  {/* ROW 2: MAIN CHARTS & SIDE LIST */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* LEFT COLUMN (9/12): Large Charts */}
                    <div className="lg:col-span-9 space-y-6">
                      
                      {/* Bar Chart: Weekly Volume (Real Data) */}
                      <div className="p-6 rounded-3xl shadow-sm" style={{ background: surface }}>
                        <div className="flex justify-between items-center mb-6">
                          <div>
                            <h3 className="font-bold text-xl text-gray-800">Weekly Patient Volume</h3>
                            <p className="text-sm text-gray-500">Real-time overview of patient activity this week.</p>
                          </div>
                          <button className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full hover:bg-indigo-100 transition">This Week</button>
                        </div>
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                              <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                              <Legend />
                              <Bar dataKey="patients" fill="#6366f1" radius={[10, 10, 0, 0]} barSize={20} />
                              <Bar dataKey="new" fill="#a5b4fc" radius={[10, 10, 0, 0]} barSize={20} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Line Chart: Trends */}
                      <div className="p-6 rounded-3xl shadow-sm" style={{ background: surface }}>
                         <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-xl text-gray-800">Appointment Trends</h3>
                            <div className="flex gap-2">
                                <span className="w-3 h-3 bg-indigo-500 rounded-full mt-1"></span>
                                <span className="text-xs text-gray-500">Monthly Growth</span>
                            </div>
                        </div>
                        <div className="h-48 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={appointmentTrends}>
                              <defs>
                                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                              <Tooltip contentStyle={{borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                              <Area type="monotone" dataKey="appointments" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorUv)" />
                              <Line type="monotone" dataKey="appointments" stroke="#6366f1" strokeWidth={3} dot={{fill: '#fff', r: 4}} activeDot={{r: 6}} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                    </div>

                    {/* RIGHT COLUMN (3/12): Side Lists & Pie Chart */}
                    <div className="lg:col-span-3 space-y-6">
                      
                      {/* Pie Chart Card (Real Data) */}
                      <div className="p-6 rounded-3xl shadow-sm" style={{ background: surface }}>
                        <h3 className="font-bold text-lg mb-4 text-gray-800">Rating Distribution</h3>
                        <div className="h-48 w-full flex justify-center">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={ratingData}
                                cx="50%"
                                cy="50%"
                                innerRadius={30}
                                outerRadius={60}
                                paddingAngle={2}
                                dataKey="value"
                              >
                                {COLORS.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                            {['5★', '4★', '3★', '2★', '1★'].map((star, i) => (
                                <span key={i} className="text-xs flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[i]}}></span>{star}
                                </span>
                            ))}
                        </div>
                      </div>

                      {/* Upcoming Appointments Compact */}
                      <div className="p-6 rounded-3xl shadow-sm" style={{ background: surface }}>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-bold text-lg text-gray-800">Upcoming</h3>
                          <button onClick={() => onNavigate('doctor-appointments')} className="text-xs text-indigo-600 font-bold hover:underline">View All</button>
                        </div>
                        <div className="space-y-4">
                           {appointments.length === 0 ? (
                               <p className="text-center text-sm text-gray-400 py-4">No appointments scheduled.</p>
                           ) : (
                               appointments.slice(0, 3).map((appt, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                                        {appt.patientName ? appt.patientName.charAt(0) : '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-800 truncate">{appt.patientName}</p>
                                        <p className="text-xs text-gray-500 truncate">{appt.petName} • {appt.appointmentDate || 'Today'}</p>
                                    </div>
                                    <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-lg">10:00 AM</span>
                                </div>
                               ))
                           )}
                        </div>
                      </div>

                    </div>

                  </div>
               </>
             )}
          </div>
        </div>
      </div>

      {/* --- STATS & REVIEWS MODAL --- */}
      {showReviewsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-indigo-600 p-6 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-white font-bold text-xl">Patient Feedback</h2>
                <p className="text-indigo-200 text-sm">Reviews from your past consultations</p>
              </div>
              <button onClick={() => setShowReviewsModal(false)} className="text-white text-2xl font-bold hover:text-indigo-200">&times;</button>
            </div>
            
            <div className="p-6 bg-indigo-50 flex justify-center items-center gap-8 shrink-0">
                <div className="text-center">
                    <div className="text-4xl font-extrabold text-indigo-700">{averageRating}</div>
                    <div className="text-xs text-indigo-500 font-semibold uppercase tracking-wider">Avg Rating</div>
                </div>
                <div className="h-10 w-px bg-indigo-200"></div>
                <div className="text-center">
                    <div className="text-4xl font-extrabold text-indigo-700">{appointments.filter(a => a.rating && a.rating > 0).length}</div>
                    <div className="text-xs text-indigo-500 font-semibold uppercase tracking-wider">Total Reviews</div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4">
                {appointments.filter(a => a.rating && a.rating > 0).length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        <p className="text-4xl mb-2">📭</p>
                        <p>No reviews yet.</p>
                    </div>
                ) : (
                    appointments.filter(a => a.rating && a.rating > 0).map(appt => (
                        <div key={appt.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-bold text-gray-800">{appt.patientName}</h4>
                                    <p className="text-xs text-gray-500">Pet: {appt.petName} • {appt.date || appt.appointmentDate}</p>
                                </div>
                                <div className="text-yellow-500 text-lg font-bold">
                                    {'★'.repeat(appt.rating)}<span className="text-gray-300">{'★'.repeat(5 - appt.rating)}</span>
                                </div>
                            </div>
                            <p className="text-gray-600 bg-gray-50 p-3 rounded-lg text-sm italic">"{appt.reviewComment || "No comment provided."}"</p>
                        </div>
                    ))
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- REUSABLE COMPONENT FOR UPLOAD CARD ---
const UploadCard = ({ title, icon, fileName, uploadedFile, onSelect, onUpload }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{icon}</div>
          <h3 className="font-bold text-gray-800">{title}</h3>
        </div>
      </div>

      <div className="p-6">
        {uploadedFile ? (
          <div className="flex flex-col items-center justify-center text-center p-4 bg-green-50 rounded-xl border border-green-100">
            <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center text-xl mb-3 shadow-sm">✓</div>
            <p className="text-sm font-semibold text-green-800 mb-1">Document Uploaded</p>
            <a href={`http://localhost:8080/uploads/${uploadedFile}`} target="_blank" rel="noreferrer" className="text-xs text-green-600 underline hover:text-green-800">View File</a>
          </div>
        ) : (
          <div>
            <input type="file" id={`file-upload-${title}`} className="hidden" onChange={onSelect} />
            <label htmlFor={`file-upload-${title}`} className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors">
              <span className="text-3xl mb-2 opacity-30">☁️</span>
              <span className="text-sm font-medium text-gray-500">Click to browse files</span>
              <span className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (Max 5MB)</span>
            </label>

            {fileName ? (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-700 truncate max-w-[150px]" title={fileName}>{fileName}</div>
                <button onClick={onUpload} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-2 px-4 rounded-lg shadow-md transition-colors flex items-center gap-2">
                  <span>Upload</span> <span className="text-lg">↑</span>
                </button>
              </div>
            ) : (
              <div className="mt-4"><div className="text-xs text-center text-gray-400 italic">Please select a file to continue</div></div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;